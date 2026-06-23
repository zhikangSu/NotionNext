import { getPaper, isVlaStoreConfigured } from '@/lib/server/vla-radar/store'

// 公开只读：单篇论文完整分析（详情页用）
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, message: 'Method Not Allowed' })
  }

  const id = Array.isArray(req.query?.id)
    ? req.query.id[0]
    : req.query?.id || ''
  if (!id) {
    return res.status(400).json({ ok: false, message: '缺少 id 参数' })
  }

  if (!isVlaStoreConfigured()) {
    return res.status(200).json({ ok: true, configured: false, paper: null })
  }

  try {
    const paper = await getPaper(id)
    if (!paper) {
      return res
        .status(404)
        .json({ ok: false, configured: true, message: 'Not Found' })
    }
    res.setHeader(
      'Cache-Control',
      'public, s-maxage=300, stale-while-revalidate=600'
    )
    return res.status(200).json({ ok: true, configured: true, paper })
  } catch (error) {
    return res
      .status(500)
      .json({ ok: false, message: String(error?.message || error) })
  }
}
