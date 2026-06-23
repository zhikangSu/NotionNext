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
   github_url、project_url 有就填、没有留空、不要编造。
3. POST 覆盖：
   curl -sS -X POST "https://www.meowsu.xyz/api/vla-radar/ingest" \
     -H "Authorization: Bearer $VLA_RADAR_INGEST_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"papers":[{"arxiv_id":"<id>","title":"...","authors":"...","published":"...","problem":"...","method":"...","delta":"...","evidence":"...","idea_signal":"...","tags":["..."],"github_url":"","project_url":""}]}'
```

> 因为存的是「文本 + 链接」而不是 PDF，重析成本极低，想重析多少次都行。

## 排错
- 任务报 `503`：Vercel 没配 `VLA_RADAR_INGEST_TOKEN` 或还没部署。
- 任务报 `401`：Codex 里的 token 和 Vercel 不一致。
- 抓到 0 篇：正常（那天没有新 VLA 论文），或 arXiv 当时限流（脚本会自动退避重试）。
- 想扩大/收窄抓取范围：改 `scripts/vla-radar/fetch-arxiv.mjs` 顶部的 `KEYWORD_QUERY`。
