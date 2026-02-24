// config.js
const config = {
    // API Configuration
    API_BASE_URL: 'http://localhost:5000/api',
    
    // Environment
    NODE_ENV: process.env.NODE_ENV || 'development',
    
    // Mock API settings
    MOCK_API: true, // Set to true to use mock data, false for real API
    
    // App Configuration
    APP_NAME: 'RentEasy',
    VERSION: '1.0.0',
    
    // Timeout settings
    API_TIMEOUT: 10000,
    
    // Storage keys
    STORAGE_KEYS: {
      TOKEN: 'renteasy_token',
      USER: 'renteasy_user',
      ROLE: 'renteasy_role',
      REMEMBER_ME: 'renteasy_remember'
    },
    
    // Commission rates (in percentage)
    COMMISSION_RATES: {
      TOTAL: 7.5,
      MANAGER: 2.5,
      POSTER: 1.5, // For landlord/tenant who posts the property
      PLATFORM: 3.5,
      REFERRAL_BONUS: 5000 // ₦5,000 per successful referral
    },
    
    // User roles
    ROLES: {
      TENANT: 'tenant',
      LANDLORD: 'landlord',
      MANAGER: 'manager',
      ESTATE_FIRM: 'estate-firm',
      ADMIN: 'admin',
      SUPER_ADMIN: 'super_admin'
    },
    
    // Property status
    PROPERTY_STATUS: {
      AVAILABLE: 'available',
      RENTED: 'rented',
      PENDING: 'pending',
      VACANT: 'vacant'
    },
    
    // Verification status
    VERIFICATION_STATUS: {
      UNVERIFIED: 'unverified',
      VERIFIED: 'verified',
      PENDING: 'pending'
    },
    
    // Notification types
    NOTIFICATION_TYPES: {
      MESSAGE: 'message',
      RENT_DUE: 'rent_due',
      COMMISSION: 'commission',
      REFERRAL: 'referral',
      VERIFICATION: 'verification'
    },
    
    // Map settings
    MAP: {
      DEFAULT_ZOOM: 12,
      DEFAULT_CENTER: {
        lat: 6.5244, // Lagos coordinates
        lng: 3.3792
      },
      MANAGER_RADIUS: 1000 // 1km radius for manager notifications
    },
    
    // Pagination
    PAGINATION: {
      DEFAULT_PAGE: 1,
      DEFAULT_LIMIT: 10
    },
    
    // Currency
    CURRENCY: {
      SYMBOL: '₦',
      CODE: 'NGN',
      LOCALE: 'en-NG'
    },
    
    // Date format
    DATE_FORMAT: {
      DISPLAY: 'DD MMM YYYY',
      API: 'YYYY-MM-DD',
      DATETIME: 'DD MMM YYYY, h:mm A'
    }
  };
  
  // Export based on environment
  if (typeof window !== 'undefined') {
    // Browser environment - add window-specific config
    config.IS_BROWSER = true;
    config.HOSTNAME = window.location.hostname;
    config.PORT = window.location.port;
    config.PROTOCOL = window.location.protocol;
    
    // Auto-detect API URL for different environments
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      config.API_BASE_URL = 'http://localhost:5000/api';
    } else if (window.location.hostname.includes('vercel.app') || window.location.hostname.includes('netlify.app')) {
      // For deployment platforms
      config.API_BASE_URL = 'https://renteasy-backend.onrender.com/api'; // Replace with your backend URL
    } else {
      // Production
      config.API_BASE_URL = 'https://api.renteasy.com/api'; // Replace with your production API
    }
  } else {
    // Node.js environment (if needed for SSR)
    config.IS_BROWSER = false;
  }
  
  export default config;