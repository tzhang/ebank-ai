"use server";

import { AuthError } from "next-auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { signIn, signOut } from "@/auth";
import { consumeAll, getClientIp, POLICIES, retryAfterText } from "@/lib/rate-limit";
import { registerUser } from "@/lib/register";
import { hashPassword, verifyPassword } from "@/lib/password";
import {
  sendPasswordResetEmail,
  sendVerificationEmail,
  resetPasswordWithToken,
} from "@/lib/mail";
import { getDb } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// M1 AUTH-101/102/104/103 — 认证服务端动作(登录/注册/验证/重置)。

export type AuthFormState = { error: string | null; ok?: boolean };

export async function loginAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  try {
    await signIn("credentials", { email, password, redirectTo: "/" });
    return { error: null };
  } catch (err) {
    if (err instanceof AuthError) {
      // AUTH-106:限流由 src/auth.ts 的 authorize 抛 RateLimitedSignin(code=rate_limited),
      // 需与「密码错误」区分提示,否则用户会一直重试。
      const code = (err as { code?: string }).code;
      if (code === "rate_limited") return { error: "尝试过于频繁,请稍后再试" };
      return {
        error:
          err.type === "CredentialsSignin" ? "邮箱或密码错误" : "登录失败,请稍后再试",
      };
    }
    throw err; // redirect 等框架行为必须继续抛出
  }
}

export async function registerAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  if (formData.get("agree") !== "on") {
    return { error: "请先阅读并同意《用户协议》与《隐私政策》" };
  }
  const email = formData.get("email");
  // AUTH-106:反滥用闸门在 registerUser 内统一执行(Turnstile + 限流);
  // Server Action 无 request 对象,IP 取自 next/headers 的请求头。
  const result = await registerUser(
    {
      name: formData.get("name"),
      email,
      password: formData.get("password"),
    },
    {
      ip: getClientIp(await headers()),
      turnstileToken: formData.get("cf-turnstile-response")?.toString() ?? null,
    },
  );
  if (!result.ok) {
    return { error: result.error.message };
  }
  // AUTH-102:注册即触发验证邮件;发送失败不阻塞注册(可在登录页重新发送)
  const sent = await sendVerificationEmail(result.user.email);
  if (!sent.ok) console.error("[mail] 验证邮件发送失败:", sent.error);
  redirect(`/login?registered=1&email=${encodeURIComponent(result.user.email)}`);
}

export async function resendVerificationAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) return { error: "缺少邮箱" };
  // AUTH-106:挡验证邮件轰炸(邮箱维度)+ 批量遍历(IP 维度)
  const limit = await consumeAll([
    [POLICIES.resendEmail, email],
    [POLICIES.resendIp, getClientIp(await headers())],
  ]);
  if (!limit.ok) return { error: `操作过于频繁,请 ${retryAfterText(limit.retryAfterSec)}后再试` };
  const db = getDb();
  const [row] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (!row) return { error: "该邮箱尚未注册" };
  const sent = await sendVerificationEmail(email);
  return { error: null, ok: sent.ok };
}

export async function requestResetAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) return { error: "请填写邮箱" };
  // AUTH-106:挡重置邮件轰炸。限流对「邮箱存在与否」一视同仁,不破坏下方防枚举语义。
  const limit = await consumeAll([
    [POLICIES.resetEmail, email],
    [POLICIES.resetIp, getClientIp(await headers())],
  ]);
  if (!limit.ok) return { error: `操作过于频繁,请 ${retryAfterText(limit.retryAfterSec)}后再试` };
  const db = getDb();
  const [row] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (row) {
    const sent = await sendPasswordResetEmail(email);
    if (!sent.ok) console.error("[mail] 重置邮件发送失败:", sent.error);
  }
  // 防枚举:无论邮箱是否存在都返回同一文案
  return { error: null, ok: true };
}

export async function resetPasswordAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  if (password.length < 10 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return { error: "密码至少 10 位,需同时包含字母与数字" };
  }
  const result = await resetPasswordWithToken(email, token, password, hashPassword);
  if (!result.ok) {
    return { error: result.reason === "expired" ? "链接已过期,请重新申请" : "链接无效,请重新申请" };
  }
  redirect("/login?reset=1");
}

export async function logoutAction(): Promise<void> {
  await signOut({ redirectTo: "/" });
}
