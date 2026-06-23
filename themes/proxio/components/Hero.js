/* eslint-disable @next/next/no-img-element */
import LazyImage from '@/components/LazyImage'
import { siteConfig } from '@/lib/config'
import CONFIG from '../config'
import SmartLink from '@/components/SmartLink'

/**
 * 英雄区块：天空渐变 + 吉祥物贴纸卡 + 漂浮星星
 */
export const Hero = props => {
  const config = props?.NOTION_CONFIG || CONFIG
  const welcome = siteConfig('PROXIO_WELCOME_TEXT', '', config)
  const mascot = siteConfig(
    'PROXIO_HERO_MASCOT_URL',
    '/images/personal/star-mascot-about.png',
    config
  )
  const PROXIO_HERO_BUTTON_1_TEXT = siteConfig(
    'PROXIO_HERO_BUTTON_1_TEXT',
    null,
    config
  )
  const PROXIO_HERO_BUTTON_2_TEXT = siteConfig(
    'PROXIO_HERO_BUTTON_2_TEXT',
    null,
    config
  )
  const PROXIO_HERO_VLA_BUTTON_TEXT =
    siteConfig('PROXIO_HERO_VLA_BUTTON_TEXT', null, config) || 'VLA 发展雷达'
  const PROXIO_HERO_VLA_BUTTON_DESC =
    siteConfig('PROXIO_HERO_VLA_BUTTON_DESC', null, config) ||
    '从 RT-1 到 π0.7：架构、数据、后训练与新论文追踪'

  return (
    <>
      {/* <!-- ====== Hero Section Start --> */}
      <section
        id='home'
        className='hero-sky dot-bg relative overflow-hidden pb-16 pt-32 lg:pb-24 lg:pt-40'>
        {/* 漂浮装饰星星 */}
        <span
          aria-hidden='true'
          className='meow-twinkle absolute left-[8%] top-[18%] select-none text-3xl'>
          ⭐
        </span>
        <span
          aria-hidden='true'
          className='meow-twinkle absolute right-[12%] top-[14%] select-none text-2xl'
          style={{ animationDelay: '0.8s' }}>
          ✨
        </span>
        <span
          aria-hidden='true'
          className='meow-twinkle absolute bottom-[14%] left-[18%] select-none text-xl'
          style={{ animationDelay: '1.4s' }}>
          ⭐
        </span>
        <span
          aria-hidden='true'
          className='meow-twinkle absolute bottom-[24%] right-[22%] select-none text-2xl'
          style={{ animationDelay: '2s' }}>
          ✨
        </span>

        <div className='container'>
          <div className='flex flex-col-reverse items-center gap-12 lg:flex-row lg:justify-between'>
            {/* 左侧文字 */}
            <div
              className='wow fadeInUp max-w-[600px] text-center lg:text-left'
              data-wow-delay='.2s'>
              {welcome && <span className='section-badge mb-6'>{welcome}</span>}
              <h1 className='mb-6 mt-4 text-3xl font-extrabold leading-snug dark:text-white sm:text-4xl lg:text-5xl lg:leading-[1.25]'>
                {siteConfig('PROXIO_HERO_TITLE_1', null, config)}
              </h1>
              <p className='mx-auto mb-9 max-w-[520px] text-base text-body-color sm:text-lg sm:leading-[1.7] lg:mx-0'>
                {siteConfig('PROXIO_HERO_TITLE_2', null, config)}
              </p>
              {/* 按钮组 */}
              <ul className='flex flex-wrap items-center justify-center gap-4 lg:justify-start'>
                {PROXIO_HERO_BUTTON_1_TEXT && (
                  <li>
                    <SmartLink
                      href={siteConfig('PROXIO_HERO_BUTTON_1_URL', '', config)}
                      className='btn-meow'>
                      {PROXIO_HERO_BUTTON_1_TEXT}
                      <i className='fa-solid fa-arrow-right' />
                    </SmartLink>
                  </li>
                )}
                {PROXIO_HERO_BUTTON_2_TEXT && (
                  <li>
                    <SmartLink
                      href={siteConfig('PROXIO_HERO_BUTTON_2_URL', '', config)}
                      className='btn-meow-ghost'>
                      <i className='fa-brands fa-github text-lg' />
                      {PROXIO_HERO_BUTTON_2_TEXT}
                    </SmartLink>
                  </li>
                )}
                <li>
                  <SmartLink href='/rl' className='btn-meow-ghost'>
                    🎮 RL Policy Lab
                  </SmartLink>
                </li>
              </ul>

              {PROXIO_HERO_VLA_BUTTON_TEXT && (
                <div className='mt-5 flex justify-center lg:justify-start'>
                  <a
                    href={siteConfig(
                      'PROXIO_HERO_VLA_BUTTON_URL',
                      '/vla-radar/index.html',
                      config
                    ) || '/vla-radar/index.html'}
                    className='btn-meow-wide group'>
                    <span className='btn-meow-wide-icon'>🛰️</span>
                    <span className='min-w-0 flex-1 text-left'>
                      <span className='block text-base font-extrabold leading-none'>
                        {PROXIO_HERO_VLA_BUTTON_TEXT}
                      </span>
                      {PROXIO_HERO_VLA_BUTTON_DESC && (
                        <span className='mt-1 block text-xs font-bold opacity-70 sm:text-sm'>
                          {PROXIO_HERO_VLA_BUTTON_DESC}
                        </span>
                      )}
                    </span>
                    <i className='fa-solid fa-arrow-right transition-transform duration-200 group-hover:translate-x-1' />
                  </a>
                </div>
              )}
            </div>

            {/* 右侧吉祥物贴纸卡 */}
            <div className='wow fadeInUp relative shrink-0' data-wow-delay='.3s'>
              <div className='meow-float-slow relative'>
                <div className='sticker-card w-56 rotate-2 overflow-hidden sm:w-64 lg:w-80'>
                  <LazyImage
                    priority
                    src={mascot}
                    alt={siteConfig('AUTHOR')}
                    className='h-full w-full object-cover'
                  />
                </div>
                {/* 角标小贴纸 */}
                <span className='section-badge absolute -bottom-4 -left-6 -rotate-6'>
                  Vibe Coding
                </span>
                <span
                  aria-hidden='true'
                  className='meow-twinkle absolute -right-4 -top-5 select-none text-4xl'>
                  ⭐
                </span>
              </div>
            </div>
          </div>

          {/* 向下滚动提示 */}
          <div className='mt-16 hidden justify-center lg:flex'>
            <span
              aria-hidden='true'
              className='meow-bounce select-none text-2xl text-body-color'>
              ⌄
            </span>
          </div>
        </div>
      </section>
      {/* <!-- ====== Hero Section End --> */}
    </>
  )
}
