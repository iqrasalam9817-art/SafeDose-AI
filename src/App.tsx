import React, { useState, useEffect } from 'react';
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

const MainAppContent: React.FC = () => {
  const { currentView } = useApp();
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
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
