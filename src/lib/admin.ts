import { and, asc, count, desc, eq, ilike, inArray, isNull, or, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { users, topics, replies, reports } from "@/lib/db/schema";
import { appendAudit } from "@/lib/audit";
import type { Role } from "@/lib/session";

// ============================================================
// M1 ADM-121/122/124 — 管理操作服务(唯一入口;页面/API/动作均经此)。
// 角色约定:查看 = moderator+;封禁/解封 = admin;话题/举报处理 = moderator+。
// 审计:每个变更操作写 appendAudit(仅追加)。
// ============================================================

export type AdminResult =
  | { ok: true }
  | { ok: false; status: 400 | 403 | 404 | 409; error: string };

interface AdminActor {
  userId: string;
  role: Role;
}

const PAGE_SIZE = 20;

// ---------- 用户管理(ADM-121) ----------

export async function listUsers(opts: { search?: string; page?: number; role?: Role }) {
  const db = getDb();
  const q = (opts.search ?? "").trim();
  const conds = [];
  if (q) conds.push(or(ilike(users.name, `%${q}%`), ilike(users.email, `%${q}%`)));
  if (opts.role) conds.push(eq(users.role, opts.role));
  const where = conds.length ? and(...conds) : undefined;
  const page = Math.max(1, opts.page ?? 1);
  const [rows, totalRow] = await Promise.all([
    db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        emailVerified: users.emailVerified,
        bannedAt: users.bannedAt,
        banReason: users.banReason,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(where)
      .orderBy(desc(users.createdAt))
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE),
    db.select({ value: count() }).from(users).where(where),
  ]);
  return { rows, total: totalRow[0]?.value ?? 0, page, pageSize: PAGE_SIZE };
}

export async function setUserBan(
  actor: AdminActor,
  input: { userId: unknown; action: unknown; reason?: unknown },
): Promise<AdminResult> {
  if (actor.role !== "admin") return { ok: false, status: 403, error: "仅管理员可执行封禁操作" };
  const action = input.action;
  const targetId = typeof input.userId === "string" ? input.userId : "";
  const reason = typeof input.reason === "string" ? input.reason.trim() : "";
  if (!targetId) return { ok: false, status: 400, error: "缺少目标用户" };
  if (action !== "ban" && action !== "unban") return { ok: false, status: 400, error: "操作不合法" };
  if (action === "ban" && reason.length < 2) return { ok: false, status: 400, error: "封禁必须填写理由" };
  if (targetId === actor.userId) return { ok: false, status: 400, error: "不能对自己执行此操作" };

  const db = getDb();
  const [target] = await db
    .select({ id: users.id, role: users.role, bannedAt: users.bannedAt })
    .from(users)
    .where(eq(users.id, targetId))
    .limit(1);
  if (!target) return { ok: false, status: 404, error: "用户不存在" };
  if (target.role === "admin") return { ok: false, status: 400, error: "不能封禁管理员账号" };
  if (action === "ban" && target.bannedAt) return { ok: false, status: 409, error: "该用户已被封禁" };
  if (action === "unban" && !target.bannedAt) return { ok: false, status: 409, error: "该用户未被封禁" };

  await db
    .update(users)
    .set(action === "ban" ? { bannedAt: sql`now()`, banReason: reason } : { bannedAt: null, banReason: null })
    .where(eq(users.id, targetId));
  await appendAudit({
    actorId: actor.userId,
    action: action === "ban" ? "ban_user" : "unban_user",
    targetType: "user",
    targetId,
    reason: reason || undefined,
  });
  return { ok: true };
}

// ---------- 话题管理(ADM-122) ----------

const TOPIC_OPS = ["pin", "unpin", "feature", "unfeature", "lock", "unlock", "delete", "restore"] as const;
type TopicOp = (typeof TOPIC_OPS)[number];

