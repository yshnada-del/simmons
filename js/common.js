document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('header');
    const headerLogo = document.querySelector('header .logo');
    const gnbLinks = document.querySelectorAll('.gnb > li > a');
    const footerSnsLinks = document.querySelectorAll('footer .sns_list a');
    const headerRight = document.querySelector('header .right');
    const searchToggle = document.querySelector('header .right ul li:first-child a');
    const menuToggle = document.querySelector('.menu_toggle');
    const subTab = document.querySelector('header .sub_tab');
    const subTabClose = document.querySelector('.sub_tab_close');
    const subTabTop = document.querySelector('.sub_tab_top');
    const subTabMenuLinks = document.querySelectorAll('.tab_gnb_link');
    const koreanSiteButton = document.querySelector('.sub_tab_lang_option[data-lang="kr"]');
    const subTabPanels = document.querySelectorAll('.tab_sub_panel');
    const mainShell = document.querySelector('.main-shell');
    const mainContent = document.querySelector('main');
    const body = document.body;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const floatButtons = document.querySelector('.float_buttons');
    const floatTopButton = document.querySelector('.float_button_top');
    let lastScroll = 0;
    let subTabScrollY = 0;

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
    const subTabPrimaryLinkMap = {
        about: `${basePath}story/story.html`,
        products: `${basePath}list/list.html`,
        sleep: `${basePath}sleep/sleep_main.html`,
        visit: `${basePath}offline/offline.html`,
        community: `${basePath}promo/promo.html`
    };
    const subTabSecondaryLinkMap = {
        about: {
            Simmons: `${basePath}story/story.html`
        },
        products: {
            Mattresses: `${basePath}product/product.html`
        },
        sleep: {
            default: `${basePath}sleep/sleep_main.html`
        },
        visit: {
            Factorium: `${basePath}offline/offline.html`
        },
        community: {
            default: `${basePath}promo/promo.html`
        }
    };
    const footerSnsLinkMap = [
        'https://pf.kakao.com/_GxaMyT',
        'https://www.instagram.com/simmonskorea/?hl=ko',
        'https://www.youtube.com/@simmonskorea'
    ];
    const setSubTabLinkState = (link, href) => {
        if (href) {
            link.setAttribute('href', href);
            link.classList.remove('is-unlinked');
            link.removeAttribute('aria-disabled');
            link.removeAttribute('tabindex');
            return;
        }

        link.removeAttribute('href');
        link.classList.add('is-unlinked');
        link.setAttribute('aria-disabled', 'true');
        link.setAttribute('tabindex', '-1');
    };

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

    footerSnsLinks.forEach((link, index) => {
        const href = footerSnsLinkMap[index];

        if (!href) {
            return;
        }

        link.setAttribute('href', href);
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
    });

    subTabMenuLinks.forEach((link) => {
        const tabKey = link.dataset.tab;
        const href = tabKey ? subTabPrimaryLinkMap[tabKey] : '';
        setSubTabLinkState(link, href);
    });

    subTabPanels.forEach((panel) => {
        const tabKey = panel.dataset.tab;
        const panelLinkMap = tabKey ? subTabSecondaryLinkMap[tabKey] : null;

        if (!panelLinkMap) {
            return;
        }

        panel.querySelectorAll('a').forEach((link) => {
            const linkLabel = link.textContent.trim();
            const href = panelLinkMap[linkLabel] || panelLinkMap.default;
            setSubTabLinkState(link, href);
        });
    });

    koreanSiteButton?.addEventListener('click', () => {
        window.location.href = 'https://simmons.co.kr/';
    });

    if (headerRight && searchToggle) {
        const searchIcon = searchToggle.querySelector('img');
        const searchHint = searchToggle.querySelector('.search_hint');
        const searchIconSrc = searchIcon ? searchIcon.getAttribute('src') : `${basePath}icon/search.svg`;

        if (searchHint) {
            const searchForm = document.createElement('form');
            searchForm.className = 'search_link';
            searchForm.setAttribute('role', 'search');
            searchForm.innerHTML = `
                <label class="search_hint" for="header-search-input">
                    <input
                        type="search"
                        id="header-search-input"
                        class="search_input"
                        placeholder=""
                        aria-label="Search"
                    >
                </label>
                <button type="button" class="search_icon_button" aria-label="Search">
                    <img src="${searchIconSrc}" alt="">
                </button>
            `;

            searchToggle.replaceWith(searchForm);

            const inlineSearch = headerRight.querySelector('.search_link');
            const inlineSearchInput = inlineSearch?.querySelector('.search_input');
            const inlineSearchButton = inlineSearch?.querySelector('.search_icon_button');

            inlineSearch?.addEventListener('submit', (event) => {
                event.preventDefault();
            });

            inlineSearchButton?.addEventListener('click', () => {
                inlineSearchInput?.focus();
            });

            document.addEventListener('keydown', (event) => {
                if (event.key === 'Escape') {
                    inlineSearchInput?.blur();
                }
            });
        } else {
            const searchPanel = document.createElement('div');

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
    }

    if (subTab) {
        const openSubTab = () => {
            subTabScrollY = window.scrollY || window.pageYOffset || 0;
            header.classList.add('is-sub-tab-open');
            mainShell?.classList.add('sub-tab-active');
            body.classList.add('sub-tab-open');
            body.style.top = `-${subTabScrollY}px`;
            subTab.setAttribute('aria-hidden', 'false');
        };

        const closeSubTab = () => {
            header.classList.remove('is-sub-tab-open');
            mainShell?.classList.remove('sub-tab-active');
            body.classList.remove('sub-tab-open');
            body.style.top = '';
            subTab.setAttribute('aria-hidden', 'true');
            clearActiveSubTab();
            window.scrollTo(0, subTabScrollY);
        };

        const setActiveSubTab = (link) => {
            if (!subTabTop || !link) {
                return;
            }

            const activeTab = link.dataset.tab;
            const topOffset = link.offsetTop;

            subTabTop.dataset.activeTab = activeTab || 'about';
            subTabTop.style.setProperty('--tab-sub-top', `${topOffset}px`);
        };

        const clearActiveSubTab = () => {
            if (!subTabTop) {
                return;
            }

            delete subTabTop.dataset.activeTab;
            subTabTop.style.removeProperty('--tab-sub-top');
        };

        subTabMenuLinks.forEach((link) => {
            link.addEventListener('mouseenter', () => {
                setActiveSubTab(link);
            });

            link.addEventListener('focus', () => {
                setActiveSubTab(link);
            });
        });

        subTabTop?.addEventListener('mouseleave', () => {
            clearActiveSubTab();
        });

        window.addEventListener('resize', () => {
            const activeLink = subTabTop?.querySelector(`.tab_gnb_link[data-tab="${subTabTop?.dataset.activeTab || ''}"]`);
            if (activeLink) {
                setActiveSubTab(activeLink);
            }
        });

        menuToggle?.addEventListener('click', (event) => {
            event.preventDefault();
            openSubTab();
        });

        subTabClose?.addEventListener('click', () => {
            closeSubTab();
        });

        mainContent?.addEventListener('click', () => {
            if (header.classList.contains('is-sub-tab-open')) {
                closeSubTab();
            }
        });

        document.addEventListener('click', (event) => {
            const target = event.target;

            if (!header.classList.contains('is-sub-tab-open')) {
                return;
            }

            if (!(target instanceof Element)) {
                return;
            }

            if (subTab.contains(target) || menuToggle?.contains(target)) {
                return;
            }

            closeSubTab();
        });
    }

    window.addEventListener('scroll', () => {
        if (header.classList.contains('is-sub-tab-open')) {
            header.classList.remove('hide');
            return;
        }

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
