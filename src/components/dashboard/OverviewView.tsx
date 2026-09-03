import React, { useState } from 'react';
import { useApp } from '../../stores/AppContext';
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Pill,
  MessageSquareHeart,
  Share2,
  RefreshCw,
  PhoneCall,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Plus
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from 'recharts';

export const OverviewView: React.FC = () => {
  const {
    profile,
    medications,
    interactions,
    safetyScore,
    schedule,
    adherencePercentage,
    setView,
    setShowAddMedModal,
    toggleScheduleTaken,
    recalculateAllInteractions,
    isAnalyzing,
    notifyDoctorInteraction,
    dismissInteraction,
    sendChatMessage
  } = useApp();

  const [cautionsExpanded, setCautionsExpanded] = useState(true);

  // Filter interactions
  const criticalInteractions = interactions.filter(
    i => (i.severity === 'critical' || i.severity === 'deadly') && !i.dismissed
  );
  const cautionInteractions = interactions.filter(
    i => i.severity === 'caution' && !i.dismissed
  );

  // Adherence chart data for the past 7 days
  const adherenceData = [
    { day: 'Mon', rate: 100 },
    { day: 'Tue', rate: 85 },
    { day: 'Wed', rate: 100 },
    { day: 'Thu', rate: 75 },
    { day: 'Fri', rate: 100 },
    { day: 'Sat', rate: 90 },
    { day: 'Sun', rate: 89 }
  ];

  const handleQuickAsk = (prompt: string) => {
    sendChatMessage(prompt);
    setView('chat');
  };

  return (
    <div className="space-y-8">
      {/* ================= ROW 1: SAFETY SCORE HERO CARD ================= */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Side: Semi-Circular Radial Gauge */}
          <div className="lg:col-span-5 flex flex-col sm:flex-row items-center gap-6">
            <div className="relative w-36 h-36 flex-shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="72"
                  cy="72"
                  r="58"
                  stroke="#E2E8F0"
                  strokeWidth="12"
                  fill="transparent"
                />
                <circle
                  cx="72"
                  cy="72"
                  r="58"
                  stroke={
                    safetyScore.score >= 80
                      ? '#059669'
                      : safetyScore.score >= 60
                      ? '#D97706'
                      : '#DC2626'
                  }
                  strokeWidth="12"
                  strokeDasharray={364}
                  strokeDashoffset={364 * (1 - safetyScore.score / 100)}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-4xl font-black text-slate-900 tracking-tighter">{safetyScore.score}</span>
                <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest">/ 100 Safe</span>
              </div>
            </div>

            <div className="text-center sm:text-left space-y-1.5">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Overall Regimen Safety
              </span>
              <h3
                className={`text-xl sm:text-2xl font-black tracking-tight ${
                  safetyScore.score >= 80
                    ? 'text-emerald-700'
                    : safetyScore.score >= 60
                    ? 'text-amber-700'
                    : 'text-red-700'
                }`}
              >
                {safetyScore.score >= 80
                  ? 'OPTIMAL SAFETY'
                  : safetyScore.score >= 60
                  ? 'MODERATE CONFLICT RISK'
                  : 'CRITICAL ATTENTION REQUIRED'}
              </h3>
              <p className="text-xs font-medium text-slate-600 leading-relaxed max-w-xs">
                {criticalInteractions.length > 0
                  ? `${criticalInteractions.length} critical drug conflict detected. Follow clinical action plans below.`
                  : 'All active prescriptions safely spaced with zero deadly interactions.'}
              </p>
            </div>
          </div>

          {/* Center: 4 Count Boxes (2x2 Grid) */}
          <div className="lg:col-span-4 grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-red-50 border-2 border-red-200 text-center">
              <div className="text-2xl font-black text-red-600">{safetyScore.criticalCount + safetyScore.deadlyCount}</div>
              <div className="text-[10px] font-black text-red-800 uppercase tracking-tight">Critical / Deadly</div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-200 text-center">
              <div className="text-2xl font-black text-amber-700">{safetyScore.cautionCount}</div>
              <div className="text-[10px] font-black text-amber-800 uppercase tracking-tight">Cautions</div>
            </div>

            <div className="p-4 rounded-2xl bg-yellow-50 border-2 border-yellow-200 text-center">
              <div className="text-2xl font-black text-yellow-700">{safetyScore.minorCount}</div>
              <div className="text-[10px] font-black text-yellow-800 uppercase tracking-tight">Minor / Food</div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-200 text-center">
              <div className="text-2xl font-black text-emerald-700">{safetyScore.safeCount}</div>
              <div className="text-[10px] font-black text-emerald-800 uppercase tracking-tight">Safe Pairs</div>
            </div>
          </div>

          {/* Far Right: Re-verify & Share buttons */}
          <div className="lg:col-span-3 flex flex-col gap-2.5 justify-center">
            <button
              onClick={recalculateAllInteractions}
              disabled={isAnalyzing}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-slate-900 hover:bg-black text-white text-xs font-black uppercase tracking-tight shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isAnalyzing ? 'animate-spin' : ''}`} />
              <span>{isAnalyzing ? 'Checking FDA...' : 'Re-verify All Meds'}</span>
            </button>

            <button
              onClick={() => setView('emergency')}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs font-black uppercase tracking-tight transition-all cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Export Report</span>
            </button>

            <span className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-wider">
              FDA Checked: Today 08:00 AM
            </span>
          </div>
        </div>
      </div>

      {/* ================= ROW 2: CRITICAL ALERTS ================= */}
      {criticalInteractions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              Requires Urgent Physician Attention
            </h3>
            <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">
              {criticalInteractions.length} Critical
            </span>
          </div>

          <div className="space-y-4">
            {criticalInteractions.map(interaction => (
              <div
                key={interaction.id}
                className="relative rounded-3xl bg-red-50/70 border-2 border-red-500 p-6 sm:p-7 shadow-sm overflow-hidden"
              >
                <div className="space-y-4">
                  {/* Header Row */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-red-600 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                        <AlertOctagon className="w-3.5 h-3.5" />
                        Critical Interaction
                      </span>
                      <span className="text-xs font-bold text-slate-500">
                        Authority: {interaction.source}
                      </span>
                    </div>

                    {interaction.doctorNotified && (
                      <span className="text-xs text-emerald-700 font-black flex items-center gap-1 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Doctor Notified
                      </span>
                    )}
                  </div>

                  {/* Drug Pair */}
                  <div className="flex flex-wrap items-center gap-3 text-lg sm:text-xl font-black text-slate-900">
                    <span className="px-3.5 py-1.5 rounded-2xl bg-white border-2 border-slate-300 shadow-xs">
                      💊 {interaction.drugAName}
                    </span>
                    <span className="text-red-600 font-black text-xl">⟷</span>
                    <span className="px-3.5 py-1.5 rounded-2xl bg-white border-2 border-slate-300 shadow-xs">
                      💊 {interaction.drugBName}
                    </span>
                  </div>

                  {/* Plain English AI Explanation */}
                  <p className="text-sm text-slate-800 leading-relaxed font-bold bg-white p-4 rounded-2xl border border-red-200">
                    "{interaction.aiExplanation}"
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="bg-red-100/60 p-4 rounded-2xl border border-red-200">
                      <strong className="text-red-900 font-black uppercase tracking-tight block mb-1">What to watch out for:</strong>
                      <span className="text-slate-800 font-medium">{interaction.whatItMeans}</span>
                    </div>
                    <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200">
                      <strong className="text-emerald-900 font-black uppercase tracking-tight block mb-1">Clinical Action Plan:</strong>
                      <span className="text-slate-800 font-medium">{interaction.actionRequired}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-red-200">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <button
                        onClick={() =>
                          handleQuickAsk(
                            `Can you explain why taking ${interaction.drugAName} and ${interaction.drugBName} together is risky for me?`
                          )
                        }
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-slate-900 hover:bg-black text-white text-xs font-black uppercase tracking-tight shadow-xs transition-all cursor-pointer"
                      >
                        <MessageSquareHeart className="w-3.5 h-3.5 text-emerald-400" />
                        Ask AI Assistant
                      </button>

                      <a
                        href={`tel:${profile.primaryDoctorPhone}`}
                        onClick={() => notifyDoctorInteraction(interaction.id)}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase tracking-tight shadow-xs transition-all"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        Call Dr. {profile.primaryDoctorName.split(' ')[1] || 'Doctor'}
                      </a>
                    </div>

                    <button
                      onClick={() => dismissInteraction(interaction.id)}
                      className="text-xs font-bold text-slate-500 hover:text-slate-900 underline cursor-pointer"
                    >
                      Acknowledge & Hide
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= ROW 3: CAUTION ALERTS (Collapsible) ================= */}
      {cautionInteractions.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <div
            onClick={() => setCautionsExpanded(!cautionsExpanded)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <h4 className="text-base font-black text-slate-900">
                Caution & Timing Adjustments ({cautionInteractions.length})
              </h4>
            </div>
            <button className="text-slate-500 hover:text-slate-900 p-1">
              {cautionsExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>

          {cautionsExpanded && (
            <div className="mt-5 space-y-3 pt-4 border-t border-slate-100">
              {cautionInteractions.map(c => (
                <div
                  key={c.id}
                  className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black text-sm text-slate-900">
                      💊 {c.drugAName} ⟷ 💊 {c.drugBName}
                    </span>
                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-900">
                      Timing Separation Required
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 font-medium leading-relaxed">
                    {c.aiExplanation}
                  </p>
                  <div className="text-xs text-amber-900 font-bold">
                    💡 <strong>Solution:</strong> {c.actionRequired}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= ROW 4: TODAY'S SMART SCHEDULE PREVIEW ================= */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <Clock className="w-5 h-5 text-slate-900" />
            <div>
              <h4 className="text-base font-black text-slate-900">
                Today's AI-Optimized Dosing Schedule
              </h4>
              <p className="text-xs font-medium text-slate-500">
                Arranged by chronopharmacology rules to prevent stomach irritation and absorption binding.
              </p>
            </div>
          </div>
          <button
            onClick={() => setView('schedule')}
            className="text-xs font-black uppercase tracking-tight text-slate-900 hover:text-emerald-600 flex items-center gap-1 cursor-pointer"
          >
            View 24h Timeline <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-3">
          {schedule.slice(0, 4).map(item => (
            <div
              key={item.id}
              className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border transition-all ${
                item.takenToday
                  ? 'bg-emerald-50/70 border-emerald-200 opacity-80'
                  : 'bg-slate-50 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start sm:items-center gap-3">
                <div
                  className={`w-20 font-mono text-xs font-black ${
                    item.takenToday ? 'text-emerald-700' : 'text-slate-900'
                  }`}
                >
                  {item.time}
                </div>
                <div>
                  <div className="font-black text-sm text-slate-900 flex flex-wrap items-center gap-1.5">
                    {item.medicationNames.map((name, i) => (
                      <span key={i} className="px-2.5 py-0.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-800">
                        💊 {name}
                      </span>
                    ))}
                  </div>
                  <div className="text-xs font-medium text-slate-500 mt-1">
                    {item.dosageInstructions}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-3 sm:mt-0 self-end sm:self-auto">
                <button
                  onClick={() => toggleScheduleTaken(item.id)}
                  className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-tight transition-all cursor-pointer ${
                    item.takenToday
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-200'
                  }`}
                >
                  {item.takenToday ? '✓ Taken' : 'Mark Taken'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= ROW 5: MEDICATIONS OVERVIEW + ADHERENCE ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left (60%): Active Meds Chips */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Pill className="w-4 h-4 text-emerald-600" />
              <span>Active Medications ({medications.length})</span>
            </h4>
            <button
              onClick={() => setShowAddMedModal(true)}
              className="text-xs font-black uppercase tracking-tight text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add New
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {medications.map(med => (
              <div
                key={med.id}
                onClick={() => setView('medications')}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-400 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-black text-sm text-slate-900 group-hover:text-emerald-700 transition-colors">
                    {med.drugName}
                  </span>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-200 text-slate-800">
                    {med.dosage}
                    {med.dosageUnit}
                  </span>
                </div>
                <div className="text-xs font-medium text-slate-500 truncate">{med.drugClass}</div>
                <div className="text-[11px] font-bold text-slate-600 mt-1 flex items-center gap-2">
                  <span>⏰ {med.frequency}</span>
                  {med.withFood && <span>🍽️ With food</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right (40%): Weekly Adherence Chart */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>Weekly Adherence</span>
              </h4>
              <span className="text-xs font-black text-emerald-700 font-mono">
                {adherencePercentage}% Avg
              </span>
            </div>
            <p className="text-xs font-medium text-slate-500 mb-4">
              Daily dose compliance over the past 7 days.
            </p>
          </div>

          <div className="h-36 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={adherenceData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <XAxis dataKey="day" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E2E8F0',
                    borderRadius: '16px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: '#0F172A'
                  }}
                  formatter={(value: any) => [`${value}% Taken`, 'Adherence']}
                />
                <Bar dataKey="rate" radius={[4, 4, 0, 0]}>
                  {adherenceData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.rate >= 90 ? '#059669' : entry.rate >= 75 ? '#0F172A' : '#D97706'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ================= ROW 6: AI CHAT PREVIEW ================= */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-black text-white">Ask SafeDose AI Specialist</h4>
              <p className="text-xs text-slate-300 font-medium">
                Instant clinical guidance customized to Maria's active 6 medications.
              </p>
            </div>
          </div>

          <button
            onClick={() => setView('chat')}
            className="px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black uppercase tracking-tight shadow-md transition-all cursor-pointer self-start sm:self-auto"
          >
            Open Full Chat →
          </button>
        </div>

        {/* 3 Quick Question Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => handleQuickAsk('Is it safe for me to take Ibuprofen with my current medications?')}
            className="p-3.5 text-left rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-200 font-medium transition-all cursor-pointer"
          >
            💊 <strong className="text-white font-bold">Is Ibuprofen safe</strong> with my current blood thinners?
          </button>

          <button
            onClick={() => handleQuickAsk('What foods and juices must I strictly avoid with Warfarin and Atorvastatin?')}
            className="p-3.5 text-left rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-200 font-medium transition-all cursor-pointer"
          >
            🍊 <strong className="text-white font-bold">Food conflicts</strong> with Warfarin & Statin?
          </button>

          <button
            onClick={() => handleQuickAsk('I missed my morning dose of Metformin. What should I do?')}
            className="p-3.5 text-left rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-200 font-medium transition-all cursor-pointer"
          >
            ⏰ <strong className="text-white font-bold">Missed Metformin dose</strong> protocol?
          </button>
        </div>
      </div>
    </div>
  );
};
