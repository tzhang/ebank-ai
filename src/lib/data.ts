// ============================================================
// ebank.ai — Centralized Content Data Layer
// ============================================================

// -------- 金融大模型 - 文章 --------
export interface Article {
  slug: string;
  title: string;
  description: string;
  difficulty: "初级" | "中级" | "高级";
  category: string;
  author: string;
  date: string;
  readTime: string;
  sections: { heading: string; body: string }[];
}

export const llmArticles: Article[] = [
  {
    slug: "finllm-landscape",
    title: "金融大模型全景：从通用模型到金融专用模型",
    description: "一文看懂金融大模型版图：通用模型、金融专用模型各自的优劣与适用场景。",
    difficulty: "初级",
    category: "模型选型",
    author: "ebank.ai 编辑部",
    date: "2026-08-10",
    readTime: "8 分钟",
    sections: [
      {
        heading: "什么是金融大模型？",
        body: "金融大模型（FinLLM）泛指在金融场景中使用的大语言模型。它可以是直接调用的通用模型（GPT、Claude、Gemini、DeepSeek、Qwen），也可以是在金融语料上继续预训练或微调的专用模型（如 BloombergGPT、FinGPT）。选型的核心问题不是「哪个模型最强」，而是「哪个模型在你的任务、数据合规要求和成本约束下表现最好」。",
      },
      {
        heading: "通用模型在金融场景的表现",
        body: "最新的旗舰通用模型已经具备很强的金融能力：财报解读、研报摘要、合规问答、代码生成都能达到可用水平。它们的优势是通用性强、迭代快、生态成熟；劣势是对中文金融术语和 A 股特有制度（涨跌停、北向资金、龙虎榜）的理解需要靠 Prompt 补充，且数据出境合规是机构使用的硬约束。",
      },
      {
        heading: "金融专用模型的价值",
        body: "金融专用模型通过在金融语料（研报、公告、法规、交易数据）上继续训练，提升领域词汇理解和专业推理能力。典型代表包括 BloombergGPT（金融 NLP 任务）、FinGPT（开源金融微调框架），以及国内多家银行、券商与科技公司联合推出的行业模型。专用模型适合私有化部署、特定任务深度优化的场景。",
      },
      {
        heading: "国产模型与私有化部署",
        body: "对国内金融机构而言，DeepSeek、Qwen 等开源国产模型是私有化部署的主流选择：许可证友好、中文能力强、可以在行内机房运行满足数据不出域要求。搭配 vLLM 等推理框架，可以用可控成本获得接近旗舰模型的金融分析能力。",
      },
      {
        heading: "选型决策框架",
        body: "建议按四个维度评估：任务匹配度（用真实业务样本测试而非通用榜单）、合规性（数据出境、模型备案）、总成本（API 费用或 GPU 投入 + 运维）、生态（是否被你的 Agent Harness 和 MCP 工具链支持）。模型选型不是一次性决策，建议每季度重新评测。",
      },
    ],
  },
  {
    slug: "chatgpt-investment-intro",
    title: "ChatGPT 投资分析入门",
    description: "学习如何用对话式 AI 快速分析财报、跟踪市场情绪、生成投资摘要。",
    difficulty: "初级",
    category: "工具入门",
    author: "ebank.ai 编辑部",
    date: "2026-06-15",
    readTime: "5 分钟",
    sections: [
      {
        heading: "为什么用 AI 做投资分析？",
        body: "传统投资分析需要大量阅读和计算：财报、研报、新闻、市场数据……而大语言模型可以在几秒内完成信息萃取和初步分析。这并不意味着 AI 能替代人的判断，但它能大幅提升信息处理效率，让你把精力花在更重要的决策环节。",
      },
      {
        heading: "基础 Prompt 模板",
        body: "一个好的分析 Prompt 包含三个要素：角色设定、任务描述、输出格式。例如：「你是一位资深金融分析师，请分析以下这家公司的季度财报，重点关注营收增长、利润率变化和现金流状况，以简洁的 bullet point 输出。」",
      },
      {
        heading: "财报分析实战",
        body: "将财报文本粘贴给 ChatGPT，提问：提取关键财务指标并与上一季度对比，指出值得关注的变化。AI 可以快速识别营收增速放缓、毛利率下降、应收账款激增等风险信号。建议每次只分析一个维度，逐步积累分析框架。",
      },
      {
        heading: "市场情绪追踪",
        body: "用 AI 监控新闻和社交媒体的市场情绪。输入一组新闻标题，让 AI 按正面/中性/负面分类，并给出情绪指数。长期追踪可以帮助你发现市场情绪的转折点。",
      },
      {
        heading: "注意事项",
        body: "AI 会有幻觉——生成看似合理但实际错误的数据。务必交叉验证关键数字。不要用 AI 做高频交易决策。将 AI 视为分析助手而非决策者，所有投资决策仍需独立判断。",
      },
    ],
  },
  {
    slug: "llm-industry-research",
    title: "用大模型做行业研究",
    description: "利用 Claude、DeepSeek 等大模型进行深度行业研究和竞品分析。",
    difficulty: "中级",
    category: "研究方法",
    author: "ResearchWang",
    date: "2026-06-10",
    readTime: "10 分钟",
    sections: [
      {
        heading: "行业研究的 AI 工作流",
        body: "传统的行业研究需要阅读大量报告、整理数据、绘制图表。AI 可以全流程辅助：信息检索、数据提取、对比分析、报告撰写。关键是设计好每个环节的 Prompt 和验证机制。",
      },
      {
        heading: "信息检索与整理",
        body: "先用 AI 梳理行业知识框架。输入行业关键词，让 AI 生成结构化的行业图谱，从产业链结构到代表公司，作为研究的起点。",
      },
      {
        heading: "竞品对比矩阵",
        body: "让 AI 生成竞品对比表。例如比较宁德时代、比亚迪、国轩高科在市场份额、毛利率、研发投入、海外营收占比等维度。你可以在此基础上深入查询具体数据来验证。",
      },
      {
        heading: "趋势分析与预测",
        body: "AI 可以帮助识别行业趋势信号。综合多篇研报和新闻，让 AI 提炼出当前行业最受关注的核心趋势，并为每个趋势给出支持证据和风险因素。",
      },
    ],
  },

  {
    slug: "deepseek-quant-analysis",
    title: "DeepSeek 量化分析",
    description: "利用 DeepSeek 的开源模型能力，搭建本地量化分析和回测系统。",
    difficulty: "高级",
    category: "DeepSeek",
    author: "QuantDev",
    date: "2026-06-01",
    readTime: "15 分钟",
    sections: [
      {
        heading: "为什么选 DeepSeek？",
        body: "DeepSeek 是国产大模型中在金融量化领域表现突出的模型。其 V3 和 R1 版本在数学推理、代码生成方面达到国际领先水平。而且 DeepSeek 支持本地部署，这对金融机构的数据安全要求至关重要。",
      },
      {
        heading: "本地量化环境搭建",
        body: "在本地或私有云部署 DeepSeek 模型，连接行情数据库和回测引擎。搭建要点：使用 vLLM 或 Ollama 进行模型推理加速；设计标准化的数据接口（行情、财务、因子数据）；建立回测结果的可视化看板。",
      },
      {
        heading: "策略研究与代码生成",
        body: "用自然语言描述策略思路：基于 RSI 和成交量确认的均值回归策略，入场条件是 RSI < 30 且成交量放大 50% 以上，出场条件是 RSI > 70。在沪深 300 成分股上做回测。DeepSeek 会生成完整的回测代码和结果分析。",
      },
      {
        heading: "模型微调与优化",
        body: "对于特定场景，可以对 DeepSeek 进行微调。例如，用量化研报和交易日志微调模型，使其更理解你的策略框架和风控偏好。微调后的模型在生成策略代码和交易建议时会更贴合你的需求。",
      },
    ],
  },
  {
    slug: "ai-asset-allocation",
    title: "AI 辅助个人资产配置",
    description: "让 AI 根据你的风险偏好、收入结构、人生阶段推荐资产配置方案。",
    difficulty: "初级",
    category: "投资策略",
    author: "ebank.ai 编辑部",
    date: "2026-06-05",
    readTime: "6 分钟",
    sections: [
      {
        heading: "AI 如何了解你的财务状况？",
        body: "好的资产配置始于对自身的了解。AI 会通过一系列问题来评估你的情况：年龄、收入稳定性、积蓄规模、投资经验、风险承受能力、财务目标及时间 horizon。回答越详细，AI 给出的建议越精准。",
      },
      {
        heading: "经典资产配置模型",
        body: "AI 通常会基于几个经典模型给出建议：生命周期基金模型（年龄越大债券越多）、60/40 股债组合、风险平价组合。AI 会根据你的具体情况调整各资产类别的权重，并解释背后的逻辑。",
      },
      {
        heading: "个性化调优",
        body: "除了股债比例，AI 还可以帮你考虑更多维度：不同市场的配置（A股/港股/美股）、行业暴露（是否过度集中在某个行业）、流动性需求（短期用钱 vs 长期投资）、税务优化（不同账户类型的税务处理）。",
      },
      {
        heading: "定期再平衡",
        body: "市场波动会使实际配置偏离目标。设置 AI 助手定期检查持仓比例，当偏离超过阈值（如 5%）时发出再平衡提醒，或生成具体的买卖建议。",
      },
    ],
  },
  {
    slug: "prompt-engineering-finance",
    title: "Prompt 工程：金融场景实战",
    description: "掌握编写高质量 Prompt 的技巧，让 AI 输出更准确的金融分析。",
    difficulty: "高级",
    category: "高级技巧",
    author: "PromptMaster",
    date: "2026-05-28",
    readTime: "12 分钟",
    sections: [
      {
        heading: "金融 Prompt 的核心原则",
        body: "金融领域对准确性要求极高。好的金融 Prompt 必须包含：明确的角色（例如你是一位 CFA 持证人）、精确的格式要求（例如用表格输出保留两位小数）、引用来源的要求（请列出数据来源）、不确定性声明（对不确定的判断请说明置信度）。",
      },
      {
        heading: "结构化 Prompt 模板",
        body: "推荐五段式结构化 Prompt：角色 + 上下文 + 任务 + 格式 + 约束。例如：「你是一位资深量化分析师。以下是某公司过去 3 年的财务数据。请分析其盈利质量和成长性。用表格展示关键指标，用段落总结判断。对于不确定的结论，请标注置信度。」",
      },
      {
        heading: "链式推理（Chain-of-Thought）",
        body: "对于复杂的金融分析，诱导 AI 进行逐步推理可以显著提升准确性。在 Prompt 中加入「请一步一步思考」或「请先列出你的分析框架，再逐项分析」。这能让 AI 的推理过程更透明，也便于你发现逻辑错误。",
      },
      {
        heading: "反事实与压力测试",
        body: "高阶用法是让 AI 进行反事实分析：「如果利率上升 100 个基点，这个投资组合的表现会如何？」或「请对这个策略进行压力测试，模拟 2008 年金融危机级别的市场冲击。」AI 可以快速生成多种情景分析。",
      },
    ],
  },
  {
    slug: "finllm-evaluation",
    title: "金融大模型评测：从榜单到自建基准",
    description: "如何科学评测金融大模型：公开基准、幻觉率测试与自建业务评测集的完整方法。",
    difficulty: "高级",
    category: "评测方法",
    author: "QuantDev",
    date: "2026-08-14",
    readTime: "12 分钟",
    sections: [
      {
        heading: "为什么通用榜单不够用？",
        body: "MMLU、C-Eval 这类通用榜单无法反映金融场景的真实能力。一个模型可以在常识推理上得分很高，却在计算债券久期、解读合并利润表时频繁出错。金融评测必须围绕你自己的任务构建：财报分析、合规问答、研报摘要、风险提示，每个任务的失败成本完全不同。",
      },
      {
        heading: "公开金融基准",
        body: "目前可用的中文金融基准包括：FinEval（覆盖金融、经济、会计等学科考试题）、CFA 模拟题集、FinBen（综合金融能力评测）等。它们适合做初筛——快速淘汰明显不合格的模型，但题目静态、易被训练集污染，不能作为最终选型依据。",
      },
      {
        heading: "自建业务评测集",
        body: "最佳实践是从真实业务中抽取 100-300 个样本，覆盖典型任务和边界情况：格式异常的财报、措辞模糊的条款、需要多步计算的问题。为每个样本准备标准答案或评分要点，用同一套 Prompt 对多个模型打分。评测集要定期更新，防止模型厂商针对公开样本过拟合。",
      },
      {
        heading: "幻觉率与数据可靠性",
        body: "金融场景最致命的失败模式是幻觉——编造不存在的数据、法规条款或公司信息。评测时单独统计幻觉率：让模型输出带来源引用的答案，人工核对来源真实性。建议设置一票否决：关键数字无来源或来源错误率超过阈值的模型直接淘汰。",
      },
      {
        heading: "成本与延迟评测",
        body: "在生产环境中，准确率之外还要评测单位成本和响应延迟：每千次调用的费用、P95 响应时间、长文档处理的上下文成本。建议绘制「准确率-成本」散点图，找到边际收益开始急剧下降的拐点，那就是性价比最优的模型档位。",
      },
    ],
  },
];

