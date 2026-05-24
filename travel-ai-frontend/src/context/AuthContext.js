import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useState, useEffect } from 'react';
export const AuthContext = createContext(null);
export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [user, setUser] = useState(() => {
        const stored = localStorage.getItem('user');
        return (stored && stored !== 'undefined') ? JSON.parse(stored) : null;
    });
    // 1. Fetch fresh data on refresh
    useEffect(() => {
        const loadFreshUser = async () => {
            const storedToken = localStorage.getItem('token');
            if (!storedToken)
                return;
            try {
                const res = await fetch('http://localhost:5000/api/auth/me', {
                    headers: { 'Authorization': `Bearer ${storedToken}` }
                });
                if (res.ok) {
                    const updatedUser = await res.json();
                    setUser(updatedUser);
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                }
                else {
                    logout(); // If token is invalid/expired, log them out
                }
            }
            catch (err) {
                console.error("Failed to load fresh user data on refresh", err);
            }
        };
        loadFreshUser();
    }, []);
    const saveAuthState = (newToken, newUser) => {
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));
    };
    const login = async (email, password) => {
        const res = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok)
            throw new Error(data.message || 'Login failed');
        saveAuthState(data.token, data.user);
    };
    // The Signup Function
    const signup = async (name, email, password) => {
        const res = await fetch('http://localhost:5000/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });
        const data = await res.json();
        if (!res.ok)
            throw new Error(data.message || 'Signup failed');
        saveAuthState(data.token, data.user);
    };
    const refreshUser = async () => {
        if (!token)
            return;
        try {
            const res = await fetch('http://localhost:5000/api/auth/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const updatedUser = await res.json();
                setUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser));
            }
        }
        catch (err) {
            console.error("Refresh failed", err);
        }
    };
    // Logout Function
    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.clear();
    };
    return (_jsx(AuthContext.Provider, { value: { token, user, login, signup, logout, refreshUser }, children: children }));
};
