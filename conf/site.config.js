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
  BIO: process.env.NEXT_PUBLIC_BIO || '一个普通的干饭人🍚',
  LINK: process.env.NEXT_PUBLIC_LINK || 'https://www.meowsu.xyz/',
  KEYWORDS: process.env.NEXT_PUBLIC_KEYWORD || 'Notion, 博客',
  BLOG_FAVICON: process.env.NEXT_PUBLIC_FAVICON || '/favicon.ico',

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
    'Hi，我是一个程序员, Hi，我是一个打工人,Hi，我是一个干饭人,欢迎来到我的博客🎉',

  PROXIO_FOOTER_SLOGAN: '记录学习、技术折腾和普通生活。',
  PROXIO_ABOUT_PHOTO_URL: '/images/personal/star-mascot-about.png',
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
        { title: '归档', href: '/archive' },
        { title: '标签', href: '/tag' }
      ]
    }
  ]
}
