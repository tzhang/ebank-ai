import { getDb } from "@/lib/db";
import { bannedWords } from "@/lib/db/schema";

// M1 FRM-136 — 敏感词检查(DB 词库 + 内存缓存)。
// - 词库存 banned_words 表,管理端增删后调用 bustSensitiveCache() 立即生效;
// - 缓存兜底:词库查询失败时 fail-open(放行)并记日志——阻止发布是更坏的用户体验,
//   合规取舍已记录,待 #21 评审复核。
// - 命中即拒:发布/回复/编辑统一 await checkSensitive。

const CACHE_TTL_MS = 60_000;
let cache: { terms: string[]; at: number } | null = null;

export function bustSensitiveCache(): void {
  cache = null;
}

async function loadTerms(): Promise<string[]> {
  if (cache && Date.now() - cache.at < CACHE_TTL_MS) return cache.terms;
  const db = getDb();
  try {
    const rows = await db.select({ term: bannedWords.term }).from(bannedWords);
    const terms = rows.map((r) => r.term).filter((t): t is string => Boolean(t));
    cache = { terms, at: Date.now() };
    return terms;
  } catch (err) {
    console.error("[censor] 词库加载失败(fail-open):", err);
    cache = { terms: [], at: Date.now() };
    return [];
  }
}

export async function checkSensitive(text: string): Promise<{ blocked: boolean; term?: string }> {
  const terms = await loadTerms();
  for (const term of terms) {
    if (term && text.includes(term)) return { blocked: true, term };
  }
  return { blocked: false };
}
