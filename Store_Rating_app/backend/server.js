const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { promisePool } = require('./config/database');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Store Rating API Server is running!',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      stores: '/api/stores',
      ratings: '/api/ratings',
      admin: '/api/admin'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Helper to wrap async route handlers
const asyncH = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// GET /api/stores -> list stores with avg rating and reviews count
app.get('/api/stores', asyncH(async (req, res) => {
  const [rows] = await promisePool.query(
    `SELECT s.id, s.name, s.description, s.address, s.phone, s.email, s.owner_id,
            COALESCE(ROUND(AVG(r.rating), 1), 0) AS rating,
            COUNT(r.id) AS reviews
     FROM stores s
     LEFT JOIN ratings r ON r.store_id = s.id
     GROUP BY s.id
     ORDER BY s.name ASC`
  );
  res.json(rows);
}));

// POST /api/stores -> add store
app.post('/api/stores', asyncH(async (req, res) => {
  const { name, description = null, address = null, phone = null, email = null, owner_id = null } = req.body || {};
  if (!name) return res.status(400).json({ message: 'Name is required' });
  const [result] = await promisePool.query(
    'INSERT INTO stores (name, description, address, phone, email, owner_id) VALUES (?, ?, ?, ?, ?, ?)',
    [name, description, address, phone, email, owner_id]
  );
  res.status(201).json({ id: result.insertId, name, description, address, phone, email, owner_id });
}));

// DELETE /api/stores/:id -> delete store
app.delete('/api/stores/:id', asyncH(async (req, res) => {
  const { id } = req.params;
  await promisePool.query('DELETE FROM stores WHERE id = ?', [id]);
  res.json({ success: true });
}));

// GET /api/stores/:id/ratings -> list ratings for a store; if userId provided, return the user's rating
app.get('/api/stores/:id/ratings', asyncH(async (req, res) => {
  const { id } = req.params;
  const { userId } = req.query;
  if (userId) {
    const [rows] = await promisePool.query('SELECT * FROM ratings WHERE store_id = ? AND user_id = ? LIMIT 1', [id, userId]);
    return res.json(rows[0] || null);
  }
  const [rows] = await promisePool.query('SELECT * FROM ratings WHERE store_id = ?', [id]);
  res.json(rows);
}));

// POST /api/ratings/upsert -> upsert rating for a user+store
app.post('/api/ratings/upsert', asyncH(async (req, res) => {
  const { store_id, user_id, rating, comment = null } = req.body || {};
  if (!store_id || !user_id || !rating) return res.status(400).json({ message: 'store_id, user_id, rating are required' });
  await promisePool.query(
    `INSERT INTO ratings (store_id, user_id, rating, comment)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE rating = VALUES(rating), comment = VALUES(comment), updated_at = CURRENT_TIMESTAMP`,
    [store_id, user_id, rating, comment]
  );
  res.json({ success: true });
}));

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
});

module.exports = app;
