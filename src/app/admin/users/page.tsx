import Link from "next/link";
import { requireRole } from "@/lib/session";
import { listUsers } from "@/lib/admin";
import { formatRelative } from "@/lib/time";
import BanControl from "@/components/admin/BanControl";

// M1 ADM-121 — 用户管理:搜索 / 封禁 / 解封(封禁仅 admin,操作全程审计)。
export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[]; page?: string | string[] }>;
}) {
  const actor = await requireRole("moderator", "admin");
  if (!actor) return <p className="py-20 text-center text-navy-400">无权访问</p>;

  const sp = await searchParams;
  const q = (Array.isArray(sp.q) ? sp.q[0] : sp.q) ?? "";
  const page = Math.max(1, Number.parseInt((Array.isArray(sp.page) ? sp.page[0] : sp.page) ?? "1", 10) || 1);
  const { rows, total, pageSize } = await listUsers({ search: q, page });
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const isAdmin = actor.role === "admin";
  const roleChip: Record<string, string> = {
    admin: "bg-gold-500/15 text-gold-300",
    moderator: "bg-blue-500/10 text-blue-300",
    user: "bg-navy-600/60 text-navy-300",
  };

  return (
    <section className="min-h-[70vh] border-b border-navy-700/50 bg-gradient-to-b from-navy-800 to-navy-900 py-10">
      <div className="mx-auto w-full max-w-5xl px-4">
        <Link href="/admin" className="text-sm text-navy-400 hover:text-gold-300">← 管理后台</Link>
        <h1 className="mt-2 text-2xl font-bold text-white">用户管理</h1>

        <form method="get" className="mt-5 flex max-w-md gap-2">
          <input
            name="q"
            defaultValue={q}
            placeholder="搜索昵称或邮箱"
            className="w-full rounded-lg border border-navy-600 bg-navy-900/60 px-3 py-2 text-sm text-white outline-none focus:border-gold-500"
          />
          <button type="submit" className="shrink-0 rounded-lg bg-gold-500/15 px-4 text-sm text-gold-300 hover:bg-gold-500/25">
            搜索
          </button>
        </form>

        <div className="mt-5 overflow-x-auto rounded-xl border border-navy-600/50 bg-navy-800/50">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-navy-700/50 text-left font-mono text-[11px] uppercase tracking-wider text-navy-400">
                <th className="px-4 py-2.5">用户</th>
                <th className="px-4 py-2.5">角色</th>
                <th className="px-4 py-2.5">状态</th>
                <th className="px-4 py-2.5">注册时间</th>
                <th className="px-4 py-2.5 text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => (
                <tr key={u.id} className="border-b border-navy-700/40 last:border-0">
                  <td className="px-4 py-3">
                    <div className="text-white">{u.name ?? "(未设置昵称)"}</div>
                    <div className="font-mono text-xs text-navy-400">{u.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 font-mono text-[10px] ${roleChip[u.role] ?? ""}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {u.bannedAt ? (
                      <span className="text-red-400">
                        已封禁 · {formatRelative(u.bannedAt)}
                        {u.banReason && <div className="mt-0.5 text-navy-400">原因:{u.banReason}</div>}
                      </span>
                    ) : u.emailVerified ? (
                      <span className="text-emerald-400">正常</span>
                    ) : (
                      <span className="text-navy-400">未验证邮箱</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-navy-400">{formatRelative(u.createdAt)}</td>
                  <td className="px-4 py-3 text-right">
                    {isAdmin ? (
                      <BanControl userId={u.id} name={u.name} bannedAt={u.bannedAt} />
                    ) : (
                      <span className="text-xs text-navy-500">仅管理员可封禁</span>
                    )}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-sm text-navy-500">没有匹配的用户</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <nav className="mt-5 flex items-center justify-center gap-4 text-sm">
            {page > 1 ? (
              <Link href={`/admin/users?${new URLSearchParams({ ...(q ? { q } : {}), page: String(page - 1) })}`} className="text-navy-300 hover:text-gold-300">← 上一页</Link>
            ) : (
              <span className="text-navy-600">← 上一页</span>
            )}
            <span className="font-mono text-xs text-navy-400">{page} / {totalPages}(共 {total})</span>
            {page < totalPages ? (
              <Link href={`/admin/users?${new URLSearchParams({ ...(q ? { q } : {}), page: String(page + 1) })}`} className="text-navy-300 hover:text-gold-300">下一页 →</Link>
            ) : (
              <span className="text-navy-600">下一页 →</span>
            )}
          </nav>
        )}
      </div>
    </section>
  );
}
