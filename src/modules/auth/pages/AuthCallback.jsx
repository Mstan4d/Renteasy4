// src/modules/auth/pages/AuthCallback.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../shared/lib/supabaseClient';
import { useAuth } from '../../../shared/context/AuthContext';
import './AuthCallback.css';

const AuthCallback = () => {
  const [status, setStatus] = useState('Processing your signup...');
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    handleAuthCallback();
  }, []);

  const handleAuthCallback = async () => {
    try {
      // Get the session from URL
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) throw sessionError;
      
      if (!session?.user) {
        setError('No session found. Please try signing in again.');
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      // Check if this is a new Google signup with role
      const storedRole = sessionStorage.getItem('google_signup_role');
      const isNewGoogleSignup = storedRole && !session.user.user_metadata?.role;
      
      // Get or create profile
      let profile = await getOrCreateProfile(session.user, storedRole);
      
      // If Google signup for service provider, create provider record
      if (isNewGoogleSignup && storedRole === 'service-provider') {
        const providerData = sessionStorage.getItem('google_signup_provider_data');
        if (providerData) {
          await createServiceProvider(session.user.id, JSON.parse(providerData));
        }
      }
      
      // Prepare user data
      const userData = {
        id: session.user.id,
        email: session.user.email,
        name: session.user.user_metadata?.name || profile.name,
        fullName: session.user.user_metadata?.full_name || profile.name,
        role: profile.role,
        isVerified: session.user.email_confirmed_at ? true : false,
        avatar_url: profile.avatar_url,
        is_admin: profile.is_admin || false
      };
      
      // Update AuthContext
      login(userData);
      
      // Store in localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('renteasy_user', JSON.stringify(userData));
      localStorage.setItem('token', session.access_token);
      localStorage.setItem('renteasy_token', session.access_token);
      
      // Clean up
      sessionStorage.removeItem('google_signup_role');
      sessionStorage.removeItem('google_signup_provider_data');
      
      // Redirect based on role
      setStatus('Success! Redirecting to dashboard...');
      setTimeout(() => {
        const dashboardPaths = {
          'tenant': '/dashboard',
          'landlord': '/dashboard',
          'manager': '/dashboard',
          'service-provider': '/dashboard',
          'estate-firm': '/dashboard',
          'admin': '/admin'
        };
        navigate(dashboardPaths[profile.role] || '/dashboard');
      }, 1500);
      
    } catch (error) {
      console.error('Auth callback error:', error);
      setError(error.message || 'Authentication failed');
      setTimeout(() => navigate('/login'), 3000);
    }
  };

  const getOrCreateProfile = async (user, storedRole) => {
    // Check if profile exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (!fetchError && existingProfile) {
      return existingProfile;
    }
    
    // Create new profile with stored role or default
    const role = storedRole || user.user_metadata?.role || 'tenant';
    
    const { data: newProfile, error: createError } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        name: user.user_metadata?.name || user.email.split('@')[0],
        email: user.email,
        role: role,
        avatar_url: user.user_metadata?.avatar_url
      })
      .select()
      .single();
    
    if (createError) throw createError;
    return newProfile;
  };

  const createServiceProvider = async (userId, providerData) => {
    try {
      const { error } = await supabase
        .from('service_providers')
        .insert({
          user_id: userId,
          business_name: providerData.businessName || 'Google Signup',
          city: providerData.city || '',
          state: providerData.state || '',
          services: providerData.selectedServices || [],
          coverage_states: providerData.coverageStates || [],
          status: 'pending',
          verified: false
        });
      
      if (error) console.warn('Provider creation warning:', error);
    } catch (error) {
      console.warn('Failed to create provider record:', error);
    }
  };

  return (
    <div className="auth-callback-container">
      <div className="auth-callback-card">
        {error ? (
          <>
            <div className="error-icon">❌</div>
            <h2>Authentication Failed</h2>
            <p>{error}</p>
            <p>Redirecting to login page...</p>
          </>
        ) : (
          <>
            <div className="loading-spinner"></div>
            <h2>{status}</h2>
            <p>Please wait while we set up your account...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;