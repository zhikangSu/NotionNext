import { createClient } from '@supabase/supabase-js'

// VLA Radar 论文存储：复用项目已有的 Supabase（与 contributionStore 同套 env）。
// 写入只在服务端用 service key；前端通过 /api/vla-radar/* 只读。
const TABLE = 'vla_papers'

let supabaseClient = null

// 容错处理常见误填：尾斜杠 / 多余路径 / 直接粘了 dashboard 链接
const getSupabaseUrl = () => {
  const raw = (
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    ''
  ).trim()
  if (!raw) return ''
  // dashboard 链接 -> 还原成项目 API 域名
  const dash = raw.match(/dashboard\/project\/([a-z0-9]+)/i)
  if (dash) return `https://${dash[1]}.supabase.co`
  // 其它情况只取 origin（去掉多余 path / 尾斜杠 / 空白）
  try {
    return new URL(raw).origin
  } catch {
    return raw.replace(/\/+$/, '')
  }
}

const getSupabaseKey = () =>
  process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || ''

export const isVlaStoreConfigured = () =>
  Boolean(getSupabaseUrl() && getSupabaseKey())

const getClient = () => {
  const url = getSupabaseUrl()
  const key = getSupabaseKey()
  if (!url || !key) return null
  if (supabaseClient) return supabaseClient
  supabaseClient = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false }
  })
  return supabaseClient
}

const asText = v =>
  typeof v === 'string' ? v.trim() : v == null ? '' : String(v)

// 把 arxiv id 归一：去掉 "arXiv:" 前缀和版本号（2506.01234v2 -> 2506.01234），
// 这样不同版本算同一篇，upsert 不会重复。
export const normalizeArxivId = value => {
  let id = asText(value)
  if (!id) return ''
  id = id.replace(/^arxiv:/i, '')
  const absMatch = id.match(/abs\/([^\s?]+)/i)
  if (absMatch) id = absMatch[1]
  id = id.replace(/v\d+$/i, '')
  return id.trim()
}

const normalizeTags = tags => {
  if (Array.isArray(tags)) {
    return tags
      .map(t => asText(t))
      .filter(Boolean)
      .slice(0, 12)
  }
  if (typeof tags === 'string') {
    return tags
      .split(/[,，]/)
      .map(t => t.trim())
      .filter(Boolean)
      .slice(0, 12)
  }
  return []
}

const normalizeEvidenceTable = figure => {
  const columns = Array.isArray(figure.columns)
    ? figure.columns
        .map(c => asText(c).slice(0, 80))
        .filter(Boolean)
        .slice(0, 8)
    : []
  if (!columns.length || !Array.isArray(figure.rows)) return null

  const rows = figure.rows
    .map(row => {
      if (Array.isArray(row)) {
        return columns.map((_, i) => asText(row[i]).slice(0, 120))
      }
      if (row && typeof row === 'object') {
        return columns.map(col => asText(row[col]).slice(0, 120))
      }
      return null
    })
    .filter(row => Array.isArray(row) && row.some(Boolean))
    .slice(0, 12)
  if (!rows.length) return null

  return {
    type: 'table',
    title: asText(figure.title || figure.name).slice(0, 100),
    caption: asText(figure.caption || figure.note).slice(0, 200),
    columns,
    rows
  }
}

