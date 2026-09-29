export type UserRole = 'student' | 'operator' | 'kitchen' | 'delivery' | 'branch_manager' | 'admin';

export interface IUser {
  _id: string;
  name: string;
  studentId: string;
  email: string;
  phone: string;
  course: string;
  year: string;
  studentType: 'Degree' | 'Master\'s';
  role: UserRole;
  academicCategory?: string; // BBA, BCA, BA, BSc, BCom, BE/BTech, MCA, MBA, etc.
  department?: string;
  semester?: string;
  section?: string;
  hostelBuilding?: string;
  roomNumber?: string;
  branchId?: string;
  createdAt: string;
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
  createdAt: string;
}

export interface IOrderItem {
  itemId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface IDeliveryLocation {
  building: string; // e.g. 'Hostel A', 'Hostel B', 'Tech Block', 'Department Block'
  floor: string;
  roomNumber: string;
  deliveryFee: number;
}

export interface IOrder {
  _id: string;
  orderId: string;
  tokenNumber: number;
  tokenCode?: string;
  userId: string;
  studentName: string;
  studentId: string;
  items: IOrderItem[];
  totalAmount: number;
  foodAmount?: number;
  deliveryFee?: number;
  discountAmount?: number;
  discount?: number;
  couponCode?: string;
  orderType: 'PICKUP' | 'DELIVERY' | 'ROOM_DELIVERY' | string;
  pickupSlot?: string;
  deliveryLocation?: IDeliveryLocation;
  branch: string; // e.g. 'Main Canteen', 'Hostel Canteen', 'Block B Canteen'
  paymentMethod: 'Online Payment' | 'Pay at Canteen';
  paymentStatus: 'PAID' | 'PENDING' | 'FAILED';
  orderStatus: 'CONFIRMED' | 'PREPARING' | 'READY' | 'COLLECTED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED' | string;
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
  createdAt: string;
  updatedAt: string;
}

export interface IBranch {
  id: string;
  name: string;
  location: string;
  isOpen: boolean;
  currentWaitTimeMinutes: number;
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
  createdAt: string;
  updatedAt: string;
}

export interface ICoupon {
  code: string;
  description: string;
  discountPercent?: number;
  discountAmount?: number;
  minOrderAmount?: number;
  targetCourse?: string; // e.g. 'BCA', 'Degree', 'All'
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
  timestamp: string;
}

export interface ICourse {
  id: string;
  code: string;
  name: string;
  type: 'Degree' | 'Master\'s';
  department: string;
}

export interface INotification {
  _id: string;
  userId: string;
  orderId: string;
  message: string;
  type: 'ORDER_CONFIRMED' | 'PAYMENT_SUCCESSFUL' | 'ORDER_PREPARING' | 'ORDER_READY' | 'ORDER_COLLECTED' | 'DELIVERY_DISPATCHED' | 'DELIVERY_COMPLETED';
  read: boolean;
  createdAt: string;
}

export interface IAnalytics {
  totalSales: number;
  totalOrders: number;
  pendingOrders: number;
  preparingOrders: number;
  readyOrders: number;
  completedOrders: number;
  topItems: { name: string; count: number; revenue: number }[];
  slotBreakdown: { slot: string; count: number }[];
  activeQueue: {
    tokenNumber: number;
    orderId: string;
    studentName: string;
    status: string;
    pickupSlot?: string;
    orderType?: 'PICKUP' | 'DELIVERY';
    deliveryLocation?: IDeliveryLocation;
    itemsCount: number;
    createdAt: string;
  }[];
  waitingStudentsCount: number;
  isAtlasConnected?: boolean;
  isSupabaseConnected?: boolean;
  databaseProvider?: string;
}
