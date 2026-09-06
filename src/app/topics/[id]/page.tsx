import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { and, asc, count, eq, inArray, isNull } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { topics, replies, users, topicLikes } from "@/lib/db/schema";
import { requireUser } from "@/lib/session";
import { formatRelative } from "@/lib/time";
import Markdown from "@/components/Markdown";
import ReplyForm from "@/components/forum/ReplyForm";
import ReplyActions from "@/components/forum/ReplyActions";
import OwnerTopicControls from "@/components/forum/OwnerTopicControls";
import ReportButton from "@/components/forum/ReportButton";
import ViewTracker from "@/components/forum/ViewTracker";
import LikeButton from "@/components/forum/LikeButton";

// M1 FRM-131/132/133 — 话题详情。
// 硬删除语义:deleted_at 非空视为 404;锁帖禁回复双层拦截。
// 浏览计数经 ViewTracker 每会话节流上报;点赞 toggle 走 JSON API。

const FLOORS_PAGE = 50;

type DetailParams = { id: string };

const categoryChip: Record<string, string> = {
  问答: "bg-blue-500/10 text-blue-300",
  分享: "bg-emerald-500/10 text-emerald-300",
  讨论: "bg-rose-500/10 text-rose-300",
  资源: "bg-gold-500/10 text-gold-300",
};

export async function generateMetadata({ params }: { params: Promise<DetailParams> }): Promise<Metadata> {
  const { id } = await params;
  const db = getDb();
  try {
    const [t] = await db
      .select({ title: topics.title, content: topics.content })
      .from(topics)
      .where(and(eq(topics.id, id), isNull(topics.deletedAt)))
      .limit(1);
    if (!t) return { title: "话题不存在 · ebank.ai" };
    return {
      title: `${t.title} · ebank.ai 社区`,
      description: t.content.replace(/\s+/g, " ").slice(0, 150),
      openGraph: { title: `${t.title} · ebank.ai 社区`, type: "article" },
    };
  } catch {
    return { title: "ebank.ai 社区" };
  }
}

interface FloorRow {
  id: string;
  content: string;
  createdAt: Date;
  authorId: string;
  authorName: string | null;
}
interface ChildRow {
  id: string;
  parentId: string | null;
  content: string;
  createdAt: Date;
  authorId: string;
  authorName: string | null;
}

