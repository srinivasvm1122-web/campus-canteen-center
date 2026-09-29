import React, { useState } from 'react';
import {
  UtensilsCrossed,
  ShoppingCart,
  Clock,
  LogOut,
  User,
  ShieldCheck,
  GraduationCap,
  Sparkles,
  ExternalLink,
  Share2,
  ChefHat,
  Bike,
  Store,
  ShieldAlert,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useCart } from '../context/CartContext.tsx';
import { NotificationsDropdown } from './NotificationsDropdown.tsx';
import { ShareAppModal } from './ShareAppModal.tsx';
import { CampusLogo } from './common/CampusLogo.tsx';
import { UserRole } from '../types.ts';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenCart: () => void;
  onSelectOrder?: (orderId: string) => void;
  onSwitchPortal?: (targetRole: UserRole) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenCart,
  onSelectOrder,
  onSwitchPortal,
}) => {
  const { user, logout } = useAuth();
  const { totalCount } = useCart();
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  const role = user?.role || 'student';
  const isDegree = user?.studentType === 'Degree';

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Top institution & lunch timing notice bar */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white text-xs py-1.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="bg-white/20 font-bold px-2 py-0.5 rounded text-[11px] tracking-wide text-cyan-300">
              CAMPUS DINING
            </span>
            <span className="hidden sm:inline font-medium text-slate-200">
              Smart College Canteen Management System
            </span>
            <span className="text-slate-400 hidden md:inline">•</span>
            <span className="text-amber-300 font-semibold tracking-wide italic text-[11px]">
              "Order Smart. Skip the Queue."
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            {role === 'student' && (
              <div className="flex items-center gap-1.5 bg-white/10 px-2 py-0.5 rounded-full border border-white/15">
                <Clock className="w-3 h-3 text-cyan-300" />
                <span>Lunch Timings:</span>
                <span className={`px-1.5 py-0.2 rounded font-medium ${isDegree ? 'bg-cyan-500 text-white font-bold' : 'text-slate-300'}`}>
                  Degree: 1:00–1:30 PM
                </span>
                <span className="text-slate-500">|</span>
                <span className={`px-1.5 py-0.2 rounded font-medium ${!isDegree ? 'bg-cyan-500 text-white font-bold' : 'text-slate-300'}`}>
                  Master's: 1:30–2:00 PM
                </span>
              </div>
            )}

            {/* Multi-Role Demo Switcher */}
            {onSwitchPortal && (
              <div className="relative">
                <button
                  onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                  className="flex items-center gap-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40 px-2.5 py-0.5 rounded-full transition-all text-[11px] font-semibold"
                  title="Switch portal for demonstration"
                >
                  <span>Portal: <strong className="capitalize">{role.replace('_', ' ')}</strong></span>
                  <ChevronDown className="w-3 h-3" />
                </button>

                {isRoleDropdownOpen && (
                  <div
                    className="absolute right-0 mt-1.5 w-48 bg-slate-900 border border-white/20 rounded-2xl shadow-2xl p-1.5 z-50 text-xs space-y-1"
                    onClick={() => setIsRoleDropdownOpen(false)}
                  >
                    {[
                      { r: 'student', label: '🎓 Student Portal' },
                      { r: 'operator', label: '📋 Operator Desk' },
                      { r: 'kitchen', label: '👨‍🍳 Kitchen KDS' },
                      { r: 'delivery', label: '🛵 Room Delivery' },
                      { r: 'branch_manager', label: '🏬 Branch Manager' },
                      { r: 'admin', label: '🛡️ System Admin' },
                    ].map(item => (
                      <button
                        key={item.r}
                        onClick={() => onSwitchPortal(item.r as UserRole)}
                        className={`w-full text-left px-3 py-1.5 rounded-xl font-medium transition-colors flex items-center justify-between ${
                          role === item.r ? 'bg-blue-600 text-white font-bold' : 'text-slate-200 hover:bg-white/10'
                        }`}
                      >
                        <span>{item.label}</span>
                        {role === item.r && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo & System Title */}
        <div
          onClick={() => setActiveTab('menu')}
          className="flex items-center gap-3 cursor-pointer select-none group"
        >
          {/* Universal Smart Campus Canteen Logo */}
          <CampusLogo size="md" withContainer className="group-hover:scale-105 transition-transform" />
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight leading-none group-hover:text-blue-700 transition-colors">
                ONLINE <span className="text-blue-700">CANTEEN CENTER</span>
              </h1>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                role === 'admin'
                  ? 'bg-rose-100 text-rose-800 border-rose-200'
                  : role === 'operator'
                  ? 'bg-amber-100 text-amber-800 border-amber-200'
                  : role === 'kitchen'
                  ? 'bg-orange-100 text-orange-800 border-orange-200'
                  : role === 'delivery'
                  ? 'bg-purple-100 text-purple-800 border-purple-200'
                  : role === 'branch_manager'
                  ? 'bg-teal-100 text-teal-800 border-teal-200'
                  : 'hidden'
              }`}>
                {role.replace('_', ' ')}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Smart College Canteen Management
            </p>
          </div>
        </div>

        {/* Desktop Tabs for Student */}
        {role === 'student' && (
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
            <button
              onClick={() => setActiveTab('menu')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'menu'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🍽️ Today's Menu
            </button>
            <button
              onClick={() => setActiveTab('tracking')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'tracking'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Tracking
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'history'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              📜 Order History
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'profile'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              👤 Profile
            </button>
          </nav>
        )}

        {/* Right actions: Cart, Notifications, Profile & Logout */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Share App Link Button */}
          <button
            onClick={() => setIsShareOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-all font-semibold text-xs border border-emerald-200/60"
            title="Share booking link with friends"
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Share</span>
          </button>

          {/* Student Cart Button */}
          {role === 'student' && (
            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 transition-all font-semibold text-xs border border-blue-200/60"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Cart</span>
              {totalCount > 0 && (
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-blue-700 px-1.5 text-[11px] font-bold text-white shadow-xs">
                  {totalCount}
                </span>
              )}
            </button>
          )}

          {/* Notifications Dropdown */}
          <NotificationsDropdown onSelectOrder={onSelectOrder} />

          {/* Role Portal Switcher */}
          {onSwitchPortal && (
            <div className="relative">
              <button
                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-300 transition-colors shadow-2xs"
                title="Switch Portal Role"
              >
                <span className="capitalize">{role === 'branch_manager' ? 'Branch Mgr' : role}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </button>

              {isRoleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    Switch Role View
                  </div>
                  {[
                    { roleKey: 'student' as UserRole, label: '🎓 Student Portal', desc: 'Menu, Cart & Pickup' },
                    { roleKey: 'operator' as UserRole, label: '👨‍💼 Canteen Operator', desc: 'Queue & Token Verify' },
                    { roleKey: 'kitchen' as UserRole, label: '🍳 Kitchen Staff', desc: 'Live Prep Dashboard' },
                    { roleKey: 'delivery' as UserRole, label: '🛵 Room Delivery', desc: 'Hostel Deliveries' },
                    { roleKey: 'branch_manager' as UserRole, label: '🏬 Branch Manager', desc: 'Transfers & Stock' },
                    { roleKey: 'admin' as UserRole, label: '⚙️ Super Admin', desc: 'Full System Control' },
                  ].map(item => (
                    <button
                      key={item.roleKey}
                      onClick={() => {
                        setIsRoleDropdownOpen(false);
                        onSwitchPortal(item.roleKey);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs transition-colors hover:bg-blue-50/70 flex items-center justify-between ${
                        role === item.roleKey ? 'font-bold bg-blue-50 text-blue-700' : 'text-slate-700'
                      }`}
                    >
                      <div>
                        <div className="font-semibold">{item.label}</div>
                        <div className="text-[10px] text-slate-400">{item.desc}</div>
                      </div>
                      {role === item.roleKey && (
                        <span className="w-2 h-2 rounded-full bg-blue-600" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* User Badge */}
          {user && (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div
                onClick={() => role === 'student' && setActiveTab('profile')}
                className="hidden sm:flex flex-col text-right cursor-pointer"
              >
                <span className="text-xs font-bold text-slate-800 leading-tight">
                  {user.name.split(' ')[0]}
                </span>
                <span className="text-[10px] text-slate-500 font-medium capitalize">
                  {role === 'student' ? `${user.studentType} • ${user.studentId || 'Student'}` : role.replace('_', ' ')}
                </span>
              </div>
              <button
                onClick={logout}
                className="p-2 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Share Modal */}
      <ShareAppModal isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} />
    </header>
  );
};
