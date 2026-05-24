import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/pages/ResetPassword.tsx
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
export default function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const handleReset = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            return alert("Passwords do not match!");
        }
        try {
            const res = await fetch(`http://localhost:5000/api/auth/reset-password/${token}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newPassword: password })
            });
            const data = await res.json();
            if (res.ok) {
                alert("Password reset successfully! Redirecting to login...");
                navigate('/login');
            }
            else {
                alert(data.message || "Failed to reset password.");
            }
        }
        catch (err) {
            console.error(err);
            alert("Network error connecting to the server.");
        }
    };
    return (_jsx("div", { style: { display: 'flex', height: '100vh', width: '100vw', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6', fontFamily: 'sans-serif' }, children: _jsxs("form", { onSubmit: handleReset, style: { backgroundColor: '#ffffff', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', maxWidth: '400px', width: '100%' }, children: [_jsx("h2", { style: { textAlign: 'center', marginBottom: '8px', fontSize: '1.75rem', fontWeight: '700' }, children: "Create New Password" }), _jsx("p", { style: { textAlign: 'center', color: '#6b7280', fontSize: '0.9rem', marginBottom: '24px' }, children: "Please enter your new password below." }), _jsxs("div", { style: { marginBottom: '16px' }, children: [_jsx("label", { style: { display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }, children: "New Password" }), _jsx("input", { type: "password", required: true, value: password, onChange: (e) => setPassword(e.target.value), style: { width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', boxSizing: 'border-box' } })] }), _jsxs("div", { style: { marginBottom: '24px' }, children: [_jsx("label", { style: { display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }, children: "Confirm New Password" }), _jsx("input", { type: "password", required: true, value: confirmPassword, onChange: (e) => setConfirmPassword(e.target.value), style: { width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', boxSizing: 'border-box' } })] }), _jsx("button", { type: "submit", style: { width: '100%', backgroundColor: '#000000', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }, children: "Reset Password" })] }) }));
}
