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

    // Factory Section Sequence
    const factoryTl = gsap.timeline({
        scrollTrigger: {
            trigger: ".factory .part_cards",
            start: "top top",
            end: "+=3000",
            pin: true,
            scrub: 1,
        }
    });

    // 0. Scroll Buffer (Dead space before animation starts)
    factoryTl.to({}, { duration: 0.5 });

    // 1. Entrance Sequence: Text boxes
    factoryTl.to(".factory .left_content", {
        y: 0,
        opacity: 1,
        duration: 0.5,
    })
        .to(".factory .right_content", {
            y: 0,
            opacity: 1,
            duration: 0.5,
        }, "-=0.3");

    // 2. Carousel Card Animation
    // Step 1: Card 1 -> Left, Card 2 -> Center, Card 3 -> Right
    factoryTl.to(".factory .card1", {
        x: -100, y: 40, rotate: -15, scale: 0.85, opacity: 0.7, zIndex: 2, duration: 1, ease: "power2.inOut"
    }, "shuffle1")
        .to(".factory .card2", {
            x: 0, y: 0, rotate: 0, scale: 1, opacity: 1, zIndex: 3, duration: 1, ease: "power2.inOut"
        }, "shuffle1")
        .to(".factory .card3", {
            x: 100, y: 40, rotate: 15, scale: 0.85, opacity: 0.7, zIndex: 1, duration: 1, ease: "power2.inOut"
        }, "shuffle1");

    // Step 2: Card 2 -> Left, Card 3 -> Center, Card 1 -> Right
    factoryTl.to(".factory .card2", {
        x: -100, y: 40, rotate: -15, scale: 0.85, opacity: 0.7, zIndex: 2, duration: 1, ease: "power2.inOut"
    }, "shuffle2")
        .to(".factory .card3", {
            x: 0, y: 0, rotate: 0, scale: 1, opacity: 1, zIndex: 3, duration: 1, ease: "power2.inOut"
        }, "shuffle2")
        .to(".factory .card1", {
            x: 100, y: 40, rotate: 15, scale: 0.85, opacity: 0.7, zIndex: 1, duration: 1, ease: "power2.inOut"
        }, "shuffle2");

    // Step 3: Card 3 -> Left, Card 1 -> Center, Card 2 -> Right
    factoryTl.to(".factory .card3", {
        x: -100, y: 40, rotate: -15, scale: 0.85, opacity: 0.7, zIndex: 2, duration: 1, ease: "power2.inOut"
    }, "shuffle3")
        .to(".factory .card1", {
            x: 0, y: 0, rotate: 0, scale: 1, opacity: 1, zIndex: 3, duration: 1, ease: "power2.inOut"
        }, "shuffle3")
        .to(".factory .card2", {
            x: 100, y: 40, rotate: 15, scale: 0.85, opacity: 0.7, zIndex: 1, duration: 1, ease: "power2.inOut"
        }, "shuffle3");

    // ===========================
    // Terrace Section Sequence
    // ===========================
    const terraceTl = gsap.timeline({
        scrollTrigger: {
            trigger: ".terrace .part_cards",
            start: "top top",
            end: "+=3000",
            pin: true,
            scrub: 1,
        }
    });

    // 0. Scroll Buffer
    terraceTl.to({}, { duration: 0.6 });

    // 1. Entrance Sequence: Text boxes
    terraceTl.to(".terrace .left_content", {
        y: 0, opacity: 1, duration: 0.5,
    })
        .to(".terrace .right_content", {
            y: 0, opacity: 1, duration: 0.5,
        }, "-=0.3");

    // 2. Carousel Card Animation
    // Step 1: Card 4 -> Left, Card 5 -> Center, Card 6 -> Right
    terraceTl.to(".terrace .card4", {
        x: -100, y: 40, rotate: -15, scale: 0.85, opacity: 0.7, zIndex: 2, duration: 1, ease: "power2.inOut"
    }, "t_shuffle1")
        .to(".terrace .card5", {
            x: 0, y: 0, rotate: 0, scale: 1, opacity: 1, zIndex: 3, duration: 1, ease: "power2.inOut"
        }, "t_shuffle1")
        .to(".terrace .card6", {
            x: 100, y: 40, rotate: 15, scale: 0.85, opacity: 0.7, zIndex: 1, duration: 1, ease: "power2.inOut"
        }, "t_shuffle1");

    // Step 2: Card 5 -> Left, Card 6 -> Center, Card 4 -> Right
    terraceTl.to(".terrace .card5", {
        x: -100, y: 40, rotate: -15, scale: 0.85, opacity: 0.7, zIndex: 2, duration: 1, ease: "power2.inOut"
    }, "t_shuffle2")
        .to(".terrace .card6", {
            x: 0, y: 0, rotate: 0, scale: 1, opacity: 1, zIndex: 3, duration: 1, ease: "power2.inOut"
        }, "t_shuffle2")
        .to(".terrace .card4", {
            x: 100, y: 40, rotate: 15, scale: 0.85, opacity: 0.7, zIndex: 1, duration: 1, ease: "power2.inOut"
        }, "t_shuffle2");

    // Step 3: Card 6 -> Left, Card 4 -> Center, Card 5 -> Right
    terraceTl.to(".terrace .card6", {
        x: -100, y: 40, rotate: -15, scale: 0.85, opacity: 0.7, zIndex: 2, duration: 1, ease: "power2.inOut"
    }, "t_shuffle3")
        .to(".terrace .card4", {
            x: 0, y: 0, rotate: 0, scale: 1, opacity: 1, zIndex: 3, duration: 1, ease: "power2.inOut"
        }, "t_shuffle3")
        .to(".terrace .card5", {
            x: 100, y: 40, rotate: 15, scale: 0.85, opacity: 0.7, zIndex: 1, duration: 1, ease: "power2.inOut"
        }, "t_shuffle3");
});