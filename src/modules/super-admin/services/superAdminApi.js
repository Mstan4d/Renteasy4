// src/modules/super-admin/services/superAdminApi.js
// PURE MOCK VERSION - NO BACKEND CALLS

const simulateDelay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const generateMockData = {
  commandCenter: () => ({
    listings: {
      total: 1247,
      live: 892,
      unverified: 213,
      verified: 679,
      rented: 142,
      breakdown: {
        tenant: 312,
        landlord: 567,
        estateFirm: 368
      }
    },
    chats: {
      active: 156,
      tenantLandlord: 89,
      tenantManager: 67,
      byStatus: {
        active: 156,
        completed: 245,
        disputed: 12
      }
    },
    managers: {
      total: 84,
      online: 67,
      offline: 17,
      active: 58,
      inactive: 26
    },
    disputes: {
      pending: 12,
      resolved: 45,
      today: 3
    },
    revenue: {
      today: 125000,
      week: 875000,
      month: 2850000,
      lifetime: 15200000,
      trends: {
        daily: [120000, 125000, 118000, 132000, 140000, 125000, 130000],
        weekly: [800000, 850000, 820000, 875000, 900000]
      }
    },
    commission: {
      total: 190000,
      breakdown: {
        manager: 62500,
        referrer: 25000,
        platform: 102500
      },
      pendingPayouts: 35000
    },
    systemHealth: {
      uptime: '99.9%',
      responseTime: '120ms',
      activeUsers: 842,
      serverLoad: '42%',
      databaseStatus: 'healthy'
    },
    recentActivities: [
      {
        id: 1,
        type: 'listing',
        user: 'JohnDoe',
        role: 'tenant',
        action: 'posted new property',
        time: '2 minutes ago',
        priority: 'normal'
      },
      {
        id: 2,
        type: 'payment',
        user: 'JaneSmith',
        role: 'landlord',
        action: 'received commission payment',
        time: '5 minutes ago',
        priority: 'high'
      },
      {
        id: 3,
        type: 'verification',
        user: 'Manager001',
        role: 'manager',
        action: 'verified property listing',
        time: '15 minutes ago',
        priority: 'normal'
      }
    ]
  }),

  admins: () => ({
    total: 8,
    active: 7,
    suspended: 1,
    list: [
      {
        id: 1,
        email: 'admin.verification@renteasy.com',
        name: 'Verification Admin',
        role: 'admin',
        permissions: ['verification', 'listing_approval'],
        status: 'active',
        lastActive: '2024-01-15 14:30:00',
        createdBy: 'superadmin@renteasy.com',
        scope: ['VERIFICATION', 'LISTINGS']
      },
      {
        id: 2,
        email: 'admin.payments@renteasy.com',
        name: 'Payments Admin',
        role: 'admin',
        permissions: ['payments', 'commission'],
        status: 'active',
        lastActive: '2024-01-15 14:25:00',
        createdBy: 'superadmin@renteasy.com',
        scope: ['PAYMENTS', 'COMMISSION']
      },
      {
        id: 3,
        email: 'admin.disputes@renteasy.com',
        name: 'Disputes Admin',
        role: 'admin',
        permissions: ['disputes', 'moderation'],
        status: 'active',
        lastActive: '2024-01-15 14:20:00',
        createdBy: 'superadmin@renteasy.com',
        scope: ['DISPUTES', 'CHATS']
      }
    ]
  }),

  listings: () => ({
    total: 1247,
    page: 1,
    limit: 50,
    data: [
      {
        id: 'PROP-001',
        title: '3-Bedroom Apartment in Lekki',
        type: 'apartment',
        price: 300000,
        status: 'verified',
        postedBy: {
          id: 'USER-001',
          name: 'John Doe',
          role: 'tenant',
          email: 'john@example.com'
        },
        manager: {
          id: 'MANAGER-001',
          name: 'Manager Lagos',
          status: 'active'
        },
        location: 'Lekki, Lagos',
        createdAt: '2024-01-10 10:30:00',
        verifiedAt: '2024-01-11 14:20:00',
        commissionType: 'tenant',
        commissionApplied: true,
        commissionAmount: 22500
      },
      {
        id: 'PROP-002',
        title: 'Luxury Villa in Banana Island',
        type: 'villa',
        price: 2500000,
        status: 'unverified',
        postedBy: {
          id: 'USER-002',
          name: 'Jane Smith',
          role: 'landlord',
          email: 'jane@example.com'
        },
        manager: null,
        location: 'Banana Island, Lagos',
        createdAt: '2024-01-15 09:15:00',
        verifiedAt: null,
        commissionType: 'landlord',
        commissionApplied: true,
        commissionAmount: 187500
      }
    ]
  })
};

