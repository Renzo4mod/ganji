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

router.post('/', authMiddleware, (req, res) => {
  try {
    const { market_id, amount, outcome } = req.body;
    
    if (!market_id || !amount || !outcome) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    if (amount < 10 || amount > 500000) {
      return res.status(400).json({ error: 'Bet amount must be between 10 and 500,000 KSH' });
    }
    
    if (!['yes', 'no'].includes(outcome)) {
      return res.status(400).json({ error: 'Outcome must be yes or no' });
    }

    const user = req.db.prepare('SELECT * FROM users WHERE id = ?').get(req.userId);
    if (user.balance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    const market = req.db.prepare('SELECT * FROM markets WHERE id = ?').get(market_id);
    if (!market) return res.status(404).json({ error: 'Market not found' });
    
    if (market.status !== 'open') {
      return res.status(400).json({ error: 'Market is closed' });
    }

    const fee = amount * (market.fee_percentage / 100);
    const betAmount = amount - fee;
    
    const totalPool = market.yes_pool + market.no_pool + betAmount;
    const poolForOutcome = outcome === 'yes' ? market.yes_pool + betAmount : market.no_pool + betAmount;
    const odds = totalPool / poolForOutcome;
    const potentialPayout = betAmount * odds;

    const updatePool = outcome === 'yes' ? 'yes_pool' : 'no_pool';
    req.db.prepare(`UPDATE markets SET ${updatePool} = ${updatePool} + ? WHERE id = ?`)
      .run(betAmount, market_id);

    req.db.prepare(`
      INSERT INTO bets (user_id, market_id, amount, outcome, odds, fee, potential_payout)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(req.userId, market_id, amount, outcome, odds, fee, potentialPayout);

    req.db.prepare('UPDATE users SET balance = balance - ? WHERE id = ?')
      .run(amount, req.userId);

    req.db.prepare(`
      INSERT INTO transactions (user_id, type, amount, description)
      VALUES (?, 'bet', ?, ?)
    `).run(req.userId, -amount, `Bet on: ${market.question}`);

    const updatedUser = req.db.prepare('SELECT balance FROM users WHERE id = ?').get(req.userId);
    
    res.json({ 
      message: 'Bet placed',
      bet: { amount, outcome, odds, fee, potential_payout: potentialPayout },
      new_balance: updatedUser.balance
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/history', authMiddleware, (req, res) => {
  try {
    const bets = req.db.prepare(`
      SELECT b.*, m.question as market_question, m.status as market_status, m.resolution
      FROM bets b
      JOIN markets m ON b.market_id = m.id
      WHERE b.user_id = ?
      ORDER BY b.created_at DESC
    `).all(req.userId);
    
    res.json({ bets });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
