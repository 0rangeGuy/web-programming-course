import "dotenv/config";
import { Hono } from "hono";
import auth from "./routes/auth";

const app = new Hono();

app.get("/health", (c) => c.json({ status: "ok" }));
app.route("/api/auth", auth);

export default app;
