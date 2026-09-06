import Link from "next/link";
import { requireRole } from "@/lib/session";
import { listTopicsAdmin } from "@/lib/admin";
import { topicOpAction } from "@/lib/actions/admin";
import { formatRelative } from "@/lib/time";

// M1 ADM-122 — 内容管理:置顶 / 加精 / 锁帖 / 删除 / 恢复(全部记审计)。
export default async function AdminContentPage({
  searchParams,
}: {
  searchParams: Promise<{ state?: string | string[]; page?: string | string[]; ok?: string; err?: string }>;
}) {
  const actor = await requireRole("moderator", "admin");
  if (!actor) return <p className="py-20 text-center text-navy-400">无权访问</p>;

  const sp = await searchParams;
  const state = (Array.isArray(sp.state) ? sp.state[0] : sp.state) === "deleted" ? "deleted" : "active";
  const page = Math.max(1, Number.parseInt((Array.isArray(sp.page) ? sp.page[0] : sp.page) ?? "1", 10) || 1);
  const { rows, total, pageSize } = await listTopicsAdmin({ state, page });
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <section className="min-h-[70vh] border-b border-navy-700/50 bg-gradient-to-b from-navy-800 to-navy-900 py-10">
      <div className="mx-auto w-full max-w-5xl px-4">
        <Link href="/admin" className="text-sm text-navy-400 hover:text-gold-300">← 管理后台</Link>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-white">内容管理</h1>
          <div className="flex gap-2">
            <Link
              href="/admin/content"
              className={`rounded-lg px-3 py-1.5 text-xs font-medium ${state === "active" ? "bg-gold-500/15 text-gold-300" : "border border-navy-600 text-navy-300 hover:text-white"}`}
            >
              正常话题
            </Link>
            <Link
              href="/admin/content?state=deleted"
              className={`rounded-lg px-3 py-1.5 text-xs font-medium ${state === "deleted" ? "bg-gold-500/15 text-gold-300" : "border border-navy-600 text-navy-300 hover:text-white"}`}
            >
              已删除
            </Link>
          </div>
        </div>
        {sp.err && <p className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">{sp.err}</p>}

        <div className="mt-5 space-y-3">
          {rows.map((t) => (
            <div key={t.id} className="rounded-xl border border-navy-600/50 bg-navy-800/50 px-5 py-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {t.pinned && <span className="rounded bg-gold-500/15 px-1.5 py-0.5 text-[10px] text-gold-400">置顶</span>}
                    {t.featured && <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] text-emerald-300">精华</span>}
                    {t.locked && <span className="rounded bg-navy-600/60 px-1.5 py-0.5 text-[10px] text-navy-300">锁定</span>}
                    {state === "deleted" && <span className="rounded bg-red-500/10 px-1.5 py-0.5 text-[10px] text-red-400">已删除</span>}
                    <span className="rounded bg-blue-500/10 px-1.5 py-0.5 text-[10px] text-blue-300">{t.category}</span>
                  </div>
                  <Link href={`/topics/${t.id}`} className="mt-1.5 block truncate text-sm font-medium text-white hover:text-gold-300">
                    {t.title}
                  </Link>
                  <div className="mt-1 flex flex-wrap gap-x-3 font-mono text-[11px] text-navy-400">
                    <span>{t.authorName ?? "已注销用户"}</span>
                    <span>{t.replyCount} 回复 · {t.viewCount} 浏览</span>
                    <span>{formatRelative(t.createdAt)}</span>
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap justify-end gap-1.5">
                  {state === "active" ? (
                    <>
                      {!t.pinned && <OpButton topicId={t.id} op="pin" label="置顶" />}
                      {t.pinned && <OpButton topicId={t.id} op="unpin" label="取消置顶" />}
                      {!t.featured && <OpButton topicId={t.id} op="feature" label="加精" />}
                      {t.featured && <OpButton topicId={t.id} op="unfeature" label="取消精华" />}
                      {!t.locked && <OpButton topicId={t.id} op="lock" label="锁帖" />}
                      {t.locked && <OpButton topicId={t.id} op="unlock" label="解锁" />}
                      <OpButton topicId={t.id} op="delete" label="删除" danger />
                    </>
                  ) : (
                    <OpButton topicId={t.id} op="restore" label="恢复" />
                  )}
                </div>
              </div>
            </div>
          ))}
          {rows.length === 0 && <p className="py-12 text-center text-sm text-navy-500">暂无话题</p>}
        </div>

        {totalPages > 1 && (
          <nav className="mt-5 flex items-center justify-center gap-4 text-sm">
            {page > 1 && <Link href={`/admin/content?state=${state}&page=${page - 1}`} className="text-navy-300 hover:text-gold-300">← 上一页</Link>}
            <span className="font-mono text-xs text-navy-400">{page} / {totalPages}(共 {total})</span>
            {page < totalPages && <Link href={`/admin/content?state=${state}&page=${page + 1}`} className="text-navy-300 hover:text-gold-300">下一页 →</Link>}
          </nav>
        )}
      </div>
    </section>
  );
}

function OpButton({
  topicId,
  op,
  label,
  danger,
}: {
  topicId: string;
  op: string;
  label: string;
  danger?: boolean;
}) {
  return (
    <form action={topicOpAction}>
      <input type="hidden" name="topicId" value={topicId} />
      <input type="hidden" name="op" value={op} />
      <button
        type="submit"
        className={`rounded-md border px-2.5 py-1 text-xs transition-colors ${
          danger
            ? "border-red-500/40 text-red-400 hover:bg-red-500/10"
            : "border-navy-600 text-navy-300 hover:border-navy-500 hover:text-white"
        }`}
      >
        {label}
      </button>
    </form>
  );
}
