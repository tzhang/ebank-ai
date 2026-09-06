"use server";

import { redirect } from "next/navigation";
import { signOut } from "@/auth";
import { requireUser } from "@/lib/session";
import { updateProfile, deleteAccount } from "@/lib/profile";
import { verifyPassword } from "@/lib/password";
import { getDb } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// M1 PROF-110 / NFR-305 — 资料与账号动作。

export type ProfileActionState = { error: string | null };

export async function updateProfileAction(
  _prev: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const user = await requireUser();
  if (!user) return { error: "请先登录" };
  const result = await updateProfile(
    { userId: user.id },
    {
      name: formData.get("name"),
      bio: formData.get("bio"),
      occupationTag: formData.get("occupationTag"),
    },
  );
  if (!result.ok) return { error: result.error.message };
  redirect("/account?ok=1");
}

export async function deleteAccountAction(
  _prev: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const user = await requireUser();
  if (!user) return { error: "请先登录" };
  const confirmEmail = String(formData.get("confirmEmail") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (confirmEmail !== user.email) return { error: "确认邮箱与账号邮箱不一致" };

  const db = getDb();
  const [row] = await db
    .select({ passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);
  if (!row) return { error: "账号不存在" };
  if (!row.passwordHash) {
    return { error: "该账号未设置密码,暂不支持注销(社交登录账号待 #7 后支持)" };
  }
  const ok = await verifyPassword(password, row.passwordHash);
  if (!ok) return { error: "密码错误" };

  const result = await deleteAccount({ userId: user.id, email: user.email });
  if (!result.ok) return { error: result.error };
  // 注销成功后登出并引导(redirect 由 signOut 执行)
  await signOut({ redirectTo: "/login?deleted=1" });
  return { error: null };
}
