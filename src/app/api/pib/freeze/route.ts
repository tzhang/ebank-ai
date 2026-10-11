import { NextResponse } from "next/server";
import { requireUser } from "@/lib/session";
import { PibError, pibSetFrozen } from "@/lib/pib";

// Phase B — 一键熔断/解冻 (kill-switch 的产品化入口)。
export async function POST(req: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "请先登录" }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { freeze?: unknown };
  if (typeof body.freeze !== "boolean") {
    return NextResponse.json({ error: "参数错误: 需要 {freeze: boolean}" }, { status: 400 });
  }
  try {
    await pibSetFrozen(user.id, body.freeze);
    return NextResponse.json({ ok: true, frozen: body.freeze });
  } catch (e) {
    const err = e as PibError;
    return NextResponse.json({ error: err.message }, { status: err.status ?? 502 });
  }
}
