import React, { createContext, useContext, useState, useEffect } from 'react';
import { IMenuItem, IDeliveryLocation } from '../types.ts';
import { useAuth } from './AuthContext.tsx';

export interface CartItem {
  menuItem: IMenuItem;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: IMenuItem, quantity?: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  totalCount: number;
  subtotal: number;
  orderType: 'PICKUP' | 'DELIVERY';
  setOrderType: (t: 'PICKUP' | 'DELIVERY') => void;
  pickupSlot: string;
  setPickupSlot: (slot: string) => void;
  availableSlots: string[];
  isSlotValid: boolean;
  deliveryLocation: IDeliveryLocation;
  setDeliveryLocation: (loc: IDeliveryLocation) => void;
  branch: string;
  setBranch: (b: string) => void;
  couponCode: string;
  setCouponCode: (c: string) => void;
  discountAmount: number;
  setDiscountAmount: (d: number) => void;
  specialInstructions: string;
  setSpecialInstructions: (i: string) => void;
  notes: string;
  setNotes: (notes: string) => void;
  deliveryFee: number;
  finalTotal: number;
}

export const DEGREE_SLOTS = [
  '1:00 PM – 1:10 PM',
  '1:10 PM – 1:20 PM',
  '1:20 PM – 1:30 PM',
];

export const MASTERS_SLOTS = [
  '1:30 PM – 1:40 PM',
  '1:40 PM – 1:50 PM',
  '1:50 PM – 2:00 PM',
];

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'campus_canteen_cart';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [orderType, setOrderType] = useState<'PICKUP' | 'DELIVERY'>('PICKUP');
  const [pickupSlot, setPickupSlot] = useState<string>('');
  const [deliveryLocation, setDeliveryLocation] = useState<IDeliveryLocation>({
    building: user?.hostelBuilding || 'Hostel A',
    floor: '2nd Floor',
    roomNumber: user?.roomNumber || '204',
    deliveryFee: 15,
  });
  const [branch, setBranch] = useState<string>('Main Canteen');
  const [couponCode, setCouponCode] = useState<string>('');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [specialInstructions, setSpecialInstructions] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const isMasters = user?.studentType === 'Master\'s';
  const availableSlots = isMasters ? MASTERS_SLOTS : DEGREE_SLOTS;

  // Auto-set default slot if not matching student type
  useEffect(() => {
    if (!pickupSlot || !availableSlots.includes(pickupSlot)) {
      setPickupSlot(availableSlots[0]);
    }
  }, [user?.studentType]);

  // Update default hostel room if user profile updates
  useEffect(() => {
    if (user?.hostelBuilding || user?.roomNumber) {
      setDeliveryLocation(prev => ({
        ...prev,
        building: user.hostelBuilding || prev.building,
        roomNumber: user.roomNumber || prev.roomNumber,
      }));
    }
  }, [user?.hostelBuilding, user?.roomNumber]);

  // Save cart to local storage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {}
  }, [items]);

  const addItem = (menuItem: IMenuItem, qty: number = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.menuItem._id === menuItem._id);
      if (existing) {
        return prev.map(i =>
          i.menuItem._id === menuItem._id
            ? { ...i, quantity: i.quantity + qty }
            : i
        );
      }
      return [...prev, { menuItem, quantity: qty }];
    });
  };

  const removeItem = (itemId: string) => {
    setItems(prev => prev.filter(i => i.menuItem._id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    setItems(prev =>
      prev.map(i =>
        i.menuItem._id === itemId ? { ...i, quantity } : i
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    setNotes('');
    setCouponCode('');
    setDiscountAmount(0);
    setSpecialInstructions('');
  };

  const totalCount = items.reduce((acc, curr) => acc + curr.quantity, 0);
  const subtotal = items.reduce((acc, curr) => acc + curr.menuItem.price * curr.quantity, 0);
  const isSlotValid = availableSlots.includes(pickupSlot);
  const deliveryFee = orderType === 'DELIVERY' ? (deliveryLocation.deliveryFee ?? 15) : 0;
  const finalTotal = Math.max(0, subtotal + deliveryFee - discountAmount);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalCount,
        subtotal,
        orderType,
        setOrderType,
        pickupSlot,
        setPickupSlot,
        availableSlots,
        isSlotValid,
        deliveryLocation,
        setDeliveryLocation,
        branch,
        setBranch,
        couponCode,
        setCouponCode,
        discountAmount,
        setDiscountAmount,
        specialInstructions,
        setSpecialInstructions,
        notes,
        setNotes,
        deliveryFee,
        finalTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
};
