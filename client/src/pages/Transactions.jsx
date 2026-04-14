import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = () => {
    const token = localStorage.getItem('token');
    fetch('/api/mpesa/history', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setTransactions(data.transactions || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#00e676';
      case 'pending':
      case 'processing': return '#ffc107';
      case 'failed': return '#ff5252';
      default: return 'var(--text-muted)';
    }
  };

  const getTypeIcon = (type) => {
    return type === 'deposit' ? '↓' : '↑';
  };

  const getTypeColor = (type) => {
    return type === 'deposit' ? '#00e676' : '#ff5252';
  };

  const filteredTransactions = transactions.filter(tx => {
    if (filter === 'all') return true;
    return tx.type === filter;
  });

  const totalDeposits = transactions.filter(t => t.type === 'deposit' && t.status === 'completed').reduce((sum, t) => sum + t.amount, 0);
  const totalWithdrawals = transactions.filter(t => t.type === 'withdrawal' && t.status === 'completed').reduce((sum, t) => sum + t.amount, 0);

  if (loading) return <div className="empty-state">Loading transactions...</div>;

  return (
    <div style={{maxWidth: '800px', margin: '0 auto', padding: '0 20px'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px'}}>
        <h1 className="page-title" style={{marginBottom: 0}}>M-Pesa Transactions</h1>
        <button className="btn btn-secondary" onClick={fetchTransactions}>
          <i className="fa-solid fa-refresh"></i> Refresh
        </button>
      </div>

      <div className="stats-grid" style={{marginBottom: '24px'}}>
        <div className="stat-card">
          <div className="stat-value" style={{color: '#00e676'}}>KSH {totalDeposits.toLocaleString()}</div>
          <div className="stat-label">Total Deposits</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{color: '#ff5252'}}>KSH {totalWithdrawals.toLocaleString()}</div>
          <div className="stat-label">Total Withdrawals</div>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
          All
        </button>
        <button className={`tab ${filter === 'deposit' ? 'active' : ''}`} onClick={() => setFilter('deposit')}>
          Deposits
        </button>
        <button className={`tab ${filter === 'withdrawal' ? 'active' : ''}`} onClick={() => setFilter('withdrawal')}>
          Withdrawals
        </button>
      </div>

      {filteredTransactions.length === 0 ? (
        <div className="empty-state">
          <h2>No transactions</h2>
          <p>Your M-Pesa deposits and withdrawals will appear here.</p>
          <div style={{display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '24px'}}>
            <Link to="/deposit">
              <button className="btn btn-success">Make Deposit</button>
            </Link>
            <Link to="/withdraw">
              <button className="btn btn-primary">Withdraw</button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="market-list">
          {filteredTransactions.map(tx => (
            <div key={tx.id} className="card">
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: `${getTypeColor(tx.type)}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    color: getTypeColor(tx.type),
                    fontWeight: 'bold'
                  }}>
                    {getTypeIcon(tx.type)}
                  </div>
                  <div>
                    <div style={{fontWeight: 'bold', textTransform: 'capitalize', fontSize: '1.1rem'}}>
                      {tx.type}
                    </div>
                    <div style={{color: 'var(--text-muted)', fontSize: '0.9rem'}}>
                      {tx.phone}
                    </div>
                    <div style={{color: 'var(--text-muted)', fontSize: '0.85rem'}}>
                      {new Date(tx.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div style={{textAlign: 'right'}}>
                  <div style={{ 
                    fontWeight: 'bold', 
                    fontSize: '1.25rem',
                    color: getTypeColor(tx.type)
                  }}>
                    {tx.type === 'deposit' ? '+' : '-'}KSH {tx.amount.toLocaleString()}
                  </div>
                  <div style={{ 
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 'bold',
                    background: `${getStatusColor(tx.status)}20`,
                    color: getStatusColor(tx.status),
                    textTransform: 'uppercase',
                    marginTop: '8px',
                    display: 'inline-block'
                  }}>
                    {tx.status}
                  </div>
                </div>
              </div>

              {tx.mpesa_receipt && (
                <div style={{ 
                  marginTop: '16px', 
                  padding: '12px',
                  background: 'var(--bg-secondary)',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontFamily: 'monospace'
                }}>
                  <span style={{color: 'var(--text-muted)'}}>Receipt: </span>
                  <span>{tx.mpesa_receipt}</span>
                </div>
              )}

              {tx.reference && (
                <div style={{ 
                  marginTop: '8px', 
                  fontSize: '0.85rem',
                  color: 'var(--text-muted)'
                }}>
                  Ref: {tx.reference}
                </div>
              )}

              {tx.error_message && (
                <div style={{ 
                  marginTop: '12px', 
                  padding: '12px',
                  background: 'rgba(255, 82, 82, 0.1)',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  color: '#ff5252'
                }}>
                  Error: {tx.error_message}
                </div>
              )}

              {tx.completed_at && (
                <div style={{ 
                  marginTop: '8px', 
                  fontSize: '0.85rem',
                  color: '#00e676'
                }}>
                  ✓ Completed: {new Date(tx.completed_at).toLocaleString()}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
