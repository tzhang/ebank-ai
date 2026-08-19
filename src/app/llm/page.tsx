"use client";

import { useState } from "react";
import { llmArticles } from "@/lib/data";
import ContentCard from "@/components/ContentCard";

const difficulties = ["全部", "初级", "中级", "高级"] as const;

export default function LlmPage() {
  const [activeDiff, setActiveDiff] = useState<string>("全部");

  const filtered = activeDiff === "全部"
    ? llmArticles
    : llmArticles.filter((a) => a.difficulty === activeDiff);

  return (
    <>
      <section className="border-b border-navy-700/50 bg-gradient-to-b from-navy-800 to-navy-900">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center rounded-full border border-gold-500/30 bg-gold-500/10 px-3 py-1 text-xs font-medium text-gold-300">
              金融大模型
            </span>
            <h1 className="mt-6 text-3xl font-bold text-white sm:text-4xl">
              选对模型，用对模型
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-navy-200">
              从模型全景、选型框架到评测方法，深入理解 DeepSeek、Claude、GPT 等
              大模型在金融场景的能力边界与最佳实践。
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Filter */}
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">
            全部文章
            <span className="ml-2 text-sm font-normal text-navy-400">({filtered.length})</span>
          </h2>
          <div className="flex gap-2">
            {difficulties.map((d) => (
              <button
                key={d}
                onClick={() => setActiveDiff(d)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  activeDiff === d
                    ? "bg-gold-500/15 text-gold-300 border border-gold-500/30"
                    : "text-navy-300 border border-navy-600 hover:border-navy-500 hover:text-white"
                }`}
              >
                {d === "全部" ? "全部" : d === "初级" ? "入门" : d === "中级" ? "进阶" : "高级"}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 animate-stagger">
          {filtered.map((article) => (
            <ContentCard
              key={article.slug}
              title={article.title}
              desc={article.description}
              difficulty={article.difficulty}
              href={`/llm/${article.slug}`}
            />
          ))}
        </div>
      </section>
    </>
  );
}
