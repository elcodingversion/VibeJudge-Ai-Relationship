import { generateTTS } from "../services/gemini";

const audioCache = new Map<string, string>();

export async function playTextToSpeech(text: string, onEnd: () => void): Promise<() => void> {
  try {
    let base64Audio = audioCache.get(text);
    if (!base64Audio) {
      base64Audio = await generateTTS(text);
      if (base64Audio) {
        audioCache.set(text, base64Audio);
      }
    }
    
    const binaryString = window.atob(base64Audio);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const audioContext = new AudioContextClass({ sampleRate: 24000 });
    const int16Array = new Int16Array(bytes.buffer);
    const float32Array = new Float32Array(int16Array.length);
    for (let i = 0; i < int16Array.length; i++) {
      float32Array[i] = int16Array[i] / 32768;
    }
    
    const audioBuffer = audioContext.createBuffer(1, float32Array.length, 24000);
    audioBuffer.getChannelData(0).set(float32Array);
    
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    
    // Ensure the audio context is active (important for some browsers)
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }
    
    let isStopped = false;
    const stop = () => {
      if (isStopped) return;
      isStopped = true;
      try {
        source.stop();
        audioContext.close();
      } catch (e) {
        // Already stopped or closed
      }
      onEnd();
    };

    source.onended = () => {
      if (!isStopped) {
        isStopped = true;
        audioContext.close();
        onEnd();
      }
    };
    
    source.start();
    return stop;
  } catch (e) {
    console.warn("Gemini TTS failed (likely rate limited), falling back to browser TTS:", e);
    return fallbackSpeechSynthesis(text, onEnd);
  }
}

function fallbackSpeechSynthesis(text: string, onEnd: () => void): () => void {
  if (!('speechSynthesis' in window)) {
    console.error("Browser does not support SpeechSynthesis");
    onEnd();
    return () => {};
  }
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'id-ID';
  
  // Try to find the best Indonesian voice available in the system
  const voices = window.speechSynthesis.getVoices();
  const idVoices = voices.filter(v => v.lang === 'id-ID' || v.lang === 'id_ID');
  const bestVoice = idVoices.find(v => v.name.includes('Google') || v.name.includes('Premium') || v.name.includes('Natural')) || idVoices[0];
  
  if (bestVoice) {
    utterance.voice = bestVoice;
  }
  
  // Normal pitch and rate sounds more natural than modified ones
  utterance.rate = 1.0; 
  utterance.pitch = 1.0;
  
  let isStopped = false;
  
  const stop = () => {
    if (isStopped) return;
    isStopped = true;
    window.speechSynthesis.cancel();
    onEnd();
  };
  
  utterance.onend = () => {
    if (!isStopped) {
      isStopped = true;
      onEnd();
    }
  };
  
  utterance.onerror = (event) => {
    console.error("SpeechSynthesis error:", event);
    if (!isStopped) {
      isStopped = true;
      onEnd();
    }
  };
  
  window.speechSynthesis.speak(utterance);
  return stop;
}
