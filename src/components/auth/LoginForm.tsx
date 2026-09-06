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
  errorCode,
  hasGithub,
}: {
  registeredEmail: string | null;
  justReset: boolean;
  justDeleted: boolean;
  errorCode: string | null;
  hasGithub: boolean;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [githubPending, setGithubPending] = useState(false);
  const [resendState, resendAction, resendPending] = useActionState(resendVerificationAction, initialState);
  const router = useRouter();
  const showResend = Boolean(registeredEmail);

  const oauthError =
    errorCode === "OAuthAccountNotLinked"
      ? "该邮箱已有账号但尚未完成邮箱验证,请先用邮箱密码登录并验证后,再使用 GitHub 登录绑定;或换用其他 GitHub 邮箱。"
      : errorCode === "OAuthAccountAlreadyLinked"
        ? "该 GitHub 账号已绑定其他站内账号,请直接登录。"
        : errorCode
          ? "第三方登录失败,请重试或改用邮箱密码。"
          : null;

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
      {oauthError && (
        <p className="mt-5 rounded-lg border border-gold-500/30 bg-gold-500/10 px-3 py-2 text-sm text-gold-200">
          {oauthError}
        </p>
      )}

      {/* GitHub OAuth(AUTH-105;仅在服务端配置 AUTH_GITHUB_* 后显示) */}
      {hasGithub && (
        <>
          <button
            type="button"
            disabled={githubPending}
            onClick={async () => {
              setGithubPending(true);
              await signIn("github", { callbackUrl: "/" });
            }}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-navy-500 bg-navy-900/40 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:border-navy-400 hover:bg-navy-700 disabled:opacity-50"
          >
            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
            {githubPending ? "跳转 GitHub…" : "使用 GitHub 登录"}
          </button>
          <div className="mt-4 flex items-center gap-3 text-xs text-navy-500">
            <span className="h-px flex-1 bg-navy-700" />
            或使用邮箱密码
            <span className="h-px flex-1 bg-navy-700" />
          </div>
        </>
      )}

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
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
