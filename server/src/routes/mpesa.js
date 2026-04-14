import express from 'express';
import jwt from 'jsonwebtoken';
import { getDb } from '../models/db.js';
import { stkPush, queryTransaction, b2cPayment } from '../services/mpesa.js';

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

router.post('/deposit', authMiddleware, async (req, res) => {
  try {
    const { phone, amount } = req.body;
    
    if (!phone || !amount) {
      return res.status(400).json({ error: 'Phone and amount required' });
    }
    
    if (amount < 10) {
      return res.status(400).json({ error: 'Minimum deposit is 10 KSH' });
    }
    
    if (amount > 150000) {
      return res.status(400).json({ error: 'Maximum deposit is 150,000 KSH' });
    }
    
    let cleanPhone = phone.replace(/\s/g, '');
    if (cleanPhone.startsWith('254')) {
      cleanPhone = cleanPhone;
    } else if (cleanPhone.startsWith('0')) {
      cleanPhone = '254' + cleanPhone.substring(1);
    } else {
      cleanPhone = '254' + cleanPhone;
    }
    if (!cleanPhone.match(/^254[0-9]{9}$/)) {
      return res.status(400).json({ error: 'Invalid phone number. Use 07xxxxxxxx or 712xxxxxx' });
    }
    
    const orderId = `KSH-${req.userId}-${Date.now()}`;
    
    req.db.prepare(`
      INSERT INTO mpesa_transactions (user_id, type, amount, phone, status, reference, created_at)
      VALUES (?, 'deposit', ?, ?, 'pending', ?, datetime('now'))
    `).run(req.userId, amount, phone, orderId);
    
    const mpesaResponse = await stkPush(cleanPhone, amount, orderId);
    
    if (mpesaResponse.ResponseCode === '0') {
      req.db.prepare(`
        UPDATE mpesa_transactions SET checkout_request_id = ?, mpesa_response = ? WHERE reference = ?
      `).run(mpesaResponse.CheckoutRequestID, JSON.stringify(mpesaResponse), orderId);
      
      res.json({
        success: true,
        message: 'STK Push sent to your phone',
        checkoutRequestId: mpesaResponse.CheckoutRequestID,
        orderId: orderId
      });
    } else {
      req.db.prepare(`UPDATE mpesa_transactions SET status = 'failed', error_message = ? WHERE reference = ?`)
        .run(mpesaResponse.ResponseDescription, orderId);
      
      res.status(400).json({
        error: mpesaResponse.ResponseDescription || 'Failed to initiate payment'
      });
    }
  } catch (error) {
    console.error('M-Pesa deposit error:', error);
    res.status(500).json({ error: 'Payment processing failed' });
  }
});

router.post('/callback', (req, res) => {
  const db = getDb();
  const { Body } = req.body;
  
  if (!Body || !Body.stkCallback) {
    return res.status(400).json({ error: 'Invalid callback' });
  }
  
  const callback = Body.stkCallback;
  const resultCode = callback.ResultCode;
  const checkoutRequestId = callback.CheckoutRequestID;
  const reference = callback.Reference;
  
  if (resultCode === 0) {
    const items = callback.CallbackMetadata?.Item || [];
    const amount = items.find(i => i.Name === 'Amount')?.Value;
    const receipt = items.find(i => i.Name === 'MpesaReceiptNumber')?.Value;
    const phone = items.find(i => i.Name === 'PhoneNumber')?.Value;
    const transactionDate = items.find(i => i.Name === 'TransactionDate')?.Value;
    
    db.prepare(`
      UPDATE mpesa_transactions 
      SET status = 'completed', 
          mpesa_receipt = ?, 
          completed_at = datetime('now')
      WHERE reference = ? AND type = 'deposit'
    `).run(receipt, reference);
    
    if (amount) {
      const tx = db.prepare(`SELECT user_id FROM mpesa_transactions WHERE reference = ?`).get(reference);
      if (tx) {
        db.prepare('UPDATE users SET balance = balance + ? WHERE id = ?').run(amount, tx.user_id);
        
        db.prepare(`
          INSERT INTO transactions (user_id, type, amount, description)
          VALUES (?, 'deposit', ?, ?)
        `).run(tx.user_id, amount, `M-Pesa deposit: ${receipt}`);
      }
    }
  } else {
    db.prepare(`
      UPDATE mpesa_transactions 
      SET status = 'failed', error_message = ?
      WHERE checkout_request_id = ? OR reference = ?
    `).run(callback.ResultDesc, checkoutRequestId, reference);
  }
  
  res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
});

router.post('/b2c-callback/result', (req, res) => {
  const db = getDb();
  const { Body } = req.body;
  
  if (!Body || !Body.B2CResults) {
    return res.status(400).json({ error: 'Invalid callback' });
  }
  
  const result = Body.B2CResults;
  const output = result.Result?.OutputResponseParameters;
  const reference = output?.ParameterValue;
  
  if (result.ResultCode === 0) {
    db.prepare(`
      UPDATE mpesa_transactions SET status = 'completed', completed_at = datetime('now') WHERE reference = ?
    `).run(reference);
  } else {
    db.prepare(`
      UPDATE mpesa_transactions 
      SET status = 'failed', error_message = ? 
      WHERE reference = ?
    `).run(result.Result?.ResultDesc, reference);
    
    const tx = db.prepare(`SELECT user_id, amount FROM mpesa_transactions WHERE reference = ?`).get(reference);
    if (tx) {
      db.prepare('UPDATE users SET balance = balance + ? WHERE id = ?').run(tx.amount, tx.user_id);
    }
  }
  
  res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
});

