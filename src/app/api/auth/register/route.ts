import { NextResponse } from "next/server";
import { registerUser } from "@/lib/register";
import { sendVerificationEmail } from "@/lib/mail";
import { getClientIp } from "@/lib/rate-limit";

// M1 AUTH-101/102 + AUTH-106 — 注册 JSON API(UI 走 registerAction)。
// 防滥用闸门(限流 + Turnstile)与 Server Action 共用 registerUser 内的同一份逻辑。
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: { field: "form", message: "请求体不是合法 JSON" } }, { status: 400 });
  }
  const { name, email, password, turnstileToken } = (body ?? {}) as {
    name?: unknown;
    email?: unknown;
    password?: unknown;
    turnstileToken?: unknown;
  };
  const result = await registerUser(
    { name, email, password },
    { ip: getClientIp(req.headers), turnstileToken: typeof turnstileToken === "string" ? turnstileToken : null },
  );
  if (!result.ok) {
    const res = NextResponse.json({ error: result.error }, { status: result.status });
    // 机器可读的重试提示(文案面向人,此头供调用方程序化处理)
    if (result.retryAfterSec) res.headers.set("Retry-After", String(result.retryAfterSec));
    return res;
  }
  // 注册即触发验证邮件(AUTH-102);发送失败不阻塞注册,登录页可重新发送
  const sent = await sendVerificationEmail(result.user.email);
  if (!sent.ok) console.error("[mail] 验证邮件发送失败:", sent.error);
  return NextResponse.json(
    { user: result.user, verification: sent.ok ? "sent" : "failed" },
    { status: 201 },
  );
}
