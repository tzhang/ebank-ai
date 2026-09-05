import { getDb } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { hashPassword } from "@/lib/password";

// M1 AUTH-101 — 邮箱密码注册(路由与服务端动作共用的唯一逻辑入口)。
// 校验失败 / 邮箱占用不抛异常,统一走 RegisterResult 返回值,便于 HTTP 状态映射。

export type RegisterResult =
  | { ok: true; user: { id: string; email: string; name: string | null } }
  | {
      ok: false;
      status: 400 | 409 | 422;
      error: { field: "name" | "email" | "password" | "form"; message: string };
    };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN = 10;

export async function registerUser(raw: {
  name: unknown;
  email: unknown;
  password: unknown;
}): Promise<RegisterResult> {
  const name = typeof raw.name === "string" ? raw.name.trim() : "";
  const email = typeof raw.email === "string" ? raw.email.trim().toLowerCase() : "";
  const password = typeof raw.password === "string" ? raw.password : "";

  if (name.length < 2 || name.length > 30) {
    return { ok: false, status: 422, error: { field: "name", message: "昵称需为 2–30 个字符" } };
  }
  if (!EMAIL_RE.test(email)) {
    return { ok: false, status: 422, error: { field: "email", message: "邮箱格式不正确" } };
  }
  if (password.length < PASSWORD_MIN) {
    return {
      ok: false,
      status: 422,
      error: { field: "password", message: `密码至少 ${PASSWORD_MIN} 位` },
    };
  }
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return {
      ok: false,
      status: 422,
      error: { field: "password", message: "密码需同时包含字母与数字" },
    };
  }

  const db = getDb();
  try {
    const [user] = await db
      .insert(users)
      .values({ name, email, passwordHash: await hashPassword(password) })
      .returning({ id: users.id, email: users.email, name: users.name });
    if (!user) {
      return { ok: false, status: 400, error: { field: "form", message: "注册失败,请重试" } };
    }
    return { ok: true, user };
  } catch (err) {
    // PG 唯一约束冲突(users 唯一索引只有 email):drizzle 会把 pg 错误包装在 err.cause
    const cause = (err as { cause?: { code?: unknown } })?.cause;
    if (cause?.code === "23505") {
      return { ok: false, status: 409, error: { field: "email", message: "该邮箱已注册" } };
    }
    throw err;
  }
}
