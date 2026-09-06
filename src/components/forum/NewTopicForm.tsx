"use client";

import { useState, useActionState } from "react";
import Markdown from "@/components/Markdown";
import { CATEGORIES } from "@/lib/forum-constants";
import { createTopicAction, type ForumActionState } from "@/lib/actions/forum";

const initialState: ForumActionState = { error: null };

export default function NewTopicForm() {
  const [state, formAction, pending] = useActionState(createTopicAction, initialState);
  const [preview, setPreview] = useState(false);
  const [content, setContent] = useState("");

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {state.error}
        </p>
      )}
      <div>
        <label htmlFor="title" className="mb-1 block text-sm text-navy-200">标题</label>
        <input
          id="title"
          name="title"
          type="text"
          required
          minLength={4}
          maxLength={100}
          placeholder="一句话说清话题(4–100 字)"
          className="w-full rounded-lg border border-navy-600 bg-navy-900/60 px-3 py-2 text-white placeholder:text-navy-500 outline-none focus:border-gold-500"
        />
      </div>
      <div>
        <label htmlFor="category" className="mb-1 block text-sm text-navy-200">分类</label>
        <select
          id="category"
          name="category"
          required
          defaultValue=""
          className="w-full rounded-lg border border-navy-600 bg-navy-900/60 px-3 py-2 text-white outline-none focus:border-gold-500"
        >
          <option value="" disabled>选择分类</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
      <div>
        <div className="mb-1 flex items-center justify-between">
          <label htmlFor="content" className="text-sm text-navy-200">正文(Markdown)</label>
          <div className="flex gap-1 rounded-lg border border-navy-600 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setPreview(false)}
              className={`rounded-md px-3 py-1 transition-colors ${!preview ? "bg-gold-500/15 text-gold-300" : "text-navy-300 hover:text-white"}`}
            >
              编辑
            </button>
            <button
              type="button"
              onClick={() => setPreview(true)}
              className={`rounded-md px-3 py-1 transition-colors ${preview ? "bg-gold-500/15 text-gold-300" : "text-navy-300 hover:text-white"}`}
            >
              预览
            </button>
          </div>
        </div>
        {preview ? (
          <div className="min-h-40 rounded-lg border border-navy-600 bg-navy-900/60 px-4 py-3">
            {content.trim() ? (
              <Markdown>{content}</Markdown>
            ) : (
              <p className="text-sm text-navy-500">暂无内容</p>
            )}
          </div>
        ) : (
          <textarea
            id="content"
            name="content"
            required
            rows={10}
            maxLength={50000}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={"支持 Markdown:代码块用 ``` 包裹,支持表格与列表。"}
            className="w-full rounded-lg border border-navy-600 bg-navy-900/60 px-3 py-2 font-mono text-sm text-white placeholder:text-navy-500 outline-none focus:border-gold-500"
          />
        )}
      </div>
      <div className="flex items-center justify-end gap-3">
        <span className="text-xs text-navy-500">发布即代表遵守社区规则</span>
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-gradient-to-r from-gold-400 to-gold-500 px-6 py-2 text-sm font-semibold text-navy-900 shadow-lg transition-all hover:brightness-110 disabled:opacity-50"
        >
          {pending ? "发布中…" : "发布话题"}
        </button>
      </div>
    </form>
  );
}
