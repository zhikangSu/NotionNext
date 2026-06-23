import {
  requestDeepAnalysis,
  isVlaStoreConfigured
} from '@/lib/server/vla-radar/store'

// 可选：点按钮后立即 POST 到 Codex 的 webhook trigger，秒级唤醒 Codex 去 drain 队列。
// 没配 CODEX_TRIGGER_URL 时自动退回「排队 + 每小时 drain」模式，功能不受影响。
async function fireCodexTrigger(id) {
  const url = process.env.CODEX_TRIGGER_URL
  if (!url) return false
  const secret = process.env.CODEX_TRIGGER_SECRET || ''
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 4000)
  try {
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(secret ? { Authorization: `Bearer ${secret}` } : {})
      },
      body: JSON.stringify({
        arxiv_id: id,
        reason: 'vla-radar deep analysis requested'
      }),
      signal: controller.signal
    })
    return resp.ok
  } catch {
    return false
  } finally {
    clearTimeout(timer)
  }
}

// 公开：网页「全文重析」按钮调用。标记入队 + 尝试立即唤醒 Codex。
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
    const triggered = await fireCodexTrigger(id)
    return res.status(200).json({ ok: true, queued: true, triggered })
  } catch (error) {
    return res
      .status(500)
      .json({ ok: false, message: String(error?.message || error) })
  }
}
