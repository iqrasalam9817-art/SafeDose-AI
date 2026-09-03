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
  Cpu,
  ChevronDown,
  Play,
  Search,
  Pill,
  CheckCircle2
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
    showAgentActivityPanel,
    setShowAgentActivityPanel,
    executeWebMCP,
    toggleWebMCP
  } = useApp();

  const [notificationOpen, setNotificationOpen] = useState(false);
  const [webmcpMenuOpen, setWebmcpMenuOpen] = useState(false);
  const [isExecutingTool, setIsExecutingTool] = useState<string | null>(null);
  const [toolNotification, setToolNotification] = useState<string | null>(null);

  const handleRunTool = async (toolName: string, params: any = {}) => {
    setIsExecutingTool(toolName);
    try {
      await executeWebMCP(toolName, params);
      setToolNotification(`✓ Executed ${toolName}`);
      setTimeout(() => setToolNotification(null), 3000);
    } catch {
      setToolNotification(`✕ Error running ${toolName}`);
      setTimeout(() => setToolNotification(null), 3000);
    } finally {
      setIsExecutingTool(null);
    }
  };

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
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Re-analyze / Recalculate */}
        <button
          onClick={recalculateAllInteractions}
          disabled={isAnalyzing}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 hover:text-white border border-white/10 transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isAnalyzing ? 'animate-spin' : ''}`} />
          <span>{isAnalyzing ? 'Analyzing...' : 'Re-verify'}</span>
        </button>

        {/* Emergency Card Quick Button */}
        <button
          onClick={() => setShowEmergencyModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-400 hover:text-red-300 border border-red-500/30 text-xs font-bold transition-all cursor-pointer shadow-sm shadow-red-500/10"
          title="Open Emergency Health Card"
        >
          <FileHeart className="w-3.5 h-3.5 text-red-400" />
          <span className="hidden sm:inline">Emergency Card</span>
          <span className="sm:hidden">SOS</span>
        </button>

        {/* Working WebMCP Badge & Option Dropdown */}
        <div className="relative">
          <button
            onClick={() => setWebmcpMenuOpen(!webmcpMenuOpen)}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer shadow-sm ${
              webmcpStatus === 'ready'
                ? 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30 text-emerald-400 shadow-emerald-500/10'
                : 'bg-slate-500/10 hover:bg-slate-500/20 border-slate-500/30 text-slate-400 shadow-slate-500/10'
            }`}
            title="WebMCP Imperative API — Status and diagnostics"
          >
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                webmcpStatus === 'ready' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'
              }`}
            />
            <span className="font-bold">WebMCP</span>
            <span
              className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md ${
                webmcpStatus === 'ready' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-500/20 text-slate-400'
              }`}
            >
              {webmcpStatus === 'ready' ? 'Agent Ready' : 'Unavailable'}
            </span>
            <ChevronDown className="w-3 h-3 opacity-70" />
          </button>

          {/* WebMCP Interactive Dropdown Menu */}
          {webmcpMenuOpen && (
            <div className="absolute right-0 mt-2 w-80 glass-card bg-[#0e101a]/98 border border-white/15 rounded-2xl p-4 shadow-2xl z-50 text-xs text-slate-200 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-2.5 border-b border-white/10 mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-[12px] leading-tight">WebMCP Protocol</div>
                    <span className="text-[10px] text-slate-400">Imperative Browser Model Context</span>
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                    webmcpStatus === 'ready'
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                      : 'bg-white/10 border-white/20 text-slate-400'
                  }`}
                >
                  {webmcpStatus === 'ready' ? '● Ready' : '○ Unavailable'}
                </span>
              </div>

              <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">
                {webmcpStatus === 'ready'
                  ? 'Genuine WebMCP host active. Tools registered on modelContext: search_medication, get_current_regimen, and check_regimen_safety.'
                  : 'WebMCP host not detected in this browser session. Tools will register automatically when a WebMCP host attaches.'}
              </p>

              {/* Working Quick-Run Options */}
              <div className="space-y-1.5 mb-3">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
                  Quick Test Live Tools:
                </span>

                <button
                  onClick={() => handleRunTool('check_regimen_safety', { includeFoodAndSupplements: true })}
                  disabled={isExecutingTool !== null}
                  className="w-full flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-cyan-500/15 border border-white/10 hover:border-cyan-500/30 transition-all text-left group cursor-pointer disabled:opacity-50"
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <div>
                      <span className="text-white text-[11px] font-semibold block">check_regimen_safety()</span>
                      <span className="text-[10px] text-slate-400">Evaluate full active cabinet safety</span>
                    </div>
                  </div>
                  <Play className="w-3 h-3 text-cyan-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                </button>

                <button
                  onClick={() => handleRunTool('search_medication', { name: 'Warfarin' })}
                  disabled={isExecutingTool !== null}
                  className="w-full flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-cyan-500/15 border border-white/10 hover:border-cyan-500/30 transition-all text-left group cursor-pointer disabled:opacity-50"
                >
                  <div className="flex items-center gap-2">
                    <Search className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <div>
                      <span className="text-white text-[11px] font-semibold block">search_medication("Warfarin")</span>
                      <span className="text-[10px] text-slate-400">Query FDA & RxNorm drug database</span>
                    </div>
                  </div>
                  <Play className="w-3 h-3 text-cyan-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                </button>

                <button
                  onClick={() => handleRunTool('get_current_regimen', {})}
                  disabled={isExecutingTool !== null}
                  className="w-full flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-cyan-500/15 border border-white/10 hover:border-cyan-500/30 transition-all text-left group cursor-pointer disabled:opacity-50"
                >
                  <div className="flex items-center gap-2">
                    <Pill className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <div>
                      <span className="text-white text-[11px] font-semibold block">get_current_regimen()</span>
                      <span className="text-[10px] text-slate-400">Inspect confirmed cabinet meds</span>
                    </div>
                  </div>
                  <Play className="w-3 h-3 text-cyan-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                </button>
              </div>

              {toolNotification && (
                <div className="p-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold text-center mb-2 animate-fadeSlideUp flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{toolNotification}</span>
                </div>
              )}

              {/* Drawer Button */}
              <button
                onClick={() => {
                  setWebmcpMenuOpen(false);
                  setShowAgentActivityPanel(true);
                }}
                className="w-full py-2 px-3 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Open Agent Activity Panel ({agentActivities.length})</span>
              </button>
            </div>
          )}
        </div>

        {/* Collapsible Agent Activity Panel Trigger */}
        <button
          onClick={() => setShowAgentActivityPanel(!showAgentActivityPanel)}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
            showAgentActivityPanel
              ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
              : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300 hover:text-cyan-400'
          }`}
          title="Toggle Agent Activity Side Panel"
        >
          <Cpu className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="hidden md:inline">Agent Activity</span>
          {agentActivities.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-[10px] font-bold text-cyan-300">
              {agentActivities.length}
            </span>
          )}
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
