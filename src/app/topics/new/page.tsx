import Link from "next/link";
import { eq } from "drizzle-orm";
import { requireUser } from "@/lib/session";
import { getDb } from "@/lib/db";
import { users } from "@/lib/db/schema";
import NewTopicForm from "@/components/forum/NewTopicForm";

// M1 FRM-130 — 发起话题页。门槛:登录 + 邮箱已验证(双重校验,服务端动作再兜底)。

export default async function NewTopicPage() {
  const user = await requireUser();

  if (!user) {
    return (
      <section className="border-b border-navy-700/50 bg-gradient-to-b from-navy-800 to-navy-900 py-20">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <h1 className="text-2xl font-bold text-white">登录后发起话题</h1>
          <p className="mt-3 text-navy-300">
            社区互动需要账号。<Link href="/login" className="text-gold-400 hover:underline">去登录</Link>
            ,或<Link href="/register" className="text-gold-400 hover:underline">注册一个账号</Link>
          </p>
        </div>
      </section>
    );
  }

  const db = getDb();
  const [me] = await db
    .select({ emailVerified: users.emailVerified })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);
  const verified = Boolean(me?.emailVerified);

  if (!verified) {
    return (
      <section className="border-b border-navy-700/50 bg-gradient-to-b from-navy-800 to-navy-900 py-20">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <h1 className="text-2xl font-bold text-white">先验证邮箱</h1>
          <p className="mt-3 text-navy-300">
            未验证用户可浏览全部内容,但暂不能发布。邮箱验证邮件即将上线(#5),敬请期待。
          </p>
          <Link href="/community" className="mt-6 inline-block text-gold-400 hover:underline">
            ← 返回社区
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="border-b border-navy-700/50 bg-gradient-to-b from-navy-800 to-navy-900 py-16">
      <div className="mx-auto w-full max-w-3xl px-4">
        <h1 className="text-2xl font-bold text-white">发起话题</h1>
        <p className="mt-1 text-sm text-navy-400">选对分类更容易被同行看到</p>
        <div className="mt-6 rounded-2xl border border-navy-600/60 bg-navy-800/60 p-6">
          <NewTopicForm />
        </div>
      </div>
    </section>
  );
}
