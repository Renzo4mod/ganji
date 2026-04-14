import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const data = isLogin 
        ? await login(form.email, form.password)
        : await register(form.username, form.email, form.password);
      
      if (data.error) {
        setError(data.error);
      } else {
        navigate('/');
      }
    } catch (err) {
      setError('Something went wrong');
    }
  };

  return (
    <div className="auth-container">
      <div style={{textAlign: 'center', marginBottom: '32px'}}>
        <div className="logo-icon" style={{
          width: '64px', height: '64px', borderRadius: '16px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px', fontSize: '24px'
        }}>
          <i className="fa-solid fa-chart-line"></i>
        </div>
        <h1 className="brand-logo" style={{fontSize: '2.5rem', marginBottom: '8px', display: 'block', textDecoration: 'none'}}>
          GANJI
        </h1>
        <p style={{color: 'var(--text-muted)'}}>Kenya's Prediction Market</p>
      </div>

      <div className="card">
        <div className="auth-tabs">
          <button 
            className={`auth-tab ${isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>
          <button 
            className={`auth-tab ${!isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(false)}
          >
            Register
          </button>
        </div>

        {error && (
          <div style={{ color: 'var(--danger)', marginBottom: '20px', padding: '12px', background: 'rgba(255, 82, 82, 0.1)', borderRadius: '8px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                className="input"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                required
                placeholder="Choose a username"
              />
            </div>
          )}
          
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              className="input"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              placeholder="your@email.com"
            />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              className="input"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              placeholder="Enter password"
            />
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px' }}>
            {isLogin ? 'Login' : 'Create Account'}
          </button>
        </form>

        {!isLogin && (
          <p style={{ marginTop: '20px', color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center' }}>
            New accounts start with <strong style={{color: '#00e676'}}>10,000 KSH</strong> demo balance!
          </p>
        )}
      </div>
    </div>
  );
}
