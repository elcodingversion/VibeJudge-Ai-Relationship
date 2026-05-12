import { GoogleGenAI, Modality } from "@google/genai";

async function run() {
  const apiKey = "AIzaSyAauPC5Pt32ShHEWqKpNHGKtPUElc-ly44";
  const ai = new GoogleGenAI({ apiKey });
  
  const voices = ["Aoede", "Charon", "Fenrir", "Kore", "Puck"];
  
  for (const voice of voices) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts", 
        contents: [{ parts: [{ text: "Halo semuanya, aku excited banget hari ini!" }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: voice
              }
            }
          }
        },
      });
      console.log(`Success with voice: ${voice}`);
    } catch (e) {
      console.error(`Failed with voice: ${voice}`, e.message);
    }
  }
}

run();
