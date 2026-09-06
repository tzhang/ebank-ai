"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// M1 ADM-121 — 行内封禁/解封控制(仅 admin 可见;走 /api/admin/users/[id]/ban)。
export default function BanControl({
  userId,
  name,
  bannedAt,
}: {
  userId: string;
  name: string | null;
  bannedAt: Date | null;
}) {
  const [showBan, setShowBan] = useState(false);
  const [reason, setReason] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function act(action: "ban" | "unban") {
    if (action === "ban" && reason.trim().length < 2) {
      setMsg("请填写封禁理由(至少 2 个字)");
      return;
    }
    if (action === "unban" && !window.confirm(`确定解封「${name ?? userId}」?`)) return;
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(userId)}/ban`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason: reason.trim() || undefined }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json().catch(() => null);
        setMsg(data?.error ?? "操作失败");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      {showBan && !bannedAt && (
        <textarea
          rows={2}
          maxLength={200}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="封禁理由(必填)"
          className="w-56 rounded-lg border border-navy-600 bg-navy-900/60 px-2 py-1 text-xs text-white outline-none focus:border-gold-500"
        />
      )}
      <div className="flex gap-2">
        {bannedAt ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => act("unban")}
            className="rounded-md border border-emerald-500/40 px-2.5 py-1 text-xs text-emerald-400 hover:bg-emerald-500/10 disabled:opacity-50"
          >
            解封
          </button>
        ) : (
          <button
            type="button"
            disabled={busy}
            onClick={() => (showBan ? act("ban") : setShowBan(true))}
            className="rounded-md border border-red-500/40 px-2.5 py-1 text-xs text-red-400 hover:bg-red-500/10 disabled:opacity-50"
          >
            {showBan ? "确认封禁" : "封禁"}
          </button>
        )}
        {showBan && !bannedAt && (
          <button
            type="button"
            onClick={() => {
              setShowBan(false);
              setReason("");
            }}
            className="text-xs text-navy-400 hover:text-white"
          >
            取消
          </button>
        )}
      </div>
      {msg && <span className="text-xs text-red-400">{msg}</span>}
    </div>
  );
}
