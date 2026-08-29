import React, { useState } from 'react';
import { AlertTriangle, Shield, ChevronUp, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface DrugConflictCardProps {
  drug1: string;
  drug2: string;
  severity: 'critical' | 'caution' | 'compatible';
  description: string;
  mechanism: string;
  effects: string;
  protocol: string;
  onAskAI?: () => void;
  onNotifyDoctor?: () => void;
  doctorNotified?: boolean;
}

export const DrugConflictCard: React.FC<DrugConflictCardProps> = ({ 
  drug1, 
  drug2, 
  severity, 
  description, 
  mechanism, 
  effects, 
  protocol,
  onAskAI,
  onNotifyDoctor,
  doctorNotified
}) => {
  const [expanded, setExpanded] = useState(true);
  
  const severityConfig = {
    critical: {
      color: 'red',
      label: 'CRITICAL CONFLICT',
      icon: AlertTriangle,
      borderClass: 'border-red-500/30',
      barClass: 'bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)]',
      badgeClass: 'bg-red-500/10 border-red-500/30 text-red-400',
      glowClass: 'from-red-500/20 to-red-600/20',
      dot1Class: 'bg-blue-400',
      dot2Class: 'bg-red-400'
    },
    caution: {
      color: 'amber',
      label: 'CAUTION',
      icon: AlertTriangle,
      borderClass: 'border-amber-500/30',
      barClass: 'bg-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.5)]',
      badgeClass: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
      glowClass: 'from-amber-500/20 to-amber-600/20',
      dot1Class: 'bg-blue-400',
      dot2Class: 'bg-amber-400'
    },
    compatible: {
      color: 'emerald',
      label: 'COMPATIBLE',
      icon: Shield,
      borderClass: 'border-emerald-500/30',
      barClass: 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]',
      badgeClass: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
      glowClass: 'from-emerald-500/20 to-emerald-600/20',
      dot1Class: 'bg-blue-400',
      dot2Class: 'bg-emerald-400'
    }
  };
  
  const config = severityConfig[severity] || severityConfig.caution;
  const ColorIcon = config.icon;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative w-full"
      style={{ perspective: '1000px' }}
    >
      {/* Glow effect behind card */}
      <div className={`absolute -inset-0.5 bg-gradient-to-r ${config.glowClass} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl`} />
      
      <div className={`relative glass-card rounded-2xl ${config.borderClass} overflow-hidden transition-all duration-300 hover:scale-[1.01]`}>
        {/* Severity Indicator Bar */}
        <div className={`h-1 w-full ${config.barClass}`} />
        
        {/* Header */}
        <div className="p-6 border-b border-white/5">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Drug Pills */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white font-medium flex items-center gap-2 text-sm">
                  <span className={`w-2 h-2 rounded-full ${config.dot1Class}`} />
                  {drug1}
                </span>
                <span className="text-white/20">→</span>
                <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white font-medium flex items-center gap-2 text-sm">
                  <span className={`w-2 h-2 rounded-full ${config.dot2Class}`} />
                  {drug2}
                </span>
              </div>
              
              <span className={`px-3 py-1 rounded-full border ${config.badgeClass} text-xs font-bold flex items-center gap-1.5`}>
                <ColorIcon className="w-3.5 h-3.5" />
                {config.label}
              </span>

              {doctorNotified && (
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                  ✓ Doctor Alerted
                </span>
              )}
            </div>
            
            <button 
              onClick={() => setExpanded(!expanded)}
              aria-label={expanded ? 'Collapse details' : 'Expand details'}
              className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/60 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
          
          <p className="text-white/90 text-base sm:text-lg leading-relaxed font-light">
            "{description}"
          </p>
        </div>

        {/* Expandable Content */}
        <AnimatePresence>
          {expanded && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Mechanism */}
                <div className="glass-panel rounded-xl p-4 border-l-2 border-blue-500/50">
                  <h3 className="text-blue-400 text-xs font-bold uppercase tracking-wider mb-3">1. Pharmacological Mechanism</h3>
                  <p className="text-white/70 text-sm leading-relaxed">{mechanism || 'No conflicting metabolic pathway identified.'}</p>
                </div>
                
                {/* Effects */}
                <div className="glass-panel rounded-xl p-4 border-l-2 border-amber-500/50">
                  <h3 className="text-amber-400 text-xs font-bold uppercase tracking-wider mb-3">2. What You Might Experience</h3>
                  <p className="text-white/70 text-sm leading-relaxed">{effects || 'Standard therapeutic absorption with no adverse additive risks.'}</p>
                </div>
                
                {/* Protocol */}
                <div className="glass-panel rounded-xl p-4 border-l-2 border-emerald-500/50">
                  <h3 className="text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3">3. Action & Protocol</h3>
                  <p className="text-white/70 text-sm leading-relaxed">{protocol || 'Administer according to physician prescribing schedule.'}</p>
                </div>
              </div>

              {/* Action Buttons if provided */}
              {(onAskAI || onNotifyDoctor) && (
                <div className="px-6 pb-4 flex flex-wrap items-center gap-3">
                  {onAskAI && (
                    <button
                      onClick={onAskAI}
                      className="px-4 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs font-bold border border-cyan-500/30 transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <span>💬 Ask AI Pharmacist</span>
                    </button>
                  )}
                  {onNotifyDoctor && !doctorNotified && (
                    <button
                      onClick={onNotifyDoctor}
                      className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold border border-red-500/30 transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <span>📞 Alert Doctor</span>
                    </button>
                  )}
                </div>
              )}
              
              {/* Footer */}
              <div className="px-6 pb-6 flex flex-wrap justify-between items-center text-xs text-white/30 border-t border-white/5 pt-4 gap-2">
                <span>Authority: FDA DailyMed & Clinical Pharmacopeia</span>
                <span>openFDA Drug Interaction Framework</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default DrugConflictCard;
