/* eslint-disable @next/next/no-img-element */

import { siteConfig } from '@/lib/config'

// 关键词chip的配色轮换
const CHIP_STYLES = [
  'bg-meow-sky text-meow-ink',
  'bg-meow-pink-soft text-meow-ink',
  'bg-meow-cream text-meow-ink',
  'bg-meow-sky-deep text-meow-ink'
]

const CHIP_ICONS = ['⭐', '🛠️', '✨', '🎮', '📚', '🚀']

/**
 * 关键词跑马灯：把标签做成彩色小贴纸无限滚动
 * @returns
 */
export const Brand = () => {
  const brands = siteConfig('PROXIO_BRANDS', [])

  if (!brands || brands.length === 0) {
    return null
  }

  const Chip = ({ item, index }) => (
    <span
      className={`mx-3 inline-flex items-center gap-2 whitespace-nowrap rounded-full border-2 border-meow-ink/10 px-5 py-2 text-base font-bold dark:border-white/10 ${CHIP_STYLES[index % CHIP_STYLES.length]}`}>
      <span aria-hidden='true'>{CHIP_ICONS[index % CHIP_ICONS.length]}</span>
      {item}
    </span>
  )

  return (
    <>
      {/* <!-- ====== Brands Section Start --> */}
      <section id='brand' className='py-12'>
        <div className='meow-marquee-wrap container mx-auto overflow-hidden'>
          <div className='meow-marquee flex w-max items-center py-2'>
            {brands?.map((item, index) => (
              <Chip key={index} item={item} index={index} />
            ))}
            {/* 克隆一份内容，用于无缝滚动 */}
            {brands.map((item, index) => (
              <Chip key={`clone-${index}`} item={item} index={index} />
            ))}
          </div>
        </div>
      </section>
      {/* <!-- ====== Brands Section End --> */}
    </>
  )
}
