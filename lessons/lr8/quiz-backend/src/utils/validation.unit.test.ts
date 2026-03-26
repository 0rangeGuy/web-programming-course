import { describe, it, expect } from "vitest";
import {
  codeSchema,
  answerSchema,
  gradeSchema,
  questionSchema,
  categorySchema,
} from "./validation.js";

describe("Validation Schemas", () => {
  describe("codeSchema", () => {
    it("должен пропустить валидный код", () => {
      const result = codeSchema.safeParse({ code: "abc123" });
      expect(result.success).toBe(true);
    });

    it("должен отклонить пустой код", () => {
      const result = codeSchema.safeParse({ code: "" });
      expect(result.success).toBe(false);
    });
  });

  describe("answerSchema", () => {
    it("должен пропустить валидный ответ", () => {
      const result = answerSchema.safeParse({
        questionId: "cuid12345678901234567890",
        userAnswer: "4",
      });
      expect(result.success).toBe(true);
    });

    it("должен отклонить некорректный questionId (не CUID)", () => {
      const result = answerSchema.safeParse({
        questionId: "not-a-cuid",
        userAnswer: "4",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("questionSchema", () => {
    it("должен пропустить валидный вопрос", () => {
      const result = questionSchema.safeParse({
        text: "Что такое 2+2?",
        type: "single-select",
        categoryId: "cuid12345678901234567890",
        points: 2,
      });
      expect(result.success).toBe(true);
    });

    it("должен отклонить вопрос с текстом короче 5 символов", () => {
      const result = questionSchema.safeParse({
        text: "2+2?",
        type: "single-select",
        categoryId: "cuid12345678901234567890",
      });
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toContain("5 characters");
    });

    it("должен отклонить некорректный тип вопроса", () => {
      const result = questionSchema.safeParse({
        text: "Что такое 2+2?",
        type: "invalid-type",
        categoryId: "cuid12345678901234567890",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("categorySchema", () => {
    it("должен пропустить валидную категорию", () => {
      const result = categorySchema.safeParse({
        name: "Математика",
        slug: "mathematics",
      });
      expect(result.success).toBe(true);
    });

    it("должен отклонить slug с заглавными буквами", () => {
      const result = categorySchema.safeParse({
        name: "Математика",
        slug: "Mathematics",
      });
      expect(result.success).toBe(false);
    });

    it("должен отклонить slug с пробелами", () => {
      const result = categorySchema.safeParse({
        name: "Математика",
        slug: "math 101",
      });
      expect(result.success).toBe(false);
    });
  });
});
