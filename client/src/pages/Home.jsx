import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const categoryColors = {
  sports: { bg: 'rgba(76, 175, 80, 0.1)', color: '#4caf50', border: 'rgba(76, 175, 80, 0.3)', icon: 'fa-solid fa-futbol' },
  politics: { bg: 'rgba(156, 39, 176, 0.1)', color: '#9c27b0', border: 'rgba(156, 39, 176, 0.3)', icon: 'fa-solid fa-landmark' },
  business: { bg: 'rgba(255, 152, 0, 0.1)', color: '#ff9800', border: 'rgba(255, 152, 0, 0.3)', icon: 'fa-solid fa-chart-line' },
  entertainment: { bg: 'rgba(233, 30, 99, 0.1)', color: '#e91e63', border: 'rgba(233, 30, 99, 0.3)', icon: 'fa-solid fa-film' },
  regulatory: { bg: 'rgba(96, 125, 139, 0.1)', color: '#607d8b', border: 'rgba(96, 125, 139, 0.3)', icon: 'fa-solid fa-gavel' },
  geopolitics: { bg: 'rgba(63, 81, 181, 0.1)', color: '#3f51b5', border: 'rgba(63, 81, 181, 0.3)', icon: 'fa-solid fa-earth-africa' },
  kenya: { bg: 'rgba(76, 175, 80, 0.1)', color: '#4caf50', border: 'rgba(76, 175, 80, 0.3)', icon: 'fa-solid fa-flag' },
  international: { bg: 'rgba(255, 255, 255, 0.1)', color: '#ffffff', border: 'rgba(255, 255, 255, 0.3)', icon: 'fa-solid fa-globe' }
};

