// ==========================================================================
// ALFAREED TRADERS -- SHARED RENDER HELPERS
// Product card markup, category icons, price/size helpers.
// Loaded on every page, after products-data.js and config.js.
// ==========================================================================

/** Format a number as PKR currency, e.g. money(420) -> "Rs. 420" */
function money(amount) {
  return SITE.currencySymbol + Number(amount).toLocaleString("en-PK");
}

/** Look up a category object by slug. */
function getCategory(slug) {
  return CATEGORIES.find((c) => c.slug === slug);
}

/** Look up a product by slug. */
function getProductBySlug(slug) {
  return PRODUCTS.find((p) => p.slug === slug);
}

/**
 * Reads the weight out of a pack-size label like "1kg", "500g" or "2.5 kg"
 * and returns it in kilograms. Returns null if the label has no number.
 */
function sizeToKg(size) {
  const match = String(size).trim().match(/^([\d.]+)\s*(kg|g)?$/i);
  if (!match) return null;
  const amount = parseFloat(match[1]);
  if (!isFinite(amount) || amount <= 0) return null;
  const unit = (match[2] || "kg").toLowerCase();
  return unit === "g" ? amount / 1000 : amount;
}

/**
 * Price for a given pack size.
 *
 * 1. If the admin typed an exact manual price for this size
 *    (product.sizePrices[size]), that number always wins.
 * 2. Otherwise the price is calculated *exactly* from the price the admin
 *    entered for the product's base `unit` (e.g. Rs.420 for 5kg): it scales
 *    it by the real weight ratio between the two sizes, so 1kg of a 5kg/420
 *    product is exactly 420 / 5 * 1 = Rs.84, not an approximated figure.
 */
function priceForSize(product, size) {
  const manual = product.sizePrices && product.sizePrices[size];
  if (manual !== undefined && manual !== null && manual !== "" && !isNaN(manual)) {
    return Math.round(Number(manual));
  }

  const base = Number(product.price) || 0;
  const baseKg = sizeToKg(product.unit);
  const targetKg = sizeToKg(size);

  // If either size label isn't a plain weight (e.g. "1 packet"), fall back
  // to the base price rather than guessing.
  if (!baseKg || !targetKg) return Math.round(base);

  return Math.round((base / baseKg) * targetKg);
}

/** Small inline SVG icons, keyed by name. Kept as strings so both
 *  index.html and product.html can reuse the exact same icon set. */
const ICONS = {
  wheat: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 3v14"/><path d="M12 6l-3-2M12 6l3-2M12 9l-3-2M12 9l3-2M12 12l-3-2M12 12l3-2M12 15l-3-2M12 15l3-2"/><path d="M12 17c0 2.2-1.8 4-4 4M12 17c0 2.2 1.8 4 4 4"/></svg>`,
  grains: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="7" cy="8" r="2.4"/><circle cx="17" cy="8" r="2.4"/><circle cx="12" cy="15" r="2.4"/><path d="M7 10.4V14M17 10.4V14"/></svg>`,
  barley: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 2v18"/><path d="M12 5l-4-2M12 5l4-2M12 8l-4-2M12 8l4-2M12 11l-4-2M12 11l4-2M12 14l-4-2M12 14l4-2"/></svg>`,
  cracked: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 3l2 5-3 2 2 4-2 7"/><circle cx="7" cy="14" r="1.3" fill="currentColor" stroke="none"/><circle cx="17" cy="10" r="1.3" fill="currentColor" stroke="none"/><circle cx="16" cy="17" r="1.3" fill="currentColor" stroke="none"/></svg>`,
  grain: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><ellipse cx="12" cy="12" rx="5" ry="8"/><path d="M12 4v16"/></svg>`,
  search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>`,
  cart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1.4"/><circle cx="18" cy="21" r="1.4"/><path d="M2.5 3h2.4l2.6 12.4a2 2 0 0 0 2 1.6h8.2a2 2 0 0 0 2-1.6L21.5 7H6"/></svg>`,
  menu: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>`,
  close: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>`,
  chevronRight: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>`,
  leaf: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20c8 0 16-6 16-16-10 0-16 8-16 16z"/><path d="M4 20c2-6 6-10 12-12"/></svg>`,
  shield: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 3v6c0 5-3.4 8.4-7 9-3.6-.6-7-4-7-9V6l7-3z"/><path d="M9 12l2 2 4-4"/></svg>`,
  millstone: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2.6"/><path d="M12 4v2.4M12 17.6V20M4 12h2.4M17.6 12H20"/></svg>`,
  truck: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="1.5" y="7" width="13" height="10"/><path d="M14.5 10h4l3 3v4h-7z"/><circle cx="6" cy="19" r="1.6"/><circle cx="17.5" cy="19" r="1.6"/></svg>`,
  whatsapp: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.1-1.7-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.1.2-.3.3-.4.1-.2 0-.4 0-.5 0-.1-.7-1.7-1-2.3-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4s1.1 2.8 1.2 3c.1.2 2.1 3.3 5.2 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.7-.7 2-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3z"/><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 20.2 12 8.2 8.2 0 0 1 12 20.2z"/></svg>`,
  facebook: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 9V6.5c0-.8.5-1 .9-1H17V2h-2.7C11.9 2 11 3.7 11 5.7V9H8.5v3.5H11V22h3v-9.5h2.4l.4-3.5H14z"/></svg>`,
  instagram: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.4" cy="6.6" r="1" fill="currentColor" stroke="none"/></svg>`,
  pin: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-6.3-7-11.5A7 7 0 0 1 19 9.5C19 14.7 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.3"/></svg>`,
  mail: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="4.5" width="19" height="15" rx="2"/><path d="M3 6l9 7 9-7"/></svg>`,
  phone: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 3h3.4l1.4 4.5-2 1.5a12 12 0 0 0 6.7 6.7l1.5-2 4.5 1.4v3.4c0 1-.9 1.8-1.9 1.7-8-.6-14.4-7-15-15C2.7 3.9 3.5 3 4.5 3z"/></svg>`,
  plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>`,
  minus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M5 12h14"/></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12l6 6L20 6"/></svg>`,
  box: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7l9-4 9 4-9 4-9-4z"/><path d="M3 7v10l9 4 9-4V7"/><path d="M12 11v10"/></svg>`,
};

