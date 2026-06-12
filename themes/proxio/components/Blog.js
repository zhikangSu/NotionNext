/* eslint-disable @next/next/no-img-element */
import LazyImage from '@/components/LazyImage'
import { siteConfig } from '@/lib/config'
import SmartLink from '@/components/SmartLink'

/**
 * 博文列表：贴纸卡片风格
 * @param {*} param0
 * @returns
 */
export const Blog = ({ posts }) => {
  const enable = siteConfig('PROXIO_BLOG_ENABLE')
  if (!enable) {
    return null
  }

  // 首页的 allNavPages 没有 publishDay 字段，用 publishDate 时间戳兜底
  const formatDate = item => {
    if (item?.publishDay) {
      return item.publishDay
    }
    if (item?.publishDate) {
      const d = new Date(item.publishDate)
      if (!isNaN(d.getTime())) {
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      }
    }
    return ''
  }

  return (
    <>
      {/* <!-- ====== Blog Section Start --> */}
      <section className='pt-20 lg:pt-[100px]'>
        <div className='container mx-auto'>
          {/* 区块标题文字 */}
          <div
            className='wow fadeInUp -mx-4 flex flex-wrap justify-center'
            data-wow-delay='.2s'>
            <div className='w-full px-4 py-4'>
              <div className='mx-auto max-w-[485px] space-y-4 text-center'>
                <span className='section-badge'>
                  {siteConfig('PROXIO_BLOG_TITLE')}
                </span>
                <h2 className='text-3xl font-bold text-dark dark:text-white sm:text-4xl md:text-[40px] md:leading-[1.2]'>
                  {siteConfig('PROXIO_BLOG_TEXT_1')}
                </h2>
              </div>
            </div>
          </div>

          {/* RL 实验室入口 */}
          <div className='px-4 pb-12'>
            <SmartLink
              href='/rl'
              className='sticker-card mx-auto flex max-w-[760px] flex-col items-center justify-between gap-5 px-7 py-6 text-center sm:flex-row sm:text-left'>
              <div>
                <span className='text-sm font-bold text-primary'>
                  🎮 强化学习交互实验
                </span>
                <h3 className='mt-2 text-xl font-bold text-dark dark:text-white'>
                  策略演化实验室
                </h3>
                <p className='mt-2 text-sm leading-7 text-body-color'>
                  把 Q-learning、PPO、REINFORCE 的更新过程放到同一个可交互页面里。
                </p>
              </div>
              <span className='btn-meow shrink-0 !px-5 !py-2.5 text-sm'>
                进入实验室
                <i className='fa-solid fa-arrow-right' />
              </span>
            </SmartLink>
          </div>

          {/* 博客列表 */}
          <div className='-mx-4 grid grid-cols-1 gap-y-10 md:grid-cols-2'>
            {posts?.map((item, index) => {
              return (
                <div key={index} className='w-full px-4'>
                  <SmartLink
                    href={item?.href}
                    className='wow fadeInUp sticker-card group block overflow-hidden'
                    data-wow-delay='.1s'>
                    {/* 封面 */}
                    <div className='relative aspect-[16/9] overflow-hidden bg-meow-sky dark:bg-meow-card'>
                      {item.pageCoverThumbnail ? (
                        <LazyImage
                          src={item.pageCoverThumbnail}
                          alt={item.title}
                          className='h-full w-full object-cover transition-transform duration-500 group-hover:scale-105'
                        />
                      ) : (
                        // 无封面时的星星占位
                        <div className='dot-bg flex h-full w-full items-center justify-center'>
                          <span className='meow-twinkle text-5xl'>⭐</span>
                        </div>
                      )}
                    </div>
                    {/* 内容部分 */}
                    <div className='space-y-3 p-6'>
                      <div className='flex flex-wrap items-center gap-2'>
                        {formatDate(item) && (
                          <span className='inline-flex items-center gap-1 rounded-full bg-meow-yellow px-3 py-0.5 text-xs font-bold text-meow-ink'>
                            <i className='fa-regular fa-calendar' />
                            {formatDate(item)}
                          </span>
                        )}
                        {item.category && (
                          <span className='inline-flex items-center rounded-full bg-meow-pink-soft px-3 py-0.5 text-xs font-bold text-meow-ink'>
                            {item.category}
                          </span>
                        )}
                      </div>
                      <h3 className='text-xl font-bold text-dark group-hover:text-primary dark:text-white dark:group-hover:text-meow-sky-deep sm:text-2xl lg:text-xl xl:text-2xl'>
                        {item.title}
                      </h3>
                      {item.summary && (
                        <p className='line-clamp-2 text-sm leading-7 text-body-color'>
                          {item.summary}
                        </p>
                      )}
                    </div>
                  </SmartLink>
                </div>
              )
            })}
          </div>
        </div>
      </section>
      {/* <!-- ====== Blog Section End --> */}
    </>
  )
}
