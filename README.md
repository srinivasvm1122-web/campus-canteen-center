# VIMTECH CANTEEN CENTER
### Smart College Canteen Management System
**College:** Vaisiri Institute of Management and Technology (VIMTECH)  
**Tagline:** *"Order Smart. Skip the Queue."*

---

## 📌 Project Overview
VIMTECH Canteen Center is a full-stack web application designed and built for **Vaisiri Institute of Management and Technology (VIMTECH)** to eliminate lunch-hour congestion, streamline cafeteria food preparation, and give students a smooth digital pre-ordering experience with designated lunch timing slots and live token tracking.

The system features two interconnected real-time portals:
1. **Student Portal:** Browse daily menu, add Karnataka canteen favorites to cart, choose assigned lunch pickup slots, complete demo payments, and track live order status from kitchen preparation to pickup counter.
2. **Operator Portal:** Kitchen and counter operations dashboard with live incoming orders, sequential token management, one-click order status dispatch, crowd queue balancing, food inventory control, and revenue analytics.

---

## 🚀 Key Features

### 🎓 Student Portal
- **Campus Hero & Authentication:** Visual hero landing with the VIMTECH campus building background, secure JWT authentication with bcrypt password hashing, and role separation.
- **Student Registration:** Supports Degree and Master's student profiles with Course (BCA, BBA, B.Com, MCA, MBA) and Year.
- **Designated Lunch Timings & Crowd Management:**
  - **Degree Students:** 1:00 PM – 1:30 PM (Slots: 1:00–1:10 PM, 1:10–1:20 PM, 1:20–1:30 PM)
  - **Master's Students:** 1:30 PM – 2:00 PM (Slots: 1:30–1:40 PM, 1:40–1:50 PM, 1:50–2:00 PM)
  - *Strict system enforcement:* Prevents students from selecting the wrong lunch window.
- **Authentic Karnataka Canteen Menu:** Bisibele Bath (₹40), Masala Dosa (₹50), Idli (₹30), Sambar Rice (₹35), Curd Rice (₹30), Lemon Rice (₹35), Tea (₹15), Coffee (₹20), and more.
- **Smart Cart & Interactive Checkout:** Dynamic quantity steppers, slot picker, and kitchen notes.
- **Payment Options:**
  - **Online Payment:** Interactive demo UPI QR code / instant sandbox verification (Payment Status: `PAID`).
  - **Pay at Canteen:** Counter cash / POS (Payment Status: `PENDING`).
- **Live Real-Time Order Tracking:** Four clear progression states:
  $$\text{CONFIRMED} \longrightarrow \text{PREPARING} \longrightarrow \text{READY} \longrightarrow \text{COLLECTED}$$
  - Pleasant audio chime, notification badge, and visual toast when operator marks the order `READY`!
- **Notification Center:** Real-time bell notifications dropdown with unread count.
- **Order History & Profile Management:** Search and filter past receipts, view total spending, and update academic details.

