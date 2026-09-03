import React, { useState } from 'react';
import { useApp } from '../../stores/AppContext';
import {
  Activity,
  X,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Search,
  Pill,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Cpu,
  Sparkles
} from 'lucide-react';

export const AgentActivityPanel: React.FC = () => {
  const {
    agentActivities,
    clearAgentActivities,
    webmcpStatus,
    showAgentActivityPanel,
    setShowAgentActivityPanel
  } = useApp();

  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!showAgentActivityPanel) return null;

  const getToolIcon = (tool: string) => {
    switch (tool) {
      case 'search_medication':
        return <Search className="w-4 h-4 text-cyan-400" />;
      case 'get_current_regimen':
        return <Pill className="w-4 h-4 text-emerald-400" />;
      case 'check_regimen_safety':
        return <ShieldCheck className="w-4 h-4 text-amber-400" />;
      default:
        return <Activity className="w-4 h-4 text-slate-400" />;
    }
  };

  const getToolColor = (tool: string) => {
    switch (tool) {
      case 'search_medication':
        return 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400';
      case 'get_current_regimen':
        return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400';
      case 'check_regimen_safety':
        return 'border-amber-500/30 bg-amber-500/10 text-amber-400';
      default:
        return 'border-white/10 bg-white/5 text-slate-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity">
      <div
        className="w-full max-w-md bg-[#0e0e17] border-l border-white/10 h-full flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-right duration-300"
        onClick={e => e.stopPropagation()}
      >
        {/* Panel Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base">Agent Activity</h3>
                {agentActivities.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[11px] font-semibold">
                    {agentActivities.length}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">WebMCP runtime tool telemetry</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {agentActivities.length > 0 && (
              <button
                onClick={clearAgentActivities}
                className="p-2 text-slate-400 hover:text-red-400 rounded-lg hover:bg-white/5 transition-colors"
                title="Clear Activity Log"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setShowAgentActivityPanel(false)}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
              title="Close panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* WebMCP Status Strip */}
        <div className="px-5 py-3 bg-white/[0.03] border-b border-white/5 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-medium">WebMCP Protocol:</span>
          {webmcpStatus === 'ready' ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>WebMCP ready</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-400 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-slate-500" />
              <span>WebMCP unavailable — manual controls active</span>
            </div>
          )}
        </div>

        {/* Activity List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {agentActivities.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 mb-4">
                <Activity className="w-8 h-8 text-slate-500" />
              </div>
              <h4 className="text-white font-semibold text-sm mb-1">No Agent Activity Logged</h4>
              <p className="text-xs text-slate-400 max-w-xs leading-relaxed mb-4">
                When an AI agent or browser model invokes <code className="text-cyan-400">search_medication</code>, <code className="text-emerald-400">get_current_regimen</code>, or <code className="text-amber-400">check_regimen_safety</code> via WebMCP, execution logs appear here in real time.
              </p>
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 text-left w-full text-xs space-y-1.5 text-slate-300">
                <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Registered Tools
                </div>
                <div className="text-[11px] font-mono text-slate-400">1. search_medication(&#123; name &#125;)</div>
                <div className="text-[11px] font-mono text-slate-400">2. get_current_regimen()</div>
                <div className="text-[11px] font-mono text-slate-400">3. check_regimen_safety(&#123; ... &#125;)</div>
              </div>
            </div>
          ) : (
            agentActivities.map(activity => {
              const isExpanded = expandedId === activity.id;
              return (
                <div
                  key={activity.id}
                  className="rounded-xl bg-white/[0.03] border border-white/10 p-3.5 hover:border-white/20 transition-all text-xs"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-white/5 border border-white/10">
                        {getToolIcon(activity.tool)}
                      </div>
                      <div>
                        <span className={`px-2 py-0.5 rounded-md border text-[11px] font-mono font-semibold ${getToolColor(activity.tool)}`}>
                          {activity.tool}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 font-mono">{activity.timestamp}</span>
                      {activity.status === 'success' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                      )}
                    </div>
                  </div>

                  <p className="text-slate-200 text-xs mb-2 leading-relaxed font-sans">
                    {activity.summary}
                  </p>

                  {(activity.params || activity.result) && (
                    <div>
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : activity.id)}
                        className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors font-medium cursor-pointer"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="w-3 h-3" /> Hide Payload
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-3 h-3" /> View Payload
                          </>
                        )}
                      </button>

                      {isExpanded && (
                        <div className="mt-2 p-2.5 rounded-lg bg-black/50 border border-white/10 font-mono text-[10px] text-slate-300 overflow-x-auto space-y-2">
                          {activity.params && (
                            <div>
                              <span className="text-slate-400 block mb-0.5">// Input Parameters</span>
                              <pre className="whitespace-pre-wrap">{JSON.stringify(activity.params, null, 2)}</pre>
                            </div>
                          )}
                          {activity.result && (
                            <div>
                              <span className="text-slate-400 block mb-0.5">// Result</span>
                              <pre className="whitespace-pre-wrap">{JSON.stringify(activity.result, null, 2)}</pre>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Panel Footer */}
        <div className="p-3 border-t border-white/10 bg-white/[0.01] text-center text-[11px] text-slate-400">
          SafeDose-AI WebMCP v1.0 • Read-only clinical telemetry
        </div>
      </div>
    </div>
  );
};
