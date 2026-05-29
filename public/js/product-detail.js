async function loadProductDetail() {
  const id = new URLSearchParams(window.location.search).get('id');
  const container = document.getElementById('product-detail-page');
  if (!id || !container) return;

  const p = await api.getProduct(id);
  if (p.error) {
    container.innerHTML = `<div class="error-state" style="padding:80px 60px"><i class="fa-solid fa-circle-exclamation"></i><p>${p.error}</p><a href="/products.html" class="btn-hero">Back to Products</a></div>`;
    return;
  }

  document.title = `${p.name} — ShopZone`;
  const discount = p.old_price ? Math.round((1 - p.price / p.old_price) * 100) : null;

  container.innerHTML = `
    <div class="breadcrumb-bar">
      <div class="breadcrumb">
        <a href="/">Home</a> / <a href="/products.html">Products</a> / <span>${p.name}</span>
      </div>
    </div>
    <div class="detail-layout">
      <div class="detail-img-col">
        <div class="detail-img-wrap">
          <img src="${p.image}" alt="${p.name}" id="main-img"/>
          ${discount ? `<span class="detail-badge">-${discount}%</span>` : ''}
        </div>
      </div>
      <div class="detail-info-col">
        <p class="detail-category">${capitalize(p.category)}</p>
        <h1 class="detail-title">${p.name}</h1>
        <div class="detail-rating">
          <span class="stars">${renderStars(p.rating)}</span>
          <span>${p.rating} stars · ${Number(p.reviews).toLocaleString()} reviews</span>
        </div>
        <div class="detail-price-row">
          <span class="detail-price">${formatPrice(p.price)}</span>
          ${p.old_price ? `<span class="detail-old-price">${formatPrice(p.old_price)}</span>` : ''}
          ${discount ? `<span class="detail-discount">Save ${discount}%</span>` : ''}
        </div>
        <p class="detail-desc">${p.description}</p>
        <div class="detail-stock ${p.stock > 10 ? 'in-stock' : p.stock > 0 ? 'low-stock' : 'out-stock'}">
          <i class="fa-solid fa-circle-check"></i>
          ${p.stock > 10 ? 'In Stock' : p.stock > 0 ? `Only ${p.stock} left!` : 'Out of Stock'}
        </div>
        <div class="detail-qty-row">
          <label>Quantity</label>
          <div class="qty-stepper">
            <button onclick="changeQty(-1)">−</button>
            <span id="qty-display">1</span>
            <button onclick="changeQty(1)">+</button>
          </div>
        </div>
        <div class="detail-actions">
          <button class="btn-add-cart" onclick="addDetailToCart(${p.id})" ${p.stock === 0 ? 'disabled' : ''}>
            <i class="fa-solid fa-bag-shopping"></i> Add to Cart
          </button>
          <button class="btn-buy-now" onclick="buyNow(${p.id})" ${p.stock === 0 ? 'disabled' : ''}>
            Buy Now <i class="fa-solid fa-arrow-right"></i>
          </button>
        </div>
        <div class="detail-features">
          <div class="feat"><i class="fa-solid fa-truck-fast"></i><span>Free Delivery</span></div>
          <div class="feat"><i class="fa-solid fa-shield-halved"></i><span>2 Year Warranty</span></div>
          <div class="feat"><i class="fa-solid fa-rotate-left"></i><span>30-Day Returns</span></div>
        </div>
      </div>
    </div>
  `;

  window._currentProduct = p;
}

let qty = 1;
function changeQty(delta) {
  qty = Math.max(1, qty + delta);
  const el = document.getElementById('qty-display');
  if (el) el.textContent = qty;
}

async function addDetailToCart(id) {
  const product = window._currentProduct;
  if (!product) return;
  Cart.add(product, qty);
  toggleCart();
}

async function buyNow(id) {
  const product = window._currentProduct;
  if (!product) return;
  Cart.add(product, qty);
  window.location.href = '/checkout.html';
}

document.addEventListener('DOMContentLoaded', loadProductDetail);