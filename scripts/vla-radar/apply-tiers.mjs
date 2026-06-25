#!/usr/bin/env node
/*
 * VLA Radar - 一次性回溯分诊 apply (见 scripts/vla-radar/funnel-plan.md)
 * 作用: (1) 新增 MEM(2603.03596) 完整解析 + tier 2; (2) 对存量 59 篇做分诊「局部更新」(只改 tier/relevance/... 不碰已有解析)。
 * 跑法:  VLA_RADAR_INGEST_TOKEN=<你的写入令牌> node scripts/vla-radar/apply-tiers.mjs
 * 幂等: 重复跑只会把同样的值再写一遍, 安全。跑完确认无误后此文件可删。
 */
const SITE = process.env.SITE || 'https://www.meowsu.xyz'
const TOKEN = process.env.VLA_RADAR_INGEST_TOKEN || ''

const MEM = {
  "arxiv_id": "2603.03596",
  "title": "MEM: Multi-Scale Embodied Memory for Vision Language Action Models",
  "authors": "Marcel Torne, Karl Pertsch, Homer Walke, Kyle Vedder, Suraj Nair, Brian Ichter, Allen Z. Ren, Haohuan Wang, Jiaming Tang, Kyle Stachowicz, Karan Dhabalia, Michael Equi, Quan Vuong, Jost Tobias Springenberg, Sergey Levine, Chelsea Finn, Danny Driess",
  "published": "2026-03-04",
  "abstract": "传统端到端机器人学习中的记忆，就是把过去若干帧观测序列喂给策略。但在复杂多阶段真实任务里，机器人记忆需要在多个粒度上表征过去事件：从抽象语义的长期记忆（做饭机器人要记得菜谱哪几步做完了）到捕捉近期事件、补偿遮挡的短期记忆。本文提出 Multi-Scale Embodied Memory (MEM)，一种混合模态长程记忆方法，把经视频编码器压缩的视频型短程记忆与文本型长程记忆结合，使策略能完成长达 15 分钟的任务（如收拾厨房、做烤奶酪三明治），并让策略能在上下文中智能调整操作策略。",
  "problem": "现有 VLA 的记忆只是把过去几帧观测拼进策略输入，单一粒度。这在多阶段长程任务上同时失效于两端：既无法保留跨越数分钟的抽象语义状态（菜谱进度/已完成子任务），又难以用足够长的原始视频窗口补偿瞬时遮挡，且简单堆帧计算量随窗口平方膨胀、上车不现实。",
  "method": "改了架构层与训练/数据层。架构上提出双尺度记忆：(1) 短程视频记忆——基于 ViT 的高效视频编码器，空间-时间可分离注意力，每第 4 层穿插时间注意力，因果时间注意力把复杂度从 O(n²K²) 降到 O(Kn²+nK²)，从预训练 ViT 权重初始化、不新增参数；(2) 长程语义记忆——由 LLM 生成自然语言摘要、记录已完成子任务。策略分解为低层策略（条件于 K 帧观测+子任务指令）与高层策略（产生子任务指令并更新语言记忆）。数据上用遥操作演示+策略 rollout+人工纠错+VL/video-language 任务混合训练。",
  "delta": "在 π0.6（Gemma3-4B 主干 + 860M flow-matching action expert）基础上加装多尺度记忆模块：相对原版 π0.6 的无记忆/朴素堆帧，MEM 用可分离注意力视频编码器替代朴素多帧拼接（降算力），并新增 LLM 语言长程记忆与高/低层分解策略；消融显示去掉任一记忆都显著掉点，朴素拼接历史子任务指令因训练-推理分布漂移而明显更差。",
  "evidence": "全真机（单臂/双臂/移动平台），每任务 10 次 rollout 报告 mean±SE。有系统消融（去视频短程记忆、去语言长程记忆、naive language memory、Pool/Proprio-only memory、posttrain-only memory）。结果以 Figure 形式呈现，正文未给可抄录的数值表。PI 团队论文，仅有项目页，无 GitHub、未开源权重/代码。",
  "idea_signal": "对 SmolVLA 这类小模型有直接启发：空间-时间可分离 + 因果时间注意力的视频编码器，是在不爆显存前提下吃进多秒历史的低成本路子；LLM 语言摘要式长程记忆作为外挂轻量状态机，比堆历史帧/堆指令更省、更抗分布漂移——两者都偏‘加结构而非加参数’，适合做可复现的小规模改造。但本身基于 4B+860M 的 π0.6，效率收益要自己在小模型上验证。",
  "tags": [
    "memory",
    "long-horizon",
    "vla",
    "video-encoder",
    "real-robot",
    "physical-intelligence"
  ],
  "github_url": "",
  "project_url": "https://pi.website/research/memory",
  "diff": {
    "base": "π0.6（Gemma3-4B 主干 + 860M flow-matching action expert）",
    "changes": [
      "朴素多帧观测拼接 → 空间-时间可分离 ViT 视频编码器（因果时间注意力，O(n²K²)→O(Kn²+nK²)）",
      "无长程状态 → LLM 生成自然语言子任务摘要的文本型长程记忆",
      "单一端到端策略 → 高层(产生子任务指令+更新语言记忆)/低层(条件于K帧+指令)分解策略",
      "naive 拼接历史指令 → 学习式压缩语言记忆（缓解训练-推理分布漂移）",
      "无记忆 π0.6 → 双尺度记忆使任务时长扩到约 15 分钟并支持 in-context 策略自适应"
    ],
    "baselines": [
      "π0.6 (no memory)",
      "Pool Memory (avg-pool encodings)",
      "Proprioceptive-only memory",
      "MEM-Posttrain-Only",
      "naive language memory"
    ],
    "benchmarks": [],
    "risk": "全真机+完整消融、机构与机制都硬，可信度高；唯结果只给图无数值表、且不开源，外部复现成本高。"
  },
  "relevance": 3,
  "quality": 3,
  "tier": 2,
  "pain_points": [
    "reasoning",
    "action",
    "efficiency"
  ],
  "code_status": "closed-source",
  "headline": "π0.6 加双尺度记忆做 15 分钟长程任务；高效视频编码器思路可借鉴",
  "triage_reason": "PI 真机+系统消融+清晰新机制，质量硬；填补地图『记忆』线、且可分离注意力视频编码器思路可迁移到 SmolVLA。"
}

