import React from 'react';
import { Medication } from '../../types';
import { useApp } from '../../stores/AppContext';
import {
  X,
  Pill,
  Clock,
  Utensils,
  AlertOctagon,
  AlertTriangle,
  FileText,
  Trash2,
  Share2,
  Calendar,
  User,
  ShieldAlert
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 my-8 text-left">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-900 p-2 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Drug Header Band */}
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-3xl shadow-xs">
            💊
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">{medication.drugName}</h2>
              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-900 text-xs font-black border border-slate-200">
                {medication.dosage} {medication.dosageUnit}
              </span>
            </div>
            {medication.genericName && (
              <p className="text-xs font-bold text-slate-500 mt-0.5">
                Generic: <strong className="text-slate-800 font-black">{medication.genericName}</strong>
              </p>
            )}
            <p className="text-xs text-emerald-700 font-black uppercase tracking-tight mt-0.5">{medication.drugClass}</p>
          </div>
        </div>

        {/* Quick Specs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-slate-400 font-black uppercase tracking-wider text-[10px] block mb-1">Frequency</span>
            <span className="font-black text-slate-900">{medication.frequency}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-slate-400 font-black uppercase tracking-wider text-[10px] block mb-1">Food Requirement</span>
            <span className="font-black text-slate-900">
              {medication.withFood ? '🍽️ Must take with meals' : '🥛 With or without food'}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-slate-400 font-black uppercase tracking-wider text-[10px] block mb-1">Prescriber</span>
            <span className="font-black text-slate-900">{medication.prescriber || 'Specialist'}</span>
          </div>
        </div>

        {/* Timing Instructions */}
        {medication.timingInstructions && (
          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-900 font-medium">
            <div className="flex items-center gap-1.5 font-black text-blue-900 uppercase tracking-tight mb-1">
              <Clock className="w-4 h-4" /> Timing & Administration Instructions
            </div>
            <p>{medication.timingInstructions}</p>
          </div>
        )}

        {/* Clinical Notes */}
        {medication.notes && (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
            <strong className="text-slate-900 font-black block mb-1 uppercase tracking-tight text-[10px]">Prescription Notes:</strong>
            <p className="font-medium">{medication.notes}</p>
          </div>
        )}

        {/* Active Identified Interactions with Other Current Meds */}
        <div>
          <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            Interactions With Your Other Active Meds ({drugInteractions.length})
          </h4>

          {drugInteractions.length === 0 ? (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold flex items-center gap-2">
              <span>✅</span> No known major conflicts with your current prescription list.
            </div>
          ) : (
            <div className="space-y-2.5">
              {drugInteractions.map(int => (
                <div
                  key={int.id}
                  className={`p-3.5 rounded-2xl border text-xs ${
                    int.severity === 'critical' || int.severity === 'deadly'
                      ? 'bg-red-50 border-red-200 text-red-900'
                      : 'bg-amber-50 border-amber-200 text-amber-900'
                  }`}
                >
                  <div className="flex items-center justify-between font-black mb-1">
                    <span>
                      Conflict with {int.drugAName === medication.drugName ? int.drugBName : int.drugAName}
                    </span>
                    <span className="uppercase text-[10px] px-2.5 py-0.5 rounded-full bg-white font-black border border-slate-300">
                      {int.severity}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-700 font-medium leading-relaxed">{int.aiExplanation}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
          <button
            onClick={handleDelete}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full text-red-600 hover:bg-red-50 text-xs font-black uppercase tracking-tight transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" /> Remove Medication
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAskAI}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-slate-900 hover:bg-black text-white text-xs font-black uppercase tracking-tight shadow-sm cursor-pointer"
            >
              Ask AI Specialist
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black uppercase tracking-tight transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
