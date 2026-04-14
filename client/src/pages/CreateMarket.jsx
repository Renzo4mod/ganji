import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CreateMarket() {
  const [form, setForm] = useState({
    question: '',
    description: '',
    category: 'international',
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
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '0 20px' }}>
      <h1 className="page-title">Create Prediction Market</h1>
      
      <div className="card">
        <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
          Create a market for others to bet on. You earn 10% fee from all bets placed on your market.
        </p>

        {error && (
          <div style={{ color: 'var(--danger)', marginBottom: '20px', padding: '12px', background: 'rgba(255, 82, 82, 0.1)', borderRadius: '8px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Question</label>
            <input
              type="text"
              className="input"
              placeholder="Will Bitcoin reach $150,000 by end of year?"
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
              placeholder="More details about the market and how it will be resolved..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Category</label>
            <div style={{display: 'flex', gap: '12px', flexWrap: 'wrap'}}>
              {[
                {id: 'sports', label: 'Sports', icon: 'fa-solid fa-futbol', color: '#4caf50'},
                {id: 'politics', label: 'Politics', icon: 'fa-solid fa-landmark', color: '#9c27b0'},
                {id: 'business', label: 'Business', icon: 'fa-solid fa-chart-line', color: '#ff9800'},
                {id: 'entertainment', label: 'Entertainment', icon: 'fa-solid fa-film', color: '#e91e63'},
                {id: 'regulatory', label: 'Regulatory', icon: 'fa-solid fa-gavel', color: '#607d8b'},
                {id: 'geopolitics', label: 'Geopolitics', icon: 'fa-solid fa-earth-africa', color: '#3f51b5'},
                {id: 'kenya', label: 'Kenya', icon: 'fa-solid fa-flag', color: '#4caf50'},
                {id: 'international', label: 'International', icon: 'fa-solid fa-globe', color: '#ffffff'}
              ].map(cat => (
                <div
                  key={cat.id}
                  onClick={() => setForm({ ...form, category: cat.id })}
                  style={{
                    padding: '12px 20px',
                    borderRadius: '10px',
                    border: `2px solid ${form.category === cat.id ? cat.color : 'var(--border)'}`,
                    background: form.category === cat.id ? `${cat.color}15` : 'var(--bg-secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <i className={cat.icon} style={{color: cat.color}}></i>
                  <span style={{fontWeight: '500'}}>{cat.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>End Date (optional)</label>
            <input
              type="datetime-local"
              className="input"
              value={form.closes_at}
              onChange={(e) => setForm({ ...form, closes_at: e.target.value })}
            />
          </div>

          <div style={{
            padding: '16px',
            background: 'rgba(0, 230, 118, 0.1)',
            borderRadius: '10px',
            border: '1px solid rgba(0, 230, 118, 0.3)',
            marginBottom: '20px'
          }}>
            <div style={{ color: '#00e676', fontWeight: 'bold', marginBottom: '4px' }}>
              10% Creator Fee
            </div>
            <small style={{ color: 'var(--text-muted)' }}>
              You earn 10% from every bet placed on your market when it resolves.
            </small>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px' }}>
            <i className="fa-solid fa-plus"></i>
            Create Market
          </button>
        </form>
      </div>
    </div>
  );
}
