import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  GraduationCap,
  Store,
  Tag,
  Trash2,
  FileText,
  BarChart3,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  Sparkles,
  Calendar
} from 'lucide-react';
import {
  IUser,
  ICourse,
  IBranch,
  ICoupon,
  IFoodWasteRecord,
  IAuditLog,
  IAnalytics,
  UserRole
} from '../../types.ts';
import { api } from '../../services/api.ts';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'users' | 'academic' | 'branches' | 'coupons' | 'waste' | 'audit'>('analytics');
  const [analytics, setAnalytics] = useState<IAnalytics | null>(null);
  const [users, setUsers] = useState<IUser[]>([]);
  const [courses, setCourses] = useState<ICourse[]>([]);
  const [branches, setBranches] = useState<IBranch[]>([]);
  const [coupons, setCoupons] = useState<ICoupon[]>([]);
  const [wasteRecords, setWasteRecords] = useState<IFoodWasteRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<IAuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  // New course modal state
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [courseCode, setCourseCode] = useState('');
  const [courseName, setCourseName] = useState('');
  const [courseType, setCourseType] = useState<'Degree' | 'Master\'s'>('Degree');
  const [courseDept, setCourseDept] = useState('');

  // New coupon modal state
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponDesc, setCouponDesc] = useState('');
  const [discountPercent, setDiscountPercent] = useState<number | undefined>(10);
  const [targetCourse, setTargetCourse] = useState('All');

  // Food waste record state
  const [isWasteModalOpen, setIsWasteModalOpen] = useState(false);
  const [wasteBranch, setWasteBranch] = useState('Main Canteen');
  const [wasteItemName, setWasteItemName] = useState('');
  const [wastePrepared, setWastePrepared] = useState(50);
  const [wasteSold, setWasteSold] = useState(45);
  const [wasteWasted, setWasteWasted] = useState(5);
  const [wasteReason, setWasteReason] = useState('End of day leftovers');

  const fetchAdminData = async () => {
    try {
      const [anData, uData, cData, bData, cpData, wData, aData] = await Promise.all([
        api.getAnalytics(),
        api.getUsers(),
        api.getCourses(),
        api.getBranches(),
        api.getCoupons(),
        api.getWasteRecords(),
        api.getAuditLogs(),
      ]);
      setAnalytics(anData);
      setUsers(uData);
      setCourses(cData);
      setBranches(bData);
      setCoupons(cpData);
      setWasteRecords(wData);
      setAuditLogs(aData);
    } catch (e) {
      console.error('Failed to fetch admin data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      await api.updateUserRole(userId, newRole);
      await fetchAdminData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseCode || !courseName) return;
    try {
      await api.createCourse({
        code: courseCode.trim().toUpperCase(),
        name: courseName.trim(),
        type: courseType,
        department: courseDept.trim() || 'General',
      });
      setIsCourseModalOpen(false);
      setCourseCode('');
      setCourseName('');
      await fetchAdminData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this course?')) return;
    try {
      await api.deleteCourse(id);
      await fetchAdminData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode) return;
    try {
      await api.createCoupon({
        code: couponCode.trim().toUpperCase(),
        description: couponDesc.trim(),
        discountPercent: Number(discountPercent) || 10,
        targetCourse,
        active: true,
      });
      setIsCouponModalOpen(false);
      setCouponCode('');
      setCouponDesc('');
      await fetchAdminData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddWasteRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wasteItemName) return;
    try {
      await api.createWasteRecord({
        branch: wasteBranch,
        date: new Date().toISOString().split('T')[0],
        itemId: 'item_' + Date.now(),
        itemName: wasteItemName,
        preparedQty: Number(wastePrepared),
        soldQty: Number(wasteSold),
        remainingQty: Math.max(0, Number(wastePrepared) - Number(wasteSold)),
        wastedQty: Number(wasteWasted),
        reason: wasteReason,
      });
      setIsWasteModalOpen(false);
      setWasteItemName('');
      await fetchAdminData();
    } catch (e) {
      console.error(e);
    }
  };

  const toggleBranchStatus = async (branch: IBranch) => {
    try {
      await api.updateBranch(branch.id, { isOpen: !branch.isOpen });
      await fetchAdminData();
    } catch (e) {
      console.error(e);
    }
  };

  // Waste Reduction Stats
  const totalPrepared = wasteRecords.reduce((sum, r) => sum + r.preparedQty, 0);
  const totalWasted = wasteRecords.reduce((sum, r) => sum + r.wastedQty, 0);
  const wastePercent = totalPrepared > 0 ? ((totalWasted / totalPrepared) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      {/* Admin Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-950 text-white p-6 sm:p-8 shadow-xl border border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 bg-rose-500/20 text-rose-300 border border-rose-400/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4" />
              Administrative Command Center
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              System Management & Governance
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Manage academic programs, user roles, branch networks, coupons, food waste minimization, and audit trail.
            </p>
          </div>

          <button
            onClick={fetchAdminData}
            className="self-start sm:self-auto flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold text-white transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync All Data</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap gap-2">
          {[
            { id: 'analytics', label: 'Overview & Analytics', icon: BarChart3 },
            { id: 'users', label: `Users & Roles (${users.length})`, icon: Users },
            { id: 'academic', label: `Academic Courses (${courses.length})`, icon: GraduationCap },
            { id: 'branches', label: `Branches (${branches.length})`, icon: Store },
            { id: 'coupons', label: `Coupons & Offers (${coupons.length})`, icon: Tag },
            { id: 'waste', label: 'Food Waste Reduction', icon: TrendingDown },
            { id: 'audit', label: `Audit Log (${auditLogs.length})`, icon: FileText },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all border ${
                  isActive
                    ? 'bg-white text-slate-900 border-white shadow-md font-black'
                    : 'bg-white/10 text-slate-300 border-white/10 hover:bg-white/20'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: OVERVIEW & ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Revenue</span>
              <span className="text-2xl sm:text-3xl font-black text-slate-900">₹{analytics?.totalSales || 0}</span>
            </div>
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Orders</span>
              <span className="text-2xl sm:text-3xl font-black text-blue-600">{analytics?.totalOrders || 0}</span>
            </div>
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Active Queue</span>
              <span className="text-2xl sm:text-3xl font-black text-amber-500">{analytics?.activeQueue?.length || 0}</span>
            </div>
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Food Waste %</span>
              <span className="text-2xl sm:text-3xl font-black text-emerald-600">{wastePercent}%</span>
            </div>
          </div>

          {/* Top Selling Items */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-base font-black text-slate-900">Most Popular Items Across Campus</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {analytics?.topItems?.slice(0, 6).map((item, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex justify-between items-center">
                  <div>
                    <span className="font-extrabold text-sm text-slate-900 block">{item.name}</span>
                    <span className="text-xs text-slate-500">{item.count} portions sold</span>
                  </div>
                  <span className="font-black text-sm text-emerald-600">₹{item.revenue}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USER MANAGEMENT & ROLE-BASED ACCESS */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span>User Roles & Authorization Control</span>
              </h3>
              <p className="text-xs text-slate-500">
                Grant or change roles: Student, Operator, Kitchen Staff, Delivery Staff, Branch Manager, or Admin.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="pb-3 px-3">Name & Email</th>
                  <th className="pb-3 px-3">Student / Staff ID</th>
                  <th className="pb-3 px-3">Course & Type</th>
                  <th className="pb-3 px-3">Current Role</th>
                  <th className="pb-3 px-3 text-right">Assign Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map(u => (
                  <tr key={u._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-3">
                      <span className="font-black text-slate-900 block">{u.name}</span>
                      <span className="text-slate-500 font-mono text-[11px]">{u.email}</span>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-700">{u.studentId || 'N/A'}</td>
                    <td className="py-3 px-3 text-slate-600">
                      {u.course} ({u.studentType})
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2.5 py-0.5 rounded-full font-extrabold text-[10px] uppercase tracking-wider ${
                        u.role === 'admin'
                          ? 'bg-rose-100 text-rose-800'
                          : u.role === 'operator'
                          ? 'bg-amber-100 text-amber-800'
                          : u.role === 'kitchen'
                          ? 'bg-orange-100 text-orange-800'
                          : u.role === 'delivery'
                          ? 'bg-purple-100 text-purple-800'
                          : u.role === 'branch_manager'
                          ? 'bg-teal-100 text-teal-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <select
                        value={u.role}
                        onChange={e => handleRoleChange(u._id, e.target.value as UserRole)}
                        className="p-1.5 rounded-lg border border-slate-300 text-[11px] font-bold bg-white text-slate-800"
                      >
                        <option value="student">student</option>
                        <option value="operator">operator</option>
                        <option value="kitchen">kitchen</option>
                        <option value="delivery">delivery</option>
                        <option value="branch_manager">branch_manager</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ACADEMIC STRUCTURE (COURSES) */}
      {activeTab === 'academic' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-indigo-600" />
                <span>Academic Courses & Degree Hierarchy</span>
              </h3>
              <p className="text-xs text-slate-500">
                Configure programs (BCA, BBA, BCom, BE/BTech, MCA, MBA, etc.) so students can enroll and book scheduled slots.
              </p>
            </div>
            <button
              onClick={() => setIsCourseModalOpen(true)}
              className="px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Course</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {courses.map(c => (
              <div key={c.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm text-slate-900">{c.code}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
                      c.type === 'Degree' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                    }`}>
                      {c.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">{c.name}</p>
                  <span className="text-[10px] text-slate-400 block mt-1">Dept: {c.department}</span>
                </div>
                <button
                  onClick={() => handleDeleteCourse(c.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: BRANCH MANAGEMENT */}
      {activeTab === 'branches' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <Store className="w-5 h-5 text-emerald-600" />
            <span>Campus Canteen Branches & Counters</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {branches.map(b => (
              <div key={b.id} className="p-5 rounded-3xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-black text-base text-slate-900">{b.name}</h4>
                    <p className="text-xs text-slate-500">{b.location}</p>
                  </div>
                  <span className={`text-[11px] font-extrabold px-3 py-1 rounded-full ${
                    b.isOpen ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {b.isOpen ? 'Open' : 'Emergency Closed'}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                  <span className="text-xs text-slate-600">Avg. Pickup Wait Time: <strong>{b.currentWaitTimeMinutes} mins</strong></span>
                  <button
                    onClick={() => toggleBranchStatus(b)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      b.isOpen ? 'bg-red-50 text-red-700 hover:bg-red-100' : 'bg-emerald-600 text-white'
                    }`}
                  >
                    {b.isOpen ? 'Close Branch' : 'Open Branch'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: OFFERS & COUPONS */}
      {activeTab === 'coupons' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Tag className="w-5 h-5 text-amber-600" />
                <span>Student Discounts, Coupons & Offers</span>
              </h3>
              <p className="text-xs text-slate-500">
                Create coupon codes for all students or course-specific incentives (e.g. BCA exclusive discount).
              </p>
            </div>
            <button
              onClick={() => setIsCouponModalOpen(true)}
              className="px-4 py-2 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Create Coupon</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {coupons.map((cp, idx) => (
              <div key={idx} className="p-4 rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50/50 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-mono font-black text-base text-amber-900">{cp.code}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                    {cp.discountPercent ? `${cp.discountPercent}% OFF` : `₹${cp.discountAmount} OFF`}
                  </span>
                </div>
                <p className="text-xs text-slate-700">{cp.description}</p>
                <div className="text-[11px] text-slate-500 flex justify-between">
                  <span>Target: {cp.targetCourse || 'All'}</span>
                  <span>Min Order: ₹{cp.minOrderAmount || 0}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: FOOD WASTE REDUCTION & DEMAND FORECAST */}
      {activeTab === 'waste' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-emerald-600" />
                <span>Food Waste Reduction & Demand Forecasting</span>
              </h3>
              <p className="text-xs text-slate-500">
                Track prepared vs sold quantities to prevent waste, and transfer surplus food before expiration.
              </p>
            </div>
            <button
              onClick={() => setIsWasteModalOpen(true)}
              className="px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Log Daily Waste</span>
            </button>
          </div>

          {/* Smart Demand & Waste Suggestions */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 space-y-2">
            <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-sm">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Intelligent Demand & Surplus Recommendation</span>
            </div>
            <p className="text-xs text-emerald-800">
              💡 <strong>Transfer Before Waste:</strong> Main Canteen has 6 portions of Bisibele Bath remaining. Hostel Canteen evening demand is peaking (+18%). Consider dispatching 5 portions to Hostel Canteen to achieve 0% food waste.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="pb-3 px-3">Date</th>
                  <th className="pb-3 px-3">Branch</th>
                  <th className="pb-3 px-3">Item</th>
                  <th className="pb-3 px-3 text-center">Prepared</th>
                  <th className="pb-3 px-3 text-center">Sold</th>
                  <th className="pb-3 px-3 text-center">Wasted</th>
                  <th className="pb-3 px-3">Reason / Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {wasteRecords.map(w => (
                  <tr key={w.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-3 font-mono text-slate-600">{w.date}</td>
                    <td className="py-3 px-3 font-bold text-slate-800">{w.branch}</td>
                    <td className="py-3 px-3 font-black text-slate-900">{w.itemName}</td>
                    <td className="py-3 px-3 text-center font-bold text-blue-700">{w.preparedQty}</td>
                    <td className="py-3 px-3 text-center font-bold text-emerald-700">{w.soldQty}</td>
                    <td className="py-3 px-3 text-center font-bold text-rose-600">{w.wastedQty}</td>
                    <td className="py-3 px-3 text-slate-500">{w.reason || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 7: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-slate-700" />
              <span>Immutable System Audit Trail</span>
            </h3>
            <p className="text-xs text-slate-500">
              Complete historical record of administrative actions, role assignments, transfers, and price changes.
            </p>
          </div>

          <div className="space-y-2">
            {auditLogs.map(l => (
              <div key={l.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <span className="font-mono text-blue-600">{l.action}</span>
                    <span>•</span>
                    <span>{l.target}</span>
                  </div>
                  <span className="text-[11px] text-slate-500">Performed by: {l.user} ({l.role})</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  {new Date(l.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Add Course */}
      {isCourseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-xl font-black text-slate-900">Add Academic Course</h3>
            <form onSubmit={handleAddCourse} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Course Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BCA, MCA, B.Tech..."
                  value={courseCode}
                  onChange={e => setCourseCode(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bachelor of Computer Applications"
                  value={courseName}
                  onChange={e => setCourseName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-medium"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Program Type</label>
                  <select
                    value={courseType}
                    onChange={e => setCourseType(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-medium"
                  >
                    <option value="Degree">Degree</option>
                    <option value="Master's">Master's</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    placeholder="e.g. Computer Science"
                    value={courseDept}
                    onChange={e => setCourseDept(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-medium"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCourseModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-black shadow-md"
                >
                  Save Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Coupon */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-xl font-black text-slate-900">Create Coupon Code</h3>
            <form onSubmit={handleAddCoupon} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Coupon Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FESTIVAL20, BCA15"
                  value={couponCode}
                  onChange={e => setCouponCode(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 15% discount for BCA students"
                  value={couponDesc}
                  onChange={e => setCouponDesc(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-medium"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Discount %</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={discountPercent}
                    onChange={e => setDiscountPercent(parseInt(e.target.value) || 10)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Course</label>
                  <select
                    value={targetCourse}
                    onChange={e => setTargetCourse(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-medium"
                  >
                    <option value="All">All Students</option>
                    {courses.map(c => (
                      <option key={c.id} value={c.code}>{c.code}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCouponModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-600 text-white text-xs font-black shadow-md"
                >
                  Activate Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Log Food Waste */}
      {isWasteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-xl font-black text-slate-900">Record Food Waste</h3>
            <form onSubmit={handleAddWasteRecord} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Item Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Masala Dosa, Meals"
                  value={wasteItemName}
                  onChange={e => setWasteItemName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-medium"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Prepared</label>
                  <input
                    type="number"
                    value={wastePrepared}
                    onChange={e => setWastePrepared(parseInt(e.target.value) || 0)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Sold</label>
                  <input
                    type="number"
                    value={wasteSold}
                    onChange={e => setWasteSold(parseInt(e.target.value) || 0)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Wasted</label>
                  <input
                    type="number"
                    value={wasteWasted}
                    onChange={e => setWasteWasted(parseInt(e.target.value) || 0)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-medium"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Reason / Notes</label>
                <input
                  type="text"
                  value={wasteReason}
                  onChange={e => setWasteReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-medium"
                />
              </div>
              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsWasteModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-black shadow-md"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