/** Shown whenever a product has no photo yet, or an image file goes missing. */
const PLACEHOLDER_IMAGE = "images/placeholder.svg";

function icon(name) {
  return ICONS[name] || "";
}

/** Build the HTML for one product card. Used on the homepage grid,
 *  the "related products" strip, and search results. */
function productCardHTML(product) {
  const cat = getCategory(product.category);
  const badge = product.badge
    ? `<span class="pc-badge">${product.badge}</span>`
    : "";
  const img1 = (product.images && product.images[0]) || PLACEHOLDER_IMAGE;
  const img2 = (product.images && product.images[1]) || img1;
  return `
  <article class="product-card" data-slug="${product.slug}" data-category="${product.category}"
           data-name="${product.name.toLowerCase()}" data-tags="${product.tags.join(" ").toLowerCase()}">
    <a class="pc-media" href="product.html?slug=${product.slug}" aria-label="View ${product.name}">
      ${badge}
      <img class="img-1" src="${img1}" alt="${product.name} - packaging" loading="lazy" width="400" height="400" onerror="this.onerror=null;this.src='${PLACEHOLDER_IMAGE}'">
      <img class="img-2" src="${img2}" alt="${product.name} - close up" loading="lazy" width="400" height="400" onerror="this.onerror=null;this.src='${PLACEHOLDER_IMAGE}'">
    </a>
    <div class="pc-body">
      <span class="pc-cat">${cat ? cat.name : ""}</span>
      <h3 class="pc-name"><a href="product.html?slug=${product.slug}">${product.name}</a></h3>
      <p class="pc-short">${product.short}</p>
      <div class="pc-footer">
        <div class="pc-price">${money(product.price)} <span>/ ${product.unit}</span></div>
        <a class="pc-view" href="product.html?slug=${product.slug}">View ${icon("chevronRight")}</a>
      </div>
      <button type="button" class="pc-add-to-cart quick-add-btn" data-slug="${product.slug}">
        ${icon("cart")} Add to Cart
      </button>
    </div>
  </article>`;
}

function productGridHTML(products) {
  if (!products.length) {
    return `<div class="empty-state">${icon("search")}<p><strong>No products found.</strong><br>Try a different search term or category.</p></div>`;
  }
  return products.map(productCardHTML).join("");
}

/** Related products: same category, excluding the current product. */
function getRelatedProducts(product, count = 4) {
  const sameCategory = PRODUCTS.filter(
    (p) => p.category === product.category && p.slug !== product.slug
  );
  const rest = PRODUCTS.filter(
    (p) => p.category !== product.category && p.slug !== product.slug
  );
  return sameCategory.concat(rest).slice(0, count);
}
