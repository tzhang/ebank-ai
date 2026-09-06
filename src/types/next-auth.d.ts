import type { DefaultSession } from "next-auth";

// Auth.js 会话类型增强:注入 id 与 role(schema users.role,ADM-120)
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "user" | "moderator" | "admin";
    } & DefaultSession["user"];
  }
  interface User {
    role?: "user" | "moderator" | "admin";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: "user" | "moderator" | "admin";
  }
}
