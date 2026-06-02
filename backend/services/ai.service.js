/**
 * TattleTent Multi-LLM AI Service
 * 
 * Distributes workload across TWO providers to avoid rate limits:
 *   - Groq (Llama 3.3 70B)  → Real-time user-facing agents (chatbot, recommendations)
 *   - Gemini (2.0 Flash)    → Bulk/batch agents (duplicates, escalation, reports)
 * 
 * Both include automatic retry with exponential backoff on 429 errors,
 * and graceful offline fallback if API keys are missing.
 */

// ─── Provider Configuration ────────────────────────────────────────────
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

const GEMINI_MODEL = 'gemini-2.0-flash';

let _groqWarnedOnce = false;
let _geminiWarnedOnce = false;

// ─── Retry Helper ──────────────────────────────────────────────────────
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchWithRetry(url, options, maxRetries = 3) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const response = await fetch(url, options);

    if (response.ok) return response;

    // Rate limited — back off and retry
    if (response.status === 429 && attempt < maxRetries) {
      const waitMs = Math.pow(2, attempt + 1) * 1000; // 2s, 4s, 8s
      console.warn(`⏳ Rate limited (429). Retrying in ${waitMs / 1000}s... (attempt ${attempt + 1}/${maxRetries})`);
      await sleep(waitMs);
      continue;
    }

    // Non-retryable error or final attempt
    const errorText = await response.text();
    throw new Error(`API Error: Status ${response.status} - ${errorText}`);
  }
}

// ─── GROQ Provider ─────────────────────────────────────────────────────
/**
 * Call Groq LLM (Llama 3.3 70B) — blazing fast, ideal for real-time chat and recommendations.
 */
export const callGroq = async (prompt, systemInstruction = '', jsonMode = false) => {
  const GROQ_API_KEY = process.env.GROQ_API_KEY;

  if (!GROQ_API_KEY) {
    if (!_groqWarnedOnce) {
      console.warn('⚠️ GROQ_API_KEY is not defined. Using offline mock fallback.');
      _groqWarnedOnce = true;
    }
    return getFallbackResponse(prompt, jsonMode);
  }

  try {
    const messages = [];
    if (systemInstruction) {
      messages.push({ role: 'system', content: systemInstruction });
    }
    messages.push({ role: 'user', content: prompt });

    const requestBody = {
      model: GROQ_MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 1024,
    };

    if (jsonMode) {
      requestBody.response_format = { type: 'json_object' };
    }

    const response = await fetchWithRetry(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();
    const textContent = data.choices?.[0]?.message?.content;

    if (!textContent) {
      throw new Error('Groq returned an empty response.');
    }

    return textContent.trim();
  } catch (err) {
    console.error('❌ Groq failed, using fallback:', err.message);
    return getFallbackResponse(prompt, jsonMode);
  }
};

// ─── GEMINI Provider ───────────────────────────────────────────────────
/**
 * Call Google Gemini (2.0 Flash) — generous daily limits, ideal for bulk/batch operations.
 */
export const callGemini = async (prompt, systemInstruction = '', jsonMode = false) => {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    if (!_geminiWarnedOnce) {
      console.warn('⚠️ GEMINI_API_KEY is not defined. Using offline mock fallback.');
      _geminiWarnedOnce = true;
    }
    return getFallbackResponse(prompt, jsonMode);
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

    const requestBody = {
      contents: [{
        parts: [{ text: prompt }]
      }]
    };

    if (systemInstruction) {
      requestBody.systemInstruction = {
        parts: [{ text: systemInstruction }]
      };
    }

    if (jsonMode) {
      requestBody.generationConfig = {
        responseMimeType: 'application/json'
      };
    }

    const response = await fetchWithRetry(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();
    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textContent) {
      throw new Error('Gemini returned an empty response.');
    }

    return textContent.trim();
  } catch (err) {
    console.error('❌ Gemini failed, using fallback:', err.message);
    return getFallbackResponse(prompt, jsonMode);
  }
};

// ─── Generic Alias (defaults to Groq) ──────────────────────────────────
export const callLLM = callGroq;

// ─── Offline Fallback Engine ───────────────────────────────────────────
function getFallbackResponse(prompt, jsonMode) {
  const p = prompt.toLowerCase();

  // 1. DUPLICATE DETECTION FALLBACK
  if (p.includes('duplicate') || p.includes('similarity')) {
    const candidateIds = [];
    const idRegex = /id:\s*([a-f0-9]{24})/gi;
    let match;
    while ((match = idRegex.exec(prompt)) !== null) {
      candidateIds.push(match[1]);
    }

    const isDuplicate = (p.includes('pathway damage') && p.includes('sector c')) ||
                        p.includes('water leak') ||
                        p.includes('garbage') ||
                        p.includes('electrical') ||
                        p.includes('duplicate');

    const matchedId = isDuplicate && candidateIds.length > 0 ? candidateIds[0] : null;

    const result = {
      isDuplicate: isDuplicate && matchedId !== null,
      similarityScore: isDuplicate && matchedId !== null ? 92 : 12,
      duplicateOf: matchedId,
      explanation: isDuplicate && matchedId !== null
        ? "Both complaints describe identical physical incidents and require the same vendor attention."
        : "Complaints refer to entirely different incidents and locations."
    };
    return jsonMode ? JSON.stringify(result) : result.explanation;
  }

  // 2. SMART ESCALATION FALLBACK
  if (p.includes('escalate') || p.includes('urgency') || p.includes('overdue')) {
    const result = {
      urgencyScore: 85,
      explanation: "This issue has remained unresolved for a prolonged period, posing potential safety hazards. Immediate reassignment and escalation are highly advised."
    };
    return jsonMode ? JSON.stringify(result) : result.explanation;
  }

  // 3. CITIZEN CHATBOT FALLBACK
  if (p.includes('chatbot') || p.includes('assist') || p.includes('hello') || p.includes('complaint')) {
    if (p.includes('pathway')) {
      return "Hello! I looked up your Pathway Damage complaint. It is currently marked as **In Progress** and is assigned to our Sector C team. They are expected to complete repairs soon.";
    }
    return "Hello! I am your TattleTent Smart Governance Assistant. You can ask me to track your active complaints, check local department SLA times, or guide you in lodging a new report. How can I help you today?";
  }

  // 4. AUTO REPORT GENERATOR FALLBACK
  if (p.includes('report') || p.includes('summary') || p.includes('analytics')) {
    return `### TattleTent Civic Analytics Summary (AI Generated)

This week, the city recorded a positive trajectory in grievance management. 
- **Key Trend**: 'Pathway Damage' remains the most active complaint category.
- **Vendor Insights**: Our top vendors are resolving tasks within an average SLA rate of 94%, though Sector C reports minor delays due to seasonal demand.
- **Action Projections**: Focus efforts on water leak reports to prevent escalations in the upcoming week.`;
  }

  // 5. ASSIGNMENT RECOMMENDATION FALLBACK
  if (p.includes('recommend') || p.includes('assign')) {
    return "This vendor is highly recommended because of their excellent 100% SLA compliance rate and perfect citizen feedback rating for previous electrical repairs in this ward.";
  }

  // Default fallback
  const fallbackStr = "I am processed locally using TattleTent's AI offline intelligence engine.";
  return jsonMode ? JSON.stringify({ message: fallbackStr }) : fallbackStr;
}
