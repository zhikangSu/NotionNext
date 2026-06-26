import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

// 受 cookie 保护的桌宠模型入口：验过 pet_auth → 返回 snow_leopard 的 model3 设置，
// 其中所有文件引用都换成 Supabase 私有桶的「短时签名链接」。没 cookie = 403，文件永不外发。
const BUCKET = 'pet'
const DIR = 'snow_leopard'
const MODEL3 = 'Snow Leopard_Belongs_to_DG_STUDIO.model3.json'

const supabaseOrigin = () => {
  const raw = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim()
  try { return new URL(raw).origin } catch { return raw.replace(/\/+$/, '') }
}
const tokenOf = pw => crypto.createHash('sha256').update(String(pw)).digest('hex')
const getCookie = (req, name) => {
  const raw = String(req.headers.cookie || '')
  const m = raw.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]+)'))
  return m ? decodeURIComponent(m[1]) : ''
}

export default async function handler(req, res) {
  const pw = process.env.PET_PASSWORD || ''
  if (!pw) return res.status(503).json({ ok: false, message: 'PET 未启用' })
  if (getCookie(req, 'pet_auth') !== tokenOf(pw)) {
    return res.status(403).json({ ok: false, locked: true })
  }
  const url = supabaseOrigin()
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  if (!url || !key) return res.status(503).json({ ok: false, message: 'Supabase 未配置' })

  try {
    const sb = createClient(url, key, { auth: { persistSession: false } })
    const { data: blob, error } = await sb.storage.from(BUCKET).download(`${DIR}/${MODEL3}`)
    if (error) return res.status(500).json({ ok: false, message: error.message })
    const settings = JSON.parse(await blob.text())

    const TTL = 60 * 60 * 3 // 3 小时
    const sign = async rel => {
      const { data, error: e } = await sb.storage.from(BUCKET).createSignedUrl(`${DIR}/${rel}`, TTL)
      if (e) throw e
      return data.signedUrl
    }
    const fr = settings.FileReferences || {}
    if (fr.Moc) fr.Moc = await sign(fr.Moc)
    if (Array.isArray(fr.Textures)) fr.Textures = await Promise.all(fr.Textures.map(sign))
    if (fr.Physics) fr.Physics = await sign(fr.Physics)
    if (fr.DisplayInfo) fr.DisplayInfo = await sign(fr.DisplayInfo)
    if (fr.Pose) fr.Pose = await sign(fr.Pose)
    if (Array.isArray(fr.Expressions)) for (const ex of fr.Expressions) ex.File = await sign(ex.File)
    if (fr.Motions) for (const g of Object.keys(fr.Motions)) for (const mo of fr.Motions[g]) mo.File = await sign(mo.File)
    settings.url = '/api/pet/model' // base（所有引用已是绝对签名链接，base 不会被用到）

    res.setHeader('Cache-Control', 'private, no-store')
    return res.status(200).json(settings)
  } catch (e) {
    return res.status(500).json({ ok: false, message: String(e?.message || e) })
  }
}
