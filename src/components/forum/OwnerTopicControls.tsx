"use client";

import Link from "next/link";
import { deleteTopicAction } from "@/lib/actions/forum";

// M1 FRM-132 — 话题所有者操作:编辑入口 + 删除(软删除)。
export default function OwnerTopicControls({ topicId }: { topicId: string }) {
  async function handleDelete() {
    if (!window.confirm("确定删除这个话题?删除后列表与详情将不可见(管理端可恢复)。")) return;
    const fd = new FormData();
    fd.set("id", topicId);
    // deleteTopicAction 成功后内部 redirect 到 /community
    await deleteTopicAction(fd);
  }

  return (
    <div className="flex gap-3 text-xs">
      <Link href={`/topics/${topicId}/edit`} className="text-navy-400 hover:text-gold-300">
        编辑话题
      </Link>
      <button type="button" onClick={handleDelete} className="text-navy-400 hover:text-red-400">
        删除话题
      </button>
    </div>
  );
}
