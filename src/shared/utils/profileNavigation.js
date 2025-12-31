/**
 * Utility function to determine profile route based on user role
 */
export const getProfileRoute = (user) => {
  if (!user) return '/login';
  
  const role = user.role || 'tenant';
  
  switch(role) {
    case 'estate-firm':
    case 'manager':
    case 'admin':
      // For estate firms, show their public profile
      const firmId = user.estateFirmId || user.companyId || user.id;
      return `/estate-firms/${firmId}`;
      
    case 'landlord':
      return '/dashboard/profile'; // Or create landlord-specific profile
      
    case 'tenant':
      return '/dashboard/profile'; // Or create tenant-specific profile
      
    default:
      return '/dashboard/profile';
  }
};

/**
 * Check if profile page exists in routes for a given role
 */
export const hasProfileRoute = (role) => {
  const routes = {
    'estate-firm': true,
    'manager': true,
    'admin': true,
    'landlord': true,
    'tenant': true
  };
  return routes[role] || false;
};