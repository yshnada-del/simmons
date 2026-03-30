document.addEventListener('DOMContentLoaded', () => {
    const accordionItems = document.querySelectorAll('.accordion_item');
    const innovationSection = document.querySelector('.innovation');
    const innovationView = document.querySelector('.innovation .view');
    const infoTextBox = document.querySelector('.innovation .info_text_box');
    const innovationCards = document.querySelectorAll('.innovation .card');
    const innovationVideo = document.querySelector('.innovation .video video');
    const innovationHeading = document.querySelector('.innovation .tit h3');
    const techSection = document.querySelector('.tech');
    const techHeading = document.querySelector('.tech .tit h3');
    const techLayers = document.querySelectorAll('.tech .tech_layer');
    const withSection = document.querySelector('.with');
    const withTextBox = document.querySelector('.with_text_box');
    const withCards = document.querySelectorAll('.with_card');
    const reviewSection = document.querySelector('.review');
    const reviewTextBox = document.querySelector('.review_text_box');
    const reviewMore = document.querySelector('.review_more');
    const reviewLeft = document.querySelector('.review_left');
    const reviewRight = document.querySelector('.review_right');
    const reviewItems = document.querySelectorAll('.review_item');
    const reviewCards = document.querySelectorAll('.review_preview_card');

    const closeAccordion = (item) => {
        const head = item.querySelector('.accordion_head');
        const body = item.querySelector('.accordion_body');

        if (!body || !item.classList.contains('is_open')) {
            item.classList.remove('is_open');
            head?.setAttribute('aria-expanded', 'false');
            return;
        }

        body.style.display = 'block';
        body.style.height = `${body.scrollHeight}px`;
        body.offsetHeight;
        item.classList.remove('is_open');
        head?.setAttribute('aria-expanded', 'false');
        body.style.height = '0px';
        body.style.opacity = '0';

        const handleCloseEnd = (event) => {
            if (event.propertyName !== 'height') {
                return;
            }

            body.style.display = 'none';
            body.style.height = '';
            body.removeEventListener('transitionend', handleCloseEnd);
        };

        body.addEventListener('transitionend', handleCloseEnd);
    };

    const openAccordion = (item) => {
        const head = item.querySelector('.accordion_head');
        const body = item.querySelector('.accordion_body');

        if (!body) {
            return;
        }

        item.classList.add('is_open');
        head?.setAttribute('aria-expanded', 'true');
        body.style.display = 'block';
        body.style.height = '0px';
        body.style.opacity = '0';
        body.offsetHeight;
        body.style.height = `${body.scrollHeight}px`;
        body.style.opacity = '1';

        const handleOpenEnd = (event) => {
            if (event.propertyName !== 'height') {
                return;
            }

            body.style.height = 'auto';
            body.removeEventListener('transitionend', handleOpenEnd);
        };

        body.addEventListener('transitionend', handleOpenEnd);
    };

    accordionItems.forEach((item) => {
        const head = item.querySelector('.accordion_head');
        const btn = item.querySelector('.accordion_btn');
        const toggleAccordion = () => {
            const isOpen = item.classList.contains('is_open');

            accordionItems.forEach((el) => {
                if (el !== item) {
                    closeAccordion(el);
                }
            });

            if (isOpen) {
                closeAccordion(item);
            } else {
                openAccordion(item);
            }
        };

        if (head) {
            head.setAttribute('role', 'button');
            head.setAttribute('tabindex', '0');
            head.setAttribute('aria-expanded', item.classList.contains('is_open') ? 'true' : 'false');
            head.addEventListener('click', toggleAccordion);
            head.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    toggleAccordion();
                }
            });
        }

        btn?.addEventListener('click', (event) => {
            event.stopPropagation();
            toggleAccordion();
        });

        const body = item.querySelector('.accordion_body');

        if (body) {
            if (item.classList.contains('is_open')) {
                body.style.display = 'block';
                body.style.height = 'auto';
                body.style.opacity = '1';
            } else {
                body.style.display = 'none';
                body.style.height = '0px';
                body.style.opacity = '0';
            }
        }
    });

    if (reviewItems.length && reviewCards.length) {
        const setActiveReview = (targetId) => {
            reviewItems.forEach((item) => {
                item.classList.toggle('is_active', item.dataset.reviewTarget === targetId);
            });

            reviewCards.forEach((card) => {
                card.classList.toggle('is_active', card.id === targetId);
            });
        };

        reviewItems.forEach((item) => {
            const targetId = item.dataset.reviewTarget;

            item.addEventListener('mouseenter', () => setActiveReview(targetId));
            item.addEventListener('focusin', () => setActiveReview(targetId));
        });
    }

    if (innovationVideo) {
        innovationVideo.muted = true;
        innovationVideo.playsInline = true;

        const tryPlayVideo = () => {
            const playPromise = innovationVideo.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(() => {
                    innovationVideo.setAttribute('controls', 'controls');
                });
            }
        };

        if (innovationVideo.readyState >= 2) {
            tryPlayVideo();
        } else {
            innovationVideo.addEventListener('loadeddata', tryPlayVideo, { once: true });
        }
    }

    if (
        innovationSection &&
        innovationView &&
        infoTextBox &&
        innovationCards.length &&
        window.gsap &&
        window.ScrollTrigger
    ) {
        gsap.registerPlugin(ScrollTrigger);

        const setInnovationScroll = () => {
            const firstCard = innovationCards[0];
            const cardsHeight = infoTextBox.scrollHeight;
            const viewHeight = innovationView.clientHeight;
            const firstCardHeight = firstCard ? firstCard.offsetHeight : 0;
            const initialOffset = Math.max((viewHeight - firstCardHeight) / 2 - 24, 0);
            const travelDistance = Math.max(cardsHeight - viewHeight + initialOffset + 120, 0);

            ScrollTrigger.getById('innovation-cards')?.kill();
            gsap.killTweensOf(infoTextBox);

            gsap.set(infoTextBox, { y: initialOffset });
            gsap.set(innovationCards, { y: 0 });

            gsap.to(infoTextBox, {
                y: -(travelDistance - initialOffset),
                ease: 'none',
                scrollTrigger: {
                    id: 'innovation-cards',
                    trigger: innovationHeading || innovationSection,
                    start: 'top top+=80',
                    end: () => `+=${Math.max(travelDistance + window.innerHeight * 0.35, window.innerHeight * 1.2)}`,
                    scrub: 0.35,
                    pin: innovationSection,
                    pinSpacing: true,
                    anticipatePin: 1,
                    fastScrollEnd: true,
                    invalidateOnRefresh: true
                }
            });
        };

        setInnovationScroll();
        ScrollTrigger.addEventListener('refreshInit', setInnovationScroll);
        window.addEventListener('resize', () => ScrollTrigger.refresh());
    }

    if (techSection && techLayers.length && window.gsap && window.ScrollTrigger) {
        gsap.registerPlugin(ScrollTrigger);

        const techMedia = gsap.matchMedia();

        techMedia.add('(min-width: 961px)', () => {
            const rightLayers = Array.from(techLayers).filter((layer) => layer.dataset.direction === 'right');
            const leftLayers = Array.from(techLayers).filter((layer) => layer.dataset.direction === 'left');
            const leftTriggerLayer = leftLayers[1] || leftLayers[0];
            let rightPlayed = false;
            let rightCompleted = false;
            let leftEligible = false;
            let leftPlayed = false;
            let leftTriggerInstance;
            let rightTriggerCreated = false;
            const rightTimeline = gsap.timeline({
                paused: true,
                defaults: {
                    ease: 'power2.out'
                }
            });
            const leftTimeline = gsap.timeline({
                paused: true,
                defaults: {
                    ease: 'power2.out'
                }
            });

            techLayers.forEach((layer) => {
                const direction = layer.dataset.direction === 'left' ? -1 : 1;
                const visual = layer.querySelector('.tech_visual');
                const copy = layer.querySelector('.tech_copy');
                const line = layer.querySelector('.tech_line');
                const targetTimeline = direction === 1 ? rightTimeline : leftTimeline;

                gsap.set(visual, {
                    /* 숨김정도 */
                    xPercent: direction * 36,
                    autoAlpha: 0
                });
                gsap.set(copy, {
                    autoAlpha: 0,
                    y: 18
                });
                gsap.set(line, {
                    scaleX: 0,
                    autoAlpha: 0
                });

                const framePosition = 0;

                targetTimeline.to(visual, {
                    /* 최종 도착하는 위치 더 바깥으로 가ㄹ려면 높이고 안으로 가려면 낮추고 */
                    xPercent: direction * 16,
                    autoAlpha: 1,
                    duration: 0.82
                }, framePosition);

                targetTimeline.to(line, {
                    scaleX: 1,
                    autoAlpha: 1,
                    duration: 0.3
                }, framePosition + 0.36);

                targetTimeline.to(copy, {
                    autoAlpha: 1,
                    y: 0,
                    duration: 0.45
                }, framePosition + 0.44);
            });

            const playLeftTimeline = () => {
                if (leftPlayed) {
                    return;
                }

                leftPlayed = true;
                leftTimeline.play();
            };

            const playRightTimeline = () => {
                if (rightPlayed) {
                    return;
                }

                rightPlayed = true;
                rightTimeline.play();
            };

            rightTimeline.eventCallback('onComplete', () => {
                rightCompleted = true;

                if (leftEligible || leftTriggerInstance?.isActive) {
                    playLeftTimeline();
                }
            });

            ScrollTrigger.create({
                id: 'tech-section-enter',
                trigger: techSection,
                start: 'top 85%',
                once: true,
                onEnter: () => {
                    if (!rightTriggerCreated && techHeading && rightLayers.length) {
                        rightTriggerCreated = true;

                        ScrollTrigger.create({
                            id: 'tech-right-layers',
                            trigger: techHeading,
                            start: 'top 42%',
                            once: true,
                            onEnter: playRightTimeline
                        });
                    }
                }
            });

            if (leftTriggerLayer && leftLayers.length) {
                leftTriggerInstance = ScrollTrigger.create({
                    id: 'tech-left-layers',
                    trigger: leftTriggerLayer,
                    start: 'top 52%',
                    once: false,
                    onEnter: () => {
                        leftEligible = true;

                        if (rightCompleted) {
                            playLeftTimeline();
                        }
                    },
                    onEnterBack: () => {
                        leftEligible = true;

                        if (rightCompleted) {
                            playLeftTimeline();
                        }
                    }
                });
            }
        });

        techMedia.add('(max-width: 960px)', () => {
            techLayers.forEach((layer) => {
                const visual = layer.querySelector('.tech_visual');
                const copy = layer.querySelector('.tech_copy');
                const line = layer.querySelector('.tech_line');

                gsap.set(visual, { xPercent: 0, autoAlpha: 1 });
                gsap.set(copy, { autoAlpha: 1, y: 0 });
                gsap.set(line, { scaleX: 1, scaleY: 1, autoAlpha: 1 });
            });
        });
    }

    if (withSection && withTextBox && withCards.length && window.gsap && window.ScrollTrigger) {
        gsap.registerPlugin(ScrollTrigger);

        const withMedia = gsap.matchMedia();

        withMedia.add('(min-width: 961px)', () => {
            const cards = Array.from(withCards);
            const dotsByCard = cards.map((card) => Array.from(card.querySelectorAll('.with_dot')));
            const allDots = dotsByCard.flat();
            const withTimeline = gsap.timeline({
                paused: true,
                defaults: {
                    ease: 'power2.out'
                }
            });
            const breathingTweens = [];
            let hasPlayed = false;

            gsap.set(withTextBox, {
                autoAlpha: 0,
                y: 34
            });

            cards.forEach((card) => {
                gsap.set(card, {
                    autoAlpha: 0,
                    y: 48,
                    scale: 0.985
                });
            });

            dotsByCard.forEach((dots) => {
                if (!dots.length) {
                    return;
                }

                gsap.set(dots, {
                    autoAlpha: 0,
                    scale: 0.82
                });
            });

            withTimeline.to(withTextBox, {
                autoAlpha: 1,
                y: 0,
                duration: 1.2
            });

            cards.forEach((card, index) => {
                withTimeline.to(card, {
                    autoAlpha: 1,
                    y: 0,
                    scale: 1,
                    duration: index === 0 ? 1.28 : 1.08
                }, index === 0 ? '+=0.18' : '>-0.56');
            });

            if (allDots.length) {
                withTimeline.to(allDots, {
                    autoAlpha: 1,
                    duration: 0.38
                }, '>-0.02');

                withTimeline.to(allDots, {
                    scale: 1.18,
                    duration: 0.32
                }, '<');

                withTimeline.to(allDots, {
                    scale: 0.82,
                    duration: 0.54,
                    ease: 'power2.out'
                }, '>');
            }

            withTimeline.eventCallback('onComplete', () => {
                allDots.forEach((dot, index) => {
                    const tween = gsap.to(dot, {
                        scale: 0.9,
                        duration: 1.9 + index * 0.08,
                        repeat: -1,
                        yoyo: true,
                        ease: 'sine.inOut',
                        delay: index * 0.16
                    });

                    breathingTweens.push(tween);
                });
            });

            ScrollTrigger.create({
                id: 'with-section-enter',
                trigger: withTextBox,
                start: 'top 18%',
                once: true,
                onEnter: () => {
                    if (hasPlayed) {
                        return;
                    }

                    hasPlayed = true;
                    withTimeline.play();
                }
            });

            return () => {
                ScrollTrigger.getById('with-section-enter')?.kill();
                breathingTweens.forEach((tween) => tween.kill());
                withTimeline.kill();
            };
        });

        withMedia.add('(max-width: 960px)', () => {
            gsap.set(withTextBox, { clearProps: 'all' });
            gsap.set(withCards, { clearProps: 'all' });
            gsap.set('.with_dot', { clearProps: 'all' });
        });
    }

    if (
        reviewSection &&
        reviewTextBox &&
        reviewLeft &&
        reviewRight &&
        window.gsap &&
        window.ScrollTrigger
    ) {
        gsap.registerPlugin(ScrollTrigger);

        const reviewMedia = gsap.matchMedia();

        reviewMedia.add('(min-width: 961px)', () => {
            const reviewTimeline = gsap.timeline({
                paused: true,
                defaults: {
                    ease: 'power2.out'
                }
            });
            let hasPlayed = false;

            gsap.set(reviewTextBox, {
                autoAlpha: 0,
                y: 34
            });

            if (reviewMore) {
                gsap.set(reviewMore, {
                    autoAlpha: 0,
                    y: 24
                });
            }

            gsap.set(reviewLeft, {
                autoAlpha: 0,
                y: 48,
                scale: 0.985
            });

            gsap.set(reviewRight, {
                autoAlpha: 0,
                y: 48,
                scale: 0.985
            });

            reviewTimeline.to(reviewTextBox, {
                autoAlpha: 1,
                y: 0,
                duration: 1.2
            });

            if (reviewMore) {
                reviewTimeline.to(reviewMore, {
                    autoAlpha: 1,
                    y: 0,
                    duration: 0.9
                }, '<+0.1');
            }

            reviewTimeline.to(reviewLeft, {
                autoAlpha: 1,
                y: 0,
                scale: 1,
                duration: 1.16
            }, '+=0.18');

            reviewTimeline.to(reviewRight, {
                autoAlpha: 1,
                y: 0,
                scale: 1,
                duration: 1.08
            }, '>-0.64');

            ScrollTrigger.create({
                id: 'review-section-enter',
                trigger: reviewTextBox,
                start: 'top 18%',
                once: true,
                onEnter: () => {
                    if (hasPlayed) {
                        return;
                    }

                    hasPlayed = true;
                    reviewTimeline.play();
                }
            });

            return () => {
                ScrollTrigger.getById('review-section-enter')?.kill();
                reviewTimeline.kill();
            };
        });

        reviewMedia.add('(max-width: 960px)', () => {
            gsap.set(reviewTextBox, { clearProps: 'all' });
            gsap.set(reviewMore, { clearProps: 'all' });
            gsap.set(reviewLeft, { clearProps: 'all' });
            gsap.set(reviewRight, { clearProps: 'all' });
        });
    }
}); //dom end
