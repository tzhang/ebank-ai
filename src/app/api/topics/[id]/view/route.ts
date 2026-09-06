import { NextResponse } from "next/server";
import { and, eq, isNull, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { topics } from "@/lib/db/schema";

// M1 FRM-133 — 浏览计数(节流在客户端 sessionStorage 做,每会话 5 分钟一次)。
export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const db = getDb();
  const [row] = await db
    .update(topics)
    .set({ viewCount: sql`${topics.viewCount} + 1` })
    .where(and(eq(topics.id, id), isNull(topics.deletedAt)))
    .returning({ viewCount: topics.viewCount });
  if (!row) return NextResponse.json({ error: "话题不存在或已删除" }, { status: 404 });
  return NextResponse.json({ viewCount: row.viewCount });
}
