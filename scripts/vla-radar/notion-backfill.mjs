#!/usr/bin/env node
/**
 * 一次性回填：把 Supabase 里已有的论文重新过一遍 /ingest，
 * 从而触发 Notion 镜像（把存量论文补进 Notion「VLA Papers」库）。
 *
 * 前置：先在 Vercel 配好 NOTION_TOKEN + NOTION_VLA_DB_ID 并 Redeploy。
 * 用法：VLA_RADAR_INGEST_TOKEN=xxxx node scripts/vla-radar/notion-backfill.mjs
 *
 * 原理：re-ingest 同一篇是幂等的（Supabase upsert 覆盖自身），顺带跑一遍 Notion 镜像。
 */
const SITE = (process.env.VLA_RADAR_SITE_URL || 'https://www.meowsu.xyz').replace(/\/$/, '')
const TOKEN = process.env.VLA_RADAR_INGEST_TOKEN
if (!TOKEN) {
  console.error('缺少环境变量 VLA_RADAR_INGEST_TOKEN')
  process.exit(1)
}

const res = await fetch(`${SITE}/api/vla-radar/list?limit=200`)
const data = await res.json().catch(() => ({}))
const papers = Array.isArray(data.papers) ? data.papers : []
if (!papers.length) {
  console.log('库里没有论文，无需回填。')
  process.exit(0)
}
console.log(`拉到 ${papers.length} 篇，逐篇 re-ingest（会触发 Notion 镜像）…`)

let ok = 0
let fail = 0
for (const p of papers) {
  try {
    const r = await fetch(`${SITE}/api/vla-radar/ingest`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ papers: [p] })
    })
    const j = await r.json().catch(() => ({}))
    if (j.ok) {
      ok++
      console.log(`  ✓ ${p.arxiv_id}  notion=${JSON.stringify(j.notion)}`)
    } else {
      fail++
      console.log(`  ✗ ${p.arxiv_id}: ${j.message || r.status}`)
    }
  } catch (e) {
    fail++
    console.log(`  ✗ ${p.arxiv_id}: ${e?.message || e}`)
  }
}
console.log(`完成：${ok} 成功，${fail} 失败。`)
