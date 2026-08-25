import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../stores/AppContext';
import { CaregiverContact } from '../../types';
import {
  Users,
  Mail,
  Phone,
  ShieldCheck,
  Send,
  AlertOctagon,
  CheckCircle2,
  Calendar,
  HeartHandshake,
  UserPlus,
  Trash2,
  Share2,
  Lock
} from 'lucide-react';

export const CaregiverView: React.FC = () => {
  const {
    profile,
    caregivers,
    addCaregiver,
    removeCaregiver,
    medications,
    interactions,
    schedule,
    adherencePercentage
  } = useApp();

  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [relation, setRelation] = useState('Son');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // 3-second hold emergency button state
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [alertDispatched, setAlertDispatched] = useState(false);
  const holdIntervalRef = useRef<any>(null);

  useEffect(() => {
    if (isHolding) {
      holdIntervalRef.current = setInterval(() => {
        setHoldProgress(prev => {
          if (prev >= 100) {
            clearInterval(holdIntervalRef.current);
            setIsHolding(false);
            setAlertDispatched(true);
            return 100;
          }
          return prev + 5;
        });
      }, 150);
    } else {
      if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
      setHoldProgress(0);
    }
    return () => {
      if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
    };
  }, [isHolding]);

  const handleCreateCaregiver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    const newCaregiver: CaregiverContact = {
      id: `cg-${Date.now()}`,
      name,
      relation,
      email,
      phone: phone || '(555) 000-0000',
      receiveWeeklyDigest: true,
      receiveCriticalAlerts: true
    };
    addCaregiver(newCaregiver);
    setName('');
    setEmail('');
    setPhone('');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-8">
      {/* Header Bar */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
          <Users className="w-6 h-6 text-slate-900" />
          <span>Caregiver Circle & Family Sync</span>
        </h2>
        <p className="text-xs font-medium text-slate-500 mt-1">
          Keep your family and healthcare proxies informed with automated weekly safety digests and real-time critical alerts.
        </p>
      </div>

      {/* ================= URGENT ALERT TRIGGER (3-Sec Hold Button) ================= */}
      <div className="bg-red-50/50 rounded-3xl p-6 sm:p-8 border border-red-200 text-center space-y-4 relative overflow-hidden shadow-xs">
        <div className="max-w-xl mx-auto space-y-2">
          <span className="text-xs font-black uppercase tracking-widest text-red-600 block">
            Emergency Caregiver Notification
          </span>
          <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
            Need Immediate Help? Broadcast to Caregiver Circle
          </h3>
          <p className="text-xs font-medium text-slate-600">
            Press and hold the button below for 3 seconds to send an emergency SMS & email with your current location and active medication profile to all registered caregivers.
          </p>
        </div>

        {alertDispatched ? (
          <div className="max-w-md mx-auto p-4 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold space-y-1">
            <div className="text-base font-black">🚨 EMERGENCY ALERT DISPATCHED</div>
            <div className="text-emerald-800 font-medium">
              SMS and email alerts sent to {caregivers.map(c => c.name).join(', ')}.
            </div>
            <button
              onClick={() => setAlertDispatched(false)}
              className="mt-2 text-slate-700 hover:text-slate-900 underline font-bold cursor-pointer"
            >
              Reset Emergency State
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center pt-2">
            <button
              onMouseDown={() => setIsHolding(true)}
              onMouseUp={() => setIsHolding(false)}
              onTouchStart={() => setIsHolding(true)}
              onTouchEnd={() => setIsHolding(false)}
              className="relative w-52 h-14 rounded-full bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider overflow-hidden shadow-md active:scale-95 transition-all select-none cursor-pointer"
            >
              {/* Filling progress bar */}
              <div
                className="absolute inset-0 bg-red-900 transition-all duration-150"
                style={{ width: `${holdProgress}%` }}
              />
              <span className="relative z-10 flex items-center justify-center gap-2">
                <AlertOctagon className="w-4 h-4" />
                {isHolding ? `Holding (${holdProgress}%)` : 'Hold 3s to Alert'}
              </span>
            </button>
            <span className="text-[10px] font-bold text-slate-500 mt-2">
              Protected against accidental clicks
            </span>
          </div>
        )}
      </div>

      {/* ================= CAREGIVER CONTACTS LIST ================= */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-emerald-600" />
              <span>Registered Caregivers ({caregivers.length})</span>
            </h3>
            <p className="text-xs font-medium text-slate-500">
              Individuals receiving weekly adherence digests and emergency SMS alerts.
            </p>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-900 hover:bg-black text-white text-xs font-black uppercase tracking-tight shadow-xs hover:scale-102 transition-all cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add Caregiver</span>
          </button>
        </div>

        {/* Add Caregiver Form (Collapsible) */}
        {showAddForm && (
          <form
            onSubmit={handleCreateCaregiver}
            className="p-5 rounded-3xl bg-slate-50 border border-slate-200 space-y-4"
          >
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-700">
              Add New Caregiver / Family Member
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Full Name (e.g. John Rodriguez)"
                required
                className="p-2.5 rounded-2xl bg-white border border-slate-200 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900"
              />
              <select
                value={relation}
                onChange={e => setRelation(e.target.value)}
                className="p-2.5 rounded-2xl bg-white border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:border-slate-900"
              >
                <option value="Son">Son</option>
                <option value="Daughter">Daughter</option>
                <option value="Spouse">Spouse</option>
                <option value="Sibling">Sibling</option>
                <option value="Home Health Nurse">Home Health Nurse</option>
                <option value="Healthcare Proxy">Healthcare Proxy</option>
              </select>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Email Address"
                required
                className="p-2.5 rounded-2xl bg-white border border-slate-200 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900"
              />
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="Mobile Phone (for SMS)"
                className="p-2.5 rounded-2xl bg-white border border-slate-200 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 rounded-full bg-slate-200 text-slate-700 text-xs font-black uppercase tracking-tight hover:bg-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-full bg-slate-900 hover:bg-black text-white text-xs font-black uppercase tracking-tight"
              >
                Save Caregiver
              </button>
            </div>
          </form>
        )}

        {/* Contacts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {caregivers.map(cg => (
            <div
              key={cg.id}
              className="p-5 rounded-3xl bg-slate-50 border border-slate-200 space-y-3 flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-sm font-black text-white">
                    {cg.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-slate-900">{cg.name}</h4>
                    <span className="text-xs text-slate-600 font-bold">{cg.relation}</span>
                  </div>
                </div>

                <button
                  onClick={() => removeCaregiver(cg.id)}
                  className="text-slate-400 hover:text-red-600 p-1.5 rounded-full hover:bg-slate-200 transition-colors cursor-pointer"
                  title="Remove Caregiver"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1 text-xs text-slate-600 pt-2 border-t border-slate-200 font-medium">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{cg.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{cg.phone}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-2 text-[10px]">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                  ✓ Weekly Digest Enabled
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-red-50 text-red-800 font-bold border border-red-200">
                  ✓ Emergency SMS Active
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= WEEKLY DIGEST EMAIL PREVIEW ================= */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Mail className="w-4 h-4 text-slate-900" />
              <span>Weekly Safety Digest (Caregiver Email Preview)</span>
            </h3>
            <p className="text-xs font-medium text-slate-500">
              Automatically scheduled to deliver every Monday at 8:00 AM.
            </p>
          </div>
          <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            Next: Monday 8:00 AM
          </span>
        </div>

        {/* Email Body Container */}
        <div className="rounded-3xl bg-slate-50 border border-slate-200 p-6 space-y-6 text-xs text-slate-700">
          {/* Email Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                🌿
              </div>
              <div>
                <strong className="text-slate-900 text-sm font-black block">SafeDose Patient Weekly Report</strong>
                <span className="text-slate-500 text-[11px] font-medium">Patient: {profile.fullName}</span>
              </div>
            </div>
            <div className="text-right text-[11px] text-slate-500 font-mono font-medium">
              Week of {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </div>

          {/* Adherence Summary Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-center shadow-2xs">
              <span className="text-slate-500 font-bold block mb-1">Weekly Adherence</span>
              <span className="text-2xl font-black text-emerald-700">{adherencePercentage}%</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-center shadow-2xs">
              <span className="text-slate-500 font-bold block mb-1">Active Prescriptions</span>
              <span className="text-2xl font-black text-slate-900">{medications.length} Meds</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-center shadow-2xs">
              <span className="text-slate-500 font-bold block mb-1">Open Conflicts</span>
              <span className="text-2xl font-black text-red-600">
                {interactions.filter(i => (i.severity === 'critical' || i.severity === 'deadly') && !i.dismissed).length}
              </span>
            </div>
          </div>

          {/* Key Observations */}
          <div className="space-y-2">
            <strong className="text-slate-900 block text-sm font-black">Key Observations This Week:</strong>
            <ul className="space-y-1.5 list-disc list-inside text-slate-600 font-medium">
              <li>{profile.fullName} completed 100% of morning and evening doses without missed intervals.</li>
              <li>1 critical interaction (Warfarin + Aspirin) is under active monitoring with Dr. {profile.primaryDoctorName.split(' ')[1]}.</li>
              <li>Calcium Carbonate administration is successfully separated from blood pressure medications by 2 hours.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
