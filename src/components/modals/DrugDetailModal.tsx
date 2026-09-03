import React from 'react';
import { Medication } from '../../types';
import { useApp } from '../../stores/AppContext';
import {
  X,
  Pill,
  Clock,
  Utensils,
  AlertTriangle,
  FileText,
  Trash2,
  User,
  ShieldAlert,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

interface DrugDetailModalProps {
  medication: Medication | null;
  onClose: () => void;
}

export const DrugDetailModal: React.FC<DrugDetailModalProps> = ({ medication, onClose }) => {
  const { removeMedication, interactions, setView, sendChatMessage } = useApp();

  if (!medication) return null;

  // Find interactions involving this drug
  const drugInteractions = interactions.filter(
    i =>
      (i.drugAName.toLowerCase().includes(medication.drugName.toLowerCase()) ||
        i.drugBName.toLowerCase().includes(medication.drugName.toLowerCase())) &&
      !i.dismissed
  );

  const handleAskAI = () => {
    sendChatMessage(`Tell me about common side effects, interactions, and precautions for ${medication.drugName} ${medication.dosage}${medication.dosageUnit}.`);
    onClose();
    setView('chat');
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to remove ${medication.drugName} from your active medication list?`)) {
      removeMedication(medication.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto font-geist">
      <div className="relative w-full max-w-2xl bg-[#0e0e17] border border-white/15 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 my-8 text-left text-white">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Drug Header Band */}
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-2xl shadow-inner shrink-0 text-cyan-400">
            <Pill className="w-7 h-7" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-bold text-white tracking-tight">{medication.drugName}</h2>
              <span className="px-2.5 py-0.5 rounded-lg bg-white/10 text-white text-xs font-mono font-semibold border border-white/10">
                {medication.dosage} {medication.dosageUnit}
              </span>
            </div>
            {medication.genericName && (
              <p className="text-xs text-slate-400 mt-0.5">
                Generic: <span className="text-slate-200 font-medium">{medication.genericName}</span>
              </p>
            )}
            <div className="mt-1.5">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                {medication.drugClass}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Specs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
            <span className="text-slate-400 font-medium uppercase tracking-wider text-[10px] block mb-1">Frequency</span>
            <span className="font-semibold text-white flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              {medication.frequency}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
            <span className="text-slate-400 font-medium uppercase tracking-wider text-[10px] block mb-1">Food Requirement</span>
            <span className="font-semibold text-white flex items-center gap-1.5">
              <Utensils className="w-3.5 h-3.5 text-amber-400" />
              {medication.withFood ? 'Take with food' : 'With or without food'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
            <span className="text-slate-400 font-medium uppercase tracking-wider text-[10px] block mb-1">Prescriber</span>
            <span className="font-semibold text-white flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-emerald-400" />
              {medication.prescriber || 'Attending Physician'}
            </span>
          </div>
        </div>

        {/* Timing Instructions */}
        {medication.timingInstructions && (
          <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-100">
            <div className="flex items-center gap-1.5 font-semibold text-cyan-300 mb-1">
              <Clock className="w-4 h-4 text-cyan-400" /> Administration Instructions
            </div>
            <p className="leading-relaxed">{medication.timingInstructions}</p>
          </div>
        )}

        {/* Clinical Notes */}
        {medication.notes && (
          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-slate-300">
            <div className="flex items-center gap-1.5 font-semibold text-slate-200 mb-1">
              <FileText className="w-4 h-4 text-slate-400" /> Prescription Notes
            </div>
            <p className="leading-relaxed">{medication.notes}</p>
          </div>
        )}

        {/* Active Identified Interactions with Other Current Meds */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            Interactions with Other Active Meds ({drugInteractions.length})
          </h4>

          {drugInteractions.length === 0 ? (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>No known major conflicts with your current prescription list.</span>
            </div>
          ) : (
            <div className="space-y-2.5">
              {drugInteractions.map(int => (
                <div
                  key={int.id}
                  className={`p-3.5 rounded-xl border text-xs ${
                    int.severity === 'critical' || int.severity === 'deadly'
                      ? 'bg-red-500/10 border-red-500/30 text-red-200'
                      : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                  }`}
                >
                  <div className="flex items-center justify-between font-semibold mb-1">
                    <span className="flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      Conflict with {int.drugAName === medication.drugName ? int.drugBName : int.drugAName}
                    </span>
                    <span className={`uppercase text-[10px] px-2 py-0.5 rounded-md font-mono font-bold ${
                      int.severity === 'critical' || int.severity === 'deadly'
                        ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}>
                      {int.severity}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed pl-5">{int.aiExplanation}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10">
          <button
            onClick={handleDelete}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" /> Remove Medication
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAskAI}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 text-xs font-semibold transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Ask AI Specialist
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
