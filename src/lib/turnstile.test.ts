import { test, afterEach } from "node:test";
import assert from "node:assert/strict";
import { turnstileEnabled, verifyTurnstile } from "./turnstile";

// M1 AUTH-106 — Turnstile 服务端校验单测(mock fetch,不触网)。

const originalFetch = globalThis.fetch;
const originalSecret = process.env.TURNSTILE_SECRET_KEY;

afterEach(() => {
  globalThis.fetch = originalFetch;
  if (originalSecret === undefined) delete process.env.TURNSTILE_SECRET_KEY;
  else process.env.TURNSTILE_SECRET_KEY = originalSecret;
});

function mockFetch(handler: (url: string, init?: RequestInit) => Promise<Response> | Response) {
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) =>
    handler(String(input), init)) as typeof fetch;
}

test("未配置 secret → 休眠放行,且不发起网络请求", async () => {
  delete process.env.TURNSTILE_SECRET_KEY;
  assert.equal(turnstileEnabled(), false);
  mockFetch(() => {
    throw new Error("休眠态不应发起 fetch");
  });
  assert.deepEqual(await verifyTurnstile(null), { ok: true, skipped: true });
});

test("已配置但无 token → 拒绝(missing)", async () => {
  process.env.TURNSTILE_SECRET_KEY = "test-secret";
  assert.equal(turnstileEnabled(), true);
  assert.deepEqual(await verifyTurnstile(""), { ok: false, reason: "missing" });
  assert.deepEqual(await verifyTurnstile(null), { ok: false, reason: "missing" });
});

test("siteverify 返回 success:false → 拒绝(invalid),并回传 remoteip", async () => {
  process.env.TURNSTILE_SECRET_KEY = "test-secret";
  let seenBody: Record<string, unknown> = {};
  mockFetch(async (url, init) => {
    assert.equal(url, "https://challenges.cloudflare.com/turnstile/v0/siteverify");
    seenBody = JSON.parse(String(init?.body));
    return new Response(JSON.stringify({ success: false, "error-codes": ["timeout-or-duplicate"] }), {
      status: 200,
    });
  });
  assert.deepEqual(await verifyTurnstile("tok", "203.0.113.9"), { ok: false, reason: "invalid" });
  assert.equal(seenBody.secret, "test-secret");
  assert.equal(seenBody.response, "tok");
  assert.equal(seenBody.remoteip, "203.0.113.9");
});

test("siteverify 返回 success:true → 放行", async () => {
  process.env.TURNSTILE_SECRET_KEY = "test-secret";
  mockFetch(() => new Response(JSON.stringify({ success: true }), { status: 200 }));
  assert.deepEqual(await verifyTurnstile("tok"), { ok: true, skipped: false });
});

test("siteverify 网络异常 / 5xx → fail-open(放行),不影响注册可用性", async () => {
  process.env.TURNSTILE_SECRET_KEY = "test-secret";
  mockFetch(() => {
    throw new Error("ECONNRESET");
  });
  assert.deepEqual(await verifyTurnstile("tok"), { ok: true, skipped: true });

  mockFetch(() => new Response("bad gateway", { status: 502 }));
  assert.deepEqual(await verifyTurnstile("tok"), { ok: true, skipped: true });
});