// -------- Agent Harness - 文章 --------
export const harnessArticles: Article[] = [
  {
    slug: "what-is-agent-harness",
    title: "什么是 Agent Harness？",
    description: "理解大模型落地的关键架构：模型之外的运行框架，决定 Agent 能做什么、不能做什么。",
    difficulty: "初级",
    category: "概念入门",
    author: "ebank.ai 编辑部",
    date: "2026-08-12",
    readTime: "7 分钟",
    sections: [
      {
        heading: "Harness 是什么？",
        body: "大模型本身只是一个「输入文本、输出文本」的函数。让它真正完成工作——读文件、调 API、执行代码、多轮循环——需要一层运行环境。这层环境就叫 Harness（运行框架/脚手架）。Claude Code、Codex CLI、Cursor、OpenClaw 都是 Harness：模型是引擎，Harness 是整辆车。",
      },
      {
        heading: "Harness 的核心组成",
        body: "一个完整的 Agent Harness 通常包含五个部分：上下文管理（决定模型每一步能看到什么）、工具调用（文件系统、Shell、网络、MCP 服务）、权限控制（哪些操作需要人工确认）、执行循环（模型调用工具、观察结果、继续推理直到任务完成）、以及会话持久化（断点续跑、历史回放）。",
      },
      {
        heading: "模型与 Harness 的分工",
        body: "同一个模型装进不同的 Harness，表现可以差出数倍。模型决定推理上限，Harness 决定能力下限：工具质量差、上下文裁剪不当、权限配置过松，都会让强模型表现得像个实习生。金融场景尤其如此——数据接口的准确性远比模型参数量重要。",
      },
      {
        heading: "为什么金融场景要关注 Harness？",
        body: "金融任务对准确性、可审计性和数据安全的要求远高于一般场景。Harness 层决定了：敏感数据是否会泄露到模型厂商、Agent 是否能直接执行交易、每一步操作是否有日志可查。选对 Harness 并正确配置，比换更强的模型更能提升金融 Agent 的可靠性。",
      },
      {
        heading: "从 Harness 到技能生态",
        body: "现代 Harness 普遍支持 Skills（可复用的指令包）和 MCP（标准化工具接口）扩展。你可以把合规检查、财报分析等常用流程封装成 Skill，把行情、研报数据接成 MCP 服务，让任何兼容的 Harness 即插即用——这正是 ebank.ai 技能库在做的事。",
      },
    ],
  },
  {
    slug: "claude-code-finance-workflow",
    title: "Claude Code 金融工作流",
    description: "用 Claude Code 自动化财务报表分析、监管报告生成、数据可视化。",
    difficulty: "中级",
    category: "Claude Code",
    author: "FinanceDev",
    date: "2026-06-14",
    readTime: "8 分钟",
    sections: [
      {
        heading: "Claude Code 在金融场景的定位",
        body: "Claude Code 是一个 AI 编程助手，但它远不止写代码。在金融场景中，它可以作为可对话的数据分析师：你用自然语言提问，它直接生成分析代码、运行并返回结果。这让金融从业者可以绕过传统 BI 工具的繁琐操作，直接获取洞察。",
      },
      {
        heading: "财务报表自动化分析",
        body: "将财务报表（PDF 或 CSV）导入项目目录，用 Claude Code 命令分析这份财报，计算所有关键财务比率，并与行业平均水平对比。Claude 会自动写 Python 代码提取数据、计算比率、生成对比图表。整个过程从几小时缩短到几分钟。",
      },
      {
        heading: "监管报告生成",
        body: "监管报告有严格的格式要求。你可以为 Claude Code 定义报告模板，然后让它根据季度交易数据生成符合证监会要求的 XBRL 格式报告。Claude 会按照模板结构填充数据，大幅减少手工填报的错误。",
      },
      {
        heading: "数据可视化工作流",
        body: "金融分析离不开图表。用 Claude Code，你可以描述你想要的图表类型和数据维度，AI 会选择合适的图表库（Plotly/Matplotlib）生成交互式图表。",
      },
    ],
  },
  {
    slug: "codex-agent-due-diligence",
    title: "Codex 智能体开发实战",
    description: "搭建自定义 Codex 智能体，处理尽职调查、合规检查、市场监控等场景。",
    difficulty: "高级",
    category: "Codex",
    author: "AgentBuilder",
    date: "2026-06-12",
    readTime: "12 分钟",
    sections: [
      {
        heading: "什么是 Codex 智能体？",
        body: "Codex 是一个可扩展的 AI 代理平台，支持创建自定义智能体（Agent）来完成特定任务。在金融场景中，你可以为尽职调查、合规检查、市场监控等重复性工作创建专用 Agent，让 AI 7x24 小时值守。",
      },
      {
        heading: "尽职调查 Agent 搭建",
        body: "尽职调查涉及大量文档审查。创建一个 DD Agent：给它配置搜索工具（Web Search + 数据库查询）、文档分析工具（PDF/Word 解析）、评分模板。Agent 可以自动扫描目标公司的公开信息，按尽调清单逐项评分，生成初步尽调报告。",
      },
      {
        heading: "合规检查 Agent",
        body: "合规 Agent 的核心是规则引擎。将监管条例、内部合规手册转化为可执行的检查规则。Agent 每天自动扫描交易记录、邮件、合同，标记潜在违规，按风险等级分类，并生成合规日志。",
      },
      {
        heading: "市场监控 Agent",
        body: "市场监控 Agent 需要实时数据接入。配置新闻源、行情数据、研报更新，Agent 持续分析并识别异常——某只股票突然放量、某行业出现政策变化、某公司舆情逆转。发现异常时，Agent 通过即时通讯工具推送警报。",
      },
    ],
  },
  {
    slug: "workbuddy-integration",
    title: "腾讯 WorkBuddy 集成指南",
    description: "在企业微信生态中配置 WorkBuddy，实现智能会议记录、任务分配和知识管理。",
    difficulty: "中级",
    category: "企业工具",
    author: "OpsManager",
    date: "2026-06-08",
    readTime: "7 分钟",
    sections: [
      {
        heading: "WorkBuddy 在银行的落地场景",
        body: "WorkBuddy 是腾讯面向企业场景的 AI 助手，深度集成企业微信生态。银行场景中最实用的功能包括：智能会议记录、智能知识库、审批助手等。",
      },
      {
        heading: "智能会议记录配置",
        body: "开启会议录制后，WorkBuddy 自动进行语音转文字，并提取：参会人、讨论要点、决议事项、待办任务及负责人。配置时需设置隐私规则——哪些会议内容可以被 AI 处理，哪些需要人工审核后才能归档。",
      },
      {
        heading: "金融知识库搭建",
        body: "将行内的制度文件、产品手册、合规指引导入 WorkBuddy 知识库。员工可以用自然语言提问业务规定，WorkBuddy 会从知识库中检索最新规定并给出带引用的回答。",
      },
      {
        heading: "审批工作流增强",
        body: "WorkBuddy 可以作为审批流程的智能前置——在提交审批前，自动检查资料完整性、计算关键指标、标注潜在风险点。审批人看到的不是原始材料，而是 AI 预处理后的摘要和分析。",
      },
    ],
  },
  {
    slug: "harness-comparison",
    title: "金融 Agent Harness 选型对比",
    description: "Claude Code、Codex、Cursor、OpenClaw 四大主流 Harness 在金融场景的横向对比与选型建议。",
    difficulty: "中级",
    category: "选型对比",
    author: "ebank.ai 编辑部",
    date: "2026-08-15",
    readTime: "10 分钟",
    sections: [
      {
        heading: "对比维度",
        body: "金融场景选 Harness 建议看五个维度：模型可换性（能否接入私有化模型）、MCP/Skills 生态（金融数据工具是否现成）、权限粒度（能否精确控制交易类操作）、审计能力（操作日志是否完整）、部署形态（云端 SaaS 还是本地 CLI）。不同团队的安全要求和工作流差异很大，没有万能答案。",
      },
      {
        heading: "Claude Code",
        body: "Anthropic 官方 CLI Harness，长任务执行和工具编排能力强，MCP 支持完善，社区金融 Skills 丰富。适合深度研究型任务：财报批量分析、尽调报告生成。局限是默认绑定 Claude 模型，数据需要出境到 API，对合规要求极高的机构需要评估。",
      },
      {
        heading: "Codex CLI",
        body: "OpenAI 的开源命令行 Harness，代码执行环境隔离（沙箱）做得好，支持配置自定义模型端点，对私有化部署友好。适合量化研究、回测脚本开发等代码密集型金融任务。Skills 生态正在快速成长。",
      },
      {
        heading: "Cursor",
        body: "IDE 形态的 Harness，图形界面降低了使用门槛，适合量化团队在编辑器内直接完成策略迭代。Tab 补全 + Agent 模式的组合对代码修改类任务效率极高。局限是重 GUI、不易集成到自动化流水线，权限配置粒度弱于 CLI 类工具。",
      },
      {
        heading: "OpenClaw 等国产/开源方案",
        body: "以 OpenClaw 为代表的国产开源 Harness 主打本地化和国产模型适配，可完全离线运行，满足数据不出域的监管要求。配套的中文金融 Skill 市场（A 股数据、龙虎榜、监管动态）对国内用户更友好。成熟度和文档相对国际产品仍有差距，适合有一定工程能力的团队。",
      },
      {
        heading: "选型建议",
        body: "个人投资者和研究人员：Claude Code 或 Cursor，生态最成熟、上手最快。量化团队：Codex CLI 或 Cursor，代码能力优先。银行、券商等强合规机构：开源 Harness + 私有化模型，把 Harness 当作基础设施自建审计和权限层。无论选哪个，都通过 MCP 标准化数据接口，保留未来切换的自由度。",
      },
    ],
  },
  {
    slug: "harness-security-compliance",
    title: "金融 Agent Harness 的安全与合规",
    description: "权限控制、沙箱隔离、审计日志：让 Agent 在金融场景安全落地的三道防线。",
    difficulty: "高级",
    category: "安全合规",
    author: "SecurityGuru",
    date: "2026-08-16",
    readTime: "11 分钟",
    sections: [
      {
        heading: "金融场景的特殊风险",
        body: "通用场景下 Agent 犯错的代价是多改几行代码；金融场景下可能是错发交易指令、泄露客户数据、生成违反监管要求的报告。因此金融 Agent Harness 的安全设计不是可选项，而是上线前提。核心思路：最小权限、纵深防御、全程可审计。",
      },
      {
        heading: "第一道防线：权限控制",
        body: "把 Agent 的权限拆成读/写/执行三类，逐项配置：行情数据只读、财务文件读写限定目录、交易类 API 默认禁用。关键操作（下单、对外发送、删除数据）必须保留人工确认环节。定期审查权限清单，删除不再使用的授权——权限只增不减是安全腐化的开始。",
      },
      {
        heading: "第二道防线：沙箱与数据隔离",
        body: "Agent 执行代码必须在隔离环境（容器/虚拟机）中运行，限制网络访问和文件系统范围。敏感数据分级处理：客户身份信息脱敏后再进入模型上下文；涉及未公开重大信息（内幕信息）的任务完全禁止使用云端模型。私有化部署 + 开源 Harness 是满足数据不出域要求的根本方案。",
      },
      {
        heading: "第三道防线：审计日志",
        body: "完整记录每次会话的输入输出、调用的工具、读取的数据和执行的结果，日志不可篡改且保留期满足监管要求（通常五年以上）。为每个产出物建立溯源：这份报告由哪个模型、哪个 Skill、基于哪些数据生成——出现争议时能完整回放决策过程。",
      },
      {
        heading: "合规落地清单",
        body: "上线前逐项检查：算法备案与模型合规评估是否完成；个人信息处理是否获得授权并最小化采集；Agent 生成内容是否明确标注 AI 生成；人工复核环节是否嵌入关键流程；应急预案是否覆盖 Agent 失控场景（错误交易、批量外发）。建议把这份清单纳入变更管理流程，每次 Harness 或模型升级后重新过一遍。",
      },
    ],
  },
];

