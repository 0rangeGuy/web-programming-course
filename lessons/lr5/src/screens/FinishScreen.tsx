import { observer } from "mobx-react-lite";
import { useUIStore } from "../stores/uiStore";
import { gameStore } from "../stores/gameStore";
import QuizButton from "../components/quiz/QuizButton";

const FinishScreen = observer(() => {
  const theme = useUIStore((state) => state.theme);

  const bgGradient =
    theme === "light"
      ? "from-purple-500 to-indigo-600"
      : "from-gray-900 to-black";
  const cardBg = theme === "light" ? "bg-white" : "bg-gray-800";
  const textColor = theme === "light" ? "text-gray-800" : "text-white";
  const mutedText = theme === "light" ? "text-gray-600" : "text-gray-400";

  const { score } = gameStore;
  const percentage = Math.round(
    (gameStore.correctAnswersCount / gameStore.questions.length) * 100
  );

  const getEmoji = () => {
    if (percentage >= 80) return "🏆";
    if (percentage >= 60) return "😊";
    if (percentage >= 40) return "🤔";
    return "😢";
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${bgGradient} flex items-center justify-center p-4 transition-colors duration-300`}
    >
      <div
        className={`${cardBg} w-full max-w-md rounded-2xl p-8 text-center shadow-2xl transition-colors duration-300`}
      >
        <div className="mb-4 text-6xl">{getEmoji()}</div>

        <h2 className={`mb-4 text-3xl font-bold ${textColor}`}>
          Игра завершена!
        </h2>

        <div className="mb-6">
          <p
            className={`text-5xl font-bold ${
              theme === "light" ? "text-purple-600" : "text-purple-400"
            } mb-2`}
          >
            {score}
          </p>
          <p className={mutedText}>очков заработано</p>
        </div>

        <div
          className={`${
            theme === "light" ? "bg-gray-100" : "bg-gray-700"
          } mb-6 rounded-lg p-4`}
        >
          <p className={`text-lg ${textColor}`}>
            Правильных ответов:{" "}
            <span className="font-bold">
              {gameStore.correctAnswersCount} из {gameStore.questions.length}
            </span>
          </p>
          <p
            className={`mt-2 text-2xl font-bold ${
              theme === "light" ? "text-purple-600" : "text-purple-400"
            }`}
          >
            {percentage}%
          </p>
        </div>

        <QuizButton onClick={() => gameStore.resetGame()} variant="scale">
          Играть снова
        </QuizButton>
      </div>
    </div>
  );
});

export default FinishScreen;
