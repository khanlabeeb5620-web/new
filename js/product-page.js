// ==========================================================================
// ALFAREED TRADERS -- PRODUCT DETAIL PAGE
// Reads ?slug=... from the URL and renders the product from PRODUCTS.
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("productDetail");
  if (!root) return;

  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");
  const product = slug ? getProductBySlug(slug) : null;

  if (!product) {
    root.innerHTML = `
      <div class="container">
        <div class="empty-state" style="padding:100px 20px;">
          ${icon("search")}
          <h1 style="font-size:26px;margin-bottom:10px;">Product not found</h1>
          <p style="margin-bottom:24px;">The item you're looking for may have been removed or renamed.</p>
          <a href="index.html#products" class="btn btn-primary">Browse All Products</a>
        </div>
      </div>`;
    document.title = "Product not found - Alfareed Traders";
    return;
  }

  const cat = getCategory(product.category);
  let selectedSize = product.unit;
  let qty = 1;

  /* ---------- SEO: title + meta description + JSON-LD ---------- */
  document.title = `${product.name} | Alfareed Traders`;
  let metaDesc = document.querySelector('meta[name="description"]');
  if (!metaDesc) {
    metaDesc = document.createElement("meta");
    metaDesc.name = "description";
    document.head.appendChild(metaDesc);
  }
  metaDesc.content = product.short;

  const ld = document.createElement("script");
  ld.type = "application/ld+json";
  ld.textContent = JSON.stringify({
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.name,
    description: product.desc,
    category: cat ? cat.name : "",
    brand: { "@type": "Brand", name: "Alfareed Traders" },
    image: (product.images && product.images.length ? product.images : [PLACEHOLDER_IMAGE]).map((i) => new URL(i, window.location.href).href),
    offers: {
      "@type": "Offer",
      priceCurrency: "PKR",
      price: product.price,
      availability: "https://schema.org/InStock",
    },
  });
  document.head.appendChild(ld);

  /* ---------- Breadcrumb ---------- */
  document.getElementById("breadcrumb").innerHTML = `
    <a href="index.html">Home</a> <span class="sep">/</span>
    <a href="index.html?category=${product.category}#products">${cat ? cat.name : ""}</a> <span class="sep">/</span>
    <span class="current">${product.name}</span>`;

  /* ---------- Gallery ---------- */
  const galleryImages = (product.images && product.images.length) ? product.images : [PLACEHOLDER_IMAGE];
  function renderGallery() {
    document.getElementById("pdMainImg").src = galleryImages[0];
    document.getElementById("pdMainImg").alt = `${product.name} - main photo`;
    document.getElementById("pdMainImg").onerror = function () { this.onerror = null; this.src = PLACEHOLDER_IMAGE; };
    document.getElementById("pdThumbs").innerHTML = galleryImages
      .map(
        (img, i) => `
      <button type="button" class="pd-thumb ${i === 0 ? "active" : ""}" data-img="${img}">
        <img src="${img}" alt="${product.name} view ${i + 1}" onerror="this.onerror=null;this.src='${PLACEHOLDER_IMAGE}'">
      </button>`
      )
      .join("");
  }
  renderGallery();

  document.getElementById("pdThumbs").addEventListener("click", (e) => {
    const btn = e.target.closest(".pd-thumb");
    if (!btn) return;
    document.getElementById("pdMainImg").src = btn.getAttribute("data-img");
    document.querySelectorAll(".pd-thumb").forEach((t) => t.classList.remove("active"));
    btn.classList.add("active");
  });

  /* ---------- Info panel ---------- */
  document.getElementById("pdCategory").textContent = cat ? cat.name : "";
  document.getElementById("pdCategory").href = `index.html?category=${product.category}#products`;
  document.getElementById("pdTitle").textContent = product.name;
  document.getElementById("pdShort").textContent = product.short;
  document.getElementById("pdDescText").textContent = product.desc;
  document.getElementById("pdTags").innerHTML = product.tags.map((t) => `<span>${t}</span>`).join("");

  function updatePrice() {
    document.getElementById("pdPrice").textContent = money(priceForSize(product, selectedSize));
    document.getElementById("pdPriceUnit").textContent = `per ${selectedSize} bag`;
  }

  document.getElementById("pdSizes").innerHTML = product.sizes
    .map((s) => `<button type="button" class="size-pill ${s === selectedSize ? "active" : ""}" data-size="${s}">${s}</button>`)
    .join("");
  updatePrice();

  document.getElementById("pdSizes").addEventListener("click", (e) => {
    const btn = e.target.closest(".size-pill");
    if (!btn) return;
    selectedSize = btn.getAttribute("data-size");
    document.querySelectorAll(".size-pill").forEach((s) => s.classList.remove("active"));
    btn.classList.add("active");
    updatePrice();
  });

  /* ---------- Quantity stepper ---------- */
  const qtyInput = document.getElementById("pdQtyInput");
  function setQty(n) {
    qty = Math.max(1, Math.min(99, n));
    qtyInput.value = qty;
  }
  document.getElementById("pdQtyMinus").addEventListener("click", () => setQty(qty - 1));
  document.getElementById("pdQtyPlus").addEventListener("click", () => setQty(qty + 1));
  qtyInput.addEventListener("change", () => setQty(parseInt(qtyInput.value, 10) || 1));

  /* ---------- Add to cart + WhatsApp order ---------- */
  document.getElementById("pdAddToCart").addEventListener("click", () => {
    Cart.add(product, selectedSize, qty);
    showToast(`${product.name} (${selectedSize}) added to cart`);
  });

  const waBtn = document.getElementById("pdWhatsapp");
  function updateWaLink() {
    const price = priceForSize(product, selectedSize);
    const msg =
      `Hi ${SITE.name}, I'd like to order:\n\n` +
      `- ${product.name} (${selectedSize}) x${qty} -- ${money(price * qty)}\n\n` +
      `Please confirm availability and delivery details.`;
    waBtn.href = `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(msg)}`;
  }
  updateWaLink();
  document.getElementById("pdSizes").addEventListener("click", updateWaLink);
  qtyInput.addEventListener("input", updateWaLink);
  document.getElementById("pdQtyMinus").addEventListener("click", updateWaLink);
  document.getElementById("pdQtyPlus").addEventListener("click", updateWaLink);

  /* ---------- Related products ---------- */
  const related = getRelatedProducts(product, 4);
  document.getElementById("relatedGrid").innerHTML = productGridHTML(related);
});
