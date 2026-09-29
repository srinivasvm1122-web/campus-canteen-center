import { createClient, SupabaseClient } from '@supabase/supabase-js';
import pg from 'pg';
import dotenv from 'dotenv';
import { IUser, IMenuItem, IOrder, IPayment, INotification } from './models.ts';

dotenv.config();

const { Pool } = pg;

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://qnfoycxcalvdczhtgpxj.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';
const DATABASE_URL = process.env.DATABASE_URL || '';

export let supabaseClient: SupabaseClient | null = null;
let isSupabaseReady = false;
let pool: pg.Pool | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  return supabaseClient;
}

export function isSupabaseConnected(): boolean {
  return isSupabaseReady;
}

export async function initSupabase(): Promise<boolean> {
  try {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      console.warn('⚠️ Supabase credentials missing.');
      return false;
    }

    console.log(`🔌 Initializing Supabase client (${SUPABASE_URL})...`);
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    // Try connecting via pg pool to verify database and ensure tables exist
    try {
      pool = new Pool({
        connectionString: DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 8000,
      });

      const pgClient = await pool.connect();
      console.log('🌟 Connected to Supabase PostgreSQL database directly!');

      // Ensure required schema tables exist
      await pgClient.query(`
        CREATE TABLE IF NOT EXISTS public.users (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          student_id TEXT,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          phone TEXT,
          course TEXT,
          year TEXT,
          student_type TEXT DEFAULT 'Degree',
          role TEXT NOT NULL DEFAULT 'student',
          academic_category TEXT,
          department TEXT,
          semester TEXT,
          section TEXT,
          hostel_building TEXT,
          room_number TEXT,
          branch_id TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS public.menu_items (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          price NUMERIC NOT NULL,
          image TEXT,
          category TEXT DEFAULT 'Meals',
          available BOOLEAN DEFAULT TRUE,
          is_today_special BOOLEAN DEFAULT FALSE,
          date TEXT,
          stock_quantity INTEGER DEFAULT 50,
          preparation_time_minutes INTEGER DEFAULT 10,
          is_veg BOOLEAN DEFAULT TRUE,
          branch_availability JSONB DEFAULT '["Main Canteen", "Hostel Canteen", "Block B Canteen"]'::jsonb,
          ingredients TEXT,
          allergy_info TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS public.orders (
          id TEXT PRIMARY KEY,
          order_id TEXT UNIQUE NOT NULL,
          token_number INTEGER NOT NULL,
          user_id TEXT NOT NULL,
          student_name TEXT NOT NULL,
          student_id TEXT,
          items JSONB NOT NULL DEFAULT '[]'::jsonb,
          total_amount NUMERIC NOT NULL,
          food_amount NUMERIC,
          delivery_fee NUMERIC DEFAULT 0,
          discount_amount NUMERIC DEFAULT 0,
          coupon_code TEXT,
          order_type TEXT DEFAULT 'PICKUP',
          pickup_slot TEXT,
          delivery_location JSONB,
          branch TEXT DEFAULT 'Main Canteen',
          payment_method TEXT NOT NULL,
          payment_status TEXT NOT NULL DEFAULT 'PENDING',
          order_status TEXT NOT NULL DEFAULT 'CONFIRMED',
          delivery_status TEXT DEFAULT 'PENDING',
          special_instructions TEXT,
          transaction_id TEXT,
          notes TEXT,
          rating JSONB,
          reported_issue JSONB,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS public.transfers (
          id TEXT PRIMARY KEY,
          item_id TEXT NOT NULL,
          item_name TEXT NOT NULL,
          quantity INTEGER NOT NULL,
          from_branch TEXT NOT NULL,
          to_branch TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'REQUESTED',
          requested_by TEXT NOT NULL,
          approved_by TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS public.coupons (
          code TEXT PRIMARY KEY,
          description TEXT NOT NULL,
          discount_percent NUMERIC,
          discount_amount NUMERIC,
          min_order_amount NUMERIC DEFAULT 0,
          target_course TEXT DEFAULT 'All',
          active BOOLEAN DEFAULT TRUE
        );

        CREATE TABLE IF NOT EXISTS public.waste_records (
          id TEXT PRIMARY KEY,
          date TEXT NOT NULL,
          branch TEXT NOT NULL,
          item_id TEXT NOT NULL,
          item_name TEXT NOT NULL,
          prepared_qty INTEGER NOT NULL DEFAULT 0,
          sold_qty INTEGER NOT NULL DEFAULT 0,
          remaining_qty INTEGER NOT NULL DEFAULT 0,
          wasted_qty INTEGER NOT NULL DEFAULT 0,
          reason TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS public.audit_logs (
          id TEXT PRIMARY KEY,
          user_name TEXT NOT NULL,
          role TEXT NOT NULL,
          action TEXT NOT NULL,
          target TEXT NOT NULL,
          metadata JSONB,
          timestamp TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS public.courses (
          id TEXT PRIMARY KEY,
          code TEXT NOT NULL,
          name TEXT NOT NULL,
          type TEXT NOT NULL,
          department TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS public.branches (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          location TEXT NOT NULL,
          is_open BOOLEAN DEFAULT TRUE,
          current_wait_time_minutes INTEGER DEFAULT 8
        );

        CREATE TABLE IF NOT EXISTS public.payments (
          id TEXT PRIMARY KEY,
          order_id TEXT NOT NULL,
          amount NUMERIC NOT NULL,
          method TEXT NOT NULL,
          status TEXT NOT NULL,
          transaction_id TEXT NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS public.notifications (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          order_id TEXT,
          message TEXT NOT NULL,
          type TEXT NOT NULL,
          read BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS public.counters (
          name TEXT PRIMARY KEY,
          val INTEGER NOT NULL DEFAULT 100
        );

        -- Safe column additions if tables already existed
        ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS order_type TEXT DEFAULT 'PICKUP';
        ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_location JSONB;
        ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS branch TEXT DEFAULT 'Main Canteen';
        ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_status TEXT DEFAULT 'PENDING';
        ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS discount_amount NUMERIC DEFAULT 0;
        ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS food_amount NUMERIC;
        ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_fee NUMERIC DEFAULT 0;
        ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS coupon_code TEXT;
        ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS special_instructions TEXT;
        ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS rating JSONB;
        ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS reported_issue JSONB;

        ALTER TABLE public.users ADD COLUMN IF NOT EXISTS academic_category TEXT;
        ALTER TABLE public.users ADD COLUMN IF NOT EXISTS department TEXT;
        ALTER TABLE public.users ADD COLUMN IF NOT EXISTS semester TEXT;
        ALTER TABLE public.users ADD COLUMN IF NOT EXISTS section TEXT;
        ALTER TABLE public.users ADD COLUMN IF NOT EXISTS hostel_building TEXT;
        ALTER TABLE public.users ADD COLUMN IF NOT EXISTS room_number TEXT;
        ALTER TABLE public.users ADD COLUMN IF NOT EXISTS branch_id TEXT;

        ALTER TABLE public.menu_items ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 50;
        ALTER TABLE public.menu_items ADD COLUMN IF NOT EXISTS preparation_time_minutes INTEGER DEFAULT 10;
        ALTER TABLE public.menu_items ADD COLUMN IF NOT EXISTS is_veg BOOLEAN DEFAULT TRUE;
        ALTER TABLE public.menu_items ADD COLUMN IF NOT EXISTS branch_availability JSONB DEFAULT '["Main Canteen", "Hostel Canteen", "Block B Canteen"]'::jsonb;
        ALTER TABLE public.menu_items ADD COLUMN IF NOT EXISTS ingredients TEXT;
        ALTER TABLE public.menu_items ADD COLUMN IF NOT EXISTS allergy_info TEXT;

        GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
      `);

      pgClient.release();
      isSupabaseReady = true;
      console.log('✅ Supabase tables verified and ready!');
      return true;
    } catch (pgErr: any) {
      console.warn('Postgres direct pool warning:', pgErr.message);
      // Fallback: test via supabase REST client
      const { data, error } = await supabaseClient.from('menu_items').select('id').limit(1);
      if (!error) {
        isSupabaseReady = true;
        console.log('✅ Supabase REST Client connected successfully!');
        return true;
      } else {
        console.warn('Supabase REST test error:', error.message);
      }
    }

    return isSupabaseReady;
  } catch (err: any) {
    console.error('Failed to initialize Supabase:', err);
    return false;
  }
}

