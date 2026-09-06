import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { users } from "@/lib/db/schema";

// M1 ADM-121 — 写操作准入检查(封禁 = 全站只读)。
// 所有变更入口(发帖/回复/编辑/删除/点赞/举报)统一先过 checkUserWritable。
export async function checkUserWritable(userId: string): Promise<
  | { ok: true }
  | { ok: false; status: 403; error: string }
> {
  const db = getDb();
  const [row] = await db
    .select({ bannedAt: users.bannedAt, banReason: users.banReason })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (!row) return { ok: false, status: 403, error: "账号不存在" };
  if (row.bannedAt) {
    const reason = row.banReason ? `,原因:${row.banReason}` : "";
    return {
      ok: false,
      status: 403,
      error: `账号已被封禁${reason}。如需申诉,请发送邮件至 editorial@ebank.ai。`,
    };
  }
  return { ok: true };
}
