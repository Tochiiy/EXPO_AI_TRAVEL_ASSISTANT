import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
export default function Navbar() {
    const auth = useContext(AuthContext);
    const [isOpen, setIsOpen] = useState(false);
    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
    const navigate = useNavigate();
    const [profileImage, setProfileImage] = useState(auth?.user?.avatar || localStorage.getItem('user_avatar') || `https://ui-avatars.com/api/?name=${auth?.user?.name || 'User'}&background=000000&color=ffffff`);
    useEffect(() => {
        if (auth?.user?.avatar) {
            setProfileImage(auth.user.avatar);
            localStorage.setItem('user_avatar', auth.user.avatar);
        }
    }, [auth?.user]);
    useEffect(() => {
        const handleResize = () => setIsDesktop(window.innerWidth >= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    const handleLogout = () => {
        auth?.logout();
        setIsOpen(false);
        navigate('/login');
    };
    const handleImageUpload = () => {
        // @ts-ignore
        if (window.cloudinary) {
            // @ts-ignore
            const myWidget = window.cloudinary.createUploadWidget({
                cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
                uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
                cropping: true,
                multiple: false,
                resourceType: "image",
            }, async (error, result) => {
                if (!error && result && result.event === "success") {
                    const uploadedUrl = result.info.secure_url;
                    setProfileImage(uploadedUrl);
                    localStorage.setItem('user_avatar', uploadedUrl);
                    if (auth?.token) {
                        try {
                            await fetch('http://localhost:5000/api/auth/avatar', {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${auth.token}`
                                },
                                body: JSON.stringify({ avatarUrl: uploadedUrl })
                            });
                            if (auth.refreshUser)
                                await auth.refreshUser();
                        }
                        catch (err) {
                            console.error("Failed to save avatar to DB", err);
                        }
                    }
                }
            });
            myWidget.open();
        }
    };
    return (_jsxs("nav", { style: {
            height: '65px', backgroundColor: '#ffffff', borderBottom: '1px solid #e5e7eb',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 24px', position: 'fixed', top: 0, left: 0, right: 0, width: '100%',
            zIndex: 1000, boxSizing: 'border-box'
        }, children: [_jsx(Link, { to: "/", style: { fontWeight: 'bold', fontSize: '1.25rem', color: '#111827', textDecoration: 'none' }, children: "\u2708\uFE0F ExpoTravel.AI" }), isDesktop && (_jsxs("div", { style: { display: 'flex', gap: '30px', alignItems: 'center' }, children: [auth?.token ? (_jsxs(_Fragment, { children: [_jsx(Link, { to: "/", style: { fontSize: '0.95rem', color: '#4b5563', textDecoration: 'none', fontWeight: '500' }, children: "Dashboard" }), _jsx(Link, { to: "/itineraries", style: { fontSize: '0.95rem', color: '#4b5563', textDecoration: 'none', fontWeight: '500' }, children: "My Trips" })] })) : (_jsx(Link, { to: "/", style: { fontSize: '0.95rem', color: '#4b5563', textDecoration: 'none', fontWeight: '500' }, children: "Home" })), _jsx(Link, { to: "/about", style: { fontSize: '0.95rem', color: '#4b5563', textDecoration: 'none', fontWeight: '500' }, children: "About" })] })), isDesktop && (_jsx("div", { children: auth?.token ? (_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '20px' }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '10px' }, children: [_jsx("img", { src: profileImage, onClick: handleImageUpload, onError: (e) => e.currentTarget.src = `https://ui-avatars.com/api/?name=${auth?.user?.name || 'User'}&background=000000&color=ffffff`, title: "Change Avatar", alt: "Profile", style: { width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', cursor: 'pointer', border: '1px solid #e5e7eb' } }), _jsx("div", { style: { fontSize: '0.9rem', fontWeight: '600', color: '#111827' }, children: auth.user?.name })] }), _jsx("button", { onClick: handleLogout, style: { background: 'none', border: '1px solid #e5e7eb', padding: '6px 16px', borderRadius: '6px', cursor: 'pointer', color: '#ef4444' }, children: "Log Out" })] })) : (_jsxs("div", { style: { display: 'flex', gap: '15px' }, children: [_jsx(Link, { to: "/login", style: { textDecoration: 'none', color: '#111827', fontWeight: '500' }, children: "Sign In" }), _jsx(Link, { to: "/signup", style: { textDecoration: 'none', backgroundColor: '#000000', color: '#ffffff', padding: '8px 16px', borderRadius: '6px' }, children: "Sign Up" })] })) })), !isDesktop && (_jsx("button", { onClick: () => setIsOpen(!isOpen), style: { background: 'none', border: 'none', fontSize: '1.75rem', cursor: 'pointer' }, children: isOpen ? '✕' : '☰' })), !isDesktop && isOpen && (_jsxs("div", { style: { position: 'absolute', top: '65px', left: 0, width: '100%', backgroundColor: '#ffffff', borderBottom: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', padding: '16px 24px', gap: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }, children: [auth?.token && (_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '12px', borderBottom: '1px solid #f3f4f6' }, children: [_jsx("img", { src: profileImage, onClick: handleImageUpload, onError: (e) => e.currentTarget.src = `https://ui-avatars.com/api/?name=${auth?.user?.name || 'User'}&background=000000&color=ffffff`, alt: "Profile", style: { width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', cursor: 'pointer' } }), _jsxs("div", { children: [_jsx("div", { style: { fontSize: '0.9rem', fontWeight: '600' }, children: auth.user?.name }), _jsx("div", { style: { fontSize: '0.8rem', color: '#6b7280' }, children: auth.user?.email })] })] })), auth?.token ? (_jsxs(_Fragment, { children: [_jsx(Link, { to: "/", onClick: () => setIsOpen(false), style: { textDecoration: 'none', color: '#4b5563' }, children: "Dashboard" }), _jsx(Link, { to: "/itineraries", onClick: () => setIsOpen(false), style: { textDecoration: 'none', color: '#4b5563' }, children: "My Trips" })] })) : (_jsx(Link, { to: "/", onClick: () => setIsOpen(false), style: { textDecoration: 'none', color: '#4b5563' }, children: "Home" })), _jsx(Link, { to: "/about", onClick: () => setIsOpen(false), style: { textDecoration: 'none', color: '#4b5563' }, children: "About" }), auth?.token ? (_jsx("button", { onClick: handleLogout, style: { textAlign: 'left', background: 'none', border: 'none', padding: 0, color: '#ef4444', fontSize: '1rem' }, children: "Log Out" })) : (_jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: '16px' }, children: _jsx(Link, { to: "/login", onClick: () => setIsOpen(false), style: { textDecoration: 'none', color: '#111827' }, children: "Sign In" }) }))] }))] }));
}
