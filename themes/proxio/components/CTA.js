/* eslint-disable @next/next/no-img-element */
import { siteConfig } from '@/lib/config'
import SmartLink from '@/components/SmartLink'

/**
 * CTA（Call To Action）：蓝色大贴纸卡 + 星星点缀
 **/
export const CTA = () => {
  const enable = siteConfig('PROXIO_CTA_ENABLE')
  if (!enable) {
    return null
  }
  return (
    <>
      {/* <!-- ====== CTA Section Start --> */}
      <section className='relative z-10 py-20 lg:py-[100px]'>
        <div className='container mx-auto'>
          <div
            className='wow fadeInUp relative overflow-hidden rounded-[2rem] border-2 border-meow-ink bg-gradient-to-br from-meow-blue to-blue-dark px-6 py-16 text-center shadow-[6px_6px_0_rgba(30,36,71,0.9)] dark:border-white/10 dark:shadow-[6px_6px_0_rgba(0,0,0,0.55)] sm:px-12'
            data-wow-delay='.2s'>
            {/* 装饰星星 */}
            <span
              aria-hidden='true'
              className='meow-twinkle absolute left-[6%] top-[18%] select-none text-3xl'>
              ⭐
            </span>
            <span
              aria-hidden='true'
              className='meow-twinkle absolute right-[8%] top-[30%] select-none text-2xl'
              style={{ animationDelay: '1s' }}>
              ✨
            </span>
            <span
              aria-hidden='true'
              className='meow-twinkle absolute bottom-[18%] left-[14%] select-none text-xl'
              style={{ animationDelay: '1.6s' }}>
              ✨
            </span>

            <div className='mx-auto max-w-[570px]'>
              <span className='section-badge'>
                {siteConfig('PROXIO_CTA_TITLE')}
              </span>
              <h2 className='mb-4 mt-5 text-3xl font-bold text-white md:text-[38px] md:leading-[1.4]'>
                {siteConfig('PROXIO_CTA_TITLE_2')}
              </h2>
              <p className='mx-auto mb-8 max-w-[515px] text-base leading-[1.7] text-white/85'>
                {siteConfig('PROXIO_CTA_DESCRIPTION')}
              </p>
              {siteConfig('PROXIO_CTA_BUTTON') && (
                <SmartLink
                  href={siteConfig('PROXIO_CTA_BUTTON_URL', '')}
                  className='btn-meow-ghost'>
                  {siteConfig('PROXIO_CTA_BUTTON_TEXT')}
                  <i className='fa-solid fa-arrow-right' />
                </SmartLink>
              )}
            </div>
          </div>
        </div>
      </section>
      {/* <!-- ====== CTA Section End --> */}
    </>
  )
}