export async function listTopicsAdmin(opts: { state?: "active" | "deleted"; page?: number }) {
  const db = getDb();
  const state = opts.state ?? "active";
  const page = Math.max(1, opts.page ?? 1);
  const cond = state === "deleted" ? sql`${topics.deletedAt} is not null` : isNull(topics.deletedAt);
  const [rows, totalRow] = await Promise.all([
    db
      .select({
        id: topics.id,
        title: topics.title,
        category: topics.category,
        pinned: topics.pinned,
        featured: topics.featured,
        locked: topics.locked,
        replyCount: topics.replyCount,
        viewCount: topics.viewCount,
        createdAt: topics.createdAt,
        deletedAt: topics.deletedAt,
        authorName: users.name,
      })
      .from(topics)
      .innerJoin(users, eq(topics.authorId, users.id))
      .where(cond)
      .orderBy(desc(topics.pinned), desc(topics.createdAt))
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE),
    db.select({ value: count() }).from(topics).where(cond),
  ]);
  return { rows, total: totalRow[0]?.value ?? 0, page, pageSize: PAGE_SIZE };
}

export async function topicAdminOp(
  actor: AdminActor,
  input: { topicId: unknown; op: unknown; reason?: unknown },
): Promise<AdminResult> {
  const op = input.op as TopicOp;
  const topicId = typeof input.topicId === "string" ? input.topicId : "";
  if (!TOPIC_OPS.includes(op)) return { ok: false, status: 400, error: "操作不合法" };
  if (!topicId) return { ok: false, status: 400, error: "缺少话题" };
  if (op === "delete" && typeof input.reason === "string" && (input.reason as string).trim().length > 0 && (input.reason as string).trim().length < 2) {
    return { ok: false, status: 400, error: "删除原因至少 2 个字" };
  }
  const reason = typeof input.reason === "string" ? input.reason.trim().slice(0, 200) : "";

  const db = getDb();
  const [topic] = await db.select({ id: topics.id }).from(topics).where(eq(topics.id, topicId)).limit(1);
  if (!topic) return { ok: false, status: 404, error: "话题不存在" };

  const map: Record<TopicOp, { set: Record<string, unknown>; action: string; skipDeleted?: boolean }> = {
    pin: { set: { pinned: true }, action: "pin_topic" },
    unpin: { set: { pinned: false }, action: "unpin_topic" },
    feature: { set: { featured: true }, action: "feature_topic" },
    unfeature: { set: { featured: false }, action: "unfeature_topic" },
    lock: { set: { locked: true }, action: "lock_topic" },
    unlock: { set: { locked: false }, action: "unlock_topic" },
    delete: { set: { deletedAt: sql`now()` }, action: "delete_topic_admin" },
    restore: { set: { deletedAt: null }, action: "restore_topic", skipDeleted: false },
  };
  const m = map[op];
  if (op !== "restore" && op !== "delete") {
    // 软删状态下不可置顶/加精/锁帖
    const [check] = await db
      .select({ deletedAt: topics.deletedAt })
      .from(topics)
      .where(eq(topics.id, topicId))
      .limit(1);
    if (check?.deletedAt) return { ok: false, status: 409, error: "话题已删除,请先恢复" };
  }
  await db.update(topics).set(m.set).where(eq(topics.id, topicId));
  await appendAudit({
    actorId: actor.userId,
    action: m.action,
    targetType: "topic",
    targetId: topicId,
    reason: reason || undefined,
  });
  return { ok: true };
}

