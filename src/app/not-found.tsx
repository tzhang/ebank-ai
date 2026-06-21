import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <span className="text-7xl font-bold gradient-text">404</span>
      <h1 className="mt-4 text-2xl font-bold text-white">页面未找到</h1>
      <p className="mt-2 text-navy-300">
        你访问的页面不存在，或已被移除。
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center rounded-xl bg-gradient-to-r from-gold-400 to-gold-500 px-6 py-3 text-sm font-semibold text-navy-900 shadow-lg transition-all hover:brightness-110"
      >
        <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        返回首页
      </Link>
    </div>
  );
}
