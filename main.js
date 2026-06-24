// Current year in the footer.
document.getElementById("year").textContent = new Date().getFullYear();

// Scroll-reveal: fade elements in as they enter the viewport.
const revealEls = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // Slight stagger for groups of items.
          entry.target.style.transitionDelay = `${(i % 4) * 80}ms`;
          entry.target.classList.add("in");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  revealEls.forEach((el) => io.observe(el));
} else {
  // Fallback: just show everything.
  revealEls.forEach((el) => el.classList.add("in"));
}