export async function deleteReplyAdmin(
  actor: AdminActor,
  input: { topicId: unknown; replyId: unknown; reason?: unknown },
): Promise<AdminResult> {
  const topicId = typeof input.topicId === "string" ? input.topicId : "";
  const replyId = typeof input.replyId === "string" ? input.replyId : "";
  const reason = typeof input.reason === "string" ? input.reason.trim().slice(0, 200) : "";
  if (!topicId || !replyId) return { ok: false, status: 400, error: "缺少参数" };

  const db = getDb();
  const [r] = await db
    .select({ topicId: replies.topicId })
    .from(replies)
    .where(and(eq(replies.id, replyId), isNull(replies.deletedAt)))
    .limit(1);
  if (!r || r.topicId !== topicId) return { ok: false, status: 404, error: "回复不存在或已删除" };

  await db.transaction(async (tx) => {
    await tx.update(replies).set({ deletedAt: sql`now()` }).where(eq(replies.id, replyId));
    await tx
      .update(topics)
      .set({ replyCount: sql`greatest(${topics.replyCount} - 1, 0)` })
      .where(eq(topics.id, topicId));
  });
  await appendAudit({
    actorId: actor.userId,
    action: "delete_reply_admin",
    targetType: "reply",
    targetId: replyId,
    reason: reason || undefined,
  });
  return { ok: true };
}

// ---------- 举报队列(ADM-122) ----------

export async function listReportsAdmin(opts: { state?: "pending" | "handled"; page?: number }) {
  const db = getDb();
  const state = opts.state ?? "pending";
  const page = Math.max(1, opts.page ?? 1);
  const cond = state === "pending" ? eq(reports.status, "pending") : sql`${reports.status} != 'pending'`;
  const [rows, totalRow] = await Promise.all([
    db
      .select({
        id: reports.id,
        targetType: reports.targetType,
        targetId: reports.targetId,
        reason: reports.reason,
        contentSnapshot: reports.contentSnapshot,
        status: reports.status,
        createdAt: reports.createdAt,
      })
      .from(reports)
      .where(cond)
      .orderBy(asc(reports.createdAt))
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE),
    db.select({ value: count() }).from(reports).where(cond),
  ]);
  return { rows, total: totalRow[0]?.value ?? 0, page, pageSize: PAGE_SIZE };
}

export async function handleReport(
  actor: AdminActor,
  input: { reportId: unknown; action: unknown; note?: unknown },
): Promise<AdminResult> {
  const reportId = typeof input.reportId === "string" ? input.reportId : "";
  const action = input.action;
  const note = typeof input.note === "string" ? input.note.trim().slice(0, 200) : "";
  if (!reportId) return { ok: false, status: 400, error: "缺少举报记录" };
  if (action !== "resolved" && action !== "dismissed") return { ok: false, status: 400, error: "处理动作不合法" };

  const db = getDb();
  const [report] = await db
    .select({ id: reports.id, status: reports.status, targetType: reports.targetType, targetId: reports.targetId })
    .from(reports)
    .where(eq(reports.id, reportId))
    .limit(1);
  if (!report) return { ok: false, status: 404, error: "举报记录不存在" };
  if (report.status !== "pending") return { ok: false, status: 409, error: "该举报已处理" };

  await db.transaction(async (tx) => {
    if (action === "resolved") {
      if (report.targetType === "topic") {
        await tx
          .update(topics)
          .set({ deletedAt: sql`now()` })
          .where(and(eq(topics.id, report.targetId), isNull(topics.deletedAt)));
      } else {
        const [r] = await tx
          .select({ topicId: replies.topicId })
          .from(replies)
          .where(and(eq(replies.id, report.targetId), isNull(replies.deletedAt)))
          .limit(1);
        if (r) {
          await tx.update(replies).set({ deletedAt: sql`now()` }).where(eq(replies.id, report.targetId));
          await tx
            .update(topics)
            .set({ replyCount: sql`greatest(${topics.replyCount} - 1, 0)` })
            .where(eq(topics.id, r.topicId));
        }
      }
    }
    await tx
      .update(reports)
      .set({ status: action, handledById: actor.userId, handledAt: sql`now()` })
      .where(eq(reports.id, reportId));
  });
  await appendAudit({
    actorId: actor.userId,
    action: action === "resolved" ? "resolve_report" : "dismiss_report",
    targetType: "report",
    targetId: reportId,
    reason: note || undefined,
    metadata: { contentTargetType: report.targetType, contentTargetId: report.targetId },
  });
  return { ok: true };
}

export const ADMIN_PAGE_SIZE = PAGE_SIZE;
