import { defineConfig } from "drizzle-kit";

// M1 INF-001 — Drizzle 迁移配置
// DATABASE_URL 缺省值仅供 drizzle-kit generate(离线生成 SQL)使用;
// migrate 与实际连接必须使用真实 DATABASE_URL(决策 D4:海外区域 Neon / Supabase)。
export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgresql://user:pass@localhost:5432/ebank_ai",
  },
});
