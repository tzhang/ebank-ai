import { defineConfig } from "drizzle-kit";
import { parseDbUrl } from "./src/lib/db-url";

// M1 INF-001 — Drizzle 迁移配置
// DATABASE_URL 缺省值仅供 drizzle-kit generate(离线生成 SQL)使用;
// migrate 与实际连接必须使用真实 DATABASE_URL(决策 D4:海外区域 Neon / Supabase)。
const url = process.env.DATABASE_URL ?? "postgresql://user:pass@localhost:5432/ebank_ai";
const parsed = parseDbUrl(url);

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    host: parsed.host,
    port: parsed.port,
    user: parsed.user,
    password: parsed.password,
    database: parsed.database,
    ssl: parsed.ssl,
  },
});
