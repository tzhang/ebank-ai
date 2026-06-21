import Link from "next/link";

export default function AboutPage() {
  return (
    <>
      <section className="border-b border-navy-700/50 bg-gradient-to-b from-navy-800 to-navy-900">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center rounded-full border border-gold-500/30 bg-gold-500/10 px-3 py-1 text-xs font-medium text-gold-300">
              关于
            </span>
            <h1 className="mt-6 text-3xl font-bold text-white sm:text-4xl">
              关于 ebank.ai
            </h1>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="prose-custom space-y-6 text-navy-200">
          <p className="text-lg leading-relaxed">
            ebank.ai 诞生于 AI 技术快速迭代的时代。我们相信，AI 将从根本上改变金融行业的面貌——从个人投资者的决策方式，到专业金融机构的运营效率。
          </p>

          <h2 className="mt-10 text-xl font-semibold text-white">我们的使命</h2>
          <p className="leading-relaxed">
            让每个人都能借助 AI 的力量，更聪明地管理财富。同时，为金融从业者提供一个学习、交流和共创的 AI 社区。
          </p>

          <h2 className="mt-10 text-xl font-semibold text-white">面向人群</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-xl border border-navy-600/50 bg-navy-800/50 p-5">
              <h3 className="font-semibold text-white">大众投资者</h3>
              <p className="mt-2 text-sm leading-relaxed text-navy-300">
                想学习使用 AI 进行投资理财的个人投资者。
                从入门到进阶，让 AI 成为你的投资助手。
              </p>
            </div>
            <div className="rounded-xl border border-navy-600/50 bg-navy-800/50 p-5">
              <h3 className="font-semibold text-white">金融从业者</h3>
              <p className="mt-2 text-sm leading-relaxed text-navy-300">
                银行、证券、保险、基金等机构的专业人士。
                学习 AI 工具，共享实践技能，提升工作效率。
              </p>
            </div>
          </div>

          <h2 className="mt-10 text-xl font-semibold text-white">平台特色</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li className="leading-relaxed">
              <strong className="text-gold-300">Skills 共享</strong> — 金融行业专属的 Codex / Claude Code Skills 仓库
            </li>
            <li className="leading-relaxed">
              <strong className="text-gold-300">MCP 服务</strong> — 合规、分析、数据等金融场景的 MCP 配置
            </li>
            <li className="leading-relaxed">
              <strong className="text-gold-300">社区问答</strong> — 金融 AI 实践者的交流平台
            </li>
            <li className="leading-relaxed">
              <strong className="text-gold-300">实战教程</strong> — 覆盖 WorkBuddy、DeepSeek、Codex 等工具的实操指南
            </li>
          </ul>

          <div className="mt-12 rounded-xl border border-gold-500/20 bg-gold-500/5 p-8 text-center">
            <h2 className="text-xl font-bold text-white">加入我们</h2>
            <p className="mt-2 text-sm text-navy-300">
              无论你是 AI 爱好者还是金融专业人士，ebank.ai 都欢迎你的加入。
              一起探索 AI 在金融领域的无限可能。
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/community"
                className="inline-flex items-center rounded-xl bg-gradient-to-r from-gold-400 to-gold-500 px-6 py-3 text-sm font-semibold text-navy-900 shadow-lg transition-all hover:brightness-110"
              >
                加入社区
              </Link>
              <a
                href="mailto:hello@ebank.ai"
                className="inline-flex items-center rounded-xl border border-navy-500 bg-navy-800/50 px-6 py-3 text-sm font-semibold text-navy-100 transition-all hover:border-navy-400 hover:bg-navy-700"
              >
                联系我们
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
