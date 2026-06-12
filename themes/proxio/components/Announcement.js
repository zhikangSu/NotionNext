// import { useGlobal } from '@/lib/global'
import dynamic from 'next/dynamic'

const NotionPage = dynamic(() => import('@/components/NotionPage'))

/**
 * Magzine主题的公告
 */
const Announcement = ({ post, className }) => {
  //   const { locale } = useGlobal()
  if (post?.blockMap) {
    return (
      <div className={className}>
        <section
          id='announcement-wrapper'
          className='wow fadeInUp container mx-auto px-2'
          data-wow-delay='.2s'>
          {post && (
            <div className='sticker-card relative mx-auto max-w-[760px] px-6 py-6'>
              <span className='section-badge absolute -top-4 left-6 -rotate-3'>
                📢 公告
              </span>
              <div id='announcement-content' className='pt-4'>
                <NotionPage post={post} />
              </div>
            </div>
          )}
        </section>
      </div>
    )
  } else {
    return <></>
  }
}
export default Announcement
