import { NextResponse } from "next/server";
import { and, eq, isNull, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { topics, topicLikes } from "@/lib/db/schema";
import { requireUser } from "@/lib/session";
import { checkUserWritable } from "@/lib/access";

// M1 FRM-133 — 点赞 toggle:登录即可(未登录 401);封禁用户不可操作(ADM-121)。
export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "请先登录" }, { status: 401 });
  const writable = await checkUserWritable(user.id);
  if (!writable.ok) return NextResponse.json({ error: writable.error }, { status: 403 });
  const { id } = await ctx.params;
  const db = getDb();

  const [topic] = await db
    .select({ id: topics.id })
    .from(topics)
    .where(and(eq(topics.id, id), isNull(topics.deletedAt)))
    .limit(1);
  if (!topic) return NextResponse.json({ error: "话题不存在或已删除" }, { status: 404 });

  const [existing] = await db
    .select({ userId: topicLikes.userId })
    .from(topicLikes)
    .where(and(eq(topicLikes.topicId, id), eq(topicLikes.userId, user.id)))
    .limit(1);

  await db.transaction(async (tx) => {
    if (existing) {
      await tx.delete(topicLikes).where(
        and(eq(topicLikes.topicId, id), eq(topicLikes.userId, user.id)),
      );
      await tx
        .update(topics)
        .set({ likeCount: sql`greatest(${topics.likeCount} - 1, 0)` })
        .where(eq(topics.id, id));
    } else {
      await tx.insert(topicLikes).values({ topicId: id, userId: user.id });
      await tx
        .update(topics)
        .set({ likeCount: sql`${topics.likeCount} + 1` })
        .where(eq(topics.id, id));
    }
  });

  const [after] = await db
    .select({ likeCount: topics.likeCount })
    .from(topics)
    .where(eq(topics.id, id))
    .limit(1);
  return NextResponse.json({ liked: !existing, likeCount: after?.likeCount ?? 0 });
}
