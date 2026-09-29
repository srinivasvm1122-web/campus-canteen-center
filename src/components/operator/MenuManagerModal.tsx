import React, { useState, useEffect } from 'react';
import { X, Plus, Save, Trash2, Image, AlertCircle, Check } from 'lucide-react';
import { IMenuItem } from '../../types.ts';
import { api } from '../../services/api.ts';
import { FOOD_IMAGE_MAP, getFoodImage } from '../../utils/foodImages.ts';

interface MenuManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemToEdit?: IMenuItem | null;
  initialItem?: IMenuItem | null;
  onItemSaved?: () => void;
  onSaved?: () => void;
}

export const MenuManagerModal: React.FC<MenuManagerModalProps> = ({
  isOpen,
  onClose,
  itemToEdit,
  initialItem,
  onItemSaved,
  onSaved,
}) => {
  const targetItem = itemToEdit || initialItem || null;
  const notifySaved = onItemSaved || onSaved || (() => {});

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number | string>(40);
  const [category, setCategory] = useState<IMenuItem['category']>('Meals');
  const [image, setImage] = useState('');
  const [available, setAvailable] = useState(true);
  const [isTodaySpecial, setIsTodaySpecial] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (itemToEdit) {
      setName(itemToEdit.name);
      setDescription(itemToEdit.description);
      setPrice(itemToEdit.price);
      setCategory(itemToEdit.category);
      setImage(itemToEdit.image);
      setAvailable(itemToEdit.available);
      setIsTodaySpecial(Boolean(itemToEdit.isTodaySpecial));
    } else {
      setName('');
      setDescription('');
      setPrice(40);
      setCategory('Meals');
      setImage('https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80');
      setAvailable(true);
      setIsTodaySpecial(false);
    }
  }, [itemToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (itemToEdit) {
        await api.updateMenuItem(itemToEdit._id, {
          name,
          description,
          price: Number(price),
          category,
          image,
          available,
          isTodaySpecial,
        });
      } else {
        await api.addMenuItem({
          name,
          description,
          price: Number(price),
          category,
          image,
          available,
          isTodaySpecial,
        });
      }

      if (onItemSaved) {
        onItemSaved();
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save menu item.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
          onClick={onClose}
        />

        <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-200 z-10">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-black text-slate-900">
                {itemToEdit ? 'Edit Canteen Food Item' : 'Add New Food to Today’s Menu'}
              </h3>
              <p className="text-xs text-slate-500">
                Manage canteen menu pricing and real-time inventory.
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
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

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Food Item Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Bisibele Bath"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Price (₹)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  placeholder="40"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800"
              >
                <option value="Meals">Meals</option>
                <option value="Breakfast">Breakfast</option>
                <option value="Beverages">Beverages</option>
                <option value="Snacks">Snacks</option>
                <option value="Desserts">Desserts</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">
                  Food Photo
                </label>
                <span className="text-[10px] text-blue-600 font-semibold">
                  Click a dish below for instant authentic photo:
                </span>
              </div>

              {/* Photo presets */}
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                {Object.entries(FOOD_IMAGE_MAP).map(([dishName, dishUrl]) => (
                  <button
                    key={dishName}
                    type="button"
                    onClick={() => {
                      setImage(dishUrl);
                      if (!name) setName(dishName);
                    }}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all flex items-center gap-1 ${
                      image === dishUrl
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>{dishName}</span>
                  </button>
                ))}
              </div>

              <div className="flex gap-2 items-center">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                  <img
                    src={getFoodImage(name, image)}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <input
                  type="text"
                  value={image}
                  onChange={e => setImage(e.target.value)}
                  placeholder="/images/masala_dosa.jpg or URL"
                  className="flex-1 px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Description
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Fresh ingredients, spices, and accompaniments..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800"
              />
            </div>

            {/* Checkboxes for Availability & Today's Special */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={available}
                  onChange={e => setAvailable(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="font-bold text-slate-800">
                  Item is Available / In Stock
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isTodaySpecial}
                  onChange={e => setIsTodaySpecial(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                />
                <span className="font-bold text-slate-800">
                  Mark as ⭐ "Today's Special"
                </span>
              </label>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-md flex items-center gap-1.5"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>{itemToEdit ? 'Save Changes' : 'Add Food Item'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
