// Simple auth helper to avoid complex PrivateRoute issues
export const setupSuperAdmin = () => {
    // Only set up if not already set
    if (!localStorage.getItem('superAdminToken')) {
      const superAdminData = {
        id: 'super-admin-001',
        email: 'superadmin@renteasy.com',
        role: 'super-admin',
        name: 'Super Admin'
      };
      
      localStorage.setItem('superAdminToken', 'demo-token-' + Date.now());
      localStorage.setItem('superAdminData', JSON.stringify(superAdminData));
      
      console.log('Super admin credentials set up');
    }
  };
  
  export const clearAuth = () => {
    localStorage.removeItem('superAdminToken');
    localStorage.removeItem('superAdminData');
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
  };