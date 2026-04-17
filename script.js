const body = document.body;
const header = document.querySelector(".site-header");
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelectorAll(".site-nav a, .brand, .scroll-cue, .site-footer a");
const revealItems = document.querySelectorAll(".reveal, [data-reveal]");
const parallaxItems = document.querySelectorAll(".parallax");
const cursor = document.querySelector(".cursor");
const cursorDot = document.querySelector(".cursor-dot");
const magneticItems = document.querySelectorAll(".magnetic");
const transitionLayer = document.querySelector(".page-transition");
const form = document.querySelector(".contact-form");
const formNote = document.querySelector(".form-note");
const year = document.querySelector("#year");

year.textContent = new Date().getFullYear();

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

window.addEventListener("load", () => {
  revealItems.forEach((item, index) => {
    if (item.getBoundingClientRect().top < window.innerHeight) {
      setTimeout(() => item.classList.add("is-visible"), index * 75);
    }
  });
});

const revealObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.16,
    rootMargin: "0px 0px -8% 0px",
  }
);

revealItems.forEach(item => revealObserver.observe(item));

const countObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        countObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.55 }
);

document.querySelectorAll("[data-count]").forEach(item => countObserver.observe(item));

function animateCount(item) {
  const target = Number(item.dataset.count);
  const duration = prefersReducedMotion ? 1 : 1200;
  const startTime = performance.now();

  function tick(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    item.textContent = Math.round(target * eased);

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      item.textContent = `${target}+`;
    }
  }

  requestAnimationFrame(tick);
}

function updateScrollEffects() {
  const scrolled = window.scrollY > 18;
  header.classList.toggle("is-scrolled", scrolled);

  if (!prefersReducedMotion) {
    parallaxItems.forEach(item => {
      const rect = item.getBoundingClientRect();
      const speed = Number(item.dataset.speed || 0.1);
      const offset = (window.innerHeight / 2 - (rect.top + rect.height / 2)) * speed;
      item.style.setProperty("--parallax-y", `${offset}px`);
    });
  }
}

updateScrollEffects();
window.addEventListener("scroll", updateScrollEffects, { passive: true });
window.addEventListener("resize", updateScrollEffects);

navToggle.addEventListener("click", () => {
  const isOpen = body.classList.toggle("nav-open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

navLinks.forEach(link => {
  link.addEventListener("click", event => {
    const href = link.getAttribute("href");

    if (!href || !href.startsWith("#")) {
      return;
    }

    const target = document.querySelector(href);

    if (!target) {
      return;
    }

    event.preventDefault();
    body.classList.remove("nav-open");
    navToggle.setAttribute("aria-expanded", "false");

    if (!prefersReducedMotion) {
      transitionLayer.classList.remove("is-active");
      void transitionLayer.offsetWidth;
      transitionLayer.classList.add("is-active");
    }

    setTimeout(
      () => {
        target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
      },
      prefersReducedMotion ? 0 : 180
    );
  });
});

if (cursor && cursorDot && !window.matchMedia("(pointer: coarse)").matches) {
  let cursorX = window.innerWidth / 2;
  let cursorY = window.innerHeight / 2;
  let dotX = cursorX;
  let dotY = cursorY;

  window.addEventListener("mousemove", event => {
    cursorX = event.clientX;
    cursorY = event.clientY;
    cursorDot.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;
  });

  function renderCursor() {
    dotX += (cursorX - dotX) * 0.16;
    dotY += (cursorY - dotY) * 0.16;
    cursor.style.transform = `translate3d(${dotX}px, ${dotY}px, 0) translate(-50%, -50%)`;
    requestAnimationFrame(renderCursor);
  }

  renderCursor();

  document.querySelectorAll("a, button, input, select, textarea, .project-card, .service-card").forEach(item => {
    item.addEventListener("mouseenter", () => cursor.classList.add("is-hovering"));
    item.addEventListener("mouseleave", () => cursor.classList.remove("is-hovering"));
  });
}

if (!prefersReducedMotion) {
  magneticItems.forEach(item => {
    item.addEventListener("mousemove", event => {
      const rect = item.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      item.style.transform = `translate3d(${x * 0.12}px, ${y * 0.16}px, 0)`;
    });

    item.addEventListener("mouseleave", () => {
      item.style.transform = "";
    });
  });
}

form.addEventListener("submit", event => {
  event.preventDefault();
  const data = new FormData(form);
  const name = data.get("name")?.toString().trim() || "A client";
  const contact = data.get("contact")?.toString().trim() || "Not provided";
  const project = data.get("project")?.toString().trim() || "Architecture project";
  const details = data.get("details")?.toString().trim() || "No additional details provided.";
  const subject = encodeURIComponent(`Architecture consultation: ${project}`);
  const bodyText = encodeURIComponent(
    `Name: ${name}\nContact: ${contact}\nProject: ${project}\n\nDetails:\n${details}`
  );

  formNote.textContent = "Opening your email app with the project brief.";
  window.location.href = `mailto:?subject=${subject}&body=${bodyText}`;
});
