"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerAction, type AuthFormState } from "@/lib/actions/auth";

const initialState: AuthFormState = { error: null };

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(registerAction, initialState);

  return (
    <section className="min-h-[70vh] border-b border-navy-700/50 bg-gradient-to-b from-navy-800 to-navy-900 py-16">
      <div className="mx-auto w-full max-w-md px-4">
        <div className="rounded-2xl border border-navy-600/60 bg-navy-800/60 p-8">
          <h1 className="text-center text-2xl font-bold text-white">注册 ebank.ai</h1>
          <p className="mt-2 text-center text-sm text-navy-300">
            已有账号?<Link href="/login" className="text-gold-400 hover:underline">直接登录</Link>
          </p>

          <form action={formAction} className="mt-6 space-y-4">
            {state.error && (
              <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
                {state.error}
              </p>
            )}
            <div>
              <label htmlFor="name" className="mb-1 block text-sm text-navy-200">昵称</label>
              <input
                id="name"
                name="name"
                type="text"
                required
                minLength={2}
                maxLength={30}
                autoComplete="nickname"
                placeholder="2–30 个字符"
                className="w-full rounded-lg border border-navy-600 bg-navy-900/60 px-3 py-2 text-white placeholder:text-navy-500 outline-none focus:border-gold-500"
              />
            </div>
            <div>
              <label htmlFor="email" className="mb-1 block text-sm text-navy-200">邮箱</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full rounded-lg border border-navy-600 bg-navy-900/60 px-3 py-2 text-white placeholder:text-navy-500 outline-none focus:border-gold-500"
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1 block text-sm text-navy-200">密码</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={10}
                autoComplete="new-password"
                placeholder="至少 10 位,含字母与数字"
                className="w-full rounded-lg border border-navy-600 bg-navy-900/60 px-3 py-2 text-white placeholder:text-navy-500 outline-none focus:border-gold-500"
              />
              <p className="mt-1 text-xs text-navy-400">
                注册即代表同意<a href="/terms" className="text-navy-300 underline decoration-navy-500 hover:text-gold-400">用户协议</a>与<a href="/privacy" className="text-navy-300 underline decoration-navy-500 hover:text-gold-400">隐私政策</a>(页面将于 NFR-303 issue 落地)
              </p>
            </div>
            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-xl bg-gradient-to-r from-gold-400 to-gold-500 px-5 py-2.5 text-sm font-semibold text-navy-900 shadow-lg transition-all hover:brightness-110 disabled:opacity-50"
            >
              {pending ? "注册中…" : "注册"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
