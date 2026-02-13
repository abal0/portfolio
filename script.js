// script.js
(() => {
  const toggle = document.querySelector(".nav__toggle");
  const links = document.querySelector(".nav__links");
  const dropdown = document.querySelector(".nav__dropdown");
  const dropBtn = document.querySelector(".nav__dropbtn");

  if (toggle && links) {
    toggle.addEventListener("click", () => {
      const open = links.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });

    // Close menu when clicking outside (mobile)
    document.addEventListener("click", (e) => {
      const isClickInside =
        e.target.closest(".nav__links") || e.target.closest(".nav__toggle");
      if (!isClickInside) {
        links.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  // Mobile dropdown toggle
  if (dropdown && dropBtn) {
    dropBtn.addEventListener("click", (e) => {
      // prevent closing mobile menu immediately
      e.preventDefault();
      dropdown.classList.toggle("is-open");
    });
  }
})();


// Animate skill bars on scroll
const skills = document.querySelectorAll(".progress span");

const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.width = entry.target.style.width;
      }
    });
  },
  { threshold: 0.5 }
);

skills.forEach(skill => {
  const width = skill.style.width;
  skill.style.width = "0";
  setTimeout(() => (skill.style.width = width), 200);
  observer.observe(skill);
});
/* ====== SERVICES: Autoplay + Modal (drop-in) ======
   ✅ Autoplay slider
   ✅ Pause on hover + when modal opens
   ✅ Click card arrow to open modal
   ✅ ESC + outside click to close
   Put this at the END of your script.js
==================================================== */
(() => {
  const track = document.getElementById("servicesTrack");
  const dotsWrap = document.getElementById("servicesDots");
  const dots = dotsWrap ? [...dotsWrap.querySelectorAll(".dot")] : [];
  const prevBtn = document.querySelector(".nav-btn.prev");
  const nextBtn = document.querySelector(".nav-btn.next");

  if (!track) return;

  // ---------- Slider helpers ----------
  function cardWidth() {
    const card = track.querySelector(".service-card");
    if (!card) return 0;
    const gap = parseFloat(getComputedStyle(track).gap || "0");
    return card.offsetWidth + gap;
  }

  let index = 0;

  function updateDots() {
    dots.forEach((d, i) => d.classList.toggle("is-active", i === index));
  }

  function goTo(i) {
    const max = dots.length ? dots.length - 1 : Math.max(0, track.children.length - 1);
    index = Math.max(0, Math.min(i, max));
    track.scrollTo({ left: index * cardWidth(), behavior: "smooth" });
    updateDots();
  }

  if (nextBtn) nextBtn.addEventListener("click", () => goTo(index + 1));
  if (prevBtn) prevBtn.addEventListener("click", () => goTo(index - 1));

  dots.forEach((dot, i) => dot.addEventListener("click", () => goTo(i)));

  track.addEventListener("scroll", () => {
    const w = cardWidth();
    if (!w) return;
    const i = Math.round(track.scrollLeft / w);
    if (i !== index) {
      index = i;
      updateDots();
    }
  });

  // ---------- Modal (created via JS) ----------
  const modal = document.createElement("div");
  modal.className = "service-modal";
  modal.innerHTML = `
    <div class="service-modal__backdrop" data-close="true"></div>
    <div class="service-modal__panel" role="dialog" aria-modal="true" aria-label="Service details">
      <button class="service-modal__close" type="button" aria-label="Close modal">✕</button>
      <div class="service-modal__media">
        <img class="service-modal__img" alt="" />
      </div>
      <div class="service-modal__body">
        <h3 class="service-modal__title"></h3>
        <p class="service-modal__text">
          Creative digital services delivering high-impact visuals, compelling storytelling, and consistent branding—helping businesses and creators stand out,
           connect with their audience, and grow across video, design, and social media platforms.
        </p>
        <div class="service-modal__actions">
          <a class="service-modal__btn service-modal__btn--primary" href="#contact">Contact Me</a>
          <button class="service-modal__btn service-modal__btn--ghost" type="button" data-close="true">Close</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const modalImg = modal.querySelector(".service-modal__img");
  const modalTitle = modal.querySelector(".service-modal__title");
  const closeBtn = modal.querySelector(".service-modal__close");

  function openModal({ title, imgSrc }) {
    modal.classList.add("is-open");
    document.body.classList.add("modal-open");

    modalTitle.textContent = title || "Service";
    modalImg.src = imgSrc || "";
    modalImg.alt = title || "Service image";

    stopAutoplay();
  }

  function closeModal() {
    modal.classList.remove("is-open");
    document.body.classList.remove("modal-open");
    startAutoplay();
  }

  closeBtn.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target && e.target.dataset && e.target.dataset.close === "true") closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("is-open")) closeModal();
  });

  // Open modal on arrow click (and allow card click too if you want)
  track.querySelectorAll(".service-card").forEach((card) => {
    const title = card.querySelector("h3")?.textContent?.trim() || "Service";
    const imgSrc = card.querySelector("img")?.getAttribute("src") || "";

    const arrow = card.querySelector(".service-arrow");
    if (arrow) {
      arrow.addEventListener("click", (e) => {
        e.preventDefault();
        openModal({ title, imgSrc });
      });
    }

    // OPTIONAL: click anywhere on card to open modal
    card.addEventListener("click", (e) => {
      // ignore clicks on buttons/links already handled
      if (e.target.closest("a,button")) return;
      openModal({ title, imgSrc });
    });
  });

  // ---------- Autoplay ----------
  let autoplayTimer = null;
  const AUTOPLAY_MS = 3200;

  function startAutoplay() {
    // don't autoplay if modal is open
    if (modal.classList.contains("is-open")) return;

    stopAutoplay();
    autoplayTimer = setInterval(() => {
      const max = dots.length ? dots.length - 1 : Math.max(0, track.children.length - 1);
      if (index >= max) {
        goTo(0);
      } else {
        goTo(index + 1);
      }
    }, AUTOPLAY_MS);
  }

  function stopAutoplay() {
    if (autoplayTimer) clearInterval(autoplayTimer);
    autoplayTimer = null;
  }

  // Pause on hover
  track.addEventListener("mouseenter", stopAutoplay);
  track.addEventListener("mouseleave", startAutoplay);

  // Start
  startAutoplay();

  // Recalculate on resize so slide positions stay correct
  window.addEventListener("resize", () => goTo(index));
})();
// Projects filter (All / Video Editing / Graphics Design)
(() => {
  const buttons = document.querySelectorAll(".filter-btn");
  const cards = document.querySelectorAll(".project-card");

  if (!buttons.length || !cards.length) return;

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      // active button
      buttons.forEach(b => b.classList.remove("is-active"));
      btn.classList.add("is-active");

      const filter = btn.dataset.filter;

      cards.forEach(card => {
        const cat = card.dataset.cat;
        const show = filter === "all" || cat === filter;
        card.classList.toggle("is-hidden", !show);
      });
    });
  });
})();
