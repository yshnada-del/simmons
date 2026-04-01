document.addEventListener("DOMContentLoaded", () => {
  const receiptStage = document.querySelector(".receipt_stage");

  if (!receiptStage) {
    return;
  }

  const targetCells = Array.from(
    receiptStage.querySelectorAll(".level_cell.is_active"),
  );

  if (targetCells.length === 0) {
    return;
  }

  let hasAnimated = false;

  targetCells.forEach((cell) => {
    cell.dataset.fillTarget = "true";
    cell.classList.remove("is_active");
  });

  const runAnimation = () => {
    if (hasAnimated) {
      return;
    }

    hasAnimated = true;

    const currentTargets = Array.from(
      document.querySelectorAll('.level_cell[data-fill-target="true"]'),
    );

    currentTargets.forEach((cell, index) => {
      window.setTimeout(() => {
        cell.classList.add("is_active");
      }, index * 240);
    });
  };

  document.addEventListener("sleep:receipt-revealed", runAnimation, {
    once: true,
  });
});
