import React, { useState } from 'react';
import { useApp } from '../../stores/AppContext';
import { SeverityLevel, Interaction } from '../../types';
import {
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  PhoneCall,
  MessageSquareHeart,
  ChevronDown,
  ChevronUp,
  Filter,
  Sparkles,
  ShieldCheck,
  Info,
  ExternalLink
} from 'lucide-react';

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
  const [expandedId, setExpandedId] = useState<string | null>(interactions[0]?.id || null);

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

  const getSeverityBadge = (severity: SeverityLevel) => {
    switch (severity) {
      case 'deadly':
        return (
          <span className="px-3.5 py-1 rounded-full bg-red-600 text-white text-xs font-black uppercase tracking-tight flex items-center gap-1 shadow-xs">
            ☠️ Deadly Conflict
          </span>
        );
      case 'critical':
        return (
          <span className="px-3.5 py-1 rounded-full bg-red-100 text-red-700 border border-red-200 text-xs font-black uppercase tracking-tight flex items-center gap-1.5 shadow-xs">
            <AlertOctagon className="w-3.5 h-3.5 text-red-600" /> Critical Conflict
          </span>
        );
      case 'caution':
        return (
          <span className="px-3.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200 text-xs font-black uppercase tracking-tight flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Caution / Spacing
          </span>
        );
      case 'minor':
        return (
          <span className="px-3.5 py-1 rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200 text-xs font-black uppercase tracking-tight flex items-center gap-1">
            💛 Minor Influence
          </span>
        );
      case 'safe':
        return (
          <span className="px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-black uppercase tracking-tight flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Compatible
          </span>
        );
      default:
        return (
          <span className="px-3.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-xs font-black uppercase">
            Unknown
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
          <AlertTriangle className="w-6 h-6 text-amber-600" />
          <span>Drug Conflict Intelligence</span>
        </h2>
        <p className="text-xs font-medium text-slate-500 mt-1">
          Detailed clinical breakdown of pairwise pharmacology, side effect risks, and doctor guidance.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-tight transition-all cursor-pointer ${
            activeTab === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 bg-slate-100'
          }`}
        >
          All Identified ({interactions.length})
        </button>

        <button
          onClick={() => setActiveTab('critical')}
          className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-tight transition-all cursor-pointer ${
            activeTab === 'critical'
              ? 'bg-red-600 text-white shadow-xs'
              : 'text-red-700 hover:bg-red-100 bg-red-50 border border-red-200'
          }`}
        >
          Critical ({criticalList.length})
        </button>

        <button
          onClick={() => setActiveTab('caution')}
          className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-tight transition-all cursor-pointer ${
            activeTab === 'caution'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-amber-800 hover:bg-amber-100 bg-amber-50 border border-amber-200'
          }`}
        >
          Cautions ({cautionList.length})
        </button>

        <button
          onClick={() => setActiveTab('safe')}
          className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-tight transition-all cursor-pointer ${
            activeTab === 'safe'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-emerald-800 hover:bg-emerald-100 bg-emerald-50 border border-emerald-200'
          }`}
        >
          Compatible ({safeList.length})
        </button>
      </div>

      {/* Interaction Cards List */}
      <div className="space-y-4">
        {filteredInteractions.map(interaction => {
          const isCritical = interaction.severity === 'critical' || interaction.severity === 'deadly';
          const isCaution = interaction.severity === 'caution';
          const isExpanded = expandedId === interaction.id;

          return (
            <div
              key={interaction.id}
              className={`bg-white rounded-3xl p-6 sm:p-7 border transition-all duration-200 shadow-sm relative overflow-hidden ${
                isCritical
                  ? 'border-2 border-red-500 bg-red-50/20'
                  : isCaution
                  ? 'border-amber-300 bg-amber-50/20'
                  : 'border-slate-200'
              }`}
            >
              {/* Left Color Indicator */}
              <div
                className={`absolute top-0 left-0 w-2 h-full ${
                  isCritical ? 'bg-red-500' : isCaution ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
              />

              <div className="space-y-4">
                {/* Header Row */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                      <span className="px-3.5 py-1 rounded-2xl bg-slate-100 border border-slate-300">
                        💊 {interaction.drugAName}
                      </span>
                      <span className={isCritical ? 'text-red-600 font-black' : isCaution ? 'text-amber-600 font-black' : 'text-emerald-600 font-black'}>
                        ⟷
                      </span>
                      <span className="px-3.5 py-1 rounded-2xl bg-slate-100 border border-slate-300">
                        💊 {interaction.drugBName}
                      </span>
                    </div>

                    {getSeverityBadge(interaction.severity)}
                  </div>

                  <div className="flex items-center gap-2">
                    {interaction.doctorNotified && (
                      <span className="text-xs text-emerald-700 font-black px-3 py-1 rounded-full bg-emerald-100 border border-emerald-200">
                        ✓ Doctor Notified
                      </span>
                    )}
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : interaction.id)}
                      className="p-2 text-slate-500 hover:text-slate-900 rounded-full hover:bg-slate-100 cursor-pointer"
                    >
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Primary AI Explanation */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-sm text-slate-800 leading-relaxed font-bold">
                  "{interaction.aiExplanation}"
                </div>

                {/* 3-Part Clinical Breakdown (Expanded) */}
                {isExpanded && (
                  <div className="space-y-3 pt-2">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      {/* Part 1: Mechanism */}
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                        <span className="text-[10px] font-black text-blue-700 uppercase tracking-widest block">
                          1. Pharmacological Mechanism
                        </span>
                        <p className="text-slate-700 leading-relaxed font-mono text-[11px]">
                          {interaction.mechanism}
                        </p>
                      </div>

                      {/* Part 2: What It Means (Symptoms) */}
                      <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1.5">
                        <span className="text-[10px] font-black text-amber-900 uppercase tracking-widest block">
                          2. What You Might Experience
                        </span>
                        <p className="text-slate-800 leading-relaxed font-medium">
                          {interaction.whatItMeans}
                        </p>
                      </div>

                      {/* Part 3: Action Required */}
                      <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1.5">
                        <span className="text-[10px] font-black text-emerald-900 uppercase tracking-widest block">
                          3. Action & Protocol
                        </span>
                        <p className="text-slate-800 leading-relaxed font-medium">
                          {interaction.actionRequired}
                        </p>
                      </div>
                    </div>

                    {/* Scientific source citation */}
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold pt-2">
                      <span>Authority: {interaction.source}</span>
                      <span>openFDA Drug Interaction Framework</span>
                    </div>
                  </div>
                )}

                {/* Card Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      onClick={() => handleAskAI(interaction)}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-slate-900 hover:bg-black text-white text-xs font-black uppercase tracking-tight shadow-xs transition-all cursor-pointer"
                    >
                      <MessageSquareHeart className="w-3.5 h-3.5 text-emerald-400" />
                      Ask AI Specialist
                    </button>

                    {isCritical && (
                      <a
                        href={`tel:${profile.primaryDoctorPhone}`}
                        onClick={() => notifyDoctorInteraction(interaction.id)}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase tracking-tight shadow-xs transition-all"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        Call Dr. {profile.primaryDoctorName.split(' ')[1] || 'Doctor'}
                      </a>
                    )}
                  </div>

                  <button
                    onClick={() => dismissInteraction(interaction.id)}
                    className="text-xs font-bold text-slate-400 hover:text-slate-800 underline cursor-pointer"
                  >
                    Dismiss Alert
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredInteractions.length === 0 && (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3 shadow-sm">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h3 className="text-lg font-black text-slate-900">No interactions in this category</h3>
            <p className="text-xs font-medium text-slate-500">
              All active medication combinations match the selected filter without conflicts.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
