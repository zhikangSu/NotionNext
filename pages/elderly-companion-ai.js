import BLOG from '@/blog.config'
import { siteConfig } from '@/lib/config'
import { fetchGlobalAllData } from '@/lib/db/SiteDataApi'
import { useEffect, useState } from 'react'

const PROJECT_PAGE_PATH = '/projects/elderly-companion-ai.html'
const DESKTOP_FRAME_HEIGHT = 6400
const COMPACT_FRAME_WIDTH = 760
const COMPACT_FRAME_HEIGHT = 8200

const ElderlyCompanionAiPage = () => {
  const [viewportWidth, setViewportWidth] = useState(null)

  useEffect(() => {
    const updateViewportWidth = () => {
      setViewportWidth(
        document.documentElement.clientWidth || window.innerWidth
      )
    }

    updateViewportWidth()
    window.addEventListener('resize', updateViewportWidth)

    return () => window.removeEventListener('resize', updateViewportWidth)
  }, [])

  const safeViewportWidth =
    typeof viewportWidth === 'number' ? viewportWidth : COMPACT_FRAME_WIDTH
  const isCompact = safeViewportWidth < COMPACT_FRAME_WIDTH
  const compactScale = isCompact ? safeViewportWidth / COMPACT_FRAME_WIDTH : 1
  const frameHeight = isCompact ? COMPACT_FRAME_HEIGHT : DESKTOP_FRAME_HEIGHT
  const wrapperHeight = Math.ceil(frameHeight * compactScale)

  return (
    <>
      <main className='overflow-hidden bg-[#f4efe3] pt-20 lg:pt-24'>
        <div
          className='relative overflow-hidden'
          style={{
            height: `${wrapperHeight}px`,
            width: isCompact ? `${safeViewportWidth}px` : '100%'
          }}
        >
          <iframe
            src={PROJECT_PAGE_PATH}
            title='老年陪伴 AI 项目说明'
            className='block border-0'
            scrolling='no'
            style={{
              height: `${frameHeight}px`,
              left: 0,
              position: 'absolute',
              top: 0,
              transform: isCompact ? `scale(${compactScale})` : undefined,
              transformOrigin: 'top left',
              width: isCompact ? `${COMPACT_FRAME_WIDTH}px` : '100%'
            }}
          />
        </div>
      </main>
      <style jsx global>{`
        #theme-proxio #footer-bottom {
          display: none;
        }

        body {
          overflow-x: hidden;
        }
      `}</style>
    </>
  )
}

export async function getStaticProps({ locale }) {
  const props = await fetchGlobalAllData({
    from: 'elderly-companion-ai',
    locale
  })

  props.post = {
    id: 'elderly-companion-ai',
    title: '老年陪伴 AI 项目说明',
    summary: 'A Multi-Agent Collaborative Companion AI for Older Adults',
    status: 'Published',
    type: 'Page',
    slug: 'elderly-companion-ai',
    pageCoverThumbnail: props.siteInfo?.pageCover || '/bg_image.jpg',
    tags: ['AI', 'Companion AI', 'Older Adults']
  }

  delete props.allPages

  return {
    props,
    revalidate: process.env.EXPORT
      ? undefined
      : siteConfig(
          'NEXT_REVALIDATE_SECOND',
          BLOG.NEXT_REVALIDATE_SECOND,
          props.NOTION_CONFIG
        )
  }
}

export default ElderlyCompanionAiPage
