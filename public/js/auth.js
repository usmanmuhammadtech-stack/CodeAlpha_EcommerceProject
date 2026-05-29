function initAuth() {
  const user = getUser();
  const authBtns = document.getElementById('auth-btns');
  const userMenu = document.getElementById('user-menu');
  const ordersNav = document.getElementById('orders-nav');

  if (user) {
    if (authBtns) authBtns.style.display = 'none';
    if (userMenu) userMenu.style.display = 'block';
    const nameEl = document.getElementById('user-name-nav');
    const avatarEl = document.getElementById('user-avatar');
    if (nameEl) nameEl.textContent = user.name.split(' ')[0];
    if (avatarEl) avatarEl.textContent = user.name.charAt(0).toUpperCase();
    if (ordersNav) ordersNav.style.display = 'block';
  } else {
    if (authBtns) authBtns.style.display = 'flex';
    if (userMenu) userMenu.style.display = 'none';
  }
}

function getUser() {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch { return null; }
}

function isLoggedIn() {
  return !!(localStorage.getItem('token') && getUser());
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/';
}

function requireAuth() {
  if (!isLoggedIn()) {
    localStorage.setItem('redirect_after_login', window.location.href);
    window.location.href = '/login.html';
    return false;
  }
  return true;
}

function toggleUserMenu() {
  document.getElementById('user-dropdown')?.classList.toggle('open');
}

document.addEventListener('click', (e) => {
  const menu = document.getElementById('user-dropdown');
  if (menu && !e.target.closest('.user-menu')) {
    menu.classList.remove('open');
  }
});

document.addEventListener('DOMContentLoaded', initAuth);

window.addEventListener('scroll', () => {
  const nb = document.getElementById('navbar');
  if (nb) nb.classList.toggle('scrolled', window.scrollY > 60);
});