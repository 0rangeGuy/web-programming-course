import { Hono } from "hono";
import authRoute from "../../src/routes/auth.js";
import sessionsRoute from "../../src/routes/sessions.js";
import adminRoute from "../../src/routes/admin.js";
import { sign } from "hono/jwt";

export const createTestApp = () => {
  const app = new Hono();

  app.get("/health", (c) => c.json({ status: "ok" }));
  app.route("/api/auth", authRoute);
  app.route("/api/sessions", sessionsRoute);
  app.route("/api/admin", adminRoute);

  return app;
};

// Хелпер для генерации тестового токена
export const generateTestToken = async (
  userId: string = "test-user-id",
  role: string = "student",
) => {
  const payload = {
    sub: userId,
    role: role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600, // 1 час
  };
  return await sign(payload, process.env.JWT_SECRET || "test-secret");
};
