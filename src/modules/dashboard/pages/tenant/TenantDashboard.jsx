// src/modules/dashboard/pages/tenant/TenantDashboard.jsx - UPDATED
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../../shared/context/AuthContext'
import VerifiedBadge, { InlineVerifiedBadge } from '../../../../shared/components/VerifiedBadge'
import './TenantDashboard.css'

const TenantDashboard = () => {
  const { user, isVerified, verificationStatus } = useAuth()
  const navigate = useNavigate()
  
  const [dashboardData, setDashboardData] = useState({
    userInfo: null,
    currentRental: null,
    listedProperties: [], // Properties tenant has listed
    savedProperties: [],
    applications: [],
    upcomingPayments: [],
    maintenanceRequests: [],
    notifications: [],
    stats: {
      listedProperties: 0,
      savedProperties: 0,
      applications: 0,
      unreadMessages: 0
    }
  })

  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [user])

  const loadDashboardData = () => {
    setLoading(true)
    
    // Load user's listed properties from localStorage
    const allListings = JSON.parse(localStorage.getItem('listings') || '[]')
    const userListings = allListings.filter(listing => 
      listing.posterId === user?.id || listing.userId === user?.id
    )
    
    // Load saved properties
    const savedProperties = JSON.parse(localStorage.getItem(`saved_properties_${user?.id}`) || '[]')
    
    // Load applications
    const applications = JSON.parse(localStorage.getItem(`applications_${user?.id}`) || '[]')
    
    // Mock user data
    const mockUserData = {
      id: user?.id,
      name: user?.name || 'Tenant User',
      email: user?.email || 'tenant@example.com',
      phone: user?.phone || '+234 801 234 5678',
      avatar: `https://ui-avatars.com/api/?name=${user?.name || 'Tenant'}&background=10b981&color=fff`,
      verificationStatus: user?.verificationStatus || 'not_started',
      isVerified: user?.isVerified || false,
      verificationLevel: user?.verificationLevel || 'basic',
      trustScore: user?.isVerified ? 85 : 65
    }
    
    // Current rental (if any)
    const currentRental = JSON.parse(localStorage.getItem(`current_rental_${user?.id}`)) || null
    
    setDashboardData({
      userInfo: mockUserData,
      currentRental,
      listedProperties: userListings,
      savedProperties,
      applications,
      upcomingPayments: [],
      maintenanceRequests: [],
      notifications: [],
      stats: {
        listedProperties: userListings.length,
        savedProperties: savedProperties.length,
        applications: applications.length,
        unreadMessages: 0
      }
    })
    
    setLoading(false)
  }

  const handleQuickAction = (action) => {
    switch(action) {
      case 'list_property':
        navigate('/dashboard/post-property')
        break
      case 'browse_properties':
        navigate('/listings')
        break
      case 'view_messages':
        navigate('/dashboard/messages')
        break
      case 'get_verified':
        navigate('/verify')
        break
      case 'view_applications':
        navigate('/dashboard/tenant/applications')
        break
      default:
        break
    }
  }

  const viewListingDetails = (listingId) => {
    navigate(`/listings/${listingId}`)
  }

  const editListing = (listingId) => {
    navigate(`/listings/edit/${listingId}`)
  }

  const deleteListing = (listingId) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      const allListings = JSON.parse(localStorage.getItem('listings') || '[]')
      const updatedListings = allListings.filter(listing => listing.id !== listingId)
      localStorage.setItem('listings', JSON.stringify(updatedListings))
      loadDashboardData() // Refresh data
    }
  }

  const removeSavedProperty = (propertyId) => {
    const saved = JSON.parse(localStorage.getItem(`saved_properties_${user?.id}`) || '[]')
    const updated = saved.filter(item => item.id !== propertyId)
    localStorage.setItem(`saved_properties_${user?.id}`, JSON.stringify(updated))
    loadDashboardData() // Refresh data
  }

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    )
  }

  return (
    <div className="tenant-dashboard">
      {/* Dashboard Header */}
      <header className="dashboard-header">
        <div className="header-user-info">
          <div className="user-avatar">
            <img src={dashboardData.userInfo?.avatar} alt={dashboardData.userInfo?.name} />
            {isVerified && (
              <div className="verified-badge-overlay">
                <VerifiedBadge type="tenant" size="small" />
              </div>
            )}
          </div>
          <div className="user-details">
            <h1 className="dashboard-title">
              Welcome back, <span className="user-highlight">{dashboardData.userInfo?.name}</span>!
            </h1>
            <p className="dashboard-subtitle">
              {isVerified ? 'Verified Tenant Account' : 'Complete verification to unlock features'}
            </p>
            <div className="user-meta">
              <span className="meta-item">
                <span className="meta-label">Trust Score:</span>
                <span className="meta-value score">{dashboardData.userInfo?.trustScore}/100</span>
              </span>
              {!isVerified && (
                <span className="meta-item">
                  <button 
                    className="btn-get-verified"
                    onClick={() => navigate('/verify')}
                  >
                    Get Verified Now
                  </button>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="header-stats">
          <div className="stat-card" onClick={() => navigate('/dashboard/tenant/applications')}>
            <div className="stat-icon">🏠</div>
            <div className="stat-content">
              <span className="stat-label">Listed Properties</span>
              <span className="stat-value">{dashboardData.stats.listedProperties}</span>
            </div>
          </div>
          <div className="stat-card" onClick={() => navigate('/dashboard/tenant/saved')}>
            <div className="stat-icon">⭐</div>
            <div className="stat-content">
              <span className="stat-label">Saved Properties</span>
              <span className="stat-value">{dashboardData.stats.savedProperties}</span>
            </div>
          </div>
          <div className="stat-card" onClick={() => navigate('/dashboard/tenant/applications')}>
            <div className="stat-icon">📋</div>
            <div className="stat-content">
              <span className="stat-label">Applications</span>
              <span className="stat-value">{dashboardData.stats.applications}</span>
            </div>
          </div>
          <div className="stat-card" onClick={() => navigate('/dashboard/messages')}>
            <div className="stat-icon">💬</div>
            <div className="stat-content">
              <span className="stat-label">Unread Messages</span>
              <span className="stat-value">{dashboardData.stats.unreadMessages}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Tabs - These are now in the sidebar, but we keep for quick navigation */}
      <div className="dashboard-tabs">
        <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
          📊 Overview
        </button>
        <button className={`tab-btn ${activeTab === 'listed' ? 'active' : ''}`} onClick={() => setActiveTab('listed')}>
          🏠 Listed ({dashboardData.stats.listedProperties})
        </button>
        <button className={`tab-btn ${activeTab === 'saved' ? 'active' : ''}`} onClick={() => setActiveTab('saved')}>
          ⭐ Saved ({dashboardData.stats.savedProperties})
        </button>
        <button className={`tab-btn ${activeTab === 'applications' ? 'active' : ''}`} onClick={() => navigate('/dashboard/tenant/applications')}>
          📋 Applications ({dashboardData.stats.applications})
        </button>
        <button className={`tab-btn ${activeTab === 'messages' ? 'active' : ''}`} onClick={() => navigate('/dashboard/messages')}>
          💬 Messages
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="overview-content">
            {/* Quick Actions */}
            <div className="content-card quick-actions">
              <h3>Quick Actions</h3>
              <div className="action-grid">
                <button className="action-btn" onClick={() => handleQuickAction('list_property')}>
                  <span className="action-icon">➕</span>
                  <span className="action-label">List a Property</span>
                </button>
                <button className="action-btn" onClick={() => handleQuickAction('browse_properties')}>
                  <span className="action-icon">🔍</span>
                  <span className="action-label">Browse Properties</span>
                </button>
                <button className="action-btn" onClick={() => handleQuickAction('view_messages')}>
                  <span className="action-icon">💬</span>
                  <span className="action-label">View Messages</span>
                </button>
                {!isVerified && (
                  <button className="action-btn" onClick={() => handleQuickAction('get_verified')}>
                    <span className="action-icon">✅</span>
                    <span className="action-label">Get Verified</span>
                  </button>
                )}
              </div>
            </div>

            {/* Listed Properties Preview */}
            {dashboardData.listedProperties.length > 0 && (
              <div className="content-card">
                <div className="card-header">
                  <h3>Your Listed Properties</h3>
                  <button className="btn btn-sm btn-outline" onClick={() => navigate('/dashboard/post-property')}>
                    View All
                  </button>
                </div>
                <div className="properties-preview">
                  {dashboardData.listedProperties.slice(0, 3).map(listing => (
                    <div key={listing.id} className="property-preview-card">
                      <img src={listing.images?.[0] || 'https://via.placeholder.com/150'} alt={listing.title} />
                      <div className="preview-content">
                        <h4>{listing.title}</h4>
                        <p className="preview-price">₦{listing.price?.toLocaleString()}</p>
                        <div className="preview-actions">
                          <button className="btn btn-sm btn-primary" onClick={() => viewListingDetails(listing.id)}>
                            View
                          </button>
                          <button className="btn btn-sm btn-outline" onClick={() => editListing(listing.id)}>
                            Edit
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Verification Status */}
            <div className="content-card verification-status">
              <h3>Verification Status</h3>
              <div className="verification-info">
                <div className={`verification-badge ${isVerified ? 'verified' : 'not-verified'}`}>
                  {isVerified ? '✅ Verified' : '⚠️ Not Verified'}
                </div>
                <p>
                  {isVerified 
                    ? 'Your account is verified. You get priority in search results and higher trust scores.'
                    : 'Get verified to increase your chances of finding a property and build trust with landlords.'
                  }
                </p>
                {!isVerified && (
                  <button className="btn btn-primary" onClick={() => navigate('/verify')}>
                    Start Verification
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Listed Properties Tab */}
        {activeTab === 'listed' && (
          <div className="listed-content">
            <div className="content-card">
              <div className="card-header">
                <h3>Properties You've Listed</h3>
                <button className="btn btn-primary" onClick={() => navigate('/dashboard/post-property')}>
                  + List New Property
                </button>
              </div>
              
              {dashboardData.listedProperties.length > 0 ? (
                <div className="listed-properties-grid">
                  {dashboardData.listedProperties.map(listing => (
                    <div key={listing.id} className="listed-property-card">
                      <div className="property-image-container">
                        <img src={listing.images?.[0] || 'https://via.placeholder.com/300x200'} alt={listing.title} />
                        {isVerified && (
                          <div className="verified-badge-overlay">
                            <InlineVerifiedBadge type="tenant" />
                          </div>
                        )}
                      </div>
                      <div className="property-content">
                        <div className="property-header">
                          <h4>{listing.title}</h4>
                          <span className={`status-badge ${listing.status || 'active'}`}>
                            {listing.status || 'Active'}
                          </span>
                        </div>
                        <p className="property-description">{listing.description}</p>
                        <div className="property-details">
                          <div className="detail-item">
                            <span className="detail-label">Price:</span>
                            <span className="detail-value">₦{listing.price?.toLocaleString()}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Location:</span>
                            <span className="detail-value">{listing.location || listing.address}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Views:</span>
                            <span className="detail-value">{listing.views || 0}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Inquiries:</span>
                            <span className="detail-value">{listing.inquiries || 0}</span>
                          </div>
                        </div>
                        <div className="property-actions">
                          <button className="btn btn-sm btn-primary" onClick={() => viewListingDetails(listing.id)}>
                            View
                          </button>
                          <button className="btn btn-sm btn-secondary" onClick={() => editListing(listing.id)}>
                            Edit
                          </button>
                          <button className="btn btn-sm btn-outline" onClick={() => deleteListing(listing.id)}>
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">🏠</div>
                  <h4>No Properties Listed</h4>
                  <p>List your first property to get started</p>
                  <button className="btn btn-primary" onClick={() => navigate('/dashboard/post-property')}>
                    List Your First Property
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Saved Properties Tab */}
        {activeTab === 'saved' && (
          <div className="saved-content">
            <div className="content-card">
              <div className="card-header">
                <h3>Saved Properties</h3>
                <button className="btn btn-outline" onClick={() => navigate('/listings')}>
                  Browse More
                </button>
              </div>
              
              {dashboardData.savedProperties.length > 0 ? (
                <div className="saved-properties-grid">
                  {dashboardData.savedProperties.map(property => (
                    <div key={property.id} className="saved-property-card">
                      <div className="property-image-container">
                        <img src={property.image} alt={property.title} />
                        {property.verified && (
                          <div className="verified-badge-overlay">
                            <VerifiedBadge type="property" size="small" />
                          </div>
                        )}
                      </div>
                      <div className="property-content">
                        <div className="property-header">
                          <h4>{property.title}</h4>
                          <div className="poster-info">
                            <span className="poster-name">{property.posterName}</span>
                            {property.posterVerified && (
                              <InlineVerifiedBadge type={property.posterRole === 'landlord' ? 'landlord' : 'tenant'} />
                            )}
                          </div>
                        </div>
                        <p className="property-price">₦{property.price?.toLocaleString()}</p>
                        <p className="property-location">{property.location}</p>
                        <div className="property-actions">
                          <button 
                            className="btn btn-sm btn-primary"
                            onClick={() => navigate(`/listings/${property.id}`)}
                          >
                            View Details
                          </button>
                          <button 
                            className="btn btn-sm btn-outline"
                            onClick={() => navigate(`/dashboard/messages?property=${property.id}`)}
                          >
                            Message {property.posterRole === 'landlord' ? 'Landlord' : 'Tenant'}
                          </button>
                          <button 
                            className="btn btn-sm btn-secondary"
                            onClick={() => removeSavedProperty(property.id)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">⭐</div>
                  <h4>No Saved Properties</h4>
                  <p>Save properties you're interested in for easy access</p>
                  <button className="btn btn-primary" onClick={() => navigate('/listings')}>
                    Browse Properties
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Applications Tab - Redirect to applications page */}
        {activeTab === 'applications' && (
          <div className="applications-content">
            <button className="btn btn-primary" onClick={() => navigate('/dashboard/tenant/applications')}>
              View All Applications
            </button>
          </div>
        )}
      </div>

      {/* Bottom Action Bar */}
      <div className="action-bar">
        <button className="btn btn-primary" onClick={() => navigate('/dashboard/post-property')}>
          List a Property
        </button>
        <button className="btn btn-secondary" onClick={() => navigate('/listings')}>
          Browse Properties
        </button>
        <button className="btn btn-outline" onClick={() => navigate('/dashboard/messages')}>
          Messages
        </button>
      </div>
    </div>
  )
}

export default TenantDashboard