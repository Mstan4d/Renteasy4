import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import DashboardLayout from '../shared/components/layout/DashboardLayout';
import DashboardIndex from '../modules/dashboard/pages/DashboardIndex';

// Public Pages
import Home from '../modules/content/pages/Home';
import Login from '../modules/auth/pages/Login';
import Signup from '../modules/auth/pages/Signup';

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
const ManagerDashboard = lazy(() => import('../modules/manager/pages/ManagerDashboard'));
const ManagerProfile = lazy(() => import('../modules/profile/pages/ManagerProfile'));
const ManagerCommission = lazy(() => import('../modules/manager/pages/ManagerCommission'));
const ManagerAnalytics = lazy(() => import('../modules/manager/pages/ManagerAnalytics'));
const ManagerSetup = lazy(() => import('../modules/manager/pages/ManagerSetup'));
const ManagerVerification = lazy(() => import('../modules/manager/pages/ManagerVerification'));

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

// Profile (from profile module)
const LandlordProfile = lazy(() => import('../modules/profile/pages/LandlordProfile'));

// Estate Firm Components - UPDATED WITH ALL YOUR COMPONENTS
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


// Other modules
const PostPropertyPage = lazy(() => import('../modules/properties/pages/PostPropertyPage'));
const Messages = lazy(() => import('../modules/messaging/pages/Messages'));
const ListingsPage = lazy(() => import('../modules/listings/pages/ListingsPage'));
const MarketplacePage = lazy(() => import('../modules/marketplace/pages/MarketplacePage'));
const VerificationHub = lazy(() => import('../modules/verification/pages/VerificationHub'));
const VerificationForm = lazy(() => import('../modules/verification/pages/VerificationForm'));
const VerificationStatus = lazy(() => import('../modules/verification/pages/VerificationStatus'));
const ProviderDashboard = lazy(() => import('../modules/providers/pages/ProviderDashboard'));
const ListingDetailsPage = lazy(() => import('../modules/listings/pages/ListingDetailsPage'));


