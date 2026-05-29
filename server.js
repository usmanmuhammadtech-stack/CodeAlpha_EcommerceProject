const express = require('express');
const cors = require('cors');
const path = require('path');
const { getDb } = require('./backend/database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/auth', require('./backend/auth'));
app.use('/api/products', require('./backend/products'));
app.use('/api/orders', require('./backend/orders'));

// SPA fallback
app.get('*path', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Init DB then start server
getDb().then(() => {
  app.listen(PORT, () => {
    console.log(`\n🛍️  ShopZone running at http://localhost:${PORT}`);
    console.log(`📦  Database: SQLite (shop.db)`);
    console.log(`🔑  API: http://localhost:${PORT}/api\n`);
  });
});