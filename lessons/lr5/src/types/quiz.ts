export interface Question {
  id: string | number;
  type: "multiple-select" | "essay";
  question: string;
  options?: string[];
  correctAnswer: number;
  difficulty: "easy" | "medium" | "hard";
  minLength?: number;
  maxLength?: number;
}

export interface QuestionResponse {
  id: string | number;
  type: "multiple-select" | "essay";
  question: string;
  options?: string[];
  difficulty: "easy" | "medium" | "hard";
  minLength?: number;
  maxLength?: number;
  maxPoints?: number;
}

export interface Answer {
  questionId: string | number;
  selectedAnswers: number[];
  isCorrect: boolean;
}

export type GameStatus = "idle" | "playing" | "paused" | "finished";

export type Theme = "light" | "dark";
