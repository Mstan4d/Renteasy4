// src/modules/dashboard/pages/landlord/LandlordDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../shared/context/AuthContext';
import './LandlordDashboard.css';

const LandlordDashboard = () => {
  // ================= STATE MANAGEMENT =================
  const [userData, setUserData] = useState(null);
  const [properties, setProperties] = useState([]);
  const [referralInfo, setReferralInfo] = useState({
    code: '',
    link: '',
    earnings: 0,
    totalCommission: 0
  });
  const [stats, setStats] = useState({
    totalProperties: 0,
    activeRentals: 0,
    vacantProperties: 0,
    pendingVerification: 0,
    monthlyEarnings: 0,
    totalEarnings: 0
  });
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);
  
  // ================= HOOKS =================
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // ================= DATA FETCHING =================
  useEffect(() => {
    const loadLandlordData = async () => {
      setIsLoading(true);
      
      try {
        // Simulate API calls
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock user data
        const mockUserData = {
          id: user?.id || 'landlord_123',
          name: user?.name || 'Property Owner',
          email: user?.email || 'landlord@example.com',
          phone: '+234 802 345 6789',
          joinDate: '2023-06-15',
          verified: true,
          commissionRate: '7.5%',
          walletBalance: 1250000,
          avatar: user?.avatar || `https://ui-avatars.com/api/?name=${user?.name || 'Landlord'}&background=5930e0&color=fff`
        };
        
        setUserData(mockUserData);
        
        // Generate referral info
        const referralCode = user?.referralCode || `LAND-${Date.now().toString(36).toUpperCase()}`;
        const referralLink = `${window.location.origin}/signup?ref=${referralCode}`;
        
        setReferralInfo({
          code: referralCode,
          link: referralLink,
          earnings: 25000,
          totalCommission: 1250000
        });
        
        // Mock properties data
        const mockProperties = [
          {
            id: 'prop-1',
            title: '3 Bedroom Duplex in Lekki',
            address: '123 Lekki Phase 1, Lagos',
            price: '₦3,500,000',
            status: 'rented',
            verification: 'verified',
            tenant: 'John Doe',
            tenantPhone: '+234 801 234 5678',
            rentDue: '2024-12-15',
            commission: '₦262,500',
            image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400',
            type: 'Duplex',
            bedrooms: 3,
            bathrooms: 3,
            area: '3500 sq ft'
          },
          {
            id: 'prop-2',
            title: '2 Bedroom Flat in Ikeja',
            address: '45 Allen Avenue, Ikeja',
            price: '₦1,800,000',
            status: 'vacant',
            verification: 'verified',
            tenant: null,
            tenantPhone: null,
            rentDue: null,
            commission: '₦135,000',
            image: 'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=400',
            type: 'Flat',
            bedrooms: 2,
            bathrooms: 2,
            area: '1800 sq ft'
          },
          {
            id: 'prop-3',
            title: 'Self-contain in Garki',
            address: '78 Garki Area 11, Abuja',
            price: '₦400,000',
            status: 'pending',
            verification: 'unverified',
            tenant: null,
            tenantPhone: null,
            rentDue: null,
            commission: '₦30,000',
            image: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=400',
            type: 'Self-contain',
            bedrooms: 1,
            bathrooms: 1,
            area: '800 sq ft'
          },
          {
            id: 'prop-4',
            title: '4 Bedroom Terrace in VI',
            address: '7 Victoria Island, Lagos',
            price: '₦5,200,000',
            status: 'rented',
            verification: 'verified',
            tenant: 'Sarah Johnson',
            tenantPhone: '+234 802 987 6543',
            rentDue: '2024-11-30',
            commission: '₦390,000',
            image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400',
            type: 'Terrace',
            bedrooms: 4,
            bathrooms: 4,
            area: '4500 sq ft'
          }
        ];
        
        setProperties(mockProperties);
        
        // Calculate stats
        const totalProperties = mockProperties.length;
        const activeRentals = mockProperties.filter(p => p.status === 'rented').length;
        const vacantProperties = mockProperties.filter(p => p.status === 'vacant').length;
        const pendingVerification = mockProperties.filter(p => p.verification === 'unverified').length;
        
        setStats({
          totalProperties,
          activeRentals,
          vacantProperties,
          pendingVerification,
          monthlyEarnings: 875000,
          totalEarnings: 1250000
        });
        
      } catch (error) {
        console.error('Error loading landlord data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user) {
      loadLandlordData();
    }
  }, [user]);
  
  // ================= NAVIGATION HANDLERS =================
  const navigateToPostProperty = () => {
    navigate('/dashboard/post-property');
  };
  
  const navigateToMessages = () => {
    navigate('/dashboard/messages');
  };
  
  const navigateToProfile = () => {
    navigate('/dashboard/landlord/profile');
  };
  
  const navigateToAnalytics = () => {
    navigate('/dashboard/landlord/analytics');
  };
  
  const navigateToSupport = () => {
    navigate('/dashboard/support');
  };
  
  const navigateToWithdrawFunds = () => {
    navigate('/dashboard/landlord/wallet/withdraw');
  };
  
  const navigateToPropertyDetail = (propertyId) => {
    navigate(`/dashboard/landlord/properties/${propertyId}`);
  };
  
  const navigateToEditProperty = (propertyId) => {
    navigate(`/dashboard/landlord/properties/${propertyId}/edit`);
  };
  
  // ================= EVENT HANDLERS =================
  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralInfo.link)
      .then(() => {
        // Show toast notification
        const toast = document.createElement('div');
        toast.className = 'copy-toast';
        toast.textContent = '✅ Referral link copied to clipboard!';
        toast.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          background: #10b981;
          color: white;
          padding: 12px 24px;
          border-radius: 8px;
          z-index: 1000;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          animation: slideIn 0.3s ease;
        `;
        document.body.appendChild(toast);
        setTimeout(() => {
          toast.style.animation = 'slideOut 0.3s ease';
          setTimeout(() => toast.remove(), 300);
        }, 3000);
      })
      .catch(err => {
        console.error('Failed to copy:', err);
      });
  };
  
  const handleMarkAsRented = (propertyId) => {
    setProperties(prev => prev.map(p => 
      p.id === propertyId ? {...p, status: 'rented'} : p
    ));
    // Update stats
    setStats(prev => ({
      ...prev,
      activeRentals: prev.activeRentals + 1,
      vacantProperties: prev.vacantProperties - 1
    }));
  };
  
  const handleVerifyProperty = (propertyId) => {
    setProperties(prev => prev.map(p => 
      p.id === propertyId ? {...p, verification: 'verified'} : p
    ));
    setStats(prev => ({
      ...prev,
      pendingVerification: prev.pendingVerification - 1
    }));
  };
  
  // ================= ACTIVITY DATA =================
  const activityItems = [
    {
      id: 'activity-1',
      icon: '💰',
      title: 'Rent payment received',
      description: 'for 3 Bedroom Duplex, Lekki',
      time: '2 hours ago',
      amount: '+₦3,500,000',
      type: 'payment'
    },
    {
      id: 'activity-2',
      icon: '👥',
      title: 'New tenant inquiry',
      description: 'for 2 Bedroom Flat, Ikeja',
      time: '1 day ago',
      button: 'Respond',
      type: 'inquiry'
    },
    {
      id: 'activity-3',
      icon: '✅',
      title: 'Property verified',
      description: 'Self-contain in Garki',
      time: '3 days ago',
      status: 'verified',
      type: 'verification'
    },
    {
      id: 'activity-4',
      icon: '🏠',
      title: 'New property listed',
      description: '4 Bedroom Terrace in VI',
      time: '5 days ago',
      status: 'listed',
      type: 'property'
    }
  ];
  
  // ================= HELPER FUNCTIONS =================
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  const calculateDaysUntilDue = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? `${diffDays} days` : 'Overdue';
  };
  
  // ================= RENDER LOADING STATE =================
  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading your landlord dashboard...</p>
      </div>
    );
  }
  
  // ================= MAIN RENDER =================
  return (
    <div className="landlord-dashboard">
      {/* Dashboard Header */}
      <header className="dashboard-header">
        <div className="header-top">
          <div className="header-content">
            <h1 className="dashboard-title">
              Welcome back, <span className="user-highlight">{userData?.name || 'Landlord'}</span>!
            </h1>
            <p className="dashboard-subtitle">
              Manage your properties, track earnings, and grow your portfolio
            </p>
          </div>
          
          <div className="header-actions">
            <button 
              className="btn btn-icon"
              onClick={navigateToMessages}
              title="View Messages"
            >
              <span className="btn-icon">📨</span>
              <span className="btn-text">Messages</span>
              {stats.activeRentals > 0 && (
                <span className="badge">{stats.activeRentals}</span>
              )}
            </button>
            <button 
              className="btn btn-icon"
              onClick={navigateToProfile}
              title="View Profile"
            >
              <span className="btn-icon">👤</span>
              <span className="btn-text">Profile</span>
            </button>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="quick-stats">
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-info">
              <span className="stat-label">Wallet Balance</span>
              <span className="stat-value">₦{userData?.walletBalance?.toLocaleString() || '0'}</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🏠</div>
            <div className="stat-info">
              <span className="stat-label">Total Properties</span>
              <span className="stat-value">{stats.totalProperties}</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📈</div>
            <div className="stat-info">
              <span className="stat-label">Monthly Earnings</span>
              <span className="stat-value">₦{stats.monthlyEarnings.toLocaleString()}</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-info">
              <span className="stat-label">Active Tenants</span>
              <span className="stat-value">{stats.activeRentals}</span>
            </div>
          </div>
        </div>
      </header>
      
      {/* Dashboard Tabs */}
      <div className="dashboard-tabs">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <span className="tab-icon">📊</span>
          Overview
        </button>
        <button 
          className={`tab-btn ${activeTab === 'properties' ? 'active' : ''}`}
          onClick={() => setActiveTab('properties')}
        >
          <span className="tab-icon">🏢</span>
          Properties ({properties.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'tenants' ? 'active' : ''}`}
          onClick={() => setActiveTab('tenants')}
        >
          <span className="tab-icon">👥</span>
          Tenants ({stats.activeRentals})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'earnings' ? 'active' : ''}`}
          onClick={() => setActiveTab('earnings')}
        >
          <span className="tab-icon">💵</span>
          Earnings
        </button>
        <button 
          className={`tab-btn ${activeTab === 'referral' ? 'active' : ''}`}
          onClick={() => setActiveTab('referral')}
        >
          <span className="tab-icon">🎯</span>
          Referral
        </button>
      </div>
      
      {/* Tab Content */}
      <div className="tab-content">
        
        {/* ================= OVERVIEW TAB ================= */}
        {activeTab === 'overview' && (
          <div className="overview-content">
            {/* Stats Grid */}
            <div className="stats-grid">
              <div className="stat-box total-properties">
                <h3>Total Properties</h3>
                <div className="stat-number">{stats.totalProperties}</div>
                <div className="stat-breakdown">
                  <span className="breakdown-item rented">{stats.activeRentals} Rented</span>
                  <span className="breakdown-item vacant">{stats.vacantProperties} Vacant</span>
                  <span className="breakdown-item pending">{stats.pendingVerification} Pending</span>
                </div>
              </div>
              
              <div className="stat-box total-earnings">
                <h3>Total Earnings</h3>
                <div className="stat-number">₦{stats.totalEarnings.toLocaleString()}</div>
                <div className="stat-breakdown">
                  <span className="breakdown-text">From {stats.activeRentals} active rentals</span>
                </div>
              </div>
              
              <div className="stat-box commission-rate">
                <h3>Commission Rate</h3>
                <div className="stat-number">{userData?.commissionRate || '7.5%'}</div>
                <div className="stat-breakdown">
                  <span className="breakdown-text">Per successful rental</span>
                </div>
              </div>
              
              <div className="stat-box referral-earnings">
                <h3>Referral Earnings</h3>
                <div className="stat-number">₦{referralInfo.earnings.toLocaleString()}</div>
                <div className="stat-breakdown">
                  <span className="breakdown-text">From your referral network</span>
                </div>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="content-card">
              <h3>Quick Actions</h3>
              <div className="action-grid">
                <button 
                  className="action-btn" 
                  onClick={navigateToPostProperty}
                >
                  <span className="action-icon">➕</span>
                  <span className="action-label">Add Property</span>
                </button>
                <button className="action-btn" onClick={navigateToAnalytics}>
                  <span className="action-icon">📊</span>
                  <span className="action-label">View Analytics</span>
                </button>
                <button 
                  className="action-btn"
                  onClick={navigateToWithdrawFunds}
                >
                  <span className="action-icon">💸</span>
                  <span className="action-label">Withdraw Funds</span>
                </button>
                <button className="action-btn" onClick={() => setActiveTab('referral')}>
                  <span className="action-icon">🎯</span>
                  <span className="action-label">Referral Program</span>
                </button>
              </div>
            </div>
            
            {/* Recent Activity */}
            <div className="content-card">
              <h3>Recent Activity</h3>
              <div className="activity-list">
                {activityItems.map((activity) => (
                  <div key={`activity-${activity.id}`} className="activity-item">
                    <div className="activity-icon">{activity.icon}</div>
                    <div className="activity-content">
                      <p><strong>{activity.title}</strong> {activity.description}</p>
                      <span className="activity-time">{activity.time}</span>
                    </div>
                    {activity.amount && (
                      <div className="activity-amount">{activity.amount}</div>
                    )}
                    {activity.button && (
                      <button className="btn btn-sm btn-primary">{activity.button}</button>
                    )}
                    {activity.status && (
                      <div className={`activity-status ${activity.status}`}>
                        {activity.status === 'verified' ? 'Verified' : activity.status === 'listed' ? 'Listed' : 'Pending'}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* ================= PROPERTIES TAB ================= */}
        {activeTab === 'properties' && (
          <div className="properties-content">
            <div className="content-header">
              <h2>Your Properties</h2>
              <button 
                className="btn btn-primary"
                onClick={navigateToPostProperty}
              >
                <span className="btn-icon">➕</span>
                Add New Property
              </button>
            </div>
            
            {properties.length > 0 ? (
              <div className="properties-grid">
                {properties.map((property, index) => (
                  <div key={`property-${property.id}-${index}`} className="property-card">
                    <div className="property-image">
                      <img 
                        src={property.image} 
                        alt={property.title}
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400';
                        }}
                      />
                      <div className={`property-status ${property.status}`}>
                        {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                      </div>
                      <div className={`verification-badge ${property.verification}`}>
                        {property.verification === 'verified' ? '✅ Verified' : '⏳ Pending'}
                      </div>
                    </div>
                    
                    <div className="property-info">
                      <h3>{property.title}</h3>
                      <p className="property-address">{property.address}</p>
                      
                      <div className="property-details">
                        <div className="detail-row">
                          <div className="detail-item">
                            <span className="detail-label">Type:</span>
                            <span className="detail-value">{property.type}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Bedrooms:</span>
                            <span className="detail-value">{property.bedrooms}</span>
                          </div>
                        </div>
                        
                        <div className="detail-item full-width">
                          <span className="detail-label">Monthly Rent:</span>
                          <span className="detail-value price">{property.price}</span>
                        </div>
                        
                        <div className="detail-item full-width">
                          <span className="detail-label">Commission:</span>
                          <span className="detail-value commission">{property.commission}</span>
                        </div>
                        
                        {property.tenant && (
                          <div className="detail-item full-width">
                            <span className="detail-label">Tenant:</span>
                            <span className="detail-value tenant">{property.tenant}</span>
                          </div>
                        )}
                        
                        {property.rentDue && (
                          <div className="detail-item full-width">
                            <span className="detail-label">Rent Due:</span>
                            <span className="detail-value due-date">
                              {formatDate(property.rentDue)} 
                              <span className="due-days"> ({calculateDaysUntilDue(property.rentDue)})</span>
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="property-actions">
                        <button 
                          className="btn btn-sm btn-outline" 
                          onClick={() => navigateToEditProperty(property.id)}
                        >
                          Edit
                        </button>
                        <button 
                          className="btn btn-sm btn-secondary" 
                          onClick={() => navigateToPropertyDetail(property.id)}
                        >
                          View Details
                        </button>
                        
                        {property.status === 'vacant' && (
                          <button 
                            className="btn btn-sm btn-primary" 
                            onClick={() => handleMarkAsRented(property.id)}
                          >
                            Mark as Rented
                          </button>
                        )}
                        
                        {property.verification === 'unverified' && (
                          <button 
                            className="btn btn-sm btn-success" 
                            onClick={() => handleVerifyProperty(property.id)}
                          >
                            Verify
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">🏠</div>
                <h3>No Properties Listed</h3>
                <p>Start earning by listing your first property on RentEasy</p>
                <button 
                  className="btn btn-primary"
                  onClick={navigateToPostProperty}
                >
                  List Your First Property
                </button>
              </div>
            )}
          </div>
        )}
        
        {/* ================= TENANTS TAB ================= */}
        {activeTab === 'tenants' && (
          <div className="tenants-content">
            <div className="content-header">
              <h2>Your Tenants</h2>
              <p className="subtitle">{stats.activeRentals} active tenants</p>
            </div>
            
            {stats.activeRentals > 0 ? (
              <div className="content-card">
                <div className="tenants-list">
                  <div className="list-header">
                    <span>Tenant</span>
                    <span>Property</span>
                    <span>Monthly Rent</span>
                    <span>Next Payment</span>
                    <span>Status</span>
                    <span>Actions</span>
                  </div>
                  
                  {properties
                    .filter(p => p.status === 'rented' && p.tenant)
                    .map((property, index) => (
                      <div key={`tenant-${property.id}-${index}`} className="tenant-row">
                        <div className="tenant-info">
                          <div className="tenant-avatar">
                            {property.tenant?.charAt(0) || 'T'}
                          </div>
                          <div className="tenant-details">
                            <span className="tenant-name">{property.tenant}</span>
                            <span className="tenant-phone">{property.tenantPhone || 'No phone'}</span>
                          </div>
                        </div>
                        <span className="tenant-property">{property.title}</span>
                        <span className="rent-amount">{property.price}</span>
                        <span className="next-payment">
                          {property.rentDue ? (
                            <>
                              {formatDate(property.rentDue)}
                              <span className="due-badge">
                                {calculateDaysUntilDue(property.rentDue)}
                              </span>
                            </>
                          ) : 'N/A'}
                        </span>
                        <span className="payment-status">
                          <span className="status-badge paid">Paid</span>
                        </span>
                        <div className="tenant-actions">
                          <button 
                            className="btn btn-sm btn-outline"
                            onClick={() => navigateToMessages()}
                          >
                            Message
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">👥</div>
                <h3>No Active Tenants</h3>
                <p>Start renting out your properties to see tenant information here</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => setActiveTab('properties')}
                >
                  View Properties
                </button>
              </div>
            )}
          </div>
        )}
        
        {/* ================= EARNINGS TAB ================= */}
        {activeTab === 'earnings' && (
          <div className="earnings-content">
            <div className="earnings-summary">
              <div className="summary-card total-earnings">
                <h3>Total Commission Earned</h3>
                <div className="summary-amount">₦{referralInfo.totalCommission.toLocaleString()}</div>
                <p className="summary-note">7.5% commission on all successful rentals</p>
              </div>
              
              <div className="summary-card monthly-earnings">
                <h3>This Month</h3>
                <div className="summary-amount">₦{stats.monthlyEarnings.toLocaleString()}</div>
                <p className="summary-note">From {stats.activeRentals} active rentals</p>
              </div>
            </div>
            
            <div className="content-card">
              <h3>Commission Breakdown</h3>
              <div className="commission-breakdown">
                <div className="breakdown-header">
                  <span>Property</span>
                  <span>Rent Amount</span>
                  <span>Commission (7.5%)</span>
                  <span>Status</span>
                  <span>Date</span>
                </div>
                
                {properties
                  .filter(p => p.status === 'rented')
                  .map((property, index) => (
                    <div key={`commission-${property.id}-${index}`} className="breakdown-row">
                      <span className="property-name">{property.title}</span>
                      <span className="rent-amount">{property.price}</span>
                      <span className="commission-amount">{property.commission}</span>
                      <span className="payment-status">
                        <span className="status-badge paid">Paid</span>
                      </span>
                      <span className="payment-date">
                        {property.rentDue ? formatDate(property.rentDue) : 'N/A'}
                      </span>
                    </div>
                  ))}
                
                {properties.filter(p => p.status === 'rented').length === 0 && (
                  <div className="empty-breakdown">
                    <p>No commission earnings yet. Start renting out your properties!</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="content-card">
              <h3>Withdrawal Options</h3>
              <div className="withdrawal-options">
                <div className="wallet-balance">
                  <h4>Wallet Balance</h4>
                  <div className="balance-amount">₦{userData?.walletBalance?.toLocaleString() || '0'}</div>
                  <p>Available for withdrawal</p>
                  <div className="balance-actions">
                    <button className="btn btn-sm btn-outline">View History</button>
                  </div>
                </div>
                
                <div className="withdrawal-actions">
                  <button 
                    className="btn btn-primary"
                    onClick={navigateToWithdrawFunds}
                  >
                    Withdraw to Bank
                  </button>
                  <button className="btn btn-secondary">Generate Report</button>
                  <button className="btn btn-outline">Set Auto-Withdraw</button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* ================= REFERRAL TAB ================= */}
        {activeTab === 'referral' && (
          <div className="referral-content">
            <div className="content-card">
              <h3>Your Referral Program</h3>
              
              <div className="referral-stats">
                <div className="stat-item">
                  <div className="stat-value">₦{referralInfo.earnings.toLocaleString()}</div>
                  <div className="stat-label">Total Referral Earnings</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">5</div>
                  <div className="stat-label">Successful Referrals</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">1%</div>
                  <div className="stat-label">Commission Rate</div>
                </div>
              </div>
              
              <div className="referral-section">
                <h4>Share Your Referral Code</h4>
                <div className="referral-code-box">
                  <div className="code-display">
                    <span className="code-label">Your Code:</span>
                    <code className="code-value">{referralInfo.code}</code>
                  </div>
                  <button 
                    className="btn btn-secondary"
                    onClick={copyReferralLink}
                  >
                    Copy Code
                  </button>
                </div>
              </div>
              
              <div className="referral-section">
                <h4>Share Your Referral Link</h4>
                <div className="referral-link-box">
                  <input 
                    type="text" 
                    value={referralInfo.link}
                    readOnly
                    className="link-input"
                  />
                  <button 
                    className="btn btn-primary"
                    onClick={copyReferralLink}
                  >
                    Copy Link
                  </button>
                </div>
                <p className="help-text">
                  Share with friends. When they sign up as landlords or tenants and complete a rental, you earn 1% commission!
                </p>
              </div>
              
              <div className="referral-section">
                <h4>How It Works</h4>
                <div className="how-it-works">
                  <div className="step">
                    <div className="step-number">1</div>
                    <div className="step-content">
                      <h5>Share Your Link</h5>
                      <p>Share your unique referral link with other property owners or renters</p>
                    </div>
                  </div>
                  <div className="step">
                    <div className="step-number">2</div>
                    <div className="step-content">
                      <h5>They Join RentEasy</h5>
                      <p>They sign up using your link and list or rent a property</p>
                    </div>
                  </div>
                  <div className="step">
                    <div className="step-number">3</div>
                    <div className="step-content">
                      <h5>You Earn Commission</h5>
                      <p>You earn 1% of their first successful rental transaction</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="referral-actions">
                <button className="btn btn-primary">Download Marketing Kit</button>
                <button className="btn btn-secondary">View Referral History</button>
                <button className="btn btn-outline">Share on Social Media</button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Bottom Action Bar */}
      <div className="action-bar">
        <button 
          className="btn btn-primary"
          onClick={navigateToAnalytics}
        >
          <span className="btn-icon">📊</span>
          View Analytics
        </button>
        <button 
          className="btn btn-secondary"
          onClick={navigateToSupport}
        >
          <span className="btn-icon">📞</span>
          Contact Support
        </button>
        <button className="btn btn-outline">
          <span className="btn-icon">📋</span>
          Download Reports
        </button>
      </div>
    </div>
  );
};

export default LandlordDashboard;