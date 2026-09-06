"use client";

import { useActionState } from "react";
import { createReplyAction, type ForumActionState } from "@/lib/actions/forum";

const initialState: ForumActionState = { error: null };

export default function ReplyForm({
  topicId,
  locked,
  canPost,
  verified,
}: {
  topicId: string;
  locked: boolean;
  canPost: boolean;
  verified: boolean;
}) {
  const [state, formAction, pending] = useActionState(createReplyAction, initialState);

  if (locked) {
    return <p className="text-sm text-navy-500">话题已锁定,暂不能回复。</p>;
  }
  if (!canPost) {
    return <p className="text-sm text-navy-500">登录后可参与回复。</p>;
  }
  if (!verified) {
    return <p className="text-sm text-navy-500">验证邮箱后即可回复(验证邮件即将上线)。</p>;
  }

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="topicId" value={topicId} />
      {state.error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {state.error}
        </p>
      )}
      <textarea
        name="content"
        required
        rows={4}
        maxLength={20000}
        placeholder="友善讨论,支持 Markdown 与代码块"
        className="w-full rounded-lg border border-navy-600 bg-navy-900/60 px-3 py-2 text-sm text-white placeholder:text-navy-500 outline-none focus:border-gold-500"
      />
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-gradient-to-r from-gold-400 to-gold-500 px-5 py-2 text-sm font-semibold text-navy-900 shadow-lg transition-all hover:brightness-110 disabled:opacity-50"
        >
          {pending ? "提交中…" : "回复"}
        </button>
      </div>
    </form>
  );
}
