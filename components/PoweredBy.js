import { siteConfig } from '@/lib/config'

/**
 * 驱动版权
 * @returns
 */
export default function PoweredBy(props) {
  if (!siteConfig('POWERED_BY_ENABLE', true)) {
    return null
  }

  const prefix = siteConfig('POWERED_BY_PREFIX', 'Powered by')
  const text = siteConfig('POWERED_BY_TEXT', `NotionNext ${siteConfig('VERSION')}`)
  const url = siteConfig('POWERED_BY_URL', 'https://github.com/tangly1024/NotionNext')

  return (
    <div className={`inline text-sm font-serif ${props.className || ''}`}>
      {prefix && <span className='mr-1'>{prefix}</span>}
      {url ? (
        <a href={url} className='underline justify-start'>
          {text}
        </a>
      ) : (
        <span>{text}</span>
      )}
      .
    </div>
  )
}
