"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn, signOut } from "@/auth";
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
  const email = formData.get("email");
  const result = await registerUser({
    name: formData.get("name"),
    email,
    password: formData.get("password"),
  });
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
