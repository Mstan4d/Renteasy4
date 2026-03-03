// src/modules/auth/pages/Login.jsx - SAFE UPDATE
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../shared/lib/supabaseClient';
import { Eye, EyeOff } from 'lucide-react'; // Ensure this is imported
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false); // New State
  const [errors, setErrors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();


  const roles = [
    { value: 'tenant', label: 'Tenant' },
    { value: 'landlord', label: 'Landlord' },
    { value: 'manager', label: 'Manager' },
    { value: 'service-provider', label: 'Service Provider' },
    { value: 'estate-firm', label: 'Estate Firm' },
    { value: 'admin', label: 'Administrator' }
  ];

  const roleDashboards = {
    tenant: '/dashboard',
    landlord: '/dashboard',
    manager: '/manager-dashboard',
    provider: '/provider-dashboard',
    'estate-firm': '/estate-dashboard',
    admin: '/admin'
  };

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
  const role = result.user.role.replace('_', '-'); // normalize role
  const rolePathMap = {
    'tenant': '/dashboard/tenant',
    'landlord': '/dashboard/landlord',
    'manager': '/dashboard/manager',
    'service-provider': '/dashboard/provider',
    'estate-firm': '/dashboard/estate-firm',
    'admin': '/admin',
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

    
    // Clear any stored signup data (in case this is login, not signup)
   {/*  sessionStorage.removeItem('google_signup_role');
    sessionStorage.removeItem('google_signup_provider_data');
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`, // Direct to dashboard for login
        queryParams: {
          access_type: 'offline',
          prompt: 'consent'
        }
      }
    });

    if (error) throw error;
    
  } catch (error) {
    console.error('Google signin error:', error);
    setErrors(['Google sign-in failed. Please try again.']);
    setIsLoading(false);
  }
};

*/}
  return (
    <div className="login-container">
      <div className="login-card">
        {/* ... Header stays the same ... */}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter your email"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="password-input-wrapper" style={{ position: 'relative' }}>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={formData.password}
                onChange={handleInputChange}
                className="form-input"
                style={{ width: '100%', paddingRight: '40px' }}
                placeholder="••••••••"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? 'Authenticating...' : 'Sign In'}
          </button>

          <div className="forgot-password">
  <Link to="/forgot-password" className="forgot-link">
    Forgot your password?
  </Link>
</div>
        </form>

        

       {/* <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <p style={{ fontSize: '12px', color: '#666' }}>
            System Owner? <Link to="/super-admin/login" style={{ marginLeft: '5px', color: '#3b82f6' }}>Access Super Admin Portal</Link>
          </p>
        </div>

        <div className="divider"><span className="divider-text">OR</span></div>

        <button onClick={handleGoogleSignIn} className="google-button" type="button">
          <svg className="google-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Sign in with Google
        </button>*/}

        <div className="registration-link">
          <p className="registration-text">
            New to RentEasy? <Link to="/signup" className="registration-action">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;