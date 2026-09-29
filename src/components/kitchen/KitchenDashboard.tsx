import React, { useState, useEffect } from 'react';
import {
  ChefHat,
  Flame,
  Clock,
  CheckCircle2,
  AlertCircle,
  BellRing,
  Volume2,
  VolumeX,
  RefreshCw,
  Utensils,
  MapPin,
  Sparkles
} from 'lucide-react';
import { IOrder } from '../../types.ts';
import { api } from '../../services/api.ts';

export const KitchenDashboard: React.FC = () => {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchKitchenOrders = async () => {
    try {
      const all = await api.getOrders();
      setOrders(all);
    } catch (err) {
      console.error('Failed to fetch kitchen orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKitchenOrders();
    const interval = setInterval(fetchKitchenOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: IOrder['orderStatus']) => {
    setUpdatingId(orderId);
    try {
      await api.updateOrderStatus(orderId, newStatus);
      if (soundEnabled && typeof window !== 'undefined') {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.value = newStatus === 'READY' ? 880 : 587;
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
      }
      await fetchKitchenOrders();
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingId(null);
    }
  };

  const newOrders = orders.filter(o => o.orderStatus === 'CONFIRMED');
  const preparingOrders = orders.filter(o => o.orderStatus === 'PREPARING');
  const readyOrders = orders.filter(o => o.orderStatus === 'READY');
  const completedOrders = orders.filter(o => o.orderStatus === 'COLLECTED').slice(0, 10);

  return (
    <div className="space-y-6">
      {/* KDS Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-950 via-amber-950 to-slate-950 text-white p-6 sm:p-8 shadow-xl border border-orange-500/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 bg-orange-500/20 text-orange-300 border border-orange-400/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <ChefHat className="w-4 h-4" />
              Kitchen Display System (KDS)
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              Live Cooking & Packing Station
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Real-time ticket queue for chefs and kitchen dispatchers.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                soundEnabled
                  ? 'bg-amber-500/20 text-amber-300 border-amber-400/40 hover:bg-amber-500/30'
                  : 'bg-white/10 text-slate-400 border-white/10 hover:bg-white/20'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span>{soundEnabled ? 'Kitchen Sound ON' : 'Muted'}</span>
            </button>

            <button
              onClick={fetchKitchenOrders}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white transition-all"
              title="Refresh tickets"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Counter Stats Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
            <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block">Incoming</span>
            <span className="text-2xl font-black text-white">{newOrders.length}</span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
            <span className="text-[11px] font-bold text-orange-300 uppercase tracking-wider block">Cooking</span>
            <span className="text-2xl font-black text-orange-400">{preparingOrders.length}</span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
            <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider block">Ready / Packed</span>
            <span className="text-2xl font-black text-emerald-400">{readyOrders.length}</span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">Completed</span>
            <span className="text-2xl font-black text-slate-300">{completedOrders.length}</span>
          </div>
        </div>
      </div>

      {/* 4-Column Kitchen Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-5">
        {/* COLUMN 1: NEW ORDERS */}
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-amber-500/10 border border-amber-300/40 rounded-2xl px-4 py-2.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
              <h3 className="font-extrabold text-sm text-amber-950 uppercase tracking-wider">
                1. New Orders ({newOrders.length})
              </h3>
            </div>
          </div>

          <div className="space-y-3">
            {newOrders.length === 0 ? (
              <div className="p-8 bg-white rounded-2xl border border-dashed border-slate-300 text-center text-slate-400 text-xs font-medium">
                No pending tickets right now.
              </div>
            ) : (
              newOrders.map(order => (
                <div
                  key={order._id}
                  className="bg-white rounded-2xl p-4 border-2 border-amber-200 shadow-md space-y-3 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase block">Token</span>
                      <span className="text-2xl font-black text-amber-600">#{order.tokenNumber}</span>
                    </div>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      order.orderType === 'DELIVERY'
                        ? 'bg-purple-100 text-purple-800 border border-purple-200'
                        : 'bg-blue-100 text-blue-800 border border-blue-200'
                    }`}>
                      {order.orderType === 'DELIVERY' ? 'ROOM DELIVERY' : 'COUNTER PICKUP'}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 space-y-1">
                    <p className="font-bold text-slate-900">{order.studentName}</p>
                    {order.pickupSlot && (
                      <p className="flex items-center gap-1 text-slate-500">
                        <Clock className="w-3.5 h-3.5 text-blue-600" />
                        <span>Slot: <strong>{order.pickupSlot}</strong></span>
                      </p>
                    )}
                    {order.deliveryLocation && (
                      <p className="flex items-center gap-1 text-purple-700 font-medium">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{order.deliveryLocation.building} • Room #{order.deliveryLocation.roomNumber}</span>
                      </p>
                    )}
                  </div>

                  {/* Items List */}
                  <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 space-y-1 text-xs">
                    {order.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between items-center font-medium text-slate-800">
                        <span>{it.name}</span>
                        <span className="font-extrabold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                          x{it.quantity}
                        </span>
                      </div>
                    ))}
                  </div>

                  {order.specialInstructions && (
                    <div className="p-2 rounded-lg bg-red-50 border border-red-100 text-[11px] text-red-800 font-medium">
                      ⚠️ Note: {order.specialInstructions}
                    </div>
                  )}

                  <button
                    onClick={() => handleUpdateStatus(order._id, 'PREPARING')}
                    disabled={updatingId === order._id}
                    className="w-full py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-xl text-xs font-black shadow-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Flame className="w-4 h-4" />
                    <span>Start Cooking</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* COLUMN 2: PREPARING */}
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-orange-500/10 border border-orange-300/40 rounded-2xl px-4 py-2.5">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-600 animate-bounce" />
              <h3 className="font-extrabold text-sm text-orange-950 uppercase tracking-wider">
                2. On the Stove ({preparingOrders.length})
              </h3>
            </div>
          </div>

          <div className="space-y-3">
            {preparingOrders.length === 0 ? (
              <div className="p-8 bg-white rounded-2xl border border-dashed border-slate-300 text-center text-slate-400 text-xs font-medium">
                No orders currently being cooked.
              </div>
            ) : (
              preparingOrders.map(order => (
                <div
                  key={order._id}
                  className="bg-white rounded-2xl p-4 border-2 border-orange-300 shadow-md space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Token</span>
                      <span className="text-2xl font-black text-orange-600">#{order.tokenNumber}</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 animate-pulse">
                      Cooking Now
                    </span>
                  </div>

                  <p className="text-xs font-bold text-slate-900">{order.studentName}</p>

                  <div className="bg-orange-50/50 rounded-xl p-2.5 border border-orange-100 space-y-1 text-xs">
                    {order.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between items-center text-slate-800 font-medium">
                        <span>{it.name}</span>
                        <span className="font-black text-orange-900 bg-white px-2 py-0.5 rounded border border-orange-200">
                          x{it.quantity}
                        </span>
                      </div>
                    ))}
                  </div>

                  {order.specialInstructions && (
                    <div className="p-2 rounded-lg bg-red-50 border border-red-100 text-[11px] text-red-800 font-medium">
                      ⚠️ Note: {order.specialInstructions}
                    </div>
                  )}

                  <button
                    onClick={() => handleUpdateStatus(order._id, 'READY')}
                    disabled={updatingId === order._id}
                    className="w-full py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-black shadow-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Mark Cooked & Ready</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* COLUMN 3: READY / PACKED */}
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-300/40 rounded-2xl px-4 py-2.5">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <h3 className="font-extrabold text-sm text-emerald-950 uppercase tracking-wider">
                3. Ready at Counter ({readyOrders.length})
              </h3>
            </div>
          </div>

          <div className="space-y-3">
            {readyOrders.length === 0 ? (
              <div className="p-8 bg-white rounded-2xl border border-dashed border-slate-300 text-center text-slate-400 text-xs font-medium">
                No packed orders awaiting collection.
              </div>
            ) : (
              readyOrders.map(order => (
                <div
                  key={order._id}
                  className="bg-white rounded-2xl p-4 border-2 border-emerald-200 shadow-md space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Token</span>
                      <span className="text-2xl font-black text-emerald-600">#{order.tokenNumber}</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {order.orderType === 'DELIVERY' ? 'Ready for Dispatch' : 'Ready for Student'}
                    </span>
                  </div>

                  <p className="text-xs font-bold text-slate-900">{order.studentName}</p>

                  <div className="bg-slate-50 rounded-xl p-2 border border-slate-100 text-xs space-y-1">
                    {order.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between text-slate-700">
                        <span>{it.name}</span>
                        <span className="font-bold">x{it.quantity}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => handleUpdateStatus(order._id, 'COLLECTED')}
                    disabled={updatingId === order._id}
                    className="w-full py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <span>Handed Over / Collected</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* COLUMN 4: RECENT COMPLETED */}
        <div className="space-y-3 hidden xl:block">
          <div className="flex items-center justify-between bg-slate-200 border border-slate-300 rounded-2xl px-4 py-2.5">
            <h3 className="font-extrabold text-sm text-slate-700 uppercase tracking-wider">
              4. Completed ({completedOrders.length})
            </h3>
          </div>

          <div className="space-y-2">
            {completedOrders.map(order => (
              <div key={order._id} className="bg-white/80 rounded-xl p-3 border border-slate-200 text-xs">
                <div className="flex justify-between font-bold">
                  <span className="text-slate-800">Token #{order.tokenNumber}</span>
                  <span className="text-emerald-700">Done</span>
                </div>
                <p className="text-slate-500 text-[11px] mt-0.5 truncate">{order.studentName}</p>
                <p className="text-[10px] text-slate-400 mt-1">
                  {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