// 关键图表证据：图片只存 http(s) 直链；表格存轻量结构化行列；最多 6 项。
const normalizeFigures = figures => {
  if (!Array.isArray(figures)) return []
  return figures
    .map(f => {
      if (!f || typeof f !== 'object') return null
      const type = asText(f.type).toLowerCase()
      if (type === 'table' || f.columns || f.rows) {
        return normalizeEvidenceTable(f)
      }
      const url = asText(f.url || f.src || f.image)
      if (!/^https?:\/\//i.test(url)) return null
      return {
        type: 'image',
        url,
        caption: asText(f.caption || f.title || f.alt).slice(0, 200)
      }
    })
    .filter(Boolean)
    .slice(0, 6)
}

// 结构化 diff:base / changes[] / baselines[] / benchmarks[{name,metric,before,after}] / risk
const normalizeDiff = d => {
  if (!d || typeof d !== 'object' || Array.isArray(d)) return {}
  const strArr = a =>
    Array.isArray(a)
      ? a
          .map(x => asText(x).slice(0, 200))
          .filter(Boolean)
          .slice(0, 8)
      : []
  const benchmarks = Array.isArray(d.benchmarks)
    ? d.benchmarks
        .map(b =>
          b && typeof b === 'object'
            ? {
                name: asText(b.name).slice(0, 60),
                metric: asText(b.metric).slice(0, 60),
                before: asText(b.before).slice(0, 40),
                after: asText(b.after).slice(0, 40)
              }
            : null
        )
        .filter(b => b && b.name)
        .slice(0, 6)
    : []
  const out = {
    base: asText(d.base).slice(0, 80),
    changes: strArr(d.changes),
    baselines: strArr(d.baselines),
    benchmarks,
    risk: asText(d.risk).slice(0, 300)
  }
  if (
    !out.base &&
    !out.changes.length &&
    !out.baselines.length &&
    !out.benchmarks.length &&
    !out.risk
  )
    return {}
  return out
}

// ===== 漏斗分诊字段（relevance / quality / tier / pain_points / code_status）=====
// 8 条 VLA 痛点的稳定 key（与 public/vla-radar/data/curated.js 的 PAIN_POINTS 对齐）
const PAIN_KEYS = new Set([
  'data', 'generalization', 'action', 'reasoning',
  'posttrain', 'efficiency', 'eval', 'safety'
])
const CODE_STATUSES = new Set([
  'unknown', 'none', 'promised', 'released', 'closed-source', 'stale-promise'
])

// 0–3 评分；没给(undefined/null/空/非数字) → null 表示「未评分」
const clampScore = v => {
  if (v == null || v === '') return null
  const n = Math.round(Number(v))
  if (!Number.isFinite(n)) return null
  return Math.min(Math.max(n, 0), 3)
}
const normalizePainPoints = a =>
  Array.isArray(a)
    ? [
        ...new Set(
          a.map(x => asText(x).toLowerCase()).filter(k => PAIN_KEYS.has(k))
        )
      ].slice(0, 8)
    : []
const normalizeCodeStatus = v => {
  const s = asText(v).toLowerCase()
  return CODE_STATUSES.has(s) ? s : 'unknown'
}
const clampTier = v => {
  const n = Math.round(Number(v))
  return Number.isFinite(n) ? Math.min(Math.max(n, 0), 2) : 1
}
// 进地图(Tier 2)：够强(rel3 & qual3) 且 够老(发表满 ~3 个月，proves out)——新秀先进雷达，靠手动/重判升级。
//   低×低(rel<=1 & qual<=1) → 0 仅档案 / 其余 → 1 雷达 / 未评分 → 1。
const monthsSince = published => {
  const t = Date.parse(published || '')
  if (Number.isNaN(t)) return 0 // 日期未知 → 当作新论文，不自动进地图
  return (Date.now() - t) / (1000 * 60 * 60 * 24 * 30.4)
}
const deriveTier = (relevance, quality, scored, published) => {
  if (!scored) return 1
  if (relevance >= 3 && quality >= 3 && monthsSince(published) >= 3) return 2
  if (relevance <= 1 && quality <= 1) return 0
  return 1
}

// 清洗用户搜索词里会破坏 PostgREST or() 过滤的字符
const sanitizeQuery = q =>
  asText(q)
    .replace(/[,()%*]/g, ' ')
    .trim()
    .slice(0, 80)

const toRow = paper => {
  if (!paper) return null
  const arxivId = normalizeArxivId(paper.arxiv_id || paper.arxivId || paper.id)
  if (!arxivId) return null
  const arxivUrl =
    asText(paper.arxiv_url || paper.arxivUrl) ||
    `https://arxiv.org/abs/${arxivId}`
  const published = asText(paper.published || paper.date)
  const relevance = clampScore(paper.relevance)
  const quality = clampScore(paper.quality)
  const scored = relevance != null && quality != null
  const tier =
    paper.tier != null
      ? clampTier(paper.tier)
      : deriveTier(relevance ?? 0, quality ?? 0, scored, published)
  return {
    arxiv_id: arxivId,
    title: asText(paper.title) || arxivId,
    authors: asText(paper.authors),
    published,
    abstract: asText(paper.abstract || paper.summary),
    problem: asText(paper.problem),
    method: asText(paper.method),
    delta: asText(paper.delta),
    evidence: asText(paper.evidence),
    idea_signal: asText(paper.idea_signal || paper.ideaSignal || paper.signal),
    tags: normalizeTags(paper.tags),
    arxiv_url: arxivUrl,
    github_url: asText(paper.github_url || paper.github || paper.code),
    project_url: asText(
      paper.project_url || paper.project || paper.projectPage
    ),
    figures: normalizeFigures(paper.figures),
    diff: normalizeDiff(paper.diff),
    // 漏斗分诊：相关度 / 质量 / 层级 / 命中痛点 / 一句话理由 / 雷达卡用一句话 / 代码状态
    relevance: relevance == null ? 0 : relevance,
    quality: quality == null ? 0 : quality,
    tier,
    pain_points: normalizePainPoints(paper.pain_points || paper.painPoints),
    triage_reason: asText(paper.triage_reason || paper.triageReason).slice(0, 400),
    headline: asText(paper.headline || paper.problem || paper.method).slice(0, 220),
    code_status: normalizeCodeStatus(paper.code_status || paper.codeStatus),
    code_checked_at: asText(paper.code_checked_at || paper.codeCheckedAt),
    // 任何一次入库都意味着分析已完成 → 清掉「待全文重析」队列标记
    deep_requested: false,
    updated_at: new Date().toISOString()
  }
}

export async function listPaperIds() {
  const client = getClient()
  if (!client) return []
  const { data, error } = await client
    .from(TABLE)
    .select('arxiv_id')
    .limit(8000)
  if (error) throw error
  return (data || []).map(r => r.arxiv_id).filter(Boolean)
}

export async function listPapers({ limit = 60, q = '', tag = '' } = {}) {
  const client = getClient()
  if (!client) return []
  const safeLimit = Math.min(Math.max(Number(limit) || 60, 1), 200)
  let query = client
    .from(TABLE)
    .select('*')
    .order('published', { ascending: false })
    .limit(safeLimit)

  const cleanQ = sanitizeQuery(q)
  if (cleanQ) {
    const like = `%${cleanQ}%`
    query = query.or(
      `title.ilike.${like},problem.ilike.${like},idea_signal.ilike.${like},abstract.ilike.${like}`
    )
  }
  const cleanTag = asText(tag)
  if (cleanTag) query = query.contains('tags', [cleanTag])

  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function getPaper(arxivId) {
  const client = getClient()
  if (!client) return null
  const id = normalizeArxivId(arxivId)
  if (!id) return null
  const { data, error } = await client
    .from(TABLE)
    .select('*')
    .eq('arxiv_id', id)
    .maybeSingle()
  if (error) throw error
  return data || null
}

// 可选「扩展列」：用户还没跑对应 ALTER 时，缺哪列就只去掉哪列再试（不误伤已存在的列）
const STRIPPABLE_COLS = new Set([
  'figures', 'diff', 'relevance', 'quality', 'tier',
  'pain_points', 'triage_reason', 'headline', 'code_status', 'code_checked_at'
])
// 从 PostgREST / Postgres 报错里抽出缺失的列名
const extractMissingCol = error => {
  if (!error) return null
  const code = String(error.code || '')
  if (code !== '42703' && code !== 'PGRST204') return null
  const msg = String(error.message || '')
  const m =
    msg.match(/'([a-z_]+)' column/i) ||        // PGRST204: 'relevance' column ...
    msg.match(/column "([a-z_]+)"/i) ||        // 42703: column "relevance" ...
    msg.match(/\.([a-z_]+) does not exist/i)   // 42703: vla_papers.relevance does not exist
  return m ? m[1] : null
}

export async function upsertPapers(papers) {
  const client = getClient()
  if (!client)
    throw new Error(
      'Supabase 未配置（缺少 SUPABASE_URL / SUPABASE_SECRET_KEY）'
    )
  let rows = (Array.isArray(papers) ? papers : [papers])
    .map(toRow)
    .filter(Boolean)
  if (!rows.length) return 0
  // 缺扩展列就逐个剥离重试（最多剥离 STRIPPABLE_COLS.size 次），避免整体失败
  for (let attempt = 0; attempt <= STRIPPABLE_COLS.size; attempt++) {
    const { error } = await client
      .from(TABLE)
      .upsert(rows, { onConflict: 'arxiv_id' })
    if (!error) return rows.length
    const col = extractMissingCol(error)
    if (!col || !STRIPPABLE_COLS.has(col)) throw error
    rows = rows.map(r => {
      const next = { ...r }
      delete next[col]
      return next
    })
  }
  return rows.length
}

// 漏斗策展闸门：只「局部更新」分诊列（tier/relevance/quality/...），不碰 problem/method/diff/figures 等解析。
// 用于回溯分诊、手动升级(tier=2)/降级。每项 {arxiv_id, tier?, relevance?, quality?, pain_points?, code_status?, headline?, triage_reason?, code_checked_at?}。
export async function setPaperTiers(items) {
  const client = getClient()
  if (!client)
    throw new Error('Supabase 未配置（缺少 SUPABASE_URL / SUPABASE_SECRET_KEY）')
  const list = (Array.isArray(items) ? items : [items]).filter(
    x => x && (x.arxiv_id || x.arxivId || x.id)
  )
  let updated = 0
  for (const it of list) {
    const id = normalizeArxivId(it.arxiv_id || it.arxivId || it.id)
    if (!id) continue
    const patch = {}
    if (it.tier != null) patch.tier = clampTier(it.tier)
    if (it.relevance != null) {
      const r = clampScore(it.relevance)
      if (r != null) patch.relevance = r
    }
    if (it.quality != null) {
      const q = clampScore(it.quality)
      if (q != null) patch.quality = q
    }
    if (it.pain_points != null || it.painPoints != null)
      patch.pain_points = normalizePainPoints(it.pain_points || it.painPoints)
    if (it.code_status != null || it.codeStatus != null)
      patch.code_status = normalizeCodeStatus(it.code_status || it.codeStatus)
    if (it.code_checked_at != null)
      patch.code_checked_at = asText(it.code_checked_at)
    if (it.headline != null) patch.headline = asText(it.headline).slice(0, 220)
    if (it.triage_reason != null)
      patch.triage_reason = asText(it.triage_reason).slice(0, 400)
    if (!Object.keys(patch).length) continue
    patch.updated_at = new Date().toISOString()
    const { error } = await client.from(TABLE).update(patch).eq('arxiv_id', id)
    if (error) throw error
    updated++
  }
  return updated
}

// 网页「全文重析」按钮：把某篇标记为待全文重析（只对已存在的论文生效，幂等）
export async function requestDeepAnalysis(arxivId) {
  const client = getClient()
  if (!client) return false
  const id = normalizeArxivId(arxivId)
  if (!id) return false
  const { data, error } = await client
    .from(TABLE)
    .update({ deep_requested: true })
    .eq('arxiv_id', id)
    .select('arxiv_id')
  if (error) throw error
  return Array.isArray(data) && data.length > 0
}

// drain 任务读取队列：所有待全文重析的论文
export async function listPendingDeep() {
  const client = getClient()
  if (!client) return []
  const { data, error } = await client
    .from(TABLE)
    .select('arxiv_id,title,arxiv_url')
    .eq('deep_requested', true)
    .limit(200)
  if (error) throw error
  return data || []
}
