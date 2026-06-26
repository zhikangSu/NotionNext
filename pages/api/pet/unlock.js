import crypto from 'crypto'

// 桌宠 snow_leopard 解锁：核对密码 → 给本设备种长效 cookie（记住设备 ~180 天）。
// 密码存 Vercel 环境变量 PET_PASSWORD。cookie 里放的是 sha256(密码)，不是明文。
const tokenOf = pw => crypto.createHash('sha256').update(String(pw)).digest('hex')

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false })
  const pw = process.env.PET_PASSWORD || ''
  if (!pw) return res.status(503).json({ ok: false, message: 'PET 未启用（缺 PET_PASSWORD）' })
  let body = {}
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}
  } catch (e) { body = {} }
  if (String(body.password || '') !== pw) {
    return res.status(401).json({ ok: false, message: '密码不对' })
  }
  res.setHeader(
    'Set-Cookie',
    `pet_auth=${tokenOf(pw)}; Path=/; Max-Age=${180 * 24 * 3600}; SameSite=Lax; HttpOnly`
  )
  return res.status(200).json({ ok: true })
}
