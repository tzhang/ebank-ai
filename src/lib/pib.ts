// PIB 个人投资助理 — 服务端集成客户端 (server-only, 勿在客户端组件导入)。
//
// 架构: ebank.ai (Next.js) --BFF--> PIB 常驻服务 (investbot.service.api)
//   - 服务令牌 (PIB_SERVICE_TOKEN) 只存在服务端环境变量, 绝不下发浏览器
//   - 租户 uid = ebank 用户 ID (UUID 符合 PIB uid 规则)
//   - 首次访问自动开通租户 (POST /v1/admin/tenants 幂等)
//
// 环境变量: PIB_BASE_URL (如 http://127.0.0.1:8901), PIB_SERVICE_TOKEN

export class PibError extends Error {
  status: number;
  constructor(message: string, status = 502) {
    super(message);
    this.status = status;
  }
}

export type PibPosition = {
  symbol: string;
  qty: number;
  avg_cost: number;
  price: number;
  market_value: number;
  weight: number;
  unrealized_pnl: number;
  pnl_pct: number;
  realized_pnl: number;
};

export type PibOrder = {
  id: number;
  ts: string;
  symbol: string;
  side: "buy" | "sell";
  qty: number;
  status: string;
  level: number;
  reason: string;
};

export type PibDecision = {
  cycle: string;
  symbol: string;
  action: string;
  target_weight: number;
  score: number;
  confidence: number;
  risk_pass: number;
  agent_notes: string;
};

export type PibPortfolio = {
  ok: boolean;
  asof: string;
  equity: number;
  cash: number;
  metrics: Record<string, number>;
  positions: PibPosition[];
  pending_approvals: PibOrder[];
  queued?: PibOrder[];
  frozen: boolean;
  recent_decisions: PibDecision[];
};

function baseUrl(): string {
  const url = process.env.PIB_BASE_URL;
  if (!url) throw new PibError("PIB 未配置: 缺少环境变量 PIB_BASE_URL", 503);
  return url.replace(/\/$/, "");
}

async function pibFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = process.env.PIB_SERVICE_TOKEN;
  if (!token) throw new PibError("PIB 未配置: 缺少环境变量 PIB_SERVICE_TOKEN", 503);
  let res: Response;
  try {
    res = await fetch(`${baseUrl()}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(init?.headers ?? {}),
      },
      signal: AbortSignal.timeout(20_000),
      cache: "no-store",
    });
  } catch {
    throw new PibError("PIB 服务不可达 (检查 PIB_BASE_URL / 服务是否启动)", 503);
  }
  const body = (await res.json().catch(() => ({}))) as {
    ok?: boolean;
    error?: string;
  } & T;
  if (!res.ok || body.ok === false) {
    throw new PibError(body.error ?? `PIB 请求失败 (HTTP ${res.status})`, res.status);
  }
  return body;
}

/** 幂等开通租户 (首次访问时调用; 已存在则无副作用)。 */
export async function pibEnsureTenant(uid: string): Promise<void> {
  await pibFetch("/v1/admin/tenants", {
    method: "POST",
    body: JSON.stringify({ uid }),
  });
}

export async function pibPortfolio(uid: string): Promise<PibPortfolio> {
  return pibFetch<PibPortfolio>(`/v1/tenants/${encodeURIComponent(uid)}/portfolio`);
}

/** 立即执行一个决策周期 (纸面 L1; 实盘模式 L2 只会产生待批准订单)。 */
export async function pibRunCycle(uid: string): Promise<{ note: string }> {
  return pibFetch(`/v1/tenants/${encodeURIComponent(uid)}/run`, {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export async function pibOrderDecision(
  uid: string,
  orderId: number,
  action: "approve" | "reject",
): Promise<void> {
  await pibFetch(
    `/v1/tenants/${encodeURIComponent(uid)}/orders/${orderId}/${action}`,
    { method: "POST", body: JSON.stringify({}) },
  );
}

export async function pibSetFrozen(uid: string, freeze: boolean): Promise<void> {
  await pibFetch(
    `/v1/tenants/${encodeURIComponent(uid)}/${freeze ? "freeze" : "unfreeze"}`,
    { method: "POST", body: JSON.stringify({}) },
  );
}
