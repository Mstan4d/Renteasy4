// src/shared/context/AuthContext.jsx - FIXED VERSION
import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('renteasy_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        return {
          ...parsed,
          verificationStatus: parsed.verificationStatus || 'not_started',
          isVerified: parsed.verificationStatus === 'verified'
        };
      } catch (error) {
        console.error('Error parsing user data:', error);
        return null;
      }
    }
    return null;
  });

  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const initializeAuth = () => {
      try {
        const savedUser = localStorage.getItem('renteasy_user');
        const savedToken = localStorage.getItem('renteasy_token');
        
        if (savedUser && savedToken) {
          const parsedUser = JSON.parse(savedUser);
          const userWithVerification = {
            ...parsedUser,
            verificationStatus: parsedUser.verificationStatus || 'not_started',
            isVerified: parsedUser.verificationStatus === 'verified',
            verificationLevel: parsedUser.verificationLevel || 'basic'
          };
          
          setUser(userWithVerification);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        localStorage.removeItem('renteasy_user');
        localStorage.removeItem('renteasy_token');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = (userData, token = null) => {
    try {
      setAuthError(null);
      
      // ========== ADMIN SECURITY CHECK ==========
      // Prevent admin login if not CEO and trying to access admin panel
      if (userData.role === 'admin') {
        // Check if this is a valid admin user
        const storedUsers = JSON.parse(localStorage.getItem('renteasy_users') || '[]');
        const existingAdmin = storedUsers.find(u => 
          u.email === userData.email && u.role === 'admin'
        );
        
        if (!existingAdmin) {
          throw new Error('Admin account not found. Contact system administrator.');
        }
        
        if (!existingAdmin.isActive) {
          throw new Error('Admin account is deactivated. Contact CEO.');
        }
      }
      // ========== END ADMIN SECURITY CHECK ==========
      
      const userWithVerification = {
        ...userData,
        verificationStatus: userData.verificationStatus || 'not_started',
        isVerified: userData.verificationStatus === 'verified',
        verificationLevel: userData.verificationLevel || 'basic',
        lastLogin: new Date().toISOString()
      };
      
      setUser(userWithVerification);
      
      localStorage.setItem('renteasy_user', JSON.stringify(userWithVerification));
      if (token) {
        localStorage.setItem('renteasy_token', token);
      }
      
      return { success: true, user: userWithVerification };
      
    } catch (error) {
      console.error('Login error:', error);
      setAuthError(error.message || 'Login failed');
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('renteasy_user');
    localStorage.removeItem('renteasy_token');
    setAuthError(null);
    
    return { success: true };
  };

  const updateUser = (updatedData) => {
    if (!user) {
      throw new Error('No user logged in');
    }
    
    const updatedUser = {
      ...user,
      ...updatedData,
      verificationStatus: updatedData.verificationStatus || user.verificationStatus || 'not_started',
      isVerified: (updatedData.verificationStatus || user.verificationStatus) === 'verified',
      verificationLevel: updatedData.verificationLevel || user.verificationLevel || 'basic'
    };
    
    setUser(updatedUser);
    localStorage.setItem('renteasy_user', JSON.stringify(updatedUser));
    
    // Also update in the main users list
    const storedUsers = JSON.parse(localStorage.getItem('renteasy_users') || '[]');
    const updatedUsers = storedUsers.map(u => 
      u.email === user.email ? { ...u, ...updatedData } : u
    );
    localStorage.setItem('renteasy_users', JSON.stringify(updatedUsers));
    
    return updatedUser;
  };

  const updateUserVerification = (status, level = 'basic') => {
    if (!user) {
      throw new Error('No user logged in');
    }
    
    const updatedUser = {
      ...user,
      verificationStatus: status,
      isVerified: status === 'verified',
      verificationLevel: level,
      verificationDate: status === 'verified' ? new Date().toISOString() : user.verificationDate
    };
    
    setUser(updatedUser);
    localStorage.setItem('renteasy_user', JSON.stringify(updatedUser));
    
    return updatedUser;
  };

  const refreshUser = () => {
    try {
      const savedUser = localStorage.getItem('renteasy_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  // ========== SECURE ADMIN CREATION FUNCTION ==========
  const createAdminAccount = (adminData, createdBy) => {
    try {
      if (!createdBy || createdBy.role !== 'admin' || !createdBy.isCEO) {
        throw new Error('Only CEO can create admin accounts');
      }
      
      const storedUsers = JSON.parse(localStorage.getItem('renteasy_users') || '[]');
      
      // Check if email already exists
      const existingUser = storedUsers.find(u => u.email === adminData.email);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }
      
      const newAdmin = {
        id: `admin_${Date.now()}`,
        ...adminData,
        role: 'admin',
        isVerified: true,
        isActive: true,
        isCEO: adminData.isCEO || false,
        createdAt: new Date().toISOString(),
        createdBy: createdBy.email,
        permissions: adminData.permissions || ['view', 'edit', 'delete'],
        requiresPasswordChange: true
      };
      
      storedUsers.push(newAdmin);
      localStorage.setItem('renteasy_users', JSON.stringify(storedUsers));
      
      // Log admin creation
      const adminLogs = JSON.parse(localStorage.getItem('admin_activities') || '[]');
      adminLogs.push({
        action: `Created admin account for ${adminData.email}`,
        createdBy: createdBy.email,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('admin_activities', JSON.stringify(adminLogs));
      
      return { success: true, admin: newAdmin };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };
  // ========== END SECURE ADMIN CREATION ==========

  const mockLoginAs = (role = 'tenant') => {
    const mockUsers = {
      tenant: {
        id: 'tenant_001',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+234 801 234 5678',
        role: 'tenant',
        avatar: null,
        verificationStatus: 'verified',
        isVerified: true,
        verificationLevel: 'basic'
      },
      landlord: {
        id: 'landlord_001',
        name: 'Jane Smith Properties',
        email: 'jane@properties.com',
        phone: '+234 802 345 6789',
        role: 'landlord',
        avatar: null,
        verificationStatus: 'pending',
        isVerified: false,
        verificationLevel: 'basic'
      },
      'estate-firm': {
        id: 'estate_001',
        name: 'Premium Real Estate Ltd.',
        email: 'info@premiumrealestate.com',
        phone: '+234 803 456 7890',
        role: 'estate-firm',
        firmId: 'firm_001',
        avatar: null,
        verificationStatus: 'verified',
        isVerified: true,
        verificationLevel: 'premium'
      },
      admin: {
        id: 'admin_001',
        name: 'Admin User',
        email: 'admin@renteasy.com',
        phone: '+234 800 000 0000',
        role: 'admin',
        avatar: null,
        verificationStatus: 'verified',
        isVerified: true,
        verificationLevel: 'admin',
        isCEO: true,
        isActive: true,
        permissions: ['all']
      },
      manager: {
        id: 'manager_001',
        name: 'Regional Manager',
        email: 'manager@example.com',
        phone: '+234 804 567 8901',
        role: 'manager',
        avatar: null,
        verificationStatus: 'verified',
        isVerified: true,
        verificationLevel: 'verified',
        state: 'Lagos',
        assignedAreas: [
          { state: 'Lagos', lga: 'Ikeja' },
          { state: 'Lagos', lga: 'Lekki' },
          { state: 'Lagos', lga: 'Victoria Island' }
        ],
        isActive: true,
        permissions: ['verify_listings', 'manage_properties', 'contact_users']
      }
    };

    const mockUser = mockUsers[role] || mockUsers.tenant;
    
    // If logging in as manager, also save to managers array
    if (role === 'manager') {
      const existingManagers = JSON.parse(localStorage.getItem('managers') || '[]');
      const managerExists = existingManagers.some(m => m.email === mockUser.email);
      
      if (!managerExists) {
        const managerData = {
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
          phone: mockUser.phone,
          assignedAreas: mockUser.assignedAreas,
          status: 'active',
          createdAt: new Date().toISOString()
        };
        
        existingManagers.push(managerData);
        localStorage.setItem('managers', JSON.stringify(existingManagers));
      }
    }
    
    return login(mockUser, 'mock_token_' + Date.now());
  };

  const clearAuthError = () => {
    setAuthError(null);
  };

  const value = {
    // State
    user,
    loading,
    authError,
    
    // Actions
    login,
    logout,
    updateUser,
    updateUserVerification,
    refreshUser,
    mockLoginAs,
    clearAuthError,
    createAdminAccount, // New function for CEO to create admins
    
    // Computed
    isAuthenticated: !!user,
    isVerified: user?.isVerified || false,
    verificationStatus: user?.verificationStatus || 'not_started',
    userRole: user?.role || null,
    
    // Helper functions
    hasRole: (roles) => {
      if (!user) return false;
      if (Array.isArray(roles)) {
        return roles.includes(user.role);
      }
      return user.role === roles;
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;