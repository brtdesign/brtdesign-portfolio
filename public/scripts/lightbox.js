const lightboxes = document.querySelectorAll("[data-lightbox]");
const triggers = document.querySelectorAll("[data-lightbox-target]");

triggers.forEach((trigger) => {
  trigger.addEventListener("click", () => {
    const target = trigger.getAttribute("data-lightbox-target");
    const dialog = document.querySelector(`[data-lightbox="${target}"]`);
    if (dialog && typeof dialog.showModal === "function") {
      dialog.showModal();
      dialog.dispatchEvent(new Event("lightbox:open"));
    }
  });
});

lightboxes.forEach((dialog) => {
  const closeButton = dialog.querySelector(".lightbox__close");
  const toggleButton = dialog.querySelector(".lightbox__toggle");
  const inner = dialog.querySelector(".lightbox__inner");
  const actions = dialog.querySelector(".lightbox__actions");
  const imageWrap = dialog.querySelector(".lightbox__image");
  const image = dialog.querySelector(".lightbox__image img");
  if (closeButton) {
    closeButton.addEventListener("click", () => dialog.close());
  }

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      dialog.close();
    }
  });

  const updateFitHeight = () => {
    if (!inner || !imageWrap || !image) return;
    if (!inner.classList.contains("is-fit")) return;
    const innerHeight = inner.clientHeight;
    let actionsHeight = 0;
    if (actions) {
      const styles = getComputedStyle(actions);
      const marginBottom = parseFloat(styles.marginBottom) || 0;
      actionsHeight = actions.offsetHeight + marginBottom;
    }
    const wrapStyles = getComputedStyle(imageWrap);
    const padTop = parseFloat(wrapStyles.paddingTop) || 0;
    const padBottom = parseFloat(wrapStyles.paddingBottom) || 0;
    const available = Math.max(
      0,
      innerHeight - actionsHeight - padTop - padBottom,
    );
    image.style.maxHeight = `${available}px`;
  };

  dialog.addEventListener("lightbox:open", () => {
    if (!inner) return;
    inner.classList.add("is-fit");
    if (toggleButton) {
      toggleButton.setAttribute("aria-pressed", "true");
      toggleButton.textContent = "Show full size";
    }
    updateFitHeight();
  });

  if (toggleButton && inner) {
    toggleButton.addEventListener("click", () => {
      const isFit = inner.classList.toggle("is-fit");
      toggleButton.setAttribute("aria-pressed", String(isFit));
      toggleButton.textContent = isFit ? "Show full size" : "Fit height";
      if (isFit) {
        updateFitHeight();
      } else if (image) {
        image.style.removeProperty("max-height");
        const maxScrollTop = inner.scrollHeight - inner.clientHeight;
        const target = Math.max(0, maxScrollTop * 0.445);
        const start = inner.scrollTop;
        const duration = 1500;
        let startTime = 0;
        const easeOut = (t) => 1 - Math.pow(1 - t, 3);
        const step = (timestamp) => {
          if (!startTime) startTime = timestamp;
          const elapsed = timestamp - startTime;
          const progress = Math.min(1, elapsed / duration);
          const eased = easeOut(progress);
          inner.scrollTop = start + (target - start) * eased;
          if (progress < 1) {
            requestAnimationFrame(step);
          }
        };
        requestAnimationFrame(step);
      }
    });
  }

  if (inner) {
    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(() => updateFitHeight());
      observer.observe(inner);
    } else {
      window.addEventListener("resize", updateFitHeight);
    }
  }

  if (inner) {
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let startScrollLeft = 0;
    let startScrollTop = 0;
    let lastX = 0;
    let lastY = 0;
    let lastTime = 0;
    let velocityX = 0;
    let velocityY = 0;
    let momentumFrame = 0;

    inner.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) return;
      const target = event.target;
      if (target && target.closest(".lightbox__close")) return;
      event.preventDefault();
      if (momentumFrame) {
        cancelAnimationFrame(momentumFrame);
        momentumFrame = 0;
      }
      isDragging = true;
      inner.setPointerCapture(event.pointerId);
      inner.classList.add("is-dragging");
      startX = event.clientX;
      startY = event.clientY;
      startScrollLeft = inner.scrollLeft;
      startScrollTop = inner.scrollTop;
      lastX = event.clientX;
      lastY = event.clientY;
      lastTime = performance.now();
      velocityX = 0;
      velocityY = 0;
    });

    inner.addEventListener("pointermove", (event) => {
      if (!isDragging) return;
      event.preventDefault();
      const dx = event.clientX - startX;
      const dy = event.clientY - startY;
      inner.scrollLeft = startScrollLeft - dx;
      inner.scrollTop = startScrollTop - dy;
      const now = performance.now();
      const dt = Math.max(16, now - lastTime);
      velocityX = (event.clientX - lastX) / dt;
      velocityY = (event.clientY - lastY) / dt;
      lastX = event.clientX;
      lastY = event.clientY;
      lastTime = now;
    });

    inner.addEventListener("pointerup", () => {
      isDragging = false;
      inner.classList.remove("is-dragging");
      const decay = 0.95;
      const minSpeed = 0.02;
      let vx = velocityX;
      let vy = velocityY;

      const step = () => {
        vx *= decay;
        vy *= decay;
        if (Math.abs(vx) < minSpeed && Math.abs(vy) < minSpeed) {
          momentumFrame = 0;
          return;
        }
        inner.scrollLeft -= vx * 16;
        inner.scrollTop -= vy * 16;
        momentumFrame = requestAnimationFrame(step);
      };

      momentumFrame = requestAnimationFrame(step);
    });

    inner.addEventListener("pointercancel", () => {
      isDragging = false;
      inner.classList.remove("is-dragging");
    });
  }
});
