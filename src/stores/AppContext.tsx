import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  AppState,
  getInitialAppState,
  calculateSafetyScoreFromInteractions,
  AppView
} from './useAppStore';
import { Medication, Interaction, SymptomLog, CaregiverLink, Profile, ChatMessage, ScheduleItem, AgentActivityItem } from '../types';
import { detectLocalInteraction } from '../lib/fda';
import { analyzeInteractionWithGemini, sendChatMessage as sendGeminiChat } from '../lib/gemini';
import { DEFAULT_MEDICATIONS, DEFAULT_PROFILE, DEFAULT_INTERACTIONS, DEFAULT_SCHEDULE, DEFAULT_CAREGIVER_LINKS, DEFAULT_SYMPTOM_LOGS } from '../data/defaultData';
import { executeWebMCPTool, isWebMCPAvailable } from '../lib/webmcp';

const STORAGE_KEY = 'safedose_app_state_v1';

interface AppContextType extends AppState {
  caregivers: CaregiverLink[];
  setView: (view: AppView) => void;
  setShowAuthModal: (show: boolean) => void;
  setShowAddMedModal: (show: boolean) => void;
  setShowEmergencyModal: (show: boolean) => void;
  setShowOnboarding: (show: boolean) => void;
  setOnboardingStep: (step: number) => void;
  setActiveDrugDetail: (med: Medication | null) => void;
  setActiveInteractionDetail: (interaction: Interaction | null) => void;
  setIsAuthenticated: (auth: boolean) => void;
  addMedication: (med: Omit<Medication, 'id' | 'active'>) => Promise<void>;
  updateMedication: (id: string, updates: Partial<Medication>) => void;
  removeMedication: (id: string) => void;
  recalculateAllInteractions: () => Promise<void>;
  setSchedule: (items: ScheduleItem[]) => void;
  toggleScheduleTaken: (id: string) => void;
  toggleScheduleSkipped: (id: string) => void;
  addSymptomLog: (log: Omit<SymptomLog, 'id' | 'loggedAt'>) => void;
  addCaregiver: (cg: Omit<CaregiverLink, 'id'>) => void;
  removeCaregiver: (id: string) => void;
  sendChatMessage: (text: string) => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => void;
  dismissInteraction: (id: string) => void;
  notifyDoctorInteraction: (id: string) => void;
  resetToDefaultData: () => void;
  resetAllData: () => void;
  startOnboarding: () => void;
  completeOnboarding: () => void;
  addAgentActivity: (activity: Omit<AgentActivityItem, 'id' | 'timestamp'>) => void;
  clearAgentActivities: () => void;
  setMedicationSearchQuery: (query: string) => void;
  setWebmcpStatus: (status: 'ready' | 'unavailable') => void;
  setShowAgentActivityPanel: (show: boolean) => void;
  executeWebMCP: (toolName: string, params?: any) => Promise<any>;
  toggleWebMCP: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(getInitialAppState);

