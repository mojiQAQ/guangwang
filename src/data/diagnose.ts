// 诊断数据模型与评分逻辑
// 全部在客户端运行，无需后端。匿名诊断，10 分钟内出结果。

export type Industry =
  | "manufacturing"
  | "agriculture"
  | "ecommerce"
  | "tourism"
  | "government"
  | "education"
  | "healthcare"
  | "other";

export type Size = "lt50" | "50-300" | "300-1000" | "gt1000";
export type Role = "decision" | "it" | "business" | "other";

export type DataMaturity = "none" | "excel" | "siloed" | "unified";
export type ITCapability = "noTeam" | "small" | "medium" | "large";
export type AIAdoption = "none" | "casual" | "pilot" | "scaled";

export type Goal = "efficiency" | "cost" | "decision" | "experience" | "unsure";
export type PainPoint =
  | "sales"
  | "service"
  | "knowledge"
  | "analysis"
  | "training"
  | "ops"
  | "marketing"
  | "compliance";
export type Timeline = "1m" | "3m" | "6m" | "12m";

export type Layer = "L1" | "L2" | "L3";

export interface DiagnoseAnswers {
  industry?: Industry;
  size?: Size;
  role?: Role;
  data?: DataMaturity;
  it?: ITCapability;
  ai?: AIAdoption;
  goal?: Goal;
  pains: PainPoint[];
  timeline?: Timeline;
}

// ---------- 选项标签 ----------

export const INDUSTRY_OPTIONS: { value: Industry; label: string }[] = [
  { value: "manufacturing", label: "制造" },
  { value: "agriculture", label: "农业" },
  { value: "ecommerce", label: "电商" },
  { value: "tourism", label: "文旅" },
  { value: "government", label: "政企" },
  { value: "education", label: "教育" },
  { value: "healthcare", label: "医疗" },
  { value: "other", label: "其他" },
];

export const SIZE_OPTIONS: { value: Size; label: string; hint: string }[] = [
  { value: "lt50", label: "< 50 人", hint: "小微团队" },
  { value: "50-300", label: "50 – 300 人", hint: "中小企业" },
  { value: "300-1000", label: "300 – 1000 人", hint: "中型企业" },
  { value: "gt1000", label: "1000+ 人", hint: "中大型企业" },
];

export const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: "decision", label: "决策者 / 创始人" },
  { value: "it", label: "IT / 技术负责人" },
  { value: "business", label: "业务负责人" },
  { value: "other", label: "其他" },
];

export const DATA_OPTIONS: { value: DataMaturity; label: string; hint: string }[] = [
  { value: "none", label: "几乎没有沉淀", hint: "经验都在人脑里" },
  { value: "excel", label: "散落在 Excel / 文档", hint: "有数据但难调用" },
  { value: "siloed", label: "有系统但未打通", hint: "ERP/CRM 各自独立" },
  { value: "unified", label: "已有数据中台", hint: "数据可被统一调用" },
];

export const IT_OPTIONS: { value: ITCapability; label: string; hint: string }[] = [
  { value: "noTeam", label: "没有 IT 团队", hint: "依赖外包" },
  { value: "small", label: "1 – 3 人", hint: "基础运维" },
  { value: "medium", label: "5 – 10 人", hint: "有开发能力" },
  { value: "large", label: "10 人以上", hint: "有产品 / 算法" },
];

export const AI_OPTIONS: { value: AIAdoption; label: string; hint: string }[] = [
  { value: "none", label: "完全没用过", hint: "刚开始关注" },
  { value: "casual", label: "员工在用 ChatGPT", hint: "个人层面使用" },
  { value: "pilot", label: "有小范围试点", hint: "1 – 2 个场景" },
  { value: "scaled", label: "已规模化应用", hint: "多场景在跑" },
];

export const GOAL_OPTIONS: { value: Goal; label: string; hint: string }[] = [
  { value: "efficiency", label: "提升内部效率", hint: "员工跑得更快" },
  { value: "cost", label: "降低运营成本", hint: "用 AI 替代重复劳动" },
  { value: "decision", label: "改善经营决策", hint: "数据驱动判断" },
  { value: "experience", label: "提升客户体验", hint: "更聪明的服务" },
  { value: "unsure", label: "还不确定", hint: "想先看看可能性" },
];

export const PAIN_OPTIONS: { value: PainPoint; label: string }[] = [
  { value: "sales", label: "销售获客" },
  { value: "service", label: "客户服务" },
  { value: "knowledge", label: "内部知识管理" },
  { value: "analysis", label: "数据分析" },
  { value: "training", label: "员工培训" },
  { value: "ops", label: "经营决策" },
  { value: "marketing", label: "营销内容" },
  { value: "compliance", label: "合规与风控" },
];

export const TIMELINE_OPTIONS: { value: Timeline; label: string; hint: string }[] = [
  { value: "1m", label: "1 个月内", hint: "先试个水" },
  { value: "3m", label: "3 个月内", hint: "见到实效" },
  { value: "6m", label: "半年规划", hint: "系统推进" },
  { value: "12m", label: "一年以上", hint: "长期布局" },
];

// ---------- 行业差异化问题集 ----------
// 每个行业的「数据 / IT / AI / 目标 / 痛点」都用行业语言提问。
// 评分逻辑不变 —— 选项 value 仍然映射到统一的 4 档尺度,
// 只是 label/hint/question 换成行业内熟悉的说法。
// 痛点池完全按行业重写,因为这里最能挖真实需求。

interface IndustryQuestionSet {
  dataQuestion: string;
  dataOptions: { value: DataMaturity; label: string; hint: string }[];
  itQuestion: string;
  itOptions: { value: ITCapability; label: string; hint: string }[];
  aiQuestion: string;
  aiOptions: { value: AIAdoption; label: string; hint: string }[];
  goalQuestion: string;
  goalOptions: { value: Goal; label: string; hint: string }[];
  painQuestion: string;
  painOptions: { value: PainPoint; label: string }[];
  // 痛点池是完全独立的 — 按行业的真实场景命名
  // 但最终都复用 PainPoint 八个 slot 来做评分 + 场景匹配
}

