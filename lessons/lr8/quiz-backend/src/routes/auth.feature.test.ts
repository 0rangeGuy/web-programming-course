import { describe, it, expect, vi } from "vitest";
import { createTestApp } from "../../tests/setup/test-app.js";

// Мокаем внешние зависимости
vi.mock("../services/github.js", () => ({
  getGitHubUserByCode: vi.fn().mockResolvedValue({
    id: 123456,
    email: "test@example.com",
    name: "Test User",
  }),
}));

describe("Auth Routes (feature)", () => {
  const app = createTestApp();

  describe("POST /api/auth/github/callback", () => {
    // ✅ Этот тест работает
    it("должен вернуть 400 при пустом коде", async () => {
      const res = await app.request("/api/auth/github/callback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: "" }),
      });
      expect(res.status).toBe(400);
    });

    // скип (требует БД)
    it.skip("должен вернуть токен при валидном коде", async () => {
      const res = await app.request("/api/auth/github/callback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: "test_code" }),
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toHaveProperty("token");
    });
  });
});
