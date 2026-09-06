import { NextResponse } from "next/server";
import { requireUser } from "@/lib/session";
import { createReport } from "@/lib/report";

// M1 FRM-136 — 举报 JSON API。
export async function POST(req: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "请先登录" }, { status: 401 });
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "请求体不是合法 JSON" }, { status: 400 });
  }
  const { targetType, targetId, reason } = (body ?? {}) as {
    targetType?: unknown;
    targetId?: unknown;
    reason?: unknown;
  };
  const result = await createReport({ userId: user.id }, { targetType, targetId, reason });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ ok: true }, { status: 201 });
}
