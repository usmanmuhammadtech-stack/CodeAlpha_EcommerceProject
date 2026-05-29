async function loadOrders() {
  if (!requireAuth()) return;

  const container = document.getElementById('orders-page');

  const orders = await api.getMyOrders();

  if (orders.error) {
    container.innerHTML = `<div class="error-state"><p>${orders.error}</p></div>`;
    return;
  }

  if (!orders.length) {
    container.innerHTML = `
      <div class="empty-orders">
        <i class="fa-solid fa-box-open"></i>
        <h3>No orders yet</h3>
        <p>Start shopping and your orders will appear here.</p>
        <a href="/products.html" class="btn-hero">Browse Products</a>
      </div>`;
    return;
  }

  const statusColors = {
    pending: 'status-pending',
    confirmed: 'status-confirmed',
    shipped: 'status-shipped',
    delivered: 'status-delivered',
    cancelled: 'status-cancelled'
  };

  container.innerHTML = `
    <div class="orders-list">
      ${orders.map(order => {
        const addr = (() => {
          try { return JSON.parse(order.shipping_address); }
          catch { return {}; }
        })();
        return `
        <div class="order-card">
          <div class="order-card-head">
            <div class="order-meta">
              <h3>Order #${order.id}</h3>
              <span class="order-date">${new Date(order.created_at).toLocaleDateString('en-PK', {
                year: 'numeric', month: 'long', day: 'numeric'
              })}</span>
            </div>
            <div class="order-right">
              <span class="order-status ${statusColors[order.status] || ''}">${order.status.toUpperCase()}</span>
              <span class="order-total-badge">${formatPrice(order.total)}</span>
            </div>
          </div>
          <div class="order-items-preview">
            ${(order.items || []).map(item => `
              <div class="order-item-row">
                <img src="${item.image}" alt="${item.name}"/>
                <div>
                  <h4>${item.name}</h4>
                  <span>Qty: ${item.quantity} × ${formatPrice(item.price)}</span>
                </div>
                <span class="item-line-total">${formatPrice(item.price * item.quantity)}</span>
              </div>
            `).join('')}
          </div>
          ${addr.address ? `
            <div class="order-shipping-info">
              <i class="fa-solid fa-location-dot"></i>
              <span>${addr.name} · ${addr.address}, ${addr.city}, ${addr.province}</span>
            </div>` : ''}
        </div>`;
      }).join('')}
    </div>`;
}

function togglePass(id) {
  const input = document.getElementById(id);
  if (input) input.type = input.type === 'password' ? 'text' : 'password';
}

document.addEventListener('DOMContentLoaded', loadOrders);