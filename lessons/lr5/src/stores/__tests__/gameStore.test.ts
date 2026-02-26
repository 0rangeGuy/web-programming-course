import { describe, it, expect, beforeEach } from "vitest";
import { GameStore } from "../gameStore";
import { mockQuestions } from "../../test/mockData";

describe("GameStore", () => {
  let store: GameStore;

  beforeEach(() => {
    store = new GameStore();
  });

  it("Переход на следующий вопрос", () => {
    store.setQuestionsFromAPI(mockQuestions);
    store.startGame();
    store.toggleAnswer(0);

    store.nextQuestion();

    expect(store.currentQuestionIndex).toBe(1);
    expect(store.selectedAnswers).toEqual([]);
  });

  it("Проверка работы выборки 1го варианта ответа", () => {
    store.toggleAnswer(0);
    expect(store.selectedAnswers).toEqual([0]);

    store.toggleAnswer(0);
    expect(store.selectedAnswers).toEqual([]);
  });

  it("Проверка мульти выборки вариантов ответов", () => {
    store.toggleAnswer(0);
    store.toggleAnswer(2);
    expect(store.selectedAnswers).toEqual([0, 2]);
  });

  it("Проверка пустых полей в начале теста", () => {
    expect(store.gameStatus).toBe("idle");
    expect(store.questions).toEqual([]);
    expect(store.score).toBe(0);
    expect(store.selectedAnswers).toEqual([]);
  });

  it("Завершение теста на последнем вопросе", () => {
    store.setQuestionsFromAPI(mockQuestions);
    store.currentQuestionIndex = 2;

    store.nextQuestion();

    expect(store.gameStatus).toBe("finished");
  });
});
