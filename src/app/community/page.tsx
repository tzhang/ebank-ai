import Link from "next/link";
import type { Metadata } from "next";
import { and, count, desc, eq, isNull } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { topics, users } from "@/lib/db/schema";
import { formatRelative } from "@/lib/time";

// M1 FRM-137 — 社区列表(真实数据)。
// 说明:
// - 服务端组件直接查库,分类/分页走 URL 查询参数(可分享、可前进后退);
// - 本页读取 searchParams 属动态渲染,revalidate 仅作缓存语义提示;
//   详情页 ISR(静态 + 增量)随 #11 话题详情落地;
// - 未登录可浏览是底线(FRM-137),本页不做任何鉴权。

export const metadata: Metadata = {
  title: "交流与问答 · ebank.ai",
  description:
    "与金融 AI 从业者交流经验、提出疑问、分享成果。金融大模型与 Agent Harness 领域的中文社区。",
  openGraph: {
    title: "交流与问答 · ebank.ai",
    description: "与金融 AI 从业者交流经验、提出疑问、分享成果。",
    type: "website",
  },
};

export const revalidate = 60;

const CATEGORIES = ["讨论", "问答", "分享", "资源"] as const;
type Category = (typeof CATEGORIES)[number];
const PAGE_SIZE = 20;

const categoryChip: Record<Category, string> = {
  问答: "bg-blue-500/10 text-blue-300",
  分享: "bg-emerald-500/10 text-emerald-300",
  讨论: "bg-rose-500/10 text-rose-300",
  资源: "bg-gold-500/10 text-gold-300",
};

type SearchParams = { category?: string | string[]; page?: string | string[] };

