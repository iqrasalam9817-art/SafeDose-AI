import { useState, useEffect } from 'react';
import {
  Profile,
  Medication,
  Interaction,
  SafetyScore,
  ScheduleItem,
  SymptomLog,
  CaregiverLink,
  ChatMessage,
  AgentActivityItem
} from '../types';
import {
  DEFAULT_PROFILE,
  DEFAULT_MEDICATIONS,
  DEFAULT_INTERACTIONS,
  DEFAULT_SCHEDULE,
  DEFAULT_CAREGIVER_LINKS,
  DEFAULT_SYMPTOM_LOGS
} from '../data/defaultData';
import { detectLocalInteraction } from '../lib/fda';
import { analyzeInteractionWithGemini } from '../lib/gemini';
import { isWebMCPAvailable } from '../lib/webmcp';

const STORAGE_KEY = 'safedose_app_state_v1';

export type AppView =
  | 'landing'
  | 'dashboard'
  | 'medications'
  | 'interactions'
  | 'map'
  | 'schedule'
  | 'symptoms'
  | 'caregiver'
  | 'emergency'
  | 'chat'
  | 'settings';

export interface AppState {
  profile: Profile;
  medications: Medication[];
  interactions: Interaction[];
  safetyScore: SafetyScore;
  schedule: ScheduleItem[];
  symptomLogs: SymptomLog[];
  caregiverLinks: CaregiverLink[];
  chatMessages: ChatMessage[];
  currentView: AppView;
  isAuthenticated: boolean;
  showAuthModal: boolean;
  showAddMedModal: boolean;
  showEmergencyModal: boolean;
  showOnboarding: boolean;
  onboardingStep: number;
  isAnalyzing: boolean;
  activeDrugDetail: Medication | null;
  activeInteractionDetail: Interaction | null;
  adherencePercentage: number;
  agentActivities: AgentActivityItem[];
  webmcpStatus: 'ready' | 'unavailable';
  medicationSearchQuery: string;
  showAgentActivityPanel: boolean;
}

export function calculateSafetyScoreFromInteractions(interactions: Interaction[]): SafetyScore {
  let score = 100;
  let deadlyCount = 0;
  let criticalCount = 0;
  let cautionCount = 0;
  let minorCount = 0;
  let safeCount = 0;

  for (const item of interactions) {
    if (item.dismissed) continue;
    switch (item.severity) {
      case 'deadly':
        score -= 40;
        deadlyCount++;
        break;
      case 'critical':
        score -= 25;
        criticalCount++;
        break;
      case 'caution':
        score -= 10;
        cautionCount++;
        break;
      case 'minor':
        score -= 3;
        minorCount++;
        break;
      case 'safe':
        safeCount++;
        break;
      case 'unknown':
        score -= 5;
        break;
    }
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    deadlyCount,
    criticalCount,
    cautionCount,
    minorCount,
    safeCount,
    calculatedAt: new Date().toISOString()
  };
}

// Initial state constructor
const isInitialWebMCPAvailable = (): 'ready' | 'unavailable' => {
  return isWebMCPAvailable() ? 'ready' : 'unavailable';
};

export function getInitialAppState(): AppState {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          currentView: parsed.currentView || 'landing',
          isAnalyzing: false,
          showAddMedModal: false,
          showEmergencyModal: false,
          showAuthModal: false,
          activeDrugDetail: null,
          activeInteractionDetail: null,
          agentActivities: parsed.agentActivities || [],
          webmcpStatus: isInitialWebMCPAvailable(),
          medicationSearchQuery: '',
          showAgentActivityPanel: false
        };
      } catch (e) {
        console.error('Failed to parse localStorage state:', e);
      }
    }
  }

  const initialInteractions = DEFAULT_INTERACTIONS;
  const initialSafety = calculateSafetyScoreFromInteractions(initialInteractions);

  return {
    profile: DEFAULT_PROFILE,
    medications: DEFAULT_MEDICATIONS,
    interactions: initialInteractions,
    safetyScore: initialSafety,
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
    currentView: 'landing',
    isAuthenticated: true,
    showAuthModal: false,
    showAddMedModal: false,
    showEmergencyModal: false,
    showOnboarding: false,
    onboardingStep: 1,
    isAnalyzing: false,
    activeDrugDetail: null,
    activeInteractionDetail: null,
    adherencePercentage: 89,
    agentActivities: [],
    webmcpStatus: isInitialWebMCPAvailable(),
    medicationSearchQuery: '',
    showAgentActivityPanel: false
  };
}
