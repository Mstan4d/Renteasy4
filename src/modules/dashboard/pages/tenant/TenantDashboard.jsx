// src/modules/dashboard/pages/tenant/TenantDashboard.jsx - CORRECTED VERSION
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../../shared/context/AuthContext'
import VerifiedBadge, { InlineVerifiedBadge } from '../../../../shared/components/VerifiedBadge'
import './TenantDashboard.css'

const TenantDashboard = () => {
  const { user, isVerified } = useAuth()
  const navigate = useNavigate()
  
  const [dashboardData, setDashboardData] = useState({
    userInfo: null,
    listedProperties: [],
    savedProperties: [],
    applications: [],
    stats: {
      listedProperties: 0,
      savedProperties: 0,
      applications: 0,
      unreadMessages: 0
    }
  })

  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [profilePic, setProfilePic] = useState(null)
  const [coverPhoto, setCoverPhoto] = useState(null)

  useEffect(() => {
    loadDashboardData()
    loadUserImages()
  }, [user])

  const loadUserImages = () => {
    if (user?.id) {
      // Load profile picture from localStorage (same key used in TenantProfile)
      const savedProfilePic = localStorage.getItem(`tenant_profile_pic_${user.id}`)
      const savedCoverPhoto = localStorage.getItem(`tenant_cover_photo_${user.id}`)
      
      if (savedProfilePic) setProfilePic(savedProfilePic)
      if (savedCoverPhoto) setCoverPhoto(savedCoverPhoto)
    }
  }

  const loadDashboardData = () => {
    setLoading(true)
    
    // Load data from localStorage (will be replaced with backend API)
    const allListings = JSON.parse(localStorage.getItem('listings') || '[]')
    const userListings = allListings.filter(listing => 
      listing.posterId === user?.id || listing.userId === user?.id
    )
    
    const savedProperties = JSON.parse(localStorage.getItem(`saved_properties_${user?.id}`) || '[]')
    const applications = JSON.parse(localStorage.getItem(`applications_${user?.id}`) || '[]')
    
    // Get user profile data from localStorage (same as TenantProfile)
    const savedProfile = JSON.parse(localStorage.getItem(`tenant_profile_${user?.id}`) || 'null')
    
    // Get profile picture - priority: localStorage > user.profilePic > default avatar
    const userProfilePic = profilePic || user?.profilePic
    
    const mockUserData = {
      id: user?.id,
      name: user?.name || savedProfile?.name || 'Tenant User',
      email: user?.email || savedProfile?.email || 'tenant@example.com',
      phone: user?.phone || savedProfile?.phone || '+234 801 234 5678',
      avatar: userProfilePic || `https://ui-avatars.com/api/?name=${user?.name || 'Tenant'}&background=10b981&color=fff`,
      coverPhoto: coverPhoto || user?.coverPhoto,
      trustScore: user?.isVerified ? 85 : 65,
      occupation: savedProfile?.occupation || 'Tenant',
      bio: savedProfile?.bio || 'A responsible tenant looking for comfortable accommodation.',
      address: savedProfile?.address || ''
    }
    
    setDashboardData({
      userInfo: mockUserData,
      listedProperties: userListings,
      savedProperties,
      applications,
      stats: {
        listedProperties: userListings.length,
        savedProperties: savedProperties.length,
        applications: applications.length,
        unreadMessages: 0
      }
    })
    
    setLoading(false)
  }

  // Add this function to refresh dashboard when profile is updated
  const refreshDashboard = () => {
    loadUserImages()
    loadDashboardData()
  }

  // Listen for profile updates from other components
  useEffect(() => {
    const handleProfileUpdate = () => {
      refreshDashboard()
    }
    
    // Listen for custom event when profile is updated
    window.addEventListener('profileUpdated', handleProfileUpdate)
    
    // Also listen for storage changes (when localStorage is updated)
    window.addEventListener('storage', handleProfileUpdate)
    
    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate)
      window.removeEventListener('storage', handleProfileUpdate)
    }
  }, [])

  // Missing functions from original code
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
      loadDashboardData()
    }
  }

  const removeSavedProperty = (propertyId) => {
    const saved = JSON.parse(localStorage.getItem(`saved_properties_${user?.id}`) || '[]')
    const updated = saved.filter(item => item.id !== propertyId)
    localStorage.setItem(`saved_properties_${user?.id}`, JSON.stringify(updated))
    loadDashboardData()
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
      {/* Dashboard Header with Cover Photo Support */}
      <header className="dashboard-header">
        {coverPhoto && (
          <div className="dashboard-cover-photo">
            <img src={coverPhoto} alt="Cover" className="cover-image" />
          </div>
        )}
        <div className="user-info-section">
          <div className="user-avatar-container">
            <img 
              src={dashboardData.userInfo?.avatar} 
              alt={dashboardData.userInfo?.name} 
              className="user-avatar"
              onError={(e) => {
                e.target.onerror = null
                e.target.src = `https://ui-avatars.com/api/?name=${dashboardData.userInfo?.name || 'Tenant'}&background=10b981&color=fff`
              }}
            />
            {isVerified && (
              <div className="verified-badge-overlay">
                <VerifiedBadge type="tenant" size="small" />
              </div>
            )}
            <button 
              className="change-profile-pic-btn"
              onClick={() => navigate('/dashboard/tenant/profile')}
              title="Edit Profile Picture"
            >
              <span className="edit-icon">✏️</span>
            </button>
          </div>
          <div className="user-details">
            <div className="user-name-section">
              <h1 className="greeting">
                Welcome back, <span className="user-name">{dashboardData.userInfo?.name}</span>!
              </h1>
              <button 
                className="btn btn-sm btn-profile-edit"
                onClick={() => navigate('/dashboard/tenant/profile')}
              >
                Edit Profile
              </button>
            </div>
            <p className="user-status">
              {isVerified ? '✅ Verified Tenant Account' : '⚠️ Verification Required'}
              {dashboardData.userInfo?.occupation && (
                <span className="user-occupation">
                  • {dashboardData.userInfo?.occupation}
                </span>
              )}
            </p>
            <div className="user-meta">
              <div className="trust-score">
                <span className="label">Trust Score:</span>
                <span className="value">{dashboardData.userInfo?.trustScore}/100</span>
              </div>
              {dashboardData.userInfo?.address && (
                <div className="user-location">
                  <span className="location-icon">📍</span>
                  <span>{dashboardData.userInfo?.address.substring(0, 30)}...</span>
                </div>
              )}
              {!isVerified && (
                <button 
                  className="btn btn-sm btn-verify"
                  onClick={() => navigate('/verify')}
                >
                  Get Verified
                </button>
              )}
            </div>
            {dashboardData.userInfo?.bio && (
              <p className="user-bio">
                {dashboardData.userInfo?.bio}
              </p>
            )}
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div 
          className="stat-card" 
          onClick={() => setActiveTab('listed')}
          role="button"
          tabIndex={0}
        >
          <div className="stat-icon">🏠</div>
          <div className="stat-content">
            <div className="stat-value">{dashboardData.stats.listedProperties}</div>
            <div className="stat-label">Listed</div>
          </div>
        </div>
        
        <div 
          className="stat-card" 
          onClick={() => setActiveTab('saved')}
          role="button"
          tabIndex={0}
        >
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <div className="stat-value">{dashboardData.stats.savedProperties}</div>
            <div className="stat-label">Saved</div>
          </div>
        </div>
        
        <div 
          className="stat-card" 
          onClick={() => navigate('/dashboard/tenant/applications')}
          role="button"
          tabIndex={0}
        >
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <div className="stat-value">{dashboardData.stats.applications}</div>
            <div className="stat-label">Applications</div>
          </div>
        </div>
        
        <div 
          className="stat-card" 
          onClick={() => navigate('/dashboard/messages')}
          role="button"
          tabIndex={0}
        >
          <div className="stat-icon">💬</div>
          <div className="stat-content">
            <div className="stat-value">{dashboardData.stats.unreadMessages}</div>
            <div className="stat-label">Messages</div>
          </div>
        </div>
      </div>

      {/* Dashboard Navigation Tabs */}
      <nav className="dashboard-nav">
        <div className="nav-tabs">
          <button 
            className={`nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <span className="tab-icon">📊</span>
            <span className="tab-label">Overview</span>
          </button>
          
          <button 
            className={`nav-tab ${activeTab === 'listed' ? 'active' : ''}`}
            onClick={() => setActiveTab('listed')}
          >
            <span className="tab-icon">🏠</span>
            <span className="tab-label">Listed</span>
            {dashboardData.stats.listedProperties > 0 && (
              <span className="tab-badge">{dashboardData.stats.listedProperties}</span>
            )}
          </button>
          
          <button 
            className={`nav-tab ${activeTab === 'saved' ? 'active' : ''}`}
            onClick={() => setActiveTab('saved')}
          >
            <span className="tab-icon">⭐</span>
            <span className="tab-label">Saved</span>
            {dashboardData.stats.savedProperties > 0 && (
              <span className="tab-badge">{dashboardData.stats.savedProperties}</span>
            )}
          </button>
          
          <button 
            className="nav-tab"
            onClick={() => navigate('/dashboard/tenant/applications')}
          >
            <span className="tab-icon">📋</span>
            <span className="tab-label">Applications</span>
            {dashboardData.stats.applications > 0 && (
              <span className="tab-badge">{dashboardData.stats.applications}</span>
            )}
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="dashboard-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="overview-content">
            {/* Quick Actions */}
            <div className="content-section">
              <h3 className="section-title">Quick Actions</h3>
              <div className="quick-actions-grid">
                <button 
                  className="quick-action-btn"
                  onClick={() => handleQuickAction('list_property')}
                >
                  <span className="action-icon">➕</span>
                  <span className="action-label">List Property</span>
                </button>
                
                <button 
                  className="quick-action-btn"
                  onClick={() => handleQuickAction('browse_properties')}
                >
                  <span className="action-icon">🔍</span>
                  <span className="action-label">Browse</span>
                </button>
                
                <button 
                  className="quick-action-btn"
                  onClick={() => handleQuickAction('view_messages')}
                >
                  <span className="action-icon">💬</span>
                  <span className="action-label">Messages</span>
                </button>
                
                {!isVerified && (
                  <button 
                    className="quick-action-btn"
                    onClick={() => handleQuickAction('get_verified')}
                  >
                    <span className="action-icon">✅</span>
                    <span className="action-label">Verify</span>
                  </button>
                )}
              </div>
            </div>

            {/* Listed Properties Preview */}
            {dashboardData.listedProperties.length > 0 && (
              <div className="content-section">
                <div className="section-header">
                  <h3 className="section-title">Recent Listings</h3>
                  <button 
                    className="btn btn-link"
                    onClick={() => setActiveTab('listed')}
                  >
                    View All
                  </button>
                </div>
                <div className="properties-preview">
                  {dashboardData.listedProperties.slice(0, 2).map(listing => (
                    <div key={listing.id} className="property-preview">
                      <div className="property-image">
                        <img 
                          src={listing.images?.[0] || 'https://via.placeholder.com/150'} 
                          alt={listing.title}
                        />
                      </div>
                      <div className="property-info">
                        <h4 className="property-title">{listing.title}</h4>
                        <p className="property-price">₦{listing.price?.toLocaleString()}/month</p>
                        <div className="property-actions">
                          <button 
                            className="btn btn-sm btn-primary"
                            onClick={() => viewListingDetails(listing.id)}
                          >
                            View
                          </button>
                          <button 
                            className="btn btn-sm btn-secondary"
                            onClick={() => editListing(listing.id)}
                          >
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
            <div className="content-section">
              <h3 className="section-title">Verification Status</h3>
              <div className={`verification-card ${isVerified ? 'verified' : 'pending'}`}>
                <div className="verification-icon">
                  {isVerified ? '✅' : '⚠️'}
                </div>
                <div className="verification-content">
                  <h4>{isVerified ? 'Account Verified' : 'Verification Required'}</h4>
                  <p>
                    {isVerified 
                      ? 'Your verified status helps build trust with landlords.'
                      : 'Complete verification to unlock all features and build trust.'
                    }
                  </p>
                  {!isVerified && (
                    <button 
                      className="btn btn-primary"
                      onClick={() => navigate('/verify')}
                    >
                      Start Verification
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Listed Properties Tab */}
        {activeTab === 'listed' && (
          <div className="listed-properties">
            <div className="section-header">
              <h3 className="section-title">Your Listed Properties</h3>
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/dashboard/post-property')}
              >
                + List New
              </button>
            </div>
            
            {dashboardData.listedProperties.length > 0 ? (
              <div className="properties-list">
                {dashboardData.listedProperties.map(listing => (
                  <div key={listing.id} className="property-card">
                    <div className="property-card-image">
                      <img 
                        src={listing.images?.[0] || 'https://via.placeholder.com/300x200'} 
                        alt={listing.title}
                      />
                      <div className="property-status">
                        <span className={`status-badge ${listing.status || 'active'}`}>
                          {listing.status || 'Active'}
                        </span>
                      </div>
                    </div>
                    <div className="property-card-content">
                      <div className="property-card-header">
                        <h4 className="property-title">{listing.title}</h4>
                        <div className="property-badges">
                          {isVerified && (
                            <InlineVerifiedBadge type="tenant" compact />
                          )}
                        </div>
                      </div>
                      <p className="property-price">₦{listing.price?.toLocaleString()}/month</p>
                      <p className="property-description">{listing.description}</p>
                      <div className="property-details">
                        <div className="detail">
                          <span className="detail-label">Location:</span>
                          <span className="detail-value">{listing.location || listing.address}</span>
                        </div>
                        <div className="detail">
                          <span className="detail-label">Views:</span>
                          <span className="detail-value">{listing.views || 0}</span>
                        </div>
                        <div className="detail">
                          <span className="detail-label">Inquiries:</span>
                          <span className="detail-value">{listing.inquiries || 0}</span>
                        </div>
                      </div>
                      <div className="property-card-actions">
                        <button 
                          className="btn btn-sm btn-primary"
                          onClick={() => viewListingDetails(listing.id)}
                        >
                          View Details
                        </button>
                        <button 
                          className="btn btn-sm btn-secondary"
                          onClick={() => editListing(listing.id)}
                        >
                          Edit
                        </button>
                        <button 
                          className="btn btn-sm btn-danger"
                          onClick={() => deleteListing(listing.id)}
                        >
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
                <button 
                  className="btn btn-primary"
                  onClick={() => navigate('/dashboard/post-property')}
                >
                  List Your First Property
                </button>
              </div>
            )}
          </div>
        )}

        {/* Saved Properties Tab */}
        {activeTab === 'saved' && (
          <div className="saved-properties">
            <div className="section-header">
              <h3 className="section-title">Saved Properties</h3>
              <button 
                className="btn btn-outline"
                onClick={() => navigate('/listings')}
              >
                Browse More
              </button>
            </div>
            
            {dashboardData.savedProperties.length > 0 ? (
              <div className="properties-list">
                {dashboardData.savedProperties.map(property => (
                  <div key={property.id} className="property-card">
                    <div className="property-card-image">
                      <img 
                        src={property.image} 
                        alt={property.title}
                      />
                    </div>
                    <div className="property-card-content">
                      <div className="property-card-header">
                        <h4 className="property-title">{property.title}</h4>
                        <div className="poster-info">
                          <span className="poster-name">{property.posterName}</span>
                          {property.posterVerified && (
                            <InlineVerifiedBadge type={property.posterRole === 'landlord' ? 'landlord' : 'tenant'} compact />
                          )}
                        </div>
                      </div>
                      <p className="property-price">₦{property.price?.toLocaleString()}/month</p>
                      <p className="property-location">{property.location}</p>
                      <div className="property-card-actions">
                        <button 
                          className="btn btn-sm btn-primary"
                          onClick={() => navigate(`/listings/${property.id}`)}
                        >
                          View Details
                        </button>
                        <button 
                          className="btn btn-sm btn-secondary"
                          onClick={() => navigate(`/dashboard/messages?property=${property.id}`)}
                        >
                          Message {property.posterRole === 'landlord' ? 'Landlord' : 'Tenant'}
                        </button>
                        <button 
                          className="btn btn-sm btn-danger"
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
                <button 
                  className="btn btn-primary"
                  onClick={() => navigate('/listings')}
                >
                  Browse Properties
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default TenantDashboard