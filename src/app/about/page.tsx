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
            ebank.ai 诞生于大模型走向金融生产环境的关键阶段。我们观察到：决定金融 AI
            成败的，一半是模型本身，另一半是驱动模型的 Agent Harness
            运行框架--权限、工具、审计与生态。本站聚焦这两件事。
          </p>

          <h2 className="mt-10 text-xl font-semibold text-white">我们的使命</h2>
          <p className="leading-relaxed">
            帮助金融从业者和投资者看懂金融大模型、用好 Agent Harness。
            选对模型，用对框架，让大模型真正服务金融业务，而不是停留在演示阶段。
          </p>

          <h2 className="mt-10 text-xl font-semibold text-white">我们关注什么</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-xl border border-navy-600/50 bg-navy-800/50 p-5">
              <h3 className="font-semibold text-white">金融大模型</h3>
              <p className="mt-2 text-sm leading-relaxed text-navy-300">
                GPT、Claude、DeepSeek、Qwen 及金融专用模型的能力评测、
                选型框架与私有化部署实践。
              </p>
            </div>
            <div className="rounded-xl border border-navy-600/50 bg-navy-800/50 p-5">
              <h3 className="font-semibold text-white">Agent Harness</h3>
              <p className="mt-2 text-sm leading-relaxed text-navy-300">
                Claude Code、Codex、Cursor、OpenClaw 等运行框架在金融场景的
                概念解读、选型对比与安全合规落地。
              </p>
            </div>
          </div>

          <h2 className="mt-10 text-xl font-semibold text-white">平台特色</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li className="leading-relaxed">
              <strong className="text-gold-300">模型评测</strong> - 金融大模型的选型框架、公开基准与自建评测集方法
            </li>
            <li className="leading-relaxed">
              <strong className="text-gold-300">Harness 实战</strong> - Claude Code / Codex 等 Agent 框架的金融工作流与安全设计
            </li>
            <li className="leading-relaxed">
              <strong className="text-gold-300">Skills 共享</strong> - 金融行业专属的 Codex / Claude Code Skills 仓库
            </li>
            <li className="leading-relaxed">
              <strong className="text-gold-300">MCP 服务</strong> - 合规、分析、数据等金融场景的 MCP 配置
            </li>
            <li className="leading-relaxed">
              <strong className="text-gold-300">社区问答</strong> - 金融 AI 实践者的交流平台
            </li>
          </ul>

          <div className="mt-12 rounded-xl border border-gold-500/20 bg-gold-500/5 p-8 text-center">
            <h2 className="text-xl font-bold text-white">加入我们</h2>
            <p className="mt-2 text-sm text-navy-300">
              无论你是大模型研究者、金融从业者还是量化开发者，
              ebank.ai 都欢迎你的加入。一起探索金融大模型与 Agent Harness 的无限可能。
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
