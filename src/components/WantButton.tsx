"use client";

import { useState, useEffect } from "react";

interface WantButtonProps {
  slug: string;
  name: string;
  initialCount?: number;
}

export default function WantButton({ slug, name, initialCount = 0 }: WantButtonProps) {
  const [wanted, setWanted] = useState(false);
  const [count, setCount] = useState(initialCount);
  const [animating, setAnimating] = useState(false);

  // On mount, read localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`ebank-want-${slug}`);
      if (stored === "1") {
        setWanted(true);
      }
      // Read stored count from localStorage (shared via some mechanism)
      // For now, just use the initialCount
    } catch {
      // localStorage not available
    }
  }, [slug]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (wanted) return;

    try {
      localStorage.setItem(`ebank-want-${slug}`, "1");
    } catch {
      // localStorage not available
    }

    setWanted(true);
    setCount((c) => c + 1);
    setAnimating(true);
    setTimeout(() => setAnimating(false), 500);
  };

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
        wanted
          ? "bg-gold-500/15 text-gold-300 border border-gold-500/30"
          : "bg-navy-700/50 text-navy-300 border border-navy-600 hover:border-gold-500/40 hover:text-gold-300"
      } ${animating ? "scale-110" : ""}`}
      title={
        wanted
          ? "你已表达了对这个技能的关注"
          : "表示你想要这个技能，积累关注度推动作者开源"
      }
    >
      <svg
        className={`h-3.5 w-3.5 transition-transform ${wanted ? "fill-current" : "stroke-current fill-none"}`}
        viewBox="0 0 24 24"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
      {wanted ? "已关注" : "我想要"}
      {count > 0 && (
        <span className={`ml-0.5 tabular-nums ${wanted ? "text-gold-300" : "text-navy-400"}`}>
          {count}
        </span>
      )}
    </button>
  );
}
