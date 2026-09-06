// M1 NFR-303 — 法务文档页共享布局(公开路由)。
// 状态:草案 — 生效前需产品负责人补全主体信息并完成法律审阅。
export default function LegalDoc({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-navy-700/50 bg-gradient-to-b from-navy-800 to-navy-900 py-12">
      <div className="mx-auto w-full max-w-3xl px-4">
        <div className="rounded-t-2xl border border-gold-500/30 bg-gold-500/5 px-5 py-3 text-xs leading-relaxed text-gold-300">
          ⚠️ 本页面为<b>运营草案</b>,尚未生效。正式文本将经法律审阅后更新并标注生效日期;
          方括号 [ ] 处为待运营方补全信息。
        </div>
        <div className="rounded-b-2xl border border-t-0 border-navy-600/60 bg-navy-800/60 px-6 py-8 sm:px-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-gold-400">{eyebrow}</p>
          <h1 className="mt-2 text-2xl font-bold text-white">{title}</h1>
          <p className="mt-3 text-sm leading-relaxed text-navy-300">{intro}</p>
          <div className="legal-prose mt-8">{children}</div>
        </div>
      </div>
    </section>
  );
}
