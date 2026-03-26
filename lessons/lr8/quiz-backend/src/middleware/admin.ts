import type { Context, Next } from "hono";

/**
 * Middleware для проверки, что пользователь является администратором
 * Должен использоваться после authMiddleware (после проверки JWT)
 */
export const adminMiddleware = async (c: Context, next: Next) => {
  // Получаем пользователя из контекста (должен быть добавлен предыдущим middleware)
  const user = c.get("user");

  if (!user) {
    return c.json({ error: "Unauthorized - no user in context" }, 401);
  }

  // Проверяем роль (должна быть "admin")
  if (user.role !== "admin") {
    return c.json({ error: "Forbidden: Admin access required" }, 403);
  }

  // Если всё ок, идём дальше
  await next();
};