const TIERS = [
  {
    "arxiv_id": "2606.24448",
    "tier": 1,
    "relevance": 3,
    "quality": 3,
    "pain_points": [
      "data",
      "action",
      "generalization"
    ],
    "code_status": "none",
    "headline": "合成机器人视频只做几何监督、真实示教训控制头，提升数据扩增",
    "triage_reason": "真机pick-place 68.9 vs 61.1，去几何/anchor掉到36.7，有消融且新机制清晰；近期发表无代码不扣分"
  },
  {
    "arxiv_id": "2606.24742",
    "tier": 1,
    "relevance": 3,
    "quality": 3,
    "pain_points": [
      "data",
      "posttrain",
      "eval"
    ],
    "code_status": "promised",
    "headline": "用video world model做分布式value，评估含次优行为的机器人数据",
    "triage_reason": "多基准(Hesitation-RMSE 0.05 vs 0.14)+下游AWR/BC真机改善，机制新颖；有项目页待代码"
  },
  {
    "arxiv_id": "2606.24633",
    "tier": 1,
    "relevance": 3,
    "quality": 3,
    "pain_points": [
      "data",
      "posttrain"
    ],
    "code_status": "none",
    "headline": "用retry关键点训mistake-sensitive value，重加权BC清洗示教",
    "triage_reason": "Drop AUC 0.372→0.797，四真机任务80% vs 41/63，机制新且证据强；近期无代码不扣分"
  },
  {
    "arxiv_id": "2606.24472",
    "tier": 1,
    "relevance": 3,
    "quality": 3,
    "pain_points": [
      "action",
      "generalization"
    ],
    "code_status": "promised",
    "headline": "给VLA视觉token注入相机几何，pi0/pi0.5/GR00T上验证",
    "triage_reason": "多benchmark+真机，LIBERO 84.6→88.1、RoboTwin 44→49；GR00T GT版未稳提，有项目页"
  },
  {
    "arxiv_id": "2606.24049",
    "tier": 1,
    "relevance": 3,
    "quality": 3,
    "pain_points": [
      "action",
      "generalization",
      "data"
    ],
    "code_status": "promised",
    "headline": "用笛卡尔state-delta+adapter学跨机器人通用动作表示",
    "triage_reason": "增益变化下95-100% vs baseline 25/0%，清晰消融真机；正中action/跨硬件,有项目页"
  },
  {
    "arxiv_id": "2606.24208",
    "tier": 1,
    "relevance": 2,
    "quality": 2,
    "pain_points": [
      "action",
      "safety"
    ],
    "code_status": "none",
    "headline": "反向扩散每步解约束优化，做动作物理可行性后处理",
    "triage_reason": "方法扎实多任务仿真(+20/+23pp)，但真机/VLA闭环证据有限，仿真为主给2"
  },
  {
    "arxiv_id": "2606.24338",
    "tier": 1,
    "relevance": 2,
    "quality": 2,
    "pain_points": [
      "reasoning",
      "generalization"
    ],
    "code_status": "released",
    "headline": "在感知-动作间插结构化场景图状态，做长程子任务规划",
    "triage_reason": "GSR-bench强超prompting基线，但是reasoning非端到端policy且依赖强感知；benchmark代码已放"
  },
  {
    "arxiv_id": "2606.23754",
    "tier": 1,
    "relevance": 2,
    "quality": 2,
    "pain_points": [
      "safety",
      "eval"
    ],
    "code_status": "none",
    "headline": "VLA拆大Controller+小可验证Safety模块，违规率降到0",
    "triage_reason": "安全接口化设计清晰，violation 0且认证78-99%输入域，但主要仿真+低维约束、语义安全未覆盖"
  },
  {
    "arxiv_id": "2606.22966",
    "tier": 1,
    "relevance": 2,
    "quality": 2,
    "pain_points": [
      "safety"
    ],
    "code_status": "none",
    "headline": "攻击imagine-then-act的world-model latent而非动作输出",
    "triage_reason": "红队视角新颖(corruption高30-60x，MPC 0.55→0.05)，但detector仅部分有效、无消融式系统评测"
  },
  {
    "arxiv_id": "2606.23147",
    "tier": 1,
    "relevance": 2,
    "quality": 1,
    "pain_points": [
      "action",
      "safety"
    ],
    "code_status": "released",
    "headline": "不微调VLA，接触阶段用贝叶斯共享自治补精动作",
    "triage_reason": "共享自治思路实用且开源，但benchmarks为空无量化数值，证据偏定性给1"
  },
  {
    "arxiv_id": "2606.23574",
    "tier": 1,
    "relevance": 1,
    "quality": 2,
    "pain_points": [
      "safety"
    ],
    "code_status": "unknown",
    "headline": "给VLA/WAM做latent种子水印，输出侧攻击下仍可溯源",
    "triage_reason": "latent-seed溯源机制有新意、覆盖π0.5/LingBot，但属安全溯源小众方向，离efficiency重心远"
  },
  {
    "arxiv_id": "2606.22836",
    "tier": 1,
    "relevance": 3,
    "quality": 2,
    "pain_points": [
      "generalization",
      "data",
      "action"
    ],
    "code_status": "unknown",
    "headline": "遮住腕部相机里的自体末端，单夹爪数据零样本跨本体",
    "triage_reason": "低成本数据复用思路简洁实用、对SmolVLA跨硬件有用，但表格只给定性优于基线无数值"
  },
  {
    "arxiv_id": "2606.23623",
    "tier": 1,
    "relevance": 2,
    "quality": 1,
    "pain_points": [
      "posttrain",
      "action"
    ],
    "code_status": "unknown",
    "headline": "离散扩散VLA在去噪轨迹上做RL后训练",
    "triage_reason": "把去噪路径建成MDP有想法，但HTML不可用、无图表无数值，证据仅靠摘要"
  },
  {
    "arxiv_id": "2606.23685",
    "tier": 1,
    "relevance": 2,
    "quality": 2,
    "pain_points": [
      "data",
      "generalization"
    ],
    "code_status": "unknown",
    "headline": "人手手套数据转物理latent监督VLA，跨本体对齐动力学",
    "triage_reason": "对齐前向动力学latent+913h手套数据有料，真机六任务但样本有限、无前后数值对比"
  },
  {
    "arxiv_id": "2606.23686",
    "tier": 1,
    "relevance": 3,
    "quality": 2,
    "pain_points": [
      "eval",
      "safety"
    ],
    "code_status": "promised",
    "headline": "LIBERO-Safety：物理+语义安全综合评测，1.9万无碰撞演示",
    "triage_reason": "补VLA安全评测空白、8个VLA基准+keypose高效采集，正中eval/safety痛点但diff空、机制偏benchmark"
  },
  {
    "arxiv_id": "2606.22794",
    "tier": 1,
    "relevance": 3,
    "quality": 3,
    "pain_points": [
      "efficiency",
      "action"
    ],
    "code_status": "released",
    "headline": "分层多频更新VLA骨干：LIBERO 98.3%且延迟降2.1x",
    "triage_reason": "正中efficiency/上车：单骨干多频latent路径、真机+加速消融、有repo，清晰新机制"
  },
  {
    "arxiv_id": "2606.23589",
    "tier": 1,
    "relevance": 2,
    "quality": 2,
    "pain_points": [
      "reasoning",
      "action"
    ],
    "code_status": "unknown",
    "headline": "事件驱动keyframe记忆，给VLA长程双臂任务加轻量memory",
    "triage_reason": "事件检测keyframe+gated fusion思路实用、六真机长程任务，但未给量化前后数值"
  },
  {
    "arxiv_id": "2606.23617",
    "tier": 1,
    "relevance": 3,
    "quality": 2,
    "pain_points": [
      "posttrain",
      "data"
    ],
    "code_status": "unknown",
    "headline": "主动采集失败恢复经验做VLA持续学习，成功率59.8→72.4",
    "triage_reason": "uncertainty主动恢复+replay平衡遗忘，命中posttrain且有数值，但未明确真机规模/无repo"
  },
  {
    "arxiv_id": "2606.23641",
    "tier": 1,
    "relevance": 3,
    "quality": 2,
    "pain_points": [
      "posttrain",
      "generalization"
    ],
    "code_status": "promised",
    "headline": "用SAM平坦化微调保住VLA指令跟随，instruction following+60%",
    "triage_reason": "不改数据架构只换优化目标、有sharpness/Hessian消融+真机，对小数据微调SmolVLA直接有用"
  },
  {
    "arxiv_id": "2606.23531",
    "tier": 0,
    "relevance": 1,
    "quality": 1,
    "pain_points": [
      "action",
      "safety"
    ],
    "code_status": "none",
    "headline": "胆道内镜导航 VLA：阶段指令+grounding+离散动作，窄医疗域",
    "triage_reason": "窄医疗内镜应用，多头监督有点意思但无数值基线、方法难迁移到通用 VLA。"
  },
  {
    "arxiv_id": "2605.02881",
    "tier": 1,
    "relevance": 2,
    "quality": 1,
    "pain_points": [
      "reasoning",
      "generalization"
    ],
    "code_status": "released",
    "headline": "MolmoAct2 部署导向 action reasoning，开源可解释 action traces",
    "triage_reason": "开源(allenai)且面向部署，但仅摘要级描述、无量化对比，证据弱只能给 1。"
  },
  {
    "arxiv_id": "2604.15483",
    "tier": 2,
    "relevance": 3,
    "quality": 3,
    "pain_points": [
      "data",
      "generalization",
      "posttrain",
      "action"
    ],
    "code_status": "closed-source",
    "headline": "π0.7 可操控通用机器人基座：元数据+subgoal 用上失败数据",
    "triage_reason": "地标级 5B 通用 VLA，真机+跨本体+消融证据扎实；工业闭源不算水。"
  },
  {
    "arxiv_id": "2604.11757",
    "tier": 1,
    "relevance": 2,
    "quality": 1,
    "pain_points": [
      "efficiency",
      "eval"
    ],
    "code_status": "released",
    "headline": "StarVLA-α 强简单基线+跨 benchmark 统一，挑战堆复杂模块",
    "triage_reason": "命中效率/可复现且已开源，但摘要无明确数值，证据偏弱给 1。"
  },
  {
    "arxiv_id": "2603.28301",
    "tier": 1,
    "relevance": 2,
    "quality": 2,
    "pain_points": [
      "eval",
      "generalization"
    ],
    "code_status": "released",
    "headline": "LIBERO-Para 改写鲁棒诊断：测 VLA 是否真听懂语言",
    "triage_reason": "隔离 paraphrase 维度、报告 22-52pp 下降、代码已放，扎实但属常规评测卡。"
  },
  {
    "arxiv_id": "2603.04356",
    "tier": 0,
    "relevance": 1,
    "quality": 1,
    "pain_points": [
      "data",
      "eval"
    ],
    "code_status": "none",
    "headline": "RoboCasa365 大规模家庭仿真训练+评测平台",
    "triage_reason": ">3mo 无 github、仅项目页与摘要级规模叙述、无模型得分，价值在平台不在方法。"
  },
  {
    "arxiv_id": "2602.18224",
    "tier": 1,
    "relevance": 3,
    "quality": 2,
    "pain_points": [
      "efficiency",
      "eval"
    ],
    "code_status": "none",
    "headline": "SimVLA 0.5B/0.8B 透明可复现简单基线，超 OpenVLA-OFT",
    "triage_reason": "正中你 efficiency 复现重心、LIBERO 强结果；但>3mo 无代码迹象,按规则降一档至 2。"
  },
  {
    "arxiv_id": "2511.14759",
    "tier": 2,
    "relevance": 3,
    "quality": 3,
    "pain_points": [
      "posttrain",
      "action",
      "eval"
    ],
    "code_status": "closed-source",
    "headline": "π0.6* 用经验变强：RECAP value+advantage 后训练，吞吐翻倍",
    "triage_reason": "地标级部署后 RL，真机吞吐翻倍/失败减半+同数据对比 AWR/PPO，证据强；工业闭源不算水。"
  },
  {
    "arxiv_id": "2510.13626",
    "tier": 2,
    "relevance": 3,
    "quality": 3,
    "pain_points": [
      "eval",
      "generalization",
      "safety"
    ],
    "code_status": "released",
    "headline": "LIBERO-Plus 七维扰动鲁棒性诊断：95% 可掉到<30%",
    "triage_reason": "地标级 robustness 总卡、代码已放、揭示视角/初始态脆弱性，决定能否信 LIBERO 高分。"
  },
  {
    "arxiv_id": "2510.13375",
    "tier": 1,
    "relevance": 2,
    "quality": 1,
    "pain_points": [
      "action",
      "generalization"
    ],
    "code_status": "none",
    "headline": "DepthVLA 显式接深度模块做空间推理，MoT 融合",
    "triage_reason": "深度辅助空间推理有数值提升但属常规增量；>3mo 无代码迹象,按规则降一档至 1。"
  },
  {
    "arxiv_id": "2510.13054",
    "tier": 2,
    "relevance": 3,
    "quality": 3,
    "pain_points": [
      "efficiency",
      "action",
      "eval"
    ],
    "code_status": "released",
    "headline": "零改 VLM、动作当文本预测就打到 SOTA，直击简单可复现",
    "triage_reason": "反直觉强 baseline，NVlabs 放了代码和模型，正中你 efficiency/简单可复现主线；摘要级超越但有真实代码支撑"
  },
  {
    "arxiv_id": "2510.03827",
    "tier": 2,
    "relevance": 3,
    "quality": 3,
    "pain_points": [
      "eval",
      "generalization"
    ],
    "code_status": "released",
    "headline": "审计 LIBERO 背题：扰动后高分模型可崩到 0,评测可信度地标",
    "triage_reason": "地标级评测工具,揭示标准 LIBERO 高分不等于泛化,有代码;正中 eval 可信度痛点"
  },
  {
    "arxiv_id": "2508.09071",
    "tier": 1,
    "relevance": 2,
    "quality": 1,
    "pain_points": [
      "generalization",
      "action"
    ],
    "code_status": "none",
    "headline": "点云 3D 表征增强 VLA 空间感知,height/scale/viewpoint 适配",
    "triage_reason": "3D grounding 方向相关但 SOTA 仅出自摘要无 before/after 数值,>3月且无代码降一档"
  },
  {
    "arxiv_id": "2508.07917",
    "tier": 1,
    "relevance": 3,
    "quality": 2,
    "pain_points": [
      "reasoning",
      "action",
      "generalization"
    ],
    "code_status": "released",
    "headline": "Action Reasoning:先出可解释空间计划再预测动作,AI2 开源",
    "triage_reason": "显式空间轨迹推理,SimplerEnv 70.5/LIBERO 86.6 有数+真机,AllenAI 放代码;真机仅相对提升"
  },
  {
    "arxiv_id": "2506.18088",
    "tier": 1,
    "relevance": 2,
    "quality": 2,
    "pain_points": [
      "data",
      "eval",
      "generalization"
    ],
    "code_status": "promised",
    "headline": "双臂数据生成器+强域随机化 benchmark,合成数据撑泛化的观察点",
    "triage_reason": "双臂合成数据 benchmark 地标,有项目页;evidence 偏标题陈述无量化 before/after"
  },
  {
    "arxiv_id": "2506.01844",
    "tier": 2,
    "relevance": 3,
    "quality": 3,
    "pain_points": [
      "efficiency",
      "data",
      "action"
    ],
    "code_status": "released",
    "headline": "SmolVLA:0.45B 小模型+社区数据+异步推理,你的复现核心标的",
    "triage_reason": "正中 efficiency 核心+用户重心标的;LeRobot 开源,真机消融全(40→78.3)、异步降延迟、数据规模实测,证据扎实"
  },
  {
    "arxiv_id": "2504.16054",
    "tier": 2,
    "relevance": 3,
    "quality": 3,
    "pain_points": [
      "generalization",
      "data",
      "reasoning"
    ],
    "code_status": "released",
    "headline": "π0.5:异构 co-training 实现开放世界家庭泛化,openpi 开源",
    "triage_reason": "地标 VLA,真机未见房间评测+ME/CE/Web 数据消融清晰,openpi 已开源;部分对比无绝对数值"
  },
  {
    "arxiv_id": "2504.13059",
    "tier": 1,
    "relevance": 2,
    "quality": 2,
    "pain_points": [
      "data",
      "eval"
    ],
    "code_status": "released",
    "headline": "RoboTwin:生成式数字孪生双臂 benchmark,合成数据基础坐标",
    "triage_reason": "双臂数据/评测基础工作,有代码;evidence 偏能力描述,数值证据弱于其 2.0 版"
  },
  {
    "arxiv_id": "2502.19645",
    "tier": 2,
    "relevance": 3,
    "quality": 3,
    "pain_points": [
      "efficiency",
      "action"
    ],
    "code_status": "released",
    "headline": "OpenVLA-OFT:并行解码+连续动作,LIBERO 76.5→97.1、推理快26x",
    "triage_reason": "地标实用工作,正中 efficiency/action;LIBERO 大幅提升+约26x吞吐有数,代码开源,直接提升 OpenVLA 可用性"
  },
  {
    "arxiv_id": "2501.15830",
    "tier": 1,
    "relevance": 2,
    "quality": 2,
    "pain_points": [
      "generalization",
      "action"
    ],
    "code_status": "released",
    "headline": "SpatialVLA:3D 位置编码+自适应空间网格,1.1M episodes 预训练",
    "triage_reason": "空间 grounding 主线,有代码和1.1M预训练规模;evidence 偏定性,无量化 before/after"
  },
  {
    "arxiv_id": "2501.09747",
    "tier": 2,
    "relevance": 3,
    "quality": 3,
    "pain_points": [
      "action",
      "efficiency",
      "data"
    ],
    "code_status": "released",
    "headline": "DCT+BPE 动作 tokenizer，高频灵巧任务自回归 VLA 提速",
    "triage_reason": "地标级 action tokenization；FAST+ 黑盒 tokenizer，π0-FAST 训练快 5x，token 压缩数据详实，openpi 已开源"
  },
  {
    "arxiv_id": "2411.19650",
    "tier": 1,
    "relevance": 3,
    "quality": 2,
    "pain_points": [
      "action",
      "reasoning"
    ],
    "code_status": "released",
    "headline": "解耦 VLM 认知与 diffusion 动作模块的组件化 VLA",
    "triage_reason": "成熟组件化 VLA，真机+仿真大幅超 OpenVLA/RT-2-X，但证据多来自摘要级数字、无逐任务消融细节，微软已开源"
  },
  {
    "arxiv_id": "2410.24164",
    "tier": 2,
    "relevance": 3,
    "quality": 3,
    "pain_points": [
      "action",
      "efficiency",
      "posttrain"
    ],
    "code_status": "released",
    "headline": "PaliGemma+flow-matching 动作专家，高频连续控制地标",
    "triage_reason": "π0 地标，flow action expert 路线奠基；多灵巧任务超 OpenVLA/Octo，预训练+后训练配方清晰，openpi 开源（工业但已放码）"
  },
  {
    "arxiv_id": "2410.07864",
    "tier": 2,
    "relevance": 3,
    "quality": 3,
    "pain_points": [
      "action",
      "generalization",
      "data"
    ],
    "code_status": "released",
    "headline": "双臂 diffusion Transformer + 统一动作空间基础模型",
    "triage_reason": "双臂 foundation 代表，统一动作空间+diffusion DiT，真机相对+56%、消融覆盖规模/数据/建模，THU 已开源"
  },
  {
    "arxiv_id": "2409.12514",
    "tier": 2,
    "relevance": 3,
    "quality": 3,
    "pain_points": [
      "efficiency",
      "action",
      "data"
    ],
    "code_status": "released",
    "headline": "小 VLM+diffusion head，低延迟数据高效 VLA，正中复现",
    "triage_reason": "正中 efficiency/上车痛点：1B 延迟14ms vs OpenVLA-7B 292ms，diffusion>MLP/ACT 消融，真机验证，已开源"
  },
  {
    "arxiv_id": "2406.09246",
    "tier": 2,
    "relevance": 3,
    "quality": 3,
    "pain_points": [
      "efficiency",
      "action",
      "generalization"
    ],
    "code_status": "released",
    "headline": "开源 7B VLA 地标，LoRA+量化单卡可适配部署",
    "triage_reason": "地标级开源 VLA；Bridge 70.6% 超 RT-2-X，LoRA 1.4%参数/int4 7GB 消融扎实，正中可复现，全开源"
  },
  {
    "arxiv_id": "2406.02523",
    "tier": 1,
    "relevance": 2,
    "quality": 2,
    "pain_points": [
      "eval",
      "generalization",
      "data"
    ],
    "code_status": "released",
    "headline": "大规模厨房长程仿真，测家庭泛化的 benchmark hub",
    "triage_reason": "知名 household 仿真 benchmark，补 LIBERO 之外的长程泛化压力测试；价值在规模化数据/评测而非单一模型，项目站开源"
  },
  {
    "arxiv_id": "2405.12213",
    "tier": 2,
    "relevance": 3,
    "quality": 3,
    "pain_points": [
      "efficiency",
      "generalization",
      "action"
    ],
    "code_status": "released",
    "headline": "93M 可替换头开源通用 policy，低成本 baseline 标杆",
    "triage_reason": "地标级轻量开源 generalist；可替换 obs/action head+diffusion head，微调72% vs scratch 20%，消融充分，对 SmolVLA 复现直接相关"
  },
  {
    "arxiv_id": "2405.05941",
    "tier": 2,
    "relevance": 3,
    "quality": 3,
    "pain_points": [
      "eval",
      "generalization"
    ],
    "code_status": "released",
    "headline": "SimplerEnv：经校正的 sim-to-real 评测代理，防过拟合",
    "triage_reason": "地标级 eval 工具，1500+ paired sim-real 验证相关性，正中评测可信度痛点，OpenVLA/π0 常用作真实可用性补验，已开源"
  },
  {
    "arxiv_id": "2310.08864",
    "tier": 2,
    "relevance": 3,
    "quality": 3,
    "pain_points": [
      "data",
      "generalization",
      "action"
    ],
    "code_status": "released",
    "headline": "Open X-Embodiment：跨本体大数据集+RT-X，VLA 数据基石",
    "triage_reason": "地标级跨本体数据集（60数据集/22本体），RT-X 正迁移依赖容量的消融经典，OpenVLA/Octo 均基于此，DeepMind 开源"
  },
  {
    "arxiv_id": "2307.15818",
    "tier": 2,
    "relevance": 3,
    "quality": 3,
    "pain_points": [
      "generalization",
      "action",
      "reasoning"
    ],
    "code_status": "closed-source",
    "headline": "RT-2:把web VLM知识注入端到端动作,VLA范式奠基作",
    "triage_reason": "地标VLA,6k真机评测unseen 62% vs RT-1 32%,语义泛化来自VLM预训练;Google闭源但非水。"
  },
  {
    "arxiv_id": "2306.03310",
    "tier": 2,
    "relevance": 3,
    "quality": 3,
    "pain_points": [
      "eval",
      "generalization"
    ],
    "code_status": "released",
    "headline": "LIBERO:语言条件lifelong操作基准,几乎所有VLA都拿它对比",
    "triage_reason": "130任务四套件,是OpenVLA/SmolVLA/OFT标准评测底座;eval可信度地标,代码开源。"
  },
  {
    "arxiv_id": "2304.13705",
    "tier": 2,
    "relevance": 3,
    "quality": 3,
    "pain_points": [
      "action",
      "efficiency"
    ],
    "code_status": "released",
    "headline": "ACT:动作分块+低成本ALOHA,SmolVLA/OFT常用低层baseline",
    "triage_reason": "6真机精细任务10分钟示范80-90%,action chunking影响整代VLA动作头,正中efficiency/action。"
  },
  {
    "arxiv_id": "2303.04137",
    "tier": 2,
    "relevance": 3,
    "quality": 3,
    "pain_points": [
      "action"
    ],
    "code_status": "released",
    "headline": "Diffusion Policy:连续多峰动作扩散,塑造VLA action expert设计",
    "triage_reason": "12任务4机器人平均+46.9%,是RDT/CogACT/DexVLA动作解码语言来源,地标action baseline。"
  },
  {
    "arxiv_id": "2303.03378",
    "tier": 1,
    "relevance": 2,
    "quality": 3,
    "pain_points": [
      "reasoning",
      "generalization"
    ],
    "code_status": "closed-source",
    "headline": "PaLM-E:连续感知token接进LLM,VLA backbone迁移前史",
    "triage_reason": "证明连续观测embedding可与LLM共处做规划/VQA,是RT-2/π前史;偏推理非低层控制,Google闭源。"
  },
  {
    "arxiv_id": "2212.06817",
    "tier": 2,
    "relevance": 3,
    "quality": 3,
    "pain_points": [
      "data",
      "generalization",
      "action"
    ],
    "code_status": "released",
    "headline": "RT-1:35M实时transformer,大规模真机数据VLA数据底座",
    "triage_reason": "130k episodes/700任务,seen/unseen 97/76,仿真混入把sim-only从23提到87;数据宽度论点+实时,地标。"
  },
  {
    "arxiv_id": "2112.03227",
    "tier": 1,
    "relevance": 2,
    "quality": 2,
    "pain_points": [
      "eval",
      "reasoning"
    ],
    "code_status": "released",
    "headline": "CALVIN:长程语言条件操作基准,legacy long-horizon参照",
    "triage_reason": "经典多步指令序列评测,仍被引用但偏老;扎实开源,作为legacy坐标而非前沿。"
  },
  {
    "arxiv_id": "2107.14483",
    "tier": 1,
    "relevance": 2,
    "quality": 2,
    "pain_points": [
      "eval",
      "generalization"
    ],
    "code_status": "released",
    "headline": "ManiSkill:SAPIEN多样3D物体操作基准,空间/几何辅助坐标",
    "triage_reason": "全物理仿真+示范,常作几何/空间能力辅助评测;扎实开源但非VLA专用,辅助尺子。"
  },
  {
    "arxiv_id": "1910.10897",
    "tier": 1,
    "relevance": 1,
    "quality": 2,
    "pain_points": [
      "eval"
    ],
    "code_status": "released",
    "headline": "Meta-World:50任务多任务/元RL基准,辅助manipulation尺子",
    "triage_reason": "ML1/10/45协议经典,但非语言条件/非VLA,与VLA痛点弱关联;开源扎实,只作辅助坐标。"
  },
  {
    "arxiv_id": "2606.23085",
    "tier": 1,
    "relevance": 2,
    "quality": 2,
    "pain_points": [
      "safety",
      "reasoning"
    ],
    "code_status": "unknown",
    "headline": "用动作条件 world-model latent 做长程失败检测，只需最终标签",
    "triage_reason": "新机制(预测latent+conformal阈值)跨policy+真机，但无具体检测精度数值，证据偏定性"
  }
]

async function post(path, payload) {
  const res = await fetch(SITE + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + TOKEN },
    body: JSON.stringify(payload)
  })
  let json
  const txt = await res.text()
  try { json = JSON.parse(txt) } catch (e) { json = txt }
  return { status: res.status, json }
}

if (!TOKEN) {
  console.error('[x] 缺少 VLA_RADAR_INGEST_TOKEN 环境变量')
  process.exit(1)
}

;(async () => {
  const r1 = await post('/api/vla-radar/ingest', { papers: [MEM] })
  console.log('(1) MEM 入库:', r1.status, JSON.stringify(r1.json))
  if (r1.status !== 200) { console.error('[x] MEM 入库失败, 停止'); process.exit(1) }

  const r2 = await post('/api/vla-radar/set-tiers', { items: TIERS })
  console.log('(2) 分诊局部更新:', r2.status, JSON.stringify(r2.json))
  if (r2.status !== 200) { console.error('[x] 分诊更新失败'); process.exit(1) }

  console.log('\n[done] MEM 已入库(tier 2), 存量 ' + TIERS.length + ' 篇分诊已更新。')
})()
