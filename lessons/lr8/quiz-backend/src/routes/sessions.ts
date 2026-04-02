// декларация типов для TypeScript
declare module "hono" {
  interface ContextVariableMap {
    user: any;
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
 * - sessionId, userId, status, mode
 * - questions: список вопросов для прохождения (без правильных ответов)
 * - totalQuestions, answeredCount, maxScore, currentScore
 * - createdAt, expiresAt
 */
sessionsRoute.post("/", async (c) => {
  const user = c.get("user");

  try {
    // 1. Получаем параметры из тела запроса
    const body = await c.req.json();
    const { categoryIds, difficulty, questionCount } = body;

    // 2. Строим фильтр для вопросов
    const where: any = {};
    if (categoryIds?.length) {
      where.categoryId = { in: categoryIds };
    }
    if (difficulty) {
      where.difficulty = difficulty;
    }

    // 3. Получаем вопросы с фильтром
    const questions = await prisma.question.findMany({
      where,
      include: {
        category: true,
      },
      take: questionCount || undefined,
      orderBy: {
        createdAt: "asc",
      },
    });

    if (questions.length === 0) {
      return c.json({ error: "No questions available" }, 400);
    }

    // 4. Создаём сессию
    const session = await sessionService.createSession(user.id, 60);

    // 5. Считаем максимальный балл
    const maxScore = questions.reduce((sum, q) => sum + q.points, 0);

    // 6. Подготавливаем вопросы для клиента (без правильных ответов)
    const questionsForClient = questions.map((question) => ({
      id: question.id,
      text: question.text,
      type: question.type,
      difficulty: question.difficulty || "medium",
      category: {
        id: question.category.id,
        name: question.category.name,
        slug: question.category.slug,
      },
      points: question.points,
    }));

    // 7. Возвращаем ответ в формате OpenAPI
    return c.json({
      sessionId: session.id,
      userId: user.id,
      status: session.status,
      mode: "battle",
      questions: questionsForClient,
      totalQuestions: questions.length,
      answeredCount: 0,
      maxScore: maxScore,
      currentScore: 0,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
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

    // Определяем статус ответа
    let status = "pending";
    if (answer.score !== null) {
      if (answer.isCorrect === true) {
        status = "correct";
      } else if (answer.score === 0) {
        status = "incorrect";
      } else {
        status = "partial";
      }
    }

    // Получаем вопрос, чтобы узнать maxPoints
    const question = await prisma.question.findUnique({
      where: { id: questionId },
    });

    // Возвращаем ответ в формате OpenAPI
    return c.json({
      answerId: answer.id,
      questionId: answer.questionId,
      status: status,
      pointsEarned: answer.score ?? 0,
      maxPoints: question?.points ?? 0,
    });
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
    // Получаем сессию с ответами
    const session = await sessionService.getSessionWithDetails(
      sessionId,
      user.id,
    );

    // Считаем прогресс
    const answeredCount = session.answers.length;
    const currentScore = session.answers.reduce(
      (sum, a) => sum + (a.score ?? 0),
      0,
    );

    // Получаем все вопросы сессии
    const questionIds = session.answers.map((a) => a.questionId);
    const questions = await prisma.question.findMany({
      where: {
        id: { in: questionIds },
      },
      include: { category: true },
    });

    const maxScore = questions.reduce((sum, q) => sum + q.points, 0);

    // Подготавливаем вопросы для клиента
    const questionsForClient = questions.map((q) => ({
      id: q.id,
      text: q.text,
      type: q.type,
      difficulty: q.difficulty || "medium",
      category: {
        id: q.category.id,
        name: q.category.name,
        slug: q.category.slug,
      },
      points: q.points,
    }));

    // Формируем ответ
    return c.json({
      sessionId: session.id,
      userId: session.userId,
      status: session.status,
      mode: "battle",
      questions: questionsForClient,
      totalQuestions: questions.length,
      answeredCount: answeredCount,
      maxScore: maxScore,
      currentScore: currentScore,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

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

    // Получаем все ответы для подсчёта результатов
    const answers = await prisma.answer.findMany({
      where: { sessionId },
      include: { question: true },
    });

    const totalQuestions = answers.length;
    const maxScore = answers.reduce((sum, a) => sum + a.question.points, 0);
    const earnedScore = answers.reduce((sum, a) => sum + (a.score ?? 0), 0);
    const percentage = maxScore > 0 ? (earnedScore / maxScore) * 100 : 0;

    // Вычисляем время прохождения
    let timeSpent = undefined;
    if (session.completedAt && session.startedAt) {
      timeSpent = Math.floor(
        (session.completedAt.getTime() - session.startedAt.getTime()) / 1000,
      );
    }

    // Формируем ответ
    return c.json({
      sessionId: session.id,
      userId: session.userId,
      status: session.status === "completed" ? "completed" : "partial",
      mode: "battle",
      totalQuestions: totalQuestions,
      answeredQuestions: answers.length,
      score: {
        earned: earnedScore,
        max: maxScore,
        percentage: percentage,
      },
      answers: answers.map((a) => ({
        answerId: a.id,
        questionId: a.questionId,
        status:
          a.score !== null
            ? a.isCorrect
              ? "correct"
              : "incorrect"
            : "pending",
        pointsEarned: a.score,
        maxPoints: a.question.points,
      })),
      completedAt: session.completedAt,
      timeSpent: timeSpent,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return c.json({ error: message }, 400);
  }
});

export default sessionsRoute;
