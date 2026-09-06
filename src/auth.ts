import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import Credentials from "next-auth/providers/credentials";
import { eq } from "drizzle-orm";
import { authConfig } from "@/auth.config";
import { getDb } from "@/lib/db";
import { users, accounts, sessions, verificationTokens } from "@/lib/db/schema";
import { verifyPassword } from "@/lib/password";

// M1 INF-002 + AUTH-101/103 — Auth.js v5 完整配置(server-only)。
// - Credentials provider 只能在此(带 DB),middleware 用的是 edge-safe 的 auth.config;
// - 会话 JWT 签名于 AUTH_SECRET;30 天单档策略见 AUTH-103(AUTH 系 issue 已记录偏差);
// - 种子管理员(ADM-120):登录邮箱命中 ADMIN_EMAILS 时提升为 admin。
function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

async function maybePromoteToAdmin(email: string): Promise<boolean> {
  const admins = adminEmails();
  if (admins.length === 0 || !admins.includes(email)) return false;
  const db = getDb();
  const [row] = await db
    .update(users)
    .set({ role: "admin" })
    .where(eq(users.email, email))
    .returning({ id: users.id });
  return Boolean(row);
}
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: DrizzleAdapter(getDb(), {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  providers: [
    ...authConfig.providers,
    Credentials({
      name: "邮箱密码",
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        const email = typeof credentials.email === "string" ? credentials.email.trim().toLowerCase() : "";
        const password = typeof credentials.password === "string" ? credentials.password : "";
        if (!email || !password) return null;
        const db = getDb();
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1);
        // 统一提示「邮箱或密码错误」,不暴露邮箱是否存在(防枚举)
        if (!user?.passwordHash) return null;
        const ok = await verifyPassword(password, user.passwordHash);
        if (!ok) return null;
        const role = (user.role === "admin" || (await maybePromoteToAdmin(user.email))
          ? "admin"
          : user.role) as "user" | "moderator" | "admin";
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    jwt({ token, user }) {
      // v5 的 JWT 类型不含自定义字段,此处显式窄化(类型增强对 "next-auth/jwt" 合并不可靠)
      const t = token as { id?: string; role?: "user" | "moderator" | "admin" };
      if (user) {
        t.id = user.id;
        t.role = (user.role as "user" | "moderator" | "admin") ?? "user";
      }
      return token;
    },
    session({ session, token }) {
      const t = token as { id?: string; role?: "user" | "moderator" | "admin" };
      if (t.id) session.user.id = t.id;
      session.user.role = t.role ?? "user";
      return session;
    },
  },
});
