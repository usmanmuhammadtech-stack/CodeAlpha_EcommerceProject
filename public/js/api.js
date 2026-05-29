const API = '/api';

const api = {
  getToken: () => localStorage.getItem('token'),

  async req(method, path, body = null) {
    const opts = {
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    const token = this.getToken();
    if (token) opts.headers['Authorization'] = `Bearer ${token}`;
    if (body) opts.body = JSON.stringify(body);
    try {
      const res = await fetch(API + path, opts);
      return await res.json();
    } catch (e) {
      return { error: 'Network error. Is the server running?' };
    }
  },

  get: (path) => api.req('GET', path),
  post: (path, body) => api.req('POST', path, body),

  // Auth
  register: (name, email, password) => api.post('/auth/register', { name, email, password }),
  login: (email, password) => api.post('/auth/login', { email, password }),
  getMe: () => api.get('/auth/me'),

  // Products
  getProducts: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return api.get('/products' + (q ? '?' + q : ''));
  },
  getProduct: (id) => api.get('/products/' + id),
  getCategories: () => api.get('/products/categories'),

  // Orders
  placeOrder: (items, shipping_address) => api.post('/orders', { items, shipping_address }),
  getMyOrders: () => api.get('/orders/my'),
  getOrder: (id) => api.get('/orders/' + id),
};