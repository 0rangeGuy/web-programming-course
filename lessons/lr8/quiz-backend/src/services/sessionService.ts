import { PrismaClient } from "@prisma/client";
import { scoringService } from "./scoringService.js";

const prisma = new PrismaClient();

/**
 * Сервис для управления сессиями прохождения тестов
 */
export class SessionService {
  /**
   * Создаёт новую сессию для пользователя
   *
   * @param userId - ID пользователя
   * @param expiresInMinutes - Через сколько минут истекает сессия (по умолчанию 60)
   * @returns Созданная сессия
   */
  async createSession(userId: string, expiresInMinutes: number = 60) {
    // Вычисляем время истечения
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + expiresInMinutes);

    // Создаём сессию
    const session = await prisma.session.create({
      data: {
        userId,
        expiresAt,
        status: "in_progress",
      },
    });

    return session;
  }

  /**
   * Добавляет ответ на вопрос в сессию
   *
   * @param sessionId - ID сессии
   * @param questionId - ID вопроса
   * @param userAnswer - Ответ пользователя
   * @returns Созданный или обновлённый ответ с оценкой
   */
  async submitAnswer(sessionId: string, questionId: string, userAnswer: any) {
    return await prisma.$transaction(async (tx) => {
      // Проверяем сессию
      const session = await tx.session.findUnique({
        where: { id: sessionId },
      });

      if (!session) {
        throw new Error("Session not found");
      }

      if (session.status !== "in_progress") {
        throw new Error("Session is not in progress");
      }

      if (session.expiresAt < new Date()) {
        await tx.session.update({
          where: { id: sessionId },
          data: { status: "expired" },
        });
        throw new Error("Session has expired");
      }

      // Получаем вопрос
      const question = await tx.question.findUnique({
        where: { id: questionId },
      });

      if (!question) {
        throw new Error("Question not found");
      }

      // ВАЖНО: Для разных типов вопросов по-разному сохраняем ответ
      let userAnswerForStorage: string;

      if (question.type === "single-select") {
        // Для single-select сохраняем как простое значение (без JSON.stringify)
        // чтобы в базе было "4", а не "\"4\""
        userAnswerForStorage = String(userAnswer);
      } else if (question.type === "multiple-select") {
        // Для multiple-select сохраняем как JSON строку (массив)
        userAnswerForStorage = JSON.stringify(userAnswer);
      } else {
        // Для essay сохраняем как текст
        userAnswerForStorage = String(userAnswer);
      }

      // Оцениваем ответ
      const { score, isCorrect } = scoringService.scoreQuestion(
        question.type,
        question.correctAnswer,
        userAnswerForStorage, // Передаём уже готовую строку
        question.points,
      );

      // Сохраняем ответ
      const answer = await tx.answer.upsert({
        where: {
          sessionId_questionId: {
            sessionId,
            questionId,
          },
        },
        update: {
          userAnswer: userAnswerForStorage,
          score,
          isCorrect,
        },
        create: {
          sessionId,
          questionId,
          userAnswer: userAnswerForStorage,
          score,
          isCorrect,
        },
      });

      return answer;
    });
  }
  /**
   * Завершает сессию и подсчитывает итоговый балл
   *
   * @param sessionId - ID сессии
   * @returns Обновлённая сессия с итоговым баллом
   */
  async submitSession(sessionId: string) {
    return await prisma.$transaction(async (tx) => {
      // 1. Получаем сессию со всеми ответами
      const session = await tx.session.findUnique({
        where: { id: sessionId },
        include: {
          answers: true,
        },
      });

      if (!session) {
        throw new Error("Session not found");
      }

      if (session.status !== "in_progress") {
        throw new Error("Session is not in progress");
      }

      // 2. Подсчитываем итоговый балл (только по проверенным ответам)
      let totalScore = 0;
      let allGraded = true;

      for (const answer of session.answers) {
        if (answer.score !== null) {
          totalScore += answer.score;
        } else {
          allGraded = false;
        }
      }

      // 3. Обновляем сессию
      const updatedSession = await tx.session.update({
        where: { id: sessionId },
        data: {
          status: allGraded ? "completed" : "in_progress",
          score: totalScore,
          completedAt: allGraded ? new Date() : null,
        },
      });

      return updatedSession;
    });
  }

  /**
   * Получает сессию со всеми ответами и вопросами
   *
   * @param sessionId - ID сессии
   * @param userId - ID пользователя (для проверки прав)
   * @returns Сессия с ответами и вопросами
   */
  async getSessionWithDetails(sessionId: string, userId: string) {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        answers: {
          include: {
            question: true,
          },
        },
      },
    });

    if (!session) {
      throw new Error("Session not found");
    }

    // Проверяем, что сессия принадлежит пользователю
    if (session.userId !== userId) {
      throw new Error("Unauthorized");
    }

    return session;
  }
}

// Экспортируем синглтон
export const sessionService = new SessionService();
