/*
 * VLA Radar 首页桌宠：Live2D「Mao」浮在星海角落，会呼吸/眨眼/跟随鼠标，点一下换表情。
 * 模型：Live2D Cubism 官方示例 Mao（© Live2D Inc.，Free Material License，非商用）。见 ./LICENSE-Live2D.md
 * 懒加载：window load 之后再拉 CDN 运行时，不挡首屏；手机端 / prefers-reduced-motion 不加载。
 */
(function () {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.innerWidth < 760) return;

  const MODEL = '/vla-radar/live2d/mao_pro/mao_pro.model3.json';
  const DEPS = [
    'https://cubism.live2d.com/sdk-web/cubismcore/live2dcubismcore.min.js',
    'https://cdn.jsdelivr.net/npm/pixi.js@6.5.10/dist/browser/pixi.min.js',
    'https://cdn.jsdelivr.net/npm/pixi-live2d-display@0.4.0/dist/cubism4.min.js'
  ];

  function loadSeq(urls, i, done) {
    if (i >= urls.length) return done();
    const s = document.createElement('script');
    s.src = urls[i]; s.async = false; // 保持顺序
    s.onload = () => loadSeq(urls, i + 1, done);
    s.onerror = () => { /* CDN 挂了就静默放弃，不影响页面 */ };
    document.head.appendChild(s);
  }

  function init() {
    if (!window.PIXI || !window.PIXI.live2d) return;
    const canvas = document.getElementById('live2d-pet');
    if (!canvas) return;
    const app = new PIXI.Application({
      view: canvas, resizeTo: window, backgroundAlpha: 0, antialias: true, autoStart: true,
      resolution: Math.min(window.devicePixelRatio || 1, 2), autoDensity: true // 按屏幕像素比渲染 → 视网膜屏不糊
    });
    PIXI.live2d.Live2DModel.from(MODEL, { autoInteract: false }).then(model => {
      app.stage.addChild(model);
      model.anchor.set(0.5, 1);
      let exp = 0;

      function place() {
        model.scale.set(1);
        const natH = model.height || 2400;
        const target = Math.min(window.innerHeight * 0.36, 300);
        model.scale.set(target / natH);
        model.x = model.width * 0.34;             // 从左下角探出小半身
        model.y = window.innerHeight + 18;
      }
      place();
      window.addEventListener('resize', place);

      // 跟随鼠标
      window.addEventListener('pointermove', e => { try { model.focus(e.clientX, e.clientY); } catch (_) {} });

      // 点到她身上 → 换个表情（canvas 是 pointer-events:none，所以这里自己判断命中范围）
      window.addEventListener('click', e => {
        const hw = model.width / 2;
        if (e.clientX >= model.x - hw && e.clientX <= model.x + hw && e.clientY >= model.y - model.height) {
          try { model.expression('exp_0' + ((exp++ % 8) + 1)); } catch (_) {}
        }
      });
    }).catch(() => {});
  }

  const go = () => loadSeq(DEPS, 0, init);
  if (document.readyState === 'complete') setTimeout(go, 900);
  else window.addEventListener('load', () => setTimeout(go, 900));
})();
