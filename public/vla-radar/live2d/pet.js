/*
 * 全站 Live2D 桌宠（Cubism 4 / pixi-live2d-display）。单一实现，博客页和 vla-radar 静态页共用。
 * - 默认所有人看免费的 Mao；连点 5 下输密码 → /api/pet/unlock → cookie → /api/pet/model 解锁 snow_leopard。
 * - 可拖动（按住身体拖）、可缩放（拖右上角 ⤢ 或滚轮），位置/大小/换装/选哪只 都记进 localStorage。
 * - 雪豹：单击循环 35 个表情；左上角「≡」菜单 = 换装(独立常驻层) / 临时切回 Mao⇄雪豹 / 复位。
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
  // 雪豹的脸部/配件表情（去掉 change —— 换装改由独立常驻层处理）
  var FACE_EXPR = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'd', 'e',
    'ear2', 'ear3', 'erduoxiaoshi', 'eye1', 'eye3', 'f', 'g', 'h', 'i', 'j', 'k', 'l',
    'o', 'p', 'q', 'r', 's', 't', 'u', 'w', 'y', 'z']
  // change.exp3.json 里那套服饰参数 —— outfitB 打开时每帧强制写入，独立于表情
  var OUTFIT_PARAMS = [
    ['Param109', 0], ['Param110', 0], ['Param115', 0], ['Param114', 0], ['Param70', 30],
    ['Param61', 0], ['Param67', 30], ['Param103', 0], ['Param113', 1], ['Param105', 1],
    ['Param107', 1], ['Param108', 1], ['Param106', 1], ['Param112', 1], ['Param116', 9], ['Param118', 9]
  ]
  var LS = 'live2dPetState'
  var BASE_H = 330

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

      var state = { x: 10, y: null, scale: 1, outfitB: false, prefModel: 'leopard' }
      try { var saved = JSON.parse(localStorage.getItem(LS) || 'null'); if (saved && typeof saved.scale === 'number') state = Object.assign(state, saved) } catch (e) {}
      state.scale = clamp(state.scale || 1, 0.4, 2.2)

      var wrap = document.createElement('div')
      wrap.id = 'live2d-pet-wrap'
      wrap.style.cssText = 'position:fixed;z-index:40;touch-action:none;user-select:none'
      var canvas = document.createElement('canvas')
      canvas.style.cssText = 'display:block;width:100%;height:100%'
      wrap.appendChild(canvas)

      var grip = document.createElement('div')
      grip.title = '拖我缩放'
      grip.style.cssText = 'position:absolute;right:-2px;top:-2px;width:22px;height:22px;display:grid;place-items:center;cursor:nwse-resize;opacity:0;transition:opacity .15s;font-size:13px;color:#fff;background:rgba(30,36,71,.8);border-radius:50%'
      grip.textContent = '⤢'
      wrap.appendChild(grip)

      var menuBtn = document.createElement('div')
      menuBtn.title = '菜单'
      menuBtn.style.cssText = 'position:absolute;left:-2px;top:-2px;width:22px;height:22px;display:grid;place-items:center;cursor:url(/vla-radar/cursor/star-pointer.svg) 17 17,url(/vla-radar/cursor/star-pointer.png) 17 17,pointer;opacity:0;transition:opacity .15s;font-size:14px;color:#fff;background:rgba(30,36,71,.8);border-radius:50%'
      menuBtn.textContent = '≡'
      wrap.appendChild(menuBtn)
      var menu = document.createElement('div')
      menu.style.cssText = 'position:absolute;left:-2px;top:25px;display:none;flex-direction:column;gap:2px;background:rgba(20,24,48,.96);border:1px solid rgba(255,255,255,.15);border-radius:10px;padding:6px;min-width:148px;z-index:5;box-shadow:0 8px 22px rgba(0,0,0,.4)'
      wrap.appendChild(menu)

      wrap.addEventListener('mouseenter', function () { grip.style.opacity = '.85'; menuBtn.style.opacity = '.85' })
      wrap.addEventListener('mouseleave', function () { grip.style.opacity = '0'; menuBtn.style.opacity = '0' })
      document.body.appendChild(wrap)

      var app = new PIXI.Application({
        view: canvas, backgroundAlpha: 0, antialias: true, autoStart: true,
        resolution: Math.min(window.devicePixelRatio || 1, 2), autoDensity: true, width: 10, height: 10
      })

      var current = null, isLeopard = false, everUnlocked = false, faceIdx = 0, aspect = 0.78, natH = 2400
      var cursorX = window.innerWidth / 2, cursorY = window.innerHeight / 2, trackNx = 0, trackNy = 0

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
      function save() {
        try { localStorage.setItem(LS, JSON.stringify({ x: state.x, y: state.y, scale: state.scale, outfitB: state.outfitB, prefModel: state.prefModel })) } catch (e) {}
      }

      // 看向鼠标：以「脸」为原点算方向，覆写头/眼参数（盖过 Idle 对这些参数的晃动），
      // 比内置 focus() 更灵敏、方向更准。轻微平滑避免抖动。
      function applyTracking(cm) {
        var r = wrap.getBoundingClientRect()
        var hx = r.left + r.width / 2          // 脸的水平中心
        var hy = r.top + r.height * 0.22       // 脸大概在框的上部
        var nx = clamp((cursorX - hx) / (window.innerWidth * 0.4), -1, 1)
        var ny = clamp((cursorY - hy) / (window.innerHeight * 0.4), -1, 1)
        trackNx += (nx - trackNx) * 0.35
        trackNy += (ny - trackNy) * 0.35
        try {
          cm.setParameterValueById('ParamAngleX', trackNx * 30)
          cm.setParameterValueById('ParamAngleY', -trackNy * 30)
          cm.setParameterValueById('ParamEyeBallX', trackNx)
          cm.setParameterValueById('ParamEyeBallY', -trackNy)
          cm.setParameterValueById('ParamBodyAngleX', trackNx * 10)
        } catch (e) {}
      }
      // 换装：同样在 afterMotionUpdate 强制写入服饰参数，盖过 Idle 对这 10 个参数的动画（否则抽搐）。
      function applyOutfit(cm) {
        if (!state.outfitB || !cm) return
        for (var i = 0; i < OUTFIT_PARAMS.length; i++) {
          try { cm.setParameterValueById(OUTFIT_PARAMS[i][0], OUTFIT_PARAMS[i][1]) } catch (e) {}
        }
      }
      function hookModel(model) {
        try {
          var im = model.internalModel
          if (!im || im.__petHook) return
          im.on('afterMotionUpdate', function () {
            var cm = im.coreModel
            if (!cm || !cm.setParameterValueById) return
            applyTracking(cm)
            applyOutfit(cm)
          })
          im.__petHook = true
        } catch (e) {}
      }

      function show(source) {
        return PIXI.live2d.Live2DModel.from(source, { autoInteract: false }).then(function (model) {
          if (current) { try { app.stage.removeChild(current); current.destroy() } catch (e) {} }
          current = model
          model.scale.set(1)
          natH = model.height || 2400
          aspect = (model.width || 1) / (model.height || 1) || 0.78
          model.anchor.set(0.5, 1)
          app.stage.addChild(model)
          hookModel(model)
          applySize(); applyPos()
        }).catch(function () {})
      }
      function loadLeopard(forceShow) {
        return fetch('/api/pet/model', { credentials: 'same-origin' }).then(function (r) {
          if (!r.ok) return false
          return r.json().then(function (s) {
            everUnlocked = true
            if (state.prefModel === 'mao' && !forceShow) { renderMenu(); return true }
            return show(s).then(function () { isLeopard = true; renderMenu(); return true })
          })
        }).catch(function () { return false })
      }

      // ===== 菜单 =====
      function mkItem(label, fn) {
        var b = document.createElement('button')
        b.textContent = label
        b.style.cssText = 'all:unset;box-sizing:border-box;width:100%;cursor:pointer;color:#fff;font:600 13px/1.4 system-ui,-apple-system,sans-serif;padding:7px 10px;border-radius:7px;white-space:nowrap'
        b.addEventListener('mouseenter', function () { b.style.background = 'rgba(255,255,255,.13)' })
        b.addEventListener('mouseleave', function () { b.style.background = 'transparent' })
        b.addEventListener('click', function (ev) { ev.stopPropagation(); menu.style.display = 'none'; try { fn() } catch (e) {} })
        return b
      }
      function renderMenu() {
        menu.innerHTML = ''
        if (isLeopard) {
          menu.appendChild(mkItem(state.outfitB ? '👕 换回原装' : '👗 换上另一套', function () { state.outfitB = !state.outfitB; save(); renderMenu() }))
          menu.appendChild(mkItem('🐱 切回 Mao', function () { state.prefModel = 'mao'; save(); isLeopard = false; show(MAO).then(renderMenu) }))
        } else if (everUnlocked) {
          menu.appendChild(mkItem('🐆 切回雪豹', function () { state.prefModel = 'leopard'; save(); loadLeopard(true) }))
        }
        menu.appendChild(mkItem('↺ 复位位置/大小', function () { state.x = 10; state.y = null; state.scale = 1; applySize(); applyPos(); save() }))
      }
      menuBtn.addEventListener('click', function (ev) { ev.stopPropagation(); menu.style.display = (menu.style.display === 'none' ? 'flex' : 'none') })
      document.addEventListener('click', function (ev) { if (menu.style.display !== 'none' && !menu.contains(ev.target) && ev.target !== menuBtn) menu.style.display = 'none' })

      // 只记录鼠标位置；实际转头在 afterMotionUpdate 里直接驱动头/眼参数（见 hookModel）
      window.addEventListener('pointermove', function (e) { cursorX = e.clientX; cursorY = e.clientY })

      // ===== 拖动 / 缩放 / 点击 =====
      var dragging = false, resizing = false, sx = 0, sy = 0, ox = 0, oy = 0, startH = 0, moved = false
      var clicks = 0, ctimer = null
      function onTap() {
        if (isLeopard) { try { current.expression(FACE_EXPR[faceIdx++ % FACE_EXPR.length]) } catch (_) {} ; return }
        if (everUnlocked) return // 已解锁、临时在看 Mao —— 点身体不做事（切换走菜单）
        clicks++; clearTimeout(ctimer); ctimer = setTimeout(function () { clicks = 0 }, 2000)
        if (clicks >= 5) {
          clicks = 0
          var pw = window.prompt('桌宠密码（解锁隐藏形态）')
          if (!pw) return
          fetch('/api/pet/unlock', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify({ password: pw }) })
            .then(function (r) { if (r.ok) { state.prefModel = 'leopard'; save(); loadLeopard(true) } else window.alert('密码不对') }).catch(function () {})
        }
      }
      wrap.addEventListener('pointerdown', function (e) {
        if (e.target === menuBtn || menu.contains(e.target)) return // 菜单自己处理，不拖动
        moved = false
        if (e.target === grip) { resizing = true; startH = BASE_H * state.scale; sy = e.clientY }
        else { dragging = true; ox = state.x; oy = state.y; sx = e.clientX; sy = e.clientY }
        try { wrap.setPointerCapture(e.pointerId) } catch (_) {}
        e.preventDefault()
      })
      wrap.addEventListener('pointermove', function (e) {
        if (resizing) {
          var bottom = state.y + wrap.offsetHeight
          var nd = clamp(startH + (sy - e.clientY), 130, 720)
          state.scale = nd / BASE_H
          applySize()
          state.y = bottom - wrap.offsetHeight
          applyPos(); moved = true
        } else if (dragging) {
          state.x = ox + (e.clientX - sx); state.y = oy + (e.clientY - sy)
          if (Math.abs(e.clientX - sx) + Math.abs(e.clientY - sy) > 4) moved = true
          applyPos()
        }
      })
      function endDrag(e) {
        if (moved) save()
        else if (dragging) onTap()
        dragging = false; resizing = false
        try { wrap.releasePointerCapture(e.pointerId) } catch (_) {}
      }
      wrap.addEventListener('pointerup', endDrag)
      wrap.addEventListener('pointercancel', endDrag)
      wrap.addEventListener('wheel', function (e) {
        e.preventDefault()
        var bottom = state.y + wrap.offsetHeight
        state.scale = clamp(state.scale * (e.deltaY < 0 ? 1.08 : 1 / 1.08), 0.4, 2.2)
        applySize(); state.y = bottom - wrap.offsetHeight; applyPos(); save()
      }, { passive: false })

      window.addEventListener('resize', function () { applyPos() })

      renderMenu()
      show(MAO)
      loadLeopard() // 探测是否已解锁；prefModel=leopard 且已解锁则切到雪豹
    } catch (e) {}
  }

  var go = function () { loadSeq(CDN, 0, boot) }
  if (document.readyState === 'complete') setTimeout(go, 1200)
  else window.addEventListener('load', function () { setTimeout(go, 1200) })
})()
