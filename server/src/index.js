import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { initDb, getDb } from './models/db.js';
import authRoutes from './routes/auth.js';
import marketRoutes from './routes/markets.js';
import betRoutes from './routes/bets.js';
import mpesaRoutes from './routes/mpesa.js';
import newsRoutes from './routes/news.js';
import polymarketRoutes from './routes/polymarket.js';
import cryptoRoutes from './routes/crypto.js';

const app = express();
const PORT = process.env.PORT || 3001;

console.log('Starting server...');
console.log('DATABASE_URL set:', !!process.env.DATABASE_URL);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

await initDb();

const db = getDb();
console.log('Checking markets...');
try {
  const existing = await db.prepare('SELECT COUNT(*) as count FROM markets').get();
  console.log('Market count:', existing?.count || 0);
  
  if (!existing || existing.count === 0) {
    const users = await db.prepare('SELECT COUNT(*) as count FROM users').get();
    console.log('User count:', users?.count || 0);
    
    if (!users || users.count === 0) {
      console.log('Creating default user...');
      await db.prepare(`INSERT INTO users (username, email, password_hash, balance) VALUES ('admin', 'admin@ganji.ke', 'demo', 100000)`).run();
    }
    
    console.log('Seeding markets...');
    const { default: seedMarkets } = await import('./seed-markets.js');
    await seedMarkets();
  }
} catch (err) {
  console.error('Error checking markets:', err.message);
}

try {
  const { default: seedCryptoMarkets } = await import('./seed-crypto.js');
  await seedCryptoMarkets();
} catch (err) {
  console.error('Error seeding crypto markets:', err);
}

app.use((req, res, next) => {
  req.db = getDb();
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/markets', marketRoutes);
app.use('/api/bets', betRoutes);
app.use('/api/mpesa', mpesaRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/polymarket', polymarketRoutes);
app.use('/api/crypto', cryptoRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});