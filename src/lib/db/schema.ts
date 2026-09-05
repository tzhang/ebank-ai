import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { randomUUID } from "node:crypto";
import { sql } from "drizzle-orm";

// M1 INF-001 — users 最小集。
// 说明:
// - id 用 randomUUID(应用侧生成),避免依赖数据库扩展,迁移可在任何 PG 上执行;
// - 完整论坛域 schema(role/封禁/资料字段、topics、replies、audit_logs 等)
//   在「M1 数据模型」issue(PRD INF-001 / FRM-130~133 / ADM-120~124)中演进,不在本 issue 范围。

export const users = pgTable("users", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  email: text("email").notNull().unique(),
  // 未验证邮箱的用户不可发帖/回复(AUTH-102),见「M1 AUTH-102」issue
  emailVerified: timestamp("email_verified", { withTimezone: true }),
  // OAuth 账号(AUTH-105)无密码,passwordHash 可空
  passwordHash: text("password_hash"),
  name: text("name"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().default(sql`now()`),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
