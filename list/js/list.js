gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', () => {
    // 1. Banner Floating Interaction (이미 CSS로 구현됨, 필요시 JS로 보완 가능)
    
    // 2. Best Section Horizontal Scroll
    const bestSection = document.querySelector('.best');
    const bestAll = document.querySelector('.best_all');

    if (bestSection && bestAll) {
        // 이동해야 할 거리는 (전체 트랙의 너비 - 보여지는 화면의 너비) 입니다.
        const totalWidth = () => bestAll.scrollWidth - window.innerWidth;

        gsap.to(bestAll, {
            x: () => -totalWidth(),
            ease: 'none',
            scrollTrigger: {
                trigger: bestSection,
                start: 'top top',
                end: () => '+=' + bestAll.scrollWidth,
                scrub: true,
                pin: true,
                anticipatePin: 1,
                invalidateOnRefresh: true, // 화면 크기 변경 시 재계산
            }
        });
    }

    // 3. More Section Accordion Interaction
    const nameCards = document.querySelectorAll('.more .name');
    nameCards.forEach(card => {
        card.addEventListener('click', () => {
            if (card.classList.contains('active')) return;
            nameCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            
            // GSAP/ScrollTrigger refresh to handle layout changes if needed
            // Delay to allow CSS flex transition (0.6s) to completely finish smoothly without jank
            setTimeout(() => {
                ScrollTrigger.refresh();
            }, 600);
        });

        // Carousels
        const track = card.querySelector('.slider_track');
        if (track) {
            const prevBtn = card.querySelector('.icon_all.prev');
            const nextBtn = card.querySelector('.icon_all.next');
            const bullets = card.querySelectorAll('.bullet');
            const slideCount = card.querySelectorAll('.slide').length;
            let currentIndex = 0;

            const updateSlider = () => {
                track.style.transform = `translateX(-${currentIndex * 835}px)`;
                bullets.forEach((b, i) => {
                    if(i === currentIndex) b.classList.add('active');
                    else b.classList.remove('active');
                });
            };

            if (nextBtn) {
                nextBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    currentIndex = (currentIndex + 1) % slideCount;
                    updateSlider();
                });
            }

            if (prevBtn) {
                prevBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    currentIndex = (currentIndex - 1 + slideCount) % slideCount;
                    updateSlider();
                });
            }

            bullets.forEach((bullet, i) => {
                bullet.addEventListener('click', (e) => {
                    e.stopPropagation();
                    currentIndex = i;
                    updateSlider();
                });
            });
        }
    });

    // 4. Resize Event
    window.addEventListener('resize', () => ScrollTrigger.refresh());
});