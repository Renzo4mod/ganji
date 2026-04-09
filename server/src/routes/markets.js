import express from 'express';
import jwt from 'jsonwebtoken';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'ksh-bets-secret-key';

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'No token' });
  
  try {
    const token = auth.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

router.get('/', (req, res) => {
  try {
    const { status, limit = 50 } = req.query;
    let query = 'SELECT m.*, u.username as creator_name FROM markets m JOIN users u ON m.creator_id = u.id';
    const params = [];
    
    if (status) {
      query += ' WHERE m.status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY m.created_at DESC LIMIT ?';
    params.push(parseInt(limit));
    
    const markets = req.db.prepare(query).all(...params);
    res.json({ markets });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', (req, res) => {
  try {
    const market = req.db.prepare(`
      SELECT m.*, u.username as creator_name,
        (SELECT SUM(amount) FROM bets WHERE market_id = m.id AND outcome = 'yes') as yes_volume,
        (SELECT SUM(amount) FROM bets WHERE market_id = m.id AND outcome = 'no') as no_volume,
        (SELECT COUNT(*) FROM bets WHERE market_id = m.id AND outcome = 'yes') as yes_bettors,
        (SELECT COUNT(*) FROM bets WHERE market_id = m.id AND outcome = 'no') as no_bettors
      FROM markets m 
      JOIN users u ON m.creator_id = u.id 
      WHERE m.id = ?
    `).get(req.params.id);
    
    if (!market) return res.status(404).json({ error: 'Market not found' });
    
    const totalPool = market.yes_pool + market.no_pool;
    market.yes_odds = totalPool > 0 ? (totalPool / (market.yes_pool || 1)).toFixed(2) : 1.00;
    market.no_odds = totalPool > 0 ? (totalPool / (market.no_pool || 1)).toFixed(2) : 1.00;
    
    res.json({ market });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', authMiddleware, (req, res) => {
  try {
    const { question, description, closes_at } = req.body;
    const fee_percentage = 10;
    
    if (!question) {
      return res.status(400).json({ error: 'Question required' });
    }

    const result = req.db.prepare(`
      INSERT INTO markets (creator_id, question, description, fee_percentage, closes_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(req.userId, question, description, fee_percentage, closes_at || null);

    const market = req.db.prepare('SELECT * FROM markets WHERE id = ?').get(result.lastInsertRowid);
    res.json({ market });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/resolve', authMiddleware, (req, res) => {
  try {
    const { resolution } = req.body;
    
    const market = req.db.prepare('SELECT * FROM markets WHERE id = ?').get(req.params.id);
    if (!market) return res.status(404).json({ error: 'Market not found' });
    
    if (market.creator_id !== req.userId) {
      return res.status(403).json({ error: 'Only creator can resolve market' });
    }
    
    if (market.status !== 'open') {
      return res.status(400).json({ error: 'Market already resolved' });
    }

    const winningOutcome = resolution === 1 ? 'yes' : 'no';
    const totalPool = market.yes_pool + market.no_pool;
    const totalFees = totalPool * (market.fee_percentage / 100);
    const payoutPool = totalPool - totalFees;

    const winningBets = req.db.prepare(`
      SELECT * FROM bets WHERE market_id = ? AND outcome = ?
    `).all(market.id, winningOutcome);

    const winningPool = winningOutcome === 'yes' ? market.yes_pool : market.no_pool;

    if (winningPool > 0) {
      for (const bet of winningBets) {
        const payout = bet.amount * (payoutPool / winningPool);
        req.db.prepare('UPDATE users SET balance = balance + ? WHERE id = ?')
          .run(payout, bet.user_id);
        
        req.db.prepare(`
          INSERT INTO transactions (user_id, type, amount, description)
          VALUES (?, 'win', ?, ?)
        `).run(bet.user_id, payout, `Won bet on: ${market.question}`);
      }
    }

    req.db.prepare(`
      UPDATE markets SET status = 'resolved', resolution = ? WHERE id = ?
    `).run(resolution, market.id);

    const creatorEarnings = totalFees;
    req.db.prepare('UPDATE users SET balance = balance + ? WHERE id = ?')
      .run(creatorEarnings, market.creator_id);
    
    req.db.prepare(`
      INSERT INTO transactions (user_id, type, amount, description)
      VALUES (?, 'fee_income', ?, ?)
    `).run(market.creator_id, creatorEarnings, `Fees from market: ${market.question}`);

    res.json({ message: 'Market resolved', resolution: winningOutcome });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
