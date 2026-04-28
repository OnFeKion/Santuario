export type Emotion = 'cansado' | 'ansioso' | 'triste' | 'estressado' | 'desfocado' | 'neutro';

export interface Aroma {
  id: string;
  name: string;
  category: string;
  benefits: string;
  notes: string;
  intensity: number; // 0 to 100
  tags: string[];
  imageUrl: string;
}

export type View = 'home' | 'recording' | 'analysis' | 'result' | 'history' | 'usage';

export interface AnalysisResult {
  emotion: {
    label: string;
    description: string;
  };
  aroma: Aroma;
  aromaExplanation: string;
  usageMethod: string;
  quote: string;
  transcription: string;
}
