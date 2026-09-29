import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Minus,
  Check,
  Star,
  Clock,
  Sparkles,
  ShoppingBag,
  Info,
  Flame,
  AlertCircle
} from 'lucide-react';
import { IMenuItem } from '../../types.ts';
import { api } from '../../services/api.ts';
import { useCart } from '../../context/CartContext.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { getFoodImage } from '../../utils/foodImages.ts';

interface MenuCatalogProps {
  onOpenCart: () => void;
}

export const MenuCatalog: React.FC<MenuCatalogProps> = ({ onOpenCart }) => {
  const { user } = useAuth();
  const { items: cartItems, addItem, updateQuantity, totalCount, subtotal } = useCart();
  const [menuItems, setMenuItems] = useState<IMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const isDegree = user?.studentType === 'Degree';

  const fetchMenu = async () => {
    try {
      const data = await api.getMenu();
      setMenuItems(data);
    } catch (e) {
      console.error('Menu load error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
    // Poll menu every 5 seconds to catch operator updates immediately
    const interval = setInterval(fetchMenu, 5000);
    return () => clearInterval(interval);
  }, []);

  const categories = [
    'ALL',
    'SPECIALS',
    'Breakfast',
    'Lunch',
    'Meals',
    'Snacks',
    'Fast Food',
    'Beverages',
    'Healthy Food',
    'Desserts',
  ];

  const filteredItems = menuItems.filter(item => {
    const matchesCategory =
      selectedCategory === 'ALL'
        ? true
        : selectedCategory === 'SPECIALS'
        ? item.isTodaySpecial
        : item.category.toLowerCase() === selectedCategory.toLowerCase();

    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const getItemQuantity = (itemId: string) => {
    const found = cartItems.find(i => i.menuItem._id === itemId);
    return found ? found.quantity : 0;
  };

  return (
    <div className="space-y-6">
      {/* College Timing & Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-cyan-300 border border-white/10">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Namaskara, {user?.name}!</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Today's Fresh Canteen Menu
            </h2>
            <p className="text-sm text-slate-300 max-w-xl">
              Freshly prepared authentic Karnataka meals, crisp dosas, and steaming filter coffee. Select your lunch pickup slot and collect without waiting!
            </p>
          </div>

          {/* Student Lunch Timing Pill */}
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 sm:p-5 shrink-0 min-w-[260px]">
            <div className="flex items-center gap-2 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-2">
              <Clock className="w-4 h-4" />
              Your Designated Lunch Slot
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-300 tracking-tight">
              {isDegree ? '1:00 PM – 1:30 PM' : '1:30 PM – 2:00 PM'}
            </div>
            <p className="text-[11px] text-slate-300 mt-1">
              Registered as <span className="font-bold text-white">{user?.studentType} Student</span> ({user?.course || 'Degree'}).
            </p>
          </div>
        </div>
      </div>

      {/* Search and Category Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-blue-700 text-white shadow-md shadow-blue-700/20'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              {cat === 'SPECIALS' && '⭐ '}
              {cat === 'ALL' ? 'All Items' : cat}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search Bisibele Bath, Dosa..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200/80 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-2xs text-slate-800"
          />
        </div>
      </div>

      {/* Menu Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500 font-medium">Loading delicious canteen items...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-slate-200/80 p-8">
          <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No food items found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search query or select another food category.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredItems.map(item => {
            const qty = getItemQuantity(item._id);
            const isSpecial = item.isTodaySpecial;

            return (
              <div
                key={item._id}
                className={`group relative rounded-3xl overflow-hidden transition-all duration-300 flex flex-col justify-between ${
                  isSpecial
                    ? 'bg-gradient-to-b from-amber-50/70 via-white to-white border-2 border-amber-400 shadow-xl shadow-amber-500/15 ring-4 ring-amber-400/20 hover:shadow-2xl hover:scale-[1.01]'
                    : 'bg-white border border-slate-200/80 shadow-2xs hover:shadow-xl'
                }`}
              >
                {/* Chef's Special Top Ribbon */}
                {isSpecial && (
                  <div className="bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-500 text-slate-950 font-black text-[10px] tracking-widest uppercase py-1 px-3 flex items-center justify-center gap-1.5 shadow-xs">
                    <Sparkles className="w-3 h-3 fill-slate-950" />
                    <span>CHEF'S TODAY'S SPECIAL</span>
                    <Sparkles className="w-3 h-3 fill-slate-950" />
                  </div>
                )}

                {/* Image and Badges */}
                <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                  <img
                    src={getFoodImage(item.name, item.image)}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

                  {/* Veg indicator badge */}
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs px-2 py-1 rounded-lg flex items-center gap-1.5 shadow-md">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 ring-2 ring-emerald-600/30" />
                    <span className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">
                      Pure Veg
                    </span>
                  </div>

                  {/* Today's special badge */}
                  {isSpecial && (
                    <div className="absolute top-3 right-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2.5 py-1 rounded-full text-[10px] font-black flex items-center gap-1.5 shadow-lg border border-white/40 animate-pulse">
                      <Star className="w-3 h-3 fill-current text-white" />
                      <span>Today's Special</span>
                    </div>
                  )}

                  {/* Category Pill */}
                  <div className="absolute bottom-3 left-3">
                    <span className="bg-black/50 backdrop-blur-md text-white/90 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                      {item.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className={`font-extrabold text-base transition-colors ${
                          isSpecial ? 'text-amber-950 group-hover:text-amber-700' : 'text-slate-900 group-hover:text-blue-700'
                        }`}>
                          {item.name}
                        </h3>
                        {isSpecial && (
                          <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block mt-0.5">
                            ★ Freshly Prepared Today
                          </span>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        <span className={`text-lg font-black ${
                          isSpecial
                            ? 'text-amber-900 bg-amber-100/90 px-2 py-0.5 rounded-lg border border-amber-300 shadow-2xs inline-block'
                            : 'text-slate-900'
                        }`}>
                          ₹{item.price}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Action / Add to Cart */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      {item.available ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                          <Check className="w-3 h-3" /> Available
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-500">
                          Sold Out
                        </span>
                      )}
                    </div>

                    {item.available ? (
                      qty === 0 ? (
                        <button
                          onClick={() => addItem(item, 1)}
                          className={`px-3.5 py-1.5 rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-1.5 hover:scale-102 ${
                            isSpecial
                              ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-amber-500/20'
                              : 'bg-blue-700 hover:bg-blue-800 text-white shadow-blue-700/20'
                          }`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Add to Cart
                        </button>
                      ) : (
                        <div className={`flex items-center gap-2 border rounded-xl p-1 ${
                          isSpecial ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-200'
                        }`}>
                          <button
                            onClick={() => updateQuantity(item._id, qty - 1)}
                            className="w-6 h-6 rounded-lg bg-white text-slate-700 hover:bg-slate-200 flex items-center justify-center font-bold text-xs transition-colors shadow-2xs"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className={`text-xs font-black w-4 text-center ${
                            isSpecial ? 'text-amber-950' : 'text-blue-900'
                          }`}>
                            {qty}
                          </span>
                          <button
                            onClick={() => updateQuantity(item._id, qty + 1)}
                            className={`w-6 h-6 rounded-lg text-white flex items-center justify-center font-bold text-xs transition-colors shadow-2xs ${
                              isSpecial
                                ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700'
                                : 'bg-blue-700 hover:bg-blue-800'
                            }`}
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      )
                    ) : (
                      <button
                        disabled
                        className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-400 font-bold text-xs cursor-not-allowed"
                      >
                        Unavailable
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Checkout Bar for Mobile / Quick Action */}
      {totalCount > 0 && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-30">
          <div className="bg-slate-900/95 backdrop-blur-md text-white p-3.5 rounded-2xl shadow-2xl border border-white/20 flex items-center justify-between gap-4 animate-in slide-in-from-bottom-4 duration-200">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
                {totalCount}
              </div>
              <div>
                <span className="text-xs text-slate-300 block">Total Amount</span>
                <span className="text-base font-black text-amber-300">₹{subtotal}</span>
              </div>
            </div>

            <button
              onClick={onOpenCart}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-all"
            >
              <span>View Cart & Slot</span>
              <ShoppingBag className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
