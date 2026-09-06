import LoginForm from "@/components/auth/LoginForm";

// M1 AUTH-103 — 登录页(服务端壳:解析查询参数后交给客户端表单)。
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{
    registered?: string | string[];
    email?: string | string[];
    reset?: string | string[];
    deleted?: string | string[];
    error?: string | string[];
  }>;
}) {
  const sp = await searchParams;
  const email = Array.isArray(sp.email) ? sp.email[0] : sp.email;
  const registeredEmail = sp.registered !== undefined ? (email ?? null) : null;
  const justReset = !Array.isArray(sp.reset) && sp.reset === "1";
  const justDeleted = !Array.isArray(sp.deleted) && sp.deleted === "1";
  const errorCode = Array.isArray(sp.error) ? sp.error[0] : (sp.error ?? null);

  return (
    <section className="min-h-[70vh] border-b border-navy-700/50 bg-gradient-to-b from-navy-800 to-navy-900 py-16">
      <div className="mx-auto w-full max-w-md px-4">
        <LoginForm
          registeredEmail={registeredEmail}
          justReset={justReset}
          justDeleted={justDeleted}
          errorCode={errorCode}
        />
      </div>
    </section>
  );
}
