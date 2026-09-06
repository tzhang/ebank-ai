import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-navy-700/50 bg-navy-900">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-gold-300 to-gold-500 text-[10px] font-bold text-navy-900">
                e
              </div>
              <span className="text-sm font-semibold text-white">
                ebank<span className="text-gold-300">.ai</span>
              </span>
            </div>
            <p className="text-xs leading-relaxed text-navy-300">
              金融大模型与 Agent Harness 平台 - 选对模型，用对框架，让大模型真正服务金融。
            </p>
          </div>

          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-navy-300">内容</h3>
            <ul className="space-y-2">
              <li><Link href="/llm" className="text-sm text-navy-200 transition-colors hover:text-gold-300">金融大模型</Link></li>
              <li><Link href="/harness" className="text-sm text-navy-200 transition-colors hover:text-gold-300">Agent Harness</Link></li>
              <li><Link href="/skills" className="text-sm text-navy-200 transition-colors hover:text-gold-300">技能库</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-navy-300">社区</h3>
            <ul className="space-y-2">
              <li><Link href="/community" className="text-sm text-navy-200 transition-colors hover:text-gold-300">问答交流</Link></li>
              <li><Link href="/community" className="text-sm text-navy-200 transition-colors hover:text-gold-300">讨论区</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-navy-300">关于</h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-sm text-navy-200 transition-colors hover:text-gold-300">关于我们</Link></li>
              <li><span className="text-sm text-navy-400">hello@ebank.ai</span></li>
              <li>
                <Link href="/terms" className="text-sm text-navy-200 transition-colors hover:text-gold-300">用户协议</Link>
                <span className="mx-1.5 text-navy-600">·</span>
                <Link href="/privacy" className="text-sm text-navy-200 transition-colors hover:text-gold-300">隐私政策</Link>
              </li>
              <li><Link href="/rules" className="text-sm text-navy-200 transition-colors hover:text-gold-300">社区规则与举报</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-navy-700/50 pt-6 text-center">
          <p className="text-xs text-navy-400">
            &copy; {new Date().getFullYear()} ebank.ai. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
