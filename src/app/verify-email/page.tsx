import Link from "next/link";
import { verifyEmail } from "@/lib/mail";

// M1 AUTH-102 — 验证邮件落地页(token 24h 一次性,DB 校验)。
export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string | string[]; token?: string | string[] }>;
}) {
  const sp = await searchParams;
  const email = (Array.isArray(sp.email) ? sp.email[0] : sp.email) ?? "";
  const token = (Array.isArray(sp.token) ? sp.token[0] : sp.token) ?? "";
  const result = email && token ? await verifyEmail(email, token) : { ok: false as const, reason: "invalid" as const };

  return (
    <section className="min-h-[60vh] border-b border-navy-700/50 bg-gradient-to-b from-navy-800 to-navy-900 py-20">
      <div className="mx-auto max-w-xl px-4 text-center">
        <div className="rounded-2xl border border-navy-600/60 bg-navy-800/60 p-8">
          {result.ok ? (
            <>
              <h1 className="text-2xl font-bold text-emerald-400">邮箱验证成功 ✅</h1>
              <p className="mt-3 text-navy-300">你现在可以发布话题、回复与点赞了。</p>
              <div className="mt-6 flex justify-center gap-4 text-sm">
                <Link href="/login" className="rounded-xl bg-gradient-to-r from-gold-400 to-gold-500 px-5 py-2 font-semibold text-navy-900 hover:brightness-110">
                  去登录
                </Link>
                <Link href="/community" className="rounded-xl border border-navy-500 px-5 py-2 text-navy-200 hover:border-navy-400">
                  逛社区
                </Link>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-white">
                {result.reason === "expired" ? "验证链接已过期" : "验证链接无效"}
              </h1>
              <p className="mt-3 text-navy-300">
                可在登录页的提示处重新发送验证邮件,或联系 editorial@ebank.ai。
              </p>
              <Link href="/login" className="mt-6 inline-block text-sm text-gold-400 hover:underline">
                ← 去登录
              </Link>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
