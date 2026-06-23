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
  figures        jsonb default '[]'::jsonb,    -- 关键图表：[{url, caption}]，只存直链不存图片
  deep_requested boolean default false,        -- 网页「全文重析」按钮排队标记；drain 处理后清零
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
