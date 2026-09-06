import { eq, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { users, verificationTokens } from "@/lib/db/schema";
import { checkUserWritable } from "@/lib/access";
import { OCCUPATIONS } from "@/lib/profile-constants";

// ============================================================
// M1 PROF-110 / NFR-305 — 个人资料与账号注销服务。
// ============================================================

export const BIO_MAX = 200;

export type ProfileResult =
  | { ok: true; profile: Profile }
  | { ok: false; status: 400 | 403 | 404; error: { field: string; message: string } };

export interface Profile {
  id: string;
  name: string | null;
  email: string;
  emailVerified: Date | null;
  occupationTag: string | null;
  bio: string | null;
  role: "user" | "moderator" | "admin";
  createdAt: Date;
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const db = getDb();
  const [row] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      emailVerified: users.emailVerified,
      occupationTag: users.occupationTag,
      bio: users.bio,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return row ? { ...row, role: row.role as Profile["role"] } : null;
}

export async function updateProfile(
  actor: { userId: string },
  raw: { name: unknown; bio: unknown; occupationTag: unknown },
): Promise<ProfileResult> {
  const writable = await checkUserWritable(actor.userId);
  if (!writable.ok)
    return { ok: false, status: 403, error: { field: "form", message: writable.error } };

  const name = typeof raw.name === "string" ? raw.name.trim() : "";
  const bio = typeof raw.bio === "string" ? raw.bio.trim() : "";
  const tag = raw.occupationTag;
  const occupationTag =
    tag === null || tag === undefined || tag === "" || tag === "none"
      ? null
      : (tag as string);

  if (name.length < 2 || name.length > 30) {
    return { ok: false, status: 400, error: { field: "name", message: "昵称需为 2–30 个字符" } };
  }
  if (bio.length > BIO_MAX) {
    return { ok: false, status: 400, error: { field: "bio", message: `简介最多 ${BIO_MAX} 字` } };
  }
  if (occupationTag && !OCCUPATIONS.includes(occupationTag as (typeof OCCUPATIONS)[number])) {
    return { ok: false, status: 400, error: { field: "occupationTag", message: "职业标签不合法" } };
  }

  const db = getDb();
  const [row] = await db
    .update(users)
    .set({
      name,
      bio: bio || null,
      occupationTag,
      updatedAt: new Date(),
    })
    .where(eq(users.id, actor.userId))
    .returning({ id: users.id });
  if (!row) return { ok: false, status: 404, error: { field: "form", message: "账号不存在" } };
  const profile = await getProfile(actor.userId);
  return { ok: true, profile: profile! };
}

/** 账号注销(NFR-305):个人数据删除;audit/report 记录匿名保留(法定留存)。 */
export async function deleteAccount(actor: {
  userId: string;
  email: string;
}): Promise<{ ok: true } | { ok: false; status: 500; error: string }> {
  const db = getDb();
  try {
    // 1) 举报记录匿名化:保留快照,reporterId 置空(不再级联删除)
    await db.execute(sql`
      update reports set reporter_id = null where reporter_id = ${actor.userId}
    `);
    // 2) 邮件验证/重置 token 清理
    await db.delete(verificationTokens).where(eq(verificationTokens.identifier, actor.email));
    // 3) 删除账号:话题/回复/点赞等按外键级联删除(audit 的 actor/handled 引用自动置空)
    await db.delete(users).where(eq(users.id, actor.userId));
    return { ok: true };
  } catch (err) {
    console.error("[deleteAccount]", err);
    return { ok: false, status: 500, error: "注销失败,请稍后再试" };
  }
}
