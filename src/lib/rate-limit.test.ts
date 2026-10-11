import { test } from "node:test";
import assert from "node:assert/strict";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { rateLimits } from "@/lib/db/schema";
import {
  getClientIp,
  rateLimitDisabled,
  rateLimitKey,
  retryAfterSec,
  windowStartFor,
  consume,
  POLICIES,
} from "./rate-limit";

// M1 AUTH-106 — 限流原语的纯函数单测(不依赖数据库)。

test("windowStartFor:向下取整到窗口边界", () => {
  const w = 900; // 15 分钟
  // 2026-10-11T02:07:33Z → 02:00:00Z
  const t = new Date("2026-10-11T02:07:33.123Z");
  assert.equal(windowStartFor(t, w).toISOString(), "2026-10-11T02:00:00.000Z");
  // 恰好落在边界上时保持不变
  const onEdge = new Date("2026-10-11T02:15:00.000Z");
  assert.equal(windowStartFor(onEdge, w).toISOString(), "2026-10-11T02:15:00.000Z");
});

test("retryAfterSec:窗口剩余秒数,且至少为 1", () => {
  const start = new Date("2026-10-11T02:00:00.000Z");
  assert.equal(retryAfterSec(new Date("2026-10-11T02:05:00.000Z"), start, 900), 600);
  // 已到窗口末尾 → 仍返回 1(便于 UI 文案,不显示 0)
  assert.equal(retryAfterSec(new Date("2026-10-11T02:15:00.000Z"), start, 900), 1);
});

test("rateLimitKey:确定性、按 scope/标识符区分、不落明文且大小写归一", () => {
  const a = rateLimitKey("register:email", "Foo@Bar.com");
  const b = rateLimitKey("register:email", "foo@bar.com ");
  assert.equal(a, b, "同一标识符(trim + 小写后)恒定同 key");
  assert.notEqual(a, rateLimitKey("login:email", "foo@bar.com"), "不同 scope 不同 key");
  assert.notEqual(a, rateLimitKey("register:email", "other@bar.com"), "不同标识符不同 key");
  assert.equal(a.length, 64, "sha256 十六进制");
  assert.ok(!a.includes("foo@bar.com") && !a.includes("bar.com"), "key 中不得出现明文");
});

test("getClientIp:优先平台头,取列表首跳,缺省返回 null", () => {
  const h = (init: Record<string, string>) => new Headers(init);

  assert.equal(
    getClientIp(h({ "x-vercel-forwarded-for": "203.0.113.9", "x-forwarded-for": "10.0.0.1" })),
    "203.0.113.9",
    "x-vercel-forwarded-for 优先",
  );
  assert.equal(getClientIp(h({ "x-real-ip": "203.0.113.10" })), "203.0.113.10");
  assert.equal(
    getClientIp(h({ "x-forwarded-for": "203.0.113.11, 70.41.3.18, 150.172.238.178" })),
    "203.0.113.11",
    "x-forwarded-for 取首跳",
  );
  assert.equal(getClientIp(h({ "x-forwarded-for": "::ffff:203.0.113.12" })), "203.0.113.12", "IPv4-mapped IPv6 归一");
  assert.equal(getClientIp(h({})), null, "无任何平台头 → null(调用方跳过 IP 维度)");
  assert.equal(getClientIp(h({ "x-real-ip": "   " })), null, "空值等同缺失");
});

test("rateLimitDisabled:RATE_LIMIT_DISABLED 可整体关闭", async () => {
  const original = process.env.RATE_LIMIT_DISABLED;
  try {
    process.env.RATE_LIMIT_DISABLED = "1";
    assert.equal(rateLimitDisabled(), true);
    // 关闭态下 consume 直接放行,证明不触碰数据库(单测无需 DB)
    const r = await consume(POLICIES.registerEmail, "disabled@example.com");
    assert.deepEqual(r, { ok: true, remaining: POLICIES.registerEmail.limit });

    process.env.RATE_LIMIT_DISABLED = "0";
    assert.equal(rateLimitDisabled(), false);
  } finally {
    if (original === undefined) delete process.env.RATE_LIMIT_DISABLED;
    else process.env.RATE_LIMIT_DISABLED = original;
  }
});

