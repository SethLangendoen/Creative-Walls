// Creative Walls 2.0 — shared site behavior

document.addEventListener("DOMContentLoaded", () => {
  /* Sticky header shadow on scroll */
  const header = document.querySelector(".site-header");
  if (header) {
    const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* Mobile nav toggle */
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector(".nav-links");
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => navLinks.classList.remove("is-open"));
    });
  }

  /* Highlight current page in nav */
  const current = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a").forEach((link) => {
    const href = link.getAttribute("href");
    if (href === current) link.classList.add("active");
  });

  /* Theme toggle */
  const themeToggle = document.querySelector(".theme-toggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const isDark = document.documentElement.getAttribute("data-theme") === "dark";
      const next = isDark ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      try { localStorage.setItem("cw2-theme", next); } catch (e) {}
    });
  }

  /* Footer year */
  const yearEl = document.querySelector("[data-year]");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* Scroll-reveal */
  const revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealEls.forEach((el) => io.observe(el));
  }

  /* Reviews carousel */
  document.querySelectorAll("[data-carousel]").forEach((root) => {
    const track = root.querySelector(".carousel-track");
    const slides = Array.from(root.querySelectorAll(".review-card"));
    const dotsWrap = root.querySelector(".carousel-dots");
    const prevBtn = root.querySelector(".carousel-prev");
    const nextBtn = root.querySelector(".carousel-next");
    const INTERVAL = 6000;
    let index = 0;
    let timer = null;
    let hovering = false;
    let keyboardFocus = false;

    const dots = slides.map((_, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "carousel-dot";
      b.setAttribute("aria-label", `Show review ${i + 1} of ${slides.length}`);
      b.addEventListener("click", () => { go(i); start(); });
      dotsWrap.appendChild(b);
      return b;
    });

    function go(i) {
      index = (i + slides.length) % slides.length;
      track.style.transform = `translateX(-${index * 100}%)`;
      slides.forEach((s, n) => {
        s.classList.toggle("is-active", n === index);
        s.setAttribute("aria-hidden", n === index ? "false" : "true");
      });
      dots.forEach((d, n) => {
        d.classList.toggle("is-active", n === index);
        d.setAttribute("aria-current", n === index ? "true" : "false");
      });
    }

    function stop() { clearInterval(timer); timer = null; }
    function start() {
      stop();
      timer = setInterval(() => {
        if (!hovering && !keyboardFocus && !document.hidden) go(index + 1);
      }, INTERVAL);
    }

    prevBtn.addEventListener("click", () => { go(index - 1); start(); });
    nextBtn.addEventListener("click", () => { go(index + 1); start(); });

    root.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") hovering = true; });
    root.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse") hovering = false; });
    root.addEventListener("focusin", (e) => { keyboardFocus = e.target.matches(":focus-visible"); });
    root.addEventListener("focusout", () => { keyboardFocus = false; });

    let startX = null;
    root.addEventListener("pointerdown", (e) => { startX = e.clientX; });
    root.addEventListener("pointerup", (e) => {
      if (startX === null) return;
      const dx = e.clientX - startX;
      startX = null;
      if (Math.abs(dx) > 50) { go(index + (dx < 0 ? 1 : -1)); start(); }
    });
    root.addEventListener("pointercancel", () => { startX = null; });

    go(0);
    start();
  });

  /* Gallery filtering */
  const filterBtns = document.querySelectorAll(".filter-btn");
  const galleryItems = document.querySelectorAll(".gallery-item");
  if (filterBtns.length && galleryItems.length) {
    filterBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        filterBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        const filter = btn.dataset.filter;
        galleryItems.forEach((item) => {
          const match = filter === "all" || item.dataset.category === filter;
          item.classList.toggle("is-hidden", !match);
        });
      });
    });
  }

  /* Lightbox */
  const lightbox = document.querySelector(".lightbox");
  if (lightbox) {
    const lightboxImg = lightbox.querySelector(".photo img");
    const lightboxCaption = lightbox.querySelector(".lightbox-caption");
    const closeBtn = lightbox.querySelector(".lightbox-close");

    galleryItems.forEach((item) => {
      item.addEventListener("click", () => {
        const sourceImg = item.querySelector(".photo img");
        const label = item.querySelector("figcaption")?.textContent || "";
        if (sourceImg && lightboxImg) {
          lightboxImg.src = sourceImg.src;
          lightboxImg.alt = sourceImg.alt;
        }
        lightboxCaption.textContent = label;
        lightbox.classList.add("is-open");
        document.body.style.overflow = "hidden";
      });
    });

    const closeLightbox = () => {
      lightbox.classList.remove("is-open");
      document.body.style.overflow = "";
    };
    closeBtn?.addEventListener("click", closeLightbox);
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeLightbox();
    });
  }
});
