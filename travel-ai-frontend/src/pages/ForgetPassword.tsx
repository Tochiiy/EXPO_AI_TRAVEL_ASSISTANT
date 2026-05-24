// src/pages/ForgotPassword.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Password modification token dispatched to: ${email}`);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6', fontFamily: 'sans-serif' }}>
      <form onSubmit={handleReset} style={{ backgroundColor: '#ffffff', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', maxWidth: '400px', width: '100%' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '8px', fontSize: '1.75rem', fontWeight: '700' }}>Reset Password</h2>
        <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '0.9rem', marginBottom: '24px' }}>Enter email credentials to verify account lookup</p>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>Account Email</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', boxSizing: 'border-box' }} />
        </div>

        <button type="submit" style={{ width: '100%', backgroundColor: '#000000', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', marginBottom: '16px' }}>
          Send Recovery Email
        </button>

        <p style={{ textAlign: 'center', fontSize: '0.85rem', color: '#4b5563' }}>
          <Link to="/login" style={{ color: '#000000', fontWeight: '600', textDecoration: 'none' }}>Return to Sign In</Link>
        </p>
      </form>
    </div>
  );
}