// -------- 技能库 — 项目 --------
export interface SkillItem {
  slug: string;
  name: string;
  description: string;
  tool: string;
  type: "Skill" | "MCP";
  author: string;
  downloads: number;
  installGuide: string;
  configSnippet: string;
  tags: string[];
  sections: { heading: string; body: string }[];
  githubUrl?: string;
  githubStars?: number;
  language?: string;
  featured?: boolean;
  mirrorUrl?: string;  // 国内镜像地址（Gitee / FastGit 等）
}

export const skillItems: SkillItem[] = [
  {
    slug: "banking-compliance-scan",
    name: "banking-compliance-scan",
    description: "银行合规监管扫描 Skill — 自动抓取 NFRA、PBOC 最新监管动态，生成结构化合规简报。",
    tool: "Codex",
    type: "Skill",
    author: "ComplianceWang",
    downloads: 342,
    installGuide: "将 skill 文件夹复制到 ~/.codex/skills/ 目录，重启 Codex 后即可使用。",
    configSnippet: "# skills.json\n{\n  \"name\": \"banking-compliance-scan\",\n  \"schedule\": \"0 8 * * 1-5\",\n  \"sources\": [\n    \"https://www.nfra.gov.cn\",\n    \"https://www.pbc.gov.cn\"\n  ]\n}",
    tags: ["合规", "监管", "银行", "自动化"],
    sections: [
      { heading: "功能概述", body: "每日自动扫描 NFRA 和 PBOC 官网，获取最新监管通知、管理办法、行政处罚和统计数据，整理为结构化 Markdown 报告。" },
      { heading: "使用方式", body: "在 Codex 中运行 /scan-compliance，Skill 会自动获取最新动态并生成报告。支持指定日期范围过滤。" },
      { heading: "输出格式", body: "生成 Markdown 报告，按监管机构分组，每条动态包含标题、摘要、发布日期、原文链接和影响评估。" },
    ],
  },
  {
    slug: "zt-ai-discover",
    name: "zt-ai-discover",
    description: "AI 早期企业发现 Skill — 覆盖 9 信号发现框架，适合科创金融获客。",
    tool: "Codex",
    type: "Skill",
    author: "ZTLab",
    downloads: 218,
    installGuide: "将 skill 文件夹复制到 ~/.codex/skills/ 目录，重启 Codex 后即可使用。",
    configSnippet: "# config.yaml\nframework:\n  signals:\n    - funding_events\n    - patent_filings\n    - hiring_spikes\n  output: excel",
    tags: ["科创金融", "获客", "企业发现", "AI"],
    sections: [
      { heading: "9 信号发现框架", body: "覆盖融资事件、专利申请、招聘激增、产品发布、开源贡献、学术发表、监管备案、合作伙伴变化、市场份额变化九个信号维度的企业发现。" },
      { heading: "适用场景", body: "商业银行科创金融部门的早期企业获客、科技园区企业扫描、投贷联动标的识别。" },
      { heading: "输出格式", body: "支持 Excel 和 Markdown 格式输出，按匹配信号数量排序，附带企业基本信息、信号详情和联系建议。" },
    ],
  },
  {
    slug: "zt-ai-insight-weekly",
    name: "zt-ai-insight-weekly",
    description: "AI 行业深度研究 Skill — 竞争分析、公司尽调、价值创造、股票筛选。",
    tool: "Codex",
    type: "Skill",
    author: "ZTLab",
    downloads: 189,
    installGuide: "将 skill 文件夹复制到 ~/.codex/skills/ 目录，配置 API Key 后重启 Codex。",
    configSnippet: "# insight-config.json\n{\n  \"industries\": [\"AI芯片\", \"LLM\", \"自动驾驶\"],\n  \"report_schedule\": \"weekly\",\n  \"output_path\": \"./reports\"\n",

    tags: ["行业研究", "AI", "竞争分析", "投资"],
    sections: [
      { heading: "覆盖领域", body: "覆盖 18 个 AI 子领域：AI芯片、HBM、数据中心、网络、半导体、LLM、视频生成、编程、MaaS、Agent、搜索、安全、自动驾驶、人形机器人、制药、医疗影像、教育、金融。" },
      { heading: "功能特性", body: "自动生成行业全景图、竞争格局分析、公司深度报告、价值创造计划、跨越鸿沟分析。" },
      { heading: "输出格式", body: "高盛风格 PPT 和 Word 报告，支持中文和英文输出。" },
    ],
  },
  {
    slug: "mcp-securities-data",
    name: "mcp-securities-data",
    description: "证券市场数据 MCP 服务 — 提供实时行情、财务数据、公告检索的标准化接口。",
    tool: "通用",
    type: "MCP",
    author: "DataTeam",
    downloads: 156,
    installGuide: "在 Codex 的 MCP 设置中添加以下配置，重启后生效。",
    configSnippet: "{\"mcpServers\":{\"securities-data\":{\"command\":\"python\",\"args\":[\"-m\",\"mcp_securities_data\"]}}}",
    tags: ["行情", "财务数据", "证券", "API"],
    sections: [
      { heading: "数据覆盖", body: "沪深港美股的实时行情、历史 K 线、财务数据、公告检索、股东信息、研报摘要。" },     { heading: "接口特点", body: "标准化 RESTful API 接口，兼容 Claude Code、Codex、Cursor 等 AI 工具的 MCP 协议。" },
      { heading: "部署方式", body: "支持 Docker 部署和本地 Python 直接运行，内网环境下也可使用。" },
    ],
  },
  {
    slug: "mcp-compliance-scanner",
    name: "mcp-compliance-scanner",
    description: "合规文档扫描 MCP — 自动检查合同、报告中的监管合规风险点。",
    tool: "通用",
    type: "MCP",
    author: "ComplianceWang",
    downloads: 127,
    installGuide: "在 Codex 的 MCP 设置中添加以下配置，重启后生效。",
    configSnippet: "{\"mcpServers\":{\"compliance-scanner\":{\"command\":\"python\",\"args\":[\"-m\",\"compliance_scanner\"],\"env\":{\"MODEL\":\"deepseek-chat\"}}}",
    tags: ["合规", "文档扫描", "风控", "自动化"],
    sections: [
      { heading: "功能说明", body: "自动扫描合同、招股书、年度报告等金融文档，识别合规风险条款并与监管规则进行对比。" },     { heading: "规则引擎", body: "内置 200+ 合规检查规则，支持用户自定义规则。规则以 YAML 格式定义，易于扩展和维护。" },
      { heading: "输出格式", body: "生成风险矩阵报告，按风险等级排列，每条风险包含违规条款原文、相关法规引用和修改建议。" },
    ],
  },
  {
    slug: "mcp-financial-report",
    name: "mcp-financial-report",
    description: "财报分析 MCP — 对接上市公司财务数据，支持多期对比和比率分析。",
    tool: "通用",
    type: "MCP",
    author: "DataTeam",
    downloads: 98,
    installGuide: "在 Codex 的 MCP 设置中添加以下配置，重启后生效。",
    configSnippet: "{\"mcpServers\":{\"financial-report\":{\"command\":\"python\",\"args\":[\"-m\",\"financial_report_mcp\"]}}}",
    tags: ["财报", "分析", "财务数据", "对比"],
    sections: [
      { heading: "功能特点", body: "支持 3000+ A股上市公司的财务数据查询，自动计算盈利能力、偿债能力、营运能力、成长能力四大类 30+ 财务比率。" },     { heading: "对比分析", body: "支持多期对比（同比/环比）、行业对标（与行业均值对比）、自定义基准（与指定公司对比）。" },
      { heading: "输出格式", body: "返回结构化 JSON 数据，可直接渲染为表格或图表。" },
    ],
  },
];


