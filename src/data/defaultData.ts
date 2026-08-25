import { Profile, Medication, Interaction, ScheduleItem, SymptomLog, CaregiverContact } from '../types';

export const DEFAULT_PROFILE: Profile = {
  id: 'prof-1',
  fullName: 'Maria Rodriguez',
  age: 68,
  gender: 'female',
  weightLbs: 148,
  bloodType: 'O+',
  conditions: ['Atrial Fibrillation', 'Type 2 Diabetes', 'Hypertension', 'Osteopenia'],
  allergies: ['Penicillin', 'Sulfa drugs'],
  emergencyContactName: 'Carlos Rodriguez',
  emergencyContactPhone: '(555) 234-5678',
  primaryDoctorName: 'Dr. Sarah Chen, MD',
  primaryDoctorPhone: '(555) 890-1234',
  onboardingComplete: true,
  role: 'senior'
};

export const DEFAULT_MEDICATIONS: Medication[] = [
  {
    id: 'med-1',
    drugName: 'Warfarin',
    brandName: 'Coumadin',
    genericName: 'warfarin sodium',
    dosage: '5',
    dosageUnit: 'mg',
    frequency: 'Once daily (Evening)',
    timingInstructions: 'Take at 6:00 PM with a full glass of water. Maintain consistent dietary Vitamin K.',
    withFood: false,
    drugClass: 'Anticoagulant (Vitamin K Antagonist)',
    active: true,
    prescriber: 'Dr. Sarah Chen',
    notes: 'Requires monthly INR checks (Target: 2.0 - 3.0)'
  },
  {
    id: 'med-2',
    drugName: 'Aspirin',
    brandName: 'Bayer Low-Dose',
    genericName: 'acetylsalicylic acid',
    dosage: '81',
    dosageUnit: 'mg',
    frequency: 'Once daily (Morning)',
    timingInstructions: 'Take with morning breakfast to protect gastric mucosa.',
    withFood: true,
    drugClass: 'Antiplatelet / NSAID',
    active: true,
    prescriber: 'Dr. Robert Evans (Cardiology)',
    notes: 'Secondary cardiovascular stroke prophylaxis'
  },
  {
    id: 'med-3',
    drugName: 'Lisinopril',
    brandName: 'Prinivil / Zestril',
    genericName: 'lisinopril',
    dosage: '20',
    dosageUnit: 'mg',
    frequency: 'Once daily (Morning)',
    timingInstructions: 'Take at 8:00 AM. Monitor for dry cough or dizziness when standing up.',
    withFood: false,
    drugClass: 'ACE Inhibitor (Antihypertensive)',
    active: true,
    prescriber: 'Dr. Sarah Chen',
    notes: 'Blood pressure control & diabetic nephroprotection'
  },
  {
    id: 'med-4',
    drugName: 'Metformin',
    brandName: 'Glucophage XR',
    genericName: 'metformin hydrochloride',
    dosage: '500',
    dosageUnit: 'mg',
    frequency: 'Twice daily (Morning & Dinner)',
    timingInstructions: 'Must be swallowed whole with meals to reduce GI upset.',
    withFood: true,
    drugClass: 'Biguanide (Antidiabetic)',
    active: true,
    prescriber: 'Dr. Sarah Chen',
    notes: 'Target HbA1c < 7.0%'
  },
  {
    id: 'med-5',
    drugName: 'Atorvastatin',
    brandName: 'Lipitor',
    genericName: 'atorvastatin calcium',
    dosage: '40',
    dosageUnit: 'mg',
    frequency: 'Once daily (Bedtime)',
    timingInstructions: 'Take at 9:30 PM. Avoid grapefruit or Seville oranges.',
    withFood: false,
    drugClass: 'HMG-CoA Reductase Inhibitor (Statin)',
    active: true,
    prescriber: 'Dr. Sarah Chen',
    notes: 'Lipid panel management'
  },
  {
    id: 'med-6',
    drugName: 'Calcium + Vit D3',
    brandName: 'Caltrate 600+D3',
    genericName: 'calcium carbonate + cholecalciferol',
    dosage: '600',
    dosageUnit: 'mg',
    frequency: 'Once daily (Lunch)',
    timingInstructions: 'Take at 12:30 PM with lunch. Must be spaced 2+ hours from Lisinopril.',
    withFood: true,
    drugClass: 'Mineral & Vitamin Supplement',
    active: true,
    prescriber: 'OTC Supplement',
    notes: 'Osteopenia bone density support'
  }
];

