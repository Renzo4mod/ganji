import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import CreateMarket from './pages/CreateMarket';
import MyBets from './pages/MyBets';
import MarketDetail from './pages/MarketDetail';

function Navbar() {
  const { user, logout } = useAuth();
  
  return (
    <nav className="navbar">
      <Link to="/" className="logo">KSH Bets</Link>
      {user ? (
        <div className="nav-links">
          <span className="balance">KSH {user.balance?.toLocaleString()}</span>
          <Link to="/">Markets</Link>
          <Link to="/create">Create Market</Link>
          <Link to="/my-bets">My Bets</Link>
          <button className="btn btn-secondary" onClick={logout}>Logout</button>
        </div>
      ) : (
        <div className="nav-links">
          <Link to="/login">Login / Register</Link>
        </div>
      )}
    </nav>
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
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
