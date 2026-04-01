document.addEventListener("DOMContentLoaded", () => {
  const nameInput = document.querySelector(".enter_name");
  const nextLink = document.querySelector(".start_btn_link");
  const nextButton = nextLink?.querySelector(".start_btn");
  const backLink = document.querySelector(".back_btn_link");
  const backFallbackHref =
    backLink?.dataset.fallbackHref || backLink?.getAttribute("href");

  if (!nameInput || !nextLink || !nextButton) {
    return;
  }

  const enableNext = () => {
    nextLink.classList.remove("is-disabled");
    nextLink.setAttribute("aria-disabled", "false");
    nextLink.removeAttribute("tabindex");
  };

  const disableNext = () => {
    nextLink.classList.add("is-disabled");
    nextLink.setAttribute("aria-disabled", "true");
    nextLink.setAttribute("tabindex", "-1");
  };

  const shakeNextButton = () => {
    nextButton.classList.remove("is-shaking");
    void nextButton.offsetWidth;
    nextButton.classList.add("is-shaking");
  };

  const updateNextState = () => {
    if (nameInput.value.trim()) {
      enableNext();
      return;
    }

    disableNext();
  };

  nameInput.addEventListener("input", updateNextState);

  nextLink.addEventListener("click", (event) => {
    if (nextLink.classList.contains("is-disabled")) {
      event.preventDefault();
      shakeNextButton();
      nameInput.focus();
      return;
    }

    sessionStorage.setItem("sleep-user-name", nameInput.value.trim());
  });

  backLink?.addEventListener("click", (event) => {
    event.preventDefault();

    if (window.history.length > 1) {
      window.history.back();
      return;
    }

    if (backFallbackHref) {
      window.location.href = backFallbackHref;
    }
  });

  updateNextState();
});
