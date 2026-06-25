-- VLA Radar 论文表
-- 在 Supabase 控制台 → SQL Editor 里执行一次即可。
-- 只有服务端（API 路由）用 service key 读写，所以不需要开 RLS。

create table if not exists public.vla_papers (
  arxiv_id       text primary key,             -- 归一化后的 id（无版本号，如 2506.01234）
  title          text not null,
  authors        text default '',
  published      text default '',              -- arXiv 提交时间（ISO 字符串，可直接排序）
  abstract       text default '',
  problem        text default '',              -- 它认为现有 VLA 卡在哪里
  method         text default '',              -- 改了架构 / 数据 / 训练 / 推理 / 评测哪一层
  delta          text default '',              -- 相对 RT-2 / OpenVLA / π0 / SmolVLA 的具体变化
  evidence       text default '',              -- 真实机器人？仿真？消融？是否开源？
  idea_signal    text default '',              -- 对 SmolVLA 复现 / 改进的启发
  tags           jsonb default '[]'::jsonb,
  arxiv_url      text default '',
  github_url     text default '',
  project_url    text default '',
  figures        jsonb default '[]'::jsonb,    -- 关键图表证据：图片 {url, caption} 或表格 {type, title, columns, rows}
  diff           jsonb default '{}'::jsonb,    -- 结构化 diff：{base, changes[], baselines[], benchmarks[{name,metric,before,after}], risk}
  deep_requested boolean default false,        -- 网页「全文重析」按钮排队标记；drain 处理后清零
  tier           smallint default 1,           -- 漏斗层级：0 仅档案 / 1 雷达 / 2 进地图
  relevance      smallint default 0,           -- 0–3：打在 8 条 VLA 痛点上的程度
  quality        smallint default 0,           -- 0–3：有料还是水（读全文判，非摘要）
  pain_points    jsonb default '[]'::jsonb,    -- 命中哪几条痛点 key（data/efficiency/...）
  triage_reason  text default '',              -- Codex 一句话理由（新意/证据/为什么这个分）
  headline       text default '',              -- 雷达卡一句话「它在干嘛 + 为什么可能跟你相关」
  code_status    text default 'unknown',       -- unknown/none/promised/released/closed-source/stale-promise
  code_checked_at text default '',             -- 上次重检代码状态的时间（drain 用）
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

create index if not exists vla_papers_published_idx
  on public.vla_papers (published desc);

-- 可选：标签 GIN 索引，方便按 tag 过滤
create index if not exists vla_papers_tags_idx
  on public.vla_papers using gin (tags);

-- 如果你之前就建过表，跑这两句补列（幂等）：
alter table public.vla_papers
  add column if not exists deep_requested boolean default false;
alter table public.vla_papers
  add column if not exists figures jsonb default '[]'::jsonb;
alter table public.vla_papers
  add column if not exists diff jsonb default '{}'::jsonb;

-- 漏斗分诊列（幂等补列，老行自动拿安全默认：tier=1 中性雷达）：
alter table public.vla_papers add column if not exists tier smallint default 1;
alter table public.vla_papers add column if not exists relevance smallint default 0;
alter table public.vla_papers add column if not exists quality smallint default 0;
alter table public.vla_papers add column if not exists pain_points jsonb default '[]'::jsonb;
alter table public.vla_papers add column if not exists triage_reason text default '';
alter table public.vla_papers add column if not exists headline text default '';
alter table public.vla_papers add column if not exists code_status text default 'unknown';
alter table public.vla_papers add column if not exists code_checked_at text default '';

-- 地图/雷达按层级 + 时间取，加个复合索引
create index if not exists vla_papers_tier_pub_idx
  on public.vla_papers (tier desc, published desc);
