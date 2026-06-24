/* Solène — motion */
document.getElementById("year").textContent = new Date().getFullYear();
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const hasGSAP = typeof gsap !== "undefined";

const nav = document.getElementById("nav");
const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 30);
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

const form = document.getElementById("newsForm");
if (form) form.addEventListener("submit", (e) => { e.preventDefault(); form.hidden = true; document.getElementById("newsThanks").hidden = false; });

let bag = 0; const bagEl = document.querySelector(".nav-bag");
document.querySelectorAll(".card-add").forEach((b) => b.addEventListener("click", () => {
  if (b.classList.contains("added")) return;
  b.classList.add("added"); b.textContent = "Added ✓"; bag++; if (bagEl) bagEl.textContent = `Bag (${bag})`;
  setTimeout(() => { b.classList.remove("added"); b.textContent = "Add to bag"; }, 1500);
}));

if (!hasGSAP || reduce) {
  document.querySelectorAll(".reveal, .reveal-pop").forEach((el) => (el.style.opacity = 1));
} else {
  gsap.registerPlugin(ScrollTrigger);
  if (typeof Lenis !== "undefined") {
    const lenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    document.querySelectorAll('a[href^="#"]').forEach((a) => a.addEventListener("click", (e) => {
      const t = document.querySelector(a.getAttribute("href")); if (t) { e.preventDefault(); lenis.scrollTo(t, { offset: -60 }); }
    }));
  }
  gsap.timeline({ defaults: { ease: "power3.out" } })
    .from(".hero-title .reveal-line > *, .hero-title .reveal-line", { yPercent: 110, duration: 1.1, stagger: 0.12 })
    .from(".eyebrow", { opacity: 0, y: 14, duration: 0.7 }, 0.1)
    .to(".hero-text .reveal", { opacity: 1, duration: 0.8 }, "-=0.5")
    .to(".hero-product.reveal-pop", { opacity: 1, duration: 1.2 }, 0.2)
    .from(".hero-product.reveal-pop", { scale: 0.88, duration: 1.4, ease: "power2.out" }, "<");
  gsap.utils.toArray(".reveal").forEach((el) => {
    if (el.closest(".hero-text")) return;
    gsap.fromTo(el, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1.1, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 88%" } });
  });
  gsap.utils.toArray(".reveal-img").forEach((el) => {
    const inner = el.querySelector(".story-img-inner") || el;
    gsap.fromTo(inner, { clipPath: "inset(100% 0 0 0)", scale: 1.1 }, { clipPath: "inset(0% 0 0 0)", scale: 1, duration: 1.4, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 82%" } });
  });
  window.addEventListener("load", () => ScrollTrigger.refresh());
}
