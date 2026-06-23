import {
  listPapers,
  listPaperIds,
  isVlaStoreConfigured
} from '@/lib/server/vla-radar/store'

// 公开只读：daily 列表 + 去重用的 id 列表
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, message: 'Method Not Allowed' })
  }

  if (!isVlaStoreConfigured()) {
    // 还没接 Supabase 时优雅降级：返回空，前端会回退到内置示例
    return res
      .status(200)
      .json({ ok: true, configured: false, papers: [], ids: [] })
  }

  try {
    const idsOnly = String(req.query?.ids_only || '') === '1'
    if (idsOnly) {
      const ids = await listPaperIds()
      res.setHeader(
        'Cache-Control',
        'public, s-maxage=120, stale-while-revalidate=600'
      )
      return res.status(200).json({ ok: true, configured: true, ids })
    }

    const limit = Number(req.query?.limit) || 60
    const q = Array.isArray(req.query?.q) ? req.query.q[0] : req.query?.q || ''
    const tag = Array.isArray(req.query?.tag)
      ? req.query.tag[0]
      : req.query?.tag || ''
    const papers = await listPapers({ limit, q, tag })
    res.setHeader(
      'Cache-Control',
      'public, s-maxage=300, stale-while-revalidate=600'
    )
    return res.status(200).json({ ok: true, configured: true, papers })
  } catch (error) {
    return res
      .status(500)
      .json({ ok: false, message: String(error?.message || error) })
  }
}
