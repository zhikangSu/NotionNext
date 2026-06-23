# VLA Radar · 给 Codex 的任务简报

> 这份就是「现状 + 你要做什么」的合集。配 Codex 时:把下面**任务①**的内容贴进一个每天 09:00 的
> scheduled task;把**任务②**贴进一个每小时的 scheduled task。两个任务共用同一环境。

## 背景:这个系统是什么(已全部上线)

meowsu.xyz 的「VLA Radar」每天追踪 arXiv 上的 VLA(Vision-Language-Action)新论文:
**抓取 → 你(agent)读全文做结构化分析 → 写进站点数据库 → 网页展示**。后端已上线并验证通过。

- 站点:`https://www.meowsu.xyz`,页面在 `/vla-radar/`
- 存储:Supabase 表 `vla_papers`(**只存文本 + 链接,不存 PDF**)
- 抓取脚本(仓库内,已写好):`scripts/vla-radar/fetch-arxiv.mjs`(按 VLA 关键词抓 + 自动去重)
- 写入接口:`POST /api/vla-radar/ingest`(需 `Authorization: Bearer $VLA_RADAR_INGEST_TOKEN`)
- 队列接口:`GET /api/vla-radar/pending`(给任务② 用,同一个 token)
- **你不需要任何 LLM API key —— 你自己就是分析引擎。**

## 环境要求(在 Codex 环境设置里配一次)

- 仓库:`zhikangSu/NotionNext`(main 分支)
- **打开外网访问**(要访问 `arxiv.org` 和 `www.meowsu.xyz`)
- 环境变量 `VLA_RADAR_INGEST_TOKEN`(与 Vercel 上同名变量一致)

---

## 任务①:每日抓取分析 —— Schedule: 每天 09:00 (Asia/Shanghai)

```text
每天为 meowsu.xyz「VLA Radar」抓取并分析新的 VLA 论文。你自己就是分析引擎，不要调用任何外部 LLM API。
环境：仓库已检出；环境变量 VLA_RADAR_INGEST_TOKEN 已配置；可访问外网。SITE=https://www.meowsu.xyz

1. 抓取（已含 VLA 关键词过滤 + 用线上已存 id 去重）：
   VLA_RADAR_SITE_URL=$SITE node scripts/vla-radar/fetch-arxiv.mjs --days 2 --out /tmp/vla-new.json
   读 /tmp/vla-new.json；为空数组 → 报告“今天没有新论文”并结束。
2. 先用标题+摘要筛相关性（必须是 VLA / 机器人操作 policy / 机器人基础模型；天文 VLA、纯 NLP 等丢弃）。
3. 对每篇相关论文，先打开 arXiv 全文通读再分析（推荐 HTML 版 https://arxiv.org/html/<id>，或 PDF https://arxiv.org/pdf/<id>），
   重点看 方法/实验/消融/主结果/局限。用中文写 problem / method / delta / evidence / idea_signal / tags（3-6 个英文小写），
   保留 arxiv_id / title / authors / published / abstract；github_url、project_url 有就填、没有留空、不要编造。
   另外从 HTML 版选择 3~6 个最关键的图表证据项，数量由论文内容决定。不要机械套固定类别，优先选择能说明核心方法/系统/数据/训练流程、相对已有工作改动、主结果/消融/效率/泛化/真实机器人证据的图、表或可视化；如果论文有主结果表/消融表/效率对比表，至少补 1 个能代表量化结论的表格项。
   放进 figures。图片项格式为 {"url":"https://arxiv.org/html/<id>/xN.png","caption":"中文说明"}，url 用 arxiv.org/html 绝对直链（即 HTML 里 <img> src 拼成绝对路径）。HTML 表格项格式为 {"type":"table","title":"中文短标题","columns":["列1","列2"],"rows":[["值1","值2"]],"caption":"中文说明"}，只摘最关键列和行，避免全表搬运；没有 HTML 版、没有可展示图片或关键表格就留空数组，不要编造、不要用 PDF 截图。
   适配要求：图片项只存 url 和短 caption；表格项只存 type/title/columns/rows/caption。不要生成 <img>、HTML、style、width、height、base64 或本地截图路径；不要因为原图尺寸很大就裁剪、缩放、转存或改成 PDF 截图。caption 尽量控制在 80 个中文字符左右，避免撑高卡片。网页会统一用响应式卡片、最大高度和 object-fit: contain 适配图片，并用横向滚动表格适配量化表。
4. 打成 /tmp/vla-payload.json={"papers":[...]} 后 POST：
   curl -sS -X POST "$SITE/api/vla-radar/ingest" -H "Authorization: Bearer $VLA_RADAR_INGEST_TOKEN" -H "Content-Type: application/json" -d @/tmp/vla-payload.json
   401→token 错；503→后端未配置；{"ok":true,"upserted":N}→成功。
5. 报告：抓到几篇、相关几篇、入库几篇、丢弃原因。
```

---

## 任务②:全文重析队列 —— Schedule: 每小时

> 处理网页详情页「🔬 全文重新解析」按钮产生的请求。

```text
处理 meowsu.xyz「VLA Radar」的全文重析队列。你自己就是分析引擎，不要调用任何外部 LLM API。
环境：仓库已检出；环境变量 VLA_RADAR_INGEST_TOKEN 已配置；可访问外网。SITE=https://www.meowsu.xyz

1. 取队列：curl -sS "$SITE/api/vla-radar/pending" -H "Authorization: Bearer $VLA_RADAR_INGEST_TOKEN"
   得到 {"ok":true,"papers":[{arxiv_id,title,arxiv_url}]}；papers 为空 → 报告“队列为空”并结束。
2. 每篇打开 arXiv 全文通读（推荐 HTML 版 https://arxiv.org/html/<id>，或 PDF https://arxiv.org/pdf/<id>），重点看 方法/实验/消融/主结果/局限。
   用中文写 problem / method / delta / evidence / idea_signal / tags；github_url、project_url 有就填、没有留空、不要编造。
   另外从 HTML 版选择 3~6 个最关键的图表证据项，数量由论文内容决定。不要机械套固定类别，优先选择能说明核心方法/系统/数据/训练流程、相对已有工作改动、主结果/消融/效率/泛化/真实机器人证据的图、表或可视化；如果论文有主结果表/消融表/效率对比表，至少补 1 个能代表量化结论的表格项。
   放进 figures。图片项格式为 {"url":"https://arxiv.org/html/<id>/xN.png","caption":"中文说明"}，url 用 arxiv.org/html 绝对直链。HTML 表格项格式为 {"type":"table","title":"中文短标题","columns":["列1","列2"],"rows":[["值1","值2"]],"caption":"中文说明"}，只摘最关键列和行，避免全表搬运；没有可展示图片或关键表格就留空数组，不要编造、不要用 PDF 截图。
   适配要求：图片项只存 url 和短 caption；表格项只存 type/title/columns/rows/caption。不要生成 <img>、HTML、style、width、height、base64 或本地截图路径；不要因为原图尺寸很大就裁剪、缩放、转存或改成 PDF 截图。caption 尽量控制在 80 个中文字符左右，避免撑高卡片。网页会统一用响应式卡片、最大高度和 object-fit: contain 适配图片，并用横向滚动表格适配量化表。
3. 打成 /tmp/vla-deep.json={"papers":[...]} 后 POST 覆盖（会自动清掉队列标记）：
   curl -sS -X POST "$SITE/api/vla-radar/ingest" -H "Authorization: Bearer $VLA_RADAR_INGEST_TOKEN" -H "Content-Type: application/json" -d @/tmp/vla-deep.json
4. 报告处理了几篇。
```
