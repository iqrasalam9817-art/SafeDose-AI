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
  Plus,
  ChevronRight
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
import { DrugDetailModal } from '../modals/DrugDetailModal';

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
    sendChatMessage,
    activeDrugDetail,
    setActiveDrugDetail
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
    <div className="space-y-8 text-white font-geist">
      {/* ================= ROW 1: SAFETY SCORE HERO CARD ================= */}
      <div className="bg-[#0e0e17]/80 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-white/10 shadow-xl shadow-black/30 relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Side: Semi-Circular Radial Gauge */}
          <div className="lg:col-span-5 flex flex-col sm:flex-row items-center gap-6">
            <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="72"
                  cy="72"
                  r="58"
                  stroke="rgba(255,255,255,0.07)"
                  strokeWidth="12"
                  fill="transparent"
                />
                <circle
                  cx="72"
                  cy="72"
                  r="58"
                  stroke={
                    safetyScore.score >= 80
                      ? '#10B981'
                      : safetyScore.score >= 60
                      ? '#F59E0B'
                      : '#EF4444'
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
                <span className="text-4xl font-black text-white tracking-tighter">{safetyScore.score}</span>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">/ 100 Safe</span>
              </div>
            </div>

            <div className="text-center sm:text-left space-y-1.5">
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest flex items-center justify-center sm:justify-start gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                Overall Regimen Safety
              </span>
              <h3
                className={`text-xl sm:text-2xl font-black tracking-tight ${
                  safetyScore.score >= 80
                    ? 'text-emerald-400'
                    : safetyScore.score >= 60
                    ? 'text-amber-400'
                    : 'text-red-400'
                }`}
              >
                {safetyScore.score >= 80
                  ? 'OPTIMAL SAFETY'
                  : safetyScore.score >= 60
                  ? 'MODERATE CONFLICT RISK'
                  : 'CRITICAL ATTENTION REQUIRED'}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed max-w-xs">
                {criticalInteractions.length > 0
                  ? `${criticalInteractions.length} critical drug conflict detected. Follow clinical action plans below.`
                  : 'All active prescriptions safely spaced with zero deadly interactions.'}
              </p>
            </div>
          </div>

          {/* Center: 4 Count Boxes (2x2 Grid) */}
          <div className="lg:col-span-4 grid grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-center">
              <div className="text-2xl font-black text-red-400">{safetyScore.criticalCount + safetyScore.deadlyCount}</div>
              <div className="text-[11px] font-semibold text-red-300 uppercase tracking-tight">Critical / Deadly</div>
            </div>

            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-center">
              <div className="text-2xl font-black text-amber-400">{safetyScore.cautionCount}</div>
              <div className="text-[11px] font-semibold text-amber-300 uppercase tracking-tight">Cautions</div>
            </div>

            <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-center">
              <div className="text-2xl font-black text-cyan-400">{safetyScore.minorCount}</div>
              <div className="text-[11px] font-semibold text-cyan-300 uppercase tracking-tight">Minor / Food</div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center">
              <div className="text-2xl font-black text-emerald-400">{safetyScore.safeCount}</div>
              <div className="text-[11px] font-semibold text-emerald-300 uppercase tracking-tight">Safe Pairs</div>
            </div>
          </div>

          {/* Far Right: Re-verify & Share buttons */}
          <div className="lg:col-span-3 flex flex-col gap-2.5 justify-center">
            <button
              onClick={recalculateAllInteractions}
              disabled={isAnalyzing}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white hover:bg-slate-200 text-black text-xs font-semibold tracking-tight shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-cyan-600 ${isAnalyzing ? 'animate-spin' : ''}`} />
              <span>{isAnalyzing ? 'Checking FDA...' : 'Re-verify All Meds'}</span>
            </button>

            <button
              onClick={() => setView('emergency')}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 text-xs font-semibold tracking-tight transition-all cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Export Report</span>
            </button>

            <span className="text-[10px] text-center text-slate-400 font-medium">
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
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Requires Urgent Physician Attention
            </h3>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/30">
              {criticalInteractions.length} Critical
            </span>
          </div>

          <div className="space-y-4">
            {criticalInteractions.map(interaction => (
              <div
                key={interaction.id}
                className="relative rounded-2xl bg-red-950/20 border border-red-500/40 p-6 sm:p-7 shadow-xl shadow-red-950/10 overflow-hidden"
              >
                <div className="space-y-4">
                  {/* Header Row */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-red-500 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm shadow-red-500/20">
                        <AlertOctagon className="w-3.5 h-3.5" />
                        Critical Interaction
                      </span>
                      <span className="text-xs text-slate-400">
                        Authority: {interaction.source}
                      </span>
                    </div>

                    {interaction.doctorNotified && (
                      <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Doctor Notified
                      </span>
                    )}
                  </div>

                  {/* Drug Pair */}
                  <div className="flex flex-wrap items-center gap-3 text-lg sm:text-xl font-bold text-white">
                    <span className="px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10 shadow-sm flex items-center gap-2">
                      <span>💊</span> {interaction.drugAName}
                    </span>
                    <span className="text-red-400 font-bold text-xl">⟷</span>
                    <span className="px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10 shadow-sm flex items-center gap-2">
                      <span>💊</span> {interaction.drugBName}
                    </span>
                  </div>

                  {/* Plain English AI Explanation */}
                  <div className="text-sm text-slate-200 leading-relaxed font-medium bg-black/40 p-4 rounded-xl border border-red-500/20">
                    "{interaction.aiExplanation}"
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="bg-red-500/10 p-4 rounded-xl border border-red-500/20">
                      <strong className="text-red-300 font-bold uppercase tracking-tight block mb-1">What to watch out for:</strong>
                      <span className="text-slate-200 font-normal leading-relaxed">{interaction.whatItMeans}</span>
                    </div>
                    <div className="bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20">
                      <strong className="text-emerald-300 font-bold uppercase tracking-tight block mb-1">Clinical Action Plan:</strong>
                      <span className="text-slate-200 font-normal leading-relaxed">{interaction.actionRequired}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-red-500/20">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <button
                        onClick={() =>
                          handleQuickAsk(
                            `Can you explain why taking ${interaction.drugAName} and ${interaction.drugBName} together is risky for me?`
                          )
                        }
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold tracking-tight transition-all cursor-pointer"
                      >
                        <MessageSquareHeart className="w-3.5 h-3.5 text-cyan-400" />
                        Ask AI Assistant
                      </button>

                      <a
                        href={`tel:${profile.primaryDoctorPhone}`}
                        onClick={() => notifyDoctorInteraction(interaction.id)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold tracking-tight shadow-sm transition-all"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        Call Dr. {profile.primaryDoctorName.split(' ')[1] || 'Doctor'}
                      </a>
                    </div>

                    <button
                      onClick={() => dismissInteraction(interaction.id)}
                      className="text-xs font-medium text-slate-400 hover:text-white underline cursor-pointer"
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
        <div className="bg-[#0e0e17]/80 rounded-2xl p-6 border border-white/10 shadow-lg">
          <div
            onClick={() => setCautionsExpanded(!cautionsExpanded)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <h4 className="text-base font-bold text-white">
                Caution & Timing Adjustments ({cautionInteractions.length})
              </h4>
            </div>
            <button className="text-slate-400 hover:text-white p-1" aria-label="Toggle cautions">
              {cautionsExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>

          {cautionsExpanded && (
            <div className="mt-5 space-y-3 pt-4 border-t border-white/10">
              {cautionInteractions.map(c => (
                <div
                  key={c.id}
                  className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white">
                      💊 {c.drugAName} ⟷ 💊 {c.drugBName}
                    </span>
                    <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Timing Separation Required
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-normal leading-relaxed">
                    {c.aiExplanation}
                  </p>
                  <div className="text-xs text-amber-300 font-medium">
                    💡 <strong className="text-amber-200">Solution:</strong> {c.actionRequired}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= ROW 4: TODAY'S SMART SCHEDULE PREVIEW ================= */}
      <div className="bg-[#0e0e17]/80 rounded-2xl p-6 sm:p-7 border border-white/10 shadow-lg">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <Clock className="w-5 h-5 text-cyan-400" />
            <div>
              <h4 className="text-base font-bold text-white">
                Today's AI-Optimized Dosing Schedule
              </h4>
              <p className="text-xs text-slate-400">
                Arranged by chronopharmacology rules to prevent stomach irritation and absorption binding.
              </p>
            </div>
          </div>
          <button
            onClick={() => setView('schedule')}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
          >
            <span>Full Timeline</span> <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-3">
          {schedule.slice(0, 4).map(item => (
            <div
              key={item.id}
              className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition-all ${
                item.takenToday
                  ? 'bg-emerald-500/10 border-emerald-500/30 opacity-80'
                  : 'bg-white/[0.02] border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-start sm:items-center gap-3">
                <div
                  className={`w-20 font-mono text-xs font-bold ${
                    item.takenToday ? 'text-emerald-400' : 'text-cyan-400'
                  }`}
                >
                  {item.time}
                </div>
                <div>
                  <div className="font-bold text-sm text-white flex flex-wrap items-center gap-1.5">
                    {item.medicationNames.map((name, i) => (
                      <span key={i} className="px-2.5 py-0.5 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-slate-200">
                        💊 {name}
                      </span>
                    ))}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    {item.dosageInstructions}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-3 sm:mt-0 self-end sm:self-auto">
                <button
                  onClick={() => toggleScheduleTaken(item.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    item.takenToday
                      ? 'bg-emerald-500 text-white shadow-xs'
                      : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
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
        {/* Left (60%): Active Meds Cards */}
        <div className="lg:col-span-7 bg-[#0e0e17]/80 rounded-2xl p-6 sm:p-7 border border-white/10 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <Pill className="w-4 h-4 text-emerald-400" />
                <span>Active Medications ({medications.length})</span>
              </h4>
              <button
                onClick={() => setShowAddMedModal(true)}
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add New
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {medications.map(med => (
                <div
                  key={med.id}
                  onClick={() => setActiveDrugDetail(med)}
                  className="p-4 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/25 transition-all cursor-pointer group hover:-translate-y-0.5"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-sm text-white group-hover:text-cyan-300 transition-colors">
                      {med.drugName}
                    </span>
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-white/10 text-slate-200">
                      {med.dosage}
                      {med.dosageUnit}
                    </span>
                  </div>
                  <div className="mb-2">
                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                      {med.drugClass}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center justify-between pt-2 border-t border-white/5">
                    <span>⏰ {med.frequency}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveDrugDetail(med);
                      }}
                      className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-0.5 cursor-pointer"
                    >
                      <span>Details</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-white/5 flex justify-end">
            <button
              onClick={() => setView('medications')}
              className="text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 cursor-pointer"
            >
              <span>View all in Medication Manager</span>
              <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
            </button>
          </div>
        </div>

        {/* Right (40%): Weekly Adherence Chart */}
        <div className="lg:col-span-5 bg-[#0e0e17]/80 rounded-2xl p-6 sm:p-7 border border-white/10 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>Weekly Adherence</span>
              </h4>
              <span className="text-xs font-bold text-emerald-400 font-mono">
                {adherencePercentage}% Avg
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Daily dose compliance over the past 7 days.
            </p>
          </div>

          <div className="h-36 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={adherenceData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: 'rgba(255,255,255,0.15)',
                    borderRadius: '12px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: '#FFFFFF'
                  }}
                  formatter={(value: any) => [`${value}% Taken`, 'Adherence']}
                />
                <Bar dataKey="rate" radius={[4, 4, 0, 0]}>
                  {adherenceData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.rate >= 90 ? '#10B981' : entry.rate >= 75 ? '#06B6D4' : '#F59E0B'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ================= ROW 6: AI SPECIALIST BANNER ================= */}
      <div className="bg-gradient-to-r from-blue-950/30 via-cyan-950/20 to-slate-900/40 border border-cyan-500/20 text-white rounded-2xl p-6 sm:p-7 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">Ask SafeDose Clinical Assistant</h4>
              <p className="text-xs text-slate-400">
                Instant guidance customized to your active regimen.
              </p>
            </div>
          </div>

          <button
            onClick={() => setView('chat')}
            className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 text-xs font-semibold tracking-tight transition-all cursor-pointer self-start sm:self-auto"
          >
            Open Full Chat →
          </button>
        </div>

        {/* 3 Quick Question Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => handleQuickAsk('Is it safe for me to take Ibuprofen with my current medications?')}
            className="p-3 text-left rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 text-xs text-slate-300 transition-all cursor-pointer"
          >
            💊 <strong className="text-white font-semibold">Is Ibuprofen safe</strong> with my current regimen?
          </button>

          <button
            onClick={() => handleQuickAsk('What foods and juices must I strictly avoid with Warfarin and Atorvastatin?')}
            className="p-3 text-left rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 text-xs text-slate-300 transition-all cursor-pointer"
          >
            🍊 <strong className="text-white font-semibold">Food conflicts</strong> with Warfarin & Statin?
          </button>

          <button
            onClick={() => handleQuickAsk('I missed my morning dose of Metformin. What should I do?')}
            className="p-3 text-left rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 text-xs text-slate-300 transition-all cursor-pointer"
          >
            ⏰ <strong className="text-white font-semibold">Missed Metformin dose</strong> protocol?
          </button>
        </div>
      </div>

      {/* Global Drug Detail Modal for working Details links */}
      <DrugDetailModal
        medication={activeDrugDetail}
        onClose={() => setActiveDrugDetail(null)}
      />
    </div>
  );
};
