gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', () => {
    const bestSection = document.querySelector('.best');
    const bestAll = document.querySelector('.best_all');
    const nameCards = document.querySelectorAll('.more .name');
    let bestTween = null;
    const bestScrollStartDelay = 180;

    const setupBestScroll = () => {
        if (!bestSection || !bestAll) return;

        if (bestTween) {
            bestTween.scrollTrigger.kill();
            bestTween.kill();
            bestTween = null;
            gsap.set(bestAll, { clearProps: 'transform' });
        }

        if (window.innerWidth <= 1024) return;

        const totalWidth = () => Math.max(bestAll.scrollWidth - window.innerWidth, 0);

        bestTween = gsap.to(bestAll, {
            x: () => -totalWidth(),
            ease: 'none',
            scrollTrigger: {
                trigger: bestSection,
                start: () => `top top-=${bestScrollStartDelay}`,
                end: () => '+=' + bestAll.scrollWidth,
                scrub: true,
                pin: true,
                anticipatePin: 1,
                invalidateOnRefresh: true
            }
        });
    };

    const syncCardSlider = (card) => {
        const track = card.querySelector('.slider_track');
        const sliderViewport = card.querySelector('.slider_viewport');
        const bullets = card.querySelectorAll('.bullet');
        const slides = card.querySelectorAll('.slide');
        const activeIndex = Number(card.dataset.currentIndex ?? 0);
        const currentIndex = activeIndex > -1 ? activeIndex : 0;

        if (!track || !sliderViewport || !slides.length) return;

        const slideWidth = sliderViewport.clientWidth;
        slides.forEach((slide) => {
            slide.style.width = `${slideWidth}px`;
        });
        track.style.width = `${slideWidth * slides.length}px`;
        track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;

        bullets.forEach((bullet, index) => {
            bullet.classList.toggle('active', index === currentIndex);
        });
    };

    setupBestScroll();

    nameCards.forEach((card) => {
        const tab = card.querySelector('.tab');
        if (tab) {
            tab.addEventListener('click', () => {
                if (card.classList.contains('active')) return;

                nameCards.forEach((item) => item.classList.remove('active'));
                card.classList.add('active');

                requestAnimationFrame(() => {
                    syncCardSlider(card);
                    ScrollTrigger.refresh();
                });
            });
        }

        const track = card.querySelector('.slider_track');
        if (!track) return;

        const prevBtn = card.querySelector('.icon_all.prev');
        const nextBtn = card.querySelector('.icon_all.next');
        const bullets = card.querySelectorAll('.bullet');
        const sliderViewport = card.querySelector('.slider_viewport');
        const slides = card.querySelectorAll('.slide');
        const slideCount = slides.length;
        let currentIndex = Number(card.dataset.currentIndex ?? 0);

        const updateSlider = () => {
            card.dataset.currentIndex = String(currentIndex);
            syncCardSlider(card);
        };

        if (nextBtn) {
            nextBtn.addEventListener('click', (event) => {
                event.stopPropagation();
                currentIndex = (currentIndex + 1) % slideCount;
                updateSlider();
            });
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', (event) => {
                event.stopPropagation();
                currentIndex = (currentIndex - 1 + slideCount) % slideCount;
                updateSlider();
            });
        }

        bullets.forEach((bullet, index) => {
            bullet.addEventListener('click', (event) => {
                event.stopPropagation();
                currentIndex = index;
                updateSlider();
            });
        });

        slides.forEach((slide) => {
            slide.style.flexShrink = '0';
        });

        updateSlider();
    });

    window.addEventListener('resize', () => {
        setupBestScroll();
        nameCards.forEach((card) => syncCardSlider(card));
        ScrollTrigger.refresh();
    });
});
