# VLA Radar · 每日 arXiv 论文管线

每天自动抓 VLA 相关新论文 → 结构化分析 → 存 Supabase → 在 `/vla-radar` 页面展示。

```
每天 9:00  Codex 云端定时任务（吃订阅，无需 API key）
  ① node scripts/vla-radar/fetch-arxiv.mjs   抓 arXiv + 关键词过滤 + 去重 → 新论文(标题/摘要)
  ② routine 自己阅读每篇 → { problem, method, delta, evidence, idea_signal, tags }
  ③ POST /api/vla-radar/ingest (Bearer token) → Vercel 路由 upsert 进 Supabase
前端：
  · /vla-radar/index.html  daily 区块 → fetch /api/vla-radar/list
  · /vla-radar/paper.html?id=xxx → fetch /api/vla-radar/paper  （同款风格详情页）
```

## 一次性配置

### 1. 建表
Supabase 控制台 → SQL Editor → 执行 `scripts/vla-radar/supabase-schema.sql`。

### 2. 环境变量（Vercel → Settings → Environment Variables）
| 变量 | 用途 | 说明 |
| --- | --- | --- |
| `SUPABASE_URL` | Supabase 项目地址 | 已有（contribution 功能在用） |
| `SUPABASE_SECRET_KEY` | service key | 已有 |
| `VLA_RADAR_INGEST_TOKEN` | 写入鉴权 | **新增**，自己生成一串随机字符串 |

> 生成 token：`openssl rand -hex 24`

### 3. 定时任务（Codex 云端）
按 `scripts/vla-radar/codex-setup.md` 配置：每天 09:00 由 Codex 跑 `fetch-arxiv.mjs` → 分析 → POST 到 ingest。
prompt 用 `scripts/vla-radar/routine-prompt.md`；Codex 里的 `VLA_RADAR_INGEST_TOKEN` 与第 2 步一致。

## 本地 / 手动测试

```bash
# 1) 只看抓到哪些新论文（不写库）
node scripts/vla-radar/fetch-arxiv.mjs --days 7 --no-dedupe

# 2) 写到文件，方便人工分析
node scripts/vla-radar/fetch-arxiv.mjs --days 7 --out /tmp/vla-new.json

# 3) 手动灌一条进库（验证 ingest 通路）
curl -X POST "$SITE/api/vla-radar/ingest" \
  -H "Authorization: Bearer $VLA_RADAR_INGEST_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"papers":[{"arxiv_id":"2506.01844","title":"SmolVLA","problem":"...","method":"...","idea_signal":"...","tags":["efficient","flow"]}]}'

# 4) 读回来
curl "$SITE/api/vla-radar/list?limit=5"
```

## ingest 接收的字段
```jsonc
{
  "papers": [{
    "arxiv_id": "2506.01234",     // 必填，会自动去版本号
    "title": "...",
    "authors": "A, B, C",
    "published": "2026-06-22T...",
    "abstract": "...",
    "problem": "它认为现有 VLA 卡在哪里",
    "method": "改了架构/数据/训练/推理/评测哪一层",
    "delta": "相对 RT-2/OpenVLA/π0/SmolVLA 的具体变化",
    "evidence": "真实机器人？仿真？消融？是否开源？",
    "idea_signal": "对 SmolVLA 复现/改进的启发",
    "tags": ["action-expert", "flow"],
    "github_url": "",             // 有就填，没有留空
    "project_url": ""
  }]
}
```
`arxiv_url` 不填会按 id 自动生成。按 `arxiv_id` upsert，重复跑安全。
