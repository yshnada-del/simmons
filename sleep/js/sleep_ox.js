document.addEventListener("DOMContentLoaded", () => {
  const oxBox = document.querySelector(".ox_box");
  const choices = Array.from(document.querySelectorAll(".ox_choice"));
  const nextLink = document.querySelector(".next_step_link");
  const nextButton = nextLink?.querySelector(".start_btn");

  if (!oxBox || choices.length === 0 || !nextLink || !nextButton) {
    return;
  }

  const enableNext = () => {
    nextLink.classList.remove("is-disabled");
    nextLink.setAttribute("aria-disabled", "false");
    nextLink.removeAttribute("tabindex");
  };

  const shakeNextButton = () => {
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

  choices.forEach((choice) => {
    choice.setAttribute("aria-pressed", "false");

    choice.addEventListener("click", () => {
      setSelection(choice.dataset.value || "");
    });
  });

  nextLink.addEventListener("click", (event) => {
    if (nextLink.classList.contains("is-disabled")) {
      event.preventDefault();
      shakeNextButton();
    }
  });

  const savedAnswer = sessionStorage.getItem("sleep-ox-answer");

  if (savedAnswer === "yes" || savedAnswer === "no") {
    setSelection(savedAnswer);
  }
});