// ---- 制造 ----
const Q_MANUFACTURING: IndustryQuestionSet = {
  dataQuestion: "生产 / 经营数据的沉淀程度?",
  dataOptions: [
    { value: "none", label: "主要靠老师傅经验", hint: "工艺、排产都在人脑里" },
    { value: "excel", label: "Excel + 纸质单据", hint: "数据有但调不动" },
    { value: "siloed", label: "有 MES / ERP 但未打通", hint: "OT / IT 各自为政" },
    { value: "unified", label: "数据已贯通车间 / 经营", hint: "产线数据可实时调用" },
  ],
  itQuestion: "内部 IT / 信息化团队规模?",
  itOptions: [
    { value: "noTeam", label: "没有专职 IT", hint: "设备商帮维护" },
    { value: "small", label: "1 – 3 人信息部", hint: "维护 ERP / OA" },
    { value: "medium", label: "5 – 10 人", hint: "有开发 + MES 能力" },
    { value: "large", label: "10 人以上", hint: "含工业软件 / 算法" },
  ],
  aiQuestion: "AI 在制造场景里的应用程度?",
  aiOptions: [
    { value: "none", label: "完全没用过", hint: "听说过,没试过" },
    { value: "casual", label: "员工用 AI 写文档 / 代码", hint: "办公层面" },
    { value: "pilot", label: "1 – 2 个产线试点", hint: "质检 / 排产 / 设备监测" },
    { value: "scaled", label: "多产线 / 多工厂已落地", hint: "AI 进入生产闭环" },
  ],
  goalQuestion: "做 AI 转型,最想解决的问题?",
  goalOptions: [
    { value: "cost", label: "降本增效", hint: "减少人工 / 降能耗 / 提良率" },
    { value: "efficiency", label: "提升排产 / 交付节奏", hint: "订单-排产-交付更快更准" },
    { value: "decision", label: "数据驱动经营决策", hint: "库存、成本、稼动一屏看清" },
    { value: "experience", label: "向客户交付智能产品", hint: "把 AI 做进产品/服务里" },
    { value: "unsure", label: "还不确定", hint: "想先看看同行都在做什么" },
  ],
  painQuestion: "哪些场景最让你头疼?(可多选,最多 4 个)",
  painOptions: [
    { value: "ops", label: "排产 / 交付不准" },
    { value: "analysis", label: "设备稼动 / 能耗看不清" },
    { value: "knowledge", label: "老师傅经验带不走" },
    { value: "compliance", label: "质检依赖人工 / 漏检" },
    { value: "training", label: "新人上手慢" },
    { value: "sales", label: "客户端询报价响应慢" },
    { value: "service", label: "售后与备件管理" },
    { value: "marketing", label: "产品资料 / 标书产出慢" },
  ],
};

// ---- 农业 ----
const Q_AGRICULTURE: IndustryQuestionSet = {
  dataQuestion: "种植 / 养殖 / 经营数据的沉淀?",
  dataOptions: [
    { value: "none", label: "完全靠经验", hint: "农技、病虫害都在老农脑里" },
    { value: "excel", label: "手工台账 / Excel", hint: "有记录但查找困难" },
    { value: "siloed", label: "有系统但数据割裂", hint: "地块、仓储、销售各一套" },
    { value: "unified", label: "已有统一农业 SaaS", hint: "全流程数据打通" },
  ],
  itQuestion: "企业技术团队规模?",
  itOptions: [
    { value: "noTeam", label: "没有技术岗", hint: "全靠外部农服" },
    { value: "small", label: "1 – 3 人信息岗", hint: "基础运维" },
    { value: "medium", label: "5 – 10 人技术团队", hint: "有开发能力" },
    { value: "large", label: "10 人以上", hint: "含农业算法 / IoT" },
  ],
  aiQuestion: "AI 在农业场景里的应用?",
  aiOptions: [
    { value: "none", label: "完全没用过", hint: "听说过遥感 / 识别" },
    { value: "casual", label: "偶尔问问 AI", hint: "办公层面" },
    { value: "pilot", label: "小规模试点", hint: "病虫害识别 / 无人机" },
    { value: "scaled", label: "多品类规模化应用", hint: "AI 进入田间决策" },
  ],
  goalQuestion: "AI 转型最想解决的问题?",
  goalOptions: [
    { value: "efficiency", label: "提升农技产出", hint: "把老农技变成可复制能力" },
    { value: "cost", label: "降低人工与损耗", hint: "减少农药 / 水肥 / 人工" },
    { value: "decision", label: "用数据指导种植 / 销售", hint: "品种、农时、定价有据可依" },
    { value: "experience", label: "打通产销,对终端更快响应", hint: "从田间到餐桌" },
    { value: "unsure", label: "还不确定", hint: "先看看能做什么" },
  ],
  painQuestion: "哪些场景最让你头疼?(可多选,最多 4 个)",
  painOptions: [
    { value: "knowledge", label: "农技经验留不住" },
    { value: "compliance", label: "病虫害 / 品控识别" },
    { value: "analysis", label: "产量 / 成本算不清" },
    { value: "ops", label: "农时 / 生产计划" },
    { value: "sales", label: "销售渠道获客" },
    { value: "service", label: "经销商 / 采购商服务" },
    { value: "training", label: "新员工 / 合作社培训" },
    { value: "marketing", label: "品牌 / 内容传播" },
  ],
};

