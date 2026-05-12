export type VibeFlag = 'GREEN' | 'YELLOW' | 'RED';

export interface VibeAnalysis {
  flag: VibeFlag;
  reasoning: string;
  futureImpact: string;
  actionPlan: string;
  priority?: string; // e.g. "High", "Critical", "Routine"
  labels: string[]; // e.g. ["Ghosting", "Manipulative", "Healthy Communication"]
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  imageData?: string;
  analysis?: VibeAnalysis; // Occasional analysis updates
}

export interface CurhatEntry {
  id: string;
  timestamp: number;
  messages: ChatMessage[];
  lastAnalysis: VibeAnalysis;
  isMirrorMode: boolean;
}

export interface HistoryStats {
  greenCount: number;
  yellowCount: number;
  redCount: number;
  commonThemes: { theme: string; count: number }[];
}
