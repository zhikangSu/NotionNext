# VLA Radar · 漏斗改造方案（底稿）

> 目标：把网站从「论文解析工厂 / 档案馆」收回成「**VLA 研究地图**」——帮你定位研究机会，
> 而不是被每天十几篇论文淹没。核心原则：**啥都不丢、还都分析透（档案完整），但首页只露重点。**

## 一句话原则

> **「工厂感」来自把每篇都摆上台面，不是来自把每篇都分析透。**
> 所以：**分析层全量**（每篇全文读、全量解析、全部入库），**呈现层分诊**（tier 只管露面）。

```
雷达(每日进料·分诊·滚动) ──[rubric 自动 + 你可否决]──▶ 地图(小·慢·有观点·首页)
                                                            │
                          所有论文(全量解析) ──────────────▶ 档案馆(论文库·可搜·永不删)
```

## 判断框架

### A. 8 条 VLA 痛点 = 判「重不重要」的尺子（地图按这 8 条组织）
`data 数据瓶颈 · generalization 泛化 · action 动作表示 · reasoning 长程推理 ·
posttrain 部署后变强 · efficiency 效率/可复现(SmolVLA 这条权重最高) · eval 评测可信度 · safety 鲁棒安全`
（定义见 `public/vla-radar/data/curated.js` 的 `painPoints`，后端 key 见 `store.js` 的 `PAIN_KEYS`）

### B. 两个轴 → 四象限定层
- **relevance（0–3）**：打在上面某条痛点上的程度
- **quality（0–3）**：有料还是水 —— **读全文判，摘要判不出来**

| | 有料(quality≥2) | 水(quality≤1) |
|---|---|---|
| 打痛点(relevance≥2) | **Tier 2** 进地图 | **Tier 1** 雷达（标增量/存疑） |
| 不在方向(relevance≤1) | **Tier 1** 雷达（好论文，非你的菜） | **Tier 0** 仅档案 |

`tier` 由后端 `deriveTier()` 算，不写在 prompt 里（方便调阈值）。

### C. 质量看内容（day-0 没引用可参考）
逼 Codex 给**具体证据**，不给印象分：新意一句话 / 真机还是仿真 / 有没有消融 / baseline 同协议且强吗 / 提升幅度×位置（难设定 vs 饱和 LIBERO）/ 诚实度。
水论文 tell：只刷饱和 benchmark + 边际提升 + 无消融 + 无真机 + 「又一个 VLA + 某 trick」说不清为什么有用 + 窄域伪装通用。

### D. 复现性带时间（关键修正）
- **新论文（<3 个月）**：复现性**不计分**（刚出来没代码很正常）。
- **老论文（>3 个月）**：放了代码→加分；有迹象没兑现（空仓/coming soon 挂着）→ 轻微扣；完全无迹象→ 明显扣，标「长期无复现迹象」。
- **例外**：明确闭源工业工作（π / 部分 Google）标 `closed-source`，不当水论文——对「能否复现」权重高、对「重不重要」权重低。
- 含义：分诊不是一锤子买卖，需**定期重检**（drain 任务戳 GitHub/项目页更新 `code_status`）。

### E. 三个保险
1. **透明**：每篇带 `triage_reason`（一句话理由），你一眼看出判得对不对。
2. **可推翻**：Tier 1 以后火了/你听说了，点「全文解析」就升级。漏掉 sleeper hit 有补救。
3. **看内容不看出身**：小作坊可复现工作是加分（SmolVLA 角度），别被大厂光环带偏。

### F. 闸门 = 混合
rubric 自动定层 + 你手动推翻。手动升级 = 现成「全文解析」按钮（→ tier 2 + 完整解析）；降级走 Notion/小脚本，低频。

## 数据模型（`vla_papers` 新列，幂等 ALTER，老行安全默认）

| 列 | 类型 | 含义 |
|---|---|---|
| `tier` | smallint=1 | 0 仅档案 / 1 雷达 / 2 进地图 |
| `relevance` | smallint=0 | 0–3 打在痛点上的程度 |
| `quality` | smallint=0 | 0–3 有料还是水 |
| `pain_points` | jsonb=[] | 命中哪几条痛点 key |
| `triage_reason` | text | Codex 一句话理由 |
| `headline` | text | 雷达卡一句话「它在干嘛 + 为什么相关」 |
| `code_status` | text=unknown | unknown/none/promised/released/closed-source/stale-promise |
| `code_checked_at` | text | 上次重检代码状态时间 |

SQL 见 `supabase-schema.sql`。`store.js` 缺列时**逐个剥离重试**，任何部署顺序都不崩。

## 上线顺序（每步不破坏现网）

1. **[代码✅]** 加列 SQL + `store.js` 映射新字段/算 tier + `curated.js` 痛点 key —— 已写好，向后兼容
2. **[你做]** Supabase SQL Editor 跑 `supabase-schema.sql` 的 ALTER 段（一次性）
3. **回溯分诊 59 篇**：一次性 Codex 任务，重读全文 → 补 relevance/quality/tier/pain_points/code_status，大多沉 Tier 1，留十几篇 Tier 2。零删除（解析原样保留）。
4. **页面**：首页主区换成「8 条痛点线」；每日降级成窄雷达条；新增/复用 radar 页放 Tier 1；论文库=档案馆；paper.html 加 tier/质量/痛点徽章 + 「全文解析=升级」。
5. **Codex prompt**：daily 改成「每篇全文读 + 全量解析 + 多输出分诊字段」；drain 加「定期重检老论文代码状态」。
6. **Notion 镜像**：加新字段（可选）。

## 可调参数

- 代码宽限期：默认 **3 个月**
- 雷达窗口：默认最近 **30 天 / ~50 张**
- 进地图阈值（已实现于 store.js deriveTier）：relevance==3 且 quality==3 且 **发表满 3 个月** → Tier 2；relevance≤1 且 quality≤1 → Tier 0；其余 → Tier 1。新论文(<3 月)再强也先进雷达，靠手动(set-tiers)/重判升级 —— 体现「proves out 才进地图」。
- 手动升降级闸门：`POST /api/vla-radar/set-tiers`（token 鉴权，局部更新只改分诊列不碰解析）。
