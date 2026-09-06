import { NextResponse } from "next/server";
import { requireRole } from "@/lib/session";
import { setUserBan } from "@/lib/admin";

// M1 ADM-121 — 封禁 / 解封 JSON API(仅 admin)。
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const actor = await requireRole("admin");
  if (!actor) return NextResponse.json({ error: "无权操作" }, { status: 403 });
  const { id } = await ctx.params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "请求体不是合法 JSON" }, { status: 400 });
  }
  const { action, reason } = (body ?? {}) as { action?: unknown; reason?: unknown };
  const result = await setUserBan({ userId: actor.id, role: actor.role }, { userId: id, action, reason });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ ok: true });
}
