import SmartLink from '@/components/SmartLink'

/**
 * 首页的 RL 实验室宣传区
 */
export const RLSpotlight = () => {
  return (
    <section className='py-14 lg:py-20'>
      <div className='container mx-auto'>
        <div className='sticker-card relative overflow-hidden px-8 py-10'>
          {/* 装饰 */}
          <span
            aria-hidden='true'
            className='meow-twinkle absolute right-6 top-5 select-none text-2xl'>
            ✨
          </span>
          <div className='flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between'>
            <div className='max-w-3xl'>
              <span className='section-badge mb-5'>🎮 强化学习交互实验</span>
              <h2 className='mb-5 mt-4 text-3xl font-bold text-dark dark:text-white sm:text-4xl md:text-[40px] md:leading-[1.2]'>
                RL Policy Lab：策略演化实验室
              </h2>
              <p className='max-w-2xl text-base leading-7 text-body-color'>
                逐步查看 transition、TD error、advantage 和 PPO
                clip，理解公式中的变量如何变成一次真实的 policy update。
              </p>
            </div>

            <div className='flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row'>
              <SmartLink href='/rl' className='btn-meow'>
                进入实验室
                <i className='fa-solid fa-arrow-right' />
              </SmartLink>
              <SmartLink
                href='/rl-microscope/index.html#/rl/q-learning'
                className='btn-meow-ghost'>
                直接看 Q-learning
              </SmartLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
