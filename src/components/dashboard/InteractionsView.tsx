import React, { useState } from 'react';
import { useApp } from '../../stores/AppContext';
import { SeverityLevel, Interaction } from '../../types';
import {
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  PhoneCall,
  MessageSquareHeart,
  Filter,
  Sparkles,
  ShieldCheck,
  Info,
  ExternalLink
} from 'lucide-react';
import { DrugConflictCard } from './DrugConflictCard';

export const InteractionsView: React.FC = () => {
  const {
    interactions,
    profile,
    setView,
    sendChatMessage,
    dismissInteraction,
    notifyDoctorInteraction
  } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'critical' | 'caution' | 'safe'>('all');

  const criticalList = interactions.filter(
    i => (i.severity === 'critical' || i.severity === 'deadly') && !i.dismissed
  );
  const cautionList = interactions.filter(i => i.severity === 'caution' && !i.dismissed);
  const safeList = interactions.filter(i => i.severity === 'safe');

  const filteredInteractions = interactions.filter(item => {
    if (item.dismissed && activeTab !== 'all') return false;
    if (activeTab === 'critical') return item.severity === 'critical' || item.severity === 'deadly';
    if (activeTab === 'caution') return item.severity === 'caution';
    if (activeTab === 'safe') return item.severity === 'safe';
    return true;
  });

  const handleAskAI = (interaction: Interaction) => {
    sendChatMessage(
      `Please explain the interaction between ${interaction.drugAName} and ${interaction.drugBName} in detail. What should I ask my doctor Dr. ${profile.primaryDoctorName}?`
    );
    setView('chat');
  };

  const mapSeverity = (severity: SeverityLevel): 'critical' | 'caution' | 'compatible' => {
    if (severity === 'deadly' || severity === 'critical') return 'critical';
    if (severity === 'caution' || severity === 'minor') return 'caution';
    return 'compatible';
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <AlertTriangle className="w-6 h-6 text-amber-400" />
            <span>Drug Conflict Intelligence</span>
          </h2>
          <p className="text-xs font-medium text-slate-400 mt-1">
            Detailed clinical breakdown of pairwise pharmacology, side effect risks, and doctor guidance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setView('chat')}
            className="px-4 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Consult AI Pharmacist</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-white/10">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-tight transition-all cursor-pointer ${
            activeTab === 'all'
              ? 'bg-white/15 text-white border border-white/20 shadow-sm'
              : 'text-slate-400 hover:text-white bg-white/5 hover:bg-white/10'
          }`}
        >
          All Identified ({interactions.length})
        </button>

        <button
          onClick={() => setActiveTab('critical')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-tight transition-all cursor-pointer ${
            activeTab === 'critical'
              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
              : 'text-red-400/70 hover:text-red-400 bg-white/5 hover:bg-white/10'
          }`}
        >
          Critical ({criticalList.length})
        </button>

        <button
          onClick={() => setActiveTab('caution')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-tight transition-all cursor-pointer ${
            activeTab === 'caution'
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              : 'text-amber-400/70 hover:text-amber-400 bg-white/5 hover:bg-white/10'
          }`}
        >
          Cautions ({cautionList.length})
        </button>

        <button
          onClick={() => setActiveTab('safe')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-tight transition-all cursor-pointer ${
            activeTab === 'safe'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'text-emerald-400/70 hover:text-emerald-400 bg-white/5 hover:bg-white/10'
          }`}
        >
          Compatible ({safeList.length})
        </button>
      </div>

      {/* Interaction Cards List */}
      <div className="space-y-4">
        {filteredInteractions.map(interaction => (
          <DrugConflictCard
            key={interaction.id}
            drug1={interaction.drugAName}
            drug2={interaction.drugBName}
            severity={mapSeverity(interaction.severity)}
            description={interaction.aiExplanation}
            mechanism={interaction.mechanism}
            effects={interaction.whatItMeans}
            protocol={interaction.actionRequired}
            doctorNotified={interaction.doctorNotified}
            onAskAI={() => handleAskAI(interaction)}
            onNotifyDoctor={() => notifyDoctorInteraction(interaction.id)}
          />
        ))}

        {filteredInteractions.length === 0 && (
          <div className="glass-card rounded-3xl border border-white/10 p-12 text-center space-y-3 shadow-xl">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h3 className="text-lg font-bold text-white">No interactions in this category</h3>
            <p className="text-xs font-medium text-slate-400">
              All active medication combinations match the selected filter without conflicts.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
