import React from 'react';
import {
  CheckCircle2,
  Clock,
  QrCode,
  ArrowRight,
  Sparkles,
  Ticket,
  UtensilsCrossed,
  X
} from 'lucide-react';
import { IOrder } from '../../types.ts';
import { QRCodeView } from '../common/QRCodeView.tsx';

interface OrderConfirmationModalProps {
  order: IOrder | null;
  onClose: () => void;
  onTrackOrder: () => void;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  order,
  onClose,
  onTrackOrder,
}) => {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs transition-opacity"
          onClick={onClose}
        />

        <div className="relative w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-200 z-10 animate-in fade-in zoom-in-95 duration-200">
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Success Header */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              ORDER CONFIRMED
            </div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              Order Placed Successfully!
            </h3>
            <p className="text-xs text-slate-500">
              Your order has been queued at the Online Canteen Center counter.
            </p>
          </div>

          {/* Golden Ticket Card */}
          <div className="mt-6 relative bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-950 text-white rounded-2xl p-6 shadow-xl overflow-hidden border border-white/20">
            {/* Background design */}
            <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-cyan-500/10 blur-xl pointer-events-none" />

            <div className="flex items-center justify-between border-b border-white/15 pb-4">
              <div>
                <span className="text-[10px] text-cyan-300 font-bold uppercase tracking-widest block">
                  {order.orderType === 'ROOM_DELIVERY' ? 'Room Delivery Token' : 'Canteen Pickup Token'}
                </span>
                <div className="text-4xl font-black tracking-tight text-amber-300 mt-0.5">
                  #{order.tokenNumber}
                </div>
                <span className="text-xs font-mono font-bold text-cyan-300 bg-white/10 px-2 py-0.5 rounded-md mt-1 inline-block">
                  {order.tokenCode || `CAN-2026-A${order.tokenNumber}`}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-300 block">{order.branch || 'Main Canteen'}</span>
                <span className="text-xs font-mono font-bold text-white block mt-0.5">
                  {order.orderId}
                </span>
                <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                  order.paymentStatus === 'PAID' ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/40' : 'bg-amber-500/30 text-amber-300 border border-amber-500/40'
                }`}>
                  {order.paymentStatus}
                </span>
              </div>
            </div>

            {/* Items breakdown */}
            <div className="py-4 space-y-1.5 text-xs text-slate-200 border-b border-white/15">
              {order.items.map(item => (
                <div key={item.name} className="flex justify-between items-center font-medium">
                  <span>
                    {item.name} <strong className="text-cyan-300">× {item.quantity}</strong>
                  </span>
                  <span className="text-slate-300">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            {/* Total & Slot */}
            <div className="pt-4 flex items-center justify-between border-b border-white/15 pb-4">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-semibold">
                  Scheduled Pickup Window
                </span>
                <div className="flex items-center gap-1.5 text-xs font-bold text-white mt-0.5">
                  <Clock className="w-3.5 h-3.5 text-cyan-300" />
                  <span>{order.pickupSlot}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-semibold">
                  Total Bill
                </span>
                <span className="text-xl font-black text-amber-300">₹{order.totalAmount}</span>
              </div>
            </div>

            {/* Token QR Code Section */}
            <div className="pt-4 flex items-center gap-4 bg-white/5 p-3 rounded-xl border border-white/10 mt-3">
              <div className="shrink-0 bg-white p-1 rounded-xl">
                <QRCodeView
                  value={`CAMPUSDINE:${order.orderId}:TOKEN:${order.tokenNumber}`}
                  size={76}
                  className="!p-0 !border-0 !shadow-none"
                />
              </div>
              <div className="text-left">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-cyan-300 uppercase tracking-wider">
                  <QrCode className="w-3 h-3" /> Pickup Token QR
                </span>
                <p className="text-[11px] text-slate-200 mt-0.5 leading-tight font-medium">
                  Show this QR code at the canteen counter to collect your meal.
                </p>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Show at canteen collection desk
                </span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="mt-6 space-y-2">
            <button
              onClick={onTrackOrder}
              className="w-full py-3.5 px-4 rounded-2xl text-white font-extrabold text-sm bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 shadow-xl shadow-blue-700/25 transition-all flex items-center justify-center gap-2"
            >
              <span>Track Live Preparation Status</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="w-full py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Back to Menu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
