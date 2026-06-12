import AnalyticsBusuanzi from '@/components/AnalyticsBusuanzi'
import { BeiAnGongAn } from '@/components/BeiAnGongAn'
import BeiAnSite from '@/components/BeiAnSite'
import CopyRightDate from '@/components/CopyRightDate'
import DarkModeButton from '@/components/DarkModeButton'
import LazyImage from '@/components/LazyImage'
import PoweredBy from '@/components/PoweredBy'
import { siteConfig } from '@/lib/config'
import { resolveContactEmail } from '@/lib/plugins/mailEncrypt'
import { useGlobal } from '@/lib/global'
import SmartLink from '@/components/SmartLink'
import CONFIG from '../config'
import SocialButton from './SocialButton'

/**
 * 网页底脚
 */
export const Footer = ({ title }) => {
  const { siteInfo } = useGlobal()
  const PROXIO_FOOTER_LINKS = siteConfig('PROXIO_FOOTER_LINKS', [], CONFIG)
  const contactEmailDisplay = resolveContactEmail(siteConfig('CONTACT_EMAIL'))

  return (
    <footer
      id='footer-bottom'
      className='container relative z-10 m-auto w-full justify-center p-6'>
      <div className='max-w-screen-3xl mx-auto w-full rounded-t-[2rem] border-2 border-b-0 border-meow-ink/10 bg-white/60 px-8 backdrop-blur dark:border-white/10 dark:bg-meow-card/50'>
        {/* 信息与链接区块 */}
        <div className='flex w-full flex-col justify-between gap-10 py-14 lg:flex-row'>
          <div className='flex max-w-sm flex-col items-start gap-y-3 dark:text-gray-200'>
            <div className='flex items-center gap-x-2'>
              <LazyImage
                src={siteInfo?.icon}
                className='meow-wiggle rounded-full'
                width={28}
                alt={siteConfig('AUTHOR')}
              />
              <span className='font-display text-lg font-bold'>
                {siteConfig('AUTHOR')}
              </span>
              <span aria-hidden='true' className='meow-twinkle text-base select-none'>
                ⭐
              </span>
            </div>
            <div className='text-sm leading-7 text-body-color'>
              {siteConfig('DESCRIPTION')}
            </div>
            {contactEmailDisplay && (
              <div className='text-sm text-body-color'>{contactEmailDisplay}</div>
            )}
          </div>

          {/* 右侧链接区块 */}
          <div className='flex gap-x-16'>
            {PROXIO_FOOTER_LINKS?.map((group, index) => {
              return (
                <div key={index}>
                  <div className='pb-4 text-base font-bold dark:text-white'>
                    {group.name}
                  </div>
                  <div className='flex flex-col gap-y-2.5'>
                    {group?.menus?.map((menu, index) => {
                      return (
                        <div key={index}>
                          <SmartLink
                            href={menu.href}
                            className='text-sm text-body-color transition-colors duration-150 hover:text-primary dark:hover:text-meow-sky-deep'>
                            {menu.title}
                          </SmartLink>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* 页脚 */}
        <div className='flex flex-col items-center justify-between gap-4 border-t-2 border-dashed border-meow-ink/10 py-5 dark:border-white/10 dark:text-gray-200 lg:flex-row'>
          <div className='flex flex-wrap items-center justify-between gap-x-2 text-sm'>
            <CopyRightDate />
            <PoweredBy />
          </div>

          <DarkModeButton className='dark:text-white' />

          <div className='flex items-center justify-between gap-x-2'>
            <div className='flex items-center gap-x-4'>
              <AnalyticsBusuanzi />
              <SocialButton />
            </div>
          </div>
        </div>

        {/* 备案 */}
        <div className='flex w-full flex-wrap items-center justify-center gap-x-2 pb-4 text-center text-sm dark:text-gray-200'>
          <BeiAnSite />
          <BeiAnGongAn />
        </div>
      </div>
    </footer>
  )
}
