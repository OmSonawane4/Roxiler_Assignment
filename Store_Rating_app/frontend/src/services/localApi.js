const STORAGE_KEYS = {
  users: 'sr_users',
  stores: 'sr_stores',
  ratings: 'sr_ratings'
}

const read = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

const write = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value))
}

export const initSeed = () => {
  if (!read(STORAGE_KEYS.users)) {
    const users = [
      { id: 1, name: 'Admin User', email: 'admin@storeapp.com', address: 'HQ, City', role: 'admin', password: 'password' },
      { id: 2, name: 'Jane Smith', email: 'owner@storeapp.com', address: '456 Oak Ave, City', role: 'store_owner', rating: 4.4, password: 'password' },
      { id: 3, name: 'Customer One', email: 'customer@storeapp.com', address: '123 Main St, City', role: 'customer', password: 'password' }
    ]
    write(STORAGE_KEYS.users, users)
  }
  if (!read(STORAGE_KEYS.stores)) {
    const stores = [
      { id: 1, name: 'Tech Store', email: 'tech@store.com', address: '123 Tech Street, City', rating: 4.5, reviews: 12, owner: 'Jane Smith' },
      { id: 2, name: 'Fashion Boutique', email: 'fashion@store.com', address: '456 Fashion Ave, City', rating: 4.2, reviews: 8, owner: 'Sarah Wilson' },
      { id: 3, name: 'Book Store', email: 'books@store.com', address: '789 Book Lane, City', rating: 4.8, reviews: 15, owner: 'Jane Smith' },
      { id: 4, name: 'Green Grocers', email: 'green@grocers.com', address: '12 Market Road, City', rating: 4.4, reviews: 23, owner: 'Jane Smith' },
      { id: 5, name: 'Pet Paradise', email: 'hello@petparadise.com', address: '77 Paws Ave, City', rating: 4.1, reviews: 11, owner: 'Sarah Wilson' },
      { id: 6, name: 'Gamer Hub', email: 'support@gamerhub.com', address: '88 Pixel St, City', rating: 4.7, reviews: 30, owner: 'Jane Smith' },
      { id: 7, name: 'Home & Living', email: 'care@homeandliving.com', address: '19 Cozy Blvd, City', rating: 4.0, reviews: 9, owner: 'Sarah Wilson' },
      { id: 8, name: 'Coffee Corner', email: 'hello@coffeecorner.com', address: '5 Brew Lane, City', rating: 4.6, reviews: 42, owner: 'Jane Smith' },
      { id: 9, name: 'Fit Factory', email: 'team@fitfactory.com', address: '33 Sprint Rd, City', rating: 4.3, reviews: 18, owner: 'Sarah Wilson' },
      { id: 10, name: 'Art House', email: 'info@arthouse.com', address: '21 Canvas Ct, City', rating: 4.9, reviews: 7, owner: 'Jane Smith' }
    ]
    write(STORAGE_KEYS.stores, stores)
  }
  if (!read(STORAGE_KEYS.ratings)) {
    const ratings = [
      { id: 1, storeId: 1, userId: 3, rating: 5, comment: 'Great!' },
      { id: 2, storeId: 1, userId: 3, rating: 4, comment: 'Nice staff' },
      { id: 3, storeId: 2, userId: 3, rating: 4, comment: 'Good quality' }
    ]
    write(STORAGE_KEYS.ratings, ratings)
  }
}

export const api = {
  // Users
  listUsers() {
    return read(STORAGE_KEYS.users, [])
  },
  addUser(user) {
    const users = read(STORAGE_KEYS.users, [])
    const newUser = { id: Date.now(), ...user }
    users.push(newUser)
    write(STORAGE_KEYS.users, users)
    return newUser
  },
  authenticate(email, password) {
    const users = read(STORAGE_KEYS.users, [])
    const user = users.find(u => u.email?.toLowerCase() === String(email).toLowerCase() && u.password === password)
    if (!user) return null
    const { password: _pw, ...safeUser } = user
    return safeUser
  },
  updateUser(id, data) {
    const users = read(STORAGE_KEYS.users, [])
    const updated = users.map(u => u.id === id ? { ...u, ...data } : u)
    write(STORAGE_KEYS.users, updated)
    return updated.find(u => u.id === id)
  },
  deleteUser(id) {
    const users = read(STORAGE_KEYS.users, [])
    const filtered = users.filter(u => u.id !== id)
    write(STORAGE_KEYS.users, filtered)
  },

  // Stores
  listStores() {
    return read(STORAGE_KEYS.stores, [])
  },
  addStore(store) {
    const stores = read(STORAGE_KEYS.stores, [])
    const newStore = { id: Date.now(), rating: 0, reviews: 0, ...store }
    stores.push(newStore)
    write(STORAGE_KEYS.stores, stores)
    return newStore
  },
  updateStore(id, data) {
    const stores = read(STORAGE_KEYS.stores, [])
    const updated = stores.map(s => s.id === id ? { ...s, ...data } : s)
    write(STORAGE_KEYS.stores, updated)
    return updated.find(s => s.id === id)
  },
  deleteStore(id) {
    const stores = read(STORAGE_KEYS.stores, [])
    const filtered = stores.filter(s => s.id !== id)
    write(STORAGE_KEYS.stores, filtered)
  },

  // Ratings
  listRatings() {
    return read(STORAGE_KEYS.ratings, [])
  },
  listRatingsByStore(storeId) {
    const ratings = read(STORAGE_KEYS.ratings, [])
    return ratings.filter(r => r.storeId === storeId)
  },
  getUserRatingForStore(storeId, userId) {
    const ratings = read(STORAGE_KEYS.ratings, [])
    return ratings.find(r => r.storeId === storeId && r.userId === userId) || null
  },
  upsertRating({ storeId, userId, rating, comment }) {
    const ratings = read(STORAGE_KEYS.ratings, [])
    const existingIdx = ratings.findIndex(r => r.storeId === storeId && r.userId === userId)
    if (existingIdx >= 0) {
      ratings[existingIdx] = { ...ratings[existingIdx], rating, comment }
    } else {
      ratings.push({ id: Date.now(), storeId, userId, rating, comment })
    }
    write(STORAGE_KEYS.ratings, ratings)
    // update aggregates
    const stores = read(STORAGE_KEYS.stores, [])
    const store = stores.find(s => s.id === storeId)
    if (store) {
      const storeRatings = ratings.filter(r => r.storeId === storeId)
      const avg = (storeRatings.reduce((s, r) => s + r.rating, 0) / storeRatings.length).toFixed(1)
      store.reviews = storeRatings.length
      store.rating = Number(avg)
      write(STORAGE_KEYS.stores, stores)
    }
  },
  addRating({ storeId, userId, rating, comment }) {
    const ratings = read(STORAGE_KEYS.ratings, [])
    const stores = read(STORAGE_KEYS.stores, [])
    const newRating = { id: Date.now(), storeId, userId, rating, comment }
    ratings.push(newRating)
    write(STORAGE_KEYS.ratings, ratings)
    // update store aggregates
    const store = stores.find(s => s.id === storeId)
    if (store) {
      const storeRatings = ratings.filter(r => r.storeId === storeId)
      const avg = (storeRatings.reduce((s, r) => s + r.rating, 0) / storeRatings.length).toFixed(1)
      store.reviews = storeRatings.length
      store.rating = Number(avg)
      write(STORAGE_KEYS.stores, stores)
    }
    return newRating
  }
}


