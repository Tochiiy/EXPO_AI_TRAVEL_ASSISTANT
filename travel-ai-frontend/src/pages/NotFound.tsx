import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      paddingTop: '65px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f9fafb',
      textAlign: 'center',
      padding: '20px'
    }}>
      <h1 style={{ fontSize: '8rem', margin: '0', color: '#111827', fontWeight: '900', lineHeight: '1' }}>
        404
      </h1>
      
      <h2 style={{ fontSize: '2rem', marginBottom: '16px', color: '#374151', fontWeight: 'bold' }}>
        Looks like you wandered off the map! 🗺️
      </h2>
      
      <p style={{ fontSize: '1.1rem', color: '#6b7280', marginBottom: '40px', maxWidth: '500px', lineHeight: '1.6' }}>
        The destination you are looking for doesn't exist, has been moved, or is currently undiscovered territory.
      </p>
      
      <Link to="/" style={{ 
        backgroundColor: '#000000', 
        color: '#ffffff', 
        padding: '14px 32px', 
        borderRadius: '8px', 
        textDecoration: 'none', 
        fontWeight: 'bold',
        fontSize: '1.1rem',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        Take Me Home
      </Link>
    </div>
  );
}