export default async function CommunityPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const rawCategory = Array.isArray(sp.category) ? sp.category[0] : sp.category;
  const category = CATEGORIES.includes(rawCategory as Category)
    ? (rawCategory as Category)
    : undefined;
  const page = Math.max(1, Number.parseInt((Array.isArray(sp.page) ? sp.page[0] : sp.page) ?? "1", 10) || 1);

  const db = getDb();
  let rows: {
    id: string;
    title: string;
    category: string;
    pinned: boolean;
    viewCount: number;
    replyCount: number;
    likeCount: number;
    createdAt: Date;
    authorName: string | null;
  }[] = [];
  let total = 0;
  let dbError = false;

  try {
    const conds = [isNull(topics.deletedAt)];
    if (category) conds.push(eq(topics.category, category));
    const where = and(...conds);

    rows = await db
      .select({
        id: topics.id,
        title: topics.title,
        category: topics.category,
        pinned: topics.pinned,
        viewCount: topics.viewCount,
        replyCount: topics.replyCount,
        likeCount: topics.likeCount,
        createdAt: topics.createdAt,
        authorName: users.name,
      })
      .from(topics)
      .innerJoin(users, eq(topics.authorId, users.id))
      .where(where)
      .orderBy(desc(topics.pinned), desc(topics.createdAt))
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE);

    const [row] = await db
      .select({ value: count() })
      .from(topics)
      .where(where);
    total = row?.value ?? 0;
  } catch (err) {
    console.error("[community] list query failed:", err);
    dbError = true;
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const paginated = rows.length > 0 && page > totalPages;

  return (
    <>
      <section className="border-b border-navy-700/50 bg-gradient-to-b from-navy-800 to-navy-900">
        <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center rounded-full border border-gold-500/30 bg-gold-500/10 px-3 py-1 text-xs font-medium text-gold-300">
              社区
            </span>
            <h1 className="mt-6 text-3xl font-bold text-white sm:text-4xl">
              交流 & 问答
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-navy-200">
              与金融 AI 从业者交流经验、提出疑问、分享成果。这里是金融 + AI 领域最大的中文社区。
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Toolbar:分类走 URL(可分享),发起话题待 #11(FRM-130)落地 */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            <Link
              href="/community"
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                !category
                  ? "border border-gold-500/30 bg-gold-500/15 text-gold-300"
                  : "border border-navy-600 text-navy-300 hover:border-navy-500 hover:text-white"
              }`}
            >
              全部
            </Link>
            {CATEGORIES.map((cat) => (
              <Link
                key={cat}
                href={cat === category ? "/community" : `/community?category=${encodeURIComponent(cat)}`}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  cat === category
                    ? "border border-gold-500/30 bg-gold-500/15 text-gold-300"
                    : "border border-navy-600 text-navy-300 hover:border-navy-500 hover:text-white"
                }`}
              >
                {cat}
              </Link>
            ))}
          </div>
          <Link
            href="/topics/new"
            className="inline-flex items-center self-start rounded-xl bg-gradient-to-r from-gold-400 to-gold-500 px-5 py-2 text-sm font-semibold text-navy-900 shadow-lg transition-all hover:brightness-110 sm:self-auto"
          >
            <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            发起话题
          </Link>
        </div>

        {/* Topic list */}
        <div className="overflow-hidden rounded-xl border border-navy-600/50 bg-navy-800/50">
          {dbError ? (
            <div className="py-16 text-center text-sm text-navy-400">
              社区数据暂时不可用,请稍后再试
            </div>
          ) : paginated ? (
            <div className="py-16 text-center text-sm text-navy-400">
              没有更多话题了
              <Link href={category ? `/community?category=${encodeURIComponent(category)}` : "/community"} className="ml-2 text-gold-400 hover:underline">
                回到第 1 页
              </Link>
            </div>
          ) : rows.length === 0 ? (
            <div className="py-16 text-center text-sm text-navy-400">
              该分类下暂无话题
            </div>
          ) : (
            rows.map((topic, idx) => (
              <Link
                key={topic.id}
                href={`/topics/${topic.id}`}
                className={`block px-5 py-4 transition-colors hover:bg-navy-700/30 ${
                  idx !== rows.length - 1 ? "border-b border-navy-700/50" : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  {topic.pinned && (
                    <span className="rounded bg-gold-500/15 px-1.5 py-0.5 text-[10px] font-medium uppercase text-gold-400">
                      置顶
                    </span>
                  )}
                  <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${categoryChip[topic.category as Category] ?? "bg-gold-500/10 text-gold-300"}`}>
                    {topic.category}
                  </span>
                </div>
                <h3 className="mt-1 truncate text-sm font-medium text-white">
                  {topic.title}
                </h3>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-navy-400">
                  <span>{topic.authorName ?? "已注销用户"}</span>
                  <span>{formatRelative(topic.createdAt)}</span>
                </div>
                <div className="mt-2 flex items-center gap-3 text-xs text-navy-400">
                  <span className="flex items-center gap-1">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
                    </svg>
                    <span>{topic.replyCount}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>{topic.viewCount}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                    </svg>
                    <span>{topic.likeCount}</span>
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Pagination */}
        {!dbError && totalPages > 1 && (
          <nav className="mt-8 flex items-center justify-center gap-4 text-sm">
            {page > 1 ? (
              <Link
                href={`/community?${new URLSearchParams({
                  ...(category ? { category } : {}),
                  page: String(page - 1),
                })}`}
                className="font-medium text-navy-300 hover:text-gold-300"
              >
                ← 上一页
              </Link>
            ) : (
              <span className="text-navy-600">← 上一页</span>
            )}
            <span className="font-mono text-xs text-navy-400">
              {page} / {totalPages}(共 {total} 条)
            </span>
            {page < totalPages ? (
              <Link
                href={`/community?${new URLSearchParams({
                  ...(category ? { category } : {}),
                  page: String(page + 1),
                })}`}
                className="font-medium text-navy-300 hover:text-gold-300"
              >
                下一页 →
              </Link>
            ) : (
              <span className="text-navy-600">下一页 →</span>
            )}
          </nav>
        )}
      </section>
    </>
  );
}
