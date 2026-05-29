const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'shop.db');

let db;

async function getDb() {
  if (db) return db;
  const SQL = await initSqlJs();
  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }
  setupTables();
  return db;
}

function saveDb() {
  if (!db) return;
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

function setupTables() {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      old_price REAL,
      category TEXT,
      image TEXT,
      stock INTEGER DEFAULT 100,
      rating REAL DEFAULT 4.5,
      reviews INTEGER DEFAULT 0,
      featured INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      total REAL NOT NULL,
      status TEXT DEFAULT 'pending',
      shipping_address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      FOREIGN KEY(order_id) REFERENCES orders(id),
      FOREIGN KEY(product_id) REFERENCES products(id)
    )
  `);

  const result = db.exec("SELECT COUNT(*) as count FROM products");
  const count = result[0]?.values[0][0];
  if (count === 0) {
    seedProducts();
  }
  saveDb();
}

function seedProducts() {
  const products = [
    ["Samsung Galaxy S24 Ultra", "6.8\" QHD+ Dynamic AMOLED, 200MP camera, S Pen included, 5000mAh battery.", 289999, 329999, "phones", "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500", 50, 4.9, 2847, 1],
    ["MacBook Pro 14\" M3", "Apple M3 chip, 14-inch Liquid Retina XDR, 18GB RAM, 512GB SSD.", 499999, 559999, "laptops", "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500", 30, 4.9, 1534, 1],
    ["Sony WH-1000XM5", "Industry-leading noise cancellation, 30-hour battery, crystal-clear call quality.", 89999, 109999, "audio", "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500", 80, 4.8, 3201, 1],
    ["Apple Watch Ultra 2", "49mm Titanium, 2000-nit display, Precision GPS, 60-hour battery life.", 159999, 179999, "wearables", "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500", 40, 4.8, 987, 1],
    ["Dell XPS 15 OLED", "15.6\" OLED Touch, Intel Core i9, RTX 4070, 32GB RAM, 1TB SSD.", 379999, 419999, "laptops", "https://images.unsplash.com/photo-1593642632840-2f6ebae9faf3?w=500", 25, 4.7, 654, 0],
    ["AirPods Pro 2nd Gen", "Active Noise Cancellation, Adaptive Audio, MagSafe charging, H2 chip.", 59999, 74999, "audio", "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=500", 100, 4.9, 5682, 1],
    ["iPhone 15 Pro Max", "A17 Pro chip, Titanium design, 5x Telephoto, Action Button, USB 3.", 339999, null, "phones", "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500", 60, 4.9, 4123, 1],
    ["Bose QuietComfort 45", "Quiet and aware modes, 24-hour battery, premium materials.", 69999, 84999, "audio", "https://images.unsplash.com/photo-1545127398-14699f92334b?w=500", 70, 4.7, 1876, 0],
    ["iPad Pro 12.9\" M2", "12.9\" Liquid Retina XDR, M2 chip, Wi-Fi 6E, Apple Pencil support.", 219999, 249999, "tablets", "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500", 45, 4.8, 1243, 0],
    ["Logitech MX Master 3S", "8K DPI sensor, quiet clicks, ergonomic design, works on any surface.", 19999, 24999, "accessories", "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500", 150, 4.7, 3421, 0],
    ["Samsung 49\" Odyssey G9", "Dual QHD curved gaming monitor, 240Hz, 1ms, DQHD HDR2000.", 299999, 349999, "monitors", "https://images.unsplash.com/photo-1547394765-185e1e68f34e?w=500", 20, 4.6, 876, 0],
    ["Keychron Q1 Pro", "75% wireless mechanical keyboard, QMK/VIA, hot-swappable, aluminium.", 24999, 29999, "accessories", "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=500", 60, 4.8, 2134, 0],
  ];

  const stmt = db.prepare(`INSERT INTO products (name, description, price, old_price, category, image, stock, rating, reviews, featured) VALUES (?,?,?,?,?,?,?,?,?,?)`);
  products.forEach(p => stmt.run(p));
  stmt.free();
}

function dbAll(sql, params = []) {
  try {
    const result = db.exec(sql.replace(/\?/g, () => {
      const val = params.shift();
      if (val === null || val === undefined) return 'NULL';
      if (typeof val === 'number') return val;
      return `'${String(val).replace(/'/g, "''")}'`;
    }));
    if (!result.length) return [];
    const { columns, values } = result[0];
    return values.map(row => {
      const obj = {};
      columns.forEach((col, i) => obj[col] = row[i]);
      return obj;
    });
  } catch (e) {
    console.error('dbAll error:', e.message, sql);
    return [];
  }
}

function dbGet(sql, params = []) {
  return dbAll(sql, params)[0] || null;
}

function dbRun(sql, params = []) {
  try {
    const stmt = db.prepare(sql);
    stmt.run(params);
    stmt.free();
    saveDb();
    return { lastID: db.exec("SELECT last_insert_rowid() as id")[0]?.values[0][0] };
  } catch (e) {
    console.error('dbRun error:', e.message, sql);
    throw e;
  }
}

module.exports = { getDb, dbAll, dbGet, dbRun, saveDb };