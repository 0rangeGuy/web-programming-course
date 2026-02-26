import type { Question, QuestionResponse } from "../types/quiz";

export const mockQuestions: Question[] = [
  {
    id: "1",
    type: "multiple-select",
    question: "Что такое ГОЙДА!!!!?",
    options: ["ГОЙДА!", "ГОЙДА!!", "ГОЙДА!!!", "ГОЙДА!!!!"],
    correctAnswer: 3,
    difficulty: "easy",
  },
  {
    id: "2",
    type: "multiple-select",
    question: "Как не спалиться с подиком на лекции?",
    options: [
      "Не брать подик",
      "Не выдыхать",
      "Парить под партой",
      "Поделиться с преподом",
    ],
    correctAnswer: 0,
    difficulty: "medium",
  },
  {
    id: "3",
    type: "essay",
    question: "Audentes fortuna juvat, что по вашему мнению значит эта фраза?",
    correctAnswer: 0,
    difficulty: "hard",
    minLength: 50,
    maxLength: 500,
  },
];

export const mockQuestionResponses: QuestionResponse[] = [
  {
    id: "1",
    type: "multiple-select",
    question: "Что такое ГОЙДА!!!!?",
    options: ["ГОЙДА!", "ГОЙДА!!", "ГОЙДА!!!", "ГОЙДА!!!!"],
    difficulty: "easy",
    maxPoints: 15,
  },
  {
    id: "2",
    type: "multiple-select",
    question: "Как не спалиться с подиком на лекции?",
    options: [
      "Не брать подик",
      "Не выдыхать",
      "Парить под партой",
      "Поделиться с преподом",
    ],
    difficulty: "medium",
    maxPoints: 15,
  },
];

export const mockSingleQuestion: Question = {
  id: "test-1",
  type: "multiple-select",
  question: "Тестовый вопрос?",
  options: ["Вариант 1", "Вариант 2", "Вариант 3", "Вариант 4"],
  correctAnswer: 2,
  difficulty: "easy",
};

export const mockEssayQuestion: Question = {
  id: "essay-1",
  type: "essay",
  question: "Напишите эссе о Dota 2",
  correctAnswer: 0,
  difficulty: "hard",
  minLength: 100,
  maxLength: 1000,
};
