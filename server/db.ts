import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import {
  IUser,
  IMenuItem,
  IOrder,
  IPayment,
  INotification,
  IBranch,
  IStockTransfer,
  ICoupon,
  IFoodWasteRecord,
  IAuditLog,
  ICourse
} from './models.ts';
import {
  initSupabase,
  isSupabaseConnected,
  getSupabaseClient,
  mapUserFromDb,
  mapUserToDb,
  mapMenuFromDb,
  mapMenuToDb,
  mapOrderFromDb,
  mapOrderToDb,
  mapPaymentFromDb,
  mapPaymentToDb,
  mapNotificationFromDb,
  mapNotificationToDb
} from './supabase.ts';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'canteen_db.json');

// Memory/File-backed store for offline/instant evaluation and fallback
interface DatabaseStore {
  users: IUser[];
  menuItems: IMenuItem[];
  orders: IOrder[];
  payments: IPayment[];
  notifications: INotification[];
  tokenCounter: number;
  branches: IBranch[];
  courses: ICourse[];
  transfers: IStockTransfer[];
  coupons: ICoupon[];
  wasteRecords: IFoodWasteRecord[];
  auditLogs: IAuditLog[];
}

let store: DatabaseStore = {
  users: [],
  menuItems: [],
  orders: [],
  payments: [],
  notifications: [],
  tokenCounter: 103,
  branches: [],
  courses: [],
  transfers: [],
  coupons: [],
  wasteRecords: [],
  auditLogs: [],
};

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadLocalStore() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      store = { ...store, ...parsed };
      console.log('✅ Loaded data from local file storage:', DB_FILE);
    }
  } catch (err) {
    console.error('Error reading local db file:', err);
  }
}

function saveLocalStore() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving local db file:', err);
  }
}

// Initial seed data with authentic South Indian food images
const initialMenuItems: Omit<IMenuItem, '_id' | 'createdAt'>[] = [
  {
    name: 'Bisibele Bath',
    description: 'Authentic Karnataka spiced rice cooked with lentils, mixed vegetables, and pure ghee.',
    price: 40,
    image: '/images/bisibele_bath.jpg',
    category: 'Meals',
    available: true,
    isTodaySpecial: true,
    date: new Date().toISOString().split('T')[0],
  },
  {
    name: 'Masala Dosa',
    description: 'Crispy golden fermented crepe stuffed with spiced potato palya and served with coconut chutney & sambar.',
    price: 50,
    image: '/images/masala_dosa.jpg',
    category: 'Breakfast',
    available: true,
    isTodaySpecial: true,
    date: new Date().toISOString().split('T')[0],
  },
  {
    name: 'Idli (2 Pcs)',
    description: 'Steaming hot, fluffy rice cakes accompanied by freshly ground coconut chutney and piping hot sambar.',
    price: 30,
    image: '/images/idli.jpg',
    category: 'Breakfast',
    available: true,
    isTodaySpecial: false,
    date: new Date().toISOString().split('T')[0],
  },
  {
    name: 'Sambar Rice',
    description: 'Homestyle aromatic South Indian rice dish flavored with drumsticks, shallots, tamarind, and fresh coriander.',
    price: 35,
    image: '/images/sambar_rice.jpg',
    category: 'Meals',
    available: true,
    isTodaySpecial: false,
    date: new Date().toISOString().split('T')[0],
  },
  {
    name: 'Curd Rice',
    description: 'Cooling seasoned yogurt rice tempered with mustard seeds, curry leaves, ginger, and green chilies.',
    price: 30,
    image: '/images/curd_rice.jpg',
    category: 'Meals',
    available: true,
    isTodaySpecial: false,
    date: new Date().toISOString().split('T')[0],
  },
  {
    name: 'Lemon Rice',
    description: 'Tangy and crunchy turmeric rice tossed with roasted peanuts, curry leaves, and fresh lime juice.',
    price: 35,
    image: '/images/lemon_rice.jpg',
    category: 'Meals',
    available: true,
    isTodaySpecial: false,
    date: new Date().toISOString().split('T')[0],
  },
  {
    name: 'Filter Coffee',
    description: 'Traditional South Indian filter coffee brewed with chicory and frothy hot milk in stainless steel tumbler.',
    price: 20,
    image: '/images/filter_coffee.jpg',
    category: 'Beverages',
    available: true,
    isTodaySpecial: false,
    date: new Date().toISOString().split('T')[0],
  },
  {
    name: 'Tea (Masala Chai)',
    description: 'Cardamom and ginger infused steaming hot college canteen style milk tea.',
    price: 15,
    image: '/images/masala_chai.jpg',
    category: 'Beverages',
    available: true,
    isTodaySpecial: false,
    date: new Date().toISOString().split('T')[0],
  },
  {
    name: 'Medu Vada (1 Pc)',
    description: 'Crispy fried lentil donut with crunchy exterior and soft fluffy interior served with chutney.',
    price: 20,
    image: '/images/medu_vada.jpg',
    category: 'Breakfast',
    available: true,
    isTodaySpecial: false,
    date: new Date().toISOString().split('T')[0],
  },
  {
    name: 'Poori Sagu',
    description: 'Two fluffy puffed wheat pooris served with flavorful spiced mixed vegetable sagu.',
    price: 45,
    image: '/images/poori_sagu.jpg',
    category: 'Breakfast',
    available: true,
    isTodaySpecial: false,
    date: new Date().toISOString().split('T')[0],
  },
  {
    name: 'Special South Indian Meals Thali',
    description: 'Grand campus thali with steamed rice, sambar, rasam, kootu, 2 chapatis, vegetable palya, papad, curd and payasam sweet.',
    price: 75,
    image: '/images/special_meals_thali.jpg',
    category: 'Meals',
    available: true,
    isTodaySpecial: true,
    date: new Date().toISOString().split('T')[0],
  },
  {
    name: 'Royal Veg Dum Biryani',
    description: 'Aromatic basmati rice cooked with garden-fresh vegetables, saffron, mint and cashews, served with cucumber raita.',
    price: 70,
    image: '/images/veg_biryani.jpg',
    category: 'Lunch',
    available: true,
    isTodaySpecial: true,
    date: new Date().toISOString().split('T')[0],
  },
  {
    name: 'Crispy Samosa Plate (2 Pcs)',
    description: 'Golden Punjabi samosas stuffed with spiced potatoes & peas, served with tangy tamarind and fresh mint chutneys.',
    price: 25,
    image: '/images/samosa.jpg',
    category: 'Snacks',
    available: true,
    isTodaySpecial: false,
    date: new Date().toISOString().split('T')[0],
  },
  {
    name: 'Veg Cheese Grilled Sandwich',
    description: 'Crisp golden toasted bread loaded with melted cheddar cheese, diced bell peppers, onion, tomatoes and herbs.',
    price: 50,
    image: '/images/cheese_sandwich.jpg',
    category: 'Fast Food',
    available: true,
    isTodaySpecial: false,
    date: new Date().toISOString().split('T')[0],
  },
  {
    name: 'Crispy Gobi Manchurian',
    description: 'Crunchy battered cauliflower florets tossed with garlic, ginger, spring onions in spicy Indo-Chinese dark sauce.',
    price: 60,
    image: '/images/gobi_manchurian.jpg',
    category: 'Fast Food',
    available: true,
    isTodaySpecial: false,
    date: new Date().toISOString().split('T')[0],
  },
  {
    name: 'Thick Cold Coffee with Ice Cream',
    description: 'Creamy frothy blended espresso cold coffee served with chocolate drizzle and a scoop of vanilla ice cream.',
    price: 40,
    image: '/images/cold_coffee.jpg',
    category: 'Beverages',
    available: true,
    isTodaySpecial: false,
    date: new Date().toISOString().split('T')[0],
  },
  {
    name: 'Gulab Jamun (2 Pcs)',
    description: 'Soft melt-in-mouth cottage cheese dumplings soaked in fragrant cardamom & saffron sugar syrup with pistachio garnish.',
    price: 30,
    image: '/images/gulab_jamun.jpg',
    category: 'Desserts',
    available: true,
    isTodaySpecial: false,
    date: new Date().toISOString().split('T')[0],
  },
  {
    name: 'Chapati with Veg Kurma (3 Pcs)',
    description: 'Tawa-roasted soft wheat chapatis served with mildly spiced rich coconut and mixed vegetable kurma.',
    price: 40,
    image: '/images/poori_sagu.jpg',
    category: 'Meals',
    available: true,
    isTodaySpecial: false,
    date: new Date().toISOString().split('T')[0],
  },
  {
    name: 'Sprouts & Sweet Corn Salad Bowl',
    description: 'Nutritious steamed sprouted green gram and American sweet corn tossed with lemon, black pepper, and coriander.',
    price: 35,
    image: '/images/lemon_rice.jpg',
    category: 'Healthy Food',
    available: true,
    isTodaySpecial: false,
    date: new Date().toISOString().split('T')[0],
  },
];

