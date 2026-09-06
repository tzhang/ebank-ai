This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## 开发与运维(M1)

```bash
# 环境
cp .env.example .env   # 填入 DATABASE_URL 等(参见文件注释)

# 数据库
npm run db:generate    # schema → 迁移 SQL
npm run db:migrate     # 应用迁移(tsx 执行器,supavisor 兼容)
npm run db:seed        # 幂等种子数据(编辑部账号 + 10 话题 + 敏感词样例)

# 本地开发
npm run dev

# 测试账号
# 登录邮箱命中 ADMIN_EMAILS(env,逗号分隔)即自动提升为 admin;
# 种子编辑部账号 editorial@ebank.ai 为 moderator(无密码,仅供内容归属)。
```

## M1 功能地图

- 用户:注册(邮箱验证)、登录(邮箱密码 / GitHub OAuth)、找回密码、个人资料、注销(举报快照匿名保留)
- 社区:话题 CRUD、Markdown、楼层 + 楼中楼、点赞、浏览计数、敏感词库(DB + 缓存)、举报队列
- 管理后台(/admin,moderator+):用户封禁(全站只读)、内容置顶/加精/锁帖/删除/恢复、举报处理、审计日志(仅追加)
- 合规:用户协议 / 隐私政策 / 社区规则(草案,待法律审阅);生产配置清单见 PRD §五与 Issue #21
