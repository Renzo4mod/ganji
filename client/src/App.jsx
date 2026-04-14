import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { useState, useEffect, createContext, useContext } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import CreateMarket from './pages/CreateMarket';
import MyBets from './pages/MyBets';
import MarketDetail from './pages/MarketDetail';
import Deposit from './pages/Deposit';
import Withdraw from './pages/Withdraw';
import Transactions from './pages/Transactions';
import News from './pages/News';
import Trending from './pages/Trending';
import Crypto from './pages/Crypto';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import './index-pesapredict.css';

function Navbar() {
  const { user, logout } = useAuth();
  
  return (
    <header className="sticky top-0 z-50 border-b header-bar">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3 shrink-0" style={{textDecoration: 'none'}}>
          <div className="w-8 h-8 rounded-lg logo-icon flex items-center justify-center">
            <i className="fa-solid fa-chart-line text-sm"></i>
          </div>
          <span className="brand-logo hidden sm:block">GANJI</span>
        </Link>
        
        {user ? (
          <div className="nav-links">
            <div className="balance-display hidden sm:flex items-center gap-2">
              <i className="fa-solid fa-wallet text-accent text-sm"></i>
              <span className="text-sm font-medium">KSH {user.balance?.toLocaleString()}</span>
            </div>
            <Link to="/" className="nav-link">Markets</Link>
            <Link to="/trending" className="nav-link">🔥 Trending</Link>
            <Link to="/crypto" className="nav-link">₿ Crypto</Link>
            <Link to="/news" className="nav-link">News</Link>
            <Link to="/create" className="nav-link">Create</Link>
            <Link to="/my-bets" className="nav-link">My Bets</Link>
            <Link to="/deposit" className="deposit-btn">
              <i className="fa-solid fa-mobile-screen-button"></i>
              <span className="hidden sm:inline">Deposit</span>
            </Link>
            <Link to="/withdraw" className="btn btn-secondary" style={{padding: '8px 16px'}}>
              Withdraw
            </Link>
            <Link to="/transactions" className="nav-link">History</Link>
            <button className="btn btn-secondary" onClick={logout}>Logout</button>
          </div>
        ) : (
          <div className="nav-links">
            <Link to="/login" className="nav-link">Login / Register</Link>
          </div>
        )}
      </div>
    </header>
  );
}

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  return children;
}

function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/market/:id" element={<MarketDetail />} />
        <Route path="/create" element={
          <ProtectedRoute><CreateMarket /></ProtectedRoute>
        } />
        <Route path="/my-bets" element={
          <ProtectedRoute><MyBets /></ProtectedRoute>
        } />
        <Route path="/deposit" element={
          <ProtectedRoute><Deposit /></ProtectedRoute>
        } />
        <Route path="/withdraw" element={
          <ProtectedRoute><Withdraw /></ProtectedRoute>
        } />
        <Route path="/transactions" element={
          <ProtectedRoute><Transactions /></ProtectedRoute>
        } />
        <Route path="/news" element={<News />} />
        <Route path="/trending" element={<Trending />} />
        <Route path="/crypto" element={<Crypto />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="app">
          <AppRoutes />
          <footer style={{
            textAlign: 'center',
            padding: '20px',
            marginTop: '40px',
            borderTop: '1px solid var(--border)',
            color: 'var(--text-muted)',
            fontSize: '0.875rem'
          }}>
            <div style={{marginBottom: '8px'}}>
              <Link to="/terms" style={{color: 'var(--text-secondary)', margin: '0 12px'}}>Terms</Link>
              <Link to="/privacy" style={{color: 'var(--text-secondary)', margin: '0 12px'}}>Privacy</Link>
            </div>
            <div>© 2026 GANJI. All rights reserved.</div>
          </footer>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
