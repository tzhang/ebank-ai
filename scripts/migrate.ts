// 数据库迁移执行器(db:migrate 的落点)。
// 背景:drizzle-kit migrate CLI 在 Supabase supavisor(session pooler)上会
// 连接后卡死无声退出(exit=1 无错误);此处改用 drizzle-orm 官方 migrator,
// 复用与运行时代码一致的连接/SSL 语义(见 src/lib/db-url.ts)。
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { getDb } from "../src/lib/db";

async function main() {
  const db = getDb();
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("migrations applied successfully");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("migrate 失败:", err);
    process.exit(1);
  });
