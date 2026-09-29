import React, { useState } from 'react';
import {
  GraduationCap,
  ShieldCheck,
  UserPlus,
  LogIn,
  CheckCircle2,
  Clock,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Phone,
  BookOpen,
  Lock,
  Mail,
  User as UserIcon,
  Eye,
  EyeOff,
  MapPin,
  QrCode,
  Flame,
  Coffee,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { CampusLogo } from './common/CampusLogo.tsx';

interface LandingHeroProps {
  initialMode?: 'student' | 'operator' | 'register';
}

export const LandingHero: React.FC<LandingHeroProps> = ({ initialMode = 'student' }) => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'student' | 'operator' | 'register'>(initialMode);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Registration states
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [phone, setPhone] = useState('');
  const [course, setCourse] = useState('BCA');
  const [year, setYear] = useState('3rd Year');
  const [studentType, setStudentType] = useState<'Degree' | 'Master\'s'>('Degree');

  // UI feedback
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [regSuccess, setRegSuccess] = useState<string | null>(null);

  const handleDemoFill = (type: 'rahul' | 'priya' | 'operator' | 'kitchen' | 'delivery' | 'manager' | 'admin') => {
    setError(null);
    if (type === 'rahul') {
      setMode('student');
      setEmail('rahul@campus.edu');
      setPassword('student123');
    } else if (type === 'priya') {
      setMode('student');
      setEmail('priya@campus.edu');
      setPassword('student123');
    } else if (type === 'operator') {
      setMode('operator');
      setEmail('srinivasvm1122@gmail.com');
      setPassword('810522');
    } else if (type === 'kitchen') {
      setMode('operator');
      setEmail('kitchen@campus.edu');
      setPassword('kitchen123');
    } else if (type === 'delivery') {
      setMode('operator');
      setEmail('delivery@campus.edu');
      setPassword('delivery123');
    } else if (type === 'manager') {
      setMode('operator');
      setEmail('manager@campus.edu');
      setPassword('manager123');
    } else if (type === 'admin') {
      setMode('operator');
      setEmail('admin@campus.edu');
      setPassword('admin123');
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login({
        email,
        password,
        expectedRole: mode === 'operator' ? 'operator' : 'student',
      });
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await register({
        name,
        studentId,
        email,
        password,
        phone,
        course,
        year,
        studentType,
      });
      setRegSuccess('Registration successful! You can now log in with your credentials.');
      setMode('student');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please verify your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-hidden bg-slate-950 font-sans selection:bg-cyan-500 selection:text-white">
      {/* Modern Canteen Dining & Food Court Photo Background */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-all duration-700"
        style={{
          backgroundImage: `url('/canteen_bg.jpg')`,
        }}
      >
        {/* Soft balanced gradient overlay: text side has readable contrast, food court atmosphere remains warm and vibrant */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/65 to-slate-950/35" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/70" />
        {/* Subtle warm appetizing highlight */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-amber-400/15 via-orange-400/5 to-transparent pointer-events-none" />
      </div>

      {/* Canteen Location Tag Badge */}
      <div className="absolute bottom-4 left-4 z-10 hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/20 text-xs text-slate-200 shadow-lg">
        <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
        <span className="font-semibold text-white">Online Canteen Center</span>
        <span className="text-slate-400">• Food Court & Digital Pickup Counters</span>
      </div>

      {/* Top Institution Navigation Bar */}
      <header className="relative z-10 w-full py-3.5 px-4 sm:px-8 border-b border-white/15 bg-slate-950/60 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Universal Smart Campus Canteen Logo */}
            <CampusLogo size="md" withContainer className="shadow-xl shadow-cyan-950/50" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm sm:text-base tracking-wide text-white drop-shadow-sm">
                  ONLINE CANTEEN CENTER
                </span>
              </div>
              <p className="text-[11px] text-cyan-300 font-bold tracking-widest uppercase flex items-center gap-1.5">
                <span>Smart Campus Dining</span>
                <span className="text-white/40">•</span>
                <span className="text-amber-300">Digital Token System</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-3.5 py-1.5 rounded-full font-bold flex items-center gap-2 shadow-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span>Canteen Open</span>
            </span>
          </div>
        </div>
      </header>

      {/* Hero Content & Visual Login Presentation */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-4 sm:px-8 py-6 lg:py-10 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
        {/* Left Side: Brand Story, Tagline, Menu Highlights & Timings */}
        <div className="w-full lg:w-1/2 text-white space-y-5">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600/30 to-cyan-500/30 border border-cyan-400/40 text-cyan-200 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide backdrop-blur-md shadow-md">
            <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
            <span>Smart College Canteen & Token Management</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight drop-shadow-md">
              ONLINE <span className="text-sky-400">CANTEEN</span> <br />
              <span className="bg-gradient-to-r from-cyan-300 via-sky-200 to-amber-300 bg-clip-text text-transparent">
                CENTER
              </span>
            </h1>
            <p className="text-lg sm:text-xl font-extrabold text-amber-300 tracking-wide flex items-center gap-2 italic drop-shadow-sm">
              "Order Smart. Skip the Queue."
            </p>
          </div>

          <p className="text-slate-200 text-sm sm:text-base max-w-xl leading-relaxed drop-shadow-xs">
            Pre-order delicious South Indian breakfast, lunch, and beverages right from your phone. Pick your exact lunch pickup slot, get an instant digital token, and pick up without standing in long queues!
          </p>

          {/* Canteen Feature Chips */}
          <div className="flex flex-wrap gap-2.5 pt-1">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/70 border border-white/15 backdrop-blur-md text-xs font-semibold text-slate-200">
              <QrCode className="w-3.5 h-3.5 text-cyan-400" />
              <span>Instant Digital Token</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/70 border border-white/15 backdrop-blur-md text-xs font-semibold text-slate-200">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>5-10 Min Fast Prep</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/70 border border-white/15 backdrop-blur-md text-xs font-semibold text-slate-200">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span>Hot & Fresh Meals</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/70 border border-white/15 backdrop-blur-md text-xs font-semibold text-slate-200">
              <Coffee className="w-3.5 h-3.5 text-amber-300" />
              <span>Filter Coffee & Tea</span>
            </div>
          </div>

          {/* Designated Lunch Windows Card */}
          <div className="bg-slate-900/75 backdrop-blur-xl rounded-2xl p-4 border border-cyan-500/20 shadow-xl max-w-lg space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-cyan-300 text-xs font-extrabold uppercase tracking-wider">
                <Clock className="w-4 h-4 text-cyan-400" />
                Official Campus Lunch Timings
              </div>
              <span className="text-[10px] font-bold bg-cyan-950/80 text-cyan-300 px-2.5 py-0.5 rounded-full border border-cyan-500/30">
                Scheduled Slots
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs pt-1">
              <div className="bg-slate-950/80 p-3 rounded-xl border border-white/10 hover:border-blue-500/40 transition-colors">
                <span className="text-blue-300 font-bold block text-xs">🎓 Degree Students</span>
                <span className="text-base font-black text-white mt-0.5 block">1:00 PM – 1:30 PM</span>
                <span className="text-[10px] text-slate-300 mt-1 block">BCA • BBA • B.Com</span>
              </div>
              <div className="bg-slate-950/80 p-3 rounded-xl border border-white/10 hover:border-indigo-500/40 transition-colors">
                <span className="text-indigo-300 font-bold block text-xs">🎓 Master's Students</span>
                <span className="text-base font-black text-white mt-0.5 block">1:30 PM – 2:00 PM</span>
                <span className="text-[10px] text-slate-300 mt-1 block">MCA • MBA • M.Com</span>
              </div>
            </div>
          </div>

          {/* Quick 1-Click Demo Buttons */}
          <div className="pt-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-cyan-200 font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                1-Click Quick Demo Sign In:
              </span>
              <span className="text-[11px] text-slate-400">Click to autofill</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleDemoFill('rahul')}
                className="text-xs bg-slate-900/80 hover:bg-blue-600/30 text-white border border-blue-400/30 hover:border-blue-400 px-3 py-1.5 rounded-xl transition-all font-bold flex items-center gap-1.5 shadow-sm"
              >
                <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center text-[10px] text-white">
                  R
                </div>
                <span>Rahul (Student)</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('operator')}
                className="text-xs bg-slate-900/80 hover:bg-amber-600/30 text-white border border-amber-400/30 hover:border-amber-400 px-3 py-1.5 rounded-xl transition-all font-bold flex items-center gap-1.5 shadow-sm"
              >
                <div className="w-4 h-4 rounded-full bg-amber-600 flex items-center justify-center text-[10px] text-white">
                  S
                </div>
                <span>Srinivas (Operator)</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('kitchen')}
                className="text-xs bg-slate-900/80 hover:bg-orange-600/30 text-white border border-orange-400/30 hover:border-orange-400 px-3 py-1.5 rounded-xl transition-all font-bold flex items-center gap-1.5 shadow-sm"
              >
                <div className="w-4 h-4 rounded-full bg-orange-600 flex items-center justify-center text-[10px] text-white">
                  K
                </div>
                <span>Kitchen Staff</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('delivery')}
                className="text-xs bg-slate-900/80 hover:bg-purple-600/30 text-white border border-purple-400/30 hover:border-purple-400 px-3 py-1.5 rounded-xl transition-all font-bold flex items-center gap-1.5 shadow-sm"
              >
                <div className="w-4 h-4 rounded-full bg-purple-600 flex items-center justify-center text-[10px] text-white">
                  D
                </div>
                <span>Delivery</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('manager')}
                className="text-xs bg-slate-900/80 hover:bg-teal-600/30 text-white border border-teal-400/30 hover:border-teal-400 px-3 py-1.5 rounded-xl transition-all font-bold flex items-center gap-1.5 shadow-sm"
              >
                <div className="w-4 h-4 rounded-full bg-teal-600 flex items-center justify-center text-[10px] text-white">
                  M
                </div>
                <span>Branch Manager</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('admin')}
                className="text-xs bg-slate-900/80 hover:bg-rose-600/30 text-white border border-rose-400/30 hover:border-rose-400 px-3 py-1.5 rounded-xl transition-all font-bold flex items-center gap-1.5 shadow-sm"
              >
                <div className="w-4 h-4 rounded-full bg-rose-600 flex items-center justify-center text-[10px] text-white">
                  A
                </div>
                <span>Admin</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Enhanced Visualisation Auth Card */}
        <div className="w-full lg:w-[480px]">
          <div className="relative bg-white/95 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/60 text-slate-900 transition-all shadow-black/40 ring-1 ring-black/5">
            {/* Ambient visual badge */}
            <div className="absolute -top-3 right-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white text-[10px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md">
              Secure Campus Portal
            </div>

            {/* Top Auth Mode Tabs */}
            <div className="flex rounded-2xl bg-slate-100 p-1.5 mb-5 border border-slate-200/90 shadow-inner">
              <button
                type="button"
                onClick={() => {
                  setMode('student');
                  setError(null);
                }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  mode === 'student'
                    ? 'bg-blue-700 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                Student
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('operator');
                  setError(null);
                }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  mode === 'operator'
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                Operator
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError(null);
                }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  mode === 'register'
                    ? 'bg-indigo-700 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                Register
              </button>
            </div>

            {/* Context Notice Banner */}
            <div className="mb-4">
              {mode === 'student' && (
                <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200/70 flex items-center gap-2 text-xs text-blue-900 font-medium">
                  <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                  <span>Order lunch, view your live tokens & track preparation</span>
                </div>
              )}
              {mode === 'operator' && (
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200/70 flex items-center gap-2 text-xs text-amber-900 font-medium">
                  <div className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
                  <span>Kitchen counter portal: fulfill tokens & manage menu</span>
                </div>
              )}
              {mode === 'register' && (
                <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-200/70 flex items-center gap-2 text-xs text-indigo-900 font-medium">
                  <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                  <span>Create your campus ID to enjoy smart queue-free meals</span>
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            {/* Success Message */}
            {regSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                <span>{regSuccess}</span>
              </div>
            )}

            {/* LOGIN FORM (Student or Operator) */}
            {mode !== 'register' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="text-left mb-2">
                  <h3 className="text-xl font-black text-slate-900 flex items-center justify-between">
                    <span>{mode === 'student' ? 'Student Sign In' : 'Canteen Operator Desk'}</span>
                    <span className="text-xs font-bold text-slate-400">Campus Canteen</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {mode === 'student'
                      ? 'Enter your credentials to pre-order lunch & view token.'
                      : 'Authorized staff login for live order management & tokens.'}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder={mode === 'operator' ? 'srinivasvm1122@gmail.com' : 'student@campus.edu'}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-800 font-medium transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      {mode === 'operator' ? 'Staff PIN / Password' : 'Password'}
                    </label>
                    {mode === 'operator' && (
                      <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-medium">
                        Authorized Staff Only
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-800 font-medium transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 px-4 rounded-xl text-white font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    mode === 'operator'
                      ? 'bg-gradient-to-r from-amber-600 via-amber-700 to-orange-600 hover:from-amber-700 hover:to-orange-700 shadow-amber-600/30'
                      : 'bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 shadow-blue-700/30'
                  }`}
                >
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      Sign In to {mode === 'operator' ? 'Operator Desk' : 'Student Portal'}
                    </>
                  )}
                </button>

                {mode === 'student' && (
                  <div className="text-center pt-2 border-t border-slate-100">
                    <p className="text-xs text-slate-500">
                      New campus student?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setMode('register');
                          setError(null);
                        }}
                        className="text-blue-700 font-bold hover:underline"
                      >
                        Create an account
                      </button>
                    </p>
                  </div>
                )}
              </form>
            )}

            {/* REGISTRATION FORM (Student) */}
            {mode === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-3">
                <div className="text-left mb-1">
                  <h3 className="text-lg font-black text-slate-900">Student Registration</h3>
                  <p className="text-xs text-slate-500">
                    Enter your college details for your personalized canteen account.
                  </p>
                </div>

                {/* Full Name & Student ID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g. Rahul Gowda"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Student ID
                    </label>
                    <input
                      type="text"
                      required
                      value={studentId}
                      onChange={e => setStudentId(e.target.value)}
                      placeholder="e.g. VIM2024BCA104"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-800 uppercase font-semibold"
                    />
                  </div>
                </div>

                {/* Email & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      College Email
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="rahul@campus.edu"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="+91 99012 34567"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-800"
                    />
                  </div>
                </div>

                {/* Student Type: Degree vs Master's */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Student Type & Lunch Window
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setStudentType('Degree')}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        studentType === 'Degree'
                          ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold shadow-xs'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="block text-xs font-bold">Degree Student</span>
                        {studentType === 'Degree' && <Check className="w-3.5 h-3.5 text-blue-600" />}
                      </div>
                      <span className="block text-[10px] text-blue-700 mt-0.5 font-medium">
                        🕒 1:00 PM – 1:30 PM
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setStudentType('Master\'s')}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        studentType === 'Master\'s'
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold shadow-xs'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="block text-xs font-bold">Master's Student</span>
                        {studentType === 'Master\'s' && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                      </div>
                      <span className="block text-[10px] text-indigo-700 mt-0.5 font-medium">
                        🕒 1:30 PM – 2:00 PM
                      </span>
                    </button>
                  </div>
                </div>

                {/* Course & Year */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Course / Branch <span className="text-blue-600 font-normal">(Type your course)</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={course}
                      onChange={e => setCourse(e.target.value)}
                      placeholder={studentType === 'Degree' ? 'e.g. BCA, B.Tech, B.Com, BBA...' : 'e.g. MCA, MBA, M.Tech, M.Com...'}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 transition-all placeholder:text-slate-400"
                    />
                    {/* Quick suggestion chips */}
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {(studentType === 'Degree'
                        ? ['BCA', 'B.Tech', 'B.Com', 'BBA', 'B.Sc', 'BA']
                        : ['MCA', 'MBA', 'M.Tech', 'M.Com', 'M.Sc']
                      ).map(sug => (
                        <button
                          key={sug}
                          type="button"
                          onClick={() => setCourse(sug)}
                          className={`text-[10px] px-1.5 py-0.5 rounded-md border transition-all ${
                            course.toLowerCase() === sug.toLowerCase()
                              ? 'bg-blue-600 text-white border-blue-600 font-bold'
                              : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                          }`}
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Year / Semester
                    </label>
                    <select
                      value={year}
                      onChange={e => setYear(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 transition-all"
                    >
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                      <option value="Final Year">Final Year</option>
                    </select>
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Create your secure password"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-800"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-xl text-white font-bold text-xs shadow-lg bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer"
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Create Student Account & Continue
                    </>
                  )}
                </button>

                <div className="text-center pt-1 border-t border-slate-100">
                  <p className="text-xs text-slate-500">
                    Already registered?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setMode('student');
                        setError(null);
                      }}
                      className="text-blue-700 font-bold hover:underline"
                    >
                      Sign In here
                    </button>
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full py-3 px-4 text-center text-xs text-slate-300 bg-slate-950/70 backdrop-blur-md border-t border-white/10">
        <p>
          © 2026 Online Canteen Center • Smart Campus Dining & Digital Token System. Powered by Modern Full-Stack Web Architecture.
        </p>
      </footer>
    </div>
  );
};
