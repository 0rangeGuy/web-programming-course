import { observer } from "mobx-react-lite";
import { useState } from "react";
import { gameStore } from "../stores/gameStore";
import { usePostApiSessions } from "../../generated/api/sessions/sessions";
import { usePostApiSessionsSessionIdAnswers } from "../../generated/api/sessions/sessions";
import { usePostApiSessionsSessionIdSubmit } from "../../generated/api/sessions/sessions";
import type { Question } from "../types/quiz";
import StartScreen from "../screens/StartScreen";
import QuizScreen from "../screens/QuizScreen";
import FinishScreen from "../screens/FinishScreen";

type SubmissionData = {
  questionId: string;
  selectedOptions?: number[];
  text?: string;
};

const Task4 = observer(() => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [essayAnswer, setEssayAnswer] = useState<string>("");

  const createSession = usePostApiSessions();
  const submitAnswer = usePostApiSessionsSessionIdAnswers();
  const submitSession = usePostApiSessionsSessionIdSubmit();

  const { gameStatus, currentQuestion, selectedAnswers } = gameStore;

  const handleStartGame = () => {
    createSession.mutate(
      {
        data: {},
      },
      {
        onSuccess: (response) => {
          setSessionId(response.sessionId);
          const questions: Question[] = response.questions.map((q: any) => ({
            id: q.id,
            type: q.type,
            question: q.question,
            options: q.type === "multiple-select" ? q.options : undefined,
            correctAnswer: 0,
            difficulty: q.difficulty,
            minLength: q.type === "essay" ? q.minLength : undefined,
            maxLength: q.type === "essay" ? q.maxLength : undefined,
          }));
          gameStore.setQuestionsFromAPI(questions);
          gameStore.gameStatus = "playing";
        },
        onError: (error) => {
          console.error("Failed to create session:", error);
        },
      }
    );
  };

  const handleNextQuestion = () => {
    if (sessionId && currentQuestion) {
      const hasAnswer =
        selectedAnswers.length > 0 || essayAnswer.trim().length > 0;

      if (!hasAnswer) return;

      gameStore.saveCurrentAnswer();

      const submissionData: SubmissionData = {
        questionId: String(currentQuestion.id),
      };

      if (currentQuestion.type === "multiple-select") {
        submissionData.selectedOptions = selectedAnswers;
      } else if (currentQuestion.type === "essay") {
        submissionData.text = essayAnswer;
      }

      submitAnswer.mutate(
        {
          sessionId,
          data: submissionData,
        },
        {
          onSuccess: (response) => {
            if ("pointsEarned" in response) {
              const isCorrect = response.status === "correct";
              gameStore.updateAnswerResult(
                currentQuestion.id,
                isCorrect,
                response.pointsEarned
              );
            }
            gameStore.nextQuestion();
            setEssayAnswer("");
          },
          onError: (error) => {
            console.error("Failed to submit answer:", error);
            gameStore.nextQuestion();
            setEssayAnswer("");
          },
        }
      );
    }
  };

  const handleFinishGame = () => {
    if (sessionId && currentQuestion) {
      const hasAnswer =
        selectedAnswers.length > 0 || essayAnswer.trim().length > 0;

      if (!hasAnswer) return;

      gameStore.saveCurrentAnswer();

      const submissionData: SubmissionData = {
        questionId: String(currentQuestion.id),
      };

      if (currentQuestion.type === "multiple-select") {
        submissionData.selectedOptions = selectedAnswers;
      } else if (currentQuestion.type === "essay") {
        submissionData.text = essayAnswer;
      }

      submitAnswer.mutate(
        {
          sessionId,
          data: submissionData,
        },
        {
          onSuccess: (response) => {
            if ("pointsEarned" in response) {
              const isCorrect = response.status === "correct";
              gameStore.updateAnswerResult(
                currentQuestion.id,
                isCorrect,
                response.pointsEarned
              );
            }

            submitSession.mutate(
              { sessionId },
              {
                onSuccess: (response) => {
                  console.log("Session completed:", response);
                  gameStore.finishGame();
                },
                onError: (error) => {
                  console.error("Failed to submit session:", error);
                  gameStore.finishGame();
                },
              }
            );
          },
          onError: (error) => {
            console.error("Failed to submit answer:", error);
            submitSession.mutate(
              { sessionId },
              {
                onSuccess: () => gameStore.finishGame(),
                onError: () => gameStore.finishGame(),
              }
            );
          },
        }
      );
    } else if (sessionId) {
      submitSession.mutate(
        { sessionId },
        {
          onSuccess: (response) => {
            console.log("Session completed:", response);
            gameStore.finishGame();
          },
          onError: (error) => {
            console.error("Failed to submit session:", error);
            gameStore.finishGame();
          },
        }
      );
    } else {
      gameStore.finishGame();
    }
  };

  if (gameStatus === "idle") {
    return (
      <StartScreen
        onStart={handleStartGame}
        isLoading={createSession.isPending}
      />
    );
  }

  if (gameStatus === "finished") {
    return <FinishScreen />;
  }

  if (!currentQuestion) return null;

  return (
    <QuizScreen
      currentQuestion={currentQuestion}
      essayAnswer={essayAnswer}
      onEssayAnswerChange={setEssayAnswer}
      onNext={handleNextQuestion}
      onFinish={handleFinishGame}
      isSubmitting={submitAnswer.isPending || submitSession.isPending}
    />
  );
});

export default Task4;
