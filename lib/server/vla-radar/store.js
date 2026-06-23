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
  return {
    arxiv_id: arxivId,
    title: asText(paper.title) || arxivId,
    authors: asText(paper.authors),
    published: asText(paper.published || paper.date),
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

const isMissingColumn = (error, col) => {
  if (!error) return false
  const code = String(error.code || '')
  const msg = String(error.message || '').toLowerCase()
  return (
    code === '42703' ||
    code === 'PGRST204' ||
    (msg.includes('column') && msg.includes(col))
  )
}

export async function upsertPapers(papers) {
  const client = getClient()
  if (!client)
    throw new Error(
      'Supabase 未配置（缺少 SUPABASE_URL / SUPABASE_SECRET_KEY）'
    )
  const rows = (Array.isArray(papers) ? papers : [papers])
    .map(toRow)
    .filter(Boolean)
  if (!rows.length) return 0
  let { error } = await client
    .from(TABLE)
    .upsert(rows, { onConflict: 'arxiv_id' })
  // figures 列还没建（用户还没跑 ALTER）→ 去掉 figures 再试，避免整体失败
  if (error && isMissingColumn(error, 'figures')) {
    const stripped = rows.map(({ figures, ...rest }) => rest)
    ;({ error } = await client
      .from(TABLE)
      .upsert(stripped, { onConflict: 'arxiv_id' }))
  }
  if (error) throw error
  return rows.length
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
