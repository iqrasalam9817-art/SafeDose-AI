import React, { useState, useEffect } from 'react';
import { ArrowRight, Menu, X, Plus, Shield, Activity, Pill, LayoutDashboard, Cpu } from 'lucide-react';
import { useApp } from '../../stores/AppContext';

// SafeDose AI Premium Landing Component
export default function SafeDoseHero() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { setView, setShowAddMedModal, webmcpStatus, setShowAgentActivityPanel } = useApp();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAddMedication = () => {
    setShowAddMedModal(true);
    setView('dashboard');
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#0a0a0f] font-geist">
      {/* Font Import */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&display=swap');
        .font-geist { font-family: 'Geist', sans-serif; }
        
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotateX(0deg); }
          50% { transform: translateY(-20px) rotateX(2deg); }
        }
        
        .animate-fadeSlideUp { animation: fadeSlideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .animate-float { animation: float 6s ease-in-out infinite; }
        
        .glass-panel {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }
        
        .text-gradient {
          background: linear-gradient(135deg, #fff 0%, #a5b4fc 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      `}</style>

      {/* Video Background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 h-full w-full object-cover opacity-40"
        style={{ objectPosition: '70% center' }}
      >
        <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_204221_5339e40b-e73d-4ab0-9c65-79c18c66fd50.mp4" type="video/mp4" />
      </video>
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f]/80 via-[#0a0a0f]/50 to-[#0a0a0f]" />

      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-30 px-6 py-5 md:px-12 lg:px-16 flex justify-between items-center transition-all duration-300 ${scrolled ? 'bg-[#0a0a0f]/80 backdrop-blur-md' : ''}`}>
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('landing')}>
            <Shield className="w-6 h-6 text-cyan-400" />
            <span className="text-lg font-semibold tracking-tight text-white sm:text-xl">SafeDose</span>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={() => setView('dashboard')}
              className="text-sm font-medium text-white/80 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <LayoutDashboard className="w-4 h-4 text-cyan-400" />
              Dashboard
            </button>
            <button
              onClick={() => setView('medications')}
              className="text-sm font-medium text-white/80 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Pill className="w-4 h-4 text-emerald-400" />
              My Medications
            </button>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-3">
          {/* WebMCP Status Badge & Direct Trigger */}
          <button
            onClick={() => {
              setView('dashboard');
              setShowAgentActivityPanel(true);
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              webmcpStatus === 'ready'
                ? 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30 text-emerald-400 shadow-sm shadow-emerald-500/10'
                : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-400'
            }`}
            title="WebMCP Imperative Tool Protocol — Agent Activity & Tools"
          >
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                webmcpStatus === 'ready' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'
              }`}
            />
            <span className="font-bold">WebMCP</span>
            <span className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md ${
              webmcpStatus === 'ready' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10 text-slate-400'
            }`}>
              {webmcpStatus === 'ready' ? 'Agent Ready' : 'Unavailable'}
            </span>
          </button>

          <button 
            onClick={handleAddMedication}
            className="rounded-xl bg-white px-5 py-2 text-sm font-semibold text-black hover:scale-105 transition-transform cursor-pointer inline-flex items-center gap-1.5 shadow-lg shadow-white/10"
          >
            <Plus className="w-4 h-4" />
            Add Medication
          </button>
        </div>

        {/* Mobile Toggle */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden relative w-10 h-10 flex items-center justify-center z-50 active:scale-90 transition-transform cursor-pointer"
        >
          <div className="relative w-6 h-6">
            <Menu className={`absolute inset-0 w-6 h-6 text-white transition-all duration-300 ${mobileMenuOpen ? 'rotate-90 opacity-0' : 'rotate-0 opacity-100'}`} />
            <X className={`absolute inset-0 w-6 h-6 text-white transition-all duration-300 ${mobileMenuOpen ? 'rotate-0 opacity-100' : '-rotate-90 opacity-0'}`} />
          </div>
        </button>
      </nav>

      {/* Mobile Menu */}
      <div className={`fixed inset-x-0 top-0 z-20 bg-black/98 backdrop-blur-xl transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${mobileMenuOpen ? 'h-screen opacity-100' : 'h-0 opacity-0 pointer-events-none'}`}>
        <div className={`flex h-full flex-col justify-center px-8 transition-all duration-500 delay-100 ${mobileMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <button 
            onClick={() => {
              setMobileMenuOpen(false);
              setView('dashboard');
            }}
            className="text-3xl font-medium text-white/90 hover:text-white py-3 text-left flex items-center gap-3 cursor-pointer"
          >
            <LayoutDashboard className="w-6 h-6 text-cyan-400" />
            Dashboard
          </button>
          <button 
            onClick={() => {
              setMobileMenuOpen(false);
              setView('medications');
            }}
            className="text-3xl font-medium text-white/90 hover:text-white py-3 text-left flex items-center gap-3 cursor-pointer"
          >
            <Pill className="w-6 h-6 text-emerald-400" />
            My Medications
          </button>
          <button 
            onClick={() => {
              setMobileMenuOpen(false);
              setView('dashboard');
              setShowAgentActivityPanel(true);
            }}
            className="text-3xl font-medium text-emerald-400 hover:text-emerald-300 py-3 text-left flex items-center gap-3 cursor-pointer"
          >
            <Cpu className="w-6 h-6 text-emerald-400" />
            <span>WebMCP Agent</span>
            <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Ready
            </span>
          </button>
          <button 
            onClick={() => {
              setMobileMenuOpen(false);
              handleAddMedication();
            }} 
            className="mt-6 rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-black hover:scale-105 transition-transform w-fit cursor-pointer inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Medication
          </button>
        </div>
      </div>

      {/* Hero Content */}
      <main className="relative z-10 h-screen flex flex-col justify-between px-6 pb-10 pt-24 sm:pb-12 sm:pt-28 md:px-12 md:pb-16 md:pt-32 lg:px-16">
        
        {/* Top Section */}
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6 animate-fadeSlideUp" style={{ animationDelay: '0.2s' }}>
            <Activity className="w-4 h-4 text-cyan-400" />
            <span className="text-xs sm:text-sm text-white/90 font-medium">AI-Powered Drug Safety</span>
          </div>
          
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-medium leading-[1.1] tracking-tight text-white animate-fadeSlideUp" style={{ animationDelay: '0.4s' }}>
            Precision dosing <br/>
            <span className="text-gradient">powered by vision.</span>
          </h1>
        </div>

        {/* Bottom Section */}
        <div className="space-y-6">
          <p className="text-sm sm:text-base md:text-lg leading-relaxed text-white/60 max-w-sm sm:max-w-lg animate-fadeSlideUp" style={{ animationDelay: '0.7s' }}>
            Instant medication verification through advanced OCR and FDA monographs. Zero cloud API exposure. Just pure clinical accuracy with FDA-grade data.
          </p>
          
          <div className="flex flex-wrap gap-4 animate-fadeSlideUp" style={{ animationDelay: '0.9s' }}>
            <button 
              onClick={handleAddMedication}
              className="group rounded-xl bg-white px-6 py-3 text-sm font-semibold text-black hover:scale-105 transition-transform inline-flex items-center gap-2 cursor-pointer shadow-lg shadow-white/10"
            >
              <Plus className="w-4 h-4" />
              Add Medication
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => setView('dashboard')}
              className="rounded-xl px-6 py-3 text-sm font-semibold text-white border border-white/20 hover:bg-white/5 transition-colors cursor-pointer"
            >
              Open Dashboard
            </button>
          </div>

          {/* 3D Preview Card */}
          <div className="relative mt-8 perspective-1000 animate-fadeSlideUp" style={{ animationDelay: '1.1s' }}>
            <div className="glass-panel rounded-2xl p-6 max-w-md transform hover:rotateX-2 hover:rotateY-2 transition-transform duration-500 animate-float" style={{ transformStyle: 'preserve-3d' }}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 flex items-center justify-center border border-cyan-500/30">
                  <Shield className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Lisinopril 10mg</h3>
                  <p className="text-white/60 text-sm mb-2">NDC: 00093-1058-01</p>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-xs font-medium">Safe Dose</span>
                    <span className="text-white/40 text-xs">Hypertension</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center text-xs text-white/50">
                <span>FDA Verified</span>
                <span>Updated: 2 mins ago</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
