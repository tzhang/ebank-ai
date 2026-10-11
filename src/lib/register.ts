import { getDb } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { hashPassword } from "@/lib/password";
import { consumeAll, POLICIES, retryAfterText } from "@/lib/rate-limit";
import { verifyTurnstile } from "@/lib/turnstile";

// M1 AUTH-101 + AUTH-106 — 邮箱密码注册(路由与服务端动作共用的唯一逻辑入口)。
// 校验失败 / 邮箱占用 / 触发防滥用闸门均不抛异常,统一走 RegisterResult 返回值,便于 HTTP 状态映射。
//
// 闸门顺序(刻意如此):
//   ① Turnstile 人机校验(最便宜的挡机器人手段,且休眠态零成本)
//   ② 字段校验 —— 便宜的纯函数校验,不该白烧用户的限流配额(打错密码不惩罚)
//   ③ 频率限制(邮箱 + IP)—— 只惩罚格式合法的真实尝试
//   ④ 唯一性 + 入库

export type RegisterResult =
  | { ok: true; user: { id: string; email: string; name: string | null } }
  | {
      ok: false;
      status: 400 | 403 | 409 | 422 | 429;
      error: { field: "name" | "email" | "password" | "form"; message: string };
      /** 仅 429:距窗口重置的秒数,供调用方设置 Retry-After */
      retryAfterSec?: number;
    };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN = 10;

/** 请求上下文:反滥用闸门所需。ip 为 null(无法解析)时跳过 IP 维度限流。 */
export type RegisterContext = {
  ip?: string | null;
  turnstileToken?: string | null;
};

export async function registerUser(
  raw: {
    name: unknown;
    email: unknown;
    password: unknown;
  },
  ctx: RegisterContext = {},
): Promise<RegisterResult> {
  const name = typeof raw.name === "string" ? raw.name.trim() : "";
  const email = typeof raw.email === "string" ? raw.email.trim().toLowerCase() : "";
  const password = typeof raw.password === "string" ? raw.password : "";

  // ① 人机校验(TURNSTILE_SECRET_KEY 未配置时休眠放行)
  const captcha = await verifyTurnstile(ctx.turnstileToken, ctx.ip);
  if (!captcha.ok) {
    return {
      ok: false,
      status: 403,
      error: {
        field: "form",
        message:
          captcha.reason === "missing"
            ? "请先完成人机校验"
            : "人机校验未通过,请刷新页面后重试",
      },
    };
  }

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

  // ③ 频率限制:邮箱维度(挡验证邮件轰炸)+ IP 维度(挡批量注册)
  const limit = await consumeAll([
    [POLICIES.registerEmail, email],
    [POLICIES.registerIp, ctx.ip],
  ]);
  if (!limit.ok) {
    return {
      ok: false,
      status: 429,
      error: {
        field: "form",
        message: `操作过于频繁,请 ${retryAfterText(limit.retryAfterSec)}后再试`,
      },
      retryAfterSec: limit.retryAfterSec,
    };
  }

  // ④ 唯一性 + 入库
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
