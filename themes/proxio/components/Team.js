/* eslint-disable @next/next/no-img-element */
import { siteConfig } from '@/lib/config'
import LazyImage from '@/components/LazyImage'
import SmartLink from '@/components/SmartLink'

// 四宫格的柔和底色轮换
const KV_COLORS = [
  'bg-meow-sky',
  'bg-meow-pink-soft',
  'bg-meow-cream',
  'bg-meow-sky-deep'
]

/**
 * 关于我（作者介绍）
 * @returns
 */
export const Team = () => {
  const PROXIO_ABOUT_PHOTO_URL = siteConfig('PROXIO_ABOUT_PHOTO_URL')
  const AUTHOR = siteConfig('AUTHOR')

  return (
    <>
      {/* <!-- ====== Team Section Start --> */}
      <section id='team' className='overflow-hidden pb-12 pt-20 lg:pb-[90px] lg:pt-[100px]'>
        <div className='wow fadeInUp container mx-auto' data-wow-delay='.2s'>
          <div className='-mx-4 flex flex-col items-center justify-between gap-10 md:flex-row'>
            {/* 左边肖像贴纸卡 */}
            <div className='relative mx-6 shrink-0'>
              <div className='sticker-card w-72 -rotate-2 overflow-hidden sm:w-80'>
                <LazyImage
                  alt={AUTHOR}
                  src={PROXIO_ABOUT_PHOTO_URL}
                  className='h-full w-full object-cover'
                />
              </div>
              <span
                aria-hidden='true'
                className='meow-twinkle absolute -right-3 -top-4 select-none text-3xl'>
                ⭐
              </span>
            </div>

            {/* 右侧文字说明 */}
            <div className='mx-auto flex max-w-[485px] flex-col justify-between space-y-5 px-4'>
              <div>
                <span className='section-badge'>
                  {siteConfig('PROXIO_ABOUT_TITLE')}
                </span>
              </div>
              <h2 className='text-xl font-bold leading-[1.35] dark:text-white md:text-3xl'>
                {siteConfig('PROXIO_ABOUT_TEXT_1')}
              </h2>
              <p
                dangerouslySetInnerHTML={{
                  __html: siteConfig('PROXIO_ABOUT_TEXT_2')
                }}
                className='text-base leading-7 text-body-color'></p>
              {/* 数值四宫格：彩色小卡片 */}
              <div className='grid grid-cols-2 gap-4 pt-4'>
                <KeyVal index={0} k={siteConfig('PROXIO_ABOUT_KEY_1')} v={siteConfig('PROXIO_ABOUT_VAL_1')} />
                <KeyVal index={1} k={siteConfig('PROXIO_ABOUT_KEY_2')} v={siteConfig('PROXIO_ABOUT_VAL_2')} />
                <KeyVal index={2} k={siteConfig('PROXIO_ABOUT_KEY_3')} v={siteConfig('PROXIO_ABOUT_VAL_3')} />
                <KeyVal index={3} k={siteConfig('PROXIO_ABOUT_KEY_4')} v={siteConfig('PROXIO_ABOUT_VAL_4')} />
              </div>

              {siteConfig('PROXIO_ABOUT_BUTTON_TEXT') && (
                <div className='flex w-full justify-end py-2'>
                  <SmartLink
                    href={siteConfig('PROXIO_ABOUT_BUTTON_URL', '')}
                    className='btn-meow-ghost !px-5 !py-2.5 text-sm'>
                    {siteConfig('PROXIO_ABOUT_BUTTON_TEXT')}
                    <i className='fa-solid fa-arrow-right'></i>
                  </SmartLink>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      {/* <!-- ====== Team Section End --> */}
    </>
  )
}

// 显示一组键值对
const KeyVal = ({ k, v, index = 0 }) => {
  if (!k) {
    return null
  }
  return (
    <div
      className={`space-y-1 rounded-2xl border-2 border-meow-ink/10 p-4 dark:border-white/10 dark:bg-meow-card ${KV_COLORS[index % KV_COLORS.length]} dark:!bg-meow-card`}>
      <div className='text-sm font-medium text-meow-ink/70 dark:text-dark-6'>
        {k}
      </div>
      <div className='text-xl font-bold text-meow-ink dark:text-white sm:text-2xl'>
        {v}
      </div>
    </div>
  )
}
