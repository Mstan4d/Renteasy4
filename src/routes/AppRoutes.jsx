import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import Home from '../modules/content/pages/Home';
import Login from '../modules/auth/pages/Login';
import Signup from '../modules/auth/pages/Signup';
import PublicLayout from '../shared/components/layout/PublicLayout';
import ForceSingleLayout from '../components/ForceSingleLayout';
import AuthCallback from '../modules/auth/pages/AuthCallback';
import ErrorBoundary from '../shared/components/ErrorBoundary';

// Loading Components
const DashboardLoading = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    minHeight: '400px' 
  }}>
    <div className="loading-spinner"></div>
  </div>
);

const AdminLoading = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    minHeight: '100vh' 
  }}>
    <div className="loading-spinner"></div>
    <p>Loading Admin Panel...</p>
  </div>
);

const SuperAdminLoading = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    minHeight: '100vh',
    flexDirection: 'column',
    gap: '20px'
  }}>
    <div className="loading-spinner" style={{ width: '60px', height: '60px' }}></div>
    <p style={{ fontSize: '18px', fontWeight: '500', color: '#333' }}>Loading Super Admin Console...</p>
    <p style={{ fontSize: '14px', color: '#666' }}>Highest privilege level • Secure access</p>
  </div>
);

// ========== LAYOUT COMPONENTS ==========
const LandlordLayout = lazy(() => import('../modules/dashboard/components/landlord/LandlordLayout'));
const TenantSidebarLayout = lazy(() => import('../modules/dashboard/components/tenant/TenantSidebarLayout'));
const ManagerLayout = lazy(() => import('../modules/manager/components/ManagerLayout'));
const ProviderLayout = lazy(() => import('../modules/providers/components/ProviderLayout'));
const EstateFirmLayout = lazy(() => import('../modules/estate-firm/components/EstateFirmLayout'));
const NewTenantKycForm = lazy(() => import('../modules/dashboard/pages/tenant/NewTenantKycForm'));

// Lazy load components
const AdminDashboard = lazy(() => import('../modules/admin/pages/AdminDashboard'));
const AdminUsers = lazy(() => import('../modules/admin/pages/AdminUsers'));
const AdminListings = lazy(() => import('../modules/admin/pages/AdminListings'));
const AdminServices = lazy(() => import('../modules/admin/pages/AdminServices'));
const AdminVerification = lazy(() => import('../modules/admin/pages/AdminVerification'));
const AdminAnalytics = lazy(() => import('../modules/admin/pages/AdminAnalytics'));
const AdminLayout = lazy(() => import('../modules/admin/components/AdminLayout'));
const AdminIssues = lazy(() => import('../modules/admin/pages/AdminIssues'));
const AdminReports = lazy(() => import('../modules/admin/pages/AdminReports'));
const AdminTransactions = lazy(() => import('../modules/admin/pages/AdminTransactions'));
const AdminRevenue = lazy(() => import('../modules/admin/pages/AdminRevenue'));
const AdminSettings = lazy(() => import('../modules/admin/pages/AdminSettings'));
const AdminProviderOverview = lazy(() => import('../modules/admin/pages/AdminProviderOverview'));
const AdminServiceCategories = lazy(() => import('../modules/admin/pages/AdminServiceCategories'));
const AdminReferrals = lazy(() => import('../modules/admin/pages/AdminReferrals'));
const AdminVerificationsPending = lazy(() => import('../modules/admin/pages/AdminVerificationsPending'));
const AdminRentalConfirmations = lazy(() => import('../modules/admin/pages/AdminRentalConfirmations'));
const AdminPaymentProofs = lazy(() => import('../modules/admin/pages/AdminPaymentProofs'));


