import { NextResponse } from "next/server";
import { appendAudit } from "@/lib/audit";
import { PibError, pibRunCycle } from "@/lib/pib";
import { consume, POLICIES, retryAfterText } from "@/lib/rate-limit";
import { requireUser } from "@/lib/session";

// Phase B — 手动触发一个决策周期 (纸面 L1 自主; 实盘 L2 仅产生待批准订单)。
export async function POST() {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "请先登录" }, { status: 401 });
  const rl = await consume(POLICIES.pibRunUser, user.id);
  if (!rl.ok) {
    return NextResponse.json(
      { error: `操作过于频繁，请 ${retryAfterText(rl.retryAfterSec)} 后再试` },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } },
    );
  }
  try {
    const result = await pibRunCycle(user.id);
    try {
      await appendAudit({
        actorId: user.id,
        action: "pib_run_cycle",
        targetType: "pib_tenant",
        targetId: user.id,
      });
    } catch (err) {
      console.error("[pib] audit append failed:", err instanceof Error ? err.message : String(err));
    }
    return NextResponse.json(result);
  } catch (e) {
    const err = e as PibError;
    return NextResponse.json({ error: err.message }, { status: err.status ?? 502 });
  }
}
