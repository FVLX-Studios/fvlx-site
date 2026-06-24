/* ============================================================
   Maison Noir — motion & interaction
   GSAP + ScrollTrigger + Lenis
   ============================================================ */

document.getElementById("year").textContent = new Date().getFullYear();

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const hasGSAP = typeof gsap !== "undefined";

/* ---- Nav frosted background on scroll ---- */
const nav = document.getElementById("nav");
const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 40);
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

/* ---- Newsletter signup ---- */
const form = document.getElementById("newsForm");
if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    form.hidden = true;
    document.getElementById("newsThanks").hidden = false;
  });
}

/* ---- Add to bag (demo) ---- */
let bagCount = 0;
const bag = document.querySelector(".nav-bag");
document.querySelectorAll(".card-add").forEach((btn) => {
  btn.addEventListener("click", () => {
    if (btn.classList.contains("added")) return;
    btn.classList.add("added");
    btn.textContent = "Added ✓";
    bagCount += 1;
    if (bag) bag.textContent = `Bag (${bagCount})`;
    setTimeout(() => { btn.classList.remove("added"); btn.textContent = "Add to bag"; }, 1600);
  });
});

if (!hasGSAP || reduceMotion) {
  // Static fallback — reveal everything.
  document.querySelectorAll(".reveal, .reveal-pop").forEach((el) => (el.style.opacity = 1));
} else {
  gsap.registerPlugin(ScrollTrigger);

  /* ---- Lenis smooth scroll ---- */
  if (typeof Lenis !== "undefined") {
    const lenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener("click", (e) => {
        const t = document.querySelector(a.getAttribute("href"));
        if (t) { e.preventDefault(); lenis.scrollTo(t, { offset: t.id === "top" ? 0 : -20 }); }
      });
    });
  }

  /* ---- Hero load sequence ---- */
  const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });
  heroTl
    .from(".hero-title .reveal-line > *, .hero-title .reveal-line", { yPercent: 110, duration: 1.1, stagger: 0.12 })
    .from(".eyebrow", { opacity: 0, y: 16, duration: 0.8 }, 0.1)
    .to(".hero-text .reveal", { opacity: 1, duration: 0.8 }, "-=0.6")
    .from(".hero-text .reveal", { y: 20, duration: 0.8, stagger: 0.08 }, "<")
    .to(".hero-product.reveal-pop", { opacity: 1, duration: 1.2 }, 0.2)
    .from(".hero-product.reveal-pop", { scale: 0.85, y: 30, duration: 1.4, ease: "power2.out" }, "<");

  /* ---- Generic reveals: fade + rise ---- */
  gsap.utils.toArray(".reveal").forEach((el) => {
    if (el.closest(".hero-text")) return; // handled in hero timeline
    gsap.fromTo(el, { opacity: 0, y: 40 }, {
      opacity: 1, y: 0, duration: 1.1, ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 88%" },
    });
  });

  /* ---- Image clip-path wipe reveals ---- */
  gsap.utils.toArray(".reveal-img").forEach((el) => {
    const inner = el.querySelector(".story-img-inner, .product-visual") || el;
    gsap.fromTo(inner, { clipPath: "inset(100% 0 0 0)", scale: 1.1 }, {
      clipPath: "inset(0% 0 0 0)", scale: 1, duration: 1.4, ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 82%" },
    });
  });

  /* ---- Subtle parallax on product visuals ---- */
  gsap.utils.toArray(".showcase-visual .product-visual, .hero-product .product-visual").forEach((el) => {
    gsap.to(el, {
      yPercent: -12, ease: "none",
      scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
    });
  });

  /* ---- Card pointer tilt ---- */
  if (window.matchMedia("(hover: hover)").matches) {
    document.querySelectorAll("[data-tilt]").forEach((card) => {
      const vis = card.querySelector(".product-visual");
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        gsap.to(vis, { rotationY: px * 12, rotationX: -py * 12, transformPerspective: 600, duration: 0.5, ease: "power2.out" });
      });
      card.addEventListener("pointerleave", () => {
        gsap.to(vis, { rotationY: 0, rotationX: 0, duration: 0.7, ease: "elastic.out(1, 0.5)" });
      });
    });
  }

  window.addEventListener("load", () => ScrollTrigger.refresh());
}
