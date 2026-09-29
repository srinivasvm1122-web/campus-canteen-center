import React, { useState, useEffect, useRef } from 'react';
import {
  Clock,
  CheckCircle2,
  ChefHat,
  BellRing,
  PackageCheck,
  ShoppingBag,
  RefreshCw,
  Sparkles,
  AlertCircle,
  QrCode,
  Truck,
  Building,
  Star,
  XCircle,
  ThumbsUp
} from 'lucide-react';
import { IOrder } from '../../types.ts';
import { api } from '../../services/api.ts';
import { QRCodeView } from '../common/QRCodeView.tsx';
import confetti from 'canvas-confetti';

interface OrderTrackingViewProps {
  highlightOrderId?: string;
  onExploreMenu: () => void;
}

export const OrderTrackingView: React.FC<OrderTrackingViewProps> = ({
  highlightOrderId,
  onExploreMenu,
}) => {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastNotification, setLastNotification] = useState<string | null>(null);
  const [ratingModalOrder, setRatingModalOrder] = useState<IOrder | null>(null);
  const [foodRating, setFoodRating] = useState<number>(5);
  const [deliveryRating, setDeliveryRating] = useState<number>(5);
  const [reviewText, setReviewText] = useState('');
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const previousStatusMap = useRef<Record<string, string>>({});

  const playChimeSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.8);
    } catch (e) {}
  };

  const fetchOrders = async () => {
    try {
      const data = await api.getOrders();
      data.forEach(order => {
        const prevStatus = previousStatusMap.current[order._id];
        if (prevStatus && prevStatus !== 'READY' && order.orderStatus === 'READY') {
          playChimeSound();
          setLastNotification(`🔔 Your order #${order.tokenNumber} is ready for pickup!`);
          try {
            confetti({ particleCount: 60, spread: 60 });
          } catch (e) {}
        }
        previousStatusMap.current[order._id] = order.orderStatus;
      });

      setOrders(data);
    } catch (e) {
      console.error('Failed to load tracking orders', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 3000);

    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/events');
      eventSource.addEventListener('order_status_updated', (e: MessageEvent) => {
        try {
          const updated = JSON.parse(e.data);
          setOrders(prev =>
            prev.map(ord =>
              ord._id === updated._id || ord.orderId === updated.orderId
                ? { ...ord, ...updated }
                : ord
            )
          );
          if (updated.orderStatus === 'READY') {
            playChimeSound();
            setLastNotification(`🔔 Your order #${updated.tokenNumber} is ready for pickup!`);
          }
        } catch (err) {}
      });
    } catch (err) {}

    return () => {
      clearInterval(interval);
      if (eventSource) eventSource.close();
    };
  }, []);

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    try {
      const res = await api.cancelOrder(orderId);
      setActionFeedback(res.message);
      fetchOrders();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel order.');
    }
  };

  const handleSubmitRating = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ratingModalOrder) return;
    setRatingSubmitting(true);
    try {
      await api.rateOrder(ratingModalOrder._id, {
        foodRating,
        deliveryRating: ratingModalOrder.orderType === 'ROOM_DELIVERY' ? deliveryRating : undefined,
        review: reviewText,
      });
      setActionFeedback('⭐ Thank you for your review!');
      setRatingModalOrder(null);
      setReviewText('');
      fetchOrders();
    } catch (err: any) {
      alert(err.message || 'Failed to submit rating.');
    } finally {
      setRatingSubmitting(false);
    }
  };

  const activeOrders = orders.filter(
    o => o.orderStatus !== 'COLLECTED' && o.orderStatus !== 'DELIVERED' && o.orderStatus !== 'CANCELLED'
  );

  const getStepIndex = (status: IOrder['orderStatus'], isDelivery: boolean) => {
    if (isDelivery) {
      switch (status) {
        case 'CONFIRMED':
          return 0;
        case 'PREPARING':
          return 1;
        case 'OUT_FOR_DELIVERY':
          return 2;
        case 'DELIVERED':
          return 3;
        default:
          return 0;
      }
    } else {
      switch (status) {
        case 'CONFIRMED':
          return 0;
        case 'PREPARING':
          return 1;
        case 'READY':
          return 2;
        case 'COLLECTED':
          return 3;
        default:
          return 0;
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Live Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Live Order Tracker
            </h2>
            <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Live Kitchen Sync
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time kitchen order dispatch, token status, and room delivery tracking.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold transition-all shadow-2xs self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Status</span>
        </button>
      </div>

      {actionFeedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center justify-between">
          <span>{actionFeedback}</span>
          <button onClick={() => setActionFeedback(null)} className="text-slate-400 hover:text-slate-600">
            ×
          </button>
        </div>
      )}

      {lastNotification && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs font-bold flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <BellRing className="w-4 h-4 text-emerald-600 animate-bounce" />
            <span>{lastNotification}</span>
          </div>
          <button
            onClick={() => setLastNotification(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-semibold underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500 font-medium">Checking live orders...</p>
        </div>
      ) : activeOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 sm:p-14 border border-slate-200/80 text-center shadow-2xs space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-700 flex items-center justify-center mx-auto">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-black text-slate-900">No active orders right now</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Your previous meals have been completed. Browse today's fresh menu to place a new order!
            </p>
          </div>
          <button
            onClick={onExploreMenu}
            className="py-2.5 px-5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-extrabold text-xs shadow-md transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Explore Today's Menu</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {activeOrders.map(order => {
            const isDelivery = order.orderType === 'ROOM_DELIVERY';
            const currentIdx = getStepIndex(order.orderStatus, isDelivery);
            const isReady = order.orderStatus === 'READY';
            const isOutForDelivery = order.orderStatus === 'OUT_FOR_DELIVERY';
            const isPreparing = order.orderStatus === 'PREPARING';

            const steps = isDelivery
              ? [
                  { key: 'CONFIRMED', label: 'Order Received', icon: CheckCircle2 },
                  { key: 'PREPARING', label: 'In Kitchen', icon: ChefHat },
                  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: Truck },
                  { key: 'DELIVERED', label: 'Delivered', icon: PackageCheck },
                ]
              : [
                  { key: 'CONFIRMED', label: 'Order Received', icon: CheckCircle2 },
                  { key: 'PREPARING', label: 'In Kitchen', icon: ChefHat },
                  { key: 'READY', label: 'Ready at Counter', icon: BellRing },
                  { key: 'COLLECTED', label: 'Collected', icon: PackageCheck },
                ];

            return (
              <div
                key={order._id}
                className={`bg-white rounded-3xl p-6 sm:p-8 border shadow-md transition-all ${
                  isReady || isOutForDelivery
                    ? 'border-emerald-500 ring-4 ring-emerald-500/10'
                    : isPreparing
                    ? 'border-amber-400 ring-4 ring-amber-400/10'
                    : 'border-slate-200'
                }`}
              >
                {/* Top Token & Info */}
                <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-cyan-500 text-white flex flex-col items-center justify-center shadow-md">
                      <span className="text-[9px] uppercase font-bold tracking-widest text-cyan-200">
                        Token
                      </span>
                      <span className="text-2xl font-black text-amber-300 leading-none">
                        #{order.tokenNumber}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-black text-base sm:text-lg text-slate-900">
                          {order.tokenCode || order.orderId}
                        </h3>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            order.paymentStatus === 'PAID'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {order.paymentStatus}
                        </span>
                        <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200">
                          {order.branch || 'Main Canteen'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                        {isDelivery ? (
                          <>
                            <Building className="w-3.5 h-3.5 text-indigo-700" />
                            <span>
                              Delivery: <strong>{order.deliveryLocation?.building} • Rm {order.deliveryLocation?.roomNumber}</strong>
                            </span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3.5 h-3.5 text-blue-700" />
                            <span>
                              Pickup Slot: <strong className="text-slate-800">{order.pickupSlot}</strong>
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-400 block font-medium">Total Bill</span>
                    <span className="text-2xl font-black text-blue-700">₹{order.totalAmount}</span>
                    {order.orderStatus === 'CONFIRMED' && (
                      <button
                        onClick={() => handleCancelOrder(order._id)}
                        className="text-[11px] text-red-600 hover:text-red-700 font-bold underline mt-1 block"
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress Stepper Visual */}
                <div className="py-8">
                  <div className="relative">
                    <div className="absolute top-5 left-6 right-6 h-1 bg-slate-200 -z-0">
                      <div
                        className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 transition-all duration-700"
                        style={{ width: `${(currentIdx / (steps.length - 1)) * 100}%` }}
                      />
                    </div>

                    <div className="relative z-10 flex justify-between">
                      {steps.map((st, idx) => {
                        const Icon = st.icon;
                        const isCompleted = idx <= currentIdx;
                        const isCurrent = idx === currentIdx;

                        return (
                          <div key={st.key} className="flex flex-col items-center text-center max-w-[80px] sm:max-w-[100px]">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                                isCurrent
                                  ? 'bg-blue-700 text-white ring-4 ring-blue-600/30 shadow-lg scale-110'
                                  : isCompleted
                                  ? 'bg-emerald-600 text-white shadow-md'
                                  : 'bg-slate-200 text-slate-400'
                              }`}
                            >
                              <Icon className="w-5 h-5" />
                            </div>
                            <span
                              className={`text-[11px] sm:text-xs font-bold mt-2.5 leading-tight ${
                                isCurrent
                                  ? 'text-blue-900 font-extrabold'
                                  : isCompleted
                                  ? 'text-emerald-700'
                                  : 'text-slate-400'
                              }`}
                            >
                              {st.label}
                            </span>
                            {isCurrent && (
                              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded mt-0.5 animate-pulse">
                                Current
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Token QR & Items Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                  {/* Left: Token QR Pass */}
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 flex items-center gap-4">
                    <div className="shrink-0 bg-white p-2 rounded-xl shadow-xs border border-slate-200">
                      <QRCodeView
                        value={`CAMPUS:${order.tokenCode || order.orderId}:TOKEN:${order.tokenNumber}`}
                        size={84}
                        className="!p-0 !border-0 !shadow-none"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold text-blue-700 uppercase tracking-wider block">
                        Digital Counter Pass
                      </span>
                      <span className="font-mono font-black text-sm text-slate-900 block mt-0.5">
                        {order.tokenCode || `CAN-2026-A${order.tokenNumber}`}
                      </span>
                      <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                        {isDelivery
                          ? 'Delivery agent will scan this token when handing over your food.'
                          : 'Show this QR code at the counter for contactless collection.'}
                      </p>
                    </div>
                  </div>

                  {/* Right: Items list */}
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 flex flex-col justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-2">
                        Food Items Ordered
                      </span>
                      <div className="space-y-1 text-xs text-slate-700">
                        {order.items.map(it => (
                          <div key={it.name} className="flex justify-between font-medium">
                            <span>
                              {it.name} <strong className="text-blue-700">× {it.quantity}</strong>
                            </span>
                            <span>₹{it.price * it.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    {order.notes && (
                      <p className="text-[11px] text-slate-500 italic mt-2 pt-2 border-t border-slate-200">
                        Note: "{order.notes}"
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Ratings Modal */}
      {ratingModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-black text-slate-900">
              Rate Order #{ratingModalOrder.tokenNumber}
            </h3>
            <p className="text-xs text-slate-500">
              How was your meal from {ratingModalOrder.branch || 'Main Canteen'}?
            </p>

            <form onSubmit={handleSubmitRating} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Food Quality & Taste (1-5 Stars)
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFoodRating(star)}
                      className={`p-2 rounded-xl border text-base font-bold ${
                        foodRating >= star
                          ? 'bg-amber-100 border-amber-300 text-amber-700'
                          : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}
                    >
                      ⭐ {star}
                    </button>
                  ))}
                </div>
              </div>

              {ratingModalOrder.orderType === 'ROOM_DELIVERY' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Delivery Speed & Experience
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setDeliveryRating(star)}
                        className={`p-2 rounded-xl border text-base font-bold ${
                          deliveryRating >= star
                            ? 'bg-blue-100 border-blue-300 text-blue-700'
                            : 'bg-slate-50 border-slate-200 text-slate-400'
                        }`}
                      >
                        🛵 {star}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Optional Review
                </label>
                <textarea
                  value={reviewText}
                  onChange={e => setReviewText(e.target.value)}
                  placeholder="Tell us what you liked..."
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800"
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setRatingModalOrder(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={ratingSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-blue-700 text-white font-bold text-xs shadow-md"
                >
                  {ratingSubmitting ? 'Submitting...' : 'Submit Rating'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
