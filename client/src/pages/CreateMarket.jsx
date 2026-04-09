import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CreateMarket() {
  const [form, setForm] = useState({
    question: '',
    description: '',
    closes_at: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/markets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });
      
      const data = await res.json();
      
      if (data.error) {
        setError(data.error);
      } else {
        navigate(`/market/${data.market.id}`);
      }
    } catch (err) {
      setError('Failed to create market');
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h1 className="page-title">Create Prediction Market</h1>
      
      <div className="card">
        <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
          Create a market for others to bet on. You earn 10% fee from all bets placed on your market.
        </p>

        {error && (
          <div style={{ color: 'var(--accent)', marginBottom: '20px' }}>{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Question</label>
            <input
              type="text"
              className="input"
              placeholder="Will it rain in Nairobi tomorrow?"
              value={form.question}
              onChange={(e) => setForm({ ...form, question: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Description (optional)</label>
            <textarea
              className="input"
              rows="3"
              placeholder="More details about the market..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div className="form-group">
            <div style={{ 
              padding: '15px', 
              background: 'var(--bg-secondary)', 
              borderRadius: '8px',
              border: '1px solid var(--success)'
            }}>
              <div style={{ color: 'var(--success)', fontWeight: 'bold' }}>
                10% Platform Fee
              </div>
              <small style={{ color: 'var(--text-muted)' }}>
                You earn 10% from every bet placed on your market when resolved.
              </small>
            </div>
          </div>

          <div className="form-group">
            <label>Closes At (optional)</label>
            <input
              type="datetime-local"
              className="input"
              value={form.closes_at}
              onChange={(e) => setForm({ ...form, closes_at: e.target.value })}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            Create Market
          </button>
        </form>
      </div>
    </div>
  );
}