export async function initDatabase() {
  loadLocalStore();

  console.log('🚀 Connecting database to Supabase (MongoDB completely removed)...');
  const connected = await initSupabase();
  if (connected) {
    console.log('🌟 Supabase Database Connected & Operational!');
  } else {
    console.log('ℹ️ Running in integrated local storage mode (Supabase sync will retry automatically).');
  }

  // Seed default data & sync with Supabase
  await seedDefaultData();
}

async function seedDefaultData() {
  const hashedPasswordAdmin = await bcrypt.hash('admin123', 10);
  const hashedPasswordStudent = await bcrypt.hash('student123', 10);
  const hashedPasswordSrinivas = await bcrypt.hash('810522', 10);

  // Primary Operator: Srinivas V M (srinivasvm1122@gmail.com)
  const existingSrinivas = store.users.find(u => u.email === 'srinivasvm1122@gmail.com');
  if (!existingSrinivas) {
    const srinivasOperator: IUser = {
      _id: 'usr_op_srinivas',
      name: 'Srinivas V M',
      studentId: 'STAFF-OP-01',
      email: 'srinivasvm1122@gmail.com',
      password: hashedPasswordSrinivas,
      phone: '+91 81052 20000',
      course: 'Canteen Administration',
      year: 'Senior Staff',
      studentType: 'Degree',
      role: 'operator',
      createdAt: new Date(),
    };
    store.users.push(srinivasOperator);
  } else {
    existingSrinivas.password = hashedPasswordSrinivas;
    existingSrinivas.role = 'operator';
  }

  // Alias Operator: Vaasu (vaasu1122@gmail.com)
  const existingVaasu = store.users.find(u => u.email === 'vaasu1122@gmail.com');
  if (!existingVaasu) {
    const vaasuOperator: IUser = {
      _id: 'usr_op_vaasu',
      name: 'Srinivas (Vaasu)',
      studentId: 'STAFF-OP-02',
      email: 'vaasu1122@gmail.com',
      password: hashedPasswordSrinivas,
      phone: '+91 81052 20000',
      course: 'Canteen Administration',
      year: 'Staff',
      studentType: 'Degree',
      role: 'operator',
      createdAt: new Date(),
    };
    store.users.push(vaasuOperator);
  } else {
    existingVaasu.password = hashedPasswordSrinivas;
    existingVaasu.role = 'operator';
  }

  // Default demo operator
  const existingOperator = store.users.find(u => u.email === 'operator@campus.edu');
  if (!existingOperator) {
    const operatorUser: IUser = {
      _id: 'usr_op_001',
      name: 'Campus Canteen Operator',
      studentId: 'STAFF-OP-03',
      email: 'operator@campus.edu',
      password: hashedPasswordAdmin,
      phone: '+91 98450 12345',
      course: 'Administration',
      year: 'Staff',
      studentType: 'Degree',
      role: 'operator',
      createdAt: new Date(),
    };
    store.users.push(operatorUser);
  }

  // Admin User
  const existingAdmin = store.users.find(u => u.email === 'admin@campus.edu');
  if (!existingAdmin) {
    const adminUser: IUser = {
      _id: 'usr_admin_001',
      name: 'Campus Canteen Administrator',
      studentId: 'ADMIN-01',
      email: 'admin@campus.edu',
      password: hashedPasswordAdmin,
      phone: '+91 99000 11223',
      course: 'Management',
      year: 'Admin',
      studentType: 'Degree',
      role: 'admin',
      createdAt: new Date(),
    };
    store.users.push(adminUser);
  }

  // Kitchen Staff User
  const hashedPasswordKitchen = await bcrypt.hash('kitchen123', 10);
  const existingKitchen = store.users.find(u => u.email === 'kitchen@campus.edu');
  if (!existingKitchen) {
    const kitchenUser: IUser = {
      _id: 'usr_kitchen_001',
      name: 'Head Chef & Kitchen Lead',
      studentId: 'KITCHEN-01',
      email: 'kitchen@campus.edu',
      password: hashedPasswordKitchen,
      phone: '+91 98450 77889',
      course: 'Food Production',
      year: 'Staff',
      studentType: 'Degree',
      role: 'kitchen',
      createdAt: new Date(),
    };
    store.users.push(kitchenUser);
  }

  // Delivery Staff User
  const hashedPasswordDelivery = await bcrypt.hash('delivery123', 10);
  const existingDelivery = store.users.find(u => u.email === 'delivery@campus.edu');
  if (!existingDelivery) {
    const deliveryUser: IUser = {
      _id: 'usr_delivery_001',
      name: 'Campus Room Delivery Partner',
      studentId: 'DELIVERY-01',
      email: 'delivery@campus.edu',
      password: hashedPasswordDelivery,
      phone: '+91 97410 44556',
      course: 'Logistics',
      year: 'Staff',
      studentType: 'Degree',
      role: 'delivery',
      createdAt: new Date(),
    };
    store.users.push(deliveryUser);
  }

  // Branch Manager User
  const hashedPasswordManager = await bcrypt.hash('manager123', 10);
  const existingManager = store.users.find(u => u.email === 'manager@campus.edu');
  if (!existingManager) {
    const managerUser: IUser = {
      _id: 'usr_mgr_001',
      name: 'Hostel Canteen Branch Manager',
      studentId: 'MGR-02',
      email: 'manager@campus.edu',
      password: hashedPasswordManager,
      phone: '+91 96110 33221',
      course: 'Branch Operations',
      year: 'Staff',
      studentType: 'Degree',
      role: 'branch_manager',
      createdAt: new Date(),
    };
    store.users.push(managerUser);
  }

  // Student 1 (Degree)
  const existingStudent = store.users.find(u => u.email === 'rahul@campus.edu');
  if (!existingStudent) {
    const studentUser: IUser = {
      _id: 'usr_std_001',
      name: 'Rahul Gowda',
      studentId: 'CAM2024BCA104',
      email: 'rahul@campus.edu',
      password: hashedPasswordStudent,
      phone: '+91 99012 34567',
      course: 'BCA (Bachelor of Computer Applications)',
      year: '3rd Year',
      studentType: 'Degree',
      role: 'student',
      academicCategory: 'BCA',
      department: 'Computer Science',
      semester: '5th Semester',
      section: 'A',
      hostelBuilding: 'Hostel A',
      roomNumber: '204',
      createdAt: new Date(),
    };
    store.users.push(studentUser);
  }

  // Student 2 (Master's)
  const existingMastersStudent = store.users.find(u => u.email === 'priya@campus.edu');
  if (!existingMastersStudent) {
    const mastersUser: IUser = {
      _id: 'usr_std_002',
      name: 'Priya Sharma',
      studentId: 'CAM2025MCA018',
      email: 'priya@campus.edu',
      password: hashedPasswordStudent,
      phone: '+91 98860 54321',
      course: 'MCA (Master of Computer Applications)',
      year: '1st Year',
      studentType: 'Master\'s',
      role: 'student',
      academicCategory: 'MCA',
      department: 'Computer Applications',
      semester: '2nd Semester',
      section: 'B',
      hostelBuilding: 'Hostel B',
      roomNumber: '112',
      createdAt: new Date(),
    };
    store.users.push(mastersUser);
  }

  // Seed Branches
  if (!store.branches || store.branches.length === 0) {
    store.branches = [
      { id: 'br_1', name: 'Main Canteen', location: 'Central Academic Block (Ground Floor)', isOpen: true, currentWaitTimeMinutes: 8 },
      { id: 'br_2', name: 'Hostel Canteen', location: 'Hostel Quadrangle Block', isOpen: true, currentWaitTimeMinutes: 5 },
      { id: 'br_3', name: 'Block B Canteen', location: 'Tech & Science Block', isOpen: true, currentWaitTimeMinutes: 10 },
      { id: 'br_4', name: 'Evening Snacks Counter', location: 'Campus Garden Lawn', isOpen: true, currentWaitTimeMinutes: 4 },
    ];
  }

  // Seed Courses
  if (!store.courses || store.courses.length === 0) {
    store.courses = [
      { id: 'c_bca', code: 'BCA', name: 'Bachelor of Computer Applications', type: 'Degree', department: 'Computer Science' },
      { id: 'c_bba', code: 'BBA', name: 'Bachelor of Business Administration', type: 'Degree', department: 'Management Studies' },
      { id: 'c_bcom', code: 'BCom', name: 'Bachelor of Commerce', type: 'Degree', department: 'Commerce' },
      { id: 'c_ba', code: 'BA', name: 'Bachelor of Arts', type: 'Degree', department: 'Humanities' },
      { id: 'c_bsc', code: 'BSc', name: 'Bachelor of Science', type: 'Degree', department: 'Science' },
      { id: 'c_btech', code: 'BE/BTech', name: 'Bachelor of Engineering & Technology', type: 'Degree', department: 'Engineering' },
      { id: 'c_mca', code: 'MCA', name: 'Master of Computer Applications', type: 'Master\'s', department: 'Computer Applications' },
      { id: 'c_mba', code: 'MBA', name: 'Master of Business Administration', type: 'Master\'s', department: 'Business School' },
      { id: 'c_msc', code: 'MSc', name: 'Master of Science', type: 'Master\'s', department: 'Science' },
      { id: 'c_mcom', code: 'MCom', name: 'Master of Commerce', type: 'Master\'s', department: 'Commerce' },
      { id: 'c_ma', code: 'MA', name: 'Master of Arts', type: 'Master\'s', department: 'Arts' },
    ];
  }

  // Seed Coupons
  if (!store.coupons || store.coupons.length === 0) {
    store.coupons = [
      { code: 'WELCOME10', description: '10% off on all campus meals', discountPercent: 10, minOrderAmount: 30, active: true },
      { code: 'BCA10', description: '10% exclusive discount for BCA students', discountPercent: 10, targetCourse: 'BCA', minOrderAmount: 40, active: true },
      { code: 'FREEDEL', description: 'Free room delivery on orders above ₹80', discountAmount: 15, minOrderAmount: 80, active: true },
      { code: 'SNACK20', description: '₹20 flat discount on orders above ₹100', discountAmount: 20, minOrderAmount: 100, active: true },
    ];
  }

  // Seed Stock Transfers
  if (!store.transfers || store.transfers.length === 0) {
    store.transfers = [
      {
        id: 'tr_101',
        itemId: 'menu_102',
        itemName: 'Masala Dosa Batter (10 Packs)',
        quantity: 10,
        fromBranch: 'Main Canteen',
        toBranch: 'Hostel Canteen',
        status: 'RECEIVED',
        requestedBy: 'Hostel Canteen Branch Manager',
        approvedBy: 'Campus Canteen Operator',
        createdAt: new Date(Date.now() - 3600000),
        updatedAt: new Date(Date.now() - 1800000),
      }
    ];
  }

  // Seed Waste Records
  if (!store.wasteRecords || store.wasteRecords.length === 0) {
    const todayStr = new Date().toISOString().split('T')[0];
    store.wasteRecords = [
      {
        id: 'wst_101',
        date: todayStr,
        branch: 'Main Canteen',
        itemId: 'menu_101',
        itemName: 'Bisibele Bath',
        preparedQty: 60,
        soldQty: 54,
        remainingQty: 6,
        wastedQty: 2,
        reason: 'Surplus lunch prep - 4 transferred to Hostel Canteen',
      },
      {
        id: 'wst_102',
        date: todayStr,
        branch: 'Block B Canteen',
        itemId: 'menu_102',
        itemName: 'Masala Dosa',
        preparedQty: 80,
        soldQty: 78,
        remainingQty: 2,
        wastedQty: 1,
        reason: 'End of breakfast shelf life',
      }
    ];
  }

  // Seed Audit Logs
  if (!store.auditLogs || store.auditLogs.length === 0) {
    store.auditLogs = [
      {
        id: 'aud_1',
        user: 'admin@campus.edu',
        role: 'admin',
        action: 'COUPON_ACTIVATED',
        target: 'WELCOME10',
        metadata: { discount: '10%' },
        timestamp: new Date(Date.now() - 7200000),
      },
      {
        id: 'aud_2',
        user: 'srinivasvm1122@gmail.com',
        role: 'operator',
        action: 'STOCK_TRANSFER_APPROVED',
        target: 'Hostel Canteen (10 Packs)',
        metadata: { from: 'Main Canteen', to: 'Hostel Canteen' },
        timestamp: new Date(Date.now() - 3600000),
      }
    ];
  }

  // Seed Menu Items
  for (let i = 0; i < initialMenuItems.length; i++) {
    const item = initialMenuItems[i];
    const exists = store.menuItems.some(m => m.name.toLowerCase() === item.name.toLowerCase());
    if (!exists) {
      store.menuItems.push({
        ...item,
        _id: `menu_${i + 101}`,
        createdAt: new Date(),
      });
    }
  }
  saveLocalStore();

  // Seed sample initial queue orders
  if (store.orders.length === 0) {
    const now = new Date();
    store.orders = [
      {
        _id: 'ord_101',
        orderId: 'VIM-2026-101',
        tokenNumber: 101,
        userId: 'usr_std_001',
        studentName: 'Rahul Gowda',
        studentId: 'CAM2024BCA104',
        items: [
          { itemId: 'menu_102', name: 'Masala Dosa', price: 50, quantity: 1 },
          { itemId: 'menu_107', name: 'Filter Coffee', price: 20, quantity: 1 },
        ],
        totalAmount: 70,
        orderType: 'PICKUP',
        branch: 'Main Canteen',
        pickupSlot: '1:00 PM – 1:10 PM',
        paymentMethod: 'Online Payment',
        paymentStatus: 'PAID',
        orderStatus: 'COLLECTED',
        transactionId: 'TXN_UPI_98451',
        createdAt: new Date(now.getTime() - 40 * 60000),
        updatedAt: new Date(now.getTime() - 10 * 60000),
      },
      {
        _id: 'ord_102',
        orderId: 'VIM-2026-102',
        tokenNumber: 102,
        userId: 'usr_std_002',
        studentName: 'Priya Sharma',
        studentId: 'CAM2025MCA018',
        items: [
          { itemId: 'menu_104', name: 'Sambar Rice', price: 35, quantity: 1 },
          { itemId: 'menu_108', name: 'Tea (Masala Chai)', price: 15, quantity: 1 },
        ],
        totalAmount: 50,
        orderType: 'PICKUP',
        branch: 'Main Canteen',
        pickupSlot: '1:30 PM – 1:40 PM',
        paymentMethod: 'Pay at Canteen',
        paymentStatus: 'PENDING',
        orderStatus: 'PREPARING',
        transactionId: 'TXN_CASH_102',
        createdAt: new Date(now.getTime() - 25 * 60000),
        updatedAt: new Date(now.getTime() - 5 * 60000),
      },
      {
        _id: 'ord_103',
        orderId: 'VIM-2026-103',
        tokenNumber: 103,
        userId: 'usr_std_001',
        studentName: 'Rahul Gowda',
        studentId: 'CAM2024BCA104',
        items: [
          { itemId: 'menu_101', name: 'Bisibele Bath', price: 40, quantity: 1 },
          { itemId: 'menu_109', name: 'Medu Vada (1 Pc)', price: 20, quantity: 1 },
        ],
        totalAmount: 60,
        orderType: 'PICKUP',
        branch: 'Main Canteen',
        pickupSlot: '1:10 PM – 1:20 PM',
        paymentMethod: 'Online Payment',
        paymentStatus: 'PAID',
        orderStatus: 'READY',
        transactionId: 'TXN_UPI_98492',
        createdAt: new Date(now.getTime() - 15 * 60000),
        updatedAt: new Date(now.getTime() - 2 * 60000),
      }
    ];

    store.payments = [
      {
        _id: 'pay_101',
        orderId: 'ord_101',
        amount: 70,
        method: 'Online Payment',
        status: 'PAID',
        transactionId: 'TXN_UPI_98451',
        createdAt: new Date(now.getTime() - 40 * 60000),
      },
      {
        _id: 'pay_102',
        orderId: 'ord_102',
        amount: 50,
        method: 'Pay at Canteen',
        status: 'PENDING',
        transactionId: 'TXN_CASH_102',
        createdAt: new Date(now.getTime() - 25 * 60000),
      },
      {
        _id: 'pay_103',
        orderId: 'ord_103',
        amount: 60,
        method: 'Online Payment',
        status: 'PAID',
        transactionId: 'TXN_UPI_98492',
        createdAt: new Date(now.getTime() - 15 * 60000),
      }
    ];

    store.notifications = [
      {
        _id: 'notif_103',
        userId: 'usr_std_001',
        orderId: 'ord_103',
        message: '🔔 Your order #103 is ready for pickup!',
        type: 'ORDER_READY',
        read: false,
        createdAt: new Date(now.getTime() - 2 * 60000),
      }
    ];
  }

  saveLocalStore();

  // Sync to Supabase if connected
  const supabase = getSupabaseClient();
  if (supabase && isSupabaseConnected()) {
    try {
      console.log('🔄 Synchronizing data with Supabase...');
      // 1. Sync Users
      for (const u of store.users) {
        await supabase
          .from('users')
          .upsert(mapUserToDb(u), { onConflict: 'email' });
      }

      // 2. Sync Menu
      const { data: remoteMenu } = await supabase.from('menu_items').select('*');
      if (!remoteMenu || remoteMenu.length === 0) {
        const menuRows = store.menuItems.map(m => mapMenuToDb(m));
        await supabase.from('menu_items').insert(menuRows);
        console.log(`✅ Seeded ${menuRows.length} Menu Items into Supabase!`);
      } else {
        store.menuItems = remoteMenu.map(mapMenuFromDb);
      }

      // 3. Sync Orders
      const { data: remoteOrders } = await supabase.from('orders').select('*');
      if (!remoteOrders || remoteOrders.length === 0) {
        const orderRows = store.orders.map(o => mapOrderToDb(o));
        await supabase.from('orders').insert(orderRows);
        console.log(`✅ Seeded ${orderRows.length} Orders into Supabase!`);
      } else {
        store.orders = remoteOrders.map(mapOrderFromDb);
        const maxToken = Math.max(103, ...store.orders.map(o => o.tokenNumber || 0));
        store.tokenCounter = maxToken;
      }

      // 4. Token Counter
      await supabase
        .from('counters')
        .upsert({ name: 'token_counter', val: store.tokenCounter }, { onConflict: 'name' });

      console.log('🌟 Successfully synchronized with Supabase database!');
      saveLocalStore();
    } catch (err: any) {
      console.warn('⚠️ Supabase sync warning:', err.message);
    }
  }
}

