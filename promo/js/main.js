document.addEventListener('DOMContentLoaded', () => {
  const items = document.querySelectorAll('.accordion_item');
  const eventSlider = document.querySelector('.event_slider');
  const eventTrack = document.querySelector('.event_track');
  const mainVisualObjects = document.querySelectorAll('.main_visual .main_visual_object');

  if (items.length) {
    function closeAll() {
      items.forEach((item) => item.classList.remove('open'));
    }

    items.forEach((item) => {
      const button = item.querySelector('.accordion_trigger');

      button.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');

        closeAll();

        if (!isOpen) {
          item.classList.add('open');
        }
      });
    });
  }

  if (eventSlider && eventTrack) {
    const originalItems = Array.from(eventTrack.children);
    const eventImages = eventTrack.querySelectorAll('img');

    eventImages.forEach((image) => {
      image.addEventListener('dragstart', (event) => event.preventDefault());
    });

    originalItems.forEach((item) => {
      const clone = item.cloneNode(true);
      eventTrack.appendChild(clone);
    });

    let offset = 0;
    let dragStartX = 0;
    let dragStartOffset = 0;
    let isDragging = false;
    let animationId = null;

    function getLoopWidth() {
      return eventTrack.scrollWidth / 2;
    }

    function normalizeOffset() {
      const loopWidth = getLoopWidth();

      if (!loopWidth) return;

      while (offset <= -loopWidth) offset += loopWidth;
      while (offset > 0) offset -= loopWidth;
    }

    function renderTrack() {
      normalizeOffset();
      eventTrack.style.transform = `translate3d(${offset}px, 0, 0)`;
    }

    function animateTrack() {
      if (!isDragging) {
        offset -= 0.7;
        renderTrack();
      }

      animationId = window.requestAnimationFrame(animateTrack);
    }

    function onPointerMove(event) {
      if (!isDragging) return;

      const deltaX = event.clientX - dragStartX;
      offset = dragStartOffset + deltaX;
      renderTrack();
    }

    function stopDragging() {
      if (!isDragging) return;

      isDragging = false;
      eventSlider.classList.remove('is_dragging');
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', stopDragging);
      window.removeEventListener('pointercancel', stopDragging);
    }

    eventSlider.addEventListener('pointerdown', (event) => {
      isDragging = true;
      dragStartX = event.clientX;
      dragStartOffset = offset;
      eventSlider.classList.add('is_dragging');
      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', stopDragging);
      window.addEventListener('pointercancel', stopDragging);
    });

    window.addEventListener('resize', renderTrack);

    renderTrack();
    animationId = window.requestAnimationFrame(animateTrack);

    window.addEventListener('beforeunload', () => {
      if (animationId) window.cancelAnimationFrame(animationId);
    });
  }

  if (mainVisualObjects.length && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const motionConfigs = {
      object_phone: { shift: 20, tilt: 3.4, scale: 1.03 },
      object_bell: { shift: 18, tilt: 2.6, scale: 1.025 },
      object_q: { shift: 24, tilt: 3.8, scale: 1.035 },
      object_gift: { shift: 19, tilt: 2.8, scale: 1.03 },
    };

    mainVisualObjects.forEach((object) => {
      const config = Object.entries(motionConfigs).find(([className]) => object.classList.contains(className))?.[1]
        || { shift: 18, tilt: 3, scale: 1.03 };

      const state = {
        currentX: 0,
        currentY: 0,
        currentTilt: 0,
        currentScale: 1,
        targetX: 0,
        targetY: 0,
        targetTilt: 0,
        targetScale: 1,
        frameId: null,
      };

      function render() {
        state.currentX += (state.targetX - state.currentX) * 0.16;
        state.currentY += (state.targetY - state.currentY) * 0.16;
        state.currentTilt += (state.targetTilt - state.currentTilt) * 0.14;
        state.currentScale += (state.targetScale - state.currentScale) * 0.12;

        object.style.setProperty('--move-x', `${state.currentX.toFixed(2)}px`);
        object.style.setProperty('--move-y', `${state.currentY.toFixed(2)}px`);
        object.style.setProperty('--tilt', `${state.currentTilt.toFixed(2)}deg`);
        object.style.setProperty('--scale', state.currentScale.toFixed(4));

        const isMoving =
          Math.abs(state.targetX - state.currentX) > 0.08 ||
          Math.abs(state.targetY - state.currentY) > 0.08 ||
          Math.abs(state.targetTilt - state.currentTilt) > 0.05 ||
          Math.abs(state.targetScale - state.currentScale) > 0.002;

        if (isMoving) {
          state.frameId = window.requestAnimationFrame(render);
        } else {
          state.frameId = null;
        }
      }

      function startRender() {
        if (!state.frameId) {
          state.frameId = window.requestAnimationFrame(render);
        }
      }

      object.addEventListener('pointerenter', () => {
        object.classList.add('is-active');
        state.targetScale = config.scale;
        startRender();
      });

      object.addEventListener('pointermove', (event) => {
        const rect = object.getBoundingClientRect();
        const normalizedX = (event.clientX - rect.left) / rect.width - 0.5;
        const normalizedY = (event.clientY - rect.top) / rect.height - 0.5;

        state.targetX = normalizedX * config.shift * 2;
        state.targetY = normalizedY * config.shift * 2;
        state.targetTilt = normalizedX * config.tilt;
        state.targetScale = config.scale;
        startRender();
      });

      object.addEventListener('pointerleave', () => {
        object.classList.remove('is-active');
        state.targetX = 0;
        state.targetY = 0;
        state.targetTilt = 0;
        state.targetScale = 1;
        startRender();
      });
    });
  }
}); //dom end
