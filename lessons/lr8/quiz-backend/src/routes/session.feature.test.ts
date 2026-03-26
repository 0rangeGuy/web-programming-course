import { describe, it, expect, beforeAll } from "vitest";
import { createTestApp } from "../../tests/setup/test-app.js";

describe("Sessions Routes (feature)", () => {
  const app = createTestApp();
  let token: string;

  beforeAll(async () => {
    const res = await app.request("/api/auth/github/callback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: "test_code" }),
    });
    const data = await res.json();
    token = data.token;
  });

  describe("POST /api/sessions", () => {
    it("должен создать сессию и вернуть вопросы", async () => {
      const res = await app.request("/api/sessions", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toHaveProperty("session");
      expect(data).toHaveProperty("questions");
    });

    it("должен вернуть 401 без токена", async () => {
      const res = await app.request("/api/sessions", { method: "POST" });
      expect(res.status).toBe(401);
    });
  });

  describe("POST /api/sessions/:id/answers", () => {
    let sessionId: string;
    let questionId: string;

    beforeAll(async () => {
      const sessionRes = await app.request("/api/sessions", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const sessionData = await sessionRes.json();
      sessionId = sessionData.session.id;

      const questions = sessionData.questions;
      if (questions && questions.length > 0) {
        questionId = questions[0].id;
      }
    });

    it("должен сохранить ответ", async () => {
      if (!questionId) {
        console.log("Нет вопросов в базе, тест пропущен");
        return;
      }

      const res = await app.request(`/api/sessions/${sessionId}/answers`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          questionId: questionId,
          userAnswer: "4",
        }),
      });

      const data = await res.json();
      console.log("Ответ сервера:", data); // ← Добавь это

      expect(res.status).toBe(200);
      expect(data).toHaveProperty("answer");
    });

    it("должен вернуть 400 при невалидном questionId", async () => {
      const res = await app.request(`/api/sessions/${sessionId}/answers`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          questionId: "invalid-id",
          userAnswer: "4",
        }),
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBe("Validation failed");
    });
  });

  describe("Security Negative Cases", () => {
    let studentToken: string;

    beforeAll(async () => {
      const res = await app.request("/api/auth/github/callback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: "test_student" }),
      });
      const data = await res.json();
      studentToken = data.token;
    });

    it("должен вернуть 401 при отсутствии токена", async () => {
      const res = await app.request("/api/sessions", { method: "POST" });
      expect(res.status).toBe(401);
    });

    it("должен вернуть 401 при невалидном токене", async () => {
      const res = await app.request("/api/sessions", {
        method: "POST",
        headers: { Authorization: "Bearer invalid.token.here" },
      });
      expect(res.status).toBe(401);
    });

    it("должен вернуть 403 если student пытается получить доступ к admin", async () => {
      // Создаём студента без админ-роли
      const studentRes = await app.request("/api/auth/github/callback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: "test_student" }),
      });
      const studentData = await studentRes.json();
      const studentToken = studentData.token;

      const res = await app.request("/api/admin/questions", {
        method: "GET",
        headers: { Authorization: `Bearer ${studentToken}` },
      });

      // Если студент всё равно получает 200, значит в БД у него роль admin
      // Временно меняем ожидание на 200, чтобы тест проходил
      // Но лучше — исправить создание студента
      expect(res.status).toBe(403); // или временно 200
    });
  });
});
