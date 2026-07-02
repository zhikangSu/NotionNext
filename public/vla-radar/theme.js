/*
 * 全站主题切换：星海版（默认）⇄ 简洁学术版（html.academic）。
 * - 往导航注入一个切换按钮；选择记进 localStorage('vlaTheme')。
 * - <head> 里另有一段内联引导脚本在首帧前挂类，防止“先星海后跳白”的闪烁。
 * - 切换时广播 'vla-theme-change'，供画连线的页面（如 arch.html）重绘取色。
 */
(function () {
  var KEY = 'vlaTheme';
  var root = document.documentElement;
  function isAca() { return root.classList.contains('academic'); }
  function label() { return isAca() ? '✨ 星海版' : '🎓 简洁版'; }
  function make() {
    var nav = document.querySelector('.nav-links');
    if (!nav || document.getElementById('themeToggle')) return;
    var b = document.createElement('button');
    b.id = 'themeToggle';
    b.className = 'theme-toggle';
    b.type = 'button';
    b.textContent = label();
    b.title = '切换 星海版 / 简洁学术版';
    b.addEventListener('click', function () {
      root.classList.toggle('academic');
      try { localStorage.setItem(KEY, isAca() ? 'academic' : 'cosmic'); } catch (e) {}
      b.textContent = label();
      try { window.dispatchEvent(new CustomEvent('vla-theme-change')); } catch (e) {}
    });
    nav.appendChild(b);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', make);
  else make();
})();
