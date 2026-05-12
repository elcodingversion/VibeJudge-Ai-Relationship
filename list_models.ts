import { GoogleGenAI } from "@google/genai";

async function run() {
  const apiKey = "AIzaSyAauPC5Pt32ShHEWqKpNHGKtPUElc-ly44";
  const ai = new GoogleGenAI({ apiKey });
  try {
    const response = await ai.models.list();
    for await (const model of response) {
      if (model.name.includes("gemini-2")) {
        console.log(model.name);
      }
    }
  } catch (e) {
    console.error("Failed to list models", e);
  }
}

run();
