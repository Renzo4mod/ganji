import { getDb } from './models/db.js';

const cryptoMarkets = [
  {
    question: "Bitcoin price above $100,000 in the next hour?",
    description: "Will BTC reach above $100,000 within the next 60 minutes?",
    category: "crypto",
    closes_at: getFutureTime(60),
    timer_minutes: 60
  },
  {
    question: "Bitcoin price above $95,000 in the next 30 minutes?",
    description: "Will BTC reach above $95,000 within the next 30 minutes?",
    category: "crypto",
    closes_at: getFutureTime(30),
    timer_minutes: 30
  },
  {
    question: "Bitcoin price above $90,000 in the next 15 minutes?",
    description: "Will BTC reach above $90,000 within the next 15 minutes?",
    category: "crypto",
    closes_at: getFutureTime(15),
    timer_minutes: 15
  },
  {
    question: "Bitcoin price above $85,000 in the next 5 minutes?",
    description: "Will BTC reach above $85,000 within the next 5 minutes?",
    category: "crypto",
    closes_at: getFutureTime(5),
    timer_minutes: 5
  },
  {
    question: "Bitcoin price moves more than 1% in next 1 minute?",
    description: "Will Bitcoin price change by more than 1% (up or down) in the next 60 seconds?",
    category: "crypto",
    closes_at: getFutureTime(1),
    timer_minutes: 1
  },
  {
    question: "Ethereum price above $3,500 in the next hour?",
    description: "Will ETH reach above $3,500 within the next 60 minutes?",
    category: "crypto",
    closes_at: getFutureTime(60),
    timer_minutes: 60
  },
  {
    question: "Ethereum price above $3,000 in the next 30 minutes?",
    description: "Will ETH reach above $3,000 within the next 30 minutes?",
    category: "crypto",
    closes_at: getFutureTime(30),
    timer_minutes: 30
  },
  {
    question: "Solana price above $200 in the next hour?",
    description: "Will SOL reach above $200 within the next 60 minutes?",
    category: "crypto",
    closes_at: getFutureTime(60),
    timer_minutes: 60
  },
  {
    question: "Bitcoin reaches new all-time high in next hour?",
    description: "Will Bitcoin set a new all-time price high within the next 60 minutes?",
    category: "crypto",
    closes_at: getFutureTime(60),
    timer_minutes: 60
  },
  {
    question: "Bitcoin drops below $80,000 in next 15 minutes?",
    description: "Will Bitcoin fall below $80,000 within the next 15 minutes?",
    category: "crypto",
    closes_at: getFutureTime(15),
    timer_minutes: 15
  }
];

function getFutureTime(minutes) {
  const date = new Date();
  date.setMinutes(date.getMinutes() + minutes);
  return date.toISOString().slice(0, 16);
}

async async function seedCryptoMarkets() {
  const db = getDb();
  
  const existing = await db.prepare('SELECT COUNT(*) as count FROM markets WHERE category = ?').get('crypto');
  if (existing.count > 0) {
    console.log(`Database already has ${existing.count} crypto markets. Skipping.`);
    return;
  }

  const user = await db.prepare('SELECT id FROM users ORDER BY id ASC LIMIT 1').get();
  const creatorId = user?.id || 1;

  for (const market of cryptoMarkets) {
    await db.prepare(`
      INSERT INTO markets (creator_id, question, description, category, fee_percentage, closes_at)
      VALUES (?, ?, ?, ?, 10, ?)
    `).run(creatorId, market.question, market.description, market.category, market.closes_at);
  }

  console.log(`Created ${cryptoMarkets.length} crypto markets!`);
}

export default seedCryptoMarkets;