export default async function TopicDetailPage({
  params,
  searchParams,
}: {
  params: Promise<DetailParams>;
  searchParams: Promise<{ p?: string | string[]; ok?: string | string[]; err?: string | string[] }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const page = Math.max(1, Number.parseInt((Array.isArray(sp.p) ? sp.p[0] : sp.p) ?? "1", 10) || 1);
  const db = getDb();

  const [topic] = await db
    .select({
      id: topics.id,
      title: topics.title,
      content: topics.content,
      category: topics.category,
      pinned: topics.pinned,
      featured: topics.featured,
      locked: topics.locked,
      viewCount: topics.viewCount,
      likeCount: topics.likeCount,
      replyCount: topics.replyCount,
      createdAt: topics.createdAt,
      authorId: topics.authorId,
      authorName: users.name,
    })
    .from(topics)
    .innerJoin(users, eq(topics.authorId, users.id))
    .where(and(eq(topics.id, id), isNull(topics.deletedAt)))
    .limit(1);

  if (!topic) notFound();

  const user = await requireUser();
  const [me] = user
    ? await db
        .select({ emailVerified: users.emailVerified })
        .from(users)
        .where(eq(users.id, user.id))
        .limit(1)
    : [];
  const verified = Boolean(me?.emailVerified);
  const isOwner = Boolean(user && topic.authorId === user.id);
  let liked = false;
  if (user) {
    const [row] = await db
      .select({ userId: topicLikes.userId })
      .from(topicLikes)
      .where(and(eq(topicLikes.topicId, id), eq(topicLikes.userId, user.id)))
      .limit(1);
    liked = Boolean(row);
  }

  const offset = (page - 1) * FLOORS_PAGE;
  // 楼层分页按「顶层回复数」计(header 的 replyCount 含楼中楼,口径不同)
  const [floors, totalRow] = await Promise.all([
    db
      .select({
        id: replies.id,
        content: replies.content,
        createdAt: replies.createdAt,
        authorId: replies.authorId,
        authorName: users.name,
      })
      .from(replies)
      .innerJoin(users, eq(replies.authorId, users.id))
      .where(and(eq(replies.topicId, id), isNull(replies.parentId), isNull(replies.deletedAt)))
      .orderBy(asc(replies.createdAt), asc(replies.id))
      .limit(FLOORS_PAGE)
      .offset(offset),
    db
      .select({ value: count() })
      .from(replies)
      .where(and(eq(replies.topicId, id), isNull(replies.parentId), isNull(replies.deletedAt))),
  ]);
  const totalFloors = totalRow[0]?.value ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalFloors / FLOORS_PAGE));

  // 楼中楼:一次拉取本页楼层的全部子回复,内存分组
  const floorIds = floors.map((f) => f.id);
  const children: ChildRow[] =
    floorIds.length > 0
      ? await db
          .select({
            id: replies.id,
            parentId: replies.parentId,
            content: replies.content,
            createdAt: replies.createdAt,
            authorId: replies.authorId,
            authorName: users.name,
          })
          .from(replies)
          .innerJoin(users, eq(replies.authorId, users.id))
          .where(and(eq(replies.topicId, id), inArray(replies.parentId, floorIds), isNull(replies.deletedAt)))
          .orderBy(asc(replies.createdAt), asc(replies.id))
      : [];
  const childrenByParent = new Map<string, ChildRow[]>();
  for (const c of children) {
    const list = childrenByParent.get(c.parentId!) ?? [];
    list.push(c);
    childrenByParent.set(c.parentId!, list);
  }

  const okFlag = !Array.isArray(sp.ok) && sp.ok === "1";
  const errFlag = !Array.isArray(sp.err) && sp.err === "1";

  return (
    <section className="border-b border-navy-700/50 bg-gradient-to-b from-navy-800 to-navy-900 py-12">
      <ViewTracker topicId={id} />
      <div className="mx-auto w-full max-w-3xl px-4">
        <Link href="/community" className="text-sm text-navy-400 hover:text-gold-300">
          ← 返回社区
        </Link>

        {okFlag && (
          <p className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
            修改已保存
          </p>
        )}
        {errFlag && (
          <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
            操作失败,请重试
          </p>
        )}

        {/* 话题头 */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {topic.pinned && (
            <span className="rounded bg-gold-500/15 px-1.5 py-0.5 text-[10px] font-medium uppercase text-gold-400">置顶</span>
          )}
          {topic.featured && (
            <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-300">精华</span>
          )}
          <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${categoryChip[topic.category] ?? ""}`}>
            {topic.category}
          </span>
          {topic.locked && (
            <span className="rounded bg-navy-600/60 px-1.5 py-0.5 text-[10px] font-medium text-navy-300">已锁定</span>
          )}
        </div>
        <h1 className="mt-3 text-2xl font-bold text-white sm:text-3xl">{topic.title}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-navy-400">
          <span>{topic.authorName ?? "已注销用户"}</span>
          <span>{formatRelative(topic.createdAt)}</span>
          <span>{topic.replyCount} 回复 · {topic.viewCount} 浏览</span>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <LikeButton
            topicId={topic.id}
            initialLiked={liked}
            initialCount={topic.likeCount}
            loggedIn={Boolean(user)}
          />
          <div className="flex items-center gap-4">
            {user && !isOwner && <ReportButton targetType="topic" targetId={topic.id} compact />}
            {isOwner && <OwnerTopicControls topicId={topic.id} />}
          </div>
        </div>

        {/* 正文 */}
        <div className="mt-6 rounded-2xl border border-navy-600/50 bg-navy-800/50 px-5 py-6 sm:px-7">
          <Markdown>{topic.content}</Markdown>
        </div>

        {/* 回复区 */}
        <h2 className="mt-10 text-lg font-semibold text-white">
          回复 <span className="font-mono text-sm text-navy-400">{totalFloors}</span>
        </h2>
        <div className="mt-4 overflow-hidden rounded-xl border border-navy-600/50 bg-navy-800/50">
          {floors.length === 0 && <p className="py-12 text-center text-sm text-navy-500">还没有回复,来抢沙发</p>}
          {floors.map((floor: FloorRow, i) => {
            const kids = childrenByParent.get(floor.id) ?? [];
            return (
              <div key={floor.id} className={`px-5 py-4 ${i !== floors.length - 1 || kids.length ? "border-b border-navy-700/50" : ""}`}>
                <div className="flex items-center gap-3 text-xs text-navy-400">
                  <span className="font-mono text-navy-500">#{offset + i + 1}</span>
                  <span className="font-medium text-navy-200">{floor.authorName ?? "已注销用户"}</span>
                  <span>{formatRelative(floor.createdAt)}</span>
                </div>
                <div className="mt-2 text-sm leading-relaxed text-navy-100">
                  <Markdown>{floor.content}</Markdown>
                </div>
                <div className="mt-2 flex items-center gap-4">
                  {user && floor.authorId === user.id ? (
                    <ReplyActions topicId={id} replyId={floor.id} initialContent={floor.content} />
                  ) : user ? (
                    <ReportButton targetType="reply" targetId={floor.id} compact />
                  ) : null}
                </div>
                {kids.length > 0 && (
                  <div className="mt-3 space-y-3 rounded-lg border border-navy-700/50 bg-navy-900/40 p-3">
                    {kids.map((c) => (
                      <div key={c.id} className="text-xs leading-relaxed">
                        <span className="font-medium text-navy-300">
                          {c.authorName ?? "已注销用户"}
                          <span className="text-navy-500"> 回复 · {formatRelative(c.createdAt)}</span>
                        </span>
                        <div className="mt-1 text-sm text-navy-200">
                          <Markdown>{c.content}</Markdown>
                        </div>
                        {user && (
                          <div className="mt-1">
                            {c.authorId === user.id ? (
                              <ReplyActions topicId={id} replyId={c.id} initialContent={c.content} />
                            ) : (
                              <ReportButton targetType="reply" targetId={c.id} compact />
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 分页(楼层) */}
        {totalPages > 1 && (
          <nav className="mt-6 flex items-center justify-center gap-4 text-sm">
            {page > 1 ? (
              <Link href={`/topics/${id}?p=${page - 1}`} className="text-navy-300 hover:text-gold-300">← 上一页</Link>
            ) : (
              <span className="text-navy-600">← 上一页</span>
            )}
            <span className="font-mono text-xs text-navy-400">{page} / {totalPages}</span>
            {page < totalPages ? (
              <Link href={`/topics/${id}?p=${page + 1}`} className="text-navy-300 hover:text-gold-300">下一页 →</Link>
            ) : (
              <span className="text-navy-600">下一页 →</span>
            )}
          </nav>
        )}

        {/* 回复框 */}
        <div className="mt-8 rounded-2xl border border-navy-600/50 bg-navy-800/50 p-5">
          <h3 className="mb-3 text-sm font-semibold text-white">参与回复</h3>
          <ReplyForm topicId={id} locked={topic.locked} canPost={Boolean(user)} verified={verified} />
        </div>
      </div>
    </section>
  );
}
