"use server";

import { redirect } from "next/navigation";
import { requireRole } from "@/lib/session";
import { deleteReplyAdmin, handleReport, topicAdminOp } from "@/lib/admin";

// M1 ADM-122 — 管理动作(话题操作 / 回复删除 / 举报处理)。

export async function topicOpAction(formData: FormData): Promise<void> {
  const actor = await requireRole("moderator", "admin");
  if (!actor) return redirect("/login");
  const topicId = String(formData.get("topicId") ?? "");
  const op = String(formData.get("op") ?? "");
  const reason = String(formData.get("reason") ?? "");
  const result = await topicAdminOp({ userId: actor.id, role: actor.role }, { topicId, op, reason });
  redirect(result.ok ? `/admin/content?ok=1` : `/admin/content?err=${encodeURIComponent(result.error)}`);
}

export async function deleteReplyAdminAction(formData: FormData): Promise<void> {
  const actor = await requireRole("moderator", "admin");
  if (!actor) return redirect("/login");
  const topicId = String(formData.get("topicId") ?? "");
  const replyId = String(formData.get("replyId") ?? "");
  const result = await deleteReplyAdmin({ userId: actor.id, role: actor.role }, { topicId, replyId });
  redirect(
    result.ok
      ? `/topics/${topicId}?ok=1`
      : `/topics/${topicId}?err=${encodeURIComponent(result.error)}`,
  );
}

export async function handleReportAction(formData: FormData): Promise<void> {
  const actor = await requireRole("moderator", "admin");
  if (!actor) return redirect("/login");
  const reportId = String(formData.get("reportId") ?? "");
  const action = String(formData.get("action") ?? "");
  const note = String(formData.get("note") ?? "");
  const result = await handleReport({ userId: actor.id, role: actor.role }, { reportId, action, note });
  redirect(result.ok ? `/admin/reports?ok=1` : `/admin/reports?err=${encodeURIComponent(result.error)}`);
}
