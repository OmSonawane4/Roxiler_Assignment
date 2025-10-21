/* Insert additional stores and ratings (idempotent by store name + owner email) */
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const EXTRA_STORES = [
  { name: 'Coffee Corner', description: 'Artisan coffee & cozy vibes', address: '5 Brew Lane, City', phone: '555-0208', email: 'hello@coffeecorner.com' },
  { name: 'Gamer Hub', description: 'Consoles, games and gear', address: '88 Pixel St, City', phone: '555-0106', email: 'support@gamerhub.com' },
  { name: 'Green Grocers', description: 'Fresh organic produce daily', address: '12 Market Road, City', phone: '555-0104', email: 'green@grocers.com' },
  { name: 'Fashion Boutique', description: 'Trendy fits you will love', address: '456 Fashion Ave, City', phone: '555-0102', email: 'fashion@store.com' },
  { name: 'Book Haven', description: 'Stories for every mood', address: '789 Book Lane, City', phone: '555-0103', email: 'books@store.com' }
];

// Ratings to add for customer1
const EXTRA_RATINGS = [
  { storeName: 'Coffee Corner', rating: 5, comment: 'Best latte in town!' },
  { storeName: 'Gamer Hub', rating: 4, comment: 'Great selection of games' },
  { storeName: 'Green Grocers', rating: 5, comment: 'Super fresh produce' },
  { storeName: 'Fashion Boutique', rating: 4, comment: 'Trendy and affordable' },
  { storeName: 'Book Haven', rating: 5, comment: 'Lovely staff and curation' }
];

(async () => {
  const { DB_HOST='localhost', DB_USER='root', DB_PASSWORD='', DB_NAME='store_rating_db', DB_PORT=3306 } = process.env;
  const conn = await mysql.createConnection({ host: DB_HOST, user: DB_USER, password: DB_PASSWORD, database: DB_NAME, port: DB_PORT });
  try {
    // Find owner id (seeded owner1)
    const [ownerRows] = await conn.execute('SELECT id FROM users WHERE email = ?', ['owner1@storeapp.com']);
    const ownerId = ownerRows[0]?.id || null;

    // Upsert stores by name (check existence by name)
    for (const s of EXTRA_STORES) {
      const [exists] = await conn.execute('SELECT id FROM stores WHERE name = ?', [s.name]);
      if (exists.length === 0) {
        await conn.execute(
          'INSERT INTO stores (name, description, address, phone, email, owner_id) VALUES (?, ?, ?, ?, ?, ?)',
          [s.name, s.description, s.address, s.phone, s.email, ownerId]
        );
        console.log(`Added store: ${s.name}`);
      } else {
        console.log(`Store exists, skipped: ${s.name}`);
      }
    }

    // Find customer id (seeded customer1)
    const [custRows] = await conn.execute('SELECT id FROM users WHERE email = ?', ['customer1@storeapp.com']);
    const customerId = custRows[0]?.id;

    if (customerId) {
      for (const r of EXTRA_RATINGS) {
        const [srows] = await conn.execute('SELECT id FROM stores WHERE name = ? LIMIT 1', [r.storeName]);
        const storeId = srows[0]?.id;
        if (!storeId) continue;
        await conn.execute(
          `INSERT INTO ratings (store_id, user_id, rating, comment)
           VALUES (?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE rating = VALUES(rating), comment = VALUES(comment), updated_at = CURRENT_TIMESTAMP`,
          [storeId, customerId, r.rating, r.comment]
        );
        console.log(`Rated ${r.storeName}: ${r.rating}★`);
      }
    }

    console.log('Extra seeding complete.');
  } catch (e) {
    console.error('Seeding more failed:', e.message);
    process.exitCode = 1;
  } finally {
    await conn.end();
  }
})();
