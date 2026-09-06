// M1 FRM-136 前置 — 敏感词检查(基础版)。
// 注意:此为**样例词表**,正式词库由 #15(FRM-136)改为数据库管理并可后台维护;
// 发布/回复/编辑统一走 checkSensitive,命中即拒。
const STARTER_BANNED_TERMS = ["示例违禁词", "test-banned-term"];

export function checkSensitive(text: string): { blocked: boolean; term?: string } {
  for (const term of STARTER_BANNED_TERMS) {
    if (text.includes(term)) return { blocked: true, term };
  }
  return { blocked: false };
}
