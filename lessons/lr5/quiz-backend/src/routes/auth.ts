import "dotenv/config";
import { Hono } from "hono";
import { PrismaClient } from "@prisma/client";
import { sign, verify } from "hono/jwt";
import { codeSchema } from "../utils/validation";

const auth = new Hono();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "mysecretkey123";

auth.post("/github/callback", async (c) => {
  const body = await c.req.json();
  const { code } = codeSchema.parse(body);

  let userData: { id: string; email: string; name?: string; githubId: string };

  if (code.startsWith("test_")) {
    userData = {
      id: "test-user-id",
      email: "test@example.com",
      name: "Test User",
      githubId: "test_github_id",
    };
  } else {
    return c.json(
      { error: "Real GitHub OAuth not implemented, use test_ code" },
      400,
    );
  }

  const user = await prisma.user.upsert({
    where: { githubId: userData.githubId },
    update: { email: userData.email, name: userData.name },
    create: {
      email: userData.email,
      name: userData.name,
      githubId: userData.githubId,
    },
  });

  const payload = {
    userId: user.id,
    email: user.email,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
  };
  const token = await sign(payload, JWT_SECRET, "HS256");

  return c.json({ token, user });
});

auth.get("/me", async (c) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const token = authHeader.split(" ")[1];
  try {
    const payload = (await verify(token, JWT_SECRET, "HS256")) as {
      userId: string;
    };
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });
    if (!user) return c.json({ error: "User not found" }, 404);
    return c.json({ user });
  } catch {
    return c.json({ error: "Invalid token" }, 401);
  }
});

export default auth;
