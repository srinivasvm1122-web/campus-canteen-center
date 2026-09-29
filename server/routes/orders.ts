import { Router, Response } from 'express';
import { DB } from '../db.ts';
import { authenticateToken, AuthRequest } from '../middleware/auth.ts';
import { orderEvents } from '../events.ts';
import { IOrderItem } from '../models.ts';

const router = Router();

// Allowed Pickup Slots by Student Type
export const DEGREE_SLOTS = [
  '1:00 PM – 1:10 PM',
  '1:10 PM – 1:20 PM',
  '1:20 PM – 1:30 PM',
];

export const MASTERS_SLOTS = [
  '1:30 PM – 1:40 PM',
  '1:40 PM – 1:50 PM',
  '1:50 PM – 2:00 PM',
];

// Student: Place a new order (Pickup or Room Delivery)
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const {
      items,
      orderType = 'PICKUP',
      pickupSlot,
      deliveryLocation,
      branch = 'Main Canteen',
      paymentMethod,
      couponCode,
      specialInstructions,
      notes,
      transactionId
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Your cart is empty. Please add food items to order.' });
    }

    if (orderType === 'PICKUP') {
      if (!pickupSlot) {
        return res.status(400).json({ error: 'Please select a pickup time slot.' });
      }
      // Validate pickup slot against student type
      const normalizedSlot = (pickupSlot || '').replace(/[\u2013\u2014-]/g, '-').trim();
      const studentType = user.studentType || 'Degree';
      if (studentType === 'Degree') {
        const matches = DEGREE_SLOTS.some(s => s.replace(/[\u2013\u2014-]/g, '-').trim() === normalizedSlot);
        if (!matches) {
          return res.status(400).json({
            error: `As a Degree student, your lunch window is 1:00 PM – 1:30 PM. You cannot select '${pickupSlot}'.`,
          });
        }
      } else if (studentType === 'Master\'s') {
        const matches = MASTERS_SLOTS.some(s => s.replace(/[\u2013\u2014-]/g, '-').trim() === normalizedSlot);
        if (!matches) {
          return res.status(400).json({
            error: `As a Master's student, your lunch window is 1:30 PM – 2:00 PM. You cannot select '${pickupSlot}'.`,
          });
        }
      }
    } else if (orderType === 'DELIVERY') {
      if (!deliveryLocation || !deliveryLocation.building || !deliveryLocation.roomNumber) {
        return res.status(400).json({ error: 'Please specify the delivery hostel/building, floor, and room number.' });
      }
    }

    // Verify items and compute total
    const allMenuItems = await DB.menu.getAll();
    const orderItems: IOrderItem[] = [];
    let foodTotal = 0;

    for (const itemReq of items) {
      const menuItem = allMenuItems.find(m =>
        (itemReq.itemId && m._id === itemReq.itemId) ||
        (itemReq.name && m.name.toLowerCase() === itemReq.name.toLowerCase())
      );
      if (!menuItem) {
        return res.status(400).json({ error: `Item '${itemReq.name || itemReq.itemId}' is no longer available on the menu.` });
      }
      if (!menuItem.available) {
        return res.status(400).json({ error: `'${menuItem.name}' is currently sold out.` });
      }

      const qty = Math.max(1, parseInt(itemReq.quantity, 10) || 1);
      orderItems.push({
        itemId: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: qty,
      });
      foodTotal += menuItem.price * qty;
    }

    // Delivery fee calculation
    const deliveryFee = orderType === 'DELIVERY' ? (deliveryLocation?.deliveryFee ?? 15) : 0;

    // Apply Coupon if provided
    let discountAmount = 0;
    let appliedCoupon = couponCode;
    if (couponCode) {
      const validation = await DB.coupons.validate(couponCode, foodTotal, user.course);
      if (validation.valid) {
        discountAmount = validation.discountAmount;
      }
    }

    const calculatedTotal = Math.max(0, foodTotal + deliveryFee - discountAmount);

    // Determine payment status
    const method = paymentMethod === 'Online Payment' ? 'Online Payment' : 'Pay at Canteen';
    const paymentStatus = method === 'Online Payment' ? 'PAID' : 'PENDING';
    const tokenNumber = DB.orders.getNextTokenNumber();
    const orderId = `VIM-2026-${tokenNumber}`;
    const generatedTxnId = transactionId || (method === 'Online Payment' ? `TXN_UPI_${Date.now().toString().slice(-6)}` : `TXN_CASH_${tokenNumber}`);

    const newOrder = await DB.orders.create({
      orderId,
      tokenNumber,
      userId: user._id,
      studentName: user.name,
      studentId: user.studentId || 'VIM-STUDENT',
      items: orderItems,
      totalAmount: calculatedTotal,
      foodAmount: foodTotal,
      deliveryFee,
      discountAmount,
      couponCode: appliedCoupon || undefined,
      orderType,
      pickupSlot: orderType === 'PICKUP' ? pickupSlot : undefined,
      deliveryLocation: orderType === 'DELIVERY' ? deliveryLocation : undefined,
      branch: branch || 'Main Canteen',
      paymentMethod: method,
      paymentStatus,
      orderStatus: 'CONFIRMED',
      deliveryStatus: orderType === 'DELIVERY' ? 'PENDING' : undefined,
      specialInstructions: specialInstructions || '',
      transactionId: generatedTxnId,
      notes: notes || '',
    });

    // Record Payment in payments collection
    await DB.payments.create({
      orderId: newOrder._id,
      amount: calculatedTotal,
      method,
      status: paymentStatus,
      transactionId: generatedTxnId,
    });

    // Create Notification for Student
    const pickupOrDeliveryMsg = orderType === 'DELIVERY'
      ? `Room Delivery to ${deliveryLocation?.building} Room #${deliveryLocation?.roomNumber}`
      : `Pickup: ${pickupSlot}`;

    await DB.notifications.create({
      userId: user._id,
      orderId: newOrder._id,
      message: `🎉 Order #${tokenNumber} Confirmed! Total: ₹${calculatedTotal}. ${pickupOrDeliveryMsg}`,
      type: 'ORDER_CONFIRMED',
      read: false,
    });

    if (method === 'Online Payment') {
      await DB.notifications.create({
        userId: user._id,
        orderId: newOrder._id,
        message: `💳 Payment of ₹${calculatedTotal} received successfully for Token #${tokenNumber}.`,
        type: 'PAYMENT_SUCCESSFUL',
        read: false,
      });
    }

    // Broadcast new order immediately to all active operator, kitchen, and delivery dashboards
    orderEvents.broadcast('order_created', newOrder);

    res.status(201).json({
      message: 'Order placed successfully!',
      order: newOrder,
    });
  } catch (err: any) {
    console.error('Order creation error:', err);
    res.status(500).json({ error: 'Failed to place order. Please try again.' });
  }
});

