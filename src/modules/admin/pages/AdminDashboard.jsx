// src/modules/admin/pages/AdminDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../shared/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import AdminStatsCard from '../components/AdminStatsCard';
import { supabase } from '../../../shared/lib/supabaseClient';
import { 
  Users, Home, ShieldCheck, Building, AlertCircle, 
  TrendingUp, MessageSquare, DollarSign, Clock, CheckCircle, XCircle
} from 'lucide-react';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalListings: 0,
    pendingVerifications: 0,
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
    listings: [],
    users: [],
    providers: [],
    unverifiedUsers: []
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
      const userDate = new Date(user.createdAt || Date.now()).toDateString();
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
        { data: estateProperties }
      ] = await Promise.all([
        supabase.from('listings').select('*'),
        supabase.from('profiles').select('*'),
        supabase.from('service_providers').select('*').eq('service_type', 'service_provider'),
        supabase.from('service_providers').select('*').eq('service_type', 'manager'),
        supabase.from('service_providers').select('*').eq('service_type', 'estate_property')
      ]);

      // Load verification requests
      const verificationRequests = JSON.parse(localStorage.getItem('verificationRequests') || '[]');
      
      // Load reported issues
      const reportedIssues = JSON.parse(localStorage.getItem('reportedIssues') || '[]');
      
      // Calculate stats
      const verifiedListings = allListings.filter(l => l.verified && l.status === 'approved').length;
      const pendingListings = allListings.filter(l => 
        (l.status === 'pending' || (!l.verified && !l.rejected && !l.userVerified))
      ).length;
      const rejectedListings = allListings.filter(l => l.rejected).length;
      const unverifiedUsersCount = allListings.filter(l => !l.userVerified).length;
      
      const newStats = {
        totalUsers: allUsers.length,
        totalListings: allListings.length,
        pendingVerifications: pendingListings,
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
      
      // Get pending items for approval
      const pendingListingsForApproval = allListings.filter(listing => 
        (listing.status === 'pending' || (!listing.verified && !listing.rejected))
      );
      
      const pendingUsers = allUsers.filter(u => u.needsVerification && !u.verified);
      const pendingProviders = [...serviceProviders, ...managers, ...estateProperties].filter(p => 
        p.status === 'pending' || (p.needsVerification && !p.verified)
      );
      
      const usersWithUnverifiedListings = allUsers.filter(u => 
        allListings.some(l => l.userId === u.id && !l.userVerified)
      );
      
      setPendingItems({
        listings: pendingListingsForApproval.slice(0, 5),
        users: pendingUsers.slice(0, 5),
        providers: pendingProviders.slice(0, 5),
        unverifiedUsers: usersWithUnverifiedListings.slice(0, 5)
      });
      
      // Load recent activities
      const activities = JSON.parse(localStorage.getItem('adminActivities') || '[]');
      setRecentActivities(activities.slice(0, 10));
      
    } catch (error) {
      console.error('Error loading admin data:', error);
    }
  }, [calculateTotalRevenue, calculateNewUsersToday]);

  useEffect(() => {
    if (user?.role !== 'admin') return;

    // Load initial data
    loadAdminData();

    // Real-time subscription for listings
    const listingsChannel = supabase
      .channel('listings-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'listings'
      }, () => {
        loadAdminData();
      })
      .subscribe();

    // Real-time subscription for users
    const usersChannel = supabase
      .channel('profiles-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'profiles'
      }, () => {
        loadAdminData();
      })
      .subscribe();

    // Refresh data every 30 seconds
    const interval = setInterval(loadAdminData, 30000);

    // Cleanup function
    return () => {
      supabase.removeChannel(listingsChannel);
      supabase.removeChannel(usersChannel);
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

  const approveListing = async (listingId) => {
    try {
      // First get the listing to approve
      const { data: listingToApprove, error: fetchError } = await supabase
        .from('listings')
        .select('*')
        .eq('id', listingId)
        .single();
      
      if (fetchError) throw fetchError;

      const { error } = await supabase
        .from('listings')
        .update({
          verified: true,
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: user?.name,
          approved_by_id: user?.id
        })
        .eq('id', listingId);
      
      if (error) throw error;
      
      await logActivity(`Approved listing: ${listingToApprove?.title}`, 'listing', listingId);
      loadAdminData();
      
    } catch (error) {
      console.error('Error approving listing:', error);
    }
  };

  const approveUser = async (userId) => {
    try {
      const { data: userToApprove, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (fetchError) throw fetchError;

      const { error } = await supabase
        .from('profiles')
        .update({
          verified: true,
          needs_verification: false,
          verified_at: new Date().toISOString()
        })
        .eq('id', userId);
      
      if (error) throw error;
      
      // Also update user verification in listings
      const { error: listingsError } = await supabase
        .from('listings')
        .update({ user_verified: true })
        .eq('user_id', userId);
      
      if (listingsError) throw listingsError;
      
      await logActivity(`Verified user: ${userToApprove?.name}`, 'user', userId);
      loadAdminData();
      
    } catch (error) {
      console.error('Error approving user:', error);
    }
  };

  const verifyUserForListing = async (listingId, userId) => {
    try {
      const { data: listing, error: fetchError } = await supabase
        .from('listings')
        .select('*')
        .eq('id', listingId)
        .single();
      
      if (fetchError) throw fetchError;

      const { error } = await supabase
        .from('listings')
        .update({
          user_verified: true,
          user_verified_at: new Date().toISOString(),
          user_verified_by: user?.name
        })
        .eq('id', listingId);
      
      if (error) throw error;
      
      await logActivity(`Verified user for listing: ${listing?.title}`, 'user', userId);
      loadAdminData();
      
    } catch (error) {
      console.error('Error verifying user for listing:', error);
    }
  };

  const verifyProvider = async (providerId) => {
    try {
      // Try to find provider in any of the tables
      const { data: provider, error: fetchError } = await supabase
        .from('service_providers')
        .select('*')
        .eq('id', providerId)
        .single();
      
      if (fetchError) throw fetchError;

      const { error } = await supabase
        .from('service_providers')
        .update({
          status: 'approved',
          verified: true,
          verified_at: new Date().toISOString()
        })
        .eq('id', providerId);
      
      if (error) throw error;
      
      const providerName = provider.business_name || provider.owner_name || provider.company_name;
      await logActivity(`Verified provider: ${providerName}`, 'provider', providerId);
      loadAdminData();
      
    } catch (error) {
      console.error('Error verifying provider:', error);
    }
  };

  const rejectListing = async (listingId, reason = 'Does not meet guidelines') => {
    if (!window.confirm('Are you sure you want to reject this listing?')) return;
    
    try {
      const { data: listingToReject, error: fetchError } = await supabase
        .from('listings')
        .select('*')
        .eq('id', listingId)
        .single();
      
      if (fetchError) throw fetchError;

      const { error } = await supabase
        .from('listings')
        .update({
          verified: false,
          rejected: true,
          status: 'rejected',
          rejection_reason: reason,
          rejected_at: new Date().toISOString(),
          rejected_by: user?.name
        })
        .eq('id', listingId);
      
      if (error) throw error;
      
      await logActivity(`Rejected listing: ${listingToReject?.title}`, 'listing', listingId);
      loadAdminData();
      
    } catch (error) {
      console.error('Error rejecting listing:', error);
    }
  };

  const handleQuickAction = (action, data) => {
    switch(action) {
      case 'approve-listing':
        approveListing(data.id);
        break;
      case 'approve-user':
        approveUser(data.id);
        break;
      case 'verify-provider':
        verifyProvider(data.id);
        break;
      case 'verify-user-listing':
        verifyUserForListing(data.listingId, data.userId);
        break;
      default:
        break;
    }
  };

  const handleVerifyAll = async () => {
    if (!window.confirm('Approve all pending listings? This action cannot be undone.')) return;
    
    try {
      // Get all pending listings
      const { data: pendingListings, error: fetchError } = await supabase
        .from('listings')
        .select('*')
        .or('status.eq.pending,and(verified.is.false,rejected.is.false)');
      
      if (fetchError) throw fetchError;

      // Update all pending listings
      const { error } = await supabase
        .from('listings')
        .update({
          verified: true,
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: user?.name,
          approved_by_id: user?.id
        })
        .or('status.eq.pending,and(verified.is.false,rejected.is.false)');
      
      if (error) throw error;
      
      await logActivity(`Approved ${pendingListings.length} pending listings`, 'batch');
      loadAdminData();
      alert(`${pendingListings.length} listings approved successfully!`);
      
    } catch (error) {
      console.error('Error approving all listings:', error);
    }
  };

  const handleAddNew = () => {
    navigate('/admin/add-property');
  };

  if (user?.role !== 'admin') {
    return (
      <div className="admin-access-denied">
        <h2>⛔ Admin Access Required</h2>
        <p>You need administrator privileges to access this page.</p>
      </div>
    );
  }

  // Rest of your return statement remains the same...
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
        
        {/* Rest of your stats cards... */}
        {/* ... (keep all your existing return JSX as is) */}
      </div>

      {/* Quick Actions & Pending Approvals */}
      <div className="dashboard-content">
        <div className="pending-approvals">
          <div className="section-header">
            <h3>Pending Approvals ⏳ ({stats.pendingVerifications})</h3>
            {stats.pendingVerifications > 0 && (
              <button 
                className="btn-approve-all"
                onClick={handleVerifyAll}
              >
                Approve All
              </button>
            )}
          </div>
          
          {/* Rest of your component... */}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;