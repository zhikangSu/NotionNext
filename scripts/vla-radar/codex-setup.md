# 用 Codex 跑 VLA Radar 每日任务

目标：每天 09:00（Asia/Shanghai）由 Codex 云端自动 抓 arXiv → 分析 → 写库。
Codex 是真·无人值守（到点必跑，与你电脑是否开机无关），分析由 Codex 自己的模型完成，**不需要 API key**。

## 先决条件（必须先完成，否则任务会停在 503）
1. Supabase 建表：跑 `scripts/vla-radar/supabase-schema.sql`
2. Vercel 加环境变量 `VLA_RADAR_INGEST_TOKEN`，并重新部署
3. **本仓库代码已推到 GitHub `main`**（Codex 读的是 GitHub 上的仓库，不是本地）

## 配置步骤
1. 打开 [chatgpt.com/codex](https://chatgpt.com/codex)，把环境指向 `zhikangSu/NotionNext`（main 分支）。
2. 在该环境的设置里：
   - **打开外网访问**（agent 要访问 `arxiv.org` 和 `www.meowsu.xyz`；Codex 默认可能关着外网）。
   - 加 **环境变量 / Secret**：`VLA_RADAR_INGEST_TOKEN` = 与 Vercel 上一致的那串。
3. 新建一个 **Task**，开启 **Schedule**：每天 `09:00`，时区选 `Asia/Shanghai`。
4. 任务的 prompt：把 `scripts/vla-radar/routine-prompt.md` 里 `---` 之间的正文整段贴进去。
5. 先点一次 **Run**（手动触发）验证：跑完去 `https://www.meowsu.xyz/vla-radar/#daily` 看是否出现新卡片，
   点卡片能进 `paper.html` 详情页即成功。

## 重新分析某一篇（深度 · 读全文）

默认每日任务基于「摘要」分析（够做雷达初筛，且不存 PDF —— 只存解析结果 + arXiv 链接）。
若对某篇结果不满意，在 Codex 里临时跑下面这段（读全文后**覆盖**旧结果，按 arxiv_id upsert，幂等）：

```text
重新深度分析一篇 VLA 论文并覆盖入库。论文：<arxiv_id 或 arxiv 链接>
1. 打开并通读全文（不只摘要）：https://arxiv.org/abs/<id> 或 PDF https://arxiv.org/pdf/<id>，
   也可读 HTML 全文版 https://ar5iv.org/abs/<id>。
2. 用中文写结构化分析：problem / method / delta / evidence / idea_signal / tags；
   关键图表证据放在 `figures`：图片项用 `{url, caption}`，HTML 关键结果/消融表用
   `{type:"table", title, columns, rows, caption}`。
   结构化 diff 放在 `diff`：{base, changes:["before → after",...], baselines:[...], benchmarks:[{name,metric,before,after}], risk}，没对应信息留空、不编造数字。
   github_url、project_url 有就填、没有留空、不要编造。
3. POST 覆盖：
   curl -sS -X POST "https://www.meowsu.xyz/api/vla-radar/ingest" \
     -H "Authorization: Bearer $VLA_RADAR_INGEST_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"papers":[{"arxiv_id":"<id>","title":"...","authors":"...","published":"...","problem":"...","method":"...","delta":"...","evidence":"...","idea_signal":"...","tags":["..."],"github_url":"","project_url":"","figures":[{"url":"https://arxiv.org/html/<id>/x1.png","caption":"架构图"},{"type":"table","title":"主结果","columns":["Model","Avg"],"rows":[["SmolVLA","87.3"]],"caption":"只摘关键结果行"}]}]}'
```

> 因为存的是「文本 + 链接」而不是 PDF，重析成本极低，想重析多少次都行。

## 全文重析队列：第二个 Codex 任务（drain）

网页详情页的「🔬 全文重新解析」按钮，会把该篇标记进队列（`POST /api/vla-radar/request`，不需要 key）。
再建一个**高频** Codex scheduled task 把队列消化掉 —— 环境同上（指向仓库、开外网、配 `VLA_RADAR_INGEST_TOKEN`），
**Schedule 设每小时一次**（你额度大，也可每 30 分钟，点完按钮很快就自动更新）。prompt：

```text
处理 meowsu.xyz「VLA Radar」的全文重析队列。环境：VLA_RADAR_INGEST_TOKEN 已配置；可访问外网。
SITE = https://www.meowsu.xyz

1. 取队列：
   curl -sS "$SITE/api/vla-radar/pending" -H "Authorization: Bearer $VLA_RADAR_INGEST_TOKEN"
   得到 {"ok":true,"papers":[{"arxiv_id","title","arxiv_url"}]}。若 papers 为空 → 报告「队列为空」并结束。
2. 对每篇：打开 arXiv HTML 全文通读（https://arxiv.org/html/<arxiv_id>，或 PDF https://arxiv.org/pdf/<arxiv_id>），
   重点看 方法/实验/消融/主结果/局限。用中文写 problem / method / delta / evidence / idea_signal / tags；
   github_url、project_url 有就填、没有留空、不要编造。
   figures：1~6 个关键图/表证据（图片 {url,caption} 用 arxiv.org/html 直链；关键结果表 {type:"table",title,columns,rows,caption}）。
   diff：{base, changes:["before → after",...], baselines:[...], benchmarks:[{name,metric,before,after}], risk}，没对应信息留空、不编造数字。
3. 打成 /tmp/vla-deep.json = {"papers":[ ... ]} 后 POST 覆盖（会自动清掉队列标记 deep_requested）：
   curl -sS -X POST "$SITE/api/vla-radar/ingest" \
     -H "Authorization: Bearer $VLA_RADAR_INGEST_TOKEN" \
     -H "Content-Type: application/json" -d @/tmp/vla-deep.json
4. 报告处理了几篇。
```

## 让「全文重析」秒级触发（可选，推荐）

每小时的 drain 任务时效差。Codex 支持**事件触发（webhook trigger）**，能让网页按钮点完**立刻**唤醒 Codex：

1. 在 Codex 里新建一个 **Trigger（webhook 类型）**，任务内容用上面【任务②/drain】的同一段 prompt。
2. 拿到该 trigger 的 **webhook URL**（以及密钥，如果有）。
3. 在 Vercel 加环境变量并 Redeploy：
   - `CODEX_TRIGGER_URL` = 那个 webhook URL
   - `CODEX_TRIGGER_SECRET` = 密钥（Codex 没给就不填）
4. 完成。

之后点详情页「🔬 全文重新解析」时的链路：
```
网页按钮 → POST /api/vla-radar/request → 标记入队 + 立即 POST 唤醒 Codex webhook
        → Codex 跑 drain：读 /pending → 全文重析 → POST /ingest 覆盖（自动清队列标记）
        → 详情页每 20s 轮询，检测到标记清除即自动刷新（通常 1~3 分钟）
```

> 每小时的 scheduled drain 任务**保留作兜底**（万一某次 webhook 没成功）。
> 没配 `CODEX_TRIGGER_URL` 时，按钮自动退回「排队 + 等每小时」模式，功能不受影响。

## 排错
- 任务报 `503`：Vercel 没配 `VLA_RADAR_INGEST_TOKEN` 或还没部署。
- 任务报 `401`：Codex 里的 token 和 Vercel 不一致。
- 抓到 0 篇：正常（那天没有新 VLA 论文），或 arXiv 当时限流（脚本会自动退避重试）。
- 想扩大/收窄抓取范围：改 `scripts/vla-radar/fetch-arxiv.mjs` 顶部的 `KEYWORD_QUERY`。
