"use client";

import { SessionProvider } from "next-auth/react";

// 客户端会话 Provider:Navbar 等组件经 useSession() 获取登录态。
// 页面本身保持服务端渲染/静态化,不受影响。
export default function AuthProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
