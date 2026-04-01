// src/shared/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../../shared/lib/supabaseClient';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Initialize from localStorage on first load
    try {
      const saved = localStorage.getItem('renteasy_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  // A simple session check on mount (optional, for persistence)
  useEffect(() => {
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && !user) {
        // If we have a session but no user state, try to load it
        await fetchAndSetUser(session.user.id);
      }
    };
    initAuth();
  }, []);

  // Helper: Fetches profile and sets state with staff detection
  const fetchAndSetUser = async (userid) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userid)
        .single();

      if (error) throw error;

      // Check if user is staff (has estate_firm_profile with parent)
      let isStaff = false;
      let staffRole = null;
      let parentFirmId = null;
      
      // Only check for estate-firm roles
      if (profile.role === 'estate-firm' || profile.role === 'estate_firm') {
        const { data: estateProfile, error: estateError } = await supabase
          .from('estate_firm_profiles')
          .select('staff_role, parent_estate_firm_id, is_staff_account')
          .eq('user_id', userid)
          .maybeSingle();
        
        if (!estateError && estateProfile) {
          isStaff = estateProfile.is_staff_account || false;
          staffRole = estateProfile.staff_role;
          parentFirmId = estateProfile.parent_estate_firm_id;
        }
      }

      const userData = {
        id: userid,
        email: profile.email,
        name: profile.full_name || profile.name,
        fullName: profile.full_name || profile.name,
        role: (profile.role || 'tenant').replace('_', '-'), // normalize role
        avatar_url: profile.avatar_url,
        is_admin: profile.is_admin || false,
        isVerified: true,
        // Staff specific fields
        isStaff: isStaff,
        staffRole: staffRole,
        parentFirmId: parentFirmId
      };

      setUser(userData);
      localStorage.setItem('renteasy_user', JSON.stringify(userData));
      return userData;
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
      return null;
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      // 1. Sign in with Supabase
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });
      if (signInError) throw signInError;

      // 2. Fetch the profile (Wait for it!)
      const userData = await fetchAndSetUser(data.user.id);

      if (!userData) {
        throw new Error("Profile not found. Please contact support.");
      }

      return { success: true, user: userData };

    } catch (error) {
      console.error('❌ LOGIN FAILED:', error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    localStorage.removeItem('renteasy_user');
    console.log('✅ Logged out');
    return { success: true };
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    userRole: user?.role || null,
    isTenant: user?.role === 'tenant',
    isLandlord: user?.role === 'landlord',
    isAdmin: user?.role === 'admin',
    isStaff: user?.isStaff || false,
    staffRole: user?.staffRole || null,
    parentFirmId: user?.parentFirmId || null,
    hasRole: (role) => user?.role === role,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;