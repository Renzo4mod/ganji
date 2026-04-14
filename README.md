# GANJI - Prediction Market

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
- **M-Pesa Payments**: Deposit and withdraw real money via Safaricom M-Pesa

## How It Works

1. User creates a market (e.g., "Will it rain tomorrow?")
2. Others bet on YES or NO
3. Odds adjust based on betting volume
4. Creator resolves the market when the outcome is known
5. Winners split the pool (minus creator fees)
6. Creator receives their fee percentage

## M-Pesa Integration

The app supports real M-Pesa payments for deposits and withdrawals.

### M-Pesa APIs Required

1. **M-Pesa Express (STK Push)** - For deposits
   - Endpoint: `POST /mpesa/stkpush/v1/processrequest`
   - Query: `POST /mpesa/stkpushquery/v1/query`

2. **B2C (Business to Customer)** - For withdrawals
   - Endpoint: `POST /mpesa/b2b.v1/paymentrequest`

### Setup for M-Pesa

1. **Get Safaricom Daraja API Credentials**
   - Go to [Safaricom Developer Portal](https://developer.safaricom.co.ke)
   - Create an account or login
   - Create a new app to get Consumer Key and Consumer Secret

2. **Configure Environment Variables**
   
   Copy `.env.example` to `.env` and fill in your credentials:
   ```env
   MPESA_CONSUMER_KEY=your_consumer_key
   MPESA_CONSUMER_SECRET=your_consumer_secret
   MPESA_SHORTCODE=174379
   MPESA_PASSKEY=your_passkey
   MPESA_CALLBACK_URL=https://your-domain/api/mpesa/callback
   MPESA_B2C_CALLBACK_URL=https://your-domain/api/mpesa/b2c-callback
   JWT_SECRET=your_jwt_secret
   ```

3. **For Local Development**
   - Use ngrok to expose your local server: `ngrok http 3001`
   - Update callback URLs to your ngrok URL
   - Use sandbox mode (default)

4. **For Production**
   - Get a valid SSL certificate
   - Update callback URLs to your production domain
   - Change base URL in mpesa.js to production

### M-Pesa Features

- **Deposits**: STK Push (Lipa na M-Pesa Online) - Min: 10 KSH, Max: 150,000 KSH
- **Withdrawals**: B2C (Business to Customer) - Min: 50 KSH, Max: 70,000 KSH
- **Real-time**: Status polling for instant confirmations

## Tech Stack

- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **Database**: SQLite
- **Auth**: JWT + bcrypt
- **Payments**: Safaricom M-Pesa Daraja API