  // Persist to local storage
  useEffect(() => {
    try {
      const toSave = {
        profile: state.profile,
        medications: state.medications,
        interactions: state.interactions,
        safetyScore: state.safetyScore,
        schedule: state.schedule,
        symptomLogs: state.symptomLogs,
        caregiverLinks: state.caregiverLinks,
        chatMessages: state.chatMessages,
        currentView: state.currentView,
        isAuthenticated: state.isAuthenticated,
        adherencePercentage: state.adherencePercentage
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (e) {
      console.warn('Could not save to localStorage:', e);
    }
  }, [state]);

  const setView = useCallback((view: AppView) => {
    setState(prev => ({ ...prev, currentView: view }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const setShowAuthModal = useCallback((show: boolean) => setState(prev => ({ ...prev, showAuthModal: show })), []);
  const setShowAddMedModal = useCallback((show: boolean) => setState(prev => ({ ...prev, showAddMedModal: show })), []);
  const setShowEmergencyModal = useCallback((show: boolean) => setState(prev => ({ ...prev, showEmergencyModal: show })), []);
  const setShowOnboarding = useCallback((show: boolean) => setState(prev => ({ ...prev, showOnboarding: show })), []);
  const setOnboardingStep = useCallback((step: number) => setState(prev => ({ ...prev, onboardingStep: step })), []);
  const setActiveDrugDetail = useCallback((med: Medication | null) => setState(prev => ({ ...prev, activeDrugDetail: med })), []);
  const setActiveInteractionDetail = useCallback((interaction: Interaction | null) => setState(prev => ({ ...prev, activeInteractionDetail: interaction })), []);
  const setIsAuthenticated = useCallback((auth: boolean) => setState(prev => ({ ...prev, isAuthenticated: auth })), []);

  const recalculateAllInteractions = async () => {
    setState(prev => ({ ...prev, isAnalyzing: true }));
    const meds = state.medications.filter(m => m.active);
    const newInteractions: Interaction[] = [];

    for (let i = 0; i < meds.length; i++) {
      for (let j = i + 1; j < meds.length; j++) {
        const drugA = meds[i].drugName;
        const drugB = meds[j].drugName;

        // 1. Check local clinical pharmacopeia
        const local = detectLocalInteraction(drugA, drugB);
        if (local) {
          newInteractions.push(local);
        } else {
          // 2. Try Gemini analysis
          try {
            const aiRes = await analyzeInteractionWithGemini(drugA, drugB, state.profile.conditions);
            if (aiRes && aiRes.severity && aiRes.severity !== 'safe') {
              newInteractions.push({
                id: `int-${drugA}-${drugB}`.toLowerCase().replace(/[^a-z0-9]/g, '-'),
                drugAName: drugA,
                drugBName: drugB,
                severity: aiRes.severity,
                mechanism: aiRes.mechanism || 'Pharmacological interaction',
                description: aiRes.description || 'Observed kinetic interaction.',
                aiExplanation: aiRes.aiExplanation || 'These medications may influence each other in your body.',
                whatItMeans: aiRes.whatItMeans || 'Pay attention to how you feel.',
                actionRequired: aiRes.actionRequired || 'Consult doctor or pharmacist.',
                source: 'SafeDose AI & openFDA',
                dismissed: false,
                doctorNotified: false
              });
            }
          } catch (err) {
            console.warn('AI interaction check fallback:', err);
          }
        }
      }
    }

    const newScore = calculateSafetyScoreFromInteractions(newInteractions);
    setState(prev => ({
      ...prev,
      interactions: newInteractions,
      safetyScore: newScore,
      isAnalyzing: false
    }));
  };

  const addMedication = async (medData: Omit<Medication, 'id' | 'active'>) => {
    const newMed: Medication = {
      ...medData,
      id: `med-${Date.now()}`,
      active: true
    };

    const updatedMeds = [...state.medications, newMed];
    setState(prev => ({
      ...prev,
      medications: updatedMeds,
      showAddMedModal: false
    }));

    // Trigger recalculation
    setTimeout(() => {
      recalculateAllInteractions();
    }, 100);
  };

  const updateMedication = (id: string, updates: Partial<Medication>) => {
    setState(prev => ({
      ...prev,
      medications: prev.medications.map(m => (m.id === id ? { ...m, ...updates } : m))
    }));
    setTimeout(() => recalculateAllInteractions(), 100);
  };

  const removeMedication = (id: string) => {
    setState(prev => ({
      ...prev,
      medications: prev.medications.filter(m => m.id !== id),
      activeDrugDetail: null
    }));
    setTimeout(() => recalculateAllInteractions(), 100);
  };

  const setSchedule = (items: ScheduleItem[]) => {
    setState(prev => ({ ...prev, schedule: items }));
  };

  const toggleScheduleTaken = (id: string) => {
    setState(prev => {
      const updated = prev.schedule.map(item => {
        if (item.id === id) {
          return {
            ...item,
            takenToday: !item.takenToday,
            skippedToday: false
          };
        }
        return item;
      });
      const takenCount = updated.filter(i => i.takenToday).length;
      const adherence = Math.round((takenCount / updated.length) * 100);
      return {
        ...prev,
        schedule: updated,
        adherencePercentage: adherence || 89
      };
    });
  };

  const toggleScheduleSkipped = (id: string) => {
    setState(prev => ({
      ...prev,
      schedule: prev.schedule.map(item => {
        if (item.id === id) {
          return {
            ...item,
            skippedToday: !item.skippedToday,
            takenToday: false
          };
        }
        return item;
      })
    }));
  };

  const addSymptomLog = (log: Omit<SymptomLog, 'id' | 'loggedAt'>) => {
    const newLog: SymptomLog = {
      ...log,
      id: `sym-${Date.now()}`,
      loggedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', Today'
    };
    setState(prev => ({
      ...prev,
      symptomLogs: [newLog, ...prev.symptomLogs]
    }));
  };

  const addCaregiver = (cg: Omit<CaregiverLink, 'id'>) => {
    const newLink: CaregiverLink = {
      ...cg,
      id: `cg-${Date.now()}`
    };
    setState(prev => ({
      ...prev,
      caregiverLinks: [...prev.caregiverLinks, newLink]
    }));
  };

  const removeCaregiver = (id: string) => {
    setState(prev => ({
      ...prev,
      caregiverLinks: prev.caregiverLinks.filter(c => c.id !== id)
    }));
  };

  const sendChatMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setState(prev => ({
      ...prev,
      chatMessages: [...prev.chatMessages, userMsg]
    }));

    try {
      const replyText = await sendGeminiChat(
        text,
        state.chatMessages,
        state.medications,
        state.profile,
        state.interactions
      );

      const aiMsg: ChatMessage = {
        id: `msg-ai-${Date.now()}`,
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setState(prev => ({
        ...prev,
        chatMessages: [...prev.chatMessages, aiMsg]
      }));
    } catch (err) {
      const fallbackMsg: ChatMessage = {
        id: `msg-ai-${Date.now()}`,
        sender: 'assistant',
        text: `I understand your question regarding your medications. Based on your profile (${state.medications.length} active prescriptions), always ensure you maintain regular INR monitoring and consult Dr. ${state.profile.primaryDoctorName} for any dosage changes.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setState(prev => ({
        ...prev,
        chatMessages: [...prev.chatMessages, fallbackMsg]
      }));
    }
  };

  const updateProfile = (updates: Partial<Profile>) => {
    setState(prev => ({
      ...prev,
      profile: { ...prev.profile, ...updates }
    }));
  };

  const dismissInteraction = (id: string) => {
    setState(prev => {
      const updated = prev.interactions.map(i => (i.id === id ? { ...i, dismissed: true } : i));
      return {
        ...prev,
        interactions: updated,
        safetyScore: calculateSafetyScoreFromInteractions(updated)
      };
    });
  };

  const notifyDoctorInteraction = (id: string) => {
    setState(prev => ({
      ...prev,
      interactions: prev.interactions.map(i => (i.id === id ? { ...i, doctorNotified: true } : i))
    }));
  };

  const resetToDefaultData = () => {
    const safety = calculateSafetyScoreFromInteractions(DEFAULT_INTERACTIONS);
    setState({
      profile: DEFAULT_PROFILE,
      medications: DEFAULT_MEDICATIONS,
      interactions: DEFAULT_INTERACTIONS,
      safetyScore: safety,
      schedule: DEFAULT_SCHEDULE,
      symptomLogs: DEFAULT_SYMPTOM_LOGS,
      caregiverLinks: DEFAULT_CAREGIVER_LINKS,
      chatMessages: [
        {
          id: 'msg-welcome',
          sender: 'assistant',
          text: "👋 Hello Maria! I'm **SafeDose AI**, your personal medication safety guardian. I monitor your 6 active prescriptions for conflicts 24/7. Ask me anything about your medications, food interactions, or symptom worries.",
          timestamp: 'Just now'
        }
      ],
      currentView: 'dashboard',
      isAuthenticated: true,
      showAuthModal: false,
      showAddMedModal: false,
      showEmergencyModal: false,
      showOnboarding: false,
      onboardingStep: 1,
      isAnalyzing: false,
      activeDrugDetail: null,
      activeInteractionDetail: null,
      adherencePercentage: 89
    });
  };

  const startOnboarding = () => {
    setState(prev => ({
      ...prev,
      showOnboarding: true,
      onboardingStep: 1
    }));
  };

  const completeOnboarding = () => {
    setState(prev => ({
      ...prev,
      showOnboarding: false,
      currentView: 'dashboard',
      profile: { ...prev.profile, onboardingComplete: true }
    }));
  };

  const addAgentActivity = useCallback((activity: Omit<AgentActivityItem, 'id' | 'timestamp'>) => {
    const newItem: AgentActivityItem = {
      ...activity,
      id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
    setState(prev => ({
      ...prev,
      agentActivities: [newItem, ...(prev.agentActivities || [])].slice(0, 30)
    }));
  }, []);

  const clearAgentActivities = useCallback(() => {
    setState(prev => ({ ...prev, agentActivities: [] }));
  }, []);

  const setMedicationSearchQuery = useCallback((query: string) => {
    setState(prev => prev.medicationSearchQuery === query ? prev : ({ ...prev, medicationSearchQuery: query }));
  }, []);

  const setWebmcpStatus = useCallback((status: 'ready' | 'unavailable') => {
    setState(prev => prev.webmcpStatus === status ? prev : ({ ...prev, webmcpStatus: status }));
  }, []);

  const setShowAgentActivityPanel = useCallback((show: boolean) => {
    setState(prev => prev.showAgentActivityPanel === show ? prev : ({ ...prev, showAgentActivityPanel: show }));
  }, []);

  const executeWebMCP = useCallback(async (toolName: string, params?: any) => {
    try {
      return await executeWebMCPTool(toolName, params);
    } catch (err) {
      console.error('[WebMCP Execute Error]', err);
      throw err;
    }
  }, []);

  const toggleWebMCP = useCallback(() => {
    setState(prev => {
      if (!isWebMCPAvailable()) {
        return { ...prev, webmcpStatus: 'unavailable' };
      }
      return {
        ...prev,
        webmcpStatus: prev.webmcpStatus === 'ready' ? 'unavailable' : 'ready'
      };
    });
  }, []);

  return (
    <AppContext.Provider
      value={{
        ...state,
        setView,
        setShowAuthModal,
        setShowAddMedModal,
        setShowEmergencyModal,
        setShowOnboarding,
        setOnboardingStep,
        setActiveDrugDetail,
        setActiveInteractionDetail,
        setIsAuthenticated,
        addMedication,
        updateMedication,
        removeMedication,
        recalculateAllInteractions,
        setSchedule,
        toggleScheduleTaken,
        toggleScheduleSkipped,
        addSymptomLog,
        addCaregiver,
        removeCaregiver,
        sendChatMessage,
        updateProfile,
        dismissInteraction,
        notifyDoctorInteraction,
        caregivers: state.caregiverLinks,
        resetAllData: resetToDefaultData,
        resetToDefaultData,
        startOnboarding,
        completeOnboarding,
        addAgentActivity,
        clearAgentActivities,
        setMedicationSearchQuery,
        setWebmcpStatus,
        setShowAgentActivityPanel,
        executeWebMCP,
        toggleWebMCP
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
