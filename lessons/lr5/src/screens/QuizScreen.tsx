import { observer } from "mobx-react-lite";
import { useUIStore } from "../stores/uiStore";
import { gameStore } from "../stores/gameStore";
import QuizProgress from "../components/quiz/QuizProgress";
import MultipleSelectQuestion from "../components/quiz/MultipleSelectQuestion";
import EssayQuestion from "../components/quiz/EssayQuestion";
import QuizButton from "../components/quiz/QuizButton";
import type { Question } from "../types/quiz";

interface QuizScreenProps {
  currentQuestion: Question;
  essayAnswer: string;
  onEssayAnswerChange: (value: string) => void;
  onNext: () => void;
  onFinish: () => void;
  isSubmitting: boolean;
}

const QuizScreen = observer(
  ({
    currentQuestion,
    essayAnswer,
    onEssayAnswerChange,
    onNext,
    onFinish,
    isSubmitting,
  }: QuizScreenProps) => {
    const theme = useUIStore((state) => state.theme);

    const bgGradient =
      theme === "light"
        ? "from-purple-500 to-indigo-600"
        : "from-gray-900 to-black";
    const cardBg = theme === "light" ? "bg-white" : "bg-gray-800";
    const textColor = theme === "light" ? "text-gray-800" : "text-white";

    const { selectedAnswers } = gameStore;

    const hasAnswer =
      (currentQuestion.type === "multiple-select" &&
        selectedAnswers.length > 0) ||
      (currentQuestion.type === "essay" &&
        essayAnswer.trim().length >= (currentQuestion.minLength || 0));

    return (
      <div
        className={`min-h-screen bg-gradient-to-br ${bgGradient} p-4 transition-colors duration-300`}
      >
        <div className="mx-auto max-w-2xl">
          <QuizProgress />

          <div
            className={`${cardBg} rounded-2xl p-6 shadow-2xl transition-colors duration-300`}
          >
            <div className="mb-4">
              <span
                className={`rounded-full px-2 py-1 text-xs ${
                  currentQuestion.difficulty === "easy" &&
                  "bg-green-100 text-green-700"
                } ${
                  currentQuestion.difficulty === "medium" &&
                  "bg-yellow-100 text-yellow-700"
                } ${
                  currentQuestion.difficulty === "hard" &&
                  "bg-red-100 text-red-700"
                } `}
              >
                {currentQuestion.difficulty === "easy" && "Легкий"}
                {currentQuestion.difficulty === "medium" && "Средний"}
                {currentQuestion.difficulty === "hard" && "Сложный"}
              </span>
            </div>

            <h2 className={`mb-6 text-2xl font-bold ${textColor}`}>
              {currentQuestion.question}
            </h2>

            {currentQuestion.type === "multiple-select" ? (
              <MultipleSelectQuestion
                question={currentQuestion}
                selectedAnswers={selectedAnswers}
                disabled={isSubmitting}
              />
            ) : (
              <EssayQuestion
                question={currentQuestion}
                essayAnswer={essayAnswer}
                onAnswerChange={onEssayAnswerChange}
                disabled={isSubmitting}
              />
            )}

            {hasAnswer && (
              <div className="mt-6">
                <QuizButton
                  onClick={gameStore.isLastQuestion ? onFinish : onNext}
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? "Отправка..."
                    : gameStore.isLastQuestion
                      ? "Завершить"
                      : "Следующий вопрос"}
                </QuizButton>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

export default QuizScreen;
