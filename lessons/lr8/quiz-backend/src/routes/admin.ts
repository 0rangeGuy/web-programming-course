import { Hono } from "hono";
import { Prisma } from "@prisma/client";
import { authMiddleware } from "../middleware/auth.js";
import { adminMiddleware } from "../middleware/admin.js";
import {
  questionSchema,
  questionUpdateSchema,
  categorySchema,
  gradeSchema,
} from "../utils/validation.js";
import { prisma } from "../db/prisma.js";
import { scoringService } from "../services/scoringService.js";

const adminRoute = new Hono();

// Все admin эндпоинты требуют аутентификации и прав admin
adminRoute.use("*", authMiddleware, adminMiddleware);

// ============= УПРАВЛЕНИЕ КАТЕГОРИЯМИ =============

/**
 * GET /api/admin/categories - получить все категории
 */
adminRoute.get("/categories", async (c) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { questions: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return c.json({ categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return c.json({ error: "Failed to fetch categories" }, 500);
  }
});

/**
 * POST /api/admin/categories - создать категорию
 */
adminRoute.post("/categories", async (c) => {
  try {
    const body = await c.req.json();

    const parsed = categorySchema.safeParse(body);

    if (!parsed.success) {
      return c.json(
        {
          error: "Validation failed",
          details: parsed.error.issues,
        },
        400,
      );
    }

    const category = await prisma.category.create({
      data: parsed.data,
    });

    return c.json({ category });
  } catch (error) {
    console.error("Error creating category:", error);
    return c.json({ error: "Failed to create category" }, 500);
  }
});

/**
 * PUT /api/admin/categories/:id - обновить категорию
 */
adminRoute.put("/categories/:id", async (c) => {
  const id = c.req.param("id");

  try {
    const body = await c.req.json();

    const parsed = categorySchema.partial().safeParse(body);

    if (!parsed.success) {
      return c.json(
        {
          error: "Validation failed",
          details: parsed.error.issues,
        },
        400,
      );
    }

    const category = await prisma.category.update({
      where: { id },
      data: parsed.data,
    });

    return c.json({ category });
  } catch (error) {
    console.error("Error updating category:", error);
    return c.json({ error: "Failed to update category" }, 500);
  }
});

/**
 * DELETE /api/admin/categories/:id - удалить категорию
 */
adminRoute.delete("/categories/:id", async (c) => {
  const id = c.req.param("id");

  try {
    // Проверяем, есть ли вопросы в этой категории
    const questionsCount = await prisma.question.count({
      where: { categoryId: id },
    });

    if (questionsCount > 0) {
      return c.json(
        {
          error: "Cannot delete category with existing questions",
        },
        400,
      );
    }

    await prisma.category.delete({
      where: { id },
    });

    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting category:", error);
    return c.json({ error: "Failed to delete category" }, 500);
  }
});

// ============= УПРАВЛЕНИЕ ВОПРОСАМИ =============

/**
 * GET /api/admin/questions - получить все вопросы с информацией
 * Включает count ответов для каждого вопроса
 */
adminRoute.get("/questions", async (c) => {
  const categoryId = c.req.query("categoryId");
  const page = parseInt(c.req.query("page") || "1");
  const limit = parseInt(c.req.query("limit") || "20");
  const skip = (page - 1) * limit;

  const where: Prisma.QuestionWhereInput = {};
  if (categoryId) {
    where.categoryId = categoryId;
  }

  try {
    // Получаем вопросы с количеством ответов
    const [questions, totalCount] = await Promise.all([
      prisma.question.findMany({
        where,
        include: {
          category: true,
          _count: {
            select: { answers: true },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.question.count({ where }),
    ]);

    return c.json({
      questions,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching questions:", error);
    return c.json({ error: "Failed to fetch questions" }, 500);
  }
});

/**
 * GET /api/admin/questions/:id - получить вопрос по ID
 */
adminRoute.get("/questions/:id", async (c) => {
  const id = c.req.param("id");

  try {
    const question = await prisma.question.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!question) {
      return c.json({ error: "Question not found" }, 404);
    }

    return c.json({ question });
  } catch (error) {
    console.error("Error fetching question:", error);
    return c.json({ error: "Failed to fetch question" }, 500);
  }
});

/**
 * POST /api/admin/questions - создать новый вопрос
 * Валидирует данные
 */
adminRoute.post("/questions", async (c) => {
  try {
    const body = await c.req.json();

    const parsed = questionSchema.safeParse(body);

    if (!parsed.success) {
      return c.json(
        {
          error: "Validation failed",
          details: parsed.error.issues,
        },
        400,
      );
    }

    const { text, type, categoryId, correctAnswer, points } = parsed.data;

    // Преобразуем correctAnswer в строку JSON для хранения в SQLite
    const correctAnswerString = correctAnswer
      ? JSON.stringify(correctAnswer)
      : null;

    const question = await prisma.question.create({
      data: {
        text,
        type,
        categoryId,
        correctAnswer: correctAnswerString || "",
        points,
      },
      include: {
        category: true,
      },
    });

    return c.json({ question });
  } catch (error) {
    console.error("Error creating question:", error);
    return c.json({ error: "Failed to create question" }, 500);
  }
});

/**
 * PUT /api/admin/questions/:id - обновить вопрос
 */
adminRoute.put("/questions/:id", async (c) => {
  const id = c.req.param("id");

  try {
    const body = await c.req.json();

    const parsed = questionUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return c.json(
        {
          error: "Validation failed",
          details: parsed.error.issues,
        },
        400,
      );
    }

    const data: any = { ...parsed.data };

    // Если есть correctAnswer, преобразуем в JSON строку
    if (data.correctAnswer !== undefined) {
      data.correctAnswer = data.correctAnswer
        ? JSON.stringify(data.correctAnswer)
        : null;
    }

    const question = await prisma.question.update({
      where: { id },
      data,
      include: {
        category: true,
      },
    });

    return c.json({ question });
  } catch (error) {
    console.error("Error updating question:", error);
    return c.json({ error: "Failed to update question" }, 500);
  }
});

/**
 * DELETE /api/admin/questions/:id - удалить вопрос
 */
adminRoute.delete("/questions/:id", async (c) => {
  const id = c.req.param("id");

  try {
    // Проверяем, есть ли ответы на этот вопрос
    const answersCount = await prisma.answer.count({
      where: { questionId: id },
    });

    if (answersCount > 0) {
      return c.json(
        {
          error: "Cannot delete question with existing answers",
        },
        400,
      );
    }

    await prisma.question.delete({
      where: { id },
    });

    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting question:", error);
    return c.json({ error: "Failed to delete question" }, 500);
  }
});

// ============= УПРАВЛЕНИЕ ОТВЕТАМИ =============

/**
 * GET /api/admin/answers/pending - получить essay ответы которые не проверены (score = null)
 * Включает информацию о student и session
 */
adminRoute.get("/answers/pending", async (c) => {
  const page = parseInt(c.req.query("page") || "1");
  const limit = parseInt(c.req.query("limit") || "20");
  const skip = (page - 1) * limit;

  try {
    const [answers, totalCount] = await Promise.all([
      prisma.answer.findMany({
        where: {
          score: null, // Непроверенные
          question: {
            type: "essay",
          },
        },
        include: {
          session: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          question: {
            include: {
              category: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "asc" },
      }),
      prisma.answer.count({
        where: {
          score: null,
          question: {
            type: "essay",
          },
        },
      }),
    ]);

    return c.json({
      answers,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching pending answers:", error);
    return c.json({ error: "Failed to fetch pending answers" }, 500);
  }
});

/**
 * POST /api/admin/answers/:id/grade - выставить оценку за essay
 * Использует transaction
 * Если все ответы в сессии проверены → обновить Session score
 */
adminRoute.post("/answers/:id/grade", async (c) => {
  const answerId = c.req.param("id");

  try {
    const body = await c.req.json();

    const parsed = gradeSchema.safeParse(body);

    if (!parsed.success) {
      return c.json(
        {
          error: "Validation failed",
          details: parsed.error.issues,
        },
        400,
      );
    }

    const { grades, rubric = [5, 5, 5] } = parsed.data;

    // Используем транзакцию для атомарности
    const result = await prisma.$transaction(async (tx) => {
      // Получаем ответ
      const answer = await tx.answer.findUnique({
        where: { id: answerId },
        include: {
          session: true,
          question: true,
        },
      });

      if (!answer) {
        throw new Error("Answer not found");
      }

      if (answer.question.type !== "essay") {
        throw new Error("Only essay answers can be graded");
      }

      if (answer.score !== null) {
        throw new Error("Answer already graded");
      }

      // Вычисляем оценку
      const score = scoringService.scoreEssay(grades, rubric);

      // Обновляем ответ
      const updatedAnswer = await tx.answer.update({
        where: { id: answerId },
        data: { score },
      });

      // Проверяем, все ли ответы в сессии проверены
      const sessionAnswers = await tx.answer.findMany({
        where: { sessionId: answer.sessionId },
      });

      const allGraded = sessionAnswers.every((a) => a.score !== null);

      if (allGraded) {
        // Подсчитываем общий балл
        const totalScore = sessionAnswers.reduce(
          (sum, a) => sum + (a.score || 0),
          0,
        );

        // Обновляем сессию
        await tx.session.update({
          where: { id: answer.sessionId },
          data: {
            status: "completed",
            score: totalScore,
            completedAt: new Date(),
          },
        });
      }

      return updatedAnswer;
    });

    return c.json({ answer: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return c.json({ error: message }, 400);
  }
});

// ============= СТАТИСТИКА =============

/**
 * GET /api/admin/students/:userId/stats - получить статистику студента
 * Среднее значение score, количество сессий
 */
adminRoute.get("/students/:userId/stats", async (c) => {
  const userId = c.req.param("userId");

  try {
    // Получаем пользователя
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    // Получаем сессии пользователя
    const sessions = await prisma.session.findMany({
      where: {
        userId,
        status: "completed",
      },
      include: {
        _count: {
          select: { answers: true },
        },
      },
      orderBy: { completedAt: "desc" },
    });

    // Вычисляем статистику
    const completedSessions = sessions.length;
    const averageScore =
      completedSessions > 0
        ? sessions.reduce((sum, s) => sum + (s.score || 0), 0) /
          completedSessions
        : 0;

    // Распределение по категориям
    const categoryStats: Record<
      string,
      { total: number; correct: number; count: number }
    > = {};

    // Получаем все ответы пользователя
    const userAnswers = await prisma.answer.findMany({
      where: {
        session: {
          userId,
        },
      },
      include: {
        question: {
          include: {
            category: true,
          },
        },
      },
    });

    for (const answer of userAnswers) {
      const categoryId = answer.question.categoryId;
      const categoryName = answer.question.category.name;

      if (!categoryStats[categoryId]) {
        categoryStats[categoryId] = {
          total: 0,
          correct: 0,
          count: 0,
        };
      }

      categoryStats[categoryId].count++;
      categoryStats[categoryId].total += answer.question.points;
      if (answer.isCorrect) {
        categoryStats[categoryId].correct += answer.question.points;
      }
    }

    // Получаем названия категорий
    const categoryPerformance = Object.entries(categoryStats).map(
      ([id, stats]) => ({
        id,
        totalQuestions: stats.count,
        totalPoints: stats.total,
        earnedPoints: stats.correct,
        accuracy: stats.total > 0 ? (stats.correct / stats.total) * 100 : 0,
      }),
    );

    return c.json({
      user,
      stats: {
        totalSessions: completedSessions,
        averageScore: parseFloat(averageScore.toFixed(2)),
        totalAnswers: userAnswers.length,
        categoryPerformance,
        recentSessions: sessions.slice(0, 5).map((s) => ({
          id: s.id,
          score: s.score,
          completedAt: s.completedAt,
          answersCount: s._count.answers,
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching student stats:", error);
    return c.json({ error: "Failed to fetch student stats" }, 500);
  }
});

export default adminRoute;
