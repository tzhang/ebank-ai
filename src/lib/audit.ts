import { getDb } from "@/lib/db";
import { auditLogs } from "@/lib/db/schema";

// M1 ADM-124 — 审计日志(仅追加;由管理操作统一调用,禁止其他路径写 audit_logs)。
export async function appendAudit(input: {
  actorId: string;
  action: string;
  targetType?: string;
  targetId?: string;
  reason?: string;
  metadata?: unknown;
}): Promise<void> {
  const db = getDb();
  await db.insert(auditLogs).values({
    actorId: input.actorId,
    action: input.action,
    targetType: input.targetType,
    targetId: input.targetId,
    reason: input.reason,
    metadata: input.metadata === undefined ? null : (input.metadata as never),
  });
}
