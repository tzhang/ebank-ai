import { pgTable, text, timestamp, integer, boolean, jsonb, primaryKey, index, check } from "drizzle-orm/pg-core";
import { randomUUID } from "node:crypto";
import { sql } from "drizzle-orm";

// ============================================================
// M1 数据模型 — 设计约定:
// - id 一律 randomUUID(应用侧生成),迁移可在任何 PG 上执行;
// - 软删除统一用 deleted_at(置空即恢复),列表查询恒过滤 deleted_at is null;
// - users/accounts/sessions/verification_tokens 对齐 Auth.js Drizzle adapter
//   的列名约定(JS 键名不可改),自有字段可自由追加;
// - audit_logs 仅追加:应用层不提供任何 UPDATE/DELETE 路径(ADM-124)。
// ============================================================

// ---------- 用户 / 认证(Auth.js 约定列 + 自有扩展) ----------
export const users = pgTable("users", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("email_verified", { withTimezone: true }),
  passwordHash: text("password_hash"), // OAuth 账号无密码(AUTH-105)
  name: text("name"), // 昵称
  image: text("image"),
  // --- M1 数据模型扩展 ---
  role: text("role").notNull().default("user"), // user / moderator / admin(ADM-120)
  bio: text("bio"),
  occupationTag: text("occupation_tag"), // 职业标签:银行/券商/保险/量化/开发者/个人投资者(PROF-110)
  bannedAt: timestamp("banned_at", { withTimezone: true }), // 非空即封禁,理由见 banReason(ADM-121)
  banReason: text("ban_reason"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().default(sql`now()`),
}, (t) => [
  check("users_role_check", sql`${t.role} in ('user', 'moderator', 'admin')`),
]);

// Auth.js 标准表(命名与 JS 键名遵循 @auth/drizzle-adapter 约定)
export const accounts = pgTable(
  "accounts",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (t) => [primaryKey({ columns: [t.provider, t.providerAccountId] })],
);

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { withTimezone: true }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { withTimezone: true }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.identifier, t.token] })],
);

// ---------- 论坛域 ----------
export const topics = pgTable(
  "topics",
  {
    id: text("id").primaryKey().$defaultFn(() => randomUUID()),
    authorId: text("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    content: text("content").notNull(), // Markdown,长度上限应用层校验(FRM-130)
    category: text("category").notNull(), // 讨论 / 问答 / 分享 / 资源
    pinned: boolean("pinned").notNull().default(false),
    featured: boolean("featured").notNull().default(false), // 加精
    locked: boolean("locked").notNull().default(false), // 锁帖后禁回复
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    viewCount: integer("view_count").notNull().default(0),
    likeCount: integer("like_count").notNull().default(0), // 冗余计数,源为 topic_likes(FRM-133)
    replyCount: integer("reply_count").notNull().default(0), // 冗余计数,源为 replies
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().default(sql`now()`),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().default(sql`now()`),
  },
  (t) => [
    check("topics_category_check", sql`${t.category} in ('讨论', '问答', '分享', '资源')`),
    index("topics_list_idx").on(t.pinned, t.createdAt), // 列表:置顶在前 + 时间序
    index("topics_category_idx").on(t.category),
  ],
);

export const replies = pgTable(
  "replies",
  {
    id: text("id").primaryKey().$defaultFn(() => randomUUID()),
    topicId: text("topic_id")
      .notNull()
      .references(() => topics.id, { onDelete: "cascade" }),
    authorId: text("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    parentId: text("parent_id"), // 楼中楼:回复某条回复时指向其 id(FRM-131)
    content: text("content").notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().default(sql`now()`),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().default(sql`now()`),
  },
  (t) => [index("replies_topic_idx").on(t.topicId, t.createdAt)],
);

export const topicLikes = pgTable(
  "topic_likes",
  {
    topicId: text("topic_id")
      .notNull()
      .references(() => topics.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().default(sql`now()`),
  },
  (t) => [
    primaryKey({ columns: [t.topicId, t.userId] }), // 每用户每话题一次(toggle 语义,FRM-133)
  ],
);

export const reports = pgTable(
  "reports",
  {
    id: text("id").primaryKey().$defaultFn(() => randomUUID()),
    targetType: text("target_type").notNull(), // topic / reply
    targetId: text("target_id").notNull(),
    reporterId: text("reporter_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    reason: text("reason"),
    contentSnapshot: text("content_snapshot"), // 被举报内容快照,处理时不依赖原文是否已删
    status: text("status").notNull().default("pending"), // pending / resolved / dismissed
    handledById: text("handled_by_id").references(() => users.id, { onDelete: "set null" }),
    handledAt: timestamp("handled_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().default(sql`now()`),
  },
  (t) => [
    check("reports_target_type_check", sql`${t.targetType} in ('topic', 'reply')`),
    check("reports_status_check", sql`${t.status} in ('pending', 'resolved', 'dismissed')`),
    index("reports_queue_idx").on(t.status, t.createdAt), // 举报队列(ADM-122)
  ],
);

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: text("id").primaryKey().$defaultFn(() => randomUUID()),
    actorId: text("actor_id").references(() => users.id, { onDelete: "set null" }), // 管理员操作人;系统动作可空
    action: text("action").notNull(), // 如 ban_user / pin_topic / delete_topic / handle_report
    targetType: text("target_type"),
    targetId: text("target_id"),
    reason: text("reason"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().default(sql`now()`),
    // 注意:无 updated_at — audit_logs 仅追加,应用层禁止 UPDATE/DELETE(ADM-124)
  },
  (t) => [index("audit_logs_actor_idx").on(t.actorId, t.createdAt)],
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Topic = typeof topics.$inferSelect;
export type NewTopic = typeof topics.$inferInsert;
export type Reply = typeof replies.$inferSelect;
export type NewReply = typeof replies.$inferInsert;
