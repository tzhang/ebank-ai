import { auth } from "@/auth";

// M1 INF-002 — 服务端会话守卫。
// Route handlers / Server Actions 用法:
//   const user = await requireUser();
//   if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });
// 角色校验(ADM-120 起)在 requireUser 之上叠加 requireRole。
export async function requireUser() {
  const session = await auth();
  return session?.user ?? null;
}
