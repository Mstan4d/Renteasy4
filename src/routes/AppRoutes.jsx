
import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import DashboardLayout from '../shared/components/layout/DashboardLayout';
import DashboardIndex from '../modules/dashboard/pages/DashboardIndex';
import ManagerDashboard from '../modules/manager/pages/ManagerDashboard';
// Public Pages
import Home from '../modules/content/pages/Home';
import Login from '../modules/auth/pages/Login';
import Signup from '../modules/auth/pages/Signup';
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

// Lazy load components
const AdminDashboard = lazy(() => import('../modules/admin/pages/AdminDashboard'));
const AdminUsers = lazy(() => import('../modules/admin/pages/AdminUsers'));
const AdminListings = lazy(() => import('../modules/admin/pages/AdminListings'));
const AdminServices = lazy(() => import('../modules/admin/pages/AdminServices'));
const AdminVerifications = lazy(() => import('../modules/admin/pages/AdminVerifications'));
const AdminAnalytics = lazy(() => import('../modules/admin/pages/AdminAnalytics'));
const AdminLayout = lazy(() => import('../modules/admin/components/AdminLayout'));
const AdminIssues = lazy(() => import('../modules/admin/pages/AdminIssues'));
const AdminReports = lazy(() => import('../modules/admin/pages/AdminReports'));
const AdminTransactions = lazy(() => import('../modules/admin/pages/AdminTransactions'));
const AdminRevenue = lazy(() => import('../modules/admin/pages/AdminRevenue'));
const AdminSettings = lazy(() => import('../modules/admin/pages/AdminSettings'));

// Manager Dashboard Components
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
const ManagerLayout = lazy(() => import('../modules/manager/components/ManagerLayout'));
const ManagerSidebar = lazy(() => import('../modules/manager/components/ManagerSidebar'));
const ManagerWithdrawal = lazy(() => import('../modules/manager/pages/ManagerWithdrawal'));

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
const LandlordAnalytics = lazy(() => import('../modules/dashboard/components/landlord/Analytics'));
const WithdrawFunds = lazy(() => import('../modules/dashboard/components/landlord/WithdrawFunds'));
const WalletHistory = lazy(() => import('../modules/dashboard/components/landlord/WalletHistory'));
const PropertyDetail = lazy(() => import('../modules/dashboard/components/landlord/PropertyDetail'));
const EditProperty = lazy(() => import('../modules/dashboard/components/landlord/EditProperty'));
const Support = lazy(() => import('../modules/dashboard/components/landlord/Support'));
const Reports = lazy(() => import('../modules/dashboard/components/landlord/Reports'));
const ReferralHistory = lazy(() => import('../modules/dashboard/components/landlord/ReferralHistory'));
const LandlordProfile = lazy(() => import('../modules/profile/pages/LandlordProfile'));

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

// ========== PROVIDER IMPORTS ==========
const ProviderDashboard = lazy(() => import('../modules/providers/pages/ProviderDashboard'));
//const ProviderRegistration = lazy(() => import('../modules/providers/pages/ProviderRegistration'));
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

// New Provider Pages Based on Your Business Logic
const ProviderMarketplaceProfile = lazy(() => import('../modules/providers/pages/ProviderMarketplaceProfile'));
const ProviderLayout = lazy(() => import('../modules/providers/components/ProviderLayout'));
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

