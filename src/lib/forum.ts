import { and, eq, isNull, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { topics, replies, users } from "@/lib/db/schema";
import { checkSensitive } from "@/lib/censor";
import {
  CATEGORIES,
  REPLY_CONTENT_MAX,
  TOPIC_CONTENT_MAX,
  TOPIC_TITLE_MAX,
  TOPIC_TITLE_MIN,
  type Category,
} from "@/lib/forum-constants";

// M1 FRM-130/131 — 发帖/回复唯一服务入口(服务端动作与 JSON 路由共用)。
// 门槛:登录 + 邮箱已验证(AUTH-102)+ 敏感词检查(FRM-136 前置)。

export type ForumResult =
  | { ok: true; topicId?: string }
  | { ok: false; status: 401 | 403 | 404 | 422; error: string };

interface Actor {
  userId: string;
}

/** 发帖门槛检查:返回 null 表示通过,否则为拒绝原因 */
async function checkActorCanPost(actor: Actor): Promise<{ ok: true } | { ok: false; status: 403; error: string }> {
  const db = getDb();
  const [row] = await db
    .select({ emailVerified: users.emailVerified })
    .from(users)
    .where(eq(users.id, actor.userId))
    .limit(1);
  if (!row) return { ok: false, status: 403, error: "账号不存在" };
  if (!row.emailVerified) {
    return { ok: false, status: 403, error: "请先验证邮箱后再发布(未验证用户可浏览、不可发布)" };
  }
  return { ok: true };
}

export async function createTopic(
  actor: Actor,
  raw: { title: unknown; content: unknown; category: unknown },
): Promise<ForumResult> {
  const gate = await checkActorCanPost(actor);
  if (!gate.ok) return gate;

  const title = typeof raw.title === "string" ? raw.title.trim() : "";
  const content = typeof raw.content === "string" ? raw.content.trim() : "";
  const category = raw.category as Category;

  if (title.length < TOPIC_TITLE_MIN || title.length > TOPIC_TITLE_MAX) {
    return { ok: false, status: 422, error: `标题需为 ${TOPIC_TITLE_MIN}–${TOPIC_TITLE_MAX} 个字符` };
  }
  if (content.length === 0 || content.length > TOPIC_CONTENT_MAX) {
    return { ok: false, status: 422, error: `正文需为 1–${TOPIC_CONTENT_MAX} 个字符` };
  }
  if (!CATEGORIES.includes(category)) {
    return { ok: false, status: 422, error: "分类不合法" };
  }
  const hit = checkSensitive(title + "\n" + content);
  if (hit.blocked) {
    return { ok: false, status: 422, error: "内容包含违禁词,请修改后重试" };
  }

  const db = getDb();
  const [row] = await db
    .insert(topics)
    .values({ authorId: actor.userId, title, content, category })
    .returning({ id: topics.id });
  if (!row) return { ok: false, status: 422, error: "发布失败,请重试" };
  return { ok: true, topicId: row.id };
}

export async function createReply(
  actor: Actor,
  raw: { topicId: unknown; content: unknown; parentId?: unknown },
): Promise<ForumResult> {
  const gate = await checkActorCanPost(actor);
  if (!gate.ok) return gate;

  const topicId = typeof raw.topicId === "string" ? raw.topicId : "";
  const parentId = typeof raw.parentId === "string" && raw.parentId ? raw.parentId : null;
  const content = typeof raw.content === "string" ? raw.content.trim() : "";

  if (!topicId) return { ok: false, status: 422, error: "缺少话题参数" };
  if (content.length === 0 || content.length > REPLY_CONTENT_MAX) {
    return { ok: false, status: 422, error: `回复需为 1–${REPLY_CONTENT_MAX} 个字符` };
  }
  const hit = checkSensitive(content);
  if (hit.blocked) {
    return { ok: false, status: 422, error: "内容包含违禁词,请修改后重试" };
  }

  const db = getDb();
  const [topic] = await db
    .select({ id: topics.id, locked: topics.locked })
    .from(topics)
    .where(and(eq(topics.id, topicId), isNull(topics.deletedAt)))
    .limit(1);
  if (!topic) return { ok: false, status: 404, error: "话题不存在或已删除" };
  if (topic.locked) return { ok: false, status: 422, error: "话题已锁定,暂不能回复" };

  // 楼中楼:父回复必须存在、属于本话题、且本身是楼层(深度 ≤ 2)
  if (parentId) {
    const [parent] = await db
      .select({ topicId: replies.topicId, parentId: replies.parentId })
      .from(replies)
      .where(and(eq(replies.id, parentId), isNull(replies.deletedAt)))
      .limit(1);
    if (!parent || parent.topicId !== topicId || parent.parentId !== null) {
      return { ok: false, status: 422, error: "回复目标不存在" };
    }
  }

  // 插入回复 + 话题 reply_count 冗余计数,同事务保证一致
  await db.transaction(async (tx) => {
    await tx.insert(replies).values({
      topicId,
      authorId: actor.userId,
      parentId,
      content,
    });
    await tx
      .update(topics)
      .set({ replyCount: sql`${topics.replyCount} + 1` })
      .where(eq(topics.id, topicId));
  });
  return { ok: true };
}

// ============================================================
// M1 FRM-132 — 编辑 / 软删除自己的内容(所有权校验)
// ============================================================

async function assertTopicOwned(actor: Actor, topicId: string) {
  const db = getDb();
  const [t] = await db
    .select({ authorId: topics.authorId })
    .from(topics)
    .where(and(eq(topics.id, topicId), isNull(topics.deletedAt)))
    .limit(1);
  if (!t) return { ok: false as const, status: 404 as const, error: "话题不存在或已删除" };
  if (t.authorId !== actor.userId) {
    return { ok: false as const, status: 403 as const, error: "只能操作自己的话题" };
  }
  return { ok: true as const };
}

export async function updateTopic(
  actor: Actor,
  raw: { topicId: unknown; title: unknown; content: unknown; category: unknown },
): Promise<ForumResult> {
  const topicId = typeof raw.topicId === "string" ? raw.topicId : "";
  const owned = await assertTopicOwned(actor, topicId);
  if (!owned.ok) return owned;

  const title = typeof raw.title === "string" ? raw.title.trim() : "";
  const content = typeof raw.content === "string" ? raw.content.trim() : "";
  const category = raw.category as Category;

  if (title.length < TOPIC_TITLE_MIN || title.length > TOPIC_TITLE_MAX) {
    return { ok: false, status: 422, error: `标题需为 ${TOPIC_TITLE_MIN}–${TOPIC_TITLE_MAX} 个字符` };
  }
  if (content.length === 0 || content.length > TOPIC_CONTENT_MAX) {
    return { ok: false, status: 422, error: `正文需为 1–${TOPIC_CONTENT_MAX} 个字符` };
  }
  if (!CATEGORIES.includes(category)) return { ok: false, status: 422, error: "分类不合法" };
  const hit = checkSensitive(title + "\n" + content);
  if (hit.blocked) return { ok: false, status: 422, error: "内容包含违禁词,请修改后重试" };

  const db = getDb();
  await db
    .update(topics)
    .set({ title, content, category, updatedAt: sql`now()` })
    .where(eq(topics.id, topicId));
  return { ok: true, topicId };
}

export async function deleteTopic(actor: Actor, raw: { topicId: unknown }): Promise<ForumResult> {
  const topicId = typeof raw.topicId === "string" ? raw.topicId : "";
  const owned = await assertTopicOwned(actor, topicId);
  if (!owned.ok) return owned;

  const db = getDb();
  await db
    .update(topics)
    .set({ deletedAt: sql`now()` })
    .where(eq(topics.id, topicId));
  return { ok: true };
}

async function assertReplyOwned(actor: Actor, topicId: string, replyId: string) {
  const db = getDb();
  const [r] = await db
    .select({ authorId: replies.authorId, topicId: replies.topicId })
    .from(replies)
    .where(and(eq(replies.id, replyId), isNull(replies.deletedAt)))
    .limit(1);
  if (!r || r.topicId !== topicId) {
    return { ok: false as const, status: 404 as const, error: "回复不存在或已删除" };
  }
  if (r.authorId !== actor.userId) {
    return { ok: false as const, status: 403 as const, error: "只能操作自己的回复" };
  }
  return { ok: true as const };
}

export async function updateReply(
  actor: Actor,
  raw: { topicId: unknown; replyId: unknown; content: unknown },
): Promise<ForumResult> {
  const topicId = typeof raw.topicId === "string" ? raw.topicId : "";
  const replyId = typeof raw.replyId === "string" ? raw.replyId : "";
  const owned = await assertReplyOwned(actor, topicId, replyId);
  if (!owned.ok) return owned;

  const content = typeof raw.content === "string" ? raw.content.trim() : "";
  if (content.length === 0 || content.length > REPLY_CONTENT_MAX) {
    return { ok: false, status: 422, error: `回复需为 1–${REPLY_CONTENT_MAX} 个字符` };
  }
  const hit = checkSensitive(content);
  if (hit.blocked) return { ok: false, status: 422, error: "内容包含违禁词,请修改后重试" };

  const db = getDb();
  await db
    .update(replies)
    .set({ content, updatedAt: sql`now()` })
    .where(eq(replies.id, replyId));
  return { ok: true };
}

export async function deleteReply(
  actor: Actor,
  raw: { topicId: unknown; replyId: unknown },
): Promise<ForumResult> {
  const topicId = typeof raw.topicId === "string" ? raw.topicId : "";
  const replyId = typeof raw.replyId === "string" ? raw.replyId : "";
  const owned = await assertReplyOwned(actor, topicId, replyId);
  if (!owned.ok) return owned;

  const db = getDb();
  // 软删除 + replyCount 冗余计数回退,同事务保证一致
  await db.transaction(async (tx) => {
    await tx
      .update(replies)
      .set({ deletedAt: sql`now()` })
      .where(eq(replies.id, replyId));
    await tx
      .update(topics)
      .set({ replyCount: sql`greatest(${topics.replyCount} - 1, 0)` })
      .where(eq(topics.id, topicId));
  });
  return { ok: true };
}
