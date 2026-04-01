// src/modules/auth/pages/Signup.jsx - ADD EYE TOGGLE
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../shared/lib/supabaseClient';
import { Eye, EyeOff } from 'lucide-react'; // Add these imports
import './Signup.css';

const Signup = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    role: 'tenant'
  });
  
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errors, setErrors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // NEW STATE
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // NEW STATE
  
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
    
    if (type === 'checkbox') {
      setTermsAccepted(checked);
    } else {
      setFormData(prev => ({
        ...prev,
        [id]: value
      }));
    }
    
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
    
    if (!formData.fullName.trim()) {
      newErrors.push('Full name is required');
    } else if (formData.fullName.trim().length < 2) {
      newErrors.push('Full name must be at least 2 characters');
    }
    
    if (!formData.password) {
      newErrors.push('Password is required');
    } else if (formData.password.length < 6) {
      newErrors.push('Password must be at least 6 characters long');
    }
    
    if (!formData.confirmPassword) {
      newErrors.push('Please confirm your password');
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.push('Passwords do not match');
    }
    
    if (!termsAccepted) {
      newErrors.push('You must accept the Terms & Conditions and Privacy Policy');
    }
    
    return newErrors;
  };


const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  setErrors([]);

  // Define role paths (you can move this outside the component if you prefer)
  const rolePaths = {
    tenant: '/dashboard/tenant',
    landlord: '/dashboard/landlord',
    manager: '/dashboard/manager',
    'service-provider': '/dashboard/provider',
    'estate-firm': '/dashboard/estate-firm'
  };

  try {
    // 1. Create the Auth User
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: formData.email.trim(),
      password: formData.password,
      options: {
        data: {
          full_name: formData.fullName.trim(),
          role: formData.role
        }
      }
    });

    if (signUpError) throw signUpError;

    if (authData?.user) {
      const userId = authData.user.id;
      console.log("Auth user created:", userId, "with role:", formData.role);

      // 2. Insert Profile (Wait for this to finish!)
      const { error: profileErr } = await supabase
        .from('profiles')
        .insert([{ 
          id: userId, 
          email: formData.email.trim(), 
          full_name: formData.fullName.trim(), 
          role: formData.role
        }]);

      if (profileErr) {
        console.error("❌ Profile Insert Error:", profileErr.message);
        setErrors([`Auth worked, but profile failed: ${profileErr.message}`]);
        return; // Stop here if profile fails
      }

      // 3. Insert Wallet (use upsert to avoid duplicate key errors)
      const { error: walletErr } = await supabase
        .from('wallets')
        .upsert(
          { user_id: userId, balance: 0, commission_rate: 1.5 },
          { onConflict: 'user_id' } // ignore if already exists
        );

      if (walletErr) {
        console.error("Wallet Insert Error:", walletErr.message);
        // Non‑critical – just log it
      } else {
        console.log("✅ Wallet created/verified.");
      }

      console.log("✅ Profile and Wallet created. Logging in...");

      // 4. Auto-Login
      const loginResult = await login(formData.email.trim(), formData.password);
      
      if (loginResult.success) {
        const target = rolePaths[formData.role] || '/dashboard';
        navigate(target);
      } else {
        setErrors([loginResult.error || 'Login failed after signup']);
      }
    }
  } catch (error) {
    console.error("Signup/Redirect Failure:", error);
    setErrors([error.message || "An error occurred during setup."]);
  } finally {
    setIsLoading(false);
  }
};

// In your signup component
const handleSignup = async (email, password, referralCode) => {
  // 1. Create user
  const { data: user, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        referred_by: referralCode
      }
    }
  });
  
  if (error) throw error;
  
  // 2. If referral code exists, track it
  if (referralCode) {
    // Find the referrer
    const { data: referrer } = await supabase
      .from('profiles')
      .select('id')
      .eq('referral_code', referralCode)
      .single();
    
    if (referrer) {
      // Create referral record
      await supabase
        .from('tenant_referrals')
        .insert({
          referrer_id: referrer.id,
          referred_user_id: user.user.id,
          referred_user_name: user.user.email,
          referred_user_email: user.user.email,
          status: 'pending',
          signup_date: new Date().toISOString()
        });
    }
  }
};
  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Toggle confirm password visibility
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
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
              {errors.map((error, index) => (
                <p key={index} className="error-text">⚠️ {error}</p>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="signup-form">
            <div className="form-group">
              <label htmlFor="fullName">Full Name *</label>
              <input
                type="text"
                id="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="John Doe"
                disabled={isLoading}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="you@example.com"
                disabled={isLoading}
                required
              />
            </div>

            {/* Password with Eye Toggle */}
            <div className="form-group password-group">
              <label htmlFor="password">Password *</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={togglePasswordVisibility}
                  tabIndex="-1"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <small>Minimum 6 characters</small>
            </div>

            {/* Confirm Password with Eye Toggle */}
            <div className="form-group password-group">
              <label htmlFor="confirmPassword">Confirm Password *</label>
              <div className="password-input-wrapper">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={toggleConfirmPasswordVisibility}
                  tabIndex="-1"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="role">I want to join as a *</label>
              <select
                id="role"
                value={formData.role}
                onChange={handleInputChange}
                disabled={isLoading}
                required
              >
                {ROLES.map(role => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
              <small>{ROLES.find(r => r.value === formData.role)?.description}</small>
            </div>

            <div className="terms-group">
              <label>
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
                <span>
                  I agree to the{' '}
                  <Link to="/terms">Terms & Conditions</Link>
                  {' '}and{' '}
                  <Link to="/privacy">Privacy Policy</Link>
                </span>
              </label>
            </div>

            <button 
              type="submit" 
              className="submit-btn"
              disabled={isLoading || !termsAccepted}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>

            <div className="login-link">
              Already have an account? <Link to="/login">Sign In</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;