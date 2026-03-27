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
    // Gallery Section Animation
    // ===========================
    gsap.to(".gal_maintitle, .gal_subtext, .gallery .find_store", {
        scrollTrigger: {
            trigger: ".gallery",
            start: "top 60%", // Starts when the top of gallery hits 60% of viewport
            toggleActions: "play none none reverse"
        },
        y: 0,
        opacity: 1,
        duration: 1,
        stagger: 0.2,
        ease: "power3.out"
    });
});