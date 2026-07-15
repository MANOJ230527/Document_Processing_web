import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const initials = (user?.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2);

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <div className="navbar-logo">
          <div className="navbar-logo-mark">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M7 16a4 4 0 0 1-.88-7.903A5 5 0 1 1 15.9 6L16 6a5 5 0 0 1 1 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="navbar-logo-name">FileFlow</span>
        </div>

        {/* User menu */}
        <div className="navbar-right" ref={ref}>
          <button className="nav-user-btn" onClick={() => setOpen(o => !o)}>
            <div className="nav-avatar">{initials}</div>
            <span className="nav-user-name">{user?.name}</span>
            <svg className={`nav-chevron ${open ? 'open' : ''}`} width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {open && (
            <div className="nav-dropdown">
              <div className="nav-dropdown-info">
                <div className="nav-dropdown-name">{user?.name}</div>
                <div className="nav-dropdown-email">{user?.email}</div>
              </div>
              <button className="nav-dropdown-btn signout" onClick={logout}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M10 3H4a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h6M7 8h7m0 0l-3-3m3 3l-3 3"
                    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
