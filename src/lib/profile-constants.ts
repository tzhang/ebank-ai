// 个人资料相关常量(前后端共享)
export const OCCUPATIONS = [
  "银行",
  "券商",
  "保险",
  "量化",
  "开发者",
  "个人投资者",
  "学生",
] as const;
export type Occupation = (typeof OCCUPATIONS)[number];

// 预置头像配色(按昵称哈希取色,不依赖图片上传)
export const AVATAR_COLORS = [
  "bg-gold-500",
  "bg-blue-500",
  "bg-emerald-500",
  "bg-rose-500",
  "bg-violet-500",
  "bg-cyan-500",
  "bg-orange-500",
  "bg-teal-500",
];

export function avatarColor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

export function avatarInitial(name: string | null | undefined, email: string): string {
  const s = (name ?? "").trim();
  return s ? s[0] : email[0]?.toUpperCase() ?? "e";
}
