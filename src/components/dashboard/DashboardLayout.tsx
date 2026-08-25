import React, { useState } from 'react';
import { useApp } from '../../stores/AppContext';
import { AppView } from '../../stores/useAppStore';
import {
  LayoutDashboard,
  Pill,
  AlertTriangle,
  Network,
  CalendarClock,
  HeartPulse,
  Users,
  FileHeart,
  MessageSquareHeart,
  Settings,
  Plus,
  RefreshCw,
  LogOut,
  Camera,
  ChevronRight,
  Shield,
  Bell,
  Sparkles,
  Menu,
  X
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const {
    currentView,
    setView,
    profile,
    medications,
    safetyScore,
    setShowAddMedModal,
    setShowEmergencyModal,
    recalculateAllInteractions,
    isAnalyzing
  } = useApp();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  const navItems: Array<{ id: AppView; label: string; icon: React.ReactNode; badge?: number | string }> = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'medications', label: 'My Medications', icon: <Pill className="w-4 h-4" />, badge: medications.length },
    {
      id: 'interactions',
      label: 'Interactions',
      icon: <AlertTriangle className="w-4 h-4" />,
      badge: safetyScore.criticalCount + safetyScore.cautionCount > 0 ? `${safetyScore.criticalCount + safetyScore.cautionCount}` : undefined
    },
    { id: 'map', label: 'Med Map', icon: <Network className="w-4 h-4" /> },
    { id: 'schedule', label: 'AI Schedule', icon: <CalendarClock className="w-4 h-4" /> },
    { id: 'symptoms', label: 'Symptom Logger', icon: <HeartPulse className="w-4 h-4" /> },
    { id: 'caregiver', label: 'Caregiver Portal', icon: <Users className="w-4 h-4" /> },
    { id: 'emergency', label: 'Emergency Card', icon: <FileHeart className="w-4 h-4 text-red-400" /> },
    { id: 'chat', label: 'AI Specialist Chat', icon: <MessageSquareHeart className="w-4 h-4 text-blue-400" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row">
      {/* ================= SIDEBAR (Desktop Fixed) ================= */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col justify-between transform transition-transform duration-200 ease-in-out md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <button
              onClick={() => setView('landing')}
              className="flex items-center gap-3 text-left group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-black text-lg shadow-sm">
                S
              </div>
              <div>
                <span className="font-black text-lg tracking-tighter text-slate-900 leading-none">
                  SafeDose
                </span>
                <span className="block text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-0.5">
                  AI v2.5
                </span>
              </div>
            </button>

            {/* Mobile close button */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-slate-400 hover:text-slate-900 p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Action Button */}
          <div className="p-4">
            <button
              onClick={() => setShowAddMedModal(true)}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-slate-900 hover:bg-black text-white font-black uppercase text-xs tracking-tight shadow-sm hover:scale-102 active:scale-98 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>+ Add Prescription</span>
            </button>
          </div>

          {/* Nav List */}
          <nav className="px-3 space-y-1">
            {navItems.map(item => {
              const active = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setView(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-black uppercase tracking-tight transition-all cursor-pointer ${
                    active
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={active ? 'text-emerald-400' : 'text-slate-400'}>{item.icon}</span>
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-black tracking-tight ${
                        item.id === 'interactions' && Number(item.badge) > 0
                          ? 'bg-red-500 text-white animate-pulse'
                          : active
                          ? 'bg-slate-800 text-white'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Card at bottom of sidebar */}
        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-black overflow-hidden shadow-sm">
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt={profile.fullName} className="w-full h-full object-cover" />
                ) : (
                  profile.fullName.slice(0, 2).toUpperCase()
                )}
              </div>
              <div className="text-left">
                <div className="text-xs font-black text-slate-900 truncate max-w-[110px]">
                  {profile.fullName}
                </div>
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">
                  {profile.age} yrs • Blood {profile.bloodType}
                </div>
              </div>
            </div>

            <button
              onClick={() => setView('landing')}
              title="Return to Home / Sign Out"
              className="p-1.5 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile drawer */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-sm"
        />
      )}

      {/* ================= MAIN CONTENT WRAPPER ================= */}
      <div className="flex-1 flex flex-col md:pl-64 min-h-screen">
        {/* TOP BAR */}
        <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            {/* Mobile menu trigger */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden text-slate-600 hover:text-slate-900 p-2 rounded-lg hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <h2 className="text-sm sm:text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>Good day, {profile.fullName.split(' ')[0]}</span>
                <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 hidden sm:inline">
                  System Guarded
                </span>
              </h2>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            {/* Re-analyze button */}
            <button
              onClick={recalculateAllInteractions}
              disabled={isAnalyzing}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-xs font-black uppercase tracking-tight text-slate-700 border border-slate-200 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${isAnalyzing ? 'animate-spin' : ''}`} />
              <span>{isAnalyzing ? 'Analyzing...' : 'Re-verify'}</span>
            </button>

            {/* Emergency Card Quick Trigger */}
            <button
              onClick={() => setShowEmergencyModal(true)}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-black uppercase tracking-tight transition-all cursor-pointer"
            >
              <FileHeart className="w-3.5 h-3.5 text-red-600" />
              <span>Emergency Card</span>
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setNotificationOpen(!notificationOpen)}
                className="p-2 text-slate-600 hover:text-slate-900 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 relative transition-colors cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                {safetyScore.criticalCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                )}
              </button>

              {notificationOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-3xl p-5 shadow-xl z-50 text-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                    <span className="font-black text-slate-900 uppercase tracking-widest text-[10px]">Active Clinical Alerts</span>
                    <span className="text-[10px] font-bold text-emerald-600 uppercase">Live Watch</span>
                  </div>
                  {safetyScore.criticalCount > 0 ? (
                    <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-xl text-red-900 space-y-1 mb-3">
                      <div className="font-black uppercase tracking-tight text-xs">Critical Interaction Detected</div>
                      <div className="text-[11px] font-bold text-red-700 leading-snug">Warfarin + Aspirin combination requires physician confirmation and coagulation monitoring.</div>
                    </div>
                  ) : (
                    <div className="text-slate-500 font-bold py-2 text-center">No critical conflicts found</div>
                  )}
                  <button
                    onClick={() => {
                      setNotificationOpen(false);
                      setView('interactions');
                    }}
                    className="w-full text-center text-slate-900 font-black uppercase text-[10px] tracking-widest hover:text-emerald-600 pt-1"
                  >
                    View All Interactions →
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* VIEW CONTAINER */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 md:pb-12">
          {children}
        </main>
      </div>

      {/* ================= MOBILE BOTTOM NAVIGATION (5 Primary Tabs) ================= */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200 px-2 py-2 flex items-center justify-around shadow-lg">
        <button
          onClick={() => setView('dashboard')}
          className={`flex flex-col items-center gap-1 text-[10px] font-black uppercase tracking-tight ${
            currentView === 'dashboard' ? 'text-slate-900 font-black' : 'text-slate-400'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Home</span>
        </button>

        <button
          onClick={() => setView('medications')}
          className={`flex flex-col items-center gap-1 text-[10px] font-black uppercase tracking-tight ${
            currentView === 'medications' ? 'text-slate-900 font-black' : 'text-slate-400'
          }`}
        >
          <Pill className="w-5 h-5" />
          <span>Meds ({medications.length})</span>
        </button>

        {/* Center Add Button */}
        <button
          onClick={() => setShowAddMedModal(true)}
          className="flex items-center justify-center w-11 h-11 rounded-full bg-slate-900 text-white shadow-lg -mt-5"
        >
          <Plus className="w-5 h-5 text-emerald-400" />
        </button>

        <button
          onClick={() => setView('interactions')}
          className={`flex flex-col items-center gap-1 text-[10px] font-black uppercase tracking-tight ${
            currentView === 'interactions' ? 'text-red-600 font-black' : 'text-slate-400'
          }`}
        >
          <AlertTriangle className="w-5 h-5" />
          <span>Alerts</span>
        </button>

        <button
          onClick={() => setView('chat')}
          className={`flex flex-col items-center gap-1 text-[10px] font-black uppercase tracking-tight ${
            currentView === 'chat' ? 'text-slate-900 font-black' : 'text-slate-400'
          }`}
        >
          <MessageSquareHeart className="w-5 h-5" />
          <span>AI Chat</span>
        </button>
      </nav>
    </div>
  );
};
