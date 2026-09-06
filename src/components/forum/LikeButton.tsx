"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// M1 FRM-133 — 点赞按钮(未登录点击引导登录;toggle 走服务端返回权威状态)。
export default function LikeButton({
  topicId,
  initialLiked,
  initialCount,
  loggedIn,
}: {
  topicId: string;
  initialLiked: boolean;
  initialCount: number;
  loggedIn: boolean;
}) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function toggle() {
    if (!loggedIn) {
      router.push(`/login?callbackUrl=/topics/${encodeURIComponent(topicId)}`);
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/topics/${encodeURIComponent(topicId)}/like`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        setLiked(data.liked);
        setCount(data.likeCount);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      aria-pressed={liked}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors disabled:opacity-60 ${
        liked
          ? "border-gold-500/40 bg-gold-500/15 text-gold-300"
          : "border-navy-600 text-navy-300 hover:border-gold-500/40 hover:text-gold-300"
      }`}
    >
      <svg className="h-3.5 w-3.5" fill={liked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
      {count}
    </button>
  );
}
