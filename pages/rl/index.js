import BLOG from '@/blog.config'
import { siteConfig } from '@/lib/config'
import { fetchGlobalAllData } from '@/lib/db/SiteDataApi'
import Head from 'next/head'

const APP_PATH = '/rl-microscope/index.html'
const DEFAULT_APP_PATH = `${APP_PATH}#/rl/q-learning`

const quickLinks = [
  { href: `${APP_PATH}#/rl/q-learning`, label: 'Q-learning' },
  { href: `${APP_PATH}#/rl/ppo`, label: 'PPO mini' },
  { href: `${APP_PATH}#/rl/value-iteration`, label: 'Value Iteration' },
  { href: `${APP_PATH}#/rl/reinforce`, label: 'REINFORCE' }
]

const RLPage = () => {
  return (
    <>
      <Head>
        <title>策略演化实验室 | RL Policy Lab</title>
        <meta
          name='description'
          content='交互式强化学习实验室：逐步查看 transition、TD target、advantage、PPO ratio 如何改变 Q 值、value、action probability 和 policy。'
        />
      </Head>

      <section className='rl-shell'>
        <div className='rl-header'>
          <div>
            <p className='rl-kicker'>RL Policy Lab</p>
            <h1>策略演化实验室</h1>
            <p className='rl-summary'>
              逐步拆开公式、数值代入、update event 和 policy before/after，看见强化学习策略如何一步步演化。
            </p>
          </div>

          <div className='rl-actions'>
            <a href={APP_PATH} target='_blank' rel='noreferrer'>
              全屏打开
            </a>
            {quickLinks.map(link => (
              <a key={link.href} href={link.href} target='_blank' rel='noreferrer'>
                {link.label}
              </a>
            ))}
          </div>
        </div>

        <div className='rl-frame-wrap'>
          <iframe
            src={DEFAULT_APP_PATH}
            title='RL Policy Lab'
            allow='clipboard-write'
            className='rl-frame'
          />
        </div>
      </section>

      <style jsx>{`
        .rl-shell {
          width: 100%;
          min-height: 100vh;
          padding: 104px 0 28px;
        }

        .rl-header {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          align-items: flex-end;
          margin: 0 auto 18px;
          max-width: 1440px;
          padding: 0 12px;
        }

        .rl-kicker {
          margin: 0 0 8px;
          color: #2563eb;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .rl-header h1 {
          margin: 0;
          color: #0f172a;
          font-size: clamp(30px, 5vw, 56px);
          font-weight: 800;
          line-height: 1;
        }

        :global(.dark) .rl-header h1 {
          color: #f8fafc;
        }

        .rl-summary {
          max-width: 760px;
          margin: 12px 0 0;
          color: #475569;
          font-size: 16px;
          line-height: 1.75;
        }

        :global(.dark) .rl-summary {
          color: #cbd5e1;
        }

        .rl-actions {
          display: flex;
          flex-wrap: wrap;
          justify-content: flex-end;
          gap: 8px;
          max-width: 520px;
        }

        .rl-actions a {
          border: 1px solid #cbd5e1;
          border-radius: 999px;
          color: #0f172a;
          background: rgba(255, 255, 255, 0.84);
          padding: 8px 12px;
          font-size: 13px;
          font-weight: 700;
          text-decoration: none;
          transition: border-color 0.18s ease, color 0.18s ease,
            background 0.18s ease;
        }

        .rl-actions a:hover {
          border-color: #2563eb;
          color: #1d4ed8;
          background: #eff6ff;
        }

        :global(.dark) .rl-actions a {
          border-color: #334155;
          color: #e2e8f0;
          background: rgba(15, 23, 42, 0.72);
        }

        :global(.dark) .rl-actions a:hover {
          border-color: #60a5fa;
          color: #bfdbfe;
          background: rgba(30, 41, 59, 0.9);
        }

        .rl-frame-wrap {
          max-width: 1440px;
          margin: 0 auto;
          padding: 0 12px;
        }

        .rl-frame {
          display: block;
          width: 100%;
          height: min(980px, calc(100vh - 148px));
          min-height: 760px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          background: #ffffff;
          box-shadow: 0 24px 80px rgba(15, 23, 42, 0.1);
        }

        @media (max-width: 900px) {
          .rl-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .rl-actions {
            justify-content: flex-start;
          }

          .rl-frame {
            height: 82vh;
            min-height: 680px;
          }
        }

        @media (max-width: 560px) {
          .rl-header,
          .rl-frame-wrap {
            padding: 0 4px;
          }

          .rl-actions a {
            flex: 1 1 auto;
            text-align: center;
          }

          .rl-frame {
            min-height: 620px;
          }
        }
      `}</style>
    </>
  )
}

export async function getStaticProps(req) {
  const props = await fetchGlobalAllData({ from: 'rl', locale: req?.locale })
  delete props.allPages

  props.post = {
    title: '策略演化实验室',
    summary:
      '交互式强化学习实验室：逐步查看 transition、TD target、advantage、PPO ratio 如何改变 policy。',
    slug: 'rl',
    type: 'Page',
    tags: ['RL', 'Reinforcement Learning', 'Visualization'],
    fullWidth: true
  }

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

export default RLPage
