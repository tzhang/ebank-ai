import { pgTable, text, timestamp, integer, primaryKey } from "drizzle-orm/pg-core";
import { randomUUID } from "node:crypto";
import { sql } from "drizzle-orm";

// M1 INF-001/002 — 数据模型。
// users 表列名对齐 Auth.js(NextAuth)Drizzle adapter 约定(id/name/email/emailVerified/image),
// 可额外扩展自有字段(passwordHash 等),扩展列不参与 Auth.js 读写。
// 完整论坛域 schema(role/封禁/资料字段、topics、replies、audit_logs 等)
// 在「M1 数据模型」issue(PRD INF-001 / FRM-130~133 / ADM-120~124)中演进。

export const users = pgTable("users", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  email: text("email").notNull().unique(),
  // 未验证邮箱的用户不可发帖/回复(AUTH-102),见「M1 AUTH-102」issue
  emailVerified: timestamp("email_verified", { withTimezone: true }),
  // OAuth 账号(AUTH-105)无密码,passwordHash 可空;Auth.js 侧头像字段为 image
  passwordHash: text("password_hash"),
  name: text("name"),
  image: text("image"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().default(sql`now()`),
});

// Auth.js 标准表(命名与列名遵循 @auth/drizzle-adapter 约定,勿随意改名)
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

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