### 👨‍🍳 Operator Portal
- **Real-Time Order Stream:** Instant sync across browser tabs using Server-Sent Events (SSE) and live polling.
- **Live Order Management Table:** Shows Token number, Order ID, Student Name, Student ID, Items & Quantities, Bill Amount, Pickup Slot, Payment Status, and Order Time.
- **One-Click Kitchen Controls:** Transition orders between `CONFIRMED`, `PREPARING`, `READY`, and `COLLECTED`.
- **Queue & Rush Balancing:** Breakdown of active orders per 10-minute pickup slot (e.g. 1:00–1:10 PM, 1:10–1:20 PM, 1:20–1:30 PM) to help kitchen staff batch cook efficiently.
- **Menu & Stock Management:** Add new dishes, adjust prices, edit descriptions, toggle stock availability (In Stock / Sold Out), and highlight Today's Specials.
- **Business & Rush Analytics:** Real-time KPI summary cards (Today's Sales, Total Orders, Pending, Preparing, Ready, Completed) and top food item popularity charts.

---

## 🛠️ Tech Stack
- **Frontend:** React 19, TypeScript, Tailwind CSS, Lucide React icons, Canvas Confetti.
- **Backend:** Node.js, Express 4, REST API, Server-Sent Events (SSE).
- **Authentication:** JSON Web Tokens (JWT), bcryptjs password hashing.
- **Database:** MongoDB Atlas (Mongoose ODM) with built-in persistent storage fallback for instant evaluation.
- **Environment:** dotenv.

---

## ⚡ Supabase Setup & Configuration

The application is configured to connect directly to Supabase (`qnfoycxcalvdczhtgpxj.supabase.co`).

1. Tables are automatically provisioned in PostgreSQL (`users`, `menu_items`, `orders`, `payments`, `notifications`, `counters`).
2. Add your Supabase credentials to `.env`:
   ```bash
   SUPABASE_URL="https://qnfoycxcalvdczhtgpxj.supabase.co"
   SUPABASE_ANON_KEY="..."
   SUPABASE_SERVICE_ROLE_KEY="..."
   DATABASE_URL="postgres://postgres:password@db.qnfoycxcalvdczhtgpxj.supabase.co:5432/postgres"
   JWT_SECRET="your_secret_jwt_key"
   PORT=3000
   ```

---

## ⚙️ Environment Variables (.env)
```env
PORT=3000
JWT_SECRET=vimtech_canteen_jwt_secret_dev_key_2026
SUPABASE_URL="https://qnfoycxcalvdczhtgpxj.supabase.co"
SUPABASE_ANON_KEY="your_anon_key"
SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"
DATABASE_URL="postgres://postgres:password@db.qnfoycxcalvdczhtgpxj.supabase.co:5432/postgres"
```

---

## 🏃 How to Run the Application

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Full-Stack Application
Runs both Express backend and Vite frontend on `http://localhost:3000`:
```bash
npm run dev
```

### 3. Build for Production
```bash
npm run build
npm start
```

---

## 🔑 Demo Credentials for Testing & Evaluation

### 🎓 Demo Student 1 (Degree Student - Rahul)
- **Email:** `rahul@vimtech.edu`
- **Password:** `student123`
- **Course & Year:** BCA 3rd Year
- **Student ID:** `VIM2024BCA104`
- **Assigned Lunch Window:** 1:00 PM – 1:30 PM

### 🎓 Demo Student 2 (Master's Student - Priya)
- **Email:** `priya@vimtech.edu`
- **Password:** `student123`
- **Course & Year:** MCA 1st Year
- **Student ID:** `VIM2025MCA018`
- **Assigned Lunch Window:** 1:30 PM – 2:00 PM

### 👨‍🍳 Demo Canteen Operator (Kitchen Counter Desk)
- **Email:** `operator@vimtech.edu`
- **Password:** `admin123`
- **Role:** Canteen Operator

*(Quick 1-Click login buttons are also provided on the login page for effortless live presentations!)*

---

## 🧪 Live Two-Tab Demonstration Flow

Open two browser tabs on the same computer:

1. **Tab 1: Student Portal**
   - Log in as Rahul (`rahul@vimtech.edu` / `student123`).
   - Add **Bisibele Bath × 2** (₹80) and **Coffee × 1** (₹20).
   - Select pickup slot `1:10 PM – 1:20 PM`.
   - Choose **Online Payment** and click **Place Order**.
   - Notice Token **#104** generated with the Golden Ticket!
2. **Tab 2: Operator Portal**
   - Log in as Operator (`operator@vimtech.edu` / `admin123`).
   - Order **#104** appears immediately on the Live Orders board.
   - Click **PREPARING** $\rightarrow$ Student Tab 1 updates to *PREPARING*.
   - Click **READY** $\rightarrow$ Student Tab 1 rings a chime, fires celebration confetti, and displays:  
     `🔔 Your order #104 is ready for pickup!`
   - Student collects food at Counter 1.
   - Operator clicks **COLLECTED** $\rightarrow$ Order completed!
