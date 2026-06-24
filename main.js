/* ============================================================
   FVLX Studios — cinematic scroll choreography
   GSAP + ScrollTrigger + Lenis smooth scrolling
   ============================================================ */

document.getElementById("year").textContent = new Date().getFullYear();

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---- Nav background + floating sub-nav on scroll ---- */
const nav = document.getElementById("nav");
const subnav = document.getElementById("subnav");
const hero = document.querySelector(".hero");

function onNavScroll() {
  const y = window.scrollY;
  nav.classList.toggle("scrolled", y > 40);
  // Reveal the floating sub-nav once we've scrolled past most of the hero,
  // and step the main nav aside so they don't stack.
  const past = y > hero.offsetHeight - 120;
  subnav.classList.toggle("show", past);
  subnav.setAttribute("aria-hidden", past ? "false" : "true");
  nav.classList.toggle("nav-hide", past);
}
onNavScroll();
window.addEventListener("scroll", onNavScroll, { passive: true });
window.addEventListener("resize", onNavScroll, { passive: true });

/* ---- Testimonial carousel (works regardless of motion pref) ---- */
(function carousel() {
  const track = document.getElementById("ttrack");
  if (!track) return;
  const step = () => Math.min(480, track.firstElementChild.offsetWidth + 24);
  document.getElementById("tnext").addEventListener("click", () => track.scrollBy({ left: step(), behavior: "smooth" }));
  document.getElementById("tprev").addEventListener("click", () => track.scrollBy({ left: -step(), behavior: "smooth" }));
})();

/* ---- Portfolio filters ---- */
function setupFilters(refresh) {
  const buttons = document.querySelectorAll(".filter");
  const projects = document.querySelectorAll(".proj");
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const f = btn.dataset.filter;
      projects.forEach((p) => {
        const show = f === "all" || p.dataset.cat === f;
        p.style.display = show ? "" : "none";
      });
      if (refresh) refresh();
    });
  });
}

/* Portfolio: native horizontal swipe (two-finger trackpad) + click-drag. */
function setupPortfolioSwipe() {
  const vp = document.querySelector(".port-viewport");
  if (!vp) return;
  let down = false, startX = 0, startScroll = 0, moved = false;

  vp.addEventListener("pointerdown", (e) => {
    down = true; moved = false;
    startX = e.clientX; startScroll = vp.scrollLeft;
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
  // Swallow the click that follows a drag so cards don't navigate mid-swipe.
  vp.addEventListener("click", (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);
}

/* If GSAP failed to load (e.g. offline), reveal everything and bail. */
if (typeof gsap === "undefined" || reduceMotion) {
  document.querySelectorAll(".reveal-up, .hero-eyebrow, .hero-sub, .hero-actions, .story-card")
    .forEach((el) => (el.style.opacity = 1));
  setupFilters(null);
  setupPortfolioSwipe();
} else {
  gsap.registerPlugin(ScrollTrigger);

  /* ---- Lenis smooth scroll, synced to ScrollTrigger ---- */
  let lenis;
  if (typeof Lenis !== "undefined") {
    lenis = new Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    // Anchor links go through Lenis for buttery jumps
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener("click", (e) => {
        const target = document.querySelector(a.getAttribute("href"));
        if (target) { e.preventDefault(); lenis.scrollTo(target, { offset: 0 }); }
      });
    });
  }

  /* ---- 1. HERO load-in ---- */
  const heroTl = gsap.timeline({ defaults: { ease: "power4.out" } });
  heroTl
    .from(".hero-title .line", { yPercent: 120, opacity: 0, duration: 1.2, stagger: 0.12 })
    .to(".hero-eyebrow", { opacity: 1, y: 0, duration: 0.8 }, 0.2)
    .fromTo(".hero-eyebrow", { y: 16 }, { y: 0, duration: 0.8 }, 0.2)
    .to(".hero-sub", { opacity: 1, duration: 1 }, "-=0.5")
    .to(".hero-actions", { opacity: 1, duration: 1 }, "-=0.7");

  /* Hero scales down + fades as you scroll past (Apple signature) */
  gsap.to(".hero-content", {
    scale: 0.86, opacity: 0, y: -60, ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
  });
  /* Aurora parallax (slower than foreground) */
  gsap.to(".hero .aurora", {
    yPercent: 30, ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
  });

  /* ---- 2. PINNED STORY: reveal Design / Build / Launch one at a time ---- */
  const cards = gsap.utils.toArray(".story-card");
  const dots = gsap.utils.toArray(".story-progress .dot");
  const setActiveDot = (i) => dots.forEach((d, n) => d.classList.toggle("active", n === i));
  setActiveDot(0);

  const storyTl = gsap.timeline({
    scrollTrigger: {
      trigger: ".story",
      start: "top top",
      end: "+=2600",
      scrub: 1,
      pin: ".story-pin",
      anticipatePin: 1,
    },
  });
  cards.forEach((card, i) => {
    const label = `s${i}`;
    storyTl.addLabel(label);
    storyTl.fromTo(card, { opacity: 0, y: 80, scale: 0.96 }, {
      opacity: 1, y: 0, scale: 1, duration: 1, ease: "power3.out",
      onStart: () => setActiveDot(i),
      onReverseComplete: () => setActiveDot(Math.max(0, i - 1)),
    });
    storyTl.to({}, { duration: 0.6 }); // hold
    if (i < cards.length - 1) {
      storyTl.to(card, { opacity: 0, y: -80, scale: 0.96, duration: 1, ease: "power3.in" });
    }
  });

  /* ---- 3. PORTFOLIO: native horizontal swipe carousel ---- */
  setupPortfolioSwipe();
  setupFilters(null);

  /* Projects rise + fade in as the section enters view */
  gsap.fromTo(".port-track .proj",
    { opacity: 0, y: 40 },
    {
      opacity: 1, y: 0, duration: 0.9, ease: "power3.out", stagger: 0.08,
      scrollTrigger: { trigger: ".portfolio", start: "top 78%" },
    }
  );

  /* ---- 4. STATS count-up ---- */
  gsap.utils.toArray(".count").forEach((el) => {
    const target = +el.dataset.target;
    const suffix = el.dataset.suffix || "";
    const obj = { val: 0 };
    ScrollTrigger.create({
      trigger: el,
      start: "top 85%",
      once: true,
      onEnter: () => {
        gsap.to(obj, {
          val: target, duration: 2, ease: "power2.out",
          onUpdate: () => (el.textContent = Math.round(obj.val) + suffix),
        });
      },
    });
  });

  /* ---- Generic reveal-up: fade + rise + slight scale ---- */
  gsap.utils.toArray(".reveal-up").forEach((el) => {
    gsap.fromTo(el, { opacity: 0, y: 60, scale: 0.98 }, {
      opacity: 1, y: 0, scale: 1, duration: 1.1, ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 88%" },
    });
  });

  /* Refresh once everything (fonts/images) settles */
  window.addEventListener("load", () => ScrollTrigger.refresh());
}
