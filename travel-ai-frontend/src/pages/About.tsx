import React from 'react';
import { Link } from 'react-router-dom';
import AnimatedPlane from '../components/AnimatedPlane';

export default function About() {
  const destinations = [
    { name: 'Paris', url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=500&q=80' },
    { name: 'Tokyo', url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=500&q=80' },
    { name: 'New York', url: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=500&q=80' },
    { name: 'Rome', url: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=500&q=80' },
    { name: 'Dubai', url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=500&q=80' },
    { name: 'Sydney', url: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=500&q=80' },
    { name: 'Cape Town', url: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&w=500&q=80' },
    { name: 'Rio de Janeiro', url: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=500&q=80' }
  ];

  return (
    <div className="hero-background" style={{ 
      minHeight: '100vh', paddingTop: '65px', display: 'flex', flexDirection: 'column', 
      alignItems: 'center', paddingBottom: '60px', fontFamily: 'sans-serif', position: 'relative' 
    }}>

      <AnimatedPlane />
      
      <div style={{ 
        position: 'relative', zIndex: 10, maxWidth: '900px', width: '90%', 
        backgroundColor: '#ffffff', padding: '50px', borderRadius: '16px', 
        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)', marginTop: '40px'
      }}>
        
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '16px', textAlign: 'center' }}>
          Welcome to ExpoTravel.AI
        </h1>
        
        <p style={{ fontSize: '1.15rem', color: '#4b5563', lineHeight: '1.7', marginBottom: '40px', textAlign: 'center', maxWidth: '700px', margin: '0 auto 40px auto' }}>
          Your intelligent, travel companion. Powered by Ai, our AI doesn't just chat—it actively searches, plans, and organizes your dream itineraries with human-in-the-loop precision.
        </p>

        <div style={{ marginBottom: '50px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '20px', textAlign: 'center' }}>Discover Top Destinations</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            {destinations.map((city, idx) => (
              <div key={idx} style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', height: '250px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                <img 
                  src={city.url} alt={city.name} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }} 
                  onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px', background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}>
                  <span style={{ color: '#ffffff', fontWeight: 'bold', fontSize: '1.1rem' }}>{city.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '50px' }}>
          <div style={{ padding: '24px', backgroundColor: '#f3f4f6', borderRadius: '12px' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '1.25rem', color: '#111827' }}>🧠 Intelligent Routing</h3>
            <p style={{ margin: 0, color: '#4b5563', lineHeight: '1.6' }}>Our AI engine automatically detects when to chat and when to trigger complex multi-agent workflows.</p>
          </div>
          <div style={{ padding: '24px', backgroundColor: '#f3f4f6', borderRadius: '12px' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '1.25rem', color: '#111827' }}>🔒 Secure & Private</h3>
            <p style={{ margin: 0, color: '#4b5563', lineHeight: '1.6' }}>Your data is secured using industry-standard JWT authentication and encrypted MongoDB storage.</p>
          </div>
        </div>

        <div style={{ backgroundColor: '#111827', color: '#ffffff', padding: '40px 30px', borderRadius: '16px', textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: '0 0 8px 0' }}>Meet the Developer</h2>
          <p style={{ color: '#9ca3af', fontSize: '1rem', marginBottom: '24px' }}>Architect & Full-Stack Engineer behind ExpoTravel.AI</p>
          <div style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '16px' }}>Tochukwu Sunday</div>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap' }}>
            <a href="mailto:Tochukwusun24@gmail.com" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#10b981', textDecoration: 'none', fontWeight: '500', fontSize: '1.1rem' }}>
              ✉️ Tochukwusun24@gmail.com
            </a>
            <a href="https://github.com/yourusername" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#93c5fd', textDecoration: 'none', fontWeight: '500', fontSize: '1.1rem' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              GitHub Profile
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}