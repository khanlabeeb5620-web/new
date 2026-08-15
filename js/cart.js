// ==========================================================================
// ALFAREED TRADERS -- CART
// Stored in sessionStorage so it survives normal navigation between pages
// during a visit, but starts fresh on a manual refresh, a new tab, or once
// the browser is closed -- so the next person on a shared device never
// sees someone else's cart. Checkout hands the order off to WhatsApp as a
// pre-filled message.
// ==========================================================================

const Cart = (function () {
  const STORAGE_KEY = "alfareed_cart";

  // Clean up any cart saved by the old version of this site (which used
  // localStorage and never expired), so it can't leak into a new session.
  try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}

  // A manual page refresh starts with an empty cart -- carrying over items
  // from whoever used this browser/device before you is confusing. Normal
  // navigation between pages (add an item, then click through to another
  // product or to checkout) still keeps the cart intact, only an actual
  // reload clears it.
  try {
    const navEntries = performance.getEntriesByType("navigation");
    const isReload = navEntries.length
      ? navEntries[0].type === "reload"
      : performance.navigation && performance.navigation.type === 1;
    if (isReload) sessionStorage.removeItem(STORAGE_KEY);
  } catch (e) {}

  function load() {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function save(items) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    render();
  }

  function lineKey(slug, size, type) {
    return `${slug}__${size}${type ? "__" + type : ""}`;
  }

  function add(product, size, qty, type, image) {
    const items = load();
    const key = lineKey(product.slug, size, type);
    const existing = items.find((i) => i.key === key);
    if (existing) {
      existing.qty += qty;
    } else {
      items.push({
        key,
        slug: product.slug,
        name: product.name,
        image: image || (product.images && product.images[0]) || PLACEHOLDER_IMAGE,
        size,
        type: type || "",
        unitPrice: priceForSize(product, size),
        qty,
      });
    }
    save(items);
  }

  function updateQty(key, delta) {
    const items = load();
    const item = items.find((i) => i.key === key);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) {
      return remove(key);
    }
    save(items);
  }

  function remove(key) {
    const items = load().filter((i) => i.key !== key);
    save(items);
  }

  function clear() {
    save([]);
  }

  function count() {
    return load().reduce((sum, i) => sum + i.qty, 0);
  }

  function subtotal() {
    return load().reduce((sum, i) => sum + i.qty * i.unitPrice, 0);
  }

  function whatsappCheckoutLink() {
    const items = load();
    if (!items.length) return whatsappGeneralLink();
    let msg = `Hi ${SITE.name}, I'd like to place an order:\n\n`;
    items.forEach((i) => {
      const variant = i.type ? `${i.size}, ${i.type}` : i.size;
      msg += `- ${i.name} (${variant}) x${i.qty} -- ${money(i.unitPrice * i.qty)}\n`;
    });
    msg += `\nTotal: ${money(subtotal())}\n\nPlease confirm availability and delivery details.`;
    return `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(msg)}`;
  }

  function render() {
    const items = load();

    // Count bubbles (navbar + mobile nav)
    document.querySelectorAll("[data-cart-count]").forEach((el) => {
      el.textContent = count();
      el.setAttribute("data-count", count());
    });

    const listEl = document.getElementById("cartItems");
    const footEl = document.getElementById("cartFoot");
    if (!listEl) return; // cart drawer not on this page render pass yet

    if (!items.length) {
      listEl.innerHTML = `
        <div class="cart-empty">
          ${icon("cart")}
          <p><strong>Your cart is empty.</strong><br>Browse the catalog and add a few essentials.</p>
        </div>`;
      if (footEl) footEl.style.display = "none";
      return;
    }

    if (footEl) footEl.style.display = "block";

    listEl.innerHTML = items
      .map(
        (i) => `
      <div class="cart-item">
        <img src="${i.image}" alt="${i.name}" onerror="this.onerror=null;this.src='${PLACEHOLDER_IMAGE}'">
        <div>
          <div class="ci-name">${i.name}</div>
          <div class="ci-meta">${i.type ? `${i.size} &middot; ${i.type}` : i.size}</div>
          <div class="ci-row">
            <div class="ci-qty">
              <button type="button" data-cart-dec="${i.key}" aria-label="Decrease quantity">${icon("minus")}</button>
              <span>${i.qty}</span>
              <button type="button" data-cart-inc="${i.key}" aria-label="Increase quantity">${icon("plus")}</button>
            </div>
            <button type="button" class="ci-remove" data-cart-remove="${i.key}">Remove</button>
          </div>
        </div>
        <div class="ci-price">${money(i.unitPrice * i.qty)}</div>
      </div>`
      )
      .join("");

    const subEl = document.getElementById("cartSubtotal");
    if (subEl) subEl.textContent = money(subtotal());

    const waBtn = document.getElementById("cartWhatsappBtn");
    if (waBtn) waBtn.href = whatsappCheckoutLink();
  }

  function open() {
    const overlay = document.getElementById("cartOverlay");
    if (overlay) {
      overlay.classList.add("is-open");
      document.body.style.overflow = "hidden";
    }
  }

  function close() {
    const overlay = document.getElementById("cartOverlay");
    if (overlay) {
      overlay.classList.remove("is-open");
      document.body.style.overflow = "";
    }
  }

  return { add, updateQty, remove, clear, count, subtotal, render, open, close, whatsappCheckoutLink };
})();

document.addEventListener("DOMContentLoaded", () => {
  Cart.render();

  document.addEventListener("click", (e) => {
    const inc = e.target.closest("[data-cart-inc]");
    const dec = e.target.closest("[data-cart-dec]");
    const rem = e.target.closest("[data-cart-remove]");
    if (inc) Cart.updateQty(inc.getAttribute("data-cart-inc"), 1);
    if (dec) Cart.updateQty(dec.getAttribute("data-cart-dec"), -1);
    if (rem) Cart.remove(rem.getAttribute("data-cart-remove"));

    if (e.target.closest("[data-open-cart]")) {
      Cart.open();
    }
    if (e.target.closest("[data-close-cart]") || e.target.id === "cartOverlay") {
      Cart.close();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") Cart.close();
  });
});
