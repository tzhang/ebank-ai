"use client";

import { useActionState } from "react";
import { deleteAccountAction, type ProfileActionState } from "@/lib/actions/profile";

const initialState: ProfileActionState = { error: null };

// M1 NFR-305 — 注销面板:二次确认(输入密码 + 邮箱确认)后删除账号。
export default function DeleteAccountPanel({ email }: { email: string }) {
  const [state, formAction, pending] = useActionState(deleteAccountAction, initialState);

  return (
    <form action={formAction} className="space-y-3">
      {state.error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {state.error}
        </p>
      )}
      <p className="text-sm leading-relaxed text-red-300">
        注销将<strong>删除你的账号与全部内容</strong>(话题、回复、点赞);举报快照与审计记录会匿名保留(法定留存)。
        注销后同一邮箱可重新注册。此操作不可撤销。
      </p>
      <div>
        <label htmlFor="confirmEmail" className="mb-1 block text-xs text-navy-300">
          输入邮箱 <span className="font-mono text-gold-400">{email}</span> 以确认
        </label>
        <input
          id="confirmEmail"
          name="confirmEmail"
          type="text"
          required
          autoComplete="off"
          className="w-full rounded-lg border border-navy-600 bg-navy-900/60 px-3 py-2 text-sm text-white outline-none focus:border-red-500"
        />
      </div>
      <div>
        <label htmlFor="password" className="mb-1 block text-xs text-navy-300">输入当前密码</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="w-full rounded-lg border border-navy-600 bg-navy-900/60 px-3 py-2 text-sm text-white outline-none focus:border-red-500"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-xl border border-red-500/50 px-6 py-2 text-sm font-semibold text-red-400 transition-colors hover:bg-red-500/10 disabled:opacity-50"
      >
        {pending ? "注销中…" : "永久注销账号"}
      </button>
    </form>
  );
}
