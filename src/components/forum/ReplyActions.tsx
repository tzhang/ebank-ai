"use client";

import { useState, useActionState } from "react";
import { deleteReplyAction, updateReplyAction, type ForumActionState } from "@/lib/actions/forum";

const initialState: ForumActionState = { error: null };

// M1 FRM-132 — 自己的回复行操作:编辑(内联)/ 软删除。
export default function ReplyActions({
  topicId,
  replyId,
  initialContent,
}: {
  topicId: string;
  replyId: string;
  initialContent: string;
}) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, pending] = useActionState(updateReplyAction, initialState);

  async function handleDelete() {
    if (!window.confirm("确定删除这条回复?删除后不可恢复(管理端可恢复)。")) return;
    const fd = new FormData();
    fd.set("topicId", topicId);
    fd.set("replyId", replyId);
    // deleteReplyAction 成功后内部 redirect 刷新页面
    await deleteReplyAction(fd);
  }

  if (!editing) {
    return (
      <div className="mt-2 flex gap-3 text-xs">
        <button type="button" onClick={() => setEditing(true)} className="text-navy-400 hover:text-gold-300">
          编辑
        </button>
        <button type="button" onClick={handleDelete} className="text-navy-400 hover:text-red-400">
          删除
        </button>
      </div>
    );
  }

  return (
    <form action={formAction} className="mt-3 space-y-2">
      <input type="hidden" name="topicId" value={topicId} />
      <input type="hidden" name="replyId" value={replyId} />
      {state.error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">
          {state.error}
        </p>
      )}
      <textarea
        name="content"
        required
        rows={4}
        maxLength={20000}
        defaultValue={initialContent}
        className="w-full rounded-lg border border-navy-600 bg-navy-900/60 px-3 py-2 text-sm text-white outline-none focus:border-gold-500"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-gradient-to-r from-gold-400 to-gold-500 px-4 py-1.5 text-xs font-semibold text-navy-900 hover:brightness-110 disabled:opacity-50"
        >
          {pending ? "保存中…" : "保存"}
        </button>
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="rounded-lg border border-navy-600 px-4 py-1.5 text-xs text-navy-300 hover:text-white"
        >
          取消
        </button>
      </div>
    </form>
  );
}
