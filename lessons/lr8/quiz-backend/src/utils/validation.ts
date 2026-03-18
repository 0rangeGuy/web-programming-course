import { z } from "zod";

// Существующая схема из LR8
export const codeSchema = z.object({
  code: z.string().min(1),
});

// НОВЫЕ СХЕМЫ ДЛЯ LR9

// Схема для создания ответа
export const answerSchema = z.object({
  questionId: z.string().cuid(),
  userAnswer: z.any(), // Любой тип, так как ответ может быть разным
});

// Схема для оценивания эссе (admin)
export const gradeSchema = z.object({
  grades: z.array(z.number().min(0)),
  rubric: z.array(z.number().min(0)).optional(),
  comment: z.string().optional(),
});

// Схема для создания вопроса (admin)
export const questionSchema = z.object({
  text: z.string().min(5, "Question text must be at least 5 characters"),
  type: z.enum(["single-select", "multiple-select", "essay"]),
  categoryId: z.string().cuid(),
  correctAnswer: z.any().optional(),
  points: z.number().int().min(1).default(1),
});

// Схема для обновления вопроса
export const questionUpdateSchema = questionSchema.partial();

// Схема для создания категории
export const categorySchema = z.object({
  name: z.string().min(2),
  slug: z
    .string()
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must contain only lowercase letters, numbers, and hyphens",
    ),
});
