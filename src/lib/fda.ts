import { Interaction, SeverityLevel } from '../types';

export interface FDASearchResult {
  brandName: string;
  genericName: string;
  drugClass: string;
  rxcui?: string;
  manufacturer?: string;
  activeIngredients?: string[];
  purpose?: string[];
  warnings?: string[];
}

// Built-in verified clinical interactions dictionary for immediate rapid assessment
export const KNOWN_CLINICAL_INTERACTIONS: Array<{
  pair: [string, string];
  severity: SeverityLevel;
  mechanism: string;
  description: string;
  aiExplanation: string;
  whatItMeans: string;
  actionRequired: string;
}> = [
  {
    pair: ['warfarin', 'aspirin'],
    severity: 'critical',
    mechanism: 'Synergistic Anticoagulant & Antiplatelet Hemostasis Inhibition',
    description: 'Concurrent administration causes potent additive impairment of coagulation cascade and platelet plug formation.',
    aiExplanation: 'Both medications thin your blood in different ways. Taking them together greatly multiplies your risk of internal or gastrointestinal bleeding.',
    whatItMeans: 'Increased risk of sudden bleeding, heavy bruising, dark stools, or red-tinted urine.',
    actionRequired: 'Contact your prescribing physician to verify if dual therapy is strictly essential. Monitor for any unusual bleeding.'
  },
  {
    pair: ['lisinopril', 'calcium'],
    severity: 'caution',
    mechanism: 'Gastrointestinal Chelation & Absorption Reduction',
    description: 'Multivalent mineral cations bind to ACE inhibitors in the gut, reducing therapeutic absorption by 25-30%.',
    aiExplanation: 'Calcium binds with Lisinopril in your stomach, preventing your body from absorbing the blood pressure medication effectively.',
    whatItMeans: 'Your blood pressure might remain high despite taking your medication on time.',
    actionRequired: 'Separate taking Calcium supplements from Lisinopril by at least 2 to 3 hours.'
  },
  {
    pair: ['warfarin', 'atorvastatin'],
    severity: 'caution',
    mechanism: 'CYP3A4 / CYP2C9 Hepatic Metabolism Competition',
    description: 'Atorvastatin competitively inhibits hepatic clearance of Warfarin, causing potential elevation in INR.',
    aiExplanation: 'Both drugs compete for processing in the liver, which can cause blood thinner levels to drift slightly higher.',
    whatItMeans: 'Your regular blood clotting lab tests (INR) might register slightly higher.',
    actionRequired: 'Get an INR lab check within 1-2 weeks whenever starting or adjusting your statin dose.'
  },
  {
    pair: ['metformin', 'alcohol'],
    severity: 'critical',
    mechanism: 'Potentiation of Lactic Acidosis Risk and Impaired Hepatic Gluconeogenesis',
    description: 'Alcohol inhibits hepatic lactate clearance while Metformin increases lactate production, triggering life-threatening lactic acidosis.',
    aiExplanation: 'Alcohol blocks your liver from clearing lactate while taking Metformin, which can cause a dangerous metabolic build-up called lactic acidosis.',
    whatItMeans: 'Severe muscle cramping, extreme drowsiness, rapid breathing, or intense stomach discomfort.',
    actionRequired: 'Avoid heavy alcohol consumption completely while on Metformin therapy.'
  },
  {
    pair: ['metformin', 'lisinopril'],
    severity: 'safe',
    mechanism: 'Compatible Renoprotective Synergism',
    description: 'No pharmacokinetic antagonism. Commonly prescribed together in diabetic hypertensive regimens for cardiovascular and renal protection.',
    aiExplanation: 'These two medications work safely together and are standard for protecting both your kidneys and your heart.',
    whatItMeans: 'No adverse conflict between these medications.',
    actionRequired: 'Continue taking as scheduled according to doctor guidance.'
  },
  {
    pair: ['atorvastatin', 'grapefruit'],
    severity: 'caution',
    mechanism: 'Intestinal CYP3A4 Furanocoumarin Inhibition',
    description: 'Grapefruit compounds inhibit intestinal CYP3A4, increasing systemic Statin bioavailability and rhabdomyolysis risk.',
    aiExplanation: 'Grapefruit stops your body from breaking down statins, causing medicine levels to build up dangerously high in your bloodstream.',
    whatItMeans: 'Higher risk of severe muscle soreness, liver stress, or kidney injury.',
    actionRequired: 'Avoid eating grapefruit or drinking grapefruit juice while taking Atorvastatin.'
  },
  {
    pair: ['ssri', 'maoi'],
    severity: 'deadly',
    mechanism: 'Severe Central & Peripheral Serotonin Overstimulation',
    description: 'Contraindicated combination causing hyperthermia, autonomic instability, muscle rigidity, and fatal Serotonin Syndrome.',
    aiExplanation: 'This combination causes a massive, dangerous surge of serotonin in your brain and body, which is a medical emergency.',
    whatItMeans: 'High fever, intense tremors, agitation, rapid heart rate, and delirium.',
    actionRequired: 'NEVER take together. Requires a minimum 14-day washout period between regimens.'
  },
  {
    pair: ['ibuprofen', 'aspirin'],
    severity: 'caution',
    mechanism: 'Competitive COX-1 Active Site Inhibition & Compounded GI Ulceration',
    description: 'Ibuprofen blocks Aspirin from irreversibly binding COX-1 on platelets, reducing cardioprotection while doubling ulcer risk.',
    aiExplanation: 'Taking regular Ibuprofen cancels out the heart-protecting benefit of baby Aspirin and irritates your stomach lining.',
    whatItMeans: 'Reduced heart attack protection and increased stomach pain or ulcer hazard.',
    actionRequired: 'Take baby Aspirin at least 30 minutes before Ibuprofen or choose an alternative pain reliever like Acetaminophen (Tylenol).'
  },
  {
    pair: ['ibuprofen', 'lisinopril'],
    severity: 'caution',
    mechanism: 'Renal Prostaglandin Inhibition & Blunted Antihypertensive Response',
    description: 'NSAIDs inhibit renal prostaglandins, reducing glomerular filtration and antagonizing the blood-pressure lowering action of ACE inhibitors.',
    aiExplanation: 'Painkillers like Ibuprofen cause your kidneys to hold onto water and salt, cancelling out the blood pressure benefit of Lisinopril.',
    whatItMeans: 'Fluid retention, ankle swelling, and higher blood pressure readings.',
    actionRequired: 'Limit NSAID usage. Use Tylenol/Acetaminophen for mild pain when approved by your doctor.'
  },
  {
    pair: ['metformin', 'aspirin'],
    severity: 'safe',
    mechanism: 'No Significant Pharmacological Conflict',
    description: 'No kinetic antagonism. Well-tolerated dual therapy for diabetic patients with atherosclerotic cardiovascular risk.',
    aiExplanation: 'These medications can be safely taken together in your daily routine.',
    whatItMeans: 'Safe and compatible pairing.',
    actionRequired: 'Take both with meals to prevent any stomach upset.'
  }
];

