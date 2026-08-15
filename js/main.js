// ==========================================================================
// ALFAREED TRADERS -- MAIN SCRIPT
// Runs on every page: navbar behavior + WhatsApp float link.
// Homepage-only blocks (category seals, product grid, filters) are guarded
// by checking the element exists first, so this file is safe to include
// everywhere without errors on pages that don't have that markup.
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
  /* ---------- Footer year ---------- */
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- WhatsApp floating button + generic WA links ---------- */
  document.querySelectorAll("[data-wa-general]").forEach((el) => {
    el.href = whatsappGeneralLink();
  });

  /* ---------- Social links (Facebook / Instagram) from site-config ---------- */
  document.querySelectorAll("[data-social]").forEach((el) => {
    const key = el.getAttribute("data-social");
    const url = SITE[key];
    if (url) {
      el.href = url;
    } else {
      el.style.display = "none"; // hide the icon if no link is set
    }
  });

  /* ---------- Contact info (address / phone / email) from site-config ---------- */
  document.querySelectorAll("[data-field]").forEach((el) => {
    const key = el.getAttribute("data-field");
    if (SITE[key]) el.textContent = SITE[key];
  });
  document.querySelectorAll("[data-mailto-link]").forEach((el) => {
    if (SITE.email) el.href = `mailto:${SITE.email}`;
  });

  /* ---------- Sticky navbar shadow on scroll ---------- */
  const navbar = document.getElementById("siteNavbar");
  if (navbar) {
    const onScroll = () => {
      navbar.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Mobile nav drawer ---------- */
  const mobileOverlay = document.getElementById("mobileNavOverlay");
  const hamburger = document.getElementById("hamburgerBtn");
  if (hamburger && mobileOverlay) {
    const openMobile = () => {
      mobileOverlay.classList.add("is-open");
      document.body.style.overflow = "hidden";
    };
    const closeMobile = () => {
      mobileOverlay.classList.remove("is-open");
      document.body.style.overflow = "";
    };
    hamburger.addEventListener("click", openMobile);
    mobileOverlay.addEventListener("click", (e) => {
      if (e.target === mobileOverlay || e.target.closest("[data-close-mobile]")) closeMobile();
    });
    document.querySelectorAll("#mobileNav a").forEach((a) => a.addEventListener("click", closeMobile));
  }

  /* ---------- Nav search toggle (desktop pill) ---------- */
  document.querySelectorAll("[data-search-toggle]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const form = document.querySelector(btn.getAttribute("data-search-toggle"));
      if (!form) return;
      form.classList.toggle("is-open");
      if (form.classList.contains("is-open")) {
        form.querySelector("input").focus();
      }
    });
  });

  /* ---------- Nav search submit: filter on this page, or jump to shop ---------- */
  document.querySelectorAll(".nav-search-form").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const term = form.querySelector("input").value.trim();
      const grid = document.getElementById("productGrid");
      if (grid) {
        const searchInput = document.getElementById("shopSearchInput");
        if (searchInput) {
          searchInput.value = term;
          document.getElementById("products").scrollIntoView({ behavior: "smooth" });
          applyFilters();
        }
      } else {
        window.location.href = `index.html?search=${encodeURIComponent(term)}#products`;
      }
    });
  });

  /* ================= Homepage-only: categories + product grid ================= */
  const catGrid = document.getElementById("categoryGrid");
  const productGrid = document.getElementById("productGrid");

  if (catGrid) {
    catGrid.innerHTML = CATEGORIES.map(
      (c) => `
      <a href="#products" class="cat-seal" data-filter-category="${c.slug}">
        <div class="ring">${icon(c.icon)}</div>
        <h3>${c.name}</h3>
        <p>${c.blurb}</p>
      </a>`
    ).join("");
  }

  // dropdown menu (navbar) + mobile category list, built from data so it
  // never falls out of sync when categories are added/removed
  document.querySelectorAll("[data-categories-dropdown]").forEach((el) => {
    el.innerHTML = CATEGORIES.map(
      (c) => `<a href="index.html?category=${c.slug}#products" data-filter-category="${c.slug}">
        <span class="dd-icon">${icon(c.icon)}</span> ${c.name}
      </a>`
    ).join("");
  });
  document.querySelectorAll("[data-categories-mobile]").forEach((el) => {
    el.innerHTML = CATEGORIES.map(
      (c) => `<a href="index.html?category=${c.slug}#products" data-filter-category="${c.slug}">${c.name}</a>`
    ).join("");
  });

  if (productGrid) {
    let activeCategory = "all";

    function applyFilters() {
      const term = (document.getElementById("shopSearchInput")?.value || "").toLowerCase().trim();
      let list = PRODUCTS.filter((p) => activeCategory === "all" || p.category === activeCategory);
      if (term) {
        list = list.filter(
          (p) =>
            p.name.toLowerCase().includes(term) ||
            p.tags.join(" ").toLowerCase().includes(term) ||
            getCategory(p.category).name.toLowerCase().includes(term)
        );
      }
      productGrid.innerHTML = productGridHTML(list);
      const countEl = document.getElementById("filterCount");
      if (countEl) countEl.textContent = `${list.length} product${list.length === 1 ? "" : "s"}`;

      document.querySelectorAll(".filter-pill").forEach((p) => {
        p.classList.toggle("active", p.getAttribute("data-pill") === activeCategory);
      });
      document.querySelectorAll(".cat-seal").forEach((c) => {
        c.classList.toggle("active", c.getAttribute("data-filter-category") === activeCategory);
      });
    }
    window.applyFilters = applyFilters; // exposed for the nav search form above

    // filter pills
    const pillsWrap = document.getElementById("filterPills");
    if (pillsWrap) {
      pillsWrap.innerHTML =
        `<button type="button" class="filter-pill active" data-pill="all">All Products</button>` +
        CATEGORIES.map((c) => `<button type="button" class="filter-pill" data-pill="${c.slug}">${c.name}</button>`).join("");
    }

    document.addEventListener("click", (e) => {
      const pill = e.target.closest("[data-pill]");
      const catLink = e.target.closest("[data-filter-category]");
      if (pill) {
        activeCategory = pill.getAttribute("data-pill");
        applyFilters();
      }
      if (catLink && document.getElementById("productGrid")) {
        e.preventDefault();
        activeCategory = catLink.getAttribute("data-filter-category");
        applyFilters();
        document.getElementById("products").scrollIntoView({ behavior: "smooth" });
      }
      const quickAdd = e.target.closest(".quick-add-btn");
      if (quickAdd) {
        e.preventDefault();
        e.stopPropagation();
        const product = getProductBySlug(quickAdd.getAttribute("data-slug"));
        if (product) {
          Cart.add(product, product.unit, 1);
          showToast(`${product.name} added to cart`);
        }
      }
    });

    const searchInput = document.getElementById("shopSearchInput");
    if (searchInput) searchInput.addEventListener("input", applyFilters);

    // Read ?search= and ?category= from the URL (e.g. arriving from another page)
    const params = new URLSearchParams(window.location.search);
    if (params.get("search") && searchInput) searchInput.value = params.get("search");
    if (params.get("category")) activeCategory = params.get("category");

    applyFilters();
  }
});

/* ---------- Toast ---------- */
let toastTimer;
function showToast(message) {
  let toast = document.getElementById("siteToast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "siteToast";
    toast.className = "toast";
    toast.innerHTML = `${icon("check")}<span id="toastMsg"></span>`;
    document.body.appendChild(toast);
  }
  document.getElementById("toastMsg").textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2600);
}
