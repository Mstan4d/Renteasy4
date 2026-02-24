// src/modules/provider/pages/ProviderDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProviderPageTemplate from '../templates/ProviderPageTemplate';
import { 
  FaMoneyBill, FaCalendarAlt, FaStar, FaChartLine,
  FaBell, FaTools, FaUserCheck, FaExclamationTriangle
} from 'react-icons/fa';
import { supabase } from '../../../shared/lib/supabaseClient';
import { useAuth } from '../../../shared/context/AuthContext';
import './ProviderDashboard.css'; // Move styles to external CSS

const ProviderDashboard = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth(); // Get the logged-in user and their profile
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    pendingBookings: 0,
    completedJobs: 0,
    averageRating: 0,
    responseRate: '0%',
    upcomingJobs: 0,
    leadsThisMonth: 0,
    conversionRate: '0%'
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [providerProfile, setProviderProfile] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [activeBoost, setActiveBoost] = useState(null);


  useEffect(() => {
    if (user) {
      fetchProviderDashboardData();
    }
  }, [user]);

  const fetchProviderDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch provider profile (from profiles table)
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;
      setProviderProfile(profileData);

// 2. Fetch subscription
const { data: subData } = await supabase
  .from('subscriptions')
  .select('*')
  .eq('user_id', user.id)
  .eq('status', 'active')
  .gte('expires_at', new Date().toISOString())
  .order('created_at', { ascending: false })
  .limit(1)
  .maybeSingle();
setSubscription(subData);

//3. Fetch active boost
const { data: boostData } = await supabase
  .from('active_boosts')
  .select('*, package:boost_packages(*)')
  .eq('user_id', user.id)
  .eq('status', 'active')
  .gte('expires_at', new Date().toISOString())
  .order('created_at', { ascending: false })
  .limit(1)
  .maybeSingle();
