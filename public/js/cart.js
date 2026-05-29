const Cart = {
  get: () => JSON.parse(localStorage.getItem('cart') || '[]'),
  save: (items) => {
    localStorage.setItem('cart', JSON.stringify(items));
    Cart.updateUI();
  },
  add: (product, qty = 1) => {
    const items = Cart.get();
    const ex = items.find(i => i.id === product.id);
    if (ex) {
      ex.qty += qty;
    } else {
      items.push({ id: product.id, name: product.name, price: product.price, image: product.image, qty });
    }
    Cart.save(items);
    showToast(`${product.name} added to cart! 🛍️`);
  },
  remove: (id) => {
    Cart.save(Cart.get().filter(i => i.id !== id));
  },
  updateQty: (id, qty) => {
    const items = Cart.get();
    const item = items.find(i => i.id === id);
    if (item) {
      item.qty = qty;
      if (item.qty <= 0) return Cart.remove(id);
    }
    Cart.save(items);
  },
  clear: () => {
    localStorage.removeItem('cart');
    Cart.updateUI();
  },
  count: () => Cart.get().reduce((a, i) => a + i.qty, 0),
  total: () => Cart.get().reduce((a, i) => a + i.price * i.qty, 0),

  updateUI: () => {
    const count = Cart.count();
    document.querySelectorAll('#cart-count').forEach(el => el.textContent = count);
    Cart.renderSidebar();
  },

  renderSidebar: () => {
    const items = Cart.get();
    const body = document.getElementById('cart-body');
    const foot = document.getElementById('cart-foot');
    if (!body) return;

    if (items.length === 0) {
      body.innerHTML = `
        <div class="cart-empty-state">
          <i class="fa-solid fa-bag-shopping"></i>
          <p>Your cart is empty</p>
          <a href="/products.html" onclick="closeCart()">Browse Products</a>
        </div>`;
      if (foot) foot.style.display = 'none';
      return;
    }

    body.innerHTML = items.map(item => `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.name}" />
        <div class="cart-item-info">
          <h4>${item.name}</h4>
          <span class="cart-item-price">${formatPrice(item.price)}</span>
          <div class="qty-controls">
            <button onclick="Cart.updateQty(${item.id}, ${item.qty - 1})">−</button>
            <span>${item.qty}</span>
            <button onclick="Cart.updateQty(${item.id}, ${item.qty + 1})">+</button>
          </div>
        </div>
        <button class="cart-remove" onclick="Cart.remove(${item.id})">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    `).join('');

    if (foot) {
      foot.style.display = 'block';
      const totalEl = document.getElementById('cart-total');
      if (totalEl) totalEl.textContent = formatPrice(Cart.total());
    }
  }
};

function toggleCart() {
  const sidebar = document.getElementById('cart-sidebar');
  const overlay = document.getElementById('cart-overlay');
  sidebar?.classList.toggle('open');
  overlay?.classList.toggle('open');
  Cart.renderSidebar();
}

function closeCart() {
  document.getElementById('cart-sidebar')?.classList.remove('open');
  document.getElementById('cart-overlay')?.classList.remove('open');
}

function formatPrice(p) {
  return 'Rs. ' + Number(p).toLocaleString('en-PK');
}

function showToast(msg, type = 'success') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.className = `toast show ${type}`;
  setTimeout(() => toast.className = 'toast', 3000);
}

function renderStars(rating) {
  const full = Math.floor(rating);
  const half = (rating % 1) >= 0.5;
  let html = '';
  for (let i = 0; i < full; i++) html += '<i class="fa-solid fa-star"></i>';
  if (half) html += '<i class="fa-solid fa-star-half-stroke"></i>';
  return html;
}

function renderProductCard(p) {
  const discount = p.old_price ? Math.round((1 - p.price / p.old_price) * 100) : null;
  return `
    <div class="product-card" onclick="window.location='/product.html?id=${p.id}'">
      <div class="prod-img-wrap">
        <img src="${p.image}" alt="${p.name}" loading="lazy"/>
        ${p.featured ? '<span class="prod-badge badge-hot">🔥 Hot</span>' : ''}
        ${discount ? `<span class="prod-badge badge-discount">-${discount}%</span>` : ''}
      </div>
      <div class="prod-info">
        <p class="prod-category">${capitalize(p.category)}</p>
        <h3>${p.name}</h3>
        <div class="prod-rating">
          <span class="stars">${renderStars(p.rating)}</span>
          <span class="rating-num">${p.rating} (${Number(p.reviews).toLocaleString()})</span>
        </div>
        <div class="prod-price-row">
          <div>
            <span class="prod-price">${formatPrice(p.price)}</span>
            ${p.old_price ? `<span class="prod-old-price">${formatPrice(p.old_price)}</span>` : ''}
          </div>
        </div>
        <button class="add-cart-btn" onclick="event.stopPropagation(); addToCartFromCard(${p.id}, this)">
          <i class="fa-solid fa-bag-shopping"></i> Add to Cart
        </button>
      </div>
    </div>
  `;
}

const productCache = {};

async function addToCartFromCard(id, btn) {
  let product = productCache[id];
  if (!product) {
    const res = await api.getProduct(id);
    if (res.error) return showToast('Failed to add to cart', 'error');
    product = res;
    productCache[id] = product;
  }
  Cart.add(product);
  btn.innerHTML = '<i class="fa-solid fa-check"></i> Added!';
  setTimeout(() => btn.innerHTML = '<i class="fa-solid fa-bag-shopping"></i> Add to Cart', 2000);
}

function capitalize(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
}

document.addEventListener('DOMContentLoaded', () => Cart.updateUI());