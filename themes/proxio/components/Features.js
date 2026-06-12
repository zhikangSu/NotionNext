import { siteConfig } from '@/lib/config'
import SmartLink from '@/components/SmartLink'
import LazyImage from '@/components/LazyImage'

// 图标气泡的配色轮换
const ICON_BUBBLES = [
  'bg-meow-sky text-meow-blue',
  'bg-meow-pink-soft text-meow-pink',
  'bg-meow-cream text-yellow-500'
]

/**
 * 我在做什么：三张贴纸卡
 * @returns
 */
export const Features = () => {
  const features = [1, 2, 3].map(i => ({
    iconClass: siteConfig(`PROXIO_FEATURE_${i}_ICON_CLASS`),
    iconImg: siteConfig(`PROXIO_FEATURE_${i}_ICON_IMG_URL`),
    title: siteConfig(`PROXIO_FEATURE_${i}_TITLE_1`),
    text: siteConfig(`PROXIO_FEATURE_${i}_TEXT_1`)
  }))

  return (
    <>
      {/* <!-- ====== Features Section Start --> */}
      <section className='pb-8 pt-20 lg:pb-[60px] lg:pt-[100px]'>
        <div className='container'>
          <div className='wow fadeInUp -mx-4 flex flex-wrap' data-wow-delay='.2s'>
            <div className='w-full px-4'>
              <div className='mx-auto mb-12 max-w-[600px] text-center lg:mb-[60px]'>
                <span className='section-badge'>
                  {siteConfig('PROXIO_FEATURE_TITLE')}
                </span>
                <h2 className='my-5 text-3xl font-bold text-dark dark:text-white sm:text-4xl md:text-[40px] md:leading-[1.2]'>
                  {siteConfig('PROXIO_FEATURE_TEXT_1')}
                </h2>
                <p className='text-base leading-7 text-body-color'>
                  {siteConfig('PROXIO_FEATURE_TEXT_2')}
                </p>
              </div>
            </div>
          </div>

          {/* 三张特性贴纸卡 */}
          <div className='-mx-4 flex flex-col gap-6 px-4 md:flex-row'>
            {features.map((f, index) => (
              <div key={index} className='sticker-card w-full p-7'>
                <div
                  className='wow fadeInUp group flex flex-col space-y-4'
                  data-wow-delay='.1s'>
                  <div
                    className={`meow-wiggle flex h-14 w-14 items-center justify-center rounded-2xl text-2xl ${ICON_BUBBLES[index % ICON_BUBBLES.length]}`}>
                    {f.iconImg ? (
                      <LazyImage src={f.iconImg} className='h-8 w-8' />
                    ) : (
                      <i className={f.iconClass}></i>
                    )}
                  </div>
                  <h4 className='text-xl font-bold text-dark dark:text-white'>
                    {f.title}
                  </h4>
                  <p className='leading-7 text-body-color'>{f.text}</p>
                </div>
              </div>
            ))}
          </div>

          {siteConfig('PROXIO_FEATURE_BUTTON_TEXT') && (
            <div className='mt-12 flex w-full items-center justify-center'>
              <SmartLink
                href={siteConfig('PROXIO_FEATURE_BUTTON_URL', '')}
                className='btn-meow'>
                {siteConfig('PROXIO_FEATURE_BUTTON_TEXT')}
                <i className='fa-solid fa-arrow-right'></i>
              </SmartLink>
            </div>
          )}
        </div>
      </section>
      {/* <!-- ====== Features Section End --> */}
    </>
  )
}
