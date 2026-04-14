import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Withdraw() {
  const { user, updateBalance } = useAuth();
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const quickAmounts = [100, 500, 1000, 2000, 5000];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    const numAmount = parseInt(amount);
    if (isNaN(numAmount) || numAmount < 50) {
      setError('Minimum withdrawal is 50 KSH');
      return;
    }
    
    if (numAmount > 70000) {
      setError('Maximum withdrawal is 70,000 KSH per transaction');
      return;
    }
    
    if (user && numAmount > user.balance) {
      setError('Insufficient balance');
      return;
    }
    
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/mpesa/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ phone, amount: numAmount })
      });
      
      const data = await res.json();
      
      if (data.error) {
        setError(data.error);
      } else {
        setSuccess('Withdrawal initiated! Money will be sent to your M-Pesa shortly.');
        updateBalance();
        setAmount('');
        setPhone('');
      }
    } catch (err) {
      setError('Failed to initiate withdrawal');
    }
    
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '0 20px' }}>
      <h1 className="page-title">Withdraw to M-Pesa</h1>
      
      <div className="card">
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '16px', 
          marginBottom: '24px',
          padding: '20px',
          background: 'rgba(76, 175, 80, 0.1)',
          borderRadius: '12px',
          border: '1px solid rgba(76, 175, 80, 0.3)'
        }}>
          <div style={{ 
            width: '56px', 
            height: '56px', 
            background: '#4caf50',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            color: 'white',
            fontWeight: 'bold'
          }}>
            M
          </div>
          <div>
            <div style={{ fontWeight: 'bold', color: '#4caf50', fontSize: '1.1rem' }}>Send to M-Pesa</div>
            <small style={{ color: 'var(--text-muted)' }}>Withdraw winnings to your phone</small>
          </div>
        </div>

        <div style={{ 
          padding: '16px', 
          background: 'var(--bg-secondary)', 
          borderRadius: '10px',
          marginBottom: '24px',
          border: '1px solid var(--border)'
        }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Available Balance</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#00e676' }}>
            KSH {user?.balance?.toLocaleString() || '0'}
          </div>
        </div>

        {error && (
          <div style={{ 
            padding: '16px', 
            background: 'rgba(255, 82, 82, 0.1)', 
            borderRadius: '10px', 
            color: '#ff5252',
            marginBottom: '20px'
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{ 
            padding: '16px', 
            background: 'rgba(0, 230, 118, 0.1)', 
            borderRadius: '10px', 
            color: '#00e676',
            marginBottom: '20px'
          }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>M-Pesa Phone Number</label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <span style={{ 
                padding: '12px 16px', 
                background: 'var(--bg-secondary)', 
                borderRadius: '8px',
                border: '1px solid var(--border)',
                color: 'var(--text-muted)'
              }}>
                +254
              </span>
              <input
                type="tel"
                className="input"
                placeholder="712345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 9))}
                required
                style={{ flex: 1 }}
              />
            </div>
            <small style={{ color: 'var(--text-muted)', marginTop: '8px', display: 'block' }}>
              Enter number without the leading 0 (e.g., 712345678)
            </small>
          </div>

          <div className="form-group">
            <label>Amount (KSH)</label>
            <input
              type="number"
              className="input"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="50"
              max="70000"
              required
            />
            <small style={{ color: 'var(--text-muted)', marginTop: '8px', display: 'block' }}>
              Min: 50 KSH | Max: 70,000 KSH per transaction
            </small>
          </div>

          <div className="form-group">
            <label style={{ marginBottom: '12px', display: 'block' }}>Quick amounts</label>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {quickAmounts.map(amt => (
                <button
                  key={amt}
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setAmount(amt.toString())}
                  style={{ 
                    padding: '10px 16px',
                    background: amount === amt.toString() ? '#00e676' : undefined,
                    color: amount === amt.toString() ? 'var(--bg-primary)' : undefined
                  }}
                >
                  {amt >= 1000 ? `${amt/1000}K` : amt}
                </button>
              ))}
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setAmount(user?.balance?.toString() || '0')}
                style={{ 
                  padding: '10px 16px',
                  background: amount === user?.balance?.toString() ? '#00e676' : undefined,
                  color: amount === user?.balance?.toString() ? 'var(--bg-primary)' : undefined
                }}
              >
                Max
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '16px', fontSize: '1.1rem' }}
            disabled={loading}
          >
            <i className="fa-solid fa-paper-plane"></i>
            {loading ? 'Processing...' : 'Withdraw to M-Pesa'}
          </button>
        </form>
      </div>

      <div className="card" style={{ marginTop: '24px' }}>
        <h3 style={{ marginBottom: '16px', fontFamily: 'Space Grotesk' }}>Withdrawal Info</h3>
        <ul style={{ color: 'var(--text-secondary)', paddingLeft: '20px', lineHeight: '2', fontSize: '0.95rem' }}>
          <li>Minimum withdrawal: 50 KSH</li>
          <li>Maximum withdrawal: 70,000 KSH per transaction</li>
          <li>Withdrawals are processed instantly</li>
          <li>Money is sent directly to your M-Pesa</li>
        </ul>
      </div>

      <div className="card" style={{ marginTop: '24px', border: '1px solid #ffc107' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '1.5rem' }}>⚠️</span>
          <div>
            <div style={{ fontWeight: 'bold', color: '#ffc107' }}>Important</div>
            <small style={{ color: 'var(--text-muted)' }}>
              Ensure your phone number is registered with M-Pesa. 
              Incorrect numbers may result in lost funds.
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}
