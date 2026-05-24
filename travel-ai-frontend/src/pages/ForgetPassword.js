import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/pages/ForgotPassword.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const handleReset = (e) => {
        e.preventDefault();
        alert(`Password modification token dispatched to: ${email}`);
    };
    return (_jsx("div", { style: { display: 'flex', height: '100vh', width: '100vw', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6', fontFamily: 'sans-serif' }, children: _jsxs("form", { onSubmit: handleReset, style: { backgroundColor: '#ffffff', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', maxWidth: '400px', width: '100%' }, children: [_jsx("h2", { style: { textAlign: 'center', marginBottom: '8px', fontSize: '1.75rem', fontWeight: '700' }, children: "Reset Password" }), _jsx("p", { style: { textAlign: 'center', color: '#6b7280', fontSize: '0.9rem', marginBottom: '24px' }, children: "Enter email credentials to verify account lookup" }), _jsxs("div", { style: { marginBottom: '20px' }, children: [_jsx("label", { style: { display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }, children: "Account Email" }), _jsx("input", { type: "email", required: true, value: email, onChange: (e) => setEmail(e.target.value), style: { width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', boxSizing: 'border-box' } })] }), _jsx("button", { type: "submit", style: { width: '100%', backgroundColor: '#000000', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', marginBottom: '16px' }, children: "Send Recovery Email" }), _jsx("p", { style: { textAlign: 'center', fontSize: '0.85rem', color: '#4b5563' }, children: _jsx(Link, { to: "/login", style: { color: '#000000', fontWeight: '600', textDecoration: 'none' }, children: "Return to Sign In" }) })] }) }));
}
