import path from 'node:path'
import { fileURLToPath } from 'node:url'
import bcrypt from 'bcryptjs'
import cors from 'cors'
import express from 'express'
import jwt from 'jsonwebtoken'
import { db, initializeDatabase } from './db.js'

const app = express()
const port = process.env.PORT || 4000
const JWT_SECRET = process.env.JWT_SECRET || 'kiryana-marketplace-secret'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const distPath = path.resolve(__dirname, '../dist')

app.use(cors())
app.use(express.json())

const sanitizeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  storeName: user.store_name,
  role: user.role,
})

const signToken = (user) => jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' })

const requireAuth = (req, res, next) => {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' })
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET)
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(payload.id)

    if (!user) {
      return res.status(401).json({ message: 'User not found' })
    }

    req.user = user
    next()
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' })
  }
}

const requireAdmin = (req, res, next) => {
  if (!req.user || !['admin', 'owner'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Admin access required' })
  }

  next()
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'kiryana-api' })
})

app.get('/api/products', (req, res) => {
  const products = db.prepare('SELECT * FROM products ORDER BY featured DESC, id DESC').all()
  res.json(products)
})

app.post('/api/auth/register', async (req, res) => {
  const { name, email, phone, password, storeName, role = 'customer' } = req.body

  if (!name || !password || !phone) {
    return res.status(400).json({ message: 'Name, phone and password are required.' })
  }

  const normalizedEmail = email || `${phone.replace(/\D/g, '')}@demo.pk`
  const existingUser = db.prepare('SELECT * FROM users WHERE email = ? OR phone = ?').get(normalizedEmail, phone)

  if (existingUser) {
    return res.status(409).json({ message: 'An account with this email or phone already exists.' })
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const result = db.prepare(`
    INSERT INTO users (name, email, phone, password_hash, store_name, role)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(name, normalizedEmail, phone, passwordHash, storeName || null, role)

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid)
  const token = signToken(user)

  return res.status(201).json({
    message: 'Registration successful',
    user: sanitizeUser(user),
    token,
  })
})

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' })
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ? OR phone = ?').get(email, email)

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' })
  }

  const isValid = await bcrypt.compare(password, user.password_hash)
  if (!isValid) {
    return res.status(401).json({ message: 'Invalid credentials' })
  }

  const token = signToken(user)
  return res.json({
    message: 'Login successful',
    user: sanitizeUser(user),
    token,
  })
})

app.get('/api/dashboard/stats', requireAuth, (req, res) => {
  const productCount = db.prepare('SELECT COUNT(*) as total FROM products').get().total
  const orderCount = db.prepare('SELECT COUNT(*) as total FROM orders').get().total
  const revenue = db.prepare('SELECT COALESCE(SUM(total), 0) as total FROM orders').get().total
  const userCount = db.prepare('SELECT COUNT(*) as total FROM users').get().total
  const orders = db.prepare(`
    SELECT o.id, o.total, o.status, u.name as customer
    FROM orders o
    LEFT JOIN users u ON u.id = o.user_id
    ORDER BY o.created_at DESC
    LIMIT 5
  `).all()

  return res.json({
    totalProducts: productCount,
    totalOrders: orderCount,
    revenue: Number(revenue).toFixed(0),
    activeUsers: userCount,
    orders,
  })
})

app.get('/api/orders', requireAuth, (req, res) => {
  const orders = db.prepare(`
    SELECT o.id, o.total, o.status, u.name as customer
    FROM orders o
    LEFT JOIN users u ON u.id = o.user_id
    ORDER BY o.created_at DESC
  `).all()

  res.json(orders)
})

app.post('/api/admin/products', requireAuth, requireAdmin, (req, res) => {
  const { name, category, price, oldPrice, stock, image, accent, featured, description } = req.body

  if (!name || !category || !price) {
    return res.status(400).json({ message: 'Product name, category and price are required.' })
  }

  const result = db.prepare(`
    INSERT INTO products (name, category, price, old_price, stock, image, accent, featured, description)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    name,
    category,
    Number(price),
    Number(oldPrice || price),
    Number(stock || 0),
    image || '📦',
    accent || 'blue',
    featured ? 1 : 0,
    description || `${name} is now available in the inventory.`,
  )

  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid)
  res.status(201).json({ message: 'Product added successfully', product })
})

app.use(express.static(distPath))

app.get(/^(?!\/api\/).*/, (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'))
})

initializeDatabase()

app.listen(port, () => {
  console.log(`Kiryana API is running on http://localhost:${port}`)
})
