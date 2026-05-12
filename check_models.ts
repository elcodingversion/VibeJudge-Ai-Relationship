import { GoogleGenAI } from "@google/genai";

async function run() {
  const apiKey = "AIzaSyCn_e6qLoLQLv_aEWTkt_--wUgOMMXeRGE";
  const ai = new GoogleGenAI({ apiKey });
  try {
    const response = await ai.models.list();
    for await (const model of response) {
      if (model.name.includes("flash")) {
        console.log(model.name);
      }
    }
  } catch (e) {
    console.error("Failed to list models", e);
  }
}

run();
