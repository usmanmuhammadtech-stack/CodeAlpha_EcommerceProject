const express = require('express');
const { dbAll, dbGet } = require('./database');
const router = express.Router();

// GET all products with optional filters
router.get('/', (req, res) => {
  const { category, search, featured, sort } = req.query;
  let sql = 'SELECT * FROM products WHERE 1=1';
  const params = [];

  if (category && category !== 'all') {
    sql += ` AND category = ?`;
    params.push(category);
  }
  if (search) {
    sql += ` AND (name LIKE ? OR description LIKE ?)`;
    params.push(`%${search}%`, `%${search}%`);
  }
  if (featured === '1') {
    sql += ` AND featured = 1`;
  }

  if (sort === 'price_asc') sql += ' ORDER BY price ASC';
  else if (sort === 'price_desc') sql += ' ORDER BY price DESC';
  else if (sort === 'rating') sql += ' ORDER BY rating DESC';
  else if (sort === 'newest') sql += ' ORDER BY created_at DESC';
  else sql += ' ORDER BY featured DESC, id ASC';

  const products = dbAll(sql, params);
  res.json(products);
});

// GET categories
router.get('/categories', (req, res) => {
  const cats = dbAll('SELECT DISTINCT category FROM products ORDER BY category');
  res.json(cats.map(c => c.category));
});

// GET single product
router.get('/:id', (req, res) => {
  const product = dbGet('SELECT * FROM products WHERE id = ?', [req.params.id]);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

module.exports = router;