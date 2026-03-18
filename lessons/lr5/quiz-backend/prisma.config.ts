import { defineConfig } from "prisma/config";

export default defineConfig({
  earlyAccessFeatures: {
    driverAdapters: ["sqlite"],
  },
  datasource: {
    url: process.env.DATABASE_URL ?? "file:./dev.db",
  },
});
