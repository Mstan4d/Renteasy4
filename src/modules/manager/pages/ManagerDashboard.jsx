// src/modules/manager/pages/ManagerDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../shared/lib/supabaseClient';
import ManagerKYCStatus from '../components/ManagerKYCStatus';
import ManagerNotificationsPanel from '../components/ManagerNotificationsPanel';
import ManagerQuickActions from '../components/ManagerQuickActions';
import ManagerCommissionSummary from '../components/ManagerCommissionSummary';
import ProximityAlert from '../components/ProximityAlert';
import './ManagerDashboard.css';

const ManagerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [assignedChats, setAssignedChats] = useState([]);
  const [availableListings, setAvailableListings] = useState([]);
  const [verifiedProperties, setVerifiedProperties] = useState([]);
  const [earnings, setEarnings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [kycStatus, setKycStatus] = useState(null);
  const [proximityNotifications, setProximityNotifications] = useState([]);

  // ---------- Check KYC status ----------
  useEffect(() => {
    if (!user || user.role !== 'manager') {
      navigate('/login');
      return;
    }
    fetchKycStatus();
  }, [user, navigate]);

  const fetchKycStatus = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('kyc_status')
      .eq('id', user.id)
      .single();
    if (!error && data) {
      setKycStatus(data.kyc_status || 'not_submitted');
    } else {
      setKycStatus('not_submitted');
    }
  };

  // ---------- Load proximity notifications (real‑time) ----------
  useEffect(() => {
    if (!user) return;

    const fetchInitialNotifications = async () => {
      const { data } = await supabase
        .from('manager_notifications')
        .select('*')
        .eq('manager_id', user.id)
        .eq('accepted', false)
        .gt('expires_at', new Date().toISOString());
      setProximityNotifications(data || []);
    };

    fetchInitialNotifications();

    const channel = supabase
      .channel('manager_alerts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'manager_notifications',
          filter: `manager_id=eq.${user.id}`,
        },
        (payload) => {
          setProximityNotifications((prev) => [payload.new, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // ---------- Load all dashboard data ----------
  const loadDashboardData = async () => {
  setLoading(true);
  try {
    // 1. Get manager's assigned chats
    const { data: chats, error: chatsError } = await supabase
      .from('chats')
      .select('*')
      .or(
        `participant1_id.eq.${user.id},participant2_id.eq.${user.id},monitoring_manager_id.eq.${user.id},manager_assigned.eq.true`
      );
    if (chatsError) throw chatsError;
    setAssignedChats(chats || []);

    // 2. Get verified properties (listings where manager is assigned and verified)
    const { data: verified, error: verifiedError } = await supabase
      .from('listings')
      .select('*')
      .eq('manager_by', user.id)
      .eq('verified', true);
    if (verifiedError) throw verifiedError;
    setVerifiedProperties(verified || []);

    // 3. Calculate total earnings (sum of manager_share from commissions)
    const { data: commissions, error: commError } = await supabase
      .from('commissions')
      .select('manager_share')
      .eq('manager_id', user.id)
      .eq('status', 'paid');
    if (commError) throw commError;
    const total = (commissions || []).reduce((sum, c) => sum + (c.manager_share || 0), 0);
    setEarnings(total);
  } catch (error) {
    console.error('Error loading dashboard data:', error);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    if (user) loadDashboardData();
  }, [user]);

  // ---------- Accept a listing ----------
  const acceptListing = async (listingId) => {
    if (kycStatus !== 'approved') {
      alert('⚠️ KYC Verification Required');
      navigate('/dashboard/manager/kyc');
      return;
    }

    try {
      // Fetch listing details
      const { data: listing, error: listingError } = await supabase
        .from('listings')
        .select('*')
        .eq('id', listingId)
        .single();
      if (listingError) throw listingError;

      // Check if it's an estate firm – they don't need managers
      if (listing.poster_role === 'estate-firm' || listing.poster_role === 'estate_firm') {
        alert('Estate firm listings do not require managers');
        return;
      }

      // Create or update chat
      const { data: existingChat } = await supabase
        .from('chats')
        .select('id')
        .eq('listing_id', listingId)
        .maybeSingle();

      // Inside acceptListing, after fetching listing:
if (!existingChat) {
  // Create new chat with manager assigned
  const chatTemplate = {
    listing_id: listingId,
    participant1_id: listing.poster_role === 'tenant' ? listing.poster_id : null,
    participant2_id: listing.poster_role === 'landlord' ? listing.poster_id : null,
    monitoring_manager_id: user.id,
    state: 'pending_availability',
    manager_assigned: true,
    manager_assigned_at: new Date().toISOString(),
    chat_type: listing.poster_role === 'tenant' ? 'manager_intermediary' : 'monitoring',
  };

  const { error: chatError } = await supabase.from('chats').insert([chatTemplate]);
  if (chatError) throw chatError;

  // Get the newly created chat id
  const { data: newChat } = await supabase
    .from('chats')
    .select('id')
    .eq('listing_id', listingId)
    .single();

  // Add a system message
  await supabase.from('messages').insert([
    {
      chat_id: newChat.id,
      sender_id: '00000000-0000-0000-0000-000000000000',
      content:
        listing.poster_role === 'tenant'
          ? `🏠 Manager ${user.name} assigned. All communication will go through manager.`
          : `👨‍💼 Manager ${user.name} assigned to monitor this conversation.`,
      is_system: true,
    },
  ]);
} else {
  // Update existing chat – assign manager if not already
  const { error: updateError } = await supabase
    .from('chats')
    .update({
      monitoring_manager_id: user.id,
      manager_assigned: true,
      manager_assigned_at: new Date().toISOString(),
    })
    .eq('id', existingChat.id);
  if (updateError) throw updateError;
}
      // Mark notification as accepted
      await supabase
        .from('manager_notifications')
        .update({ accepted: true })
        .eq('listing_id', listingId)
        .eq('manager_id', user.id);

      // Remove from local notifications
      setProximityNotifications((prev) => prev.filter((n) => n.listingId !== listingId));

      alert(`✅ You are now managing "${listing.title}"`);
      loadDashboardData(); // refresh data
    } catch (error) {
      console.error('Error accepting listing:', error);
      alert('Failed to accept listing');
    }
  };

  // ---------- Verify a property ----------
  const verifyProperty = async (listingId) => {
    if (kycStatus !== 'approved') {
      alert('Complete KYC verification first');
      navigate('/dashboard/manager/kyc');
      return;
    }

    try {
      // Check if manager is assigned to this property
      // Replace the check inside verifyProperty:
const { data: chat } = await supabase
  .from('chats')
  .select('monitoring_manager_id, participant1_id, participant2_id')
  .eq('listing_id', listingId)
  .single();

if (
  !chat ||
  (chat.monitoring_manager_id !== user.id &&
   chat.participant1_id !== user.id &&
   chat.participant2_id !== user.id)
) {
  alert('You can only verify properties you are managing');
  return;
}

      // Update listing
      const { error: listingError } = await supabase
        .from('listings')
        .update({
          verified: true,
          verification_date: new Date().toISOString(),
          verified_by: user.id,
          permanent_manager: true,
          managed_by: user.id,
        })
        .eq('id', listingId);
      if (listingError) throw listingError;

      // Add system message to chat
      const { data: chatData } = await supabase
        .from('chats')
        .select('id')
        .eq('listing_id', listingId)
        .single();
      if (chatData) {
        await supabase.from('messages').insert([
          {
            chat_id: chatData.id,
            sender_id: '00000000-0000-0000-0000-000000000000',
            content: `✅ Property verified on‑site by manager ${user.name}. Manager is now permanently assigned.`,
            is_system: true,
          },
        ]);
      }

      alert('✅ Property verified successfully!');
      loadDashboardData();
    } catch (error) {
      console.error('Error verifying property:', error);
      alert('Failed to verify property');
    }
  };

  // ---------- Confirm rental (mark as rented) ----------
  const confirmRental = async (chat) => {
    try {
      // Fetch listing details
      const { data: listing, error: listingError } = await supabase
        .from('listings')
        .select('price, title')
        .eq('id', chat.listing_id)
        .single();
      if (listingError) throw listingError;

      const rentalAmount = listing.price || 0;
      const managerShare = rentalAmount * 0.025;
      const referrerShare = rentalAmount * 0.015;
      const platformShare = rentalAmount * 0.035;

      // Insert commission record
      const { error: commError } = await supabase.from('commissions').insert([
        {
          listing_id: chat.listing_id,
          manager_id: user.id,
          rental_amount: rentalAmount,
          manager_share: managerShare,
          referrer_share: referrerShare,
          platform_share: platformShare,
          status: 'pending', // will be paid after admin confirmation
        },
      ]);
      if (commError) throw commError;

      // Update chat state
      await supabase
        .from('chats')
        .update({ state: 'rented', rented_at: new Date().toISOString() })
        .eq('id', chat.id);

      // Update listing status
      await supabase
        .from('listings')
        .update({ status: 'rented', rented_at: new Date().toISOString() })
        .eq('id', chat.listing_id);

      // Add system message
      await supabase.from('messages').insert([
        {
          chat_id: chat.id,
          sender_id: '00000000-0000-0000-0000-000000000000',
          content: `🏠 PROPERTY RENTED\nRental: ₦${rentalAmount.toLocaleString()}\nYour share: ₦${managerShare.toLocaleString()}`,
          is_system: true,
        },
      ]);

      alert(`✅ Rental confirmed! Your commission: ₦${managerShare.toLocaleString()}`);
      loadDashboardData();
    } catch (error) {
      console.error('Error confirming rental:', error);
      alert('Failed to confirm rental');
    }
  };

  // ---------- UI rendering (same as before, but using state variables) ----------
  if (loading) {
    return <div className="manager-loading">Loading dashboard...</div>;
  }

  return (
    <div className="manager-dashboard">
      {/* Header with KYC status */}
      <ProximityAlert managerId={user?.id} managerState={{}} />
      <header className="manager-header">
        <div className="header-left">
          <h1>👨‍💼 RentEasy Manager Dashboard</h1>
          <p className="manager-subtitle">
            {user?.name} • 2.5% Commission •{' '}
            {kycStatus === 'approved' ? '✅ KYC Verified' : '⚠️ KYC Required'}
          </p>
        </div>
        <ManagerKYCStatus status={kycStatus} />
      </header>

      {/* KYC warning banner */}
      {kycStatus !== 'approved' && (
        <div className="kyc-warning-banner">
          <div className="warning-content">
            <span className="warning-icon">⚠️</span>
            <div>
              <strong>KYC Verification Required</strong>
              <p>You must complete KYC verification before managing properties and earning commissions.</p>
            </div>
            <button className="btn btn-primary" onClick={() => navigate('/dashboard/manager/kyc')}>
              Complete KYC Now
            </button>
          </div>
        </div>
      )}

      {/* Proximity notifications panel */}
      {proximityNotifications.length > 0 && (
        <ManagerNotificationsPanel
          notifications={proximityNotifications}
          onAccept={acceptListing}
          onDismiss={(id) => setProximityNotifications((prev) => prev.filter((n) => n.id !== id))}
        />
      )}

      {/* Tabs */}
      <div className="manager-tabs">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button
          className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          🔔 Notifications ({proximityNotifications.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'chats' ? 'active' : ''}`}
          onClick={() => setActiveTab('chats')}
        >
          💬 My Chats ({assignedChats.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'properties' ? 'active' : ''}`}
          onClick={() => setActiveTab('properties')}
        >
          🏠 Properties ({verifiedProperties.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'earnings' ? 'active' : ''}`}
          onClick={() => setActiveTab('earnings')}
        >
          💰 Earnings (₦{earnings.toLocaleString()})
        </button>
      </div>

      {/* CONTENT AREA */}
      <div className="manager-content">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="overview-container">
            {/* QUICK STATS */}
            <div className="overview-stats">
              <div className="stat-card">
                <div className="stat-icon">💬</div>
                <div className="stat-content">
                  <h3>{assignedChats.length}</h3>
                  <p>Active Chats</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">🏠</div>
                <div className="stat-content">
                  <h3>{verifiedProperties.length}</h3>
                  <p>Verified Properties</p>
                </div>
              </div>
              
              <div className="stat-card earnings">
                <div className="stat-icon">💰</div>
                <div className="stat-content">
                  <h3>₦{earnings.toLocaleString()}</h3>
                  <p>Total Earnings</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">🔔</div>
                <div className="stat-content">
                  <h3>{proximityNotifications.length}</h3>
                  <p>New Listings</p>
                </div>
              </div>
            </div>

            {/* QUICK ACTIONS */}
            <ManagerQuickActions 
              kycStatus={kycStatus}
              onViewNotifications={() => setActiveTab('notifications')}
              onViewChats={() => setActiveTab('chats')}
              onViewProperties={() => setActiveTab('properties')}
              onViewEarnings={() => setActiveTab('earnings')}
              navigate={navigate}
            />

            {/* COMMISSION SUMMARY */}
            <ManagerCommissionSummary earnings={earnings} />

            {/* RECENT ACTIVITY */}
            <div className="recent-activity">
              <h3>Recent Activity</h3>
              <div className="activity-list">
                {assignedChats.slice(0, 3).map(chat => (
                  <div key={chat.id} className="activity-item">
                    <div className="activity-icon">
                      {chat.chatType === 'manager_intermediary' ? '💬' : '👁️'}
                    </div>
                    <div className="activity-details">
                      <strong>{chat.listingTitle}</strong>
                      <p>{chat.chatType === 'manager_intermediary' ? 'Intermediary Chat' : 'Monitoring Chat'}</p>
                      <small>{chat.state.replace('_', ' ')}</small>
                    </div>
                    <button 
                      className="btn btn-sm"
                      onClick={() => navigate(`/dashboard/manager/chat/${chat.id}/monitor`)}
                    >
                      Open
                    </button>
                  </div>
                ))}
                
                {assignedChats.length === 0 && (
                  <div className="empty-activity">
                    <p>No active chats. Accept a listing to get started!</p>
                    <button 
                      className="btn btn-primary"
                      onClick={() => setActiveTab('notifications')}
                    >
                      View Available Listings
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* NOTIFICATIONS TAB */}
        {activeTab === 'notifications' && (
          <div className="notifications-container">
            <div className="section-header">
              <h2>🔔 Proximity Notifications</h2>
              <p>New listings within 1km radius - First to accept gets 2.5% commission</p>
            </div>

            {proximityNotifications.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🔕</div>
                <h3>No new notifications</h3>
                <p>New listings in your area will appear here automatically</p>
              </div>
            ) : (
              <div className="notifications-grid">
                {proximityNotifications.map(notification => (
                  <div key={notification.id} className="notification-card">
                    <div className="notification-header">
                      <span className="notification-type">📍 Proximity Alert</span>
                      <span className="notification-time">15 min remaining</span>
                    </div>
                    
                    <div className="notification-body">
                      <h4>{notification.title}</h4>
                      <div className="notification-details">
                        <div className="detail">
                          <span className="label">Location:</span>
                          <span className="value">{notification.location}</span>
                        </div>
                        <div className="detail">
                          <span className="label">Price:</span>
                          <span className="value">₦{notification.price.toLocaleString()}</span>
                        </div>
                        <div className="detail">
                          <span className="label">Posted by:</span>
                          <span className="value">
                            {notification.posterRole === 'tenant' ? '👤 Outgoing Tenant' : '🏠 Landlord'}
                          </span>
                        </div>
                        <div className="detail">
                          <span className="label">Your Commission:</span>
                          <span className="value highlight">₦{notification.commission.toLocaleString()} (2.5%)</span>
                        </div>
                        <div className="detail">
                          <span className="label">Distance:</span>
                          <span className="value">{notification.distance}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="notification-actions">
                      <button 
                        className="btn btn-accept"
                        onClick={() => acceptListing(notification.listingId)}
                        disabled={kycStatus !== 'approved'}
                      >
                        {kycStatus === 'approved' ? 'Accept Listing' : 'Complete KYC First'}
                      </button>
                      <button 
                        className="btn btn-secondary"
                        onClick={() => navigate(`/listings/${notification.listingId}`)}
                      >
                        View Details
                      </button>
                      <button 
                        className="btn btn-outline"
                        onClick={() => setProximityNotifications(prev => 
                          prev.filter(n => n.id !== notification.id)
                        )}
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CHATS TAB */}
        {activeTab === 'chats' && (
          <div className="chats-container">
            <div className="section-header">
              <h2>💬 My Chats</h2>
              <p>Manage conversations and confirm rentals</p>
            </div>

            {assignedChats.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">💬</div>
                <h3>No active chats</h3>
                <p>Accept a listing from notifications to start managing chats</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => setActiveTab('notifications')}
                >
                  View Available Listings
                </button>
              </div>
            ) : (
              <div className="chats-grid">
                {assignedChats.map(chat => {
                  const listing = verifiedProperties.find(l => l.id === chat.listingId) || 
                                JSON.parse(localStorage.getItem('listings') || '[]')
                                  .find(l => l.id === chat.listingId)
                  
                  return (
                    <div key={chat.id} className="chat-card">
                      <div className="chat-header">
                        <div className="chat-type-indicator">
                          {chat.chatType === 'manager_intermediary' ? (
                            <span className="badge intermediary">💬 Intermediary</span>
                          ) : (
                            <span className="badge monitoring">👁️ Monitoring</span>
                          )}
                        </div>
                        <div className="chat-status">
                          <span className={`status-badge ${chat.state}`}>
                            {chat.state.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                      
                      <div className="chat-body">
                        <h4>{chat.listingTitle}</h4>
                        <div className="chat-details">
                          <div className="detail">
                            <span className="label">Price:</span>
                            <span className="value">₦{chat.listingPrice?.toLocaleString()}</span>
                          </div>
                          <div className="detail">
                            <span className="label">Commission:</span>
                            <span className="value highlight">
                              ₦{(chat.listingPrice * 0.025).toLocaleString()}
                            </span>
                          </div>
                          <div className="detail">
                            <span className="label">Messages:</span>
                            <span className="value">{chat.messages?.length || 0}</span>
                          </div>
                        </div>
                        
                        <div className="chat-participants">
                          <div className="participant">
                            <span className="label">Poster:</span>
                            <span className="value">{chat.posterRole}</span>
                          </div>
                          <div className="participant">
                            <span className="label">Your Role:</span>
                            <span className="value">
                              {chat.chatType === 'manager_intermediary' ? 'Intermediary' : 'Monitor'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="chat-actions">
                        <button 
                          className="btn btn-primary"
                          onClick={() => navigate(`/dashboard/manager/chat/${chat.id}/monitor`)}
                        >
                          {chat.chatType === 'manager_intermediary' ? 'Join Chat' : 'Monitor Chat'}
                        </button>
                        
                        {chat.state === 'active' && !chat.rented && (
                          <button 
                            className="btn btn-success"
                            onClick={() => confirmRental(chat)}
                          >
                            Mark as Rented
                          </button>
                        )}
                        
                        {!listing?.verified && (
                          <button 
                            className="btn btn-warning"
                            onClick={() => verifyProperty(chat.listingId)}
                          >
                            Verify Property
                          </button>
                        )}
                        
                        {chat.rented && (
                          <span className="badge success">✅ Rented</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* PROPERTIES TAB */}
        {activeTab === 'properties' && (
          <div className="properties-container">
            <div className="section-header">
              <h2>🏠 Managed Properties</h2>
              <p>Properties you're managing or have verified</p>
            </div>

            {verifiedProperties.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🏠</div>
                <h3>No verified properties</h3>
                <p>Verify properties you're managing to get permanently assigned</p>
              </div>
            ) : (
              <div className="properties-grid">
                {verifiedProperties.map(property => (
                  <div key={property.id} className="property-card">
                    <div className="property-header">
                      <div className="property-badges">
                        <span className="badge verified">✅ Verified</span>
                        <span className="badge permanent">👨‍💼 Permanent</span>
                      </div>
                      <div className="property-status">
                        {property.status === 'rented' ? (
                          <span className="badge rented">🏠 Rented</span>
                        ) : (
                          <span className="badge available">🔓 Available</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="property-body">
                      <h4>{property.title}</h4>
                      <div className="property-details">
                        <div className="detail">
                          <span className="label">Location:</span>
                          <span className="value">{property.address}</span>
                        </div>
                        <div className="detail">
                          <span className="label">Rent:</span>
                          <span className="value">₦{property.price?.toLocaleString()}/year</span>
                        </div>
                        <div className="detail">
                          <span className="label">Commission:</span>
                          <span className="value highlight">
                            ₦{(property.price * 0.025).toLocaleString()}/rental
                          </span>
                        </div>
                        <div className="detail">
                          <span className="label">Verified on:</span>
                          <span className="value">
                            {new Date(property.verificationDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="property-actions">
                      <button 
                        className="btn btn-primary"
                        onClick={() => navigate(`/listings/${property.id}`)}
                      >
                        View Listing
                      </button>
                      
                      <button 
                        className="btn btn-secondary"
                        onClick={() => {
                          const chat = assignedChats.find(c => c.listingId === property.id)
                          if (chat) navigate(`/dashboard/manager/chat/${chat.id}/monitor`)
                        }}
                      >
                        View Chat
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* EARNINGS TAB */}
        {activeTab === 'earnings' && (
          <div className="earnings-container">
            <div className="section-header">
              <h2>💰 Your Earnings</h2>
              <p>2.5% commission on successful rentals</p>
            </div>

            <div className="earnings-summary">
              <div className="summary-card total">
                <h4>Total Earnings</h4>
                <h2>₦{earnings.toLocaleString()}</h2>
                <p>Lifetime commission earnings</p>
              </div>
              
              <div className="summary-card pending">
                <h4>Pending Withdrawal</h4>
                <h2>₦{(earnings * 0.8).toLocaleString()}</h2>
                <p>Available for withdrawal</p>
              </div>
              
              <div className="summary-card month">
                <h4>This Month</h4>
                <h2>₦{(earnings * 0.1).toLocaleString()}</h2>
                <p>Commission earned this month</p>
              </div>
            </div>

            <div className="commission-breakdown-card">
              <h3>Commission Breakdown</h3>
              <div className="breakdown-bars">
                <div className="breakdown-bar manager">
                  <div className="bar-label">
                    <span>Manager (You)</span>
                    <span>2.5%</span>
                  </div>
                  <div className="bar-fill" style={{ width: '33%' }}></div>
                </div>
                
                <div className="breakdown-bar referrer">
                  <div className="bar-label">
                    <span>Referrer</span>
                    <span>1.5%</span>
                  </div>
                  <div className="bar-fill" style={{ width: '13%' }}></div>
                </div>
                
                <div className="breakdown-bar renteasy">
                  <div className="bar-label">
                    <span>RentEasy Platform</span>
                    <span>3.5%</span>
                  </div>
                  <div className="bar-fill" style={{ width: '54%' }}></div>
                </div>
                
                <div className="breakdown-bar total">
                  <div className="bar-label">
                    <span>Total Commission</span>
                    <span>7.5%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="withdrawal-section">
              <h3>Withdraw Earnings</h3>
              <div className="withdrawal-card">
                <div className="withdrawal-info">
                  <div className="info-item">
                    <span className="label">Available Balance:</span>
                    <span className="value">₦{earnings.toLocaleString()}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Minimum Withdrawal:</span>
                    <span className="value">₦5,000</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Processing Time:</span>
                    <span className="value">24-48 hours</span>
                  </div>
                </div>
                
                <div className="withdrawal-actions">
                  <button 
                    className="btn btn-primary"
                    onClick={() => alert('Withdrawal feature coming soon!')}
                  >
                    Request Withdrawal
                  </button>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => navigate('/dashboard/manager/payments')}
                  >
                    View Payment History
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ManagerDashboard