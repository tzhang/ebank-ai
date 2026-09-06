import { createHash, randomBytes } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { users, verificationTokens } from "@/lib/db/schema";

// ============================================================
// M1 AUTH-102/104 — 邮件发送 + 验证/重置 token 全流程。
// 传输层:MAIL_MODE=log 时仅打印(本地开发/离线);默认走 Resend API。
// 发件人:RESEND_FROM(默认 onboarding@resend.dev,沙箱期仅可发至账号本人;
//   自建域名后设 no-reply@<域名> 并完成 DNS 验证 → 163/QQ 送达率验收)。
// ============================================================

export function getSiteUrl(): string {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/+$/, "");
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

async function sendMail(input: { to: string; subject: string; html: string }): Promise<{ ok: boolean; error?: string }> {
  if ((process.env.MAIL_MODE ?? "") === "log" || !process.env.RESEND_API_KEY) {
    console.log(`[mail:log] to=${input.to} subject=${input.subject}\n${input.html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").slice(0, 300)}`);
    return { ok: true };
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM || "onboarding@resend.dev",
        to: input.to,
        subject: input.subject,
        html: input.html,
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return { ok: false, error: `Resend ${res.status}: ${body.slice(0, 200)}` };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

function baseHtml(title: string, bodyHtml: string): string {
  return `<!doctype html><html lang="zh-CN"><body style="margin:0;background:#f2f4f8;font-family:-apple-system,'PingFang SC','Microsoft YaHei',sans-serif;padding:32px 16px">
<div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e4e8ef">
<div style="background:#0b1426;padding:18px 28px;color:#f9cd4e;font-weight:700;letter-spacing:1px">ebank.ai · 金融大模型 × Agent Harness</div>
<div style="padding:28px">
<h1 style="font-size:18px;margin:0 0 12px;color:#1a2a4a">${title}</h1>
${bodyHtml}
<p style="color:#8a93a6;font-size:12px;margin-top:24px">此邮件由 ebank.ai 自动发送,请勿直接回复。如非本人操作,可忽略本邮件。</p>
</div></div></body></html>`;
}

function buttonHtml(url: string, label: string): string {
  return `<p style="margin:20px 0"><a href="${url}" style="display:inline-block;background:linear-gradient(135deg,#f9cd4e,#d4a11e);color:#241b05;text-decoration:none;font-weight:700;padding:12px 26px;border-radius:10px">${label}</a></p>`;
}

// ---------- 验证 token 生命周期(verification_tokens 表,一次性) ----------

function makeToken(): string {
  return randomBytes(32).toString("hex");
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

async function createTokenForEmail(identifier: string, ttlHours: number): Promise<{ token: string }> {
  const db = getDb();
  const token = makeToken();
  const hashed = hashToken(token);
  const expires = new Date(Date.now() + ttlHours * 3600_000);
  // 同一邮箱旧 token 作废(防重放)
  await db.delete(verificationTokens).where(eq(verificationTokens.identifier, identifier));
  await db.insert(verificationTokens).values({ identifier, token: hashed, expires });
  return { token };
}

function linkFor(identifier: string, token: string, path: string): string {
  return `${getSiteUrl()}${path}?email=${encodeURIComponent(identifier)}&token=${encodeURIComponent(token)}`;
}

async function consumeToken(
  identifier: string,
  token: string,
  apply: () => Promise<void>,
): Promise<{ ok: boolean; reason?: "invalid" | "expired" }> {
  const db = getDb();
  const [row] = await db
    .select({ expires: verificationTokens.expires })
    .from(verificationTokens)
    .where(and(eq(verificationTokens.identifier, identifier), eq(verificationTokens.token, hashToken(token))))
    .limit(1);
  if (!row) return { ok: false, reason: "invalid" };
  if (row.expires.getTime() < Date.now()) {
    await db.delete(verificationTokens).where(eq(verificationTokens.identifier, identifier));
    return { ok: false, reason: "expired" };
  }
  await apply();
  await db.delete(verificationTokens).where(eq(verificationTokens.identifier, identifier)); // 一次性
  return { ok: true };
}

// ---------- 邮箱验证(AUTH-102):24h 一次性 ----------

export async function sendVerificationEmail(email: string): Promise<{ ok: boolean; error?: string }> {
  const { token } = await createTokenForEmail(email, 24);
  const url = linkFor(email, token, "/verify-email");
  return sendMail({
    to: email,
    subject: "【ebank.ai】验证你的邮箱",
    html: baseHtml(
      "邮箱验证",
      `<p style="color:#4c5a75;line-height:1.8">欢迎注册 ebank.ai!点击下方按钮完成邮箱验证(24 小时内有效,一次性):</p>${buttonHtml(url, "验证邮箱")}
       <p style="color:#8a93a6;font-size:12px">若按钮无法点击,请复制链接到浏览器:${url}</p>`,
    ),
  });
}

export async function verifyEmail(
  email: string,
  token: string,
): Promise<{ ok: boolean; reason?: "invalid" | "expired" }> {
  return consumeToken(email, token, async () => {
    const db = getDb();
    await db
      .update(users)
      .set({ emailVerified: new Date() })
      .where(eq(users.email, email));
  });
}

// ---------- 找回密码(AUTH-104):30 分钟一次性 ----------

export async function sendPasswordResetEmail(email: string): Promise<{ ok: boolean; error?: string }> {
  const { token } = await createTokenForEmail(email, 0.5);
  const url = linkFor(email, token, "/reset-password");
  return sendMail({
    to: email,
    subject: "【ebank.ai】重置密码",
    html: baseHtml(
      "重置密码",
      `<p style="color:#4c5a75;line-height:1.8">我们收到了你的密码重置请求。点击下方按钮设置新密码(30 分钟内有效,一次性):</p>${buttonHtml(url, "重置密码")}
       <p style="color:#8a93a6;font-size:12px">若按钮无法点击,请复制链接到浏览器:${url}</p>`,
    ),
  });
}

/** 校验重置 token 并落新密码(返回过期/无效供页面提示) */
export async function resetPasswordWithToken(
  email: string,
  token: string,
  newPassword: string,
  hashPassword: (pw: string) => Promise<string>,
): Promise<{ ok: boolean; reason?: "invalid" | "expired" }> {
  return consumeToken(email, token, async () => {
    const db = getDb();
    await db
      .update(users)
      .set({ passwordHash: await hashPassword(newPassword), updatedAt: new Date() })
      .where(eq(users.email, email));
  });
}

export type { verificationTokens };