// ---- 电商 ----
const Q_ECOMMERCE: IndustryQuestionSet = {
  dataQuestion: "店铺 / 订单 / 用户数据的沉淀?",
  dataOptions: [
    { value: "none", label: "数据都在平台后台", hint: "没有自己的数据仓库" },
    { value: "excel", label: "靠手工导 Excel", hint: "月底拼报表" },
    { value: "siloed", label: "有 ERP / CRM 但未打通", hint: "多店铺数据各算各的" },
    { value: "unified", label: "已有统一数据中台", hint: "全渠道实时可查" },
  ],
  itQuestion: "技术 / 运营技术团队规模?",
  itOptions: [
    { value: "noTeam", label: "没有技术", hint: "依赖 ISV / 代运营" },
    { value: "small", label: "1 – 3 人", hint: "维护店铺 / 插件" },
    { value: "medium", label: "5 – 10 人", hint: "有开发 / 数据分析" },
    { value: "large", label: "10 人以上", hint: "含算法 / 增长" },
  ],
  aiQuestion: "AI 在电商场景里的应用?",
  aiOptions: [
    { value: "none", label: "完全没用过", hint: "" },
    { value: "casual", label: "运营写文案在用", hint: "个人工具层面" },
    { value: "pilot", label: "1 – 2 个场景试点", hint: "客服 / 内容 / 选品" },
    { value: "scaled", label: "多场景规模化应用", hint: "AI 进入增长闭环" },
  ],
  goalQuestion: "AI 转型最想解决的问题?",
  goalOptions: [
    { value: "efficiency", label: "扩大内容 / 客服产能", hint: "同等人力做更多事" },
    { value: "cost", label: "降低客服 / 运营人力", hint: "把重复工作交出去" },
    { value: "decision", label: "选品 / 定价更准", hint: "数据驱动决策" },
    { value: "experience", label: "提升转化与复购", hint: "让用户留下来" },
    { value: "unsure", label: "还不确定", hint: "先看看同行" },
  ],
  painQuestion: "哪些场景最让你头疼?(可多选,最多 4 个)",
  painOptions: [
    { value: "marketing", label: "内容 / 详情页产能" },
    { value: "service", label: "客服响应与体验" },
    { value: "analysis", label: "选品 / 定价判断" },
    { value: "sales", label: "获客成本高" },
    { value: "ops", label: "库存 / 爆品预测" },
    { value: "knowledge", label: "SKU 知识留存" },
    { value: "training", label: "新员工上手慢" },
    { value: "compliance", label: "合规 / 违规风险" },
  ],
};

// ---- 文旅 ----
const Q_TOURISM: IndustryQuestionSet = {
  dataQuestion: "客流 / 票务 / 会员数据?",
  dataOptions: [
    { value: "none", label: "零散 / 没做", hint: "数据主要在渠道手上" },
    { value: "excel", label: "Excel / 表单", hint: "有但难分析" },
    { value: "siloed", label: "票务 / CRM / OTA 各自一套", hint: "未打通" },
    { value: "unified", label: "已有统一的客户数据库", hint: "可做精准运营" },
  ],
  itQuestion: "技术 / 数字化团队规模?",
  itOptions: [
    { value: "noTeam", label: "没有专职技术", hint: "依赖供应商" },
    { value: "small", label: "1 – 3 人", hint: "维护系统" },
    { value: "medium", label: "5 – 10 人", hint: "有开发 + 数字化产品" },
    { value: "large", label: "10 人以上", hint: "含数据 + 算法" },
  ],
  aiQuestion: "AI 在文旅场景里的应用?",
  aiOptions: [
    { value: "none", label: "没用过", hint: "" },
    { value: "casual", label: "员工在用 AI 写东西", hint: "" },
    { value: "pilot", label: "1 – 2 个试点", hint: "客服 / 内容 / 讲解" },
    { value: "scaled", label: "多场景落地", hint: "AI 进入服务闭环" },
  ],
  goalQuestion: "AI 转型最想解决的问题?",
  goalOptions: [
    { value: "experience", label: "提升游客体验", hint: "更聪明的服务" },
    { value: "efficiency", label: "提升内容 / 运营产能", hint: "同等人力做更多" },
    { value: "decision", label: "更准地预测客流 / 营收", hint: "数据驱动经营" },
    { value: "cost", label: "降低客服 / 导览人力", hint: "把重复工作交出去" },
    { value: "unsure", label: "还不确定", hint: "先看看可能性" },
  ],
  painQuestion: "哪些场景最让你头疼?(可多选,最多 4 个)",
  painOptions: [
    { value: "service", label: "客服 / 咨询响应慢" },
    { value: "marketing", label: "内容 / 宣发产能" },
    { value: "analysis", label: "客流 / 营收预测" },
    { value: "sales", label: "获客 / 渠道" },
    { value: "ops", label: "票务 / 资源调度" },
    { value: "knowledge", label: "讲解词 / 知识沉淀" },
    { value: "training", label: "一线员工培训" },
    { value: "compliance", label: "安全 / 合规管理" },
  ],
};

