const AUTO_LIGHTBOX_ID = "image-row-auto";
const AUTO_LIGHTBOX_ALT = "Expanded image";
const LIGHTBOX_DEFAULT_MODE_ATTR = "data-lightbox-default";
const LIGHTBOX_MODE_FULL = "full";
const LIGHTBOX_VIEWPORT_CAP = 0.92;
const LIGHTBOX_MIN_WIDTH = 240;
const LIGHTBOX_MIN_HEIGHT = 140;

const openLightbox = (dialog, options = {}) => {
  if (!dialog || typeof dialog.showModal !== "function") return;
  const mode = options.defaultMode || "";
  if (mode) {
    dialog.dataset.lightboxDefaultMode = mode;
  } else {
    delete dialog.dataset.lightboxDefaultMode;
  }
  dialog.showModal();
  dialog.dispatchEvent(new Event("lightbox:open"));
};

const initLightboxDialog = (dialog) => {
  if (!dialog || dialog.dataset.lightboxInit === "true") return;
  dialog.dataset.lightboxInit = "true";

  const closeButton = dialog.querySelector(".lightbox__close");
  const toggleButton = dialog.querySelector(".lightbox__toggle");
  const inner = dialog.querySelector(".lightbox__inner");
  const actions = dialog.querySelector(".lightbox__actions");
  const imageWrap = dialog.querySelector(".lightbox__image");
  const image = dialog.querySelector(".lightbox__image img");
  let sizeUpdateToken = 0;

  const updateDialogSize = () => {
    if (!image) return;

    const applySize = () => {
      if (!image.naturalWidth || !image.naturalHeight) return;

      const maxWidth = Math.floor(window.innerWidth * LIGHTBOX_VIEWPORT_CAP);
      const maxHeight = Math.floor(window.innerHeight * LIGHTBOX_VIEWPORT_CAP);
      let actionsHeight = 0;
      if (actions) {
        const styles = getComputedStyle(actions);
        const marginBottom = parseFloat(styles.marginBottom) || 0;
        actionsHeight = actions.offsetHeight + marginBottom;
      }
      const imageRect = image.getBoundingClientRect();
      const renderedWidth =
        imageRect.width > 0 ? imageRect.width : image.naturalWidth;
      const renderedHeight =
        imageRect.height > 0 ? imageRect.height : image.naturalHeight;
      const dialogStyles = getComputedStyle(dialog);
      const borderX =
        (parseFloat(dialogStyles.borderLeftWidth) || 0) +
        (parseFloat(dialogStyles.borderRightWidth) || 0);
      const borderY =
        (parseFloat(dialogStyles.borderTopWidth) || 0) +
        (parseFloat(dialogStyles.borderBottomWidth) || 0);
      const wrapStyles = imageWrap ? getComputedStyle(imageWrap) : null;
      const wrapPadX = wrapStyles
        ? (parseFloat(wrapStyles.paddingLeft) || 0) +
          (parseFloat(wrapStyles.paddingRight) || 0)
        : 0;
      const wrapPadY = wrapStyles
        ? (parseFloat(wrapStyles.paddingTop) || 0) +
          (parseFloat(wrapStyles.paddingBottom) || 0)
        : 0;
      const dialogWidth = Math.max(
        LIGHTBOX_MIN_WIDTH,
        Math.min(maxWidth, Math.ceil(renderedWidth + wrapPadX + borderX)),
      );
      const dialogHeight = Math.max(
        LIGHTBOX_MIN_HEIGHT,
        Math.min(
          maxHeight,
          Math.ceil(renderedHeight + wrapPadY + actionsHeight + borderY),
        ),
      );

      dialog.style.width = `${dialogWidth}px`;
      dialog.style.height = `${dialogHeight}px`;
    };

    if (image.complete && image.naturalWidth && image.naturalHeight) {
      applySize();
      return;
    }

    image.addEventListener("load", applySize, { once: true });
  };

  const scheduleDialogSizeUpdate = () => {
    requestAnimationFrame(() => {
      updateDialogSize();
    });
  };

  const resetDialogSize = () => {
    dialog.style.removeProperty("width");
    dialog.style.removeProperty("height");
  };

  const handleImageSourceChange = () => {
    if (!image) return;
    sizeUpdateToken += 1;
    const token = sizeUpdateToken;
    resetDialogSize();
    image.style.removeProperty("max-height");

    const finalize = () => {
      if (token !== sizeUpdateToken) return;
      if (inner && inner.classList.contains("is-fit")) {
        updateFitHeight();
      }
      scheduleDialogSizeUpdate();
    };

    if (image.complete && image.naturalWidth && image.naturalHeight) {
      finalize();
      return;
    }

    const onLoad = () => finalize();
    image.addEventListener("load", onLoad, { once: true });
    image.addEventListener("error", onLoad, { once: true });

    if (typeof image.decode === "function") {
      image.decode().then(finalize).catch(() => {});
    }
  };

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
    const isDefaultFull = dialog.dataset.lightboxDefaultMode === LIGHTBOX_MODE_FULL;
    inner.classList.toggle("is-fit", !isDefaultFull);
    if (toggleButton) {
      const isFit = inner.classList.contains("is-fit");
      toggleButton.setAttribute("aria-pressed", String(isFit));
      toggleButton.textContent = isFit ? "Show full size" : "Fit height";
    }
    handleImageSourceChange();
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
      scheduleDialogSizeUpdate();
    });
  }

  if (inner) {
    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(() => {
        updateFitHeight();
        scheduleDialogSizeUpdate();
      });
      observer.observe(inner);
    } else {
      window.addEventListener("resize", () => {
        updateFitHeight();
        scheduleDialogSizeUpdate();
      });
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
};

