"use server";

import { AuthError } from "next-auth";
import { signIn, signOut } from "@/auth";
import { registerUser } from "@/lib/register";

// M1 AUTH-101/103 — 认证服务端动作(供登录/注册页面表单调用)。

export type AuthFormState = { error: string | null };

const toFieldMessage = (field: string, message: string) => `${message}`;

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
  const result = await registerUser({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!result.ok) {
    return { error: toFieldMessage(result.error.field, result.error.message) };
  }
  // 注册成功 → 自动登录
  try {
    await signIn("credentials", {
      email: result.user.email,
      password: String(formData.get("password") ?? ""),
      redirectTo: "/",
    });
    return { error: null };
  } catch (err) {
    if (err instanceof AuthError) {
      return { error: "注册成功,请直接登录" };
    }
    throw err;
  }
}

export async function logoutAction(): Promise<void> {
  await signOut({ redirectTo: "/" });
}
