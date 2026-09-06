// 社区内容分类(前后端共享常量,勿在模块顶层引入 db 依赖)
export const CATEGORIES = ["讨论", "问答", "分享", "资源"] as const;
export type Category = (typeof CATEGORIES)[number];

export const TOPIC_TITLE_MIN = 4;
export const TOPIC_TITLE_MAX = 100;
export const TOPIC_CONTENT_MAX = 50000;
export const REPLY_CONTENT_MAX = 20000;
