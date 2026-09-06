import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

// M1 AUTH-104 — 找回密码页(无 token 申请 / 带 token 重置)。
export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string | string[]; token?: string | string[] }>;
}) {
  const sp = await searchParams;
  const email = (Array.isArray(sp.email) ? sp.email[0] : sp.email) ?? null;
  const token = (Array.isArray(sp.token) ? sp.token[0] : sp.token) ?? null;

  return (
    <section className="min-h-[70vh] border-b border-navy-700/50 bg-gradient-to-b from-navy-800 to-navy-900 py-16">
      <div className="mx-auto w-full max-w-md px-4">
        <div className="rounded-2xl border border-navy-600/60 bg-navy-800/60 p-8">
          <h1 className="text-center text-2xl font-bold text-white">
            {email && token ? "重置密码" : "找回密码"}
          </h1>
          <p className="mt-2 text-center text-sm text-navy-400">
            {email && token ? `账号:${email}` : "输入注册邮箱,我们发送重置链接"}
          </p>
          <div className="mt-6">
            <ResetPasswordForm email={email} token={token} />
          </div>
        </div>
      </div>
    </section>
  );
}
