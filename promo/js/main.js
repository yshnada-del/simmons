document.addEventListener('DOMContentLoaded', () => {
  const items = document.querySelectorAll('.accordion_item');
  const eventSlider = document.querySelector('.event_slider');
  const eventTrack = document.querySelector('.event_track');
  const mainVisualObjects = document.querySelectorAll('.main_visual .main_visual_object');
  const heroTitleLines = document.querySelectorAll('.main_visual h1 > span');

  if (heroTitleLines.length) {
    heroTitleLines.forEach((line, lineIndex) => {
      const text = line.textContent || '';
      const wrapper = document.createElement('span');

      wrapper.className = 'hero-line';
      line.setAttribute('aria-label', text.trim());

      Array.from(text).forEach((character, charIndex) => {
        const letter = document.createElement('span');
        const isSpace = character === ' ';

        letter.className = isSpace ? 'hero-letter hero-space' : 'hero-letter';
        letter.textContent = isSpace ? '\u00A0' : character;
        letter.setAttribute('aria-hidden', 'true');
        letter.style.setProperty('--letter-delay', `${0.35 + lineIndex * 0.22 + charIndex * 0.05}s`);
        wrapper.appendChild(letter);
      });

      line.textContent = '';
      line.appendChild(wrapper);
    });

    const heroLetters = document.querySelectorAll('.main_visual .hero-letter:not(.hero-space)');
    const glyphCanvas = document.createElement('canvas');
    const glyphContext = glyphCanvas.getContext('2d', { willReadFrequently: true });

    function isPointerOnGlyph(letter, event) {
      if (!glyphContext) return true;

      const text = letter.textContent;

      if (!text || !text.trim()) return false;

      const rect = letter.getBoundingClientRect();

      if (!rect.width || !rect.height) return false;

      const dpr = window.devicePixelRatio || 1;
      const computed = window.getComputedStyle(letter);

      glyphCanvas.width = Math.max(1, Math.ceil(rect.width * dpr));
      glyphCanvas.height = Math.max(1, Math.ceil(rect.height * dpr));

      glyphContext.setTransform(1, 0, 0, 1, 0, 0);
      glyphContext.clearRect(0, 0, glyphCanvas.width, glyphCanvas.height);
      glyphContext.scale(dpr, dpr);
      glyphContext.fillStyle = '#000';
      glyphContext.textAlign = 'center';
      glyphContext.textBaseline = 'alphabetic';
      glyphContext.font = `${computed.fontStyle} ${computed.fontWeight} ${computed.fontSize} ${computed.fontFamily}`;

      const metrics = glyphContext.measureText(text);
      const glyphHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
      const drawX = rect.width / 2;
      const drawY = (rect.height + metrics.actualBoundingBoxAscent - metrics.actualBoundingBoxDescent) / 2
        + (rect.height - glyphHeight) * 0.04;

      glyphContext.fillText(text, drawX, drawY);

      const sampleX = Math.floor((event.clientX - rect.left) * dpr);
      const sampleY = Math.floor((event.clientY - rect.top) * dpr);
      const radius = Math.max(1, Math.round(dpr * 1.5));

      for (let y = sampleY - radius; y <= sampleY + radius; y += 1) {
        for (let x = sampleX - radius; x <= sampleX + radius; x += 1) {
          if (x < 0 || y < 0 || x >= glyphCanvas.width || y >= glyphCanvas.height) continue;

          const alpha = glyphContext.getImageData(x, y, 1, 1).data[3];

          if (alpha > 20) return true;
        }
      }

      return false;
    }

    heroLetters.forEach((letter) => {
      const state = {
        currentX: 0,
        currentY: 0,
        currentRotate: 0,
        targetX: 0,
        targetY: 0,
        targetRotate: 0,
        dragPointerId: null,
        dragStartX: 0,
        dragStartY: 0,
        dragOriginX: 0,
        dragOriginY: 0,
        isDragging: false,
        frameId: null,
      };

      function syncGlyphHover(event) {
        if (state.isDragging) return;

        if (isPointerOnGlyph(letter, event)) {
          letter.classList.add('is-hover-glyph');
        } else {
          letter.classList.remove('is-hover-glyph');
        }
      }

      function renderLetter() {
        const ease = state.isDragging ? 0.34 : 0.14;

        state.currentX += (state.targetX - state.currentX) * ease;
        state.currentY += (state.targetY - state.currentY) * ease;
        state.currentRotate += (state.targetRotate - state.currentRotate) * (state.isDragging ? 0.28 : 0.12);

        letter.style.transform = `translate3d(${state.currentX.toFixed(2)}px, ${state.currentY.toFixed(2)}px, 0) rotate(${state.currentRotate.toFixed(2)}deg)`;

        const isMoving =
          Math.abs(state.targetX - state.currentX) > 0.08 ||
          Math.abs(state.targetY - state.currentY) > 0.08 ||
          Math.abs(state.targetRotate - state.currentRotate) > 0.08;

        if (isMoving) {
          state.frameId = window.requestAnimationFrame(renderLetter);
        } else {
          state.frameId = null;
        }
      }

      function startLetterRender() {
        if (!state.frameId) {
          state.frameId = window.requestAnimationFrame(renderLetter);
        }
      }

      letter.addEventListener('animationend', () => {
        letter.style.animation = 'none';
        letter.style.opacity = '1';
        letter.style.filter = 'none';
        letter.style.transform = 'translate3d(0, 0, 0) rotate(0deg)';
      }, { once: true });

      letter.addEventListener('pointerdown', (event) => {
        if (!isPointerOnGlyph(letter, event)) return;

        state.isDragging = true;
        state.dragPointerId = event.pointerId;
        state.dragStartX = event.clientX;
        state.dragStartY = event.clientY;
        state.dragOriginX = state.targetX;
        state.dragOriginY = state.targetY;
        letter.classList.add('is-dragging');
        letter.setPointerCapture(event.pointerId);
        startLetterRender();
      });

      letter.addEventListener('pointermove', (event) => {
        if (!state.isDragging) {
          syncGlyphHover(event);
        }
      });

      letter.addEventListener('pointerenter', (event) => {
        syncGlyphHover(event);
      });

      letter.addEventListener('pointerleave', () => {
        if (!state.isDragging) {
          letter.classList.remove('is-hover-glyph');
        }
      });

      letter.addEventListener('pointermove', (event) => {
        if (!state.isDragging || event.pointerId !== state.dragPointerId) return;

        const deltaX = (event.clientX - state.dragStartX) * 0.42;
        const deltaY = (event.clientY - state.dragStartY) * 0.42;

        state.targetX = Math.max(-42, Math.min(42, state.dragOriginX + deltaX));
        state.targetY = Math.max(-42, Math.min(42, state.dragOriginY + deltaY));
        state.targetRotate = Math.max(-14, Math.min(14, deltaX * 0.16));
        startLetterRender();
      });

      function releaseLetter(pointerId = state.dragPointerId) {
        if (!state.isDragging) return;

        state.isDragging = false;
        state.dragPointerId = null;
        state.targetX = 0;
        state.targetY = 0;
        state.targetRotate = 0;
        letter.classList.remove('is-dragging', 'is-hover-glyph');

        if (pointerId !== null && letter.hasPointerCapture(pointerId)) {
          letter.releasePointerCapture(pointerId);
        }

        startLetterRender();
      }

      letter.addEventListener('pointerup', (event) => {
        if (event.pointerId !== state.dragPointerId) return;
        releaseLetter(event.pointerId);
      });

      letter.addEventListener('pointercancel', (event) => {
        if (event.pointerId !== state.dragPointerId) return;
        releaseLetter(event.pointerId);
      });
    });
  }

  if (items.length) {
    const panelTransitionMs = 420;

    function syncState() {
      items.forEach((item) => {
        const button = item.querySelector('.accordion_trigger');
        button.setAttribute('aria-expanded', item.classList.contains('open') ? 'true' : 'false');
      });
    }

    function setPanelState(item, isOpen) {
      const panel = item.querySelector('.accordion_panel');

      if (!panel) return;

      window.clearTimeout(panel.hideTimer);

      if (isOpen) {
        item.classList.add('open');
        panel.style.display = 'block';
        panel.style.visibility = 'visible';

        window.requestAnimationFrame(() => {
          panel.style.opacity = '1';
        });

        return;
      }

      item.classList.remove('open');
      panel.style.opacity = '0';
      panel.style.visibility = 'hidden';
      panel.hideTimer = window.setTimeout(() => {
        panel.style.display = 'none';
      }, panelTransitionMs);
    }

    function closeAll(exceptItem = null) {
      items.forEach((item) => {
        if (item !== exceptItem) {
          setPanelState(item, false);
        }
      });

      syncState();
    }

    items.forEach((item) => {
      const panel = item.querySelector('.accordion_panel');

      if (!panel) return;

      if (item.classList.contains('open')) {
        panel.style.display = 'block';
        panel.style.visibility = 'visible';
        panel.style.opacity = '1';
      } else {
        panel.style.display = 'none';
        panel.style.visibility = 'hidden';
        panel.style.opacity = '0';
      }
    });

    syncState();

    items.forEach((item) => {
      const button = item.querySelector('.accordion_trigger');

      button.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');

        if (isOpen) {
          setPanelState(item, false);
          syncState();
          return;
        }

        closeAll(item);
        setPanelState(item, true);
        syncState();
      });
    });
  }

  if (eventSlider && eventTrack) {
    const originalItems = Array.from(eventTrack.children);

    originalItems.forEach((item) => {
      const clone = item.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
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

  if (mainVisualObjects.length) {
    const motionConfigs = {
      object_phone: { shift: 48, tilt: 11.5, scale: 1.15, burstScale: 1.26, burstTilt: 14 },
      object_bell: { shift: 42, tilt: 10.5, scale: 1.14, burstScale: 1.24, burstTilt: 12.5 },
      object_q: { shift: 54, tilt: 13, scale: 1.17, burstScale: 1.28, burstTilt: 15.5 },
      object_gift: { shift: 46, tilt: 11.2, scale: 1.15, burstScale: 1.25, burstTilt: 13.5 },
    };

    mainVisualObjects.forEach((object) => {
      const config = Object.entries(motionConfigs).find(([className]) => object.classList.contains(className))?.[1]
        || { shift: 40, tilt: 10, scale: 1.14, burstScale: 1.24, burstTilt: 13 };

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
        dragPointerId: null,
        dragStartX: 0,
        dragStartY: 0,
        dragOriginX: 0,
        dragOriginY: 0,
        isDragging: false,
        burstTimer: null,
      };

      function render() {
        const dragEase = state.isDragging ? 0.46 : 0.22;

        state.currentX += (state.targetX - state.currentX) * dragEase;
        state.currentY += (state.targetY - state.currentY) * dragEase;
        state.currentTilt += (state.targetTilt - state.currentTilt) * (state.isDragging ? 0.34 : 0.2);
        state.currentScale += (state.targetScale - state.currentScale) * (state.isDragging ? 0.28 : 0.18);

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

      function triggerBurst(direction = 1) {
        window.clearTimeout(state.burstTimer);
        object.classList.add('is-burst');
        state.targetScale = config.burstScale;
        state.targetTilt = config.burstTilt * direction;
        state.targetX += config.shift * 0.28 * direction;
        state.targetY -= config.shift * 0.18;
        startRender();

        state.burstTimer = window.setTimeout(() => {
          object.classList.remove('is-burst');
          if (!state.isDragging) {
            state.targetScale = config.scale;
          }
          startRender();
        }, 220);
      }

      object.addEventListener('pointerenter', () => {
        if (state.isDragging) return;
        object.classList.add('is-active');
        triggerBurst(1);
        startRender();
      });

      object.addEventListener('pointermove', (event) => {
        if (state.isDragging) return;

        const rect = object.getBoundingClientRect();
        const normalizedX = (event.clientX - rect.left) / rect.width - 0.5;
        const normalizedY = (event.clientY - rect.top) / rect.height - 0.5;

        state.targetX = normalizedX * config.shift * 3.4;
        state.targetY = normalizedY * config.shift * 3;
        state.targetTilt = normalizedX * config.tilt + normalizedY * 3.2;
        state.targetScale = config.scale;
        startRender();
      });

      object.addEventListener('pointerleave', () => {
        if (state.isDragging) return;
        object.classList.remove('is-active');
        object.classList.remove('is-burst');
        window.clearTimeout(state.burstTimer);
        state.targetX = 0;
        state.targetY = 0;
        state.targetTilt = 0;
        state.targetScale = 1;
        startRender();
      });

      object.addEventListener('pointerdown', (event) => {
        state.isDragging = true;
        state.dragPointerId = event.pointerId;
        state.dragStartX = event.clientX;
        state.dragStartY = event.clientY;
        state.dragOriginX = state.targetX;
        state.dragOriginY = state.targetY;
        state.targetScale = config.burstScale + 0.07;
        state.targetTilt = config.burstTilt * (Math.random() > 0.5 ? 1 : -1) * 1.15;
        object.classList.add('is-active', 'is-dragging', 'is-burst');
        object.setPointerCapture(event.pointerId);
        startRender();
      });

      object.addEventListener('pointermove', (event) => {
        if (!state.isDragging || event.pointerId !== state.dragPointerId) return;

        const deltaX = (event.clientX - state.dragStartX) * 0.42;
        const deltaY = (event.clientY - state.dragStartY) * 0.42;

        state.targetX = Math.max(-150, Math.min(150, state.dragOriginX + deltaX));
        state.targetY = Math.max(-150, Math.min(150, state.dragOriginY + deltaY));
        state.targetTilt = Math.max(-24, Math.min(24, deltaX * 0.16));
        startRender();
      });

      function releaseDrag(pointerId = state.dragPointerId) {
        if (!state.isDragging) return;

        state.isDragging = false;
        state.dragPointerId = null;
        state.targetX = 0;
        state.targetY = 0;
        state.targetTilt = 0;
        state.targetScale = 1;
        object.classList.remove('is-active', 'is-dragging', 'is-burst');
        window.clearTimeout(state.burstTimer);

        if (pointerId !== null && object.hasPointerCapture(pointerId)) {
          object.releasePointerCapture(pointerId);
        }

        startRender();
      }

      object.addEventListener('pointerup', (event) => {
        if (event.pointerId !== state.dragPointerId) return;
        releaseDrag(event.pointerId);
      });

      object.addEventListener('pointercancel', (event) => {
        if (event.pointerId !== state.dragPointerId) return;
        releaseDrag(event.pointerId);
      });
    });
  }

  // Prevent image copying on click
  const images = document.querySelectorAll('img');
  images.forEach((img) => {
    img.addEventListener('dragstart', (e) => e.preventDefault());
    img.addEventListener('contextmenu', (e) => e.preventDefault());
  });
}); //dom end
