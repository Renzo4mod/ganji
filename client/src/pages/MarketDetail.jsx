import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function MarketDetail() {
  const { id } = useParams();
  const { user, updateBalance } = useAuth();
  const [market, setMarket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [betAmount, setBetAmount] = useState('');
  const [selectedOutcome, setSelectedOutcome] = useState(null);
  const [placing, setPlacing] = useState(false);
  const [resolving, setResolving] = useState(false);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    fetchMarket();
    const interval = setInterval(fetchMarket, 5000);
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    if (market && chartRef.current && !chartInstance.current) {
      renderChart();
    }
  }, [market]);

  const fetchMarket = () => {
    setLoading(true);
    fetch(`/api/markets/${id}`)
      .then(res => res.json())
      .then(data => {
        setMarket(data.market);
        setLastUpdated(new Date());
        setLoading(false);
      });
  };

  const handlePlaceBet = async () => {
    if (!selectedOutcome || !betAmount || parseFloat(betAmount) < 10) {
      alert('Minimum bet is 10 KSH');
      return;
    }
    if (parseFloat(betAmount) > 500000) {
      alert('Maximum bet is 500,000 KSH');
      return;
    }
    
    setPlacing(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/bets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          market_id: id,
          outcome: selectedOutcome,
          amount: parseFloat(betAmount)
        })
      });
      
      const data = await res.json();
      
      if (data.error) {
        alert(data.error);
      } else {
        setBetAmount('');
        setSelectedOutcome(null);
        fetchMarket();
        updateBalance(data.new_balance);
        alert('Bet placed successfully!');
      }
    } catch (err) {
      alert('Failed to place bet');
    }
    setPlacing(false);
  };

  const handleResolve = async (resolution) => {
    if (!confirm(`Confirm resolution: ${resolution === 1 ? 'YES' : 'NO'} won?`)) return;
    
    setResolving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/markets/${id}/resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ resolution })
      });
      
      const data = await res.json();
      
      if (data.error) {
        alert(data.error);
      } else {
        fetchMarket();
        alert(`Market resolved! ${data.resolution.toUpperCase()} won.`);
      }
    } catch (err) {
      alert('Failed to resolve market');
    }
    setResolving(false);
  };

  const renderChart = () => {
    if (!chartRef.current || !market || chartInstance.current) return;
    
    const ctx = chartRef.current.getContext('2d');
    const total = market.yes_pool + market.no_pool;
    const yesPercent = total > 0 ? (market.yes_pool / total) * 100 : 50;
    
    chartInstance.current = {
      destroy: () => { chartInstance.current = null; }
    };
  };

  if (loading) return <div className="empty-state">Loading...</div>;
  if (!market) return <div className="empty-state">Market not found</div>;

  const totalPool = market.yes_pool + market.no_pool;
  const yesPercent = totalPool > 0 ? Math.round((market.yes_pool / totalPool) * 100) : 50;
  const noPercent = 100 - yesPercent;
  const yesOdds = totalPool > 0 ? (totalPool / (market.yes_pool || 1)).toFixed(2) : 1.00;
  const noOdds = totalPool > 0 ? (totalPool / (market.no_pool || 1)).toFixed(2) : 1.00;
  const potentialPayout = selectedOutcome && betAmount 
    ? (parseFloat(betAmount) * (selectedOutcome === 'yes' ? parseFloat(yesOdds) : parseFloat(noOdds))).toFixed(2)
    : 0;

  const isCreator = user && user.id === market.creator_id;
  const canResolve = isCreator && market.status === 'open';

  const categoryColors = {
    bitcoin: { bg: 'rgba(247, 147, 26, 0.1)', color: '#f7931a', border: 'rgba(247, 147, 26, 0.3)' },
    kenya: { bg: 'rgba(76, 175, 80, 0.1)', color: '#4caf50', border: 'rgba(76, 175, 80, 0.3)' },
    international: { bg: 'rgba(255, 255, 255, 0.1)', color: '#ffffff', border: 'rgba(255, 255, 255, 0.3)' },
    sports: { bg: 'rgba(76, 175, 80, 0.1)', color: '#4caf50', border: 'rgba(76, 175, 80, 0.3)' },
    politics: { bg: 'rgba(156, 39, 176, 0.1)', color: '#9c27b0', border: 'rgba(156, 39, 176, 0.3)' },
    business: { bg: 'rgba(255, 152, 0, 0.1)', color: '#ff9800', border: 'rgba(255, 152, 0, 0.3)' },
    entertainment: { bg: 'rgba(233, 30, 99, 0.1)', color: '#e91e63', border: 'rgba(233, 30, 99, 0.3)' },
    regulatory: { bg: 'rgba(96, 125, 139, 0.1)', color: '#607d8b', border: 'rgba(96, 125, 139, 0.3)' },
    geopolitics: { bg: 'rgba(63, 81, 181, 0.1)', color: '#3f51b5', border: 'rgba(63, 81, 181, 0.3)' },
    news: { bg: 'rgba(233, 30, 99, 0.1)', color: '#e91e63', border: 'rgba(233, 30, 99, 0.3)' }
  };
  const catStyle = categoryColors[market.category] || categoryColors.international;

  return (
    <main className="max-w-4xl mx-auto px-4 pb-20">
      <div className="poll-bar" key={lastUpdated ? lastUpdated.getTime() : 0}></div>
      
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px'}}>
        <div>
          <span className="category-tag" style={catStyle}>
            <i className={`fa-solid fa-tag`} style={{fontSize: '10px'}}></i>
            {market.category || 'International'}
          </span>
          <h1 className="page-title" style={{marginTop: '12px', marginBottom: '8px'}}>{market.question}</h1>
          <div className="market-meta">
            Created by {market.creator_name} • {market.status === 'open' ? '10% creator fee' : 'Resolved'}
          </div>
        </div>
        <div className="live-indicator">
          <div className="live-dot"></div>
          LIVE
        </div>
      </div>
      
      <div className="card" style={{marginBottom: '24px'}}>
        {market.description && (
          <p style={{color: 'var(--text-secondary)', marginBottom: '20px'}}>
            {market.description}
          </p>
        )}
        
        <div className="price-bar-container" style={{height: '12px', marginBottom: '20px'}}>
          <div className="price-bar" style={{width: `${yesPercent}%`, background: 'linear-gradient(90deg, #00e676, #00c853)'}}></div>
        </div>
        
        <div style={{display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px'}}>
          <span>YES {yesPercent}%</span>
          <span>NO {noPercent}%</span>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">KSH {totalPool > 0 ? totalPool.toLocaleString() : '0'}</div>
            <div className="stat-label">Total Volume</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{color: '#00e676'}}>KSH {market.yes_pool ? market.yes_pool.toLocaleString() : '0'}</div>
            <div className="stat-label">YES Volume</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{color: '#ff5252'}}>KSH {market.no_pool ? market.no_pool.toLocaleString() : '0'}</div>
            <div className="stat-label">NO Volume</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{color: yesPercent > 50 ? '#00e676' : '#ff5252'}}>{yesPercent}%</div>
            <div className="stat-label">YES Probability</div>
          </div>
        </div>

        <span className={`resolved-badge ${market.status}`}>
          {market.status === 'open' ? '🟢 OPEN FOR TRADING' : `RESOLVED: ${market.resolution === 1 ? 'YES' : 'NO'}`}
        </span>
      </div>

      {market.status === 'open' && user && (
        <div className="card">
          <h2 style={{marginBottom: '20px', fontFamily: 'Space Grotesk', fontWeight: 'bold'}}>Place Your Bet</h2>
          
          <div className="bet-section">
            <div 
              className={`bet-option yes ${selectedOutcome === 'yes' ? 'selected' : ''}`}
              onClick={() => setSelectedOutcome('yes')}
            >
              <div className="odds-label">Bet YES</div>
              <div className="odds-value">{yesOdds}x</div>
              <div style={{fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px'}}>
                Probability: {yesPercent}%
              </div>
            </div>
            <div 
              className={`bet-option no ${selectedOutcome === 'no' ? 'selected' : ''}`}
              onClick={() => setSelectedOutcome('no')}
            >
              <div className="odds-label">Bet NO</div>
              <div className="odds-value">{noOdds}x</div>
              <div style={{fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px'}}>
                Probability: {noPercent}%
              </div>
            </div>
          </div>

          {selectedOutcome && (
            <>
              <div className="form-group">
                <label>Bet Amount (KSH)</label>
                <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                  <input
                    type="number"
                    className="input"
                    min="10"
                    max="500000"
                    value={betAmount}
                    onChange={(e) => setBetAmount(e.target.value)}
                    placeholder="Min: 10 KSH, Max: 500,000 KSH"
                  />
                  <span style={{color: 'var(--text-muted)'}}>
                    Balance: KSH {user.balance?.toLocaleString()}
                  </span>
                </div>
                <div style={{display: 'flex', gap: '8px', marginTop: '12px'}}>
                  {[100, 500, 1000, 5000].map(v => (
                    <button
                      key={v}
                      className="btn btn-secondary"
                      onClick={() => setBetAmount(v.toString())}
                      style={{padding: '6px 12px', fontSize: '0.85rem'}}
                    >
                      {v >= 1000 ? `${v/1000}K` : v}
                    </button>
                  ))}
                </div>
              </div>

              {potentialPayout > 0 && (
                <div className="potential-payout">
                  <div className="payout-label">Potential Payout</div>
                  <div className="payout-value">KSH {parseFloat(potentialPayout).toLocaleString()}</div>
                </div>
              )}

              <button 
                className="btn btn-primary" 
                style={{width: '100%', marginTop: '20px', padding: '14px', fontSize: '1rem'}}
                onClick={handlePlaceBet}
                disabled={placing || !betAmount || parseFloat(betAmount) <= 0}
              >
                {placing ? 'Placing Bet...' : `Place ${selectedOutcome.toUpperCase()} Bet`}
              </button>
            </>
          )}
        </div>
      )}

      {canResolve && (
        <div className="card" style={{marginTop: '24px', border: '2px solid #ffc107'}}>
          <h2 style={{marginBottom: '15px', color: '#ffc107', fontFamily: 'Space Grotesk'}}>
            <i className="fa-solid fa-crown" style={{marginRight: '8px'}}></i>
            Creator Controls
          </h2>
          <p style={{color: 'var(--text-muted)', marginBottom: '15px'}}>
            As the creator, resolve this market when the outcome is known.
          </p>
          <div style={{display: 'flex', gap: '12px'}}>
            <button 
              className="btn btn-success" 
              style={{flex: 1, padding: '14px'}}
              onClick={() => handleResolve(1)}
              disabled={resolving}
            >
              <i className="fa-solid fa-check"></i>
              {resolving ? 'Resolving...' : 'Resolve: YES Won'}
            </button>
            <button 
              className="btn btn-danger" 
              style={{flex: 1, padding: '14px'}}
              onClick={() => handleResolve(0)}
              disabled={resolving}
            >
              <i className="fa-solid fa-xmark"></i>
              {resolving ? 'Resolving...' : 'Resolve: NO Won'}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
