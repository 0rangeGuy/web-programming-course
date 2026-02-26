import { useUIStore } from "../stores/uiStore";
import QuizButton from "../components/quiz/QuizButton";

interface StartScreenProps {
  onStart: () => void;
  isLoading: boolean;
}

const StartScreen = ({ onStart, isLoading }: StartScreenProps) => {
  const theme = useUIStore((state) => state.theme);
  const soundEnabled = useUIStore((state) => state.soundEnabled);
  const toggleTheme = useUIStore((state) => state.toggleTheme);

  const bgGradient =
    theme === "light"
      ? "from-purple-500 to-indigo-600"
      : "from-gray-900 to-black";
  const cardBg = theme === "light" ? "bg-white" : "bg-gray-800";
  const textColor = theme === "light" ? "text-gray-800" : "text-white";
  const mutedText = theme === "light" ? "text-gray-600" : "text-gray-400";

  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${bgGradient} flex items-center justify-center p-4 transition-colors duration-300`}
    >
      <div
        className={`${cardBg} w-full max-w-md rounded-2xl p-8 shadow-2xl transition-colors duration-300`}
      >
        <div className="mb-4 flex justify-end">
          <button
            onClick={toggleTheme}
            className={`rounded-lg p-2 ${
              theme === "light"
                ? "bg-gray-100 hover:bg-gray-200"
                : "bg-gray-700 hover:bg-gray-600"
            } transition-colors`}
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>
        </div>

        <h1 className={`mb-2 text-center text-4xl font-bold ${textColor}`}>
          Quiz Game
        </h1>
        <p className={`${mutedText} mb-2 text-center`}>
          MobX + Zustand Edition
        </p>
        <p className={`text-sm ${mutedText} mb-8 text-center`}>
          Звук: {soundEnabled ? "🔊" : "🔇"}
        </p>

        <QuizButton onClick={onStart} disabled={isLoading} variant="scale">
          {isLoading ? "Загрузка..." : "Начать игру"}
        </QuizButton>

        <div
          className={`mt-6 rounded-lg p-4 ${
            theme === "light" ? "bg-purple-50" : "bg-gray-700"
          }`}
        >
          <p
            className={`text-sm ${
              theme === "light" ? "text-purple-900" : "text-gray-300"
            } mb-2`}
          >
            <strong>Task 4:</strong> Комбинация MobX + Zustand
          </p>
          <ul
            className={`text-xs ${
              theme === "light" ? "text-purple-800" : "text-gray-400"
            } space-y-1`}
          >
            <li>
              • <strong>MobX:</strong> Игровая логика (вопросы, счёт)
            </li>
            <li>
              • <strong>Zustand:</strong> UI настройки (тема, звук)
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StartScreen;
