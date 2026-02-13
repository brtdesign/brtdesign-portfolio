// wrap each letter in its own span
function splitLetters(el) {
  const text = el.textContent;
  el.textContent = "";
  [...text].forEach((ch) => {
    const wrapper = document.createElement("span");
    wrapper.className = "letter-stack";

    const ghost = document.createElement("span");
    ghost.className = "letter-ghost";
    ghost.textContent = ch === " " ? "\u00A0" : ch;

    const live = document.createElement("span");
    live.className = "letter";
    live.textContent = ch === " " ? "\u00A0" : ch;

    wrapper.appendChild(ghost);
    wrapper.appendChild(live);
    el.appendChild(wrapper);
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
  const totalWindow = 3850;
  const firstDelay = 0;
  const earlyGaps = [1200, 1000, 1100, 700, 200, 260, 1450];
  const earlyDelays = [firstDelay];
  earlyGaps.forEach((gap) => {
    earlyDelays.push(earlyDelays[earlyDelays.length - 1] + gap);
  });
  const tailStart = 3200;
  const tailWindow = Math.max(0, totalWindow - tailStart);
  const fallDurationMs = 450;
  const fadeOutDelay = 400;
  const fadeOutDuration = 800;
  const replacementDelay = 200;
  const holdDuration = 2500;
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
    const x = (Math.random() - 0.8) * 40; // horizontal offset
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
  activeTimers.push(
    window.setTimeout(() => {
      el.style.transition = `opacity ${fadeOutDuration}ms ease`;
      el.style.opacity = "0";
      activeTimers.push(
        window.setTimeout(() => {
          el.remove();
          if (message) {
            message.hidden = false;
            message.setAttribute("aria-hidden", "false");
            message.classList.add("is-visible");
          }
          if (scrollChevron) {
            activeTimers.push(
              window.setTimeout(() => {
                scrollChevron.style.opacity = "1";
              }, holdDuration),
            );
          }
        }, fadeOutDuration + replacementDelay),
      );
    }, fallCompleteAt + fadeOutDelay),
  );
}

const messageEl = document.getElementById("fallTextMessage");
const replayTrigger = document.getElementById("replayTrigger");
const scrollChevron = document.getElementById("scrollChevron");
let activeTimers = [];

const startLetterCollapse = () => {
  const textEl = document.getElementById("fallText");
  if (!textEl || !messageEl) return;
  activeTimers.forEach((timer) => window.clearTimeout(timer));
  activeTimers = [];
  if (scrollChevron) {
    scrollChevron.style.opacity = "0";
  }
  messageEl.hidden = true;
  messageEl.setAttribute("aria-hidden", "true");
  messageEl.classList.remove("is-visible");
  textEl.style.display = "inline";
  textEl.style.opacity = "1";
  const delay = 1500;
  activeTimers.push(
    window.setTimeout(() => {
      splitLetters(textEl);
      destroyLetters(textEl, messageEl);
    }, delay),
  );
};

window.startLetterCollapse = startLetterCollapse;

if (replayTrigger) {
  replayTrigger.addEventListener("click", () => {
    const currentText = document.getElementById("fallText");
    if (!messageEl) return;
    if (currentText) {
      currentText.remove();
    }
    const span = document.createElement("span");
    span.id = "fallText";
    span.className = "replacable-message";
    span.textContent = "“We're not changing the group process.”";
    messageEl.hidden = true;
    messageEl.setAttribute("aria-hidden", "true");
    messageEl.classList.remove("is-visible");
    const blockquote = messageEl.closest("blockquote");
    if (blockquote) {
      blockquote.insertBefore(span, messageEl);
    }
    startLetterCollapse();
  });
}

if (scrollChevron) {
  scrollChevron.addEventListener("click", () => {
    const targetBlock = document.getElementById("scroll-target");
    if (!targetBlock) return;
    const header = document.querySelector("header");
    const headerHeight = header ? header.getBoundingClientRect().height : 0;
    const start = window.pageYOffset;
    const rect = targetBlock.getBoundingClientRect();
    const targetY = start + rect.top - headerHeight - 12;
    window.scrollTo({ top: targetY, behavior: "smooth" });
  });
}
