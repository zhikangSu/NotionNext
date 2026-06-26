import { useEffect } from 'react'

/**
 * 全站 Live2D 桌宠 —— 只负责把共用脚本注入博客页（NotionNext React 页面）。
 * 真正的逻辑都在 /vla-radar/live2d/pet.js（与 vla-radar 静态页共用同一份实现）。
 * 脚本自身单例 + 懒加载 + 全程 try/catch，渲染 null，绝不影响页面。
 */
export default function Live2DPet() {
  useEffect(() => {
    if (typeof window === 'undefined' || window.__live2dPetInjected) return
    window.__live2dPetInjected = true
    try {
      const s = document.createElement('script')
      s.src = '/vla-radar/live2d/pet.js?v=20260626e'
      s.async = true
      document.body.appendChild(s)
    } catch (e) {}
  }, [])
  return null
}
