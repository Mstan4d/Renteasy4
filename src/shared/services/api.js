import axios from 'axios';

// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';
const isMockMode = false; // Set to false when backend is ready

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Store token in axios default headers
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('renteasy_token', token);
  } else {
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('renteasy_token');
  }
};

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('renteasy_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('renteasy_token');
      localStorage.removeItem('renteasy_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Helper for API responses
export const handleApiResponse = async (apiCall) => {
  try {
    const response = await apiCall;
    return {
      success: true,
      data: response.data.data || response.data,
      message: response.data.message || 'Success'
    };
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || 
             error.response?.data?.errors?.[0] || 
             error.message || 
             'Something went wrong'
    };
  }
};

// ========== MOCK API FUNCTIONS ==========
const mockAPI = {
  getLandlordDashboard: () => Promise.resolve({
    data: {
      success: true,
      data: {
        stats: {
          totalProperties: 8,
          activeRentals: 5,
          vacantProperties: 2,
          pendingVerification: 1,
          monthlyEarnings: 1250000,
          totalEarnings: 8750000,
          commissionPaid: 1125000,
          managerAssigned: 6,
          totalCommissionEarned: 525000,
          pendingCommission: 87500,
          referralBonus: 15000
        },
        properties: [
          {
            id: 'prop-1',
            title: '3 Bedroom Duplex in Lekki',
            address: '123 Lekki Phase 1, Lagos',
            price: 3500000,
            status: 'rented',
            verification: 'verified',
            tenant: {
              name: 'John Doe',
              phone: '+2348012345678',
              email: 'john@example.com',
              joinDate: '2024-01-15'
            },
            rentDue: '2024-12-15',
            commission: {
              total: 262500,
              breakdown: {
                manager: 87500,
                landlord: 52500,
                rentEasy: 122500
              },
              paid: true,
              paidDate: '2024-01-20'
            },
            type: 'Duplex',
            bedrooms: 3,
            bathrooms: 3,
            area: '3500 sq ft',
            postedBy: 'landlord',
            managerAssigned: true,
            manager: {
              id: 'manager_001',
              name: 'James Manager',
              phone: '+2348023456789',
              rating: 4.8
            },
            chats: ['chat_001'],
            images: [
              'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400',
              'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400'
            ],
            createdAt: '2023-11-15',
            lastUpdated: '2024-01-20'
          }
        ],
        recentActivity: [
          { id: 1, type: 'commission', message: 'Commission earned: ₦52,500 from 3 Bedroom Duplex', date: '2024-01-20', amount: 52500 },
          { id: 2, type: 'rent', message: 'Rent received: ₦3,500,000', date: '2024-01-15', amount: 3500000 },
          { id: 3, type: 'referral', message: 'Referral bonus: ₦5,000 from James referral', date: '2024-01-10', amount: 5000 }
        ],
        notifications: [
          { id: 1, type: 'message', message: 'New message from tenant John', date: '2 hours ago', read: false },
          { id: 2, type: 'rent', message: 'Rent due in 5 days for 3 Bedroom Duplex', date: '1 day ago', read: true }
        ],
        referral: {
          totalBonus: 15000,
          successfulReferrals: 3,
          pendingBonus: 5000,
          code: 'LANDREF123'
        }
      },
      message: 'Dashboard data fetched successfully'
    }
  })
};

// ========== AUTH API ==========
export const authAPI = {
  register: (userData) => {
    console.log('Sending registration data to backend:', userData);
    
    // Transform the data to match backend expectations
    const backendData = {
      fullName: userData.fullName,
      email: userData.email,
      password: userData.password,
      role: userData.role,
      referralCode: userData.referralCode || undefined,
      // Add other fields if they exist
      ...(userData.phone && { phone: userData.phone }),
      ...(userData.companyName && { companyName: userData.companyName }),
      ...(userData.providerInfo && { providerInfo: userData.providerInfo })
    };
    
    console.log('Transformed data for backend:', backendData);
    
    return api.post('/auth/register', backendData);
  },
  
  login: (email, password, role) => {
    console.log('Login attempt:', { email });
    return api.post('/auth/login', { email, password, role });
  },
  
  getProfile: () => {
    if (isMockMode) {
      return Promise.resolve({
        data: {
          success: true,
          data: {
            user: JSON.parse(localStorage.getItem('renteasy_user') || '{}') || {
              id: '1',
              name: 'John Landlord',
              email: 'landlord@example.com',
              role: 'landlord',
              phone: '+2348012345678',
              referralCode: 'LANDREF123',
              walletBalance: 1250000,
              kycStatus: 'verified'
            }
          }
        }
      });
    } else {
      return api.get('/auth/profile');
    }
  },
  
  logout: () => api.post('/auth/logout')
};

// ========== DASHBOARD API ==========
export const dashboardAPI = {
  getLandlordDashboard: () => 
    isMockMode 
      ? mockAPI.getLandlordDashboard() 
      : api.get('/landlord/dashboard'),
  
  getTenantDashboard: () => 
    isMockMode
      ? Promise.resolve({
          data: {
            success: true,
            data: {
              stats: {
                rentedProperties: 1,
                totalRentPaid: 1200000,
                upcomingPayments: 1,
                savedProperties: 3,
                commissionEarned: 75000,
                referralBonus: 10000
              }
            }
          }
        })
      : api.get('/tenant/dashboard'),
  
  getManagerDashboard: () => 
    isMockMode
      ? Promise.resolve({
          data: {
            success: true,
            data: {
              stats: {
                activeListings: 8,
                verifiedProperties: 12,
                pendingVerifications: 2,
                totalCommissionEarned: 225000,
                pendingCommission: 45000
              }
            }
          }
        })
      : api.get('/manager/dashboard')
};

// ========== LISTINGS API ==========
export const listingsAPI = {
  getAll: (params = {}) => api.get('/listings', { params }),
  getById: (id) => api.get(`/listings/${id}`),
  create: (listingData) => 
    isMockMode
      ? Promise.resolve({
          data: {
            success: true,
            data: {
              ...listingData,
              id: `prop_${Date.now()}`,
              createdAt: new Date().toISOString(),
              status: 'pending',
              verification: 'pending'
            },
            message: 'Property listed successfully'
          }
        })
      : api.post('/listings', listingData),
  
  update: (id, data) => api.put(`/listings/${id}`, data),
  delete: (id) => api.delete(`/listings/${id}`),
  acceptToManage: (id) => api.post(`/listings/${id}/accept-manage`),
  verify: (id) => api.post(`/listings/${id}/verify`),
  reject: (id, reason) => api.post(`/listings/${id}/reject`, { reason }),
  
  // Landlord specific
  markAsRented: (propertyId) => 
    isMockMode
      ? Promise.resolve({
          data: {
            success: true,
            data: { propertyId, status: 'rented' },
            message: 'Property marked as rented'
          }
        })
      : api.post(`/listings/${propertyId}/mark-rented`)
};

// ========== REFERRAL API ==========
export const referralAPI = {
  getStats: () => 
    isMockMode
      ? Promise.resolve({
          data: {
            success: true,
            data: {
              code: 'LANDREF123',
              link: `${window.location.origin}/signup?ref=LANDREF123`,
              totalBonus: 15000,
              successfulReferrals: 3,
              pendingBonus: 5000
            }
          }
        })
      : api.get('/referrals/stats'),
  
  getReferrals: () => api.get('/referrals'),
  generateLink: () => api.post('/referrals/generate-link')
};

// ========== MESSAGES API ==========
export const messagesAPI = {
  getConversations: () => api.get('/messages/conversations'),
  getMessages: (conversationId) => api.get(`/messages/${conversationId}`),
  sendMessage: (conversationId, message) => 
    api.post(`/messages/${conversationId}/send`, { message }),
  
  initiateContact: (listingId) => 
    isMockMode
      ? Promise.resolve({
          data: {
            success: true,
            data: {
              chatId: `chat_${listingId}_${Date.now()}`,
              participants: ['user_1', `landlord_${listingId}`]
            },
            message: 'Chat initiated successfully'
          }
        })
      : api.post(`/messages/initiate/${listingId}`)
};

// ========== COMMISSION API ==========
export const commissionAPI = {
  getCommissionHistory: () => api.get('/commissions/history'),
  getCommissionBreakdown: (propertyId) => api.get(`/commissions/${propertyId}/breakdown`),
  requestPayout: (amount) => api.post('/commissions/payout', { amount })
};

// ========== USER API ==========
export const userAPI = {
  updateProfile: (data) => api.put('/users/profile', data),
  updatePassword: (data) => api.put('/users/password', data),
  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return api.post('/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
};

// ========== EXPORT DEFAULT ==========
export default api;