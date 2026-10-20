import Link from "next/link";
import { requireUser } from "@/lib/session";
import { PibError, pibEnsureTenant, pibPortfolio, type PibPortfolio } from "@/lib/pib";
import PibActions from "@/components/portfolio/PibActions";

// Phase B — 个人投资组合页 (PIB 集成)。
// 数据流: 本页 (server) → @/lib/pib (服务令牌) → PIB 常驻服务 → 该用户租户。
// L0/L1 纸面自主; L2 实盘订单在此页逐笔批准 (人类批准铁律的产品入口)。
export const dynamic = "force-dynamic";   // 组合数据实时, 不做静态缓存

function fmtMoney(v: number | undefined): string {
  return (v ?? 0).toLocaleString("zh-CN", { maximumFractionDigits: 0 });
}

function fmtPct(v: number | undefined, signed = true): string {
  const x = v ?? 0;
  return `${signed && x >= 0 ? "+" : ""}${(x * 100).toFixed(2)}%`;
}

export default async function PortfolioPage() {
  const user = await requireUser();
  if (!user) {
    return (
      <section className="border-b border-navy-700/50 bg-gradient-to-b from-navy-800 to-navy-900 py-20">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <h1 className="text-2xl font-bold text-white">登录后查看我的投资组合</h1>
          <p className="mt-3 text-navy-300">
            <Link href="/login" className="text-gold-400 hover:underline">去登录</Link>
            ,或<Link href="/register" className="text-gold-400 hover:underline">注册一个账号</Link>
          </p>
        </div>
      </section>
    );
  }

  let p: PibPortfolio | null = null;
  let unavailable: string | null = null;
  try {
    await pibEnsureTenant(user.id);
    p = await pibPortfolio(user.id);
  } catch (e) {
    unavailable = (e as PibError).message;
  }

  return (
    <section className="min-h-[70vh] border-b border-navy-700/50 bg-gradient-to-b from-navy-800 to-navy-900 py-12">
      <div className="mx-auto w-full max-w-5xl px-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white">📈 我的投资组合</h1>
            <p className="mt-1 text-sm text-navy-300">
              PIB 个人投资助理 · 纪律化全资产配置 · 每笔实盘订单需你亲自批准
            </p>
          </div>
          {p && (
            <div className="text-right text-xs text-navy-300">
              <div>数据截至 {p.asof}</div>
              {p.frozen && <div className="mt-1 text-red-300">⚠️ 已熔断冻结</div>}
            </div>
          )}
        </div>

        {unavailable && (
          <div className="mt-8 rounded-2xl border border-gold-500/40 bg-gold-500/5 p-6 text-sm text-navy-200">
            <p className="font-semibold text-gold-300">PIB 服务暂不可用</p>
            <p className="mt-2">{unavailable}</p>
            <p className="mt-2 text-navy-400">
              部署提示: 启动 PIB 服务 (python3 -m investbot.cli serve), 并在 ebank 环境变量配置
              PIB_BASE_URL 与 PIB_SERVICE_TOKEN。
            </p>
          </div>
        )}

        {p && (
          <div className="mt-8 space-y-6">
            {/* KPI */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: "组合净值", value: `¥${fmtMoney(p.equity)}`, cls: "text-white" },
                { label: "现金", value: `¥${fmtMoney(p.cash)}`, cls: "text-navy-100" },
                {
                  label: "累计收益",
                  value: fmtPct(p.metrics.total_return),
                  cls: (p.metrics.total_return ?? 0) >= 0 ? "text-emerald-400" : "text-red-400",
                },
                {
                  label: "最大回撤",
                  value: fmtPct(p.metrics.max_drawdown, false),
                  cls: "text-red-400",
                },
              ].map((k) => (
                <div key={k.label} className="rounded-2xl border border-navy-600/50 bg-navy-800/50 p-4">
                  <div className="text-xs text-navy-300">{k.label}</div>
                  <div className={`mt-1 text-xl font-semibold ${k.cls}`}>{k.value}</div>
                </div>
              ))}
            </div>

            {/* 待批准订单 (L2 门禁) + 操作 */}
            <div className="rounded-2xl border border-navy-600/50 bg-navy-800/50 p-6">
              <h2 className="text-lg font-semibold text-white">
                待批准订单{" "}
                <span className="text-sm font-normal text-navy-300">
                  ({p.pending_approvals.length})
                </span>
              </h2>
              <p className="mt-1 text-xs text-navy-400">
                实盘模式下, 未经你批准的订单不会执行 — agent 无自批权限。
              </p>
              <div className="mt-4">
                <PibActions
                  pending={p.pending_approvals.map((o) => ({
                    id: o.id,
                    symbol: o.symbol,
                    side: o.side,
                    qty: o.qty,
                    reason: o.reason ?? "",
                  }))}
                  frozen={p.frozen}
                />
              </div>
            </div>

            {/* 排队订单 (下一交易日开盘成交) */}
            {(p.queued?.length ?? 0) > 0 && (
              <div className="rounded-2xl border border-navy-600/50 bg-navy-800/50 p-6">
                <h2 className="text-lg font-semibold text-white">
                  待成交订单{" "}
                  <span className="text-sm font-normal text-navy-300">({p.queued!.length})</span>
                </h2>
                <p className="mt-1 text-xs text-navy-400">
                  已于最近周期生成, 在下一交易日开盘按市价成交 (T+1 队列)。
                </p>
                <ul className="mt-4 space-y-1.5 text-sm text-navy-100">
                  {p.queued!.slice(0, 10).map((o) => (
                    <li key={o.id} className="flex items-center gap-3">
                      <span className={o.side === "buy" ? "text-emerald-400" : "text-red-400"}>
                        {o.side === "buy" ? "买入" : "卖出"}
                      </span>
                      <span className="font-semibold text-white">{o.symbol}</span>
                      <span>x{o.qty.toLocaleString()}</span>
                      <span className="truncate text-xs text-navy-400">{o.reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 持仓 */}
            <div className="rounded-2xl border border-navy-600/50 bg-navy-800/50 p-6">
              <h2 className="text-lg font-semibold text-white">当前持仓</h2>
              {p.positions.length === 0 ? (
                <p className="mt-3 text-sm text-navy-300">空仓 (运行一个周期后自动建仓)</p>
              ) : (
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-navy-300">
                        <th className="py-2 pr-4">标的</th>
                        <th className="py-2 pr-4">数量</th>
                        <th className="py-2 pr-4">成本</th>
                        <th className="py-2 pr-4">现价</th>
                        <th className="py-2 pr-4">市值</th>
                        <th className="py-2 pr-4">权重</th>
                        <th className="py-2">浮动盈亏</th>
                      </tr>
                    </thead>
                    <tbody className="text-navy-100">
                      {p.positions.map((r) => (
                        <tr key={r.symbol} className="border-t border-navy-700/50">
                          <td className="py-2 pr-4 font-semibold text-white">{r.symbol}</td>
                          <td className="py-2 pr-4">{r.qty.toLocaleString()}</td>
                          <td className="py-2 pr-4">{r.avg_cost.toFixed(2)}</td>
                          <td className="py-2 pr-4">{r.price.toFixed(2)}</td>
                          <td className="py-2 pr-4">¥{fmtMoney(r.market_value)}</td>
                          <td className="py-2 pr-4">{(r.weight * 100).toFixed(1)}%</td>
                          <td
                            className={`py-2 ${r.unrealized_pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}
                          >
                            {r.unrealized_pnl >= 0 ? "+" : ""}
                            {fmtMoney(r.unrealized_pnl)} ({fmtPct(r.pnl_pct)})
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* 最近决策 */}
            <div className="rounded-2xl border border-navy-600/50 bg-navy-800/50 p-6">
              <h2 className="text-lg font-semibold text-white">最近决策</h2>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-navy-300">
                      <th className="py-2 pr-4">周期</th>
                      <th className="py-2 pr-4">标的</th>
                      <th className="py-2 pr-4">动作</th>
                      <th className="py-2 pr-4">目标权重</th>
                      <th className="py-2 pr-4">信号</th>
                      <th className="py-2">风控</th>
                    </tr>
                  </thead>
                  <tbody className="text-navy-100">
                    {p.recent_decisions.map((d, i) => (
                      <tr key={`${d.cycle}-${d.symbol}-${i}`} className="border-t border-navy-700/50">
                        <td className="py-2 pr-4">{d.cycle}</td>
                        <td className="py-2 pr-4 font-semibold text-white">{d.symbol}</td>
                        <td className="py-2 pr-4">
                          {d.action === "buy" ? "买入" : d.action === "sell" ? "卖出" : "持有"}
                        </td>
                        <td className="py-2 pr-4">{(d.target_weight * 100).toFixed(1)}%</td>
                        <td className={`py-2 pr-4 ${d.score >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                          {d.score >= 0 ? "+" : ""}
                          {d.score.toFixed(2)}
                        </td>
                        <td className="py-2">{d.risk_pass ? "✅" : d.action === "hold" ? "—" : "⛔"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <p className="text-xs leading-relaxed text-navy-400">
              ⚠️ 本页展示的是模拟盘 (纸面) 组合运行结果, 不构成投资建议。实盘接入后, 所有订单仍需你逐笔批准;
              你可随时「一键熔断」停止一切新交易。全部决策与订单均有审计留痕。
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
