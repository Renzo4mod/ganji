import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchMarkets();
    const interval = setInterval(fetchMarkets, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchMarkets = () => {
    setLoading(true);
    fetch('/api/markets')
      .then(res => res.json())
      .then(data => {
        setMarkets(data.markets || []);
        setLastUpdated(new Date());
        setLoading(false);
      });
  };

  const calculateOdds = (market) => {
    const total = market.yes_pool + market.no_pool;
    if (total === 0) return { yes: 1.00, no: 1.00 };
    return {
      yes: (total / (market.yes_pool || 1)).toFixed(2),
      no: (total / (market.no_pool || 1)).toFixed(2)
    };
  };

  if (loading) return <div className="empty-state">Loading markets...</div>;

  return (
    <div>
      <div className="poll-bar" key={lastUpdated ? lastUpdated.getTime() : 0}></div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h1 className="page-title">Prediction Markets</h1>
          <div className="live-indicator">
            <div className="live-dot"></div>
            LIVE
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          {lastUpdated && (
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button className="btn btn-secondary" onClick={fetchMarkets} disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>
      
      {markets.length === 0 ? (
        <div className="empty-state">
          <h2>No markets yet</h2>
          <p>Be the first to create a prediction market!</p>
        </div>
      ) : (
        <div className="market-list">
          {markets.map(market => {
            const odds = calculateOdds(market);
            const totalVolume = (market.yes_pool + market.no_pool).toLocaleString();
            
            return (
              <div key={market.id} className="card market-card">
                <div className="market-header">
                  <div>
                    <Link to={`/market/${market.id}`} style={{ textDecoration: 'none' }}>
                      <div className="market-question">{market.question}</div>
                    </Link>
                    <div className="market-meta">
                      by {market.creator_name} • {totalVolume} KSH volume
                    </div>
                  </div>
                  <span className={`resolved-badge ${market.status}`}>
                    {market.status.toUpperCase()}
                  </span>
                </div>
                
                <div className="market-odds">
                  <div className="odds-box odds-yes">
                    <div className="odds-label">YES Odds</div>
                    <div className="odds-value">{odds.yes}</div>
                  </div>
                  <div className="odds-box odds-no">
                    <div className="odds-label">NO Odds</div>
                    <div className="odds-value">{odds.no}</div>
                  </div>
                </div>
                
                {market.status === 'open' && user && (
                  <Link to={`/market/${market.id}`}>
                    <button className="btn btn-primary">Place Bet</button>
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