setActiveBoost(boostData);

      // 4. Fetch total earnings (sum of completed, paid bookings)
      const { data: earningsData, error: earningsError } = await supabase
        .from('provider_earnings')
        .select('amount')
        .eq('provider_id', user.id)
        .eq('status', 'paid');

      if (earningsError) throw earningsError;
      const totalEarnings = earningsData.reduce((sum, e) => sum + (e.amount || 0), 0);

      // 5. Fetch bookings (service requests)
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('service_requests')
        .select(`
          *,
          client:client_id (id, full_name, email, phone)
        `)
        .eq('provider_id', user.id)
        .order('scheduled_date', { ascending: false })
        .limit(10);

      if (bookingsError) throw bookingsError;

      // 6. Calculate stats from bookings
      const pendingBookings = bookingsData.filter(b => b.status === 'pending' || b.status === 'confirmed').length;
      const bookingCount = providerProfile?.free_booking_used || 0;
      const isSubscribed = !!subscription;
      const requiresSubscription = bookingCount >= 10 && !isSubscribed;
      const subscriptionExpiry = subscription?.expires_at;
      const isBoosted = !!activeBoost;
      const boostExpiry = activeBoost?.expires_at;
      const completedJobs = bookingsData.filter(b => b.status === 'completed').length;
      const upcomingJobs = bookingsData.filter(b => 
        b.status === 'confirmed' && 
        new Date(b.scheduled_date) >= new Date()
      ).length;

      // 7. Fetch average rating from reviews
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('provider_reviews')
        .select('rating')
        .eq('provider_id', user.id);

      if (reviewsError) throw reviewsError;
      const avgRating = reviewsData.length > 0
        ? (reviewsData.reduce((sum, r) => sum + r.rating, 0) / reviewsData.length).toFixed(1)
        : 0;

      // 8. Fetch leads (new requests in last 30 days) & conversion rate
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: leadsData, error: leadsError } = await supabase
        .from('service_requests')
        .select('id, status')
        .eq('provider_id', user.id)
        .gte('created_at', thirtyDaysAgo.toISOString());

      if (leadsError) throw leadsError;

      const leadsThisMonth = leadsData.length;
      const convertedLeads = leadsData.filter(l => l.status === 'completed').length;
      const conversionRate = leadsThisMonth > 0 
        ? ((convertedLeads / leadsThisMonth) * 100).toFixed(0) + '%'
        : '0%';

      // 9. Fetch recent notifications (you may have a notifications table)
      const { data: notificationsData, error: notificationsError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (notificationsError) throw notificationsError;

      // Format notifications for UI
      const formattedNotifications = notificationsData.map(n => ({
        id: n.id,
        message: n.message || n.title,
        time: formatTimeAgo(new Date(n.created_at)),
        type: n.type || 'info'
      }));

      // 10. Update state
      setStats({
        totalEarnings,
        pendingBookings,
        completedJobs,
        averageRating: parseFloat(avgRating),
        responseRate: '95%', // You can calculate this from response_time if tracked
        upcomingJobs,
        leadsThisMonth,
        conversionRate
      });

      // Format recent bookings for display
      const formattedBookings = bookingsData.slice(0, 5).map(b => ({
        id: b.id,
        client: b.client?.full_name || 'Client',
        service: b.service_type || 'Service',
        date: new Date(b.scheduled_date).toLocaleDateString('en-GB'),
        status: b.status.charAt(0).toUpperCase() + b.status.slice(1),
        amount: `₦${(b.amount || 0).toLocaleString()}`
      }));
      setRecentBookings(formattedBookings);
      setNotifications(formattedNotifications);

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper: format time ago
  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + ' years ago';
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ' months ago';
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' days ago';
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ' hours ago';
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' minutes ago';
    return Math.floor(seconds) + ' seconds ago';
  };

  // Stats cards configuration
  const statsCards = [
    { 
      title: 'Total Earnings', 
      value: `₦${stats.totalEarnings.toLocaleString()}`, 
      icon: <FaMoneyBill />, 
      color: 'linear-gradient(135deg, #00c853 0%, #64dd17 100%)',
      change: '+12%' // You can calculate this from previous period
    },
    { 
      title: 'Pending Bookings', 
      value: stats.pendingBookings, 
      icon: <FaCalendarAlt />, 
      color: 'linear-gradient(135deg, #ff9800 0%, #ff5722 100%)',
      change: '+3'
    },
    { 
      title: 'Avg. Rating', 
      value: stats.averageRating, 
      icon: <FaStar />, 
      color: 'linear-gradient(135deg, #ffeb3b 0%, #fbc02d 100%)',
      change: '+0.2'
    },
    { 
      title: 'Response Rate', 
      value: stats.responseRate, 
      icon: <FaChartLine />, 
      color: 'linear-gradient(135deg, #2196f3 0%, #03a9f4 100%)',
      change: '+5%'
    },
  ];

  const quickActions = [
    { label: 'Post New Service', path: '/dashboard/provider/post-service', icon: <FaTools /> },
    { label: 'Check Messages', path: '/dashboard/provider/messages', icon: <FaBell /> },
    { label: 'Update Availability', path: '/dashboard/provider/availability', icon: <FaCalendarAlt /> },
    { label: 'Get Verified', path: '/dashboard/provider/verify', icon: <FaUserCheck /> },
  ];

  if (loading) {
    return (
      <ProviderPageTemplate title="Provider Dashboard" subtitle="Loading your dashboard...">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Fetching your data...</p>
        </div>
      </ProviderPageTemplate>
    );
  }

  if (error) {
    return (
      <ProviderPageTemplate title="Provider Dashboard" subtitle="Something went wrong">
        <div className="error-container">
          <FaExclamationTriangle size={48} color="#dc3545" />
          <h3>Error loading dashboard</h3>
          <p>{error}</p>
          <button className="btn-primary" onClick={fetchProviderDashboardData}>
            Retry
          </button>
        </div>
      </ProviderPageTemplate>
    );
  }

  return (
    <ProviderPageTemplate
      title="Provider Dashboard"
      subtitle={`Welcome back, ${profile?.full_name || 'Provider'}! Here's your business overview`}
    >
      {/* Stats Grid */}
      <div className="provider-grid provider-grid-4" style={{ marginBottom: '2rem' }}>
        {statsCards.map((stat, index) => (
          <div 
            key={index} 
            className="provider-card stats-card"
            style={{ background: stat.color }}
          >
            <div className="card-header">
              <h3 className="card-title" style={{ color: 'white' }}>{stat.title}</h3>
              <span style={{ fontSize: '1.5rem', color: 'white' }}>{stat.icon}</span>
            </div>
            <div className="stats-number">{stat.value}</div>
            <div className="stats-label">
              <span style={{ color: 'rgba(255,255,255,0.9)' }}>
                {stat.change} from last month
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="provider-grid">
        {/* Recent Bookings */}
        <div className="provider-card" style={{ gridColumn: 'span 2' }}>
          <div className="card-header">
            <h3 className="card-title">Recent Bookings</h3>
            <button 
              className="btn-secondary"
              onClick={() => navigate('/dashboard/provider/bookings')}
            >
              View All
            </button>
          </div>
          
          {recentBookings.length > 0 ? (
            <div className="provider-table">
              <div className="table-header">
                <div className="provider-grid provider-grid-5">
                  <div>Client</div>
                  <div>Service</div>
                  <div>Date</div>
                  <div>Status</div>
                  <div>Amount</div>
                </div>
              </div>
              
              {recentBookings.map((booking) => (
                <div key={booking.id} className="table-row">
                  <div className="provider-grid provider-grid-5">
                    <div className="table-cell">{booking.client}</div>
                    <div className="table-cell">{booking.service}</div>
                    <div className="table-cell">{booking.date}</div>
                    <div className="table-cell">
                      <span className={`status-badge status-${booking.status.toLowerCase().replace(' ', '')}`}>
                        {booking.status}
                      </span>
                    </div>
                    <div className="table-cell" style={{ fontWeight: '600' }}>{booking.amount}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">No recent bookings found.</p>
          )}
        </div>

        {/* Quick Actions & Notifications */}
        <div className="provider-card">
          <div className="card-header">
            <h3 className="card-title">Quick Actions</h3>
          </div>
          
          <div className="quick-actions-grid">
            {quickActions.map((action, index) => (
              <button
                key={index}
                className="quick-action-btn"
                onClick={() => navigate(action.path)}
              >
                <span className="action-icon">{action.icon}</span>
                <span className="action-label">{action.label}</span>
              </button>
            ))}
          </div>

          {/* Notifications */}
          <div style={{ marginTop: '2rem' }}>
            <div className="card-header">
              <h3 className="card-title">Recent Notifications</h3>
              {notifications.length > 0 && (
                <button 
                  className="btn-link"
                  onClick={() => navigate('/dashboard/provider/notifications')}
                >
                  View All
                </button>
              )}
            </div>
            
            {notifications.length > 0 ? (
              <div className="notifications-list">
                {notifications.map((notification) => (
                  <div key={notification.id} className="notification-item">
                    <div className="notification-icon">
                      {notification.type === 'booking' && '📅'}
                      {notification.type === 'review' && '⭐'}
                      {notification.type === 'payment' && '💰'}
                      {notification.type === 'info' && 'ℹ️'}
                    </div>
                    <div className="notification-content">
                      <p className="notification-message">{notification.message}</p>
                      <span className="notification-time">{notification.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data">No new notifications.</p>
            )}
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="provider-grid" style={{ marginTop: '2rem' }}>
        <div className="provider-card">
          <h3 className="card-title">Performance Overview</h3>
          <div className="performance-stats">
            <div className="performance-item">
              <span className="performance-label">Completed Jobs</span>
              <span className="performance-value">{stats.completedJobs}</span>
            </div>
            <div className="performance-item">
              <span className="performance-label">Upcoming Jobs</span>
              <span className="performance-value">{stats.upcomingJobs}</span>
            </div>
            <div className="performance-item">
              <span className="performance-label">Leads This Month</span>
              <span className="performance-value">{stats.leadsThisMonth}</span>
            </div>
            <div className="performance-item">
              <span className="performance-label">Conversion Rate</span>
              <span className="performance-value">{stats.conversionRate}</span>
            </div>
          </div>
        </div>

        <div className="provider-card">
          <h3 className="card-title">Verification Status</h3>
          <div className="verification-status">
            <div className="verification-item">
              <FaUserCheck style={{ color: providerProfile?.is_kyc_verified ? '#4caf50' : '#ff9800', fontSize: '2rem' }} />
              <div>
                <h4 style={{ margin: '0 0 0.5rem 0' }}>
                  {providerProfile?.is_kyc_verified ? 'Profile Verified' : 'Verification Pending'}
                </h4>
                <p style={{ color: '#666', margin: 0 }}>
                  {providerProfile?.is_kyc_verified 
                    ? 'Your profile is verified' 
                    : `Profile is ${providerProfile?.kyc_status || 'incomplete'}`}
                </p>
              </div>
            </div>
            {!providerProfile?.is_kyc_verified && (
              <button 
                className="btn-primary" 
                onClick={() => navigate('/dashboard/provider/verify')}
              >
                Complete Verification
              </button>
            )}
          </div>
        </div>

        <div className="provider-card">
          <h3 className="card-title">Subscription Status</h3>
          <div className="subscription-status">
            <div className="subscription-info">
              <p style={{ margin: '0 0 1rem 0' }}>
                <strong>Status:</strong> <span className="status-active">
                  {providerProfile?.subscription_status || 'Active'}
                </span>
              </p>
              <p style={{ margin: '0 0 1rem 0' }}>
                <strong>Plan:</strong> {providerProfile?.plan_name || 'Free Tier'} 
                {providerProfile?.remaining_bookings && ` (${providerProfile.remaining_bookings} bookings left)`}
              </p>
              <p style={{ margin: 0 }}>
                <strong>Next Billing:</strong> {providerProfile?.next_billing_date || 'After quota'}
              </p>
            </div>
            <button 
              className="btn-secondary" 
              style={{ marginTop: '1rem' }}
              onClick={() => navigate('/dashboard/provider/subscription')}
            >
              Upgrade Plan
            </button>
          </div>
        </div>
      </div>
    </ProviderPageTemplate>
  );
};

export default ProviderDashboard;