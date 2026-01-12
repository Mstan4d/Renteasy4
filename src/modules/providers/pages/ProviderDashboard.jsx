import React, { useState, useEffect } from 'react';
import ProviderPageTemplate from '../templates/ProviderPageTemplate';
import { 
  FaMoneyBill, FaCalendarAlt, FaStar, FaChartLine,
  FaBell, FaTools, FaUserCheck, FaExclamationTriangle
} from 'react-icons/fa';

const ProviderDashboard = () => {
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

  const [recentBookings, setRecentBookings] = useState([
    { id: 1, client: 'John Doe', service: 'House Cleaning', date: '2024-01-15', status: 'Upcoming', amount: '₦15,000' },
    { id: 2, client: 'Jane Smith', service: 'Painting', date: '2024-01-14', status: 'Completed', amount: '₦45,000' },
    { id: 3, client: 'Mike Johnson', service: 'Plumbing', date: '2024-01-12', status: 'In Progress', amount: '₦25,000' },
  ]);

  const [notifications, setNotifications] = useState([
    { id: 1, message: 'New booking request from Sarah', time: '2 hours ago', type: 'booking' },
    { id: 2, message: 'Your service has been reviewed', time: '1 day ago', type: 'review' },
    { id: 3, message: 'Payment received ₦15,000', time: '2 days ago', type: 'payment' },
  ]);

  useEffect(() => {
    // Mock data - replace with actual API call
    setStats({
      totalEarnings: 125000,
      pendingBookings: 3,
      completedJobs: 24,
      averageRating: 4.7,
      responseRate: '95%',
      upcomingJobs: 5,
      leadsThisMonth: 12,
      conversionRate: '42%'
    });
  }, []);

  const statsCards = [
    { 
      title: 'Total Earnings', 
      value: `₦${stats.totalEarnings.toLocaleString()}`, 
      icon: <FaMoneyBill />, 
      color: 'linear-gradient(135deg, #00c853 0%, #64dd17 100%)',
      change: '+12%'
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

  return (
    <ProviderPageTemplate
      title="Provider Dashboard"
      subtitle="Welcome back! Here's your business overview"
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
              onClick={() => window.location.href = '/dashboard/provider/bookings'}
            >
              View All
            </button>
          </div>
          
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
        </div>

        {/* Quick Actions */}
        <div className="provider-card">
          <div className="card-header">
            <h3 className="card-title">Quick Actions</h3>
          </div>
          
          <div className="quick-actions-grid">
            {quickActions.map((action, index) => (
              <button
                key={index}
                className="quick-action-btn"
                onClick={() => window.location.href = action.path}
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
            </div>
            
            <div className="notifications-list">
              {notifications.map((notification) => (
                <div key={notification.id} className="notification-item">
                  <div className="notification-icon">
                    {notification.type === 'booking' && '📅'}
                    {notification.type === 'review' && '⭐'}
                    {notification.type === 'payment' && '💰'}
                  </div>
                  <div className="notification-content">
                    <p className="notification-message">{notification.message}</p>
                    <span className="notification-time">{notification.time}</span>
                  </div>
                </div>
              ))}
            </div>
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
              <FaUserCheck style={{ color: '#4caf50', fontSize: '2rem' }} />
              <div>
                <h4 style={{ margin: '0 0 0.5rem 0' }}>Profile Verified</h4>
                <p style={{ color: '#666', margin: 0 }}>Your profile is 80% complete</p>
              </div>
            </div>
            <button className="btn-primary" style={{ marginTop: '1rem' }}>
              Complete Verification
            </button>
          </div>
        </div>

        <div className="provider-card">
          <h3 className="card-title">Subscription Status</h3>
          <div className="subscription-status">
            <div className="subscription-info">
              <p style={{ margin: '0 0 1rem 0' }}>
                <strong>Status:</strong> <span className="status-active">Active</span>
              </p>
              <p style={{ margin: '0 0 1rem 0' }}>
                <strong>Plan:</strong> Free Tier (5 bookings left)
              </p>
              <p style={{ margin: 0 }}>
                <strong>Next Billing:</strong> After 5 more bookings
              </p>
            </div>
            <button className="btn-secondary" style={{ marginTop: '1rem' }}>
              Upgrade Plan
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .provider-grid-4 {
          grid-template-columns: repeat(4, 1fr);
        }
        
        .quick-actions-grid {
          display: grid;
          gap: 1rem;
          grid-template-columns: repeat(2, 1fr);
        }
        
        .quick-action-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          background: #f8f9fa;
          border: 2px solid #e0e0e0;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .quick-action-btn:hover {
          background: #e9ecef;
          border-color: #1a237e;
          transform: translateY(-2px);
        }
        
        .action-icon {
          font-size: 2rem;
          margin-bottom: 0.5rem;
          color: #1a237e;
        }
        
        .action-label {
          font-size: 0.9rem;
          font-weight: 600;
          text-align: center;
        }
        
        .notifications-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .notification-item {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 8px;
          border-left: 4px solid #1a237e;
        }
        
        .notification-icon {
          font-size: 1.2rem;
        }
        
        .notification-content {
          flex: 1;
        }
        
        .notification-message {
          margin: 0 0 0.5rem 0;
          font-weight: 500;
        }
        
        .notification-time {
          font-size: 0.8rem;
          color: #666;
        }
        
        .performance-stats {
          display: grid;
          gap: 1.5rem;
          grid-template-columns: repeat(2, 1fr);
        }
        
        .performance-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 8px;
        }
        
        .performance-label {
          font-size: 0.9rem;
          color: #666;
          margin-bottom: 0.5rem;
        }
        
        .performance-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1a237e;
        }
        
        .verification-item, .subscription-info {
          padding: 1.5rem;
          background: #f8f9fa;
          border-radius: 8px;
          margin-bottom: 1rem;
        }
        
        .verification-item {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        @media (max-width: 1200px) {
          .provider-grid-4 {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        
        @media (max-width: 768px) {
          .provider-grid-4,
          .provider-grid-2 {
            grid-template-columns: 1fr;
          }
          
          .quick-actions-grid {
            grid-template-columns: 1fr;
          }
          
          .performance-stats {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </ProviderPageTemplate>
  );
};

export default ProviderDashboard;