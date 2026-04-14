import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Deposit() {
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [checkoutId, setCheckoutId] = useState(null);
  const { updateBalance } = useAuth();

  const quickAmounts = [100, 500, 1000, 2000, 5000];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    const numAmount = parseInt(amount);
    if (isNaN(numAmount) || numAmount < 10) {
      setError('Minimum deposit is 10 KSH');
      return;
    }
    
    if (numAmount > 150000) {
      setError('Maximum deposit is 150,000 KSH');
      return;
    }
    
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/mpesa/deposit', {
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
        setSuccess(data.message);
        setCheckoutId(data.checkoutRequestId);
        pollStatus(data.checkoutRequestId);
      }
    } catch (err) {
      setError('Failed to initiate payment');
    }
    
    setLoading(false);
  };

  const pollStatus = (checkoutRequestId) => {
    const interval = setInterval(async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/mpesa/status/${checkoutRequestId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (data.status === 'completed') {
          clearInterval(interval);
          setSuccess('Payment successful! Money added to your balance.');
          setAmount('');
          setPhone('');
          setCheckoutId(null);
          updateBalance();
        } else if (data.status === 'failed') {
          clearInterval(interval);
          setError(data.message || 'Payment failed');
          setCheckoutId(null);
        }
      } catch (err) {
        console.error('Status check failed:', err);
      }
    }, 3000);
    
    setTimeout(() => {
      clearInterval(interval);
      if (checkoutId) {
        setError('Payment timeout. Please check your M-Pesa messages.');
        setCheckoutId(null);
      }
    }, 120000);
  };

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '0 20px' }}>
      <h1 className="page-title">Deposit with M-Pesa</h1>
      
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
            <div style={{ fontWeight: 'bold', color: '#4caf50', fontSize: '1.1rem' }}>Lipa na M-Pesa</div>
            <small style={{ color: 'var(--text-muted)' }}>Instant deposits via Safaricom</small>
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
            {checkoutId && <p style={{ marginTop: '12px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Check your phone and enter your M-Pesa PIN to complete payment.
            </p>}
          </div>
        )}

        {!checkoutId && (
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
                Enter your M-Pesa number (e.g., 0712345678 or 712345678)
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
                min="10"
                max="150000"
                required
              />
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
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-success" 
              style={{ width: '100%', padding: '16px', fontSize: '1.1rem' }}
              disabled={loading}
            >
              <i className="fa-solid fa-paper-plane"></i>
              {loading ? 'Sending...' : 'Pay with M-Pesa'}
            </button>
          </form>
        )}

        {checkoutId && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              width: '80px', 
              height: '80px', 
              borderRadius: '50%', 
              border: '4px solid #4caf50',
              borderTopColor: 'transparent',
              animation: 'spin 1s linear infinite',
              margin: '24px auto'
            }}></div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
              Waiting for payment confirmation...
            </p>
            <button 
              className="btn btn-secondary" 
              style={{ marginTop: '24px' }}
              onClick={() => {
                setCheckoutId(null);
                setSuccess('');
              }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      <div className="card" style={{ marginTop: '24px' }}>
        <h3 style={{ marginBottom: '16px', fontFamily: 'Space Grotesk' }}>How it works</h3>
        <ol style={{ color: 'var(--text-secondary)', paddingLeft: '20px', lineHeight: '2', fontSize: '0.95rem' }}>
          <li>Enter your M-Pesa registered phone number</li>
          <li>Enter the amount you want to deposit</li>
          <li>Click "Pay with M-Pesa"</li>
          <li>Check your phone for an M-Pesa prompt</li>
          <li>Enter your M-Pesa PIN to confirm</li>
          <li>Money is added to your GANJI balance instantly</li>
        </ol>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
