import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { authConfig } from "@/auth.config";
import { getDb } from "@/lib/db";
import { users, accounts, sessions, verificationTokens } from "@/lib/db/schema";

// M1 INF-002 — Auth.js v5(NextAuth)完整配置(server-only)。
// - adapter 惰性取连接(getDb),不触发即不建连;
// - 会话默认 JWT(AUTH_SECRET 签名);30 天记住我等策略在 AUTH-103 issue 细化。
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: DrizzleAdapter(getDb(), {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
});
