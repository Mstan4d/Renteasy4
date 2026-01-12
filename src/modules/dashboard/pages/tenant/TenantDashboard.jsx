// src/modules/dashboard/pages/tenant/TenantDashboard.jsx - UPDATED POSTING RULES
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
      unreadMessages: 0,
      referralEarnings: 0,
      commissionEarned: 0
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
      const savedProfilePic = localStorage.getItem(`tenant_profile_pic_${user.id}`)
      const savedCoverPhoto = localStorage.getItem(`tenant_cover_photo_${user.id}`)
      
      if (savedProfilePic) setProfilePic(savedProfilePic)
      if (savedCoverPhoto) setCoverPhoto(savedCoverPhoto)
    }
  }

  const loadDashboardData = () => {
    setLoading(true)
    
    // Load data from localStorage
    const allListings = JSON.parse(localStorage.getItem('listings') || '[]')
    const userListings = allListings.filter(listing => 
      listing.posterId === user?.id || listing.userId === user?.id
    )
    
    const savedProperties = JSON.parse(localStorage.getItem(`saved_properties_${user?.id}`) || '[]')
    const applications = JSON.parse(localStorage.getItem(`applications_${user?.id}`) || '[]')
    const savedProfile = JSON.parse(localStorage.getItem(`tenant_profile_${user?.id}`) || 'null')
    
    // Calculate referral earnings (1% commission)
    const chats = JSON.parse(localStorage.getItem('chats') || '[]')
    const userChats = chats.filter(chat => chat.participants.tenant === user?.id)
    let commissionEarned = 0
    
    userChats.forEach(chat => {
      if (chat.commissionDetails?.referrerShare) {
        commissionEarned += chat.commissionDetails.referrerShare
      }
    })
    
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
      address: savedProfile?.address || '',
      referralCode: user?.referralCode || `TEN-${Date.now().toString(36).toUpperCase()}`,
      isVerified: user?.isVerified || false
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
        unreadMessages: 0,
        referralEarnings: commissionEarned,
        commissionEarned: commissionEarned
      }
    })
    
    setLoading(false)
  }

  // FIXED: Allow unverified tenants to post
  const handleListProperty = () => {
    // BUSINESS RULE: Unverified tenants can post, but show warning
    if (!isVerified) {
      const confirmPost = window.confirm(
        '⚠️ IMPORTANT: YOU ARE POSTING AS AN UNVERIFIED TENANT\n\n' +
        'Your listing will show an "Unverified Tenant" badge.\n' +
        'This may affect trust from incoming tenants.\n\n' +
        'BUSINESS RULES:\n' +
        '1. Your listing will be visible to incoming tenants\n' +
        '2. Incoming tenants MUST communicate through RentEasy manager\n' +
        '3. When rented, you earn 1% commission as referrer\n' +
        '4. Manager earns 2.5%, RentEasy earns 4%\n\n' +
        'Do you want to continue?'
      )
      
      if (confirmPost) {
        navigate('/dashboard/post-property?type=outgoing-tenant')
      }
    } else {
      // Verified tenant posting
      const confirmPost = window.confirm(
        '⚠️ IMPORTANT BUSINESS RULES:\n\n' +
        '1. Your listing will be visible to incoming tenants\n' +
        '2. Incoming tenants MUST communicate through RentEasy manager\n' +
        '3. When rented, you earn 1% commission as referrer\n' +
        '4. Manager earns 2.5%, RentEasy earns 4%\n\n' +
        'Do you understand and agree to these terms?'
      )
      
      if (confirmPost) {
        navigate('/dashboard/post-property?type=outgoing-tenant')
      }
    }
  }

  const handleQuickAction = (action) => {
    switch(action) {
      case 'list_property':
        handleListProperty()
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
      case 'referral_program':
        setActiveTab('referral')
        break
      default:
        break
    }
  }

  // BUSINESS RULE: Contact property through manager for tenant postings
  const contactProperty = (property) => {
    if (!user) {
      navigate('/login', { state: { from: `/listings/${property.id}` } })
      return
    }
    
    // Check if user is the poster
    if (user.id === property.posterId) {
      alert('This is your own listing')
      return
    }
    
    navigate(`/dashboard/messages/${property.id}`)
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

  // Copy referral link
  const copyReferralLink = () => {
    const referralLink = `${window.location.origin}/signup?ref=${dashboardData.userInfo?.referralCode}`
    navigator.clipboard.writeText(referralLink)
      .then(() => alert('Referral link copied! Share with friends.'))
      .catch(() => alert('Failed to copy referral link'))
  }

  // Get verification badge for listings
  const getVerificationBadge = (listing) => {
    if (listing.userVerified || listing.posterVerified) {
      return <InlineVerifiedBadge type="tenant" compact />
    }
    return <span className="unverified-badge">⚠️ Unverified</span>
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
            {!isVerified && (
              <div className="unverified-badge-overlay">
                <span className="unverified-icon">⚠️</span>
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
              <div className="user-status-badges">
                {isVerified ? (
                  <span className="status-badge verified">✅ Verified Tenant</span>
                ) : (
                  <span className="status-badge unverified">⚠️ Unverified</span>
                )}
                <button 
                  className="btn btn-sm btn-profile-edit"
                  onClick={() => navigate('/dashboard/tenant/profile')}
                >
                  Edit Profile
                </button>
              </div>
            </div>
            <p className="user-status">
              {isVerified 
                ? 'Your verified status helps build trust with other users.'
                : 'Consider verifying your account to build trust with landlords and tenants.'
              }
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
            <div className="stat-subtext">
              {isVerified ? 'Verified' : 'Unverified'} Tenant
            </div>
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
          onClick={() => setActiveTab('referral')}
          role="button"
          tabIndex={0}
        >
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className="stat-value">₦{dashboardData.stats.commissionEarned.toLocaleString()}</div>
            <div className="stat-label">Commission</div>
            <div className="stat-subtext">Earn 1% per rental</div>
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
            className={`nav-tab ${activeTab === 'referral' ? 'active' : ''}`}
            onClick={() => setActiveTab('referral')}
          >
            <span className="tab-icon">💰</span>
            <span className="tab-label">Referral</span>
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="dashboard-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="overview-content">
            {/* Verification Status Banner */}
            {!isVerified && (
              <div className="verification-banner">
                <div className="banner-content">
                  <div className="banner-icon">⚠️</div>
                  <div className="banner-text">
                    <h4>Unverified Account</h4>
                    <p>
                      You can still post properties, but your listings will show an "Unverified Tenant" badge. 
                      Verify your account to build more trust with other users.
                    </p>
                  </div>
                  <button 
                    className="btn btn-primary"
                    onClick={() => navigate('/verify')}
                  >
                    Get Verified
                  </button>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="content-section">
              <h3 className="section-title">Quick Actions</h3>
              <div className="quick-actions-grid">
                <button 
                  className="quick-action-btn"
                  onClick={() => handleQuickAction('list_property')}
                >
                  <span className="action-icon">➕</span>
                  <span className="action-label">List Vacating Property</span>
                  {!isVerified && <span className="action-badge">Unverified</span>}
                </button>
                
                <button 
                  className="quick-action-btn"
                  onClick={() => handleQuickAction('browse_properties')}
                >
                  <span className="action-icon">🔍</span>
                  <span className="action-label">Browse Properties</span>
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
                    <span className="action-label">Get Verified</span>
                  </button>
                )}
              </div>
            </div>

            {/* Commission Notice for Tenant Listings */}
            <div className="content-section">
              <div className="commission-notice-card">
                <div className="notice-icon">💡</div>
                <div className="notice-content">
                  <h4>Earn 1% Commission on Your Listings</h4>
                  <p>
                    When someone rents a property you listed, you earn <strong>1% commission</strong> as the referrer. 
                    The incoming tenant will communicate through a RentEasy manager.
                  </p>
                  <div className="commission-breakdown">
                    <div className="breakdown-item">
                      <span className="label">Your Commission:</span>
                      <span className="value">1%</span>
                    </div>
                    <div className="breakdown-item">
                      <span className="label">Manager:</span>
                      <span className="value">2.5%</span>
                    </div>
                    <div className="breakdown-item">
                      <span className="label">RentEasy:</span>
                      <span className="value">4%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Listed Properties Preview */}
            {dashboardData.listedProperties.length > 0 && (
              <div className="content-section">
                <div className="section-header">
                  <h3 className="section-title">Your Listings</h3>
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
                        <div className="property-badge">
                          {listing.posterRole === 'tenant' ? '👤 Your Listing' : '🏠 Landlord'}
                        </div>
                        <div className="verification-badge-overlay">
                          {getVerificationBadge(listing)}
                        </div>
                      </div>
                      <div className="property-info">
                        <h4 className="property-title">{listing.title}</h4>
                        <p className="property-price">₦{listing.price?.toLocaleString()}/month</p>
                        <p className="property-commission">
                          You earn: ₦{(listing.price * 0.01).toLocaleString()} (1%)
                        </p>
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
          </div>
        )}

        {/* Listed Properties Tab */}
        {activeTab === 'listed' && (
          <div className="listed-properties">
            <div className="section-header">
              <h3 className="section-title">Your Listed Properties</h3>
              <button 
                className="btn btn-primary"
                onClick={handleListProperty}
              >
                + List Vacating Property
                {!isVerified && <span className="btn-badge">Unverified</span>}
              </button>
            </div>
            
            {/* Verification Notice for Unverified Tenants */}
            {!isVerified && dashboardData.listedProperties.length > 0 && (
              <div className="verification-notice">
                <div className="notice-icon">ℹ️</div>
                <div className="notice-text">
                  <strong>Note:</strong> Your listings show an "Unverified Tenant" badge. 
                  Verify your account to build more trust with potential renters.
                </div>
                <button 
                  className="btn btn-sm btn-outline"
                  onClick={() => navigate('/verify')}
                >
                  Get Verified
                </button>
              </div>
            )}
            
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
                      <div className="verification-status-overlay">
                        {getVerificationBadge(listing)}
                      </div>
                      <div className="commission-badge">
                        Earn 1%: ₦{(listing.price * 0.01).toLocaleString()}
                      </div>
                    </div>
                    <div className="property-card-content">
                      <div className="property-card-header">
                        <h4 className="property-title">{listing.title}</h4>
                        <div className="property-badges">
                          {listing.userVerified || listing.posterVerified ? (
                            <InlineVerifiedBadge type="tenant" compact />
                          ) : (
                            <span className="unverified-badge-inline">
                              ⚠️ Unverified Tenant
                            </span>
                          )}
                          <span className="poster-badge">
                            👤 Your Listing
                          </span>
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
                        <div className="detail">
                          <span className="detail-label">Commission:</span>
                          <span className="detail-value commission">
                            ₦{(listing.price * 0.01).toLocaleString()} (1%)
                          </span>
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
                <p>List your vacating property to earn 1% commission when it gets rented</p>
                <button 
                  className="btn btn-primary"
                  onClick={handleListProperty}
                >
                  List Your Vacating Property
                </button>
                {!isVerified && (
                  <p className="empty-note">
                    <small>You can post as an unverified tenant. Your listing will show an "Unverified Tenant" badge.</small>
                  </p>
                )}
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
                      <div className="poster-verification-badge">
                        {property.posterVerified ? (
                          <InlineVerifiedBadge type={property.posterRole === 'landlord' ? 'landlord' : 'tenant'} compact />
                        ) : (
                          <span className="unverified-poster-badge">
                            ⚠️ {property.posterRole === 'landlord' ? 'Unverified Landlord' : 'Unverified Tenant'}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="property-card-content">
                      <div className="property-card-header">
                        <h4 className="property-title">{property.title}</h4>
                        <div className="poster-info">
                          <span className="poster-name">{property.posterName}</span>
                          <span className={`poster-role ${property.posterRole}`}>
                            {property.posterRole === 'tenant' ? '👤 Outgoing Tenant' : '🏠 Landlord'}
                          </span>
                        </div>
                      </div>
                      <p className="property-price">₦{property.price?.toLocaleString()}/month</p>
                      <p className="property-location">{property.location}</p>
                      <div className="property-note">
                        {property.posterRole === 'tenant' 
                          ? '⚠️ Contact through RentEasy Manager'
                          : '✅ Contact directly'}
                      </div>
                      <div className="property-card-actions">
                        <button 
                          className="btn btn-sm btn-primary"
                          onClick={() => navigate(`/listings/${property.id}`)}
                        >
                          View Details
                        </button>
                        <button 
                          className="btn btn-sm btn-secondary"
                          onClick={() => contactProperty(property)}
                        >
                          {property.posterRole === 'tenant' ? 'Contact Manager' : 'Contact Landlord'}
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

        {/* Referral Tab */}
        {activeTab === 'referral' && (
          <div className="referral-content">
            <div className="content-section">
              <h3 className="section-title">Your Referral Program</h3>
              
              <div className="referral-stats">
                <div className="stat-card large">
                  <div className="stat-value">₦{dashboardData.stats.commissionEarned.toLocaleString()}</div>
                  <div className="stat-label">Total Commission Earned</div>
                </div>
                <div className="stat-card large">
                  <div className="stat-value">1%</div>
                  <div className="stat-label">Commission Rate</div>
                </div>
              </div>
              
              <div className="referral-info">
                <h4>How It Works</h4>
                <div className="how-it-works">
                  <div className="step">
                    <div className="step-number">1</div>
                    <div className="step-content">
                      <h5>Post Your Vacating Property</h5>
                      <p>List properties you're vacating on RentEasy</p>
                      <small className="step-note">
                        {isVerified ? '✅ Verified listings build more trust' : '⚠️ Unverified listings are allowed'}
                      </small>
                    </div>
                  </div>
                  <div className="step">
                    <div className="step-number">2</div>
                    <div className="step-content">
                      <h5>Incoming Tenant Rents It</h5>
                      <p>Someone rents the property through RentEasy manager</p>
                    </div>
                  </div>
                  <div className="step">
                    <div className="step-number">3</div>
                    <div className="step-content">
                      <h5>Earn 1% Commission</h5>
                      <p>You automatically earn 1% of the rental amount</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="referral-share">
                <h4>Share Your Referral Code</h4>
                <div className="referral-code-box">
                  <div className="code-display">
                    <span className="code-label">Your Code:</span>
                    <code className="code-value">{dashboardData.userInfo?.referralCode}</code>
                  </div>
                  <button 
                    className="btn btn-primary"
                    onClick={copyReferralLink}
                  >
                    Copy Referral Link
                  </button>
                </div>
                <p className="help-text">
                  Share with friends who are looking for properties. When they use your code and rent a property, you earn additional rewards!
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default TenantDashboard