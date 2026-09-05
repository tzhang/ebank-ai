import { NextResponse } from "next/server";
import { registerUser } from "@/lib/register";

// M1 AUTH-101 — 注册 JSON API(供表单与服务端动作之外的程序化调用;UI 走 registerAction)。
// 防滥用(限流 + Turnstile)见 AUTH-106 issue。
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: { field: "form", message: "请求体不是合法 JSON" } }, { status: 400 });
  }
  const { name, email, password } = (body ?? {}) as { name?: unknown; email?: unknown; password?: unknown };
  const result = await registerUser({ name, email, password });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ user: result.user }, { status: 201 });
}
