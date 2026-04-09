import express from 'express';
import cors from 'cors';
import { initDb, getDb } from './models/db.js';
import authRoutes from './routes/auth.js';
import marketRoutes from './routes/markets.js';
import betRoutes from './routes/bets.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

await initDb();

app.use((req, res, next) => {
  req.db = getDb();
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/markets', marketRoutes);
app.use('/api/bets', betRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
