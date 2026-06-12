/* eslint-disable @next/next/no-img-element */
/* eslint-disable @next/next/no-html-link-for-pages */
import LazyImage from '@/components/LazyImage'
import { siteConfig } from '@/lib/config'
import { useRouter } from 'next/router'

/**
 * 站点图标 + 标题
 * @returns
 */
export const Logo = props => {
  const { siteInfo, white } = props
  const router = useRouter()

  return (
    <div className='w-60 max-w-full px-4'>
      <div
        onClick={() => {
          router.push('/')
        }}
        className='navbar-logo group flex w-full cursor-pointer items-center py-5'>
        <LazyImage
          priority
          src={siteInfo?.icon}
          width={28}
          height={28}
          alt={siteConfig('AUTHOR')}
          className='meow-wiggle mr-2 hidden rounded-full md:inline-block'
        />
        {/* logo文字 */}
        <span
          className={`logo header-logo-text font-display whitespace-nowrap py-1.5 text-lg font-bold transition-colors duration-150 group-hover:text-primary ${
            white ? 'text-white' : 'text-meow-ink'
          } dark:text-white dark:group-hover:text-meow-sky-deep`}>
          {siteConfig('TITLE')}
        </span>
      </div>
    </div>
  )
}
