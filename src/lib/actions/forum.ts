"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/session";
import { createReply, createTopic } from "@/lib/forum";

// M1 FRM-130/131 — 发布动作(表单入口)。

export type ForumActionState = { error: string | null };

export async function createTopicAction(
  _prev: ForumActionState,
  formData: FormData,
): Promise<ForumActionState> {
  const user = await requireUser();
  if (!user) return { error: "请先登录" };
  const result = await createTopic(
    { userId: user.id },
    {
      title: formData.get("title"),
      content: formData.get("content"),
      category: formData.get("category"),
    },
  );
  if (!result.ok) return { error: result.error };
  redirect(`/topics/${result.topicId}`);
}

export async function createReplyAction(
  _prev: ForumActionState,
  formData: FormData,
): Promise<ForumActionState> {
  const user = await requireUser();
  if (!user) return { error: "请先登录" };
  const result = await createReply(
    { userId: user.id },
    {
      topicId: formData.get("topicId"),
      content: formData.get("content"),
      parentId: formData.get("parentId") || undefined,
    },
  );
  if (!result.ok) return { error: result.error };
  redirect(`/topics/${String(formData.get("topicId"))}?posted=1`);
}
