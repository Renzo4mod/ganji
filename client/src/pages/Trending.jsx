import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Trending() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [converting, setConverting] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchTrending();
  }, []);

  const fetchTrending = async () => {
    try {
      const res = await fetch('/api/news/trending');
      const data = await res.json();
      
      if (data.error) {
        setError(data.error);
      } else {
        setArticles(data.articles);
      }
    } catch (err) {
      setError('Failed to fetch trending news');
    } finally {
      setLoading(false);
    }
  };

  const convertToMarket = async (article) => {
    if (!user) {
      navigate('/login');
      return;
    }

    setConverting(article.url);
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/markets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          question: article.title,
          description: article.description || `Source: ${article.source}`,
          category: 'news',
          closes_at: ''
        })
      });
      
      const data = await res.json();
      
      if (data.market) {
        navigate(`/market/${data.market.id}`);
      } else {
        alert('Failed to create market');
      }
    } catch (err) {
      alert('Failed to create market');
    } finally {
      setConverting(null);
    }
  };

  if (loading) return <div className="empty-state">Loading trending news...</div>;
  if (error) return <div className="empty-state" style={{color: 'var(--danger)'}}>{error}</div>;

  return (
    <main className="max-w-7xl mx-auto px-4 pb-20">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
        <h1 className="page-title">🔥 Trending Stories</h1>
        <button className="btn btn-secondary" onClick={fetchTrending}>
          <i className="fa-solid fa-refresh"></i> Refresh
        </button>
      </div>
      
      <p style={{color: 'var(--text-secondary)', marginBottom: '20px'}}>
        Top trending positive stories from Kenya. Click "Create Bet" to turn any story into a prediction market.
      </p>

      {articles.length === 0 ? (
        <div className="empty-state">
          <h2>No trending stories found</h2>
          <p>Check back later for trending news</p>
        </div>
      ) : (
        <div style={{display: 'grid', gap: '16px'}}>
          {articles.map((article, index) => (
            <div 
              key={index}
              className="card"
              style={{
                display: 'flex',
                gap: '16px',
                padding: '16px',
                border: '1px solid var(--border)'
              }}
            >
              {article.urlToImage && (
                <img 
                  src={article.urlToImage} 
                  alt=""
                  style={{
                    width: '100px',
                    height: '70px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    flexShrink: 0
                  }}
                />
              )}
              <div style={{flex: 1, minWidth: 0}}>
                <h3 style={{
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  marginBottom: '8px',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {article.title}
                </h3>
                <p style={{
                  color: 'var(--text-secondary)',
                  fontSize: '0.875rem',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  marginBottom: '8px'
                }}>
                  {article.description}
                </p>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <span style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>
                    {article.source} • {new Date(article.publishedAt).toLocaleDateString()}
                  </span>
                  <button 
                    className="btn btn-primary"
                    style={{padding: '6px 16px', fontSize: '0.875rem'}}
                    onClick={() => convertToMarket(article)}
                    disabled={converting === article.url}
                  >
                    {converting === article.url ? (
                      <><i className="fa-solid fa-spinner fa-spin"></i> Creating...</>
                    ) : (
                      <><i className="fa-solid fa-plus"></i> Create Bet</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}