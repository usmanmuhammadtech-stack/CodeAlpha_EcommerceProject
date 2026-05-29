const express = require('express');
const { dbAll, dbGet, dbRun } = require('./database');
const { authMiddleware } = require('./auth');
const router = express.Router();

// Place order
router.post('/', authMiddleware, (req, res) => {
  try {
    const { items, shipping_address } = req.body;
    if (!items || !items.length)
      return res.status(400).json({ error: 'No items in order' });
    if (!shipping_address)
      return res.status(400).json({ error: 'Shipping address required' });

    let total = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = dbGet('SELECT * FROM products WHERE id = ?', [item.id]);
      if (!product) return res.status(400).json({ error: `Product ${item.id} not found` });
      if (product.stock < item.quantity)
        return res.status(400).json({ error: `Insufficient stock for ${product.name}` });
      total += product.price * item.quantity;
      validatedItems.push({ product, quantity: item.quantity });
    }

    const order = dbRun(
      'INSERT INTO orders (user_id, total, status, shipping_address) VALUES (?, ?, ?, ?)',
      [req.user.id, total, 'confirmed', JSON.stringify(shipping_address)]
    );

    for (const { product, quantity } of validatedItems) {
      dbRun(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [order.lastID, product.id, quantity, product.price]
      );
      dbRun('UPDATE products SET stock = stock - ? WHERE id = ?', [quantity, product.id]);
    }

    res.json({ success: true, orderId: order.lastID, total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user orders
router.get('/my', authMiddleware, (req, res) => {
  const orders = dbAll(
    'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
    [req.user.id]
  );

  const ordersWithItems = orders.map(order => {
    const items = dbAll(
      `SELECT oi.*, p.name, p.image FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ?`,
      [order.id]
    );
    return { ...order, items };
  });

  res.json(ordersWithItems);
});

// Get single order
router.get('/:id', authMiddleware, (req, res) => {
  const order = dbGet(
    'SELECT * FROM orders WHERE id = ? AND user_id = ?',
    [req.params.id, req.user.id]
  );
  if (!order) return res.status(404).json({ error: 'Order not found' });

  const items = dbAll(
    `SELECT oi.*, p.name, p.image, p.category FROM order_items oi
     JOIN products p ON oi.product_id = p.id
     WHERE oi.order_id = ?`,
    [order.id]
  );

  res.json({ ...order, items });
});

module.exports = router;