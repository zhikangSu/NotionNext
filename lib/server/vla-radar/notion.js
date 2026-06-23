// VLA Radar → Notion 存档镜像（best-effort）。
// 把每篇论文同步成 Notion「VLA Papers」库里的一行：属性 + 正文(问题/方法/相对变化/证据/idea) + 关键图表。
// 仅当配置了 NOTION_TOKEN + NOTION_VLA_DB_ID 时启用；任何失败都不影响主流程(网站入库)。
const NOTION_VERSION = '2022-06-28'
const API = 'https://api.notion.com/v1'

const getToken = () => process.env.NOTION_TOKEN || ''
const getDbId = () => process.env.NOTION_VLA_DB_ID || ''
export const isNotionConfigured = () => Boolean(getToken() && getDbId())

const headers = () => ({
  Authorization: `Bearer ${getToken()}`,
  'Notion-Version': NOTION_VERSION,
  'Content-Type': 'application/json'
})

const notionFetch = async (method, path, body) => {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: headers(),
    body: body ? JSON.stringify(body) : undefined
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(
      `Notion ${method} ${path} -> ${res.status}: ${json?.message || ''}`
    )
  }
  return json
}

const asText = v => (typeof v === 'string' ? v : v == null ? '' : String(v))
const clip = (s, n) => asText(s).slice(0, n)

const normalizeArxivId = value => {
  let id = asText(value).trim()
  if (!id) return ''
  id = id.replace(/^arxiv:/i, '')
  const m = id.match(/abs\/([^\s?]+)/i)
  if (m) id = m[1]
  return id.replace(/v\d+$/i, '').trim()
}

// ISO 周号 YYYY-Www
const isoWeek = dateStr => {
  const d = dateStr ? new Date(dateStr) : null
  if (!d || isNaN(d.getTime())) return ''
  const t = new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
  )
  const day = t.getUTCDay() || 7
  t.setUTCDate(t.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1))
  const week = Math.ceil(((t - yearStart) / 86400000 + 1) / 7)
  return `${t.getUTCFullYear()}-W${String(week).padStart(2, '0')}`
}

const richText = s => (asText(s) ? [{ text: { content: clip(s, 1900) } }] : [])
const urlProp = u =>
  /^https?:\/\//i.test(asText(u)) ? { url: u } : { url: null }

const buildProperties = (paper, { includeCuration }) => {
  const arxivId = normalizeArxivId(paper.arxiv_id)
  const week = isoWeek(paper.published)
  const tldr = clip(paper.problem || paper.idea_signal || paper.method, 180)
  const props = {
    Paper: {
      title: [{ text: { content: clip(paper.title || arxivId, 200) } }]
    },
    arxiv_id: { rich_text: richText(arxivId) },
    一句话: { rich_text: richText(tldr) },
    方向: {
      multi_select: (Array.isArray(paper.tags) ? paper.tags : [])
        .map(t => ({ name: clip(t, 90).replace(/,/g, ' ').trim() }))
        .filter(o => o.name)
        .slice(0, 8)
    },
    arXiv: urlProp(
      paper.arxiv_url || (arxivId ? `https://arxiv.org/abs/${arxivId}` : '')
    ),
    代码: urlProp(paper.github_url),
    项目页: urlProp(paper.project_url),
    周: week ? { select: { name: week } } : { select: null }
  }
  const pub = asText(paper.published).slice(0, 10)
  if (/^\d{4}-\d{2}-\d{2}$/.test(pub))
    props['发布日期'] = { date: { start: pub } }
  // 「精选」只在新建时给默认值，更新时不动，保留用户的人工筛选
  if (includeCuration) props['精选'] = { select: { name: '待筛选' } }
  return props
}

const heading = (icon, label) => ({
  object: 'block',
  type: 'heading_3',
  heading_3: { rich_text: [{ text: { content: `${icon} ${label}` } }] }
})
const paragraph = s => ({
  object: 'block',
  type: 'paragraph',
  paragraph: { rich_text: [{ text: { content: clip(s, 1900) } }] }
})
const imageBlock = f => ({
  object: 'block',
  type: 'image',
  image: {
    type: 'external',
    external: { url: f.url },
    caption: f.caption ? [{ text: { content: clip(f.caption, 1900) } }] : []
  }
})
const tableBlock = f => {
  const cols = (Array.isArray(f.columns) ? f.columns : [])
    .map(asText)
    .filter(Boolean)
    .slice(0, 8)
  if (!cols.length) return null
  const toRow = cells => ({
    object: 'block',
    type: 'table_row',
    table_row: {
      cells: cols.map((_, i) => [
        {
          type: 'text',
          text: { content: clip(asText((cells || [])[i]), 1900) }
        }
      ])
    }
  })
  const rawRows = Array.isArray(f.rows) ? f.rows : []
  const rows = rawRows
    .map(r =>
      Array.isArray(r)
        ? cols.map((_, i) => r[i])
        : r && typeof r === 'object'
          ? cols.map(c => r[c])
          : null
    )
    .filter(Boolean)
    .slice(0, 30)
  if (!rows.length) return null
  return {
    object: 'block',
    type: 'table',
    table: {
      table_width: cols.length,
      has_column_header: true,
      has_row_header: false,
      children: [toRow(cols), ...rows.map(toRow)]
    }
  }
}

