import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL not set!');
  process.exit(1);
}

const pool = new Pool({
  connectionString: connectionString,
  ssl: { rejectUnauthorized: false }
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

async function initDb() {
  const client = await pool.connect();
  
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        balance REAL DEFAULT 10000,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS markets (
        id SERIAL PRIMARY KEY,
        creator_id INTEGER NOT NULL,
        question TEXT NOT NULL,
        description TEXT,
        category TEXT DEFAULT 'international',
        fee_percentage REAL DEFAULT 10,
        yes_pool REAL DEFAULT 0,
        no_pool REAL DEFAULT 0,
        status TEXT DEFAULT 'open',
        resolution INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        closes_at TIMESTAMP,
        FOREIGN KEY (creator_id) REFERENCES users(id)
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS bets (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        market_id INTEGER NOT NULL,
        amount REAL NOT NULL,
        outcome TEXT NOT NULL,
        odds REAL NOT NULL,
        fee REAL NOT NULL,
        potential_payout REAL NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (market_id) REFERENCES markets(id)
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        type TEXT NOT NULL,
        amount REAL NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS mpesa_transactions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        type TEXT NOT NULL,
        amount REAL NOT NULL,
        phone TEXT,
        status TEXT DEFAULT 'pending',
        reference TEXT,
        checkout_request_id TEXT,
        mpesa_receipt TEXT,
        mpesa_response TEXT,
        error_message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    console.log('Database tables created successfully');
  } finally {
    client.release();
  }
}

function getDb() {
  return {
    prepare: (sql) => ({
      run: (...params) => pool.query(sql, params),
      get: async (...params) => {
        const result = await pool.query(sql, params);
        return result.rows[0] || null;
      },
      all: async (...params) => {
        const result = await pool.query(sql, params);
        return result.rows;
      }
    })
  };
}

export { initDb, getDb, pool };
export default { get: getDb };