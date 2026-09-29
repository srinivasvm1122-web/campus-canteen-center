import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { CartProvider, useCart } from './context/CartContext.tsx';
import { Header } from './components/Header.tsx';
import { LandingHero } from './components/LandingHero.tsx';
import { MenuCatalog } from './components/student/MenuCatalog.tsx';
import { CartModal } from './components/student/CartModal.tsx';
import { PaymentModal } from './components/student/PaymentModal.tsx';
import { OrderConfirmationModal } from './components/student/OrderConfirmationModal.tsx';
import { OrderTrackingView } from './components/student/OrderTrackingView.tsx';
import { OrderHistoryView } from './components/student/OrderHistoryView.tsx';
import { StudentProfileView } from './components/student/StudentProfileView.tsx';
import { OperatorDashboard } from './components/operator/OperatorDashboard.tsx';
import { KitchenDashboard } from './components/kitchen/KitchenDashboard.tsx';
import { DeliveryDashboard } from './components/delivery/DeliveryDashboard.tsx';
import { BranchManagerDashboard } from './components/branch/BranchManagerDashboard.tsx';
import { AdminDashboard } from './components/admin/AdminDashboard.tsx';
import { IOrder, UserRole } from './types.ts';

function MainApp() {
  const { user, isLoading, login } = useAuth();
  const [activeTab, setActiveTab] = useState<'menu' | 'tracking' | 'history' | 'profile'>('menu');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<IOrder | null>(null);
  const [highlightOrderId, setHighlightOrderId] = useState<string | undefined>(undefined);

  // Quick Portal Switcher for BCA project live demonstration
  const handleSwitchPortal = async (targetRole: UserRole) => {
    try {
      if (targetRole === 'operator') {
        await login({ email: 'srinivasvm1122@gmail.com', password: '810522', expectedRole: 'operator' });
      } else if (targetRole === 'kitchen') {
        await login({ email: 'kitchen@campus.edu', password: 'kitchen123', expectedRole: 'operator' });
      } else if (targetRole === 'delivery') {
        await login({ email: 'delivery@campus.edu', password: 'delivery123', expectedRole: 'operator' });
      } else if (targetRole === 'branch_manager') {
        await login({ email: 'manager@campus.edu', password: 'manager123', expectedRole: 'operator' });
      } else if (targetRole === 'admin') {
        await login({ email: 'admin@campus.edu', password: 'admin123', expectedRole: 'operator' });
      } else {
        await login({ email: 'rahul@campus.edu', password: 'student123', expectedRole: 'student' });
        setActiveTab('menu');
      }
    } catch (e) {
      console.error('Portal switch error:', e);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-bold tracking-wider text-cyan-300">
          INITIALIZING SMART CANTEEN SYSTEM...
        </p>
      </div>
    );
  }

  // Not logged in -> Show Landing / Login Hero with College photo
  if (!user) {
    return <LandingHero />;
  }

  const role = user.role || 'student';
  const isStudent = role === 'student';

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 font-sans flex flex-col justify-between">
      {/* Top Navbar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab as any}
        onOpenCart={() => setIsCartOpen(true)}
        onSelectOrder={(orderId) => {
          setHighlightOrderId(orderId);
          setActiveTab('tracking');
        }}
        onSwitchPortal={handleSwitchPortal}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {role === 'operator' && (
          <OperatorDashboard onSwitchPortal={handleSwitchPortal} />
        )}
        {role === 'kitchen' && (
          <KitchenDashboard />
        )}
        {role === 'delivery' && (
          <DeliveryDashboard />
        )}
        {role === 'branch_manager' && (
          <BranchManagerDashboard />
        )}
        {role === 'admin' && (
          <AdminDashboard />
        )}
        {isStudent && (
          <>
            {activeTab === 'menu' && (
              <MenuCatalog onOpenCart={() => setIsCartOpen(true)} />
            )}
            {activeTab === 'tracking' && (
              <OrderTrackingView
                highlightOrderId={highlightOrderId}
                onExploreMenu={() => setActiveTab('menu')}
              />
            )}
            {activeTab === 'history' && <OrderHistoryView />}
            {activeTab === 'profile' && <StudentProfileView />}
          </>
        )}
      </main>

      {/* Student Cart Modal */}
      {isStudent && (
        <CartModal
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          onProceedToCheckout={() => {
            setIsCartOpen(false);
            setIsPaymentOpen(true);
          }}
        />
      )}

      {/* Student Payment & Checkout Modal */}
      {isStudent && (
        <PaymentModal
          isOpen={isPaymentOpen}
          onClose={() => setIsPaymentOpen(false)}
          onOrderSuccess={(order) => {
            setIsPaymentOpen(false);
            setConfirmedOrder(order);
          }}
        />
      )}

      {/* Order Confirmed Ticket Modal */}
      {isStudent && (
        <OrderConfirmationModal
          order={confirmedOrder}
          onClose={() => setConfirmedOrder(null)}
          onTrackOrder={() => {
            setConfirmedOrder(null);
            setActiveTab('tracking');
          }}
        />
      )}

      {/* Mobile Bottom Navigation for Students */}
      {isStudent && (
        <nav className="md:hidden sticky bottom-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-2 flex items-center justify-around shadow-lg">
          <button
            onClick={() => setActiveTab('menu')}
            className={`flex flex-col items-center text-[10px] font-bold ${
              activeTab === 'menu' ? 'text-blue-700' : 'text-slate-400'
            }`}
          >
            <span className="text-base">🍽️</span>
            <span>Menu</span>
          </button>

          <button
            onClick={() => setActiveTab('tracking')}
            className={`flex flex-col items-center text-[10px] font-bold relative ${
              activeTab === 'tracking' ? 'text-blue-700' : 'text-slate-400'
            }`}
          >
            <span className="text-base">📦</span>
            <span>Tracking</span>
            <span className="absolute top-0 right-1 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex flex-col items-center text-[10px] font-bold ${
              activeTab === 'history' ? 'text-blue-700' : 'text-slate-400'
            }`}
          >
            <span className="text-base">📜</span>
            <span>Orders</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center text-[10px] font-bold ${
              activeTab === 'profile' ? 'text-blue-700' : 'text-slate-400'
            }`}
          >
            <span className="text-base">👤</span>
            <span>Profile</span>
          </button>
        </nav>
      )}

      {/* Global Minimal Footer */}
      <footer className="w-full py-4 text-center text-xs text-slate-500 border-t border-slate-200 bg-white">
        <p>
          Online Canteen Center • Smart Campus Dining & Digital Token System • Hackathon Project Demo
        </p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <MainApp />
      </CartProvider>
    </AuthProvider>
  );
}
