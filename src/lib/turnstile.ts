// ============================================================
// M1 AUTH-106 — Cloudflare Turnstile 人机校验(服务端)。
//
// env 门控(与 AUTH-105 的 GitHub 登录同一套路):未配置 TURNSTILE_SECRET_KEY 时
// 整体休眠 —— 注册流程不受影响,配好密钥填入 Vercel 即自动生效。
//
// 失败姿态:
// - 明确 success:false(令牌无效/过期/重放)→ **拒绝**;
// - 网络异常 / 5xx / 超时 → **放行 + 大声打日志**:第三方抖动不该让注册整体不可用。
//   若日后想收紧为 fail-closed,把 catch 里的 ok:true 改成 ok:false 即可。
// ============================================================

const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const TIMEOUT_MS = 5000;

export function turnstileEnabled(): boolean {
  return Boolean(process.env.TURNSTILE_SECRET_KEY);
}

export type TurnstileResult =
  | { ok: true; skipped: boolean }
  | { ok: false; reason: "missing" | "invalid" };

export async function verifyTurnstile(
  token: string | null | undefined,
  ip?: string | null,
): Promise<TurnstileResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return { ok: true, skipped: true };

  const response = typeof token === "string" ? token.trim() : "";
  if (!response) return { ok: false, reason: "missing" };

  try {
    const res = await fetch(SITEVERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret,
        response,
        ...(ip ? { remoteip: ip } : {}),
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!res.ok) {
      console.error(`[turnstile] siteverify HTTP ${res.status}, failing open`);
      return { ok: true, skipped: true };
    }

    const data = (await res.json()) as { success?: boolean; "error-codes"?: string[] };
    if (data.success === true) return { ok: true, skipped: false };

    // 令牌无效 / 过期 / 重复使用 —— 真失败,必须挡
    console.warn(`[turnstile] rejected: ${(data["error-codes"] ?? ["unknown"]).join(",")}`);
    return { ok: false, reason: "invalid" };
  } catch (err) {
    console.error(
      "[turnstile] siteverify unreachable, failing open:",
      err instanceof Error ? err.message : String(err),
    );
    return { ok: true, skipped: true };
  }
}