// ---- 政企 ----
const Q_GOVERNMENT: IndustryQuestionSet = {
  dataQuestion: "辖区 / 业务数据的归集程度?",
  dataOptions: [
    { value: "none", label: "分散在各条线 / 纸质", hint: "未形成统一数据" },
    { value: "excel", label: "各科室台账", hint: "Excel / 报表主导" },
    { value: "siloed", label: "有信息化系统但未打通", hint: "跨部门数据难共享" },
    { value: "unified", label: "已建政务数据中台", hint: "可统一调度" },
  ],
  itQuestion: "信息化 / 数据团队规模?",
  itOptions: [
    { value: "noTeam", label: "没有自有团队", hint: "外包为主" },
    { value: "small", label: "1 – 3 人信息岗", hint: "基础运维" },
    { value: "medium", label: "5 – 10 人", hint: "有开发 + 数据" },
    { value: "large", label: "10 人以上 / 有智慧中心", hint: "含专业团队" },
  ],
  aiQuestion: "AI 在本单位 / 辖区的应用?",
  aiOptions: [
    { value: "none", label: "尚未开始", hint: "" },
    { value: "casual", label: "公文写作辅助", hint: "个人效率层面" },
    { value: "pilot", label: "1 – 2 个场景试点", hint: "辖区分析 / 智能客服" },
    { value: "scaled", label: "多场景规模化应用", hint: "进入日常业务" },
  ],
  goalQuestion: "AI 建设最想解决的问题?",
  goalOptions: [
    { value: "efficiency", label: "提升公务 / 办事效率", hint: "减少重复工作" },
    { value: "decision", label: "辖区 / 业务一屏决策", hint: "数据驱动治理" },
    { value: "experience", label: "提升对企对民服务", hint: "让办事更顺" },
    { value: "cost", label: "降低重复工作量", hint: "释放公务员时间" },
    { value: "unsure", label: "还在调研阶段", hint: "先了解可行性" },
  ],
  painQuestion: "哪些场景最让你头疼?(可多选,最多 4 个)",
  painOptions: [
    { value: "analysis", label: "辖区 / 业务态势看不清" },
    { value: "compliance", label: "合规 / 数据安全" },
    { value: "service", label: "办事咨询 / 热线响应" },
    { value: "knowledge", label: "政策 / 文件检索" },
    { value: "ops", label: "跨部门协同 / 流程" },
    { value: "marketing", label: "对外宣传 / 材料" },
    { value: "training", label: "公务员能力培训" },
    { value: "sales", label: "招商 / 企业服务" },
  ],
};

// ---- 教育 ----
const Q_EDUCATION: IndustryQuestionSet = {
  dataQuestion: "学情 / 教研 / 招生数据沉淀?",
  dataOptions: [
    { value: "none", label: "主要靠老师经验", hint: "教研在人脑里" },
    { value: "excel", label: "成绩 / 台账 Excel", hint: "数据散乱" },
    { value: "siloed", label: "有教务 / CRM 系统但未打通", hint: "" },
    { value: "unified", label: "已建学习数据中台", hint: "学情 / 教研可实时调用" },
  ],
  itQuestion: "信息化 / 技术团队规模?",
  itOptions: [
    { value: "noTeam", label: "没有专职 IT", hint: "" },
    { value: "small", label: "1 – 3 人", hint: "基础运维" },
    { value: "medium", label: "5 – 10 人", hint: "有开发 / 产品" },
    { value: "large", label: "10 人以上", hint: "含算法 / 教研" },
  ],
  aiQuestion: "AI 在教学 / 运营中的应用?",
  aiOptions: [
    { value: "none", label: "完全没用过", hint: "" },
    { value: "casual", label: "老师在用 AI 备课", hint: "" },
    { value: "pilot", label: "1 – 2 个场景试点", hint: "批改 / 答疑 / 测评" },
    { value: "scaled", label: "多场景规模化", hint: "AI 进入教学闭环" },
  ],
  goalQuestion: "AI 最想解决的问题?",
  goalOptions: [
    { value: "efficiency", label: "教师 / 教研提效", hint: "把老师从重复工作里解放" },
    { value: "experience", label: "个性化学习体验", hint: "因材施教" },
    { value: "decision", label: "数据驱动教研与招生", hint: "" },
    { value: "cost", label: "降低人力成本", hint: "AI 替代助教 / 客服" },
    { value: "unsure", label: "还在调研", hint: "" },
  ],
  painQuestion: "哪些场景最让你头疼?(可多选,最多 4 个)",
  painOptions: [
    { value: "knowledge", label: "教研 / 题库沉淀" },
    { value: "service", label: "家校沟通 / 答疑" },
    { value: "training", label: "教师培训与成长" },
    { value: "analysis", label: "学情 / 招生分析" },
    { value: "marketing", label: "招生内容与投放" },
    { value: "sales", label: "招生获客 / 转化" },
    { value: "ops", label: "课程 / 排班管理" },
    { value: "compliance", label: "合规 / 隐私保护" },
  ],
};

// ---- 医疗 ----
const Q_HEALTHCARE: IndustryQuestionSet = {
  dataQuestion: "临床 / 运营数据的沉淀?",
  dataOptions: [
    { value: "none", label: "纸质 / 零散电子", hint: "" },
    { value: "excel", label: "HIS 基本功能 + Excel", hint: "数据不好调用" },
    { value: "siloed", label: "HIS/LIS/PACS 未打通", hint: "数据孤岛" },
    { value: "unified", label: "已有统一临床数据中心", hint: "可做科研 / 运营分析" },
  ],
  itQuestion: "信息科 / 技术团队规模?",
  itOptions: [
    { value: "noTeam", label: "没有专职信息科", hint: "" },
    { value: "small", label: "1 – 3 人", hint: "基础运维" },
    { value: "medium", label: "5 – 10 人", hint: "有开发 / 集成能力" },
    { value: "large", label: "10 人以上", hint: "含医学信息 / 算法" },
  ],
  aiQuestion: "AI 在临床 / 管理中的应用?",
  aiOptions: [
    { value: "none", label: "尚未开展", hint: "" },
    { value: "casual", label: "医生个人在用", hint: "文献 / 病例摘要" },
    { value: "pilot", label: "1 – 2 个场景试点", hint: "影像 / 病历质控" },
    { value: "scaled", label: "多科室应用", hint: "AI 进入临床流程" },
  ],
  goalQuestion: "AI 建设最想解决的问题?",
  goalOptions: [
    { value: "efficiency", label: "医生 / 护士提效", hint: "减少文书工作" },
    { value: "decision", label: "临床 / 运营决策支持", hint: "" },
    { value: "experience", label: "提升患者服务体验", hint: "" },
    { value: "cost", label: "降低管理成本", hint: "" },
    { value: "unsure", label: "还在调研", hint: "" },
  ],
  painQuestion: "哪些场景最让你头疼?(可多选,最多 4 个)",
  painOptions: [
    { value: "compliance", label: "病历 / 数据合规" },
    { value: "knowledge", label: "临床知识检索" },
    { value: "service", label: "患者咨询 / 导诊" },
    { value: "analysis", label: "病种 / 运营数据分析" },
    { value: "ops", label: "排班 / 资源调度" },
    { value: "training", label: "医护培训与考核" },
    { value: "marketing", label: "科普 / 患者教育内容" },
    { value: "sales", label: "学科建设 / 转诊" },
  ],
};

