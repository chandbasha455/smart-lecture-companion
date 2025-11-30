export interface BulletPoint {
  id: string;
  text: string;
  timestamp: Date;
}

export interface Session {
  id: string;
  name: string;
  topic: string;
  timestamp: Date;
  bullets: BulletPoint[];
}

export interface QuizQuestion {
  id: string;
  type: 'mcq' | 'fill-blank' | 'short-answer';
  question: string;
  options?: string[];
  answer: string;
}

export interface Quiz {
  id: string;
  sessionId: string;
  questions: QuizQuestion[];
  generatedAt: Date;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isAudio?: boolean;
}
