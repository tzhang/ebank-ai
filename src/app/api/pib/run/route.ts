import { NextResponse } from "next/server";
import { requireUser } from "@/lib/session";
import { PibError, pibRunCycle } from "@/lib/pib";

// Phase B — 手动触发一个决策周期 (纸面 L1 自主; 实盘 L2 仅产生待批准订单)。
export async function POST() {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "请先登录" }, { status: 401 });
  try {
    return NextResponse.json(await pibRunCycle(user.id));
  } catch (e) {
    const err = e as PibError;
    return NextResponse.json({ error: err.message }, { status: err.status ?? 502 });
  }
}
