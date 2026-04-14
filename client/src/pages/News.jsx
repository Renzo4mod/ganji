import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function News() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const res = await fetch('/api/news?q=Kenya&pageSize=20');
      const data = await res.json();
      
      if (data.error) {
        setError(data.error);
      } else {
        setArticles(data.articles);
      }
    } catch (err) {
      setError('Failed to fetch news');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="empty-state">Loading Kenya news...</div>;
  if (error) return <div className="empty-state" style={{color: 'var(--danger)'}}>{error}</div>;

  return (
    <main className="max-w-7xl mx-auto px-4 pb-20">
      <h1 className="page-title">Kenya News</h1>
      
      <div className="tabs" style={{marginBottom: '20px'}}>
        <button className="btn btn-secondary" onClick={fetchNews}>
          <i className="fa-solid fa-refresh"></i> Refresh
        </button>
      </div>

      {articles.length === 0 ? (
        <div className="empty-state">
          <h2>No news found</h2>
          <p>Try again later</p>
        </div>
      ) : (
        <div style={{display: 'grid', gap: '16px'}}>
          {articles.map((article, index) => (
            <a 
              key={index}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="card"
              style={{
                display: 'flex',
                gap: '16px',
                textDecoration: 'none',
                padding: '16px',
                border: '1px solid var(--border)'
              }}
            >
              {article.urlToImage && (
                <img 
                  src={article.urlToImage} 
                  alt=""
                  style={{
                    width: '120px',
                    height: '80px',
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
                <div style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>
                  {article.source} • {new Date(article.publishedAt).toLocaleDateString()}
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </main>
  );
}