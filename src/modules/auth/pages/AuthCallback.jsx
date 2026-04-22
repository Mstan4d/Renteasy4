// src/modules/auth/pages/AuthCallback.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../shared/lib/supabaseClient';
import './AuthCallback.css';

const AuthCallback = () => {
  const [status, setStatus] = useState('Processing your signup...');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    handleAuthCallback();
  }, []);

  const handleAuthCallback = async () => {
    try {
      // 1. Get the session from Supabase
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!session?.user) {
        setError('No session found. Please try signing in again.');
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      const user = session.user;
      
      // Look for stored role from either Google or Facebook signup
      const storedRole = sessionStorage.getItem('facebook_signup_role') || sessionStorage.getItem('google_signup_role');
     const role = storedRole || user.user_metadata?.role || 'tenant';
      const storedFullName = sessionStorage.getItem('google_signup_full_name') || sessionStorage.getItem('facebook_signup_full_name');
      const isNewSignup = storedRole && !user.user_metadata?.role;

      // 2. Get or create profile
      let profile = await getOrCreateProfile(user, storedRole);

      // 3. For service provider signup, create provider record (if data exists)
      if (isNewSignup && storedRole === 'service-provider') {
        // Try to get provider data from either Google or Facebook storage
        const providerData = sessionStorage.getItem('google_signup_provider_data') || sessionStorage.getItem('facebook_signup_provider_data');
        if (providerData) {
          await createServiceProvider(user.id, JSON.parse(providerData));
        }
      }

      // 4. Prepare user object for localStorage
      const userData = {
        id: user.id,
        email: user.email,
        full_name: profile.full_name || profile.name,
        role: profile.role,
        avatar_url: profile.avatar_url,
        is_verified: user.email_confirmed_at ? true : false,
      };

      // 5. Store user and token in localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('renteasy_user', JSON.stringify(userData));
      localStorage.setItem('token', session.access_token);
      localStorage.setItem('renteasy_token', session.access_token);

      // 6. Clean up all session storage items
      sessionStorage.removeItem('google_signup_role');
      sessionStorage.removeItem('google_signup_full_name');
      sessionStorage.removeItem('google_signup_provider_data');
      sessionStorage.removeItem('facebook_signup_role');
      sessionStorage.removeItem('facebook_signup_full_name');
      sessionStorage.removeItem('facebook_signup_provider_data');

      // 7. Redirect based on role
      setStatus('Success! Redirecting to dashboard...');
      const rolePathMap = {
        tenant: '/dashboard/tenant',
        landlord: '/dashboard/landlord',
        manager: '/dashboard/manager',
        'service-provider': '/dashboard/provider',
        'estate-firm': '/dashboard/estate-firm',
        admin: '/admin',
        'super-admin': '/super-admin'
      };
      const target = rolePathMap[profile.role] || '/dashboard';
      setTimeout(() => navigate(target), 1500);
    } catch (err) {
      console.error('Auth callback error:', err);
      setError(err.message || 'Authentication failed');
      setTimeout(() => navigate('/login'), 3000);
    }
  };

  const getOrCreateProfile = async (user, storedRole) => {
    // Check if profile exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (!fetchError && existingProfile) {
      return existingProfile;
    }

    // Create new profile
    const role = storedRole || user.user_metadata?.role || 'tenant';
    const fullName = user.user_metadata?.full_name || user.user_metadata?.name || user.email.split('@')[0];

    const { data: newProfile, error: createError } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        email: user.email,
        full_name: fullName,
        role: role,
        avatar_url: user.user_metadata?.avatar_url || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (createError) throw createError;

    // Create wallet for the new user
    await supabase.from('wallets').upsert(
      { user_id: user.id, balance: 0, commission_rate: 1.5 },
      { onConflict: 'user_id' }
    );

    return newProfile;
  };

  const createServiceProvider = async (userId, providerData) => {
    try {
      const { error } = await supabase
        .from('service_providers')
        .insert({
          user_id: userId,
          business_name: providerData.businessName || 'Social Signup',
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