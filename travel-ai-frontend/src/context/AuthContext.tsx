import React, { createContext, useState, useEffect, type ReactNode } from 'react';

interface AuthContextType {
  token: string | null;
  user: any | null;
  login: (email: string, password: string) => Promise<void>; 
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>; 
}

// Dynamic API URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  
  const [user, setUser] = useState<any | null>(() => {
    const stored = localStorage.getItem('user');
    return (stored && stored !== 'undefined') ? JSON.parse(stored) : null;
  });

  // 1. Fetch fresh data on refresh
  useEffect(() => {
    const loadFreshUser = async () => {
      const storedToken = localStorage.getItem('token');
      if (!storedToken) return;

      try {
        const res = await fetch(`${API_URL}/api/auth/me`, {
          headers: { 'Authorization': `Bearer ${storedToken}` }
        });
        
        if (res.ok) {
          const updatedUser = await res.json();
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser)); 
        } else {
          logout(); // If token is invalid/expired, log them out
        }
      } catch (err) {
        console.error("Failed to load fresh user data on refresh", err);
      }
    };

    loadFreshUser();
  }, []);

  
  const saveAuthState = (newToken: string, newUser: any) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  
  const login = async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');

    
    saveAuthState(data.token, data.user);
  };

  // The Signup Function
  const signup = async (name: string, email: string, password: string) => {
    const res = await fetch(`${API_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Signup failed');

    
    saveAuthState(data.token, data.user);
  };

  
  const refreshUser = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const updatedUser = await res.json();
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (err) { 
      console.error("Refresh failed", err); 
    }
  };

  // Logout Function
  const logout = () => {
    setToken(null); 
    setUser(null);
    localStorage.clear();
  };

  return (
    <AuthContext.Provider value={{ token, user, login, signup, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};