const AppRoutes = () => {
  return (
    <Routes>
      {/* =================== PUBLIC ROUTES =================== */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

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
        path="/dashboard"
        element={
          <PrivateRoute>
            <DashboardLayout />
          </PrivateRoute>
        }
      >
        {/* Index route - Shows appropriate dashboard based on user role */}
        <Route 
          index 
          element={
            <PrivateRoute>
              <DashboardIndex />
            </PrivateRoute>
          } 
        />

        {/* ========== MANAGER ROUTES ========== */}
        <Route 
          path="manager" 
          element={
            <Suspense fallback={<DashboardLoading />}>
              <PrivateRoute allowedRoles={['manager']}>
                <ManagerDashboard />
              </PrivateRoute>
            </Suspense>
          } 
        />

        <Route 
          path="profile" 
          element={
            <Suspense fallback={<DashboardLoading />}>
              <PrivateRoute allowedRoles={['manager']}>
                <ManagerProfile />
              </PrivateRoute>
            </Suspense>
          } 
        />

        <Route 
          path="manager/commission" 
          element={
            <Suspense fallback={<DashboardLoading />}>
              <PrivateRoute allowedRoles={['manager']}>
                <ManagerCommission />
              </PrivateRoute>
            </Suspense>
          } 
        />

        <Route 
          path="manager/analytics" 
          element={
            <Suspense fallback={<DashboardLoading />}>
              <PrivateRoute allowedRoles={['manager']}>
                <ManagerAnalytics />
              </PrivateRoute>
            </Suspense>
          } 
        />

        <Route 
          path="manager/setup" 
          element={
            <Suspense fallback={<DashboardLoading />}>
              <PrivateRoute allowedRoles={['manager']}>
                <ManagerSetup />
              </PrivateRoute>
            </Suspense>
          } 
        />

        <Route 
          path="manager/verification" 
          element={
            <Suspense fallback={<DashboardLoading />}>
              <PrivateRoute allowedRoles={['manager']}>
                <ManagerVerification />
              </PrivateRoute>
            </Suspense>
          } 
        />

        {/* ========== SERVICE PROVIDER ROUTES ========== */}
        <Route 
           path="provider" 
            element={
              <Suspense fallback={<DashboardLoading />}>
                <PrivateRoute allowedRoles={['service-provider']}>
                  <ProviderDashboard />
                </PrivateRoute>
              </Suspense>
          } 
        />
        
        {/* ========== ESTATE FIRM ROUTES ========== */}
        {/* Main Estate Dashboard */}
        <Route 
          path="estate-firm" 
          element={
            <Suspense fallback={<DashboardLoading />}>
              <PrivateRoute allowedRoles={['estate-firm']}>
                <EstateDashboard />
              </PrivateRoute>
            </Suspense>
          } 
        />

        {/* Estate Profile */}
        <Route 
          path="estate-firm/estate-profile" 
          element={
            <Suspense fallback={<DashboardLoading />}>
              <PrivateRoute allowedRoles={['estate-firm']}>
                <EstateProfile />
              </PrivateRoute>
            </Suspense>
          } 
        />

        {/* Estate Properties Management */}
        <Route 
          path="estate-firm/properties" 
          element={
            <Suspense fallback={<DashboardLoading />}>
              <PrivateRoute allowedRoles={['estate-firm']}>
                <EstateProperties />
              </PrivateRoute>
            </Suspense>
          } 
        />

        {/* Estate Clients Management */}
        <Route 
          path="estate-firm/clients" 
          element={
            <Suspense fallback={<DashboardLoading />}>
              <PrivateRoute allowedRoles={['estate-firm']}>
                <EstateClients />
              </PrivateRoute>
            </Suspense>
          } 
        />

        {/* Estate Analytics */}
        <Route 
          path="estate-firm/analytics" 
          element={
            <Suspense fallback={<DashboardLoading />}>
              <PrivateRoute allowedRoles={['estate-firm']}>
                <EstateAnalytics />
              </PrivateRoute>
            </Suspense>
          } 
        />

        {/* Estate Reports */}
        <Route 
          path="estate-firm/reports" 
          element={
            <Suspense fallback={<DashboardLoading />}>
              <PrivateRoute allowedRoles={['estate-firm']}>
                <EstateReports />
              </PrivateRoute>
            </Suspense>
          } 
        />

        {/* Estate Bulk Upload */}
        <Route 
          path="estate-firm/bulk-upload" 
          element={
            <Suspense fallback={<DashboardLoading />}>
              <PrivateRoute allowedRoles={['estate-firm']}>
                <EstateBulkUpload />
              </PrivateRoute>
            </Suspense>
          } 
        />

        {/* Estate Verification */}
        <Route 
          path="estate-firm/verification" 
          element={
            <Suspense fallback={<DashboardLoading />}>
              <PrivateRoute allowedRoles={['estate-firm']}>
                <EstateVerification />
              </PrivateRoute>
            </Suspense>
          } 
        />

        {/* Estate Settings */}
        <Route 
          path="estate-firm/settings" 
          element={
            <Suspense fallback={<DashboardLoading />}>
              <PrivateRoute allowedRoles={['estate-firm']}>
                <EstateSettings />
              </PrivateRoute>
            </Suspense>
          } 
        />

        {/* Estate Documents */}
        <Route 
          path="estate-firm/documents" 
          element={
            <Suspense fallback={<DashboardLoading />}>
              <PrivateRoute allowedRoles={['estate-firm']}>
                <EstateDocuments />
              </PrivateRoute>
            </Suspense>
          } 
        />

        {/* Estate Services */}
        <Route 
          path="estate-firm/services" 
          element={
            <Suspense fallback={<DashboardLoading />}>
              <PrivateRoute allowedRoles={['estate-firm']}>
                <EstateServices />
              </PrivateRoute>
            </Suspense>
          } 
        />

        {/* Estate Post Service */}
        <Route 
          path="estate-firm/post-service" 
          element={
            <Suspense fallback={<DashboardLoading />}>
              <PrivateRoute allowedRoles={['estate-firm']}>
                <EstatePostService />
              </PrivateRoute>
            </Suspense>
          } 
        />

<Route 
  path="estate-firm/add-external-property" 
  element={
    <Suspense fallback={<DashboardLoading />}>
      <PrivateRoute allowedRoles={['estate-firm']}>
        <EstateAddExternalProperty />
      </PrivateRoute>
    </Suspense>
  } 
/>

        {/* ========== LANDLORD ROUTES ========== */}
        <Route 
          path="landlord" 
          element={
            <Suspense fallback={<DashboardLoading />}>
              <PrivateRoute allowedRoles={['landlord']}>
                <LandlordDashboard />
              </PrivateRoute>
            </Suspense>
          } 
        />

        {/* Landlord Profile */}
        <Route 
          path="landlord/profile" 
          element={
            <Suspense fallback={<DashboardLoading />}>
              <PrivateRoute allowedRoles={['landlord']}>
                <LandlordProfile />
              </PrivateRoute>
            </Suspense>
          } 
        />

        {/* Landlord Analytics */}
        <Route 
          path="landlord/analytics" 
          element={
            <Suspense fallback={<DashboardLoading />}>
              <PrivateRoute allowedRoles={['landlord']}>
                <LandlordAnalytics />
              </PrivateRoute>
            </Suspense>
          } 
        />

        {/* Wallet Routes */}
        <Route 
          path="landlord/wallet/withdraw" 
          element={
            <Suspense fallback={<DashboardLoading />}>
              <PrivateRoute allowedRoles={['landlord']}>
                <WithdrawFunds />
              </PrivateRoute>
            </Suspense>
          } 
        />

        <Route 
          path="landlord/wallet/history" 
          element={
            <Suspense fallback={<DashboardLoading />}>
              <PrivateRoute allowedRoles={['landlord']}>
                <WalletHistory />
              </PrivateRoute>
            </Suspense>
          } 
        />

        {/* Property Routes */}
        <Route 
          path="landlord/properties/:propertyId" 
          element={
            <Suspense fallback={<DashboardLoading />}>
              <PrivateRoute allowedRoles={['landlord']}>
                <PropertyDetail />
              </PrivateRoute>
            </Suspense>
          } 
        />

        <Route 
          path="landlord/properties/:propertyId/edit" 
          element={
            <Suspense fallback={<DashboardLoading />}>
              <PrivateRoute allowedRoles={['landlord']}>
                <EditProperty />
              </PrivateRoute>
            </Suspense>
          } 
        />

        {/* Referral Routes */}
        <Route 
          path="landlord/referral/history" 
          element={
            <Suspense fallback={<DashboardLoading />}>
              <PrivateRoute allowedRoles={['landlord']}>
                <ReferralHistory />
              </PrivateRoute>
            </Suspense>
          } 
        />

        {/* Support */}
        <Route 
          path="landlord/support" 
          element={
            <Suspense fallback={<DashboardLoading />}>
              <PrivateRoute allowedRoles={['landlord']}>
                <Support />
              </PrivateRoute>
            </Suspense>
          } 
        />

        {/* Reports */}
        <Route 
          path="landlord/reports" 
          element={
            <Suspense fallback={<DashboardLoading />}>
              <PrivateRoute allowedRoles={['landlord']}>
                <Reports />
              </PrivateRoute>
            </Suspense>
          } 
        />

        {/* ========== TENANT ROUTES ========== */}
        <Route 
          path="tenant" 
          element={
            <Suspense fallback={<DashboardLoading />}>
              <PrivateRoute allowedRoles={['tenant']}>
                <TenantDashboard />
              </PrivateRoute>
            </Suspense>
          } 
        />

        {/* Tenant Profile */}
        <Route 
          path="tenant/profile" 
          element={
            <Suspense fallback={<DashboardLoading />}>
              <PrivateRoute allowedRoles={['tenant']}>
                <TenantProfile />
              </PrivateRoute>
            </Suspense>
          } 
        />

        {/* Tenant Applications */}
        <Route 
          path="tenant/applications" 
          element={
            <Suspense fallback={<DashboardLoading />}>
              <PrivateRoute allowedRoles={['tenant']}>
                <TenantApplications />
              </PrivateRoute>
            </Suspense>
          } 
        />

        {/* Tenant Saved Properties */}
        <Route 
          path="tenant/saved" 
          element={
            <Suspense fallback={<DashboardLoading />}>
              <PrivateRoute allowedRoles={['tenant']}>
                <TenantSavedProperties />
              </PrivateRoute>
            </Suspense>
          } 
        />

        {/* Tenant Rental History */}
        <Route 
          path="tenant/rental-history" 
          element={
            <Suspense fallback={<DashboardLoading />}>
              <PrivateRoute allowedRoles={['tenant']}>
                <TenantRentalHistory />
              </PrivateRoute>
            </Suspense>
          } 
        />

        {/* Tenant Payments */}
        <Route 
          path="tenant/payments" 
          element={
            <Suspense fallback={<DashboardLoading />}>
              <PrivateRoute allowedRoles={['tenant']}>
                <TenantPayments />
              </PrivateRoute>
            </Suspense>
          } 
        />

        {/* Tenant Maintenance Requests */}
        <Route 
          path="tenant/maintenance" 
          element={
            <Suspense fallback={<DashboardLoading />}>
              <PrivateRoute allowedRoles={['tenant']}>
                <TenantMaintenance />
              </PrivateRoute>
            </Suspense>
          } 
        />

        {/* Tenant Documents */}
        <Route 
          path="tenant/documents" 
          element={
            <Suspense fallback={<DashboardLoading />}>
              <PrivateRoute allowedRoles={['tenant']}>
                <TenantDocuments />
              </PrivateRoute>
            </Suspense>
          } 
        />

        {/* Tenant Referrals */}
        <Route 
          path="tenant/referrals" 
          element={
            <Suspense fallback={<DashboardLoading />}>
              <PrivateRoute allowedRoles={['tenant']}>
                <TenantReferrals />
              </PrivateRoute>
            </Suspense>
          } 
        />

        {/* Tenant Settings */}
        <Route 
          path="tenant/settings" 
          element={
            <Suspense fallback={<DashboardLoading />}>
              <PrivateRoute allowedRoles={['tenant']}>
                <TenantSettings />
              </PrivateRoute>
            </Suspense>
          } 
        />

        {/* ========== COMMON ROUTES ========== */}
        {/* Post Property route */}
        <Route 
          path="post-property" 
          element={
            <Suspense fallback={<DashboardLoading />}>
              <PrivateRoute allowedRoles={['landlord', 'estate-firm', 'manager']}>
                <PostPropertyPage />
              </PrivateRoute>
            </Suspense>
          } 
        />

        {/* Messages */}
        <Route 
          path="messages" 
          element={
            <Suspense fallback={<DashboardLoading />}>
              <PrivateRoute>
                <Messages />
              </PrivateRoute>
            </Suspense>
          } 
        />

        {/* Support (for all users) */}
        <Route 
          path="support" 
          element={
            <Suspense fallback={<DashboardLoading />}>
              <PrivateRoute>
                <Support />
              </PrivateRoute>
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