// Cloudflare Turnstile 客户端 API 的最小类型声明(AUTH-106)。
// 官方脚本在 https://challenges.cloudflare.com/turnstile/v0/api.js 注入 window.turnstile,
// 此处只声明我们用到的显式渲染接口,避免为一个 widget 引入 @types 包。
export {};

declare global {
  interface TurnstileRenderOptions {
    sitekey: string;
    theme?: "light" | "dark" | "auto";
    action?: string;
    "refresh-expired"?: "auto" | "manual" | "never";
    callback?: (token: string) => void;
    "expired-callback"?: () => void;
    "error-callback"?: () => void;
  }

  interface TurnstileApi {
    render: (container: HTMLElement | string, options: TurnstileRenderOptions) => string;
    remove: (widgetId: string) => void;
    reset: (widgetId?: string) => void;
  }

  interface Window {
    turnstile?: TurnstileApi;
  }
}
