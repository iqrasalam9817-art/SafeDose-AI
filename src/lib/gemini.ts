import { Medication, Profile, Interaction, ScheduleItem, SymptomLog } from '../types';

export async function scanPrescriptionLabel(imageBase64: string, mimeType: string = 'image/jpeg'): Promise<any> {
  try {
    const res = await fetch('/api/gemini/scan-label', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64, mimeType })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || data.error || 'Failed to scan medication label');
    }
    return data;
  } catch (err: any) {
    console.error('Error scanning label:', err);
    throw err;
  }
}

export async function analyzeInteractionWithGemini(
  drugA: string,
  drugB: string,
  patientConditions: string[] = []
): Promise<any> {
  try {
    const res = await fetch('/api/gemini/analyze-interaction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ drugA, drugB, patientConditions })
    });
    if (!res.ok) throw new Error('Interaction analysis failed');
    return await res.json();
  } catch (err) {
    console.error('Error analyzing interaction:', err);
    throw err;
  }
}

export async function analyzeSymptomsWithGemini(
  symptoms: string[],
  severity: number,
  notes: string,
  medications: Medication[]
): Promise<any> {
  try {
    const res = await fetch('/api/gemini/analyze-symptoms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symptoms, severity, notes, medications })
    });
    if (!res.ok) throw new Error('Symptoms analysis failed');
    return await res.json();
  } catch (err) {
    console.error('Error analyzing symptoms:', err);
    throw err;
  }
}

export const analyzeSymptomCorrelation = analyzeSymptomsWithGemini;

export async function generateScheduleWithGemini(
  medications: Medication[],
  wakeTime?: string,
  sleepTime?: string
): Promise<{ scheduleItems: ScheduleItem[] }> {
  try {
    const res = await fetch('/api/gemini/generate-schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ medications, wakeTime, sleepTime })
    });
    if (!res.ok) throw new Error('Schedule generation failed');
    return await res.json();
  } catch (err) {
    console.error('Error generating schedule:', err);
    throw err;
  }
}

export const generateSmartSchedule = generateScheduleWithGemini;

export async function sendChatMessage(
  message: string,
  history: any[],
  medications: Medication[],
  profile: Profile,
  interactions: Interaction[]
): Promise<string> {
  try {
    const res = await fetch('/api/gemini/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history, medications, profile, interactions })
    });
    if (!res.ok) throw new Error('Chat failed');
    const data = await res.json();
    return data.reply;
  } catch (err) {
    console.error('Error in chat message:', err);
    throw err;
  }
}

export async function getCaregiverDigestPreview(
  caregiverName: string,
  patientName: string,
  safetyScore: number,
  activeAlerts: number
): Promise<any> {
  const res = await fetch('/api/sendgrid/digest-preview', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ caregiverName, patientName, safetyScore, activeAlerts })
  });
  return await res.json();
}
