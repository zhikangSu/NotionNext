import { siteConfig } from '@/lib/config';
import { useEffect, useState } from 'react';

const LoadingCover = ({ onFinishLoading }) => {
    const [isVisible, setIsVisible] = useState(true);
    const welcomeText = siteConfig('PROXIO_WELCOME_TEXT', '欢迎来到我们的网站！');

    // 定义颜色变量（Meowsu 天空配色）
    const colors = {
        backgroundStart: '#EAF2FF', // 浅天蓝
        backgroundMiddle: '#C9DEFF', // 天蓝
        backgroundEnd: '#FFF6E3', // 奶油
        textColor: '#1E2447', // 墨蓝
        rippleColor: 'rgba(53, 99, 233, 0.35)', // 半透明品牌蓝
    };

    useEffect(() => {
        const pageContainer = document.getElementById('pageContainer');

        const handleClick = (e) => {
            // 创建扩散光圈
            const ripple = document.createElement('div');
            ripple.classList.add('ripple');
            ripple.style.left = `${e.clientX - 10}px`;
            ripple.style.top = `${e.clientY - 10}px`;
            document.body.appendChild(ripple);

            // 添加页面缩放 + 模糊动画
            pageContainer?.classList?.add('page-clicked');

            // 模拟加载完成，调用回调函数
            setTimeout(() => {
                setIsVisible(false); // 淡出动画
                setTimeout(() => {
                    if (onFinishLoading) {
                        onFinishLoading();
                    }
                }, 600); // 等待淡出动画完成
            }, 1200);

            // 清理 ripple 元素
            setTimeout(() => {
                ripple.remove();
            }, 1000);
        };

        document.body.addEventListener('click', handleClick);

        // 2.6 秒后自动进入，不强制访客点击
        const autoTimer = setTimeout(() => {
            pageContainer?.classList?.add('page-clicked');
            setIsVisible(false);
            setTimeout(() => {
                if (onFinishLoading) {
                    onFinishLoading();
                }
            }, 600);
        }, 2600);

        return () => {
            document.body.removeEventListener('click', handleClick);
            clearTimeout(autoTimer);
        };
    }, [onFinishLoading]);

    if (!isVisible) return null;

    return (
        <div className="welcome" id="pageContainer">
            <div className="welcome-text px-2" id="welcomeText">
                <span aria-hidden="true" style={{ display: 'block', fontSize: '3rem', marginBottom: '0.5rem' }}>⭐</span>
                {welcomeText}
                <span style={{ display: 'block', fontSize: '0.95rem', fontWeight: 'normal', opacity: 0.6, marginTop: '1rem' }}>
                    点击任意处进入
                </span>
            </div>
            <style jsx>
                {`
                    body {
                        margin: 0;
                        background-color: ${colors.backgroundStart};
                        height: 100vh;
                        overflow: hidden;
                        cursor: pointer;
                    }

                    .welcome {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        width: 100vw;
                        position: fixed;
                        top: 0;
                        left: 0;
                        z-index: 9999;
                        pointer-events: auto;
                        background: linear-gradient(120deg, ${colors.backgroundStart}, ${colors.backgroundMiddle}, ${colors.backgroundEnd});
                        background-size: 300% 300%;
                        animation: gradientShift 6s ease infinite;
                        transition: opacity 0.6s ease; /* 淡出动画 */
                    }

                    .welcome.page-clicked {
                        opacity: 0;
                        pointer-events: none;
                    }

                    .welcome-text {
                        font-size: 2.5rem;
                        font-weight: bold;
                        color: ${colors.textColor};
                        text-shadow: 0 0 18px rgba(53, 99, 233, 0.25);
                        user-select: none;
                        animation: textPulse 3s ease-in-out infinite, fadeInUp 1.5s ease-out forwards;
                        text-align: center;
                        z-index: 10000; /* 确保文字层级高于背景 */
                        position: relative;
                    }

                    .ripple {
                        position: absolute;
                        border-radius: 50%;
                        background: radial-gradient(${colors.rippleColor} 0%, transparent 70%);
                        pointer-events: none;
                        width: 20px;
                        height: 20px;
                        transform: scale(0);
                        opacity: 0.8;
                        z-index: 10;
                        animation: rippleExpand 1s ease-out forwards;
                    }

                    /* 动态背景动画 */
                    @keyframes gradientShift {
                        0% {
                            background-position: 0% 50%;
                        }
                        50% {
                            background-position: 100% 50%;
                        }
                        100% {
                            background-position: 0% 50%;
                        }
                    }

                    /* 文字呼吸动画 */
                    @keyframes textPulse {
                        0%, 100% {
                            transform: scale(1);
                            text-shadow: 0 0 18px rgba(53, 99, 233, 0.25);
                        }
                        50% {
                            transform: scale(1.1);
                            text-shadow: 0 0 28px rgba(53, 99, 233, 0.4);
                        }
                    }

                    /* 文字淡入动画 */
                    @keyframes fadeInUp {
                        0% {
                            opacity: 0;
                            transform: translateY(50px);
                        }
                        100% {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }

                    /* 扩散光圈动画 */
                    @keyframes rippleExpand {
                        to {
                            transform: scale(40);
                            opacity: 0;
                        }
                    }
                `}
            </style>
        </div>
    );
};

export default LoadingCover;