import { useState, useEffect } from 'react';
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

  useEffect(() => {
    fetchMarket();
    const interval = setInterval(fetchMarket, 5000);
    return () => clearInterval(interval);
  }, [id]);

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
    if (!selectedOutcome || !betAmount || betAmount < 10) {
      alert('Minimum bet is 10 KSH');
      return;
    }
    if (betAmount > 500000) {
      alert('Maximum bet is 500,000 KSH');
      return;
    }
    
    setPlacing(true);

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

  if (loading) return <div className="empty-state">Loading...</div>;
  if (!market) return <div className="empty-state">Market not found</div>;

  const totalPool = market.yes_pool + market.no_pool;
  const yesOdds = totalPool > 0 ? (totalPool / (market.yes_pool || 1)).toFixed(2) : 1.00;
  const noOdds = totalPool > 0 ? (totalPool / (market.no_pool || 1)).toFixed(2) : 1.00;
  const potentialPayout = selectedOutcome && betAmount 
    ? (parseFloat(betAmount) * (selectedOutcome === 'yes' ? yesOdds : noOdds)).toFixed(2)
    : 0;

  const isCreator = user && user.id === market.creator_id;
  const canResolve = isCreator && market.status === 'open';

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
      <div className="poll-bar" key={lastUpdated ? lastUpdated.getTime() : 0}></div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 className="page-title">{market.question}</h1>
        <div className="live-indicator">
          <div className="live-dot"></div>
          LIVE
        </div>
      </div>
      
      <div className="card" style={{ marginBottom: '20px' }}>
        {market.description && (
          <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
            {market.description}
          </p>
        )}
        
        <div className="market-meta" style={{ marginBottom: '20px' }}>
          Created by {market.creator_name} • 10% fee applies
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">KSH {totalPool.toLocaleString()}</div>
            <div className="stat-label">Total Volume</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ color: 'var(--success)' }}>
              KSH {(market.yes_pool || 0).toLocaleString()}
            </div>
            <div className="stat-label">YES Volume</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ color: 'var(--accent)' }}>
              KSH {(market.no_pool || 0).toLocaleString()}
            </div>
            <div className="stat-label">NO Volume</div>
          </div>
        </div>

        <span className={`resolved-badge ${market.status}`}>
          {market.status === 'open' ? '🟢 OPEN' : `RESOLVED: ${market.resolution === 1 ? 'YES' : 'NO'}`}
        </span>
      </div>

      {market.status === 'open' && user && (
        <div className="card">
          <h2 style={{ marginBottom: '20px' }}>Place Your Bet</h2>
          
          <div className="bet-section">
            <div 
              className={`bet-option yes ${selectedOutcome === 'yes' ? 'selected' : ''}`}
              onClick={() => setSelectedOutcome('yes')}
            >
              <div className="odds-label">Bet YES</div>
              <div className="odds-value">{yesOdds}x</div>
            </div>
            <div 
              className={`bet-option no ${selectedOutcome === 'no' ? 'selected' : ''}`}
              onClick={() => setSelectedOutcome('no')}
            >
              <div className="odds-label">Bet NO</div>
              <div className="odds-value">{noOdds}x</div>
            </div>
          </div>

          {selectedOutcome && (
            <>
              <div className="bet-amount-input">
                <label className="form-group">
                  <div style={{ color: 'var(--text-muted)', marginBottom: '8px' }}>
                    Bet Amount (KSH) - Balance: KSH {user.balance?.toLocaleString()} | Min: 10 | Max: 500,000
                  </div>
                  <input
                    type="number"
                    className="input"
                    min="10"
                    max="500000"
                    value={betAmount}
                    onChange={(e) => setBetAmount(e.target.value)}
                    placeholder="Min: 10 KSH, Max: 500,000 KSH"
                  />
                </label>
              </div>

              {potentialPayout > 0 && (
                <div className="potential-payout">
                  <div className="payout-label">Potential Payout</div>
                  <div className="payout-value">KSH {parseFloat(potentialPayout).toLocaleString()}</div>
                </div>
              )}

              <button 
                className="btn btn-primary" 
                style={{ width: '100%', marginTop: '20px' }}
                onClick={handlePlaceBet}
                disabled={placing || !betAmount || betAmount <= 0}
              >
                {placing ? 'Placing Bet...' : 'Place Bet'}
              </button>
            </>
          )}
        </div>
      )}

      {canResolve && (
        <div className="card" style={{ marginTop: '20px', border: '2px solid var(--warning)' }}>
          <h2 style={{ marginBottom: '15px', color: 'var(--warning)' }}>Creator Controls</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '15px' }}>
            As the creator, you can resolve this market when the outcome is known.
          </p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              className="btn btn-success" 
              style={{ flex: 1 }}
              onClick={() => handleResolve(1)}
              disabled={resolving}
            >
              {resolving ? 'Resolving...' : 'Resolve: YES Won'}
            </button>
            <button 
              className="btn btn-primary" 
              style={{ flex: 1 }}
              onClick={() => handleResolve(0)}
              disabled={resolving}
            >
              {resolving ? 'Resolving...' : 'Resolve: NO Won'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