const buildChildren = paper => {
  const blocks = []
  const sections = [
    ['🎯', '问题', paper.problem],
    ['🛠️', '方法', paper.method],
    ['📐', '相对变化', paper.delta],
    ['🔬', '证据', paper.evidence],
    ['💡', 'Idea 信号', paper.idea_signal]
  ]
  for (const [icon, label, val] of sections) {
    if (asText(val)) {
      blocks.push(heading(icon, label))
      blocks.push(paragraph(val))
    }
  }
  const figs = Array.isArray(paper.figures) ? paper.figures : []
  const images = figs.filter(f => f && f.type !== 'table' && asText(f.url))
  const tables = figs.filter(f => f && (f.type === 'table' || f.columns))
  if (images.length || tables.length) {
    blocks.push(heading('🖼️', '关键图表'))
    for (const f of images) blocks.push(imageBlock(f))
    for (const f of tables) {
      const t = tableBlock(f)
      if (t) {
        if (f.title) blocks.push(paragraph(`【表】${f.title}`))
        blocks.push(t)
        if (f.caption) blocks.push(paragraph(f.caption))
      }
    }
  }
  const arxivId = normalizeArxivId(paper.arxiv_id)
  if (arxivId) {
    blocks.push({
      object: 'block',
      type: 'paragraph',
      paragraph: {
        rich_text: [
          { text: { content: '由 meowsu.xyz VLA Radar 自动存档 · ' } },
          {
            text: {
              content: '详情页',
              link: {
                url: `https://www.meowsu.xyz/vla-radar/paper.html?id=${arxivId}`
              }
            }
          }
        ]
      }
    })
  }
  return blocks.slice(0, 95)
}

const findByArxivId = async arxivId => {
  const json = await notionFetch('POST', `/databases/${getDbId()}/query`, {
    filter: { property: 'arxiv_id', rich_text: { equals: arxivId } },
    page_size: 1
  })
  return json.results?.[0]?.id || null
}

const replaceChildren = async (pageId, children) => {
  const existing = await notionFetch(
    'GET',
    `/blocks/${pageId}/children?page_size=100`
  )
  for (const b of existing.results || []) {
    try {
      await notionFetch('PATCH', `/blocks/${b.id}`, { archived: true })
    } catch {
      /* best-effort */
    }
  }
  if (children.length) {
    await notionFetch('PATCH', `/blocks/${pageId}/children`, { children })
  }
}

export const upsertPaperToNotion = async paper => {
  if (!isNotionConfigured()) return { skipped: true }
  const arxivId = normalizeArxivId(paper.arxiv_id)
  if (!arxivId) return { skipped: true }
  const children = buildChildren(paper)
  const existingId = await findByArxivId(arxivId)
  if (existingId) {
    await notionFetch('PATCH', `/pages/${existingId}`, {
      icon: { type: 'emoji', emoji: '🤖' },
      properties: buildProperties(paper, { includeCuration: false })
    })
    await replaceChildren(existingId, children)
    return { updated: true, id: existingId }
  }
  const created = await notionFetch('POST', '/pages', {
    parent: { database_id: getDbId() },
    icon: { type: 'emoji', emoji: '🤖' },
    properties: buildProperties(paper, { includeCuration: true }),
    children
  })
  return { created: true, id: created.id }
}

export const mirrorPapersToNotion = async papers => {
  if (!isNotionConfigured()) return { skipped: true, ok: 0, fail: 0 }
  let ok = 0
  let fail = 0
  for (const p of Array.isArray(papers) ? papers : []) {
    try {
      await upsertPaperToNotion(p)
      ok++
    } catch (error) {
      fail++
      console.warn('[vla-notion] mirror failed:', error?.message || error)
    }
  }
  return { ok, fail }
}