// ============================================================
// 集成测试(默认 skip,需显式开启且已执行 drizzle 迁移):
//   RATE_LIMIT_TEST_DB=1 npm test
//
// 为什么必须有:consume() 在存储异常时是 fail-open(放行)—— 若 upsert 语句本身有问题
// (类型不匹配、SQL 语法错),单测全绿但限流会静默失效。本用例直接打真实库,验证
// 「原子自增 + 窗口边界重置 + 超限拦截」这三件事真的成立。
// ============================================================

const dbGate = process.env.RATE_LIMIT_TEST_DB === "1";

test("集成:定点窗口计数、超限拦截、跨窗口重置", { skip: !dbGate }, async () => {
  const policy = { scope: "test:integration", limit: 2, windowSec: 3600 };
  const identifier = `probe-${Date.now()}-${Math.random()}`;
  const db = getDb();
  try {
    // 同窗口内:第 1、2 次放行,第 3 次拦截(计数先加后判)
    assert.deepEqual(await consume(policy, identifier), { ok: true, remaining: 1 });
    assert.deepEqual(await consume(policy, identifier), { ok: true, remaining: 0 });
    const third = await consume(policy, identifier);
    assert.equal(third.ok, false);
    assert.ok(!third.ok && third.retryAfterSec > 0 && third.retryAfterSec <= 3600);

    // 连续被拒也应继续计数(攻击者不能靠等到窗口结束前的空档恢复)
    const fourth = await consume(policy, identifier);
    assert.equal(fourth.ok, false);

    // 跨窗口重置:1 秒窗口 + 等待过期后,计数从 1 重新开始
    const shortPolicy = { scope: "test:integration-window", limit: 2, windowSec: 1 };
    const shortId = `${identifier}-w`;
    try {
      assert.deepEqual(await consume(shortPolicy, shortId), { ok: true, remaining: 1 });
      await new Promise((r) => setTimeout(r, 1100));
      assert.deepEqual(await consume(shortPolicy, shortId), { ok: true, remaining: 1 });
    } finally {
      await db.delete(rateLimits).where(eq(rateLimits.key, rateLimitKey(shortPolicy.scope, shortId)));
    }
  } finally {
    await db.delete(rateLimits).where(eq(rateLimits.key, rateLimitKey(policy.scope, identifier)));
  }
});

test("集成:落库内容不含明文标识符", { skip: !dbGate }, async () => {
  const policy = { scope: "test:privacy", limit: 5, windowSec: 3600 };
  const identifier = "leak-probe@example.com";
  const db = getDb();
  const key = rateLimitKey(policy.scope, identifier);
  try {
    await consume(policy, identifier);
    const [row] = await db.select().from(rateLimits).where(eq(rateLimits.key, key)).limit(1);
    assert.ok(row, "应写入一行计数");
    assert.ok(!row.key.includes("example.com") && !row.key.includes("leak-probe"), "key 不含明文邮箱");
  } finally {
    await db.delete(rateLimits).where(eq(rateLimits.key, key));
  }
});

// 策略契约测试:阈值/窗口是对外承诺(README 与 issue #8 引用),被误改要立刻红。
// 有意调整阈值时,请同步更新本用例与 README 描述。
test("契约:POLICIES 阈值与窗口符合既定策略", () => {
  const expected = {
    registerIp: { limit: 10, windowSec: 3600 },
    registerEmail: { limit: 3, windowSec: 3600 },
    loginIp: { limit: 20, windowSec: 900 },
    loginEmail: { limit: 10, windowSec: 900 },
    resetEmail: { limit: 3, windowSec: 3600 },
    resetIp: { limit: 10, windowSec: 3600 },
    resendEmail: { limit: 3, windowSec: 3600 },
    resendIp: { limit: 10, windowSec: 3600 },
  } as const;
  for (const [name, exp] of Object.entries(expected)) {
    const p = POLICIES[name as keyof typeof POLICIES];
    assert.equal(p.limit, exp.limit, `${name}.limit`);
    assert.equal(p.windowSec, exp.windowSec, `${name}.windowSec`);
  }
  // scope 字符串参与哈希,改动等于清空既有计数 —— 视为 API,必须稳定
  assert.equal(POLICIES.registerEmail.scope, "register:email");
  assert.equal(POLICIES.loginEmail.scope, "login:email");
});
