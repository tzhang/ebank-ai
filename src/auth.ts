import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import { eq } from "drizzle-orm";
import { authConfig } from "@/auth.config";
import { getDb } from "@/lib/db";
import { users, accounts, sessions, verificationTokens } from "@/lib/db/schema";
import { verifyPassword } from "@/lib/password";

// M1 INF-002 + AUTH-101/103/105 — Auth.js v5 完整配置(server-only)。
// - Credentials/GitHub provider 只能在此(带 DB),middleware 用的是 edge-safe 的 auth.config;
// - 会话 JWT 签名于 AUTH_SECRET;30 天单档策略见 AUTH-103;
// - 种子管理员(ADM-120):登录邮箱命中 ADMIN_EMAILS 时提升为 admin(signIn 回调统一处理,
//   jwt 兜底保证首次登录即生效);GitHub 登录仅在 AUTH_GITHUB_ID/SECRET 配置后启用。
function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

function isAdminEmail(email: string): boolean {
  return adminEmails().includes(email.toLowerCase());
}

async function maybePromoteToAdmin(email: string): Promise<boolean> {
  if (!isAdminEmail(email)) return false;
  const db = getDb();
  const [row] = await db
    .update(users)
    .set({ role: "admin" })
    .where(eq(users.email, email))
    .returning({ id: users.id });
  return Boolean(row);
}

const githubProvider =
  process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET
    ? GitHub({
        clientId: process.env.AUTH_GITHUB_ID,
        clientSecret: process.env.AUTH_GITHUB_SECRET,
        // 允许同邮箱自动绑定。安全性论证:
        // 1) GitHub 注册即要求邮箱验证——攻击者无法用他人未拥有的邮箱建 GitHub 账号;
        // 2) 站内「未验证」账号本就只读,即便被同名 GitHub 账号绑走也无发布能力;
        // 3) 站内「已验证」账号被绑的前提是攻击者通过 GitHub 的邮箱验证 = 拥有该邮箱,
        //    等价于能直接走找回密码,不构成新增风险面。
        allowDangerousEmailAccountLinking: true,
      })
    : null;

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
    ...(githubProvider ? [githubProvider] : []),
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
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: (user.role === "admin" || isAdminEmail(user.email) ? "admin" : user.role) as
            | "user"
            | "moderator"
            | "admin",
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    // 登录(邮箱密码 / GitHub)统一入口:命中 ADMIN_EMAILS 即提升管理员
    async signIn({ user }) {
      if (user.email && isAdminEmail(user.email)) {
        try {
          await maybePromoteToAdmin(user.email);
        } catch (err) {
          console.error("[auth] admin promote failed:", err);
        }
      }
      return true;
    },
    jwt({ token, user }) {
      // v5 的 JWT 类型不含自定义字段,此处显式窄化(类型增强对 "next-auth/jwt" 合并不可靠)
      const t = token as { id?: string; role?: "user" | "moderator" | "admin"; email?: string | null };
      if (user) {
        t.id = user.id;
        t.role = (user.role as "user" | "moderator" | "admin") ?? "user";
      }
      // 管理员兜底:即使首次登录 token 未带 admin,命中名单即提升
      if (t.email && isAdminEmail(t.email)) t.role = "admin";
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
