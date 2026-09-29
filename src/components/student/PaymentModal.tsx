import React, { useState } from 'react';
import {
  X,
  CreditCard,
  QrCode,
  Banknote,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Smartphone,
  ArrowRight,
  AlertCircle,
  Sparkles,
  Copy,
  Check,
  ExternalLink
} from 'lucide-react';
import { useCart } from '../../context/CartContext.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import { IOrder } from '../../types.ts';
import { QRCodeView } from '../common/QRCodeView.tsx';
import confetti from 'canvas-confetti';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (order: IOrder) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onOrderSuccess,
}) => {
  const { user } = useAuth();
  const {
    items,
    subtotal,
    orderType,
    pickupSlot,
    deliveryLocation,
    branch,
    couponCode,
    setCouponCode,
    discountAmount,
    setDiscountAmount,
    specialInstructions,
    notes,
    deliveryFee,
    finalTotal,
    clearCart
  } = useCart();

  const [paymentMethod, setPaymentMethod] = useState<'Online Payment' | 'Pay at Canteen'>('Online Payment');
  const [canteenUpiId] = useState('srinivasvm1122@okaxis');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Coupon state
  const [couponInput, setCouponInput] = useState(couponCode);
  const [couponMsg, setCouponMsg] = useState<string | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  if (!isOpen) return null;

  // Real UPI payment URL compatible with Google Pay, PhonePe, Paytm, BHIM, Cred, etc.
  const upiPaymentUrl = `upi://pay?pa=${encodeURIComponent(canteenUpiId)}&pn=${encodeURIComponent('ONLINE CANTEEN CENTER')}&am=${finalTotal}&cu=INR&tn=${encodeURIComponent('Online Canteen Center Meal Order')}`;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(canteenUpiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setIsApplyingCoupon(true);
    setCouponMsg(null);
    try {
      const res = await api.validateCoupon(couponInput.trim(), subtotal);
      if (res.valid) {
        setCouponCode(couponInput.trim().toUpperCase());
        setDiscountAmount(res.discountAmount);
        setCouponMsg(`✅ ${res.message}`);
      } else {
        setDiscountAmount(0);
        setCouponMsg(`❌ ${res.message}`);
      }
    } catch (e: any) {
      setCouponMsg('❌ Failed to validate coupon.');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handlePlaceOrder = async () => {
    setError(null);
    setIsProcessing(true);

    try {
      // If Online Payment, simulate realistic gateway verification
      if (paymentMethod === 'Online Payment') {
        await new Promise(resolve => setTimeout(resolve, 1200));
      }

      const orderPayload = {
        items: items.map(i => ({
          itemId: i.menuItem._id,
          name: i.menuItem.name,
          quantity: i.quantity,
        })),
        orderType,
        pickupSlot: orderType === 'PICKUP' ? pickupSlot : undefined,
        deliveryLocation: orderType === 'DELIVERY' ? deliveryLocation : undefined,
        branch: branch || 'Main Canteen',
        paymentMethod,
        couponCode: couponCode || undefined,
        specialInstructions: specialInstructions || notes || undefined,
        notes,
        transactionId: paymentMethod === 'Online Payment' ? `TXN_UPI_${Date.now().toString().slice(-6)}` : undefined,
      };

      const response = await api.createOrder(orderPayload);

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {}

      clearCart();
      onOrderSuccess(response.order);
    } catch (err: any) {
      setError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
          onClick={onClose}
        />

        {/* Modal Window */}
        <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-200 z-10 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white flex items-center justify-center font-bold shadow-md">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 leading-tight">
                  Checkout & Payment
                </h3>
                <span className="text-xs text-slate-500 font-medium">
                  Online Canteen Center Desk
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Order Summary Recap */}
          <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="font-bold text-slate-700 uppercase tracking-wider">Order Summary</span>
              <span className="font-bold text-blue-700">{items.length} unique items</span>
            </div>
            <div className="space-y-1 text-slate-600 max-h-28 overflow-y-auto pr-1">
              {items.map(i => (
                <div key={i.menuItem._id} className="flex justify-between">
                  <span>
                    {i.menuItem.name} <span className="text-slate-400">× {i.quantity}</span>
                  </span>
                  <span className="font-semibold text-slate-800">
                    ₹{i.menuItem.price * i.quantity}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-200 space-y-1.5 text-xs">
              <div className="flex justify-between items-center text-slate-600">
                <span>Fulfillment:</span>
                <span className="font-bold text-slate-900">
                  {orderType === 'DELIVERY'
                    ? `🛵 ${deliveryLocation.building} Room #${deliveryLocation.roomNumber}`
                    : `🕒 ${pickupSlot}`}
                </span>
              </div>

              <div className="flex justify-between items-center text-slate-600">
                <span>Food Items Total:</span>
                <span className="font-semibold text-slate-900">₹{subtotal}</span>
              </div>

              {orderType === 'DELIVERY' && (
                <div className="flex justify-between items-center text-purple-700 font-medium">
                  <span>Hostel Room Delivery Fee:</span>
                  <span className="font-bold">₹{deliveryFee}</span>
                </div>
              )}

              {discountAmount > 0 && (
                <div className="flex justify-between items-center text-emerald-600 font-bold">
                  <span>Discount Applied ({couponCode}):</span>
                  <span>-₹{discountAmount}</span>
                </div>
              )}

              <div className="flex justify-between items-center text-sm font-black text-slate-900 pt-1.5 border-t border-slate-200">
                <span>Final Payable:</span>
                <span className="text-blue-700 text-base">₹{finalTotal}</span>
              </div>
            </div>
          </div>

          {/* Coupon Code Input */}
          <div className="mt-4 p-3 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Enter coupon (e.g. WELCOME10, BCA10)"
                value={couponInput}
                onChange={e => setCouponInput(e.target.value)}
                className="flex-1 px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs font-mono font-bold text-amber-950 uppercase placeholder:normal-case placeholder:font-normal placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
              <button
                type="button"
                onClick={handleApplyCoupon}
                disabled={isApplyingCoupon || !couponInput.trim()}
                className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
              >
                {isApplyingCoupon ? 'Checking...' : 'Apply'}
              </button>
            </div>
            {couponMsg && (
              <p className="text-[11px] font-bold text-amber-900 pl-1">{couponMsg}</p>
            )}
          </div>

          {/* Payment Method Selector */}
          <div className="mt-5 space-y-3">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
              Choose Payment Method
            </label>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('Online Payment')}
                className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2 ${
                  paymentMethod === 'Online Payment'
                    ? 'border-blue-600 bg-blue-50/80 text-blue-900 font-bold ring-2 ring-blue-600/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Smartphone className="w-5 h-5 text-blue-700" />
                  <span className="text-[10px] font-bold bg-blue-200/80 text-blue-800 px-1.5 py-0.5 rounded">
                    PAID INSTANT
                  </span>
                </div>
                <div>
                  <span className="block text-xs font-bold">Online Payment</span>
                  <span className="text-[10px] text-slate-500 font-normal">
                    Demo UPI / QR / NetBanking
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('Pay at Canteen')}
                className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2 ${
                  paymentMethod === 'Pay at Canteen'
                    ? 'border-blue-600 bg-blue-50/80 text-blue-900 font-bold ring-2 ring-blue-600/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Banknote className="w-5 h-5 text-emerald-600" />
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                    PENDING
                  </span>
                </div>
                <div>
                  <span className="block text-xs font-bold">Pay at Canteen</span>
                  <span className="text-[10px] text-slate-500 font-normal">
                    Cash / POS at Counter
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Online Genuine UPI Payment Interface */}
          {paymentMethod === 'Online Payment' && (
            <div className="mt-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 text-white space-y-4 shadow-xl border border-indigo-500/20">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-600/30 flex items-center justify-center text-cyan-300">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold block">Live UPI Payment QR</span>
                    <span className="text-[10px] text-slate-400">Scan & pay with any UPI app</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Payable Amount</span>
                  <span className="text-base font-black text-amber-300">₹{subtotal}</span>
                </div>
              </div>

              {/* Real QR Code Display */}
              <div className="flex flex-col sm:flex-row items-center gap-4 bg-white/5 p-3.5 rounded-2xl border border-white/10">
                <div className="shrink-0 flex flex-col items-center">
                  <QRCodeView
                    value={upiPaymentUrl}
                    size={140}
                    className="shadow-xl"
                  />
                  <span className="text-[9px] font-mono text-cyan-300 mt-1 font-semibold">
                    UPI: ₹{subtotal}
                  </span>
                </div>

                <div className="flex-1 text-left space-y-2.5 w-full">
                  <div>
                    <span className="text-[11px] text-slate-300 block font-medium">
                      Scan and pay with any UPI App:
                    </span>
                    <div className="flex flex-wrap gap-1.5 font-bold text-[11px] text-cyan-300 mt-1">
                      <span className="px-2 py-0.5 rounded-md bg-white/10">Google Pay</span>
                      <span className="px-2 py-0.5 rounded-md bg-white/10">PhonePe</span>
                      <span className="px-2 py-0.5 rounded-md bg-white/10">Paytm</span>
                    </div>
                  </div>

                  {/* UPI ID with Copy Button */}
                  <div className="bg-slate-900/80 p-2 rounded-xl border border-white/10 flex items-center justify-between">
                    <div className="min-w-0 pr-2">
                      <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Canteen UPI ID</span>
                      <span className="text-xs font-mono font-bold text-amber-300 truncate block">
                        {canteenUpiId}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyUpi}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all shrink-0 ${
                        copiedUpi ? 'bg-emerald-600 text-white' : 'bg-white/15 hover:bg-white/25 text-white'
                      }`}
                    >
                      {copiedUpi ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Mobile Direct Pay Link */}
                  <a
                    href={upiPaymentUrl}
                    className="inline-flex sm:hidden items-center justify-center gap-1.5 w-full py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold shadow-xs transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Open in Mobile UPI App</span>
                  </a>

                  <div className="flex items-center gap-1.5 text-[10px] text-emerald-300 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Instant token confirmation after payment</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Place Order CTA Button */}
          <div className="mt-6">
            <button
              onClick={handlePlaceOrder}
              disabled={isProcessing}
              className="w-full py-3.5 px-4 rounded-2xl text-white font-extrabold text-sm bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-800 hover:from-blue-800 hover:to-indigo-700 shadow-xl shadow-blue-700/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Processing Demo Payment...</span>
                </>
              ) : (
                <>
                  <span>
                    {paymentMethod === 'Online Payment' ? `Pay ₹${subtotal} & Place Order` : `Confirm Order (₹${subtotal} at Canteen)`}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
            <p className="text-[11px] text-center text-slate-400 mt-2">
              Order will be instantly received by the canteen operator desk.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
