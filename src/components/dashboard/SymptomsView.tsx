import React, { useState } from 'react';
import { useApp } from '../../stores/AppContext';
import { SymptomLog } from '../../types';
import {
  HeartPulse,
  Sparkles,
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Send,
  HelpCircle,
  PhoneCall,
  Activity
} from 'lucide-react';
import { analyzeSymptomCorrelation } from '../../lib/gemini';

const COMMON_SYMPTOMS = [
  { label: 'Dizziness / Lightheadedness', icon: '😵‍💫' },
  { label: 'Unusual Bruising / Bleeding', icon: '🩸' },
  { label: 'Nausea / Upset Stomach', icon: '🤢' },
  { label: 'Persistent Dry Cough', icon: '🗣️' },
  { label: 'Muscle Aches / Weakness', icon: '🦵' },
  { label: 'Extreme Fatigue', icon: '🥱' },
  { label: 'Headache / Migraine', icon: '🤕' },
  { label: 'Rapid Heartbeat / Palpitations', icon: '💓' },
  { label: 'Swelling in Feet / Ankles', icon: '🦶' }
];

export const SymptomsView: React.FC = () => {
  const {
    medications,
    symptomLogs,
    addSymptomLog,
    profile,
    setView,
    sendChatMessage
  } = useApp();

  const [selectedSymptom, setSelectedSymptom] = useState(COMMON_SYMPTOMS[0].label);
  const [severity, setSeverity] = useState<'mild' | 'moderate' | 'severe' | 'urgent'>('moderate');
  const [notes, setNotes] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeAnalysis, setActiveAnalysis] = useState<any | null>(null);

  const handleCorrelate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSymptom) return;

    setIsAnalyzing(true);
    try {
      const result = await analyzeSymptomCorrelation(
        [selectedSymptom],
        severity,
        notes,
        medications
      );

      setActiveAnalysis(result);

      // Save to logs
      addSymptomLog({
        symptoms: [selectedSymptom],
        severityRating: severity,
        notes,
        aiCorrelation: result.explanation || 'Analyzed against current prescriptions.',
        possibleCauses: (result.suspectedCulprits || []).map((culprit: string) => ({
          drugName: culprit,
          riskLevel: 'high' as const,
          explanation: result.mechanism || 'Pharmacological side effect or interaction.',
          action: result.recommendation || 'Consult physician.'
        }))
      });
    } catch (err) {
      console.error('Symptom error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleConsultChat = () => {
    if (activeAnalysis) {
      sendChatMessage(
        `I am experiencing ${selectedSymptom} (${severity}). The correlation engine suspected: ${activeAnalysis.suspectedCulprits?.join(', ')}. What should I do right now?`
      );
      setView('chat');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Bar */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
          <HeartPulse className="w-6 h-6 text-emerald-600" />
          <span>Symptom & Adverse Event Correlator</span>
        </h2>
        <p className="text-xs font-medium text-slate-500 mt-1">
          Feeling unwell or noticing a new bodily symptom? Our clinical AI cross-references your active medications to identify known adverse effects.
        </p>
      </div>

      {/* Main Logging Form Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <form onSubmit={handleCorrelate} className="space-y-6">
          {/* Quick Selector Pills */}
          <div>
            <label className="text-xs font-black uppercase tracking-widest text-slate-700 block mb-3">
              1. What symptom are you experiencing?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {COMMON_SYMPTOMS.map(item => (
                <button
                  type="button"
                  key={item.label}
                  onClick={() => setSelectedSymptom(item.label)}
                  className={`p-3 rounded-2xl text-xs font-black uppercase tracking-tight text-left flex items-center gap-2 transition-all cursor-pointer ${
                    selectedSymptom === item.label
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-50 text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Severity Selector */}
          <div>
            <label className="text-xs font-black uppercase tracking-widest text-slate-700 block mb-3">
              2. How severe is it right now?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: 'mild', label: 'Mild (Noticeable)', desc: 'Barely interferes with daily routine' },
                { id: 'moderate', label: 'Moderate (Uncomfortable)', desc: 'Noticeable discomfort' },
                { id: 'severe', label: 'Severe (Disruptive)', desc: 'Interferes with activities' },
                { id: 'urgent', label: 'Urgent (Emergency)', desc: 'Seek immediate medical care' }
              ].map(lvl => (
                <button
                  type="button"
                  key={lvl.id}
                  onClick={() => setSeverity(lvl.id as any)}
                  className={`p-3.5 rounded-2xl text-left transition-all cursor-pointer ${
                    severity === lvl.id
                      ? lvl.id === 'urgent'
                        ? 'bg-red-600 text-white shadow-xs border border-red-500'
                        : 'bg-slate-900 text-white shadow-xs border border-slate-900'
                      : 'bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200'
                  }`}
                >
                  <div className="font-black uppercase tracking-tight text-xs">{lvl.label}</div>
                  <div className="text-[10px] opacity-80 mt-0.5 font-medium">{lvl.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Notes Input */}
          <div>
            <label className="text-xs font-black uppercase tracking-widest text-slate-700 block mb-2">
              3. Additional context or notes (When did it start? What were you doing?)
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              placeholder="e.g. Started about 45 minutes after taking my morning pills with breakfast..."
              className="w-full p-3.5 rounded-2xl bg-white border border-slate-200 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 shadow-2xs"
            />
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs font-medium text-slate-500 hidden sm:inline">
              Checking across {medications.length} active prescriptions and openFDA clinical trials.
            </span>

            <button
              type="submit"
              disabled={isAnalyzing}
              className="w-full sm:w-auto px-7 py-3 rounded-full bg-slate-900 hover:bg-black text-white font-black text-xs uppercase tracking-tight shadow-sm hover:scale-102 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Sparkles className={`w-4 h-4 text-emerald-400 ${isAnalyzing ? 'animate-spin' : ''}`} />
              <span>{isAnalyzing ? 'Analyzing Clinical Trial Data...' : 'Correlate with Medications'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* ================= CORRELATION RESULT CARD ================= */}
      {activeAnalysis && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div className="flex items-center gap-2.5">
              <Activity className="w-5 h-5 text-slate-900" />
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                Clinical Correlation Analysis: {selectedSymptom}
              </h3>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-tight ${
                activeAnalysis.actionUrgency === 'immediate'
                  ? 'bg-red-100 text-red-800 border border-red-200'
                  : 'bg-amber-100 text-amber-800 border border-amber-200'
              }`}
            >
              Urgency: {activeAnalysis.actionUrgency || 'Consult Doctor'}
            </span>
          </div>

          {/* Suspected Culprits */}
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-slate-500 block mb-2">
              Suspected Culprit Medications
            </span>
            <div className="flex flex-wrap items-center gap-2.5">
              {activeAnalysis.suspectedCulprits && activeAnalysis.suspectedCulprits.length > 0 ? (
                activeAnalysis.suspectedCulprits.map((drug: string, i: number) => (
                  <span
                    key={i}
                    className="px-3.5 py-1.5 rounded-full bg-red-50 text-red-800 font-bold text-xs border border-red-200 flex items-center gap-1.5"
                  >
                    💊 {drug}
                  </span>
                ))
              ) : (
                <span className="text-xs font-medium text-slate-500">No primary medication correlation identified.</span>
              )}
            </div>
          </div>

          {/* AI Explanation */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 leading-relaxed font-medium">
            "{activeAnalysis.explanation}"
          </div>

          {/* Action guidance */}
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
            <strong className="font-black block uppercase tracking-tight text-[11px] mb-1">Recommended Doctor Protocol:</strong>
            <p className="text-emerald-800 font-medium">{activeAnalysis.recommendedAction}</p>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              onClick={handleConsultChat}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 hover:bg-black text-white font-black text-xs uppercase tracking-tight shadow-xs transition-all cursor-pointer"
            >
              <span>Consult AI Specialist in Chat →</span>
            </button>

            <a
              href={`tel:${profile.primaryDoctorPhone}`}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-red-50 hover:bg-red-100 text-red-800 border border-red-200 font-black text-xs uppercase tracking-tight"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Call Dr. {profile.primaryDoctorName.split(' ')[1] || 'Doctor'}</span>
            </a>
          </div>
        </div>
      )}

      {/* ================= SYMPTOM HISTORY LOG ================= */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <h3 className="text-base font-black text-slate-900 tracking-tight mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-500" />
          <span>Recorded Symptom History ({symptomLogs.length})</span>
        </h3>

        <div className="space-y-3">
          {symptomLogs.map(log => (
            <div
              key={log.id}
              className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-black text-slate-900 text-sm">
                  {log.symptom}
                </span>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-800 uppercase text-[10px] font-black">
                    {log.severity}
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono font-medium">
                    {new Date(log.timestamp).toLocaleDateString()}
                  </span>
                </div>
              </div>
              {log.notes && <p className="text-slate-600 font-medium">"{log.notes}"</p>}
              {log.aiAnalysis && (
                <div className="p-3 rounded-xl bg-white border border-slate-200 text-slate-700 font-mono text-[11px] font-medium">
                  💡 {log.aiAnalysis}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
