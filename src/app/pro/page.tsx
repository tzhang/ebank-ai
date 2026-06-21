"use client";

import { useState } from "react";
import { proArticles } from "@/lib/data";
import ContentCard from "@/components/ContentCard";

const categories = ["全部", ...new Set(proArticles.map((a) => a.category))];

export default function ProPage() {
  const [activeCat, setActiveCat] = useState("全部");

  const filtered = activeCat === "全部"
    ? proArticles
    : proArticles.filter((a) => a.category === activeCat);

  return (
    <>
      <section className="border-b border-navy-700/50 bg-gradient-to-b from-navy-800 to-navy-900">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center rounded-full border border-navy-400/30 bg-navy-500/20 px-3 py-1 text-xs font-medium text-navy-200">
              专业人士
            </span>
            <h1 className="mt-6 text-3xl font-bold text-white sm:text-4xl">
              用 AI 重塑金融工作流
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-navy-200">
              面向银行、证券、保险、基金从业者。学习如何将 Claude Code、Codex、WorkBuddy、DeepSeek 等 AI 工具融入日常工作。
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">
            全部内容
            <span className="ml-2 text-sm font-normal text-navy-400">({filtered.length})</span>
          </h2>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCat(cat)}
                className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  activeCat === cat
                    ? "bg-gold-500/15 text-gold-300 border border-gold-500/30"
                    : "text-navy-300 border border-navy-600 hover:border-navy-500 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 animate-stagger">
          {filtered.map((article) => (
            <ContentCard
              key={article.slug}
              title={article.title}
              desc={article.description}
              difficulty={article.difficulty}
              href={`/pro/${article.slug}`}
            />
          ))}
        </div>
      </section>
    </>
  );
}
