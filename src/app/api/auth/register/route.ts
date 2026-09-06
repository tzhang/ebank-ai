import { NextResponse } from "next/server";
import { registerUser } from "@/lib/register";
import { sendVerificationEmail } from "@/lib/mail";

// M1 AUTH-101/102 — 注册 JSON API(UI 走 registerAction)。
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
  // 注册即触发验证邮件(AUTH-102);发送失败不阻塞注册,登录页可重新发送
  const sent = await sendVerificationEmail(result.user.email);
  if (!sent.ok) console.error("[mail] 验证邮件发送失败:", sent.error);
  return NextResponse.json(
    { user: result.user, verification: sent.ok ? "sent" : "failed" },
    { status: 201 },
  );
}
