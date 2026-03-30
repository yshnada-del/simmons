document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('header');
    const headerLogo = document.querySelector('header .logo');
    const gnbLinks = document.querySelectorAll('.gnb > li > a');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const floatButtons = document.querySelector('.float_buttons');
    const floatTopButton = document.querySelector('.float_button_top');
    let lastScroll = 0;

    if (floatButtons && floatButtons.parentElement !== document.body) {
        document.body.appendChild(floatButtons);
    }

    if (floatTopButton) {
        floatTopButton.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: prefersReducedMotion ? 'auto' : 'smooth'
            });
        });
    }

    if (!header) {
        return;
    }

    const normalizedPath = window.location.pathname.replace(/\\/g, '/');
    const isNestedPage = /\/(story|product|offline|sleep|list|promo)\//.test(normalizedPath);
    const basePath = isNestedPage ? '../' : '';

    const headerLinkMap = [
        `${basePath}story/story.html`,
        `${basePath}list/list.html`,
        `${basePath}sleep/sleep_main.html`,
        `${basePath}offline/offline.html`,
    ];

    const homePath = `${basePath}index.html`;

    if (headerLogo) {
        headerLogo.style.cursor = 'pointer';
        headerLogo.addEventListener('click', () => {
            window.location.href = homePath;
        });
    }

    gnbLinks.forEach((link, index) => {
        if (headerLinkMap[index]) {
            link.setAttribute('href', headerLinkMap[index]);
        }
    });

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset || document.documentElement.scrollTop;

        // 스크롤 방향 감지 (내려갈 때 사라짐, 올라올 때 나타남)
        if (currentScroll > lastScroll && currentScroll > 50) {
            // Downscroll
            header.classList.add('hide');
        } else {
            // Upscroll
            header.classList.remove('hide');
        }

        // 스크롤이 맨 위에 도달했을 때 헤더 무조건 노출
        if (currentScroll <= 0) {
            header.classList.remove('hide');
        }

        lastScroll = currentScroll;
    });
});//dom end
