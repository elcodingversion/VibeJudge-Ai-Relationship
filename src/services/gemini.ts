import { GoogleGenAI, Type, Modality } from "@google/genai";
import { VibeAnalysis } from "../types";

const getAI = () => {
  const apiKey = "AIzaSyAauPC5Pt32ShHEWqKpNHGKtPUElc-ly44";
  if (!apiKey) {
    throw new Error("API Key Gemini belum diset. Cek panel Settings di AI Studio.");
  }
  return new GoogleGenAI({ apiKey });
};

const ai = getAI();

const VIBE_ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    flag: {
      type: Type.STRING,
      description: "Must be 'GREEN', 'YELLOW', or 'RED'",
    },
    reasoning: {
      type: Type.STRING,
      description: "Psychological reasoning in Bahasa Indonesia casual/gaul.",
    },
    futureImpact: {
      type: Type.STRING,
      description: "Potential future impact on the user in Bahasa Indonesia.",
    },
    actionPlan: {
      type: Type.STRING,
      description: "Proposed action plan or concrete advice for the user. MUST be logical, validation-rich, and detailed (minimum 3 sentences). Use numbered lists if there are multiple steps. Use Markdown formatting. Tone must match user's tone.",
    },
    priority: {
      type: Type.STRING,
      description: "Priority level of the situation: 'CRITICAL', 'HIGH', 'MEDIUM', or 'ROUTINE'.",
    },
    labels: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Psychological markers or relationship themes (e.g., Breadcrumbing, Love Bombing, Secure).",
    },
  },
  required: ["flag", "reasoning", "futureImpact", "actionPlan", "labels"],
};

export async function analyzeVibe(
  messages: { role: 'user' | 'model', content: string, imageData?: string }[], 
  isMirrorMode: boolean
): Promise<{ analysis: VibeAnalysis; responseText: string }> {
  const modePrompt = isMirrorMode 
    ? "Analyze the user's OWN behavior based on their story or chat screenshots. Be honest, objective, but empathetic (Mirror Mode)."
    : "Analyze the partner/friend/other person's behavior based on the user's curhat or chat screenshots.";

  const systemInstruction = `
    You are a Gen Z-smart social psychologist and relationship expert from Indonesia named VibeJudge.
    
    ${modePrompt}
    
    Guidelines:
    1. Tone & Language: 
       - MIRROR THE USER'S TONE. 
       - If user uses 'lo/gue', respond in 'lo/gue' casual style.
       - If user uses 'aku/kamu' or more polite language, respond in 'aku/kamu' style.
       - Use Natural Bahasa Indonesia gaul (e.g., 'nge-gas', 'ghosting', 'toxic').
    2. Context: Understand local dynamics like "selingkuh", "minta transferan", "posesif", "supportive parah".
    3. Action Plan: MUST be detailed, logical, and practical. Don't just give one-liners. Provide step-by-step guidance using Markdown. Explain WHY each step is important for the user's situation.
    4. Validation & Empathy: Validate the user's feelings first before giving hard logic or analysis. If the situation is tough, be the support system they need.
    5. Priority: Assign a Priority level (CRITICAL, HIGH, MEDIUM, ROUTINE) based on how quickly the user needs to act to protect their mental health or the relationship health.
    6. If an image is provided, analyze the chat dynamics or visual context within it.
    7. Always provide your latest overall assessment (VibeAnalysis) and a friendly chat response.
    
    Output MUST be a JSON object with:
    {
      "analysis": { 
        "flag": "GREEN/YELLOW/RED", 
        "reasoning": "...", 
        "futureImpact": "...", 
        "actionPlan": "...", 
        "priority": "CRITICAL/HIGH/MEDIUM/ROUTINE",
        "labels": [...] 
      },
      "responseText": "Your chat response to the user's latest message"
    }
  `;

  const contents = messages.map(msg => {
    const parts: any[] = [{ text: msg.content }];
    if (msg.imageData) {
      const [mimeInfo, base64Data] = msg.imageData.split(',');
      const mimeType = mimeInfo.match(/:(.*?);/)?.[1] || 'image/png';
      parts.push({
        inlineData: {
          mimeType,
          data: base64Data
        }
      });
    }
    return {
      role: msg.role === 'user' ? 'user' : 'model',
      parts
    };
  });

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
    },
  });

  const text = response.text;
  if (!text) throw new Error("AI tidak memberikan respon. Mungkin koneksi lagi down.");

  try {
    const parsed = JSON.parse(text);
    if (!parsed.analysis || !parsed.responseText) {
      throw new Error("Format analisis tidak sesuai.");
    }
    return parsed as { analysis: VibeAnalysis; responseText: string };
  } catch (e) {
    console.error("Failed to parse AI response", e, text);
    throw new Error("Gagal memproses analisis AI. Coba curhat yang lebih jelas ya!");
  }
}

export async function generateTTS(text: string): Promise<string> {
  if (!text) return "";
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 40000); // 40 second timeout

  try {
    // Using gemini-2.5-flash-preview-tts for multimodal audio output
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Read this Indonesian text expressively, with high energy, and an excited, friendly tone like a Gen-Z relationship expert: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: "Aoede", // Aoede is generally expressive. Other options: Puck, Kore
            }
          }
        }
      },
    });

    clearTimeout(timeoutId);
    
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("No audio data from AI");
    
    return base64Audio;
  } catch (e: any) {
    clearTimeout(timeoutId);
    if (e.name === 'AbortError') {
      console.error("TTS request timed out");
      throw new Error("TTS timed out");
    }
    console.error("TTS failed", e);
    throw e;
  }
}
