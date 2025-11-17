// Question types based on your existing schema
export interface Question {
  id: string;
  userId: string;
  question: string;
  answer: string;
  category: string | null;
  tags: string[] | null;
  duration: number;
  customColor: string | null;
  timesReviewed: number;
  lastReviewed: Date | null;
  performanceScore: number;
  order: number;
}

export interface QuestionAnswer extends Question {}

// Navigation types
export type RootTabParamList = {
  Home: undefined;
  Questions: undefined;
  Study: undefined;
  Settings: undefined;
};

export type QuestionsStackParamList = {
  QuestionsList: undefined;
  AddQuestion: undefined;
};

// Study mode types
export type StudyMode = 'flashcard' | 'screensaver' | 'timed';

// Settings types
export interface AppSettings {
  theme: 'light' | 'dark';
  autoAdvance: boolean;
  defaultDuration: number;
  soundEnabled: boolean;
}