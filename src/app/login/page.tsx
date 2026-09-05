"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction, type AuthFormState } from "@/lib/actions/auth";

const initialState: AuthFormState = { error: null };

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <section className="min-h-[70vh] border-b border-navy-700/50 bg-gradient-to-b from-navy-800 to-navy-900 py-16">
      <div className="mx-auto w-full max-w-md px-4">
        <div className="rounded-2xl border border-navy-600/60 bg-navy-800/60 p-8">
          <h1 className="text-center text-2xl font-bold text-white">登录 ebank.ai</h1>
          <p className="mt-2 text-center text-sm text-navy-300">
            未注册?<Link href="/register" className="text-gold-400 hover:underline">创建一个账号</Link>
          </p>

          <form action={formAction} className="mt-6 space-y-4">
            {state.error && (
              <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
                {state.error}
              </p>
            )}
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
                autoComplete="current-password"
                placeholder="••••••••••"
                className="w-full rounded-lg border border-navy-600 bg-navy-900/60 px-3 py-2 text-white placeholder:text-navy-500 outline-none focus:border-gold-500"
              />
            </div>
            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-xl bg-gradient-to-r from-gold-400 to-gold-500 px-5 py-2.5 text-sm font-semibold text-navy-900 shadow-lg transition-all hover:brightness-110 disabled:opacity-50"
            >
              {pending ? "登录中…" : "登录"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
