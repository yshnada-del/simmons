document.addEventListener("DOMContentLoaded", () => {
  const oxBox = document.querySelector(".ox_box");
  const choices = Array.from(document.querySelectorAll(".ox_choice"));
  const nextLink = document.querySelector(".next_step_link");
  const nextButton = nextLink?.querySelector(".start_btn");
  const nextHref = document.body.dataset.nextHref || nextLink?.getAttribute("href");
  const prevLink = document.querySelector(".prev_step_link");
  const prevFallbackHref =
    prevLink?.dataset.fallbackHref || prevLink?.getAttribute("href");
  let isNavigating = false;

  if (!oxBox || choices.length === 0) {
    return;
  }

  const enableNext = () => {
    if (!nextLink) {
      return;
    }

    nextLink.classList.remove("is-disabled");
    nextLink.setAttribute("aria-disabled", "false");
    nextLink.removeAttribute("tabindex");
  };

  const shakeNextButton = () => {
    if (!nextButton) {
      return;
    }

    nextButton.classList.remove("is-shaking");
    void nextButton.offsetWidth;
    nextButton.classList.add("is-shaking");
  };

  const setSelection = (value) => {
    oxBox.classList.toggle("is-yes-selected", value === "yes");
    oxBox.classList.toggle("is-no-selected", value === "no");

    choices.forEach((choice) => {
      const isSelected = choice.dataset.value === value;
      choice.setAttribute("aria-pressed", isSelected ? "true" : "false");
    });

    sessionStorage.setItem("sleep-ox-answer", value);
    enableNext();
  };

  const goToNextStep = () => {
    if (isNavigating) {
      return;
    }

    if (!nextHref) {
      return;
    }

    isNavigating = true;
    window.location.href = nextHref;
  };

  choices.forEach((choice) => {
    choice.setAttribute("aria-pressed", "false");

    choice.addEventListener("click", () => {
      setSelection(choice.dataset.value || "");
      goToNextStep();
    });
  });

  nextLink?.addEventListener("click", (event) => {
    if (nextLink.classList.contains("is-disabled")) {
      event.preventDefault();
      shakeNextButton();
    }
  });

  prevLink?.addEventListener("click", (event) => {
    event.preventDefault();

    if (window.history.length > 1) {
      window.history.back();
      return;
    }

    if (prevFallbackHref) {
      window.location.href = prevFallbackHref;
    }
  });

});
