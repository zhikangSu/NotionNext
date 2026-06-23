import {
  requestDeepAnalysis,
  isVlaStoreConfigured
} from '@/lib/server/vla-radar/store'

// 公开：网页「全文重析」按钮调用。只对已存在的论文打一个待办标记（幂等），
// 真正的全文重析由第二个 Codex「drain」定时任务读取队列后完成。
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, message: 'Method Not Allowed' })
  }

  if (!isVlaStoreConfigured()) {
    return res.status(503).json({ ok: false, message: 'Supabase 未配置' })
  }

  try {
    const body =
      typeof req.body === 'string'
        ? JSON.parse(req.body || '{}')
        : req.body || {}
    const id =
      (Array.isArray(req.query?.id) ? req.query.id[0] : req.query?.id) ||
      body.id ||
      ''
    if (!id) {
      return res.status(400).json({ ok: false, message: '缺少 id' })
    }
    const queued = await requestDeepAnalysis(id)
    if (!queued) {
      return res
        .status(404)
        .json({ ok: false, queued: false, message: '该论文不在库中' })
    }
    return res.status(200).json({ ok: true, queued: true })
  } catch (error) {
    return res
      .status(500)
      .json({ ok: false, message: String(error?.message || error) })
  }
}
