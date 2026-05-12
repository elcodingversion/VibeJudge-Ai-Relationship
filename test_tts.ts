import { GoogleGenAI, Modality } from "@google/genai";

async function run() {
  const apiKey = "AIzaSyAauPC5Pt32ShHEWqKpNHGKtPUElc-ly44";
  const ai = new GoogleGenAI({ apiKey });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts", 
      contents: [{ parts: [{ text: "Halo, ini tes suara." }] }],
      config: {
        responseModalities: [Modality.AUDIO],
      },
    });
    console.log("Success with gemini-2.0-flash");
    const audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    console.log("Audio exists:", !!audio);
  } catch (e) {
    console.error("Failed with gemini-2.0-flash", e);
  }
}

run();
