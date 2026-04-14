import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function MyBets() {
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

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

  const filteredBets = bets.filter(bet => {
    if (filter === 'all') return true;
    const status = getBetStatus(bet);
    return status === filter;
  });

  const totalWon = bets.filter(b => getBetStatus(b) === 'won').length;
  const totalLost = bets.filter(b => getBetStatus(b) === 'lost').length;
  const totalPending = bets.filter(b => getBetStatus(b) === 'pending').length;

  if (loading) return <div className="empty-state">Loading bets...</div>;

  return (
    <div style={{maxWidth: '1000px', margin: '0 auto', padding: '0 20px'}}>
      <h1 className="page-title">My Betting History</h1>

      <div className="stats-grid" style={{marginBottom: '24px'}}>
        <div className="stat-card">
          <div className="stat-value" style={{color: '#ffc107'}}>{totalPending}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{color: '#00e676'}}>{totalWon}</div>
          <div className="stat-label">Won</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{color: '#ff5252'}}>{totalLost}</div>
          <div className="stat-label">Lost</div>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
          All ({bets.length})
        </button>
        <button className={`tab ${filter === 'pending' ? 'active' : ''}`} onClick={() => setFilter('pending')}>
          Pending ({totalPending})
        </button>
        <button className={`tab ${filter === 'won' ? 'active' : ''}`} onClick={() => setFilter('won')}>
          Won ({totalWon})
        </button>
        <button className={`tab ${filter === 'lost' ? 'active' : ''}`} onClick={() => setFilter('lost')}>
          Lost ({totalLost})
        </button>
      </div>

      {filteredBets.length === 0 ? (
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
          {filteredBets.map(bet => {
            const status = getBetStatus(bet);
            
            return (
              <div key={bet.id} className="card">
                <div className="market-header">
                  <div style={{flex: 1}}>
                    <Link to={`/market/${bet.market_id}`} style={{textDecoration: 'none'}}>
                      <div className="market-question">{bet.market_question}</div>
                    </Link>
                    <div className="market-meta">
                      {new Date(bet.created_at).toLocaleDateString('en-KE', {day: 'numeric', month: 'short', year: 'numeric'})}
                    </div>
                  </div>
                  <span className={`resolved-badge ${status === 'won' ? 'resolved' : status}`}>
                    {status === 'pending' ? '⏳ PENDING' : status === 'won' ? '✅ WON' : '❌ LOST'}
                  </span>
                </div>

                <div style={{display: 'flex', gap: '24px', marginTop: '16px', flexWrap: 'wrap'}}>
                  <div>
                    <div style={{color: 'var(--text-muted)', fontSize: '0.8rem'}}>Amount</div>
                    <div style={{fontWeight: 'bold', fontSize: '1.1rem'}}>KSH {bet.amount.toLocaleString()}</div>
                  </div>
                  <div>
                    <div style={{color: 'var(--text-muted)', fontSize: '0.8rem'}}>Outcome</div>
                    <div style={{fontWeight: 'bold', color: bet.outcome === 'yes' ? '#00e676' : '#ff5252'}}>
                      {bet.outcome.toUpperCase()}
                    </div>
                  </div>
                  <div>
                    <div style={{color: 'var(--text-muted)', fontSize: '0.8rem'}}>Odds</div>
                    <div style={{fontWeight: 'bold'}}>{parseFloat(bet.odds).toFixed(2)}x</div>
                  </div>
                  <div>
                    <div style={{color: 'var(--text-muted)', fontSize: '0.8rem'}}>Potential Win</div>
                    <div style={{fontWeight: 'bold', color: '#00e676'}}>
                      KSH {bet.potential_payout.toLocaleString(undefined, {maximumFractionDigits: 2})}
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
