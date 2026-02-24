import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../../shared/lib/supabaseClient'; // Adjust path

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

  // Helper: Fetches profile and sets state
  // Helper: Fetches profile and sets state
  const fetchAndSetUser = async (userid) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userid)
        .single();

      if (error) throw error;

     const userData = {
  id: userid,
  email: profile.email,
  name: profile.full_name || profile.name,
  fullName: profile.full_name || profile.name,
  role: (profile.role || 'tenant').replace('_', '-'), // normalize role
  avatar_url: profile.avatar_url,
  is_admin: profile.is_admin || false,
  isVerified: true
};

      setUser(userData);
      localStorage.setItem('renteasy_user', JSON.stringify(userData));
      return userData; // Return the data so login can use it immediately
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
      // We call our helper which now returns the data
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
    hasRole: (role) => user?.role === role,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;