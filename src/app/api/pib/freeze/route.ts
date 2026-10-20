import { NextResponse } from "next/server";
import { appendAudit } from "@/lib/audit";
import { PibError, pibSetFrozen } from "@/lib/pib";
import { consume, POLICIES, retryAfterText } from "@/lib/rate-limit";
import { requireUser } from "@/lib/session";

// Phase B — 一键熔断/解冻 (kill-switch 的产品化入口)。
export async function POST(req: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "请先登录" }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { freeze?: unknown };
  if (typeof body.freeze !== "boolean") {
    return NextResponse.json({ error: "参数错误: 需要 {freeze: boolean}" }, { status: 400 });
  }
  const rl = await consume(POLICIES.pibActionUser, user.id);
  if (!rl.ok) {
    return NextResponse.json(
      { error: `操作过于频繁，请 ${retryAfterText(rl.retryAfterSec)} 后再试` },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } },
    );
  }
  try {
    await pibSetFrozen(user.id, body.freeze);
    try {
      await appendAudit({
        actorId: user.id,
        action: body.freeze ? "pib_freeze" : "pib_unfreeze",
        targetType: "pib_tenant",
        targetId: user.id,
        metadata: { frozen: body.freeze },
      });
    } catch (err) {
      console.error("[pib] audit append failed:", err instanceof Error ? err.message : String(err));
    }
    return NextResponse.json({ ok: true, frozen: body.freeze });
  } catch (e) {
    const err = e as PibError;
    return NextResponse.json({ error: err.message }, { status: err.status ?? 502 });
  }
}
