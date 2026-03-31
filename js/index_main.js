document.addEventListener('DOMContentLoaded', () => {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        return;
    }

    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({
        autoRefreshEvents: 'visibilitychange,DOMContentLoaded,load,resize'
    });

    const scheduleScrollTriggerRefresh = (() => {
        let refreshTween = null;

        return () => {
            refreshTween?.kill();
            refreshTween = gsap.delayedCall(0.18, () => {
                ScrollTrigger.refresh();
            });
        };
    })();

    const getResponsiveMode = () => {
        if (window.innerWidth <= 430) {
            return 'mobile';
        }

        if (window.innerWidth <= 1034) {
            return 'tablet';
        }

        return 'desktop';
    };

    let currentResponsiveMode = getResponsiveMode();
    const responsiveModeListeners = new Set();

    const onResponsiveModeChange = (listener) => {
        responsiveModeListeners.add(listener);

        return () => {
            responsiveModeListeners.delete(listener);
        };
    };

    const notifyResponsiveModeChange = () => {
        const nextResponsiveMode = getResponsiveMode();

        if (nextResponsiveMode === currentResponsiveMode) {
            return;
        }

        currentResponsiveMode = nextResponsiveMode;
        responsiveModeListeners.forEach((listener) => {
            listener(nextResponsiveMode);
        });
        scheduleScrollTriggerRefresh();
    };

    window.addEventListener('resize', scheduleScrollTriggerRefresh);
    window.addEventListener('orientationchange', scheduleScrollTriggerRefresh);
    window.visualViewport?.addEventListener('resize', scheduleScrollTriggerRefresh);
    window.addEventListener('resize', notifyResponsiveModeChange);
    window.addEventListener('orientationchange', notifyResponsiveModeChange);
    window.visualViewport?.addEventListener('resize', notifyResponsiveModeChange);
    document.fonts?.ready?.then(() => {
        scheduleScrollTriggerRefresh();
    });

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const mainVisual = document.querySelector('.main_visual');
    const eventMoreButton = document.querySelector('.event_more_button');
    const bannerWrap = document.querySelector('.banner_all');
    const secondaryBannerCards = Array.from(document.querySelectorAll('.banner_secondary'));
    const floatButtons = document.querySelector('.float_buttons');
    const floatTopButton = document.querySelector('.float_button_top');

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

    if (eventMoreButton) {
        eventMoreButton.addEventListener('click', () => {
            window.location.href = 'promo/promo.html';
        });
    }

    secondaryBannerCards.forEach((banner) => {
        const destinationLink = banner.querySelector('.banner_headline_link, .banner_arrow');
        const href = destinationLink?.getAttribute('href');

        if (!href) {
            return;
        }

        banner.setAttribute('role', 'link');
        banner.setAttribute('tabindex', '0');

        const navigateToBannerLink = () => {
            window.location.href = href;
        };

        banner.addEventListener('click', (event) => {
            if (event.target instanceof Element && event.target.closest('a')) {
                return;
            }

            navigateToBannerLink();
        });

        banner.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                navigateToBannerLink();
            }
        });
    });

    if (!prefersReducedMotion && mainVisual && bannerWrap) {
        const primaryBanner = bannerWrap.querySelector('.banner_primary');
        const bannerStack = bannerWrap.querySelector('.banner_stack');
        const secondaryBanners = bannerWrap.querySelectorAll('.banner_secondary');
        const isTabletMainVisual = () => window.innerWidth <= 1024;

        if (primaryBanner && bannerStack) {
            const getScrollDistance = () => {
                const styles = window.getComputedStyle(bannerWrap);
                const gapValue = Number.parseFloat(styles.rowGap || styles.gap || '0') || 0;
                const hiddenDistance = gapValue + bannerStack.offsetHeight;
                return Math.max(hiddenDistance, 0);
            };

            const getStartOffset = () => {
                const bannerTop = bannerWrap.offsetTop;
                const primaryHeight = primaryBanner.offsetHeight;
                const viewportHeight = window.innerHeight;
                const offsetFromViewport = Math.max(viewportHeight - bannerTop + 48, 0);

                return Math.max(offsetFromViewport, primaryHeight * 0.9);
            };

            const setInitialBannerState = () => {
                const startOffset = getStartOffset();

                gsap.set(bannerWrap, {
                    y: startOffset
                });

                gsap.set(primaryBanner, {
                    autoAlpha: 0,
                    scale: 0.94,
                    filter: 'blur(14px)',
                    transformOrigin: '50% 50%'
                });

                if (secondaryBanners.length) {
                    gsap.set(secondaryBanners, {
                        autoAlpha: 0,
                        scale: 0.96,
                        filter: 'blur(12px)',
                        transformOrigin: '50% 50%'
                    });
                }

                return {
                    startOffset
                };
            };

            const buildBannerScroll = () => {
                ScrollTrigger.getById('main-visual-banner-pin')?.kill();
                gsap.killTweensOf([bannerWrap, primaryBanner, secondaryBanners]);

                if (isTabletMainVisual()) {
                    gsap.set(bannerWrap, {
                        clearProps: 'all'
                    });

                    gsap.set(primaryBanner, {
                        clearProps: 'all'
                    });

                    if (secondaryBanners.length) {
                        gsap.set(secondaryBanners, {
                            clearProps: 'all'
                        });
                    }

                    return;
                }

                const scrollDistance = getScrollDistance();
                const { startOffset } = setInitialBannerState();

                gsap.timeline({
                    defaults: {
                        ease: 'none'
                    },
                    scrollTrigger: {
                        id: 'main-visual-banner-pin',
                        trigger: mainVisual,
                        start: 'top top',
                        end: () => `+=${Math.max(startOffset + scrollDistance + window.innerHeight * 0.35, window.innerHeight)}`,
                        scrub: 1,
                        pin: true,
                        anticipatePin: 1,
                        invalidateOnRefresh: true
                    }
                })
                    .to(bannerWrap, {
                        y: -scrollDistance,
                        duration: 1
                    }, 0)
                    .to(primaryBanner, {
                        autoAlpha: 1,
                        scale: 1,
                        filter: 'blur(0px)',
                        duration: 0.24
                    }, 0.08)
                    .to(secondaryBanners, {
                        autoAlpha: 1,
                        scale: 1,
                        filter: 'blur(0px)',
                        duration: 0.24,
                        stagger: 0.06
                    }, 0.34);
            };

            buildBannerScroll();

            window.addEventListener('load', () => {
                ScrollTrigger.refresh();
            }, { once: true });

            window.addEventListener('resize', () => {
                buildBannerScroll();
                ScrollTrigger.refresh();
            });
        }
    }

    const storySection = document.querySelector('.story');
    const storyInner = document.querySelector('.story_inner');
    const storyImage = document.querySelector('.story_image');
    const storyKeywords = Array.from(document.querySelectorAll('.story_keyword'));
    const storyButton = document.querySelector('.story_button');

    if (storyButton) {
        storyButton.addEventListener('click', () => {
            window.location.href = 'story/story.html';
        });
    }

    if (storySection && storyInner && storyImage && storyKeywords.length && storyButton) {
        const isStoryStaticLayout = () => window.innerWidth <= 1024;

        const setStoryFloatingState = (isActive) => {
            storyInner.classList.toggle('is-keywords-active', isActive);
        };

        const storyKeywordStates = storyKeywords.map((keyword) => ({
            element: keyword,
            baseOpacity: Number.parseFloat(window.getComputedStyle(keyword).opacity) || 1
        }));

        const setReducedMotionStoryState = () => {
            ScrollTrigger.getById('story-pin')?.kill();
            gsap.killTweensOf(storyKeywords);
            gsap.killTweensOf(storyButton);

            gsap.set(storyKeywords, {
                clearProps: 'x,y,scale,autoAlpha'
            });

            gsap.set(storyButton, {
                clearProps: 'y,autoAlpha'
            });

            setStoryFloatingState(true);
        };

        const buildStoryScroll = () => {
            ScrollTrigger.getById('story-pin')?.kill();
            gsap.killTweensOf(storyKeywords);
            gsap.killTweensOf(storyButton);

            const imageRect = storyImage.getBoundingClientRect();
            const imageCenterX = imageRect.left + (imageRect.width / 2);
            const imageCenterY = imageRect.top + (imageRect.height / 2);

            storyKeywordStates.forEach(({ element }) => {
                const keyword = element;
                const keywordRect = keyword.getBoundingClientRect();
                const keywordCenterX = keywordRect.left + (keywordRect.width / 2);
                const keywordCenterY = keywordRect.top + (keywordRect.height / 2);

                gsap.set(keyword, {
                    x: imageCenterX - keywordCenterX,
                    y: imageCenterY - keywordCenterY,
                    scale: 0.72,
                    autoAlpha: 0
                });
            });

            gsap.set(storyButton, {
                y: 180,
                autoAlpha: 0
            });

            setStoryFloatingState(false);

            const storyTimeline = gsap.timeline({
                defaults: {
                    ease: 'none'
                },
                scrollTrigger: {
                    id: 'story-pin',
                    trigger: storySection,
                    start: 'top top',
                    end: () => `+=${window.innerHeight * 2}`,
                    scrub: 1,
                    pin: true,
                    anticipatePin: 1,
                    invalidateOnRefresh: true,
                    onUpdate: (self) => {
                        setStoryFloatingState(self.progress >= 0.42);
                    },
                    onLeaveBack: () => {
                        setStoryFloatingState(false);
                    }
                }
            });

            storyTimeline
                .to(storyKeywords, {
                    x: 0,
                    y: 0,
                    scale: 1,
                    duration: 0.38,
                    stagger: {
                        each: 0.03,
                        from: 'center'
                    }
                }, 0.06)
                .to(storyKeywords, {
                    autoAlpha: (index) => storyKeywordStates[index].baseOpacity,
                    duration: 0.12,
                    stagger: 0.02
                }, 0.4)
                .to(storyButton, {
                    y: 0,
                    autoAlpha: 1,
                    duration: 0.26,
                    ease: 'power2.out'
                }, 0.68);
        };

        const syncStoryInteraction = () => {
            if (prefersReducedMotion || isStoryStaticLayout()) {
                setReducedMotionStoryState();
            } else {
                buildStoryScroll();
            }

            ScrollTrigger.refresh();
        };

        syncStoryInteraction();
        window.addEventListener('resize', syncStoryInteraction);
    }

    const sleepSolutionSection = document.querySelector('.sleep_solution');
    const sleepSolutionLabel = document.querySelector('.sleep_solution .txt_s');
    const sleepSolutionTitle = document.querySelector('.sleep_solution .txt_b');
    const sleepSolutionTitleText = sleepSolutionTitle?.querySelector('span');
    const sleepSolutionImage = document.querySelector('.sleep_solution .img');
    const sleepSolutionButton = document.querySelector('.sleep_solution .btn_test');
    let sleepSolutionTimeline = null;

    if (sleepSolutionSection && sleepSolutionTitle && sleepSolutionTitleText && sleepSolutionImage) {
        const sleepSolutionChars = Array.from(sleepSolutionTitleText.textContent || '').map((character) => {
            const charSpan = document.createElement('span');
            charSpan.className = 'sleep_solution_char';
            charSpan.textContent = character === ' ' ? '\u00A0' : character;
            return charSpan;
        });

        sleepSolutionTitleText.textContent = '';
        sleepSolutionTitleText.setAttribute('aria-label', 'Sleep Solution');
        sleepSolutionChars.forEach((charSpan) => {
            sleepSolutionTitleText.appendChild(charSpan);
        });

        const setSleepSolutionInitialState = () => {
            gsap.killTweensOf([sleepSolutionLabel, sleepSolutionChars, sleepSolutionImage, sleepSolutionButton].filter(Boolean));

            if (prefersReducedMotion) {
                gsap.set([sleepSolutionLabel, sleepSolutionChars, sleepSolutionImage, sleepSolutionButton].filter(Boolean), {
                    clearProps: 'all'
                });
                gsap.set(sleepSolutionTitle, {
                    clearProps: 'all'
                });
                return;
            }

            if (sleepSolutionLabel) {
                gsap.set(sleepSolutionLabel, {
                    autoAlpha: 0,
                    y: -28
                });
            }

            gsap.set(sleepSolutionTitle, {
                autoAlpha: 1
            });

            gsap.set(sleepSolutionChars, {
                autoAlpha: 0,
                y: -220
            });

            gsap.set(sleepSolutionImage, {
                autoAlpha: 0,
                y: -320
            });

            if (sleepSolutionButton) {
                gsap.set(sleepSolutionButton, {
                    autoAlpha: 0,
                    y: 36
                });
            }
        };

        const buildSleepSolutionTimeline = () => {
            sleepSolutionTimeline?.kill();

            if (prefersReducedMotion) {
                sleepSolutionTimeline = null;
                return;
            }

            sleepSolutionTimeline = gsap.timeline({
                paused: true,
                defaults: {
                    ease: 'power3.out'
                }
            });

            if (sleepSolutionLabel) {
                sleepSolutionTimeline.to(sleepSolutionLabel, {
                    autoAlpha: 1,
                    y: 0,
                    duration: 0.45
                });
            }

            sleepSolutionTimeline
                .to(sleepSolutionChars, {
                    autoAlpha: 1,
                    y: 0,
                    duration: 0.82,
                    stagger: 0.05
                }, sleepSolutionLabel ? '-=0.08' : 0)
                .to(sleepSolutionImage, {
                    autoAlpha: 1,
                    y: 0,
                    duration: 1.05
                }, '+=0.04');

            if (sleepSolutionButton) {
                sleepSolutionTimeline.to(sleepSolutionButton, {
                    autoAlpha: 1,
                    y: 0,
                    duration: 0.5
                }, '-=0.3');
            }
        };

        setSleepSolutionInitialState();
        buildSleepSolutionTimeline();

        ScrollTrigger.create({
            id: 'sleep-solution-enter',
            trigger: sleepSolutionSection,
            start: 'top 72%',
            invalidateOnRefresh: true,
            onEnter: () => {
                if (prefersReducedMotion) {
                    setSleepSolutionInitialState();
                    return;
                }

                setSleepSolutionInitialState();
                buildSleepSolutionTimeline();
                sleepSolutionTimeline?.restart(true);
            },
            onLeaveBack: () => {
                setSleepSolutionInitialState();
            }
        });
    }

    const productSection = document.querySelector('.product');
    const productCircle = document.querySelector('.product_circle');
    const productCircleSvg = document.querySelector('.product_circle_svg');
    const productCircleRotor = document.querySelector('.product_circle_rotor');
    const productCirclePieces = Array.from(document.querySelectorAll('.product_circle_piece'));
    const productSlides = Array.from(document.querySelectorAll('.product_slide'));
    const productCircleBadgeLabel = document.querySelector('.product_circle_badge span');
    const productPrevButton = document.querySelector('.product_scroll_arrow_up');
    const productNextButton = document.querySelector('.product_scroll_arrow_down');
    const productDetailArrows = Array.from(document.querySelectorAll('.product_arrow'));

    if (productSection && productCircle && productCircleSvg && productCircleRotor && productSlides.length) {
        const productBaseRotation = 0;
        const productRotationStep = 72;
        const productRotationCenterX = 708.5;
        const productRotationCenterY = 709;
        const productActivePieceOrder = ['right', 'bottom-right', 'bottom-left', 'left', 'top'];
        let activeProductIndex = Math.max(productSlides.findIndex((slide) => slide.classList.contains('is-active')), 0);
        let currentProductRotation = productBaseRotation - (activeProductIndex * productRotationStep);
        let isProductAnimating = false;
        let isProductDragging = false;
        let dragStartVector = null;
        let dragStartPoint = null;
        const productDragStepThreshold = 24;
        const productBadgeGroups = ['Black', 'Black', 'Black', 'Mattress', 'Mattress'];

        const normalizeProductIndex = (index) => {
            return ((index % productSlides.length) + productSlides.length) % productSlides.length;
        };

        const getProductBadgeLabel = (index) => {
            return productBadgeGroups[normalizeProductIndex(index)] || 'Black';
        };

        const getPointerVector = (clientX, clientY) => {
            const rect = productCircle.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            return {
                x: clientX - centerX,
                y: clientY - centerY
            };
        };

        const getTangentialDragDelta = (startVector, startPoint, nextPoint) => {
            if (!startVector || !startPoint || !nextPoint) {
                return 0;
            }

            const vectorLength = Math.hypot(startVector.x, startVector.y);
            if (!vectorLength) {
                return 0;
            }

            const tangentX = -startVector.y / vectorLength;
            const tangentY = startVector.x / vectorLength;
            const moveX = nextPoint.x - startPoint.x;
            const moveY = nextPoint.y - startPoint.y;

            return (moveX * tangentX) + (moveY * tangentY);
        };

        const getDirectionBetweenProducts = (fromIndex, toIndex) => {
            const forward = (toIndex - fromIndex + productSlides.length) % productSlides.length;
            if (forward === 0) {
                return 1;
            }

            return forward <= productSlides.length / 2 ? 1 : -1;
        };

        const setProductWheelRotation = (rotation) => {
            currentProductRotation = rotation;
            gsap.set(productCircleRotor, {
                rotate: rotation,
                svgOrigin: `${productRotationCenterX} ${productRotationCenterY}`,
                transformOrigin: '50% 50%'
            });
        };

        setProductWheelRotation(currentProductRotation);

        const setProductSlideState = (nextIndex) => {
            productSlides.forEach((slide, index) => {
                const isActive = index === nextIndex;
                slide.classList.toggle('is-active', isActive);
                slide.setAttribute('aria-hidden', String(!isActive));
            });
        };

        const setProductBadgeState = (nextIndex, direction = 1, animate = false) => {
            if (!productCircleBadgeLabel) {
                return;
            }

            const nextLabel = getProductBadgeLabel(nextIndex);
            const currentLabel = productCircleBadgeLabel.textContent?.trim() || '';

            if (!animate || currentLabel === nextLabel || prefersReducedMotion) {
                gsap.killTweensOf(productCircleBadgeLabel);
                productCircleBadgeLabel.textContent = nextLabel;
                gsap.set(productCircleBadgeLabel, {
                    autoAlpha: 1,
                    y: 0,
                    x: 70
                });
                return;
            }

            const outgoingY = direction > 0 ? -18 : 18;
            const incomingY = direction > 0 ? 18 : -18;

            gsap.killTweensOf(productCircleBadgeLabel);
            gsap.timeline({
                defaults: {
                    overwrite: 'auto'
                }
            })
                .to(productCircleBadgeLabel, {
                    autoAlpha: 0,
                    y: outgoingY,
                    duration: 0.16,
                    ease: 'power2.in'
                })
                .add(() => {
                    productCircleBadgeLabel.textContent = nextLabel;
                    gsap.set(productCircleBadgeLabel, {
                        y: incomingY,
                        x: 70
                    });
                })
                .to(productCircleBadgeLabel, {
                    autoAlpha: 1,
                    y: 0,
                    duration: 0.26,
                    ease: 'power2.out'
                });
        };

        const setProductPieceState = (nextIndex) => {
            const activePiece = productActivePieceOrder[normalizeProductIndex(nextIndex)];

            productCirclePieces.forEach((piece) => {
                piece.classList.toggle('is-active', piece.dataset.piece === activePiece);
            });
        };

        const transitionProductSlide = (nextIndex, direction) => {
            if (nextIndex === activeProductIndex) {
                setProductSlideState(nextIndex);
                setProductBadgeState(nextIndex, direction, false);
                isProductAnimating = false;
                return;
            }

            const currentSlide = productSlides[activeProductIndex];
            const nextSlide = productSlides[nextIndex];

            nextSlide.classList.add('is-active');
            nextSlide.setAttribute('aria-hidden', 'false');

            const currentImage = currentSlide.querySelector('.product_image');
            const currentContent = currentSlide.querySelector('.product_content');
            const currentArrow = currentSlide.querySelector('.product_arrow');
            const nextImage = nextSlide.querySelector('.product_image');
            const nextContent = nextSlide.querySelector('.product_content');
            const nextArrow = nextSlide.querySelector('.product_arrow');

            gsap.killTweensOf([
                currentContent,
                currentArrow,
                currentImage,
                nextContent,
                nextArrow,
                nextImage
            ]);

            gsap.set([nextContent, nextArrow], {
                autoAlpha: 0,
                x: direction > 0 ? 36 : -36
            });

            gsap.set(nextImage, {
                autoAlpha: 0,
                x: direction > 0 ? -52 : 52
            });

            gsap.timeline({
                defaults: {
                    ease: 'power3.inOut',
                    duration: prefersReducedMotion ? 0 : 0.55
                },
                onComplete: () => {
                    activeProductIndex = nextIndex;
                    setProductSlideState(nextIndex);
                    setProductPieceState(nextIndex);
                    setProductBadgeState(nextIndex, direction, false);
                    isProductAnimating = false;
                }
            })
                .to([currentContent, currentArrow], {
                    autoAlpha: 0,
                    x: direction > 0 ? -36 : 36
                }, 0)
                .to(currentImage, {
                    autoAlpha: 0,
                    x: direction > 0 ? 46 : -46
                }, 0)
                .to([nextContent, nextArrow], {
                    autoAlpha: 1,
                    x: 0
                }, 0.16)
                .to(nextImage, {
                    autoAlpha: 1,
                    x: 0
                }, 0.16);
        };

        const rotateToProductIndex = (targetIndex, direction = getDirectionBetweenProducts(activeProductIndex, targetIndex)) => {
            const normalizedIndex = normalizeProductIndex(targetIndex);

            if (isProductAnimating || productSlides.length < 2) {
                return;
            }

            if (normalizedIndex === activeProductIndex) {
                return;
            }

            setProductBadgeState(normalizedIndex, direction, true);

            const targetRotation = currentProductRotation - (direction * productRotationStep);

            isProductAnimating = true;
            gsap.to(productCircleRotor, {
                rotate: targetRotation,
                svgOrigin: `${productRotationCenterX} ${productRotationCenterY}`,
                transformOrigin: '50% 50%',
                duration: prefersReducedMotion ? 0 : 0.9,
                ease: 'power2.inOut',
                onUpdate: () => {
                    currentProductRotation = Number(gsap.getProperty(productCircleRotor, 'rotate'));
                },
                onComplete: () => {
                    currentProductRotation = targetRotation;
                }
            });

            transitionProductSlide(normalizedIndex, direction);
        };

        setProductSlideState(activeProductIndex);
        setProductPieceState(activeProductIndex);
        setProductBadgeState(activeProductIndex, 1, false);

        const resetProductResponsiveState = () => {
            const productAnimatedElements = productSlides.flatMap((slide) => {
                return [
                    slide.querySelector('.product_content'),
                    slide.querySelector('.product_arrow'),
                    slide.querySelector('.product_image')
                ];
            }).filter(Boolean);

            gsap.killTweensOf(productAnimatedElements);
            gsap.set(productAnimatedElements, {
                clearProps: 'x,y,scale,autoAlpha,rotation,xPercent,filter,zIndex'
            });

            setProductWheelRotation(productBaseRotation - (activeProductIndex * productRotationStep));
            setProductSlideState(activeProductIndex);
            setProductPieceState(activeProductIndex);
            setProductBadgeState(activeProductIndex, 1, false);
        };

        onResponsiveModeChange(() => {
            resetProductResponsiveState();
        });

        productDetailArrows.forEach((arrow) => {
            arrow.setAttribute('role', 'link');
            arrow.setAttribute('tabindex', '0');
            arrow.setAttribute('aria-label', 'Go to product page');

            const navigateToProductPage = () => {
                window.location.href = '../product/product.html';
            };

            arrow.addEventListener('click', navigateToProductPage);
            arrow.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    navigateToProductPage();
                }
            });
        });

        if (productPrevButton) {
            productPrevButton.addEventListener('click', () => {
                rotateToProductIndex(activeProductIndex + 1, 1);
            });
        }

        if (productNextButton) {
            productNextButton.addEventListener('click', () => {
                rotateToProductIndex(activeProductIndex - 1, -1);
            });
        }

        const handleProductPointerMove = (event) => {
            if (!isProductDragging || isProductAnimating) {
                return;
            }

            const nextPoint = {
                x: event.clientX,
                y: event.clientY
            };
            const tangentialDelta = getTangentialDragDelta(dragStartVector, dragStartPoint, nextPoint);

            if (Math.abs(tangentialDelta) < productDragStepThreshold) {
                return;
            }

            isProductDragging = false;
            productCircle.classList.remove('is-dragging');
            window.removeEventListener('pointermove', handleProductPointerMove);
            window.removeEventListener('pointerup', handleProductPointerUp);

            if (tangentialDelta > 0) {
                rotateToProductIndex(activeProductIndex - 1, -1);
            } else {
                rotateToProductIndex(activeProductIndex + 1, 1);
            }
        };

        const handleProductPointerUp = () => {
            if (!isProductDragging) {
                return;
            }

            isProductDragging = false;
            productCircle.classList.remove('is-dragging');

            window.removeEventListener('pointermove', handleProductPointerMove);
            window.removeEventListener('pointerup', handleProductPointerUp);
        };

        productCircle.addEventListener('pointerdown', (event) => {
            if (isProductAnimating) {
                return;
            }

            if (event.target instanceof Element && event.target.closest('.product_scroll_arrow')) {
                return;
            }

            isProductDragging = true;
            dragStartVector = getPointerVector(event.clientX, event.clientY);
            dragStartPoint = {
                x: event.clientX,
                y: event.clientY
            };
            productCircle.classList.add('is-dragging');
            productCircle.setPointerCapture?.(event.pointerId);

            window.addEventListener('pointermove', handleProductPointerMove);
            window.addEventListener('pointerup', handleProductPointerUp);
        });
    }

    const reviewSection = document.querySelector('.review');
    const reviewStage = reviewSection?.querySelector('.review_stage');
    const reviewSets = reviewSection ? Array.from(reviewSection.querySelectorAll('.review_set')) : [];
    const reviewFilterOptions = reviewSection ? Array.from(reviewSection.querySelectorAll('.review_filter_option')) : [];
    const reviewFilterButton = reviewSection?.querySelector('.review_filter_button');

    if (reviewSection && reviewStage && reviewSets.length && reviewFilterButton) {
        const reviewSpreadRotationsByCategory = {
            products: [-10, -4, 4, 10],
            offline: [-14, 10, -6, 9]
        };
        const isTabletReviewLayout = () => window.innerWidth <= 1024;
        let activeReviewCategory = reviewFilterOptions.find((option) => option.classList.contains('is-active'))?.dataset.reviewCategory || 'products';
        let reviewIntroPlayed = false;
        let isReviewTransitioning = false;
        let reviewIntroTimeline = null;
        let reviewPrepTween = null;
        let reviewIntroTrigger = null;

        const getReviewSetCards = (set) => Array.from(set.querySelectorAll('.review_card'));
        const getReviewSetSlots = (set) => Array.from(set.querySelectorAll('.review_card_slot'));
        const getReviewSetInners = (set) => Array.from(set.querySelectorAll('.review_card_inner'));
        const getReviewSlideDistance = () => reviewStage.offsetWidth + 220;
        const getReviewRotations = (set) => reviewSpreadRotationsByCategory[set.dataset.reviewSet] || reviewSpreadRotationsByCategory.products;
        const getReviewStackBaseY = (index) => index * 14;
        const getReviewStackScale = (index) => 1 - (index * 0.035);
        const getReviewStackRotate = (index) => [-6, -2, 2, 6][index] || 0;

        const setReviewFilterState = (category) => {
            reviewFilterOptions.forEach((option) => {
                const isActive = option.dataset.reviewCategory === category;
                option.classList.toggle('is-active', isActive);
                option.setAttribute('aria-pressed', String(isActive));
            });
        };

        const stopReviewPrepAnimation = () => {
            reviewPrepTween?.kill();
            reviewPrepTween = null;
        };

        const getReviewOverlapOffsets = (set) => {
            const setRect = set.getBoundingClientRect();
            const targetCenterX = setRect.width / 2;

            return getReviewSetSlots(set).map((slot) => {
                const slotRect = slot.getBoundingClientRect();
                const slotCenterX = (slotRect.left - setRect.left) + (slotRect.width / 2);

                return targetCenterX - slotCenterX;
            });
        };

        const setReviewSetState = (set, { x = 0, stacked = false, showBack = true, zIndex = 1 } = {}) => {
            const cards = getReviewSetCards(set);
            const inners = getReviewSetInners(set);

            gsap.set(set, {
                x,
                autoAlpha: 1,
                zIndex
            });

            if (isTabletReviewLayout()) {
                cards.forEach((card) => {
                    gsap.set(card, {
                        x: 0,
                        y: 0,
                        rotate: 0,
                        scale: 1,
                        autoAlpha: 1,
                        zIndex: 1
                    });
                });

                gsap.set(inners, {
                    rotateY: 180
                });
                return;
            }

            if (stacked) {
                const overlapOffsets = getReviewOverlapOffsets(set);

                cards.forEach((card, index) => {
                    gsap.set(card, {
                        x: overlapOffsets[index],
                        y: getReviewStackBaseY(index),
                        rotate: getReviewStackRotate(index),
                        scale: getReviewStackScale(index),
                        autoAlpha: 1,
                        zIndex: cards.length - index
                    });
                });
            } else {
                const rotations = getReviewRotations(set);

                cards.forEach((card, index) => {
                    gsap.set(card, {
                        x: 0,
                        y: 0,
                        rotate: rotations[index] || 0,
                        scale: 1,
                        autoAlpha: 1,
                        zIndex: 1
                    });
                });
            }

            gsap.set(inners, {
                rotateY: showBack ? 180 : 0
            });
        };

        const initializeReviewSets = () => {
            const slideDistance = getReviewSlideDistance();

            if (isTabletReviewLayout()) {
                const tabletSlideDistance = reviewStage.offsetWidth;
                reviewSets.forEach((set) => {
                    const isActive = set.dataset.reviewSet === activeReviewCategory;
                    set.classList.toggle('is-active', isActive);
                    setReviewSetState(set, {
                        x: isActive ? 0 : (set.dataset.reviewSet === 'offline' ? tabletSlideDistance : -tabletSlideDistance),
                        stacked: false,
                        showBack: true,
                        zIndex: isActive ? 2 : 1
                    });
                });

                setReviewFilterState(activeReviewCategory);
                return;
            }

            reviewSets.forEach((set) => {
                const category = set.dataset.reviewSet;
                const isActive = category === activeReviewCategory;
                const offscreenDirection = category === 'offline' ? 1 : -1;

                set.classList.toggle('is-active', isActive);

                if (isActive) {
                    setReviewSetState(set, {
                        x: 0,
                        stacked: !isTabletReviewLayout() && !reviewIntroPlayed && !prefersReducedMotion,
                        showBack: isTabletReviewLayout() || reviewIntroPlayed || prefersReducedMotion,
                        zIndex: 2
                    });
                } else {
                    setReviewSetState(set, {
                        x: offscreenDirection * slideDistance,
                        stacked: false,
                        showBack: true,
                        zIndex: 1
                    });
                }
            });

            setReviewFilterState(activeReviewCategory);
        };

        const startReviewPrepAnimation = () => {
            stopReviewPrepAnimation();

            if (reviewIntroPlayed || prefersReducedMotion || isTabletReviewLayout()) {
                return;
            }

            const activeSet = reviewSets.find((set) => set.dataset.reviewSet === activeReviewCategory);

            if (!activeSet) {
                return;
            }

            const cards = getReviewSetCards(activeSet);

            reviewPrepTween = gsap.to(cards, {
                y: (index) => getReviewStackBaseY(index) + (index % 2 === 0 ? -8 : 8),
                duration: 1.35,
                ease: 'sine.inOut',
                repeat: -1,
                yoyo: true,
                stagger: 0.06
            });
        };

        const buildReviewIntroTimeline = () => {
            const activeSet = reviewSets.find((set) => set.dataset.reviewSet === activeReviewCategory);

            reviewIntroTimeline?.kill();

            if (!activeSet) {
                return;
            }

            const cards = getReviewSetCards(activeSet);
            const inners = getReviewSetInners(activeSet);
            const rotations = getReviewRotations(activeSet);

            gsap.killTweensOf(cards);
            gsap.killTweensOf(inners);

            if (reviewIntroPlayed || prefersReducedMotion || isTabletReviewLayout()) {
                setReviewSetState(activeSet, {
                    x: 0,
                    stacked: false,
                    showBack: true,
                    zIndex: 2
                });
                return;
            }

            setReviewSetState(activeSet, {
                x: 0,
                stacked: true,
                showBack: false,
                zIndex: 2
            });

            reviewIntroTimeline = gsap.timeline({
                paused: true,
                defaults: {
                    overwrite: 'auto'
                },
                onComplete: () => {
                    stopReviewPrepAnimation();
                    reviewIntroPlayed = true;
                    setReviewSetState(activeSet, {
                        x: 0,
                        stacked: false,
                        showBack: true,
                        zIndex: 2
                    });
                    reviewIntroTrigger?.kill();
                }
            });

            reviewIntroTimeline.to({}, {
                duration: 0.45
            });

            reviewIntroTimeline.to(cards, {
                x: 0,
                y: 0,
                rotate: (index) => rotations[index] || 0,
                scale: 1,
                duration: 1.05,
                ease: 'power3.out',
                stagger: 0.1
            });

            inners.forEach((cardInner, index) => {
                reviewIntroTimeline.to(cardInner, {
                    rotateY: 180,
                    duration: 0.56,
                    ease: 'power2.inOut'
                }, `>-${index === 0 ? 0.06 : 0.02}`);
            });
        };

        const transitionReviewCategory = (targetCategory) => {
            if (isReviewTransitioning || targetCategory === activeReviewCategory) {
                return;
            }

            if (isTabletReviewLayout()) {
                const currentSet = reviewSets.find((set) => set.dataset.reviewSet === activeReviewCategory);
                const nextSet = reviewSets.find((set) => set.dataset.reviewSet === targetCategory);

                if (!currentSet || !nextSet) {
                    return;
                }

                const slideDistance = reviewStage.offsetWidth;
                const direction = targetCategory === 'offline' ? 1 : -1;

                isReviewTransitioning = true;
                setReviewFilterState(targetCategory);
                currentSet.classList.add('is-active');
                nextSet.classList.add('is-active');

                setReviewSetState(nextSet, {
                    x: direction * slideDistance,
                    stacked: false,
                    showBack: true,
                    zIndex: 3
                });

                gsap.set(currentSet, { zIndex: 2 });

                gsap.timeline({
                    defaults: {
                        duration: 0.45,
                        ease: 'power2.inOut'
                    },
                    onComplete: () => {
                        activeReviewCategory = targetCategory;
                        reviewSets.forEach((set) => {
                            const isActive = set.dataset.reviewSet === activeReviewCategory;
                            set.classList.toggle('is-active', isActive);
                        });

                        setReviewSetState(currentSet, {
                            x: -direction * slideDistance,
                            stacked: false,
                            showBack: true,
                            zIndex: 1
                        });

                        setReviewSetState(nextSet, {
                            x: 0,
                            stacked: false,
                            showBack: true,
                            zIndex: 2
                        });

                        setReviewFilterState(activeReviewCategory);
                        isReviewTransitioning = false;
                    }
                })
                    .to(currentSet, {
                        x: -direction * slideDistance
                    }, 0)
                    .to(nextSet, {
                        x: 0
                    }, 0);
                return;
            }

            if (!reviewIntroPlayed) {
                stopReviewPrepAnimation();
                reviewIntroTimeline?.kill();
                reviewIntroPlayed = true;
                initializeReviewSets();
            }

            const currentSet = reviewSets.find((set) => set.dataset.reviewSet === activeReviewCategory);
            const nextSet = reviewSets.find((set) => set.dataset.reviewSet === targetCategory);

            if (!currentSet || !nextSet) {
                return;
            }

            const slideDistance = getReviewSlideDistance();
            const direction = targetCategory === 'offline' ? 1 : -1;

            isReviewTransitioning = true;

            setReviewFilterState(targetCategory);
            currentSet.classList.add('is-active');
            nextSet.classList.add('is-active');

            setReviewSetState(nextSet, {
                x: direction * slideDistance,
                stacked: false,
                showBack: true,
                zIndex: 3
            });

            gsap.set(currentSet, {
                zIndex: 2
            });

            gsap.timeline({
                defaults: {
                    duration: prefersReducedMotion ? 0 : 0.82,
                    ease: 'power3.inOut'
                },
                onComplete: () => {
                    activeReviewCategory = targetCategory;
                    reviewSets.forEach((set) => {
                        const isActive = set.dataset.reviewSet === activeReviewCategory;
                        set.classList.toggle('is-active', isActive);
                    });

                    setReviewSetState(currentSet, {
                        x: -direction * slideDistance,
                        stacked: false,
                        showBack: true,
                        zIndex: 1
                    });

                    setReviewSetState(nextSet, {
                        x: 0,
                        stacked: false,
                        showBack: true,
                        zIndex: 2
                    });

                    setReviewFilterState(activeReviewCategory);
                    isReviewTransitioning = false;
                }
            })
                .to(currentSet, {
                    x: -direction * slideDistance
                }, 0)
                .to(nextSet, {
                    x: 0
                }, 0);
        };

        initializeReviewSets();
        buildReviewIntroTimeline();
        startReviewPrepAnimation();

        reviewIntroTrigger = ScrollTrigger.create({
            id: 'review-intro-once',
            trigger: reviewSection,
            start: 'top 72%',
            once: true,
            invalidateOnRefresh: true,
            onEnter: () => {
                if (prefersReducedMotion || isTabletReviewLayout()) {
                    reviewIntroPlayed = true;
                    stopReviewPrepAnimation();
                    initializeReviewSets();
                    return;
                }

                stopReviewPrepAnimation();
                initializeReviewSets();
                buildReviewIntroTimeline();
                reviewIntroTimeline?.restart(true);
            }
        });

        reviewFilterOptions.forEach((option) => {
            option.addEventListener('click', () => {
                transitionReviewCategory(option.dataset.reviewCategory);
            });
        });

        window.addEventListener('resize', () => {
            if (isTabletReviewLayout()) {
                reviewIntroPlayed = true;
                stopReviewPrepAnimation();
                reviewIntroTimeline?.kill();
                reviewIntroTrigger?.kill();
            }

            initializeReviewSets();

            if (!reviewIntroPlayed && !isTabletReviewLayout()) {
                buildReviewIntroTimeline();
                startReviewPrepAnimation();
            }

            ScrollTrigger.refresh();
        });
    }

    const offlineSection = document.querySelector('.offline');
    const offlineInner = offlineSection?.querySelector('.offline_inner');
    const offlineTrackButtons = Array.from(document.querySelectorAll('.offline_track_button'));
    const offlineTrackItems = Array.from(document.querySelectorAll('.offline_track_item'));
    const offlineSlides = Array.from(document.querySelectorAll('.offline_slide'));

    if (offlineSection && offlineTrackButtons.length && offlineTrackItems.length && offlineSlides.length) {
        let activeOfflineIndex = Math.max(offlineSlides.findIndex((slide) => slide.classList.contains('is-active')), 0);
        let isOfflineAnimating = false;
        const offlineDescriptionIcons = Array.from(document.querySelectorAll('.offline_description_icon'));
        const offlineCardWraps = offlineSlides.map((slide) => slide.querySelector('.offline_card_wrap')).filter(Boolean);
        const offlineDescriptions = offlineSlides.map((slide) => slide.querySelector('.offline_description')).filter(Boolean);
        const activeOfflineSlide = () => offlineSlides[activeOfflineIndex];
        const getOfflineEntranceTargets = () => {
            const activeSlide = activeOfflineSlide();

            if (!activeSlide) {
                return [];
            }

            const activeCard = activeSlide.querySelector('.offline_card_wrap');
            const activeInfo = activeSlide.querySelector('.offline_info');

            return [offlineInner, activeInfo, activeCard].filter(Boolean);
        };
        const setOfflineEntranceInitialState = () => {
            const targets = getOfflineEntranceTargets();

            gsap.killTweensOf(targets);

            if (prefersReducedMotion) {
                gsap.set(targets, {
                    clearProps: 'all'
                });
                return;
            }

            gsap.set(offlineInner, {
                autoAlpha: 0,
                y: 70
            });

            const activeSlide = activeOfflineSlide();
            const activeCard = activeSlide?.querySelector('.offline_card_wrap');
            const activeInfo = activeSlide?.querySelector('.offline_info');

            if (activeInfo) {
                gsap.set(activeInfo, {
                    autoAlpha: 0,
                    y: 38
                });
            }

            if (activeCard) {
                gsap.set(activeCard, {
                    autoAlpha: 0,
                    x: 72,
                    rotation: 9
                });
            }
        };
        const playOfflineEntrance = () => {
            if (prefersReducedMotion) {
                setOfflineEntranceInitialState();
                return;
            }

            const activeSlide = activeOfflineSlide();
            const activeCard = activeSlide?.querySelector('.offline_card_wrap');
            const activeInfo = activeSlide?.querySelector('.offline_info');

            gsap.timeline({
                defaults: {
                    ease: 'power3.out'
                }
            })
                .to(offlineInner, {
                    autoAlpha: 1,
                    y: 0,
                    duration: 0.55
                })
                .to(activeInfo ? [activeInfo] : [], {
                    autoAlpha: 1,
                    y: 0,
                    duration: 0.48
                }, '-=0.28')
                .to(activeCard ? [activeCard] : [], {
                    autoAlpha: 1,
                    x: 0,
                    rotation: 6.8,
                    duration: 0.72
                }, '-=0.24');
        };

        offlineDescriptionIcons.forEach((icon) => {
            icon.setAttribute('role', 'link');
            icon.setAttribute('tabindex', '0');
            icon.setAttribute('aria-label', 'Go to offline page');

            const navigateToOfflinePage = () => {
                window.location.href = '../offline/offline.html';
            };

            icon.addEventListener('click', navigateToOfflinePage);
            icon.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    navigateToOfflinePage();
                }
            });
        });

        const setOfflineTrackState = (nextIndex) => {
            offlineTrackItems.forEach((item, index) => {
                const isActive = index === nextIndex;
                item.classList.toggle('is-active', isActive);
            });

            offlineTrackButtons.forEach((button, index) => {
                if (index === nextIndex) {
                    button.setAttribute('aria-current', 'true');
                } else {
                    button.removeAttribute('aria-current');
                }
            });
        };

        const resetOfflineResponsiveState = () => {
            isOfflineAnimating = false;

            offlineSlides.forEach((slide, index) => {
                const isActive = index === activeOfflineIndex;
                slide.classList.toggle('is-active', isActive);
                slide.setAttribute('aria-hidden', String(!isActive));
            });

            gsap.killTweensOf([...offlineCardWraps, ...offlineDescriptions, ...offlineSlides]);

            gsap.set([...offlineCardWraps, ...offlineDescriptions, ...offlineSlides], {
                clearProps: 'xPercent,rotation,autoAlpha,x,y,zIndex'
            });

            setOfflineTrackState(activeOfflineIndex);
            setOfflineEntranceInitialState();
        };

        onResponsiveModeChange(() => {
            resetOfflineResponsiveState();
        });

        const animateOfflineTransition = (nextIndex) => {
            if (nextIndex === activeOfflineIndex || isOfflineAnimating) {
                return;
            }

            const currentSlide = offlineSlides[activeOfflineIndex];
            const nextSlide = offlineSlides[nextIndex];
            const currentCard = currentSlide.querySelector('.offline_card_wrap');
            const nextCard = nextSlide.querySelector('.offline_card_wrap');
            const currentInfo = currentSlide.querySelector('.offline_description');
            const nextInfo = nextSlide.querySelector('.offline_description');
            const direction = nextIndex > activeOfflineIndex ? 1 : -1;

            isOfflineAnimating = true;
            setOfflineTrackState(nextIndex);

            nextSlide.classList.add('is-active');
            nextSlide.setAttribute('aria-hidden', 'false');

            gsap.killTweensOf([currentCard, nextCard, currentInfo, nextInfo]);

            gsap.set(nextCard, {
                xPercent: direction > 0 ? 165 : -165,
                rotation: direction > 0 ? 14 : -14,
                autoAlpha: 1
            });

            if (nextInfo) {
                gsap.set(nextInfo, {
                    autoAlpha: 0,
                    x: direction > 0 ? 40 : -40
                });
            }

            gsap.set(currentCard, {
                xPercent: 0,
                rotation: 6.8,
                autoAlpha: 1
            });

            if (currentInfo) {
                gsap.set(currentInfo, {
                    autoAlpha: 1,
                    x: 0
                });
            }

            gsap.set(currentSlide, { zIndex: 1 });
            gsap.set(nextSlide, { zIndex: 2 });

            gsap.timeline({
                defaults: {
                    duration: prefersReducedMotion ? 0 : 0.72,
                    ease: 'power3.inOut'
                },
                onComplete: () => {
                    activeOfflineIndex = nextIndex;

                    offlineSlides.forEach((slide, index) => {
                        const isActive = index === nextIndex;
                        slide.classList.toggle('is-active', isActive);
                        slide.setAttribute('aria-hidden', String(!isActive));
                    });

                    gsap.set([currentCard, nextCard], {
                        clearProps: 'xPercent,rotation,autoAlpha'
                    });

                    gsap.set([currentInfo, nextInfo].filter(Boolean), {
                        clearProps: 'x,autoAlpha'
                    });

                    gsap.set(currentSlide, {
                        clearProps: 'zIndex'
                    });

                    gsap.set(nextSlide, {
                        clearProps: 'zIndex'
                    });

                    isOfflineAnimating = false;
                }
            })
                .to(nextCard, {
                    xPercent: direction > 0 ? -4 : 4,
                    rotation: direction > 0 ? 8.5 : -8.5,
                    duration: prefersReducedMotion ? 0 : 0.42,
                    ease: 'power4.in'
                }, 0)
                .to(currentCard, {
                    xPercent: direction > 0 ? -165 : 165,
                    rotation: direction > 0 ? -4 : 4,
                    autoAlpha: 0.88,
                    duration: prefersReducedMotion ? 0 : 0.52,
                    ease: 'power3.in'
                }, 0.16)
                .to(currentInfo ? [currentInfo] : [], {
                    autoAlpha: 0,
                    x: direction > 0 ? -48 : 48,
                    duration: prefersReducedMotion ? 0 : 0.3,
                    ease: 'power2.out'
                }, 0.12)
                .to(nextCard, {
                    xPercent: 0,
                    rotation: 6.8,
                    autoAlpha: 1,
                    duration: prefersReducedMotion ? 0 : 0.3,
                    ease: 'power2.out'
                }, 0.4)
                .to(nextInfo ? [nextInfo] : [], {
                    autoAlpha: 1,
                    x: 0,
                    duration: prefersReducedMotion ? 0 : 0.28,
                    ease: 'power2.out'
                }, 0.3);
        };

        setOfflineTrackState(activeOfflineIndex);
        setOfflineEntranceInitialState();

        ScrollTrigger.create({
            id: 'offline-enter',
            trigger: offlineSection,
            start: 'top 72%',
            invalidateOnRefresh: true,
            onEnter: () => {
                setOfflineEntranceInitialState();
                playOfflineEntrance();
            },
            onLeaveBack: () => {
                setOfflineEntranceInitialState();
            }
        });

        offlineTrackButtons.forEach((button, index) => {
            button.addEventListener('click', () => {
                animateOfflineTransition(index);
            });
        });
    }

    // ===== EVENT SECTION START =====
    const eventSection = document.querySelector('.event');
    const eventCardStack = eventSection?.querySelector('.event_card_stack');
    const eventCards = eventSection ? Array.from(eventSection.querySelectorAll('.event_card')) : [];
    const eventMoreActionButton = eventSection?.querySelector('.event_more_button');

    if (eventSection && eventCardStack && eventCards.length === 3) {
        const eventCardOrders = [
            [0, 1, 2],
            [1, 2, 0],
            [2, 0, 1]
        ];
        const eventDropDistance = 150;
        let activeEventOrderIndex = 0;
        let isEventTransitioning = false;
        let eventHintHidden = eventSection.classList.contains('is-event-hint-hidden');
        let eventNextZone = eventCardStack.querySelector('.event_click_zone_next');

        ScrollTrigger.getById('event-card-drop-sequence')?.kill();

        if (!eventNextZone) {
            eventNextZone = document.createElement('button');
            eventNextZone.type = 'button';
            eventNextZone.className = 'event_click_zone event_click_zone_next';
            eventNextZone.setAttribute('aria-label', 'Next event card');

            eventCardStack.append(eventNextZone);
        }

        const setEventStackOrder = (order) => {
            order.forEach((cardIndex, stackIndex) => {
                eventCards[cardIndex].style.zIndex = String(3 - stackIndex);
            });
        };

        const resetEventCardPositions = () => {
            gsap.set(eventCards, { y: 0 });
        };
        const setEventEntranceInitialState = () => {
            gsap.killTweensOf([...eventCards, eventCardStack, eventMoreActionButton].filter(Boolean));

            if (prefersReducedMotion) {
                gsap.set([...eventCards, eventCardStack, eventMoreActionButton].filter(Boolean), {
                    clearProps: 'all'
                });
                return;
            }

            gsap.set(eventCardStack, {
                autoAlpha: 1
            });

            gsap.set(eventCards, {
                autoAlpha: 0,
                y: 96
            });

            if (eventMoreActionButton) {
                gsap.set(eventMoreActionButton, {
                    autoAlpha: 0,
                    y: 36
                });
            }
        };
        const playEventEntrance = () => {
            if (prefersReducedMotion) {
                setEventEntranceInitialState();
                return;
            }

            gsap.timeline({
                defaults: {
                    ease: 'power3.out'
                }
            })
                .to(eventCards, {
                    autoAlpha: 1,
                    y: 0,
                    duration: 0.72,
                    stagger: 0.1
                })
                .to(eventMoreActionButton ? [eventMoreActionButton] : [], {
                    autoAlpha: 1,
                    y: 0,
                    duration: 0.45
                }, '-=0.28');
        };

        const applyEventOrder = (orderIndex) => {
            activeEventOrderIndex = ((orderIndex % eventCardOrders.length) + eventCardOrders.length) % eventCardOrders.length;
            resetEventCardPositions();
            setEventStackOrder(eventCardOrders[activeEventOrderIndex]);
        };

        const transitionEventOrder = (direction) => {
            if (isEventTransitioning) {
                return;
            }

             if (!eventHintHidden) {
                eventHintHidden = true;
                eventSection.classList.add('is-event-hint-hidden');
            }

            const currentOrderIndex = activeEventOrderIndex;
            const nextOrderIndex = ((activeEventOrderIndex + direction) % eventCardOrders.length + eventCardOrders.length) % eventCardOrders.length;
            const currentOrder = eventCardOrders[currentOrderIndex];
            const nextOrder = eventCardOrders[nextOrderIndex];
            const movingCard = eventCards[currentOrder[0]];

            if (!movingCard) {
                return;
            }

            if (prefersReducedMotion) {
                applyEventOrder(nextOrderIndex);
                return;
            }

            isEventTransitioning = true;
            resetEventCardPositions();
            setEventStackOrder(currentOrder);

            gsap.timeline({
                defaults: {
                    overwrite: 'auto'
                },
                onComplete: () => {
                    isEventTransitioning = false;
                    applyEventOrder(nextOrderIndex);
                }
            })
                .to(movingCard, {
                    y: eventDropDistance,
                    duration: 0.34,
                    ease: 'power2.in'
                })
                .add(() => {
                    setEventStackOrder(nextOrder);
                    gsap.set(movingCard, { y: eventDropDistance });
                })
                .to(movingCard, {
                    y: 0,
                    duration: 0.42,
                    ease: 'power2.out'
                });
        };

        applyEventOrder(0);
        setEventEntranceInitialState();

        ScrollTrigger.create({
            id: 'event-enter',
            trigger: eventSection,
            start: 'top 72%',
            invalidateOnRefresh: true,
            onEnter: () => {
                applyEventOrder(activeEventOrderIndex);
                setEventEntranceInitialState();
                playEventEntrance();
            },
            onLeaveBack: () => {
                applyEventOrder(activeEventOrderIndex);
                setEventEntranceInitialState();
            }
        });

        eventNextZone.addEventListener('click', () => {
            transitionEventOrder(1);
        });
    }
    // ===== EVENT SECTION END =====

});
