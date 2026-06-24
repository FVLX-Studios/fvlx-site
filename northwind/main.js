/* Northwind — motion */
document.getElementById("year").textContent = new Date().getFullYear();
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const hasGSAP = typeof gsap !== "undefined";

const nav = document.getElementById("nav");
const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 20);
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

// One-open-at-a-time FAQ
document.querySelectorAll(".faq details").forEach((d) => {
  d.addEventListener("toggle", () => {
    if (d.open) document.querySelectorAll(".faq details").forEach((o) => { if (o !== d) o.open = false; });
  });
});

if (!hasGSAP || reduce) {
  document.querySelectorAll(".reveal, .reveal-pop").forEach((el) => (el.style.opacity = 1));
} else {
  gsap.registerPlugin(ScrollTrigger);
  if (typeof Lenis !== "undefined") {
    const lenis = new Lenis({ duration: 1.1, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    document.querySelectorAll('a[href^="#"]').forEach((a) => a.addEventListener("click", (e) => {
      const t = document.querySelector(a.getAttribute("href"));
      if (t) { e.preventDefault(); lenis.scrollTo(t, { offset: -70 }); }
    }));
  }
  // Hero
  gsap.timeline({ defaults: { ease: "power3.out" } })
    .fromTo(".hero-copy.reveal", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1 })
    .fromTo(".hero-visual.reveal-pop", { opacity: 0, y: 40, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 1.2 }, "-=0.7")
    .from(".float-card", { opacity: 0, y: 14, stagger: 0.15, duration: 0.6 }, "-=0.4");
  // Reveals
  gsap.utils.toArray(".reveal").forEach((el) => {
    if (el.classList.contains("hero-copy")) return;
    gsap.fromTo(el, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 88%" } });
  });
  // Chart bars grow
  gsap.from(".dash-chart span", { scaleY: 0, transformOrigin: "bottom", stagger: 0.06, duration: 0.8, ease: "power2.out", scrollTrigger: { trigger: ".dashboard", start: "top 80%" } });
  window.addEventListener("load", () => ScrollTrigger.refresh());
}