export const DEFAULT_INTERACTIONS: Interaction[] = [
  {
    id: 'int-warfarin-aspirin',
    drugAName: 'Warfarin',
    drugBName: 'Aspirin',
    severity: 'critical',
    mechanism: 'Potent Synergistic Anticoagulant & Antiplatelet Hemostasis Inhibition',
    description: 'Combining a vitamin K antagonist (Warfarin) with a COX-1 antiplatelet inhibitor (Aspirin) significantly multiplies the incidence of major gastrointestinal and intracranial hemorrhage.',
    aiExplanation: 'Both of these medications thin your blood in distinct ways. Taking both without strict dual-therapy cardiology protocol multiplies your risk of internal or stomach bleeding by up to 300%.',
    whatItMeans: 'You might experience unexplained bruises, black or tarry stools, or excessive bleeding from minor cuts.',
    actionRequired: 'Check with Dr. Chen or Dr. Evans to confirm if dual antiplatelet/anticoagulant therapy is strictly necessary. Never take extra NSAIDs (like Advil/Motrin).',
    source: 'FDA DailyMed & Clinical Pharmacopeia',
    dismissed: false,
    doctorNotified: false
  },
  {
    id: 'int-lisinopril-calcium',
    drugAName: 'Lisinopril',
    drugBName: 'Calcium + Vit D3',
    severity: 'caution',
    mechanism: 'Chelation and Gastrointestinal Absorption Antagonism',
    description: 'Divalent and trivalent cations (calcium, magnesium) can bind to ACE inhibitors in the digestive tract, decreasing systemic absorption by approximately 20-30%.',
    aiExplanation: 'Calcium can bind to Lisinopril in your stomach, preventing your body from absorbing the blood pressure medication properly.',
    whatItMeans: 'Your blood pressure might stay higher than it should even though you are taking your medicine every day.',
    actionRequired: 'Separate taking Calcium Carbonate from Lisinopril by at least 2 to 3 hours (e.g. Lisinopril at breakfast, Calcium at lunch).',
    source: 'American Society of Health-System Pharmacists (ASHP)',
    dismissed: false,
    doctorNotified: false
  },
  {
    id: 'int-warfarin-atorvastatin',
    drugAName: 'Warfarin',
    drugBName: 'Atorvastatin',
    severity: 'caution',
    mechanism: 'CYP3A4 / CYP2C9 Hepatic Metabolism Competition',
    description: 'Atorvastatin can competitively inhibit the hepatic clearance of S- and R-warfarin, causing a slight elevation in prothrombin time / INR in susceptible patients.',
    aiExplanation: 'Both drugs are broken down by similar enzymes in your liver, which can cause Warfarin levels to drift slightly higher.',
    whatItMeans: 'Your regular monthly INR blood test might show slightly higher numbers.',
    actionRequired: 'Notify your anticoagulation clinic if your Atorvastatin dosage changes.',
    source: 'Lexicomp Drug Interactions',
    dismissed: false,
    doctorNotified: false
  }
];

