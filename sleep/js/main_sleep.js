document.addEventListener('DOMContentLoaded', () => {
    const receipt = document.querySelector('.recipe_paper, .receipt_inner');
    const mask = document.querySelector('.receipt_mask');
    const body = document.body;
    const header = document.querySelector('header');
    const levelArea = document.querySelector('.level_area');
    const initialYPercent = -99.9;
    const completionEpsilon = 0.0015;
    const sleepLockHeaderClass = 'sleep_header_locked';
    const pageMotionConfig = body.classList.contains('match_page')
        ? {
            lockThreshold: 200,
            wheelPrintFactor: 0.0012,
            touchPrintFactor: 0.0017,
            keyPrintStep: 0.07,
            progressLerp: 0.12
        }
        : {
            lockThreshold: 350,
            wheelPrintFactor: 0.00105,
            touchPrintFactor: 0.0015,
            keyPrintStep: 0.06,
            progressLerp: 0.11
        };

    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }

    window.scrollTo(0, 0);

    if (!receipt || !mask || !header || typeof gsap === 'undefined') {
        return;
    }

    let targetPrintProgress = 0;
    let currentPrintProgress = 0;
    let isScrollLocked = false;
    let isPrintComplete = false;
    let lockScrollY = 0;
    let touchStartY = 0;
    let levelAnimationPlayed = false;
    let levelObserver = null;
    const targetLevelCells = levelArea
        ? Array.from(levelArea.querySelectorAll('.level_cell.is_active'))
        : [];

    const printTimeline = gsap.timeline({ paused: true });

    targetLevelCells.forEach((cell) => {
        cell.classList.add('level_cell_target');
        cell.classList.remove('is_active');
    });

    gsap.set(receipt, {
        yPercent: initialYPercent,
        rotation: 0,
        y: 0,
        transformOrigin: '50% 0%'
    });

    printTimeline
        .to(receipt, {
            yPercent: -82,
            duration: 0.22,
            ease: 'power1.out'
        })
        .to(receipt, {
            yPercent: -38,
            duration: 0.28,
            ease: 'sine.out'
        })
        .to(receipt, {
            yPercent: 0,
            duration: 0.5,
            ease: 'power2.out'
        });

    const playLevelAnimation = () => {
        if (!levelArea || levelAnimationPlayed) {
            return;
        }

        levelAnimationPlayed = true;

        targetLevelCells.forEach((cell, index) => {
            gsap.delayedCall(index * 0.12, () => {
                cell.classList.add('is_active');
                gsap.fromTo(cell, {
                    scale: 0.92
                }, {
                    scale: 1,
                    duration: 0.32,
                    ease: 'power2.out',
                    clearProps: 'scale'
                });
            });
        });
    };

    const setupLevelObserver = () => {
        if (!levelArea || levelObserver) {
            return;
        }

        levelObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting || !isPrintComplete) {
                    return;
                }

                playLevelAnimation();
                levelObserver.disconnect();
                levelObserver = null;
            });
        }, {
            threshold: 0.35,
            rootMargin: '0px 0px -12% 0px'
        });

        levelObserver.observe(levelArea);
    };

    const syncPrintProgress = () => {
        printTimeline.progress(currentPrintProgress);

        if (targetPrintProgress >= 1 - completionEpsilon
            && currentPrintProgress >= 1 - completionEpsilon
            && !isPrintComplete) {
            currentPrintProgress = 1;
            printTimeline.progress(1);
            isPrintComplete = true;
            releaseScrollLock();
            setupLevelObserver();
        }
    };

    const tickPrintProgress = () => {
        if (isPrintComplete || !isScrollLocked) {
            return;
        }

        const nextProgress = gsap.utils.interpolate(
            currentPrintProgress,
            targetPrintProgress,
            pageMotionConfig.progressLerp
        );

        currentPrintProgress = Math.abs(targetPrintProgress - nextProgress) <= completionEpsilon
            ? targetPrintProgress
            : nextProgress;

        syncPrintProgress();
    };

    const applyPrintDelta = (delta) => {
        if (!isScrollLocked || isPrintComplete || delta <= 0) {
            return;
        }

        targetPrintProgress = Math.min(1, targetPrintProgress + delta);
    };

    function lockScroll() {
        if (isScrollLocked || isPrintComplete) {
            return;
        }

        isScrollLocked = true;
        lockScrollY = window.scrollY || window.pageYOffset || 0;

        header.classList.add(sleepLockHeaderClass);

        document.body.style.position = 'fixed';
        document.body.style.top = `-${lockScrollY}px`;
        document.body.style.left = '0';
        document.body.style.width = '100%';
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';

        targetPrintProgress = currentPrintProgress;
    }

    function releaseScrollLock() {
        if (!isScrollLocked) {
            return;
        }

        isScrollLocked = false;

        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
        header.classList.remove(sleepLockHeaderClass);

        window.scrollTo(0, lockScrollY);
    }

    const handleWheel = (event) => {
        if (!isScrollLocked) {
            return;
        }

        event.preventDefault();
        applyPrintDelta(event.deltaY * pageMotionConfig.wheelPrintFactor);
    };

    const handleTouchStart = (event) => {
        touchStartY = event.touches[0]?.clientY ?? 0;
    };

    const handleTouchMove = (event) => {
        if (!isScrollLocked) {
            return;
        }

        const currentY = event.touches[0]?.clientY ?? touchStartY;
        const deltaY = touchStartY - currentY;

        event.preventDefault();
        touchStartY = currentY;
        applyPrintDelta(deltaY * pageMotionConfig.touchPrintFactor);
    };

    const handleKeydown = (event) => {
        if (!isScrollLocked) {
            return;
        }

        const forwardKeys = ['ArrowDown', 'PageDown', 'Space', 'Enter'];
        const backwardKeys = ['ArrowUp', 'PageUp', 'Home'];

        if (forwardKeys.includes(event.code) || forwardKeys.includes(event.key)) {
            event.preventDefault();
            applyPrintDelta(pageMotionConfig.keyPrintStep);
            return;
        }

        if (backwardKeys.includes(event.code) || backwardKeys.includes(event.key) || event.key === ' ') {
            event.preventDefault();
        }
    };

    const handleScroll = () => {
        if (isScrollLocked || isPrintComplete) {
            return;
        }

        const currentScrollY = window.scrollY || window.pageYOffset || 0;

        if (currentScrollY > pageMotionConfig.lockThreshold && header.classList.contains('hide')) {
            lockScroll();
        }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('keydown', handleKeydown);
    gsap.ticker.add(tickPrintProgress);
}); //dom end
