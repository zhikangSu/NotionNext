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
    'Hi，我是一个程序员, Hi，我是一个打工人,Hi，我是一个干饭人,欢迎来到我的博客🎉'
}
