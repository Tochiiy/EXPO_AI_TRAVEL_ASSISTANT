import React, { useContext } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import AnimatedPlane from '../components/AnimatedPlane';

export default function Home() {
  const auth = useContext(AuthContext);

  if (auth?.token) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="hero-background" style={{
      minHeight: '100vh', 
      paddingTop: '65px', 
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#ffffff',
      textAlign: 'center',
      padding: '20px',
      boxSizing: 'border-box',
      position: 'relative'
    }}>
      
      <AnimatedPlane />

      <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', fontWeight: '800', marginBottom: '16px', textShadow: '0 4px 6px rgba(0,0,0,0.3)' }}>
          Explore the World with ExpoTravel.AI
        </h1>
        
        <p style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)', maxWidth: '600px', marginBottom: '40px', lineHeight: '1.6', textShadow: '0 2px 4px rgba(0,0,0,0.3)', color: '#f3f4f6' }}>
          Your personal, intelligent travel assistant. Discover new cities, find real-time flights, and book stunning accommodations in seconds.
        </p>
        
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to="/signup" style={{ 
            backgroundColor: '#10b981', color: '#ffffff', padding: '14px 32px', borderRadius: '30px', 
            textDecoration: 'none', fontWeight: 'bold', fontSize: '1.1rem', boxShadow: '0 4px 6px rgba(0,0,0,0.2)'
          }}>
            Start Planning Free
          </Link>
          <Link to="/login" style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.1)', color: '#ffffff', border: '2px solid #ffffff', 
            padding: '12px 32px', borderRadius: '30px', textDecoration: 'none', fontWeight: 'bold', 
            fontSize: '1.1rem', backdropFilter: 'blur(5px)' 
          }}>
            Sign In
          </Link>
        </div>
      </div>

    </div>
  );
}