// Manager Dashboard Components
const ManagerDashboard = lazy(() => import('../modules/manager/pages/ManagerDashboard'));
const ManagerProfile = lazy(() => import('../modules/profile/pages/ManagerProfile'));
const ManagerCommission = lazy(() => import('../modules/manager/pages/ManagerCommission'));
const ManagerAnalytics = lazy(() => import('../modules/manager/pages/ManagerAnalytics'));
const ManagerSetup = lazy(() => import('../modules/manager/pages/ManagerSetup'));
const ManagerNotifications = lazy(() => import('../modules/manager/pages/ManagerNotifications'));
const ManagerChats = lazy(() => import('../modules/manager/pages/ManagerChats'));
const ManagerProperties = lazy(() => import('../modules/manager/pages/ManagerProperties'));
const ManagerPayments = lazy(() => import('../modules/manager/pages/ManagerPayments'));
const ManagerKYC = lazy(() => import('../modules/manager/pages/ManagerKYC'));
const ManagerRadius = lazy(() => import('../modules/manager/pages/ManagerRadius'));
const ManagerChatMonitoring = lazy(() => import('../modules/manager/components/ManagerChatMonitoring'));
const ManagerWithdrawal = lazy(() => import('../modules/manager/pages/ManagerWithdrawal'));
const ManagerVerificationPage = lazy(() => import('../modules/manager/pages/ManagerVerificationPage'));


// Tenant Dashboard Components
const TenantDashboard = lazy(() => import('../modules/dashboard/pages/tenant/TenantDashboard'));
const TenantProfile = lazy(() => import('../modules/dashboard/pages/tenant/TenantProfile'));
const TenantApplications = lazy(() => import('../modules/dashboard/pages/tenant/TenantApplications'));
const TenantSavedProperties = lazy(() => import('../modules/dashboard/pages/tenant/TenantSavedProperties'));
const TenantRentalHistory = lazy(() => import('../modules/dashboard/pages/tenant/TenantRentalHistory'));
const TenantPayments = lazy(() => import('../modules/dashboard/pages/tenant/TenantPayments'));
const TenantMaintenance = lazy(() => import('../modules/dashboard/pages/tenant/TenantMaintenance'));
const TenantDocuments = lazy(() => import('../modules/dashboard/pages/tenant/TenantDocuments'));
const TenantReferrals = lazy(() => import('../modules/dashboard/pages/tenant/TenantReferrals'));
const TenantSettings = lazy(() => import('../modules/dashboard/pages/tenant/TenantSettings'));
const TenantLeases = lazy(() => import('../modules/dashboard/pages/tenant/TenantLeases'));

// Landlord Components
const LandlordDashboard = lazy(() => import('../modules/dashboard/pages/landlord/LandlordDashboard'));
const LandlordPropertyDetail = lazy(() => import('../modules/dashboard/components/landlord/PropertyDetail'));
const LandlordEarnings = lazy(() => import('../modules/dashboard/components/landlord/WithdrawFunds'));
const LandlordWallet = lazy(() => import('../modules/dashboard/components/landlord/WalletHistory'));
const LandlordReferrals = lazy(() => import('../modules/dashboard/components/landlord/ReferralHistory'));
const LandlordAnalytics = lazy(() => import('../modules/dashboard/components/landlord/Analytics'));
const LandlordSettings = lazy(() => import('../modules/dashboard/components/landlord/Reports'));
const LandlordProfile = lazy(() => import('../modules/profile/pages/LandlordProfile'));
const LandlordRentTracking = lazy(() => import('../modules/dashboard/components/landlord/LandlordRentTracking'));

// Estate Firm Components
const EstateDashboard = lazy(() => import('../modules/estate-firm/pages/EstateDashboard'));
const EstateProfile = lazy(() => import('../modules/estate-firm/pages/EstateProfile'));
const EstateProperties = lazy(() => import('../modules/estate-firm/pages/EstateProperties'));
const EstateClients = lazy(() => import('../modules/estate-firm/pages/EstateClients'));
const EstateAnalytics = lazy(() => import('../modules/estate-firm/pages/EstateAnalytics'));
const EstateReports = lazy(() => import('../modules/estate-firm/pages/EstateReports'));
const EstateSettings = lazy(() => import('../modules/estate-firm/pages/EstateSettings'));
const EstateBulkUpload = lazy(() => import('../modules/estate-firm/pages/EstateBulkUpload'));
const EstateVerification = lazy(() => import('../modules/estate-firm/pages/EstateVerification'));
const EstateDocuments = lazy(() => import('../modules/estate-firm/pages/EstateDocuments'));
const EstateServices = lazy(() => import('../modules/estate-firm/pages/EstateServices'));
const EstatePostService = lazy(() => import('../modules/estate-firm/pages/EstatePostService'));
const EstateAddExternalProperty = lazy(() => import('../modules/estate-firm/pages/EstateAddExternalProperty'));
const PropertyDetail = lazy(() => import('../modules/estate-firm/pages/PropertyDetail'));
const PaymentsList = lazy(() => import('../modules/estate-firm/pages/PaymentsList'));
const RentTracking = lazy(() => import('../modules/estate-firm/pages/RentTracking'));
const EstateEditProperty = lazy(() => import('../modules/estate-firm/pages/EstateEditProperty'));


