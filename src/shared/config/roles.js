// src/shared/config/roles.js
export const ROLES = {
  PRINCIPAL: 'principal',
  EXECUTIVE: 'executive',
  ASSOCIATE: 'associate'
};

export const roleConfig = {
  [ROLES.PRINCIPAL]: {
    name: 'Principal',
    title: 'Firm Principal',
    description: 'Full control of the estate firm',
    icon: '👑',
    color: '#8b5cf6',
    badgeColor: 'purple',
    permissions: {
      viewAll: true,
      create: true,
      edit: true,
      delete: true,
      manageStaff: true,
      viewReports: true,
      firmSettings: true,
      confirmPayments: true,
      archive: true
    }
  },
  [ROLES.EXECUTIVE]: {
    name: 'Executive',
    title: 'Property Executive',
    description: 'Full operational control',
    icon: '⭐',
    color: '#3b82f6',
    badgeColor: 'blue',
    permissions: {
      viewAll: true,
      create: true,
      edit: true,
      delete: false,
      manageStaff: false,
      viewReports: true,
      firmSettings: false,
      confirmPayments: true,
      archive: true
    }
  },
  [ROLES.ASSOCIATE]: {
    name: 'Associate',
    title: 'Property Associate',
    description: 'Manage own properties and listings',
    icon: '🤝',
    color: '#10b981',
    badgeColor: 'green',
    permissions: {
      viewAll: false,
      create: true,
      edit: true, // only own
      delete: false,
      manageStaff: false,
      viewReports: false, // only own
      firmSettings: false,
      confirmPayments: false,
      archive: false
    }
  }
};

// Helper function to check if user has permission
export const hasPermission = (userRole, permission) => {
  const config = roleConfig[userRole];
  if (!config) return false;
  return config.permissions[permission] || false;
};

// Helper to check if user can view/edit a specific item
export const canAccessItem = (userRole, userId, itemCreatedByStaffId) => {
  // Principal and Executive can see everything
  if (userRole === ROLES.PRINCIPAL || userRole === ROLES.EXECUTIVE) {
    return true;
  }
  // Associate can only see their own items
  return userId === itemCreatedByStaffId;
};