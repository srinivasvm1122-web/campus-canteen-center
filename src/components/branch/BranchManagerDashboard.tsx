import React, { useState, useEffect } from 'react';
import {
  Store,
  ArrowLeftRight,
  TrendingUp,
  Package,
  CheckCircle2,
  Clock,
  Plus,
  RefreshCw,
  Send,
  Building2,
  DollarSign
} from 'lucide-react';
import { IBranch, IStockTransfer, IMenuItem, IOrder } from '../../types.ts';
import { api } from '../../services/api.ts';

export const BranchManagerDashboard: React.FC = () => {
  const [branches, setBranches] = useState<IBranch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>('Hostel Canteen');
  const [transfers, setTransfers] = useState<IStockTransfer[]>([]);
  const [menuItems, setMenuItems] = useState<IMenuItem[]>([]);
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);

  // New transfer form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transferItem, setTransferItem] = useState('');
  const [transferQty, setTransferQty] = useState(10);
  const [fromBranch, setFromBranch] = useState('Main Canteen');
  const [toBranch, setToBranch] = useState('Hostel Canteen');

  const fetchData = async () => {
    try {
      const [bData, tData, mData, oData] = await Promise.all([
        api.getBranches(),
        api.getTransfers(),
        api.getMenu(),
        api.getOrders(),
      ]);
      setBranches(bData);
      setTransfers(tData);
      setMenuItems(mData);
      setOrders(oData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferItem) return;
    const item = menuItems.find(m => m.name === transferItem || m._id === transferItem);
    try {
      await api.createTransfer({
        itemId: item ? item._id : 'custom_item',
        itemName: item ? item.name : transferItem,
        quantity: transferQty,
        fromBranch,
        toBranch,
      });
      setIsModalOpen(false);
      setTransferItem('');
      await fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateTransferStatus = async (id: string, status: IStockTransfer['status']) => {
    try {
      await api.updateTransferStatus(id, status);
      await fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  // Branch-specific calculations
  const branchOrders = orders.filter(o => (o.branch || 'Main Canteen') === selectedBranch);
  const branchSales = branchOrders.reduce((sum, o) => o.paymentStatus === 'PAID' ? sum + o.totalAmount : sum, 0);

  return (
    <div className="space-y-6">
      {/* Branch Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-950 text-white p-6 sm:p-8 shadow-xl border border-emerald-500/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <Store className="w-4 h-4" />
              Multi-Branch Operations & Stock Network
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              Branch Manager Control Desk
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Manage inventory balances, request and approve inter-branch stock transfers, and track branch performance.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Request Stock Transfer</span>
            </button>
            <button
              onClick={fetchData}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Branch Selector Pills */}
        <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap gap-2">
          {branches.map(b => (
            <button
              key={b.id}
              onClick={() => setSelectedBranch(b.name)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all border flex items-center gap-2 ${
                selectedBranch === b.name
                  ? 'bg-emerald-400 text-slate-950 border-emerald-300 shadow-md font-black'
                  : 'bg-white/10 text-slate-300 border-white/10 hover:bg-white/20'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>{b.name}</span>
              <span className="text-[10px] opacity-75 font-normal">({b.currentWaitTimeMinutes}m wait)</span>
            </button>
          ))}
        </div>
      </div>

      {/* Branch Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-bold block">Today's Branch Sales</span>
            <span className="text-2xl font-black text-slate-900">₹{branchSales}</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-bold block">Orders Processed</span>
            <span className="text-2xl font-black text-slate-900">{branchOrders.length}</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
            <ArrowLeftRight className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-bold block">Active Stock Transfers</span>
            <span className="text-2xl font-black text-slate-900">
              {transfers.filter(t => t.status !== 'RECEIVED' && t.status !== 'REJECTED').length}
            </span>
          </div>
        </div>
      </div>

      {/* Inter-Branch Stock Transfers Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <ArrowLeftRight className="w-5 h-5 text-emerald-600" />
              <span>Inter-Branch Stock Transfers</span>
            </h3>
            <p className="text-xs text-slate-500">
              Transfer fresh food items, batches, and ingredients between Main, Hostel, and Block B canteens.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <th className="pb-3 px-3">Item & Quantity</th>
                <th className="pb-3 px-3">From Branch</th>
                <th className="pb-3 px-3">To Branch</th>
                <th className="pb-3 px-3">Requested By</th>
                <th className="pb-3 px-3">Status</th>
                <th className="pb-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transfers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                    No stock transfers recorded yet.
                  </td>
                </tr>
              ) : (
                transfers.map(tr => (
                  <tr key={tr.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-3 font-bold text-slate-900">
                      {tr.quantity}x {tr.itemName}
                    </td>
                    <td className="py-3 px-3 text-slate-600">{tr.fromBranch}</td>
                    <td className="py-3 px-3 text-slate-600 font-bold text-emerald-700">{tr.toBranch}</td>
                    <td className="py-3 px-3 text-slate-500">{tr.requestedBy}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2.5 py-1 rounded-full font-extrabold text-[10px] uppercase tracking-wider ${
                        tr.status === 'RECEIVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : tr.status === 'APPROVED' || tr.status === 'DISPATCHED'
                          ? 'bg-blue-100 text-blue-800'
                          : tr.status === 'REJECTED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {tr.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right space-x-1.5">
                      {tr.status === 'REQUESTED' && (
                        <>
                          <button
                            onClick={() => handleUpdateTransferStatus(tr.id, 'APPROVED')}
                            className="px-2 py-1 bg-emerald-600 text-white rounded-lg font-bold text-[10px]"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleUpdateTransferStatus(tr.id, 'REJECTED')}
                            className="px-2 py-1 bg-slate-200 text-slate-700 rounded-lg font-bold text-[10px]"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {tr.status === 'APPROVED' && (
                        <button
                          onClick={() => handleUpdateTransferStatus(tr.id, 'DISPATCHED')}
                          className="px-2 py-1 bg-blue-600 text-white rounded-lg font-bold text-[10px]"
                        >
                          Dispatch
                        </button>
                      )}
                      {tr.status === 'DISPATCHED' && (
                        <button
                          onClick={() => handleUpdateTransferStatus(tr.id, 'RECEIVED')}
                          className="px-2 py-1 bg-emerald-700 text-white rounded-lg font-bold text-[10px]"
                        >
                          Mark Received
                        </button>
                      )}
                      {tr.status === 'RECEIVED' && (
                        <span className="text-slate-400 text-[10px] font-bold">Completed</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transfer Request Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-xl font-black text-slate-900">Request Inter-Branch Stock</h3>
            <p className="text-xs text-slate-500">
              Select item and quantity to transfer between canteen stations.
            </p>

            <form onSubmit={handleCreateTransfer} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Item to Transfer</label>
                <select
                  value={transferItem}
                  onChange={e => setTransferItem(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-medium text-slate-900"
                >
                  <option value="">Select menu item...</option>
                  {menuItems.map(m => (
                    <option key={m._id} value={m.name}>{m.name} (₹{m.price})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={transferQty}
                  onChange={e => setTransferQty(parseInt(e.target.value) || 1)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-medium text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Source Branch</label>
                  <select
                    value={fromBranch}
                    onChange={e => setFromBranch(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-medium text-slate-900"
                  >
                    {branches.map(b => (
                      <option key={b.id} value={b.name}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Destination</label>
                  <select
                    value={toBranch}
                    onChange={e => setToBranch(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-medium text-slate-900"
                  >
                    {branches.map(b => (
                      <option key={b.id} value={b.name}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md"
                >
                  Send Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
