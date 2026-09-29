import React, { useState, useEffect } from 'react';
import {
  UtensilsCrossed,
  ChefHat,
  Clock,
  CheckCircle2,
  BellRing,
  PackageCheck,
  Search,
  Filter,
  DollarSign,
  TrendingUp,
  RefreshCw,
  Plus,
  Edit2,
  Trash2,
  Eye,
  AlertCircle,
  Database,
  BarChart3,
  Users,
  Layers,
  Sparkles,
  Star
} from 'lucide-react';
import { IOrder, IMenuItem, IAnalytics } from '../../types.ts';
import { api } from '../../services/api.ts';
import { MenuManagerModal } from './MenuManagerModal.tsx';
import { QueueSlotBreakdown } from './QueueSlotBreakdown.tsx';
import { getFoodImage } from '../../utils/foodImages.ts';
import confetti from 'canvas-confetti';

interface OperatorDashboardProps {
  onSwitchPortal?: (targetRole: 'student' | 'operator') => void;
}

export const OperatorDashboard: React.FC<OperatorDashboardProps> = ({ onSwitchPortal }) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'queue' | 'menu' | 'analytics'>('orders');
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [menuItems, setMenuItems] = useState<IMenuItem[]>([]);
  const [analytics, setAnalytics] = useState<IAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [slotFilter, setSlotFilter] = useState('ALL');
  const [paymentFilter, setPaymentFilter] = useState('ALL');

  // Menu Modal State
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState<IMenuItem | null>(null);

  // Status updating feedback
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [newOrderAlert, setNewOrderAlert] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [ordersData, menuData, analyticsData] = await Promise.all([
        api.getOrders({
          status: statusFilter,
          pickupSlot: slotFilter,
          paymentStatus: paymentFilter,
          search,
        }),
        api.getMenu(),
        api.getAnalytics(),
      ]);

      setOrders(ordersData);
      setMenuItems(menuData);
      setAnalytics(analyticsData);
    } catch (e) {
      console.error('Operator data fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);

    // Listen for real-time SSE events
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/events');
      eventSource.addEventListener('order_created', (e: MessageEvent) => {
        try {
          const newOrder = JSON.parse(e.data);
          setNewOrderAlert(`🔔 New Order #${newOrder.tokenNumber} arrived from ${newOrder.studentName}!`);
          fetchData();
        } catch (err) {}
      });
      eventSource.addEventListener('order_status_updated', () => {
        fetchData();
      });
    } catch (err) {}

    return () => {
      clearInterval(interval);
      if (eventSource) eventSource.close();
    };
  }, [statusFilter, slotFilter, paymentFilter, search]);

  const handleUpdateStatus = async (orderId: string, newStatus: IOrder['orderStatus']) => {
    setUpdatingId(orderId);
    try {
      const res = await api.updateOrderStatus(orderId, newStatus);
      // Immediately reflect in local state
      setOrders(prev =>
        prev.map(ord => (ord._id === orderId || ord.orderId === orderId ? res.order : ord))
      );
      if (newStatus === 'READY') {
        try {
          confetti({ particleCount: 50, spread: 50 });
        } catch (e) {}
      }
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteMenuItem = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete '${name}' from today's menu?`)) {
      return;
    }
    try {
      await api.deleteMenuItem(id);
      setMenuItems(prev => prev.filter(m => m._id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete menu item');
    }
  };

  const handleToggleAvailability = async (item: IMenuItem) => {
    try {
      const updated = await api.updateMenuItem(item._id, {
        available: !item.available,
      });
      setMenuItems(prev =>
        prev.map(m => (m._id === item._id ? updated.item : m))
      );
    } catch (err: any) {
      alert(err.message || 'Failed to toggle availability');
    }
  };

  const handleToggleSpecial = async (item: IMenuItem) => {
    try {
      const updated = await api.updateMenuItem(item._id, {
        isTodaySpecial: !item.isTodaySpecial,
      });
      setMenuItems(prev =>
        prev.map(m => (m._id === item._id ? updated.item : m))
      );
    } catch (err: any) {
      alert(err.message || "Failed to update Today's Special status");
    }
  };

  // KPI Calculations
  const totalSales = orders
    .filter(o => o.paymentStatus === 'PAID')
    .reduce((acc, o) => acc + o.totalAmount, 0);

  const pendingCount = orders.filter(o => o.orderStatus === 'CONFIRMED').length;
  const preparingCount = orders.filter(o => o.orderStatus === 'PREPARING').length;
  const readyCount = orders.filter(o => o.orderStatus === 'READY').length;
  const completedCount = orders.filter(o => o.orderStatus === 'COLLECTED').length;

  return (
    <div className="space-y-6">
      {/* Real-time Order Alert Toast */}
      {newOrderAlert && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-700 to-indigo-800 text-white shadow-xl flex items-center justify-between gap-3 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3">
            <span className="text-2xl animate-bounce">⚡</span>
            <div>
              <h4 className="font-extrabold text-sm sm:text-base">{newOrderAlert}</h4>
              <p className="text-xs text-blue-200">Order is pending review at the kitchen desk.</p>
            </div>
          </div>
          <button
            onClick={() => setNewOrderAlert(null)}
            className="text-xs font-bold bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-xl transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Top Banner & Control Bar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-amber-100 text-amber-900 text-xs font-black px-2.5 py-0.5 rounded-full border border-amber-200">
              OPERATIONS DESK
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Order Stream Online
            </span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Online Canteen Center Management Desk
          </h2>
          <p className="text-xs text-slate-500">
            Real-time kitchen order dispatch, token fulfillment, and crowd scheduling.
          </p>
        </div>

        {/* Database Mode & Tab Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold">
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            <span>Database:</span>
            <span className="font-bold text-emerald-700 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {analytics?.isSupabaseConnected ? 'Supabase Live' : 'Supabase Active'}
            </span>
          </div>

          <button
            onClick={fetchData}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-xs border border-blue-200 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards as specified */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Today's Orders */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Today's Orders
          </span>
          <span className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 block">
            {orders.length}
          </span>
        </div>

        {/* Pending Orders (CONFIRMED) */}
        <div className="bg-white p-4 rounded-2xl border border-blue-200 bg-blue-50/40 shadow-2xs">
          <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider block">
            Pending Orders
          </span>
          <span className="text-2xl sm:text-3xl font-black text-blue-800 mt-1 block">
            {pendingCount}
          </span>
        </div>

        {/* Preparing */}
        <div className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/40 shadow-2xs">
          <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">
            Preparing
          </span>
          <span className="text-2xl sm:text-3xl font-black text-amber-800 mt-1 block">
            {preparingCount}
          </span>
        </div>

        {/* Ready for Pickup */}
        <div className="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/40 shadow-2xs">
          <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
            Ready for Pickup
          </span>
          <span className="text-2xl sm:text-3xl font-black text-emerald-800 mt-1 block">
            {readyCount}
          </span>
        </div>

        {/* Completed */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Completed
          </span>
          <span className="text-2xl sm:text-3xl font-black text-slate-700 mt-1 block">
            {completedCount}
          </span>
        </div>

        {/* Today's Sales */}
        <div className="bg-white p-4 rounded-2xl border border-indigo-200 bg-indigo-50/40 shadow-2xs">
          <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider block">
            Today's Sales
          </span>
          <span className="text-2xl sm:text-3xl font-black text-indigo-900 mt-1 block">
            ₹{totalSales}
          </span>
        </div>
      </div>

      {/* Operator Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'orders'
              ? 'border-blue-700 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <UtensilsCrossed className="w-4 h-4" />
          <span>Live Orders Management</span>
          {pendingCount > 0 && (
            <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-black animate-pulse">
              {pendingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('queue')}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'queue'
              ? 'border-blue-700 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Queue & Slot Breakdown</span>
        </button>

        <button
          onClick={() => setActiveTab('menu')}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'menu'
              ? 'border-blue-700 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Menu Inventory Management</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'analytics'
              ? 'border-blue-700 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Sales & Rush Analytics</span>
        </button>
      </div>

      {/* TAB 1: ORDER MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {/* Search & Filters */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search Token (#104), Student Name, ID..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold"
              >
                <option value="ALL">All Statuses</option>
                <option value="CONFIRMED">CONFIRMED (New)</option>
                <option value="PREPARING">PREPARING</option>
                <option value="READY">READY</option>
                <option value="COLLECTED">COLLECTED</option>
              </select>

              {/* Pickup Slot Filter */}
              <select
                value={slotFilter}
                onChange={e => setSlotFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold"
              >
                <option value="ALL">All Pickup Slots</option>
                <option value="1:00 PM – 1:10 PM">1:00 PM – 1:10 PM</option>
                <option value="1:10 PM – 1:20 PM">1:10 PM – 1:20 PM</option>
                <option value="1:20 PM – 1:30 PM">1:20 PM – 1:30 PM</option>
                <option value="1:30 PM – 1:40 PM">1:30 PM – 1:40 PM</option>
                <option value="1:40 PM – 1:50 PM">1:40 PM – 1:50 PM</option>
                <option value="1:50 PM – 2:00 PM">1:50 PM – 2:00 PM</option>
              </select>

              {/* Payment Filter */}
              <select
                value={paymentFilter}
                onChange={e => setPaymentFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold"
              >
                <option value="ALL">All Payments</option>
                <option value="PAID">PAID</option>
                <option value="PENDING">PENDING</option>
              </select>
            </div>
          </div>

          {/* Orders List / Cards */}
          {loading ? (
            <div className="py-20 text-center">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs text-slate-500">Loading incoming orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-2">
              <UtensilsCrossed className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-extrabold text-base text-slate-800">No orders match criteria</h3>
              <p className="text-xs text-slate-500">
                Try resetting search queries or wait for new student submissions.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => {
                const isConfirmed = order.orderStatus === 'CONFIRMED';
                const isPreparing = order.orderStatus === 'PREPARING';
                const isReady = order.orderStatus === 'READY';
                const isCollected = order.orderStatus === 'COLLECTED';

                return (
                  <div
                    key={order._id}
                    className={`bg-white rounded-3xl p-5 sm:p-6 border transition-all ${
                      isReady
                        ? 'border-emerald-400 bg-emerald-50/20'
                        : isPreparing
                        ? 'border-amber-300 bg-amber-50/20'
                        : isConfirmed
                        ? 'border-blue-400 bg-blue-50/20 ring-2 ring-blue-500/10'
                        : 'border-slate-200'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                      {/* Left: Token & Student info */}
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-900 to-indigo-900 text-white flex flex-col items-center justify-center shrink-0 shadow-md">
                          <span className="text-[9px] uppercase font-bold text-cyan-300">
                            Token
                          </span>
                          <span className="text-2xl font-black text-amber-300 leading-none">
                            #{order.tokenNumber}
                          </span>
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-base font-black text-slate-900">
                              {order.studentName}
                            </span>
                            <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                              {order.studentId || 'STUDENT'}
                            </span>
                            <span className="text-xs text-slate-400">•</span>
                            <span className="text-xs font-mono text-slate-500">{order.orderId}</span>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                            <span className="flex items-center gap-1 font-semibold text-slate-700">
                              <Clock className="w-3.5 h-3.5 text-blue-700" />
                              Pickup: <strong className="text-blue-900">{order.pickupSlot}</strong>
                            </span>
                            <span>•</span>
                            <span>
                              Ordered at:{' '}
                              {new Date(order.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Payment & Status Badge */}
                      <div className="flex items-center justify-between lg:justify-end gap-4">
                        <div className="text-left lg:text-right">
                          <span className="text-xs text-slate-400 block font-medium">Total Bill</span>
                          <span className="text-xl font-black text-slate-900">
                            ₹{order.totalAmount}
                          </span>
                          <span
                            className={`text-[11px] font-bold block ${
                              order.paymentStatus === 'PAID'
                                ? 'text-emerald-700'
                                : 'text-amber-700'
                            }`}
                          >
                            {order.paymentMethod} ({order.paymentStatus})
                          </span>
                        </div>

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                            isCollected
                              ? 'bg-slate-100 text-slate-700'
                              : isReady
                              ? 'bg-emerald-100 text-emerald-800 animate-pulse'
                              : isPreparing
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {order.orderStatus}
                        </span>
                      </div>
                    </div>

                    {/* Items and Notes */}
                    <div className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex flex-wrap gap-2">
                        {order.items.map(item => (
                          <div
                            key={item.name}
                            className="bg-slate-100/80 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-800 border border-slate-200/60"
                          >
                            <span>{item.name}</span>
                            <span className="ml-1 text-blue-700 font-black">× {item.quantity}</span>
                            <span className="ml-2 text-slate-400 font-normal">
                              (₹{item.price * item.quantity})
                            </span>
                          </div>
                        ))}
                      </div>

                      {order.notes && (
                        <div className="text-xs bg-amber-50 text-amber-900 border border-amber-200 px-3 py-1.5 rounded-xl font-medium max-w-xs">
                          📝 <strong>Special Note:</strong> {order.notes}
                        </div>
                      )}
                    </div>

                    {/* OPERATOR ACTION BUTTONS as specified */}
                    <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                      <span className="text-xs text-slate-400 font-semibold">
                        Change Order Status:
                      </span>

                      <div className="flex flex-wrap gap-2">
                        {/* CONFIRMED BUTTON */}
                        <button
                          onClick={() => handleUpdateStatus(order._id, 'CONFIRMED')}
                          disabled={order.orderStatus === 'CONFIRMED' || updatingId === order._id}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            order.orderStatus === 'CONFIRMED'
                              ? 'bg-blue-600 text-white shadow-xs cursor-default'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                        >
                          CONFIRMED
                        </button>

                        {/* PREPARING BUTTON */}
                        <button
                          onClick={() => handleUpdateStatus(order._id, 'PREPARING')}
                          disabled={order.orderStatus === 'PREPARING' || updatingId === order._id}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                            order.orderStatus === 'PREPARING'
                              ? 'bg-amber-600 text-white shadow-xs cursor-default'
                              : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
                          }`}
                        >
                          <ChefHat className="w-3.5 h-3.5" />
                          PREPARING
                        </button>

                        {/* READY BUTTON */}
                        <button
                          onClick={() => handleUpdateStatus(order._id, 'READY')}
                          disabled={order.orderStatus === 'READY' || updatingId === order._id}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                            order.orderStatus === 'READY'
                              ? 'bg-emerald-600 text-white shadow-xs cursor-default ring-2 ring-emerald-400'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300'
                          }`}
                        >
                          <BellRing className="w-3.5 h-3.5" />
                          READY FOR PICKUP
                        </button>

                        {/* COLLECTED BUTTON */}
                        <button
                          onClick={() => handleUpdateStatus(order._id, 'COLLECTED')}
                          disabled={order.orderStatus === 'COLLECTED' || updatingId === order._id}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                            order.orderStatus === 'COLLECTED'
                              ? 'bg-slate-700 text-white cursor-default'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                          }`}
                        >
                          <PackageCheck className="w-3.5 h-3.5" />
                          COLLECTED
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: QUEUE MANAGEMENT */}
      {activeTab === 'queue' && (
        <QueueSlotBreakdown orders={orders} />
      )}

      {/* TAB 3: MENU MANAGEMENT */}
      {activeTab === 'menu' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-slate-900">Canteen Menu Inventory</h3>
              <p className="text-xs text-slate-500">
                Add, edit, adjust prices, or toggle daily stock availability. Changes instantly appear on student dashboards.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingMenuItem(null);
                setIsMenuModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Food Item</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {menuItems.map(item => (
              <div
                key={item._id}
                className={`rounded-3xl p-4 border transition-all flex flex-col justify-between ${
                  item.isTodaySpecial
                    ? 'bg-gradient-to-b from-amber-50/70 via-white to-white border-amber-300 shadow-md ring-2 ring-amber-400/30'
                    : 'bg-white border-slate-200/80 shadow-2xs'
                }`}
              >
                <div className="flex gap-3">
                  <img
                    src={getFoodImage(item.name, item.image)}
                    alt={item.name}
                    className="w-20 h-20 rounded-2xl object-cover border border-slate-200 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase text-slate-500">
                        {item.category}
                      </span>
                      {item.isTodaySpecial && (
                        <span className="text-[10px] font-black bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2 py-0.5 rounded-full shadow-2xs flex items-center gap-1">
                          <Star className="w-2.5 h-2.5 fill-white" /> Special
                        </span>
                      )}
                    </div>
                    <h4 className="font-extrabold text-sm text-slate-900 truncate mt-0.5">
                      {item.name}
                    </h4>
                    <span className="text-base font-black text-blue-700 block mt-1">
                      ₹{item.price}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleToggleAvailability(item)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                        item.available
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      {item.available ? 'In Stock' : 'Sold Out'}
                    </button>

                    <button
                      onClick={() => handleToggleSpecial(item)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all flex items-center gap-1 ${
                        item.isTodaySpecial
                          ? 'bg-amber-400 text-amber-950 font-black ring-1 ring-amber-500 hover:bg-amber-500'
                          : 'bg-slate-100 text-slate-600 hover:bg-amber-100 hover:text-amber-900'
                      }`}
                      title="Toggle Today's Special flag"
                    >
                      <Star className={`w-3 h-3 ${item.isTodaySpecial ? 'fill-amber-950' : ''}`} />
                      <span>{item.isTodaySpecial ? 'Special ★' : 'Set Special'}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingMenuItem(item);
                        setIsMenuModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                      title="Edit item"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteMenuItem(item._id, item.name)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Delete item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: ANALYTICS & REPORTS */}
      {activeTab === 'analytics' && analytics && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Ordered Items */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="font-extrabold text-base text-slate-900">
                  Most Ordered Canteen Items
                </h3>
                <span className="text-xs text-slate-500">By Quantity</span>
              </div>

              <div className="space-y-3">
                {analytics.topItems.map((item, idx) => {
                  const maxCount = Math.max(...analytics.topItems.map(i => i.count), 1);
                  const percentage = Math.round((item.count / maxCount) * 100);

                  return (
                    <div key={item.name} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-slate-800">
                        <span>
                          {idx + 1}. {item.name}
                        </span>
                        <span>
                          {item.count} orders (₹{item.revenue})
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Orders per Pickup Slot */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="font-extrabold text-base text-slate-900">
                  Peak Pickup Slot Volume
                </h3>
                <span className="text-xs text-slate-500">Lunch Windows</span>
              </div>

              <div className="space-y-3">
                {analytics.slotBreakdown.map(slot => {
                  const maxSlot = Math.max(...analytics.slotBreakdown.map(s => s.count), 1);
                  const percentage = Math.round((slot.count / maxSlot) * 100);

                  return (
                    <div key={slot.slot} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-slate-800">
                        <span>{slot.slot}</span>
                        <span>{slot.count} scheduled</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Menu Manager Modal */}
      <MenuManagerModal
        isOpen={isMenuModalOpen}
        onClose={() => setIsMenuModalOpen(false)}
        itemToEdit={editingMenuItem}
        onItemSaved={fetchData}
      />
    </div>
  );
};
