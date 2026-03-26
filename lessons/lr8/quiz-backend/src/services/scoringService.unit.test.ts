import { describe, it, expect } from "vitest";
import { scoringService } from "./scoringService.js";

describe("ScoringService", () => {
  describe("scoreMultipleSelect", () => {
    it("должен начислить +1 за правильный ответ и -0.5 за неправильный", () => {
      const result = scoringService.scoreMultipleSelect([1, 3, 5], [1, 2, 3]);
      expect(result).toBe(1.5); // +1 (1) -0.5 (2) +1 (3) = 1.5
    });

    it("не должен опускаться ниже 0", () => {
      const result = scoringService.scoreMultipleSelect([1, 3], [2, 4, 5]);
      expect(result).toBe(0); // все ответы неправильные -> 0
    });

    it("должен вернуть 0 если входные данные не массивы", () => {
      expect(scoringService.scoreMultipleSelect(null as any, [1, 2])).toBe(0);
      expect(scoringService.scoreMultipleSelect([1, 2], null as any)).toBe(0);
    });

    it("должен корректно обрабатывать пустые массивы", () => {
      expect(scoringService.scoreMultipleSelect([], [])).toBe(0);
      expect(scoringService.scoreMultipleSelect([1, 2], [])).toBe(0);
    });
  });

  describe("scoreSingleSelect", () => {
    it("должен начислить баллы за правильный ответ", () => {
      const result = scoringService.scoreSingleSelect("4", "4", 2);
      expect(result).toBe(2);
    });

    it("должен вернуть 0 за неправильный ответ", () => {
      const result = scoringService.scoreSingleSelect("4", "5", 2);
      expect(result).toBe(0);
    });

    it("должен корректно сравнивать числа и строки", () => {
      expect(scoringService.scoreSingleSelect(4, "4", 1)).toBe(1);
      expect(scoringService.scoreSingleSelect("4", 4, 1)).toBe(1);
    });

    it("должен удалять лишние кавычки", () => {
      expect(scoringService.scoreSingleSelect("4", '"4"', 1)).toBe(1);
      expect(scoringService.scoreSingleSelect('"4"', "4", 1)).toBe(1);
    });
  });

  describe("scoreEssay", () => {
    it("должен суммировать баллы по критериям", () => {
      const result = scoringService.scoreEssay([4, 5, 3], [5, 5, 5]);
      expect(result).toBe(12);
    });

    it("не должен превышать максимальные баллы по критерию", () => {
      const result = scoringService.scoreEssay([10, 10], [5, 5]);
      expect(result).toBe(10);
    });

    it("должен вернуть 0 если входные данные не массивы", () => {
      expect(scoringService.scoreEssay(null as any, [5, 5])).toBe(0);
    });
  });

  describe("scoreQuestion", () => {
    it("должен обработать single-select вопрос", () => {
      const result = scoringService.scoreQuestion(
        "single-select",
        '"4"',
        "4",
        2,
      );
      expect(result.score).toBe(2);
      expect(result.isCorrect).toBe(true);
    });

    it("должен обработать multiple-select вопрос", () => {
      const result = scoringService.scoreQuestion(
        "multiple-select",
        JSON.stringify([1, 3]),
        JSON.stringify([1, 2]),
        3,
      );
      // Проверяем по реальной логике:
      // +1 за 1, -0.5 за 2 = 0.5 (минимум 0, но не больше points)
      expect(result.score).toBe(0.5);
      expect(result.isCorrect).toBe(false);
    });

    it("должен вернуть null для essay вопроса", () => {
      const result = scoringService.scoreQuestion("essay", null, "текст", 5);
      expect(result.score).toBe(null);
      expect(result.isCorrect).toBe(null);
    });
  });
});
