import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import AnimatedPlane from '../components/AnimatedPlane';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const auth = useContext(AuthContext);s
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await auth?.login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to login');
    }
  };

  return (
    <div className="hero-background" style={{ 
      minHeight: '100vh', paddingTop: '65px', display: 'flex', flexDirection: 'column', 
      alignItems: 'center', justifyContent: 'center', paddingBottom: '60px', 
      fontFamily: 'sans-serif', position: 'relative' 
    }}>
      
      <AnimatedPlane />
      
      <div style={{ position: 'relative', zIndex: 10, width: '100%', display: 'flex', justifyContent: 'center' }}>
        <div style={{ backgroundColor: '#ffffff', padding: '40px', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', width: '90%', maxWidth: '400px' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '8px', fontSize: '2rem', fontWeight: 'bold', color: '#111827' }}>Welcome Back</h2>
          <p style={{ textAlign: 'center', marginBottom: '24px', color: '#6b7280' }}>Sign in to continue planning your trips.</p>

          {error && <div style={{ backgroundColor: '#fee2e2', color: '#ef4444', padding: '12px', borderRadius: '8px', marginBottom: '16px', textAlign: 'center', fontSize: '0.9rem' }}>{error}</div>}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: '600', color: '#374151' }}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }} placeholder="you@example.com" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: '600', color: '#374151' }}>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }} placeholder="••••••••" />
            </div>
            
            <Link to="/forgot-password" style={{ fontSize: '0.85rem', color: '#2563eb', textDecoration: 'none', textAlign: 'right' }}>Forgot Password?</Link>
            <button type="submit" style={{ backgroundColor: '#000000', color: '#ffffff', padding: '14px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', marginTop: '8px' }}>Sign In</button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.9rem', color: '#6b7280' }}>
            Don't have an account? <Link to="/signup" style={{ color: '#2563eb', fontWeight: '600', textDecoration: 'none' }}>Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}