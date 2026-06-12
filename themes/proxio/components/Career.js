/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
import { siteConfig } from '@/lib/config'

// 时间线节点的颜色轮换
const DOT_COLORS = ['bg-meow-blue', 'bg-meow-pink', 'bg-meow-yellow']

/**
 * 首页的生涯/路径模块：彩色节点时间线
 */
export const Career = () => {
  const Careers = siteConfig('PROXIO_CAREERS')
  return (
    <>
      {/* <!-- ====== Career Section Start --> */}
      <section id='career' className='pb-12 pt-20 lg:pb-[70px] lg:pt-[100px]'>
        <div className='container'>
          <div className='wow fadeInUp' data-wow-delay='.2s'>
            {/* 标题板块 */}
            <div className='mb-12 max-w-[540px]'>
              <span className='section-badge'>
                {siteConfig('PROXIO_CAREER_TITLE')}
              </span>
              <h2 className='mt-5 text-3xl font-bold leading-relaxed text-dark dark:text-white'>
                {siteConfig('PROXIO_CAREER_TEXT')}
              </h2>
            </div>

            {/* 时间线 */}
            <div className='relative ml-3 border-l-2 border-dashed border-meow-ink/20 pl-8 dark:border-white/15'>
              {Careers?.map((item, index) => {
                return <CareerItem key={index} {...item} index={index} />
              })}
            </div>
          </div>
        </div>
      </section>
      {/* <!-- ====== Career Section End --> */}
    </>
  )
}

// 生涯内容
const CareerItem = ({ title, bio, text, index = 0 }) => {
  return (
    <div className='wow fadeInUp relative pb-10' data-wow-delay='.1s'>
      {/* 节点圆点 */}
      <span
        className={`absolute -left-[41px] top-1 h-5 w-5 rounded-full border-2 border-white shadow-md dark:border-meow-navy ${DOT_COLORS[index % DOT_COLORS.length]}`}
      />
      <div className='flex flex-col gap-2 md:flex-row md:items-baseline md:gap-6'>
        <h4 className='shrink-0 text-xl text-dark dark:text-white md:w-56'>
          <span className='font-bold'>{title}</span>
          {bio && (
            <span className='ml-3 rounded-full bg-meow-sky px-2.5 py-0.5 text-xs font-bold text-meow-blue dark:bg-meow-card dark:text-meow-sky-deep'>
              {bio}
            </span>
          )}
        </h4>
        <p className='leading-7 text-body-color'>{text}</p>
      </div>
    </div>
  )
}
