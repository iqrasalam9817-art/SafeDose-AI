import React from 'react';
import { useApp } from '../../stores/AppContext';
import { X, FileHeart, Printer, Share2 } from 'lucide-react';
import { EmergencyCardView } from '../dashboard/EmergencyCardView';

export const EmergencyModal: React.FC = () => {
  const { showEmergencyModal, setShowEmergencyModal } = useApp();

  if (!showEmergencyModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white border-2 border-red-500 rounded-3xl p-6 sm:p-8 shadow-2xl my-8 text-left">
        {/* Close Button */}
        <button
          onClick={() => setShowEmergencyModal(false)}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-900 p-2 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <EmergencyCardView />
      </div>
    </div>
  );
};
