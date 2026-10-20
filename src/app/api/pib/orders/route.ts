import { NextResponse } from "next/server";
import { appendAudit } from "@/lib/audit";
import { PibError, pibOrderDecision } from "@/lib/pib";
import { consume, POLICIES, retryAfterText } from "@/lib/rate-limit";
import { requireUser } from "@/lib/session";

// Phase B — L2 人类批准门的产品入口: 批准/拒绝待决订单 (签名留痕在 PIB 侧)。
export async function POST(req: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "请先登录" }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as {
    orderId?: unknown;
    action?: unknown;
  };
  const orderId = Number(body.orderId);
  const action = body.action;
  if (!Number.isInteger(orderId) || (action !== "approve" && action !== "reject")) {
    return NextResponse.json({ error: "参数错误: 需要 {orderId, action}" }, { status: 400 });
  }
  const rl = await consume(POLICIES.pibActionUser, user.id);
  if (!rl.ok) {
    return NextResponse.json(
      { error: `操作过于频繁，请 ${retryAfterText(rl.retryAfterSec)} 后再试` },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } },
    );
  }
  try {
    await pibOrderDecision(user.id, orderId, action);
    // 合规留痕: ebank 侧记录谁在何时批准/拒绝了哪笔订单 (PIB 侧另有签名记录)
    try {
      await appendAudit({
        actorId: user.id,
        action: action === "approve" ? "pib_order_approve" : "pib_order_reject",
        targetType: "pib_order",
        targetId: String(orderId),
        metadata: { action },
      });
    } catch (err) {
      console.error("[pib] audit append failed:", err instanceof Error ? err.message : String(err));
    }
    return NextResponse.json({ ok: true, orderId, action });
  } catch (e) {
    const err = e as PibError;
    return NextResponse.json({ error: err.message }, { status: err.status ?? 502 });
  }
}
