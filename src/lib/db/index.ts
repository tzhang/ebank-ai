import { Pool } from "pg";
import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { parseDbUrl } from "@/lib/db-url";
import * as schema from "./schema";

// M1 INF-001 — 数据库连接(惰性单例)。
// - 不 import 即不建连:构建阶段(无 DATABASE_URL)与静态页面不受影响;
// - 连接串在首次真正读写时才解析,便于 /api/health 优雅降级(503);
// - SSL 语义与 drizzle.config 共用 parseDbUrl(pooler 证书链自签 → require 不校验);
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
    let cfg;
    try {
      cfg = parseDbUrl(url);
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
