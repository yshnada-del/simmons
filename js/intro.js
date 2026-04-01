document.addEventListener('DOMContentLoaded', () => {
    const INTRO_SESSION_KEY = 'simmons-main-intro-played';
    const years = [1870, 1876, 1925, 1931, 1958, 1970, 2017, 2024, 2025, 2026];
    const yearTimings = [
        { out: 0.26, in: 0.32, gap: 0.06 },
        { out: 0.24, in: 0.3, gap: 0.05 },
        { out: 0.22, in: 0.28, gap: 0.04 },
        { out: 0.2, in: 0.26, gap: 0.03 },
        { out: 0.18, in: 0.24, gap: 0.02 },
        { out: 0.17, in: 0.22, gap: 0.02 },
        { out: 0.16, in: 0.21, gap: 0.02 },
        { out: 0.28, in: 0.34, gap: 0.1 },
        { out: 0.34, in: 0.4, gap: 0.16 },
        { out: 0.34, in: 0.4, gap: 0.46 },
    ];
    const body = document.body;
    const introOverlay = document.querySelector('#intro-overlay');
    const introSkipButton = document.querySelector('.intro_skip_button');
    const introStage = document.querySelector('.intro_stage');
    const introStageContent = document.querySelector('.intro_stage_content');
    const yearDigits = Array.from(document.querySelectorAll('.intro_digit'));
    const introLogo = document.querySelector('.intro_logo_mark');
    const mainVisual = document.querySelector('.main_visual');
    const mainVideo = mainVisual ? mainVisual.querySelector('video') : null;

    if (!introOverlay || !introStage || !introStageContent || yearDigits.length !== 4 || !introLogo || !mainVisual) {
        return;
    }

    let introTimeline = null;
    let revealShell = null;
    let revealVisual = null;
    let revealVideo = null;
    let isIntroCompleting = false;

    const hasPlayedIntro = () => {
        try {
            return sessionStorage.getItem(INTRO_SESSION_KEY) === 'true';
        } catch (error) {
            return false;
        }
    };

    const persistIntroPlayed = () => {
        try {
            sessionStorage.setItem(INTRO_SESSION_KEY, 'true');
        } catch (error) {
            // Ignore storage access errors and continue without persistence.
        }
    };

    const playMainVisualVideo = () => {
        if (!mainVideo) {
            return;
        }

        const playPromise = mainVideo.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(() => { });
        }
    };

    const finalizeIntroState = () => {
        if (isIntroCompleting) {
            return;
        }

        isIntroCompleting = true;
        persistIntroPlayed();
        body.classList.add('intro-complete');
        body.classList.remove('header-locked');
        introSkipButton?.classList.add('is-hidden');

        window.setTimeout(() => {
            body.classList.add('intro-header-visible');
        }, 2000);

        window.setTimeout(() => {
            introOverlay.remove();
        }, 520);
    };

    const syncAndPlayMainVideo = () => {
        if (!mainVideo || !revealVideo) {
            playMainVisualVideo();
            return;
        }

        try {
            if (Number.isFinite(revealVideo.currentTime)) {
                const duration = Number.isFinite(mainVideo.duration) && mainVideo.duration > 0
                    ? mainVideo.duration
                    : null;
                const syncedTime = duration
                    ? revealVideo.currentTime % duration
                    : revealVideo.currentTime;

                if (Math.abs(mainVideo.currentTime - syncedTime) > 0.05) {
                    mainVideo.currentTime = syncedTime;
                }
            }
        } catch (error) {
            // Ignore currentTime sync issues and continue with playback.
        }

        playMainVisualVideo();
    };

    const skipIntro = () => {
        if (isIntroCompleting) {
            return;
        }

        introTimeline?.pause(0);
        introSkipButton?.classList.add('is-hidden');

        if (revealShell && revealVisual) {
            gsap.set(revealShell, { opacity: 1 });
            gsap.set(revealVisual, {
                opacity: 1,
                scale: 1,
                filter: 'brightness(1) blur(0px)',
            });
        }

        syncAndPlayMainVideo();
        finalizeIntroState();

        gsap.to(introOverlay, {
            autoAlpha: 0,
            duration: 0.46,
            ease: 'power2.out',
        });
    };

    if (hasPlayedIntro()) {
        body.classList.add('intro-complete');
        body.classList.add('intro-header-visible');
        body.classList.remove('header-locked');
        playMainVisualVideo();
        introOverlay.remove();
        return;
    }

    body.classList.add('header-locked');

    const digitPairs = yearDigits.map((digit) => ({
        current: digit.querySelector('.intro_digit_current'),
        next: digit.querySelector('.intro_digit_next'),
    }));

    const setYearDisplay = (yearValue) => {
        const text = String(yearValue).padStart(4, '0');
        digitPairs.forEach((pair, index) => {
            pair.current.textContent = text[index];
            pair.next.textContent = '';
        });
    };

    setYearDisplay(years[0]);
    digitPairs.forEach((pair) => {
        gsap.set(pair.current, { yPercent: 0, opacity: 1 });
        gsap.set(pair.next, { yPercent: 110, opacity: 0 });
    });

    revealShell = document.createElement('div');
    revealShell.className = 'intro_reveal_shell';

    revealVisual = mainVisual.cloneNode(true);
    revealVisual.classList.add('intro_reveal_visual');
    revealShell.appendChild(revealVisual);
    introOverlay.appendChild(revealShell);

    revealVideo = revealVisual.querySelector('video');
    if (revealVideo) {
        revealVideo.muted = true;
        revealVideo.playsInline = true;
        revealVideo.autoplay = true;
        revealVideo.loop = true;
        const playPromise = revealVideo.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(() => { });
        }
    }

    const getStageFrames = () => {
        const maxWidth = Math.min(window.innerWidth * 0.56, 900);
        const baseWidth = Math.max(maxWidth, 560);
        const baseHeight = baseWidth / 1.7777777778;
        const tinySize = Math.max(40, Math.min(window.innerWidth, window.innerHeight) * 0.05);

        return {
            primary: {
                width: baseWidth,
                height: baseHeight,
                duration: 0.96,
                ease: 'power2.inOut',
            },
            expanded: {
                width: baseWidth * 1.12,
                height: baseHeight * 1.12,
                duration: 0.62,
                ease: 'sine.inOut',
            },
            tiny: {
                width: tinySize,
                height: tinySize,
                duration: 0.5,
                ease: 'power2.in',
            },
            fullscreen: {
                width: window.innerWidth,
                height: window.innerHeight,
                duration: 0.76,
                ease: 'power2.out',
            },
        };
    };

    introTimeline = gsap.timeline({
        paused: true,
        defaults: {
            ease: 'power3.out',
        },
    });

    years.forEach((year, index) => {
        const timing = yearTimings[index] || yearTimings[yearTimings.length - 1];

        if (index === 0) {
            introTimeline.fromTo(yearDigits, {
                opacity: 0,
            }, {
                opacity: 1,
                duration: 0.22,
            });
        } else {
            const previousText = String(years[index - 1]).padStart(4, '0');
            const nextText = String(year).padStart(4, '0');
            const digitTimeline = gsap.timeline();

            introTimeline.call(() => {
                digitPairs.forEach((pair, digitIndex) => {
                    if (previousText[digitIndex] === nextText[digitIndex]) {
                        pair.current.textContent = nextText[digitIndex];
                        pair.next.textContent = '';
                        gsap.set(pair.current, { yPercent: 0, opacity: 1 });
                        gsap.set(pair.next, { yPercent: 110, opacity: 0 });
                        return;
                    }

                    pair.next.textContent = nextText[digitIndex];
                    gsap.set(pair.current, { yPercent: 0, opacity: 1 });
                    gsap.set(pair.next, { yPercent: 110, opacity: 0 });
                });
            });

            digitPairs.forEach((pair, digitIndex) => {
                if (previousText[digitIndex] === nextText[digitIndex]) {
                    return;
                }

                digitTimeline.to(pair.current, {
                    yPercent: -100,
                    opacity: 0,
                    duration: timing.out,
                    ease: 'power2.inOut',
                }, 0);

                digitTimeline.to(pair.next, {
                    yPercent: 0,
                    opacity: 1,
                    duration: timing.in,
                    ease: 'power2.out',
                }, 0);
            });

            introTimeline.add(digitTimeline);

            introTimeline.call(() => {
                digitPairs.forEach((pair, digitIndex) => {
                    pair.current.textContent = nextText[digitIndex];
                    pair.next.textContent = '';
                    gsap.set(pair.current, { yPercent: 0, opacity: 1 });
                    gsap.set(pair.next, { yPercent: 110, opacity: 0 });
                });
            });
        }

        introTimeline.to({}, {
            duration: index < years.length - 1 ? timing.gap : 0.46,
        });
    });

    const stageFrames = getStageFrames();

    introTimeline.to(introOverlay, {
        backgroundColor: 'var(--main_bg2)',
        duration: stageFrames.primary.duration,
        ease: 'power2.inOut',
    }, '>');

    introTimeline.to(introStage, {
        width: stageFrames.primary.width,
        height: stageFrames.primary.height,
        duration: stageFrames.primary.duration,
        ease: stageFrames.primary.ease,
    }, '<');

    introTimeline.to(introStage, {
        width: stageFrames.expanded.width,
        height: stageFrames.expanded.height,
        duration: stageFrames.expanded.duration,
        ease: stageFrames.expanded.ease,
    });

    introTimeline.to(introStage, {
        width: stageFrames.tiny.width,
        height: stageFrames.tiny.height,
        duration: stageFrames.tiny.duration,
        ease: stageFrames.tiny.ease,
    });

    introTimeline.to([introLogo, yearDigits], {
        opacity: 0,
        duration: stageFrames.tiny.duration * 0.7,
        ease: 'power1.out',
    }, `<+=${(stageFrames.tiny.duration * 0.08).toFixed(2)}`);

    introTimeline.call(() => {
        gsap.set(revealShell, { opacity: 1 });
        gsap.set(revealVisual, {
            opacity: 0,
            scale: 1.08,
            filter: 'brightness(1.06) blur(14px)',
        });
    });

    introTimeline.to(introStage, {
        width: stageFrames.fullscreen.width,
        height: stageFrames.fullscreen.height,
        duration: stageFrames.fullscreen.duration,
        ease: stageFrames.fullscreen.ease,
    });

    introTimeline.to(revealVisual, {
        opacity: 1,
        scale: 1,
        filter: 'brightness(1) blur(0px)',
        duration: 1.2,
        ease: 'power2.out',
    });

    introTimeline.to(introStage, {
        opacity: 0,
        duration: 0.34,
        ease: 'power1.out',
    }, '<+=0.08');

    introTimeline.call(() => {
        syncAndPlayMainVideo();
        finalizeIntroState();
    }, null, '>-0.12');

    introSkipButton?.addEventListener('click', skipIntro);

    window.addEventListener('load', () => {
        introTimeline.play();
    }, { once: true });
});