export const DEFAULT_SCHEDULE: ScheduleItem[] = [
  {
    id: 'sch-1',
    time: '8:00 AM',
    medicationNames: ['Lisinopril', 'Aspirin', 'Metformin'],
    dosageInstructions: 'Lisinopril (20mg), Aspirin (81mg with food), Metformin (500mg with breakfast)',
    withFood: true,
    specialWarning: 'Take with full breakfast to avoid stomach irritation from Aspirin and Metformin.',
    takenToday: true,
    skippedToday: false,
    reasoning: 'Morning timing matches diurnal cortisol and blood pressure peak while separating from Calcium.',
    mealMarker: 'breakfast'
  },
  {
    id: 'sch-2',
    time: '12:30 PM',
    medicationNames: ['Calcium + Vit D3'],
    dosageInstructions: 'Calcium Carbonate (600mg) + D3',
    withFood: true,
    specialWarning: 'Separated by 4.5 hours from Lisinopril to ensure full ACE inhibitor absorption.',
    takenToday: true,
    skippedToday: false,
    reasoning: 'Midday food-stimulated stomach acid maximizes calcium carbonate absorption.',
    mealMarker: 'lunch'
  },
  {
    id: 'sch-3',
    time: '6:00 PM',
    medicationNames: ['Warfarin', 'Metformin'],
    dosageInstructions: 'Warfarin (5mg), Metformin (500mg with dinner)',
    withFood: true,
    specialWarning: 'Maintain consistent dietary Vitamin K intake. Do not skip evening meal with Metformin.',
    takenToday: false,
    skippedToday: false,
    reasoning: 'Evening Warfarin administration allows morning INR blood checks to reflect steady-state levels accurately.',
    mealMarker: 'dinner'
  },
  {
    id: 'sch-4',
    time: '9:30 PM',
    medicationNames: ['Atorvastatin'],
    dosageInstructions: 'Atorvastatin (40mg)',
    withFood: false,
    specialWarning: 'Avoid grapefruit juice.',
    takenToday: false,
    skippedToday: false,
    reasoning: 'Hepatic HMG-CoA reductase cholesterol synthesis peaks during overnight fasting.',
    mealMarker: 'bedtime'
  }
];

export const DEFAULT_CAREGIVER_LINKS: CaregiverContact[] = [
  {
    id: 'cg-1',
    name: 'Carlos Rodriguez',
    relation: 'Son & Healthcare Proxy',
    email: 'carlos.rodriguez@email.com',
    phone: '(555) 234-5678',
    receiveWeeklyDigest: true,
    receiveCriticalAlerts: true,
    alertThreshold: 'critical',
    digestEnabled: true,
    digestDay: 'Monday',
    status: 'active'
  },
  {
    id: 'cg-2',
    name: 'Elena Rodriguez-Miller',
    relation: 'Daughter',
    email: 'elena.rm@email.com',
    phone: '(555) 876-5432',
    receiveWeeklyDigest: true,
    receiveCriticalAlerts: true,
    alertThreshold: 'critical',
    digestEnabled: true,
    digestDay: 'Monday',
    status: 'active'
  }
];

export const DEFAULT_SYMPTOM_LOGS: SymptomLog[] = [
  {
    id: 'sym-1',
    symptoms: ['Mild Bruising on Forearm', 'Gum Bleeding when flossing'],
    severityRating: 5,
    notes: 'Noticed a 2-inch dark bruise on right forearm with no remembered injury, and light bleeding during brushing.',
    aiCorrelation: 'Strong clinical correlation with Dual Antiplatelet / Anticoagulant Therapy (Warfarin 5mg + Aspirin 81mg).',
    possibleCauses: [
      {
        drugName: 'Warfarin + Aspirin',
        riskLevel: 'high',
        explanation: 'Combined hemostatic inhibition increases capillary fragility and bleeding time.',
        action: 'Notify Dr. Sarah Chen for INR check. Avoid any extra NSAIDs (Ibuprofen/Aleve).'
      }
    ],
    loggedAt: '10:15 AM, Today'
  },
  {
    id: 'sym-2',
    symptoms: ['Mild Morning Dizziness upon standing'],
    severityRating: 3,
    notes: 'Felt lightheaded when getting out of bed quickly after taking morning medications.',
    aiCorrelation: 'Possible Orthostatic Hypotension from Lisinopril 20mg peak effect.',
    possibleCauses: [
      {
        drugName: 'Lisinopril',
        riskLevel: 'moderate',
        explanation: 'Rapid postural change combined with ACE inhibition can cause transient cerebral hypoperfusion.',
        action: 'Sit on edge of bed for 30 seconds before standing. Ensure adequate water hydration.'
      }
    ],
    loggedAt: 'Yesterday at 8:45 AM'
  }
];
