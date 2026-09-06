"use client";

import { useActionState } from "react";
import Link from "next/link";
import { requestResetAction, resetPasswordAction, type AuthFormState } from "@/lib/actions/auth";

const initialState: AuthFormState = { error: null };

// M1 AUTH-104 — 找回密码:无 token = 申请重置(防枚举,统一文案);带 token = 落新密码。
export default function ResetPasswordForm({
  email,
  token,
}: {
  email: string | null;
  token: string | null;
}) {
  const [reqState, reqAction, reqPending] = useActionState(requestResetAction, initialState);
  const [resetState, resetAction, resetPending] = useActionState(resetPasswordAction, initialState);

  if (email && token) {
    return (
      <form action={resetAction} className="space-y-4">
        <input type="hidden" name="email" value={email} />
        <input type="hidden" name="token" value={token} />
        {resetState.error && (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {resetState.error}
          </p>
        )}
        <div>
          <label htmlFor="password" className="mb-1 block text-sm text-navy-200">新密码</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={10}
            autoComplete="new-password"
            placeholder="至少 10 位,含字母与数字"
            className="w-full rounded-lg border border-navy-600 bg-navy-900/60 px-3 py-2 text-white outline-none focus:border-gold-500"
          />
        </div>
        <button
          type="submit"
          disabled={resetPending}
          className="w-full rounded-xl bg-gradient-to-r from-gold-400 to-gold-500 px-5 py-2.5 text-sm font-semibold text-navy-900 hover:brightness-110 disabled:opacity-50"
        >
          {resetPending ? "提交中…" : "重置密码"}
        </button>
      </form>
    );
  }

  return (
    <form action={reqAction} className="space-y-4">
      {reqState.ok && (
        <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
          如果该邮箱已注册,重置链接已发送,请查收(30 分钟内有效)。
        </p>
      )}
      {reqState.error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {reqState.error}
        </p>
      )}
      <div>
        <label htmlFor="email" className="mb-1 block text-sm text-navy-200">注册邮箱</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          className="w-full rounded-lg border border-navy-600 bg-navy-900/60 px-3 py-2 text-white outline-none focus:border-gold-500"
        />
      </div>
      <button
        type="submit"
        disabled={reqPending || reqState.ok}
        className="w-full rounded-xl bg-gradient-to-r from-gold-400 to-gold-500 px-5 py-2.5 text-sm font-semibold text-navy-900 hover:brightness-110 disabled:opacity-50"
      >
        {reqPending ? "发送中…" : "发送重置链接"}
      </button>
      <p className="text-center">
        <Link href="/login" className="text-xs text-navy-400 hover:text-gold-300">← 返回登录</Link>
      </p>
    </form>
  );
}
