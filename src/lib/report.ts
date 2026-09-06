import { and, eq, isNull } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { topics, replies, reports } from "@/lib/db/schema";
import { checkUserWritable } from "@/lib/access";

// M1 FRM-136 — 举报(话题 / 回复)。
// - 登录即可举报(未登录 401);每用户每内容一次(DB 唯一索引兜底);
// - 快照被举报内容,处理时不依赖原文是否仍存在;
// - 队列处理(状态流转 / 删除内容)在 ADM-122(管理后台)。

export type ReportResult =
  | { ok: true }
  | { ok: false; status: 401 | 403 | 404 | 409 | 422; error: string };

const REASON_MAX = 200;

export async function createReport(
  actor: { userId: string },
  raw: { targetType: unknown; targetId: unknown; reason?: unknown },
): Promise<ReportResult> {
  const targetType = raw.targetType;
  const targetId = typeof raw.targetId === "string" ? raw.targetId : "";
  const reason =
    typeof raw.reason === "string" && raw.reason.trim() ? raw.reason.trim().slice(0, REASON_MAX) : null;

  const writable = await checkUserWritable(actor.userId);
  if (!writable.ok) return writable;

  if (targetType !== "topic" && targetType !== "reply") {
    return { ok: false, status: 422, error: "举报对象类型不合法" };
  }
  if (!targetId) return { ok: false, status: 422, error: "缺少举报对象" };

  const db = getDb();
  // 快照:目标必须存在且未删除
  let snapshot: string | null = null;
  if (targetType === "topic") {
    const [t] = await db
      .select({ content: topics.content })
      .from(topics)
      .where(and(eq(topics.id, targetId), isNull(topics.deletedAt)))
      .limit(1);
    snapshot = t?.content ?? null;
  } else {
    const [r] = await db
      .select({ content: replies.content })
      .from(replies)
      .where(and(eq(replies.id, targetId), isNull(replies.deletedAt)))
      .limit(1);
    snapshot = r?.content ?? null;
  }
  if (snapshot === null) return { ok: false, status: 404, error: "举报对象不存在或已删除" };

  try {
    await db.insert(reports).values({
      targetType,
      targetId,
      reporterId: actor.userId,
      reason,
      contentSnapshot: snapshot.slice(0, 2000),
    });
    return { ok: true };
  } catch (err) {
    // 唯一索引(reporter_id, target_type, target_id)冲突 = 重复举报
    const cause = (err as { cause?: { code?: unknown } })?.cause;
    if (cause?.code === "23505") {
      return { ok: false, status: 409, error: "已举报过该内容" };
    }
    throw err;
  }
}