// ---- 其他 / 默认 ----
const Q_DEFAULT: IndustryQuestionSet = {
  dataQuestion: "数据沉淀的程度?",
  dataOptions: DATA_OPTIONS,
  itQuestion: "内部 IT 团队规模?",
  itOptions: IT_OPTIONS,
  aiQuestion: "当前 AI 应用程度?",
  aiOptions: AI_OPTIONS,
  goalQuestion: "最主要的诉求?",
  goalOptions: GOAL_OPTIONS,
  painQuestion: "痛点场景(可多选,最多 4 个)",
  painOptions: PAIN_OPTIONS,
};

const INDUSTRY_QUESTIONS: Record<Industry, IndustryQuestionSet> = {
  manufacturing: Q_MANUFACTURING,
  agriculture: Q_AGRICULTURE,
  ecommerce: Q_ECOMMERCE,
  tourism: Q_TOURISM,
  government: Q_GOVERNMENT,
  education: Q_EDUCATION,
  healthcare: Q_HEALTHCARE,
  other: Q_DEFAULT,
};

export function getQuestionSet(industry: Industry | undefined): IndustryQuestionSet {
  if (!industry) return Q_DEFAULT;
  return INDUSTRY_QUESTIONS[industry] || Q_DEFAULT;
}

// ---------- 评分 ----------

const dataScore: Record<DataMaturity, number> = { none: 0, excel: 1, siloed: 2, unified: 3 };
const itScore: Record<ITCapability, number> = { noTeam: 0, small: 1, medium: 2, large: 3 };
const aiScore: Record<AIAdoption, number> = { none: 0, casual: 1, pilot: 2, scaled: 3 };

export interface DiagnoseScores {
  data: number; // 0–100
  it: number;
  ai: number;
  readiness: number; // 综合就绪度 0–100
}

export function computeScores(a: DiagnoseAnswers): DiagnoseScores {
  const d = a.data ? dataScore[a.data] : 0;
  const i = a.it ? itScore[a.it] : 0;
  const ai = a.ai ? aiScore[a.ai] : 0;
  return {
    data: Math.round((d / 3) * 100),
    it: Math.round((i / 3) * 100),
    ai: Math.round((ai / 3) * 100),
    readiness: Math.round(((d + i + ai) / 9) * 100),
  };
}

// ---------- 层级推荐 ----------

export function recommendLayer(a: DiagnoseAnswers, s: DiagnoseScores): Layer {
  // 不确定 → 先从 L1 试水
  if (a.goal === "unsure") return "L1";
  // 已规模化用 AI → 应该走 L3
  if (a.ai === "scaled") return "L3";
  // 综合就绪度区间
  if (s.readiness < 35) return "L1";
  if (s.readiness < 65) return "L2";
  return "L3";
}

// ---------- 场景匹配 ----------

interface ScenarioTemplate {
  code: string;
  title: string;
  layer: Layer;
  duration: string;
  industries: Industry[]; // 空数组 = 通用兜底场景(只在无行业专属命中时使用)
  pains: PainPoint[];
  body: string;
}

