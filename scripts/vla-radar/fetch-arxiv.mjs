#!/usr/bin/env node
/**
 * VLA Radar · arXiv 抓取脚本（确定性，不含 LLM）
 *
 * 做的事：
 *   1. 调 arXiv Atom API，按 VLA 关键词 + 分类抓最近的论文
 *   2. 解析出 标题 / 摘要 / 作者 / 日期 / 分类 / arxiv 链接 / 顺手抓到的 github 链接
 *   3. 向站点 /api/vla-radar/list?ids_only=1 拉已存 id，去重（只留新论文）
 *   4. 把新论文以 JSON 数组打到 stdout（交给定时 routine 去做“分析”）
 *
 * 用法：
 *   node scripts/vla-radar/fetch-arxiv.mjs            # 打印新论文 JSON
 *   node scripts/vla-radar/fetch-arxiv.mjs --days 7   # 回看 7 天
 *   node scripts/vla-radar/fetch-arxiv.mjs --out /tmp/vla-new.json
 *   node scripts/vla-radar/fetch-arxiv.mjs --no-dedupe
 *
 * 环境变量：
 *   VLA_RADAR_SITE_URL   站点地址（去重用），默认 https://www.meowsu.xyz
 */

import { writeFileSync } from 'node:fs'

const args = process.argv.slice(2)
const getArg = (name, fallback) => {
  const i = args.indexOf(`--${name}`)
  if (i !== -1 && args[i + 1] && !args[i + 1].startsWith('--'))
    return args[i + 1]
  return fallback
}
const hasFlag = name => args.includes(`--${name}`)

const SITE_URL = (
  process.env.VLA_RADAR_SITE_URL || 'https://www.meowsu.xyz'
).replace(/\/$/, '')
const DAYS = Number(getArg('days', 3)) || 3
const MAX_RESULTS = Number(getArg('limit', 80)) || 80
const OUT_FILE = getArg('out', '')
const DEDUPE = !hasFlag('no-dedupe')

// VLA 专属关键词（短语优先，避免 "VLA" 撞上天文 Very Large Array）。
// 撒网略宽，最终相关性由定时 routine 的 agent 判断后再决定是否入库。
const KEYWORD_QUERY = [
  '"vision-language-action"',
  '"vision language action"',
  '"generalist robot policy"',
  '"robot foundation model"',
  '"robotic manipulation policy"',
  '"action expert"',
  '"robot manipulation" AND policy'
]
  .map(k => `all:${k}`)
  .join(' OR ')

const CATEGORY_QUERY = [
  'cat:cs.RO',
  'cat:cs.AI',
  'cat:cs.LG',
  'cat:cs.CV'
].join(' OR ')

const SEARCH_QUERY = `(${CATEGORY_QUERY}) AND (${KEYWORD_QUERY})`

const ARXIV_API = `http://export.arxiv.org/api/query?search_query=${encodeURIComponent(
  SEARCH_QUERY
)}&start=0&max_results=${MAX_RESULTS}&sortBy=submittedDate&sortOrder=descending`

const decodeXml = s =>
  String(s || '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&amp;/g, '&')

const collapse = s => decodeXml(s).replace(/\s+/g, ' ').trim()

const pick = (block, tag) => {
  const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i'))
  return m ? m[1] : ''
}

const pickAll = (block, tag) => {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'gi')
  const out = []
  let m
  while ((m = re.exec(block))) out.push(m[1])
  return out
}

const parseEntries = xml => {
  const entries = []
  const re = /<entry>([\s\S]*?)<\/entry>/g
  let m
  while ((m = re.exec(xml))) {
    const block = m[1]
    const rawId = pick(block, 'id') // http://arxiv.org/abs/2506.01234v1
    const idMatch = rawId.match(/abs\/([^\s<]+)/)
    if (!idMatch) continue
    const arxivId = idMatch[1].replace(/v\d+$/i, '')

    const title = collapse(pick(block, 'title'))
    const abstract = collapse(pick(block, 'summary'))
    const published = collapse(pick(block, 'published'))
    const authors = pickAll(block, 'name').map(collapse).filter(Boolean)
    const categories = [...block.matchAll(/<category[^>]*term="([^"]+)"/g)].map(
      x => x[1]
    )
    const comment = collapse(pick(block, 'arxiv:comment'))

    // 顺手抓 github 链接（摘要 / comment / link 里出现的）
    const ghMatch = `${abstract} ${comment} ${block}`.match(
      /https?:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+/
    )

    entries.push({
      arxiv_id: arxivId,
      title,
      abstract,
      authors: authors.join(', '),
      published,
      categories,
      comment,
      arxiv_url: `https://arxiv.org/abs/${arxivId}`,
      github_url: ghMatch ? ghMatch[0].replace(/[).,]+$/, '') : ''
    })
  }
  return entries
}

const withinDays = (publishedIso, days) => {
  const t = Date.parse(publishedIso)
  if (!Number.isFinite(t)) return true
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000
  return t >= cutoff
}

const sleep = ms => new Promise(r => setTimeout(r, ms))

// arXiv 对单 IP 限流较严，429/503 时退避重试
const fetchWithRetry = async (url, opts = {}, tries = 4) => {
  let lastErr
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, opts)
      if (res.ok) return res
      if (res.status === 429 || res.status === 503) {
        const wait = 3000 * (i + 1)
        console.error(
          `[vla-radar] arXiv ${res.status}, ${wait}ms 后重试 (${i + 1}/${tries})`
        )
        await sleep(wait)
        continue
      }
      return res
    } catch (err) {
      lastErr = err
      await sleep(2000 * (i + 1))
    }
  }
  if (lastErr) throw lastErr
  return fetch(url, opts)
}

const fetchKnownIds = async () => {
  try {
    const res = await fetch(`${SITE_URL}/api/vla-radar/list?ids_only=1`, {
      headers: { accept: 'application/json' }
    })
    if (!res.ok) return null
    const json = await res.json()
    if (Array.isArray(json?.ids)) return new Set(json.ids)
    return null
  } catch {
    return null
  }
}

const main = async () => {
  const res = await fetchWithRetry(ARXIV_API, {
    headers: { 'User-Agent': 'meowsu-vla-radar/1.0 (+https://www.meowsu.xyz)' }
  })
  if (!res.ok) {
    console.error(`[vla-radar] arXiv API 请求失败: ${res.status}`)
    process.exit(1)
  }
  const xml = await res.text()
  let papers = parseEntries(xml).filter(p => withinDays(p.published, DAYS))

  let dedupeNote = 'dedupe skipped'
  if (DEDUPE) {
    const known = await fetchKnownIds()
    if (known) {
      const before = papers.length
      papers = papers.filter(p => !known.has(p.arxiv_id))
      dedupeNote = `dedupe via API (${before} -> ${papers.length}, known=${known.size})`
    } else {
      dedupeNote =
        'dedupe API unavailable, kept all (ingest upsert is idempotent)'
    }
  }

  console.error(
    `[vla-radar] query matched ${papers.length} new paper(s) in last ${DAYS}d · ${dedupeNote}`
  )

  const output = JSON.stringify(papers, null, 2)
  if (OUT_FILE) {
    writeFileSync(OUT_FILE, output)
    console.error(`[vla-radar] wrote ${papers.length} paper(s) -> ${OUT_FILE}`)
  } else {
    process.stdout.write(output + '\n')
  }
}

main().catch(err => {
  console.error('[vla-radar] fatal:', err?.message || err)
  process.exit(1)
})
