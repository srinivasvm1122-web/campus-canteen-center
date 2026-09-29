import React, { useState, useEffect } from 'react';
import {
  Bike,
  MapPin,
  Phone,
  CheckCircle2,
  Clock,
  ArrowRight,
  RefreshCw,
  Package,
  Building,
  User,
  ShieldCheck
} from 'lucide-react';
import { IOrder } from '../../types.ts';
import { api } from '../../services/api.ts';

export const DeliveryDashboard: React.FC = () => {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchDeliveryOrders = async () => {
    try {
      const all = await api.getOrders();
      // Filter for orders that have delivery
      const deliveryOrders = all.filter(o => o.orderType === 'DELIVERY' || !!o.deliveryLocation);
      setOrders(deliveryOrders);
    } catch (e) {
      console.error('Failed to fetch delivery orders', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveryOrders();
    const interval = setInterval(fetchDeliveryOrders, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateDeliveryStatus = async (orderId: string, deliveryStatus: 'PENDING' | 'ASSIGNED' | 'OUT_FOR_DELIVERY' | 'DELIVERED') => {
    setUpdatingId(orderId);
    try {
      await api.updateDeliveryStatus(orderId, deliveryStatus);
      await fetchDeliveryOrders();
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingId(null);
    }
  };

  const pendingQueue = orders.filter(o => o.deliveryStatus === 'PENDING' || !o.deliveryStatus);
  const outForDelivery = orders.filter(o => o.deliveryStatus === 'OUT_FOR_DELIVERY');
  const deliveredList = orders.filter(o => o.deliveryStatus === 'DELIVERED').slice(0, 15);

  return (
    <div className="space-y-6">
      {/* Delivery Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-950 text-white p-6 sm:p-8 shadow-xl border border-purple-500/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 bg-purple-500/20 text-purple-300 border border-purple-400/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <Bike className="w-4 h-4" />
              Campus Room Delivery Logistics
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              Hostel & Block Delivery Dispatch
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Deliver hot snacks, lunch, and beverages straight to hostel rooms and department blocks.
            </p>
          </div>

          <button
            onClick={fetchDeliveryOrders}
            className="self-start sm:self-auto flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold text-white transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Queue</span>
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mt-6 pt-5 border-t border-white/10 text-center">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
            <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block">Ready to Pick Up</span>
            <span className="text-2xl font-black text-amber-400">{pendingQueue.length}</span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
            <span className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider block">On the Way (Out)</span>
            <span className="text-2xl font-black text-cyan-400">{outForDelivery.length}</span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
            <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider block">Delivered Today</span>
            <span className="text-2xl font-black text-emerald-400">{deliveredList.length}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ACTIVE / PENDING DELIVERIES */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-ping" />
              <span>Active Delivery Runs ({pendingQueue.length + outForDelivery.length})</span>
            </h3>
          </div>

          {[...outForDelivery, ...pendingQueue].length === 0 ? (
            <div className="p-12 bg-white rounded-3xl border border-dashed border-slate-300 text-center space-y-2">
              <Bike className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="font-bold text-sm text-slate-700">All caught up!</p>
              <p className="text-xs text-slate-400">No pending room deliveries right now.</p>
            </div>
          ) : (
            [...outForDelivery, ...pendingQueue].map(order => {
              const isOut = order.deliveryStatus === 'OUT_FOR_DELIVERY';
              return (
                <div
                  key={order._id}
                  className={`bg-white rounded-3xl p-5 border-2 shadow-md space-y-4 transition-all ${
                    isOut ? 'border-cyan-400 shadow-cyan-100' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 font-black flex items-center justify-center text-lg">
                        #{order.tokenNumber}
                      </div>
                      <div>
                        <h4 className="font-black text-slate-900 text-base">{order.studentName}</h4>
                        <p className="text-xs text-slate-500 font-mono">Order {order.orderId}</p>
                      </div>
                    </div>

                    <span className={`text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${
                      isOut
                        ? 'bg-cyan-100 text-cyan-800 border border-cyan-300 animate-pulse'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}>
                      {isOut ? '🛵 Out for Delivery' : '📦 Awaiting Pickup'}
                    </span>
                  </div>

                  {/* Destination Details */}
                  <div className="bg-purple-50/70 border border-purple-100 rounded-2xl p-3.5 space-y-2">
                    <div className="flex items-center gap-2 text-purple-950 font-bold text-sm">
                      <Building className="w-4 h-4 text-purple-700 shrink-0" />
                      <span>{order.deliveryLocation?.building || 'Campus Hostel'}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-purple-900">
                      <div>
                        <span className="text-purple-600 block text-[10px] uppercase font-bold">Floor</span>
                        <span className="font-extrabold">{order.deliveryLocation?.floor || 'Ground'}</span>
                      </div>
                      <div>
                        <span className="text-purple-600 block text-[10px] uppercase font-bold">Room Number</span>
                        <span className="font-extrabold text-sm text-purple-950">Room #{order.deliveryLocation?.roomNumber || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Items to Deliver */}
                  <div className="bg-slate-50 rounded-xl p-3 text-xs space-y-1 text-slate-700">
                    <span className="font-bold text-slate-900 block text-[11px] uppercase tracking-wider mb-1">
                      Package Contents:
                    </span>
                    {order.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between font-medium">
                        <span>{it.name}</span>
                        <span className="font-black text-slate-900">x{it.quantity}</span>
                      </div>
                    ))}
                  </div>

                  {order.specialInstructions && (
                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-medium">
                      🔔 Instructions: {order.specialInstructions}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3 pt-2">
                    {!isOut ? (
                      <button
                        onClick={() => handleUpdateDeliveryStatus(order._id, 'OUT_FOR_DELIVERY')}
                        disabled={updatingId === order._id}
                        className="flex-1 py-3 rounded-2xl bg-cyan-600 hover:bg-cyan-700 text-white font-black text-xs shadow-md flex items-center justify-center gap-2 transition-all"
                      >
                        <Bike className="w-4 h-4" />
                        <span>Pick Up & Start Delivery</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUpdateDeliveryStatus(order._id, 'DELIVERED')}
                        disabled={updatingId === order._id}
                        className="flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md flex items-center justify-center gap-2 transition-all"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Confirm Handover (Delivered)</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* RECENTLY DELIVERED */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Completed Deliveries ({deliveredList.length})</span>
            </h3>
          </div>

          <div className="space-y-3">
            {deliveredList.length === 0 ? (
              <div className="p-8 bg-white rounded-3xl border border-dashed border-slate-300 text-center text-xs text-slate-400">
                No deliveries marked completed yet.
              </div>
            ) : (
              deliveredList.map(order => (
                <div key={order._id} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-900">#{order.tokenNumber}</span>
                      <span className="text-xs font-bold text-slate-700">{order.studentName}</span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Delivered to {order.deliveryLocation?.building} • Room #{order.deliveryLocation?.roomNumber}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" /> Delivered
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1">₹{order.totalAmount}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
