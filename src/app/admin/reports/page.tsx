import Link from "next/link";
import { requireRole } from "@/lib/session";
import { listReportsAdmin } from "@/lib/admin";
import { formatRelative } from "@/lib/time";
import ReportActionButtons from "@/components/admin/ReportActionButtons";

// M1 ADM-122 — 举报队列:处理 = 删除内容(话题/回复)并标记 resolved,或驳回 dismissed。
// 说明:举报人身份全程不展示(避免泄露);被举报内容以快照呈现。
export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ state?: string | string[]; ok?: string; err?: string }>;
}) {
  const actor = await requireRole("moderator", "admin");
  if (!actor) return <p className="py-20 text-center text-navy-400">无权访问</p>;

  const sp = await searchParams;
  const state = (Array.isArray(sp.state) ? sp.state[0] : sp.state) === "handled" ? "handled" : "pending";
  const { rows, total } = await listReportsAdmin({ state });

  return (
    <section className="min-h-[70vh] border-b border-navy-700/50 bg-gradient-to-b from-navy-800 to-navy-900 py-10">
      <div className="mx-auto w-full max-w-5xl px-4">
        <Link href="/admin" className="text-sm text-navy-400 hover:text-gold-300">← 管理后台</Link>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-white">举报队列</h1>
          <div className="flex gap-2">
            <Link
              href="/admin/reports"
              className={`rounded-lg px-3 py-1.5 text-xs font-medium ${state === "pending" ? "bg-gold-500/15 text-gold-300" : "border border-navy-600 text-navy-300 hover:text-white"}`}
            >
              待处理({total})
            </Link>
            <Link
              href="/admin/reports?state=handled"
              className={`rounded-lg px-3 py-1.5 text-xs font-medium ${state === "handled" ? "bg-gold-500/15 text-gold-300" : "border border-navy-600 text-navy-300 hover:text-white"}`}
            >
              已处理
            </Link>
          </div>
        </div>
        {sp.err && <p className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">{sp.err}</p>}
        {sp.ok && <p className="mt-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">已处理</p>}

        <div className="mt-5 space-y-3">
          {rows.map((r) => (
            <div key={r.id} className="rounded-xl border border-navy-600/50 bg-navy-800/50 px-5 py-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded bg-rose-500/10 px-1.5 py-0.5 text-[10px] text-rose-300">
                    {r.targetType === "topic" ? "话题" : "回复"}
                  </span>
                  <span className="font-mono text-[11px] text-navy-500">{r.id.slice(0, 8)}</span>
                  <span className="text-xs text-navy-400">{formatRelative(r.createdAt)}</span>
                  {r.reason && <span className="rounded bg-gold-500/10 px-1.5 py-0.5 text-[10px] text-gold-300">原因:{r.reason}</span>}
                </div>
                {state === "pending" ? (
                  <ReportActionButtons reportId={r.id} />
                ) : (
                  <span className={`text-xs ${r.status === "resolved" ? "text-red-400" : "text-navy-400"}`}>
                    {r.status === "resolved" ? "已处理(内容已删除)" : "已驳回"}
                  </span>
                )}
              </div>
              <blockquote className="mt-2.5 whitespace-pre-wrap break-words rounded-lg border-l-2 border-navy-600 bg-navy-900/40 px-3 py-2 font-mono text-xs leading-relaxed text-navy-300">
                {r.contentSnapshot?.slice(0, 500)}
                {(r.contentSnapshot?.length ?? 0) > 500 && " …(已截断)"}
              </blockquote>
            </div>
          ))}
          {rows.length === 0 && (
            <p className="py-12 text-center text-sm text-navy-500">
              {state === "pending" ? "队列已清空 🎉" : "暂无处理记录"}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
