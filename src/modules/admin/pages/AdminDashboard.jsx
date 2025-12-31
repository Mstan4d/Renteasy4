// src/modules/admin/pages/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../shared/context/AuthContext';
import { useNavigate } from 'react-router-dom'; // ADD THIS IMPORT
import AdminStatsCard from '../components/AdminStatsCard';
import { 
  Users, Home, ShieldCheck, Building, AlertCircle, 
  TrendingUp, MessageSquare, DollarSign, Clock, CheckCircle, XCircle
} from 'lucide-react';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate(); // ADD THIS HOOK
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

  useEffect(() => {
    if (user?.role !== 'admin') return;

    loadAdminData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(loadAdminData, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // FIX: Add missing handleStatsClick function
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

  const loadAdminData = () => {
    try {
      // Load all listings
      const allListings = JSON.parse(localStorage.getItem('listings') || '[]');
      
      // Load all users from localStorage
      const allUsers = JSON.parse(localStorage.getItem('rentEasyUsers') || '[]');
      
      // Load service providers
      const serviceProviders = JSON.parse(localStorage.getItem('serviceProviders') || '[]');
      const managers = JSON.parse(localStorage.getItem('managers') || '[]');
      const estateProperties = JSON.parse(localStorage.getItem('estateProperties') || '[]');
      
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
  };

  const calculateTotalRevenue = (listings) => {
    const verifiedListings = listings.filter(l => l.verified && l.status === 'approved');
    const totalRent = verifiedListings.reduce((sum, listing) => {
      return sum + (parseFloat(listing.price) || 0);
    }, 0);
    
    return Math.round(totalRent * 0.075);
  };

  const calculateNewUsersToday = (users) => {
    const today = new Date().toDateString();
    return users.filter(user => {
      const userDate = new Date(user.createdAt || Date.now()).toDateString();
      return userDate === today;
    }).length;
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

  const approveListing = (listingId) => {
    const listings = JSON.parse(localStorage.getItem('listings') || '[]');
    const listingToApprove = listings.find(l => l.id === listingId);
    
    if (!listingToApprove) return;
    
    const updatedListings = listings.map(listing => 
      listing.id === listingId ? { 
        ...listing, 
        verified: true, 
        status: 'approved',
        approvedAt: new Date().toISOString(),
        approvedBy: user?.name,
        approvedById: user?.id
      } : listing
    );
    
    localStorage.setItem('listings', JSON.stringify(updatedListings));
    
    // Log activity
    logActivity(`Approved listing: ${listingToApprove?.title}`, 'listing');
    
    // Update admin notifications
    const notifications = JSON.parse(localStorage.getItem('adminNotifications') || '[]');
    notifications.unshift({
      id: Date.now(),
      title: 'Listing Approved',
      message: `${listingToApprove?.title} has been verified and published`,
      type: 'listing',
      read: false,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('adminNotifications', JSON.stringify(notifications.slice(0, 50))); // Keep only 50
    
    loadAdminData();
  };

  const approveUser = (userId) => {
    const users = JSON.parse(localStorage.getItem('rentEasyUsers') || '[]');
    const userToApprove = users.find(u => u.id === userId);
    
    if (!userToApprove) return;
    
    const updatedUsers = users.map(user => 
      user.id === userId ? { 
        ...user, 
        verified: true, 
        needsVerification: false,
        verifiedAt: new Date().toISOString()
      } : user
    );
    
    localStorage.setItem('rentEasyUsers', JSON.stringify(updatedUsers));
    
    // Also update user verification in listings
    const listings = JSON.parse(localStorage.getItem('listings') || '[]');
    const updatedListings = listings.map(listing => 
      listing.userId === userId ? { ...listing, userVerified: true } : listing
    );
    localStorage.setItem('listings', JSON.stringify(updatedListings));
    
    logActivity(`Verified user: ${userToApprove?.name}`, 'user');
    loadAdminData();
  };

  const verifyUserForListing = (listingId, userId) => {
    const listings = JSON.parse(localStorage.getItem('listings') || '[]');
    const listing = listings.find(l => l.id === listingId);
    
    if (!listing) return;
    
    const updatedListings = listings.map(l => 
      l.id === listingId ? { 
        ...l, 
        userVerified: true,
        userVerifiedAt: new Date().toISOString(),
        userVerifiedBy: user?.name
      } : l
    );
    
    localStorage.setItem('listings', JSON.stringify(updatedListings));
    
    logActivity(`Verified user for listing: ${listing?.title}`, 'user');
    loadAdminData();
  };

  const verifyProvider = (providerId) => {
    // Check all provider arrays
    const serviceProviders = JSON.parse(localStorage.getItem('serviceProviders') || '[]');
    const managers = JSON.parse(localStorage.getItem('managers') || '[]');
    const estateProperties = JSON.parse(localStorage.getItem('estateProperties') || '[]');
    
    let providerToVerify;
    let storageKey;
    
    // Find provider in any of the arrays
    providerToVerify = serviceProviders.find(p => p.id === providerId);
    if (providerToVerify) storageKey = 'serviceProviders';
    
    if (!providerToVerify) {
      providerToVerify = managers.find(p => p.id === providerId);
      if (providerToVerify) storageKey = 'managers';
    }
    
    if (!providerToVerify) {
      providerToVerify = estateProperties.find(p => p.id === providerId);
      if (providerToVerify) storageKey = 'estateProperties';
    }
    
    if (!providerToVerify || !storageKey) return;
    
    const providers = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const updatedProviders = providers.map(provider => 
      provider.id === providerId ? { 
        ...provider, 
        status: 'approved', 
        verified: true,
        verifiedAt: new Date().toISOString()
      } : provider
    );
    
    localStorage.setItem(storageKey, JSON.stringify(updatedProviders));
    logActivity(`Verified provider: ${providerToVerify?.businessName || providerToVerify?.ownerName}`, 'provider');
    loadAdminData();
  };

  const rejectListing = (listingId, reason = 'Does not meet guidelines') => {
    if (!window.confirm('Are you sure you want to reject this listing?')) return;
    
    const listings = JSON.parse(localStorage.getItem('listings') || '[]');
    const listingToReject = listings.find(l => l.id === listingId);
    
    if (!listingToReject) return;
    
    const updatedListings = listings.map(listing => 
      listing.id === listingId ? { 
        ...listing, 
        verified: false,
        rejected: true,
        status: 'rejected',
        rejectionReason: reason,
        rejectedAt: new Date().toISOString(),
        rejectedBy: user?.name
      } : listing
    );
    
    localStorage.setItem('listings', JSON.stringify(updatedListings));
    logActivity(`Rejected listing: ${listingToReject?.title}`, 'listing');
    loadAdminData();
  };

  const logActivity = (action, type) => {
    const activities = JSON.parse(localStorage.getItem('adminActivities') || '[]');
    activities.unshift({
      id: Date.now(),
      action,
      type,
      admin: user?.name || 'Admin',
      timestamp: new Date().toISOString()
    });
    
    localStorage.setItem('adminActivities', JSON.stringify(activities.slice(0, 100)));
  };

  // FIX: Add missing verify and add button handlers
  const handleVerifyAll = () => {
    if (!window.confirm('Approve all pending listings? This action cannot be undone.')) return;
    
    const listings = JSON.parse(localStorage.getItem('listings') || '[]');
    const pendingListings = listings.filter(l => l.status === 'pending' || (!l.verified && !l.rejected));
    
    const updatedListings = listings.map(listing => {
      if (pendingListings.some(p => p.id === listing.id)) {
        return {
          ...listing,
          verified: true,
          status: 'approved',
          approvedAt: new Date().toISOString(),
          approvedBy: user?.name
        };
      }
      return listing;
    });
    
    localStorage.setItem('listings', JSON.stringify(updatedListings));
    logActivity('Approved all pending listings', 'batch');
    loadAdminData();
    alert(`${pendingListings.length} listings approved successfully!`);
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

  return (
    <div className="admin-dashboard">
      {/* Dashboard Header - FIX: Added buttons */}
      <div className="dashboard-header">
        <div className="header-left">
          <h1>Admin Dashboard</h1>
          <div className="admin-info">
            <span className="admin-badge">👑 Super Admin</span>
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

      {/* Stats Grid - FIX: Added onClick handlers */}
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
        
        <div onClick={() => handleStatsClick('listings')} className="stats-card-wrapper">
          <AdminStatsCard
            title="All Listings"
            value={stats.totalListings}
            icon={<Home />}
            change={`${stats.pendingVerifications} pending`}
            color="gray"
            clickable={true}
          />
        </div>
        
        <div onClick={() => handleStatsClick('verifications')} className="stats-card-wrapper">
          <AdminStatsCard
            title="Pending Verifications"
            value={stats.pendingVerifications}
            icon={<Clock />}
            change="Requires attention"
            color="orange"
            alert={stats.pendingVerifications > 0}
            clickable={true}
          />
        </div>
        
        <div onClick={() => handleStatsClick('listings')} className="stats-card-wrapper">
          <AdminStatsCard
            title="Verified Listings"
            value={stats.verifiedListings}
            icon={<CheckCircle />}
            change="Active on platform"
            color="green"
            clickable={true}
          />
        </div>
        
        <div onClick={() => handleStatsClick('listings')} className="stats-card-wrapper">
          <AdminStatsCard
            title="Rejected Listings"
            value={stats.rejectedListings}
            icon={<XCircle />}
            change="Failed verification"
            color="red"
            clickable={true}
          />
        </div>
        
        <div onClick={() => handleStatsClick('users')} className="stats-card-wrapper">
          <AdminStatsCard
            title="Unverified Users"
            value={stats.unverifiedUsers}
            icon={<AlertCircle />}
            change="Needs verification"
            color="yellow"
            alert={stats.unverifiedUsers > 0}
            clickable={true}
          />
        </div>
        
        <div onClick={() => handleStatsClick('revenue')} className="stats-card-wrapper">
          <AdminStatsCard
            title="Platform Revenue"
            value={`₦${stats.totalRevenue.toLocaleString()}`}
            icon={<DollarSign />}
            change="7.5% commission"
            color="teal"
            clickable={true}
          />
        </div>
        
        <div onClick={() => handleStatsClick('providers')} className="stats-card-wrapper">
          <AdminStatsCard
            title="Service Providers"
            value={stats.activeProviders}
            icon={<Building />}
            change={`${pendingItems.providers.length} pending`}
            color="purple"
            clickable={true}
          />
        </div>
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
          
          {stats.pendingVerifications === 0 ? (
            <div className="no-pending">
              <CheckCircle size={48} />
              <p>No pending approvals! All listings are verified.</p>
            </div>
          ) : (
            <div className="approval-sections">
              {/* Pending Listings */}
              {pendingItems.listings.length > 0 && (
                <div className="approval-section">
                  <h4>Property Listings ({pendingItems.listings.length})</h4>
                  {pendingItems.listings.map(listing => (
                    <div key={listing.id} className="pending-item">
                      <div className="item-info">
                        <strong>{listing.title}</strong>
                        <span className="price">₦{listing.price?.toLocaleString()}</span>
                        <small>
                          {listing.state} • {listing.userRole} • 
                          {listing.userVerified ? ' ✓ User Verified' : ' ⚠️ User Unverified'}
                        </small>
                        <small>Posted: {listing.postedDate || new Date(listing.createdAt).toLocaleDateString()}</small>
                      </div>
                      <div className="item-actions">
                        <button 
                          className="btn-approve"
                          onClick={() => handleQuickAction('approve-listing', listing)}
                        >
                          Approve Listing
                        </button>
                        {!listing.userVerified && (
                          <button 
                            className="btn-verify-user"
                            onClick={() => handleQuickAction('verify-user-listing', {
                              listingId: listing.id,
                              userId: listing.userId
                            })}
                          >
                            Verify User
                          </button>
                        )}
                        <button 
                          className="btn-reject"
                          onClick={() => rejectListing(listing.id)}
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pending Users */}
              {pendingItems.users.length > 0 && (
                <div className="approval-section">
                  <h4>User Verifications ({pendingItems.users.length})</h4>
                  {pendingItems.users.map(user => (
                    <div key={user.id} className="pending-item">
                      <div className="item-info">
                        <strong>{user.name}</strong>
                        <span className="role">{user.role}</span>
                        <small>{user.email}</small>
                        <small>Joined: {new Date(user.createdAt).toLocaleDateString()}</small>
                      </div>
                      <button 
                        className="btn-approve"
                        onClick={() => handleQuickAction('approve-user', user)}
                      >
                        Verify User
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Unverified Users with Listings */}
              {pendingItems.unverifiedUsers.length > 0 && (
                <div className="approval-section">
                  <h4>Users with Unverified Listings ({pendingItems.unverifiedUsers.length})</h4>
                  {pendingItems.unverifiedUsers.map(user => {
                    const userListings = JSON.parse(localStorage.getItem('listings') || '[]')
                      .filter(l => l.userId === user.id && !l.userVerified);
                    
                    return (
                      <div key={user.id} className="pending-item">
                        <div className="item-info">
                          <strong>{user.name}</strong>
                          <span className="role">{user.role}</span>
                          <small>Has {userListings.length} unverified listing(s)</small>
                          <small>{user.email}</small>
                        </div>
                        <button 
                          className="btn-verify-user"
                          onClick={() => handleQuickAction('approve-user', user)}
                        >
                          Verify User
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Pending Providers */}
              {pendingItems.providers.length > 0 && (
                <div className="approval-section">
                  <h4>Service Providers ({pendingItems.providers.length})</h4>
                  {pendingItems.providers.map(provider => (
                    <div key={provider.id} className="pending-item">
                      <div className="item-info">
                        <strong>{provider.businessName || provider.ownerName}</strong>
                        <span>{provider.serviceType}</span>
                        <small>{provider.state}</small>
                        <small>Registered: {new Date(provider.createdAt).toLocaleDateString()}</small>
                      </div>
                      <button 
                        className="btn-approve"
                        onClick={() => handleQuickAction('verify-provider', provider)}
                      >
                        Verify Provider
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Recent Activities */}
        <div className="recent-activities">
          <h3>Recent Activities 📝</h3>
          <div className="activities-list">
            {recentActivities.length > 0 ? (
              recentActivities.map(activity => (
                <div key={activity.id} className="activity-item">
                  <div className="activity-icon">
                    {activity.type === 'listing' && '🏠'}
                    {activity.type === 'user' && '👤'}
                    {activity.type === 'provider' && '🏢'}
                  </div>
                  <div className="activity-content">
                    <p>{activity.action}</p>
                    <small>
                      {new Date(activity.timestamp).toLocaleString()} • {activity.admin}
                    </small>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-activities">
                <MessageSquare size={32} />
                <p>No recent activities</p>
                <small>Activities will appear here</small>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats Summary */}
      <div className="quick-stats-summary">
        <div className="stat-summary">
          <span className="stat-label">Verification Rate</span>
          <span className="stat-value">
            {stats.totalListings > 0 
              ? Math.round((stats.verifiedListings / stats.totalListings) * 100)
              : 0}%
          </span>
        </div>
        <div className="stat-summary">
          <span className="stat-label">Rejection Rate</span>
          <span className="stat-value">
            {stats.totalListings > 0 
              ? Math.round((stats.rejectedListings / stats.totalListings) * 100)
              : 0}%
          </span>
        </div>
        <div className="stat-summary">
          <span className="stat-label">User Verification</span>
          <span className="stat-value">
            {stats.totalUsers > 0 
              ? Math.round(((stats.totalUsers - stats.unverifiedUsers) / stats.totalUsers) * 100)
              : 0}%
          </span>
        </div>
        <div className="stat-summary">
          <span className="stat-label">Platform Health</span>
          <span className="stat-value">
            {stats.reportedIssues === 0 ? 'Excellent' : 
             stats.reportedIssues < 3 ? 'Good' : 'Needs Attention'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;