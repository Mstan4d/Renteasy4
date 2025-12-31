// src/modules/manager/pages/ManagerDashboard.jsx - CORRECTED WORKFLOW
import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../../shared/context/AuthContext";
import './ManagerDashboard.css';

// Simple toast replacement
const toast = {
  success: (message) => {
    console.log("✅ Success:", message);
    alert(`✅ ${message}`);
  },
  error: (message) => {
    console.error("❌ Error:", message);
    alert(`❌ ${message}`);
  }
};


const ManagerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State for manager's chosen areas
  const [myAreas, setMyAreas] = useState([]);
  const [availableAreas, setAvailableAreas] = useState([]);
  const [showAreaSetup, setShowAreaSetup] = useState(false);
  
  // State for proximity notifications
  const [proximityNotifications, setProximityNotifications] = useState([]);
  const [hasNewNotifications, setHasNewNotifications] = useState(false);
  
  // State for property management
  const [listings, setListings] = useState([]);
  const [activeListings, setActiveListings] = useState([]);
  const [unverifiedProperties, setUnverifiedProperties] = useState([]);
  
  // State for commission tracking
  const [commissionStats, setCommissionStats] = useState({
    totalCommission: 0,
    pendingCommission: 0,
    paidCommission: 0
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');



  // =========================
  // AREA SETUP FUNCTIONS
  // =========================
  
  const loadManagerAreas = () => {
    try {
      const managers = JSON.parse(localStorage.getItem('managers') || '[]');
      const currentManager = managers.find(m => m.email === user?.email);
      
      if (currentManager?.areas) {
        setMyAreas(currentManager.areas);
      } else {
        setShowAreaSetup(true);
      }
      
      // Load available areas (Nigerian states & LGAs)
      loadAvailableAreas();
    } catch (error) {
      console.error('Error loading manager areas:', error);
    }
  };
  
  const loadAvailableAreas = () => {
    // Nigerian states with some sample LGAs
    const nigerianStates = [
      { 
        state: "Lagos", 
        lgas: ["Ikeja", "Lagos Island", "Lagos Mainland", "Surulere", "Mushin", "Apapa", "Eti-Osa", "Badagry", "Ojo", "Ikorodu", "Kosofe", "Shomolu", "Amuwo-Odofin", "Ajeromi-Ifelodun", "Oshodi-Isolo", "Alimosho", "Ifako-Ijaiye", "Agege"]
      },
      { 
        state: "Abuja", 
        lgas: ["Abuja Municipal", "Bwari", "Gwagwalada", "Kuje", "Kwali", "Abaji"]
      },
      { 
        state: "Rivers", 
        lgas: ["Port Harcourt", "Obio-Akpor", "Ikwerre", "Etche", "Okrika", "Oyigbo", "Eleme", "Tai", "Gokana", "Khana", "Ahoada East", "Ahoada West", "Ogba-Egbema-Ndoni", "Emohua", "Degema", "Asari-Toru", "Akuku-Toru", "Opobo-Nkoro", "Andoni", "Bonny"]
      },
      { 
        state: "Oyo", 
        lgas: ["Ibadan North", "Ibadan North-East", "Ibadan North-West", "Ibadan South-East", "Ibadan South-West", "Egbeda", "Ona Ara", "Oluyole", "Akinyele", "Lagelu", "Ibarapa Central", "Ibarapa East", "Ibarapa North", "Ido", "Ogo Oluwa", "Surulere", "Ogbomosho North", "Ogbomosho South", "Orire", "Olorunsogo", "Irepo", "Orelope", "Saki East", "Saki West", "Atisbo", "Itesiwaju", "Iwajowa", "Kajola", "Iseyin", "Afijio", "Atiba"]
      }
    ];
    
    setAvailableAreas(nigerianStates);
  };
  
  const saveManagerAreas = (areas) => {
    try {
      const managers = JSON.parse(localStorage.getItem('managers') || '[]');
      const managerIndex = managers.findIndex(m => m.email === user?.email);
      
      if (managerIndex !== -1) {
        managers[managerIndex] = {
          ...managers[managerIndex],
          areas: areas,
          updatedAt: new Date().toISOString()
        };
      } else {
        // Create new manager record
        managers.push({
          id: user?.id || Date.now().toString(),
          name: user?.name,
          email: user?.email,
          phone: user?.phone || '',
          areas: areas,
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
      
      localStorage.setItem('managers', JSON.stringify(managers));
      setMyAreas(areas);
      setShowAreaSetup(false);
      toast.success('Areas saved successfully!');
      
      // Refresh data
      loadManagerData();
      
    } catch (error) {
      console.error('Error saving areas:', error);
      toast.error('Failed to save areas');
    }
  };
  
  const addArea = (state, lga) => {
    const newArea = { state, lga };
    if (!myAreas.some(area => area.state === state && area.lga === lga)) {
      saveManagerAreas([...myAreas, newArea]);
    }
  };
  
  const removeArea = (index) => {
    const newAreas = [...myAreas];
    newAreas.splice(index, 1);
    saveManagerAreas(newAreas);
  };

  // =========================
  // PROXIMITY NOTIFICATION SYSTEM
  // =========================
  
  const checkForNewNotifications = useCallback(() => {
    try {
      const allChats = JSON.parse(localStorage.getItem('chats') || '[]');
      
      if (myAreas.length === 0) return;
      
      // Find new chats in manager's chosen areas
      const newNotifications = allChats.filter(chat => {
        if (!chat.propertyState || !chat.propertyLGA) return false;
        
        // Check if chat is in manager's chosen areas
        const chatInMyArea = myAreas.some(area => 
          area.state === chat.propertyState && 
          area.lga === chat.propertyLGA
        );
        
        // Check if chat has the trigger message
        const hasTriggerMessage = chat.messages?.some(msg => 
          msg.text?.toLowerCase().includes('is this house available')
        );
        
        // Check if not already claimed by any manager
        return chatInMyArea && hasTriggerMessage && !chat.managerId;
      });
      
      if (newNotifications.length > 0) {
        setProximityNotifications(newNotifications);
        setHasNewNotifications(true);
        
        // Show notification for new alerts
        if (newNotifications.length > proximityNotifications.length) {
          toast.success(`New listing available in ${newNotifications[0].propertyState}!`);
        }
      }
      
      setProximityNotifications(prev => {
        if (JSON.stringify(prev) !== JSON.stringify(newNotifications)) {
          return newNotifications;
        }
        return prev;
      });
      
    } catch (error) {
      console.error('Error checking notifications:', error);
    }
  }, [myAreas, proximityNotifications.length]);

  // =========================
  // LOAD MANAGER DATA
  // =========================
  
  const loadManagerData = async () => {
    try {
      setIsLoading(true);
      
      // 1. Load manager's chosen areas
      loadManagerAreas();
      
      // 2. Load all listings
      const allListings = JSON.parse(localStorage.getItem('listings') || '[]');
      
      // 3. Filter listings in manager's areas
      const areaListings = allListings.filter(listing => {
        return myAreas.some(area => 
          area.state === listing.state && 
          area.lga === listing.lga
        );
      });
      setListings(areaListings);
      
      // 4. Load listings managed by this manager
      const managedListings = areaListings.filter(l => l.managerId === user?.id);
      setActiveListings(managedListings);
      
      // 5. Load unverified properties in manager's areas
      const unverified = areaListings.filter(l => !l.verified && !l.rejected);
      setUnverifiedProperties(unverified);
      
      // 6. Calculate commission
      calculateCommission(managedListings);
      
    } catch (error) {
      console.error('Error loading manager data:', error);
      toast.error("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };
  
  const calculateCommission = (managedListings) => {
    const commissionRate = 0.025; // 2.5%
    
    const totalCommission = managedListings.reduce((sum, listing) => {
      const price = parseFloat(listing.price) || 0;
      return sum + (price * commissionRate);
    }, 0);
    
    // For now, assume 70% pending, 30% paid (in real app, this would come from transactions)
    const pendingCommission = totalCommission * 0.7;
    const paidCommission = totalCommission * 0.3;
    
    setCommissionStats({
      totalCommission,
      pendingCommission,
      paidCommission
    });
  };

  // =========================
  // CORE WORKFLOW FUNCTIONS
  // =========================
  
  const acceptProximityNotification = (notification) => {
    try {
      // Update chat with manager assignment
      const allChats = JSON.parse(localStorage.getItem('chats') || '[]');
      const updatedChats = allChats.map(chat => 
        chat.id === notification.id ? {
          ...chat,
          managerId: user?.id,
          managerName: user?.name,
          managerAssigned: true,
          managerAssignedAt: new Date().toISOString()
        } : chat
      );
      localStorage.setItem('chats', JSON.stringify(updatedChats));
      
      // Update listing if exists
      const allListings = JSON.parse(localStorage.getItem('listings') || '[]');
      const listingToUpdate = allListings.find(l => l.id === notification.propertyId);
      
      if (listingToUpdate) {
        const updatedListings = allListings.map(listing => 
          listing.id === notification.propertyId ? {
            ...listing,
            isManaged: true,
            managerId: user?.id,
            managedBy: user?.name,
            managedAt: new Date().toISOString()
          } : listing
        );
        localStorage.setItem('listings', JSON.stringify(updatedListings));
      }
      
      // Record manager activity
      const activities = JSON.parse(localStorage.getItem('managerActivities') || '[]');
      activities.unshift({
        id: Date.now(),
        managerId: user?.id,
        action: `Accepted to manage property in ${notification.propertyState}`,
        type: 'listing_acceptance',
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('managerActivities', JSON.stringify(activities));
      
      // Remove from notifications
      setProximityNotifications(prev => 
        prev.filter(n => n.id !== notification.id)
      );
      
      toast.success(`You are now managing this listing! You'll earn 2.5% commission.`);
      loadManagerData();
      
    } catch (error) {
      console.error('Error accepting notification:', error);
      toast.error('Failed to accept listing');
    }
  };
  
  const verifyProperty = (propertyId) => {
    try {
      const allListings = JSON.parse(localStorage.getItem('listings') || '[]');
      const propertyToVerify = allListings.find(l => l.id === propertyId);
      
      if (!propertyToVerify) {
        toast.error('Property not found');
        return;
      }
      
      // Verify property
      const updatedListings = allListings.map(listing => 
        listing.id === propertyId ? {
          ...listing,
          managerVerified: true,
          managerVerifiedBy: user?.name,
          managerVerifiedAt: new Date().toISOString(),
          isManaged: true,
          managerId: user?.id,
          status: 'verified'
        } : listing
      );
      
      localStorage.setItem('listings', JSON.stringify(updatedListings));
      
      // Record verification activity
      const activities = JSON.parse(localStorage.getItem('managerActivities') || '[]');
      activities.unshift({
        id: Date.now(),
        managerId: user?.id,
        action: `Verified property: ${propertyToVerify.title}`,
        type: 'verification',
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('managerActivities', JSON.stringify(activities));
      
      // Notify admin (optional - for admin dashboard)
      const adminNotifications = JSON.parse(localStorage.getItem('adminNotifications') || '[]');
      adminNotifications.unshift({
        id: Date.now(),
        title: 'Property Verified',
        message: `${user?.name} verified property: ${propertyToVerify.title}`,
        type: 'verification',
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('adminNotifications', JSON.stringify(adminNotifications));
      
      toast.success('Property verified successfully!');
      loadManagerData();
      
    } catch (error) {
      console.error('Error verifying property:', error);
      toast.error('Failed to verify property');
    }
  };

  // =========================
  // HELPER FUNCTIONS
  // =========================
  
  const formatCurrency = (amount) => {
    return `₦${parseFloat(amount || 0).toLocaleString()}`;
  };
  
  const getTimeAgo = (dateString) => {
    if (!dateString) return 'Just now';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  // =========================
  // EFFECTS
  // =========================
  
    // Add this check at the beginning of your ManagerDashboard useEffect
useEffect(() => {
  if (user?.role !== 'manager') {
    navigate('/login');
    return;
  }

  // Check verification status
  const managers = JSON.parse(localStorage.getItem('managers') || '[]');
  const currentManager = managers.find(m => m.email === user?.email);
  
  if (!currentManager || currentManager.verificationStatus !== 'approved') {
    navigate('/dashboard/manager/verification');
    return;
  }

  // Only load data if verified
  loadManagerData();
  loadChatSystemData();
  
}, [user, navigate]);
  
  useEffect(() => {
    if (myAreas.length === 0) return;
    
    const interval = setInterval(() => {
      checkForNewNotifications();
    }, 5000);
    
    checkForNewNotifications();
    
    return () => clearInterval(interval);
  }, [myAreas, checkForNewNotifications]);

  // =========================
  // RENDER LOADING STATE
  // =========================
  
  if (isLoading) {
    return (
      <div className="manager-dashboard loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  // =========================
  // RENDER AREA SETUP MODAL
  // =========================
  
  if (showAreaSetup) {
    return (
      <div className="manager-dashboard area-setup">
        <div className="setup-container">
          <div className="setup-header">
            <h1>📍 Set Your Working Areas</h1>
            <p>Choose where you want to receive property notifications</p>
          </div>
          
          <div className="setup-content">
            <div className="current-areas">
              <h3>Your Selected Areas:</h3>
              {myAreas.length === 0 ? (
                <p className="empty-message">No areas selected yet</p>
              ) : (
                <div className="areas-list">
                  {myAreas.map((area, index) => (
                    <div key={index} className="area-tag">
                      <span>{area.state} - {area.lga}</span>
                      <button onClick={() => removeArea(index)}>×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="available-areas">
              <h3>Available Areas:</h3>
              <div className="states-grid">
                {availableAreas.map((stateData) => (
                  <div key={stateData.state} className="state-section">
                    <h4>{stateData.state}</h4>
                    <div className="lgas-grid">
                      {stateData.lgas.map((lga) => {
                        const isSelected = myAreas.some(area => 
                          area.state === stateData.state && area.lga === lga
                        );
                        return (
                          <button
                            key={lga}
                            className={`lga-btn ${isSelected ? 'selected' : ''}`}
                            onClick={() => {
                              if (isSelected) {
                                removeArea(myAreas.findIndex(area => 
                                  area.state === stateData.state && area.lga === lga
                                ));
                              } else {
                                addArea(stateData.state, lga);
                              }
                            }}
                          >
                            {lga} {isSelected && '✓'}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="setup-actions">
            <button 
              className="btn-primary"
              onClick={() => {
                if (myAreas.length === 0) {
                  toast.error('Please select at least one area');
                } else {
                  setShowAreaSetup(false);
                  loadManagerData();
                }
              }}
            >
              Save Areas & Continue
            </button>
            <button 
              className="btn-outline"
              onClick={() => {
                // Allow skipping for now
                setShowAreaSetup(false);
              }}
            >
              Skip for Now
            </button>
          </div>
          
          <div className="setup-info">
            <h4>How it works:</h4>
            <ul>
              <li>✅ Select areas where you live or want to work</li>
              <li>🔔 You'll receive notifications when tenants ask "Is this house available?" in your areas</li>
              <li>🏃 Be the first to accept to earn 2.5% commission</li>
              <li>🏠 You can also verify properties in your areas</li>
              <li>⚙️ You can update your areas anytime in profile settings</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // =========================
  // RENDER MAIN DASHBOARD
  // =========================
  
  return (
    <div className="manager-dashboard">
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div className="header-left">
          <h1>🏢 Manager Dashboard</h1>
          <p>Earn 2.5% commission by managing properties in your chosen areas</p>
        </div>
        
        <div className="header-right">
          <div className="notification-bell">
            <button 
              className={`notification-btn ${hasNewNotifications ? 'has-notifications' : ''}`}
              onClick={() => setActiveTab('notifications')}
              title="Notifications"
            >
              🔔 {hasNewNotifications && <span className="notification-dot"></span>}
            </button>
            <span className="notification-count">{proximityNotifications.length}</span>
          </div>
          
          <div className="manager-profile">
            <div className="manager-avatar">
              {user?.name?.charAt(0)?.toUpperCase() || 'M'}
            </div>
            <div className="manager-info">
              <strong>{user?.name || 'Manager'}</strong>
              <small>{user?.email}</small>
              <div className="assigned-areas-summary">
                <span>Areas: {myAreas.length}</span>
                <button 
                  className="btn-edit-areas"
                  onClick={() => setShowAreaSetup(true)}
                >
                  Edit Areas
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Navigation Tabs */}
      <div className="dashboard-tabs">
        <button 
          className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          📊 Dashboard
        </button>
        <button 
          className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          🔔 Proximity Alerts ({proximityNotifications.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'properties' ? 'active' : ''}`}
          onClick={() => setActiveTab('properties')}
        >
          🏠 Properties ({listings.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'commission' ? 'active' : ''}`}
          onClick={() => setActiveTab('commission')}
        >
          💰 Commission
        </button>
      </div>

      {/* Dashboard Content based on active tab */}
      {activeTab === 'dashboard' && (
        <>
          {/* Stats Overview */}
          <div className="stats-overview">
            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: '#e3f2fd' }}>
                📍
              </div>
              <div className="stat-content">
                <h3>{myAreas.length}</h3>
                <p>Working Areas</p>
                <small>States/LGAs you cover</small>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: '#fff3e0' }}>
                🔔
              </div>
              <div className="stat-content">
                <h3>{proximityNotifications.length}</h3>
                <p>New Alerts</p>
                <small>Available listings</small>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: '#e8f5e9' }}>
                🏢
              </div>
              <div className="stat-content">
                <h3>{activeListings.length}</h3>
                <p>Managed Properties</p>
                <small>Under your management</small>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: '#f3e5f5' }}>
                🔍
              </div>
              <div className="stat-content">
                <h3>{unverifiedProperties.length}</h3>
                <p>To Verify</p>
                <small>Properties needing verification</small>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: '#fff8e1' }}>
                💰
              </div>
              <div className="stat-content">
                <h3>{formatCurrency(commissionStats.totalCommission)}</h3>
                <p>Potential Commission</p>
                <small>2.5% of managed properties</small>
              </div>
            </div>
          </div>

          {/* Quick Overview Sections */}
          <div className="overview-grid">
            {/* Your Working Areas */}
            <div className="overview-card">
              <div className="card-header">
                <h3>📍 Your Working Areas</h3>
                <button 
                  className="btn-small"
                  onClick={() => setShowAreaSetup(true)}
                >
                  Edit
                </button>
              </div>
              <div className="card-content">
                {myAreas.length === 0 ? (
                  <div className="empty-state-small">
                    <p>No areas selected</p>
                    <button 
                      className="btn-small btn-primary"
                      onClick={() => setShowAreaSetup(true)}
                    >
                      Add Areas
                    </button>
                  </div>
                ) : (
                  <div className="areas-list-compact">
                    {myAreas.slice(0, 5).map((area, index) => (
                      <div key={index} className="area-item">
                        <span className="area-state">{area.state}</span>
                        <span className="area-lga">{area.lga}</span>
                      </div>
                    ))}
                    {myAreas.length > 5 && (
                      <div className="more-areas">
                        +{myAreas.length - 5} more areas
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Proximity Alerts */}
            <div className="overview-card">
              <div className="card-header">
                <h3>🔔 New Listings Available</h3>
                <span className="badge">{proximityNotifications.length}</span>
              </div>
              <div className="card-content">
                {proximityNotifications.length === 0 ? (
                  <p className="empty-message">No new listings in your areas</p>
                ) : (
                  <div className="alerts-list">
                    {proximityNotifications.slice(0, 3).map(alert => (
                      <div key={alert.id} className="alert-item">
                        <div className="alert-icon">🏠</div>
                        <div className="alert-details">
                          <strong>New listing inquiry</strong>
                          <small>{alert.propertyState}, {alert.propertyLGA}</small>
                          <span className="alert-time">{getTimeAgo(alert.createdAt)}</span>
                        </div>
                        <button 
                          className="btn-small btn-accept"
                          onClick={() => acceptProximityNotification(alert)}
                        >
                          Accept (2.5%)
                        </button>
                      </div>
                    ))}
                    {proximityNotifications.length > 3 && (
                      <button 
                        className="btn-view-all"
                        onClick={() => setActiveTab('notifications')}
                      >
                        View all {proximityNotifications.length} alerts →
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Properties to Verify */}
            <div className="overview-card">
              <div className="card-header">
                <h3>🔍 Properties to Verify</h3>
                <span className="badge">{unverifiedProperties.length}</span>
              </div>
              <div className="card-content">
                {unverifiedProperties.length === 0 ? (
                  <p className="empty-message">All properties verified</p>
                ) : (
                  <div className="properties-list">
                    {unverifiedProperties.slice(0, 3).map(property => (
                      <div key={property.id} className="property-item">
                        <div className="property-icon">🏠</div>
                        <div className="property-details">
                          <strong>{property.title}</strong>
                          <small>{property.address}, {property.state}</small>
                          <span className="property-price">{formatCurrency(property.price)}/year</span>
                        </div>
                        <button 
                          className="btn-small btn-verify"
                          onClick={() => verifyProperty(property.id)}
                        >
                          Verify
                        </button>
                      </div>
                    ))}
                    {unverifiedProperties.length > 3 && (
                      <button 
                        className="btn-view-all"
                        onClick={() => setActiveTab('properties')}
                      >
                        View all {unverifiedProperties.length} properties →
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Commission Overview */}
            <div className="overview-card">
              <div className="card-header">
                <h3>💰 Your Earnings</h3>
                <span className="badge">2.5%</span>
              </div>
              <div className="card-content">
                <div className="commission-summary">
                  <div className="commission-item">
                    <span className="commission-label">Total Potential:</span>
                    <span className="commission-value">
                      {formatCurrency(commissionStats.totalCommission)}
                    </span>
                  </div>
                  <div className="commission-item">
                    <span className="commission-label">Pending Payout:</span>
                    <span className="commission-value pending">
                      {formatCurrency(commissionStats.pendingCommission)}
                    </span>
                  </div>
                  <div className="commission-item">
                    <span className="commission-label">Already Paid:</span>
                    <span className="commission-value paid">
                      {formatCurrency(commissionStats.paidCommission)}
                    </span>
                  </div>
                </div>
                
                <button 
                  className="btn-view-all"
                  onClick={() => setActiveTab('commission')}
                >
                  View detailed commission report →
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="notifications-tab">
          <div className="tab-header">
            <h2>🔔 Available Listings in Your Areas</h2>
            <p>Be the first to accept these opportunities</p>
          </div>
          
          {proximityNotifications.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔔</div>
              <h3>No new notifications</h3>
              <p>You'll get alerts when tenants inquire about properties in your areas</p>
            </div>
          ) : (
            <div className="notifications-list">
              {proximityNotifications.map(notification => (
                <div key={notification.id} className="notification-card">
                  <div className="notification-header">
                    <div className="notification-icon">🏠</div>
                    <div className="notification-info">
                      <h4>New Listing Available</h4>
                      <div className="notification-meta">
                        <span className="location">
                          📍 {notification.propertyState}, {notification.propertyLGA}
                        </span>
                        <span className="time">{getTimeAgo(notification.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="notification-body">
                    <p>
                      A tenant has asked: <strong>"Is this house available?"</strong>
                    </p>
                    {notification.propertyTitle && (
                      <p>Property: {notification.propertyTitle}</p>
                    )}
                    <p className="commission-info">
                      💰 <strong>You'll earn 2.5% commission</strong> if you accept this listing
                    </p>
                  </div>
                  
                  <div className="notification-actions">
                    <button 
                      className="btn-accept"
                      onClick={() => acceptProximityNotification(notification)}
                    >
                      ✅ Accept to Manage (Earn 2.5%)
                    </button>
                    <button 
                      className="btn-view"
                      onClick={() => navigate(`/listings/${notification.propertyId}`)}
                    >
                      👁️ View Property Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Properties Tab */}
      {activeTab === 'properties' && (
        <div className="properties-tab">
          <div className="tab-header">
            <h2>🏠 Properties in Your Areas</h2>
            <div className="property-filters">
              <button 
                className={`filter-btn ${activeTab === 'properties' ? 'active' : ''}`}
                onClick={() => setActiveTab('properties')}
              >
                All ({listings.length})
              </button>
              <button 
                className={`filter-btn ${false ? 'active' : ''}`}
                onClick={() => {/* Filter unverified */}}
              >
                Unverified ({unverifiedProperties.length})
              </button>
              <button 
                className={`filter-btn ${false ? 'active' : ''}`}
                onClick={() => {/* Filter managed */}}
              >
                Managed ({activeListings.length})
              </button>
            </div>
          </div>
          
          <div className="properties-grid">
            {listings.map(listing => (
              <div key={listing.id} className="property-card">
                <div className="property-image">
                  {listing.images?.[0] ? (
                    <img src={listing.images[0]} alt={listing.title} />
                  ) : (
                    <div className="image-placeholder">🏠</div>
                  )}
                  {listing.verified && (
                    <span className="verified-badge">✅ Verified</span>
                  )}
                  {listing.managerId === user?.id && (
                    <span className="managed-badge">🏢 You Manage</span>
                  )}
                </div>
                
                <div className="property-details">
                  <h4>{listing.title}</h4>
                  <p className="property-location">
                    📍 {listing.address}, {listing.state} - {listing.lga}
                  </p>
                  <p className="property-price">
                    {formatCurrency(listing.price)}/year
                  </p>
                  
                  <div className="property-status">
                    <span className={`status-badge ${listing.verified ? 'verified' : 'pending'}`}>
                      {listing.verified ? 'Verified' : 'Pending Verification'}
                    </span>
                    {listing.managerId === user?.id && (
                      <span className="status-badge managed">
                        You manage
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="property-actions">
                  {!listing.verified && !listing.rejected && listing.managerId !== user?.id && (
                    <button 
                      className="btn-verify"
                      onClick={() => verifyProperty(listing.id)}
                    >
                      🔍 Verify Property
                    </button>
                  )}
                  
                  <button 
                    className="btn-view"
                    onClick={() => navigate(`/listings/${listing.id}`)}
                  >
                    👁️ View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Commission Tab */}
      {activeTab === 'commission' && (
        <div className="commission-tab">
          <div className="tab-header">
            <h2>💰 Your Commission Dashboard</h2>
            <p>Track your 2.5% commission from managed properties</p>
          </div>
          
          <div className="commission-overview">
            <div className="commission-stats">
              <div className="commission-stat-card total">
                <h4>Total Potential Commission</h4>
                <h2>{formatCurrency(commissionStats.totalCommission)}</h2>
                <p>From all managed properties</p>
              </div>
              
              <div className="commission-stat-card pending">
                <h4>Pending Payout</h4>
                <h2>{formatCurrency(commissionStats.pendingCommission)}</h2>
                <p>Awaiting payment confirmation</p>
              </div>
              
              <div className="commission-stat-card paid">
                <h4>Already Paid</h4>
                <h2>{formatCurrency(commissionStats.paidCommission)}</h2>
                <p>Transferred to your account</p>
              </div>
            </div>
            
            <div className="commission-breakdown">
              <h3>Commission Breakdown (7.5% Total)</h3>
              <div className="breakdown-bars">
                <div className="breakdown-bar manager">
                  <div className="bar-label">
                    <span>Manager (You)</span>
                    <span>2.5%</span>
                  </div>
                  <div className="bar-fill" style={{ width: '33%' }}></div>
                </div>
                
                <div className="breakdown-bar renteasy">
                  <div className="bar-label">
                    <span>RentEasy Platform</span>
                    <span>4%</span>
                  </div>
                  <div className="bar-fill" style={{ width: '53%' }}></div>
                </div>
                
                <div className="breakdown-bar referrer">
                  <div className="bar-label">
                    <span>Referrer (if any)</span>
                    <span>1%</span>
                  </div>
                  <div className="bar-fill" style={{ width: '13%' }}></div>
                </div>
              </div>
            </div>
            
            <div className="commission-info">
              <h4>💡 How Commission Works:</h4>
              <ol>
                <li>You receive notification when tenant asks "Is this house available?" in your area</li>
                <li>First manager to accept gets the listing management rights</li>
                <li>You monitor landlord-tenant conversations</li>
                <li>When payment is made, you earn 2.5% commission</li>
                <li>Commission is paid out monthly</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions Footer */}
      <div className="quick-actions-footer">
        <button className="quick-action" onClick={() => setShowAreaSetup(true)}>
          📍 Edit Areas
        </button>
        <button className="quick-action" onClick={() => navigate('/dashboard/messages')}>
          💬 Messages
        </button>
        <button className="quick-action" onClick={() => navigate('/marketplace')}>
          🛒 Marketplace
        </button>
      </div>
    </div>
  );
};

export default ManagerDashboard;