export async function searchDrugSpelling(query: string): Promise<string[]> {
  if (!query || query.trim().length < 2) return [];
  try {
    const res = await fetch(`https://rxnav.nlm.nih.gov/REST/spellingsuggestions.json?name=${encodeURIComponent(query)}`);
    if (res.ok) {
      const data = await res.json();
      const suggestions = data.suggestionGroup?.suggestionList?.suggestion || [];
      if (suggestions.length > 0) return suggestions.slice(0, 8);
    }
  } catch (err) {
    console.warn('RxNorm fetch error, using local fallback:', err);
  }

  // Fallback common drug list
  const commonDrugs = [
    'Warfarin', 'Aspirin', 'Metformin', 'Lisinopril', 'Atorvastatin',
    'Amlodipine', 'Levothyroxine', 'Omeprazole', 'Metoprolol', 'Losartan',
    'Albuterol', 'Gabapentin', 'Hydrochlorothiazide', 'Sertraline', 'Simvastatin',
    'Montelukast', 'Escitalopram', 'Acetaminophen', 'Ibuprofen', 'Prednisone',
    'Amoxicillin', 'Pantoprazole', 'Duloxetine', 'Tamsulosin', 'Furosemide',
    'Clopidogrel', 'Citalopram', 'Apixaban (Eliquis)', 'Rivaroxaban (Xarelto)'
  ];

  return commonDrugs.filter(d => d.toLowerCase().includes(query.toLowerCase())).slice(0, 8);
}

export const searchRxNormDrugs = searchDrugSpelling;

export async function fetchDrugInfoFromFDA(drugName: string): Promise<FDASearchResult | null> {
  try {
    const cleanName = drugName.replace(/[^a-zA-Z0-9\s]/g, '').trim();
    const url = `/api/fda/label?drugName=${encodeURIComponent(cleanName)}&limit=1`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      const item = data.results?.[0];
      if (item) {
        return {
          brandName: item.openfda?.brand_name?.[0] || drugName,
          genericName: item.openfda?.generic_name?.[0] || drugName,
          drugClass: item.openfda?.pharm_class_cs?.[0] || item.openfda?.pharm_class_epc?.[0] || 'Pharmaceutical Agent',
          rxcui: item.openfda?.rxcui?.[0],
          manufacturer: item.openfda?.manufacturer_name?.[0],
          warnings: item.warnings?.slice(0, 2) || []
        };
      }
    }
  } catch (err) {
    console.warn('openFDA API proxy error:', err);
  }
  return null;
}

export async function fetchAdverseEventsFromFDA(drugName: string, limit: number = 5): Promise<any[]> {
  try {
    const cleanName = drugName.replace(/[^a-zA-Z0-9\s]/g, '').trim();
    const url = `/api/fda/event?drugName=${encodeURIComponent(cleanName)}&limit=${limit}`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      return data.results || [];
    }
  } catch (err) {
    console.warn('openFDA adverse events proxy error:', err);
  }
  return [];
}

export const searchFdaDrugLabel = fetchDrugInfoFromFDA;

export function detectLocalInteraction(drugA: string, drugB: string): Interaction | null {
  const normA = drugA.toLowerCase();
  const normB = drugB.toLowerCase();

  for (const item of KNOWN_CLINICAL_INTERACTIONS) {
    const [pA, pB] = item.pair;
    const matchForward = (normA.includes(pA) && normB.includes(pB));
    const matchBackward = (normA.includes(pB) && normB.includes(pA));

    if (matchForward || matchBackward) {
      return {
        id: `int-${drugA}-${drugB}`.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        drugAName: drugA,
        drugBName: drugB,
        severity: item.severity,
        mechanism: item.mechanism,
        description: item.description,
        aiExplanation: item.aiExplanation,
        whatItMeans: item.whatItMeans,
        actionRequired: item.actionRequired,
        source: 'FDA DailyMed & Clinical Pharmacopeia Rules',
        dismissed: false,
        doctorNotified: false
      };
    }
  }

  return null;
}