// 场景库按行业组织.每个行业 4-6 个专属场景 + 一组通用兜底.
// 命名 / 描述都用行业本身的语言,匹配出来不会"政企收到电商方案"这种穿帮.
const SCENARIO_LIBRARY: ScenarioTemplate[] = [
  // ============ 制造 ============
  { code: "M01", title: "AI 排产 / 交付看板", layer: "L1", duration: "3 – 5 周",
    industries: ["manufacturing"], pains: ["ops", "analysis"],
    body: "订单-排产-交付一屏看清,AI 给出排产建议,交付准时率提升 15-30%。" },
  { code: "M02", title: "老师傅经验知识库", layer: "L1", duration: "3 – 4 周",
    industries: ["manufacturing"], pains: ["knowledge", "training"],
    body: "把工艺秘籍、设备故障经验沉淀成可问答的车间知识库,新人 1 周上手。" },
  { code: "M03", title: "智能询报价助手", layer: "L1", duration: "2 – 3 周",
    industries: ["manufacturing"], pains: ["sales", "service"],
    body: "客户图纸 / 询价单一上来,AI 自动识别参数、估算成本、给出报价初稿。" },
  { code: "M04", title: "设备稼动 / 能耗驾驶舱", layer: "L2", duration: "6 – 10 周",
    industries: ["manufacturing"], pains: ["analysis", "ops"],
    body: "打通 MES + IoT 数据,稼动率、OEE、能耗实时可视,异常自动归因。" },
  { code: "M05", title: "AI 视觉质检", layer: "L2", duration: "8 – 12 周",
    industries: ["manufacturing"], pains: ["compliance", "ops"],
    body: "替代人工目检的瓶颈工位,识别率达 99%+,漏检率降到 0.5% 以下。" },
  { code: "M06", title: "MES + AI 闭环改造", layer: "L3", duration: "3 – 6 个月",
    industries: ["manufacturing"], pains: ["ops", "analysis"],
    body: "MES / ERP 数据治理 + AI 决策引擎,从单点应用走向产线级智能。" },

  // ============ 农业 ============
  { code: "A01", title: "病虫害 AI 识别", layer: "L1", duration: "2 – 4 周",
    industries: ["agriculture"], pains: ["compliance", "knowledge"],
    body: "手机拍照即识别病虫害与处方,把老农技转成普惠工具。" },
  { code: "A02", title: "农技问答助手", layer: "L1", duration: "2 – 3 周",
    industries: ["agriculture"], pains: ["knowledge", "training"],
    body: "把老农技、农艺师经验沉淀进可问答的农技库,合作社新人上手快。" },
  { code: "A03", title: "产销协同看板", layer: "L1", duration: "3 – 5 周",
    industries: ["agriculture"], pains: ["sales", "service", "analysis"],
    body: "从田间到经销商订单一图看清,AI 辅助预测产量与销量缺口。" },
  { code: "A04", title: "农时 / 投入品决策", layer: "L2", duration: "6 – 10 周",
    industries: ["agriculture"], pains: ["ops", "analysis"],
    body: "结合气象 + 地块数据,AI 给出播种、施肥、灌溉的时间窗与用量建议。" },
  { code: "A05", title: "品控与溯源体系", layer: "L2", duration: "8 – 12 周",
    industries: ["agriculture"], pains: ["compliance", "service"],
    body: "全流程数据归集 + AI 品控,出口 / 商超对接顺畅。" },

  // ============ 电商 ============
  { code: "E01", title: "AI 内容工厂", layer: "L1", duration: "2 周",
    industries: ["ecommerce"], pains: ["marketing"],
    body: "商品详情页、主图文案、社媒短文批量生成,内容产能提升 5-10 倍。" },
  { code: "E02", title: "智能客服 / 售后", layer: "L1", duration: "3 – 5 周",
    industries: ["ecommerce"], pains: ["service"],
    body: "高频咨询、退换货、催发货由 AI 接住,客服人力降 40%+。" },
  { code: "E03", title: "选品 / 定价助手", layer: "L1", duration: "3 – 4 周",
    industries: ["ecommerce"], pains: ["analysis", "sales"],
    body: "竞品监控 + 用户评论挖掘,AI 给出选品建议与动态定价区间。" },
  { code: "E04", title: "经营驾驶舱", layer: "L2", duration: "4 – 8 周",
    industries: ["ecommerce"], pains: ["analysis", "ops"],
    body: "多店铺多平台数据归集,GMV、转化、库存一屏管控,异常预警。" },
  { code: "E05", title: "智能营销自动化", layer: "L2", duration: "6 – 10 周",
    industries: ["ecommerce"], pains: ["marketing", "sales"],
    body: "用户分层 + AI 内容 + 自动投放,把营销做成可复制的闭环。" },
  { code: "E06", title: "全渠道数据中台", layer: "L3", duration: "3 – 5 个月",
    industries: ["ecommerce"], pains: ["analysis", "ops"],
    body: "打通自营 / 平台 / 私域全渠道,建立以人为中心的数据资产。" },

  // ============ 文旅 ============
  { code: "T01", title: "AI 数字讲解 / 导览", layer: "L1", duration: "3 – 5 周",
    industries: ["tourism"], pains: ["service", "knowledge"],
    body: "景区 / 展馆配 AI 讲解,可问可答,讲解内容沉淀成数字资产。" },
  { code: "T02", title: "智能咨询客服", layer: "L1", duration: "3 – 4 周",
    industries: ["tourism"], pains: ["service"],
    body: "门票 / 路线 / 配套服务咨询由 AI 接住,响应从分钟到秒。" },
  { code: "T03", title: "内容 / 宣发产能放大", layer: "L1", duration: "2 周",
    industries: ["tourism"], pains: ["marketing"],
    body: "短视频脚本、图文宣发、社媒文案批量生成,适配多平台调性。" },
  { code: "T04", title: "客流 / 营收预测", layer: "L2", duration: "6 – 10 周",
    industries: ["tourism"], pains: ["analysis", "ops"],
    body: "结合天气、节假日、历史数据,AI 给出未来 7 / 30 天客流与营收预测。" },
  { code: "T05", title: "会员 / 营销自动化", layer: "L2", duration: "4 – 8 周",
    industries: ["tourism"], pains: ["sales", "marketing"],
    body: "会员分层 + 智能券包 + 自动触达,复购率与客单价双双提升。" },

  // ============ 政企 ============
  { code: "G01", title: "辖区 / 业务态势驾驶舱", layer: "L2", duration: "6 – 10 周",
    industries: ["government"], pains: ["analysis", "ops"],
    body: "辖区企业、产业、政策、舆情一屏看清,AI 自动归因 + 异常预警。" },
  { code: "G02", title: "AI 12345 / 热线助手", layer: "L1", duration: "4 – 6 周",
    industries: ["government"], pains: ["service"],
    body: "高频政务咨询由 AI 接听 + 智能转派,工单分类准确率 95%+。" },
  { code: "G03", title: "政策 / 文件智能检索", layer: "L1", duration: "3 – 4 周",
    industries: ["government"], pains: ["knowledge"],
    body: "把历年政策、规范、办事指南建成可问答的政务知识库,问答即答案。" },
  { code: "G04", title: "公文 / 材料辅助写作", layer: "L1", duration: "2 – 3 周",
    industries: ["government"], pains: ["marketing", "training"],
    body: "汇报材料、宣传稿、调研报告一键起草,公务员从「写」转向「审」。" },
  { code: "G05", title: "招商 / 企业服务 AI", layer: "L2", duration: "8 – 12 周",
    industries: ["government"], pains: ["sales", "service"],
    body: "辖区企业画像 + 政策匹配 + 招商线索挖掘,变「跑企业」为「数字精准」。" },
  { code: "G06", title: "政务私有化大模型", layer: "L3", duration: "3 – 5 个月",
    industries: ["government"], pains: ["compliance", "knowledge"],
    body: "数据不出域 + 等保合规 + 多场景共用的政务专属大模型。" },

  // ============ 教育 ============
  { code: "ED01", title: "AI 备课 / 教研助手", layer: "L1", duration: "2 – 3 周",
    industries: ["education"], pains: ["knowledge", "training"],
    body: "教案、课件、习题、备课资料一键生成,老师从「找资料」转向「设计学习」。" },
  { code: "ED02", title: "智能答疑 / 家校", layer: "L1", duration: "3 – 5 周",
    industries: ["education"], pains: ["service"],
    body: "学生答疑、家长咨询由 AI 接住,老师专注疑难与情感支持。" },
  { code: "ED03", title: "招生内容 / 投放放大", layer: "L1", duration: "2 周",
    industries: ["education"], pains: ["marketing", "sales"],
    body: "招生文案、家长信、社媒内容批量生成,多平台高效投放。" },
  { code: "ED04", title: "学情 / 招生分析", layer: "L2", duration: "6 – 10 周",
    industries: ["education"], pains: ["analysis", "ops"],
    body: "打通教务 + 招生 + CRM 数据,学情画像 + 招生漏斗一屏可视。" },
  { code: "ED05", title: "个性化学习路径", layer: "L3", duration: "3 – 5 个月",
    industries: ["education"], pains: ["analysis", "knowledge"],
    body: "基于学情数据的 AI 学习推荐,做到「因材施教」可规模化。" },

  // ============ 医疗 ============
  { code: "H01", title: "病历 / 文书 AI 助手", layer: "L1", duration: "3 – 5 周",
    industries: ["healthcare"], pains: ["compliance", "knowledge"],
    body: "病历摘要、出院小结、病程记录自动生成,医生从文书中解放出来。" },
  { code: "H02", title: "智能导诊 / 患者服务", layer: "L1", duration: "3 – 4 周",
    industries: ["healthcare"], pains: ["service"],
    body: "AI 预问诊 + 智能分诊,患者就医路径更顺,门诊效率提升。" },
  { code: "H03", title: "临床知识检索助手", layer: "L1", duration: "2 – 3 周",
    industries: ["healthcare"], pains: ["knowledge", "training"],
    body: "本院 + 文献 + 指南的统一知识库,医生 15 秒拿到决策依据。" },
  { code: "H04", title: "病种 / 运营数据中心", layer: "L2", duration: "6 – 10 周",
    industries: ["healthcare"], pains: ["analysis", "ops"],
    body: "打通 HIS/LIS/PACS 数据,病种结构、医生效率、DRG 一屏看清。" },
  { code: "H05", title: "医疗私有化大模型", layer: "L3", duration: "3 – 5 个月",
    industries: ["healthcare"], pains: ["compliance", "knowledge"],
    body: "数据不出域 + 等保 + 院内多科室共用的医疗专属大模型。" },

  // ============ 通用兜底 (industries: []) ============
  // 只在没有任何行业专属场景命中时被选中
  { code: "U01", title: "AI 销售助手", layer: "L1", duration: "2 – 4 周",
    industries: [], pains: ["sales", "marketing"],
    body: "给销售配一个 AI 副驾驶:客户画像、话术建议、跟进提醒,一线即时见效。" },
  { code: "U02", title: "智能客服 / 工单", layer: "L1", duration: "3 – 5 周",
    industries: [], pains: ["service"],
    body: "把高频问题用 AI 接住,人工只处理疑难,响应从分钟级降到秒级。" },
  { code: "U03", title: "企业 AI 知识库", layer: "L1", duration: "2 – 3 周",
    industries: [], pains: ["knowledge", "training"],
    body: "把散落在群、文档、邮件里的经验沉淀进可问答的知识库,新员工 1 周上手。" },
  { code: "U04", title: "数据洞察驾驶舱", layer: "L2", duration: "4 – 8 周",
    industries: [], pains: ["analysis", "ops"],
    body: "把分散的业务数据接进来,自然语言查询、自动归因、异常预警一站式。" },
  { code: "U05", title: "定制 AI 应用", layer: "L2", duration: "8 – 12 周",
    industries: [], pains: ["sales", "service", "ops", "marketing"],
    body: "按你的业务场景定制专属 AI 应用,深度嵌入现有工作流。" },
  { code: "U06", title: "数据中台改造", layer: "L3", duration: "3 – 6 个月",
    industries: [], pains: ["analysis", "ops"],
    body: "数据治理 + 中台搭建,为后续所有 AI 应用打好地基。" },
  { code: "U07", title: "AI 技能体系培训", layer: "L3", duration: "2 – 3 个月",
    industries: [], pains: ["training"],
    body: "管理层、业务骨干、IT 三层分级培训,让企业自己具备持续迭代能力。" },
];

