import { analyzeVibe } from './src/services/gemini.js';

async function test() {
  try {
    const result = await analyzeVibe([{ role: 'user', content: 'pacar gue suka bohong, dia bilang tidur taunya main game' }], false);
    console.log("RESULT:", JSON.stringify(result, null, 2));
  } catch (e) {
    console.error("ERROR:", e);
  }
}

test();