export default function Home() {
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState('volume');
  const { user } = useAuth();

  useEffect(() => {
    fetchMarkets();
    const refreshTime = activeCategory === 'news' ? 5000 : 10000;
    const interval = setInterval(fetchMarkets, refreshTime);
    return () => clearInterval(interval);
  }, [activeCategory]);

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
    if (total === 0) return { yes: 1.00, no: 1.00, yesPrice: 50, noPrice: 50 };
    return {
      yes: (total / (market.yes_pool || 1)).toFixed(2),
      no: (total / (market.no_pool || 1)).toFixed(2),
      yesPrice: Math.round((market.yes_pool / total) * 100),
      noPrice: Math.round((market.no_pool / total) * 100)
    };
  };

  const filteredMarkets = markets.filter(m => {
    if (activeCategory === 'all') return true;
    return m.category === activeCategory;
  });

  const sortedMarkets = [...filteredMarkets].sort((a, b) => {
    if (sortBy === 'volume') return (b.yes_pool + b.no_pool) - (a.yes_pool + a.no_pool);
    if (sortBy === 'newest') return new Date(b.created_at) - new Date(a.created_at);
    return 0;
  });

  const totalVolume = markets.reduce((sum, m) => sum + m.yes_pool + m.no_pool, 0);

  if (loading && markets.length === 0) return <div className="empty-state">Loading markets...</div>;

  return (
    <main className="max-w-7xl mx-auto px-4 pb-20">
      <div className="poll-bar" key={lastUpdated ? lastUpdated.getTime() : 0}></div>
      
      <div className="stats-grid animate-fade">
        <div className="stat-card">
          <div className="stat-value">KSH {totalVolume > 0 ? totalVolume.toLocaleString() : '0'}</div>
          <div className="stat-label">Total Volume</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{markets.length}</div>
          <div className="stat-label">Active Markets</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{color: '#00e676'}}>{markets.filter(m => m.status === 'open').length}</div>
          <div className="stat-label">Open</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{color: '#f7931a'}}>{markets.filter(m => m.status === 'resolved').length}</div>
          <div className="stat-label">Resolved</div>
        </div>
      </div>

      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
          <h1 className="page-title" style={{marginBottom: 0}}>Prediction Markets</h1>
          <div className="live-indicator">
            <div className="live-dot"></div>
            LIVE
          </div>
        </div>
        <div style={{display: 'flex', gap: '12px', alignItems: 'center'}}>
          {lastUpdated && (
            <span style={{color: 'var(--text-muted)', fontSize: '0.85rem'}}>
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button className="btn btn-secondary" onClick={fetchMarkets}>
            <i className="fa-solid fa-refresh"></i> Refresh
          </button>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab ${activeCategory === 'all' ? 'active' : ''}`} onClick={() => setActiveCategory('all')}>
          All Markets
        </button>
        <button className={`tab ${activeCategory === 'sports' ? 'active' : ''}`} onClick={() => setActiveCategory('sports')}>
          <i className="fa-solid fa-futbol" style={{color: '#4caf50', marginRight: '6px'}}></i>
          Sports
        </button>
        <button className={`tab ${activeCategory === 'politics' ? 'active' : ''}`} onClick={() => setActiveCategory('politics')}>
          <i className="fa-solid fa-landmark" style={{color: '#9c27b0', marginRight: '6px'}}></i>
          Politics
        </button>
        <button className={`tab ${activeCategory === 'business' ? 'active' : ''}`} onClick={() => setActiveCategory('business')}>
          <i className="fa-solid fa-chart-line" style={{color: '#ff9800', marginRight: '6px'}}></i>
          Business
        </button>
        <button className={`tab ${activeCategory === 'entertainment' ? 'active' : ''}`} onClick={() => setActiveCategory('entertainment')}>
          <i className="fa-solid fa-film" style={{color: '#e91e63', marginRight: '6px'}}></i>
          Entertainment
        </button>
        <button className={`tab ${activeCategory === 'regulatory' ? 'active' : ''}`} onClick={() => setActiveCategory('regulatory')}>
          <i className="fa-solid fa-gavel" style={{color: '#607d8b', marginRight: '6px'}}></i>
          Regulatory
        </button>
      </div>

      <div style={{marginBottom: '16px'}}>
        <select 
          className="input" 
          style={{width: 'auto', padding: '8px 16px'}}
          value={sortBy} 
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="volume">Sort by Volume</option>
          <option value="newest">Sort by Newest</option>
        </select>
      </div>
      
      {sortedMarkets.length === 0 ? (
        <div className="empty-state">
          <h2>No markets found</h2>
          <p>Create the first prediction market!</p>
          {user && (
            <Link to="/create">
              <button className="btn btn-primary" style={{marginTop: '20px'}}>Create Market</button>
            </Link>
          )}
        </div>
      ) : (
        <div className="market-list">
          {sortedMarkets.map(market => {
            const odds = calculateOdds(market);
            const totalVolume = (market.yes_pool + market.no_pool).toLocaleString();
            const category = market.category || 'international';
            const catStyle = categoryColors[category] || categoryColors.international;
            
            return (
              <div key={market.id} className="market-card animate-fade" style={{borderColor: catStyle.border}}>
                <div className="market-header">
                  <div style={{flex: 1}}>
                    <div style={{marginBottom: '8px'}}>
                      <span className="category-tag" style={catStyle}>
                        <i className={catStyle.icon} style={{fontSize: '10px'}}></i>
                        {category}
                      </span>
                    </div>
                    <Link to={`/market/${market.id}`} style={{textDecoration: 'none'}}>
                      <div className="market-question">{market.question}</div>
                    </Link>
                    <div className="market-meta">
                      by {market.creator_name} • KSH {totalVolume} volume
                    </div>
                  </div>
                  <span className={`resolved-badge ${market.status}`}>
                    {market.status === 'open' ? '🟢 OPEN' : 'RESOLVED'}
                  </span>
                </div>
                
                <div className="price-bar-container">
                  <div className="price-bar" style={{width: `${odds.yesPrice}%`}}></div>
                </div>
                
                <div className="market-odds">
                  <div className="odds-box odds-yes">
                    <div className="odds-label">YES</div>
                    <div className="odds-value">{odds.yesPrice}<span style={{fontSize: '0.7em', color: 'var(--text-muted)'}}>.0</span></div>
                  </div>
                  <div className="odds-box odds-no">
                    <div className="odds-label">NO</div>
                    <div className="odds-value">{odds.noPrice}<span style={{fontSize: '0.7em', color: 'var(--text-muted)'}}>.0</span></div>
                  </div>
                </div>
                
                {market.status === 'open' && user && (
                  <Link to={`/market/${market.id}`} style={{display: 'block', marginTop: '16px'}}>
                    <button className="btn btn-primary" style={{width: '100%'}}>
                      Place Bet
                    </button>
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="card animate-slide" style={{marginTop: '40px'}}>
        <h2 className="font-display" style={{fontWeight: 'bold', fontSize: '1.25rem', marginBottom: '16px'}}>
          How GANJI Works
        </h2>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px'}}>
          <div style={{textAlign: 'center'}}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '12px',
              background: 'rgba(0, 230, 118, 0.1)', border: '1px solid rgba(0, 230, 118, 0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px'
            }}>
              <i className="fa-solid fa-wallet" style={{color: '#00e676', fontSize: '1.5rem'}}></i>
            </div>
            <h3 style={{fontWeight: '600', marginBottom: '8px'}}>Deposit via M-Pesa</h3>
            <p style={{color: 'var(--text-secondary)', fontSize: '0.9rem'}}>
              Add funds instantly from your M-Pesa wallet. Minimum deposit KSH 10.
            </p>
          </div>
          <div style={{textAlign: 'center'}}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '12px',
              background: 'rgba(247, 147, 26, 0.1)', border: '1px solid rgba(247, 147, 26, 0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px'
            }}>
              <i className="fa-solid fa-chart-line" style={{color: '#f7931a', fontSize: '1.5rem'}}></i>
            </div>
            <h3 style={{fontWeight: '600', marginBottom: '8px'}}>Trade Predictions</h3>
            <p style={{color: 'var(--text-secondary)', fontSize: '0.9rem'}}>
              Buy YES or NO shares on any market. Predict correctly to win.
            </p>
          </div>
          <div style={{textAlign: 'center'}}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '12px',
              background: 'rgba(76, 175, 80, 0.1)', border: '1px solid rgba(76, 175, 80, 0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px'
            }}>
              <i className="fa-solid fa-money-bill-wave" style={{color: '#4caf50', fontSize: '1.5rem'}}></i>
            </div>
            <h3 style={{fontWeight: '600', marginBottom: '8px'}}>Withdraw Winnings</h3>
            <p style={{color: 'var(--text-secondary)', fontSize: '0.9rem'}}>
              Withdraw winnings back to M-Pesa anytime, 24/7.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
