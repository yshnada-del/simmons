document.addEventListener("DOMContentLoaded", () => {
  const receiptStage = document.querySelector(".receipt_stage");
  const topBar = receiptStage?.querySelector(".top_bar");
  const receipt = receiptStage?.querySelector(".recipe_paper");
  const scrollIndicator = receiptStage?.querySelector(".scroll_indicator");

  if (!receiptStage || !topBar || !receipt) {
    return;
  }

  const initialYPercent = -99.6;
  const initialRevealPx = 160;
  const keyStepPx = 90;
  const touchFactor = 1.1;
  const revealSmoothing = 0.15;

  let revealProgress = 0;
  let revealTargetProgress = 0;
  let revealComplete = false;
  let isLocked = false;
  let indicatorHidden = false;
  let lastTouchY = null;
  let partialYPercent = initialYPercent;
  let revealDistancePx = 320;
  let layoutReady = false;
  let lastWindowScrollY = window.scrollY;
  let lastLockTargetTop = null;
  let revealFrameId = null;

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  const getLockOffset = () => {
    if (window.innerWidth <= 767) {
      return 250;
    }

    if (window.innerWidth <= 1024) {
      return 260;
    }

    return 154;
  };

  const getPreLockBuffer = () => {
    if (window.innerWidth <= 767) {
      return 140;
    }

    if (window.innerWidth <= 1024) {
      return 128;
    }

    return 130;
  };

  const getInputApproachBuffer = (deltaY = 0) => {
    const normalizedDelta = Math.max(deltaY, 0);
    const inputBuffer = Math.min(normalizedDelta * 0.9, 180);
    return Math.max(getPreLockBuffer(), inputBuffer);
  };

  const updateMetrics = () => {
    const receiptHeight = receipt.offsetHeight || 1;
    const revealPercent = (initialRevealPx / receiptHeight) * 100;
    partialYPercent = Math.min(0, initialYPercent + revealPercent);

    const hiddenPercent = Math.abs(partialYPercent);
    const hiddenPx = (hiddenPercent / 100) * receiptHeight;
    revealDistancePx = Math.max(hiddenPx + 120, 320);
  };

  const applyReveal = () => {
    const currentYPercent = partialYPercent * (1 - revealProgress);
    receipt.style.transform = `translateY(${currentYPercent}%)`;
  };

  const stopRevealLoop = () => {
    if (revealFrameId === null) {
      return;
    }

    window.cancelAnimationFrame(revealFrameId);
    revealFrameId = null;
  };

  const stepReveal = () => {
    revealFrameId = null;

    const diff = revealTargetProgress - revealProgress;
    if (Math.abs(diff) <= 0.001) {
      revealProgress = revealTargetProgress;
      applyReveal();

      if (revealTargetProgress >= 0.999 && !revealComplete) {
        completeReveal();
      }
      return;
    }

    revealProgress += diff * revealSmoothing;
    applyReveal();
    revealFrameId = window.requestAnimationFrame(stepReveal);
  };

  const ensureRevealLoop = () => {
    if (revealFrameId !== null) {
      return;
    }

    revealFrameId = window.requestAnimationFrame(stepReveal);
  };

  const hideIndicator = () => {
    if (!scrollIndicator || indicatorHidden) {
      return;
    }

    indicatorHidden = true;
    scrollIndicator.classList.remove("is-visible");
    scrollIndicator.classList.add("is-hidden");
  };

  const showIndicator = () => {
    if (!scrollIndicator || indicatorHidden || revealComplete) {
      return;
    }

    scrollIndicator.classList.remove("is-hidden");
    scrollIndicator.classList.add("is-visible");
  };

  const getLockTargetTop = () => topBar.getBoundingClientRect().top;
  const getLockTargetDocTop = () => window.scrollY + getLockTargetTop();
  const getLockThreshold = () => getLockOffset() + 2;

  const alignStageToLockOffset = () => {
    const targetScrollY = getLockTargetDocTop() - getLockOffset();
    window.scrollTo(0, Math.max(0, Math.round(targetScrollY)));
  };

  const refreshLockTracking = () => {
    lastWindowScrollY = window.scrollY;
    lastLockTargetTop = getLockTargetTop();
  };

  const syncLockedStage = () => {
    if (!isLocked || revealComplete) {
      return;
    }

    window.requestAnimationFrame(() => {
      if (!isLocked || revealComplete) {
        return;
      }

      alignStageToLockOffset();
    });
  };

  const shouldStartLock = (approachBuffer = 0) => {
    if (!layoutReady || revealComplete) {
      return false;
    }

    return getLockTargetTop() <= getLockThreshold() + approachBuffer;
  };

  const lockScroll = () => {
    if (isLocked || revealComplete) {
      return;
    }

    isLocked = true;
    document.body.classList.add("sleep-scroll-lock");
    alignStageToLockOffset();
    refreshLockTracking();
    syncLockedStage();
  };

  const unlockScroll = () => {
    if (!isLocked) {
      return;
    }

    isLocked = false;
    document.body.classList.remove("sleep-scroll-lock");
    lastTouchY = null;
    refreshLockTracking();
  };

  const completeReveal = () => {
    stopRevealLoop();
    revealProgress = 1;
    revealTargetProgress = 1;
    revealComplete = true;
    applyReveal();
    hideIndicator();
    unlockScroll();
  };

  const maybeStartLock = (approachBuffer = 0) => {
    if (isLocked || revealComplete || !shouldStartLock(approachBuffer)) {
      return false;
    }

    lockScroll();
    return true;
  };

  const consumeDelta = (deltaY) => {
    if (!isLocked || revealComplete || deltaY <= 0) {
      return;
    }

    revealTargetProgress = clamp(
      revealTargetProgress + deltaY / revealDistancePx,
      0,
      1,
    );
    ensureRevealLoop();
  };

  const handleWheel = (event) => {
    hideIndicator();

    if (revealComplete) {
      return;
    }

    if (!isLocked) {
      if (
        event.deltaY <= 0 ||
        !maybeStartLock(getInputApproachBuffer(event.deltaY))
      ) {
        return;
      }

      event.preventDefault();
      consumeDelta(event.deltaY);
      return;
    }

    event.preventDefault();
    consumeDelta(event.deltaY);
  };

  const handleTouchStart = (event) => {
    const touch = event.touches[0];
    if (!touch) {
      return;
    }

    lastTouchY = touch.clientY;
  };

  const handleTouchMove = (event) => {
    const touch = event.touches[0];
    if (!touch) {
      return;
    }

    if (lastTouchY === null) {
      lastTouchY = touch.clientY;
    }

    const deltaY = (lastTouchY - touch.clientY) * touchFactor;
    lastTouchY = touch.clientY;
    hideIndicator();

    if (revealComplete) {
      return;
    }

    if (!isLocked) {
      if (deltaY <= 0 || !maybeStartLock(getInputApproachBuffer(deltaY))) {
        return;
      }

      event.preventDefault();
      consumeDelta(deltaY);
      return;
    }

    event.preventDefault();
    consumeDelta(deltaY);
  };

  const handleKeydown = (event) => {
    const downKeys = ["ArrowDown", "PageDown", "Enter", " "];
    const upKeys = ["ArrowUp", "PageUp", "Home"];

    if (!downKeys.includes(event.key) && !downKeys.includes(event.code)) {
      if (
        isLocked &&
        (upKeys.includes(event.key) || upKeys.includes(event.code))
      ) {
        event.preventDefault();
      }
      return;
    }

    hideIndicator();

    if (revealComplete) {
      return;
    }

    if (!isLocked) {
      if (!maybeStartLock(getInputApproachBuffer(keyStepPx))) {
        return;
      }

      event.preventDefault();
      consumeDelta(keyStepPx);
      return;
    }

    event.preventDefault();
    consumeDelta(keyStepPx);
  };

  const handleResize = () => {
    updateMetrics();

    if (isLocked && !revealComplete) {
      syncLockedStage();
    }

    if (revealComplete) {
      receipt.style.transform = "translateY(0%)";
      return;
    }

    revealTargetProgress = revealProgress;
    applyReveal();
    refreshLockTracking();
  };

  const handleScroll = () => {
    refreshLockTracking();
  };

  const markLayoutReady = () => {
    layoutReady = true;
    updateMetrics();

    if (revealComplete) {
      receipt.style.transform = "translateY(0%)";
      return;
    }

    revealTargetProgress = revealProgress;
    applyReveal();
    syncLockedStage();
    refreshLockTracking();
  };

  updateMetrics();
  applyReveal();
  showIndicator();
  refreshLockTracking();

  window.addEventListener("wheel", handleWheel, { passive: false });
  window.addEventListener("touchstart", handleTouchStart, { passive: true });
  window.addEventListener("touchmove", handleTouchMove, { passive: false });
  window.addEventListener("keydown", handleKeydown);
  window.addEventListener("scroll", handleScroll, { passive: true });
  window.addEventListener("resize", handleResize, { passive: true });

  const loadReady =
    document.readyState === "complete"
      ? Promise.resolve()
      : new Promise((resolve) => {
          window.addEventListener("load", resolve, { once: true });
        });

  const fontsReady = document.fonts?.ready ?? Promise.resolve();

  Promise.all([loadReady, fontsReady])
    .then(markLayoutReady)
    .catch(markLayoutReady);
});
