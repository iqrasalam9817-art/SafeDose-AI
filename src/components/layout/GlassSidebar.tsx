import React, { useState } from 'react';
import { useApp } from '../../stores/AppContext';
import { AppView } from '../../stores/useAppStore';
import { 
  LayoutDashboard, 
  Pill, 
  AlertTriangle, 
  Map, 
  Calendar, 
  Activity, 
  Users, 
  CreditCard, 
  MessageSquare, 
  Settings, 
  LogOut, 
  ChevronRight,
  X
} from 'lucide-react';

interface GlassSidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function GlassSidebar({ mobileOpen, onCloseMobile }: GlassSidebarProps) {
  const {
    currentView,
    setView,
    profile,
    medications,
    safetyScore,
    setShowAddMedModal,
  } = useApp();

  const [internalMobileOpen, setInternalMobileOpen] = useState(false);
  const isMobileOpen = mobileOpen !== undefined ? mobileOpen : internalMobileOpen;
  const closeSidebar = () => {
    if (onCloseMobile) onCloseMobile();
    setInternalMobileOpen(false);
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'medications', label: 'My Medications', icon: Pill, badge: medications?.length || 6 },
    { 
      id: 'interactions', 
      label: 'Interactions', 
      icon: AlertTriangle, 
      badge: (safetyScore.criticalCount + safetyScore.cautionCount) > 0 ? (safetyScore.criticalCount + safetyScore.cautionCount) : 3, 
      alert: true 
    },
    { id: 'map', label: 'Med Map', icon: Map },
    { id: 'schedule', label: 'AI Schedule', icon: Calendar },
    { id: 'symptoms', label: 'Symptom Logger', icon: Activity },
    { id: 'caregiver', label: 'Caregiver Portal', icon: Users },
    { id: 'emergency', label: 'Emergency Card', icon: CreditCard },
    { id: 'chat', label: 'AI Specialist', icon: MessageSquare },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          onClick={closeSidebar}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-72 h-full glass-panel border-r border-white/10 flex flex-col justify-between transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isMobileOpen ? 'translate-x-0 bg-[#0c0d14]/95 backdrop-blur-2xl' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full justify-between overflow-hidden">
          <div className="flex flex-col flex-1 min-h-0">
            {/* Logo Area */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <button
                onClick={() => {
                  setView('landing');
                  closeSidebar();
                }}
                className="flex items-center gap-3 text-left group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
                  <span className="text-white font-bold text-lg">S</span>
                </div>
                <div>
                  <h1 className="font-bold text-white tracking-tight leading-none">SafeDose</h1>
                  <p className="text-xs text-white/40 mt-1">AI V2.5</p>
                </div>
              </button>

              {/* Mobile Close Button */}
              <button
                onClick={closeSidebar}
                className="md:hidden text-white/40 hover:text-white p-1 rounded-lg hover:bg-white/5 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Add Button */}
            <div className="p-4">
              <button
                onClick={() => {
                  setShowAddMedModal(true);
                  closeSidebar();
                }}
                className="w-full py-3 px-4 rounded-xl bg-white text-black font-semibold text-sm hover:scale-[1.02] active:scale-[0.98] transition-transform flex items-center justify-center gap-2 shadow-lg shadow-white/10 cursor-pointer"
              >
                <span className="text-lg font-bold leading-none">+</span> Add Prescription
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setView(item.id as AppView);
                      closeSidebar();
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 group cursor-pointer ${
                      isActive 
                        ? 'bg-white/10 text-white border border-white/10' 
                        : 'text-white/60 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-5 h-5 ${isActive ? 'text-cyan-400' : 'text-white/40 group-hover:text-white'}`} />
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {item.badge !== undefined && (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          item.alert 
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                            : 'bg-white/10 text-white/80'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                      
                      {isActive && <ChevronRight className="w-4 h-4 text-white/40" />}
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* User Profile */}
          <div className="p-4 border-t border-white/10">
            <div className="glass-card rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-black font-bold shrink-0">
                {profile?.fullName ? profile.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'MA'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{profile?.fullName || 'Maria Rodriguez'}</p>
                <p className="text-xs text-white/50 uppercase truncate">{(profile?.age || 68)} YRS • BLOOD {profile?.bloodType || 'O+'}</p>
              </div>
              <button
                onClick={() => {
                  setView('landing');
                  closeSidebar();
                }}
                title="Return to Home / Sign Out"
                className="p-1 text-white/40 hover:text-white cursor-pointer transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export default GlassSidebar;
