import Link from "next/link";
import { requireRole } from "@/lib/session";

// M1 ADM-120 — 管理后台首页(骨架)。
// 鉴权:中间件拦未登录(/admin),本页叠加角色校验(moderator / admin)。
// 用户管理 / 内容与举报队列分别随 ADM-121 / ADM-122 落地。

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

  const modules = [
    { key: "users", title: "用户管理", desc: "搜索、封禁 / 解封,操作全程审计", eta: "ADM-121 · 待落地" },
    { key: "content", title: "内容与举报", desc: "置顶 / 加精 / 锁帖 / 删除,举报队列处理", eta: "ADM-122 · 待落地" },
    { key: "dashboard", title: "运营看板", desc: "注册、日活、发帖、工作坊用量与成本", eta: "ADM-123 · P1" },
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
            <div key={m.key} className="rounded-xl border border-navy-600/50 bg-navy-800/50 p-5">
              <h2 className="font-semibold text-white">{m.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-navy-300">{m.desc}</p>
              <p className="mt-4 inline-flex rounded-full border border-navy-600 px-2.5 py-0.5 font-mono text-[10px] text-navy-400">
                {m.eta}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
