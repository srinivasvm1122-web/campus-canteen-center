import { Router, Response } from 'express';
import { DB } from '../db.ts';
import { authenticateToken, AuthRequest } from '../middleware/auth.ts';

const router = Router();

// Get all stock transfers
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const transfers = await DB.transfers.getAll();
    res.json(transfers);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch transfers' });
  }
});

// Request new stock transfer (Branch Manager or Operator or Admin)
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { itemId, itemName, quantity, fromBranch, toBranch } = req.body;
    if (!itemId || !itemName || !quantity || !fromBranch || !toBranch) {
      return res.status(400).json({ error: 'Missing required transfer details' });
    }

    const transfer = await DB.transfers.create({
      itemId,
      itemName,
      quantity: Number(quantity),
      fromBranch,
      toBranch,
      requestedBy: req.user!.name || req.user!.email,
    });

    await DB.auditLogs.log({
      user: req.user!.email,
      role: req.user!.role,
      action: 'STOCK_TRANSFER_REQUESTED',
      target: `${quantity}x ${itemName}`,
      metadata: { fromBranch, toBranch },
    });

    res.status(201).json(transfer);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create transfer request' });
  }
});

// Update transfer status (APPROVE, DISPATCH, RECEIVE, REJECT)
router.patch('/:id/status', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    const allowed = ['REQUESTED', 'APPROVED', 'DISPATCHED', 'RECEIVED', 'REJECTED'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: 'Invalid transfer status' });
    }

    const updated = await DB.transfers.updateStatus(
      req.params.id,
      status,
      req.user!.name || req.user!.email
    );
    if (!updated) {
      return res.status(404).json({ error: 'Transfer not found' });
    }

    await DB.auditLogs.log({
      user: req.user!.email,
      role: req.user!.role,
      action: `STOCK_TRANSFER_${status}`,
      target: `${updated.quantity}x ${updated.itemName}`,
      metadata: { fromBranch: updated.fromBranch, toBranch: updated.toBranch },
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update transfer status' });
  }
});

export default router;
