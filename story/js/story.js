document.addEventListener('DOMContentLoaded', () => {
    if (!window.gsap || !window.ScrollTrigger) {
        return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const storyTransition = document.querySelector('.story_transition');
    const storyScene = document.querySelector('.story_transition_scene');
    const aboutSection = document.querySelector('.about');
    const collage = document.querySelector('.img_all');
    const historySection = document.querySelector('.history');
    const historyCards = gsap.utils.toArray('.history_cards_section .card');
    const technologySection = document.querySelector('.technology');
    const technologyInner = document.querySelector('.technology_inner');
    const technologyTitle = document.querySelector('.technology_title');
    const technologyImages = gsap.utils.toArray('.technology_img');
    const tec2Section = document.querySelector('.tec2');
    const tec2Inner = document.querySelector('.tec2_inner');
    const tec2Images = gsap.utils.toArray('.tec2_image');
    const tec2Lines = gsap.utils.toArray('.tec2_line');
    const tec2TextBlocks = gsap.utils.toArray('.tec2_txt_all');
    const philosophyCards = gsap.utils.toArray('.philosophy_card');
    const philosophyStage = document.querySelector('.philosophy_all');
    const productSection = document.querySelector('.product');
    const productAll = document.querySelector('.product_all');
    const technologyScrollStartDelay = 360;
    const productScrollStartDelay = 320;
    const pieces = gsap.utils.toArray('.about_piece');
    const isDesktop = window.matchMedia('(min-width: 1281px)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let productTween = null;

    const setupPhilosophyInteraction = () => {
        if (!philosophyStage || !philosophyCards.length) {
            return;
        }

        const closeAll = () => {
            philosophyStage.classList.remove('has_expanded');
            philosophyStage.removeAttribute('data-active-card');

            philosophyCards.forEach((card) => {
                card.classList.remove('is_expanded');
                const trigger = card.querySelector('.philosophy_trigger');
                const expanded = card.querySelector('.philosophy_expanded');

                if (trigger) {
                    trigger.setAttribute('aria-expanded', 'false');
                }

                if (expanded) {
                    expanded.hidden = true;
                }
            });
        };

        const activateCard = (card) => {
            if (!card) {
                return;
            }

            const trigger = card.querySelector('.philosophy_trigger');
            const expanded = card.querySelector('.philosophy_expanded');
            const activeCardName = Array.from(card.classList).find((className) => className.startsWith('philosophy_card_') && className !== 'philosophy_card');

            closeAll();

            philosophyStage.classList.add('has_expanded');
            if (activeCardName) {
                philosophyStage.setAttribute('data-active-card', activeCardName.replace('philosophy_card_', ''));
            }
            card.classList.add('is_expanded');

            if (trigger) {
                trigger.setAttribute('aria-expanded', 'true');
            }

            if (expanded) {
                expanded.hidden = false;
            }
        };

        const defaultCard = philosophyStage.querySelector('.philosophy_card_comfort');

        philosophyCards.forEach((card) => {
            const trigger = card.querySelector('.philosophy_trigger');
            const expanded = card.querySelector('.philosophy_expanded');

            if (!trigger || !expanded) {
                return;
            }

            expanded.hidden = true;

            trigger.addEventListener('click', () => {
                const isExpanded = card.classList.contains('is_expanded');

                if (isExpanded) {
                    if (defaultCard) {
                        activateCard(defaultCard);
                    }
                    return;
                }

                activateCard(card);
            });

            expanded.addEventListener('click', (event) => {
                if (event.target === expanded) {
                    if (defaultCard) {
                        activateCard(defaultCard);
                    }
                }
            });
        });

        if (defaultCard) {
            activateCard(defaultCard);
        }
    };

    setupPhilosophyInteraction();

    if (!storyTransition || !storyScene || !aboutSection || !collage || !historySection || pieces.length !== 6) {
        return;
    }

    if (!isDesktop || prefersReducedMotion) {
        gsap.set(historySection, {
            clearProps: 'all'
        });
        gsap.set(historyCards, {
            clearProps: 'all'
        });
        gsap.set('.history_cards_section .card_inner, .history_cards_section .card_img img', {
            clearProps: 'all'
        });
        gsap.set(technologyImages, {
            clearProps: 'all'
        });
        gsap.set(technologyTitle, {
            clearProps: 'all'
        });
        gsap.set(tec2Images, {
            clearProps: 'all'
        });
        gsap.set(tec2Lines, {
            clearProps: 'all'
        });
        gsap.set(tec2TextBlocks, {
            clearProps: 'all'
        });
        gsap.set(philosophyCards, {
            clearProps: 'all'
        });
        gsap.set(productAll, {
            clearProps: 'all'
        });
        gsap.set(collage, {
            clearProps: 'all'
        });
        gsap.set(pieces, {
            clearProps: 'all'
        });
        return;
    }

    const circleCenter = { x: 395, y: 466.5 };
    const basePushDistance = 168;
    const pushDistanceSteps = [1.08, 1.16, 1.16, 1.08, 1.2, 1.2];
    const technologyClusterOffsets = [
        { x: -92, y: -98, rotation: -26, scale: 0.62, zIndex: 2 },
        { x: 0, y: -18, rotation: 38, scale: 0.92, zIndex: 1 },
        { x: 88, y: -42, rotation: 28, scale: 0.62, zIndex: 3 },
        { x: -98, y: 48, rotation: -82, scale: 0.58, zIndex: 1 },
        { x: 0, y: 108, rotation: -22, scale: 0.8, zIndex: 6 },
        { x: 96, y: 52, rotation: -58, scale: 0.58, zIndex: 4 }
    ];

    const pieceOffsets = pieces.map((piece, index) => {
        const bbox = piece.getBBox();
        const pieceCenterX = bbox.x + (bbox.width / 2);
        const pieceCenterY = bbox.y + (bbox.height / 2);
        const deltaX = pieceCenterX - circleCenter.x;
        const deltaY = pieceCenterY - circleCenter.y;
        const distance = Math.hypot(deltaX, deltaY) || 1;
        const directionX = deltaX / distance;
        const directionY = deltaY / distance;
        const pushDistance = basePushDistance * pushDistanceSteps[index];

        return {
            x: directionX * pushDistance,
            y: directionY * pushDistance
        };
    });

    gsap.set(collage, {
        scale: 1,
        autoAlpha: 1,
        transformOrigin: '50% 50%'
    });

    gsap.set(pieces, {
        x: 0,
        y: 0,
        scale: 1,
        autoAlpha: 1,
        transformOrigin: '50% 50%',
        svgOrigin: '395 466.5',
        willChange: 'transform'
    });

    gsap.set(historySection, {
        yPercent: 18,
        autoAlpha: 1,
        willChange: 'transform'
    });

    const aboutTimeline = gsap.timeline({
        scrollTrigger: {
            trigger: storyTransition,
            start: 'top top',
            end: '+=120%',
            scrub: 0.7,
            pin: storyScene,
            anticipatePin: 1,
            invalidateOnRefresh: true
        }
    });

    aboutTimeline
        .to(collage, {
            scale: 1.03,
            duration: 0.35,
            ease: 'none'
        })
        .to(
            pieces,
            {
                x: (index) => pieceOffsets[index].x,
                y: (index) => pieceOffsets[index].y,
                scale: 1,
                duration: 1.15,
                ease: 'none',
                stagger: {
                    each: 0.02,
                    from: 'center'
                }
            },
            0.05
        )
        .to(
            collage,
            {
                scale: 1.08,
                duration: 0.7,
                ease: 'none'
            },
            0.3
        )
        .to(
            pieces,
            {
                autoAlpha: 0,
                duration: 0.55,
                ease: 'none',
                stagger: {
                    each: 0.02,
                    from: 'end'
                }
            },
            1.1
        )
        .to(
            collage,
            {
                autoAlpha: 0,
                scale: 1.12,
                duration: 0.62,
                ease: 'none'
            },
            1.12
        )
        .to(
            historySection,
            {
                yPercent: 8,
                duration: 0.68,
                ease: 'none'
            },
            0.88
        )
        .to(
            historySection,
            {
                yPercent: 0,
                duration: 0.72,
                ease: 'none'
            },
            1.08
        )
        .to(
            {},
            {
                duration: 0.08
            }
        );

    if (historyCards.length) {
        historyCards.forEach((card, index) => {
            const nextEl = index < historyCards.length - 1
                ? historyCards[index + 1]
                : document.querySelector('.technology');
            const cardInner = card.querySelector('.card_inner');
            const cardImage = card.querySelector('.card_img img');

            if (!nextEl || !cardInner) {
                return;
            }

            gsap.fromTo(
                cardInner,
                {
                    yPercent: 0,
                    z: 0,
                    rotationX: 0,
                    transformPerspective: 1000,
                    transformOrigin: '50% 100%',
                    force3D: true
                },
                {
                    yPercent: -50,
                    z: -320,
                    rotationX: 52,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: nextEl,
                        start: 'top 85%',
                        end: 'top -75%',
                        scrub: true,
                        pin: card,
                        pinSpacing: false,
                        invalidateOnRefresh: true
                    }
                }
            );

            gsap.to(cardInner, {
                '--card-overlay-opacity': 0.22,
                ease: 'none',
                scrollTrigger: {
                    trigger: nextEl,
                    start: 'top 75%',
                    end: 'top -25%',
                    scrub: true,
                    invalidateOnRefresh: true
                }
            });

            gsap.to(card, {
                '--card-bg-opacity': 1,
                ease: 'none',
                scrollTrigger: {
                    trigger: nextEl,
                    start: 'top 85%',
                    end: 'top -45%',
                    scrub: true,
                    invalidateOnRefresh: true
                }
            });

            gsap.fromTo(
                cardInner,
                {
                    autoAlpha: 1
                },
                {
                    autoAlpha: 0,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: nextEl,
                        start: 'top 18%',
                        end: 'top -75%',
                        scrub: true,
                        invalidateOnRefresh: true
                    }
                }
            );

            if (cardImage) {
                gsap.fromTo(
                    cardImage,
                    {
                        '--image-scale': 1
                    },
                    {
                        '--image-scale': 1.03,
                        ease: 'none',
                        scrollTrigger: {
                            trigger: nextEl,
                            start: 'top 85%',
                            end: 'top -75%',
                            scrub: true,
                            invalidateOnRefresh: true
                        }
                    }
                );
            }

        });
    }

    if (technologySection && technologyInner && technologyTitle && technologyImages.length) {
        const technologyFallDistance = 760;
        const getTechnologyTargetPosition = (element, index) => {
            const target = technologyClusterOffsets[index];
            const innerCenterX = technologyInner.offsetWidth / 2;
            const innerCenterY = technologyInner.offsetHeight / 2;
            const imageCenterX = element.offsetLeft + (element.offsetWidth / 2);
            const imageCenterY = element.offsetTop + (element.offsetHeight / 2);

            return {
                x: (innerCenterX - imageCenterX) + target.x,
                y: (innerCenterY - imageCenterY) + target.y
            };
        };

        technologyImages.forEach((image, index) => {
            const rotateValue = getComputedStyle(image).getPropertyValue('--rotate').trim();
            const initialRotation = Number.parseFloat(rotateValue) || 0;
            const target = technologyClusterOffsets[index];

            gsap.set(image, {
                x: 0,
                y: 0,
                scale: 1,
                autoAlpha: 1,
                rotation: initialRotation,
                transformOrigin: '50% 50%',
                zIndex: target ? target.zIndex : index + 1
            });
        });

        gsap.set(technologyTitle, {
            autoAlpha: 0.7,
            scale: 1.08,
            transformOrigin: '50% 50%',
            willChange: 'transform'
        });

        const technologyTimeline = gsap.timeline({
            scrollTrigger: {
                trigger: technologySection,
                start: `top+=${technologyScrollStartDelay} top`,
                end: '+=190%',
                scrub: 0.8,
                pin: true,
                anticipatePin: 1,
                invalidateOnRefresh: true
            }
        });

        technologyTimeline
            .to(
                technologyImages,
                {
                    x: (index, element) => getTechnologyTargetPosition(element, index).x,
                    y: (index, element) => getTechnologyTargetPosition(element, index).y,
                    rotation: (index) => technologyClusterOffsets[index].rotation,
                    scale: (index) => technologyClusterOffsets[index].scale,
                    ease: 'none',
                    stagger: {
                        each: 0.02,
                        from: 'center'
                    }
                },
                0
            )
            .to(
                technologyTitle,
                {
                    autoAlpha: 1,
                    scale: 1,
                    ease: 'none'
                },
                0.14
            )
            .to(
                {},
                {
                    duration: 0.22
                }
            )
            .to(
                technologyImages,
                {
                    y: (index, element) => getTechnologyTargetPosition(element, index).y + technologyFallDistance,
                    autoAlpha: 0,
                    ease: 'none',
                    stagger: 0
                },
                0.66
            )
            ;
    }

    if (tec2Section && tec2Inner && tec2Images.length) {
        const tec2ClusterOffsets = [
            { ...technologyClusterOffsets[4], zIndex: 6 },
            { ...technologyClusterOffsets[0], zIndex: 2 },
            { ...technologyClusterOffsets[5], zIndex: 4 },
            { ...technologyClusterOffsets[1], zIndex: 1 },
            { ...technologyClusterOffsets[3], zIndex: 3 },
            { ...technologyClusterOffsets[2], zIndex: 5 }
        ];
        const tec2RiseDistance = 380;
        const tec2OvershootDistance = 48;
        const tec2SettleDistance = 18;
        const tec2ExpandedOffsetY = 240;
        const tec2TextDirections = [-180, 180, -180, 180];
        const tec2LineScaleX = [1, -1, 1, -1];
        const getTec2ClusterPosition = (element, index) => {
            const target = tec2ClusterOffsets[index];
            const innerCenterX = tec2Inner.offsetWidth / 2;
            const innerCenterY = tec2Inner.offsetHeight / 2;
            const imageCenterX = element.offsetLeft + (element.offsetWidth / 2);
            const imageCenterY = element.offsetTop + (element.offsetHeight / 2);

            return {
                x: (innerCenterX - imageCenterX) + target.x,
                y: (innerCenterY - imageCenterY) + target.y
            };
        };

        tec2Images.forEach((image, index) => {
            const clusterTarget = tec2ClusterOffsets[index];
            const startPosition = getTec2ClusterPosition(image, index);

            gsap.set(image, {
                x: startPosition.x,
                y: startPosition.y + tec2RiseDistance,
                rotation: clusterTarget.rotation,
                scale: clusterTarget.scale,
                autoAlpha: 1,
                transformOrigin: '50% 50%',
                zIndex: clusterTarget.zIndex + 10
            });
        });

        gsap.set(tec2Lines, {
            y: 0,
            autoAlpha: 0,
            zIndex: 1,
            scaleX: (index) => tec2LineScaleX[index] * 0.72,
            scaleY: 0.72,
            transformOrigin: '50% 50%'
        });

        gsap.set(tec2TextBlocks, {
            x: (index) => tec2TextDirections[index],
            y: 0,
            autoAlpha: 0
        });

        const tec2Timeline = gsap.timeline({
            scrollTrigger: {
                trigger: tec2Section,
                start: 'top top',
                end: '+=220%',
                scrub: 0.85,
                pin: true,
                anticipatePin: 1,
                invalidateOnRefresh: true
            }
        });

        tec2Timeline
            .to(
                tec2Images,
                {
                    y: (index, element) => getTec2ClusterPosition(element, index).y,
                    ease: 'none',
                    stagger: 0
                },
                0
            )
            .to(
                tec2Images,
                {
                    y: (index, element) => getTec2ClusterPosition(element, index).y - tec2OvershootDistance,
                    ease: 'none',
                    stagger: 0
                },
                0.08
            )
            .to(
                tec2Images,
                {
                    y: (index, element) => getTec2ClusterPosition(element, index).y + tec2SettleDistance,
                    ease: 'none',
                    stagger: 0
                },
                0.14
            )
            .to(
                tec2Images,
                {
                    x: 0,
                    y: tec2ExpandedOffsetY,
                    rotation: 0,
                    scale: 1,
                    ease: 'none',
                    stagger: {
                        each: 0.014,
                        from: 0
                    }
                },
                0.2
            )
            .to(
                tec2Lines,
                {
                    y: tec2ExpandedOffsetY,
                    autoAlpha: 1,
                    scaleX: (index) => tec2LineScaleX[index],
                    scaleY: 1,
                    ease: 'none',
                    stagger: 0.02
                },
                0.3
            )
            .to(
                tec2TextBlocks,
                {
                    x: 0,
                    y: tec2ExpandedOffsetY,
                    autoAlpha: 1,
                    ease: 'none',
                    stagger: 0.04
                },
                0.38
            );
    }

    const setupProductScroll = () => {
        if (!productSection || !productAll) {
            return;
        }

        if (productTween) {
            productTween.scrollTrigger.kill();
            productTween.kill();
            productTween = null;
            gsap.set(productAll, { clearProps: 'transform' });
        }

        const totalWidth = () => Math.max(productAll.scrollWidth - productSection.clientWidth, 0);

        productTween = gsap.to(productAll, {
            x: () => -totalWidth(),
            ease: 'none',
            scrollTrigger: {
                trigger: productSection,
                start: () => `top top-=${productScrollStartDelay}`,
                end: () => '+=' + totalWidth(),
                scrub: true,
                pin: true,
                anticipatePin: 1,
                invalidateOnRefresh: true
            }
        });
    };

    setupProductScroll();

    window.addEventListener('resize', () => {
        setupProductScroll();
        ScrollTrigger.refresh();
    });

});

