/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @next/next/no-img-element */

'use client'
import Loading from '@/components/Loading'
import NotionPage from '@/components/NotionPage'
import { siteConfig } from '@/lib/config'
import { isBrowser } from '@/lib/utils'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { Career } from './components/Career'
import { BackToTopButton } from './components/BackToTopButton'
import { Blog } from './components/Blog'
import { Brand } from './components/Brand'
import { FAQ } from './components/FAQ'
import { Features } from './components/Features'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { Pricing } from './components/Pricing'
import { RLSpotlight } from './components/RLSpotlight'
import { Team } from './components/Team'
import { Testimonials } from './components/Testimonials'
import CONFIG from './config'
import { Style } from './style'
// import { MadeWithButton } from './components/MadeWithButton'
import Comment from '@/components/Comment'
import replaceSearchResult from '@/components/Mark'
import ShareBar from '@/components/ShareBar'
import DashboardBody from '@/components/ui/dashboard/DashboardBody'
import DashboardHeader from '@/components/ui/dashboard/DashboardHeader'
import { useGlobal } from '@/lib/global'
import { loadWowJS } from '@/lib/plugins/wow'
import { SignIn, SignUp } from '@clerk/nextjs'
import SmartLink from '@/components/SmartLink'
import { ArticleLock } from './components/ArticleLock'
import { Banner } from './components/Banner'
import { CTA } from './components/CTA'
import SearchInput from './components/SearchInput'
import { SignInForm } from './components/SignInForm'
import { SignUpForm } from './components/SignUpForm'
import Lenis from '@/components/Lenis'
import Announcement from './components/Announcement'
import CursorDot from '@/components/CursorDot'
import LoadingCover from './components/LoadingCover'

/**
 * 布局框架
 * Landing-2 主题用作产品落地页展示
 * 结合Stripe或者lemonsqueezy插件可以成为saas支付订阅
 * https://play-tailwind.tailgrids.com/
 * @param {*} props
 * @returns
 */
const LayoutBase = props => {
    const { children } = props

    // 加载wow动画
    useEffect(() => {
        loadWowJS()
    }, [])

    return (
        <div
            id='theme-proxio'
            className={`${siteConfig('FONT_STYLE')} min-h-screen flex flex-col dark:bg-dark scroll-smooth`}>
            <Style />
            {/* 页头 */}
            <Header {...props} />

            <div id='main-wrapper' className='grow'>
                {children}
            </div>

            {/* 页脚 */}
            <Footer {...props} />

            {/* 悬浮按钮 */}
            <BackToTopButton />

            {/* 鼠标阻尼动画 */}
            <Lenis />
            {/* 鼠标跟随动画 */}
            <CursorDot />
            {/* <MadeWithButton/> */}
        </div>
    )
}

/**
 * 首页布局
 * @param {*} props
 * @returns
 */
const LayoutIndex = props => {
    const count = siteConfig('PROXIO_BLOG_COUNT', 4, CONFIG)
    const { locale } = useGlobal()
    const posts = props?.allNavPages ? props.allNavPages.slice(0, count) : []
    return (
        <>
            {/* 英雄区 */}
            {siteConfig('PROXIO_HERO_ENABLE', true, CONFIG) && <Hero {...props} />}
            <RLSpotlight />
            {/* 博文列表 */}
            {siteConfig('PROXIO_BLOG_ENABLE', true, CONFIG) && (
                <>
                    <Blog posts={posts} />
                    {/* 更多文章按钮 */}
                    <div className='container mx-auto mb-4 mt-10 flex justify-center'>
                        <SmartLink className='btn-meow-ghost' href={'/archive'}>
                            <span>{locale.COMMON.MORE}</span>
                            <i className='fas fa-arrow-right' />
                        </SmartLink>
                    </div>
                </>
            )}

            {/* 公告 */}
            {siteConfig('PROXIO_ANNOUNCEMENT_ENABLE', true, CONFIG) && <Announcement
                post={props?.notice}
                className={
                    'announncement text-center py-16'
                } />
                }

            {/* 团队介绍 */}
            {siteConfig('PROXIO_ABOUT_ENABLE', true, CONFIG) && <Team />}

            {/* 合作伙伴 */}
            {siteConfig('PROXIO_BRANDS_ENABLE', true, CONFIG) && <Brand />}


            {/* 生涯 */}
            {siteConfig('PROXIO_CAREER_ENABLE', true, CONFIG) && <Career />}

            {/* 产品特性 */}
            {siteConfig('PROXIO_FEATURE_ENABLE', true, CONFIG) && <Features />}

            {/* 评价展示 */}
            {siteConfig('PROXIO_TESTIMONIALS_ENABLE', true, CONFIG) && (
                <Testimonials />
            )}
            {/* 常见问题 */}
            {siteConfig('PROXIO_FAQ_ENABLE', true, CONFIG) && <FAQ />}


            {/* 行动呼吁 */}
            {siteConfig('PROXIO_CTA_ENABLE', true, CONFIG) && <CTA />}

            {siteConfig('PROXIO_WELCOME_COVER_ENABLE', false, CONFIG) && <LoadingCover />}
        </>
    )
}

