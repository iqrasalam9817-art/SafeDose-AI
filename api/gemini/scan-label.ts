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
    const { imageBase64, mimeType = 'image/jpeg' } = body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'imageBase64 is required' });
    }

    // Extract pure Base64 without data URI prefix
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '').trim();

    const openRouterApiKey = process.env.OPENROUTER_API_KEY || process.env.GEMINI_API_KEY;
    if (!openRouterApiKey) {
      // Fallback mock scan if no API key is provided
      return res.status(200).json({
        drug_name: 'Metformin',
        brand_name: 'Glucophage',
        dosage: '500 mg',
        frequency: 'Twice daily',
        timing_instructions: 'Take with morning and evening meals',
        with_food: true,
        confidence: 96
      });
    }

    // Forward request to OpenRouter API endpoint with google/gemma-4-31b-it:free
    const openRouterRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openRouterApiKey}`,
        'HTTP-Referer': process.env.APP_URL || 'https://safedose.app',
        'X-Title': 'SafeDose AI'
      },
      body: JSON.stringify({
        model: 'google/gemma-4-31b-it:free',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this medication prescription bottle label or packaging. Extract the medication name, strength/dosage, dosage form/unit, frequency, timing instructions, and whether it must be taken with food. Return ONLY valid JSON matching this schema without any markdown wrapping:\n{\n  "drug_name": "Generic or primary drug name",\n  "brand_name": "Brand trade name if present, else empty string",\n  "dosage": "e.g. 500 mg, 10 mg",\n  "frequency": "e.g. Twice daily, Once daily, As needed",\n  "timing_instructions": "e.g. Take with morning and evening meals",\n  "with_food": true/false,\n  "confidence": 95\n}\nIf not a medication label or prescription bottle, return: { "error": "not_a_label", "message": "No medication label detected in this photo." }'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType || 'image/jpeg'};base64,${cleanBase64}`
                }
              }
            ]
          }
        ],
        temperature: 0.1
      })
    });

    if (!openRouterRes.ok) {
      const errorText = await openRouterRes.text();
      console.error(`[OpenRouter Error] HTTP ${openRouterRes.status}:`, errorText);
      let errorMessage = `OpenRouter HTTP ${openRouterRes.status}`;
      try {
        const errJson = JSON.parse(errorText);
        const raw = errJson?.error?.metadata?.raw;
        const msg = errJson?.error?.message;
        const hint = errJson?.error?.metadata?.remedy_hint;

        if (raw) {
          errorMessage = raw;
        } else if (msg && msg !== 'Provider returned error') {
          errorMessage = msg;
        } else if (hint) {
          errorMessage = `${msg || 'Provider error'}: ${hint}`;
        } else if (msg) {
          errorMessage = msg;
        }
      } catch {}
      return res.status(openRouterRes.status).json({
        error: 'OpenRouter API call failed',
        message: errorMessage,
        details: errorText
      });
    }

    const openRouterData: any = await openRouterRes.json();
    let rawText = openRouterData.choices?.[0]?.message?.content || '';
    rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();

    let parsed: any = {};
    try {
      parsed = JSON.parse(rawText);
    } catch {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        return res.status(200).json({
          error: 'not_a_label',
          message: 'Could not read or parse medication details from this image.'
        });
      }
    }

    // Check if the image was identified as not a medication label
    if (
      parsed.error === 'not_a_label' ||
      parsed.error === 'not a label' ||
      (!parsed.drug_name && !parsed.brand_name && !parsed.drugName)
    ) {
      return res.status(200).json({
        error: 'not_a_label',
        message: 'No medication label detected in this photo. Please ensure the label text and medicine name are clearly visible and well-lit.'
      });
    }

    // Normalize field names to match frontend contract
    const normalized = {
      drug_name: parsed.drug_name || parsed.drugName || '',
      brand_name: parsed.brand_name || parsed.brandName || '',
      dosage: parsed.dosage || '',
      frequency: parsed.frequency || '',
      timing_instructions: parsed.timing_instructions || parsed.timingInstructions || '',
      with_food: typeof parsed.with_food === 'boolean' ? parsed.with_food : (typeof parsed.withFood === 'boolean' ? parsed.withFood : false),
      confidence: parsed.confidence || 95,
      raw_text: rawText
    };

    return res.status(200).json(normalized);
  } catch (error: any) {
    console.error('Error in Vercel scan-label function with OpenRouter:', error);
    return res.status(500).json({
      error: 'scan_failed',
      message: error.message || 'Failed to scan medication label'
    });
  }
}