export function matchScenarios(a: DiagnoseAnswers, layer: Layer): ScenarioTemplate[] {
  // 评分:
  //   行业精确命中(industries 包含当前行业)   +10  ← 远高于其它信号,保证行业不穿帮
  //   痛点重叠(每命中一个)                  +3
  //   层级完全匹配(同层)                    +1
  //   层级相邻(差 1)                       +0.3  ← 允许小幅跨层兜底
  //
  // 先尝试: 当前层级 + 行业专属 (top 3)
  // 不够 3 个? 放宽到: 当前层级 + 通用兜底
  // 还不够? 放宽到: 相邻层级
  const score = (s: ScenarioTemplate, requireIndustryMatch: boolean) => {
    let v = 0;
    const industryMatch = !!a.industry && s.industries.includes(a.industry);
    if (requireIndustryMatch && !industryMatch) return -1;
    if (industryMatch) v += 10;
    const overlap = a.pains.filter((p) => s.pains.includes(p)).length;
    v += overlap * 3;
    if (s.layer === layer) v += 1;
    else if (Math.abs(layerToNum(s.layer) - layerToNum(layer)) === 1) v += 0.3;
    return v;
  };

  // Pass 1: 严格行业匹配,允许跨层
  const pass1 = SCENARIO_LIBRARY
    .map((s) => ({ s, v: score(s, true) }))
    .filter((x) => x.v >= 0)
    // 优先同层
    .sort((x, y) => {
      const sameLayerX = x.s.layer === layer ? 1 : 0;
      const sameLayerY = y.s.layer === layer ? 1 : 0;
      if (sameLayerX !== sameLayerY) return sameLayerY - sameLayerX;
      return y.v - x.v;
    });
  if (pass1.length >= 3) return pass1.slice(0, 3).map((x) => x.s);

  // Pass 2: 行业 + 通用兜底,同层优先
  const used = new Set(pass1.map((x) => x.s.code));
  const pass2 = SCENARIO_LIBRARY
    .filter((s) => !used.has(s.code))
    .map((s) => ({ s, v: score(s, false) }))
    .filter((x) => x.v > 0)
    .sort((x, y) => {
      const sameLayerX = x.s.layer === layer ? 1 : 0;
      const sameLayerY = y.s.layer === layer ? 1 : 0;
      if (sameLayerX !== sameLayerY) return sameLayerY - sameLayerX;
      return y.v - x.v;
    });

  const combined = [...pass1.map((x) => x.s), ...pass2.map((x) => x.s)];
  if (combined.length >= 3) return combined.slice(0, 3);

  // 兜底: 该层任意 3 个
  const fallback = SCENARIO_LIBRARY.filter((s) => s.layer === layer).slice(0, 3);
  return combined.length ? [...combined, ...fallback].slice(0, 3) : fallback;
}

