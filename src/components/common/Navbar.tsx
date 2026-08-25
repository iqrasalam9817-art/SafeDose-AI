import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../../stores/AppContext';
import {
  ShieldAlert,
  Plus,
  Camera,
  Activity,
  Menu,
  X,
  AlertTriangle,
  FileHeart,
  Sparkles,
  LayoutDashboard,
  User,
  HeartPulse
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    currentView,
    setView,
    setShowAuthModal,
    setShowAddMedModal,
    setShowEmergencyModal,
    profile,
    safetyScore,
    medications
  } = useApp();

  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'How It Works', id: 'how-it-works' },
    { label: 'Features', id: 'features' },
    { label: 'Severity Levels', id: 'severity' },
    { label: 'Caregivers', id: 'caregivers' }
  ];

  const handleNavClick = (sectionId: string) => {
    setMobileMenuOpen(false);
    if (currentView !== 'landing') {
      setView('landing');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        el?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(sectionId);
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-200 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm py-3'
          : 'bg-white/80 backdrop-blur-sm border-b border-slate-100 py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <button
          onClick={() => setView('landing')}
          className="flex items-center gap-3 group cursor-pointer text-left"
        >
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <span className="text-white font-black text-xl leading-none">S</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-2xl font-black tracking-tighter text-slate-900 leading-none">
                SafeDose
              </span>
              <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full bg-slate-900 text-white tracking-widest">
                AI
              </span>
            </div>
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-0.5">
              Every dose, confidently safe.
            </p>
          </div>
        </button>

        {/* Center navigation links (Desktop) */}
        {currentView === 'landing' ? (
          <nav className="hidden md:flex items-center gap-8 text-xs font-black uppercase tracking-wider text-slate-600">
            {navLinks.map(link => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className="hover:text-slate-900 transition-colors py-1 cursor-pointer"
              >
                {link.label}
              </button>
            ))}
          </nav>
        ) : (
          <div className="hidden md:flex items-center gap-3">
            <div className="px-4 py-2 bg-slate-100 rounded-full border border-slate-200 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-xs font-bold uppercase tracking-tight text-slate-700">
                Active Regimen: {medications.length} Prescriptions
              </span>
              <span className="text-slate-300">|</span>
              <span
                className={`text-xs font-black uppercase tracking-tight ${
                  safetyScore.score >= 80 ? 'text-emerald-600' : 'text-red-600'
                }`}
              >
                Safety: {safetyScore.score}/100
              </span>
            </div>
          </div>
        )}

        {/* Right CTA Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Emergency Card Quick Button */}
          <button
            onClick={() => setShowEmergencyModal(true)}
            className="flex items-center gap-1.5 text-xs font-black uppercase tracking-tight px-3.5 py-2 rounded-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-all cursor-pointer"
            title="Emergency Medical Card"
          >
            <FileHeart className="w-3.5 h-3.5 text-red-600" />
            <span className="hidden sm:inline">Emergency ID</span>
          </button>

          {currentView === 'landing' ? (
            <>
              <button
                onClick={() => setView('dashboard')}
                className="hidden sm:flex items-center gap-2 px-5 py-2.5 text-xs font-black uppercase tracking-tight rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition-all cursor-pointer"
              >
                <LayoutDashboard className="w-4 h-4 text-slate-700" />
                Live App
              </button>
              <button
                onClick={() => setView('dashboard')}
                className="flex items-center gap-2 px-6 py-2.5 text-xs font-black uppercase tracking-tight rounded-full bg-slate-900 hover:bg-black text-white shadow-sm hover:scale-102 active:scale-98 transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Launch Checker</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setShowAddMedModal(true)}
                className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-black uppercase tracking-tight rounded-full bg-slate-900 hover:bg-black text-white shadow-sm hover:scale-102 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-400" />
                <span>+ Add Medication</span>
              </button>
              <button
                onClick={() => setView('landing')}
                className="hidden sm:block text-xs font-black uppercase tracking-tight text-slate-500 hover:text-slate-900 transition-colors px-2 py-1"
              >
                Exit
              </button>
            </>
          )}

          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Slide-down Nav */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-slate-200 px-6 py-5 space-y-3 shadow-lg"
          >
            {navLinks.map(link => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className="block w-full text-left py-2 text-sm font-black uppercase tracking-tight text-slate-800 hover:text-emerald-600"
              >
                {link.label}
              </button>
            ))}
            <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setView('dashboard');
                }}
                className="w-full py-3 text-center text-xs font-black uppercase tracking-tight rounded-full bg-slate-900 text-white"
              >
                Open Dashboard
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export const Footer: React.FC = () => {
  const { setView } = useApp();

  return (
    <footer className="bg-white border-t border-slate-200 pt-12 pb-8 text-slate-600 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-black text-base">
                S
              </div>
              <span className="font-black text-slate-900 text-xl tracking-tight">SafeDose</span>
            </div>
            <p className="text-xs font-bold text-slate-500 leading-relaxed">
              Every dose, confidently safe. Continuous medication conflict detection and chronopharmacology intelligence.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-700 font-bold tracking-tight">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Real-Time FDA & RxNorm Grounding
            </div>
          </div>

          {/* Core Modules */}
          <div>
            <h4 className="text-slate-900 font-black text-xs uppercase tracking-widest mb-3">
              Safety Systems
            </h4>
            <ul className="space-y-2 text-xs font-bold text-slate-600">
              <li>
                <button
                  onClick={() => setView('medications')}
                  className="hover:text-emerald-600 transition-colors"
                >
                  Prescription Scanner
                </button>
              </li>
              <li>
                <button
                  onClick={() => setView('interactions')}
                  className="hover:text-emerald-600 transition-colors"
                >
                  Drug Conflict Checker
                </button>
              </li>
              <li>
                <button
                  onClick={() => setView('map')}
                  className="hover:text-emerald-600 transition-colors"
                >
                  Interactive Medication Map
                </button>
              </li>
              <li>
                <button
                  onClick={() => setView('schedule')}
                  className="hover:text-emerald-600 transition-colors"
                >
                  AI Smart Schedule
                </button>
              </li>
            </ul>
          </div>

          {/* Medical Data Sources */}
          <div>
            <h4 className="text-slate-900 font-black text-xs uppercase tracking-widest mb-3">
              Clinical References
            </h4>
            <ul className="space-y-2 text-xs font-bold text-slate-600">
              <li className="flex items-center gap-1.5">
                <span>🏛️</span> U.S. Food & Drug Administration (openFDA)
              </li>
              <li className="flex items-center gap-1.5">
                <span>📚</span> National Library of Medicine (RxNorm)
              </li>
              <li className="flex items-center gap-1.5">
                <span>💊</span> DailyMed Structured Product Labels
              </li>
              <li className="flex items-center gap-1.5">
                <span>🤖</span> Google Gemini 2.5 Clinical Reasoning
              </li>
            </ul>
          </div>

          {/* Emergency & Support */}
          <div>
            <h4 className="text-slate-900 font-black text-xs uppercase tracking-widest mb-3">
              Emergency Hotlines
            </h4>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div>
                <span className="text-red-600 font-black block uppercase tracking-tight">Poison Control:</span>
                <a href="tel:18002221222" className="text-slate-800 font-bold hover:underline">
                  1-800-222-1222 (24/7)
                </a>
              </div>
              <div>
                <span className="text-amber-600 font-black block uppercase tracking-tight">Medical Emergency:</span>
                <span className="text-slate-900 font-black">Call 911 Immediately</span>
              </div>
            </div>
          </div>
        </div>

        {/* Prominent Medical Disclaimer */}
        <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-900 font-medium leading-relaxed">
              <strong className="text-amber-950 font-black">Important Medical Notice:</strong> SafeDose is an AI-powered educational reference and decision-support tool. It is not intended to replace professional medical advice, clinical diagnosis, or prescribed medical treatment. Always consult your prescribing physician, cardiologist, or pharmacist before adjusting, starting, or discontinuing any medication regimen.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between text-xs font-bold text-slate-400 pt-4 border-t border-slate-200">
          <p>© {new Date().getFullYear()} SafeDose™ — Every dose, confidently safe. All rights reserved.</p>
          <div className="flex items-center gap-4 mt-2 sm:mt-0">
            <span>HIPAA-Aware Design</span>
            <span>•</span>
            <span>Encrypted At Rest</span>
            <span>•</span>
            <span>Zero Data Resale</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
