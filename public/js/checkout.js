function loadCheckout() {
  if (!requireAuth()) return;

  const items = Cart.get();
  const listEl = document.getElementById('order-items-list');
  const subtotalEl = document.getElementById('co-subtotal');
  const totalEl = document.getElementById('co-total');

  if (!items.length) {
    window.location.href = '/products.html';
    return;
  }

  listEl.innerHTML = items.map(item => `
    <div class="co-item">
      <img src="${item.image}" alt="${item.name}"/>
      <div class="co-item-info">
        <h4>${item.name}</h4>
        <span>Qty: ${item.qty}</span>
      </div>
      <span class="co-item-price">${formatPrice(item.price * item.qty)}</span>
    </div>
  `).join('');

  const total = Cart.total();
  subtotalEl.textContent = formatPrice(total);
  totalEl.textContent = formatPrice(total);

  const user = getUser();
  if (user) {
    document.getElementById('sh-name').value = user.name;
  }
}

document.querySelectorAll('.payment-option').forEach(opt => {
  opt.addEventListener('click', () => {
    document.querySelectorAll('.payment-option').forEach(o => o.classList.remove('active'));
    opt.classList.add('active');
  });
});

async function placeOrder() {
  const name = document.getElementById('sh-name')?.value.trim();
  const phone = document.getElementById('sh-phone')?.value.trim();
  const address = document.getElementById('sh-address')?.value.trim();
  const city = document.getElementById('sh-city')?.value.trim();
  const province = document.getElementById('sh-province')?.value;
  const errEl = document.getElementById('checkout-error');
  const btn = document.getElementById('place-order-btn');

  if (!name || !phone || !address || !city) {
    errEl.textContent = 'Please fill in all shipping details';
    errEl.style.display = 'block';
    errEl.scrollIntoView({ behavior: 'smooth' });
    return;
  }

  errEl.style.display = 'none';
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';
  btn.disabled = true;

  const items = Cart.get().map(i => ({ id: i.id, quantity: i.qty }));
  const shipping = { name, phone, address, city, province };

  const res = await api.placeOrder(items, shipping);

  if (res.error) {
    errEl.textContent = res.error;
    errEl.style.display = 'block';
    btn.innerHTML = '<i class="fa-solid fa-bag-shopping"></i> Place Order';
    btn.disabled = false;
    return;
  }

  Cart.clear();
  document.getElementById('modal-order-id').textContent = '#' + res.orderId;
  document.getElementById('success-modal').style.display = 'flex';
}

document.addEventListener('DOMContentLoaded', loadCheckout);