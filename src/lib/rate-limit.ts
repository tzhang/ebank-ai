import { createHash } from "node:crypto";
import { lt, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { rateLimits } from "@/lib/db/schema";

// ============================================================
// M1 AUTH-106 + NFR-302 — 频率限制原语(定点窗口 + Postgres 原子自增)。
//
// 设计要点:
// - 存储复用全站唯一数据层(INF-001),不引入 Redis 等第二数据源;
// - 标识符(IP / 邮箱)以 sha256(pepper|scope|identifier) 落库,不留明文(PIPL 最小化);
// - 单条 INSERT ... ON CONFLICT DO UPDATE ... RETURNING 原子自增,多实例并发无竞态;
// - 失败姿态:存储不可用 → 放行(fail-open)并大声打日志。下游操作本就要读写同一个库,
//   限流不该成为新的单点;迁移尚未执行时也不能打挂注册。
// - pepper 取 AUTH_SECRET:轮换密钥等价于计数清零(可接受,勿依赖计数的长期连续性)。
// ============================================================

export type RateLimitPolicy = { scope: string; limit: number; windowSec: number };

/** 策略表:阈值按「档位」取整,改这里即可调整,无需环境变量(与 MAIL_MODE 同姿态)。 */
export const POLICIES = {
  registerIp: { scope: "register:ip", limit: 10, windowSec: 3600 },
  registerEmail: { scope: "register:email", limit: 3, windowSec: 3600 },
  loginIp: { scope: "login:ip", limit: 20, windowSec: 900 },
  loginEmail: { scope: "login:email", limit: 10, windowSec: 900 },
  resetEmail: { scope: "reset:email", limit: 3, windowSec: 3600 },
  resetIp: { scope: "reset:ip", limit: 10, windowSec: 3600 },
  resendEmail: { scope: "resend:email", limit: 3, windowSec: 3600 },
  resendIp: { scope: "resend:ip", limit: 10, windowSec: 3600 },
} as const satisfies Record<string, RateLimitPolicy>;

export type RateLimitResult =
  | { ok: true; remaining: number }
  | { ok: false; retryAfterSec: number };

/** 本地压测 / 调试用总开关(与 MAIL_MODE=log 同一姿态)。 */
export function rateLimitDisabled(): boolean {
  const v = process.env.RATE_LIMIT_DISABLED;
  return v === "1" || v === "true";
}

function pepper(): string {
  return process.env.AUTH_SECRET ?? "ebank-ratelimit-dev-pepper";
}

/** 标识符 → 不透明 key(确定性:同一 scope+标识符恒定同 key);标识符统一 trim + 小写。 */
export function rateLimitKey(scope: string, identifier: string): string {
  const normalized = identifier.trim().toLowerCase();
  return createHash("sha256").update(`${pepper()}|${scope}|${normalized}`).digest("hex");
}

/** 定点窗口起点:把时间向下取整到窗口边界(纯函数,便于单测)。 */
export function windowStartFor(now: Date, windowSec: number): Date {
  const ms = windowSec * 1000;
  return new Date(Math.floor(now.getTime() / ms) * ms);
}

/** 超限后还需等待的秒数(至少 1 秒,便于 UI 文案)。 */
export function retryAfterSec(now: Date, windowStart: Date, windowSec: number): number {
  const resetAt = windowStart.getTime() + windowSec * 1000;
  return Math.max(1, Math.ceil((resetAt - now.getTime()) / 1000));
}

const MAX_WINDOW_SEC = Math.max(...Object.values(POLICIES).map((p) => p.windowSec));
const PRUNE_PROBABILITY = 0.02;

/** 机会式清理过期行(2% 概率触发,失败不影响主流程)。 */
async function pruneExpired(): Promise<void> {
  if (Math.random() >= PRUNE_PROBABILITY) return;
  try {
    const cutoff = new Date(Date.now() - MAX_WINDOW_SEC * 1000);
    await getDb().delete(rateLimits).where(lt(rateLimits.windowStart, cutoff));
  } catch (err) {
    console.error("[rate-limit] prune failed:", err instanceof Error ? err.message : String(err));
  }
}

/**
 * 消费一次配额(计数 +1 并判定)。
 * 语义:计数**先加后判**,因此第 limit+1 次请求被拒;窗口内被拒的请求也会继续计数(持续攻击不会等到窗口重置才恢复)。
 */
export async function consume(
  policy: RateLimitPolicy,
  identifier: string,
): Promise<RateLimitResult> {
  if (rateLimitDisabled()) return { ok: true, remaining: policy.limit };

  const now = new Date();
  const windowStart = windowStartFor(now, policy.windowSec);
  try {
    const db = getDb();
    const [row] = await db
      .insert(rateLimits)
      .values({ key: rateLimitKey(policy.scope, identifier), windowStart, count: 1 })
      .onConflictDoUpdate({
        target: rateLimits.key,
        set: {
          // 同一窗口内累加;跨窗口(或首次)重置为 1
          count: sql`case when ${rateLimits.windowStart} = ${windowStart} then ${rateLimits.count} + 1 else 1 end`,
          windowStart: sql`${windowStart}`,
        },
      })
      .returning({ count: rateLimits.count });

    await pruneExpired();

    const count = row?.count ?? 1;
    if (count > policy.limit) {
      const wait = retryAfterSec(now, windowStart, policy.windowSec);
      console.warn(
        `[rate-limit] blocked scope=${policy.scope} count=${count}/${policy.limit} retryAfter=${wait}s`,
      );
      return { ok: false, retryAfterSec: wait };
    }
    return { ok: true, remaining: policy.limit - count };
  } catch (err) {
    console.error(
      `[rate-limit] storage unavailable for scope=${policy.scope}, failing open:`,
      err instanceof Error ? err.message : String(err),
    );
    return { ok: true, remaining: policy.limit };
  }
}

/**
 * 一次过多个维度(如 IP + 邮箱)。
 * - 串行执行,两个维度的计数都会被消费(不因前者拦截而漏计后者);
 * - identifier 为 null(如无法解析 IP)时**跳过该维度** —— 见 getClientIp 注释;
 * - 返回被拒维度中等待时间最长者。
 */
export async function consumeAll(
  checks: Array<[RateLimitPolicy, string | null | undefined]>,
): Promise<{ ok: true } | { ok: false; retryAfterSec: number }> {
  let blocked = false;
  let wait = 0;
  for (const [policy, identifier] of checks) {
    if (!identifier) continue;
    const r = await consume(policy, identifier);
    if (!r.ok) {
      blocked = true;
      wait = Math.max(wait, r.retryAfterSec);
    }
  }
  return blocked ? { ok: false, retryAfterSec: wait } : { ok: true };
}

/** 限流文案(分钟向上取整)。 */
export function retryAfterText(sec: number): string {
  return `${Math.max(1, Math.ceil(sec / 60))} 分钟`;
}

/**
 * 取客户端 IP(只信任平台注入的头)。
 * 优先级:x-vercel-forwarded-for → x-real-ip → x-forwarded-for 首跳(Vercel 会覆盖客户端伪造值)。
 * **解析不出时返回 null**:调用方跳过 IP 维度限流 —— 若把未知 IP 归入同一个桶,
 * 一次头缺失就会让全站共享一份配额,宁可少一层防护也不制造可用性事故。
 */
export function getClientIp(headers: Headers): string | null {
  const candidates = [
    headers.get("x-vercel-forwarded-for"),
    headers.get("x-real-ip"),
    headers.get("x-forwarded-for"),
  ];
  for (const raw of candidates) {
    if (!raw) continue;
    const first = raw.split(",")[0]?.trim();
    if (!first) continue;
    // IPv4-mapped IPv6(::ffff:1.2.3.4)→ 归一为 IPv4,避免同一来源产生两个桶
    return first.startsWith("::ffff:") ? first.slice(7) : first;
  }
  return null;
}
