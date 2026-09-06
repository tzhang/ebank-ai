"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/session";
import { createReply, createTopic, deleteReply, deleteTopic, updateReply, updateTopic } from "@/lib/forum";

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

// ============================================================
// M1 FRM-132 — 编辑 / 删除动作
// ============================================================

export async function updateTopicAction(
  _prev: ForumActionState,
  formData: FormData,
): Promise<ForumActionState> {
  const user = await requireUser();
  if (!user) return { error: "请先登录" };
  const topicId = String(formData.get("id") ?? "");
  const result = await updateTopic(
    { userId: user.id },
    {
      topicId,
      title: formData.get("title"),
      content: formData.get("content"),
      category: formData.get("category"),
    },
  );
  if (!result.ok) return { error: result.error };
  redirect(`/topics/${topicId}?ok=1`);
}

export async function deleteTopicAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const topicId = String(formData.get("id") ?? "");
  const result = user
    ? await deleteTopic({ userId: user.id }, { topicId })
    : { ok: false as const };
  redirect(result.ok ? "/community" : `/topics/${topicId}?err=1`);
}

export async function updateReplyAction(
  _prev: ForumActionState,
  formData: FormData,
): Promise<ForumActionState> {
  const user = await requireUser();
  if (!user) return { error: "请先登录" };
  const topicId = String(formData.get("topicId") ?? "");
  const result = await updateReply(
    { userId: user.id },
    {
      topicId,
      replyId: formData.get("replyId"),
      content: formData.get("content"),
    },
  );
  if (!result.ok) return { error: result.error };
  redirect(`/topics/${topicId}?ok=1`);
}

export async function deleteReplyAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const topicId = String(formData.get("topicId") ?? "");
  const result = user
    ? await deleteReply({ userId: user.id }, { topicId, replyId: formData.get("replyId") })
    : { ok: false as const };
  redirect(result.ok ? `/topics/${topicId}?ok=1` : `/topics/${topicId}?err=1`);
}
