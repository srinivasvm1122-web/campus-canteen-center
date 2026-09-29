import React, { useState } from 'react';
import {
  User,
  GraduationCap,
  Clock,
  Phone,
  Mail,
  BookOpen,
  Calendar,
  Save,
  CheckCircle2,
  AlertCircle,
  Building,
  Home,
  Layers
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';

export const StudentProfileView: React.FC = () => {
  const { user, updateUserProfile } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [course, setCourse] = useState(user?.course || 'BCA');
  const [department, setDepartment] = useState(user?.department || 'Department of Computer Applications');
  const [year, setYear] = useState(user?.year || '3rd Year');
  const [semester, setSemester] = useState(user?.semester || '5th Semester');
  const [section, setSection] = useState(user?.section || 'Section A');
  const [hostelBuilding, setHostelBuilding] = useState(user?.hostelBuilding || 'Hostel Block A');
  const [roomNumber, setRoomNumber] = useState(user?.roomNumber || '204');
  const [studentType, setStudentType] = useState<'Degree' | 'Master\'s'>(user?.studentType || 'Degree');

  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      await updateUserProfile({
        name,
        phone,
        course,
        department,
        year,
        semester,
        section,
        hostelBuilding,
        roomNumber,
        studentType,
      });
      setFeedback({ type: 'success', message: 'Profile updated successfully!' });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Student Profile</h2>
        <p className="text-xs text-slate-500 mt-1">
          Manage your student identification details, hostel room address, and verified campus lunch schedule.
        </p>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-2xl text-xs flex items-center gap-2 border ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* College ID Card Badge */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-cyan-400 to-blue-500 text-slate-900 flex items-center justify-center font-black text-2xl shadow-lg shrink-0">
            {user?.name.charAt(0) || 'S'}
          </div>
          <div className="space-y-1.5 flex-1">
            <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-widest bg-white/10 px-2 py-0.5 rounded-md">
              ONLINE CANTEEN CENTER • CAMPUS DINING PASS
            </span>
            <h3 className="text-2xl font-black tracking-tight text-white">{user?.name}</h3>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs text-slate-300">
              <span className="font-mono bg-black/40 px-2 py-0.5 rounded text-amber-300 font-bold">
                {user?.studentId || 'CAM-STUDENT'}
              </span>
              <span>•</span>
              <span>{user?.course || 'BCA'}</span>
              <span>•</span>
              <span>{user?.email}</span>
            </div>
            <div className="text-xs text-slate-400">
              <span>📍 {hostelBuilding} • Room {roomNumber}</span>
            </div>
          </div>
        </div>

        {/* Lunch slot badge */}
        <div className="mt-6 pt-4 border-t border-white/15 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-300" />
            <span className="text-slate-300">Lunch Schedule:</span>
            <span className="font-bold text-amber-300">
              {user?.studentType === 'Degree' ? '1:00 PM – 1:30 PM (Degree)' : '1:30 PM – 2:00 PM (Master\'s)'}
            </span>
          </div>
          <span className="bg-cyan-500/20 text-cyan-300 px-2.5 py-0.5 rounded-full text-[11px] font-bold border border-cyan-400/30">
            Verified Student
          </span>
        </div>
      </div>

      {/* Edit Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs space-y-4">
        <h4 className="font-extrabold text-base text-slate-900 pb-2 border-b border-slate-100 flex items-center justify-between">
          <span>Personal & Academic Details</span>
          <span className="text-xs font-normal text-slate-500">Auto-saved for room delivery & tokens</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-600 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-600 focus:bg-white"
            />
          </div>
        </div>

        {/* Student Type Selection */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Academic Program Level</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setStudentType('Degree')}
              className={`p-3 rounded-2xl border text-left transition-all ${
                studentType === 'Degree'
                  ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold shadow-xs'
                  : 'border-slate-200 bg-slate-50 text-slate-700'
              }`}
            >
              <span className="block text-xs font-bold">Degree Student</span>
              <span className="block text-[11px] text-blue-700 mt-0.5">1:00 PM – 1:30 PM</span>
            </button>
            <button
              type="button"
              onClick={() => setStudentType('Master\'s')}
              className={`p-3 rounded-2xl border text-left transition-all ${
                studentType === 'Master\'s'
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold shadow-xs'
                  : 'border-slate-200 bg-slate-50 text-slate-700'
              }`}
            >
              <span className="block text-xs font-bold">Master's Student</span>
              <span className="block text-[11px] text-indigo-700 mt-0.5">1:30 PM – 2:00 PM</span>
            </button>
          </div>
        </div>

        {/* Academic Course & Department */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Course / Program</label>
            <select
              value={course}
              onChange={e => setCourse(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-600"
            >
              {studentType === 'Degree' ? (
                <>
                  <option value="BCA">BCA (Computer Applications)</option>
                  <option value="BBA">BBA (Business Administration)</option>
                  <option value="BCom">BCom (Commerce)</option>
                  <option value="BSc">BSc (Science / CS)</option>
                  <option value="BA">BA (Arts / Humanities)</option>
                  <option value="BE/BTech">BE / BTech (Engineering)</option>
                  <option value="Other Degree">Other Degree Program</option>
                </>
              ) : (
                <>
                  <option value="MCA">MCA (Master of Computer App)</option>
                  <option value="MBA">MBA (Master of Business Admin)</option>
                  <option value="MSc">MSc (Computer Science / Biotech)</option>
                  <option value="MCom">MCom (Master of Commerce)</option>
                  <option value="MA">MA (Master of Arts)</option>
                  <option value="Other Master's">Other Master's Program</option>
                </>
              )}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
            <input
              type="text"
              value={department}
              onChange={e => setDepartment(e.target.value)}
              placeholder="e.g. Department of Computer Science"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-600 focus:bg-white"
            />
          </div>
        </div>

        {/* Year, Semester & Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Academic Year</label>
            <select
              value={year}
              onChange={e => setYear(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-600"
            >
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              {studentType === 'Degree' && <option value="3rd Year">3rd Year</option>}
              {studentType === 'Degree' && <option value="4th Year">4th Year</option>}
              <option value="Final Year">Final Year</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Semester</label>
            <select
              value={semester}
              onChange={e => setSemester(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-600"
            >
              {['1st Semester', '2nd Semester', '3rd Semester', '4th Semester', '5th Semester', '6th Semester', '7th Semester', '8th Semester'].map(
                s => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                )
              )}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Section</label>
            <input
              type="text"
              value={section}
              onChange={e => setSection(e.target.value)}
              placeholder="e.g. Section A"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>

        {/* Hostel & Room Delivery Address */}
        <div className="pt-2 border-t border-slate-100">
          <h5 className="text-xs font-bold text-slate-800 mb-2.5 flex items-center gap-1.5">
            <Home className="w-3.5 h-3.5 text-blue-700" />
            <span>Campus Room Delivery Address (Hostel / Campus Block)</span>
          </h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Hostel / Campus Building</label>
              <select
                value={hostelBuilding}
                onChange={e => setHostelBuilding(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-600"
              >
                <option value="Hostel Block A">Hostel Block A (Men's Hostel)</option>
                <option value="Hostel Block B">Hostel Block B (Women's Hostel)</option>
                <option value="Department Block A">Department Block A (CS Wing)</option>
                <option value="Department Block B">Department Block B (Commerce & Mgmt)</option>
                <option value="Central Library">Central Library Study Zone</option>
                <option value="Day Scholar">Day Scholar (Counter Pickup Only)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Room / Desk Number</label>
              <input
                type="text"
                value={roomNumber}
                onChange={e => setRoomNumber(e.target.value)}
                placeholder="e.g. 204 or Desk 12"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>
        </div>

        <div className="pt-3">
          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 px-4 rounded-xl text-white font-extrabold text-xs shadow-lg bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {saving ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Profile Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
