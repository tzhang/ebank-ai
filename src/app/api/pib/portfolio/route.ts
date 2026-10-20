import { NextResponse } from "next/server";
import { requireUser } from "@/lib/session";
import { PibError, pibEnsureTenant, pibPortfolio } from "@/lib/pib";

// Phase B — 组合数据 BFF: 浏览器 → (会话) → 本路由 → (服务令牌) → PIB。
export async function GET() {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "请先登录" }, { status: 401 });
  try {
    await pibEnsureTenant(user.id);          // 幂等开通
    return NextResponse.json(await pibPortfolio(user.id));
  } catch (e) {
    const err = e as PibError;
    return NextResponse.json({ error: err.message }, { status: err.status ?? 502 });
  }
}
