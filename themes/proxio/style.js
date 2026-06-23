/* eslint-disable react/no-unknown-property */

/**
 * 此处样式只对当前主题生效
 * 此处不支持tailwindCSS的 @apply 语法
 *
 * Meowsu 游乐场设计系统：
 * - 配色取自星星吉祥物：宝蓝 / 粉 / 星星黄 / 奶油
 * - 贴纸式卡片（粗描边 + 实色投影）
 * - 圆润标题字体 + 微动效
 * @returns
 */
const Style = () => {
  return <style jsx global>{`
    /* ============ 设计变量 ============ */
    :root {
      --meow-blue: #3563e9;
      --meow-blue-deep: #2549c7;
      --meow-pink: #f2699c;
      --meow-pink-soft: #ffd8e6;
      --meow-yellow: #ffd43b;
      --meow-cream: #fff6e3;
      --meow-sky: #eaf2ff;
      --meow-sky-deep: #c9deff;
      --meow-red: #ef5a5a;
      --meow-ink: #1e2447;
      --meow-paper: #f7faff;
      --meow-navy: #0c1226;
      --meow-card-dark: #151d36;
      --meow-border-dark: rgba(255, 255, 255, 0.12);
    }

    /* ============ 底色与基础 ============ */
    body {
      background-color: var(--meow-paper);
    }
    .dark body {
      background-color: var(--meow-navy);
    }
    .dark\\:bg-dark:is(.dark *) {
      background-color: var(--meow-navy) !important;
    }

    #theme-proxio {
      color: var(--meow-ink);
    }
    .dark #theme-proxio {
      color: #e7ecff;
    }

    /* 圆润的标题字体：拉丁字符用 Baloo 2，中文回退到系统圆体/黑体 */
    #theme-proxio h1,
    #theme-proxio h2,
    #theme-proxio h3,
    #theme-proxio .font-display {
      font-family: 'Baloo 2', 'PingFang SC', 'Hiragino Sans GB',
        'Microsoft YaHei', sans-serif;
      letter-spacing: 0.01em;
    }

    ::selection {
      background: var(--meow-yellow);
      color: var(--meow-ink);
    }

    /* 细滚动条 */
    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    ::-webkit-scrollbar-track {
      background: transparent;
    }
    ::-webkit-scrollbar-thumb {
      background: var(--meow-sky-deep);
      border-radius: 8px;
    }
    .dark ::-webkit-scrollbar-thumb {
      background: #2a3558;
    }

    /* ============ 容器宽度（保留原主题断点） ============ */
    @media (min-width: 540px) {
      #theme-proxio .container { max-width: 540px; }
    }
    @media (min-width: 720px) {
      #theme-proxio .container { max-width: 720px; }
    }
    @media (min-width: 960px) {
      #theme-proxio .container { max-width: 960px; }
    }
    @media (min-width: 1140px) {
      #theme-proxio .container { max-width: 1140px; }
    }
    @media (min-width: 1536px) {
      #theme-proxio .container { max-width: 1140px; }
    }
    #theme-proxio .container {
      width: 100%;
      margin-right: auto;
      margin-left: auto;
      padding-right: 16px;
      padding-left: 16px;
    }

    /* ============ 贴纸式组件 ============ */
    /* 区块小徽章：自动带一颗小星星 */
    #theme-proxio .section-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 14px;
      border-radius: 9999px;
      border: 2px solid rgba(30, 36, 71, 0.12);
      background: #ffffff;
      font-weight: 700;
      font-size: 0.875rem;
      color: var(--meow-ink);
      box-shadow: 2px 2px 0 rgba(30, 36, 71, 0.08);
    }
    #theme-proxio .section-badge::before {
      content: '✦';
      color: var(--meow-yellow);
      -webkit-text-stroke: 1px rgba(30, 36, 71, 0.25);
    }
    .dark #theme-proxio .section-badge {
      background: var(--meow-card-dark);
      border-color: var(--meow-border-dark);
      color: #e7ecff;
      box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.4);
    }

    /* 贴纸卡片 */
    #theme-proxio .sticker-card {
      background: #ffffff;
      border: 2px solid var(--meow-ink);
      border-radius: 1.5rem;
      box-shadow: 5px 5px 0 rgba(30, 36, 71, 0.9);
      transition: transform 0.25s ease, box-shadow 0.25s ease;
    }
    #theme-proxio .sticker-card:hover {
      transform: translate(-3px, -3px);
      box-shadow: 9px 9px 0 rgba(53, 99, 233, 0.85);
    }
    .dark #theme-proxio .sticker-card {
      background: var(--meow-card-dark);
      border-color: var(--meow-border-dark);
      box-shadow: 5px 5px 0 rgba(0, 0, 0, 0.55);
    }
    .dark #theme-proxio .sticker-card:hover {
      box-shadow: 9px 9px 0 rgba(53, 99, 233, 0.5);
    }

    /* 贴纸按钮 */
    #theme-proxio .btn-meow,
    #theme-proxio .btn-meow-ghost {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px 26px;
      border-radius: 9999px;
      border: 2px solid var(--meow-ink);
      font-weight: 700;
      font-family: 'Baloo 2', 'PingFang SC', sans-serif;
      box-shadow: 4px 4px 0 rgba(30, 36, 71, 0.9);
      transition: transform 0.15s ease, box-shadow 0.15s ease,
        background-color 0.15s ease;
    }
    #theme-proxio .btn-meow {
      background: var(--meow-blue);
      color: #ffffff;
    }
    #theme-proxio .btn-meow:hover {
      background: var(--meow-blue-deep);
    }
    #theme-proxio .btn-meow-ghost {
      background: #ffffff;
      color: var(--meow-ink);
    }
    #theme-proxio .btn-meow-ghost:hover {
      background: var(--meow-sky);
    }
    #theme-proxio .btn-meow:hover,
    #theme-proxio .btn-meow-ghost:hover {
      transform: translate(-2px, -2px);
      box-shadow: 6px 6px 0 rgba(30, 36, 71, 0.9);
    }
    #theme-proxio .btn-meow:active,
    #theme-proxio .btn-meow-ghost:active {
      transform: translate(2px, 2px);
      box-shadow: 1px 1px 0 rgba(30, 36, 71, 0.9);
    }

    /* 首页 VLA Radar 宽按钮：用于 Hero 红框区域 */
    #theme-proxio .btn-meow-wide {
      display: inline-flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      width: min(100%, 560px);
      padding: 13px 18px;
      border-radius: 1.25rem;
      border: 2px solid var(--meow-ink);
      background: radial-gradient(
          circle at 8% 20%,
          rgba(255, 212, 59, 0.34),
          transparent 24%
        ),
        linear-gradient(
          135deg,
          #ffffff 0%,
          var(--meow-cream) 50%,
          var(--meow-sky) 100%
        );
      color: var(--meow-ink);
      font-family: 'Baloo 2', 'PingFang SC', sans-serif;
      box-shadow: 4px 4px 0 rgba(30, 36, 71, 0.9);
      transition: transform 0.15s ease, box-shadow 0.15s ease,
        background-color 0.15s ease;
    }
    #theme-proxio .btn-meow-wide:hover {
      transform: translate(-2px, -2px);
      box-shadow: 6px 6px 0 rgba(53, 99, 233, 0.86);
    }
    #theme-proxio .btn-meow-wide:active {
      transform: translate(2px, 2px);
      box-shadow: 1px 1px 0 rgba(30, 36, 71, 0.9);
    }
    #theme-proxio .btn-meow-wide-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 42px;
      height: 42px;
      flex: 0 0 42px;
      border-radius: 9999px;
      border: 2px solid var(--meow-ink);
      background: var(--meow-yellow);
      box-shadow: 2px 2px 0 rgba(30, 36, 71, 0.85);
      font-size: 1.2rem;
    }
    .dark #theme-proxio .btn-meow,
    .dark #theme-proxio .btn-meow-ghost {
      border-color: var(--meow-border-dark);
      box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.55);
    }
    .dark #theme-proxio .btn-meow-ghost {
      background: var(--meow-card-dark);
      color: #e7ecff;
    }
    .dark #theme-proxio .btn-meow-ghost:hover {
      background: #1d2747;
    }
    .dark #theme-proxio .btn-meow-wide {
      background: linear-gradient(135deg, var(--meow-card-dark), #1d2747);
      border-color: var(--meow-border-dark);
      color: #e7ecff;
      box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.55);
    }
    .dark #theme-proxio .btn-meow-wide-icon {
      border-color: var(--meow-border-dark);
    }

    /* 圆点背景纹理 */
    #theme-proxio .dot-bg {
      background-image: radial-gradient(
        rgba(53, 99, 233, 0.13) 1.5px,
        transparent 1.5px
      );
      background-size: 22px 22px;
    }
    .dark #theme-proxio .dot-bg {
      background-image: radial-gradient(
        rgba(122, 156, 255, 0.12) 1.5px,
        transparent 1.5px
      );
    }

    /* 英雄区天空渐变 */
    #theme-proxio .hero-sky {
      background: linear-gradient(
        180deg,
        var(--meow-sky) 0%,
        rgba(234, 242, 255, 0.45) 70%,
        var(--meow-paper) 100%
      );
    }
    .dark #theme-proxio .hero-sky {
      background: linear-gradient(
        180deg,
        #131c3d 0%,
        rgba(19, 28, 61, 0.4) 70%,
        var(--meow-navy) 100%
      );
    }

    /* ============ 动效 ============ */
    @media (prefers-reduced-motion: no-preference) {
      #theme-proxio .meow-float {
        animation: meowFloat 4.5s ease-in-out infinite;
      }
      #theme-proxio .meow-float-slow {
        animation: meowFloat 6.5s ease-in-out infinite;
      }
      #theme-proxio .meow-twinkle {
        animation: meowTwinkle 2.6s ease-in-out infinite;
      }
      #theme-proxio .meow-bounce {
        animation: meowBounce 1.6s ease-in-out infinite;
      }
      #theme-proxio .meow-wiggle:hover {
        animation: meowWiggle 0.5s ease-in-out;
      }
      #theme-proxio .meow-marquee {
        animation: meowMarquee 26s linear infinite;
      }
      #theme-proxio .meow-marquee-wrap:hover .meow-marquee {
        animation-play-state: paused;
      }
    }
    @keyframes meowFloat {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-12px); }
    }
    @keyframes meowTwinkle {
      0%, 100% { opacity: 1; transform: scale(1) rotate(0deg); }
      50% { opacity: 0.45; transform: scale(0.78) rotate(18deg); }
    }
    @keyframes meowBounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(6px); }
    }
    @keyframes meowWiggle {
      0%, 100% { transform: rotate(0deg); }
      25% { transform: rotate(-6deg); }
      75% { transform: rotate(6deg); }
    }
    @keyframes meowMarquee {
      from { transform: translateX(0); }
      to { transform: translateX(-50%); }
    }

    /* ============ 吸顶导航 ============ */
    #theme-proxio .sticky {
      position: fixed;
      z-index: 20;
      background-color: rgba(255, 255, 255, 0.82);
      transition-property: color, background-color, border-color, box-shadow,
        transform, -webkit-backdrop-filter;
      transition-property: color, background-color, border-color, box-shadow,
        transform, backdrop-filter;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
      transition-duration: 150ms;
      -webkit-backdrop-filter: blur(8px);
      backdrop-filter: blur(8px);
      box-shadow: inset 0 -2px 0 0 rgba(30, 36, 71, 0.08);
    }
    :is(.dark #theme-proxio .sticky) {
      background-color: rgba(12, 18, 38, 0.82);
      box-shadow: inset 0 -2px 0 0 rgba(255, 255, 255, 0.06);
    }
    #theme-proxio .sticky .navbar-logo {
      padding-top: 0.5rem;
      padding-bottom: 0.5rem;
    }
    #theme-proxio .sticky #navbarToggler span {
      background-color: var(--meow-ink);
    }
    :is(.dark #theme-proxio .sticky #navbarToggler span) {
      background-color: #ffffff;
    }
    #theme-proxio .sticky #navbarCollapse li > a {
      color: var(--meow-ink);
    }
    #theme-proxio .sticky #navbarCollapse li > a:hover {
      color: var(--meow-blue);
      opacity: 1;
    }
    #theme-proxio .sticky #navbarCollapse li > button {
      color: var(--meow-ink);
    }
    :is(.dark #theme-proxio .sticky #navbarCollapse li > a) {
      color: #ffffff;
    }
    :is(.dark #theme-proxio .sticky #navbarCollapse li > a:hover) {
      color: #8fb0ff;
    }
    :is(.dark #theme-proxio .sticky #navbarCollapse li > button) {
      color: #ffffff;
    }
    #navbarCollapse li .ud-menu-scroll.active {
      opacity: 0.7;
    }
    #theme-proxio .sticky #navbarCollapse li .ud-menu-scroll.active {
      color: var(--meow-blue);
      opacity: 1;
    }

    /* 移动端汉堡按钮三道杠 */
    .navbarTogglerActive > span:nth-child(1) {
      top: 7px;
      --tw-rotate: 45deg;
      transform: translate(var(--tw-translate-x), var(--tw-translate-y))
        rotate(var(--tw-rotate)) skewX(var(--tw-skew-x))
        skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x))
        scaleY(var(--tw-scale-y));
    }
    .navbarTogglerActive > span:nth-child(2) {
      opacity: 0;
    }
    .navbarTogglerActive > span:nth-child(3) {
      top: -8px;
      --tw-rotate: 135deg;
      transform: translate(var(--tw-translate-x), var(--tw-translate-y))
        rotate(var(--tw-rotate)) skewX(var(--tw-skew-x))
        skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x))
        scaleY(var(--tw-scale-y));
    }

    /* ============ 正文辅助色 ============ */
    .text-body-color {
      color: #5b6478;
    }
    .dark .text-body-color {
      color: #9aa6c5;
    }
    .text-body-secondary {
      color: #8899a8;
    }

    /* 文章页阅读体验 */
    #theme-proxio #article-wrapper {
      max-width: 50rem;
    }
    #theme-proxio #article-wrapper .notion {
      font-size: 1.05rem;
      line-height: 1.85;
    }

    /* ============ 轮播按钮（保留并换色） ============ */
    .common-carousel .swiper-button-next:after,
    .common-carousel .swiper-button-prev:after {
      display: none;
    }
    .common-carousel .swiper-button-next,
    .common-carousel .swiper-button-prev {
      position: static !important;
      margin: 0px;
      height: 3rem;
      width: 3rem;
      border-radius: 9999px;
      background-color: #ffffff;
      color: var(--meow-ink);
      border: 2px solid rgba(30, 36, 71, 0.15);
      transition-duration: 200ms;
      transition-timing-function: cubic-bezier(0, 0, 0.2, 1);
    }
    .common-carousel .swiper-button-next:hover,
    .common-carousel .swiper-button-prev:hover {
      background-color: var(--meow-blue);
      color: #ffffff;
    }
    :is(.dark .common-carousel .swiper-button-next),
    :is(.dark .common-carousel .swiper-button-prev) {
      background-color: var(--meow-card-dark);
      color: #ffffff;
      border-color: var(--meow-border-dark);
    }
    .common-carousel .swiper-button-next svg,
    .common-carousel .swiper-button-prev svg {
      height: auto;
      width: auto;
    }
  `}</style>
}

export { Style }
