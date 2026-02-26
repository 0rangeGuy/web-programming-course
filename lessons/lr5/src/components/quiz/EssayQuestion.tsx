import { useUIStore } from "../../stores/uiStore";
import type { Question } from "../../types/quiz";

interface EssayQuestionProps {
  question: Question;
  essayAnswer: string;
  onAnswerChange: (value: string) => void;
  disabled?: boolean;
}

const EssayQuestion = ({
  question,
  essayAnswer,
  onAnswerChange,
  disabled = false,
}: EssayQuestionProps) => {
  const theme = useUIStore((state) => state.theme);
  const mutedText = theme === "light" ? "text-gray-600" : "text-gray-400";

  return (
    <div className="space-y-3">
      <textarea
        value={essayAnswer}
        onChange={(e) => onAnswerChange(e.target.value)}
        disabled={disabled}
        placeholder="Введите ваш ответ здесь..."
        rows={8}
        maxLength={question.maxLength}
        className={`w-full resize-none rounded-lg border-2 p-4 transition-all ${
          theme === "light"
            ? "border-gray-200 bg-white text-gray-800 placeholder-gray-400 focus:border-purple-500"
            : "border-gray-600 bg-gray-700 text-white placeholder-gray-500 focus:border-purple-500"
        } focus:outline-none focus:ring-2 focus:ring-purple-500/20 disabled:cursor-not-allowed disabled:opacity-50`}
      />
      <div className={`text-sm ${mutedText}`}>
        {essayAnswer.length} символов
        {question.minLength && <span> (минимум {question.minLength})</span>}
      </div>
    </div>
  );
};

export default EssayQuestion;
