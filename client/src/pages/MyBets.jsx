import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function MyBets() {
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('/api/bets/history', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setBets(data.bets || []);
        setLoading(false);
      });
  }, []);

  const getBetStatus = (bet) => {
    if (bet.market_status === 'open') return 'pending';
    const won = (bet.outcome === 'yes' && bet.resolution === 1) || 
                (bet.outcome === 'no' && bet.resolution === 0);
    return won ? 'won' : 'lost';
  };

  if (loading) return <div className="empty-state">Loading bets...</div>;

  return (
    <div>
      <h1 className="page-title">My Betting History</h1>

      {bets.length === 0 ? (
        <div className="empty-state">
          <h2>No bets yet</h2>
          <p>Place your first bet on a prediction market!</p>
          <Link to="/">
            <button className="btn btn-primary" style={{ marginTop: '20px' }}>
              Browse Markets
            </button>
          </Link>
        </div>
      ) : (
        <div className="market-list">
          {bets.map(bet => {
            const status = getBetStatus(bet);
            
            return (
              <div key={bet.id} className="card">
                <div className="market-header">
                  <div>
                    <Link to={`/market/${bet.market_id}`} style={{ textDecoration: 'none' }}>
                      <div className="market-question">{bet.market_question}</div>
                    </Link>
                    <div className="market-meta">
                      {new Date(bet.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <span className={`resolved-badge ${status}`}>
                    {status.toUpperCase()}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '30px', marginTop: '15px' }}>
                  <div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Bet Amount</div>
                    <div style={{ fontWeight: 'bold' }}>KSH {bet.amount.toLocaleString()}</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Outcome</div>
                    <div style={{ 
                      fontWeight: 'bold', 
                      color: bet.outcome === 'yes' ? 'var(--success)' : 'var(--accent)' 
                    }}>
                      {bet.outcome.toUpperCase()}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Odds</div>
                    <div style={{ fontWeight: 'bold' }}>{parseFloat(bet.odds).toFixed(2)}</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Potential Win</div>
                    <div style={{ fontWeight: 'bold', color: 'var(--success)' }}>
                      KSH {bet.potential_payout.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
