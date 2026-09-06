"use client";

import { useEffect } from "react";

// M1 FRM-133 — 浏览计数上报:每会话(sessionStorage)5 分钟限一次。
// 纯副作用组件,不渲染任何内容。
export default function ViewTracker({ topicId }: { topicId: string }) {
  useEffect(() => {
    const KEY = `ebank_viewed_${topicId}`;
    try {
      const last = Number(sessionStorage.getItem(KEY) || 0);
      if (Date.now() - last < 5 * 60 * 1000) return;
      sessionStorage.setItem(KEY, String(Date.now()));
    } catch {
      // 隐私模式等 storage 不可用场景:照常计数一次
    }
    fetch(`/api/topics/${encodeURIComponent(topicId)}/view`, { method: "POST" }).catch(() => {});
  }, [topicId]);
  return null;
}
