// src/modules/auth/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../shared/lib/supabaseClient';
import { Eye, EyeOff } from 'lucide-react';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFacebookLoading, setIsFacebookLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    if (errors.length) setErrors([]);
  };

  const validateForm = () => {
    const newErrors = [];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) newErrors.push('Email address is required');
    else if (!emailRegex.test(formData.email)) newErrors.push('Please enter a valid email');
    if (!formData.password) newErrors.push('Password is required');
    else if (formData.password.length < 6) newErrors.push('Password must be at least 6 characters');
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors([]);
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setIsLoading(false);
      return;
    }
    try {
      const result = await login(formData.email.trim(), formData.password);
      if (result.success) {
        const role = result.user.role.replace('_', '-');
        const rolePathMap = {
          tenant: '/dashboard/tenant',
          landlord: '/dashboard/landlord',
          manager: '/dashboard/manager',
          'service-provider': '/dashboard/provider',
          'estate-firm': '/dashboard/estate-firm',
          admin: '/admin',
          'super-admin': '/super-admin'
        };
        const target = rolePathMap[role] || '/dashboard';
        navigate(target);
      } else {
        setErrors([result.error || 'Login failed.']);
      }
    } catch (error) {
      setErrors(['An unexpected error occurred.']);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrors([]);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: { access_type: 'offline', prompt: 'consent' }
        }
      });
      if (error) throw error;
    } catch (error) {
      console.error('Google signin error:', error);
      setErrors(['Google sign-in failed. Please try again.']);
      setIsLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
  setIsFacebookLoading(true);
  setErrors([]);
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: 'https://renteasy-frontend-xi.vercel.app/auth/callback',
      },
    });
    if (error) throw error;
  } catch (error) {
    console.error('Facebook login error:', error);
    setErrors(['Facebook login failed. Please try again.']);
    setIsFacebookLoading(false);
  }
};

  return (
    <div className="login-page">
      <div className="login-background">
        <video autoPlay muted loop playsInline className="bg-video">
          <source src="/videos/login-bg.mp4" type="video/mp4" />
        </video>
        <div className="bg-overlay"></div>
      </div>
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h2 className="login-title">Welcome Back</h2>
            <p className="login-subtitle">Sign in to your account</p>
          </div>

          {errors.length > 0 && (
            <div className="error-alert">
              {errors.map((err, i) => <p key={i} className="error-text">⚠️ {err}</p>)}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input type="email" id="email" value={formData.email} onChange={handleInputChange} className="form-input" placeholder="you@example.com" disabled={isLoading} />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="password-input-wrapper">
                <input type={showPassword ? "text" : "password"} id="password" value={formData.password} onChange={handleInputChange} className="form-input" placeholder="••••••••" disabled={isLoading} />
                <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)} tabIndex="-1">
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <button type="submit" className="submit-button" disabled={isLoading}>{isLoading ? 'Authenticating...' : 'Sign In'}</button>
            <div className="forgot-password"><Link to="/forgot-password" className="forgot-link">Forgot password?</Link></div>
          </form>

          <div className="divider"><span className="divider-text">OR</span></div>
<div className="social-buttons">
  <button 
  type="button" 
  className="google-button coming-soon" 
  disabled
  onClick={() => alert('Google sign-in is coming soon! Please use email or Facebook.')}
>
  <svg className="google-icon" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
  Coming Soon
</button>
  <button type="button" className="facebook-button" onClick={handleFacebookLogin} disabled={isLoading || isFacebookLoading}>
    <svg className="facebook-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#1877F2" d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07C0 18.1 4.39 23.12 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.95h-1.5c-1.5 0-1.96.93-1.96 1.89v2.26h3.32l-.53 3.49h-2.8V24C19.62 23.12 24 18.1 24 12.07z"/>
    </svg>
    {isFacebookLoading ? 'Processing...' : 'Sign up with Facebook'}
  </button>
</div>
          <div className="registration-link">
            <p className="registration-text">Don't have an account? <Link to="/signup" className="registration-action">Create account</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;