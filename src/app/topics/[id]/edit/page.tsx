import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq, isNull } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { topics } from "@/lib/db/schema";
import { requireUser } from "@/lib/session";
import EditTopicForm from "@/components/forum/EditTopicForm";

// M1 FRM-132 — 编辑话题页。仅作者本人可访问(403 兜底在服务端动作)。
export default async function EditTopicPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const db = getDb();
  const [topic] = await db
    .select({
      id: topics.id,
      title: topics.title,
      content: topics.content,
      category: topics.category,
      authorId: topics.authorId,
    })
    .from(topics)
    .where(and(eq(topics.id, id), isNull(topics.deletedAt)))
    .limit(1);
  if (!topic) notFound();
  if (!user || user.id !== topic.authorId) {
    return (
      <section className="border-b border-navy-700/50 bg-gradient-to-b from-navy-800 to-navy-900 py-20">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <h1 className="text-2xl font-bold text-white">无权编辑</h1>
          <p className="mt-3 text-navy-300">只有作者本人可以编辑这个话题。</p>
          <Link href={`/topics/${topic.id}`} className="mt-6 inline-block text-gold-400 hover:underline">
            ← 返回话题
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="border-b border-navy-700/50 bg-gradient-to-b from-navy-800 to-navy-900 py-16">
      <div className="mx-auto w-full max-w-3xl px-4">
        <Link href={`/topics/${topic.id}`} className="text-sm text-navy-400 hover:text-gold-300">
          ← 返回话题
        </Link>
        <h1 className="mt-3 text-2xl font-bold text-white">编辑话题</h1>
        <div className="mt-6 rounded-2xl border border-navy-600/60 bg-navy-800/60 p-6">
          <EditTopicForm
            topicId={topic.id}
            initialTitle={topic.title}
            initialContent={topic.content}
            initialCategory={topic.category}
          />
        </div>
      </div>
    </section>
  );
}