// -------- GitHub 开源项目 — 自动更新 --------
// 以下项目来自 GitHub 真实仓库，实时 Star 数和详情请在 GitHub 上查看
export const githubSkills: SkillItem[] = [
  {
    slug: "claude-skills",
    name: "claude-skills",
    description: "337+ Claude Code skills & agent skills — 30+ Agents, 70+ custom commands, 330+ skills for Claude Code, Codex, Gemini CLI, Cursor. 覆盖工程、市场营销、产品、合规、财务、研究、商务运营等领域。",
    tool: "Codex/Claude",
    type: "Skill",
    author: "alirezarezvani",
    downloads: 0,
    installGuide: "克隆仓库后，将 skills/ 目录复制到你的 AI 工具技能目录下（如 ~/.codex/skills/）。",
    configSnippet: "# 克隆仓库\ngit clone https://github.com/alirezarezvani/claude-skills.git\n\n# 复制技能文件\ncp -r claude-skills/skills/* ~/.codex/skills/\n\n# 重启 Codex 后可用 /list-skills 查看所有技能",
    tags: ["综合", "金融", "合规", "效率"],
    sections: [
      { heading: "项目简介", body: "目前 GitHub 上最大的 Claude Code 技能合集，包含 337+ 个技能，覆盖 30+ Agent 模板。其中金融、合规、商务相关技能可直接用于投资分析和金融工作流程。" },
      { heading: "金融相关技能", body: "包含财务分析、合规检查、尽职调查、市场研究等专用技能包。每个技能都包含完整的 instruction 和配置。" }
    ],
    githubUrl: "https://github.com/alirezarezvani/claude-skills",
    githubStars: 18629,
    language: "Python",
    mirrorUrl: "https://ghproxy.com/https://github.com/alirezarezvani/claude-skills",
  },
  {
    slug: "hhxg-top-hhxg-python",
    name: "hhxg-top-hhxg-python",
    description: "一句话获取 A 股每日市场数据 — 赚钱效应、热门题材、连板天梯、游资龙虎榜。零配置，无需注册，无需 Token。OpenClaw / Codex 即装即用。",
    tool: "Codex/OpenClaw",
    type: "Skill",
    author: "Niceck",
    downloads: 0,
    installGuide: "通过 OpenClaw 市场安装，或手动克隆到 skills 目录。",
    configSnippet: "# 手动安装：\ngit clone https://github.com/Niceck/hhxg-top-hhxg-python.git\ncp -r hhxg-top-hhxg-python ~/.codex/skills/\n\n# 使用命令：\n/market-daily    # 获取今日 A 股市场概览",
    tags: ["A股", "市场数据", "龙虎榜", "题材"],
    sections: [
      { heading: "一句话市值", body: "专为 A 股投资者设计的数据获取技能。输入简短命令即可获取完整的 A 股每日市场数据，包括赚钱效应、热门题材、连板天梯、游资龙虎榜等。" },
      { heading: "零配置使用", body: "无需注册、无需 Token、无需任何配置。安装后即可通过自然语言命令获取数据，极大降低了 A 股数据获取的门槛。" }
    ],
    githubUrl: "https://github.com/Niceck/hhxg-top-hhxg-python",
    githubStars: 57,
    language: "Python",
    mirrorUrl: "https://ghproxy.com/https://github.com/Niceck/hhxg-top-hhxg-python",
  },
  {
    slug: "claude-trading-skills",
    name: "claude-trading-skills",
    description: "62 个交易、DeFi 和量化金融 Agent Skills。兼容 Claude Code、Cursor、Codex、Gemini CLI 等 30+ 工具。",
    tool: "Codex/Claude",
    type: "Skill",
    author: "agiprolabs",
    downloads: 0,
    installGuide: "克隆仓库后，按 README 指引将技能安装到对应 AI 工具。",
    configSnippet: "# 克隆仓库\ngit clone https://github.com/agiprolabs/claude-trading-skills.git\ncp -r claude-trading-skills/skills/* ~/.codex/skills/\n\n# 可用技能：技术分析 / 风险管理 / 组合优化",
    tags: ["交易", "量化", "DeFi", "策略"],
    sections: [
      { heading: "交易技能包", body: "62 个专为交易和量化金融设计的 Agent Skills，覆盖技术分析、风险管理、投资组合优化、DeFi 交互等场景。" },
      { heading: "多工具兼容", body: "兼容 Claude Code、Cursor、Codex、Gemini CLI 等 30+ AI 编码工具，一次安装随处使用。" }
    ],
    githubUrl: "https://github.com/agiprolabs/claude-trading-skills",
    githubStars: 64,
    language: "Python",
    mirrorUrl: "https://ghproxy.com/https://github.com/agiprolabs/claude-trading-skills",
  },
  {
    slug: "openaccountant-skills",
    name: "openaccountant/skills",
    description: "44 个开源金融 Agent Skills — P&L 分析、预算编制、税务准备、债务偿还等。兼容 Claude Code、Wilson、Cursor、Codex、Paperclip。",
    tool: "Codex/Claude",
    type: "Skill",
    author: "openaccountant",
    downloads: 0,
    installGuide: "克隆仓库后，将技能文件复制到 AI 工具的技能目录。",
    configSnippet: "# 克隆仓库\ngit clone https://github.com/openaccountant/skills.git\ncp -r skills/* ~/.codex/skills/\n\n# 运行 DCF 估值\n/run-dcf",
    tags: ["会计", "财务分析", "预算", "税务"],
    sections: [
      { heading: "开源会计技能", body: "44 个面向财务和会计场景的 Agent Skills，从 DCF 估值到预算编制，从税务准备到债务偿还计划，覆盖个人和企业财务管理的核心需求。" },
      { heading: "即装即用", body: "每个技能都是一个独立的 Skill.md 文件，安装后即可用自然语言命令调用，无需编写代码。" }
    ],
    githubUrl: "https://github.com/openaccountant/skills",
    githubStars: 22,
    mirrorUrl: "https://ghproxy.com/https://github.com/openaccountant/skills",
  },
  {
    slug: "financial-models-codex",
    name: "financial-models",
    description: "Codex 金融建模技能包 — DCF、三表模型、LBO、可比公司分析、SOTP、敏感性分析、投资委员会备忘录。一句话就能运行的金融建模工作流。",
    tool: "Codex",
    type: "Skill",
    author: "MichaelRochonnn",
    downloads: 0,
    installGuide: "按 README 将技能文件放入 Codex skills 目录。",
    configSnippet: "# 克隆仓库\ngit clone https://github.com/MichaelRochonnn/financial-models.git\ncp -r financial-models/* ~/.codex/skills/\n\n# 使用命令：\n/run-dcf        # DCF 估值\n/lbo-model      # LBO 模型",
    tags: ["估值", "DCF", "LBO", "财务建模"],
    sections: [
      { heading: "金融建模自动化", body: "专为金融专业人士设计的 Codex 技能集。覆盖 DCF、三表联动模型、LBO、可比公司分析、SOTP（加总法）、敏感性分析和投资委员会备忘录等核心金融建模场景。" },
      { heading: "一句话运行", body: "用自然语言描述你的估值需求，技能自动完成从数据获取到模型构建和结果输出的全过程。" }
    ],
    githubUrl: "https://github.com/MichaelRochonnn/financial-models",
    githubStars: 12,
    mirrorUrl: "https://ghproxy.com/https://github.com/MichaelRochonnn/financial-models",
  },
  {
    slug: "awesome-journal-skills-finance",
    name: "Awesome-Journal-Skills",
    description: "金融学术期刊专属 Claude Code/Codex 技能包 — 覆盖 AER、QJE、JF、JFE、经济研究等多个顶刊。选题、策略、表格规范到审稿回复全流程。",
    tool: "Codex/Claude",
    type: "Skill",
    author: "brycewang-stanford",
    downloads: 0,
    installGuide: "克隆仓库后，按期刊选择对应的 Skill.md 文件放入技能目录。",
    configSnippet: "# 克隆仓库\ngit clone https://github.com/brycewang-stanford/Awesome-Journal-Skills.git\n\n# 使用对应期刊技能\ncp journals/jf-skills.md ~/.codex/skills/\n\n# 在 Codex 中按期刊指令使用",
    tags: ["学术", "论文", "经济研究", "金融研究"],
    sections: [
      { heading: "学术写作利器", body: "覆盖 200+ 主流期刊的 Claude Code/Codex 技能包，从选题识别到策略构建，从表格规范到审稿回复全流程支持。" },
      { heading: "金融经济全覆盖", body: "包含 American Economic Review、Quarterly Journal of Economics、Journal of Finance、Journal of Financial Economics、经济研究、管理世界等金融经济类顶刊。" }
    ],
    githubUrl: "https://github.com/brycewang-stanford/Awesome-Journal-Skills",
    githubStars: 324,
    language: "Stata",
    mirrorUrl: "https://ghproxy.com/https://github.com/brycewang-stanford/Awesome-Journal-Skills",
  },
  {
    slug: "MoneyAtlas-ClaudeSkill-Agent",
    name: "MoneyAtlas-ClaudeSkill-Agent",
    description: "面向金融市场的 AI Agent Skill — 基于 Genesis Protocol 的一性原理+系统思维框架，整合 SMC 引擎的量化价格结构分析。用于宏观经济、地缘政治和金融市场的深度研究。",
    tool: "Claude",
    type: "Skill",
    author: "ElmatadorZ",
    downloads: 0,
    installGuide: "下载 Skill.md 文件放入 ~/.codex/skills/ 目录，重启 Codex 即可。",
    configSnippet: "# 下载技能文件\ncd ~/.codex/skills/\ncurl -O https://raw.githubusercontent.com/ElmatadorZ/MoneyAtlas-ClaudeSkill-Agent/main/Skill.md\n\n# 重启 Codex 后即可使用宏观经济分析功能",
    tags: ["宏观经济", "地缘政治", "系统思维", "研究"],
    sections: [
      { heading: "宏观金融分析框架", body: "基于 Genesis Protocol 的认知架构，结合一性原理（First Principle）和系统思维（System Thinking）进行金融市场分析。内置 SMC（Smart Money Concepts）引擎用于量化价格结构分析。" }
    ],
    githubUrl: "https://github.com/ElmatadorZ/MoneyAtlas-ClaudeSkill-Agent",
    githubStars: 49,
    language: "Python",
    mirrorUrl: "https://ghproxy.com/https://github.com/ElmatadorZ/MoneyAtlas-ClaudeSkill-Agent",
  },
  {
    slug: "TradingAgents-astock",
    name: "TradingAgents-astock",
    description: "A 股多 Agent 投研框架 — 适配 A 股数据源（龙虎榜/游资/解禁等），7 位 AI 分析师基于 A 股规则的辩论决策。",
    tool: "Codex/Claude",
    type: "Skill",
    author: "simonlin1212",
    downloads: 0,
    installGuide: "克隆仓库，配置 A 股数据源后运行。需要 Python 环境。",
    configSnippet: "# 克隆仓库\ngit clone https://github.com/simonlin1212/TradingAgents-astock.git\ncd TradingAgents-astock\n\n# 安装依赖\npip install -r requirements.txt\n\n# 分析个股\npython run_analysis.py --symbol 600519.SH",
    tags: ["A股", "多智能体", "投研", "辩论决策"],
    sections: [
      { heading: "A 股专属投研系统", body: "基于 TradingAgents 架构深度改造，专为大 A 股量身定制。7 位 AI 分析师模拟机构投研团队，进行多空辩论和风险评估。适配 A 股特有数据源：龙虎榜、游资追踪、解禁数据等。" }
    ],
    githubUrl: "https://github.com/simonlin1212/TradingAgents-astock",
    githubStars: 1316,
    language: "Python",
    mirrorUrl: "https://ghproxy.com/https://github.com/simonlin1212/TradingAgents-astock",
  },
  {
    slug: "TradingAgents-AShare",
    name: "TradingAgents-AShare",
    description: "15 名 AI Agent 模拟机构协作与实时辩论对抗，全流程可视化。支持 OpenClaw / Claude Code 集成，Docker 一键部署。",
    tool: "OpenClaw/Claude",
    type: "Skill",
    author: "KylinMountain",
    downloads: 0,
    installGuide: "Docker 一键部署，支持 OpenClaw / Claude Code 集成。",
    configSnippet: "# Docker 一键部署\ndocker-compose up -d\n\n# 访问 Web UI\nopen http://localhost:3000",
    tags: ["A股", "多智能体", "机构协作", "Docker"],
    sections: [
      { heading: "机构级投研系统", body: "基于 TradingAgents 架构，15 名 AI Agent 模拟真实机构投研团队的协作流程。从数据收集、分析研究到投资决策全流程可视化。支持实时辩论对抗机制，模拟多空双方的观点碰撞。" }
    ],
    githubUrl: "https://github.com/KylinMountain/TradingAgents-AShare",
    githubStars: 590,
    language: "Python",
    mirrorUrl: "https://ghproxy.com/https://github.com/KylinMountain/TradingAgents-AShare",
  },
  {
    slug: "qlib",
    name: "microsoft/qlib",
    description: "微软开源的 AI 量化投资平台 — 从研究到生产的端到端解决方案。支持监督学习、市场动态建模、强化学习等多种范式。",
    tool: "通用",
    type: "MCP",
    author: "Microsoft",
    downloads: 0,
    installGuide: "Qlib 是 Python 库，可直接 pip 安装。",
    configSnippet: "# 安装 Qlib\npip install qlib\n\n# 初始化 A 股数据\npython scripts/get_data.py qlib_data --target_dir ~/.qlib/qlib_data/cn_data\n\n# 启动研究\npython scripts/research.py",
    tags: ["量化", "机器学习", "开源平台", "AI"],
    sections: [
      { heading: "AI 量化平台", body: "微软开源的 AI 量化投资平台，使用 AI 技术赋能量化研究。支持多样化的 ML 建模范式，包括监督学习、市场动态建模和强化学习。" },
      { heading: "丰富的数据集", body: "提供标准化的量化数据集，支持 A 股和美股。内置多种经典因子和模型，可作为研究和生产的统一平台。" }
    ],
    githubUrl: "https://github.com/microsoft/qlib",
    githubStars: 44871,
    language: "Python",
    mirrorUrl: "https://ghproxy.com/https://github.com/microsoft/Qlib",
  },
  {
    slug: "ai-financial-agent",
    name: "virattt/ai-financial-agent",
    description: "面向投资研究的 AI 金融 Agent — 用 LLM 驱动自动化投资研究流程，覆盖公司分析、财务数据提取、投资观点生成。",
    tool: "通用",
    type: "MCP",
    author: "virattt",
    downloads: 0,
    installGuide: "克隆仓库后配置 API Key，直接运行即可。",
    configSnippet: "# 安装依赖\nnpm install\n\n# 配置环境变量\ncp .env.example .env\n# 编辑 .env 填入 API Key\n\n# 启动\nnpm start",
    tags: ["投资研究", "Agent", "财务分析", "自动报告"],
    sections: [
      { heading: "AI 投资研究 Agent", body: "TypeScript 构建的投资研究 AI Agent。自动收集公司财务数据、分析财务报表、生成投资观点和研究报告。" },
      { heading: "交互式分析", body: "支持对话式交互，用户可以用自然语言提问公司相关信息，Agent 自动进行数据检索和分析并返回结构化结果。" }
    ],
    githubUrl: "https://github.com/virattt/ai-financial-agent",
    githubStars: 1986,
    language: "TypeScript",
    mirrorUrl: "https://ghproxy.com/https://github.com/virattt/ai-financial-agent",
  },
  {
    slug: "Mira-investment-research",
    name: "byteseek/Mira",
    description: "Agent 原生投资研究工作空间 — 证据追踪、可刷新的投资论点，覆盖股票、财报、宏观经济和投资组合回顾。",
    tool: "Codex/Claude",
    type: "Skill",
    author: "byteseek",
    downloads: 0,
    installGuide: "克隆仓库后，参照 README 配置并运行。",
    configSnippet: "# 克隆仓库\ngit clone https://github.com/byteseek/Mira.git\ncd Mira\n\n# 安装依赖\npip install -r requirements.txt\n\n# 启动\npython mira.py",
    tags: ["投资研究", "证据追踪", "股票", "宏观"],
    sections: [
      { heading: "证据驱动的投资研究", body: "Agent 原生（Agent-native）的投资研究工作空间。每个投资论点都附带完整的证据链和来源追踪，支持随时刷新和更新。覆盖股票研究、财报分析、宏观分析和投资组合回顾。" }
    ],
    githubUrl: "https://github.com/byteseek/Mira",
    githubStars: 224,
    language: "Python",
    mirrorUrl: "https://ghproxy.com/https://github.com/byteseek/Mira",
  },
  {
    slug: "multi-agent-investment",
    name: "multi-agent-investment",
    description: "多 Agent 股权研究系统 — 3 个专业 Agent（ReAct、FinBERT、Plan-and-Solve + RAG）通过确定性信号融合产生 BUY/NEUTRAL/SELL 决策。",
    tool: "通用",
    type: "MCP",
    author: "flash131307",
    downloads: 0,
    installGuide: "克隆仓库后安装 Python 依赖，运行分析脚本。",
    configSnippet: "# 安装依赖\npip install -r requirements.txt\n\n# 运行分析\npython run_investigation.py --ticker AAPL",
    tags: ["多Agent", "信用分析", "RAG", "决策系统"],
    sections: [
      { heading: "确定性信号融合系统", body: "三个专业 Agent（ReAct、FinBERT 情感分析、Plan-and-Solve + RAG）产生独立的买卖观点，通过数学化的 Decision Hub 进行信号融合。LLM 不做最终决策，系统对幻觉天然鲁棒。" }
    ],
    githubUrl: "https://github.com/flash131307/multi-agent-investment",
    githubStars: 196,
    language: "Python",
    mirrorUrl: "https://ghproxy.com/https://github.com/flash131307/multi-agent-investment",
  },
  {
    slug: "AI-Kline",
    name: "QuantMLResearch/AI-Kline",
    description: "Python 股票分析工具 — 结合传统技术分析与 AI 预测能力。支持 K 线图、技术指标、财务数据、新闻数据的综合分析。支持 CMD/WEB/MCP 三种使用方式。",
    tool: "通用",
    type: "MCP",
    author: "QuantMLResearch",
    downloads: 0,
    installGuide: "pip 安装后可直接运行，支持 CMD / WEB / MCP 三种模式。",
    configSnippet: "# pip 安装\npip install ai-kline\n\n# 命令行分析\nakline --ticker 600519.SH\n\n# WEB 模式启动\nakline web",
    tags: ["技术分析", "股票", "K线", "多模态"],
    sections: [
      { heading: "全能股票分析工具", body: "结合传统技术分析（K 线形态、技术指标）与 AI 预测能力的综合股票分析工具。支持 CMD 命令行、WEB 界面和 MCP 协议三种使用方式。" }
    ],
    githubUrl: "https://github.com/QuantMLResearch/AI-Kline",
    githubStars: 328,
    language: "Python",
    mirrorUrl: "https://ghproxy.com/https://github.com/QuantMLResearch/AI-Kline",
  },
  {
    slug: "QuantDesk",
    name: "0xbet-ai/QuantDesk",
    description: "AI-Agent 量化交易工作空间 — 多 Agent 协作进行回测、验证和模拟交易。支持 Freqtrade、Nautilus Trader 等框架集成。",
    tool: "Codex/Claude",
    type: "MCP",
    author: "0xbet-ai",
    downloads: 0,
    installGuide: "npm install 后配置策略文件，支持多 Agent 协作回测。",
    configSnippet: "# 安装\nnpm install\n\n# 配置策略\ncp config.example.ts config.ts\n\n# 回测\nnpm run backtest -- --strategy mean-reversion",
    tags: ["量化交易", "回测", "多Agent", "策略"],
    sections: [
      { heading: "量化交易工作空间", body: "专为量化交易设计的 AI-Agent 工作空间。多 Agent 协作进行策略开发、回测验证和模拟交易。支持 Freqtrade、Nautilus Trader 等主流量化框架的集成。" }
    ],
    githubUrl: "https://github.com/0xbet-ai/QuantDesk",
    githubStars: 13,
    language: "TypeScript",
    mirrorUrl: "https://ghproxy.com/https://github.com/0xbet-ai/QuantDesk",
  },
  {
    slug: "varrd",
    name: "augiemazza/varrd",
    description: "AI 驱动的交易研究平台 — 在股票、期货和加密货币上测试任何想法。事件研究、回测和统计验证。提供 MCP Server（8 个工具）。",
    tool: "通用",
    type: "MCP",
    author: "augiemazza",
    downloads: 0,
    installGuide: "pip 安装后初始化即可使用。提供 MCP Server。",
    configSnippet: "# 安装\npip install varrd\n\n# 初始化\nvarrd init",
    tags: ["交易研究", "事件研究", "回测", "统计"],
    sections: [
      { heading: "交易研究平台", body: "在股票、期货和加密货币上测试任何交易想法。提供事件研究（Event Study）、回测和统计验证功能。内置 MCP Server，提供 8 个工具供 AI Agent 调用。" }
    ],
    githubUrl: "https://github.com/augiemazza/varrd",
    githubStars: 21,
    language: "Python",
    mirrorUrl: "https://ghproxy.com/https://github.com/augiemazza/varrd",
  },
  {
    slug: "financial-datasets-mcp-server",
    name: "financial-datasets/mcp-server",
    description: "对接 Financial Datasets 美股/港股市场数据的 MCP 服务器。提供历史价格、财务报表、公司信息、市场新闻等数据的标准化查询接口。",
    tool: "通用",
    type: "MCP",
    author: "financial-datasets",
    downloads: 0,
    installGuide: "克隆仓库后，配置 API Key 即可使用。",
    configSnippet: "参考 GitHub README 配置 API Key 后使用",
    tags: ["美股", "港股", "财务数据", "行情"],
    sections: [
      { heading: "美股港股金融数据", body: "专为 AI Agent 设计的金融数据 MCP 服务器。提供上市公司历史价格、财务报表、公司信息、市场新闻等数据的标准化查询接口。" }
    ],
    githubUrl: "https://github.com/financial-datasets/mcp-server",
    githubStars: 2198,
    language: "Python",
    mirrorUrl: "https://ghproxy.com/https://github.com/financial-datasets/mcp-server",
  },
  {
    slug: "yahoo-finance-mcp",
    name: "yahoo-finance-mcp",
    description: "基于 Yahoo Finance 的 MCP 服务器 — 提供股票历史价格、公司信息、财务报表、期权数据、市场新闻等全面数据。",
    tool: "通用",
    type: "MCP",
    author: "Alex2Yang97",
    downloads: 0,
    installGuide: "克隆仓库后，添加到 MCP 设置中即可（无需 API Key）。",
    configSnippet: "参考 GitHub README 配置 MCP 设置",
    tags: ["行情", "财务数据", "期权", "全球市场"],
    sections: [
      { heading: "Yahoo Finance MCP", body: "基于 Yahoo Finance 数据源的 MCP 服务器。无需 API Key 即可获取全球股票的历史价格、财务报表、公司信息、期权数据和市场新闻。" }
    ],
    githubUrl: "https://github.com/Alex2Yang97/yahoo-finance-mcp",
    githubStars: 314,
    language: "Python",
    mirrorUrl: "https://ghproxy.com/https://github.com/Alex2Yang97/yahoo-finance-mcp",
  },
  {
    slug: "akshare-one-mcp",
    name: "akshare-one-mcp",
    description: "中国 A 股市场数据 MCP 服务 — 基于 AKShare 数据源，覆盖 A 股行情、基金、期货、宏观数据等。",
    tool: "通用",
    type: "MCP",
    author: "zwldarren",
    downloads: 0,
    installGuide: "克隆仓库后，添加到 MCP 设置中即可使用。",
    configSnippet: "参考 GitHub README 配置 MCP 设置",
    tags: ["A股", "AKShare", "基金", "宏观数据"],
    sections: [
      { heading: "中国金融市场数据 MCP", body: "基于 AKShare 数据源的开源 MCP 服务器。覆盖 A 股行情、基金数据、期货数据、宏观经济指标等丰富数据源。适合量化研究和 AI Agent 调用。" }
    ],
    githubUrl: "https://github.com/zwldarren/akshare-one-mcp",
    githubStars: 194,
    language: "Python",
    mirrorUrl: "https://ghproxy.com/https://github.com/zwldarren/akshare-one-mcp",
  },
  {
    slug: "tickdb-marketdata-api",
    name: "TickDB/tickdb-unified-realtime-marketdata-api",
    description: "AI 原生实时金融行情数据 API — 支持美股、港股、A 股、外汇、加密货币、指数和大宗商品。提供 Skill、CLI、MCP、REST API 和 WebSocket 五种接入方式。",
    tool: "通用",
    type: "MCP",
    author: "TickDB",
    downloads: 0,
    installGuide: "注册 API Key 后，添加到 MCP 设置中即可使用。",
    configSnippet: "参考 GitHub README 获取 API Key 后配置",
    tags: ["实时行情", "多市场", "Tick级数据", "API"],
    sections: [
      { heading: "AI 原生行情数据", body: "AI 原生的实时行情数据平台。支持美股、港股、A 股、外汇、加密货币、指数和大宗商品。提供 Skill、CLI、MCP Server、REST API 和 WebSocket 五种接入方式。" }
    ],
    githubUrl: "https://github.com/TickDB/tickdb-unified-realtime-marketdata-api",
    githubStars: 446,
    language: "Python",
    mirrorUrl: "https://ghproxy.com/https://github.com/TickDB/tickdb-unified-realtime-marketdata-api",
  },
  {
    slug: "massive-mcp-server",
    name: "massive-com/mcp_massive",
    description: "Massive.com 金融市场数据 MCP 服务器 — 提供股票、期权、加密货币的实时和历史市场数据。",
    tool: "通用",
    type: "MCP",
    author: "massive-com",
    downloads: 0,
    installGuide: "配置 API Key 后添加到 MCP 设置中。",
    configSnippet: "参考 GitHub README 配置 API Key",
    tags: ["美股", "期权", "加密货币", "实时数据"],
    sections: [
      { heading: "Massive 金融市场 MCP", body: "提供 Massive.com 金融平台的市场数据接口，支持股票、期权和加密货币的实时和历史数据查询。" }
    ],
    githubUrl: "https://github.com/massive-com/mcp_massive",
    githubStars: 359,
    language: "Python",
    mirrorUrl: "https://ghproxy.com/https://github.com/massive-com/mcp_massive",
  },
  {
    slug: "octagon-mcp-server",
    name: "OctagonAI/octagon-mcp-server",
    description: "公开市场和预测市场研究 MCP — 用自然语言提问 SEC 文件、财报电话会议、公司财务信息、股票和加密货币行情。",
    tool: "通用",
    type: "MCP",
    author: "OctagonAI",
    downloads: 0,
    installGuide: "配置 API Key 后添加到 MCP 设置中。",
    configSnippet: "参考 GitHub README 配置 API Key",
    tags: ["SEC", "财报", "预测市场", "研究"],
    sections: [
      { heading: "市场研究 MCP", body: "面向投资者和分析师的市场研究 MCP 服务器。用自然语言提问即可获得带来源的结构化答案。" }
    ],
    githubUrl: "https://github.com/OctagonAI/octagon-mcp-server",
    githubStars: 133,
    language: "TypeScript",
    mirrorUrl: "https://ghproxy.com/https://github.com/OctagonAI/octagon-mcp-server",
  },
  {
    slug: "financial-modeling-prep-mcp",
    name: "Financial-Modeling-Prep-MCP",
    description: "Financial Modeling Prep 数据的 MCP 实现 — 提供股票信息、公司基本面、ETF、市场洞察等金融数据查询。",
    tool: "通用",
    type: "MCP",
    author: "imbenrabi",
    downloads: 0,
    installGuide: "配置 FMP API Key 后添加到 MCP 设置中。",
    configSnippet: "参考 GitHub README 获取 FMP API Key",
    tags: ["财务数据", "基本面", "ETF", "估值"],
    sections: [
      { heading: "FMP 金融数据 MCP", body: "基于 Financial Modeling Prep API 的 MCP 服务器。提供完整的上市公司基本面数据、财务报表、估值指标和 ETF 信息。" }
    ],
    githubUrl: "https://github.com/imbenrabi/Financial-Modeling-Prep-MCP-Server",
    githubStars: 137,
    language: "TypeScript",
    mirrorUrl: "https://ghproxy.com/https://github.com/imbenrabi/Financial-Modeling-Prep-MCP-Server",
  },
  {
    slug: "HiThink-Financial-API",
    name: "HiThink-Tech/Financial-API",
    description: "同花顺金融数据 API — 提供 A 股行情、财务报表、复权因子、交易日历等数据接口。支持 REST/MCP、AI Agent 与量化研究。",
    tool: "通用",
    type: "MCP",
    author: "HiThink-Tech",
    downloads: 0,
    installGuide: "注册同花顺数据服务后获取 API Key，添加 MCP 配置。",
    configSnippet: "参考 GitHub README 获取 API Key",
    tags: ["同花顺", "A股", "财报", "交易日历"],
    sections: [
      { heading: "同花顺金融数据 MCP", body: "基于同花顺数据源的金融数据 API。提供 A 股实时行情、历史数据、财务报表、复权因子、交易日历等全面的数据接口。" }
    ],
    githubUrl: "https://github.com/HiThink-Tech/Financial-API",
    githubStars: 56,
    language: "Python",
    mirrorUrl: "https://ghproxy.com/https://github.com/HiThink-Tech/Financial-API",
  },
  {
    slug: "finance-trading-ai-agents-mcp",
    name: "aitrados/finance-trading-ai-agents-mcp",
    description: "综合性免费金融分析与量化交易 MCP 服务器 — 一键本地部署，采用部门式架构模拟真实金融机构运作。",
    tool: "通用",
    type: "MCP",
    author: "aitrados",
    downloads: 0,
    installGuide: "使用 Docker 一键部署后即可使用。",
    configSnippet: "# Docker 部署\ndocker run -d -p 8080:8080 aitrados/finance-trading-mcp",
    tags: ["量化交易", "本地部署", "部门架构", "一站式"],
    sections: [
      { heading: "一站式金融 MCP 服务器", body: "免费且全面的金融分析与量化交易 MCP 服务器。采用部门式架构（研究、交易、风控等），模拟真实金融机构的运作方式。" }
    ],
    githubUrl: "https://github.com/aitrados/finance-trading-ai-agents-mcp",
    githubStars: 63,
    language: "Python",
    mirrorUrl: "https://ghproxy.com/https://github.com/aitrados/finance-trading-ai-agents-mcp",
  },
  {
    slug: "CasualMarket",
    name: "sacahan/CasualMarket",
    description: "台湾股票市场 MCP Server — 提供即时股价查询、财务分析、市场资讯等功能。",
    tool: "通用",
    type: "MCP",
    author: "sacahan",
    downloads: 0,
    installGuide: "克隆仓库后，添加到 MCP 设置中即可使用。",
    configSnippet: "参考 GitHub README 配置 MCP 设置",
    tags: ["台股", "即时行情", "财务分析", "TWSE"],
    sections: [
      { heading: "台湾股市 MCP", body: "功能完整的台湾股票交易 MCP Server。提供即时股价查询、财务分析、市场资讯等多种功能。" }
    ],
    githubUrl: "https://github.com/sacahan/CasualMarket",
    githubStars: 24,
    language: "Python",
    mirrorUrl: "https://ghproxy.com/https://github.com/sacahan/CasualMarket",
  },
  {
    slug: "due-diligence-agents",
    name: "zoharbabin/due-diligence-agents",
    description: "开源取证级 M&A 尽职调查系统 — 13 个 AI Agent 跨 9 个领域（法律、财务、商业、技术、网络安全、HR、税务、监管、ESG）阅读数据室文档，每个发现都精确到原文和页码。",
    tool: "通用",
    type: "MCP",
    author: "zoharbabin",
    downloads: 0,
    installGuide: "克隆仓库后配置数据室路径，运行 Agent 集群进行分析。",
    configSnippet: "# 克隆仓库\ngit clone https://github.com/zoharbabin/due-diligence-agents.git\ncd due-diligence-agents\npip install -r requirements.txt\npython run_dd_agents.py --data_room ./deals/company_x",
    tags: ["尽职调查", "M&A", "合规", "多Agent"],
    sections: [
      { heading: "AI 尽职调查系统", body: "开源的 M&A 尽职调查 Agent 系统。13 个 AI Agent 并行阅读数据室文档，覆盖法律、财务、商业、技术、网络安全、HR、税务、监管和 ESG 九个领域。" }
    ],
    githubUrl: "https://github.com/zoharbabin/due-diligence-agents",
    githubStars: 50,
    language: "Python",
    mirrorUrl: "https://ghproxy.com/https://github.com/zoharbabin/due-diligence-agents",
  },
  {
    slug: "awesome-finance-mcp",
    name: "BlockRunAI/awesome-finance-mcp",
    description: "精选金融 AI Agent MCP 服务器合集 — 分类汇总股票数据、加密货币、DeFi、区块链等领域的 MCP 服务。",
    tool: "通用",
    type: "Skill",
    author: "BlockRunAI",
    downloads: 0,
    installGuide: "在线阅读合集，按文档指引选择并配置你需要的 MCP 服务。",
    configSnippet: "# 打开精选合集页面\n# https://github.com/BlockRunAI/awesome-finance-mcp\n\n# 从列表中选择你需要的金融 MCP 服务\n# 每个服务都有独立的安装说明和配置模板",
    tags: ["合集", "导航", "MCP", "资源索引"],
    sections: [
      { heading: "金融 MCP 精选合集", body: "精心整理的金融领域 MCP 服务器合集。涵盖股票数据、加密货币、DeFi、区块链等多个方向的 MCP 服务资源。" }
    ],
    githubUrl: "https://github.com/BlockRunAI/awesome-finance-mcp",
    githubStars: 146,
    mirrorUrl: "https://ghproxy.com/https://github.com/BlockRunAI/awesome-finance-mcp",
  },
];

// 合并所有技能（自有 + GitHub 开源）
export const allSkills: SkillItem[] = [...skillItems, ...githubSkills];
