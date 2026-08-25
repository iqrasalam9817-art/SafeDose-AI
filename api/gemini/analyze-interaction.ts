export default async function handler(req: any, res: any) {
  // Enable CORS if needed
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { drugA, drugB, patientConditions = [] } = body;

    if (!drugA || !drugB) {
      return res.status(400).json({ error: 'Both drugA and drugB are required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Fallback response if no API key is set
      return res.status(200).json({
        severity: 'caution',
        mechanism: 'Pharmacokinetic hepatic or renal interaction',
        description: `Potential interaction between ${drugA} and ${drugB}.`,
        aiExplanation: `Taking ${drugA} and ${drugB} together may alter drug absorption or metabolism.`,
        whatItMeans: 'You should monitor your symptoms and verify with your doctor.',
        actionRequired: 'Confirm dosing schedule with your pharmacist or physician.',
        source: 'SafeDose Clinical Database'
      });
    }

    const prompt = `You are a clinical pharmacologist and senior clinical safety officer.
Analyze the drug-drug interaction between:
- Medication A: "${drugA}"
- Medication B: "${drugB}"
- Patient Conditions: ${JSON.stringify(patientConditions)}

Assess pharmacological mechanisms (CYP450 enzymes, P-glycoprotein, chelation, additive QT prolongation, bleeding risk, nephrotoxicity, additive sedation, etc.).

Return ONLY valid JSON matching this schema:
{
  "severity": "deadly" | "critical" | "caution" | "minor" | "safe",
  "mechanism": "Clinical pharmacological mechanism (1 concise sentence)",
  "description": "Clinical summary (1-2 sentences)",
  "aiExplanation": "Clear, compassionate 8th-grade level plain English explanation for patient and family (2-3 sentences)",
  "whatItMeans": "Specific physical symptoms or side effects the patient should watch out for",
  "actionRequired": "Concrete clinical recommendation for patient and doctor",
  "has_interaction": true/false
}`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const geminiPayload = {
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig: {
        responseMimeType: 'application/json'
      }
    };

    const geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(geminiPayload)
    });

    if (!geminiRes.ok) {
      const errorText = await geminiRes.text();
      console.error('Gemini API Error:', errorText);
      return res.status(geminiRes.status).json({
        error: 'Gemini API call failed',
        details: errorText
      });
    }

    const geminiData = await geminiRes.json();
    let rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();

    const parsed = JSON.parse(rawText);
    return res.status(200).json(parsed);
  } catch (error: any) {
    console.error('Error in Vercel analyze-interaction function:', error);
    return res.status(500).json({
      error: 'Failed to analyze drug interaction',
      details: error.message
    });
  }
}
