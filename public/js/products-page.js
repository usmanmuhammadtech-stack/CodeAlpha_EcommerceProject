let allCats = [];

async function loadProductsPage() {
  await loadCategoriesFilter();
  await applyFilters();
}

async function loadCategoriesFilter() {
  const cats = await api.getCategories();
  const container = document.getElementById('filter-cats');
  if (!container || cats.error) return;

  allCats = cats;
  const icons = {
    phones: 'fa-mobile-screen', laptops: 'fa-laptop', audio: 'fa-headphones',
    wearables: 'fa-watch', tablets: 'fa-tablet-screen-button',
    accessories: 'fa-computer-mouse', monitors: 'fa-desktop'
  };

  container.innerHTML = `<label class="filter-cat active" onclick="selectCat(this, 'all')">
    <input type="radio" name="cat" value="all" checked>
    <i class="fa-solid fa-th-large"></i> All Products
  </label>`;

  cats.forEach(cat => {
    const icon = icons[cat] || 'fa-tag';
    const label = document.createElement('label');
    label.className = 'filter-cat';
    label.onclick = () => selectCat(label, cat);
    label.innerHTML = `<input type="radio" name="cat" value="${cat}"><i class="fa-solid ${icon}"></i> ${capitalize(cat)}`;
    container.appendChild(label);
  });
}

function selectCat(el, cat) {
  document.querySelectorAll('.filter-cat').forEach(l => l.classList.remove('active'));
  el.classList.add('active');
  applyFilters();
}

async function applyFilters() {
  const grid = document.getElementById('products-grid');
  const countEl = document.getElementById('results-count');
  if (!grid) return;

  grid.innerHTML = '<div class="loading-spinner"><div class="spinner"></div></div>';

  const params = {};
  const catInput = document.querySelector('input[name="cat"]:checked');
  if (catInput?.value && catInput.value !== 'all') params.category = catInput.value;

  const search = document.getElementById('search-inline')?.value.trim();
  if (search) params.search = search;

  const sort = document.getElementById('sort-select')?.value;
  if (sort) params.sort = sort;

  let products = await api.getProducts(params);
  if (products.error) {
    grid.innerHTML = `<div class="error-state"><p>${products.error}</p></div>`;
    return;
  }

  const minP = parseFloat(document.getElementById('min-price')?.value) || 0;
  const maxP = parseFloat(document.getElementById('max-price')?.value) || Infinity;
  if (minP || maxP < Infinity) {
    products = products.filter(p => p.price >= minP && p.price <= maxP);
  }

  if (countEl) countEl.textContent = `${products.length} product${products.length !== 1 ? 's' : ''} found`;

  grid.innerHTML = products.length
    ? products.map(p => renderProductCard(p)).join('')
    : `<div class="empty-state"><i class="fa-solid fa-box-open"></i><p>No products found</p><button onclick="clearFilters()">Clear filters</button></div>`;
}

function clearFilters() {
  document.querySelectorAll('.filter-cat').forEach((l, i) => l.classList.toggle('active', i === 0));
  document.querySelectorAll('input[name="cat"]')[0].checked = true;
  document.getElementById('min-price').value = '';
  document.getElementById('max-price').value = '';
  document.getElementById('sort-select').value = '';
  document.getElementById('search-inline').value = '';
  applyFilters();
}

document.addEventListener('DOMContentLoaded', loadProductsPage);