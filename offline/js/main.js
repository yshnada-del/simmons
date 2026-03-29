document.addEventListener('DOMContentLoaded', () => {
    gsap.registerPlugin(ScrollTrigger);

    // Section 1 Load Animation
    const section1Tl = gsap.timeline();
    section1Tl.to(".offline_main_visual .main_title", {
        y: 0,
        opacity: 1,
        duration: 1.2,
        ease: "power3.out"
    })
        .to(".offline_main_visual .sub_text", {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: "power3.out"
        }, "-=0.8");

    // ===========================
    // Main Visual Background Slider
    // ===========================
    const slides = gsap.utils.toArray('.offline_main_visual .slide');
    const paginationItems = gsap.utils.toArray('.offline_main_visual .pagination_item');

    function updatePagination(activeIndex) {
        paginationItems.forEach((item, index) => {
            item.classList.toggle('active', index === activeIndex);
        });
    }

    if (slides.length > 0) {
        // Initial state for the first slide
        gsap.set(slides[0], { opacity: 1, zIndex: 1, scale: 1.1 });
        updatePagination(0);

        let currentIdx = 0;
        const totalSlides = slides.length;
        const slideDuration = 3.5; // Time each slide is shown clearly
        const fadeDuration = 1.5; // Crossfade duration

        function nextSlide() {
            const currentSlide = slides[currentIdx];
            currentIdx = (currentIdx + 1) % totalSlides;
            const next = slides[currentIdx];
            updatePagination(currentIdx);

            // Prepare next slide (hidden, zoomed in)
            gsap.set(next, { opacity: 0, zIndex: 1, scale: 1.1 });
            // Move current slide to background z-index
            gsap.set(currentSlide, { zIndex: 0 });

            // Crossfade
            gsap.to(currentSlide, { opacity: 0, duration: fadeDuration, ease: "power2.inOut" });
            gsap.to(next, { opacity: 1, duration: fadeDuration, ease: "power2.inOut" });

            // Zoom next slide out slowly
            gsap.to(next, { scale: 1, duration: slideDuration + fadeDuration, ease: "none" });

            // Schedule the next transition
            gsap.delayedCall(slideDuration, nextSlide);
        }

        // Start the first slide's zoom animation
        gsap.to(slides[0], { scale: 1, duration: slideDuration + fadeDuration, ease: "none" });
        // Schedule the very first transition
        gsap.delayedCall(slideDuration, nextSlide);
    }


    // ===========================
    // Reusable Carousel Function
    // ===========================
    function createCardCarousel(sectionClass, card1, card2, card3, bufferDuration) {
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: `${sectionClass} .part_cards`,
                start: "top top",
                end: "+=3000",
                pin: true,
                scrub: 1,
            }
        });

        // 0. Scroll Buffer (Dead space before animation starts)
        tl.to({}, { duration: bufferDuration });

        // 1. Entrance Sequence: Text boxes
        tl.to(`${sectionClass} .left_content`, {
            y: 0, opacity: 1, duration: 0.5,
        })
            .to(`${sectionClass} .right_content`, {
                y: 0, opacity: 1, duration: 0.5,
            }, "-=0.3");

        // 2. Carousel Card Animation Properties
        const leftProps = { x: -100, y: 40, rotate: -15, scale: 0.85, filter: "blur(1px) grayscale(0.8)", zIndex: 2, duration: 1, ease: "power2.inOut" };
        const centerProps = { x: 0, y: 0, rotate: 0, scale: 1, filter: "blur(0px) grayscale(0)", zIndex: 3, duration: 1, ease: "power2.inOut" };
        const rightProps = { x: 100, y: 40, rotate: 15, scale: 0.85, filter: "blur(1px) grayscale(0.8)", zIndex: 1, duration: 1, ease: "power2.inOut" };

        const c1 = `${sectionClass} ${card1}`;
        const c2 = `${sectionClass} ${card2}`;
        const c3 = `${sectionClass} ${card3}`;

        // Step 1: c1 -> Left, c2 -> Center, c3 -> Right
        tl.to(c1, leftProps, "shuffle1")
            .to(c2, centerProps, "shuffle1")
            .to(c3, rightProps, "shuffle1");

        // Step 2: c2 -> Left, c3 -> Center, c1 -> Right
        tl.to(c2, leftProps, "shuffle2")
            .to(c3, centerProps, "shuffle2")
            .to(c1, rightProps, "shuffle2");

        // Step 3: c3 -> Left, c1 -> Center, c2 -> Right
        tl.to(c3, leftProps, "shuffle3")
            .to(c1, centerProps, "shuffle3")
            .to(c2, rightProps, "shuffle3");

        return tl;
    }

    // Initialize Carousels
    createCardCarousel(".factory", ".card1", ".card2", ".card3", 0.5);
    createCardCarousel(".terrace", ".card4", ".card5", ".card6", 0.6);

    // ===========================
    // Part 3 Image Entrance
    // ===========================
    const partImages = gsap.utils.toArray('.factory .part_image, .terrace .part_image');

    partImages.forEach((partImage) => {
        gsap.fromTo(partImage, {
            y: -100,
        }, {
            y: 0,
            duration: 0.75,
            ease: "power3.out",
            scrollTrigger: {
                trigger: partImage,
                start: 'top 78%',
                toggleActions: 'play none none none',
            }
        });
    });

    // ===========================
    // Gallery Section Animation
    // ===========================
    const gallery = document.querySelector('.gallery');
    const galleryInner = document.querySelector('.gallery_inner');
    const galleryCards = gsap.utils.toArray('.gallery .gal_img');
    const galleryCardInners = gsap.utils.toArray('.gallery .gal_card_inner');
    const galleryCardsWrap = document.querySelector('.gallery .gal_images');
    const isMobile = window.matchMedia('(max-width: 960px)').matches;

    if (gallery && galleryInner && galleryCardsWrap && galleryCards.length > 0) {
        const galleryStyles = getComputedStyle(galleryCardsWrap);
        const galleryGap = parseFloat(galleryStyles.getPropertyValue('--gal_gap')) || 24;
        const galleryCardWidth = galleryCards[0]?.getBoundingClientRect().width || 0;
        const galleryFanOffset = Math.min(galleryCardWidth * 0.18, 78);
        const gallerySpreadOffset = galleryCardWidth + galleryGap;

        const fanState = [
            { x: isMobile ? 0 : -galleryFanOffset, y: isMobile ? 120 : 220, rotateZ: -16, scale: 0.94, zIndex: 3 },
            { x: 0, y: isMobile ? 140 : 246, rotateZ: 0, scale: 0.92, zIndex: 2 },
            { x: isMobile ? 0 : galleryFanOffset, y: isMobile ? 160 : 220, rotateZ: 16, scale: 0.94, zIndex: 1 },
        ];

        const spreadState = [
            { x: isMobile ? 0 : -gallerySpreadOffset, y: isMobile ? -24 : -10, rotateZ: 0, scale: 1, zIndex: 1 },
            { x: 0, y: isMobile ? 0 : -26, rotateZ: 0, scale: 1.02, zIndex: 3 },
            { x: isMobile ? 0 : gallerySpreadOffset, y: isMobile ? 24 : -10, rotateZ: 0, scale: 1, zIndex: 2 },
        ];

        gsap.set(".gal_maintitle, .gal_subtext, .gallery .find_store", {
            y: 100,
            opacity: 0,
        });

        galleryCards.forEach((card, index) => {
            gsap.set(card, {
                xPercent: isMobile ? 0 : -50,
                yPercent: isMobile ? 0 : -50,
                x: fanState[index].x,
                y: fanState[index].y,
                opacity: 0,
                rotateZ: fanState[index].rotateZ,
                scale: fanState[index].scale,
                zIndex: fanState[index].zIndex,
            });
        });

        gsap.set(galleryCardInners, {
            rotateY: 0,
        });

        const galleryTimeline = gsap.timeline({
            scrollTrigger: {
                trigger: gallery,
                start: "top top",
                end: isMobile ? "+=1800" : "+=2700",
                scrub: 1,
                pin: isMobile ? false : galleryInner,
                anticipatePin: 1,
            }
        });

        galleryTimeline.to(".gal_maintitle, .gal_subtext, .gallery .find_store", {
            y: 0,
            opacity: 1,
            duration: 0.45,
            stagger: 0.12,
            ease: "power3.out"
        });

        galleryCards.forEach((card, index) => {
            galleryTimeline.to(card, {
                y: isMobile ? index * 4 : 0,
                opacity: 1,
                scale: 1,
                rotateZ: index === 0 ? -8 : index === 2 ? 8 : 0,
                duration: 0.55,
                ease: "power3.out",
            }, 0.18 + index * 0.16);
        });

        galleryCards.forEach((card, index) => {
            galleryTimeline.to(card, {
                x: spreadState[index].x,
                y: spreadState[index].y,
                rotateZ: spreadState[index].rotateZ,
                scale: spreadState[index].scale,
                zIndex: spreadState[index].zIndex,
                duration: 0.72,
                ease: "power2.inOut",
            }, 0.9 + index * 0.14);
        });

        galleryCardInners.forEach((cardInner, index) => {
            galleryTimeline.to(cardInner, {
                rotateY: 180,
                duration: 0.7,
                ease: "power2.inOut",
            }, 0.92 + index * 0.14);
        });

        if (!isMobile) {
            galleryTimeline.to(".gal_images", {
                y: -10,
                duration: 0.28,
                ease: "power2.out",
            }, 1.58);
        }

        galleryTimeline.to({}, {
            duration: 0.42,
        });
    }

    // ===========================
    // Info Section Card Entrance
    // ===========================
    const infoCards = gsap.utils.toArray('.info_sec .rv_card');

    if (infoCards.length > 0) {
        gsap.fromTo(infoCards, {
            y: -90,
        }, {
            y: 0,
            duration: 0.75,
            stagger: 0.2,
            ease: "power3.out",
            scrollTrigger: {
                trigger: '.info_sec',
                start: 'top 72%',
                toggleActions: 'play none none none',
            }
        });

        infoCards.forEach((card) => {
            card.addEventListener('mouseenter', () => {
                gsap.to(card, {
                    y: -40,
                    duration: 0.35,
                    ease: "power3.out",
                    overwrite: 'auto',
                });
            });

            card.addEventListener('mouseleave', () => {
                gsap.to(card, {
                    y: 0,
                    duration: 0.35,
                    ease: "power3.out",
                    overwrite: 'auto',
                });
            });
        });
    }
});
