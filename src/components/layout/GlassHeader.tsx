import React, { useState } from 'react';
import { useApp } from '../../stores/AppContext';
import {
  Bell,
  RefreshCw,
  FileHeart,
  Menu,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  Activity,
  Cpu
} from 'lucide-react';

interface GlassHeaderProps {
  onOpenMobileSidebar?: () => void;
}

export const GlassHeader: React.FC<GlassHeaderProps> = ({ onOpenMobileSidebar }) => {
  const {
    profile,
    safetyScore,
    setShowEmergencyModal,
    recalculateAllInteractions,
    isAnalyzing,
    setView,
    webmcpStatus,
    agentActivities,
    setShowAgentActivityPanel
  } = useApp();

  const [notificationOpen, setNotificationOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 h-16 glass-panel border-b border-white/10 px-4 sm:px-6 lg:px-8 flex items-center justify-between backdrop-blur-xl">
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger button */}
        {onOpenMobileSidebar && (
          <button
            onClick={onOpenMobileSidebar}
            className="md:hidden text-slate-400 hover:text-white p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/50" />
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
              <span>Good day, {profile.fullName.split(' ')[0]}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hidden sm:inline-flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                Active Safety Guard
              </span>
            </h2>
          </div>
        </div>
      </div>

      {/* Right Header Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* WebMCP Status Indicator */}
        <div className="flex items-center">
          {webmcpStatus === 'ready' ? (
            <button
              onClick={() => setShowAgentActivityPanel(true)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold transition-all cursor-pointer shadow-sm shadow-emerald-500/10"
              title="WebMCP Imperative API is active and tools are registered. Click to view Agent Activity."
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>WebMCP ready</span>
              {agentActivities.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-[10px] font-bold text-emerald-300">
                  {agentActivities.length}
                </span>
              )}
            </button>
          ) : (
            <button
              onClick={() => setShowAgentActivityPanel(true)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-slate-200 text-xs font-medium transition-all cursor-pointer"
              title="WebMCP unavailable — manual controls active. Click to view Agent Activity."
            >
              <span className="w-2 h-2 rounded-full bg-slate-500 shrink-0" />
              <span>WebMCP unavailable — manual controls active</span>
              {agentActivities.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-white/10 text-[10px] font-bold text-slate-300">
                  {agentActivities.length}
                </span>
              )}
            </button>
          )}
        </div>

        {/* Agent Activity Drawer Trigger */}
        <button
          onClick={() => setShowAgentActivityPanel(true)}
          className="p-2 text-slate-300 hover:text-cyan-400 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 relative transition-colors cursor-pointer"
          title="Open Agent Activity log"
        >
          <Cpu className="w-4 h-4 text-cyan-400" />
        </button>

        {/* Re-analyze / Recalculate */}
        <button
          onClick={recalculateAllInteractions}
          disabled={isAnalyzing}
          className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 hover:text-white border border-white/10 transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isAnalyzing ? 'animate-spin' : ''}`} />
          <span>{isAnalyzing ? 'Analyzing...' : 'Re-verify'}</span>
        </button>

        {/* Emergency Card Quick Button */}
        <button
          onClick={() => setShowEmergencyModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-400 hover:text-red-300 border border-red-500/30 text-xs font-bold transition-all cursor-pointer shadow-sm shadow-red-500/10"
        >
          <FileHeart className="w-3.5 h-3.5 text-red-400" />
          <span className="hidden sm:inline">Emergency Card</span>
          <span className="sm:hidden">SOS</span>
        </button>

        {/* Notification Bell with Dropdown */}
        <div className="relative">
          <button
            onClick={() => setNotificationOpen(!notificationOpen)}
            className="p-2 text-slate-300 hover:text-white rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 relative transition-colors cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            {safetyScore.criticalCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-[#0a0a0f] animate-ping" />
            )}
          </button>

          {notificationOpen && (
            <div className="absolute right-0 mt-2 w-80 glass-card bg-[#0e101a]/95 border border-white/15 rounded-3xl p-5 shadow-2xl z-50 text-xs text-slate-200">
              <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
                <span className="font-bold text-white uppercase tracking-wider text-[11px]">Clinical Safety Alerts</span>
                <span className="text-[10px] font-semibold text-cyan-400 uppercase tracking-widest">Live Monitor</span>
              </div>

              {safetyScore.criticalCount > 0 ? (
                <div className="bg-red-500/10 border border-red-500/30 p-3.5 rounded-2xl text-red-200 space-y-1.5 mb-3">
                  <div className="flex items-center gap-1.5 font-bold text-red-400 text-xs">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Critical Alert Detected</span>
                  </div>
                  <div className="text-[11px] text-red-300/90 leading-relaxed">
                    Warfarin + Aspirin combination requires physician confirmation and coagulation monitoring.
                  </div>
                </div>
              ) : (
                <div className="text-slate-400 font-medium py-3 text-center">
                  No active critical drug conflicts detected.
                </div>
              )}

              <button
                onClick={() => {
                  setNotificationOpen(false);
                  setView('interactions');
                }}
                className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 text-center text-cyan-400 font-bold uppercase text-[10px] tracking-wider transition-colors border border-white/5"
              >
                View Interaction Engine →
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
