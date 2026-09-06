"use client";

import { useState } from "react";
import { handleReportAction } from "@/lib/actions/admin";

// M1 ADM-122 — 举报队列操作按钮(resolved = 删除内容并处理;dismissed = 驳回)。
export default function ReportActionButtons({ reportId }: { reportId: string }) {
  const [busy, setBusy] = useState(false);

  async function act(action: "resolved" | "dismissed") {
    if (action === "resolved" && !window.confirm("删除被举报内容并标记为已处理?")) return;
    const fd = new FormData();
    fd.set("reportId", reportId);
    fd.set("action", action);
    setBusy(true);
    // 动作内 redirect 刷新页面
    await handleReportAction(fd);
  }

  return (
    <div className="flex gap-1.5">
      <button
        type="button"
        disabled={busy}
        onClick={() => act("resolved")}
        className="rounded-md border border-red-500/40 px-2.5 py-1 text-xs text-red-400 hover:bg-red-500/10 disabled:opacity-50"
      >
        删除内容并处理
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={() => act("dismissed")}
        className="rounded-md border border-navy-600 px-2.5 py-1 text-xs text-navy-300 hover:border-navy-500 hover:text-white disabled:opacity-50"
      >
        驳回
      </button>
    </div>
  );
}
