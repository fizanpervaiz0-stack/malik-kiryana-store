import fs from 'node:fs'
import path from 'node:path'
import bcrypt from 'bcryptjs'
import Database from 'better-sqlite3'

const serverDir = path.resolve('server')
if (!fs.existsSync(serverDir)) {
  fs.mkdirSync(serverDir, { recursive: true })
}

const dbPath = path.join(serverDir, 'marketplace.db')
const db = new Database(dbPath)

db.pragma('journal_mode = WAL')

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT UNIQUE,
    password_hash TEXT NOT NULL,
    store_name TEXT,
    role TEXT DEFAULT 'customer',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price REAL NOT NULL,
    old_price REAL,
    stock INTEGER NOT NULL DEFAULT 0,
    image TEXT,
    accent TEXT DEFAULT 'blue',
    featured INTEGER DEFAULT 0,
    description TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    total REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`)

const seedProducts = [
  { name: 'Lay\'s Chips', category: 'Snacks', price: 120, old_price: 150, stock: 75, image: '🫓', accent: 'gold', featured: 1, description: 'Crispy potato chips.' },
  { name: 'Oreo Biscuit', category: 'Biscuit', price: 120, old_price: 150, stock: 62, image: '🍪', accent: 'rose', featured: 1, description: 'Cream-filled cookies.' },
  { name: 'Chocolate Cake', category: 'Bakery', price: 450, old_price: 500, stock: 48, image: '🎂', accent: 'brown', featured: 1, description: 'Rich chocolate dessert.' },
  { name: 'Toffee Mix', category: 'Mix', price: 200, old_price: 230, stock: 82, image: '🥨', accent: 'purple', featured: 0, description: 'Crispy sweet mix.' },
  { name: 'Coca Cola', category: 'Drinks', price: 70, old_price: 90, stock: 110, image: '🥤', accent: 'red', featured: 0, description: 'Refreshing cola beverage.' },
  { name: 'Lays Family Pack', category: 'Snacks', price: 310, old_price: 360, stock: 42, image: '🥨', accent: 'green', featured: 0, description: 'Family-size crunchy snack.' },
]

const seedUsers = [
  {
    name: 'Admin Kiryana',
    email: 'admin@kiryana.pk',
    phone: '+923001234567',
    password: 'admin123',
    store_name: 'Kiryana HQ',
    role: 'owner',
  },
  {
    name: 'Customer Demo',
    email: 'customer@kiryana.pk',
    phone: '+923009876543',
    password: 'customer123',
    store_name: null,
    role: 'customer',
  },
]

function initializeDatabase() {
  const existingProducts = db.prepare('SELECT COUNT(*) as count FROM products').get()
  if (existingProducts.count === 0) {
    const insertProduct = db.prepare(`
      INSERT INTO products (name, category, price, old_price, stock, image, accent, featured, description)
      VALUES (@name, @category, @price, @old_price, @stock, @image, @accent, @featured, @description)
    `)

    const productTx = db.transaction((items) => {
      for (const product of items) {
        insertProduct.run(product)
      }
    })

    productTx(seedProducts)
  }

  const existingUsers = db.prepare('SELECT COUNT(*) as count FROM users').get()
  if (existingUsers.count === 0) {
    const insertUser = db.prepare(`
      INSERT INTO users (name, email, phone, password_hash, store_name, role)
      VALUES (@name, @email, @phone, @password_hash, @store_name, @role)
    `)

    const userTx = db.transaction((entries) => {
      for (const entry of entries) {
        insertUser.run({
          ...entry,
          password_hash: bcrypt.hashSync(entry.password, 10),
        })
      }
    })

    userTx(seedUsers)
  }

  const existingOrders = db.prepare('SELECT COUNT(*) as count FROM orders').get()
  if (existingOrders.count === 0) {
    const customer = db.prepare('SELECT id FROM users WHERE role = ? LIMIT 1').get('customer')
    const owner = db.prepare('SELECT id FROM users WHERE role = ? LIMIT 1').get('owner')

    db.prepare(
      'INSERT INTO orders (user_id, total, status) VALUES (?, ?, ?), (?, ?, ?)',
    ).run(
      customer?.id ?? owner?.id ?? 1,
      320,
      'paid',
      owner?.id ?? customer?.id ?? 1,
      560,
      'packing',
    )
  }
}

initializeDatabase()

export { db, initializeDatabase }
