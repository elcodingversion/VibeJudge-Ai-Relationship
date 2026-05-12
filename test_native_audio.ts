import { GoogleGenAI, Modality } from "@google/genai";

async function run() {
  const apiKey = "AIzaSyAauPC5Pt32ShHEWqKpNHGKtPUElc-ly44";
  const ai = new GoogleGenAI({ apiKey });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-native-audio-latest", 
      contents: [{ parts: [{ text: "Halo, tes suara yang lebih bagus." }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: "Aoede"
            }
          }
        }
      },
    });
    console.log("Success with gemini-2.5-flash-native-audio-latest");
    const audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    console.log("Audio exists:", !!audio);
  } catch (e) {
    console.error("Failed", e.message);
  }
}

run();