function layerToNum(l: Layer): number {
  return l === "L1" ? 1 : l === "L2" ? 2 : 3;
}

// ---------- 风险提示 ----------

export interface Risk {
  title: string;
  body: string;
}

export function detectRisks(a: DiagnoseAnswers, _s: DiagnoseScores, layer: Layer): Risk[] {
  const risks: Risk[] = [];

  if (a.timeline === "1m" && layer === "L3") {
    risks.push({
      title: "周期与目标不匹配",
      body: "你选择了能力层级最高的路径,但只给了 1 个月。建议先做协作层试点,后续再延伸。",
    });
  }
  if (a.ai === "scaled" && a.data === "none") {
    risks.push({
      title: "AI 应用走在数据前面",
      body: "你已经在规模化用 AI,但数据基础还很薄。建议尽快补齐数据治理,否则规模化会撞墙。",
    });
  }
  if (a.goal === "decision" && (a.data === "none" || a.data === "excel")) {
    risks.push({
      title: "决策类 AI 需要数据量",
      body: "想用 AI 改决策,但数据基础尚浅。建议先做 6 – 8 周数据归集,再上决策模型。",
    });
  }
  if (a.it === "noTeam" && layer !== "L1") {
    risks.push({
      title: "没有内部 IT,落地节奏会偏慢",
      body: "建议要么先从协作层(SaaS 工具为主)切入,要么把 IT 外包 / 共建写进项目预算。",
    });
  }
  if (a.size === "lt50" && layer === "L3") {
    risks.push({
      title: "规模与投入需匹配",
      body: "能力层投入相对重,小团队建议先从 L1 / L2 拿到结果,再决定是否走 L3。",
    });
  }
  if (a.goal === "unsure") {
    risks.push({
      title: "目标暂不清晰是常态",
      body: "建议先做 1 – 2 个 2 周内能跑通的 L1 场景,用结果反推目标,比一上来定战略更靠谱。",
    });
  }
  if (a.ai === "none" && layer === "L3") {
    risks.push({
      title: "从 0 直接到能力层风险高",
      body: "建议先用 4 – 8 周做协作层试点,让团队建立 AI 直觉,再启动能力层改造。",
    });
  }

  // 兜底：如果一条风险都没有,加一条正向提示
  if (risks.length === 0) {
    risks.push({
      title: "整体路径较为均衡",
      body: "你的现状、目标、节奏匹配度较高。建议保持节奏,按推荐场景启动试点。",
    });
  }

  return risks.slice(0, 4);
}

// ---------- 节奏路线图 ----------

export interface Phase {
  name: string;
  duration: string;
  body: string;
}

export function buildRoadmap(layer: Layer, a: DiagnoseAnswers): Phase[] {
  const cycle = a.timeline === "1m" ? "compact" : "standard";
  if (layer === "L1") {
    return [
      { name: "诊断", duration: cycle === "compact" ? "3 天" : "1 – 2 周", body: "明确切入场景与成功指标。" },
      { name: "试点", duration: cycle === "compact" ? "2 – 3 周" : "2 – 4 周", body: "1 个场景跑通,产出可量化结果。" },
      { name: "推广", duration: "持续", body: "在团队内复制,沉淀使用规范。" },
    ];
  }
  if (layer === "L2") {
    return [
      { name: "诊断", duration: "1 – 2 周", body: "梳理业务流、数据源、目标指标。" },
      { name: "数据接入", duration: "3 – 5 周", body: "打通核心系统,统一数据口径。" },
      { name: "应用落地", duration: "4 – 8 周", body: "上线 1 – 2 个经营层应用,跑出闭环。" },
    ];
  }
  return [
    { name: "诊断 + 规划", duration: "2 – 3 周", body: "确定能力建设范围与里程碑。" },
    { name: "基础设施", duration: "1 – 2 个月", body: "中台 / 私有化部署 / 治理体系。" },
    { name: "持续迭代", duration: "长期", body: "建立企业自有 AI 能力,持续演进。" },
  ];
}

// ---------- 一句话结论 ----------

export function buildHeadline(layer: Layer, _s: DiagnoseScores): string {
  const tag = layer === "L1" ? "协作层" : layer === "L2" ? "经营层" : "能力层";
  if (layer === "L1") return `建议从 ${tag} 切入,2 – 4 周见到第一个实效。`;
  if (layer === "L2") return `建议直接进入 ${tag},3 个月内跑通 1 – 2 个经营场景。`;
  return `建议启动 ${tag} 建设,半年内具备企业自有 AI 能力。`;
}

// ---------- 持久化 ----------

const STORAGE_KEY = "gmonkey:diagnose:v1";

export function saveAnswers(a: DiagnoseAnswers) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(a));
  } catch {
    // 忽略 sessionStorage 不可用的情况(隐私模式等)
  }
}

export function loadAnswers(): DiagnoseAnswers | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DiagnoseAnswers;
    if (!parsed.pains) parsed.pains = [];
    return parsed;
  } catch {
    return null;
  }
}

export function clearAnswers() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
