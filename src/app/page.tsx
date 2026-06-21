import Link from "next/link";
import FeaturedCard from "@/components/FeaturedCard";

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-navy-700/50">
        <div className="absolute inset-0 bg-gradient-to-br from-navy-800 via-navy-900 to-navy-800" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center rounded-full border border-gold-500/30 bg-gold-500/10 px-3 py-1 text-xs font-medium text-gold-300">
              AI + 金融
            </span>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              AI 时代的
              <span className="gradient-text block">金融知识平台</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-navy-200">
              ebank.ai 致力于让每个人都能借助 AI 的力量，更好地投资、管理财富。
              同时为金融从业者提供 AI 工具、Skills、MCP 的学习与分享社区。
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/learn"
                className="inline-flex items-center rounded-xl bg-gradient-to-r from-gold-400 to-gold-500 px-6 py-3 text-sm font-semibold text-navy-900 shadow-lg transition-all hover:brightness-110"
              >
                开始学习
                <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="/community"
                className="inline-flex items-center rounded-xl border border-navy-500 bg-navy-800/50 px-6 py-3 text-sm font-semibold text-navy-100 transition-all hover:border-navy-400 hover:bg-navy-700"
              >
                加入社区
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Value props */}
      <section className="border-b border-navy-700/50 bg-navy-800/30">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-navy-600/50 bg-navy-800/50 p-6 card-hover">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-gold-500/10">
                <svg className="h-5 w-5 text-gold-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="mb-2 font-semibold text-white">智能投资</h3>
              <p className="text-sm leading-relaxed text-navy-300">
                学习如何利用大模型分析市场、优化投资组合，让 AI 成为你的私人投资顾问。
              </p>
            </div>

            <div className="rounded-xl border border-navy-600/50 bg-navy-800/50 p-6 card-hover">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-gold-500/10">
                <svg className="h-5 w-5 text-gold-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
                </svg>
              </div>
              <h3 className="mb-2 font-semibold text-white">专业工具库</h3>
              <p className="text-sm leading-relaxed text-navy-300">
                为金融从业者精选 AI 工具，分享实战 Skills 和 MCP 配置，提升工作效率。
              </p>
            </div>

            <div className="rounded-xl border border-navy-600/50 bg-navy-800/50 p-6 card-hover">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-gold-500/10">
                <svg className="h-5 w-5 text-gold-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
              </div>
              <h3 className="mb-2 font-semibold text-white">社区交流</h3>
              <p className="text-sm leading-relaxed text-navy-300">
                与金融科技爱好者交流心得，分享实践经验，共同探索 AI 在金融领域的前沿应用。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured content - linking to detail pages */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">精选内容</h2>
          <p className="mt-2 text-navy-300">最新 AI 金融文章与资源</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 animate-stagger">
          <FeaturedCard
            tag="大众"
            tagColor="gold"
            title="ChatGPT 投资分析入门"
            desc="学习如何用对话式 AI 快速分析财报、跟踪市场情绪、生成投资摘要。"
            href="/learn/chatgpt-investment-intro"
          />
          <FeaturedCard
            tag="专业"
            tagColor="blue"
            title="Claude Code 金融工作流"
            desc="用 Claude Code 自动化财务报表分析、监管报告生成、数据可视化。"
            href="/pro/claude-code-finance-workflow"
          />
          <FeaturedCard
            tag="技能"
            tagColor="gold"
            title="合规扫描 MCP 服务"
            desc="分享如何为银行合规团队搭建自动化监管扫描的 MCP 服务。"
            href="/skills/banking-compliance-scan"
          />
        </div>
      </section>
    </>
  );
}
