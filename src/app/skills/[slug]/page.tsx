import { notFound } from "next/navigation";
import Link from "next/link";
import { allSkills } from "@/lib/data";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return allSkills.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = allSkills.find((s) => s.slug === slug);
  if (!item) return { title: "资源未找到" };
  return { title: `${item.name} | 技能库`, description: item.description };
}

export default async function SkillDetailPage({ params }: Props) {
  const { slug } = await params;
  const item = allSkills.find((s) => s.slug === slug);
  if (!item) notFound();

  // If this is a GitHub-sourced item, show a quick detail page with a link to GitHub
  if (item.githubUrl) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/skills" className="inline-flex items-center text-sm text-navy-300 hover:text-gold-300 transition-colors">
            <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            返回技能库
          </Link>
        </div>

        <header className="mb-10">
          <div className="mb-4 flex items-center gap-3 flex-wrap">
            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${
              item.type === "Skill"
                ? "border-gold-500/30 bg-gold-500/10 text-gold-300"
                : "border-blue-500/30 bg-blue-500/10 text-blue-300"
            }`}>
              {item.type}
            </span>
            <span className="text-xs text-navy-400">{item.tool}</span>
            {item.language && (
              <>
                <span className="text-xs text-navy-500">·</span>
                <span className="text-xs text-navy-400">{item.language}</span>
              </>
            )}
            {item.githubStars && (
              <>
                <span className="text-xs text-navy-500">·</span>
                <span className="flex items-center gap-1 text-xs text-navy-400">
                  <svg className="h-3 w-3" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z"/>
                  </svg>
                  {item.githubStars}
                </span>
              </>
            )}
          </div>

          <h1 className="font-mono text-2xl font-bold text-white sm:text-3xl">{item.name}</h1>
          <p className="mt-4 text-lg leading-relaxed text-navy-200">{item.description}</p>

          <div className="mt-6 flex flex-wrap gap-2">
            {item.tags.map((tag) => (
              <span key={tag} className="inline-flex items-center rounded-full border border-navy-500/30 bg-navy-700/40 px-2.5 py-0.5 text-xs font-medium text-navy-300">
                {tag}
              </span>
            ))}
          </div>
        </header>

        {item.sections.length > 0 && (
          <div className="space-y-10">
            {item.sections.map((section, i) => (
              <section key={i}>
                <h2 className="mb-4 text-xl font-semibold text-white">{section.heading}</h2>
                <p className="leading-relaxed text-navy-200">{section.body}</p>
              </section>
            ))}
          </div>
        )}

        <div className="mt-10 rounded-xl border border-gold-500/20 bg-gold-500/5 p-6 text-center">
          <p className="text-sm text-navy-300 mb-4">该项目托管在 GitHub 上，点击查看完整源码和文档</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href={item.githubUrl!}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-xl bg-gradient-to-r from-gold-400 to-gold-500 px-6 py-3 text-sm font-semibold text-navy-900 shadow-lg transition-all hover:brightness-110"
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
              </svg>
              GitHub 仓库
            </a>
            {item.mirrorUrl && (
              <a
                href={item.mirrorUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-xl border border-navy-500 bg-navy-800/50 px-6 py-3 text-sm font-semibold text-navy-100 transition-all hover:border-navy-400 hover:bg-navy-700"
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M7.5 2.5C8.09.82 9.89.06 11.32.82c1.04.5 1.08 1.91.08 2.6l-.01.01c-1.02.7-1.41 2.03-.9 3.19.54 1.22 1.97 1.56 3.02.77.89-.67 2.2-.5 2.88.4.67.89.5 2.2-.4 2.88-.8.6-1.75.85-2.69.71-1.87-.27-3.57-1.68-4.05-3.63-.27-1.1-.01-2.23.54-3.29.72-1.38.93-2.74-.3-3.17a1.47 1.47 0 00-1.87.68 1.49 1.49 0 00.15 1.54zm6.91 10.43a.75.75 0 01.47.56.76.76 0 01-.31.72 5.12 5.12 0 01-2.46 1.19c-1.78.36-3.78.09-5.66-.56a11.49 11.49 0 01-3.88-2.41A12.28 12.28 0 01.42 9.2a5.12 5.12 0 01-.56-2.66.75.75 0 01.72-.56.75.75 0 01.72.54c.18.63.5 1.22.94 1.72l.01.01.01.01a10.99 10.99 0 003.46 2.3c1.66.76 3.47 1.1 5.08.82a3.62 3.62 0 001.76-.81.75.75 0 01.77-.12z"/>
                </svg>
                国内镜像
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Original detail page for non-GitHub items
  return (
    <>
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/skills" className="inline-flex items-center text-sm text-navy-300 hover:text-gold-300 transition-colors">
            <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            返回技能库
          </Link>
        </div>

        <header className="mb-10">
          <div className="mb-4 flex items-center gap-3 flex-wrap">
            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${
              item.type === "Skill"
                ? "border-gold-500/30 bg-gold-500/10 text-gold-300"
                : "border-blue-500/30 bg-blue-500/10 text-blue-300"
            }`}>
              {item.type}
            </span>
            <span className="text-xs text-navy-400">{item.tool}</span>
            <span className="text-xs text-navy-500">·</span>
            <span className="text-xs text-navy-400">{item.downloads} 次下载</span>
          </div>

          <h1 className="font-mono text-2xl font-bold text-white sm:text-3xl">{item.name}</h1>
          <p className="mt-4 text-lg leading-relaxed text-navy-200">{item.description}</p>

          <div className="mt-6 flex flex-wrap gap-2">
            {item.tags.map((tag) => (
              <span key={tag} className="inline-flex items-center rounded-full border border-navy-500/30 bg-navy-700/40 px-2.5 py-0.5 text-xs font-medium text-navy-300">
                {tag}
              </span>
            ))}
          </div>
        </header>

        <div className="space-y-10">
          {item.sections.map((section, i) => (
            <section key={i}>
              <h2 className="mb-4 text-xl font-semibold text-white">{section.heading}</h2>
              <p className="leading-relaxed text-navy-200">{section.body}</p>
            </section>
          ))}
        </div>

        <section className="mt-10">
          <h2 className="mb-4 text-xl font-semibold text-white">安装指南</h2>
          <p className="mb-4 text-sm text-navy-300">{item.installGuide}</p>
          <div className="rounded-xl border border-navy-600/50 bg-navy-900 p-4 overflow-x-auto">
            <pre className="text-xs leading-relaxed text-navy-200 whitespace-pre-wrap font-mono">{item.configSnippet}</pre>
          </div>
          <button className="mt-4 inline-flex items-center rounded-lg bg-navy-700 px-4 py-2 text-sm font-medium text-navy-200 transition-colors hover:bg-navy-600 hover:text-white">
            <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            复制配置
          </button>
        </section>
      </div>
    </>
  );
}
