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

## 排错
- 任务报 `503`：Vercel 没配 `VLA_RADAR_INGEST_TOKEN` 或还没部署。
- 任务报 `401`：Codex 里的 token 和 Vercel 不一致。
- 抓到 0 篇：正常（那天没有新 VLA 论文），或 arXiv 当时限流（脚本会自动退避重试）。
- 想扩大/收窄抓取范围：改 `scripts/vla-radar/fetch-arxiv.mjs` 顶部的 `KEYWORD_QUERY`。
