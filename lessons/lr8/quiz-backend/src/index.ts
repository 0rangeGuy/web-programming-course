import authRoute from "./routes/auth.js";
import sessionsRoute from "./routes/sessions.js";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import "dotenv/config";

const app = new Hono();

app.get("/health", (c) => {
  return c.json({ status: "ok" });
});

app.route("/api/auth", authRoute);
app.route("/api/sessions", sessionsRoute);

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
