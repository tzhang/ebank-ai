import { notFound } from "next/navigation";
import Link from "next/link";
import { proArticles } from "@/lib/data";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return proArticles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = proArticles.find((a) => a.slug === slug);
  if (!article) return { title: "文章未找到" };
  return { title: `${article.title} | 专业人士`, description: article.description };
}

export default async function ProArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = proArticles.find((a) => a.slug === slug);
  if (!article) notFound();

  const diffColor =
    article.difficulty === "初级"
      ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
      : article.difficulty === "中级"
      ? "bg-gold-500/10 text-gold-300 border-gold-500/30"
      : "bg-rose-500/10 text-rose-300 border-rose-500/30";

  const diffLabel = { "初级": "入门", "中级": "进阶", "高级": "高级" };

  return (
    <>
      <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/pro"
            className="inline-flex items-center text-sm text-navy-300 hover:text-gold-300 transition-colors"
          >
            <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            返回专业人士
          </Link>
        </div>

        <header className="mb-10">
          <div className="mb-4 flex items-center gap-3 flex-wrap">
            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${diffColor}`}>
              {diffLabel[article.difficulty]}
            </span>
            <span className="text-xs text-navy-400">{article.category}</span>
            <span className="text-xs text-navy-500">·</span>
            <span className="text-xs text-navy-400">{article.readTime}</span>
          </div>

          <h1 className="text-3xl font-bold leading-tight text-white sm:text-4xl">{article.title}</h1>

          <div className="mt-4 flex items-center gap-4 text-sm text-navy-400">
            <span>{article.author}</span>
            <span className="text-navy-500">·</span>
            <span>{article.date}</span>
          </div>

          <p className="mt-4 text-lg leading-relaxed text-navy-200">{article.description}</p>
        </header>

        <div className="space-y-10">
          {article.sections.map((section, i) => (
            <section key={i}>
              <h2 className="mb-4 text-xl font-semibold text-white">{section.heading}</h2>
              <p className="leading-relaxed text-navy-200">{section.body}</p>
            </section>
          ))}
        </div>

        <div className="mt-12 rounded-xl border border-navy-600/50 bg-navy-800/50 p-6 text-center">
          <p className="text-sm text-navy-300">
            这篇文章对你有帮助吗？在
            <Link href="/community" className="mx-1 text-gold-300 hover:text-gold-200">社区</Link>
            分享你的想法和问题。
          </p>
        </div>
      </article>
    </>
  );
}
