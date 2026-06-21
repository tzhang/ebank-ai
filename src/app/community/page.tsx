"use client";

import { useState, useMemo } from "react";
import { communityTopics } from "@/lib/data";

const categories = ["全部", "讨论", "问答", "分享", "资源"] as const;

export default function CommunityPage() {
  const [activeCategory, setActiveCategory] = useState("全部");

  const filtered = useMemo(() => {
    if (activeCategory === "全部") return communityTopics;
    return communityTopics.filter((t) => t.category === activeCategory);
  }, [activeCategory]);

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
        {/* Toolbar */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  activeCategory === cat
                    ? "bg-gold-500/15 text-gold-300 border border-gold-500/30"
                    : "text-navy-300 border border-navy-600 hover:border-navy-500 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <button className="inline-flex items-center rounded-xl bg-gradient-to-r from-gold-400 to-gold-500 px-5 py-2 text-sm font-semibold text-navy-900 shadow-lg transition-all hover:brightness-110">
            <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            发起话题
          </button>
        </div>

        {/* Topic list */}
        <div className="rounded-xl border border-navy-600/50 bg-navy-800/50 overflow-hidden animate-stagger">
          {filtered.map((topic, idx) => (
            <div
              key={topic.id}
              className={`flex items-center justify-between px-5 py-4 transition-colors hover:bg-navy-700/30 cursor-pointer ${
                idx !== filtered.length - 1 ? "border-b border-navy-700/50" : ""
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {topic.pinned && (
                    <span className="rounded bg-gold-500/15 px-1.5 py-0.5 text-[10px] font-medium text-gold-400 uppercase">
                      置顶
                    </span>
                  )}
                  <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
                    topic.category === "问答" ? "bg-blue-500/10 text-blue-300" :
                    topic.category === "分享" ? "bg-emerald-500/10 text-emerald-300" :
                    topic.category === "讨论" ? "bg-rose-500/10 text-rose-300" :
                    "bg-gold-500/10 text-gold-300"
                  }`}>
                    {topic.category}
                  </span>
                </div>
                <h3 className="mt-1 text-sm font-medium text-white truncate">{topic.title}</h3>
                <div className="mt-1 flex items-center gap-3 text-xs text-navy-400">
                  <span>{topic.author}</span>
                  <span>{topic.time}</span>
                  <span>最后回复 {topic.lastReply}</span>
                </div>
              </div>
              <div className="ml-4 flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-1 text-xs text-navy-400">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
                  </svg>
                  <span>{topic.replies}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-navy-500">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span>{topic.views}</span>
                </div>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="py-16 text-center text-sm text-navy-400">
              该分类下暂无话题
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          <button className="text-sm font-medium text-navy-300 hover:text-gold-300 transition-colors">
            查看更多讨论 →
          </button>
        </div>
      </section>
    </>
  );
}
