export type SeverityLevel = 'deadly' | 'critical' | 'caution' | 'minor' | 'safe' | 'unknown';

export interface Profile {
  id: string;
  fullName: string;
  age: number;
  gender?: 'male' | 'female' | 'other';
  weightLbs?: number;
  bloodType: string;
  conditions: string[];
  allergies?: string[];
  emergencyContactName: string;
  emergencyContactPhone: string;
  primaryDoctorName: string;
  primaryDoctorPhone: string;
  avatarUrl?: string;
  onboardingComplete: boolean;
  role?: 'senior' | 'adult' | 'caregiver';
}

export interface Medication {
  id: string;
  drugName: string;
  brandName?: string;
  genericName?: string;
  dosage: string;
  dosageUnit: string;
  frequency: string;
  timingInstructions?: string;
  withFood: boolean;
  drugClass: string;
  active: boolean;
  startDate?: string;
  prescriber?: string;
  notes?: string;
  rxnormId?: string;
}

export interface Interaction {
  id: string;
  drugAName: string;
  drugBName: string;
  severity: SeverityLevel;
  mechanism: string;
  description: string;
  aiExplanation: string;
  whatItMeans: string;
  actionRequired: string;
  source: string;
  dismissed?: boolean;
  doctorNotified?: boolean;
}

export interface SafetyScore {
  score: number;
  deadlyCount: number;
  criticalCount: number;
  cautionCount: number;
  minorCount: number;
  safeCount: number;
  calculatedAt: string;
}

export interface SymptomLog {
  id: string;
  symptoms: string[];
  severityRating: number; // 1-10
  notes: string;
  aiCorrelation: string;
  possibleCauses: {
    drugName: string;
    riskLevel: 'high' | 'moderate' | 'low';
    explanation: string;
    action: string;
  }[];
  loggedAt: string;
}

export interface CaregiverContact {
  id: string;
  name: string;
  relation: string;
  email: string;
  phone: string;
  receiveWeeklyDigest?: boolean;
  receiveCriticalAlerts?: boolean;
  alertThreshold?: 'critical' | 'caution' | 'all';
  digestEnabled?: boolean;
  digestDay?: string;
  status?: 'active' | 'pending';
}

export type CaregiverLink = CaregiverContact;

export interface ScheduleItem {
  id: string;
  time: string;
  medicationNames: string[];
  dosageInstructions: string;
  withFood: boolean;
  specialWarning?: string;
  takenToday?: boolean;
  skippedToday?: boolean;
  reasoning: string;
  mealMarker?: 'breakfast' | 'lunch' | 'dinner' | 'bedtime';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  severityBadge?: SeverityLevel;
  suggestedAction?: string;
  actionUrl?: string;
}

export interface DrugNode {
  id: string;
  name: string;
  drugClass: string;
  dosage: string;
  interactionCount: number;
  color: string;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
}

export interface DrugLink {
  source: string | DrugNode;
  target: string | DrugNode;
  severity: SeverityLevel;
  description: string;
}

export interface AgentActivityItem {
  id: string;
  tool: 'search_medication' | 'get_current_regimen' | 'check_regimen_safety';
  timestamp: string;
  summary: string;
  status: 'success' | 'error';
  params?: Record<string, any>;
  result?: Record<string, any>;
}

