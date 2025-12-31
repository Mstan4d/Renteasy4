// src/modules/auth/pages/Login.jsx - UPDATED
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'tenant'
  });
  
  const [errors, setErrors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, mockLoginAs } = useAuth();
  const navigate = useNavigate();
  
  const roles = [
    { value: 'tenant', label: 'Tenant' },
    { value: 'landlord', label: 'Landlord' },
    { value: 'manager', label: 'Manager' },
    { value: 'provider', label: 'Service Provider' },
    { value: 'estate-firm', label: 'Estate Firm' },
    { value: 'admin', label: 'Administrator' }
  ];
  
  const roleDashboards = {
    'tenant': '/dashboard',
    'landlord': '/dashboard',
    'manager': '/manager-dashboard',
    'provider': '/provider-dashboard',
    'estate-firm': '/estate-dashboard',
    'admin': '/admin'
  };
  
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
    
    if (errors.length > 0) {
      setErrors([]);
    }
  };
  
  const validateForm = () => {
    const newErrors = [];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!formData.email.trim()) {
      newErrors.push('Email address is required');
    } else if (!emailRegex.test(formData.email)) {
      newErrors.push('Please enter a valid email address');
    }
    
    if (!formData.password) {
      newErrors.push('Password is required');
    } else if (formData.password.length < 6) {
      newErrors.push('Password must be at least 6 characters long');
    }
    
    return newErrors;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setIsLoading(false);
      return;
    }
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // ========== ADMIN LOGIN CHECK ==========
      // Special admin login for testing (only in development)
      if (process.env.NODE_ENV === 'development' && 
          formData.email === 'admin@renteasy.com' && 
          formData.password === 'admin123' && 
          formData.role === 'admin') {
        
        // Create admin user if doesn't exist
        const users = JSON.parse(localStorage.getItem('renteasy_users') || '[]');
        let adminUser = users.find(u => u.email === 'admin@renteasy.com' && u.role === 'admin');
        
        if (!adminUser) {
          adminUser = {
            id: 'admin_001',
            email: 'admin@renteasy.com',
            fullName: 'RentEasy Admin',
            username: 'admin',
            phone: '+234 800 000 0000',
            role: 'admin',
            referralCode: 'ADMIN001',
            isVerified: true,
            createdAt: new Date().toISOString(),
            profileComplete: true,
            isActive: true,
            isCEO: true, // First admin is CEO
            permissions: ['all'],
            verificationStatus: 'verified',
            verificationLevel: 'admin'
          };
          
          users.push(adminUser);
          localStorage.setItem('renteasy_users', JSON.stringify(users));
        }
        
        // Log admin in
        login(adminUser, 'admin_token');
        navigate('/admin');
        setIsLoading(false);
        return;
      }
      // ========== END ADMIN LOGIN CHECK ==========
      
      // Regular user login
      const mockUsers = {
        'tenant@example.com': { password: 'password123', role: 'tenant' },
        'landlord@example.com': { password: 'password123', role: 'landlord' },
        'manager@example.com': { password: 'password123', role: 'manager' },
        'provider@example.com': { password: 'password123', role: 'provider' },
        'estate@example.com': { password: 'password123', role: 'estate-firm' },
        'admin@example.com': { password: 'password123', role: 'admin' }
      };
      
      const user = mockUsers[formData.email];
      
      if (user && user.password === formData.password && user.role === formData.role) {
        const userData = {
          email: formData.email,
          role: formData.role,
          name: formData.email.split('@')[0],
          joinedAt: new Date().toISOString()
        };
        
        login(userData);
        
        const dashboardPath = roleDashboards[formData.role] || '/dashboard';
        navigate(dashboardPath);
        
      } else {
        setErrors(['Invalid email, password, or role combination.']);
      }
      
    } catch (error) {
      console.error('Login error:', error);
      setErrors(['Login failed. Please check your connection and try again.']);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGoogleSignIn = () => {
    const googleUser = {
      email: 'googleuser@example.com',
      role: 'tenant',
      name: 'Google User',
      authProvider: 'google',
      joinedAt: new Date().toISOString()
    };
    
    login(googleUser);
    navigate('/dashboard');
  };

  // ========== ADMIN QUICK LOGIN ==========
  const handleAdminQuickLogin = () => {
    // Set admin credentials
    setFormData({
      email: 'admin@renteasy.com',
      password: 'admin123',
      role: 'admin'
    });
    
    // Auto submit after a short delay
    setTimeout(() => {
      handleSubmit({ preventDefault: () => {} });
    }, 100);
  };
  
  // Check if we're in development mode
  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Sign In to RentEasy</h2>
        <p className="login-subtitle">Access your account to manage properties and rentals</p>
        
        {errors.length > 0 && (
          <div className="error-alert" role="alert">
            {errors.map((error, index) => (
              <p key={index} className="error-text">
                ⚠️ {error}
              </p>
            ))}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="login-form" noValidate>
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email Address</label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter your registered email"
              disabled={isLoading}
              aria-required="true"
            />
            <small id="emailHelp" className="form-help">
              We'll never share your email with anyone else.
            </small>
          </div>
          
          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter your password"
              disabled={isLoading}
              aria-required="true"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="role" className="form-label">I am a...</label>
            <select
              id="role"
              value={formData.role}
              onChange={handleInputChange}
              className="form-select"
              disabled={isLoading}
              aria-required="true"
            >
              {roles.map(role => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
            <small className="form-help">
              Select your role to access the appropriate dashboard
            </small>
          </div>
          
          <button 
            type="submit" 
            className="submit-button"
            disabled={isLoading}
            aria-busy={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner" aria-hidden="true"></span>
                Authenticating...
              </>
            ) : (
              'Sign In'
            )}
          </button>
          
          <div className="forgot-password">
            <Link to="/forgot-password" className="forgot-link">
              Forgot your password?
            </Link>
          </div>
        </form>
        
        {/* ========== DEVELOPMENT ADMIN LOGIN BUTTON ========== */}
        {isDevelopment && (
          <div className="admin-login-dev">
            <div className="divider">
              <span className="divider-text">DEVELOPMENT TESTING</span>
            </div>
            
            <div className="dev-admin-section">
              <h4 className="dev-title">🚀 Quick Admin Login</h4>
              <p className="dev-subtitle">For development and testing only</p>
              
              <button 
                onClick={handleAdminQuickLogin}
                className="admin-quick-login-btn"
                type="button"
                disabled={isLoading}
              >
                👑 Login as Administrator
              </button>
              
              <div className="dev-credentials">
                <p><strong>Auto-filled credentials:</strong></p>
                <div className="credential-details">
                  <span>Email: <code>admin@renteasy.com</code></span>
                  <span>Password: <code>admin123</code></span>
                  <span>Role: <code>Administrator</code></span>
                </div>
              </div>
              
              <div className="dev-notice">
                <small>⚠️ This button only appears in development mode. In production, admin accounts are created by CEO only.</small>
              </div>
            </div>
          </div>
        )}
        
        <div className="divider">
          <span className="divider-text">OR</span>
        </div>
        
        <button 
          onClick={handleGoogleSignIn}
          className="google-button"
          disabled={isLoading}
          type="button"
        >
          <svg className="google-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Sign in with Google
        </button>
        
        <div className="registration-link">
          <p className="registration-text">
            New to RentEasy?{' '}
            <Link to="/signup" className="registration-action">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;