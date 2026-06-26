/*
 * 全站自定义光标（星海金辉·光晕星）+ 轻量星星拖尾。博客页和 vla-radar 静态页共用同一份。
 * - 光标：SVG 优先（Chrome/Edge/Firefox 矢量清晰），PNG 兜底（Safari），最后退回系统默认。
 * - 可点击元素用更亮更大的变体；文本输入保留 I 形。
 * - 拖尾：金色小火花划过渐隐；尊重「减少动态」、触屏不启用、小屏不启用。单例 + 全程 try/catch。
 */
(function () {
  if (window.__siteCursorStarted) return
  window.__siteCursorStarted = true
  var B = '/vla-radar/cursor/'

  try {
    var css =
      'html,body{cursor:url(' + B + 'star.svg) 16 16,url(' + B + 'star.png) 16 16,auto}' +
      'a,button,[role="button"],summary,label,select,input[type="checkbox"],input[type="radio"],' +
      'input[type="submit"],input[type="button"],.notion-link,.cursor-pointer{' +
      'cursor:url(' + B + 'star-pointer.svg) 17 17,url(' + B + 'star-pointer.png) 17 17,pointer}' +
      'input[type="text"],input[type="email"],input[type="password"],input[type="search"],' +
      'input[type="url"],input[type="number"],input[type="tel"],textarea,[contenteditable="true"]{cursor:text}'
    var st = document.createElement('style')
    st.appendChild(document.createTextNode(css))
    document.head.appendChild(st)
  } catch (e) {}

  try {
    var mm = window.matchMedia
    if ((mm && mm('(prefers-reduced-motion: reduce)').matches) ||
        (mm && mm('(pointer: coarse)').matches) ||
        window.innerWidth < 760) return

    var last = 0, lx = -99, ly = -99
    function spark(x, y) {
      var s = 3 + Math.random() * 3
      var d = document.createElement('div')
      d.style.cssText = 'position:fixed;left:' + (x - s / 2) + 'px;top:' + (y - s / 2) + 'px;width:' + s +
        'px;height:' + s + 'px;border-radius:50%;background:radial-gradient(circle,#fff3c4,#ffd43b 55%,rgba(255,212,59,0) 78%);' +
        'pointer-events:none;z-index:2147483646;opacity:.95;transition:opacity .6s ease,transform .6s ease;will-change:transform,opacity'
      document.body.appendChild(d)
      requestAnimationFrame(function () {
        d.style.opacity = '0'
        d.style.transform = 'translate(' + ((Math.random() - 0.5) * 10) + 'px,' + (10 + Math.random() * 8) + 'px) scale(.25)'
      })
      setTimeout(function () { if (d.parentNode) d.parentNode.removeChild(d) }, 640)
    }
    window.addEventListener('pointermove', function (e) {
      if (e.pointerType === 'touch') return
      var now = e.timeStamp, dx = e.clientX - lx, dy = e.clientY - ly
      if (now - last < 22 || dx * dx + dy * dy < 30) return
      last = now; lx = e.clientX; ly = e.clientY
      spark(e.clientX, e.clientY)
    }, { passive: true })
  } catch (e) {}
})()
