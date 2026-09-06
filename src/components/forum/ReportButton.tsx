"use client";

import { useState } from "react";

// M1 FRM-136 — 举报入口(话题/回复共用)。仅登录用户可见(服务端控制);举报人不暴露给被举报方。
type Phase = "idle" | "form" | "sent" | "error";

export default function ReportButton({
  targetType,
  targetId,
  compact,
}: {
  targetType: "topic" | "reply";
  targetId: string;
  compact?: boolean;
}) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [reason, setReason] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetType, targetId, reason: reason.trim() || undefined }),
      });
      if (res.ok) {
        setPhase("sent");
      } else {
        const data = await res.json().catch(() => null);
        setMsg(data?.error ?? "提交失败,请重试");
        setPhase("error");
      }
    } catch {
      setMsg("网络错误,请重试");
      setPhase("error");
    } finally {
      setBusy(false);
    }
  }

  if (phase === "sent") {
    return <span className="text-xs text-emerald-400">已提交,感谢反馈</span>;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {phase === "idle" ? (
        <button
          type="button"
          onClick={() => setPhase("form")}
          className={`${compact ? "text-xs" : "text-sm"} text-navy-400 transition-colors hover:text-red-400`}
        >
          举报
        </button>
      ) : (
        <>
          <textarea
            rows={2}
            maxLength={200}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="举报原因(可选,最多 200 字)"
            className="w-64 rounded-lg border border-navy-600 bg-navy-900/60 px-2 py-1.5 text-xs text-white outline-none focus:border-gold-500"
          />
          <button
            type="button"
            disabled={busy}
            onClick={submit}
            className="rounded-lg border border-red-500/40 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10 disabled:opacity-50"
          >
            提交
          </button>
          <button type="button" onClick={() => { setPhase("idle"); setMsg(""); }} className="text-xs text-navy-400 hover:text-white">
            取消
          </button>
          {phase === "error" && <span className="text-xs text-red-400">{msg}</span>}
        </>
      )}
    </div>
  );
}
