import {
  upsertPapers,
  isVlaStoreConfigured
} from '@/lib/server/vla-radar/store'

// 受 token 保护的写入入口：定时 routine 分析完论文后 POST 到这里。
// 沿用 contribution-refresh.js 的 token 模式，Supabase 密钥只留在服务端。
const getTokenFromRequest = req => {
  const queryToken = Array.isArray(req.query?.token)
    ? req.query.token[0]
    : req.query?.token
  const authHeader = String(req.headers['authorization'] || '')
  const bearer = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
  const customHeader = req.headers['x-vla-ingest-token'] || ''
  return String(queryToken || bearer || customHeader || '')
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, message: 'Method Not Allowed' })
  }

  const expectedToken = process.env.VLA_RADAR_INGEST_TOKEN || ''
  if (!expectedToken) {
    return res.status(503).json({
      ok: false,
      message: 'Ingest 已禁用：缺少 VLA_RADAR_INGEST_TOKEN'
    })
  }

  if (getTokenFromRequest(req) !== expectedToken) {
    return res.status(401).json({ ok: false, message: 'Unauthorized' })
  }

  if (!isVlaStoreConfigured()) {
    return res.status(503).json({ ok: false, message: 'Supabase 未配置' })
  }

  try {
    const body =
      typeof req.body === 'string'
        ? JSON.parse(req.body || '{}')
        : req.body || {}
    const papers = Array.isArray(body.papers)
      ? body.papers
      : Array.isArray(body)
        ? body
        : []
    if (!papers.length) {
      return res.status(400).json({ ok: false, message: 'body.papers 为空' })
    }
    const upserted = await upsertPapers(papers)
    return res.status(200).json({ ok: true, upserted })
  } catch (error) {
    return res
      .status(400)
      .json({ ok: false, message: String(error?.message || error) })
  }
}
