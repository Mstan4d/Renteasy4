// src/modules/admin/pages/AdminDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../shared/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import AdminStatsCard from '../components/AdminStatsCard';
import { supabase } from '../../../shared/lib/supabaseClient';
import { 
  Users, Home, ShieldCheck, Building, AlertCircle, 
  TrendingUp, MessageSquare, DollarSign, Clock, CheckCircle, XCircle,
  UserCheck, FileText, Camera, Receipt
} from 'lucide-react';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalListings: 0,
    pendingVerifications: 0,           // legacy: pending approval (maybe deprecated)
    pendingManagerVerifications: 0,     // listings assigned to manager, not yet verified
    pendingAdminVerifications: 0,       // listings waiting for admin to call landlord
    pendingRentalConfirmations: 0,      // rentals awaiting landlord/tenant confirmation
    pendingPaymentProofs: 0,             // payment proofs awaiting verification
    activeProviders: 0,
    reportedIssues: 0,
    totalRevenue: 0,
    newUsersToday: 0,
    pendingReviews: 0,
    verifiedListings: 0,
    rejectedListings: 0,
    unverifiedUsers: 0
  });

  const [recentActivities, setRecentActivities] = useState([]);
  const [pendingItems, setPendingItems] = useState({
    listings: [],          // legacy
    users: [],
    providers: [],
    unverifiedUsers: [],
    adminVerifications: [], // listings pending admin verification
    rentalConfirmations: [], // rentals pending confirmation
    paymentProofs: []        // payment proofs pending verification
  });

  // Calculate total revenue function
  const calculateTotalRevenue = useCallback((listings) => {
    const verifiedListings = listings.filter(l => l.verified && l.status === 'approved');
    const totalRent = verifiedListings.reduce((sum, listing) => {
      return sum + (parseFloat(listing.price) || 0);
    }, 0);
    return Math.round(totalRent * 0.075);
  }, []);

  // Calculate new users today
  const calculateNewUsersToday = useCallback((users) => {
    const today = new Date().toDateString();
    return users.filter(user => {
      const userDate = new Date(user.created_at || Date.now()).toDateString();
      return userDate === today;
    }).length;
  }, []);

  // Log activity function
  const logActivity = useCallback(async (action, type, entityId = null) => {
    try {
      const { error } = await supabase
        .from('admin_activities')
        .insert({
          admin_id: user?.id,
          action,
          type,
          entity_id: entityId,
          details: { admin_name: user?.name || 'Admin' }
        });
      if (error) throw error;
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  }, [user]);

  // Main data loading function
  const loadAdminData = useCallback(async () => {
    try {
      // Load all data in parallel
      const [
        { data: allListings },
        { data: allUsers },
        { data: serviceProviders },
        { data: managers },
        { data: estateProperties },
        { data: rentalConfirmations },
        { data: paymentProofs }
      ] = await Promise.all([
        supabase.from('listings').select('*'),
        supabase.from('profiles').select('*'),
        supabase.from('service_providers').select('*').eq('service_type', 'service_provider'),
        supabase.from('service_providers').select('*').eq('service_type', 'manager'),
        supabase.from('service_providers').select('*').eq('service_type', 'estate_property'),
        supabase.from('rental_confirmations').select('*'),
        supabase.from('payment_proofs').select('*').eq('verified', false)
      ]);

      // Load reported issues from local storage (or from a table)
      const reportedIssues = JSON.parse(localStorage.getItem('reportedIssues') || '[]');
      
      // Calculate stats
      const verifiedListings = allListings.filter(l => l.verified && l.status === 'approved').length;
      const pendingListings = allListings.filter(l => 
        (l.status === 'pending' || (!l.verified && !l.rejected && !l.userVerified))
      ).length;
      const rejectedListings = allListings.filter(l => l.rejected).length;
      const unverifiedUsersCount = allUsers.filter(u => !u.verified).length;
      
      // NEW: Counts based on verification_status
      const pendingManagerVerifications = allListings.filter(l => l.verification_status === 'pending_verification').length;
      const pendingAdminVerifications = allListings.filter(l => l.verification_status === 'pending_admin').length;
      
      // Rental confirmations pending (landlord or tenant not confirmed)
      const pendingRentalConfirmations = rentalConfirmations.filter(rc => 
        !rc.landlord_confirmed || !rc.tenant_confirmed
      ).length;
      
      // Payment proofs pending
      const pendingPaymentProofs = paymentProofs.length;

      const newStats = {
        totalUsers: allUsers.length,
        totalListings: allListings.length,
        pendingVerifications: pendingListings,
        pendingManagerVerifications,
        pendingAdminVerifications,
        pendingRentalConfirmations,
        pendingPaymentProofs,
        verifiedListings,
        rejectedListings,
        unverifiedUsers: unverifiedUsersCount,
        activeProviders: [...serviceProviders, ...managers, ...estateProperties].filter(p => p.status === 'approved' || p.verified).length,
        reportedIssues: reportedIssues.filter(r => r.status === 'open').length,
        totalRevenue: calculateTotalRevenue(allListings),
        newUsersToday: calculateNewUsersToday(allUsers),
        pendingReviews: JSON.parse(localStorage.getItem('pendingReviews') || '[]').length
      };
      
      setStats(newStats);
      
      // Get pending items for approval (legacy)
      const pendingListingsForApproval = allListings.filter(listing => 
        (listing.status === 'pending' || (!listing.verified && !listing.rejected))
      ).slice(0, 5);
      
      const pendingUsers = allUsers.filter(u => u.needs_verification && !u.verified).slice(0, 5);
      const pendingProviders = [...serviceProviders, ...managers, ...estateProperties].filter(p => 
        p.status === 'pending' || (p.needs_verification && !p.verified)
      ).slice(0, 5);
      
      const usersWithUnverifiedListings = allUsers.filter(u => 
        allListings.some(l => l.user_id === u.id && !l.user_verified)
      ).slice(0, 5);
      
      // NEW: Listings pending admin verification
      const adminVerifications = allListings
        .filter(l => l.verification_status === 'pending_admin')
        .slice(0, 5)
        .map(listing => ({
          id: listing.id,
          title: listing.title,
          address: listing.address,
          price: listing.price,
          landlord_phone: listing.landlord_phone,
          manager_id: listing.assigned_manager_id,
          posted_date: listing.created_at
        }));
      
      // NEW: Rental confirmations pending
      const rentalPendingList = rentalConfirmations
        .filter(rc => !rc.landlord_confirmed || !rc.tenant_confirmed)
        .slice(0, 5)
        .map(rc => ({
          id: rc.id,
          listing_id: rc.listing_id,
          chat_id: rc.chat_id,
          landlord_confirmed: rc.landlord_confirmed,
          tenant_confirmed: rc.tenant_confirmed,
          created_at: rc.created_at
        }));
      
      // NEW: Payment proofs pending
      const paymentProofsPending = paymentProofs.slice(0, 5).map(pp => ({
        id: pp.id,
        listing_id: pp.listing_id,
        tenant_id: pp.tenant_id,
        proof_type: pp.proof_type,
        file_url: pp.file_url,
        created_at: pp.created_at
      }));
      
      setPendingItems({
        listings: pendingListingsForApproval,
        users: pendingUsers,
        providers: pendingProviders,
        unverifiedUsers: usersWithUnverifiedListings,
        adminVerifications,
        rentalConfirmations: rentalPendingList,
        paymentProofs: paymentProofsPending
      });
      
      // Load recent activities (from local storage or table)
      const activities = JSON.parse(localStorage.getItem('adminActivities') || '[]');
      setRecentActivities(activities.slice(0, 10));
      
    } catch (error) {
      console.error('Error loading admin data:', error);
    }
  }, [calculateTotalRevenue, calculateNewUsersToday]);

  useEffect(() => {
    if (user?.role !== 'admin') return;

    loadAdminData();

    // Real-time subscriptions for changes
    const listingsChannel = supabase
      .channel('listings-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'listings' }, loadAdminData)
      .subscribe();

    const usersChannel = supabase
      .channel('profiles-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, loadAdminData)
      .subscribe();

    const rentalConfirmationsChannel = supabase
      .channel('rental-confirmations-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rental_confirmations' }, loadAdminData)
      .subscribe();

    const paymentProofsChannel = supabase
      .channel('payment-proofs-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payment_proofs' }, loadAdminData)
      .subscribe();

    const interval = setInterval(loadAdminData, 30000);

    return () => {
      supabase.removeChannel(listingsChannel);
      supabase.removeChannel(usersChannel);
      supabase.removeChannel(rentalConfirmationsChannel);
      supabase.removeChannel(paymentProofsChannel);
      clearInterval(interval);
    };
  }, [user, loadAdminData]);

  const handleStatsClick = (page) => {
    switch(page) {
      case 'users':
        navigate('/admin/users');
        break;
      case 'listings':
        navigate('/admin/listings');
        break;
      case 'verifications':
        navigate('/admin/verifications');
        break;
      case 'admin-verifications':
        navigate('/admin/verifications/pending'); // to be created
        break;
      case 'rental-confirmations':
        navigate('/admin/rental-confirmations'); // to be created
        break;
      case 'payment-proofs':
        navigate('/admin/payment-proofs'); // to be created
        break;
      case 'providers':
        navigate('/admin/providers');
        break;
      case 'reports':
        navigate('/admin/reports');
        break;
      case 'revenue':
        navigate('/admin/revenue');
        break;
      case 'reviews':
        navigate('/admin/reviews');
        break;
      default:
        break;
    }
  };

  // Approval functions (legacy)
  const approveListing = async (listingId) => { /* ... unchanged ... */ };
  const approveUser = async (userId) => { /* ... unchanged ... */ };
  const verifyProvider = async (providerId) => { /* ... unchanged ... */ };
  const rejectListing = async (listingId, reason = 'Does not meet guidelines') => { /* ... unchanged ... */ };
  const handleQuickAction = (action, data) => { /* ... unchanged ... */ };
  const handleVerifyAll = async () => { /* ... unchanged ... */ };
  const handleAddNew = () => { navigate('/admin/add-property'); };

  if (user?.role !== 'admin') {
    return (
      <div className="admin-access-denied">
        <h2>⛔ Admin Access Required</h2>
        <p>You need administrator privileges to access this page.</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div className="header-left">
          <h1>Admin Dashboard</h1>
          <div className="admin-info">
            <span className="admin-badge">👑 Admin</span>
            <span>{user?.name || 'Administrator'}</span>
            <small>Last login: {new Date().toLocaleTimeString()}</small>
          </div>
        </div>
        <div className="header-actions">
          <button 
            className="btn-verify-all"
            onClick={handleVerifyAll}
            disabled={stats.pendingVerifications === 0}
          >
            <CheckCircle size={18} />
            Verify All ({stats.pendingVerifications})
          </button>
          <button 
            className="btn-add-new"
            onClick={handleAddNew}
          >
            <Home size={18} />
            Add Property
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {/* Existing stats */}
        <div onClick={() => handleStatsClick('users')} className="stats-card-wrapper">
          <AdminStatsCard
            title="Total Users"
            value={stats.totalUsers}
            icon={<Users />}
            change={`+${stats.newUsersToday} today`}
            color="blue"
            clickable={true}
          />
        </div>

        <div onClick={() => handleStatsClick('listings')} className="stats-card-wrapper">
          <AdminStatsCard
            title="Total Listings"
            value={stats.totalListings}
            icon={<Home />}
            change={`${stats.verifiedListings} verified`}
            color="green"
            clickable={true}
          />
        </div>

        {/* NEW: Pending Manager Verifications */}
        <div onClick={() => handleStatsClick('verifications')} className="stats-card-wrapper">
          <AdminStatsCard
            title="Pending Manager Verifications"
            value={stats.pendingManagerVerifications}
            icon={<Clock />}
            change="Assigned to managers"
            color="orange"
            clickable={true}
          />
        </div>

        {/* NEW: Pending Admin Verifications */}
        <div onClick={() => handleStatsClick('admin-verifications')} className="stats-card-wrapper">
          <AdminStatsCard
            title="Pending Admin Verifications"
            value={stats.pendingAdminVerifications}
            icon={<ShieldCheck />}
            change="Awaiting landlord call"
            color="purple"
            clickable={true}
          />
        </div>

        {/* NEW: Pending Rental Confirmations */}
        <div onClick={() => handleStatsClick('rental-confirmations')} className="stats-card-wrapper">
          <AdminStatsCard
            title="Pending Rental Confirmations"
            value={stats.pendingRentalConfirmations}
            icon={<MessageSquare />}
            change="Landlord/tenant not confirmed"
            color="yellow"
            clickable={true}
          />
        </div>

        {/* NEW: Pending Payment Proofs */}
        <div onClick={() => handleStatsClick('payment-proofs')} className="stats-card-wrapper">
          <AdminStatsCard
            title="Pending Payment Proofs"
            value={stats.pendingPaymentProofs}
            icon={<Receipt />}
            change="Awaiting verification"
            color="pink"
            clickable={true}
          />
        </div>

        {/* Existing stats (keep as is) */}
        <div onClick={() => handleStatsClick('providers')} className="stats-card-wrapper">
          <AdminStatsCard
            title="Active Providers"
            value={stats.activeProviders}
            icon={<Building />}
            change={`${stats.pendingReviews} pending reviews`}
            color="teal"
            clickable={true}
          />
        </div>

        <div onClick={() => handleStatsClick('reports')} className="stats-card-wrapper">
          <AdminStatsCard
            title="Reported Issues"
            value={stats.reportedIssues}
            icon={<AlertCircle />}
            change="Open cases"
            color="red"
            clickable={true}
          />
        </div>

        <div onClick={() => handleStatsClick('revenue')} className="stats-card-wrapper">
          <AdminStatsCard
            title="Total Revenue"
            value={`₦${stats.totalRevenue.toLocaleString()}`}
            icon={<DollarSign />}
            change="7.5% commission"
            color="green"
            clickable={true}
          />
        </div>
      </div>

      {/* Pending Approvals Sections */}
      <div className="dashboard-content">
        {/* Pending Admin Verifications */}
        {pendingItems.adminVerifications.length > 0 && (
          <div className="pending-section">
            <div className="section-header">
              <h3>⏳ Pending Admin Verifications ({pendingItems.adminVerifications.length})</h3>
              <button className="btn-view-all" onClick={() => handleStatsClick('admin-verifications')}>
                View All
              </button>
            </div>
            <div className="pending-list">
              {pendingItems.adminVerifications.map(item => (
                <div key={item.id} className="pending-item">
                  <div className="item-info">
                    <strong>{item.title}</strong>
                    <span>{item.address}</span>
                    <small>₦{item.price?.toLocaleString()} • Landlord: {item.landlord_phone || 'N/A'}</small>
                  </div>
                  <div className="item-actions">
                    <button 
                      className="btn-approve"
                      onClick={() => navigate(`/admin/verifications/${item.id}`)}
                    >
                      Review
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pending Rental Confirmations */}
        {pendingItems.rentalConfirmations.length > 0 && (
          <div className="pending-section">
            <div className="section-header">
              <h3>🏠 Pending Rental Confirmations ({pendingItems.rentalConfirmations.length})</h3>
              <button className="btn-view-all" onClick={() => handleStatsClick('rental-confirmations')}>
                View All
              </button>
            </div>
            <div className="pending-list">
              {pendingItems.rentalConfirmations.map(item => (
                <div key={item.id} className="pending-item">
                  <div className="item-info">
                    <strong>Listing #{item.listing_id.slice(0,8)}</strong>
                    <span>Landlord: {item.landlord_confirmed ? '✅' : '❌'}</span>
                    <span>Tenant: {item.tenant_confirmed ? '✅' : '❌'}</span>
                    <small>Created: {new Date(item.created_at).toLocaleDateString()}</small>
                  </div>
                  <div className="item-actions">
                    <button 
                      className="btn-approve"
                      onClick={() => navigate(`/admin/rental-confirmations/${item.id}`)}
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pending Payment Proofs */}
        {pendingItems.paymentProofs.length > 0 && (
          <div className="pending-section">
            <div className="section-header">
              <h3>💰 Pending Payment Proofs ({pendingItems.paymentProofs.length})</h3>
              <button className="btn-view-all" onClick={() => handleStatsClick('payment-proofs')}>
                View All
              </button>
            </div>
            <div className="pending-list">
              {pendingItems.paymentProofs.map(item => (
                <div key={item.id} className="pending-item">
                  <div className="item-info">
                    <strong>{item.proof_type}</strong>
                    <span>Tenant: {item.tenant_id?.slice(0,8)}</span>
                    <small>{new Date(item.created_at).toLocaleString()}</small>
                  </div>
                  <div className="item-actions">
                    <button 
                      className="btn-approve"
                      onClick={() => window.open(item.file_url, '_blank')}
                    >
                      View
                    </button>
                    <button 
                      className="btn-approve"
                      onClick={() => navigate(`/admin/payment-proofs/${item.id}`)}
                    >
                      Verify
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Legacy Pending Listings (if any) */}
        {pendingItems.listings.length > 0 && (
          <div className="pending-section">
            <div className="section-header">
              <h3>📋 Pending Listings ({pendingItems.listings.length})</h3>
              <button className="btn-view-all" onClick={() => handleStatsClick('listings')}>
                View All
              </button>
            </div>
            <div className="pending-list">
              {pendingItems.listings.map(item => (
                <div key={item.id} className="pending-item">
                  <div className="item-info">
                    <strong>{item.title}</strong>
                    <span>₦{item.price?.toLocaleString()}</span>
                    <small>Posted by: {item.poster_role}</small>
                  </div>
                  <div className="item-actions">
                    <button className="btn-approve" onClick={() => approveListing(item.id)}>Approve</button>
                    <button className="btn-reject" onClick={() => rejectListing(item.id)}>Reject</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pending Users */}
        {pendingItems.users.length > 0 && (
          <div className="pending-section">
            <div className="section-header">
              <h3>👤 Pending User Verifications ({pendingItems.users.length})</h3>
              <button className="btn-view-all" onClick={() => handleStatsClick('users')}>
                View All
              </button>
            </div>
            <div className="pending-list">
              {pendingItems.users.map(item => (
                <div key={item.id} className="pending-item">
                  <div className="item-info">
                    <strong>{item.name || item.email}</strong>
                    <span>{item.role}</span>
                  </div>
                  <div className="item-actions">
                    <button className="btn-approve" onClick={() => approveUser(item.id)}>Verify</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recent Activity (optional) */}
      {recentActivities.length > 0 && (
        <div className="recent-activity">
          <h3>Recent Activity</h3>
          <ul>
            {recentActivities.map((act, idx) => (
              <li key={idx}>{act.action} - {new Date(act.timestamp).toLocaleString()}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;