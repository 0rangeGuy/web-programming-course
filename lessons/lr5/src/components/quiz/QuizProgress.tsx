import { observer } from "mobx-react-lite";
import { useUIStore } from "../../stores/uiStore";
import { gameStore } from "../../stores/gameStore";

const QuizProgress = observer(() => {
  const theme = useUIStore((state) => state.theme);
  const toggleTheme = useUIStore((state) => state.toggleTheme);

  const cardBg = theme === "light" ? "bg-white" : "bg-gray-800";
  const mutedText = theme === "light" ? "text-gray-600" : "text-gray-400";

  const { score, progress } = gameStore;

  return (
    <div
      className={`${cardBg} mb-4 rounded-lg p-4 shadow-md transition-colors duration-300`}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className={`text-sm ${mutedText}`}>
          Вопрос {gameStore.currentQuestionIndex + 1} из{" "}
          {gameStore.questions.length}
        </span>
        <div className="flex items-center gap-3">
          <span
            className={`text-xl font-bold ${
              theme === "light" ? "text-purple-600" : "text-purple-400"
            }`}
          >
            Счёт: {score}
          </span>
          <button
            onClick={toggleTheme}
            className={`rounded p-2 ${
              theme === "light"
                ? "bg-gray-100 hover:bg-gray-200"
                : "bg-gray-700 hover:bg-gray-600"
            } transition-colors`}
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>
        </div>
      </div>
      <div
        className={`w-full ${
          theme === "light" ? "bg-gray-200" : "bg-gray-700"
        } h-2 rounded-full`}
      >
        <div
          className={`${
            theme === "light" ? "bg-purple-600" : "bg-purple-500"
          } h-2 rounded-full transition-all duration-300`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
});

export default QuizProgress;
