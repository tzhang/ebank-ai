import { auth } from "@/auth";

// M1 INF-002 — 服务端会话守卫。
// Route handlers / Server Actions 用法:
//   const user = await requireUser();
//   if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });
// 管理能力(ADM-120):const staff = await requireRole("moderator", "admin");
export async function requireUser() {
  const session = await auth();
  return session?.user ?? null;
}

export type Role = "user" | "moderator" | "admin";

export async function requireRole(...roles: Role[]) {
  const user = await requireUser();
  if (!user) return null;
  if (roles.length > 0 && !roles.includes(user.role)) return null;
  return user;
}
