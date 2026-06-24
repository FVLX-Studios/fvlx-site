/* FORGE — motion */
document.getElementById("year").textContent = new Date().getFullYear();
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const hasGSAP = typeof gsap !== "undefined";

const nav = document.getElementById("nav");
const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 30);
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

if (!hasGSAP || reduce) {
  document.querySelectorAll(".reveal").forEach((el) => (el.style.opacity = 1));
  // still fill counters
  document.querySelectorAll("[data-count]").forEach((el) => (el.textContent = (+el.dataset.count).toLocaleString()));
} else {
  gsap.registerPlugin(ScrollTrigger);
  if (typeof Lenis !== "undefined") {
    const lenis = new Lenis({ duration: 1.1, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    document.querySelectorAll('a[href^="#"]').forEach((a) => a.addEventListener("click", (e) => {
      const t = document.querySelector(a.getAttribute("href")); if (t) { e.preventDefault(); lenis.scrollTo(t, { offset: -60 }); }
    }));
  }
  gsap.timeline({ defaults: { ease: "power4.out" } })
    .from(".hero-h .reveal-line > *, .hero-h .reveal-line", { yPercent: 115, duration: 1.1, stagger: 0.1 })
    .from(".kicker", { opacity: 0, x: -20, duration: 0.7 }, 0.1)
    .to(".hero-sub.reveal, .hero-cta.reveal", { opacity: 1, duration: 0.7, stagger: 0.1 }, "-=0.5")
    .to(".hero-stats.reveal", { opacity: 1, duration: 0.7 }, "-=0.3");

  gsap.utils.toArray(".reveal").forEach((el) => {
    if (el.closest(".hero")) return;
    gsap.fromTo(el, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 88%" } });
  });

  // Counters
  document.querySelectorAll("[data-count]").forEach((el) => {
    const target = +el.dataset.count; const obj = { v: 0 };
    ScrollTrigger.create({ trigger: el, start: "top 90%", once: true, onEnter: () =>
      gsap.to(obj, { v: target, duration: 2, ease: "power2.out", onUpdate: () => (el.textContent = Math.round(obj.v).toLocaleString()) })
    });
  });
  window.addEventListener("load", () => ScrollTrigger.refresh());
}
