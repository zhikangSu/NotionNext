/*
 * 全站 Live2D 桌宠（Cubism 4 / pixi-live2d-display）。单一实现，博客页和 vla-radar 静态页共用。
 * - 默认所有人看免费的 Mao（/vla-radar/live2d/mao_pro）。
 * - 在桌宠身上「快速连点 5 下」→ 输密码 → 服务端校验(/api/pet/unlock) → 种长效 cookie(记住本设备)
 *   → 加载付费 snow_leopard（/api/pet/model 返回 Supabase 私有桶的签名链接）。点雪豹切「change」双形态。
 * - 懒加载、单例、手机/reduce-motion 跳过、全程 try/catch：绝不影响页面。
 */
(function () {
  if (window.__live2dPetStarted) return
  try {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (window.innerWidth < 760) return
  } catch (e) { return }
  window.__live2dPetStarted = true

  var CDN = [
    'https://cubism.live2d.com/sdk-web/cubismcore/live2dcubismcore.min.js',
    'https://cdn.jsdelivr.net/npm/pixi.js@6.5.10/dist/browser/pixi.min.js',
    'https://cdn.jsdelivr.net/npm/pixi-live2d-display@0.4.0/dist/cubism4.min.js'
  ]
  var MAO = '/vla-radar/live2d/mao_pro/mao_pro.model3.json'
  var LEOPARD_EXPR = ['change', '0', '1', 'a', 'e']

  function loadSeq(urls, i, done) {
    if (i >= urls.length) return done()
    var s = document.createElement('script')
    s.src = urls[i]; s.async = false
    s.onload = function () { loadSeq(urls, i + 1, done) }
    s.onerror = function () {}
    document.head.appendChild(s)
  }

  function boot() {
    try {
      var PIXI = window.PIXI
      if (!PIXI || !PIXI.live2d || document.getElementById('live2d-pet')) return
      var canvas = document.createElement('canvas')
      canvas.id = 'live2d-pet'
      canvas.setAttribute('aria-hidden', 'true')
      canvas.style.cssText = 'position:fixed;left:0;bottom:0;width:100vw;height:100vh;z-index:40;pointer-events:none'
      document.body.appendChild(canvas)
      var app = new PIXI.Application({
        view: canvas, resizeTo: window, backgroundAlpha: 0, antialias: true, autoStart: true,
        resolution: Math.min(window.devicePixelRatio || 1, 2), autoDensity: true
      })

      var current = null, isLeopard = false, expIdx = 0

      function place(m) {
        try {
          m.scale.set(1)
          var natH = m.height || 2400
          m.scale.set(Math.min(window.innerHeight * 0.42, 340) / natH)
          m.x = m.width * 0.36
          m.y = window.innerHeight + 14
        } catch (e) {}
      }
      function show(source) {
        return PIXI.live2d.Live2DModel.from(source, { autoInteract: false }).then(function (model) {
          if (current) { try { app.stage.removeChild(current); current.destroy() } catch (e) {} }
          current = model
          model.anchor.set(0.5, 1)
          app.stage.addChild(model)
          place(model)
        }).catch(function () {})
      }
      function loadLeopard() {
        return fetch('/api/pet/model', { credentials: 'same-origin' }).then(function (r) {
          if (!r.ok) return false
          return r.json().then(function (settings) { return show(settings).then(function () { isLeopard = true; return true }) })
        }).catch(function () { return false })
      }

      window.addEventListener('resize', function () { if (current) place(current) })
      window.addEventListener('pointermove', function (e) { try { if (current) current.focus(e.clientX, e.clientY) } catch (_) {} })

      var clicks = 0, timer = null
      window.addEventListener('click', function (e) {
        if (!current) return
        var hit = false
        try {
          var hw = current.width / 2
          hit = e.clientX >= current.x - hw && e.clientX <= current.x + hw && e.clientY >= current.y - current.height
        } catch (_) {}
        if (!hit) return
        if (isLeopard) {
          try { current.expression(LEOPARD_EXPR[expIdx++ % LEOPARD_EXPR.length]) } catch (_) {}
          return
        }
        clicks++
        clearTimeout(timer)
        timer = setTimeout(function () { clicks = 0 }, 2000)
        if (clicks >= 5) {
          clicks = 0
          var pw = window.prompt('桌宠密码（解锁隐藏形态）')
          if (!pw) return
          fetch('/api/pet/unlock', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin', body: JSON.stringify({ password: pw })
          }).then(function (r) {
            if (r.ok) loadLeopard(); else window.alert('密码不对')
          }).catch(function () {})
        }
      })

      show(MAO)      // 默认 Mao
      loadLeopard()  // 本设备已记住(cookie)就直接换雪豹；403 静默留 Mao
    } catch (e) {}
  }

  var go = function () { loadSeq(CDN, 0, boot) }
  if (document.readyState === 'complete') setTimeout(go, 1200)
  else window.addEventListener('load', function () { setTimeout(go, 1200) })
})()
