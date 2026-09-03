import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AppProvider, useApp } from './stores/AppContext';
import { Navbar, Footer } from './components/common/Navbar';
import { SplashScreen } from './components/common/SplashScreen';
import { LandingPage } from './components/landing/LandingPage';
import { DarkPremiumLayout } from './components/layout/DarkPremiumLayout';
import { OverviewView } from './components/dashboard/OverviewView';
import { MedicationsView } from './components/dashboard/MedicationsView';
import { InteractionsView } from './components/dashboard/InteractionsView';
import { MedMapView } from './components/dashboard/MedMapView';
import { ScheduleView } from './components/dashboard/ScheduleView';
import { SymptomsView } from './components/dashboard/SymptomsView';
import { CaregiverView } from './components/dashboard/CaregiverView';
import { EmergencyCardView } from './components/dashboard/EmergencyCardView';
import { ChatView } from './components/dashboard/ChatView';
import { SettingsView } from './components/dashboard/SettingsView';

// Modals
import { AddMedModal } from './components/modals/AddMedModal';
import { EmergencyModal } from './components/modals/EmergencyModal';
import { AuthModal } from './components/auth/AuthModal';
import { OnboardingWizard } from './components/onboarding/OnboardingWizard';
import { registerWebMCP, WebMCPCallbacks } from './lib/webmcp';

const MainAppContent: React.FC = () => {
  const {
    currentView,
    medications,
    interactions,
    safetyScore,
    setView,
    setMedicationSearchQuery,
    addAgentActivity,
    recalculateAllInteractions,
    setWebmcpStatus
  } = useApp();
  const [showSplash, setShowSplash] = useState(true);

  // Keep a mutable ref of the latest state and actions for WebMCP tools
  const callbacksRef = useRef<WebMCPCallbacks>({
    getMedications: () => medications,
    getInteractions: () => interactions,
    getSafetyScore: () => safetyScore,
    onSearchMedicationUI: (name) => {
      setMedicationSearchQuery(name);
      setView('medications');
    },
    onViewRegimenUI: () => {
      setView('medications');
    },
    onViewSafetyFindingsUI: () => {
      setView('interactions');
    },
    onAddAgentActivity: (activity) => {
      addAgentActivity(activity);
    },
    onRecalculateInteractions: async () => {
      await recalculateAllInteractions();
    }
  });

  // Always keep callbacksRef synced with the freshest state
  callbacksRef.current = {
    getMedications: () => medications,
    getInteractions: () => interactions,
    getSafetyScore: () => safetyScore,
    onSearchMedicationUI: (name) => {
      setMedicationSearchQuery(name);
      setView('medications');
    },
    onViewRegimenUI: () => {
      setView('medications');
    },
    onViewSafetyFindingsUI: () => {
      setView('interactions');
    },
    onAddAgentActivity: (activity) => {
      addAgentActivity(activity);
    },
    onRecalculateInteractions: async () => {
      await recalculateAllInteractions();
    }
  };

  const setWebmcpStatusRef = useRef(setWebmcpStatus);
  setWebmcpStatusRef.current = setWebmcpStatus;

  // Register WebMCP tools exactly once on mount
  useEffect(() => {
    try {
      const success = registerWebMCP({
        getMedications: () => callbacksRef.current.getMedications(),
        getInteractions: () => callbacksRef.current.getInteractions(),
        getSafetyScore: () => callbacksRef.current.getSafetyScore(),
        onSearchMedicationUI: (name, results) => {
          callbacksRef.current.onSearchMedicationUI?.(name, results);
        },
        onViewRegimenUI: () => {
          callbacksRef.current.onViewRegimenUI?.();
        },
        onViewSafetyFindingsUI: () => {
          callbacksRef.current.onViewSafetyFindingsUI?.();
        },
        onAddAgentActivity: (activity) => {
          callbacksRef.current.onAddAgentActivity(activity);
        },
        onRecalculateInteractions: async () => {
          await callbacksRef.current.onRecalculateInteractions?.();
        }
      });

      setWebmcpStatusRef.current(success ? 'ready' : 'unavailable');
    } catch {
      setWebmcpStatusRef.current('unavailable');
    }
  }, []);

  const handleSplashComplete = useCallback(() => {
    setShowSplash(false);
  }, []);

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white font-geist selection:bg-cyan-500 selection:text-black">
      {currentView === 'landing' ? (
        <>
          <LandingPage />
          <Footer />
        </>
      ) : (
        <DarkPremiumLayout>
          {currentView === 'dashboard' && <OverviewView />}
          {currentView === 'medications' && <MedicationsView />}
          {currentView === 'interactions' && <InteractionsView />}
          {currentView === 'map' && <MedMapView />}
          {currentView === 'schedule' && <ScheduleView />}
          {currentView === 'symptoms' && <SymptomsView />}
          {currentView === 'caregiver' && <CaregiverView />}
          {currentView === 'emergency' && <EmergencyCardView />}
          {currentView === 'chat' && <ChatView />}
          {currentView === 'settings' && <SettingsView />}
        </DarkPremiumLayout>
      )}

      {/* Global Modals & Wizards */}
      <AddMedModal />
      <EmergencyModal />
      <AuthModal />
      <OnboardingWizard />
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}

export default App;
