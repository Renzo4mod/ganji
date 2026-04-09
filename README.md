# KSH Bets - Prediction Market

A Polymarket-style prediction market app using Kenyan Shilling (KSH) as currency. Market creators earn fees from bets placed on their markets.

## Quick Start

### Backend
```bash
cd server
npm install
npm run dev
```
Server runs on http://localhost:3001

### Frontend
```bash
cd client
npm install
npm run dev
```
App runs on http://localhost:3000

## Features

- **User Auth**: Register with 10,000 KSH demo balance
- **Create Markets**: Ask prediction questions with customizable fees (0-20%)
- **Place Bets**: Bet on YES/NO outcomes with dynamic odds
- **Creator Fees**: Market creators earn fees from all bets
- **Market Resolution**: Creators resolve markets when outcome is known

## How It Works

1. User creates a market (e.g., "Will it rain tomorrow?")
2. Others bet on YES or NO
3. Odds adjust based on betting volume
4. Creator resolves the market when the outcome is known
5. Winners split the pool (minus creator fees)
6. Creator receives their fee percentage

## Tech Stack

- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **Database**: SQLite
- **Auth**: JWT + bcrypt
