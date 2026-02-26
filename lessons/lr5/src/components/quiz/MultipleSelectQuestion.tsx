import { observer } from "mobx-react-lite";
import { useUIStore } from "../../stores/uiStore";
import { gameStore } from "../../stores/gameStore";
import type { Question } from "../../types/quiz";

interface MultipleSelectQuestionProps {
  question: Question;
  selectedAnswers: number[];
  disabled?: boolean;
}

const MultipleSelectQuestion = observer(
  ({
    question,
    selectedAnswers,
    disabled = false,
  }: MultipleSelectQuestionProps) => {
    const theme = useUIStore((state) => state.theme);
    const textColor = theme === "light" ? "text-gray-800" : "text-white";

    return (
      <div className="space-y-3">
        {question.options?.map((option, index) => {
          const isSelected = selectedAnswers.includes(index);
          const isCorrect = index === question.correctAnswer;
          const showResult = false;

          return (
            <button
              key={index}
              onClick={() => gameStore.toggleAnswer(index)}
              disabled={disabled}
              className={`w-full rounded-lg border-2 p-4 text-left transition-all ${
                !showResult &&
                theme === "light" &&
                "hover:border-purple-400 hover:bg-purple-50"
              } ${
                !showResult &&
                theme === "dark" &&
                "hover:border-purple-500 hover:bg-gray-700"
              } ${
                !showResult &&
                !isSelected &&
                (theme === "light"
                  ? "border-gray-200 bg-white"
                  : "border-gray-600 bg-gray-700")
              } ${
                !showResult &&
                isSelected &&
                (theme === "light"
                  ? "border-purple-500 bg-purple-50"
                  : "border-purple-500 bg-gray-600")
              } ${showResult && isCorrect && "border-green-500 bg-green-50"} ${
                showResult &&
                isSelected &&
                !isCorrect &&
                "border-red-500 bg-red-50"
              } ${showResult && !isCorrect && !isSelected && "opacity-60"} `}
            >
              <div className="flex items-center">
                <span
                  className={`mr-3 flex h-8 w-8 items-center justify-center rounded-full font-semibold ${
                    !isSelected &&
                    (theme === "light"
                      ? "bg-gray-200"
                      : "bg-gray-600 text-white")
                  } ${
                    isSelected &&
                    (theme === "light"
                      ? "bg-purple-500 text-white"
                      : "bg-purple-400 text-white")
                  } `}
                >
                  {isSelected ? "✓" : String.fromCharCode(65 + index)}
                </span>
                <span className={`flex-1 ${textColor}`}>{option}</span>
              </div>
            </button>
          );
        })}
      </div>
    );
  }
);

export default MultipleSelectQuestion;
