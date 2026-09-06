import { Pool } from "pg";
import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

// M1 INF-001 — 数据库连接(惰性单例)。
// - 不 import 即不建连:构建阶段(无 DATABASE_URL)与静态页面不受影响;
// - 连接串在首次真正读写时才解析,便于 /api/health 优雅降级(503);
// - max: 1 — 控制 Serverless 并发实例对免费档数据库的连接占用,后续按需调大。
let pool: Pool | undefined;
let db: NodePgDatabase<typeof schema> | undefined;

export function getPool(): Pool {
  if (!pool) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error(
        "DATABASE_URL 未配置:复制 .env.example 为 .env 并填写(决策 D4:Neon / Supabase 海外区域)",
      );
    }
    // 拆解 URL 逐字段构造,避免 pg「connectionString 的 sslmode 覆盖代码 ssl 配置」
    // 的合并行为(Supabase pooler 证书链自签 → sslmode=require 语义 = 加密但不校验)
    let cfg: {
      host: string;
      port: number;
      user: string;
      password: string;
      database: string;
      ssl?: { rejectUnauthorized: false } | false;
    };
    try {
      const u = new URL(url);
      const sslmode = u.searchParams.get("sslmode");
      cfg = {
        host: u.hostname,
        port: Number(u.port || 5432),
        user: decodeURIComponent(u.username),
        password: decodeURIComponent(u.password),
        database: u.pathname.replace(/^\//, ""),
        ssl: sslmode === "disable" ? false : { rejectUnauthorized: false },
      };
    } catch (err) {
      throw new Error(`DATABASE_URL 解析失败: ${err instanceof Error ? err.message : String(err)}`);
    }
    pool = new Pool({ ...cfg, max: 1 });
    // 空闲客户端错误(如 DB 重启)不崩进程,由后续请求重新连接
    pool.on("error", (err) => {
      console.error("[db] idle client error:", err.message);
    });
  }
  return pool;
}

export function getDb(): NodePgDatabase<typeof schema> {
  if (!db) {
    db = drizzle(getPool(), { schema });
  }
  return db;
}
