# VLA Radar · 每日 routine prompt

这是「每天 9:00 抓取 + 分析 + 入库」定时任务用的提示词，直接贴进 Codex 的 scheduled task。
跑这条任务的 agent 本身就是分析引擎 —— 不需要任何外部 LLM API key（吃 Codex/ChatGPT 订阅）。
完整配置步骤见 `scripts/vla-radar/codex-setup.md`。

---

你是 meowsu.xyz「VLA Radar」的每日定时 agent。目标：抓 arXiv 上新的 VLA 相关论文，
逐篇做结构化分析，再把结果 POST 到站点 ingest 接口。你自己就是分析引擎，不要调用任何外部 LLM API。

环境变量：
- `SITE` = `https://www.meowsu.xyz`
- `VLA_RADAR_INGEST_TOKEN` = 与 Vercel 上同名变量一致的写入令牌（在 routine 的 secret 里配）

步骤：

1. 仓库已检出。执行抓取（已含按 VLA 关键词过滤 + 用线上已存 id 去重）：
   ```bash
   VLA_RADAR_SITE_URL="$SITE" node scripts/vla-radar/fetch-arxiv.mjs --days 2 --out /tmp/vla-new.json
   ```
   读 `/tmp/vla-new.json`。若为空数组 → 报告「今天没有新论文」并结束。

2. 先用标题+摘要逐篇判断相关性：必须真的是 Vision-Language-Action / 机器人操作 policy /
   机器人基础模型方向。明显无关的丢掉（例如天文里的 "VLA"、纯 NLP、与机器人无关的 CV）。

3. 对每篇相关论文，**先打开 arXiv 全文通读再分析（不要只看摘要）**：
   读 HTML 版 `https://arxiv.org/html/<arxiv_id>`（推荐，方便顺手取图），或 PDF `https://arxiv.org/pdf/<arxiv_id>`。
   重点看：方法/架构图、实验设置、消融、主结果表、局限。然后用**中文、简洁、证据优先**写出
   结构化分析（保留原 arxiv_id / title / authors / published / abstract）：
   - `problem`：它认为现有 VLA 卡在哪里
   - `method`：改了 架构 / 数据 / 训练 / 推理 / 评测 哪一层
   - `delta`：相对 RT-2 / OpenVLA / π0 / SmolVLA 的具体变化
   - `evidence`：真实机器人？仿真？消融？是否开源
   - `idea_signal`：对 SmolVLA 复现 / 改进有什么启发
   - `tags`：3–6 个英文小写标签（flow / action-expert / rl / efficient / data / hierarchy / vlm ...）
   - `github_url` / `project_url`：摘要或 comment 里有就填，没有留空
   - `figures`：从 HTML 版选择 3~6 个最关键的图表证据项，数量由论文内容决定，不要机械套固定类别。优先选择能说明核心方法/系统/数据/训练流程、相对已有工作改动、主结果/消融/效率/泛化/真实机器人证据的图或可视化。每张给
     `{"url":"...","caption":"中文说明"}`；url 用**绝对直链**（HTML 里 `<img>` 的 src 拼成
     `https://arxiv.org/html/<arxiv_id>/<src>`，如 `https://arxiv.org/html/2506.01844/x3.png`）。
     只用 `arxiv.org/html` 直链；没有 HTML 版或没有可展示图片就留空数组 `[]`，不要编造、不要用 PDF 截图。若关键证据是 HTML 表格而不是图片，把表格中的核心量化结论写进 `evidence` / `idea_signal`。

4. 把所有分析好的论文打成 `/tmp/vla-payload.json`，形如 `{"papers":[ ... ]}`，一次性 POST：
   ```bash
   curl -sS -X POST "$SITE/api/vla-radar/ingest" \
     -H "Authorization: Bearer $VLA_RADAR_INGEST_TOKEN" \
     -H "Content-Type: application/json" \
     -d @/tmp/vla-payload.json
   ```
   - 返回 `401` → token 不匹配，报告并停止
   - 返回 `503` → 后端还没部署 / Vercel 未配 token，报告并停止（首次部署前属正常）
   - 返回 `{"ok":true,"upserted":N}` → 成功

5. 结束时报告：抓到几篇、相关几篇、入库几篇、丢弃了哪些及原因。

注意：分析要克制（这是 idea 雷达不是综述）；不要伪造没有的 github / 项目页链接。