// Pure mock API with no axios
const superAdminApi = {
  // Authentication
  login: async (credentials) => {
    await simulateDelay(500);
    
    const { email, password } = credentials;
    
    if (email === 'superadmin@renteasy.com' && password === 'admin123') {
      const mockResponse = {
        token: 'super-admin-jwt-token-mock',
        user: {
          id: 'SUPER-ADMIN-001',
          email: 'superadmin@renteasy.com',
          name: 'RentEasy Super Admin',
          role: 'super-admin',
          permissions: ['*']
        }
      };
      
      localStorage.setItem('superAdminToken', mockResponse.token);
      localStorage.setItem('superAdminData', JSON.stringify(mockResponse.user));
      
      return { data: mockResponse };
    } else {
      throw new Error('Invalid credentials');
    }
  },

  logout: () => {
    localStorage.removeItem('superAdminToken');
    localStorage.removeItem('superAdminData');
    return Promise.resolve();
  },

  // Command Center
  getCommandCenterData: async () => {
    await simulateDelay(500);
    return { data: generateMockData.commandCenter() };
  },

  subscribeToRealTimeUpdates: (callback) => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      callback(generateMockData.commandCenter());
    }, 30000);

    return () => clearInterval(interval);
  },

  // Admin Management
  getAdmins: async () => {
    await simulateDelay(600);
    return { data: generateMockData.admins() };
  },

  createAdmin: async (adminData) => {
    await simulateDelay(800);
    return {
      data: {
        ...adminData,
        id: `ADMIN-${Date.now()}`,
        status: 'active',
        createdAt: new Date().toISOString(),
        createdBy: 'superadmin@renteasy.com'
      }
    };
  },

  updateAdmin: async (adminId, updates) => {
    await simulateDelay(700);
    return {
      data: {
        id: adminId,
        ...updates,
        updatedAt: new Date().toISOString()
      }
    };
  },

  suspendAdmin: async (adminId, reason) => {
    await simulateDelay(800);
    return {
      data: {
        id: adminId,
        status: 'suspended',
        suspensionReason: reason,
        suspendedAt: new Date().toISOString()
      }
    };
  },

  // Listings
  getGlobalListings: async () => {
    await simulateDelay(600);
    return { data: generateMockData.listings() };
  },

  // All other API functions return mock data
  updateListingStatus: async (listingId, status) => ({
    data: { id: listingId, status, updatedAt: new Date().toISOString() }
  }),

  getManagers: async () => ({
    data: {
      total: 84,
      active: 58,
      data: [
        {
          id: 'MANAGER-001',
          name: 'Manager Lagos',
          email: 'manager.lagos@renteasy.com',
          status: 'active',
          online: true,
          listings: 24,
          earnings: 62500
        }
      ]
    }
  }),

  getPayments: async () => ({
    data: {
      total: 245,
      amount: 1900000,
      data: [
        {
          id: 'PAY-001',
          amount: 300000,
          commission: 22500,
          status: 'completed',
          timestamp: '2024-01-15 10:30:00'
        }
      ]
    }
  }),

  getDisputes: async () => ({
    data: {
      pending: 12,
      resolved: 45,
      data: [
        {
          id: 'DISP-001',
          type: 'payment_dispute',
          status: 'pending',
          amount: 300000
        }
      ]
    }
  }),

  getAuditLogs: async () => ({
    data: {
      total: 1250,
      data: [
        {
          id: 1,
          timestamp: '2024-01-15 14:30:25',
          user: 'superadmin@renteasy.com',
          action: 'OVERRIDE',
          details: 'Override commission distribution'
        }
      ]
    }
  }),

  getSystemRules: async () => ({
    data: {
      commission: {
        total: 7.5,
        breakdown: { manager: 2.5, referrer: 1.0, platform: 4.0 }
      }
    }
  }),

  // Quick Actions
  quickActions: {
    forceVerifyListing: async () => ({ data: { success: true } }),
    suspendUser: async () => ({ data: { success: true } }),
    sendSystemAlert: async () => ({ data: { success: true } })
  }
};

export default superAdminApi;