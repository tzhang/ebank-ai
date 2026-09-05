import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { getDb } from "@/lib/db";

// M1 INF-001 — 健康检查端点:验证 API 运行时与数据库连通性。
// 验收:DB 故障或 DATABASE_URL 缺失时返回 503 + 可读错误(不泄露连接串)。
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = getDb();
    await db.execute(sql`select 1`);
    return NextResponse.json({
      ok: true,
      db: "up",
      ts: new Date().toISOString(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    // 完整错误进服务端日志;响应体不回显连接串等敏感信息
    console.error("[health] db check failed:", message);
    const hint = !process.env.DATABASE_URL
      ? "DATABASE_URL 未配置"
      : "数据库连接失败(详见服务端日志)";
    return NextResponse.json({ ok: false, db: "down", error: hint }, { status: 503 });
  }
}
