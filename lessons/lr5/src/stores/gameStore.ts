import { makeAutoObservable } from "mobx";
import { Question, Answer } from "../types/quiz";

class GameStore {
  gameStatus: "idle" | "playing" | "finished" = "idle";

  questions: Question[] = [];
  currentQuestionIndex = 0;
  score = 0;
  selectedAnswers: number[] = [];
  answeredQuestions: Answer[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  startGame() {
    this.gameStatus = "playing";
    this.currentQuestionIndex = 0;
    this.score = 0;
    this.selectedAnswers = [];
    this.answeredQuestions = [];
  }

  toggleAnswer(answerIndex: number) {
    const index = this.selectedAnswers.indexOf(answerIndex);
    if (index > -1) {
      this.selectedAnswers = this.selectedAnswers.filter(
        (i) => i !== answerIndex
      );
    } else {
      this.selectedAnswers = [...this.selectedAnswers, answerIndex];
    }
  }

  saveCurrentAnswer() {
    const currentQuestion = this.currentQuestion;
    if (!currentQuestion || this.selectedAnswers.length === 0) return;

    const isCorrect = this.selectedAnswers.includes(
      currentQuestion.correctAnswer
    );

    this.answeredQuestions.push({
      questionId: currentQuestion.id,
      selectedAnswers: this.selectedAnswers,
      isCorrect,
    });
  }

  updateAnswerResult(
    questionId: string | number,
    isCorrect: boolean,
    pointsEarned: number
  ) {
    const answer = this.answeredQuestions.find(
      (a) => a.questionId === questionId
    );
    if (answer) {
      answer.isCorrect = isCorrect;
    }
    this.score = pointsEarned;
  }

  setQuestionsFromAPI(questions: Question[]) {
    this.questions = questions;
  }

  nextQuestion() {
    if (this.isLastQuestion) {
      this.finishGame();
    } else {
      this.currentQuestionIndex += 1;
      this.selectedAnswers = [];
    }
  }

  finishGame() {
    this.gameStatus = "finished";
  }

  resetGame() {
    this.gameStatus = "idle";
    this.questions = [];
    this.currentQuestionIndex = 0;
    this.score = 0;
    this.selectedAnswers = [];
    this.answeredQuestions = [];
  }

  get currentQuestion(): Question | null {
    if (this.questions.length === 0) return null;
    return this.questions[this.currentQuestionIndex] || null;
  }

  get progress(): number {
    if (this.questions.length === 0) return 0;
    return ((this.currentQuestionIndex + 1) / this.questions.length) * 100;
  }

  get isLastQuestion(): boolean {
    return this.currentQuestionIndex === this.questions.length - 1;
  }

  get correctAnswersCount(): number {
    return this.answeredQuestions.filter((answer) => answer.isCorrect).length;
  }
}

export const gameStore = new GameStore();
export { GameStore };
