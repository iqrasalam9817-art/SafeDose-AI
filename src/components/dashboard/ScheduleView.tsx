import React, { useState } from 'react';
import { useApp } from '../../stores/AppContext';
import {
  CalendarClock,
  Sparkles,
  CheckCircle2,
  Clock,
  Utensils,
  Moon,
  Sun,
  Sunrise,
  Sunset,
  RefreshCw,
  AlertCircle,
  Pill
} from 'lucide-react';
import { generateSmartSchedule } from '../../lib/gemini';

export const ScheduleView: React.FC = () => {
  const {
    schedule,
    medications,
    profile,
    toggleScheduleTaken,
    setSchedule,
    interactions
  } = useApp();

  const [isGenerating, setIsGenerating] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'morning' | 'afternoon' | 'evening' | 'bedtime'>('all');

  const handleRegenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await generateSmartSchedule(
        medications,
        customPrompt || '7:00 AM wake up, 10:00 PM sleep'
      );
      if (res && res.scheduleItems && res.scheduleItems.length > 0) {
        setSchedule(res.scheduleItems);
      }
    } catch (err) {
      console.error('Schedule gen error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Group or filter schedule items
  const filteredSchedule = schedule.filter(item => {
    if (activeFilter === 'all') return true;
    const hour = parseInt(item.time.split(':')[0], 10);
    const isPM = item.time.includes('PM');
    const standardHour = isPM && hour !== 12 ? hour + 12 : hour;

    if (activeFilter === 'morning') return standardHour < 12;
    if (activeFilter === 'afternoon') return standardHour >= 12 && standardHour < 17;
    if (activeFilter === 'evening') return standardHour >= 17 && standardHour < 21;
    if (activeFilter === 'bedtime') return standardHour >= 21;
    return true;
  });

  const completedCount = schedule.filter(s => s.takenToday).length;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <CalendarClock className="w-6 h-6 text-slate-900" />
            <span>AI Chronopharmacology Schedule</span>
          </h2>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Optimized dosage timings spaced by absorption rates, food requirements, and circadian metabolic enzymes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRegenerate}
            disabled={isGenerating}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 hover:bg-black text-white text-xs font-black uppercase tracking-tight shadow-sm hover:scale-102 transition-all cursor-pointer disabled:opacity-50"
          >
            <Sparkles className={`w-4 h-4 text-emerald-400 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Optimizing Chrono-Flow...' : 'Re-Optimize with AI'}</span>
          </button>
        </div>
      </div>

      {/* Progress & Chrono Highlights Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-slate-500 block mb-1">Today's Progress</span>
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              {completedCount} of {schedule.length} Doses Taken
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800 font-black text-lg">
            {Math.round((completedCount / (schedule.length || 1)) * 100)}%
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 text-blue-700 flex items-center justify-center text-xl flex-shrink-0">
            ⏳
          </div>
          <div className="text-xs">
            <strong className="text-slate-900 font-black block">2-Hour Mineral Separation</strong>
            <span className="text-slate-500 font-medium">
              Calcium separated from ACE inhibitors to prevent absorption binding.
            </span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center text-xl flex-shrink-0">
            🌙
          </div>
          <div className="text-xs">
            <strong className="text-slate-900 font-black block">Bedtime Statin Administration</strong>
            <span className="text-slate-500 font-medium">
              Liver HMG-CoA reductase peaks at night for maximum cholesterol reduction.
            </span>
          </div>
        </div>
      </div>

      {/* Day Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-tight transition-all cursor-pointer ${
            activeFilter === 'all' ? 'bg-slate-900 text-white shadow-xs' : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          All Day ({schedule.length})
        </button>

        <button
          onClick={() => setActiveFilter('morning')}
          className={`px-3.5 py-2 rounded-full text-xs font-black uppercase tracking-tight flex items-center gap-1.5 transition-all cursor-pointer ${
            activeFilter === 'morning' ? 'bg-amber-600 text-white shadow-xs' : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <Sunrise className="w-3.5 h-3.5" /> Morning
        </button>

        <button
          onClick={() => setActiveFilter('afternoon')}
          className={`px-3.5 py-2 rounded-full text-xs font-black uppercase tracking-tight flex items-center gap-1.5 transition-all cursor-pointer ${
            activeFilter === 'afternoon' ? 'bg-blue-600 text-white shadow-xs' : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <Sun className="w-3.5 h-3.5" /> Lunch / Afternoon
        </button>

        <button
          onClick={() => setActiveFilter('evening')}
          className={`px-3.5 py-2 rounded-full text-xs font-black uppercase tracking-tight flex items-center gap-1.5 transition-all cursor-pointer ${
            activeFilter === 'evening' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <Sunset className="w-3.5 h-3.5" /> Evening Dinner
        </button>

        <button
          onClick={() => setActiveFilter('bedtime')}
          className={`px-3.5 py-2 rounded-full text-xs font-black uppercase tracking-tight flex items-center gap-1.5 transition-all cursor-pointer ${
            activeFilter === 'bedtime' ? 'bg-purple-700 text-white shadow-xs' : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <Moon className="w-3.5 h-3.5" /> Bedtime
        </button>
      </div>

      {/* Timeline List */}
      <div className="space-y-4 relative">
        {/* Continuous timeline line */}
        <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-slate-200 hidden sm:block" />

        {filteredSchedule.map(item => (
          <div
            key={item.id}
            className={`rounded-3xl p-6 sm:pl-16 relative transition-all duration-300 border shadow-xs ${
              item.takenToday
                ? 'bg-emerald-50/50 border-emerald-200'
                : 'bg-white border-slate-200 hover:border-slate-400'
            }`}
          >
            {/* Timeline Dot on the line */}
            <div
              className={`absolute left-4 top-8 -translate-x-1/2 w-4 h-4 rounded-full border-2 hidden sm:flex items-center justify-center ${
                item.takenToday
                  ? 'bg-emerald-600 border-emerald-200'
                  : 'bg-white border-slate-900'
              }`}
            >
              {item.takenToday && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="font-mono text-xs font-black text-slate-900 bg-slate-100 px-3 py-1 rounded-xl border border-slate-200">
                    ⏰ {item.time}
                  </span>
                  <span className="text-xs font-black text-slate-900 uppercase tracking-tight">
                    {item.label}
                  </span>
                  {item.mealAssociation && (
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 flex items-center gap-1 border border-amber-200 font-bold">
                      <Utensils className="w-3 h-3" /> {item.mealAssociation}
                    </span>
                  )}
                </div>

                {/* Medication Chips in this time slot */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {item.medicationNames.map((name, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs flex items-center gap-1.5 shadow-2xs"
                    >
                      💊 {name}
                    </span>
                  ))}
                </div>

                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {item.dosageInstructions}
                </p>

                {item.reason && (
                  <p className="text-[11px] text-slate-700 font-mono font-bold">
                    💡 Clinical Reason: {item.reason}
                  </p>
                )}
              </div>

              {/* Mark Taken Button */}
              <div className="flex-shrink-0">
                <button
                  onClick={() => toggleScheduleTaken(item.id)}
                  className={`w-full md:w-auto px-5 py-3 rounded-full text-xs font-black uppercase tracking-tight transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2 ${
                    item.takenToday
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                      : 'bg-slate-900 hover:bg-black text-white hover:scale-102'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{item.takenToday ? 'Completed ✓' : 'Mark Dose Taken'}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