// Helpers to map between Supabase DB rows and App models
export function mapUserFromDb(row: any): IUser {
  return {
    _id: row.id,
    name: row.name,
    studentId: row.student_id || '',
    email: row.email,
    password: row.password,
    phone: row.phone || '',
    course: row.course || 'BCA',
    year: row.year || '3rd Year',
    studentType: row.student_type || 'Degree',
    role: row.role || 'student',
    academicCategory: row.academic_category,
    department: row.department,
    semester: row.semester,
    section: row.section,
    hostelBuilding: row.hostel_building,
    roomNumber: row.room_number,
    branchId: row.branch_id,
    createdAt: new Date(row.created_at || Date.now()),
  };
}

export function mapUserToDb(user: Partial<IUser> & { _id?: string }) {
  const row: any = {};
  if (user._id) row.id = user._id;
  if (user.name !== undefined) row.name = user.name;
  if (user.studentId !== undefined) row.student_id = user.studentId;
  if (user.email !== undefined) row.email = user.email.toLowerCase().trim();
  if (user.password !== undefined) row.password = user.password;
  if (user.phone !== undefined) row.phone = user.phone;
  if (user.course !== undefined) row.course = user.course;
  if (user.year !== undefined) row.year = user.year;
  if (user.studentType !== undefined) row.student_type = user.studentType;
  if (user.role !== undefined) row.role = user.role;
  if (user.academicCategory !== undefined) row.academic_category = user.academicCategory;
  if (user.department !== undefined) row.department = user.department;
  if (user.semester !== undefined) row.semester = user.semester;
  if (user.section !== undefined) row.section = user.section;
  if (user.hostelBuilding !== undefined) row.hostel_building = user.hostelBuilding;
  if (user.roomNumber !== undefined) row.room_number = user.roomNumber;
  if (user.branchId !== undefined) row.branch_id = user.branchId;
  return row;
}

