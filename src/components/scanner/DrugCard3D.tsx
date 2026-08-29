import React from 'react';
import { motion } from 'motion/react';

export interface DrugCardProps {
  name: string;
  ndc: string;
  dosage: string;
  warnings: string[];
  confidence: number;
}

export const DrugCard3D: React.FC<DrugCardProps> = ({ name, ndc, dosage, warnings = [], confidence }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30, rotateX: 10 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="group relative w-full max-w-lg mx-auto"
      style={{ perspective: '1000px' }}
    >
      <div className="relative bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 p-6 shadow-2xl transform transition-transform duration-500 hover:scale-[1.02] hover:rotate-y-2" style={{ transformStyle: 'preserve-3d' }}>
        
        {/* Glow effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-xl" />
        
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">{name}</h2>
              <p className="text-cyan-400 font-mono text-sm">NDC: {ndc}</p>
            </div>
            <div className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
              {confidence}% Match
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-black/20 border border-white/5">
              <h3 className="text-white/60 text-xs uppercase tracking-wider mb-2">Recommended Dosage</h3>
              <p className="text-white text-lg font-medium">{dosage}</p>
            </div>

            {warnings && warnings.length > 0 && (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <h3 className="text-amber-400 text-xs uppercase tracking-wider mb-2">Warnings</h3>
                <ul className="space-y-1">
                  {warnings.map((w, i) => (
                    <li key={i} className="text-amber-200/80 text-sm flex items-start gap-2">
                      <span className="text-amber-500 mt-1">•</span>
                      {w}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* 3D Depth element */}
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-500/20 to-transparent rounded-full blur-3xl -z-10 translate-z-20" />
        </div>
      </div>
    </motion.div>
  );
};

export default DrugCard3D;