// === SUPER ADMIN IMPORTS ===
const SuperAdminLayout = lazy(() => import('../modules/super-admin/components/SuperAdminLayout'));
const CommandCenterPage = lazy(() => import('../modules/super-admin/pages/CommandCenterPage'));
const AdminManagementPage = lazy(() => import('../modules/super-admin/pages/AdminManagementPage'));
const GlobalListingsPage = lazy(() => import('../modules/super-admin/pages/GlobalListingsPage'));
const GlobalManagersPage = lazy(() => import('../modules/super-admin/pages/GlobalManagersPage'));
const ChatsOversightPage = lazy(() => import('../modules/super-admin/pages/ChatsOversightPage'));
const PaymentsCommissionPage = lazy(() => import('../modules/super-admin/pages/PaymentsCommissionPage'));
const DisputesPage = lazy(() => import('../modules/super-admin/pages/DisputesPage'));
const VerificationAuthorityPage = lazy(() => import('../modules/super-admin/pages/VerificationAuthorityPage'));
const SystemRulesPage = lazy(() => import('../modules/super-admin/pages/SystemRulesPage'));
const AuditLogsPage = lazy(() => import('../modules/super-admin/pages/AuditLogsPage'));
const EmergencyControlsPage = lazy(() => import('../modules/super-admin/pages/EmergencyControlsPage'));
const SuperAdminLogin = lazy(() => import('../modules/super-admin/pages/SuperAdminLogin'));
const TestPage = lazy(() => import('../modules/super-admin/pages/TestPage'));
const AdminProviderFreeBookings = lazy(() => import('../modules/super-admin//pages/AdminProviderFreeBookings'));
const AdminStates = lazy(() => import('../modules/super-admin/pages/AdminStates'));

// ========== PROVIDER IMPORTS ==========
const ProviderDashboard = lazy(() => import('../modules/providers/pages/ProviderDashboard'));
const ProviderProfile = lazy(() => import('../modules/providers/pages/ProviderProfile'));
const ProviderServices = lazy(() => import('../modules/providers/pages/ProviderServices'));
const ProviderSubscription = lazy(() => import('../modules/providers/pages/ProviderSubscription'));
const ProviderSubscribe = lazy(() => import('../modules/providers/pages/ProviderSubscribe'));
const ProviderBilling = lazy(() => import('../modules/providers/pages/ProviderBilling'));
const ProviderLeads = lazy(() => import('../modules/providers/pages/ProviderLeads'));
const ProviderBookings = lazy(() => import('../modules/providers/pages/ProviderBookings'));
const ProviderBookingDetails = lazy(() => import('../modules/providers/pages/ProviderBookingDetails'));
const ProviderCalendar = lazy(() => import('../modules/providers/pages/ProviderCalendar'));
const ProviderEarnings = lazy(() => import('../modules/providers/pages/ProviderEarnings'));
const ProviderPayouts = lazy(() => import('../modules/providers/pages/ProviderPayouts'));
const ProviderWallet = lazy(() => import('../modules/providers/pages/ProviderWallet'));
const ProviderTransactions = lazy(() => import('../modules/providers/pages/ProviderTransactions'));
const ProviderAnalytics = lazy(() => import('../modules/providers/pages/ProviderAnalytics'));
const ProviderVerify = lazy(() => import('../modules/providers/pages/ProviderVerify'));
const ProviderVerificationStatus = lazy(() => import('../modules/providers/pages/ProviderVerificationStatus'));
const ProviderSupport = lazy(() => import('../modules/providers/pages/ProviderSupport'));
const ProviderSettings = lazy(() => import('../modules/providers/pages/ProviderSettings'));
const ProviderNotifications = lazy(() => import('../modules/providers/pages/ProviderNotifications'));
const ProviderBoost = lazy(() => import('../modules/providers/pages/ProviderBoost'));
const ProviderBoostHistory = lazy(() => import('../modules/providers/pages/ProviderBoostHistory'));
const ProviderPostService = lazy(() => import('../modules/providers/pages/ProviderPostService'));
const ProviderServiceEdit = lazy(() => import('../modules/providers/pages/ProviderServiceEdit'));
const ProviderServiceCategories = lazy(() => import('../modules/providers/pages/ProviderServiceCategories'));
const ProviderMarketplaceProfile = lazy(() => import('../modules/providers/pages/ProviderMarketplaceProfile'));
const ProviderAvailability = lazy(() => import('../modules/providers/pages/ProviderAvailability'));
const ProviderMessages = lazy(() => import('../modules/providers/pages/ProviderMessages'));
const ProviderPortfolio = lazy(() => import('../modules/providers/pages/ProviderPortfolio'));
const ProviderPricing = lazy(() => import('../modules/providers/pages/ProviderPricing'));
const ProviderLocationSetup = lazy(() => import('../modules/providers/pages/ProviderLocationSetup'));
const ProviderReferral = lazy(() => import('../modules/providers/pages/ProviderReferral'));
const ProviderCompliance = lazy(() => import('../modules/providers/pages/ProviderCompliance'));
const ProviderPerformance = lazy(() => import('../modules/providers/pages/ProviderPerformance'));
const ProviderDocuments = lazy(() => import('../modules/providers/pages/ProviderDocuments'));
const ProviderPaymentMethods = lazy(() => import('../modules/providers/pages/ProviderPaymentMethods'));

