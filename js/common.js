document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('header');
    const headerLogo = document.querySelector('header .logo');
    const gnbLinks = document.querySelectorAll('.gnb > li > a');
    const headerRight = document.querySelector('header .right');
    const searchToggle = document.querySelector('header .right ul li:first-child a');
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
    const activePathMap = [
        /\/story\/story\.html$/i,
        /\/(list\/list|product\/product)\.html$/i,
        /\/sleep\/sleep_(main|match|name|ox)\.html$/i,
        /\/(offline\/offline|promo\/promo)\.html$/i,
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

        const activePattern = activePathMap[index];
        if (activePattern && activePattern.test(normalizedPath)) {
            link.classList.add('is-active');
            link.setAttribute('aria-current', 'page');
        }
    });

    if (headerRight && searchToggle) {
        const searchIcon = searchToggle.querySelector('img');
        const searchPanel = document.createElement('div');
        const searchIconSrc = searchIcon ? searchIcon.getAttribute('src') : `${basePath}icon/search.svg`;

        searchPanel.className = 'header_search_panel';
        searchPanel.innerHTML = `
            <form class="header_search_form" role="search">
                <input
                    type="search"
                    class="header_search_input"
                    placeholder="\uAC80\uC0C9\uC5B4\uB97C \uC785\uB825\uD558\uC138\uC694"
                    aria-label="\uAC80\uC0C9\uC5B4\uB97C \uC785\uB825\uD558\uC138\uC694"
                >
                <button type="submit" class="header_search_submit" aria-label="\uAC80\uC0C9">
                    <img src="${searchIconSrc}" alt="">
                </button>
            </form>
        `;
        headerRight.appendChild(searchPanel);

        const searchForm = searchPanel.querySelector('.header_search_form');
        const searchInput = searchPanel.querySelector('.header_search_input');

        const closeSearch = () => {
            headerRight.classList.remove('is-search-open');
        };

        const openSearch = (shouldFocus = false) => {
            headerRight.classList.add('is-search-open');

            if (shouldFocus) {
                window.setTimeout(() => {
                    searchInput.focus();
                }, prefersReducedMotion ? 0 : 120);
            }
        };

        searchToggle.addEventListener('click', (event) => {
            event.preventDefault();
        });

        searchToggle.addEventListener('mouseenter', () => {
            openSearch();
        });

        headerRight.addEventListener('mouseleave', () => {
            closeSearch();
        });

        searchPanel.addEventListener('mouseenter', () => {
            openSearch();
        });

        searchInput.addEventListener('focus', () => {
            openSearch(true);
        });

        searchInput.addEventListener('blur', () => {
            if (!headerRight.matches(':hover')) {
                closeSearch();
            }
        });

        searchForm.addEventListener('submit', (event) => {
            event.preventDefault();
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                closeSearch();
            }
        });
    }

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
