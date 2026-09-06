// 数据库连接串解析(运行时代码与 drizzle.config 共用)。
// 背景:pg 新语义把 sslmode=require 当 verify-full,而 Supabase pooler 证书链自签
// → 统一按 libpq 语义处理:require = 加密但不校验证书链;disable = 不加密。
export function parseDbUrl(url: string): {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  ssl: { rejectUnauthorized: false } | false | undefined;
} {
  const u = new URL(url);
  const sslmode = u.searchParams.get("sslmode");
  return {
    host: u.hostname,
    port: Number(u.port || 5432),
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    database: u.pathname.replace(/^\//, ""),
    ssl: sslmode === "disable" ? false : { rejectUnauthorized: false },
  };
}
