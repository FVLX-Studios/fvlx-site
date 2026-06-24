/* ============================================================
   FVLX Studio — editorial interaction layer
   GSAP + ScrollTrigger + Lenis · custom cursor · magnetic · masks
   ============================================================ */

document.getElementById("year").textContent = new Date().getFullYear();

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const canHover = window.matchMedia("(hover: hover)").matches;
const hasGSAP = typeof gsap !== "undefined";

/* ---------- Recursive character splitter (preserves <em> etc.) ---------- */
function splitNodes(node) {
  const out = [];
  node.childNodes.forEach((child) => {
    if (child.nodeType === 3) {
      // Split on whitespace, keep spaces; wrap each WORD so it can't break mid-word.
      child.textContent.split(/(\s+)/).forEach((part) => {
        if (part === "") return;
        if (/^\s+$/.test(part)) { out.push(document.createTextNode(part)); return; }
        const word = document.createElement("span");
        word.className = "word";
        part.split("").forEach((ch) => {
          const c = document.createElement("span");
          c.className = "char";
          c.textContent = ch;
          word.appendChild(c);
        });
        out.push(word);
      });
    } else if (child.nodeType === 1) {
      const clone = child.cloneNode(false);
      splitNodes(child).forEach((n) => clone.appendChild(n));
      out.push(clone);
    }
  });
  return out;
}
function splitInto(el) {
  const frag = splitNodes(el);
  el.textContent = "";
  frag.forEach((n) => el.appendChild(n));
  return el.querySelectorAll(".char");
}

/* ---------- Portfolio swipe (works with or without GSAP) ---------- */
function setupGallerySwipe() {
  const vp = document.querySelector(".gallery-viewport");
  if (!vp) return;
  let down = false, startX = 0, startScroll = 0, moved = false;
  vp.addEventListener("pointerdown", (e) => {
    down = true; moved = false; startX = e.clientX; startScroll = vp.scrollLeft;
    vp.classList.add("dragging");
    try { vp.setPointerCapture(e.pointerId); } catch (_) {}
  });
  vp.addEventListener("pointermove", (e) => {
    if (!down) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 4) moved = true;
    vp.scrollLeft = startScroll - dx;
  });
  const end = () => { down = false; vp.classList.remove("dragging"); };
  vp.addEventListener("pointerup", end);
  vp.addEventListener("pointercancel", end);
  vp.addEventListener("pointerleave", end);
  vp.addEventListener("click", (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);
  // Horizontal wheel scrolls the gallery; vertical bubbles to Lenis (page scroll).
  vp.addEventListener("wheel", (e) => {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) e.stopPropagation();
  }, { passive: true });
}

/* ---------- Custom cursor + magnetic buttons (need hover + GSAP) ---------- */
function setupCursor() {
  if (!canHover || !hasGSAP) return;
  const dot = document.getElementById("cursor");
  const label = document.getElementById("cursorLabel");
  // Position via left/top so CSS keeps the translate(-50%,-50%) centering.
  window.addEventListener("pointermove", (e) => {
    dot.style.left = e.clientX + "px"; dot.style.top = e.clientY + "px";
    label.style.left = e.clientX + "px"; label.style.top = e.clientY + "px";
  });

  document.querySelectorAll("[data-cursor]").forEach((el) => {
    const view = el.getAttribute("data-cursor") === "view";
    el.addEventListener("pointerenter", () => {
      dot.classList.add(view ? "view" : "grow");
      if (view) label.classList.add("show");
    });
    el.addEventListener("pointerleave", () => {
      dot.classList.remove("grow", "view");
      label.classList.remove("show");
    });
  });
}

function setupMagnetic() {
  if (!canHover || !hasGSAP) return;
  document.querySelectorAll(".magnetic").forEach((btn) => {
    const inner = btn.querySelector("span") || btn;
    const strength = 0.35;
    btn.addEventListener("pointermove", (e) => {
      const r = btn.getBoundingClientRect();
      const mx = e.clientX - (r.left + r.width / 2);
      const my = e.clientY - (r.top + r.height / 2);
      gsap.to(btn, { x: mx * strength, y: my * strength, duration: 0.6, ease: "power3" });
      gsap.to(inner, { x: mx * strength * 0.4, y: my * strength * 0.4, duration: 0.6, ease: "power3" });
    });
    btn.addEventListener("pointerleave", () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.4)" });
      gsap.to(inner, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.4)" });
    });
  });
}

/* ====================================================================== */

setupGallerySwipe();

if (!hasGSAP || reduceMotion) {
  // Static fallback: ensure nothing is left clipped/hidden.
  document.querySelectorAll(".reveal-line").forEach((el) => (el.style.clipPath = "none"));
} else {
  gsap.registerPlugin(ScrollTrigger);

  /* ---- Lenis momentum scroll ---- */
  if (typeof Lenis !== "undefined") {
    const lenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener("click", (e) => {
        const t = document.querySelector(a.getAttribute("href"));
        if (t) { e.preventDefault(); lenis.scrollTo(t, { offset: 0 }); }
      });
    });
  }

  /* ---- Kinetic hero headline, letter by letter ---- */
  const heroChars = splitInto(document.querySelector(".hero-h"));
  gsap.set(".hero-h", { opacity: 1 });
  gsap.from(heroChars, {
    yPercent: 120, opacity: 0,
    duration: 1, ease: "power4.out", stagger: 0.012, delay: 0.2,
  });
  // meta + foot fade in after
  gsap.from(".hero-meta span, .hero-foot span", { opacity: 0, y: 14, duration: 1, ease: "power3.out", stagger: 0.1, delay: 0.9 });

  /* ---- Clip-path mask reveals on headlines ---- */
  gsap.utils.toArray(".reveal-line").forEach((el) => {
    gsap.fromTo(el, { clipPath: "inset(0 0 100% 0)", y: 40 }, {
      clipPath: "inset(0 0 0% 0)", y: 0, duration: 1.3, ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 85%" },
    });
  });

  /* ---- Editorial paragraphs brighten as they enter ---- */
  gsap.utils.toArray(".manifesto-text, .about-text").forEach((el) => {
    gsap.fromTo(el, { opacity: 0.12 }, {
      opacity: 1, ease: "none",
      scrollTrigger: { trigger: el, start: "top 80%", end: "top 40%", scrub: true },
    });
  });

  /* ---- Service rows slide up on enter ---- */
  gsap.utils.toArray(".svc-row").forEach((row) => {
    gsap.from(row, {
      y: 60, opacity: 0, duration: 1, ease: "power3.out",
      scrollTrigger: { trigger: row, start: "top 90%" },
    });
  });

  /* ---- Gallery pieces mask-reveal as they enter horizontally-ish ---- */
  gsap.utils.toArray(".piece").forEach((p, i) => {
    gsap.from(p, {
      y: 60, opacity: 0, duration: 1, ease: "power3.out", delay: (i % 3) * 0.08,
      scrollTrigger: { trigger: ".gallery", start: "top 80%" },
    });
  });

  /* ---- Marquee nudges with scroll velocity ---- */
  /* (kept CSS-driven; ScrollTrigger could add velocity skew if desired) */

  /* ---- Footer wordmark rises ---- */
  gsap.from(".wordmark", {
    yPercent: 30, opacity: 0, duration: 1.4, ease: "power3.out",
    scrollTrigger: { trigger: ".footer", start: "top 70%" },
  });

  setupCursor();
  setupMagnetic();

  window.addEventListener("load", () => ScrollTrigger.refresh());
}
