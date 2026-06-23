/**
 * Personal site defaults.
 *
 * Keep site-specific values here so regular upstream syncs do not overwrite
 * blog.config.js and other upstream-managed defaults.
 */
module.exports = {
  NOTION_PAGE_ID:
    process.env.NOTION_PAGE_ID || '1fa4532b67f880dfb623d1ecd71af898',

  THEME: process.env.NEXT_PUBLIC_THEME || 'proxio',
  SINCE: process.env.NEXT_PUBLIC_SINCE || 2024,

  AUTHOR: process.env.NEXT_PUBLIC_AUTHOR || 'Meowsu',
  BIO:
    process.env.NEXT_PUBLIC_BIO ||
    'AI Native / Vibe Coding 练习者，记录用 AI 写代码、做产品和学习成长的过程。',
  LINK: process.env.NEXT_PUBLIC_LINK || 'https://www.meowsu.xyz/',
  KEYWORDS:
    process.env.NEXT_PUBLIC_KEYWORD ||
    'Meowsu, AI Native, Vibe Coding, AI 编程, Claude Code, 学习记录, 个人项目',
  BLOG_FAVICON: process.env.NEXT_PUBLIC_FAVICON || '/favicon.ico',

  // 字体：正文用 Noto Sans SC，标题用圆润的 Baloo 2（中文自动回退系统字体）
  FONT_STYLE: process.env.NEXT_PUBLIC_FONT_STYLE || 'font-sans',
  FONT_URL: [
    'https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&display=swap',
    'https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;700;800&display=swap'
  ],

  NOTION_HIDDEN_PAGE_IDS: [
    // Default NotionNext sample content that should stay out of the public site.
    '1fa4532b-67f8-81b9-a189-f22e7d3f4d17',
    '1fa4532b-67f8-8194-bd47-d466738812d4',
    '1fa4532b-67f8-81e5-87ff-f9d4b0223fea',
    '1fa4532b-67f8-8194-b874-dde8cf56eaa1'
  ],

  CONTACT_GITHUB:
    process.env.NEXT_PUBLIC_CONTACT_GITHUB || 'https://github.com/zhikangSu',
  CONTACT_BILIBILI:
    process.env.NEXT_PUBLIC_CONTACT_BILIBILI ||
    'https://space.bilibili.com/338768779?spm_id_from=333.1007.0.0',
  CONTACT_XIAOHONGSHU:
    process.env.NEXT_PUBLIC_CONTACT_XIAOHONGSHU ||
    'https://www.xiaohongshu.com/user/profile/604f49e8000000000100253c',

  GREETING_WORDS:
    process.env.NEXT_PUBLIC_GREETING_WORDS ||
    'Hi，我是 Meowsu, 一个 AI Native 的 Vibe Coder, 这里记录学习、实验和酷东西, 欢迎来到我的小站',

  PROXIO_WELCOME_TEXT: '👋 欢迎来到 Meowsu 的 AI 游乐场',

  // 英雄区吉祥物
  PROXIO_HERO_MASCOT_URL: '/images/personal/star-mascot-about.png',

  PROXIO_HERO_TITLE_1: '我是 Meowsu，一个专注 Vibe Coding 的 AI Native',
  PROXIO_HERO_TITLE_2:
    '这里记录我如何用 AI 学习、写代码、做项目，也会慢慢长出一些让人记住的交互体验。',
  PROXIO_HERO_BUTTON_1_TEXT: '看学习记录',
  PROXIO_HERO_BUTTON_1_URL: '/archive',
  PROXIO_HERO_BUTTON_2_TEXT: '看我的 GitHub',
  PROXIO_HERO_BUTTON_2_URL: 'https://github.com/zhikangSu',
  PROXIO_HERO_BUTTON_2_ICON: '/images/starter/github.svg',
  PROXIO_HERO_VLA_BUTTON_TEXT: 'VLA 发展雷达',
  PROXIO_HERO_VLA_BUTTON_DESC: '从 RT-1 到 π0.7：架构、数据、后训练与新论文追踪',
  PROXIO_HERO_VLA_BUTTON_URL: '/vla-radar/index.html',

  PROXIO_BLOG_TITLE: '学习记录',
  PROXIO_BLOG_TEXT_1: '最近的实验、笔记和项目进展',

  PROXIO_ABOUT_TEXT_1: 'AI Native / Vibe Coding Explorer',
  PROXIO_ABOUT_TEXT_2:
    '我正在把 AI 当作新的创作和工程伙伴，练习用自然语言驱动代码、产品和表达。这个网站会记录我的学习历程、工具实验、项目复盘，也会慢慢加入一些交互和视觉上的小惊喜。',
  PROXIO_ABOUT_KEY_1: '当前身份',
  PROXIO_ABOUT_VAL_1: 'AI Native',
  PROXIO_ABOUT_KEY_2: '关注方向',
  PROXIO_ABOUT_VAL_2: 'Vibe Coding',
  PROXIO_ABOUT_KEY_3: '记录主题',
  PROXIO_ABOUT_VAL_3: '学习 / 项目',
  PROXIO_ABOUT_KEY_4: '长期目标',
  PROXIO_ABOUT_VAL_4: '做酷东西',
  PROXIO_ABOUT_PHOTO_URL: '/images/personal/star-mascot-about-blue.png',

  PROXIO_BRANDS: [
    'AI Native',
    'Vibe Coding',
    'Claude Code',
    'Learning in Public',
    'Creative Coding',
    'Personal OS'
  ],

  PROXIO_CAREER_TITLE: '路径',
  PROXIO_CAREER_TEXT: '我正在把学习、实践和表达串成一条线',
  PROXIO_CAREERS: [
    {
      title: 'AI Native 学习者',
      bio: 'Now',
      text: '把 AI 当作默认工作流的一部分，持续整理搜索、学习、写作、编码和复盘的方法。'
    },
    {
      title: 'Vibe Coding 实践',
      bio: 'Current',
      text: '用自然语言、Agent 和代码一起推进想法，从小工具、自动化到可交互的网页实验。'
    },
    {
      title: '个人网站实验场',
      bio: 'Next',
      text: '把这个站做成可以被访问、体验、记住的个人入口，而不只是一个静态博客。'
    }
  ],

  PROXIO_FEATURE_TITLE: '我在做什么',
  PROXIO_FEATURE_TEXT_1: '把 AI 变成真实产出的能力',
  PROXIO_FEATURE_TEXT_2:
    '从学习记录、代码实验到交互作品，这里会慢慢沉淀我的方法和作品。',
  PROXIO_FEATURE_1_ICON_CLASS: 'fa-solid fa-brain',
  PROXIO_FEATURE_1_TITLE_1: 'AI Native 工作流',
  PROXIO_FEATURE_1_TEXT_1:
    '用 AI 参与搜索、规划、编码、调试和复盘，把想法快速推进到可运行。',
  PROXIO_FEATURE_2_ICON_CLASS: 'fa-solid fa-code',
  PROXIO_FEATURE_2_TITLE_1: 'Vibe Coding 实验',
  PROXIO_FEATURE_2_TEXT_1:
    '用自然语言和代码一起探索交互、工具和产品原型，关注体验和表达。',
  PROXIO_FEATURE_3_ICON_CLASS: 'fa-solid fa-wand-magic-sparkles',
  PROXIO_FEATURE_3_TITLE_1: '学习公开记录',
  PROXIO_FEATURE_3_TEXT_1:
    '把踩坑、笔记、项目迭代留下来，让自己和路过的人都能看见成长轨迹。',
  PROXIO_FEATURE_BUTTON_TEXT: '查看记录',
  PROXIO_FEATURE_BUTTON_URL: '/archive',

  PROXIO_TESTIMONIALS_ENABLE: false,
  PROXIO_FAQ_ENABLE: false,

  PROXIO_CTA_TITLE: '接下来',
  PROXIO_CTA_TITLE_2: '这里会持续加入更酷的交互',
  PROXIO_CTA_DESCRIPTION:
    '我会把 AI 编程、个人项目和学习路径整理成能被访问、体验、记住的东西。',
  PROXIO_CTA_BUTTON_TEXT: '了解我',
  PROXIO_CTA_BUTTON_URL: '/about',

  PROXIO_POST_REDIRECT_ENABLE: false,

  PROXIO_FOOTER_SLOGAN:
    '记录 AI Native 的学习、Vibe Coding 实验和一些正在成形的酷东西。',
  POWERED_BY_PREFIX: 'Built by',
  POWERED_BY_TEXT: 'Meowsu',
  POWERED_BY_URL: 'https://github.com/zhikangSu',
  PROXIO_FOOTER_LINKS: [
    {
      name: '找到我',
      menus: [
        { title: 'GitHub', href: 'https://github.com/zhikangSu' },
        {
          title: 'Bilibili',
          href: 'https://space.bilibili.com/338768779?spm_id_from=333.1007.0.0'
        },
        {
          title: '小红书',
          href: 'https://www.xiaohongshu.com/user/profile/604f49e8000000000100253c'
        }
      ]
    },
    {
      name: '站点',
      menus: [
        { title: '关于', href: '/about' },
        { title: '老年陪伴 AI', href: '/elderly-companion-ai' },
        { title: '归档', href: '/archive' },
        { title: '标签', href: '/tag' }
      ]
    }
  ]
}
