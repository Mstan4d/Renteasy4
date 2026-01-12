// src/shared/context/AuthContext.jsx - UPDATED WITH SUPER ADMIN
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
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    const initializeAuth = () => {
      try {
        // Check for Super Admin first
        const superAdminToken = localStorage.getItem('superAdminToken');
        const superAdminData = localStorage.getItem('superAdminData');
        
        if (superAdminToken && superAdminData) {
          const parsedSuperAdmin = JSON.parse(superAdminData);
          if (parsedSuperAdmin.role === 'super-admin') {
            setUser(parsedSuperAdmin);
            setIsSuperAdmin(true);
            setLoading(false);
            return;
          } else {
            // Invalid super admin data, clear it
            localStorage.removeItem('superAdminToken');
            localStorage.removeItem('superAdminData');
          }
        }

        // Regular user check
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
          setIsSuperAdmin(false);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        localStorage.removeItem('renteasy_user');
        localStorage.removeItem('renteasy_token');
        localStorage.removeItem('superAdminToken');
        localStorage.removeItem('superAdminData');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // ========== SUPER ADMIN FUNCTIONS ==========
  const superAdminLogin = (email, password) => {
    try {
      setAuthError(null);
      
      // For demo purposes - in production, this would be an API call
      if (email === 'superadmin@renteasy.com' && password === 'admin123') {
        const superAdminData = {
          id: 'super-admin-001',
          email: 'superadmin@renteasy.com',
          name: 'RentEasy Super Admin',
          role: 'super-admin',
          permissions: ['*'],
          isCEO: true,
          isVerified: true,
          verificationStatus: 'verified',
          verificationLevel: 'super',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        };
        
        // Store super admin session separately
        localStorage.setItem('superAdminToken', 'super-admin-jwt-token');
        localStorage.setItem('superAdminData', JSON.stringify(superAdminData));
        
        setUser(superAdminData);
        setIsSuperAdmin(true);
        
        // Log the login
        const auditLogs = JSON.parse(localStorage.getItem('auditLogs') || '[]');
        auditLogs.unshift({
          id: Date.now(),
          action: 'SUPER_ADMIN_LOGIN',
          user: 'superadmin@renteasy.com',
          timestamp: new Date().toISOString(),
          ip: '127.0.0.1',
          details: 'Super Admin logged in successfully'
        });
        localStorage.setItem('auditLogs', JSON.stringify(auditLogs.slice(0, 1000)));
        
        return { success: true, user: superAdminData };
      } else {
        throw new Error('Invalid Super Admin credentials');
      }
    } catch (error) {
      setAuthError(error.message);
      return { success: false, error: error.message };
    }
  };

  const superAdminLogout = () => {
    setUser(null);
    setIsSuperAdmin(false);
    localStorage.removeItem('superAdminToken');
    localStorage.removeItem('superAdminData');
    setAuthError(null);
    
    // Redirect to home after logout
    window.location.href = '/';
    
    return { success: true };
  };

  const switchToSuperAdmin = (adminData) => {
    if (!adminData || adminData.role !== 'admin') {
      throw new Error('Only admins can switch to super admin mode');
    }
    
    const superAdminData = {
      ...adminData,
      role: 'super-admin',
      isSuperAdmin: true,
      switchedAt: new Date().toISOString()
    };
    
    localStorage.setItem('superAdminToken', 'super-admin-temp-token');
    localStorage.setItem('superAdminData', JSON.stringify(superAdminData));
    
    setUser(superAdminData);
    setIsSuperAdmin(true);
    
    return { success: true, user: superAdminData };
  };

  const switchToRegularUser = () => {
    // Clear super admin session
    localStorage.removeItem('superAdminToken');
    localStorage.removeItem('superAdminData');
    setIsSuperAdmin(false);
    
    // Check for regular user session
    const savedUser = localStorage.getItem('renteasy_user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
      } catch (error) {
        setUser(null);
      }
    } else {
      setUser(null);
    }
    
    return { success: true };
  };
  // ========== END SUPER ADMIN FUNCTIONS ==========

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
      setIsSuperAdmin(false);
      
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
    // Clear all sessions
    setUser(null);
    setIsSuperAdmin(false);
    localStorage.removeItem('renteasy_user');
    localStorage.removeItem('renteasy_token');
    localStorage.removeItem('superAdminToken');
    localStorage.removeItem('superAdminData');
    setAuthError(null);
    
    return { success: true };
  };

  const updateUser = (updatedData) => {
    if (!user) {
      throw new Error('No user logged in');
    }
    
    // If updating super admin, handle separately
    if (isSuperAdmin) {
      const updatedSuperAdmin = {
        ...user,
        ...updatedData,
        verificationStatus: updatedData.verificationStatus || user.verificationStatus || 'not_started',
        isVerified: (updatedData.verificationStatus || user.verificationStatus) === 'verified',
        verificationLevel: updatedData.verificationLevel || user.verificationLevel || 'basic'
      };
      
      setUser(updatedSuperAdmin);
      localStorage.setItem('superAdminData', JSON.stringify(updatedSuperAdmin));
      return updatedSuperAdmin;
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
    
    if (isSuperAdmin) {
      localStorage.setItem('superAdminData', JSON.stringify(updatedUser));
    } else {
      localStorage.setItem('renteasy_user', JSON.stringify(updatedUser));
    }
    
    return updatedUser;
  };

  const refreshUser = () => {
    try {
      // Check super admin first
      const superAdminData = localStorage.getItem('superAdminData');
      if (superAdminData) {
        const parsed = JSON.parse(superAdminData);
        if (parsed.role === 'super-admin') {
          setUser(parsed);
          setIsSuperAdmin(true);
          return;
        }
      }
      
      // Check regular user
      const savedUser = localStorage.getItem('renteasy_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        setIsSuperAdmin(false);
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  // ========== SECURE ADMIN CREATION FUNCTION ==========
  const createAdminAccount = (adminData, createdBy) => {
    try {
      // Only super admin or CEO admin can create admin accounts
      if (!isSuperAdmin && (!createdBy || createdBy.role !== 'admin' || !createdBy.isCEO)) {
        throw new Error('Only Super Admin or CEO can create admin accounts');
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
        createdBy: isSuperAdmin ? 'superadmin@renteasy.com' : (createdBy.email || 'system'),
        permissions: adminData.permissions || ['view', 'edit', 'delete'],
        requiresPasswordChange: true,
        scope: adminData.scope || ['all'] // New field for admin scope
      };
      
      storedUsers.push(newAdmin);
      localStorage.setItem('renteasy_users', JSON.stringify(storedUsers));
      
      // Log admin creation
      const adminLogs = JSON.parse(localStorage.getItem('admin_activities') || '[]');
      adminLogs.push({
        action: `Created admin account for ${adminData.email}`,
        createdBy: isSuperAdmin ? 'superadmin@renteasy.com' : createdBy.email,
        timestamp: new Date().toISOString(),
        scope: newAdmin.scope
      });
      localStorage.setItem('admin_activities', JSON.stringify(adminLogs));
      
      return { success: true, admin: newAdmin };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };
  // ========== END SECURE ADMIN CREATION ==========

  // ========== SUPER ADMIN ONLY FUNCTIONS ==========
  const suspendAdminAccount = (adminEmail, reason) => {
    try {
      if (!isSuperAdmin) {
        throw new Error('Only Super Admin can suspend admin accounts');
      }
      
      const storedUsers = JSON.parse(localStorage.getItem('renteasy_users') || '[]');
      const adminIndex = storedUsers.findIndex(u => 
        u.email === adminEmail && u.role === 'admin'
      );
      
      if (adminIndex === -1) {
        throw new Error('Admin account not found');
      }
      
      // Don't allow suspending super admin
      if (adminEmail === 'superadmin@renteasy.com') {
        throw new Error('Cannot suspend Super Admin account');
      }
      
      storedUsers[adminIndex] = {
        ...storedUsers[adminIndex],
        isActive: false,
        suspensionReason: reason,
        suspendedAt: new Date().toISOString(),
        suspendedBy: 'superadmin@renteasy.com'
      };
      
      localStorage.setItem('renteasy_users', JSON.stringify(storedUsers));
      
      // Log suspension
      const adminLogs = JSON.parse(localStorage.getItem('admin_activities') || '[]');
      adminLogs.push({
        action: `Suspended admin account: ${adminEmail}`,
        reason: reason,
        suspendedBy: 'superadmin@renteasy.com',
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('admin_activities', JSON.stringify(adminLogs));
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const updateCommissionRules = (newRules) => {
    try {
      if (!isSuperAdmin) {
        throw new Error('Only Super Admin can update commission rules');
      }
      
      // Validate commission rules
      if (newRules.totalCommission !== 7.5) {
        throw new Error('Total commission must remain 7.5%');
      }
      
      if (newRules.estateFirmCommission !== 0) {
        throw new Error('Estate firm commission must remain 0%');
      }
      
      const systemRules = JSON.parse(localStorage.getItem('systemRules') || '{}');
      const updatedRules = {
        ...systemRules,
        commission: newRules,
        updatedAt: new Date().toISOString(),
        updatedBy: 'superadmin@renteasy.com'
      };
      
      localStorage.setItem('systemRules', JSON.stringify(updatedRules));
      
      // Log rule change
      const auditLogs = JSON.parse(localStorage.getItem('auditLogs') || '[]');
      auditLogs.unshift({
        id: Date.now(),
        action: 'COMMISSION_RULES_UPDATE',
        user: 'superadmin@renteasy.com',
        timestamp: new Date().toISOString(),
        details: `Updated commission rules: ${JSON.stringify(newRules)}`
      });
      localStorage.setItem('auditLogs', JSON.stringify(auditLogs.slice(0, 1000)));
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };
  // ========== END SUPER ADMIN ONLY FUNCTIONS ==========

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

  const mockSuperAdminLogin = () => {
    return superAdminLogin('superadmin@renteasy.com', 'admin123');
  };

  const clearAuthError = () => {
    setAuthError(null);
  };

  const value = {
    // State
    user,
    loading,
    authError,
    isSuperAdmin,
    
    // Actions
    login,
    logout,
    updateUser,
    updateUserVerification,
    refreshUser,
    mockLoginAs,
    clearAuthError,
    createAdminAccount,
    
    // Super Admin Actions
    superAdminLogin,
    superAdminLogout,
    switchToSuperAdmin,
    switchToRegularUser,
    mockSuperAdminLogin,
    suspendAdminAccount,
    updateCommissionRules,
    
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
    },
    
    // Permission check
    can: (action) => {
      if (!user) return false;
      if (isSuperAdmin) return true; // Super Admin can do everything
      if (user.permissions && user.permissions.includes('*')) return true;
      if (user.permissions && user.permissions.includes(action)) return true;
      return false;
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;