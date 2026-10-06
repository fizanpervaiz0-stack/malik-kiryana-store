import { useEffect, useMemo, useState } from 'react'
import { Phone, ShieldCheck, ShoppingBag, ShoppingCart, User } from 'lucide-react'
import './App.css'

const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:4000'

const defaultProducts = [
  {
    id: 1,
    name: 'Chocolate Cake',
    price: 450,
    oldPrice: 500,
    category: 'Bakery',
    stock: 45,
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500',
    accent: 'amber',
    featured: true,
  },
  {
    id: 2,
    name: 'Oreo Biscuit',
    price: 120,
    oldPrice: 150,
    category: 'Biscuit',
    stock: 60,
    image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500',
    accent: 'sand',
    featured: true,
  },
  {
    id: 3,
    name: 'Lays Chips',
    price: 120,
    oldPrice: 150,
    category: 'Snacks',
    stock: 35,
    image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500',
    accent: 'gold',
    featured: true,
  },
  {
    id: 4,
    name: 'Dal Chana 1kg',
    price: 280,
    oldPrice: 320,
    category: 'Daal',
    stock: 80,
    image: 'https://images.unsplash.com/photo-1780478238047-13e4e6c07cba?w=500',
    accent: 'rose',
    featured: true,
  },
  {
    id: 5,
    name: 'Basmati Rice 1kg',
    price: 320,
    oldPrice: 350,
    category: 'Rice',
    stock: 50,
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500',
    accent: 'violet',
    featured: true,
  },
  {
    id: 6,
    name: 'Cooking Oil 1L',
    price: 480,
    oldPrice: 540,
    category: 'Oil',
    stock: 90,
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500',
    accent: 'blue',
    featured: true,
  },
  {
    id: 7,
    name: 'Sugar 1kg',
    price: 160,
    oldPrice: 210,
    category: 'Sugar',
    stock: 48,
    image: 'https://images.unsplash.com/photo-1709651808265-977ed7ef78c6?w=500',
    accent: 'amber',
    featured: true,
  },
  {
    id: 8,
    name: 'Surf Excel 500g',
    price: 250,
    oldPrice: 290,
    category: 'Detergent',
    stock: 62,
    image: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=500',
    accent: 'rose',
    featured: true,
  },
  {
    id: 9,
    name: 'Pepsi 1.5L',
    price: 180,
    oldPrice: 200,
    category: 'Drinks',
    stock: 75,
    image: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=500',
    accent: 'gold',
    featured: true,
  },
  {
    id: 10,
    name: 'Shan Biryani Masala',
    price: 120,
    oldPrice: 150,
    category: 'Masala',
    stock: 30,
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500',
    accent: 'amber',
    featured: true,
  },
  {
    id: 11,
    name: 'Tapal Tea 200g',
    price: 400,
    oldPrice: 440,
    category: 'Tea',
    stock: 42,
    image: 'https://images.unsplash.com/photo-1491720731493-223f97d92c21?w=500',
    accent: 'gold',
    featured: true,
  },
  {
    id: 12,
    name: 'Fresh Milk 1L',
    price: 220,
    oldPrice: 260,
    category: 'Dairy',
    stock: 26,
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500',
    accent: 'gold',
    featured: true,
  },
  {
    id: 13,
    name: 'Atta 10kg',
    price: 1200,
    oldPrice: 1350,
    category: 'Flour',
    stock: 38,
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500',
    accent: 'rose',
    featured: true,
  },
  {
    id: 14,
    name: 'Moong Daal 1kg',
    price: 320,
    oldPrice: 380,
    category: 'Daal',
    stock: 42,
    image: 'https://plus.unsplash.com/premium_photo-1674025751520-01102eca6352?auto=format&fit=crop&w=500&q=80',
    featured: true,
  },
  {
    id: 15,
    name: 'Desi Ghee 1kg',
    price: 680,
    oldPrice: 750,
    category: 'Ghee',
    stock: 26,
    image: 'https://images.unsplash.com/photo-1573812461383-e5f8b759d12e?w=500',
    featured: true,
  },
  {
    id: 16,
    name: 'Red Chilli Powder 200g',
    price: 180,
    oldPrice: 210,
    category: 'Masala',
    stock: 38,
    image: 'https://images.unsplash.com/photo-1577563717655-919fc57789b4?w=500',
    featured: true,
  },
]