// Get orders (Student sees own, Operator sees all with optional filters)
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const { status, pickupSlot, paymentStatus, search } = req.query;

    if (user.role === 'student') {
      const studentOrders = await DB.orders.getAll({
        userId: user._id,
        status: status ? String(status) : undefined,
      });
      return res.json(studentOrders);
    }

    // Operator view with full filtering and search
    const allOrders = await DB.orders.getAll({
      status: status ? String(status) : undefined,
      pickupSlot: pickupSlot ? String(pickupSlot) : undefined,
      paymentStatus: paymentStatus ? String(paymentStatus) : undefined,
      search: search ? String(search) : undefined,
    });

    res.json(allOrders);
  } catch (err) {
    console.error('Fetch orders error:', err);
    res.status(500).json({ error: 'Failed to fetch orders.' });
  }
});

// Get single order detail
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const order = await DB.orders.getById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    if (req.user!.role === 'student' && order.userId !== req.user!._id) {
      return res.status(403).json({ error: 'Unauthorized to view this order.' });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch order details.' });
  }
});

// Staff: Update Order Status (CONFIRMED -> PREPARING -> READY -> COLLECTED)
router.patch('/:id/status', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const role = req.user!.role;
    if (role !== 'operator' && role !== 'kitchen' && role !== 'admin') {
      return res.status(403).json({ error: 'Only authorized staff (operator, kitchen, admin) can update order status.' });
    }

    const { id } = req.params;
    const { status } = req.body;

    const allowed = ['CONFIRMED', 'PREPARING', 'READY', 'COLLECTED', 'CANCELLED'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: 'Invalid order status specified.' });
    }

    const updatedOrder = await DB.orders.updateStatus(id, status);
    if (!updatedOrder) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    // Create custom notification for the student based on status
    if (status === 'PREPARING') {
      await DB.notifications.create({
        userId: updatedOrder.userId,
        orderId: updatedOrder._id,
        message: `👨‍🍳 Your order #${updatedOrder.tokenNumber} is now being prepared in the kitchen.`,
        type: 'ORDER_PREPARING',
        read: false,
      });
    } else if (status === 'READY') {
      await DB.notifications.create({
        userId: updatedOrder.userId,
        orderId: updatedOrder._id,
        message: updatedOrder.orderType === 'DELIVERY'
          ? `📦 Your delivery order #${updatedOrder.tokenNumber} is packed and ready for dispatch!`
          : `🔔 Your order #${updatedOrder.tokenNumber} is ready for pickup!`,
        type: 'ORDER_READY',
        read: false,
      });
    } else if (status === 'COLLECTED') {
      await DB.notifications.create({
        userId: updatedOrder.userId,
        orderId: updatedOrder._id,
        message: `✅ Order #${updatedOrder.tokenNumber} has been received. Enjoy your meal!`,
        type: 'ORDER_COLLECTED',
        read: false,
      });
    }

    // Broadcast status change immediately to all tabs
    orderEvents.broadcast('order_status_updated', {
      orderId: updatedOrder.orderId,
      _id: updatedOrder._id,
      tokenNumber: updatedOrder.tokenNumber,
      orderStatus: updatedOrder.orderStatus,
      paymentStatus: updatedOrder.paymentStatus,
      deliveryStatus: updatedOrder.deliveryStatus,
      updatedAt: updatedOrder.updatedAt,
      userId: updatedOrder.userId,
    });

    res.json({
      message: `Order #${updatedOrder.tokenNumber} status updated to ${status}.`,
      order: updatedOrder,
    });
  } catch (err: any) {
    console.error('Update status error:', err);
    res.status(500).json({ error: 'Failed to update order status.' });
  }
});

