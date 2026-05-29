let allProducts = [];
let currentCat = 'all';

async function loadHome() {
  await loadCategories();
  await loadProducts();
}

async function loadCategories() {
  const cats = await api.getCategories();
  const row = document.getElementById('categories-row');
  if (!row || cats.error) return;

  const icons = {
    phones: 'fa-mobile-screen', laptops: 'fa-laptop', audio: 'fa-headphones',
    wearables: 'fa-watch', tablets: 'fa-tablet-screen-button',
    accessories: 'fa-computer-mouse', monitors: 'fa-desktop'
  };

  cats.forEach(cat => {
    const icon = icons[cat] || 'fa-tag';
    const pill = document.createElement('div');
    pill.className = 'cat-pill';
    pill.dataset.cat = cat;
    pill.onclick = () => filterCat(pill);
    pill.innerHTML = `<i class="fa-solid ${icon}"></i> ${capitalize(cat)}`;
    row.appendChild(pill);
  });
}

async function loadProducts(cat = 'all') {
  const grid = document.getElementById('products-grid');
  if (!grid) return;
  grid.innerHTML = '<div class="loading-spinner"><div class="spinner"></div></div>';

  const params = { featured: '1' };
  if (cat !== 'all') params.category = cat;

  const products = await api.getProducts(params);
  if (products.error) {
    grid.innerHTML = `<div class="error-state"><i class="fa-solid fa-circle-exclamation"></i><p>${products.error}</p></div>`;
    return;
  }

  allProducts = products;
  grid.innerHTML = products.length
    ? products.map(p => renderProductCard(p)).join('')
    : '<div class="empty-state"><i class="fa-solid fa-box-open"></i><p>No products found</p></div>';
}

function filterCat(el) {
  document.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
  currentCat = el.dataset.cat;
  loadProducts(currentCat);
}

function toggleSearch() {
  const overlay = document.getElementById('search-overlay');
  overlay?.classList.toggle('open');
  if (overlay?.classList.contains('open')) {
    document.getElementById('search-input')?.focus();
    document.getElementById('search-results').innerHTML = '';
  }
}

let searchTimer;
async function searchProducts(query) {
  clearTimeout(searchTimer);
  const results = document.getElementById('search-results');
  if (!query.trim()) { results.innerHTML = ''; return; }

  searchTimer = setTimeout(async () => {
    results.innerHTML = '<div class="search-loading"><div class="spinner"></div></div>';
    const products = await api.getProducts({ search: query });
    if (!products.length) {
      results.innerHTML = '<p class="no-results">No products found</p>';
      return;
    }
    results.innerHTML = products.slice(0, 6).map(p => `
      <a href="/product.html?id=${p.id}" class="search-result-item" onclick="toggleSearch()">
        <img src="${p.image}" alt="${p.name}"/>
        <div>
          <h4>${p.name}</h4>
          <span>${formatPrice(p.price)}</span>
        </div>
      </a>
    `).join('');
  }, 300);
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.getElementById('search-overlay')?.classList.remove('open');
  }
});

document.addEventListener('DOMContentLoaded', loadHome);