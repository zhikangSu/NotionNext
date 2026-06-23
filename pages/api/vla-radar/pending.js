import {
  listPendingDeep,
  isVlaStoreConfigured
} from '@/lib/server/vla-radar/store'

// 受 token 保护：第二个 Codex「drain」任务读取「待全文重析」队列。
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
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, message: 'Method Not Allowed' })
  }

  const expectedToken = process.env.VLA_RADAR_INGEST_TOKEN || ''
  if (!expectedToken) {
    return res
      .status(503)
      .json({ ok: false, message: '缺少 VLA_RADAR_INGEST_TOKEN' })
  }
  if (getTokenFromRequest(req) !== expectedToken) {
    return res.status(401).json({ ok: false, message: 'Unauthorized' })
  }
  if (!isVlaStoreConfigured()) {
    return res.status(503).json({ ok: false, message: 'Supabase 未配置' })
  }

  try {
    const papers = await listPendingDeep()
    return res.status(200).json({ ok: true, papers })
  } catch (error) {
    return res
      .status(500)
      .json({ ok: false, message: String(error?.message || error) })
  }
}