export function mapMenuFromDb(row: any): IMenuItem {
  let branches = row.branch_availability;
  if (typeof branches === 'string') {
    try { branches = JSON.parse(branches); } catch (e) { branches = ['Main Canteen']; }
  }
  return {
    _id: row.id,
    name: row.name,
    description: row.description || '',
    price: Number(row.price),
    image: row.image || '',
    category: row.category || 'Meals',
    available: row.available ?? true,
    isTodaySpecial: row.is_today_special ?? false,
    date: row.date || new Date().toISOString().split('T')[0],
    stockQuantity: row.stock_quantity ?? 50,
    preparationTimeMinutes: row.preparation_time_minutes ?? 10,
    isVeg: row.is_veg ?? true,
    branchAvailability: branches || ['Main Canteen', 'Hostel Canteen', 'Block B Canteen'],
    ingredients: row.ingredients,
    allergyInfo: row.allergy_info,
    createdAt: new Date(row.created_at || Date.now()),
  };
}

export function mapMenuToDb(item: Partial<IMenuItem> & { _id?: string }) {
  const row: any = {};
  if (item._id) row.id = item._id;
  if (item.name !== undefined) row.name = item.name;
  if (item.description !== undefined) row.description = item.description;
  if (item.price !== undefined) row.price = Number(item.price);
  if (item.image !== undefined) row.image = item.image;
  if (item.category !== undefined) row.category = item.category;
  if (item.available !== undefined) row.available = item.available;
  if (item.isTodaySpecial !== undefined) row.is_today_special = item.isTodaySpecial;
  if (item.date !== undefined) row.date = item.date;
  if (item.stockQuantity !== undefined) row.stock_quantity = item.stockQuantity;
  if (item.preparationTimeMinutes !== undefined) row.preparation_time_minutes = item.preparationTimeMinutes;
  if (item.isVeg !== undefined) row.is_veg = item.isVeg;
  if (item.branchAvailability !== undefined) row.branch_availability = item.branchAvailability;
  if (item.ingredients !== undefined) row.ingredients = item.ingredients;
  if (item.allergyInfo !== undefined) row.allergy_info = item.allergyInfo;
  return row;
}

export function mapOrderFromDb(row: any): IOrder {
  let items = row.items;
  if (typeof items === 'string') {
    try {
      items = JSON.parse(items);
    } catch (e) {
      items = [];
    }
  }
  let deliveryLocation = row.delivery_location;
  if (typeof deliveryLocation === 'string') {
    try { deliveryLocation = JSON.parse(deliveryLocation); } catch (e) { deliveryLocation = undefined; }
  }
  let rating = row.rating;
  if (typeof rating === 'string') {
    try { rating = JSON.parse(rating); } catch (e) { rating = undefined; }
  }
  let reportedIssue = row.reported_issue;
  if (typeof reportedIssue === 'string') {
    try { reportedIssue = JSON.parse(reportedIssue); } catch (e) { reportedIssue = undefined; }
  }

  return {
    _id: row.id,
    orderId: row.order_id,
    tokenNumber: Number(row.token_number),
    userId: row.user_id,
    studentName: row.student_name,
    studentId: row.student_id || '',
    items: items || [],
    totalAmount: Number(row.total_amount),
    foodAmount: row.food_amount ? Number(row.food_amount) : Number(row.total_amount),
    deliveryFee: row.delivery_fee ? Number(row.delivery_fee) : 0,
    discountAmount: row.discount_amount ? Number(row.discount_amount) : 0,
    couponCode: row.coupon_code || undefined,
    orderType: row.order_type || 'PICKUP',
    pickupSlot: row.pickup_slot || undefined,
    deliveryLocation: deliveryLocation || undefined,
    branch: row.branch || 'Main Canteen',
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    orderStatus: row.order_status,
    deliveryStatus: row.delivery_status || 'PENDING',
    specialInstructions: row.special_instructions || '',
    transactionId: row.transaction_id || '',
    notes: row.notes || '',
    rating: rating || undefined,
    reportedIssue: reportedIssue || undefined,
    createdAt: new Date(row.created_at || Date.now()),
    updatedAt: new Date(row.updated_at || Date.now()),
  };
}

