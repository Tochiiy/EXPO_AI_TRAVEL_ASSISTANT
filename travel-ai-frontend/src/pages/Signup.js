import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import AnimatedPlane from '../components/AnimatedPlane';
export default function Signup() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const auth = useContext(AuthContext);
    const navigate = useNavigate();
    const handleSignup = async (e) => {
        e.preventDefault();
        try {
            await auth?.signup(name, email, password);
            navigate('/dashboard');
        }
        catch (err) {
            setError(err.message || 'Failed to create account');
        }
    };
    return (_jsxs("div", { className: "hero-background", style: {
            minHeight: '100vh', paddingTop: '65px', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', paddingBottom: '60px',
            fontFamily: 'sans-serif', position: 'relative'
        }, children: [_jsx(AnimatedPlane, {}), _jsx("div", { style: { position: 'relative', zIndex: 10, width: '100%', display: 'flex', justifyContent: 'center' }, children: _jsxs("div", { style: { backgroundColor: '#ffffff', padding: '40px', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', width: '90%', maxWidth: '400px' }, children: [_jsx("h2", { style: { textAlign: 'center', marginBottom: '8px', fontSize: '2rem', fontWeight: 'bold', color: '#111827' }, children: "Create Account" }), _jsx("p", { style: { textAlign: 'center', marginBottom: '24px', color: '#6b7280' }, children: "Join ExpoTravel.AI to start exploring." }), error && _jsx("div", { style: { backgroundColor: '#fee2e2', color: '#ef4444', padding: '12px', borderRadius: '8px', marginBottom: '16px', textAlign: 'center', fontSize: '0.9rem' }, children: error }), _jsxs("form", { onSubmit: handleSignup, style: { display: 'flex', flexDirection: 'column', gap: '16px' }, children: [_jsxs("div", { children: [_jsx("label", { style: { display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: '600', color: '#374151' }, children: "Full Name" }), _jsx("input", { type: "text", value: name, onChange: (e) => setName(e.target.value), required: true, style: { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }, placeholder: "John Doe" })] }), _jsxs("div", { children: [_jsx("label", { style: { display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: '600', color: '#374151' }, children: "Email" }), _jsx("input", { type: "email", value: email, onChange: (e) => setEmail(e.target.value), required: true, style: { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }, placeholder: "you@example.com" })] }), _jsxs("div", { children: [_jsx("label", { style: { display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: '600', color: '#374151' }, children: "Password" }), _jsx("input", { type: "password", value: password, onChange: (e) => setPassword(e.target.value), required: true, style: { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }, placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" })] }), _jsx("button", { type: "submit", style: { backgroundColor: '#000000', color: '#ffffff', padding: '14px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', marginTop: '8px' }, children: "Sign Up" })] }), _jsxs("p", { style: { textAlign: 'center', marginTop: '24px', fontSize: '0.9rem', color: '#6b7280' }, children: ["Already have an account? ", _jsx(Link, { to: "/login", style: { color: '#2563eb', fontWeight: '600', textDecoration: 'none' }, children: "Sign in" })] })] }) })] }));
}
