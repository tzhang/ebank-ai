"use client";

import { deleteReplyAdminAction } from "@/lib/actions/admin";

// M1 ADM-122 — 管理端删除任意回复(moderator+ 可见)。
export default function StaffDeleteReply({ topicId, replyId }: { topicId: string; replyId: string }) {
  async function handle() {
    if (!window.confirm("以管理员身份删除该回复?删除后不可见(数据可恢复,操作将记入审计)。")) return;
    const fd = new FormData();
    fd.set("topicId", topicId);
    fd.set("replyId", replyId);
    // 动作内 redirect 刷新页面
    await deleteReplyAdminAction(fd);
  }
  return (
    <button type="button" onClick={handle} className="text-xs text-navy-400 transition-colors hover:text-red-400">
      管理删除
    </button>
  );
}
