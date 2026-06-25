import { setPaperTiers, isVlaStoreConfigured } from '@/lib/server/vla-radar/store'

// 受 token 保护的「分诊列局部更新」入口（漏斗策展闸门）。
// 用于回溯分诊、手动升级(tier=2)/降级——只改 tier/relevance/quality/pain_points/...，不碰已有解析。
// 沿用 ingest.js 的 token 模式。
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
      message: 'set-tiers 已禁用：缺少 VLA_RADAR_INGEST_TOKEN'
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
    const items = Array.isArray(body.items)
      ? body.items
      : Array.isArray(body)
        ? body
        : []
    if (!items.length) {
      return res.status(400).json({ ok: false, message: 'body.items 为空' })
    }
    const updated = await setPaperTiers(items)
    return res.status(200).json({ ok: true, updated })
  } catch (error) {
    return res
      .status(400)
      .json({ ok: false, message: String(error?.message || error) })
  }
}
