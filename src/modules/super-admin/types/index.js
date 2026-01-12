// Super Admin API Types
export const AdminScope = {
    VERIFICATION: 'VERIFICATION',
    PAYMENTS: 'PAYMENTS',
    DISPUTES: 'DISPUTES',
    CHATS: 'CHATS',
    MARKETPLACE: 'MARKETPLACE',
    LISTINGS: 'LISTINGS'
  };
  
  export const ListingStatus = {
    UNVERIFIED: 'unverified',
    VERIFIED: 'verified',
    SUSPENDED: 'suspended',
    RENTED: 'rented',
    EXPIRED: 'expired'
  };
  
  export const ListingOrigin = {
    TENANT: 'tenant',
    LANDLORD: 'landlord',
    ESTATE_FIRM: 'estate_firm'
  };
  
  export const ChatType = {
    TENANT_LANDLORD: 'tenant-landlord',
    TENANT_MANAGER: 'tenant-manager',
    LANDLORD_MANAGER: 'landlord-manager'
  };
  
  export const CommissionBreakdown = {
    MANAGER: 2.5,
    REFERRER: 1.0,
    PLATFORM: 4.0,
    TOTAL: 7.5
  };
  
  export const EmergencyControls = {
    FREEZE_TRANSACTIONS: 'freeze_transactions',
    DISABLE_LISTINGS: 'disable_listings',
    DISABLE_PAYOUTS: 'disable_payouts',
    LOCK_CHATS: 'lock_chats',
    SUSPEND_ROLE: 'suspend_role',
    SYSTEM_ALERT: 'system_alert'
  };