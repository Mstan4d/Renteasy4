// src/modules/auth/pages/Signup.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../shared/lib/supabaseClient';
import { Eye, EyeOff } from 'lucide-react';
import './Signup.css';

const Signup = () => {
  const [formData, setFormData] = useState({
    email: '', password: '', confirmPassword: '', fullName: '', role: 'tenant'
  });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errors, setErrors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isFacebookLoading, setIsFacebookLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const ROLES = [
    { value: 'tenant', label: 'Tenant', description: 'Looking to rent a property' },
    { value: 'landlord', label: 'Landlord', description: 'Own property to rent out' },
    { value: 'manager', label: 'Property Manager', description: 'Manage properties for landlords' },
    { value: 'service-provider', label: 'Service Provider', description: 'Offer services like cleaning, repairs' },
    { value: 'estate-firm', label: 'Estate Firm', description: 'Real estate company or agency' }
  ];

  const handleInputChange = (e) => {
    const { id, value, type, checked } = e.target;
    if (type === 'checkbox') setTermsAccepted(checked);
    else setFormData(prev => ({ ...prev, [id]: value }));
    if (errors.length) setErrors([]);
  };

  const validateForm = () => {
    const newErrors = [];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) newErrors.push('Email address is required');
    else if (!emailRegex.test(formData.email)) newErrors.push('Please enter a valid email address');
    if (!formData.fullName.trim()) newErrors.push('Full name is required');
    else if (formData.fullName.trim().length < 2) newErrors.push('Full name must be at least 2 characters');
    if (!formData.password) newErrors.push('Password is required');
    else if (formData.password.length < 6) newErrors.push('Password must be at least 6 characters long');
    if (!formData.confirmPassword) newErrors.push('Please confirm your password');
    else if (formData.password !== formData.confirmPassword) newErrors.push('Passwords do not match');
    if (!termsAccepted) newErrors.push('You must accept the Terms & Conditions and Privacy Policy');
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
    const rolePaths = {
      tenant: '/dashboard/tenant',
      landlord: '/dashboard/landlord',
      manager: '/dashboard/manager',
      'service-provider': '/dashboard/provider',
      'estate-firm': '/dashboard/estate-firm'
    };
    try {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
        options: { data: { full_name: formData.fullName.trim(), role: formData.role } }
      });
      if (signUpError) throw signUpError;
      if (authData?.user) {
        const userId = authData.user.id;
        const { error: profileErr } = await supabase.from('profiles').insert([{
          id: userId, email: formData.email.trim(), full_name: formData.fullName.trim(), role: formData.role
        }]);
        if (profileErr) throw profileErr;
     
        const loginResult = await login(formData.email.trim(), formData.password);
        if (loginResult.success) {
          const target = rolePaths[formData.role] || '/dashboard';
          navigate(target);
        } else {
          setErrors([loginResult.error || 'Login failed after signup']);
        }
      }
    } catch (error) {
      console.error("Signup error:", error);
      setErrors([error.message || "An error occurred during setup."]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    if (!formData.role) {
      setErrors(['Please select your role before signing up with Google.']);
      return;
    }
    // Store selected role in sessionStorage to retrieve after OAuth callback
    sessionStorage.setItem('google_signup_role', formData.role);
    sessionStorage.setItem('google_signup_full_name', formData.fullName);
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { access_type: 'offline', prompt: 'consent' }
      }
    });
  };

  const handleFacebookSignup = async () => {
  // Check if a role is selected before proceeding
  if (!formData.role) {
    setErrors(['Please select your role before signing up with Facebook.']);
    return;
  }

  setIsFacebookLoading(true);
  setErrors([]);

  // Store the selected role and name in sessionStorage.
  // This data will be used by the AuthCallback page to finish setting up the user's profile.
  sessionStorage.setItem('facebook_signup_role', formData.role);
  sessionStorage.setItem('facebook_signup_full_name', formData.fullName);

  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
  redirectTo: window.location.origin === 'http://localhost:5173' 
    ? 'http://localhost:5173/auth/callback'
    : 'https://renteasy-frontend-xi.vercel.app/auth/callback',
},
    });
    if (error) throw error;
  } catch (error) {
    console.error('Facebook signup error:', error);
    setErrors(['Facebook sign-up failed. Please try again.']);
    setIsFacebookLoading(false);
  }
};

  return (
    <div className="signup-page">
      <div className="signup-container">
        <div className="signup-card">
          <div className="signup-header">
            <h2>Create Account</h2>
            <p>Join RentEasy in 30 seconds</p>
          </div>
          {errors.length > 0 && (
            <div className="error-alert">
              {errors.map((err, i) => <p key={i} className="error-text">⚠️ {err}</p>)}
            </div>
          )}
          <form onSubmit={handleSubmit} className="signup-form">
            <div className="form-group">
              <label htmlFor="fullName">Full Name *</label>
              <input type="text" id="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="John Doe" disabled={isLoading} required />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input type="email" id="email" value={formData.email} onChange={handleInputChange} placeholder="you@example.com" disabled={isLoading} required />
            </div>
            <div className="form-group password-group">
              <label htmlFor="password">Password *</label>
              <div className="password-input-wrapper">
                <input type={showPassword ? "text" : "password"} id="password" value={formData.password} onChange={handleInputChange} placeholder="••••••••" disabled={isLoading} required />
                <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)} tabIndex="-1">
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <small>Minimum 6 characters</small>
            </div>
            <div className="form-group password-group">
              <label htmlFor="confirmPassword">Confirm Password *</label>
              <div className="password-input-wrapper">
                <input type={showConfirmPassword ? "text" : "password"} id="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} placeholder="••••••••" disabled={isLoading} required />
                <button type="button" className="password-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)} tabIndex="-1">
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="role">I want to join as a *</label>
              <select id="role" value={formData.role} onChange={handleInputChange} disabled={isLoading} required>
                {ROLES.map(role => <option key={role.value} value={role.value}>{role.label}</option>)}
              </select>
              <small>{ROLES.find(r => r.value === formData.role)?.description}</small>
            </div>
            <div className="terms-group">
              <label>
                <input type="checkbox" checked={termsAccepted} onChange={handleInputChange} disabled={isLoading} />
                <span>
                    I agree to the{' '}
                  <Link to="/terms" target="_blank">Terms & Conditions</Link>
                   {' '}and{' '}
                  <Link to="/privacy" target="_blank">Privacy Policy</Link>
                </span>
              </label>
            </div>
            <button type="submit" className="submit-btn" disabled={isLoading || !termsAccepted}>
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
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
  <button type="button" className="facebook-button" onClick={handleFacebookSignup} disabled={isLoading || isFacebookLoading}>
    <svg className="facebook-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#1877F2" d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07C0 18.1 4.39 23.12 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.95h-1.5c-1.5 0-1.96.93-1.96 1.89v2.26h3.32l-.53 3.49h-2.8V24C19.62 23.12 24 18.1 24 12.07z"/>
    </svg>
    {isFacebookLoading ? 'Processing...' : 'Sign up with Facebook'}
  </button>
</div>
            <div className="login-link">Already have an account? <Link to="/login">Sign In</Link></div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;