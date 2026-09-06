// ============================================================
// M1 数据模型 — 种子数据(幂等,可重复执行)
// 来源:社区页原 10 条 mock 话题(communityTopics),归口「ebank.ai 编辑部」
// 用法:npm run db:seed
// ============================================================
import { sql } from "drizzle-orm";
import { getDb } from "../src/lib/db";
import { users, topics, bannedWords } from "../src/lib/db/schema";

// 敏感词样例库(FRM-136)——正式词库由管理端维护
const BANNED_TERMS = ["示例违禁词", "test-banned-term"];

const EDITORIAL_ID = "u_seed_editorial";
const EDITORIAL_EMAIL = "editorial@ebank.ai";

// 与社区 mock 列表一致:id / 标题 / 分类 / 置顶 / 相对时间
const SEED_TOPICS: {
  id: string;
  title: string;
  category: "讨论" | "问答" | "分享" | "资源";
  pinned?: boolean;
  ageHours: number;
  content: string;
}[] = [
  {
    id: "t_seed_01",
    title: "Claude Code 和 Codex 在金融数据处理的实际体验对比",
    category: "讨论",
    ageHours: 2,
    content: "社区话题由 v1 静态展示页迁移而来。欢迎围绕「Claude Code / Codex 处理财报、行情数据的真实体验」展开讨论——工具链选型、成本、踩坑都算。",
  },
  {
    id: "t_seed_02",
    title: "分享:我用 Claude Code 写了个财报分析脚本",
    category: "分享",
    ageHours: 5,
    content: "作者用 Claude Code 把财报 PDF 读取 → 关键比率计算 → 对比图表的流程自动化了,分享完整思路与代码片段,欢迎 fork 改进。",
  },
  {
    id: "t_seed_03",
    title: "国内银行部署 AI Agent 的 Harness 选型与合规难点讨论",
    category: "讨论",
    pinned: true,
    ageHours: 26,
    content: "【置顶】银行场景部署 AI Agent 绕不开三个问题:数据不出域怎么选 Harness、审计日志要做到什么粒度、模型备案怎么走。集中讨论贴。",
  },
  {
    id: "t_seed_04",
    title: "MCP 服务如何在内网环境下部署?",
    category: "问答",
    ageHours: 50,
    content: "问题:机构内网无法访问公网 MCP 注册中心,自建 MCP server 的传输与鉴权方案有哪些成熟做法?附上我们的网络约束说明。",
  },
  {
    id: "t_seed_05",
    title: "DeepSeek 在信用评估中的应用实践",
    category: "分享",
    ageHours: 74,
    content: "从行内 PoC 到试点:DeepSeek 私有化部署做贷前资料结构化与初筛评分的实践记录,含效果数据与合规审批路径。",
  },
  {
    id: "t_seed_06",
    title: "自建金融大模型评测集的经验:多少样本才够?",
    category: "问答",
    ageHours: 98,
    content: "我们在做内部模型评测,从 100 到 300 样本都试过。想请教大家:样本量、难度分布与更新频率的经验值。",
  },
  {
    id: "t_seed_07",
    title: "Prompt 让大模型输出格式化金融数据",
    category: "讨论",
    ageHours: 122,
    content: "从自由文本财报到 JSON/表格的稳定输出是金融 Agent 的地基。聊一聊结构化输出的 prompt 技巧与校验兜底。",
  },
  {
    id: "t_seed_08",
    title: "推荐几个金融领域好用的 Codex Skill",
    category: "资源",
    ageHours: 146,
    content: "技能库持续收录中:合规扫描、财报分析、行业研究……欢迎跟帖补充你验证过的 Skill 与安装踩坑。",
  },
  {
    id: "t_seed_09",
    title: "Agent 权限怎么管:交易类操作要不要完全禁用?",
    category: "讨论",
    pinned: true,
    ageHours: 170,
    content: "【置顶】最小权限、人工确认环节、审计回放——交易类 API 默认禁用是不是唯一正确答案?正反观点都欢迎。",
  },
  {
    id: "t_seed_10",
    title: "用大模型做债券违约预测的尝试",
    category: "分享",
    ageHours: 194,
    content: "信用债违约预测的实验室记录:文本因子(公告/舆情)与财务因子的融合尝试,附样本与回测口径说明。",
  },
];

async function main() {
  const db = getDb();
  console.log("seed: 写入编辑部账号…");
  const editorial = await db
    .insert(users)
    .values({
      id: EDITORIAL_ID,
      email: EDITORIAL_EMAIL,
      name: "ebank.ai 编辑部",
      emailVerified: new Date("2026-01-01"),
      role: "moderator", // 编辑部账号:moderator,不参与真实用户 admin 体系(ADM-120)
      bio: "ebank.ai 官方账号:内容与社区运营。",
    })
    .onConflictDoNothing()
    .returning({ id: users.id });
  console.log(`seed: 编辑部账号 ${editorial.length ? "新建" : "已存在(跳过)"}`);

  console.log("seed: 写入话题…");
  for (const t of SEED_TOPICS) {
    await db
      .insert(topics)
      .values({
        id: t.id,
        authorId: EDITORIAL_ID,
        title: t.title,
        content: t.content,
        category: t.category,
        pinned: t.pinned ?? false,
        // 相对发布时间,保持列表原有顺序观感
        createdAt: sql`now() - interval '${sql.raw(String(t.ageHours))} hours'`,
        updatedAt: sql`now() - interval '${sql.raw(String(t.ageHours))} hours'`,
      })
      .onConflictDoNothing();
  }
  console.log(`seed: 话题写入完成(${SEED_TOPICS.length} 条,幂等)`);

  console.log("seed: 写入敏感词样例库…");
  for (const term of BANNED_TERMS) {
    await db.insert(bannedWords).values({ term }).onConflictDoNothing();
  }

  const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(topics);
  console.log(`seed: 话题总数 = ${count}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("seed 失败:", err);
    process.exit(1);
  });
