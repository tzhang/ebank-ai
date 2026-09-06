import Link from "next/link";
import { eq, sql } from "drizzle-orm";
import { requireRole } from "@/lib/session";
import { getDb } from "@/lib/db";
import { reports } from "@/lib/db/schema";

// M1 ADM-120 — 管理后台首页。
// 鉴权:中间件拦未登录(/admin),本页叠加角色校验(moderator / admin)。
export default async function AdminPage() {
  const staff = await requireRole("moderator", "admin");

  if (!staff) {
    return (
      <section className="border-b border-navy-700/50 bg-gradient-to-b from-navy-800 to-navy-900 py-20">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <h1 className="text-2xl font-bold text-white">无权访问</h1>
          <p className="mt-3 text-navy-300">管理后台仅对 moderator / admin 开放。</p>
          <Link href="/" className="mt-6 inline-block text-gold-400 hover:underline">← 返回首页</Link>
        </div>
      </section>
    );
  }

  const db = getDb();
  const [pendingRow] = await db
    .select({ value: sql<number>`count(*)` })
    .from(reports)
    .where(eq(reports.status, "pending"));
  const pending = pendingRow?.value ?? 0;

  const modules = [
    { href: "/admin/users", title: "用户管理", desc: "搜索、封禁 / 解封,操作全程审计", badge: null },
    {
      href: "/admin/content",
      title: "内容管理",
      desc: "置顶 / 加精 / 锁帖 / 删除 / 恢复话题",
      badge: null,
    },
    {
      href: "/admin/reports",
      title: "举报队列",
      desc: "处理举报:删除违规内容或驳回",
      badge: pending,
    },
  ];

  return (
    <section className="min-h-[70vh] border-b border-navy-700/50 bg-gradient-to-b from-navy-800 to-navy-900 py-14">
      <div className="mx-auto w-full max-w-5xl px-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white">管理后台</h1>
            <p className="mt-1 text-sm text-navy-400">
              当前身份:<span className="font-mono text-gold-300">{staff.role}</span> · {staff.email}
            </p>
          </div>
          <Link href="/community" className="text-sm text-navy-400 hover:text-gold-300">← 返回社区</Link>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((m) => (
            <Link
              key={m.href}
              href={m.href}
              className="rounded-xl border border-navy-600/50 bg-navy-800/50 p-5 transition-colors hover:border-gold-500/40"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-white">{m.title}</h2>
                {m.badge != null && m.badge > 0 && (
                  <span className="rounded-full bg-red-500/15 px-2 py-0.5 font-mono text-[11px] text-red-400">
                    {m.badge} 待处理
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm leading-relaxed text-navy-300">{m.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