export function mapOrderToDb(order: Partial<IOrder> & { _id?: string }) {
  const row: any = {};
  if (order._id) row.id = order._id;
  if (order.orderId !== undefined) row.order_id = order.orderId;
  if (order.tokenNumber !== undefined) row.token_number = order.tokenNumber;
  if (order.userId !== undefined) row.user_id = order.userId;
  if (order.studentName !== undefined) row.student_name = order.studentName;
  if (order.studentId !== undefined) row.student_id = order.studentId;
  if (order.items !== undefined) row.items = order.items;
  if (order.totalAmount !== undefined) row.total_amount = Number(order.totalAmount);
  if (order.foodAmount !== undefined) row.food_amount = Number(order.foodAmount);
  if (order.deliveryFee !== undefined) row.delivery_fee = Number(order.deliveryFee);
  if (order.discountAmount !== undefined) row.discount_amount = Number(order.discountAmount);
  if (order.couponCode !== undefined) row.coupon_code = order.couponCode;
  if (order.orderType !== undefined) row.order_type = order.orderType;
  if (order.pickupSlot !== undefined) row.pickup_slot = order.pickupSlot;
  if (order.deliveryLocation !== undefined) row.delivery_location = order.deliveryLocation;
  if (order.branch !== undefined) row.branch = order.branch;
  if (order.paymentMethod !== undefined) row.payment_method = order.paymentMethod;
  if (order.paymentStatus !== undefined) row.payment_status = order.paymentStatus;
  if (order.orderStatus !== undefined) row.order_status = order.orderStatus;
  if (order.deliveryStatus !== undefined) row.delivery_status = order.deliveryStatus;
  if (order.specialInstructions !== undefined) row.special_instructions = order.specialInstructions;
  if (order.transactionId !== undefined) row.transaction_id = order.transactionId;
  if (order.notes !== undefined) row.notes = order.notes;
  if (order.rating !== undefined) row.rating = order.rating;
  if (order.reportedIssue !== undefined) row.reported_issue = order.reportedIssue;
  if (order.updatedAt !== undefined) row.updated_at = new Date(order.updatedAt).toISOString();
  return row;
}

export function mapPaymentFromDb(row: any): IPayment {
  return {
    _id: row.id,
    orderId: row.order_id,
    amount: Number(row.amount),
    method: row.method,
    status: row.status,
    transactionId: row.transaction_id || '',
    createdAt: new Date(row.created_at || Date.now()),
  };
}

export function mapPaymentToDb(p: Partial<IPayment> & { _id?: string }) {
  const row: any = {};
  if (p._id) row.id = p._id;
  if (p.orderId !== undefined) row.order_id = p.orderId;
  if (p.amount !== undefined) row.amount = Number(p.amount);
  if (p.method !== undefined) row.method = p.method;
  if (p.status !== undefined) row.status = p.status;
  if (p.transactionId !== undefined) row.transaction_id = p.transactionId;
  return row;
}

export function mapNotificationFromDb(row: any): INotification {
  return {
    _id: row.id,
    userId: row.user_id,
    orderId: row.order_id || '',
    message: row.message,
    type: row.type,
    read: row.read ?? false,
    createdAt: new Date(row.created_at || Date.now()),
  };
}

export function mapNotificationToDb(n: Partial<INotification> & { _id?: string }) {
  const row: any = {};
  if (n._id) row.id = n._id;
  if (n.userId !== undefined) row.user_id = n.userId;
  if (n.orderId !== undefined) row.order_id = n.orderId;
  if (n.message !== undefined) row.message = n.message;
  if (n.type !== undefined) row.type = n.type;
  if (n.read !== undefined) row.read = n.read;
  return row;
}