router.post('/b2c-callback/timeout', (req, res) => {
  console.log('B2C Timeout:', req.body);
  res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
});

router.post('/withdraw', authMiddleware, async (req, res) => {
  try {
    const { phone, amount } = req.body;
    
    if (!phone || !amount) {
      return res.status(400).json({ error: 'Phone and amount required' });
    }
    
    if (amount < 50) {
      return res.status(400).json({ error: 'Minimum withdrawal is 50 KSH' });
    }
    
    if (amount > 70000) {
      return res.status(400).json({ error: 'Maximum withdrawal is 70,000 KSH per transaction' });
    }
    
    let cleanPhone = phone.replace(/\s/g, '');
    if (cleanPhone.startsWith('254')) {
      cleanPhone = cleanPhone;
    } else if (cleanPhone.startsWith('0')) {
      cleanPhone = '254' + cleanPhone.substring(1);
    } else {
      cleanPhone = '254' + cleanPhone;
    }
    if (!cleanPhone.match(/^254[0-9]{9}$/)) {
      return res.status(400).json({ error: 'Invalid phone number. Use 07xxxxxxxx or 712xxxxxx' });
    }
    
    const user = req.db.prepare('SELECT * FROM users WHERE id = ?').get(req.userId);
    if (user.balance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }
    
    req.db.prepare('UPDATE users SET balance = balance - ? WHERE id = ?').run(amount, req.userId);
    
    const reference = `WDL-${req.userId}-${Date.now()}`;
    
    req.db.prepare(`
      INSERT INTO mpesa_transactions (user_id, type, amount, phone, status, reference, created_at)
      VALUES (?, 'withdrawal', ?, ?, 'processing', ?, datetime('now'))
    `).run(req.userId, amount, phone, reference);
    
    req.db.prepare(`
      INSERT INTO transactions (user_id, type, amount, description)
      VALUES (?, 'withdrawal_pending', ?, ?)
    `).run(req.userId, -amount, `Withdrawal request: ${reference}`);
    
    try {
      const mpesaResponse = await b2cPayment(cleanPhone, amount, reference);
      
      if (mpesaResponse.ResponseCode === '0') {
        res.json({
          success: true,
          message: 'Withdrawal initiated',
          conversationId: mpesaResponse.ConversationID,
          reference: reference
        });
      } else {
        req.db.prepare('UPDATE users SET balance = balance + ? WHERE id = ?').run(amount, req.userId);
        req.db.prepare(`UPDATE mpesa_transactions SET status = 'failed', error_message = ? WHERE reference = ?`)
          .run(mpesaResponse.ResponseDescription, reference);
        req.db.prepare(`UPDATE transactions SET description = ? WHERE description LIKE ?`)
          .run(`Withdrawal failed: ${mpesaResponse.ResponseDescription}`, `%${reference}%`);
        
        res.status(400).json({
          error: mpesaResponse.ResponseDescription || 'Failed to initiate withdrawal'
        });
      }
    } catch (mpesaError) {
      req.db.prepare('UPDATE users SET balance = balance + ? WHERE id = ?').run(amount, req.userId);
      req.db.prepare(`UPDATE mpesa_transactions SET status = 'failed', error_message = ? WHERE reference = ?`)
        .run(mpesaError.message, reference);
      
      res.status(500).json({ error: 'M-Pesa service unavailable' });
    }
  } catch (error) {
    console.error('Withdrawal error:', error);
    res.status(500).json({ error: 'Withdrawal failed' });
  }
});

router.get('/status/:checkoutRequestId', authMiddleware, async (req, res) => {
  try {
    const { checkoutRequestId } = req.params;
    
    const transaction = req.db.prepare(`
      SELECT * FROM mpesa_transactions WHERE checkout_request_id = ? AND user_id = ?
    `).get(checkoutRequestId, req.userId);
    
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    if (transaction.status === 'completed') {
      return res.json({
        status: 'completed',
        receipt: transaction.mpesa_receipt,
        message: 'Payment successful'
      });
    }
    
    if (transaction.status === 'failed') {
      return res.json({
        status: 'failed',
        message: transaction.error_message || 'Payment failed'
      });
    }
    
    const mpesaResult = await queryTransaction(checkoutRequestId);
    
    if (mpesaResult.ResultCode === '0') {
      return res.json({
        status: 'completed',
        receipt: mpesaResult.ResultCode,
        message: 'Payment successful'
      });
    } else if (mpesaResult.ResultCode === '1037') {
      return res.json({
        status: 'pending',
        message: 'Waiting for customer confirmation'
      });
    } else if (mpesaResult.ResultCode === '1') {
      return res.json({
        status: 'failed',
        message: mpesaResult.ResultDesc
      });
    }
    
    res.json({
      status: transaction.status,
      message: 'Processing...'
    });
  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({ error: 'Status check failed' });
  }
});

router.get('/history', authMiddleware, (req, res) => {
  try {
    const transactions = req.db.prepare(`
      SELECT * FROM mpesa_transactions 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT 50
    `).all(req.userId);
    
    res.json({ transactions });
  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

export default router;
