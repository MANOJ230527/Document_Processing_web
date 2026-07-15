import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginUser, registerUser } from '../services/authService';
import './AuthPage.css';

const CloudUploadIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M7 16a4 4 0 0 1-.88-7.903A5 5 0 1 1 15.9 6L16 6a5 5 0 0 1 1 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
      stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function AuthPage({ mode }) {
  const isLogin = mode === 'login';
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm]     = useState({ name: '', email: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = e => { setForm(p => ({ ...p, [e.target.name]: e.target.value })); setError(''); };

  const onSubmit = async e => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      let data;
      if (isLogin) {
        data = await loginUser(form.email, form.password);
      } else {
        if (!form.name.trim()) { setError('Full name is required.'); setLoading(false); return; }
        data = await registerUser(form.name, form.email, form.password);
      }
      login(data.user, data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-box">

        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-mark"><CloudUploadIcon /></div>
          <span className="auth-logo-name">FileFlow</span>
        </div>

        {/* Heading */}
        <h1 className="auth-title">{isLogin ? 'Sign in to your account' : 'Create an account'}</h1>
        <p className="auth-subtitle">
          {isLogin ? 'Enter your credentials to continue.' : 'Start processing files in seconds — free.'}
        </p>

        {/* Error */}
        {error && (
          <div className="auth-err">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{flexShrink:0,marginTop:1}}>
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M8 5v3M8 10.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={onSubmit}>
          {!isLogin && (
            <div className="field">
              <label className="field-label">Full name</label>
              <input className="field-input" type="text" name="name"
                value={form.name} onChange={onChange}
                placeholder="Jane Smith" required autoFocus={!isLogin} />
            </div>
          )}
          <div className="field">
            <label className="field-label">Email address</label>
            <input className="field-input" type="email" name="email"
              value={form.email} onChange={onChange}
              placeholder="jane@example.com" required autoFocus={isLogin} />
          </div>
          <div className="field">
            <label className="field-label">Password</label>
            <input className="field-input" type="password" name="password"
              value={form.password} onChange={onChange}
              placeholder={isLogin ? '••••••••' : 'Minimum 6 characters'} required />
          </div>
          <button className="auth-submit" type="submit" disabled={loading}>
            {loading
              ? <><span className="mini-spinner" />{isLogin ? 'Signing in…' : 'Creating account…'}</>
              : isLogin ? 'Sign in' : 'Create account'}
          </button>
        </form>

        {/* Footer */}
        <p className="auth-footer">
          {isLogin
            ? <>Don't have an account? <Link to="/register">Sign up free</Link></>
            : <>Already have an account? <Link to="/login">Sign in</Link></>}
        </p>
      </div>
    </div>
  );
}
