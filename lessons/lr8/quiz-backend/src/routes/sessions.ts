import { Hono } from "hono";
import { verify } from "hono/jwt";
import { sessionService } from "../services/sessionService.js";
import { prisma } from "../db/prisma.js";

const sessionsRoute = new Hono();

// Типы для HTTP статусов
type AuthError = {
  error: string;
  status: 401 | 500; // Только конкретные статусы
};

/**
 * Вспомогательная функция для проверки JWT и получения пользователя
 */
async function getUserFromToken(c: any): Promise<{ user: any } | AuthError> {
  const authHeader = c.req.header("Authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return { error: "Unauthorized", status: 401 };
  }

  const token = authHeader.slice(7);
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    return { error: "JWT_SECRET not configured", status: 500 };
  }

  try {
    const payload = await verify(token, jwtSecret, "HS256");
    const userId = payload.sub as string;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return { error: "User not found", status: 401 };
    }

    return { user };
  } catch {
    return { error: "Invalid token", status: 401 };
  }
}

/**
 * POST /api/sessions - создать новую сессию
 */
sessionsRoute.post("/", async (c) => {
  // Проверяем авторизацию
  const result = await getUserFromToken(c);
  if ("error" in result) {
    return c.json({ error: result.error }, result.status);
  }
  const user = result.user;

  try {
    // Получаем количество вопросов
    const questionsCount = await prisma.question.count();

    if (questionsCount === 0) {
      return c.json({ error: "No questions available" }, 400);
    }

    // Создаём сессию
    const session = await sessionService.createSession(user.id, 60);

    return c.json({
      session: {
        ...session,
        totalQuestions: questionsCount,
      },
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
  // Проверяем авторизацию
  const result = await getUserFromToken(c);
  if ("error" in result) {
    return c.json({ error: result.error }, result.status);
  }
  const sessionId = c.req.param("id");

  try {
    const body = await c.req.json();
    const { questionId, userAnswer } = body;

    if (!questionId || userAnswer === undefined) {
      return c.json({ error: "questionId and userAnswer are required" }, 400);
    }

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
  // Проверяем авторизацию
  const result = await getUserFromToken(c);
  if ("error" in result) {
    return c.json({ error: result.error }, result.status);
  }
  const user = result.user;
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
  // Проверяем авторизацию
  const result = await getUserFromToken(c);
  if ("error" in result) {
    return c.json({ error: result.error }, result.status);
  }
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