// Unified Data Access API targeting Supabase
export const DB = {
  isSupabaseConnected: () => isSupabaseConnected(),
  isAtlasConnected: () => isSupabaseConnected(), // Backwards compatibility for UI

  // USERS
  users: {
    findByEmail: async (email: string): Promise<IUser | null> => {
      const lower = email.toLowerCase().trim();
      const supabase = getSupabaseClient();
      if (supabase && isSupabaseConnected()) {
        try {
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', lower)
            .maybeSingle();

          if (data && !error) {
            const user = mapUserFromDb(data);
            const idx = store.users.findIndex(u => u.email.toLowerCase() === lower);
            if (idx >= 0) store.users[idx] = user;
            else store.users.push(user);
            return user;
          }
        } catch (e) {
          console.error('Supabase users.findByEmail error:', e);
        }
      }
      return store.users.find(u => u.email.toLowerCase() === lower) || null;
    },

    findById: async (id: string): Promise<IUser | null> => {
      const supabase = getSupabaseClient();
      if (supabase && isSupabaseConnected()) {
        try {
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', id)
            .maybeSingle();

          if (data && !error) {
            return mapUserFromDb(data);
          }
        } catch (e) {
          console.error('Supabase users.findById error:', e);
        }
      }
      return store.users.find(u => u._id === id) || null;
    },

    create: async (userData: Omit<IUser, '_id' | 'createdAt'>): Promise<IUser> => {
      const _id = 'usr_' + Date.now() + Math.random().toString(36).substring(2, 6);
      const newUser: IUser = {
        ...userData,
        _id,
        createdAt: new Date(),
      };
      store.users.push(newUser);
      saveLocalStore();

      const supabase = getSupabaseClient();
      if (supabase && isSupabaseConnected()) {
        try {
          await supabase.from('users').insert(mapUserToDb(newUser));
        } catch (e) {
          console.error('Supabase users.create error:', e);
        }
      }
      return newUser;
    },

    update: async (id: string, updates: Partial<IUser>): Promise<IUser | null> => {
      const idx = store.users.findIndex(u => u._id === id);
      if (idx !== -1) {
        store.users[idx] = { ...store.users[idx], ...updates };
        saveLocalStore();
      }

      const supabase = getSupabaseClient();
      if (supabase && isSupabaseConnected()) {
        try {
          await supabase
            .from('users')
            .update(mapUserToDb(updates))
            .eq('id', id);
        } catch (e) {
          console.error('Supabase users.update error:', e);
        }
      }
      return idx !== -1 ? store.users[idx] : null;
    },

    getAll: async (): Promise<IUser[]> => {
      const supabase = getSupabaseClient();
      if (supabase && isSupabaseConnected()) {
        try {
          const { data, error } = await supabase.from('users').select('*');
          if (data && !error && data.length > 0) {
            return data.map(mapUserFromDb);
          }
        } catch (e) {
          console.error('Supabase users.getAll error:', e);
        }
      }
      return [...store.users];
    },
  },

  // MENU ITEMS
  menu: {
    getAll: async (): Promise<IMenuItem[]> => {
      const supabase = getSupabaseClient();
      if (supabase && isSupabaseConnected()) {
        try {
          const { data, error } = await supabase
            .from('menu_items')
            .select('*')
            .order('created_at', { ascending: false });

          if (data && !error && data.length > 0) {
            store.menuItems = data.map(mapMenuFromDb);
            saveLocalStore();
            return store.menuItems;
          }
        } catch (e) {
          console.error('Supabase menu.getAll error:', e);
        }
      }
      return [...store.menuItems];
    },

    getById: async (id: string): Promise<IMenuItem | null> => {
      const supabase = getSupabaseClient();
      if (supabase && isSupabaseConnected()) {
        try {
          const { data, error } = await supabase
            .from('menu_items')
            .select('*')
            .eq('id', id)
            .maybeSingle();

          if (data && !error) {
            return mapMenuFromDb(data);
          }
        } catch (e) {}
      }
      return store.menuItems.find(m => m._id === id) || null;
    },

    create: async (itemData: Omit<IMenuItem, '_id' | 'createdAt'>): Promise<IMenuItem> => {
      const _id = 'menu_' + Date.now();
      const newItem: IMenuItem = {
        ...itemData,
        _id,
        createdAt: new Date(),
      };
      store.menuItems.unshift(newItem);
      saveLocalStore();

      const supabase = getSupabaseClient();
      if (supabase && isSupabaseConnected()) {
        try {
          await supabase.from('menu_items').insert(mapMenuToDb(newItem));
        } catch (e) {
          console.error('Supabase menu.create error:', e);
        }
      }
      return newItem;
    },

    update: async (id: string, updates: Partial<IMenuItem>): Promise<IMenuItem | null> => {
      const idx = store.menuItems.findIndex(m => m._id === id);
      if (idx !== -1) {
        store.menuItems[idx] = { ...store.menuItems[idx], ...updates };
        saveLocalStore();
      }

      const supabase = getSupabaseClient();
      if (supabase && isSupabaseConnected()) {
        try {
          await supabase
            .from('menu_items')
            .update(mapMenuToDb(updates))
            .eq('id', id);
        } catch (e) {
          console.error('Supabase menu.update error:', e);
        }
      }
      return idx !== -1 ? store.menuItems[idx] : null;
    },

    delete: async (id: string): Promise<boolean> => {
      const idx = store.menuItems.findIndex(m => m._id === id);
      if (idx !== -1) {
        store.menuItems.splice(idx, 1);
        saveLocalStore();
      }

      const supabase = getSupabaseClient();
      if (supabase && isSupabaseConnected()) {
        try {
          await supabase
            .from('menu_items')
            .delete()
            .eq('id', id);
        } catch (e) {
          console.error('Supabase menu.delete error:', e);
        }
      }
      return true;
    },
  },

  // ORDERS
  orders: {
    getNextTokenNumber: (): number => {
      store.tokenCounter += 1;
      saveLocalStore();

      const supabase = getSupabaseClient();
      if (supabase && isSupabaseConnected()) {
        Promise.resolve(
          supabase
            .from('counters')
            .upsert({ name: 'token_counter', val: store.tokenCounter }, { onConflict: 'name' })
        ).catch(() => {});
      }
      return store.tokenCounter;
    },

    getAll: async (filter?: {
      status?: string;
      pickupSlot?: string;
      paymentStatus?: string;
      search?: string;
      userId?: string;
    }): Promise<IOrder[]> => {
      const supabase = getSupabaseClient();
      if (supabase && isSupabaseConnected()) {
        try {
          let query = supabase.from('orders').select('*').order('created_at', { ascending: false });

          if (filter?.userId) query = query.eq('user_id', filter.userId);
          if (filter?.status && filter.status !== 'ALL') query = query.eq('order_status', filter.status);
          if (filter?.paymentStatus && filter.paymentStatus !== 'ALL') query = query.eq('payment_status', filter.paymentStatus);
          if (filter?.pickupSlot && filter.pickupSlot !== 'ALL') query = query.eq('pickup_slot', filter.pickupSlot);

          const { data, error } = await query;
          if (data && !error) {
            let res = data.map(mapOrderFromDb);
            if (filter?.search) {
              const q = filter.search.toLowerCase().trim();
              res = res.filter(o =>
                o.orderId.toLowerCase().includes(q) ||
                String(o.tokenNumber).includes(q) ||
                o.studentName.toLowerCase().includes(q) ||
                (o.studentId && o.studentId.toLowerCase().includes(q))
              );
            }
            return res;
          }
        } catch (e) {
          console.error('Supabase orders.getAll error:', e);
        }
      }

      let mem = [...store.orders];
      if (filter?.userId) {
        mem = mem.filter(o => o.userId === filter.userId);
      }
      if (filter?.status && filter.status !== 'ALL') {
        mem = mem.filter(o => o.orderStatus === filter.status);
      }
      if (filter?.paymentStatus && filter.paymentStatus !== 'ALL') {
        mem = mem.filter(o => o.paymentStatus === filter.paymentStatus);
      }
      if (filter?.pickupSlot && filter.pickupSlot !== 'ALL') {
        mem = mem.filter(o => o.pickupSlot === filter.pickupSlot);
      }
      if (filter?.search) {
        const q = filter.search.toLowerCase().trim();
        mem = mem.filter(o =>
          o.orderId.toLowerCase().includes(q) ||
          String(o.tokenNumber).includes(q) ||
          o.studentName.toLowerCase().includes(q) ||
          (o.studentId && o.studentId.toLowerCase().includes(q))
        );
      }
      mem.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return mem;
    },

    getById: async (id: string): Promise<IOrder | null> => {
      const supabase = getSupabaseClient();
      if (supabase && isSupabaseConnected()) {
        try {
          const { data, error } = await supabase
            .from('orders')
            .select('*')
            .or(`id.eq.${id},order_id.eq.${id}`)
            .maybeSingle();

          if (data && !error) {
            return mapOrderFromDb(data);
          }
        } catch (e) {}
      }
      return store.orders.find(o => o._id === id || o.orderId === id) || null;
    },

    create: async (orderData: Omit<IOrder, '_id' | 'createdAt' | 'updatedAt'>): Promise<IOrder> => {
      const _id = 'ord_' + Date.now();
      const newOrder: IOrder = {
        ...orderData,
        _id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      store.orders.unshift(newOrder);
      saveLocalStore();

      const supabase = getSupabaseClient();
      if (supabase && isSupabaseConnected()) {
        try {
          await supabase.from('orders').insert(mapOrderToDb(newOrder));
        } catch (e) {
          console.error('Supabase orders.create error:', e);
        }
      }
      return newOrder;
    },

    updateStatus: async (orderId: string, orderStatus: IOrder['orderStatus']): Promise<IOrder | null> => {
      let updatedOrder: IOrder | null = null;
      let newPaymentStatus: IOrder['paymentStatus'] | undefined;

      const order = store.orders.find(o => o._id === orderId || o.orderId === orderId);
      if (order) {
        order.orderStatus = orderStatus;
        order.updatedAt = new Date();
        if (orderStatus === 'COLLECTED' && order.paymentMethod === 'Pay at Canteen') {
          order.paymentStatus = 'PAID';
          newPaymentStatus = 'PAID';
        }
        saveLocalStore();
        updatedOrder = order;
      }

      const supabase = getSupabaseClient();
      if (supabase && isSupabaseConnected()) {
        try {
          const updates: any = {
            order_status: orderStatus,
            updated_at: new Date().toISOString(),
          };
          if (newPaymentStatus) updates.payment_status = newPaymentStatus;

          const { data } = await supabase
            .from('orders')
            .update(updates)
            .or(`id.eq.${orderId},order_id.eq.${orderId}`)
            .select()
            .maybeSingle();

          if (data) {
            updatedOrder = mapOrderFromDb(data);
          }
        } catch (e) {
          console.error('Supabase orders.updateStatus error:', e);
        }
      }

      return updatedOrder;
    },

    updateDeliveryStatus: async (orderId: string, deliveryStatus: 'PENDING' | 'ASSIGNED' | 'OUT_FOR_DELIVERY' | 'DELIVERED'): Promise<IOrder | null> => {
      const order = store.orders.find(o => o._id === orderId || o.orderId === orderId);
      if (order) {
        order.deliveryStatus = deliveryStatus;
        if (deliveryStatus === 'DELIVERED') {
          order.orderStatus = 'COLLECTED';
        } else if (deliveryStatus === 'OUT_FOR_DELIVERY') {
          order.orderStatus = 'READY';
        }
        order.updatedAt = new Date();
        saveLocalStore();
      }
      const supabase = getSupabaseClient();
      if (supabase && isSupabaseConnected()) {
        try {
          await supabase.from('orders').update({
            delivery_status: deliveryStatus,
            order_status: deliveryStatus === 'DELIVERED' ? 'COLLECTED' : (deliveryStatus === 'OUT_FOR_DELIVERY' ? 'READY' : undefined),
            updated_at: new Date().toISOString()
          }).or(`id.eq.${orderId},order_id.eq.${orderId}`);
        } catch (e) {}
      }
      return order || null;
    },

    addRating: async (orderId: string, ratingData: { foodRating: number; deliveryRating?: number; review?: string }): Promise<IOrder | null> => {
      const order = store.orders.find(o => o._id === orderId || o.orderId === orderId);
      if (order) {
        order.rating = {
          ...ratingData,
          createdAt: new Date().toISOString()
        };
        order.updatedAt = new Date();
        saveLocalStore();
      }
      const supabase = getSupabaseClient();
      if (supabase && isSupabaseConnected()) {
        try {
          await supabase.from('orders').update({
            rating: { ...ratingData, createdAt: new Date().toISOString() },
            updated_at: new Date().toISOString()
          }).or(`id.eq.${orderId},order_id.eq.${orderId}`);
        } catch (e) {}
      }
      return order || null;
    },

    reportIssue: async (orderId: string, issueData: { issueType: string; description: string }): Promise<IOrder | null> => {
      const order = store.orders.find(o => o._id === orderId || o.orderId === orderId);
      if (order) {
        order.reportedIssue = {
          ...issueData,
          status: 'OPEN',
          reportedAt: new Date().toISOString()
        };
        order.updatedAt = new Date();
        saveLocalStore();
      }
      const supabase = getSupabaseClient();
      if (supabase && isSupabaseConnected()) {
        try {
          await supabase.from('orders').update({
            reported_issue: { ...issueData, status: 'OPEN', reportedAt: new Date().toISOString() },
            updated_at: new Date().toISOString()
          }).or(`id.eq.${orderId},order_id.eq.${orderId}`);
        } catch (e) {}
      }
      return order || null;
    },

    cancelOrder: async (orderId: string, reason?: string): Promise<IOrder | null> => {
      const order = store.orders.find(o => o._id === orderId || o.orderId === orderId);
      if (!order) return null;
      if (order.orderStatus !== 'CONFIRMED') {
        throw new Error('Order is already being prepared or completed and cannot be cancelled.');
      }
      order.orderStatus = 'CANCELLED';
      if (reason) order.notes = (order.notes ? order.notes + ' | ' : '') + `Cancelled: ${reason}`;
      order.updatedAt = new Date();
      saveLocalStore();

      const supabase = getSupabaseClient();
      if (supabase && isSupabaseConnected()) {
        try {
          await supabase.from('orders').update({
            order_status: 'CANCELLED',
            notes: order.notes,
            updated_at: new Date().toISOString()
          }).or(`id.eq.${orderId},order_id.eq.${orderId}`);
        } catch (e) {}
      }
      return order;
    },
  },

  // PAYMENTS
  payments: {
    create: async (paymentData: Omit<IPayment, '_id' | 'createdAt'>): Promise<IPayment> => {
      const _id = 'pay_' + Date.now();
      const newPayment: IPayment = {
        ...paymentData,
        _id,
        createdAt: new Date(),
      };
      store.payments.unshift(newPayment);
      saveLocalStore();

      const supabase = getSupabaseClient();
      if (supabase && isSupabaseConnected()) {
        try {
          await supabase.from('payments').insert(mapPaymentToDb(newPayment));
        } catch (e) {
          console.error('Supabase payments.create error:', e);
        }
      }
      return newPayment;
    },

    getByOrderId: async (orderId: string): Promise<IPayment | null> => {
      const supabase = getSupabaseClient();
      if (supabase && isSupabaseConnected()) {
        try {
          const { data, error } = await supabase
            .from('payments')
            .select('*')
            .eq('order_id', orderId)
            .maybeSingle();

          if (data && !error) {
            return mapPaymentFromDb(data);
          }
        } catch (e) {}
      }
      return store.payments.find(p => p.orderId === orderId) || null;
    }
  },

  // NOTIFICATIONS
  notifications: {
    create: async (notifData: Omit<INotification, '_id' | 'createdAt'>): Promise<INotification> => {
      const _id = 'notif_' + Date.now() + Math.random().toString(36).substring(2, 5);
      const newNotif: INotification = {
        ...notifData,
        _id,
        createdAt: new Date(),
      };
      store.notifications.unshift(newNotif);
      saveLocalStore();

      const supabase = getSupabaseClient();
      if (supabase && isSupabaseConnected()) {
        try {
          await supabase.from('notifications').insert(mapNotificationToDb(newNotif));
        } catch (e) {
          console.error('Supabase notifications.create error:', e);
        }
      }
      return newNotif;
    },

    getByUserId: async (userId: string): Promise<INotification[]> => {
      const supabase = getSupabaseClient();
      if (supabase && isSupabaseConnected()) {
        try {
          const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

          if (data && !error) {
            return data.map(mapNotificationFromDb);
          }
        } catch (e) {}
      }
      return store.notifications
        .filter(n => n.userId === userId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },

    markAllRead: async (userId: string): Promise<void> => {
      store.notifications.forEach(n => {
        if (n.userId === userId) n.read = true;
      });
      saveLocalStore();

      const supabase = getSupabaseClient();
      if (supabase && isSupabaseConnected()) {
        try {
          await supabase
            .from('notifications')
            .update({ read: true })
            .eq('user_id', userId);
        } catch (e) {
          console.error('Supabase notifications.markAllRead error:', e);
        }
      }
    },

    markOneRead: async (id: string): Promise<void> => {
      const n = store.notifications.find(item => item._id === id);
      if (n) {
        n.read = true;
        saveLocalStore();
      }

      const supabase = getSupabaseClient();
      if (supabase && isSupabaseConnected()) {
        try {
          await supabase
            .from('notifications')
            .update({ read: true })
            .eq('id', id);
        } catch (e) {}
      }
    }
  },

  // ANALYTICS & QUEUE
  analytics: {
    getOverview: async () => {
      const allOrders = await DB.orders.getAll();
      const totalOrders = allOrders.length;
      
      const totalSales = allOrders.reduce((sum, ord) => {
        return ord.paymentStatus === 'PAID' ? sum + ord.totalAmount : sum;
      }, 0);

      const pendingOrders = allOrders.filter(o => o.orderStatus === 'CONFIRMED').length;
      const preparingOrders = allOrders.filter(o => o.orderStatus === 'PREPARING').length;
      const readyOrders = allOrders.filter(o => o.orderStatus === 'READY').length;
      const completedOrders = allOrders.filter(o => o.orderStatus === 'COLLECTED').length;

      // Item frequency
      const itemCounts: Record<string, { name: string; count: number; revenue: number }> = {};
      allOrders.forEach(ord => {
        ord.items.forEach(item => {
          if (!itemCounts[item.name]) {
            itemCounts[item.name] = { name: item.name, count: 0, revenue: 0 };
          }
          itemCounts[item.name].count += item.quantity;
          itemCounts[item.name].revenue += item.quantity * item.price;
        });
      });

      const topItems = Object.values(itemCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Slot distribution
      const slotCounts: Record<string, number> = {};
      allOrders.forEach(ord => {
        const slotKey = ord.pickupSlot || (ord.orderType === 'DELIVERY' ? 'Room Delivery' : 'Standard Pickup');
        slotCounts[slotKey] = (slotCounts[slotKey] || 0) + 1;
      });

      const slotBreakdown = Object.entries(slotCounts).map(([slot, count]) => ({
        slot,
        count,
      })).sort((a, b) => b.count - a.count);

      // Active queue
      const activeQueue = allOrders
        .filter(o => o.orderStatus !== 'COLLECTED' && o.orderStatus !== 'CANCELLED')
        .map(o => ({
          tokenNumber: o.tokenNumber,
          orderId: o.orderId,
          studentName: o.studentName,
          status: o.orderStatus,
          pickupSlot: o.pickupSlot,
          itemsCount: o.items.reduce((s, i) => s + i.quantity, 0),
          createdAt: o.createdAt,
        }));

      return {
        totalSales,
        totalOrders,
        pendingOrders,
        preparingOrders,
        readyOrders,
        completedOrders,
        topItems,
        slotBreakdown,
        activeQueue,
        waitingStudentsCount: activeQueue.length,
        isSupabaseConnected: isSupabaseConnected(),
        isAtlasConnected: isSupabaseConnected(),
        databaseProvider: 'Supabase PostgreSQL (qnfoycxcalvdczhtgpxj)',
      };
    }
  },

  // BRANCHES
  branches: {
    getAll: async (): Promise<IBranch[]> => {
      return store.branches || [];
    },
    updateStatus: async (branchId: string, updates: Partial<IBranch>): Promise<IBranch | null> => {
      const b = store.branches.find(item => item.id === branchId);
      if (b) {
        Object.assign(b, updates);
        saveLocalStore();
      }
      return b || null;
    }
  },

  // COURSES
  courses: {
    getAll: async (): Promise<ICourse[]> => {
      return store.courses || [];
    },
    create: async (courseData: Omit<ICourse, 'id'>): Promise<ICourse> => {
      const newCourse: ICourse = {
        ...courseData,
        id: 'c_' + courseData.code.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Date.now().toString(36),
      };
      store.courses.push(newCourse);
      saveLocalStore();
      return newCourse;
    },
    delete: async (id: string): Promise<boolean> => {
      const idx = store.courses.findIndex(c => c.id === id);
      if (idx !== -1) {
        store.courses.splice(idx, 1);
        saveLocalStore();
        return true;
      }
      return false;
    }
  },

  // STOCK TRANSFERS
  transfers: {
    getAll: async (): Promise<IStockTransfer[]> => {
      return store.transfers || [];
    },
    create: async (transferData: Omit<IStockTransfer, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<IStockTransfer> => {
      const newTransfer: IStockTransfer = {
        ...transferData,
        id: 'tr_' + Date.now(),
        status: 'REQUESTED',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      store.transfers.unshift(newTransfer);
      saveLocalStore();
      return newTransfer;
    },
    updateStatus: async (id: string, status: IStockTransfer['status'], approvedBy?: string): Promise<IStockTransfer | null> => {
      const t = store.transfers.find(item => item.id === id);
      if (t) {
        t.status = status;
        if (approvedBy) t.approvedBy = approvedBy;
        t.updatedAt = new Date();
        saveLocalStore();
      }
      return t || null;
    }
  },

  // FOOD WASTE MANAGEMENT
  waste: {
    getAll: async (): Promise<IFoodWasteRecord[]> => {
      return store.wasteRecords || [];
    },
    create: async (data: Omit<IFoodWasteRecord, 'id'>): Promise<IFoodWasteRecord> => {
      const newRecord: IFoodWasteRecord = {
        ...data,
        id: 'wst_' + Date.now(),
      };
      store.wasteRecords.unshift(newRecord);
      saveLocalStore();
      return newRecord;
    }
  },

  // OFFERS & COUPONS
  coupons: {
    getAll: async (): Promise<ICoupon[]> => {
      return store.coupons || [];
    },
    create: async (couponData: ICoupon): Promise<ICoupon> => {
      const idx = store.coupons.findIndex(c => c.code.toUpperCase() === couponData.code.toUpperCase());
      if (idx !== -1) {
        store.coupons[idx] = couponData;
      } else {
        store.coupons.push(couponData);
      }
      saveLocalStore();
      return couponData;
    },
    validate: async (code: string, orderTotal: number, studentCourse?: string): Promise<{ valid: boolean; discountAmount: number; message: string; coupon?: ICoupon }> => {
      const coupon = store.coupons.find(c => c.code.toUpperCase() === code.toUpperCase() && c.active);
      if (!coupon) {
        return { valid: false, discountAmount: 0, message: 'Invalid or inactive coupon code.' };
      }
      if (coupon.minOrderAmount && orderTotal < coupon.minOrderAmount) {
        return { valid: false, discountAmount: 0, message: `Minimum order of ₹${coupon.minOrderAmount} required for this coupon.` };
      }
      if (coupon.targetCourse && coupon.targetCourse !== 'All') {
        const studentCourseNorm = (studentCourse || '').toUpperCase();
        if (!studentCourseNorm.includes(coupon.targetCourse.toUpperCase())) {
          return { valid: false, discountAmount: 0, message: `This coupon is exclusively for ${coupon.targetCourse} students.` };
        }
      }

      let discount = 0;
      if (coupon.discountPercent) {
        discount = Math.round((orderTotal * coupon.discountPercent) / 100);
      } else if (coupon.discountAmount) {
        discount = Math.min(orderTotal, coupon.discountAmount);
      }

      return {
        valid: true,
        discountAmount: discount,
        message: `Coupon ${coupon.code} applied! ₹${discount} off.`,
        coupon
      };
    }
  },

  // AUDIT LOGS
  auditLogs: {
    getAll: async (): Promise<IAuditLog[]> => {
      return store.auditLogs || [];
    },
    log: async (logData: Omit<IAuditLog, 'id' | 'timestamp'>): Promise<IAuditLog> => {
      const newLog: IAuditLog = {
        ...logData,
        id: 'aud_' + Date.now() + Math.random().toString(36).substring(2, 5),
        timestamp: new Date(),
      };
      store.auditLogs.unshift(newLog);
      if (store.auditLogs.length > 500) store.auditLogs.pop();
      saveLocalStore();
      return newLog;
    }
  }
};
