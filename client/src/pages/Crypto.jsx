import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const TIMERS = [
  { label: '1m', value: 1 },
  { label: '5m', value: 5 },
  { label: '15m', value: 15 },
  { label: '30m', value: 30 },
  { label: '60m', value: 60 }
];

export default function Crypto() {
  const [coins, setCoins] = useState([]);
  const [btcPrice, setBtcPrice] = useState(null);
  const [btcChange, setBtcChange] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimer, setSelectedTimer] = useState(5);
  const [timeLeft, setTimeLeft] = useState(60);
  const [markets, setMarkets] = useState([]);

  useEffect(() => {
    fetchPrices();
    fetchMarkets();
    const priceInterval = setInterval(fetchPrices, 3000);
    const timerInterval = setInterval(() => {
      setTimeLeft(prev => prev > 0 ? prev - 1 : 60);
    }, 1000);
    return () => {
      clearInterval(priceInterval);
      clearInterval(timerInterval);
    };
  }, []);

  useEffect(() => {
    fetchMarkets();
  }, [selectedTimer]);

  const fetchPrices = async () => {
    try {
      const res = await fetch('/api/crypto/prices?ids=bitcoin,ethereum,solana,dogecoin,cardano,xrp,polkadot,avalanche-2');
      const data = await res.json();
      setCoins(data.coins || []);
      const btc = data.coins?.find(c => c.coinId === 'bitcoin');
      if (btc) {
        setBtcPrice(btc.price);
        setBtcChange(btc.change24h);
      }
    } catch (err) {
      console.error('Failed to fetch prices:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMarkets = async () => {
    try {
      const res = await fetch('/api/markets?status=open&limit=50');
      const data = await res.json();
      const filtered = (data.markets || []).filter(m => 
        m.category === 'crypto' && m.question.toLowerCase().includes(selectedTimer.toString())
      );
      setMarkets(filtered);
    } catch (err) {
      console.error('Failed to fetch markets:', err);
    }
  };

  const formatPrice = (price) => {
    if (!price) return '...';
    if (price >= 1000) return price.toLocaleString('en-US', { maximumFractionDigits: 0 });
    if (price >= 1) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return price.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 6 });
  };

  const formatChange = (change) => {
    if (change === null || change === undefined) return '...';
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <main className="max-w-7xl mx-auto px-4 pb-20">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
        <h1 className="page-title">₿ Crypto Bets</h1>
        <div style={{
          background: 'var(--bg-secondary)',
          padding: '12px 24px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <i className="fa-solid fa-clock" style={{color: '#f7931a'}}></i>
          <span style={{fontSize: '1.5rem', fontWeight: 'bold', fontFamily: 'monospace'}}>
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      <div className="card" style={{marginBottom: '20px', padding: '20px'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
            <img src="https://assets.coingecko.com/coins/images/1/small/bitcoin.png" alt="BTC" style={{width: '48px', height: '48px'}} />
            <div>
              <div style={{fontSize: '1.25rem', fontWeight: 'bold'}}>Bitcoin</div>
              <div style={{color: 'var(--text-muted)', fontSize: '0.875rem'}}>BTC/USD</div>
            </div>
          </div>
          <div style={{textAlign: 'right'}}>
            <div style={{fontSize: '1.75rem', fontWeight: 'bold'}}>${formatPrice(btcPrice)}</div>
            <div style={{
              color: btcChange >= 0 ? '#00e676' : '#ff5252',
              fontSize: '1rem',
              fontWeight: '600'
            }}>
              {formatChange(btcChange)}
            </div>
          </div>
        </div>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px', marginBottom: '20px'}}>
        {coins.filter(c => c.coinId !== 'bitcoin').map(coin => (
          <div key={coin.coinId} className="card" style={{padding: '16px', textAlign: 'center'}}>
            <div style={{fontWeight: 'bold', marginBottom: '4px', textTransform: 'uppercase'}}>{coin.coinId}</div>
            <div style={{fontSize: '1.25rem', fontWeight: 'bold'}}>${formatPrice(coin.price)}</div>
            <div style={{
              color: coin.change24h >= 0 ? '#00e676' : '#ff5252',
              fontSize: '0.875rem'
            }}>
              {formatChange(coin.change24h)}
            </div>
          </div>
        ))}
      </div>

      <h2 style={{marginBottom: '16px', fontSize: '1.25rem', fontWeight: '600'}}>Timer Markets</h2>
      <div style={{display: 'flex', gap: '8px', marginBottom: '20px'}}>
        {TIMERS.map(timer => (
          <button
            key={timer.value}
            className={`btn ${selectedTimer === timer.value ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setSelectedTimer(timer.value)}
            style={{padding: '8px 20px'}}
          >
            {timer.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="empty-state">Loading markets...</div>
      ) : markets.length === 0 ? (
        <div className="empty-state">
          <h3>No {selectedTimer}m markets</h3>
          <p>Check back when new markets are created</p>
        </div>
      ) : (
        <div className="market-list">
          {markets.map(market => {
            const total = market.yes_pool + market.no_pool;
            const yesPercent = total > 0 ? Math.round((market.yes_pool / total) * 100) : 50;
            const noPercent = 100 - yesPercent;
            const yesOdds = total > 0 ? (total / (market.yes_pool || 1)).toFixed(2) : 1.00;
            const noOdds = total > 0 ? (total / (market.no_pool || 1)).toFixed(2) : 1.00;
            
            return (
              <div key={market.id} className="market-card" style={{borderColor: 'rgba(247, 147, 26, 0.3)'}}>
                <div className="market-header">
                  <div style={{flex: 1}}>
                    <div style={{marginBottom: '8px'}}>
                      <span className="category-tag" style={{
                        background: 'rgba(247, 147, 26, 0.1)',
                        color: '#f7931a',
                        border: '1px solid rgba(247, 147, 26, 0.3)',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '0.75rem'
                      }}>
                        <i className="fa-brands fa-bitcoin" style={{marginRight: '4px'}}></i>
                        CRYPTO
                      </span>
                    </div>
                    <Link to={`/market/${market.id}`} style={{textDecoration: 'none'}}>
                      <div className="market-question">{market.question}</div>
                    </Link>
                    <div className="market-meta">
                      by {market.creator_name} • KSH {(market.yes_pool + market.no_pool).toLocaleString()}
                    </div>
                  </div>
                  <span className="resolved-badge open">🟢 OPEN</span>
                </div>
                
                <div className="price-bar-container">
                  <div className="price-bar" style={{width: `${yesPercent}%`, background: 'linear-gradient(90deg, #f7931a, #ffb74d)'}}></div>
                </div>
                
                <div className="market-odds">
                  <div className="odds-box odds-yes" style={{borderLeftColor: '#f7931a'}}>
                    <div className="odds-label" style={{color: '#fff'}}>YES</div>
                    <div className="odds-value" style={{color: '#f7931a'}}>{yesPercent}<span style={{fontSize: '0.7em', color: 'var(--text-muted)'}}>.0</span></div>
                    <div style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>@ {yesOdds}x</div>
                  </div>
                  <div className="odds-box odds-no" style={{borderLeftColor: '#ff5252'}}>
                    <div className="odds-label" style={{color: '#fff'}}>NO</div>
                    <div className="odds-value" style={{color: '#ff5252'}}>{noPercent}<span style={{fontSize: '0.7em', color: 'var(--text-muted)'}}>.0</span></div>
                    <div style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>@ {noOdds}x</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}