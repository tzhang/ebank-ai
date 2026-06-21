"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { allSkills } from "@/lib/data"
import WantButton from "@/components/WantButton"
import InstallPopover from "@/components/InstallPopover";

const typeFilters = ["全部", "Skill", "MCP"];

export default function SkillsPage() {
  const [activeType, setActiveType] = useState("全部");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return allSkills.filter((item) => {
      const matchType = activeType === "全部" || item.type === activeType;
      const matchSearch = !search || 
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase()) ||
        item.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
      return matchType && matchSearch;
    });
  }, [activeType, search]);

  return (
    <>
      <section className="border-b border-navy-700/50 bg-gradient-to-b from-navy-800 to-navy-900">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center rounded-full border border-gold-500/30 bg-gold-500/10 px-3 py-1 text-xs font-medium text-gold-300">
              技能库
            </span>
            <h1 className="mt-6 text-3xl font-bold text-white sm:text-4xl">
              开源金融 AI 资源集
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-navy-200">
              精选 GitHub 上最优质的金融 AI Skills、MCP 服务、量化工具和 Agent 项目。
              全部开源，可直接使用和贡献。
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Filters + Search */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2">
            {typeFilters.map((t) => (
              <button
                key={t}
                onClick={() => setActiveType(t)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  activeType === t
                    ? "bg-gold-500/15 text-gold-300 border border-gold-500/30"
                    : "text-navy-300 border border-navy-600 hover:border-navy-500 hover:text-white"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="relative">
            <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索项目名称、描述或标签..."
              className="w-56 rounded-lg border border-navy-600 bg-navy-800 py-2 pl-9 pr-3 text-sm text-white placeholder-navy-400 outline-none transition-colors focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/20"
            />
          </div>
        </div>

        {/* Results count */}
        <p className="mb-6 text-xs text-navy-400">
          {filtered.length === 0
            ? "没有找到匹配的资源"
            : `共 ${filtered.length} 个项目`}
        </p>

        {/* Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <a
              key={item.slug}
              href={item.githubUrl || `/skills/${item.slug}`}
              target={item.githubUrl ? "_blank" : undefined}
              rel={item.githubUrl ? "noopener noreferrer" : undefined}
              className="group relative rounded-xl border border-navy-600/50 bg-navy-800/50 p-5 card-hover"
            >
              {/* Type badge */}
              <div className="mb-3 flex items-center gap-2">
                <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                  item.type === "Skill"
                    ? "border-gold-500/30 bg-gold-500/10 text-gold-300"
                    : "border-blue-500/30 bg-blue-500/10 text-blue-300"
                }`}>
                  {item.type}
                </span>
                <span className="text-[10px] font-medium text-navy-400">{item.tool}</span>
                {item.githubStars && (
                  <span className="ml-auto flex items-center gap-1 text-[10px] text-navy-400">
                    <svg className="h-3 w-3" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z"/>
                    </svg>
                    {item.githubStars}
                  </span>
                )}
              </div>
              {/* Title */}
              <h3 className="font-mono text-sm font-medium text-white group-hover:text-gold-300 transition-colors">
                {item.name}
              </h3>
              {/* Description */}
              <p className="mt-2 text-xs leading-relaxed text-navy-300 line-clamp-3">{item.description}</p>
              {/* Language */}
              {item.language && (
                <span className="mt-2 inline-flex items-center gap-1 text-[10px] text-navy-400">
                  <span className="h-2 w-2 rounded-full bg-navy-400" />
                  {item.language}
                </span>
              )}
              {/* Tags */}
              {item.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {item.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="rounded-full bg-navy-700/50 px-2 py-0.5 text-[10px] font-medium text-navy-400">
                      {tag}
                    </span>
                  ))}
                  {item.tags.length > 3 && (
                    <span className="rounded-full bg-navy-700/50 px-2 py-0.5 text-[10px] font-medium text-navy-500">
                      +{item.tags.length - 3}
                    </span>
                  )}
                </div>
              )}
              {/* Action area */}
              <div className="mt-3 flex items-center gap-2">
                <InstallPopover
                  name={item.name}
                  type={item.type}
                  installGuide={item.installGuide}
                  configSnippet={item.configSnippet}
                  tool={item.tool}
                />
                {item.githubUrl ? (
                  <div className="flex items-center gap-2 text-[10px] ml-auto">
                    <span className="flex items-center gap-1 text-navy-500 group-hover:text-navy-400 transition-colors">
                      <svg className="h-3 w-3" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
                      </svg>
                      GitHub
                    </span>
                    {item.mirrorUrl && (
                      <span className="text-navy-400">·</span>
                    )}
                    {item.mirrorUrl && (
                      <a
                        href={item.mirrorUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 text-navy-500 hover:text-gold-300 transition-colors"
                      >
                        <svg className="h-3 w-3" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M7.5 2.5C8.09.82 9.89.06 11.32.82c1.04.5 1.08 1.91.08 2.6l-.01.01c-1.02.7-1.41 2.03-.9 3.19.54 1.22 1.97 1.56 3.02.77.89-.67 2.2-.5 2.88.4.67.89.5 2.2-.4 2.88-.8.6-1.75.85-2.69.71-1.87-.27-3.57-1.68-4.05-3.63-.27-1.1-.01-2.23.54-3.29.72-1.38.93-2.74-.3-3.17a1.47 1.47 0 00-1.87.68 1.49 1.49 0 00.15 1.54zm6.91 10.43a.75.75 0 01.47.56.76.76 0 01-.31.72 5.12 5.12 0 01-2.46 1.19c-1.78.36-3.78.09-5.66-.56a11.49 11.49 0 01-3.88-2.41A12.28 12.28 0 01.42 9.2a5.12 5.12 0 01-.56-2.66.75.75 0 01.72-.56.75.75 0 01.72.54c.18.63.5 1.22.94 1.72l.01.01.01.01a10.99 10.99 0 003.46 2.3c1.66.76 3.47 1.1 5.08.82a3.62 3.62 0 001.76-.81.75.75 0 01.77-.12z"/>
                        </svg>
                        国内镜像
                      </a>
                    )}
                  </div>
                ) : (
                  <WantButton slug={item.slug} name={item.name} />
                )}
              </div>
            </a>
          ))}
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-sm text-navy-400">换个关键词试试，或提交你的 Skill</p>
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="border-t border-navy-700/50 bg-navy-800/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="text-xl font-bold text-white">贡献你的 Skill</h2>
            <p className="mt-2 text-sm text-navy-300">
              有好的金融 AI 实践？提交你的 Skill 或 MCP 配置，帮助更多同行。
            </p>
            <a
              href="https://github.com/tonychen87/ebank.ai/issues/new"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center rounded-xl bg-gradient-to-r from-gold-400 to-gold-500 px-6 py-3 text-sm font-semibold text-navy-900 shadow-lg transition-all hover:brightness-110"
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
              </svg>
              提交资源
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