/**
 * 文章详情页布局
 * @param {*} props
 * @returns
 */
const LayoutSlug = props => {
    const { post, lock, validPassword } = props

    // 如果 是 /article/[slug] 的文章路径则視情況进行重定向到另一个域名
    const router = useRouter()
    if (
        !post &&
        siteConfig('PROXIO_POST_REDIRECT_ENABLE') &&
        isBrowser &&
        router.route === '/[prefix]/[slug]'
    ) {
        const redirectUrl =
            siteConfig('PROXIO_POST_REDIRECT_URL') +
            router.asPath.replace('?theme=landing', '')
        router.push(redirectUrl)
        return (
            <div id='theme-proxio'>
                <Loading />
            </div>
        )
    }

    return (
        <>
            <Banner title={post?.title} description={post?.summary} />
            <div className='container grow'>
                <div className='flex flex-wrap justify-center -mx-4'>
                    <div id='container-inner' className='w-full p-4'>
                        {lock && <ArticleLock validPassword={validPassword} />}

                        {!lock && post && (
                            <div id='article-wrapper' className='mx-auto'>
                                <NotionPage {...props} />
                                <Comment frontMatter={post} />
                                <ShareBar post={post} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

/**
 * 仪表盘
 * @param {*} props
 * @returns
 */
const LayoutDashboard = props => {
    const { post } = props

    return (
        <>
            <div className='container grow'>
                <div className='flex flex-wrap justify-center -mx-4'>
                    <div id='container-inner' className='w-full p-4'>
                        {post && (
                            <div id='article-wrapper' className='mx-auto'>
                                <NotionPage {...props} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {/* 仪表盘 */}
            <DashboardHeader />
            <DashboardBody />
        </>
    )
}

/**
 * 搜索
 * @param {*} props
 * @returns
 */
const LayoutSearch = props => {
    const { keyword } = props
    const router = useRouter()
    const currentSearch = keyword || router?.query?.s

    useEffect(() => {
        if (isBrowser) {
            replaceSearchResult({
                doms: document.getElementById('posts-wrapper'),
                search: keyword,
                target: {
                    element: 'span',
                    className: 'text-red-500 border-b border-dashed'
                }
            })
        }
    }, [keyword])
    return (
        <>
            <section className='mx-auto max-w-7xl pb-10 pt-20 lg:pb-20 lg:pt-[120px]'>
                <SearchInput {...props} />
                {currentSearch && <Blog {...props} />}
            </section>
        </>
    )
}

/**
 * 文章归档
 * @param {*} props
 * @returns
 */
const LayoutArchive = props => (
    <>
        {/* 博文列表 */}
        <Blog {...props} />
    </>
)

/**
 * 404页面
 * @param {*} props
 * @returns
 */
const Layout404 = props => {
    return (
        <>
            {/* <!-- ====== 404 Section Start --> */}
            <section className='dot-bg py-20 lg:py-[110px]'>
                <div className='container mx-auto'>
                    <div className='mx-auto max-w-[480px] text-center'>
                        <div className='relative mx-auto mb-10 w-48'>
                            <div className='sticker-card meow-float-slow overflow-hidden rotate-3'>
                                <img
                                    src='/images/personal/star-mascot-about.png'
                                    alt='404'
                                    className='w-full'
                                />
                            </div>
                            <span
                                aria-hidden='true'
                                className='meow-twinkle absolute -left-6 -top-4 select-none text-3xl'>
                                ⭐
                            </span>
                        </div>
                        <h2 className='font-display mb-3 text-6xl font-extrabold text-primary'>
                            404
                        </h2>
                        <h3 className='mb-5 text-2xl font-bold text-dark dark:text-white'>
                            {siteConfig('PROXIO_404_TITLE')}
                        </h3>
                        <p className='mb-8 text-base leading-7 text-body-color'>
                            {siteConfig('PROXIO_404_TEXT')}
                        </p>
                        <SmartLink href='/' className='btn-meow'>
                            {siteConfig('PROXIO_404_BACK')}
                        </SmartLink>
                    </div>
                </div>
            </section>
            {/* <!-- ====== 404 Section End --> */}
        </>
    )
}

/**
 * 博客列表
 */
const LayoutPostList = props => {
    const { posts, category, tag } = props
    const slotTitle = category || tag

    return (
        <>
            {/* <!-- ====== Blog Section Start --> */}
            <section className='pb-10 pt-20 lg:pb-20 lg:pt-[120px]'>
                <div className='container mx-auto'>
                    {/* 区块标题文字 */}
                    <div className='-mx-4 flex flex-wrap justify-center'>
                        <div className='w-full px-4'>
                            <div className='mx-auto mb-[60px] max-w-[485px] space-y-4 text-center'>
                                {slotTitle && (
                                    <>
                                        <span className='section-badge'>
                                            {category
                                                ? '分类'
                                                : '标签'}
                                        </span>
                                        <h2 className='mb-4 text-3xl font-bold text-dark dark:text-white sm:text-4xl md:text-[40px] md:leading-[1.2]'>
                                            {slotTitle}
                                        </h2>
                                    </>
                                )}

                                {!slotTitle && (
                                    <>
                                        <span className='section-badge'>
                                            {siteConfig('PROXIO_BLOG_TITLE')}
                                        </span>
                                        <h2 className='mb-4 text-3xl font-bold text-dark dark:text-white sm:text-4xl md:text-[40px] md:leading-[1.2]'>
                                            {siteConfig('PROXIO_BLOG_TEXT_1')}
                                        </h2>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    {/* 博客列表 */}
                    <div className='-mx-4 flex flex-wrap'>
                        {posts?.map((item, index) => {
                            return (
                                <div key={index} className='w-full px-4 md:w-1/2 lg:w-1/3'>
                                    <SmartLink
                                        href={item?.href}
                                        className='wow fadeInUp sticker-card group mb-10 block overflow-hidden'
                                        data-wow-delay='.1s'>
                                        <div className='relative aspect-[16/9] overflow-hidden bg-meow-sky dark:bg-meow-card'>
                                            {item.pageCoverThumbnail ? (
                                                <img
                                                    src={item.pageCoverThumbnail}
                                                    alt={item.title}
                                                    className='h-full w-full object-cover transition-transform duration-500 group-hover:scale-105'
                                                />
                                            ) : (
                                                <div className='dot-bg flex h-full w-full items-center justify-center'>
                                                    <span className='meow-twinkle text-4xl'>⭐</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className='space-y-3 p-5'>
                                            {item.publishDay && (
                                                <span className='inline-flex items-center gap-1 rounded-full bg-meow-yellow px-3 py-0.5 text-xs font-bold text-meow-ink'>
                                                    <i className='fa-regular fa-calendar' />
                                                    {item.publishDay}
                                                </span>
                                            )}
                                            <h3 className='text-lg font-bold text-dark group-hover:text-primary dark:text-white dark:group-hover:text-meow-sky-deep xl:text-xl'>
                                                {item.title}
                                            </h3>
                                            {item.summary && (
                                                <p className='line-clamp-2 text-sm leading-6 text-body-color'>
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
/**
 * 分类列表
 * @param {*} props
 * @returns
 */
const LayoutCategoryIndex = props => {
    const { categoryOptions } = props
    const { locale } = useGlobal()
    return (
        <section className='pb-10 pt-20 lg:pb-20 lg:pt-[120px]'>
            <div className='container mx-auto min-h-96'>
                <div className='mb-10 flex items-center justify-center'>
                    <span className='section-badge'>{locale.COMMON.CATEGORY}</span>
                </div>
                <div
                    id='category-list'
                    className='flex flex-wrap items-center justify-center gap-4 duration-200'>
                    {categoryOptions?.map(category => {
                        return (
                            <SmartLink
                                key={category.name}
                                href={`/category/${category.name}`}
                                passHref
                                legacyBehavior>
                                <h2 className='sticker-card cursor-pointer px-6 py-3 text-xl font-bold text-dark dark:text-white sm:text-2xl'>
                                    <i className='mr-3 fas fa-folder text-meow-yellow' />
                                    {category.name}
                                    <span className='ml-2 text-sm font-medium text-body-color'>
                                        {category.count}
                                    </span>
                                </h2>
                            </SmartLink>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}

/**
 * 标签列表
 * @param {*} props
 * @returns
 */
const LayoutTagIndex = props => {
    const { tagOptions } = props
    const { locale } = useGlobal()
    return (
        <section className='pb-10 pt-20 lg:pb-20 lg:pt-[120px]'>
            <div className='container mx-auto min-h-96'>
                <div className='mb-10 flex items-center justify-center'>
                    <span className='section-badge'>{locale.COMMON.TAGS}</span>
                </div>
                <div
                    id='tags-list'
                    className='flex flex-wrap items-center justify-center gap-3 duration-200'>
                    {tagOptions.map(tag => {
                        return (
                            <SmartLink
                                key={tag.name}
                                href={`/tag/${encodeURIComponent(tag.name)}`}
                                passHref
                                className='inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full border-2 border-meow-ink/10 bg-white px-4 py-1.5 text-sm font-bold text-meow-ink duration-200 hover:-translate-y-0.5 hover:border-primary hover:text-primary dark:border-white/10 dark:bg-meow-card dark:text-gray-200 dark:hover:text-meow-sky-deep'>
                                <i className='fas fa-tag text-meow-pink' />
                                {tag.name}
                                {tag.count ? (
                                    <span className='text-xs font-medium text-body-color'>
                                        {tag.count}
                                    </span>
                                ) : null}
                            </SmartLink>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
/**
 * 登录页面
 * @param {*} props
 * @returns
 */
const LayoutSignIn = props => {
    const enableClerk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
    const title = siteConfig('PROXIO_SIGNIN', '登录')
    const description = siteConfig(
        'PROXIO_SIGNIN_DESCRITION',
        '本站暂未开放会员登录功能'
    )
    return (
        <>
            <div className='grow mt-20'>
                <Banner title={title} description={description} />
                {/* clerk预置表单 */}
                {enableClerk && (
                    <div className='flex justify-center py-6'>
                        <SignIn />
                    </div>
                )}

                {/* 自定义登录表单 */}
                {!enableClerk && <SignInForm />}
            </div>
        </>
    )
}

/**
 * 注册页面
 * @param {*} props
 * @returns
 */
const LayoutSignUp = props => {
    const enableClerk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

    const title = siteConfig('PROXIO_SIGNIN', '注册')
    const description = siteConfig(
        'PROXIO_SIGNIN_DESCRITION',
        '本站暂未开放会员注册功能'
    )
    return (
        <>
            <div className='grow mt-20'>
                <Banner title={title} description={description} />

                {/* clerk预置表单 */}
                {enableClerk && (
                    <div className='flex justify-center py-6'>
                        <SignUp />
                    </div>
                )}

                {/* 自定义登录表单 */}
                {!enableClerk && <SignUpForm />}
            </div>
        </>
    )
}

export {
    Layout404,
    LayoutArchive,
    LayoutBase,
    LayoutCategoryIndex,
    LayoutDashboard,
    LayoutIndex,
    LayoutPostList,
    LayoutSearch,
    LayoutSignIn,
    LayoutSignUp,
    LayoutSlug,
    LayoutTagIndex,
    CONFIG as THEME_CONFIG
}
