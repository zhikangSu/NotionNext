# VLA Radar → Notion 存档

把网站解析的每篇论文,自动镜像成 Notion「VLA Papers」库里的一行(属性 + 正文五段 + 关键图表)。
是**网站内容的存档/curation 层**,不重新分析。

```
Codex 分析 → POST /api/vla-radar/ingest → 写 Supabase(网站)
                                        └→ 镜像到 Notion「VLA Papers」库(best-effort)
```

## 资源
- 父页面「vla每日论文」：`3884532b67f880f99d46d25f50e7bc01`
- 数据库「VLA Papers」：`d5ecda91061b415fb254b829257b5d98`
- 库属性：Paper / arxiv_id / 一句话 / 方向(multi) / arXiv / 代码 / 项目页 / 周 / 发布日期 / 精选(待筛选·精选·忽略)
- 正文：🎯问题 / 🛠️方法 / 📐相对变化 / 🔬证据 / 💡Idea + 🖼️关键图表(图片直链 + 证据表) + 回链详情页

## 配置(Vercel 环境变量 → Redeploy)
| 变量 | 值 |
| --- | --- |
| `NOTION_TOKEN` | Notion integration 的 Internal Integration Secret(`ntn_...`) |
| `NOTION_VLA_DB_ID` | `d5ecda91061b415fb254b829257b5d98` |

> 没配这两个时,镜像自动跳过,网站功能完全不受影响。
> integration 必须被「vla每日论文」页面共享(页面 ••• → Connections)。

## 行为
- **新论文**:在 Notion 建一行,`精选` 默认「待筛选」。
- **重析/更新**(按钮或 drain):按 `arxiv_id` 命中已有行,刷新属性 + 正文,**保留你手动设的「精选」值**。
- **去重**:按 `arxiv_id` 查询,不会产生重复行。

## 存量回填(一次性)
配好上面两个变量并 Redeploy 后:
```bash
VLA_RADAR_INGEST_TOKEN=<与 Vercel 一致> node scripts/vla-radar/notion-backfill.mjs
```
把 Supabase 里已有论文重新 ingest 一遍(幂等),顺带补进 Notion。

## 人工精选(可选,对应朋友 pipeline 的流程 B)
在 Notion 库里把认可的论文「精选」列改成「精选」,之后可手动整理进更深的阅读库。镜像更新时不会覆盖这个值。
