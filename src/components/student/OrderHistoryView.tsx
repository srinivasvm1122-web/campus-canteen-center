import React, { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle2,
  Calendar,
  ShoppingBag,
  RefreshCw,
  Search,
  Filter,
  QrCode,
  X,
  Star,
  RotateCcw,
  Truck,
  Building,
  Tag
} from 'lucide-react';
import { IOrder } from '../../types.ts';
import { api } from '../../services/api.ts';
import { QRCodeView } from '../common/QRCodeView.tsx';
import { useCart } from '../../context/CartContext.tsx';

export const OrderHistoryView: React.FC = () => {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('ALL');
  const [activeQrOrder, setActiveQrOrder] = useState<IOrder | null>(null);

  // Re-order message feedback
  const [feedback, setFeedback] = useState<string | null>(null);
  const { addItem } = useCart();

  const fetchOrders = async () => {
    try {
      const data = await api.getOrders();
      setOrders(data);
    } catch (e) {
      console.error('History load error', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleReorder = async (order: IOrder) => {
    try {
      const allMenu = await api.getMenu(order.branch);
      let addedCount = 0;
      for (const item of order.items) {
        const found = allMenu.find(m => m._id === item.itemId || m.name === item.name);
        if (found && found.available) {
          addItem(found, item.quantity);
          addedCount += item.quantity;
        }
      }
      setFeedback(`🛒 Re-ordered! Added ${addedCount} items from #${order.tokenNumber} to your cart.`);
      setTimeout(() => setFeedback(null), 3500);
    } catch (e) {
      setFeedback('Could not reorder all items.');
    }
  };

  const filteredOrders = orders.filter(o => {
    if (filter === 'ALL') return true;
    return o.orderStatus === filter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Order History</h2>
          <p className="text-xs text-slate-500 mt-1">
            Review all your past meal orders and transaction details at Online Canteen Center.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {['ALL', 'COLLECTED', 'DELIVERED', 'READY', 'PREPARING', 'CONFIRMED'].map(st => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                filter === st
                  ? 'bg-blue-700 text-white shadow-2xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {st === 'ALL' ? 'All Orders' : st}
            </button>
          ))}
        </div>
      </div>

      {feedback && (
        <div className="p-3 bg-blue-50 border border-blue-200 text-blue-900 rounded-2xl text-xs font-bold flex items-center justify-between animate-in fade-in">
          <span>{feedback}</span>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-600">
            ×
          </button>
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500 font-medium">Loading your previous orders...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-200/80 text-center shadow-2xs space-y-3">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-extrabold text-base text-slate-800">No orders found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You don't have any past orders under the selected filter.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(order => (
            <div
              key={order._id}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs hover:shadow-md transition-shadow"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex flex-col items-center justify-center font-black">
                    <span className="text-[9px] uppercase font-bold text-blue-500">Token</span>
                    <span className="text-base leading-none">#{order.tokenNumber}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-900">
                        {order.tokenCode || order.orderId}
                      </span>
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          order.orderStatus === 'COLLECTED' || order.orderStatus === 'DELIVERED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : order.orderStatus === 'READY'
                            ? 'bg-blue-100 text-blue-800'
                            : order.orderStatus === 'CANCELLED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {order.orderStatus}
                      </span>
                      <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-200">
                        {order.branch || 'Main Canteen'}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 mt-0.5 block flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{new Date(order.createdAt).toLocaleString()}</span>
                      <span>•</span>
                      {order.orderType === 'ROOM_DELIVERY' ? (
                        <span className="text-indigo-700 font-bold flex items-center gap-1">
                          <Truck className="w-3 h-3" />
                          <span>Rm {order.deliveryLocation?.roomNumber}</span>
                        </span>
                      ) : (
                        <span className="text-blue-700 font-bold flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{order.pickupSlot}</span>
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-lg font-black text-slate-900 block">
                      ₹{order.totalAmount}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">
                      {order.paymentMethod} • {order.paymentStatus}
                    </span>
                  </div>

                  <button
                    onClick={() => setActiveQrOrder(order)}
                    className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs cursor-pointer"
                    title="View Token Pass QR"
                  >
                    <QrCode className="w-4 h-4 text-blue-700" />
                  </button>

                  <button
                    onClick={() => handleReorder(order)}
                    className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 transition-colors text-xs font-bold flex items-center gap-1.5"
                    title="Reorder this meal"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Order Again</span>
                  </button>
                </div>
              </div>

              {/* Items Summary & Rating Badge */}
              <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600">
                <div className="flex flex-wrap gap-2">
                  {order.items.map(it => (
                    <span
                      key={it.name}
                      className="bg-slate-100 px-2 py-0.5 rounded-md font-medium text-slate-700"
                    >
                      {it.name} × {it.quantity}
                    </span>
                  ))}
                  {order.discount ? (
                    <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-md border border-emerald-200">
                      Discount -₹{order.discount} ({order.couponCode})
                    </span>
                  ) : null}
                </div>

                {order.rating && (
                  <div className="flex items-center gap-1 text-amber-600 font-bold bg-amber-50 px-2 py-1 rounded-lg border border-amber-200 self-start sm:self-auto">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>Rated {order.rating.foodRating}/5</span>
                    {order.rating.review && (
                      <span className="text-slate-500 font-normal italic ml-1">
                        "{order.rating.review}"
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Token Pass Modal */}
      {activeQrOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center space-y-4 shadow-2xl relative">
            <button
              onClick={() => setActiveQrOrder(null)}
              className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="text-[10px] font-black uppercase text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              Verified Digital Token Pass
            </span>

            <div className="text-3xl font-black text-slate-900">
              #{activeQrOrder.tokenNumber}
            </div>
            <div className="text-xs font-mono font-bold text-slate-600">
              {activeQrOrder.tokenCode || activeQrOrder.orderId}
            </div>

            <div className="flex justify-center py-2">
              <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-md">
                <QRCodeView
                  value={`CAMPUS:${activeQrOrder.tokenCode || activeQrOrder.orderId}:TOKEN:${activeQrOrder.tokenNumber}`}
                  size={160}
                />
              </div>
            </div>

            <p className="text-xs text-slate-500">
              {activeQrOrder.orderType === 'ROOM_DELIVERY'
                ? `Delivery to ${activeQrOrder.deliveryLocation?.building} Rm ${activeQrOrder.deliveryLocation?.roomNumber}`
                : `Pickup Window: ${activeQrOrder.pickupSlot}`}
            </p>

            <button
              onClick={() => setActiveQrOrder(null)}
              className="w-full py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl"
            >
              Close Pass
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
