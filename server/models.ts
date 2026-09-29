// Database Models Definition
export type UserRole = 'student' | 'operator' | 'kitchen' | 'delivery' | 'branch_manager' | 'admin';

export interface IUser {
  _id: string;
  name: string;
  studentId: string;
  email: string;
  password: string;
  phone: string;
  course: string;
  year: string;
  studentType: 'Degree' | 'Master\'s';
  role: UserRole;
  academicCategory?: string;
  department?: string;
  semester?: string;
  section?: string;
  hostelBuilding?: string;
  roomNumber?: string;
  branchId?: string;
  createdAt: Date;
}

export interface IMenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: 'Breakfast' | 'Meals' | 'Lunch' | 'Beverages' | 'Snacks' | 'Fast Food' | 'Healthy Food' | 'Desserts' | string;
  available: boolean;
  isTodaySpecial?: boolean;
  date: string;
  stockQuantity?: number;
  preparationTimeMinutes?: number;
  isVeg?: boolean;
  branchAvailability?: string[];
  ingredients?: string;
  allergyInfo?: string;
  createdAt: Date;
}

export interface IOrderItem {
  itemId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface IDeliveryLocation {
  building: string;
  floor: string;
  roomNumber: string;
  deliveryFee: number;
}

export interface IOrder {
  _id: string;
  orderId: string;
  tokenNumber: number;
  userId: string;
  studentName: string;
  studentId: string;
  items: IOrderItem[];
  totalAmount: number;
  foodAmount?: number;
  deliveryFee?: number;
  discountAmount?: number;
  couponCode?: string;
  orderType?: 'PICKUP' | 'DELIVERY';
  pickupSlot?: string;
  deliveryLocation?: IDeliveryLocation;
  branch?: string;
  paymentMethod: 'Online Payment' | 'Pay at Canteen';
  paymentStatus: 'PAID' | 'PENDING' | 'FAILED';
  orderStatus: 'CONFIRMED' | 'PREPARING' | 'READY' | 'COLLECTED' | 'CANCELLED';
  deliveryStatus?: 'PENDING' | 'ASSIGNED' | 'OUT_FOR_DELIVERY' | 'DELIVERED';
  specialInstructions?: string;
  transactionId?: string;
  notes?: string;
  rating?: {
    foodRating: number;
    deliveryRating?: number;
    review?: string;
    createdAt: string;
  };
  reportedIssue?: {
    issueType: string;
    description: string;
    status: 'OPEN' | 'RESOLVED';
    reportedAt: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface IPayment {
  _id: string;
  orderId: string;
  amount: number;
  method: 'Online Payment' | 'Pay at Canteen';
  status: 'PAID' | 'PENDING' | 'FAILED';
  transactionId: string;
  createdAt: Date;
}

export interface INotification {
  _id: string;
  userId: string;
  orderId: string;
  message: string;
  type: 'ORDER_CONFIRMED' | 'PAYMENT_SUCCESSFUL' | 'ORDER_PREPARING' | 'ORDER_READY' | 'ORDER_COLLECTED' | 'DELIVERY_DISPATCHED' | 'DELIVERY_COMPLETED';
  read: boolean;
  createdAt: Date;
}

export interface IStockTransfer {
  id: string;
  itemId: string;
  itemName: string;
  quantity: number;
  fromBranch: string;
  toBranch: string;
  status: 'REQUESTED' | 'APPROVED' | 'DISPATCHED' | 'RECEIVED' | 'REJECTED';
  requestedBy: string;
  approvedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICoupon {
  code: string;
  description: string;
  discountPercent?: number;
  discountAmount?: number;
  minOrderAmount?: number;
  targetCourse?: string;
  active: boolean;
}

export interface IFoodWasteRecord {
  id: string;
  date: string;
  branch: string;
  itemId: string;
  itemName: string;
  preparedQty: number;
  soldQty: number;
  remainingQty: number;
  wastedQty: number;
  reason?: string;
}

export interface IAuditLog {
  id: string;
  user: string;
  role: string;
  action: string;
  target: string;
  metadata?: any;
  timestamp: Date;
}

export interface ICourse {
  id: string;
  code: string;
  name: string;
  type: 'Degree' | 'Master\'s';
  department: string;
}

export interface IBranch {
  id: string;
  name: string;
  location: string;
  isOpen: boolean;
  currentWaitTimeMinutes: number;
}
