(() => {
  "use strict";

  const doc = document;
  const html = doc.documentElement;
  const prefersReducedMotion =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Header / mobile navigation ---------- */

  const header = doc.querySelector(".site-header");
  const nav = doc.querySelector("#site-nav");
  const navToggle = doc.querySelector(".nav-toggle");
  const navLinks = nav ? [...nav.querySelectorAll("a[href^='#']")] : [];

  const setHeaderState = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  };

  const setNavOpen = (open, returnFocus = false) => {
    if (!nav || !navToggle) return;
    nav.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "メニューを閉じる" : "メニューを開く");
    doc.body.classList.toggle("nav-open", open);

    if (open) {
      const firstLink = nav.querySelector("a");
      if (firstLink) {
        window.setTimeout(() => firstLink.focus({ preventScroll: true }), 20);
      }
    } else if (returnFocus) {
      navToggle.focus();
    }
  };

  if (nav && navToggle) {
    navToggle.addEventListener("click", () => {
      setNavOpen(navToggle.getAttribute("aria-expanded") !== "true");
    });

    navLinks.forEach((link) => {
      link.addEventListener("click", () => setNavOpen(false));
    });

    doc.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && navToggle.getAttribute("aria-expanded") === "true") {
        setNavOpen(false, true);
        return;
      }

      if (event.key !== "Tab" || navToggle.getAttribute("aria-expanded") !== "true") {
        return;
      }

      const focusable = [
        navToggle,
        ...nav.querySelectorAll("a[href], button:not([disabled])")
      ];
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && doc.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && doc.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    doc.addEventListener("click", (event) => {
      if (
        navToggle.getAttribute("aria-expanded") === "true" &&
        header &&
        !header.contains(event.target)
      ) {
        setNavOpen(false);
      }
    });

    window.addEventListener(
      "resize",
      () => {
        if (window.innerWidth > 860) setNavOpen(false);
      },
      { passive: true }
    );

    // Enable the enhanced mobile navigation only after listeners are bound.
    // Without this class the navigation remains a visible inline fallback.
    html.classList.add("nav-ready");
  }

  setHeaderState();
  window.addEventListener("scroll", setHeaderState, { passive: true });

  /* ---------- Menu category filters ---------- */

  const filterButtons = [...doc.querySelectorAll(".filter-chip")];
  const menuCards = [...doc.querySelectorAll(".menu-card")];
  const filterStatus = doc.querySelector("#menu-filter-status");

  if (filterButtons.length > 0 && menuCards.length > 0) {
    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const filter = button.dataset.filter || "all";

        filterButtons.forEach((candidate) => {
          const active = candidate === button;
          candidate.classList.toggle("is-active", active);
          candidate.setAttribute("aria-pressed", String(active));
        });

        menuCards.forEach((card) => {
          card.hidden = filter !== "all" && card.dataset.category !== filter;
        });

        if (filterStatus) {
          const label = button.textContent ? button.textContent.trim() : "すべて";
          filterStatus.textContent =
            filter === "all"
              ? "すべてのメニューを表示しています。"
              : `「${label}」のメニューを表示しています。`;
        }
      });
    });

    // Show the filter UI only after it is functional.
    html.classList.add("js-ready");
  }

  /* ---------- Demo reservation form ---------- */

  const form = doc.querySelector("#reserve-form");

  if (form) {
    const dateInput = form.querySelector("#reserve-date");
    const successPanel = form.querySelector("#reserve-success");
    const resetButton = form.querySelector(".js-reset-form");
    const firstField = form.querySelector("input, select, textarea");

    if (dateInput) {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");
      dateInput.min = `${year}-${month}-${day}`;
    }

    const demoSubmitButton = form.querySelector("[data-demo-submit]");

    const showDemoResult = (event) => {
      if (form.dataset.demo !== "true") return;

      // This is an intentional demo: nothing is sent or stored.
      event.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      form.classList.add("is-submitted");
      if (successPanel) {
        successPanel.hidden = false;
        successPanel.focus();
      }
    };

    form.addEventListener("submit", showDemoResult);

    if (demoSubmitButton) {
      demoSubmitButton.addEventListener("click", showDemoResult);
    }

    if (resetButton && successPanel) {
      resetButton.addEventListener("click", () => {
        form.reset();
        form.classList.remove("is-submitted");
        successPanel.hidden = true;
        if (firstField) firstField.focus();
      });
    }
  }

  /* ---------- Sticky mobile CTA near the reservation section ---------- */

  const mobileCta = doc.querySelector("#mobile-cta");
  const reserveSection = doc.querySelector("#reserve");

  if (mobileCta && reserveSection && "IntersectionObserver" in window) {
    const ctaObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          mobileCta.classList.toggle("is-hidden", entry.isIntersecting);
        });
      },
      { threshold: 0.08 }
    );
    ctaObserver.observe(reserveSection);
  }

  /* ---------- Current section in navigation ---------- */

  if (nav && "IntersectionObserver" in window) {
    const sectionMap = new Map();
    navLinks.forEach((link) => {
      const href = link.getAttribute("href");
      if (href && href.startsWith("#")) {
        const section = doc.querySelector(href);
        if (section) sectionMap.set(section, link);
      }
    });

    if (sectionMap.size > 0) {
      const sectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            navLinks.forEach((link) => link.removeAttribute("aria-current"));
            const link = sectionMap.get(entry.target);
            if (link) link.setAttribute("aria-current", "location");
          });
        },
        { rootMargin: "-35% 0px -55% 0px", threshold: 0 }
      );
      sectionMap.forEach((_, section) => sectionObserver.observe(section));
    }
  }

  /* ---------- Subtle scroll reveal ---------- */

  if (!prefersReducedMotion && "IntersectionObserver" in window) {
    const revealTargets = [
      ".hero-copy",
      ".hero-visual",
      ".section-head",
      ".info-card",
      ".reason-card",
      ".menu-card",
      ".flow-step",
      ".anxiety-card",
      ".faq-item",
      ".gallery-item",
      ".social-card",
      ".reserve-option",
      ".form-card",
      ".access-info",
      ".access-map"
    ]
      .flatMap((selector) => [...doc.querySelectorAll(selector)])
      .filter((element) => !element.classList.contains("is-reveal"));

    html.classList.add("reveal-enabled");

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );

    revealTargets.forEach((element, index) => {
      element.classList.add("is-reveal");
      element.style.setProperty("--reveal-delay", `${(index % 4) * 55}ms`);
      revealObserver.observe(element);
    });
  }
})();
