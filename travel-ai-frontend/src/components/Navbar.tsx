import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Navbar() {
  const auth = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  const navigate = useNavigate();

  const [profileImage, setProfileImage] = useState<string>(
    auth?.user?.avatar || localStorage.getItem('user_avatar') || `https://ui-avatars.com/api/?name=${auth?.user?.name || 'User'}&background=000000&color=ffffff`
  );

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
    const myWidget = window.cloudinary.createUploadWidget(
      {
        cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
        uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
        cropping: true,
        multiple: false,
        resourceType: "image",
      },
      async (error: any, result: any) => {
        if (!error && result && result.event === "success") {
          const uploadedUrl = result.info.secure_url;
          setProfileImage(uploadedUrl);
          localStorage.setItem('user_avatar', uploadedUrl);

          if (auth?.token) {
            try {
              
              const API_URL = 'https://expo-ai-travel-assistant.onrender.com';
              
              await fetch(`${API_URL}/api/auth/avatar`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${auth.token}`
                },
                body: JSON.stringify({ avatarUrl: uploadedUrl })
              });
              
              if (auth.refreshUser) await auth.refreshUser();
            } catch (err) {
              console.error("Failed to save avatar to DB", err);
            }
          }
        }
      }
    );
    myWidget.open();
  }
};

  return (
    <nav style={{ 
      height: '65px', backgroundColor: '#ffffff', borderBottom: '1px solid #e5e7eb', 
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
      padding: '0 24px', position: 'fixed', top: 0, left: 0, right: 0, width: '100%', 
      zIndex: 1000, boxSizing: 'border-box' 
    }}>
      
      <Link to="/" style={{ fontWeight: 'bold', fontSize: '1.25rem', color: '#111827', textDecoration: 'none' }}>
        ✈️ ExpoTravel.AI
      </Link>
      
      {/* DESKTOP CENTER LINKS */}
      {isDesktop && (
        <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
          {auth?.token ? (
            <>
              <Link to="/" style={{ fontSize: '0.95rem', color: '#4b5563', textDecoration: 'none', fontWeight: '500' }}>Dashboard</Link>
              <Link to="/itineraries" style={{ fontSize: '0.95rem', color: '#4b5563', textDecoration: 'none', fontWeight: '500' }}>My Trips</Link>
            </>
          ) : (
            /*  ADDED HOME LINK FOR LOGGED OUT USERS */
            <Link to="/" style={{ fontSize: '0.95rem', color: '#4b5563', textDecoration: 'none', fontWeight: '500' }}>Home</Link>
          )}
          <Link to="/about" style={{ fontSize: '0.95rem', color: '#4b5563', textDecoration: 'none', fontWeight: '500' }}>About</Link>
        </div>
      )}

      {/* DESKTOP RIGHT PROFILE / LOGIN */}
      {isDesktop && (
        <div>
          {auth?.token ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img 
                  src={profileImage} 
                  onClick={handleImageUpload} 
                  onError={(e) => e.currentTarget.src = `https://ui-avatars.com/api/?name=${auth?.user?.name || 'User'}&background=000000&color=ffffff`}
                  title="Change Avatar" 
                  alt="Profile" 
                  style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', cursor: 'pointer', border: '1px solid #e5e7eb' }} 
                />
                <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#111827' }}>{auth.user?.name}</div>
              </div>
              <button onClick={handleLogout} style={{ background: 'none', border: '1px solid #e5e7eb', padding: '6px 16px', borderRadius: '6px', cursor: 'pointer', color: '#ef4444' }}>Log Out</button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '15px' }}>
              <Link to="/login" style={{ textDecoration: 'none', color: '#111827', fontWeight: '500' }}>Sign In</Link>
              <Link to="/signup" style={{ textDecoration: 'none', backgroundColor: '#000000', color: '#ffffff', padding: '8px 16px', borderRadius: '6px' }}>Sign Up</Link>
            </div>
          )}
        </div>
      )}

      {/* MOBILE HAMBURGER ICON */}
      {!isDesktop && (
        <button onClick={() => setIsOpen(!isOpen)} style={{ background: 'none', border: 'none', fontSize: '1.75rem', cursor: 'pointer' }}>
          {isOpen ? '✕' : '☰'}
        </button>
      )}

      {/* MOBILE DROPDOWN MENU */}
      {!isDesktop && isOpen && (
        <div style={{ position: 'absolute', top: '65px', left: 0, width: '100%', backgroundColor: '#ffffff', borderBottom: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', padding: '16px 24px', gap: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          
          {auth?.token && (
             <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '12px', borderBottom: '1px solid #f3f4f6' }}>
               <img 
                 src={profileImage} 
                 onClick={handleImageUpload} 
                 onError={(e) => e.currentTarget.src = `https://ui-avatars.com/api/?name=${auth?.user?.name || 'User'}&background=000000&color=ffffff`}
                 alt="Profile" 
                 style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', cursor: 'pointer' }} 
               />
               <div>
                 <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>{auth.user?.name}</div>
                 <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{auth.user?.email}</div>
               </div>
             </div>
          )}

          {auth?.token ? (
            <>
              <Link to="/" onClick={() => setIsOpen(false)} style={{ textDecoration: 'none', color: '#4b5563' }}>Dashboard</Link>
              <Link to="/itineraries" onClick={() => setIsOpen(false)} style={{ textDecoration: 'none', color: '#4b5563' }}>My Trips</Link>
            </>
          ) : (
            /* ADDED HOME LINK FOR LOGGED OUT MOBILE USERS */
            <Link to="/" onClick={() => setIsOpen(false)} style={{ textDecoration: 'none', color: '#4b5563' }}>Home</Link>
          )}
          
          <Link to="/about" onClick={() => setIsOpen(false)} style={{ textDecoration: 'none', color: '#4b5563' }}>About</Link>
          
          {auth?.token ? (
            <button onClick={handleLogout} style={{ textAlign: 'left', background: 'none', border: 'none', padding: 0, color: '#ef4444', fontSize: '1rem' }}>Log Out</button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Link to="/login" onClick={() => setIsOpen(false)} style={{ textDecoration: 'none', color: '#111827' }}>Sign In</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}