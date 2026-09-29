import {
  IUser,
  IMenuItem,
  IOrder,
  INotification,
  IAnalytics,
  IBranch,
  IStockTransfer,
  ICoupon,
  IFoodWasteRecord,
  IAuditLog,
  ICourse,
  IDeliveryLocation,
  UserRole
} from '../types.ts';

const TOKEN_KEY = 'vimtech_canteen_token';

export const authStorage = {
  getToken: (): string | null => localStorage.getItem(TOKEN_KEY),
  setToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clearToken: () => localStorage.removeItem(TOKEN_KEY),
};

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = authStorage.getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.error || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data as T;
}

export const api = {
  // Auth
  register: (payload: any) =>
    request<{ message: string; token: string; user: IUser }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  login: (payload: { email: string; password: string; expectedRole?: string }) =>
    request<{ message: string; token: string; user: IUser }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getMe: () => request<{ user: IUser }>('/api/auth/me'),

  updateProfile: (payload: Partial<IUser>) =>
    request<{ message: string; user: IUser }>('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  getUsers: () => request<IUser[]>('/api/auth/users'),

  updateUserRole: (id: string, role: UserRole) =>
    request<{ message: string; user: IUser }>(`/api/auth/users/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    }),

  // Menu
  getMenu: (branch?: string) =>
    request<IMenuItem[]>(branch ? `/api/menu?branch=${encodeURIComponent(branch)}` : '/api/menu'),

  addMenuItem: (payload: Partial<IMenuItem>) =>
    request<{ message: string; item: IMenuItem }>('/api/menu', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateMenuItem: (id: string, payload: Partial<IMenuItem>) =>
    request<{ message: string; item: IMenuItem }>(`/api/menu/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  deleteMenuItem: (id: string) =>
    request<{ message: string }>(`/api/menu/${id}`, {
      method: 'DELETE',
    }),

  // Orders
  createOrder: (payload: {
    items: { itemId: string; name: string; quantity: number }[];
    orderType?: 'PICKUP' | 'DELIVERY';
    pickupSlot?: string;
    deliveryLocation?: IDeliveryLocation;
    branch?: string;
    paymentMethod: 'Online Payment' | 'Pay at Canteen';
    couponCode?: string;
    specialInstructions?: string;
    notes?: string;
    transactionId?: string;
  }) =>
    request<{ message: string; order: IOrder }>('/api/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getOrders: (params?: { status?: string; pickupSlot?: string; paymentStatus?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.status && params.status !== 'ALL') query.set('status', params.status);
    if (params?.pickupSlot && params.pickupSlot !== 'ALL') query.set('pickupSlot', params.pickupSlot);
    if (params?.paymentStatus && params.paymentStatus !== 'ALL') query.set('paymentStatus', params.paymentStatus);
    if (params?.search) query.set('search', params.search);

    const qs = query.toString();
    return request<IOrder[]>(`/api/orders${qs ? `?${qs}` : ''}`);
  },

  getOrderById: (id: string) => request<IOrder>(`/api/orders/${id}`),

  updateOrderStatus: (id: string, status: IOrder['orderStatus']) =>
    request<{ message: string; order: IOrder }>(`/api/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  updateDeliveryStatus: (id: string, deliveryStatus: 'PENDING' | 'ASSIGNED' | 'OUT_FOR_DELIVERY' | 'DELIVERED') =>
    request<{ message: string; order: IOrder }>(`/api/orders/${id}/delivery-status`, {
      method: 'PATCH',
      body: JSON.stringify({ deliveryStatus }),
    }),

  rateOrder: (id: string, payload: { foodRating: number; deliveryRating?: number; review?: string }) =>
    request<{ message: string; order: IOrder }>(`/api/orders/${id}/rating`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  reportIssue: (id: string, payload: { issueType: string; description: string }) =>
    request<{ message: string; order: IOrder }>(`/api/orders/${id}/issue`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  cancelOrder: (id: string, reason?: string) =>
    request<{ message: string; order: IOrder }>(`/api/orders/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),

  // Branches
  getBranches: () => request<IBranch[]>('/api/branches'),
  updateBranch: (id: string, payload: Partial<IBranch>) =>
    request<IBranch>(`/api/branches/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  // Stock Transfers
  getTransfers: () => request<IStockTransfer[]>('/api/transfers'),
  createTransfer: (payload: { itemId: string; itemName: string; quantity: number; fromBranch: string; toBranch: string }) =>
    request<IStockTransfer>('/api/transfers', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateTransferStatus: (id: string, status: IStockTransfer['status']) =>
    request<IStockTransfer>(`/api/transfers/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  // Academic (Courses)
  getCourses: () => request<ICourse[]>('/api/academic/courses'),
  createCourse: (payload: Omit<ICourse, 'id'>) =>
    request<ICourse>('/api/academic/courses', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  deleteCourse: (id: string) =>
    request<{ message: string }>(`/api/academic/courses/${id}`, {
      method: 'DELETE',
    }),

  // Coupons
  getCoupons: () => request<ICoupon[]>('/api/coupons'),
  validateCoupon: (code: string, orderTotal: number) =>
    request<{ valid: boolean; discountAmount: number; message: string; coupon?: ICoupon }>('/api/coupons/validate', {
      method: 'POST',
      body: JSON.stringify({ code, orderTotal }),
    }),
  createCoupon: (payload: ICoupon) =>
    request<ICoupon>('/api/coupons', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Food Waste Records
  getWasteRecords: () => request<IFoodWasteRecord[]>('/api/waste'),
  createWasteRecord: (payload: Omit<IFoodWasteRecord, 'id'>) =>
    request<IFoodWasteRecord>('/api/waste', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Audit Logs
  getAuditLogs: () => request<IAuditLog[]>('/api/audit-logs'),

  // Notifications
  getNotifications: () =>
    request<{ notifications: INotification[]; unreadCount: number }>('/api/notifications'),

  markAllNotificationsRead: () =>
    request<{ message: string }>('/api/notifications/read-all', {
      method: 'POST',
    }),

  markNotificationRead: (id: string) =>
    request<{ message: string }>(`/api/notifications/${id}/read`, {
      method: 'PATCH',
    }),

  // Analytics
  getAnalytics: () => request<IAnalytics>('/api/analytics'),

  // System Health
  getHealth: () => request<{ status: string; system: string; database: string }>('/api/health'),
};
