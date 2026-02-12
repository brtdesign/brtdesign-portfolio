// wrap each letter in its own span
function splitLetters(el) {
  const text = el.textContent;
  el.textContent = "";
  [...text].forEach((ch) => {
    const span = document.createElement("span");
    span.className = "letter";
    span.textContent = ch === " " ? "\u00A0" : ch;
    el.appendChild(span);
  });
}
const header = document.querySelector("header");
const headerHeight = header ? header.getBoundingClientRect().height : 0;

const fallheight = (window.innerHeight - headerHeight) / 2;

// trigger falling animation on all letters
function destroyLetters(el, message) {
  const letters = [...el.querySelectorAll(".letter")];
  for (let i = letters.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [letters[i], letters[j]] = [letters[j], letters[i]];
  }
  const total = letters.length;
  const totalWindow = 3650;
  const firstDelay = 0;
  const earlyGaps = [1200, 1000, 700, 500, 200, 160, 1250];
  const earlyDelays = [firstDelay];
  earlyGaps.forEach((gap) => {
    earlyDelays.push(earlyDelays[earlyDelays.length - 1] + gap);
  });
  const tailStart = 2600;
  const tailWindow = Math.max(0, totalWindow - tailStart);
  const fallDurationMs = 500;
  const fadeOutDelay = 400;
  const fadeOutDuration = 1200;
  const replacementDelay = 300;
  const holdDuration = 7000;
  let maxDelay = 0;

  letters.forEach((letter, index) => {
    let delay = tailStart;
    if (index === 0) {
      delay = firstDelay;
    } else if (index <= 8) {
      delay = earlyDelays[index] ?? earlyDelays[earlyDelays.length - 1];
    } else {
      const remaining = Math.max(1, total - 9);
      const t = (index - 9) / remaining;
      const curve = t * t;
      delay = tailStart + curve * tailWindow;
    }
    maxDelay = Math.max(maxDelay, delay);

    // random drift values
    const x = (Math.random() - 0.5) * 40; // horizontal offset
    // const y = 40 + Math.random() * fallheight; // fall distance
    const y = fallheight; // fall distance
    const r = (Math.random() - 0.5) * 45; // rotation

    letter.style.setProperty("--x", `${x}px`);
    letter.style.setProperty("--y", `${y}px`);
    letter.style.setProperty("--r", `${r}deg`);

    // animate
    // const duration = 0.9 + Math.random() * 0.25;
    const duration = fallDurationMs / 1000;
    letter.style.animation = `fallAway ${duration}s ease-in ${delay}ms forwards`;
  });

  const fallCompleteAt = maxDelay + fallDurationMs;
  window.setTimeout(() => {
    el.style.transition = `opacity ${fadeOutDuration}ms ease`;
    el.style.opacity = "0";
    window.setTimeout(() => {
      el.remove();
      if (message) {
        message.hidden = false;
        message.setAttribute("aria-hidden", "false");
        message.classList.add("is-visible");
      }
      const targetBlock = document.getElementById("scroll-target");
      if (targetBlock) {
        window.setTimeout(() => {
          const header = document.querySelector("header");
          const headerHeight = header
            ? header.getBoundingClientRect().height
            : 0;
          const start = window.pageYOffset;
          const rect = targetBlock.getBoundingClientRect();
          const targetY = start + rect.top - headerHeight - 12;
          window.scrollTo({ top: targetY, behavior: "smooth" });
        }, holdDuration);
      }
    }, fadeOutDuration + replacementDelay);
  }, fallCompleteAt + fadeOutDelay);
}

const textEl = document.getElementById("fallText");
const messageEl = document.getElementById("fallTextMessage");

const startLetterCollapse = () => {
  if (!textEl || !messageEl) return;
  messageEl.hidden = true;
  messageEl.setAttribute("aria-hidden", "true");
  messageEl.classList.remove("is-visible");
  const delay = 1500;
  window.setTimeout(() => {
    splitLetters(textEl);
    destroyLetters(textEl, messageEl);
  }, delay);
};

window.startLetterCollapse = startLetterCollapse;
