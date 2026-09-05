import type { NextAuthConfig } from "next-auth";

// M1 INF-002 — Edge 安全认证配置(供 middleware 使用)。
// 注意:此文件不得 import 任何 Node 运行时依赖(pg 等)——middleware 跑在 Edge。
// 带数据库 adapter 的完整配置见 src/auth.ts(server-only)。
export const authConfig = {
  session: { strategy: "jwt" },
  // providers 后续 issue 填充:
  // - M1 AUTH-105:GitHub(GitHub({ clientId, clientSecret }))
  // - M1 AUTH-101:Credentials(邮箱密码,见 AUTH issue)
  providers: [],
  callbacks: {
    // 受保护路由清单。当前仅 /admin(ADM-120 起生效);
    // 论坛写操作 API(FRM-130~133)在各自 issue 中用服务端 auth() 校验返回 401。
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      if (pathname.startsWith("/admin")) {
        return Boolean(auth?.user);
      }
      return true; // 其余路径默认公开(未登录可浏览,FRM-137 底线)
    },
  },
} satisfies NextAuthConfig;
