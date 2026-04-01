document.addEventListener("DOMContentLoaded", () => {
  const receiptSection = document.querySelector(".contents_wrap");
  const receiptStage = document.querySelector(".receipt_stage");
  const settledStageHost = document.querySelector(".receipt_stage_settled");
  const receipt = receiptStage?.querySelector(".recipe_paper, .receipt_inner");
  const scrollIndicator = receiptStage?.querySelector(".scroll_indicator");

  if (
    !receiptSection ||
    !receiptStage ||
    !settledStageHost ||
    !receipt ||
    typeof gsap === "undefined" ||
    typeof ScrollTrigger === "undefined"
  ) {
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  const initialYPercent = -99.6;
  const initialRevealPx = 165;

  let indicatorHidden = false;
  let revealComplete = false;
  let revealSettled = false;
  let partialYPercent = initialYPercent;
  let revealTween = null;
  let pinTrigger = null;
  let revealEventDispatched = false;

  const getPinTopOffset = () => {
    if (window.innerWidth <= 767) {
      return 88;
    }

    if (window.innerWidth <= 1024) {
      return 96;
    }

    return 110;
  };

  const updateInitialReveal = () => {
    const receiptHeight = receipt.offsetHeight || 1;
    const revealPercent = (initialRevealPx / receiptHeight) * 100;
    partialYPercent = Math.min(0, initialYPercent + revealPercent);
  };

  const getPinDistance = () => {
    updateInitialReveal();
    const hiddenPercent = Math.abs(partialYPercent);
    const currentHeight = receipt.offsetHeight || 1;
    const revealDistance = (hiddenPercent / 100) * currentHeight;

    return Math.max(revealDistance + 120, 320);
  };

  const hideScrollIndicator = () => {
    if (!scrollIndicator || indicatorHidden) {
      return;
    }

    indicatorHidden = true;
    scrollIndicator.classList.remove("is-visible");
    scrollIndicator.classList.add("is-hidden");

    gsap.to(scrollIndicator, {
      autoAlpha: 0,
      y: 20,
      duration: 0.35,
      ease: "power2.out",
      overwrite: true,
    });
  };

  const notifyRevealComplete = () => {
    if (revealEventDispatched) {
      return;
    }

    revealEventDispatched = true;
    document.dispatchEvent(
      new CustomEvent("sleep:receipt-revealed", {
        detail: {
          section: receiptSection,
        },
      }),
    );
  };

  const buildSettledStage = () => {
    settledStageHost.innerHTML = "";

    const clone = receiptStage.cloneNode(true);
    const cloneReceipt = clone.querySelector(".recipe_paper, .receipt_inner");
    const cloneIndicator = clone.querySelector(".scroll_indicator");

    clone.classList.remove("is-hidden");
    cloneIndicator?.remove();

    if (cloneReceipt) {
      gsap.set(cloneReceipt, {
        yPercent: 0,
        y: 0,
        rotation: 0,
        clearProps: "all",
      });
    }

    settledStageHost.appendChild(clone);
  };

  const freezeReveal = () => {
    if (revealTween?.scrollTrigger) {
      revealTween.scrollTrigger.kill();
    }

    revealTween?.kill();
    revealTween = null;

    gsap.killTweensOf(receipt);
    gsap.set(receipt, {
      yPercent: 0,
      y: 0,
      rotation: 0,
      clearProps: "willChange",
    });
  };

  const settleReveal = () => {
    if (!revealComplete || revealSettled) {
      return;
    }

    revealSettled = true;
    buildSettledStage();

    receiptStage.classList.add("is-hidden");
    settledStageHost.classList.add("is-visible");
    settledStageHost.setAttribute("aria-hidden", "false");

    if (revealTween?.scrollTrigger) {
      revealTween.scrollTrigger.kill();
    }

    revealTween?.kill();
    revealTween = null;

    if (pinTrigger) {
      pinTrigger.kill(true);
      pinTrigger = null;
    }

    gsap.killTweensOf(receipt);
    gsap.set(receipt, {
      yPercent: 0,
      y: 0,
      rotation: 0,
      clearProps: "transform,willChange",
    });

    ScrollTrigger.refresh();
  };

  const maybeSettleReveal = () => {
    if (!revealComplete || revealSettled) {
      return;
    }

    const sectionRect = receiptSection.getBoundingClientRect();

    if (sectionRect.bottom < 0) {
      settleReveal();
    }
  };

  const setupAnimation = () => {
    updateInitialReveal();

    revealTween?.kill();
    pinTrigger?.kill();
    gsap.killTweensOf(receipt);

    if (revealSettled) {
      settledStageHost.classList.add("is-visible");
      receiptStage.classList.add("is-hidden");
      return;
    }

    settledStageHost.classList.remove("is-visible");
    settledStageHost.setAttribute("aria-hidden", "true");
    receiptStage.classList.remove("is-hidden");

    gsap.set(receipt, {
      yPercent: revealComplete ? 0 : partialYPercent,
      y: 0,
      rotation: 0,
      transformOrigin: "50% 0%",
      willChange: "transform",
    });

    const pinTopOffset = getPinTopOffset();
    const pinDistance = getPinDistance();

    pinTrigger = ScrollTrigger.create({
      trigger: receiptSection,
      start: `top top+=${pinTopOffset}`,
      end: `+=${pinDistance}`,
      pin: receiptStage,
      pinSpacing: true,
      anticipatePin: 0,
      invalidateOnRefresh: true,
      onUpdate: () => {
        hideScrollIndicator();
      },
      onLeave: () => {
        revealComplete = true;
        notifyRevealComplete();
        freezeReveal();
        maybeSettleReveal();
      },
    });

    revealTween = gsap.to(receipt, {
      yPercent: 0,
      ease: "none",
      scrollTrigger: {
        trigger: receiptSection,
        start: `top top+=${pinTopOffset}`,
        end: `+=${pinDistance}`,
        scrub: 0.35,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          hideScrollIndicator();

          if (revealComplete) {
            gsap.set(receipt, { yPercent: 0 });
            return;
          }
        },
      },
    });
  };

  gsap.set(receipt, {
    yPercent: initialYPercent,
    y: 0,
    rotation: 0,
    transformOrigin: "50% 0%",
  });

  setupAnimation();

  if (scrollIndicator) {
    gsap.set(scrollIndicator, {
      xPercent: -50,
      y: 0,
      autoAlpha: 0,
    });

    gsap.to(scrollIndicator, {
      autoAlpha: 1,
      duration: 0.7,
      ease: "power2.out",
      delay: 0.4,
      onStart: () => {
        scrollIndicator.classList.add("is-visible");
      },
    });
  }

  const handleScrollIntent = (event) => {
    if (event) {
      hideScrollIndicator();
    }

    maybeSettleReveal();
  };

  window.addEventListener("wheel", handleScrollIntent, { passive: true });
  window.addEventListener("touchmove", handleScrollIntent, { passive: true });
  window.addEventListener("scroll", handleScrollIntent, { passive: true });
  window.addEventListener("keydown", (event) => {
    const scrollKeys = [
      "ArrowDown",
      "PageDown",
      "Space",
      "Enter",
      "ArrowUp",
      "PageUp",
      "Home",
      "End",
    ];

    if (
      scrollKeys.includes(event.code) ||
      scrollKeys.includes(event.key) ||
      event.key === " "
    ) {
      handleScrollIntent(event);
    }
  });

  window.addEventListener(
    "resize",
    () => {
      if (revealSettled) {
        buildSettledStage();
        return;
      }

      setupAnimation();
      ScrollTrigger.refresh();
    },
    { passive: true },
  );
});
