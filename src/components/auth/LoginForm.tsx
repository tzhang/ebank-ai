"use client";

import { useState, useActionState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { resendVerificationAction, type AuthFormState } from "@/lib/actions/auth";

const initialState: AuthFormState = { error: null };

export default function LoginForm({
  registeredEmail,
  justReset,
  justDeleted,
}: {
  registeredEmail: string | null;
  justReset: boolean;
  justDeleted: boolean;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [resendState, resendAction, resendPending] = useActionState(resendVerificationAction, initialState);
  const router = useRouter();
  const showResend = Boolean(registeredEmail);

  // 用客户端 signIn(redirect:false):登录成功后 SessionProvider 自动广播,
  // 顶栏用户区即时更新(服务端动作 + 软导航会滞留游客态,故不走 action)。
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setPending(true);
    setError(null);
    try {
      const res = await signIn("credentials", {
        email: String(fd.get("email") ?? ""),
        password: String(fd.get("password") ?? ""),
        redirect: false,
      });
      if (res?.error) {
        setError("邮箱或密码错误");
      } else {
        router.replace("/");
        router.refresh();
      }
    } catch {
      setError("登录失败,请稍后再试");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="rounded-2xl border border-navy-600/60 bg-navy-800/60 p-8">
      <h1 className="text-center text-2xl font-bold text-white">登录 ebank.ai</h1>
      <p className="mt-2 text-center text-sm text-navy-300">
        未注册?<Link href="/register" className="text-gold-400 hover:underline">创建一个账号</Link>
      </p>

      {registeredEmail && (
        <div className="mt-5 rounded-lg border border-gold-500/30 bg-gold-500/10 px-3 py-2.5 text-sm text-gold-200">
          注册成功!验证邮件已发送至 <span className="font-mono">{registeredEmail}</span>,
          验证后即可发布内容(未验证也可先登录浏览)。
          <form action={resendAction} className="mt-2">
            <input type="hidden" name="email" value={registeredEmail} />
            {resendState.ok && <p className="mb-1 text-xs text-emerald-400">已重新发送,请查收</p>}
            {resendState.error && <p className="mb-1 text-xs text-red-400">{resendState.error}</p>}
            <button
              type="submit"
              disabled={resendPending || resendState.ok}
              className="text-xs text-gold-300 underline underline-offset-2 hover:text-gold-200 disabled:opacity-50"
            >
              {resendPending ? "发送中…" : resendState.ok ? "已发送" : "没收到?重新发送"}
            </button>
          </form>
        </div>
      )}
      {justReset && (
        <p className="mt-5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
          密码已重置,请用新密码登录
        </p>
      )}
      {justDeleted && (
        <p className="mt-5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
          账号已注销,感谢你曾来过——同一邮箱随时可以重新注册。
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {error && (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {error}
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
            defaultValue={registeredEmail ?? ""}
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
        <div className="text-right">
          <Link href="/reset-password" className="text-xs text-navy-400 hover:text-gold-300">
            忘记密码?
          </Link>
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
  );
}
