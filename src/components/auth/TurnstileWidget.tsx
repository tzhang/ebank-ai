"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";

// M1 AUTH-106 — 注册表单人机校验组件。
//
// env 门控:未配置 NEXT_PUBLIC_TURNSTILE_SITE_KEY 时整体不渲染、不加载脚本(休眠态),
// 服务端对应地跳过校验(src/lib/turnstile.ts),两端行为一致。
//
// 采用**显式渲染**(api.js?render=explicit)而非隐式渲染:注册页是 client component,
// 经客户端路由再次进入时,api.js 已加载完毕不会再扫描 DOM,隐式渲染会漏掉新挂载的容器。
//
// token 写入隐藏 input(name=cf-turnstile-response),随表单 FormData 一并提交,
// 服务端从 formData 读取(见 src/lib/actions/auth.ts)。

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

type Props = {
  /** 校验失败/过期时的提示位置留白由父级表单控制,这里只负责渲染与取值 */
  className?: string;
};

export default function TurnstileWidget({ className }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [token, setToken] = useState("");
  const [scriptReady, setScriptReady] = useState(false);
  const [scriptFailed, setScriptFailed] = useState(false);

  useEffect(() => {
    if (!SITE_KEY || !scriptReady) return;
    const el = containerRef.current;
    const api = window.turnstile;
    if (!el || !api) return;

    // 二次挂载保护:清空容器后重新渲染,返回的 widgetId 用于卸载
    el.innerHTML = "";
    const widgetId = api.render(el, {
      sitekey: SITE_KEY,
      theme: "dark",
      "refresh-expired": "auto", // 过期自动重新挑战,避免用户提交时才发现失效
      callback: (t) => setToken(t),
      "expired-callback": () => setToken(""),
      "error-callback": () => setToken(""),
    });

    return () => {
      setToken("");
      try {
        api.remove(widgetId);
      } catch {
        // widget 可能已随容器卸载,忽略
      }
    };
  }, [scriptReady]);

  const onScriptError = useCallback(() => setScriptFailed(true), []);

  if (!SITE_KEY) return null;

  return (
    <div className={className}>
      <Script
        id="cf-turnstile-script"
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onReady={() => setScriptReady(true)}
        onError={onScriptError}
      />
      {scriptFailed ? (
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
          人机校验组件加载失败。若使用了广告拦截插件,请对本站放行后刷新页面。
        </p>
      ) : (
        <div ref={containerRef} />
      )}
      <input type="hidden" name="cf-turnstile-response" value={token} />
    </div>
  );
}
