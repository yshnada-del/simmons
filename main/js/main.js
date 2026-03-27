document.addEventListener('DOMContentLoaded', () => {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const mainVisual = document.querySelector('.main_visual');
    const bannerWrap = document.querySelector('.banner_all');
    const storyKeywordConfigs = [
        { selector: '.story_keyword_classic', x: 32, y: -16, rotation: -2.4, scale: 1.06, duration: 3.6 },
        { selector: '.story_keyword_enduring', x: -42, y: 22, rotation: 2.1, scale: 1.1, duration: 4.2 },
        { selector: '.story_keyword_heritage', x: 28, y: 18, rotation: -1.8, scale: 1.05, duration: 3.9 },
        { selector: '.story_keyword_timeless', x: -34, y: -20, rotation: 2.5, scale: 1.08, duration: 4.5 },
        { selector: '.story_keyword_elegant', x: 38, y: -14, rotation: -2.2, scale: 1.09, duration: 4 },
        { selector: '.story_keyword_prestige', x: -30, y: 20, rotation: 1.9, scale: 1.07, duration: 4.4 }
    ];

    if (!prefersReducedMotion && mainVisual && bannerWrap) {
        const primaryBanner = bannerWrap.querySelector('.banner_primary');
        const bannerStack = bannerWrap.querySelector('.banner_stack');
        const secondaryBanners = bannerWrap.querySelectorAll('.banner_secondary');

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
                const scrollDistance = getScrollDistance();
                const { startOffset } = setInitialBannerState();

                ScrollTrigger.getById('main-visual-banner-pin')?.kill();
                gsap.killTweensOf([bannerWrap, secondaryBanners]);

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

    if (!prefersReducedMotion) {
        const storyKeywords = [];

        storyKeywordConfigs.forEach((config) => {
            const keyword = document.querySelector(config.selector);

            if (!keyword) {
                return;
            }

            const baseOpacity = Number.parseFloat(window.getComputedStyle(keyword).opacity) || 1;

            storyKeywords.push({ element: keyword, baseOpacity });

            gsap.to(keyword, {
                x: config.x,
                y: config.y,
                rotation: config.rotation,
                scale: config.scale,
                duration: config.duration,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut'
            });
        });

        if (storyKeywords.length) {
            const opacityTimeline = gsap.timeline({
                repeat: -1,
                repeatDelay: 0.18
            });

            storyKeywords.forEach(({ element, baseOpacity }) => {
                opacityTimeline
                    .to(element, {
                        opacity: 0,
                        duration: 0.6,
                        ease: 'sine.inOut'
                    })
                    .to(element, {
                        opacity: baseOpacity,
                        duration: 0.75,
                        ease: 'sine.inOut'
                    });
            });
        }
    }

    const productSection = document.querySelector('.product');
    const productCircle = document.querySelector('.product_circle');
    const productCircleSvg = document.querySelector('.product_circle_svg');
    const productCircleRotor = document.querySelector('.product_circle_rotor');
    const productCirclePieces = Array.from(document.querySelectorAll('.product_circle_piece'));
    const productSlides = Array.from(document.querySelectorAll('.product_slide'));
    const productPrevButton = document.querySelector('.product_scroll_arrow_up');
    const productNextButton = document.querySelector('.product_scroll_arrow_down');

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
        let dragStartAngle = 0;
        let dragStartRotation = currentProductRotation;

        const normalizeProductIndex = (index) => {
            return ((index % productSlides.length) + productSlides.length) % productSlides.length;
        };

        const getPointerAngle = (clientX, clientY) => {
            const rect = productCircle.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            return Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI);
        };

        const getNearestProductIndex = (rotation) => {
            const rawIndex = Math.round((productBaseRotation - rotation) / productRotationStep);
            return normalizeProductIndex(rawIndex);
        };

        const getRotationForIndex = (index) => {
            return productBaseRotation - (normalizeProductIndex(index) * productRotationStep);
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

        const setProductPieceState = (nextIndex) => {
            const activePiece = productActivePieceOrder[normalizeProductIndex(nextIndex)];

            productCirclePieces.forEach((piece) => {
                piece.classList.toggle('is-active', piece.dataset.piece === activePiece);
            });
        };

        const syncActiveProductToRotation = () => {
            const nextIndex = getNearestProductIndex(currentProductRotation);

            if (nextIndex !== activeProductIndex && !isProductAnimating) {
                activeProductIndex = nextIndex;
                setProductSlideState(nextIndex);
                setProductPieceState(nextIndex);
            }
        };

        const transitionProductSlide = (nextIndex, direction) => {
            if (nextIndex === activeProductIndex) {
                setProductSlideState(nextIndex);
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
            const targetRotation = getRotationForIndex(normalizedIndex);

            if (isProductAnimating || productSlides.length < 2) {
                return;
            }

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

        if (productPrevButton) {
            productPrevButton.addEventListener('click', () => {
                rotateToProductIndex(activeProductIndex - 1, -1);
            });
        }

        if (productNextButton) {
            productNextButton.addEventListener('click', () => {
                rotateToProductIndex(activeProductIndex + 1, 1);
            });
        }

        const handleProductPointerMove = (event) => {
            if (!isProductDragging) {
                return;
            }

            const nextAngle = getPointerAngle(event.clientX, event.clientY);
            const deltaAngle = nextAngle - dragStartAngle;
            setProductWheelRotation(dragStartRotation + deltaAngle);
            syncActiveProductToRotation();
        };

        const handleProductPointerUp = () => {
            if (!isProductDragging) {
                return;
            }

            isProductDragging = false;
            productCircle.classList.remove('is-dragging');
            syncActiveProductToRotation();

            window.removeEventListener('pointermove', handleProductPointerMove);
            window.removeEventListener('pointerup', handleProductPointerUp);
        };

        productCircle.addEventListener('pointerdown', (event) => {
            if (isProductAnimating) {
                return;
            }

            isProductDragging = true;
            dragStartAngle = getPointerAngle(event.clientX, event.clientY);
            dragStartRotation = currentProductRotation;
            productCircle.classList.add('is-dragging');
            productCircle.setPointerCapture?.(event.pointerId);

            window.addEventListener('pointermove', handleProductPointerMove);
            window.addEventListener('pointerup', handleProductPointerUp);
        });
    }

    const offlineTrackButtons = Array.from(document.querySelectorAll('.offline_track_button'));
    const offlineTrackItems = Array.from(document.querySelectorAll('.offline_track_item'));
    const offlineSlides = Array.from(document.querySelectorAll('.offline_slide'));

    if (offlineTrackButtons.length && offlineTrackItems.length && offlineSlides.length) {
        let activeOfflineIndex = Math.max(offlineSlides.findIndex((slide) => slide.classList.contains('is-active')), 0);
        let isOfflineAnimating = false;

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

        const animateOfflineTransition = (nextIndex) => {
            if (nextIndex === activeOfflineIndex || isOfflineAnimating) {
                return;
            }

            const currentSlide = offlineSlides[activeOfflineIndex];
            const nextSlide = offlineSlides[nextIndex];
            const currentCard = currentSlide.querySelector('.offline_card_wrap');
            const nextCard = nextSlide.querySelector('.offline_card_wrap');
            const currentInfo = currentSlide.querySelector('.offline_info');
            const nextInfo = nextSlide.querySelector('.offline_info');
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

            gsap.set(nextInfo, {
                autoAlpha: 0,
                x: direction > 0 ? 40 : -40
            });

            gsap.set(currentCard, {
                xPercent: 0,
                rotation: 6.8,
                autoAlpha: 1
            });

            gsap.set(currentInfo, {
                autoAlpha: 1,
                x: 0
            });

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

                    gsap.set([currentInfo, nextInfo], {
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
                .to(currentInfo, {
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
                .to(nextInfo, {
                    autoAlpha: 1,
                    x: 0,
                    duration: prefersReducedMotion ? 0 : 0.28,
                    ease: 'power2.out'
                }, 0.3);
        };

        setOfflineTrackState(activeOfflineIndex);

        offlineTrackButtons.forEach((button, index) => {
            button.addEventListener('click', () => {
                animateOfflineTransition(index);
            });
        });
    }
});
