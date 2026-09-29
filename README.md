# 🍱 ONLINE CANTEEN CENTER
### Smart Campus Food Ordering, Queue Management & Delivery System
> *"Order Smart. Skip the Queue. Zero Food Waste."*

[![React 19](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Express.js](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Supabase](https://img.shields.io/badge/Database-Supabase%20PostgreSQL-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 📌 Project Overview

**Online Canteen Center** is a full-stack campus food-tech platform engineered to eliminate rush-hour canteen queues, streamline multi-branch cafeteria operations, manage kitchen prep times, and offer students pre-scheduled time-slot pickup and hostel room delivery.

Built for modern college campuses, this system operates with 6 distinct user roles, real-time order tracking, UPI QR Code Scan & Pay, and an intelligent food surplus & waste reduction engine.

---

## 🚀 Key Features

### 🎓 1. Student Portal
- **Smart Menu Catalog (19+ Authentic Dishes):** Categorized into Breakfast, Lunch, Meals, Snacks, Fast Food, Beverages, Healthy Food, and Desserts with authentic high-resolution food photography.
- **Designated Lunch Slot Reservation:**
  - **Degree Students (BCA, BBA, B.Com, B.Tech, B.Sc):** 1:00 PM – 1:30 PM (10-min arrival slots to balance kitchen load).
  - **Master's Students (MCA, MBA, M.Tech, M.Sc):** 1:30 PM – 2:00 PM.
- **Dual Delivery Modes:**
  - 🏃 **Counter Pickup:** Assigned 10-minute slot with instant digital QR token.
  - 🛵 **Hostel Room Delivery:** Select building (Hostel A, Hostel B, Tech Block), floor, and room number.
- **Live Real-Time Order Tracking:** 5 progressive states:
  $$\text{CONFIRMED} \longrightarrow \text{PREPARING} \longrightarrow \text{READY} \longrightarrow \text{OUT FOR DELIVERY / PICKUP} \longrightarrow \text{DELIVERED / COLLECTED}$$
  - Audio chimes and celebration confetti trigger automatically when the order is ready!
- **UPI QR Code & Cashless Payment:** Seamless Scan & Pay with Google Pay, PhonePe, Paytm, or BHIM UPI, plus "Pay at Canteen" option.
- **Campus Coupons & Deals:** Integrated promo codes (`WELCOME10`, `BCA10`, `FREEDEL`, `SNACK20`).
- **Student Profile & Order History:** Detailed receipts, one-click re-ordering, food ratings, and expense tracking.

---

### 👨‍🍳 2. Operator & Kitchen Portal
- **Live Order Stream:** Real-time synchronization across counters and kitchens.
- **Time-Slot Queue Breakdown:** Visual breakdown of orders per 10-minute pickup window for efficient batch cooking.
- **One-Click Kitchen Controls:** Transition orders from Confirmed $\to$ Preparing $\to$ Ready $\to$ Collected.
- **Menu & Stock Manager:** Real-time price updates, availability toggling (In Stock / Sold Out), and Today's Specials curation.
- **Live KDS (Kitchen Display System):** Dedicated prep timer countdowns and ingredient prep checklists.

---

### 🛵 3. Delivery Agent Portal
- **Hostel Room Delivery Dispatch:** View pending deliveries with destination hostel block, floor, and room number.
- **Live Status Toggles:** Mark orders as `ASSIGNED` $\to$ `OUT_FOR_DELIVERY` $\to$ `DELIVERED`.
- **Student Contact & Navigation:** Quick directions and direct calling shortcuts.

---

### 🏢 4. Multi-Branch & Waste Management
- **Multi-Branch Network:**
  - 📍 Main Campus Canteen (Central Academic Block)
  - 📍 Hostel Canteen (Hostel Quadrangle)
  - 📍 Block B Canteen (Tech & Science Block)
  - 📍 Evening Snacks Counter (Campus Lawn)
- **Inter-Branch Stock Transfers:** Balance surplus items between high-rush and low-stock counters.
- **Food Waste Reduction Engine:** Log surplus food at end-of-day, apply dynamic clearance discounts, and generate sustainability metrics.

---

### 🛡️ 5. Super Admin & Governance
- **Executive Analytics:** Real-time revenue charts, peak rush hours, top-selling items, and departmental consumption statistics.
- **User Role Management:** Assign roles (Student, Operator, Kitchen Staff, Delivery Agent, Branch Manager, Admin).
- **System Audit Logs:** Immutable security trail recording every order state change, menu update, and financial transaction.

---

## 🛠️ Architecture & Tech Stack

```
┌────────────────────────────────────────────────────────┐
│                   Vite + React 19 Frontend             │
│   (TypeScript • Tailwind CSS • Lucide Icons • Canvas)   │
└───────────────────────────┬────────────────────────────┘
                            │ REST API / JSON
┌───────────────────────────▼────────────────────────────┐
│                  Express.js Backend Server             │
│   (Node.js • JWT Auth • Role-Based Access Control)     │
└───────────────────────────┬────────────────────────────┘
                            │ PostgreSQL Queries
┌───────────────────────────▼────────────────────────────┐
│               Supabase Cloud Database                  │
│   (Tables: users, menu_items, orders, branches, logs)  │
│   + Local JSON Persistent Storage Fallback Engine      │
└────────────────────────────────────────────────────────┘
```

- **Frontend:** React 19, TypeScript, Tailwind CSS, Lucide React, Canvas Confetti.
- **Backend:** Node.js, Express.js, TypeScript (`tsx`).
- **Database:** Supabase PostgreSQL with automated schema migration and local persistence fallback.
- **Security:** JWT authentication, bcrypt password hashing, input sanitization, and strict Role-Based Access Control (RBAC).

---

## 🔑 Demo Login Credentials

For quick evaluation, click the demo buttons on the login screen or use these credentials:

| Role | Email | Password | Assigned Area / Details |
| :--- | :--- | :--- | :--- |
| 🎓 **Degree Student** | `rahul@campus.edu` | `student123` | BCA 3rd Year (Lunch: 1:00–1:30 PM) |
| 🎓 **Master's Student** | `priya@campus.edu` | `student123` | MCA 1st Year (Lunch: 1:30–2:00 PM) |
| 👨‍🍳 **Canteen Operator** | `operator@campus.edu` | `admin123` | Main Canteen Counter |
| 🍳 **Kitchen Staff** | `kitchen@campus.edu` | `kitchen123` | Central Cooking Section |
| 🛵 **Delivery Agent** | `delivery@campus.edu` | `delivery123` | Campus & Hostel Delivery Fleet |
| 🏢 **Branch Manager** | `branch@campus.edu` | `branch123` | Block B & Hostel Canteens |
| 🛡️ **Super Admin** | `admin@campus.edu` | `admin123` | Campus Food Directorate |

---

## 🏃 How to Run Locally

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or higher)
- [npm](https://www.npmjs.com/) or [bun](https://bun.sh/)

### 1. Clone the Repository
```bash
git clone https://github.com/<your-username>/<repo-name>.git
cd <repo-name>
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy the example file:
```bash
cp .env.example .env
```
Default `.env` configuration:
```env
PORT=3000
JWT_SECRET=campus_canteen_jwt_secret_dev_key_2026
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your_supabase_anon_key"
SUPABASE_SERVICE_ROLE_KEY="your_supabase_service_role_key"
DATABASE_URL="postgres://postgres:password@db.your-project.supabase.co:5432/postgres"
```
*(Note: If Supabase keys are not configured, the built-in local JSON database automatically activates, ensuring 100% offline functionality without external configuration!)*

### 4. Start Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser!

### 5. Build for Production
```bash
npm run build
npm start
```

---

## 🧪 Quick 2-Tab Demonstration Guide

To see the real-time queue in action:

1. **Tab 1 (Student View):**
   - Log in as **Rahul** (`rahul@campus.edu` / `student123`).
   - Add **Masala Dosa (₹50)** and **Cold Coffee (₹40)** to your cart.
   - Choose pickup slot `1:10 PM – 1:20 PM`.
   - Select **Online Payment**, review the UPI QR, and click **Place Order**.
   - Your order token (e.g. **#105**) will appear with live status `CONFIRMED`.

2. **Tab 2 (Operator View):**
   - Open an incognito tab or second browser window.
   - Log in as **Operator** (`operator@campus.edu` / `admin123`).
   - Order **#105** appears instantly on the Live Orders board.
   - Click **PREPARING** $\to$ Student's Tab 1 changes to *PREPARING*.
   - Click **READY** $\to$ Student's Tab 1 rings an audio chime and triggers celebration confetti!
   - Operator clicks **COLLECTED** $\to$ Receipt is stamped completed.

---

## 📂 Project Structure

```
├── public/                 # Static assets, logos, dish photos
├── server/
│   ├── routes/             # Express API routes (auth, orders, menu, waste, branches)
│   ├── db.ts               # Local DB & Supabase integration
│   ├── models.ts           # Data interfaces and models
│   └── supabase.ts         # Supabase client connector
├── src/
│   ├── components/
│   │   ├── student/        # Student Catalog, Cart, Payment, Tracking, History
│   │   ├── operator/       # Live Orders, Menu Manager, Queue Slot Breakdown
│   │   ├── kitchen/        # Kitchen Display System (KDS)
│   │   ├── delivery/       # Hostel Room Delivery Dashboard
│   │   ├── branch/         # Multi-branch inventory & transfer
│   │   ├── admin/          # Revenue analytics, audit trail, user RBAC
│   │   └── common/         # QR Code, Header, Notifications, Logo
│   ├── context/            # AuthContext & CartContext
│   ├── services/api.ts     # Client REST API service
│   ├── types.ts            # TypeScript definitions
│   └── App.tsx             # Main App root & routing
├── server.ts               # Express + Vite dev server entry point
└── package.json            # Scripts & project dependencies
```

---

## 👨‍💻 Developer & Author

<div align="center">

### **Srinivas VM**
🎓 *Second Year BCA Student | Full-Stack & AI/ML Enthusiast*

[![GitHub](https://img.shields.io/badge/GitHub-srinivasvm1122--web-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/srinivasvm1122-web)
[![Email](https://img.shields.io/badge/Email-srinivasvm1122%40gmail.com-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:srinivasvm1122@gmail.com)
[![Status](https://img.shields.io/badge/Focus-Full--Stack%20%7C%20Python%20%7C%20AI%2FML-blueviolet?style=for-the-badge)](https://github.com/srinivasvm1122-web)

</div>

- 🎓 **Education:** Second year BCA student
- 💻 **Learning Journey:** Currently mastering Full-Stack Development, Python & AI/ML
- 🤖 **Interests:** Machine Learning, Deep Learning, and building high-performance web applications
- 📈 **Daily Focus:** Solving real-world problems and improving programming skills daily
- 📁 **GitHub Portfolio:** [@srinivasvm1122-web](https://github.com/srinivasvm1122-web) — sharing open-source projects, code, and continuous learning
- 📬 **Get in touch:** Feel free to connect via [Email](mailto:srinivasvm1122@gmail.com) or explore my other repositories!

---

## 📄 License
This project is open-source and available under the **MIT License**.