const productAliases = {
  "Lay's Chips": 'Lays Chips',
  'Lays Family Pack': 'Lays Chips',
}

const kurkureImage = 'https://images.unsplash.com/photo-1748765968965-7e18d4f7192b?w=500'

function App() {
  const [products, setProducts] = useState(defaultProducts)
  const [cart, setCart] = useState([])
  const [screen, setScreen] = useState('home')
  const [authMode, setAuthMode] = useState('owner')
  const [loginForm, setLoginForm] = useState({ email: 'admin@kiryana.pk', password: 'admin123' })
  const [registerForm, setRegisterForm] = useState({
    name: '',
    phone: '',
    storeName: '',
    email: '',
    password: '',
  })
  const [token, setToken] = useState(() => localStorage.getItem('kiryana-token') || '')
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('kiryana-user')
    return savedUser ? JSON.parse(savedUser) : null
  })
  const [dashboard, setDashboard] = useState(null)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    category: 'Snacks',
    stock: '20',
    oldPrice: '',
  })

  const featuredProducts = useMemo(
    () => products.filter((product) => product.featured),
    [products],
  )

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${apiBase}/api/products`)
      const data = await response.json()
      if (Array.isArray(data)) {
        const canonicalProductNames = new Set()
        const apiProducts = data.map((product) => {
          const price = Number(product.price ?? product.rate ?? 0)
          const oldPrice = Number(product.oldPrice ?? product.old_price ?? price)
          const canonicalName = productAliases[product.name] || product.name
          const canonicalProduct = defaultProducts.find((item) => item.name === canonicalName)

          return canonicalProduct
            ? { ...canonicalProduct, id: product.id, stock: Number(product.stock ?? canonicalProduct.stock) }
            : { ...product, price, oldPrice, featured: Boolean(product.featured) }
        }).filter((product) => {
          if (!defaultProducts.some((item) => item.name === product.name)) return true
          if (canonicalProductNames.has(product.name)) return false
          canonicalProductNames.add(product.name)
          return true
        })
        const extraProducts = defaultProducts.filter(
          (product) => !apiProducts.some((apiProduct) => apiProduct.name === product.name),
        )
        setProducts([...apiProducts, ...extraProducts])
      }
    } catch {
      setProducts(defaultProducts)
    }
  }

  const fetchDashboard = async () => {
    if (!token) return

    try {
      const response = await fetch(`${apiBase}/api/dashboard/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setDashboard(data)
      }
    } catch {
      setDashboard(null)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    fetchDashboard()
  }, [token])

  const handleAddToCart = (product) => {
    setCart((currentCart) => [...currentCart, product])
    setMessage(`Added to cart: ${product.name}`)
  }

  const saveSession = (userData, tokenValue) => {
    localStorage.setItem('kiryana-user', JSON.stringify(userData))
    localStorage.setItem('kiryana-token', tokenValue)
    setUser(userData)
    setToken(tokenValue)
  }

  const handleLogin = async (event) => {
    event.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch(`${apiBase}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: loginForm.email,
          password: loginForm.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Login failed')
      }

      saveSession(data.user, data.token)
      setMessage(`Welcome back, ${data.user.name}!`)
      setScreen(data.user.role === 'customer' ? 'home' : 'admin')
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (event) => {
    event.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch(`${apiBase}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: registerForm.name || registerForm.storeName || 'Customer',
          email: registerForm.email || `${registerForm.phone || 'customer'}@demo.pk`,
          phone: registerForm.phone,
          storeName: registerForm.storeName,
          password: registerForm.password,
          role: 'customer',
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed')
      }

      saveSession(data.user, data.token)
      setMessage('Registration successful. Your account is ready.')
      setScreen('home')
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAddProduct = async (event) => {
    event.preventDefault()
    if (!token) {
      setMessage('Please log in as admin first.')
      return
    }

    try {
      const response = await fetch(`${apiBase}/api/admin/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...newProduct,
          price: Number(newProduct.price),
          oldPrice: Number(newProduct.oldPrice || newProduct.price),
          stock: Number(newProduct.stock),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Unable to add product')
      }

      setNewProduct({ name: '', price: '', category: 'Snacks', stock: '20', oldPrice: '' })
      setMessage('Product added successfully.')
      fetchProducts()
      fetchDashboard()
    } catch (error) {
      setMessage(error.message)
    }
  }

  const logout = () => {
    localStorage.removeItem('kiryana-user')
    localStorage.removeItem('kiryana-token')
    setUser(null)
    setToken('')
    setScreen('home')
    setMessage('Logged out successfully.')
  }

  if (screen === 'admin' && user && user.role !== 'customer') {
    return (
      <div className="admin-shell">
        <aside className="admin-sidebar">
          <div className="brand-panel">
            <div className="brand-icon">🛒</div>
            <div>
              <h2>Malik Kiryana Store</h2>
            </div>
          </div>

          <nav className="admin-nav">
            <button className="nav-item active" type="button">Dashboard</button>
            <button className="nav-item" type="button" onClick={() => setScreen('home')}>Storefront</button>
            <button className="nav-item" type="button" onClick={logout}>Logout</button>
          </nav>
        </aside>

        <main className="admin-main">
          <header className="admin-topbar">
            <div>
              <p className="eyebrow">Overview</p>
              <h1>Admin Dashboard</h1>
            </div>
            <div className="user-pill">
              <span>{user.name}</span>
              <strong>{user.role}</strong>
            </div>
          </header>

          <section className="admin-stats">
            <div className="stats-card">
              <span>Total Orders</span>
              <strong>{dashboard?.totalOrders ?? 0}</strong>
            </div>
            <div className="stats-card accent">
              <span>Revenue</span>
              <strong>Rs {dashboard?.revenue ?? 0}</strong>
            </div>
            <div className="stats-card">
              <span>Products</span>
              <strong>{dashboard?.totalProducts ?? 0}</strong>
            </div>
            <div className="stats-card">
              <span>Active Users</span>
              <strong>{dashboard?.activeUsers ?? 0}</strong>
            </div>
          </section>

          <section className="admin-grid">
            <div className="panel form-panel">
              <h3>Add Product</h3>
              <form onSubmit={handleAddProduct} className="product-form">
                <input
                  value={newProduct.name}
                  onChange={(event) => setNewProduct({ ...newProduct, name: event.target.value })}
                  placeholder="Product name"
                />
                <div className="two-col">
                  <input
                    value={newProduct.price}
                    onChange={(event) => setNewProduct({ ...newProduct, price: event.target.value })}
                    placeholder="Price"
                    type="number"
                  />
                  <input
                    value={newProduct.oldPrice}
                    onChange={(event) => setNewProduct({ ...newProduct, oldPrice: event.target.value })}
                    placeholder="Old price"
                    type="number"
                  />
                </div>
                <div className="two-col">
                  <select
                    value={newProduct.category}
                    onChange={(event) => setNewProduct({ ...newProduct, category: event.target.value })}
                  >
                    <option>Snacks</option>
                    <option>Bakery</option>
                    <option>Biscuit</option>
                    <option>Drinks</option>
                    <option>Groceries</option>
                  </select>
                  <input
                    value={newProduct.stock}
                    onChange={(event) => setNewProduct({ ...newProduct, stock: event.target.value })}
                    placeholder="Stock"
                    type="number"
                  />
                </div>
                <button type="submit" className="primary-btn">Save Product</button>
              </form>
            </div>

            <div className="panel list-panel">
              <h3>Recent Orders</h3>
              <ul className="order-list">
                {(dashboard?.orders || []).map((order) => (
                  <li key={order.id}>
                    <div>
                      <strong>#{order.id}</strong>
                      <span>{order.customer}</span>
                    </div>
                    <span className="order-status">{order.status}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </main>
      </div>
    )
  }

  return (
    <div className="page-shell">
      <header className="top-header">
        <div className="brand-wrap">
          <div className="brand-icon">🛒</div>
          <div className="brand-copy">
            <h1>Malik Kiryana Store</h1>
            <p>Faisalabad • 304 • Clock Tower</p>
          </div>
        </div>

        <div className="search-box">
          <span>⌕</span>
          <input type="text" placeholder="Search ..." />
        </div>

        <div className="header-actions">
          <button type="button" className="icon-btn cart-btn" aria-label={`Cart, ${cart.length} items`}>
            <ShoppingBag size={19} aria-hidden="true" />
            <span className="cart-count">{cart.length}</span>
          </button>
          <button type="button" className="icon-btn" aria-label="Account"><User size={19} aria-hidden="true" /></button>
          {user && (
            <button type="button" className="user-tag" onClick={() => setScreen('admin')}>
              {user.name}
            </button>
          )}
        </div>
      </header>

      <main className="content-wrap">
        <section
          className="hero-panel w-full"
          style={{ backgroundImage: "url('/clocktower.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}
        >
          <div className="hero-overlay" aria-hidden="true" />
          <div className="hero-copy">
            <h2 className="text-white text-4xl font-bold">Assalamu Alaikum!</h2>
            <p className="highlight-line">Pakistan's largest B2G grocery marketplace</p>
            <p>Faisalabad's trusted B2B grocery marketplace</p>
            <p className="small-copy">Connecting Faisalabad's retailers to quality supplies</p>

            <div className="trust-row">
              <span><i className="trust-dot" aria-hidden="true" />Faisalabad</span>
              <span><i className="trust-dot" aria-hidden="true" />Trusted</span>
              <span><i className="trust-dot" aria-hidden="true" />100% Quality</span>
            </div>
          </div>

          <div className="auth-stack">
            <button
              type="button"
              className={`auth-card ${authMode === 'owner' ? 'active' : ''}`}
              onClick={() => setAuthMode('owner')}
            >
              <div className="avatar"><User size={24} aria-hidden="true" /></div>
              <span>Owner Login</span>
            </button>

            <button
              type="button"
              className={`auth-card ${authMode === 'customer' ? 'active' : ''}`}
              onClick={() => setAuthMode('customer')}
            >
              <div className="avatar"><User size={24} aria-hidden="true" /></div>
              <span>Customer Login</span>
            </button>
          </div>
        </section>

        <section className="feature-grid">
          <div className="panel login-panel">
            <h3><User size={20} aria-hidden="true" /> Owner</h3>
            <p>Owner Login</p>
            <form onSubmit={handleLogin} className="stack-form">
              <label>
                <span>Mobile Number</span>
                <input
                  type="text"
                  value={loginForm.email}
                  onChange={(event) => setLoginForm({ ...loginForm, email: event.target.value })}
                  placeholder="admin@kiryana.pk"
                />
              </label>
              <label>
                <span>Password</span>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(event) => setLoginForm({ ...loginForm, password: event.target.value })}
                  placeholder="••••••••"
                />
              </label>
              <button type="submit" className="primary-btn" disabled={loading}>
                {loading ? 'Signing in...' : 'Login'}
              </button>
              <button type="button" className="text-link">Forgot password?</button>
            </form>
          </div>

          <div className="panel registration-panel">
            <h3><User size={20} aria-hidden="true" /> Customer Registration</h3>
            <form onSubmit={handleRegister} className="stack-form">
              <label>
                <span>Name</span>
                <input
                  value={registerForm.name}
                  onChange={(event) => setRegisterForm({ ...registerForm, name: event.target.value })}
                  placeholder="Your Name"
                />
              </label>
              <label>
                <span>Mobile Number</span>
                <input
                  value={registerForm.phone}
                  onChange={(event) => setRegisterForm({ ...registerForm, phone: event.target.value })}
                  placeholder="92 3XX XXXXXXX"
                />
              </label>
              <label>
                <span>Store Name</span>
                <input
                  value={registerForm.storeName}
                  onChange={(event) => setRegisterForm({ ...registerForm, storeName: event.target.value })}
                  placeholder="Store Name"
                />
              </label>
              <label>
                <span>Password</span>
                <input
                  type="password"
                  value={registerForm.password}
                  onChange={(event) => setRegisterForm({ ...registerForm, password: event.target.value })}
                  placeholder="••••••••"
                />
              </label>
              <button type="submit" className="primary-btn" disabled={loading}>Register</button>
            </form>
          </div>

          <div className="panel supplier-panel hover:scale-105 transition-transform duration-300">
            <h3><ShieldCheck size={20} aria-hidden="true" /> Verified Supplier</h3>
            <div className="supplier-card">
              <div className="supplier-photo-wrap">
                <img src="/faizan.jpg" alt="Malik Faizan" className="w-16 h-16 rounded-full object-cover object-top border-2 border-green-500 hover:scale-105 transition-transform duration-300" />
                <span className="supplier-dot animate-pulse" aria-label="Verified online" />
              </div>
              <div className="supplier-info">
                <h4>Malik Faizan</h4>
                <p>Samundri</p>
              </div>
            </div>
            <div className="support-box">
              <span className="checkmark">✓</span>
              <div>
                <strong>Customer Support:</strong>
                <p>Our team is available: </p>
                <a href="tel:0800-12345">0800-12345</a>
                <a href="mailto:support@kiryana.pk">support@kiryana.pk</a>
              </div>
            </div>
            <a className="primary-btn small-btn chat-btn" href="https://wa.me/923001234567" target="_blank" rel="noreferrer">
              <Phone size={17} aria-hidden="true" /> Chat on WhatsApp
            </a>
          </div>
        </section>

        {message && <div className="notice-banner">{message}</div>}

        <section className="offer-section">
          <div className="offer-copy">
            <h3>Special Offer</h3>
            <h4>Up to 50% Discount</h4>
            <p>Biscuits, Snacks, and Groceries on Special Discount. Save now and take advantage today!</p>
            <button type="button" className="shop-btn">Shop Now</button>
          </div>
          <div className="product-showcase">
            <div className="pack pack-one">
              <img src={defaultProducts[2].image} alt="Lays Chips" />
            </div>
            <div className="pack pack-two">
              <img src={kurkureImage} alt="Kurkure snack packet" />
            </div>
            <div className="pack pack-three">
              <img src={defaultProducts[8].image} alt="Pepsi bottle" />
            </div>
          </div>
        </section>

        <section className="catalogue">
          <div className="catalogue-header">
            <div className="title-wrap">
              <span className="mini-icon">▣</span>
              <h3>Popular Products</h3>
            </div>
            <h4>Popular Products</h4>
          </div>

          <div className="product-grid">
            {featuredProducts.map((product) => (
              <article key={`${product.name}-${product.id}`} className="product-card">
                <div className="product-image-wrap">
                  <img src={product.image} alt={product.name} />
                </div>
                <div className="product-badges">
                  <span>-20%</span>
                </div>
                <div className="product-meta">
                  <span className="chip">{product.category}</span>
                  <h5>{product.name}</h5>
                  <div className="price-row">
                    <span className="price-current font-bold text-lg text-gray-900">
                      Rs. {product.price ?? product.rate ?? 0}
                    </span>
                    {(product.oldPrice ?? product.old_price) > (product.price ?? product.rate ?? 0) && (
                      <span className="price-old">
                        Rs. {product.oldPrice ?? product.old_price}
                      </span>
                    )}
                  </div>
                  <button type="button" className="add-btn" onClick={() => handleAddToCart(product)}>
                    <ShoppingCart size={17} aria-hidden="true" />
                    Add to Order
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="promo-banner">
          <div className="promo-copy">
            <h4>New Ramadan Pack 2025 - Upto 30% off</h4>
            <button type="button" className="secondary-btn">View Details</button>
          </div>
          <div className="promo-packs">
            <div className="mini-pack">
              <img src={defaultProducts[2].image} alt="Lays Chips" />
            </div>
            <div className="mini-pack">
              <img src={kurkureImage} alt="Kurkure snack packet" />
            </div>
            <div className="mini-pack">
              <img src={defaultProducts[1].image} alt="Oreo Biscuit" />
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-brand">
          <div className="brand-icon small">🛒</div>
          <div>
            <h4>Malik Kiryana Store</h4>
            <p>Pakistan's trusted B2B grocery marketplace</p>
            <p>Faisalabad</p>
            <p>+92 800 12345</p>
          </div>
        </div>

        <div className="footer-column">
          <h4>Company</h4>
          <ul>
            <li>About Us</li>
            <li>Careers</li>
            <li>Blog</li>
          </ul>
        </div>

        <div className="footer-column">
          <h4>Support</h4>
          <ul>
            <li>Contact Us</li>
            <li>Shipping Information</li>
            <li>Privacy Policy</li>
          </ul>
        </div>

        <div className="footer-column app-column">
          <h4>Download App</h4>
          <div className="store-badges">
            <span>Google Play</span>
            <span>App Store</span>
          </div>
          <p>Download our mobile app now.</p>
        </div>
      </footer>
    </div>
  )
}

export default App
