import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [statusIndex, setStatusIndex] = useState(0);

  const statusPhrases = [
    'Loading drug database & RxNorm index...',
    'Connecting openFDA safety intelligence...',
    'Analyzing active medication profiles...',
    'Preparing your SafeDose protection shield...'
  ];

  const brandName = 'SafeDose';

  // Canvas floating particles (pill/molecules shapes)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const particles: Array<{
      x: number;
      y: number;
      size: number;
      speedY: number;
      speedX: number;
      opacity: number;
      shape: 'circle' | 'pill' | 'square';
      color: string;
    }> = [];

    const colors = [
      'rgba(59, 130, 246, 0.4)',
      'rgba(124, 58, 237, 0.35)',
      'rgba(16, 185, 129, 0.35)'
    ];

    for (let i = 0; i < 70; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 4 + 2,
        speedY: -(Math.random() * 0.8 + 0.2),
        speedX: (Math.random() - 0.5) * 0.4,
        opacity: Math.random() * 0.6 + 0.2,
        shape: Math.random() > 0.6 ? 'pill' : Math.random() > 0.3 ? 'circle' : 'square',
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach(p => {
        p.y += p.speedY;
        p.x += p.speedX;

        if (p.y < -20) p.y = height + 10;
        if (p.x < -20) p.x = width + 10;
        if (p.x > width + 20) p.x = -10;

        ctx.fillStyle = p.color;
        ctx.beginPath();
        if (p.shape === 'circle') {
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.shape === 'pill') {
          ctx.roundRect(p.x - p.size, p.y - p.size / 2, p.size * 2.2, p.size, p.size / 2);
          ctx.fill();
        } else {
          ctx.rect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
          ctx.fill();
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Progress timer and text cycler
  useEffect(() => {
    const startTime = Date.now();
    const duration = 2400; // 2.4 seconds

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);

      if (pct >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          onComplete();
        }, 300);
      }
    }, 40);

    const phraseInterval = setInterval(() => {
      setStatusIndex(prev => (prev + 1) % statusPhrases.length);
    }, 600);

    return () => {
      clearInterval(interval);
      clearInterval(phraseInterval);
    };
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0A0F1E] overflow-hidden"
    >
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      {/* Radial glow background */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute w-[400px] h-[400px] rounded-full bg-emerald-600/10 blur-[100px] pointer-events-none translate-x-20 translate-y-20" />

      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-md">
        {/* Animated Emblem */}
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.6, type: 'spring', bounce: 0.4 }}
          className="relative mb-6"
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-500 via-blue-600 to-indigo-600 p-[2px] shadow-[0_0_40px_rgba(59,130,246,0.5)] animate-pulse">
            <div className="w-full h-full bg-[#0A0F1E] rounded-2xl flex items-center justify-center text-3xl">
              🌿
            </div>
          </div>
          <div className="absolute -inset-2 rounded-2xl border border-blue-500/20 animate-spin [animation-duration:8s]" />
        </motion.div>

        {/* Letter-by-letter brand name */}
        <div className="flex items-center justify-center mb-2">
          {brandName.split('').map((char, index) => (
            <motion.span
              key={index}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.05, duration: 0.3 }}
              className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent"
            >
              {char}
            </motion.span>
          ))}
          <motion.span
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.3 }}
            className="text-xs font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full ml-2"
          >
            AI Shield
          </motion.span>
        </div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="text-slate-400 text-sm font-medium mb-8"
        >
          Every dose, confidently safe.
        </motion.p>

        {/* Progress bar */}
        <div className="w-64 h-1.5 bg-slate-800/80 rounded-full overflow-hidden mb-4 border border-white/10 p-[1px]">
          <motion.div
            className="h-full bg-gradient-to-r from-emerald-400 via-blue-500 to-purple-500 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Status text */}
        <div className="h-6 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={statusIndex}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="text-xs text-slate-500 font-mono"
            >
              {statusPhrases[statusIndex]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};
