"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Phase B — 组合页操作按钮: 批准/拒绝 (L2 门禁)、运行周期、熔断开关。
export default function PibActions({
  pending,
  frozen,
}: {
  pending: { id: number; symbol: string; side: string; qty: number; reason: string }[];
  frozen: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function call(key: string, path: string, body?: unknown) {
    setBusy(key);
    setError(null);
    try {
      const res = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body ?? {}),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? `操作失败 (HTTP ${res.status})`);
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  const btn =
    "rounded-lg border px-3 py-1.5 text-sm transition disabled:opacity-40 disabled:cursor-not-allowed";

  return (
    <div className="space-y-4">
      {error && (
        <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}

      {pending.length > 0 && (
        <div className="space-y-2">
          {pending.map((o) => (
            <div
              key={o.id}
              className="flex flex-wrap items-center gap-3 rounded-xl border border-gold-500/40 bg-gold-500/5 px-4 py-3"
            >
              <span className="text-sm text-navy-100">
                <span className="font-semibold text-white">
                  {o.side === "buy" ? "买入" : "卖出"} {o.symbol}
                </span>{" "}
                x{o.qty.toLocaleString()} — {o.reason.slice(0, 40)}
              </span>
              <span className="ml-auto flex gap-2">
                <button
                  className={`${btn} border-emerald-500/50 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20`}
                  disabled={busy !== null}
                  onClick={() => call(`a${o.id}`, "/api/pib/orders", { orderId: o.id, action: "approve" })}
                >
                  {busy === `a${o.id}` ? "批准中…" : "批准"}
                </button>
                <button
                  className={`${btn} border-red-500/50 bg-red-500/10 text-red-300 hover:bg-red-500/20`}
                  disabled={busy !== null}
                  onClick={() => call(`r${o.id}`, "/api/pib/orders", { orderId: o.id, action: "reject" })}
                >
                  拒绝
                </button>
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          className={`${btn} border-navy-500/60 bg-navy-700/60 text-navy-100 hover:bg-navy-600/60`}
          disabled={busy !== null}
          onClick={() => call("run", "/api/pib/run")}
        >
          {busy === "run" ? "运行中…" : "立即运行周期"}
        </button>
        <button
          className={`${btn} ${
            frozen
              ? "border-navy-500/60 bg-navy-700/60 text-navy-100 hover:bg-navy-600/60"
              : "border-red-500/50 bg-red-500/10 text-red-300 hover:bg-red-500/20"
          }`}
          disabled={busy !== null}
          onClick={() => call("freeze", "/api/pib/freeze", { freeze: !frozen })}
        >
          {frozen ? "解除熔断" : "一键熔断"}
        </button>
      </div>
    </div>
  );
}
