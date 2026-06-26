/*
 * 全站 Live2D 桌宠（Cubism 4 / pixi-live2d-display）。单一实现，博客页和 vla-radar 静态页共用。
 * - 默认所有人看免费的 Mao（/vla-radar/live2d/mao_pro）。
 * - 可拖动（按住身体拖）、可缩放（拖右上角把手 或 在它身上滚滚轮），位置/大小记进 localStorage。
 * - 跟随鼠标转头；点一下(没拖动)换表情；连点 5 下输密码 → /api/pet/unlock → cookie → /api/pet/model 解锁 snow_leopard，点它切 change 双形态。
 * - 运行时自托管(/vla-radar/live2d/lib)，避免被墙。懒加载、单例、手机/reduce-motion 跳过、全程 try/catch。
 */
(function () {
  if (window.__live2dPetStarted) return
  try {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (window.innerWidth < 760) return
  } catch (e) { return }
  window.__live2dPetStarted = true

  var CDN = [
    '/vla-radar/live2d/lib/live2dcubismcore.min.js',
    '/vla-radar/live2d/lib/pixi.min.js',
    '/vla-radar/live2d/lib/pixi-live2d-cubism4.min.js'
  ]
  var MAO = '/vla-radar/live2d/mao_pro/mao_pro.model3.json'
  var LEOPARD_EXPR = ['change', '0', '1', 'a', 'e']
  var LS = 'live2dPetState'
  var BASE_H = 330 // scale=1 时模型显示高度(px)

  function loadSeq(urls, i, done) {
    if (i >= urls.length) return done()
    var s = document.createElement('script')
    s.src = urls[i]; s.async = false
    s.onload = function () { loadSeq(urls, i + 1, done) }
    s.onerror = function () {}
    document.head.appendChild(s)
  }
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)) }

  function boot() {
    try {
      var PIXI = window.PIXI
      if (!PIXI || !PIXI.live2d || document.getElementById('live2d-pet-wrap')) return

      var state = { x: 10, y: null, scale: 1 }
      try { var saved = JSON.parse(localStorage.getItem(LS) || 'null'); if (saved && typeof saved.scale === 'number') state = saved } catch (e) {}
      state.scale = clamp(state.scale || 1, 0.4, 2.2)

      var wrap = document.createElement('div')
      wrap.id = 'live2d-pet-wrap'
      wrap.style.cssText = 'position:fixed;z-index:40;cursor:grab;touch-action:none;user-select:none'
      var canvas = document.createElement('canvas')
      canvas.style.cssText = 'display:block;width:100%;height:100%'
      wrap.appendChild(canvas)
      var grip = document.createElement('div')
      grip.title = '拖我缩放'
      grip.style.cssText = 'position:absolute;right:-2px;top:-2px;width:22px;height:22px;display:grid;place-items:center;cursor:nwse-resize;opacity:0;transition:opacity .15s;font-size:13px;color:#fff;background:rgba(30,36,71,.8);border-radius:50%'
      grip.textContent = '⤢'
      wrap.appendChild(grip)
      wrap.addEventListener('mouseenter', function () { grip.style.opacity = '.85' })
      wrap.addEventListener('mouseleave', function () { grip.style.opacity = '0' })
      document.body.appendChild(wrap)

      var app = new PIXI.Application({
        view: canvas, backgroundAlpha: 0, antialias: true, autoStart: true,
        resolution: Math.min(window.devicePixelRatio || 1, 2), autoDensity: true, width: 10, height: 10
      })

      var current = null, isLeopard = false, expIdx = 0, aspect = 0.78
      var natH = 2400

      function applySize() {
        var dispH = BASE_H * state.scale
        var w = Math.round(dispH * aspect), h = Math.round(dispH)
        wrap.style.width = w + 'px'; wrap.style.height = h + 'px'
        try { app.renderer.resize(w, h) } catch (e) {}
        if (current) { current.scale.set(dispH / natH); current.x = w / 2; current.y = h }
      }
      function applyPos() {
        var w = wrap.offsetWidth, h = wrap.offsetHeight
        if (state.y == null) state.y = window.innerHeight - h - 10
        state.x = clamp(state.x, -w * 0.35, window.innerWidth - w * 0.65)
        state.y = clamp(state.y, 0, window.innerHeight - h * 0.45)
        wrap.style.left = state.x + 'px'; wrap.style.top = state.y + 'px'
      }
      function save() { try { localStorage.setItem(LS, JSON.stringify(state)) } catch (e) {} }

      function show(source) {
        return PIXI.live2d.Live2DModel.from(source, { autoInteract: false }).then(function (model) {
          if (current) { try { app.stage.removeChild(current); current.destroy() } catch (e) {} }
          current = model
          model.scale.set(1)
          natH = model.height || 2400
          aspect = (model.width || 1) / (model.height || 1) || 0.78
          model.anchor.set(0.5, 1)
          app.stage.addChild(model)
          applySize(); applyPos()
        }).catch(function () {})
      }
      function loadLeopard() {
        return fetch('/api/pet/model', { credentials: 'same-origin' }).then(function (r) {
          if (!r.ok) return false
          return r.json().then(function (s) { return show(s).then(function () { isLeopard = true; return true }) })
        }).catch(function () { return false })
      }

      // 跟随鼠标转头（全局）
      window.addEventListener('pointermove', function (e) {
        try { if (current) { var r = wrap.getBoundingClientRect(); current.focus(e.clientX - r.left, e.clientY - r.top) } } catch (_) {}
      })

      // 拖动 / 缩放 / 点击
      var dragging = false, resizing = false, sx = 0, sy = 0, ox = 0, oy = 0, startH = 0, moved = false
      var clicks = 0, ctimer = null
      function onTap() {
        if (isLeopard) { try { current.expression(LEOPARD_EXPR[expIdx++ % LEOPARD_EXPR.length]) } catch (_) {} ; return }
        clicks++; clearTimeout(ctimer); ctimer = setTimeout(function () { clicks = 0 }, 2000)
        if (clicks >= 5) {
          clicks = 0
          var pw = window.prompt('桌宠密码（解锁隐藏形态）')
          if (!pw) return
          fetch('/api/pet/unlock', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify({ password: pw }) })
            .then(function (r) { if (r.ok) loadLeopard(); else window.alert('密码不对') }).catch(function () {})
        }
      }
      wrap.addEventListener('pointerdown', function (e) {
        moved = false
        if (e.target === grip) { resizing = true; startH = BASE_H * state.scale; sy = e.clientY }
        else { dragging = true; ox = state.x; oy = state.y; sx = e.clientX; sy = e.clientY; wrap.style.cursor = 'grabbing' }
        try { wrap.setPointerCapture(e.pointerId) } catch (_) {}
        e.preventDefault()
      })
      wrap.addEventListener('pointermove', function (e) {
        if (resizing) {
          var bottom = state.y + wrap.offsetHeight
          var nd = clamp(startH + (sy - e.clientY), 130, 720)
          state.scale = nd / BASE_H
          applySize()
          state.y = bottom - wrap.offsetHeight // 缩放时脚下不动
          applyPos(); moved = true
        } else if (dragging) {
          state.x = ox + (e.clientX - sx); state.y = oy + (e.clientY - sy)
          if (Math.abs(e.clientX - sx) + Math.abs(e.clientY - sy) > 4) moved = true
          applyPos()
        }
      })
      function endDrag(e) {
        if (moved) save()              // 拖过/缩放过 → 记住新位置/大小
        else if (dragging) onTap()     // 按身体但没拖 → 当作点击(换表情/解锁)
        dragging = false; resizing = false; wrap.style.cursor = 'grab'
        try { wrap.releasePointerCapture(e.pointerId) } catch (_) {}
      }
      wrap.addEventListener('pointerup', endDrag)
      wrap.addEventListener('pointercancel', endDrag)
      // 滚轮缩放（脚下不动）
      wrap.addEventListener('wheel', function (e) {
        e.preventDefault()
        var bottom = state.y + wrap.offsetHeight
        state.scale = clamp(state.scale * (e.deltaY < 0 ? 1.08 : 1 / 1.08), 0.4, 2.2)
        applySize(); state.y = bottom - wrap.offsetHeight; applyPos(); save()
      }, { passive: false })

      window.addEventListener('resize', function () { applyPos() })

      show(MAO)
      loadLeopard()
    } catch (e) {}
  }

  var go = function () { loadSeq(CDN, 0, boot) }
  if (document.readyState === 'complete') setTimeout(go, 1200)
  else window.addEventListener('load', function () { setTimeout(go, 1200) })
})()