// Other modules
const PostPropertyPage = lazy(() => import('../modules/properties/pages/PostPropertyPage'));
const Messages = lazy(() => import('../modules/messaging/pages/Messages'));
const ChatListPage = lazy(() => import('../modules/messaging/pages/ChatListPage'));
const ListingsPage = lazy(() => import('../modules/listings/pages/ListingsPage'));
const MarketplacePage = lazy(() => import('../modules/marketplace/pages/MarketplacePage'));
const VerificationHub = lazy(() => import('../modules/verification/pages/VerificationHub'));
const VerificationForm = lazy(() => import('../modules/verification/pages/VerificationForm'));
const VerificationStatus = lazy(() => import('../modules/verification/pages/VerificationStatus'));
const ListingDetailsPage = lazy(() => import('../modules/listings/pages/ListingDetailsPage'));
const ServiceDetailsPage = lazy(() => import('../modules/marketplace/pages/ServiceDetailsPage'));
const ProviderReviews = lazy(() => import('../modules/reviews/pages/ProviderReviews'));
const WriteReview = lazy(() => import('../modules/reviews/pages/WriteReview'));


const AppRoutes = () => {
  return (
    <Routes>
      {/* =================== PUBLIC ROUTES =================== */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Route>
      
      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* Public Super Admin Login Route */}
      <Route 
        path="/super-admin/login" 
        element={
          <Suspense fallback={<SuperAdminLoading />}>
            <SuperAdminLogin />
          </Suspense>
        }
      />

      {/* =================== SUPER ADMIN ROUTES =================== */}
      <Route 
        path="/super-admin/*"
        element={
          <PrivateRoute allowedRoles={['super-admin']} redirectTo="/super-admin/login">
            <Suspense fallback={<SuperAdminLoading />}>
              <SuperAdminLayout />
            </Suspense>
          </PrivateRoute>
        }
      >
        <Route index element={<CommandCenterPage />} />
        <Route path="command-center" element={<CommandCenterPage />} />
        <Route path="admin-management" element={<AdminManagementPage />} />
        <Route path="global-listings" element={<GlobalListingsPage />} />
        <Route path="global-managers" element={<GlobalManagersPage />} />
        <Route path="chats-oversight" element={<ChatsOversightPage />} />
        <Route path="payments-commission" element={<PaymentsCommissionPage />} />
        <Route path="disputes" element={<DisputesPage />} />
        <Route path="verification-authority" element={<VerificationAuthorityPage />} />
        <Route path="system-rules" element={<SystemRulesPage />} />
        <Route path="audit-logs" element={<AuditLogsPage />} />
        <Route path="emergency-controls" element={<EmergencyControlsPage />} />
        <Route path="provider-free-bookings" element={<AdminProviderFreeBookings />} />
        <Route path="test" element={<TestPage />} />
        <Route path="admin-states" element={<AdminStates />} />
      </Route>

      {/* =================== ADMIN ROUTES =================== */}
      <Route 
        path="/admin/*"
        element={
          <PrivateRoute allowedRoles={['admin']}>
            <Suspense fallback={<AdminLoading />}>
              <AdminLayout />
            </Suspense>
          </PrivateRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="listings" element={<AdminListings />} />
        <Route path="services" element={<AdminServices />} />
        <Route path="verification" element={<AdminVerification />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="issues" element={<AdminIssues />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="transactions" element={<AdminTransactions />} />
        <Route path="revenue" element={<AdminRevenue />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="provider-overview" element={<AdminProviderOverview />} />
        <Route path="service-categories" element={<AdminServiceCategories />} />
        <Route path="referrals" element={<AdminReferrals />} />
        <Route path="verifications/pending" element={<AdminVerificationsPending />} />
        <Route path="rental-confirmations" element={<AdminRentalConfirmations />} />
        <Route path="payment-proofs" element={<AdminPaymentProofs />} />
      </Route>

      {/* ========== TENANT ROUTES ========== */}
      <Route 
        path="/dashboard/tenant/*"
        element={
          <PrivateRoute allowedRoles={['tenant']}>
            <ForceSingleLayout>
            <Suspense fallback={<DashboardLoading />}>
              <TenantSidebarLayout />
            </Suspense>
          </ForceSingleLayout>
          </PrivateRoute>
        }
      >
        <Route index element={<TenantDashboard />} />
        <Route path="profile" element={<TenantProfile />} />
        <Route path="applications" element={<TenantApplications />} />
        <Route path="saved" element={<TenantSavedProperties />} />
        <Route path="rental-history" element={<TenantRentalHistory />} />
        <Route path="payments" element={<TenantPayments />} />
        <Route path="maintenance" element={<TenantMaintenance />} />
        <Route path="documents" element={<TenantDocuments />} />
        <Route path="referrals" element={<TenantReferrals />} />
        <Route path="settings" element={<TenantSettings />} />
        <Route path="leases" element={<TenantLeases />} />
        <Route path="verify" element={<NewTenantKycForm />} />
      </Route>

      {/* ========== LANDLORD ROUTES ========== */}
      <Route 
        path="/dashboard/landlord/*"
        element={
          <PrivateRoute allowedRoles={['landlord']}>
            <ForceSingleLayout>
            <Suspense fallback={<DashboardLoading />}>
              <LandlordLayout /> 
            </Suspense>
            </ForceSingleLayout>
          </PrivateRoute>
        }
      >
        <Route index element={<LandlordDashboard />} />
        <Route path="profile" element={<LandlordProfile />} />
        <Route path="property-detail" element={<LandlordPropertyDetail />} />
        <Route path="earnings" element={<LandlordEarnings />} />
        <Route path="wallet" element={<LandlordWallet />} />
        <Route path="referrals" element={<LandlordReferrals />} />
        <Route path="analytics" element={<LandlordAnalytics />} />
        <Route path="settings" element={<LandlordSettings />} />
        <Route path="rent-tracking" element={<LandlordRentTracking />} />
      
      </Route>
      // In your AppRoutes.jsx, temporarily add this debug route
<Route 
  path="/debug-layouts" 
  element={
    <div style={{ padding: '20px' }}>
      <h2>Layout Debug</h2>
      <p>Current URL: {window.location.pathname}</p>
      <button onClick={() => window.location.href = '/dashboard/landlord'}>
        Go to Landlord Dashboard
      </button>
      <div style={{ marginTop: '20px', background: '#f0f0f0', padding: '10px' }}>
        <h4>Rendered Components:</h4>
        {/* This will show you what's actually being rendered */}
      </div>
    </div>
  } 
/>

      {/* ========== MANAGER ROUTES ========== */}
      <Route 
        path="/dashboard/manager/*"
        element={
          <PrivateRoute allowedRoles={['manager']}>
            <Suspense fallback={<DashboardLoading />}>
              <ManagerLayout />
            </Suspense>
          </PrivateRoute>
        }
      >
        <Route index element={<ManagerDashboard />} />
        <Route path="profile" element={<ManagerProfile />} />
        <Route path="notifications" element={<ManagerNotifications />} />
        <Route path="chats" element={<ManagerChats />} />
        <Route path="properties" element={<ManagerProperties />} />
        <Route path="payments" element={<ManagerPayments />} />
        <Route path="kyc" element={<ManagerKYC />} />
        <Route path="radius" element={<ManagerRadius />} />
        <Route path="commission" element={<ManagerCommission />} />
        <Route path="analytics" element={<ManagerAnalytics />} />
        <Route path="setup" element={<ManagerSetup />} />
        <Route path="withdraw" element={<ManagerWithdrawal />} />
        <Route path="verify/:listingId" element={<ManagerVerificationPage />} />
        <Route path="chat/:chatId/monitor" element={<ManagerChatMonitoring />} />
      </Route>

      {/* ========== PROVIDER ROUTES ========== */}
      <Route 
        path="/dashboard/provider/*"
        element={
          <PrivateRoute allowedRoles={['provider', 'service-provider']}>
            <Suspense fallback={<DashboardLoading />}>
              <ProviderLayout />
            </Suspense>
          </PrivateRoute>
        }
      >
        <Route index element={<ProviderDashboard />} />
        <Route path="profile" element={<ProviderProfile />} />
        <Route path="marketplace-profile" element={<ProviderMarketplaceProfile />} />
        <Route path="subscription" element={<ProviderSubscription />} />
        <Route path="subscribe" element={<ProviderSubscribe />} />
        <Route path="billing" element={<ProviderBilling />} />
        <Route path="leads" element={<ProviderLeads />} />
        <Route path="bookings" element={<ProviderBookings />} />
        <Route path="bookings/:id" element={<ProviderBookingDetails />} />
        <Route path="calendar" element={<ProviderCalendar />} />
        <Route path="earnings" element={<ProviderEarnings />} />
        <Route path="payouts" element={<ProviderPayouts />} />
        <Route path="wallet" element={<ProviderWallet />} />
        <Route path="transactions" element={<ProviderTransactions />} />
        <Route path="services" element={<ProviderServices />} />
        <Route path="post-service" element={<ProviderPostService />} />
        <Route path="services/:id/edit" element={<ProviderServiceEdit />} />
        <Route path="service-categories" element={<ProviderServiceCategories />} />
        <Route path="analytics" element={<ProviderAnalytics />} />
        <Route path="performance" element={<ProviderPerformance />} />
        <Route path="verify" element={<ProviderVerify />} />
        <Route path="verification-status" element={<ProviderVerificationStatus />} />
        <Route path="compliance" element={<ProviderCompliance />} />
        <Route path="boost" element={<ProviderBoost />} />
        <Route path="boost-history" element={<ProviderBoostHistory />} />
        <Route path="portfolio" element={<ProviderPortfolio />} />
        <Route path="pricing" element={<ProviderPricing />} />
        <Route path="availability" element={<ProviderAvailability />} />
        <Route path="location-setup" element={<ProviderLocationSetup />} />
        <Route path="documents" element={<ProviderDocuments />} />
        <Route path="referral" element={<ProviderReferral />} />
        <Route path="messages" element={<ProviderMessages />} />
        <Route path="support" element={<ProviderSupport />} />
        <Route path="settings" element={<ProviderSettings />} />
        <Route path="payment-methods" element={<ProviderPaymentMethods />} />
        <Route path="notifications" element={<ProviderNotifications />} />
      </Route>

      <Route path="/services/:id" element={<ServiceDetailsPage />} />

      {/* ========== ESTATE FIRM ROUTES ========== */}
      <Route 
        path="/dashboard/estate-firm/*"
        element={
          <PrivateRoute allowedRoles={['estate-firm', 'estate_firm']}>
            <Suspense fallback={<DashboardLoading />}>
              <EstateFirmLayout />
            </Suspense>
          </PrivateRoute>
        }
      >
        <Route index element={<EstateDashboard />} />
        <Route path="profile" element={<EstateProfile />} />
        <Route path="properties" element={<EstateProperties />} />
        <Route path="properties/:id" element={<PropertyDetail />} />
        <Route path="clients" element={<EstateClients />} />
        <Route path="analytics" element={<EstateAnalytics />} />
        <Route path="reports" element={<EstateReports />} />
        <Route path="settings" element={<EstateSettings />} />
        <Route path="bulk-upload" element={<EstateBulkUpload />} />
        <Route path="verification" element={<EstateVerification />} />
        <Route path="documents" element={<EstateDocuments />} />
        <Route path="services" element={<EstateServices />} />
        <Route path="payments" element={<PaymentsList />} />
        <Route path="post-service" element={<EstatePostService />} />
        <Route path="rent-tracking" element={<RentTracking />} />
        <Route path="add-external-property" element={<EstateAddExternalProperty />} />
        <Route path="properties/:id/edit" element={<EstateEditProperty />} />
      </Route>

      {/* =================== STANDALONE POST PROPERTY =================== */}
      <Route 
        path="/post-property" 
        element={
          <Suspense fallback={<DashboardLoading />}>
            <PrivateRoute allowedRoles={['landlord', 'estate-firm', 'estate_firm']}>
              <PostPropertyPage />
            </PrivateRoute>
          </Suspense>
        } 
      />

      {/* =================== MESSAGING ROUTES =================== */}
      <Route 
        path="/dashboard/messages" 
        element={
          <Suspense fallback={<DashboardLoading />}>
            <PrivateRoute>
              <ChatListPage />
            </PrivateRoute>
          </Suspense>
        } 
      />
      
      <Route 
        path="/dashboard/messages/:listingId" 
        element={
          <Suspense fallback={<DashboardLoading />}>
            <PrivateRoute>
              <Messages />
            </PrivateRoute>
          </Suspense>
        } 
      />
      
      <Route 
        path="/dashboard/messages/chat/:chatId" 
        element={
          <Suspense fallback={<DashboardLoading />}>
            <PrivateRoute>
              <Messages />
            </PrivateRoute>
          </Suspense>
        } 
      />

      {/* =================== OTHER PUBLIC ROUTES =================== */}
      <Route 
        path="/listings/:id" 
        element={
          <Suspense fallback={<DashboardLoading />}>
            <ListingDetailsPage />
          </Suspense>
        } 
      />
      
      <Route 
        path="/listings" 
        element={
          <Suspense fallback={<DashboardLoading />}>
            <ListingsPage />
          </Suspense>
        } 
      />

      <Route 
  path="/services" 
  element={
    <Suspense fallback={<DashboardLoading />}>
      <MarketplacePage />
    </Suspense>
  } 
/>

<Route 
  path="/services/:id" 
  element={
    <Suspense fallback={<DashboardLoading />}>
      <ServiceDetailsPage />
    </Suspense>
  } 
/>

<Route 
  path="/marketplace" 
  element={
    <Suspense fallback={<DashboardLoading />}>
      <ErrorBoundary>
        <MarketplacePage />
      </ErrorBoundary>
    </Suspense>
  } 
/>

<Route 
  path="/provider/:providerId/reviews" 
  element={
    <Suspense fallback={<DashboardLoading />}>
      <ProviderReviews />
    </Suspense>
  } 
/>
<Route 
  path="/write-review/:providerId" 
  element={
    <Suspense fallback={<DashboardLoading />}>
      <WriteReview />
    </Suspense>
  } 
/>
      
      {/* =================== VERIFICATION ROUTES =================== */}
      <Route 
        path="/verify" 
        element={
          <Suspense fallback={<DashboardLoading />}>
            <PrivateRoute>
              <VerificationHub />
            </PrivateRoute>
          </Suspense>
        } 
      />

      <Route 
        path="/verify/form" 
        element={
          <Suspense fallback={<DashboardLoading />}>
            <PrivateRoute>
              <VerificationForm />
            </PrivateRoute>
          </Suspense>
        } 
      />

      <Route 
        path="/verify/status" 
        element={
          <Suspense fallback={<DashboardLoading />}>
            <PrivateRoute>
              <VerificationStatus />
            </PrivateRoute>
          </Suspense>
        } 
      />

      {/* =================== FALLBACK ROUTE =================== */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;