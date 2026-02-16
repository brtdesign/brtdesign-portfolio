const target = document.querySelector("[data-scroll-quote]");
const trigger = document.querySelector("[data-scroll-quote-trigger]");

if (target && trigger) {
  let triggered = false;
  let scrollLocked = false;
  let previousBodyOverflow = "";

  const isTriggerVisible = () => {
    const rect = trigger.getBoundingClientRect();
    return rect.top <= window.innerHeight && rect.bottom >= 0;
  };

  const blockScrollInput = (event) => {
    if (!scrollLocked) return;
    event.preventDefault();
  };

  const lockScroll = () => {
    if (scrollLocked) return;
    scrollLocked = true;
    previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("wheel", blockScrollInput, {
      passive: false,
      capture: true,
    });
    window.addEventListener("touchmove", blockScrollInput, {
      passive: false,
      capture: true,
    });
    window.addEventListener("keydown", blockScrollInput, true);
  };

  const unlockScroll = () => {
    if (!scrollLocked) return;
    scrollLocked = false;
    document.body.style.overflow = previousBodyOverflow;
    window.removeEventListener("wheel", blockScrollInput, true);
    window.removeEventListener("touchmove", blockScrollInput, true);
    window.removeEventListener("keydown", blockScrollInput, true);
  };

  const triggerScroll = () => {
    if (triggered || !isTriggerVisible()) return;
    triggered = true;
    window.removeEventListener("wheel", onWheel);
    window.removeEventListener("touchmove", onTouchMove);
    window.removeEventListener("keydown", onKeyDown);
    lockScroll();
    window.addEventListener("letterCollapseComplete", unlockScroll, {
      once: true,
    });
    const start = window.pageYOffset;
    const rect = target.getBoundingClientRect();
    const targetY =
      start + rect.top - (window.innerHeight / 2 - rect.height / 2);
    const duration = 900;
    let startTime = 0;
    const easeOut = (t) => 1 - Math.pow(1 - t, 3);
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(1, elapsed / duration);
      const eased = easeOut(progress);
      window.scrollTo(0, start + (targetY - start) * eased);
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
    if (typeof window.startLetterCollapse === "function") {
      window.startLetterCollapse();
    } else {
      unlockScroll();
    }
  };

  const onWheel = (event) => {
    if (event.deltaY > 0) {
      triggerScroll();
    }
  };

  const onTouchMove = () => {
    triggerScroll();
  };

  const onKeyDown = (event) => {
    if (
      event.key === "ArrowDown" ||
      event.key === "PageDown" ||
      event.key === " "
    ) {
      triggerScroll();
    }
  };

  window.addEventListener("wheel", onWheel, { passive: true });
  window.addEventListener("touchmove", onTouchMove, { passive: true });
  window.addEventListener("keydown", onKeyDown);
}