const AppRoutes = () => {
  return (
    <Routes>
      {/* =================== PUBLIC ROUTES =================== */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />


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
        <Route path="test" element={<TestPage />} />
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
        <Route path="verifications" element={<AdminVerifications />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="issues" element={<AdminIssues />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="transactions" element={<AdminTransactions />} />
        <Route path="revenue" element={<AdminRevenue />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      {/* =================== DASHBOARD ROUTES =================== */}
      <Route 
        path="/dashboard/*"
        element={
          <PrivateRoute> 
           <ErrorBoundary>
            <DashboardLayout />
           </ErrorBoundary>
          </PrivateRoute>
        }
      >
        {/* Index route - Shows appropriate dashboard based on user role */}
        <Route index element={<DashboardIndex />} />

        {/* ========== MANAGER ROUTES ========== */}
        <Route 
          path="manager/*"
          element={
            <PrivateRoute allowedRoles={['manager']}>
              <Suspense fallback={<DashboardLoading />}>
                <ManagerLayout />
              </Suspense>
            </PrivateRoute>
          }
        >
          <Route index element={<ManagerDashboard />} />
          <Route path="notifications" element={<ManagerNotifications />} />
          <Route path="chats" element={<ManagerChats />} />
          <Route path="properties" element={<ManagerProperties />} />
          <Route path="payments" element={<ManagerPayments />} />
          <Route path="kyc" element={<ManagerKYC />} />
          <Route path="radius" element={<ManagerRadius />} />
          <Route path="commission" element={<ManagerCommission />} />
          <Route path="analytics" element={<ManagerAnalytics />} />
          <Route path="setup" element={<ManagerSetup />} />
          <Route path="sidebar" element={<ManagerSidebar />} />
          <Route path="withdraw" element={<ManagerWithdrawal />} />
        </Route>
        
        {/* Special route for manager chat monitoring */}
        <Route 
          path="manager/chat/:chatId/monitor" 
          element={
            <Suspense fallback={<DashboardLoading />}>
              <ManagerChatMonitoring />
            </Suspense>
          } 
        />

        {/* ========== SERVICE PROVIDER ROUTES ========== */}
        <Route 
  path="provider/*"
  element={
    <PrivateRoute allowedRoles={['provider']}>
      <Suspense fallback={<DashboardLoading />}>
        <ProviderLayout />
      </Suspense>
    </PrivateRoute>
  }
>

<Route 
  path="provider/profile" 
  element={
    <Suspense fallback={<DashboardLoading />}>
      <ProviderProfile />
    </Suspense>
  } 
/>
  <Route index element={<ProviderDashboard />} />
  <Route path="dashboard" element={<ProviderDashboard />} />

  {/* Profile */}
  <Route path="profile" element={<ProviderProfile />} />

  {/* Subscription & Billing */}
  <Route path="subscription" element={<ProviderSubscription />} />
  <Route path="subscribe" element={<ProviderSubscribe />} />
  <Route path="billing" element={<ProviderBilling />} />

  {/* Leads & Bookings */}
  <Route path="leads" element={<ProviderLeads />} />
  <Route path="bookings" element={<ProviderBookings />} />
  <Route path="bookings/:id" element={<ProviderBookingDetails />} />
  <Route path="calendar" element={<ProviderCalendar />} />

  {/* Finance */}
  <Route path="earnings" element={<ProviderEarnings />} />
  <Route path="payouts" element={<ProviderPayouts />} />
  <Route path="wallet" element={<ProviderWallet />} />
  <Route path="transactions" element={<ProviderTransactions />} />

  {/* Services */}
  <Route path="services" element={<ProviderServices />} />
  <Route path="post-service" element={<ProviderPostService />} />
  <Route path="services/:id/edit" element={<ProviderServiceEdit />} />
  <Route path="service-categories" element={<ProviderServiceCategories />} />

  {/* Analytics & Performance */}
  <Route path="analytics" element={<ProviderAnalytics />} />
  <Route path="performance" element={<ProviderPerformance />} />

  {/* Verification */}
  <Route path="verify" element={<ProviderVerify />} />
  <Route path="verification-status" element={<ProviderVerificationStatus />} />
  <Route path="compliance" element={<ProviderCompliance />} />

  {/* Boost */}
  <Route path="boost" element={<ProviderBoost />} />
  <Route path="boost-history" element={<ProviderBoostHistory />} />

  {/* Others */}
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
        {/* ========== ESTATE FIRM ROUTES ========== */}
        <Route 
          path="estate-firm" 
          element={
            <PrivateRoute allowedRoles={['estate-firm', 'estate_firm']}>
              <Suspense fallback={<DashboardLoading />}>
                <EstateDashboard />
              </Suspense>
            </PrivateRoute>
          } 
        />

        <Route 
          path="estate-firm/profile" 
          element={
            <Suspense fallback={<DashboardLoading />}>
              <EstateProfile />
            </Suspense>
          } 
        />

        <Route 
          path="estate-firm/properties" 
          element={
            <Suspense fallback={<DashboardLoading />}>
              <EstateProperties />
            </Suspense>
          } 
        />

        <Route 
          path="estate-firm/clients" 
          element={
            <Suspense fallback={<DashboardLoading />}>
              <EstateClients />
            </Suspense>
          } 
        />

        <Route 
          path="estate-firm/analytics" 
          element={
            <Suspense fallback={<DashboardLoading />}>
              <EstateAnalytics />
            </Suspense>
          } 
        />

        <Route 
          path="estate-firm/reports" 
          element={
            <Suspense fallback={<DashboardLoading />}>
              <EstateReports />
            </Suspense>
          } 
        />

        <Route 
          path="estate-firm/bulk-upload" 
          element={
            <Suspense fallback={<DashboardLoading />}>
              <EstateBulkUpload />
            </Suspense>
          } 
        />

        <Route 
          path="estate-firm/verification" 
          element={
            <Suspense fallback={<DashboardLoading />}>
              <EstateVerification />
            </Suspense>
          } 
        />

        <Route 
          path="estate-firm/settings" 
          element={
            <Suspense fallback={<DashboardLoading />}>
              <EstateSettings />
            </Suspense>
          } 
        />

        <Route 
          path="estate-firm/documents" 
          element={
            <Suspense fallback={<DashboardLoading />}>
              <EstateDocuments />
            </Suspense>
          } 
        />

        <Route 
          path="estate-firm/services" 
          element={
            <Suspense fallback={<DashboardLoading />}>
              <EstateServices />
            </Suspense>
          } 
        />

        <Route 
          path="estate-firm/post-service" 
          element={
            <Suspense fallback={<DashboardLoading />}>
              <EstatePostService />
            </Suspense>
          } 
        />

        <Route 
          path="estate-firm/add-external-property" 
          element={
            <Suspense fallback={<DashboardLoading />}>
              <EstateAddExternalProperty />
            </Suspense>
          } 
        />

{/* ========== LANDLORD ROUTES ========== */}
        <Route 
          path="landlord" 
          element={
            <PrivateRoute allowedRoles={['landlord']}>
              <Suspense fallback={<DashboardLoading />}>
                <LandlordDashboard />
              </Suspense>
            </PrivateRoute>
          } 
        />

        <Route 
          path="landlord/profile" 
          element={
            <Suspense fallback={<DashboardLoading />}>
              <LandlordProfile />
            </Suspense>
          } 
        />

        <Route 
          path="landlord/analytics" 
          element={
            <Suspense fallback={<DashboardLoading />}>
              <LandlordAnalytics />
            </Suspense>
          } 
        />

        <Route 
          path="landlord/wallet/withdraw" 
          element={
            <Suspense fallback={<DashboardLoading />}>
              <WithdrawFunds />
            </Suspense>
          } 
        />

        <Route 
          path="landlord/wallet/history" 
          element={
            <Suspense fallback={<DashboardLoading />}>
              <WalletHistory />
            </Suspense>
          } 
        />

        <Route 
          path="landlord/properties/:propertyId" 
          element={
            <Suspense fallback={<DashboardLoading />}>
              <PropertyDetail />
            </Suspense>
          } 
        />

        <Route 
          path="landlord/properties/:propertyId/edit" 
          element={
            <Suspense fallback={<DashboardLoading />}>
              <EditProperty />
            </Suspense>
          } 
        />

        <Route 
          path="landlord/referral/history" 
          element={
            <Suspense fallback={<DashboardLoading />}>
              <ReferralHistory />
            </Suspense>
          } 
        />

        <Route 
          path="landlord/support" 
          element={
            <Suspense fallback={<DashboardLoading />}>
              <Support />
            </Suspense>
          } 
        />

        <Route 
          path="landlord/reports" 
          element={
            <Suspense fallback={<DashboardLoading />}>
              <Reports />
            </Suspense>
          } 
        />

        {/* ========== TENANT ROUTES ========== */}
        <Route 
          path="tenant" 
          element={
            <PrivateRoute allowedRoles={['tenant']}>
              <Suspense fallback={<DashboardLoading />}>
                <TenantDashboard />
              </Suspense>
            </PrivateRoute>
          } 
        />

        <Route 
          path="tenant/profile" 
          element={
            <Suspense fallback={<DashboardLoading />}>
              <TenantProfile />
            </Suspense>
          } 
        />

        <Route 
          path="tenant/applications" 
          element={
            <Suspense fallback={<DashboardLoading />}>
              <TenantApplications />
            </Suspense>
          } 
        />

        <Route 
          path="tenant/saved" 
          element={
            <Suspense fallback={<DashboardLoading />}>
              <TenantSavedProperties />
            </Suspense>
          } 
        />

        <Route 
          path="tenant/rental-history" 
          element={
            <Suspense fallback={<DashboardLoading />}>
              <TenantRentalHistory />
            </Suspense>
          } 
        />

        <Route 
          path="tenant/payments" 
          element={
            <Suspense fallback={<DashboardLoading />}>
              <TenantPayments />
            </Suspense>
          } 
        />

        <Route 
          path="tenant/maintenance" 
          element={
            <Suspense fallback={<DashboardLoading />}>
              <TenantMaintenance />
            </Suspense>
          } 
        />

        <Route 
          path="tenant/documents" 
          element={
            <Suspense fallback={<DashboardLoading />}>
              <TenantDocuments />
            </Suspense>
          } 
        />
<Route 
          path="tenant/referrals" 
          element={
            <Suspense fallback={<DashboardLoading />}>
              <TenantReferrals />
            </Suspense>
          } 
        />

        <Route 
          path="tenant/settings" 
          element={
            <Suspense fallback={<DashboardLoading />}>
              <TenantSettings />
            </Suspense>
          } 
        />

        {/* ========== COMMON ROUTES ========== */}
        {/* Profile route for all */}
        <Route 
          path="profile" 
          element={
            <Suspense fallback={<DashboardLoading />}>
              <ManagerProfile />
            </Suspense>
          } 
        />

        {/* Post Property route */}
        <Route 
          path="post-property" 
          element={
            <Suspense fallback={<DashboardLoading />}>
              <PostPropertyPage />
            </Suspense>
          } 
        />

        {/* =================== MESSAGING ROUTES =================== */}
        <Route 
          path="messages/:listingId" 
          element={
            <Suspense fallback={<DashboardLoading />}>
              <Messages />
            </Suspense>
          } 
        />

        <Route 
          path="messages/chat/:chatId" 
          element={
            <Suspense fallback={<DashboardLoading />}>
              <Messages />
            </Suspense>
          } 
        />

        <Route 
          path="messages" 
          element={
            <Suspense fallback={<DashboardLoading />}>
              <ChatListPage />
            </Suspense>
          } 
        />

        {/* Support (for all users) */}
        <Route 
          path="support" 
          element={
            <Suspense fallback={<DashboardLoading />}>
              <Support />
            </Suspense>
          } 
        />
      </Route>

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
        path="/marketplace" 
        element={
          <Suspense fallback={<DashboardLoading />}>
            <MarketplacePage />
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