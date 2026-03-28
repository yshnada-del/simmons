document.addEventListener('DOMContentLoaded', () => {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const mainVisual = document.querySelector('.main_visual');
    const bannerWrap = document.querySelector('.banner_all');

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

    const storySection = document.querySelector('.story');
    const storyInner = document.querySelector('.story_inner');
    const storyImage = document.querySelector('.story_image');
    const storyKeywords = Array.from(document.querySelectorAll('.story_keyword'));
    const storyButton = document.querySelector('.story_button');

    if (storySection && storyInner && storyImage && storyKeywords.length && storyButton) {
        const setStoryFloatingState = (isActive) => {
            storyInner.classList.toggle('is-keywords-active', isActive);
        };

        const storyKeywordStates = storyKeywords.map((keyword) => ({
            element: keyword,
            baseOpacity: Number.parseFloat(window.getComputedStyle(keyword).opacity) || 1
        }));

        const setReducedMotionStoryState = () => {
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

        if (prefersReducedMotion) {
            setReducedMotionStoryState();
        } else {
            buildStoryScroll();
            window.addEventListener('resize', () => {
                buildStoryScroll();
                ScrollTrigger.refresh();
            });
        }
    }

    const sleepSolutionSection = document.querySelector('.sleep_solution');
    const sleepSolutionLabel = document.querySelector('.sleep_solution .txt_s');
    const sleepSolutionTitle = document.querySelector('.sleep_solution .txt_b');
    const sleepSolutionTitleText = sleepSolutionTitle?.querySelector('span');
    const sleepSolutionImage = document.querySelector('.sleep_solution .img');
    const sleepSolutionButton = document.querySelector('.sleep_solution .btn_test');

    if (!prefersReducedMotion && sleepSolutionSection && sleepSolutionTitle && sleepSolutionTitleText && sleepSolutionImage) {
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

        const sleepSolutionTimeline = gsap.timeline({
            scrollTrigger: {
                trigger: sleepSolutionSection,
                start: 'top 72%',
                toggleActions: 'play none none none'
            },
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
        let dragStartVector = null;
        let dragStartPoint = null;
        const productDragStepThreshold = 24;

        const normalizeProductIndex = (index) => {
            return ((index % productSlides.length) + productSlides.length) % productSlides.length;
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

        const setProductPieceState = (nextIndex) => {
            const activePiece = productActivePieceOrder[normalizeProductIndex(nextIndex)];

            productCirclePieces.forEach((piece) => {
                piece.classList.toggle('is-active', piece.dataset.piece === activePiece);
            });
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

            if (isProductAnimating || productSlides.length < 2) {
                return;
            }

            if (normalizedIndex === activeProductIndex) {
                return;
            }

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
                rotateToProductIndex(activeProductIndex + 1, 1);
            } else {
                rotateToProductIndex(activeProductIndex - 1, -1);
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
    const reviewCards = Array.from(document.querySelectorAll('.review_card'));
    const reviewCardSlots = Array.from(document.querySelectorAll('.review_card_slot'));
    const reviewFilterOptions = Array.from(document.querySelectorAll('.review_filter_option'));
    const reviewHeadings = Array.from(document.querySelectorAll('.review_card_heading'));
    const reviewImages = Array.from(document.querySelectorAll('.review_card_image img'));

    if (reviewSection && reviewCards.length && reviewCardSlots.length && reviewFilterOptions.length && reviewHeadings.length && reviewImages.length) {
        const reviewContentByCategory = {
            products: {
                heading: 'PRODUCTS<br>REVIEW',
                images: [
                    {
                        src: '../img/main_review.png',
                        alt: 'Products review mattress photo 1'
                    },
                    {
                        src: '../img/main_review2.png',
                        alt: 'Products review mattress photo 2'
                    },
                    {
                        src: '../img/main_review3.png',
                        alt: 'Products review mattress photo 3'
                    },
                    {
                        src: '../img/main_review4.png',
                        alt: 'Products review mattress photo 4'
                    }
                ]
            },
            offline: {
                heading: 'OFFLINE<br>REVIEW',
                images: [
                    {
                        src: '../img/main_review5.png',
                        alt: 'Offline review photo 1'
                    },
                    {
                        src: '../img/main_review6.png',
                        alt: 'Offline review photo 2'
                    },
                    {
                        src: '../img/main_review7.png',
                        alt: 'Offline review photo 3'
                    },
                    {
                        src: '../img/main_review8.png',
                        alt: 'Offline review photo 4'
                    }
                ]
            }
        };
        let activeReviewCategory = reviewFilterOptions.find((option) => option.classList.contains('is-active'))?.dataset.reviewCategory || 'products';
        let isReviewTransitioning = false;
        let reviewScrollTrigger = null;
        let reviewCardTravelDistances = [];
        const reviewCardBaseRotations = reviewCards.map((card) => {
            const computedTransform = window.getComputedStyle(card).transform;

            if (computedTransform && computedTransform !== 'none') {
                const matrixValues = computedTransform.match(/matrix\(([^)]+)\)/);

                if (matrixValues) {
                    const [a, b] = matrixValues[1].split(',').map((value) => Number.parseFloat(value.trim()));
                    return Math.round(Math.atan2(b, a) * (180 / Math.PI) * 100) / 100;
                }
            }

            return 0;
        });
        const reviewRevealStepDelay = 0.2;
        const reviewRevealStepDuration = 0.28;
        let reviewLastProgress = 0;

        const measureReviewCardTravelDistances = () => {
            reviewCards.forEach((card, index) => {
                gsap.set(card, {
                    x: 0,
                    y: 0,
                    rotate: reviewCardBaseRotations[index],
                    rotateY: 0,
                    scale: 1,
                    opacity: 1
                });
            });

            reviewCardTravelDistances = reviewCardSlots.map((slot) => {
                const rect = slot.getBoundingClientRect();
                return Math.max(window.innerWidth - rect.left + 96, 220);
            });
        };

        const setReviewCardVisualState = (card, index, progress) => {
            const clampedProgress = gsap.utils.clamp(0, 1, progress);
            const easedProgress = gsap.parseEase('sine.inOut')(clampedProgress);
            const baseRotation = reviewCardBaseRotations[index];
            const travelDistance = reviewCardTravelDistances[index] || (window.innerWidth * 0.9);

            gsap.set(card, {
                x: gsap.utils.interpolate(travelDistance, 0, easedProgress),
                y: 0,
                opacity: 1,
                rotate: baseRotation,
                scale: 1
            });
        };

        const syncReviewCardsToScroll = (progress = 0) => {
            reviewLastProgress = gsap.utils.clamp(0, 1, progress);
            const revealProgress = reviewLastProgress;

            reviewCards.forEach((card, index) => {
                const delay = index * reviewRevealStepDelay;
                const cardProgress = gsap.utils.clamp(0, 1, (revealProgress - delay) / reviewRevealStepDuration);
                setReviewCardVisualState(card, index, cardProgress);
            });
        };

        const startReviewCardMotion = (progress = reviewScrollTrigger?.progress || reviewLastProgress || 0) => {
            syncReviewCardsToScroll(progress);
            reviewCards.forEach((card) => {
                gsap.set(card, {
                    rotateY: 0
                });
            });
        };

        const syncReviewCategoryToCurrentScroll = () => {
            const nextProgress = reviewScrollTrigger?.progress ?? reviewLastProgress ?? 0;
            reviewLastProgress = gsap.utils.clamp(0, 1, nextProgress);
            startReviewCardMotion(reviewLastProgress);
        };

        const setReviewCategory = (category) => {
            const nextContent = reviewContentByCategory[category];

            if (!nextContent) {
                return;
            }

            reviewFilterOptions.forEach((option) => {
                const isActive = option.dataset.reviewCategory === category;
                option.classList.toggle('is-active', isActive);
                option.setAttribute('aria-pressed', String(isActive));
            });

            reviewHeadings.forEach((heading) => {
                heading.innerHTML = nextContent.heading;
            });

            reviewImages.forEach((image, index) => {
                const nextImage = nextContent.images[index];

                if (!nextImage) {
                    return;
                }

                image.src = nextImage.src;
                image.alt = nextImage.alt;
            });
        };

        const animateReviewCategoryChange = (category) => {
            if (isReviewTransitioning || category === activeReviewCategory) {
                return;
            }

            isReviewTransitioning = true;

            let completedCards = 0;

            reviewCards.forEach((card, index) => {
                const baseRotation = reviewCardBaseRotations[index];

                gsap.killTweensOf(card);
                gsap.set(card, {
                    rotate: baseRotation,
                    rotateY: 0
                });

                gsap.timeline({
                    delay: index * 0.08,
                    onComplete: () => {
                        completedCards += 1;

                        if (completedCards === reviewCards.length) {
                            activeReviewCategory = category;
                            isReviewTransitioning = false;
                            reviewScrollTrigger?.refresh();
                            syncReviewCategoryToCurrentScroll();
                        }
                    }
                })
                    .to(card, {
                        rotateY: 90,
                        duration: 0.34,
                        ease: 'power2.in'
                    })
                    .add(() => {
                        if (index === 0) {
                            setReviewCategory(category);
                        }

                        gsap.set(card, {
                            rotate: baseRotation,
                            rotateY: -90
                        });
                    })
                    .to(card, {
                        rotateY: 0,
                        duration: 0.42,
                        ease: 'power2.out'
                    });
            });
        };

        setReviewCategory(activeReviewCategory);
        measureReviewCardTravelDistances();
        startReviewCardMotion();

        reviewScrollTrigger = ScrollTrigger.create({
            id: 'review-cards-sequence',
            trigger: reviewSection,
            start: 'top top',
            end: () => `+=${window.innerHeight * 3.4}`,
            scrub: 1,
            pin: true,
            pinSpacing: true,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
                if (isReviewTransitioning) {
                    return;
                }

                syncReviewCardsToScroll(self.progress);
            },
            onRefreshInit: () => {
                measureReviewCardTravelDistances();
            },
            onRefresh: (self) => {
                if (isReviewTransitioning) {
                    return;
                }

                syncReviewCardsToScroll(self.progress);
            }
        });

        reviewFilterOptions.forEach((option) => {
            option.addEventListener('click', () => {
                animateReviewCategoryChange(option.dataset.reviewCategory);
            });
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

    const eventSection = document.querySelector('.event');
    const eventCards = Array.from(document.querySelectorAll('.event_card'));
    const eventMoreButton = document.querySelector('.event_more_button');

    if (!prefersReducedMotion && eventSection && eventCards.length === 3 && eventMoreButton) {
        const eventCardOrders = [
            [0, 1, 2],
            [1, 2, 0],
            [2, 0, 1],
            [0, 1, 2]
        ];
        const eventDropDistance = 150;
        const eventCardPhasePortion = 0.78;
        let eventLastProgress = 0;

        const setEventStackOrder = (order) => {
            order.forEach((cardIndex, stackIndex) => {
                eventCards[cardIndex].style.zIndex = String(3 - stackIndex);
            });
        };

        const renderEventSequence = (progress) => {
            eventLastProgress = gsap.utils.clamp(0, 1, progress);
            const cardPhaseProgress = gsap.utils.clamp(0, 1, eventLastProgress / eventCardPhasePortion);

            if (cardPhaseProgress >= 1) {
                eventCards.forEach((card) => {
                    gsap.set(card, { y: 0 });
                });
                setEventStackOrder(eventCardOrders[eventCardOrders.length - 1]);
            } else {
                const segmentCount = eventCardOrders.length - 1;
                const scaledProgress = gsap.utils.clamp(0, segmentCount - 0.0001, cardPhaseProgress * segmentCount);
                const segmentIndex = Math.floor(scaledProgress);
                const localProgress = scaledProgress - segmentIndex;
                const currentOrder = eventCardOrders[segmentIndex];
                const nextOrder = eventCardOrders[segmentIndex + 1];
                const movingCard = eventCards[currentOrder[0]];

                eventCards.forEach((card) => {
                    gsap.set(card, { y: 0 });
                });

                if (localProgress < 0.5) {
                    setEventStackOrder(currentOrder);
                    gsap.set(movingCard, {
                        y: gsap.utils.interpolate(0, eventDropDistance, localProgress * 2)
                    });
                } else {
                    setEventStackOrder(nextOrder);
                    gsap.set(movingCard, {
                        y: gsap.utils.interpolate(eventDropDistance, 0, (localProgress - 0.5) * 2)
                    });
                }
            }

            const buttonProgress = gsap.utils.clamp(0, 1, (eventLastProgress - eventCardPhasePortion) / (1 - eventCardPhasePortion));
            gsap.set(eventMoreButton, {
                autoAlpha: buttonProgress,
                y: gsap.utils.interpolate(48, 0, buttonProgress)
            });
        };

        gsap.set(eventMoreButton, {
            autoAlpha: 0,
            y: 48
        });

        renderEventSequence(0);

        ScrollTrigger.create({
            id: 'event-card-drop-sequence',
            trigger: eventSection,
            start: 'top top',
            end: () => `+=${window.innerHeight * 2.6}`,
            scrub: 1,
            pin: true,
            pinSpacing: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
                renderEventSequence(self.progress);
            },
            onRefreshInit: () => {
                renderEventSequence(eventLastProgress);
            },
            onRefresh: (self) => {
                renderEventSequence(self.progress);
            }
        });
    }

});
