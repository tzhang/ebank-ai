import { NextResponse } from "next/server";
import { requireUser } from "@/lib/session";
import { PibError, pibOrderDecision } from "@/lib/pib";

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
  try {
    await pibOrderDecision(user.id, orderId, action);
    return NextResponse.json({ ok: true, orderId, action });
  } catch (e) {
    const err = e as PibError;
    return NextResponse.json({ error: err.message }, { status: err.status ?? 502 });
  }
}
