// декларация типов для TypeScript
declare module "hono" {
  interface ContextVariableMap {
    user: any; // Или более строгий тип
  }
}
import { Hono } from "hono";
import { sessionService } from "../services/sessionService.js";
import { prisma } from "../db/prisma.js";
import { answerSchema } from "../utils/validation.js";
import { authMiddleware } from "../middleware/auth.js";

const sessionsRoute = new Hono();

// Применяем middleware ко всем маршрутам в этом роутере
sessionsRoute.use("*", authMiddleware);

/**
 * POST /api/sessions - создать новую сессию
 *
 * Возвращает:
 * - session: информация о сессии
 * - questions: список вопросов для прохождения (без правильных ответов)
 */
sessionsRoute.post("/", async (c) => {
  // Пользователь уже в контексте после authMiddleware
  const user = c.get("user");

  try {
    // 1. Получаем все вопросы из базы (с категориями)
    const questions = await prisma.question.findMany({
      include: {
        category: true, // включаем категорию для каждого вопроса
      },
      orderBy: {
        createdAt: "asc", // сортируем по дате создания
      },
    });

    if (questions.length === 0) {
      return c.json({ error: "No questions available" }, 400);
    }

    // 2. Создаём сессию
    const session = await sessionService.createSession(user.id, 60);

    // 3. Подготавливаем вопросы для отправки (скрываем правильные ответы)
    const questionsForClient = questions.map((question) => ({
      id: question.id,
      text: question.text,
      type: question.type,
      category: question.category,
      points: question.points,
      // ❗ НЕ отправляем correctAnswer
    }));

    // 4. Возвращаем сессию + вопросы
    return c.json({
      session: {
        ...session,
        totalQuestions: questions.length,
      },
      questions: questionsForClient,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return c.json({ error: message }, 400);
  }
});

/**
 * POST /api/sessions/:id/answers - добавить ответ
 */
sessionsRoute.post("/:id/answers", async (c) => {
  const sessionId = c.req.param("id");

  try {
    const body = await c.req.json();

    // Валидация через Zod
    const parsed = answerSchema.safeParse(body);

    if (!parsed.success) {
      return c.json(
        {
          error: "Validation failed",
          details: parsed.error.issues,
        },
        400,
      );
    }

    const { questionId, userAnswer } = parsed.data;

    const answer = await sessionService.submitAnswer(
      sessionId,
      questionId,
      userAnswer,
    );

    return c.json({ answer });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return c.json({ error: message }, 400);
  }
});

/**
 * GET /api/sessions/:id - получить сессию с деталями
 */
sessionsRoute.get("/:id", async (c) => {
  const user = c.get("user");
  const sessionId = c.req.param("id");

  try {
    // Сервис сам проверит, принадлежит ли сессия пользователю
    const session = await sessionService.getSessionWithDetails(
      sessionId,
      user.id,
    );

    // Парсим userAnswer из JSON для клиента
    const sessionWithParsed = {
      ...session,
      answers: session.answers.map((answer) => ({
        ...answer,
        userAnswer: answer.userAnswer ? JSON.parse(answer.userAnswer) : null,
        question: {
          ...answer.question,
          correctAnswer: undefined, // Не отправляем правильные ответы
        },
      })),
    };

    return c.json({ session: sessionWithParsed });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    // Определяем статус по сообщению об ошибке
    if (message.includes("not found")) {
      return c.json({ error: message }, 404);
    } else if (message.includes("Unauthorized")) {
      return c.json({ error: message }, 401);
    } else {
      return c.json({ error: message }, 400);
    }
  }
});

/**
 * POST /api/sessions/:id/submit - завершить сессию
 */
sessionsRoute.post("/:id/submit", async (c) => {
  const sessionId = c.req.param("id");

  try {
    const session = await sessionService.submitSession(sessionId);
    return c.json({ session });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return c.json({ error: message }, 400);
  }
});

export default sessionsRoute;
