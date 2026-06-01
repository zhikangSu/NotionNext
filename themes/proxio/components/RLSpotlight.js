import SmartLink from '@/components/SmartLink'

export const RLSpotlight = () => {
  return (
    <section className='bg-white py-14 dark:bg-dark lg:py-20'>
      <div className='container mx-auto'>
        <div className='border-y border-gray-200 py-10 dark:border-[#333333]'>
          <div className='flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between'>
            <div className='max-w-3xl'>
              <span className='mb-5 inline-flex rounded-2xl border border-gray-200 px-3 py-0.5 text-sm font-medium text-dark dark:border-[#333333] dark:text-white'>
                强化学习交互实验
              </span>
              <h2 className='mb-5 text-3xl font-bold text-dark dark:text-white sm:text-4xl md:text-[40px] md:leading-[1.2]'>
                RL Policy Lab：策略演化实验室
              </h2>
              <p className='max-w-2xl text-base leading-7 text-body-color dark:text-dark-6'>
                逐步查看 transition、TD error、advantage 和 PPO clip，理解公式中的变量如何变成一次真实的 policy update。
              </p>
            </div>

            <div className='flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row'>
              <SmartLink
                href='/rl'
                className='inline-flex items-center justify-center rounded-2xl bg-dark px-7 py-[14px] text-center text-base font-medium text-white shadow-1 transition duration-300 ease-in-out hover:bg-primary dark:bg-white dark:text-dark dark:hover:bg-gray-2'>
                进入实验室
                <i className='fa-solid fa-arrow-right ml-3' />
              </SmartLink>
              <SmartLink
                href='/rl-microscope/index.html#/rl/q-learning'
                className='inline-flex items-center justify-center rounded-2xl border border-gray-300 px-7 py-[14px] text-center text-base font-medium text-dark transition duration-300 ease-in-out hover:bg-gray-100 dark:border-gray-600 dark:text-white dark:hover:bg-white dark:hover:text-black'>
                直接看 Q-learning
              </SmartLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