const ensureAutoLightbox = () => {
  let dialog = document.querySelector(`[data-lightbox="${AUTO_LIGHTBOX_ID}"]`);
  if (dialog) return dialog;

  dialog = document.createElement("dialog");
  dialog.className = "lightbox";
  dialog.setAttribute("data-lightbox", AUTO_LIGHTBOX_ID);
  dialog.setAttribute("aria-label", "Expanded image preview");
  dialog.innerHTML = `
    <div class="lightbox__actions">
      <button class="lightbox__toggle" type="button" aria-pressed="false">Fit height</button>
      <button class="lightbox__close" type="button" aria-label="Close">×</button>
    </div>
    <div class="lightbox__inner">
      <div class="lightbox__image">
        <img src="" alt="${AUTO_LIGHTBOX_ALT}" draggable="false" />
      </div>
    </div>
  `;
  document.body.append(dialog);
  return dialog;
};

const getLightboxTargetSrc = (image) => {
  const customTarget = image.getAttribute("data-lightbox-src");
  if (customTarget) return customTarget;
  if (image.currentSrc) return image.currentSrc;
  return image.getAttribute("src");
};

const getDefaultLightboxMode = (element) => {
  if (!element) return "";
  return (element.getAttribute(LIGHTBOX_DEFAULT_MODE_ATTR) || "")
    .trim()
    .toLowerCase();
};

const getDefaultLightboxModeForImage = (image) => {
  const imageMode = getDefaultLightboxMode(image);
  if (imageMode) return imageMode;
  const row = image ? image.closest(".image-row") : null;
  return getDefaultLightboxMode(row);
};

const isExplicitLightboxTriggerImage = (image) => {
  return Boolean(image.closest("[data-lightbox-target]"));
};

const initImageRowLightbox = () => {
  const rowImages = document.querySelectorAll(".image-row img");
  if (rowImages.length === 0) return;

  const autoLightbox = ensureAutoLightbox();
  initLightboxDialog(autoLightbox);

  const lightboxImage = autoLightbox.querySelector(".lightbox__image img");
  if (!lightboxImage) return;

  rowImages.forEach((image) => {
    if (isExplicitLightboxTriggerImage(image)) return;

    image.addEventListener("click", () => {
      const targetSrc = getLightboxTargetSrc(image);
      if (!targetSrc) return;
      lightboxImage.src = targetSrc;
      lightboxImage.alt = image.getAttribute("alt") || AUTO_LIGHTBOX_ALT;
      openLightbox(autoLightbox, {
        defaultMode: getDefaultLightboxModeForImage(image),
      });
    });
  });
};

const triggers = document.querySelectorAll("[data-lightbox-target]");
triggers.forEach((trigger) => {
  trigger.addEventListener("click", () => {
    const target = trigger.getAttribute("data-lightbox-target");
    const dialog = document.querySelector(`[data-lightbox="${target}"]`);
    openLightbox(dialog, {
      defaultMode: getDefaultLightboxMode(trigger),
    });
  });
});

const lightboxes = document.querySelectorAll("[data-lightbox]");
lightboxes.forEach((dialog) => initLightboxDialog(dialog));

initImageRowLightbox();