// Delivery Staff: Update Delivery Status (PENDING -> ASSIGNED -> OUT_FOR_DELIVERY -> DELIVERED)
router.patch('/:id/delivery-status', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const role = req.user!.role;
    if (role !== 'delivery' && role !== 'operator' && role !== 'admin') {
      return res.status(403).json({ error: 'Only delivery personnel or admins can update delivery status.' });
    }

    const { id } = req.params;
    const { deliveryStatus } = req.body;

    const allowed = ['PENDING', 'ASSIGNED', 'OUT_FOR_DELIVERY', 'DELIVERED'];
    if (!allowed.includes(deliveryStatus)) {
      return res.status(400).json({ error: 'Invalid delivery status.' });
    }

    const updatedOrder = await DB.orders.updateDeliveryStatus(id, deliveryStatus);
    if (!updatedOrder) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    // Send notifications
    if (deliveryStatus === 'OUT_FOR_DELIVERY') {
      await DB.notifications.create({
        userId: updatedOrder.userId,
        orderId: updatedOrder._id,
        message: `🛵 Order #${updatedOrder.tokenNumber} is out for delivery to ${updatedOrder.deliveryLocation?.building} Room #${updatedOrder.deliveryLocation?.roomNumber}!`,
        type: 'DELIVERY_DISPATCHED',
        read: false,
      });
    } else if (deliveryStatus === 'DELIVERED') {
      await DB.notifications.create({
        userId: updatedOrder.userId,
        orderId: updatedOrder._id,
        message: `✅ Order #${updatedOrder.tokenNumber} has been delivered to your room! Bon appétit!`,
        type: 'DELIVERY_COMPLETED',
        read: false,
      });
    }

    orderEvents.broadcast('order_status_updated', {
      orderId: updatedOrder.orderId,
      _id: updatedOrder._id,
      tokenNumber: updatedOrder.tokenNumber,
      orderStatus: updatedOrder.orderStatus,
      deliveryStatus: updatedOrder.deliveryStatus,
      updatedAt: updatedOrder.updatedAt,
      userId: updatedOrder.userId,
    });

    res.json({
      message: `Delivery status updated to ${deliveryStatus}`,
      order: updatedOrder,
    });
  } catch (err: any) {
    console.error('Update delivery status error:', err);
    res.status(500).json({ error: 'Failed to update delivery status.' });
  }
});

// Student: Rate & Review Completed Order
router.post('/:id/rating', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { foodRating, deliveryRating, review } = req.body;

    if (!foodRating || foodRating < 1 || foodRating > 5) {
      return res.status(400).json({ error: 'Food rating must be between 1 and 5 stars.' });
    }

    const updatedOrder = await DB.orders.addRating(id, {
      foodRating: Number(foodRating),
      deliveryRating: deliveryRating ? Number(deliveryRating) : undefined,
      review: review ? String(review) : undefined,
    });

    if (!updatedOrder) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    res.json({ message: 'Thank you for your rating & feedback!', order: updatedOrder });
  } catch (err: any) {
    console.error('Rating error:', err);
    res.status(500).json({ error: 'Failed to submit rating.' });
  }
});

// Student: Report an issue
router.post('/:id/issue', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { issueType, description } = req.body;

    if (!issueType || !description) {
      return res.status(400).json({ error: 'Issue category and description are required.' });
    }

    const updatedOrder = await DB.orders.reportIssue(id, {
      issueType: String(issueType),
      description: String(description),
    });

    if (!updatedOrder) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    // Log to audit log
    await DB.auditLogs.log({
      user: req.user!.email,
      role: req.user!.role,
      action: 'ISSUE_REPORTED',
      target: `Order ${updatedOrder.orderId}`,
      metadata: { issueType, description }
    });

    res.json({ message: 'Issue reported to canteen helpdesk. We will look into it promptly.', order: updatedOrder });
  } catch (err: any) {
    console.error('Report issue error:', err);
    res.status(500).json({ error: 'Failed to report issue.' });
  }
});

// Student: Cancel eligible order
router.post('/:id/cancel', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const updatedOrder = await DB.orders.cancelOrder(id, reason);
    if (!updatedOrder) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    orderEvents.broadcast('order_status_updated', {
      orderId: updatedOrder.orderId,
      _id: updatedOrder._id,
      tokenNumber: updatedOrder.tokenNumber,
      orderStatus: 'CANCELLED',
      updatedAt: updatedOrder.updatedAt,
      userId: updatedOrder.userId,
    });

    res.json({ message: 'Order has been cancelled.', order: updatedOrder });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to cancel order.' });
  }
});

export default router;
