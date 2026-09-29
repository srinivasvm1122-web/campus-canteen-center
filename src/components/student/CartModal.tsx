import React from 'react';
import {
  X,
  Plus,
  Minus,
  Trash2,
  Clock,
  ShieldCheck,
  ShoppingBag,
  ArrowRight,
  AlertTriangle,
  Info,
  Building
} from 'lucide-react';
import { useCart, DEGREE_SLOTS, MASTERS_SLOTS } from '../../context/CartContext.tsx';
import { useAuth } from '../../context/AuthContext.tsx';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToCheckout: () => void;
}

export const CartModal: React.FC<CartModalProps> = ({
  isOpen,
  onClose,
  onProceedToCheckout,
}) => {
  const { user } = useAuth();
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    subtotal,
    totalCount,
    orderType,
    setOrderType,
    pickupSlot,
    setPickupSlot,
    availableSlots,
    isSlotValid,
    deliveryLocation,
    setDeliveryLocation,
    deliveryFee,
    discountAmount,
    finalTotal,
    notes,
    setNotes,
  } = useCart();

  if (!isOpen) return null;

  const isDegree = user?.studentType === 'Degree';
  const otherWindowSlots = isDegree ? MASTERS_SLOTS : DEGREE_SLOTS;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-700 text-white flex items-center justify-center font-bold">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900 leading-tight">
                  Your Canteen Cart
                </h3>
                <span className="text-xs text-slate-500">
                  {totalCount} {totalCount === 1 ? 'item' : 'items'} selected
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {items.length === 0 ? (
              <div className="py-20 text-center">
                <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-400 flex items-center justify-center mx-auto mb-3">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-slate-800 text-base">Your cart is empty</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  Add freshly made Karnataka canteen specialties like Bisibele Bath, Masala Dosa, or Coffee to start your order!
                </p>
              </div>
            ) : (
              <>
                {/* Items List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 uppercase tracking-wider">
                    <span>Order Items</span>
                    <button
                      onClick={clearCart}
                      className="text-red-500 hover:text-red-700 normal-case font-medium flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" /> Clear
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-2xl overflow-hidden bg-white shadow-2xs">
                    {items.map(({ menuItem, quantity }) => (
                      <div key={menuItem._id} className="p-3.5 flex items-center justify-between gap-3">
                        <img
                          src={menuItem.image}
                          alt={menuItem.name}
                          className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                            {menuItem.name}
                          </h4>
                          <span className="text-xs font-semibold text-slate-500 block">
                            ₹{menuItem.price} each
                          </span>
                          <span className="text-xs font-bold text-blue-700 block mt-0.5">
                            Subtotal: ₹{menuItem.price * quantity}
                          </span>
                        </div>

                        {/* Quantity Stepper */}
                        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                          <button
                            onClick={() => updateQuantity(menuItem._id, quantity - 1)}
                            className="w-6 h-6 rounded-lg bg-white text-slate-700 hover:bg-slate-200 flex items-center justify-center font-bold text-xs transition-colors shadow-2xs"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold text-slate-900 w-5 text-center">
                            {quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(menuItem._id, quantity + 1)}
                            className="w-6 h-6 rounded-lg bg-blue-700 text-white hover:bg-blue-800 flex items-center justify-center font-bold text-xs transition-colors shadow-2xs"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* FULFILLMENT MODE: PICKUP OR ROOM DELIVERY */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                    Choose Order Fulfillment
                  </label>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setOrderType('PICKUP')}
                      className={`py-2.5 px-3 rounded-2xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                        orderType === 'PICKUP'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md font-black'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <Clock className="w-4 h-4" />
                      <span>Canteen Pickup</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setOrderType('DELIVERY')}
                      className={`py-2.5 px-3 rounded-2xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                        orderType === 'DELIVERY'
                          ? 'bg-purple-600 text-white border-purple-600 shadow-md font-black'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span>🛵 Room Delivery</span>
                    </button>
                  </div>

                  {/* IF PICKUP: SHOW SLOTS */}
                  {orderType === 'PICKUP' && (
                    <div className="space-y-3 pt-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-blue-700" />
                          Designated Pickup Window
                        </span>
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                          {user?.studentType}
                        </span>
                      </div>

                      {/* Lunch Window Rule Notice */}
                      <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-2xl text-xs text-blue-900 space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-blue-950">
                          <Info className="w-4 h-4 text-blue-700 shrink-0" />
                          <span>Assigned College Lunch Hours:</span>
                        </div>
                        <p className="text-[11px] text-blue-800 leading-relaxed">
                          {isDegree
                            ? 'Degree students collect lunch between 1:00 PM and 1:30 PM. Other slots are locked for crowd balance.'
                            : 'Master’s students collect lunch between 1:30 PM and 2:00 PM. Other slots are locked for crowd balance.'}
                        </p>
                      </div>

                      {/* Allowed Slots */}
                      <div className="grid grid-cols-1 gap-2">
                        {availableSlots.map(slot => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setPickupSlot(slot)}
                            className={`p-3 rounded-2xl text-left border transition-all flex items-center justify-between ${
                              pickupSlot === slot
                                ? 'border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-600/20 font-bold'
                                : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <Clock className={`w-4 h-4 ${pickupSlot === slot ? 'text-white' : 'text-blue-600'}`} />
                              <span className="text-xs font-bold">{slot}</span>
                            </div>
                            <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-md ${
                              pickupSlot === slot ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-700'
                            }`}>
                              Available
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* IF DELIVERY: SHOW ROOM & HOSTEL SELECTOR */}
                  {orderType === 'DELIVERY' && (
                    <div className="space-y-3 pt-1 p-3.5 bg-purple-50/60 border border-purple-200/80 rounded-2xl">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-purple-950">
                        <Building className="w-4 h-4 text-purple-700" />
                        <span>Deliver to Campus Room (+₹15 delivery fee)</span>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div>
                          <label className="block text-[11px] font-bold text-purple-900 mb-1">Hostel / Building</label>
                          <select
                            value={deliveryLocation.building}
                            onChange={e => setDeliveryLocation({ ...deliveryLocation, building: e.target.value })}
                            className="w-full p-2 rounded-xl bg-white border border-purple-200 text-xs font-medium text-slate-800"
                          >
                            <option value="Hostel A">Hostel A (Boys Hostel)</option>
                            <option value="Hostel B">Hostel B (Girls Hostel)</option>
                            <option value="Tech Block">Tech & Science Block</option>
                            <option value="MBA Block">MBA / PG Block</option>
                            <option value="Library Block">Central Library</option>
                          </select>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[11px] font-bold text-purple-900 mb-1">Floor</label>
                            <select
                              value={deliveryLocation.floor}
                              onChange={e => setDeliveryLocation({ ...deliveryLocation, floor: e.target.value })}
                              className="w-full p-2 rounded-xl bg-white border border-purple-200 text-xs font-medium text-slate-800"
                            >
                              <option value="Ground Floor">Ground Floor</option>
                              <option value="1st Floor">1st Floor</option>
                              <option value="2nd Floor">2nd Floor</option>
                              <option value="3rd Floor">3rd Floor</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-purple-900 mb-1">Room Number</label>
                            <input
                              type="text"
                              required
                              value={deliveryLocation.roomNumber}
                              onChange={e => setDeliveryLocation({ ...deliveryLocation, roomNumber: e.target.value })}
                              placeholder="e.g. 204"
                              className="w-full p-2 rounded-xl bg-white border border-purple-200 text-xs font-medium text-slate-800"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Optional Preparation Notes & Special Instructions */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Special Kitchen / Delivery Instructions
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="e.g. Extra spicy, less sugar, ring bell twice..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800"
                  />
                </div>
              </>
            )}
          </div>

          {/* Footer with Calculations and Proceed Button */}
          {items.length > 0 && (
            <div className="p-5 border-t border-slate-200 bg-slate-50 space-y-3">
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Food Total</span>
                  <span className="font-semibold text-slate-900">₹{subtotal}</span>
                </div>
                {orderType === 'DELIVERY' && (
                  <div className="flex justify-between text-purple-700 font-medium">
                    <span>Hostel Room Delivery Fee</span>
                    <span className="font-bold">₹{deliveryFee}</span>
                  </div>
                )}
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Coupon Discount</span>
                    <span>-₹{discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-200">
                  <span>Final Amount</span>
                  <span className="text-blue-700">₹{finalTotal}</span>
                </div>
              </div>

              <button
                onClick={onProceedToCheckout}
                disabled={orderType === 'PICKUP' && !isSlotValid}
                className="w-full py-3 px-4 rounded-xl text-white font-bold text-sm bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 shadow-lg shadow-blue-700/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Proceed to Payment (₹{finalTotal})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
