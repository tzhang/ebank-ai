import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// M1 INF-002 — 中间件:整站流量过 authorized 回调(auth.config.ts)。
// 当前仅 /admin 前缀受保护(未登录重定向登录流程);其余公开。
// 匹配范围默认所有路径,规则内判断,便于后续新增受保护前缀而无需改 matcher。
export default NextAuth(authConfig).auth;

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
