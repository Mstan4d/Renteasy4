// src/modules/manager/pages/ManagerDashboard.jsx (updated with correct stats)
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../shared/lib/supabaseClient';
import ManagerKYCStatus from '../components/ManagerKYCStatus';
import ManagerNotificationsPanel from '../components/ManagerNotificationsPanel';
import ManagerQuickActions from '../components/ManagerQuickActions';
import ManagerCommissionSummary from '../components/ManagerCommissionSummary';
import ProximityAlert from '../components/ProximityAlert';
import RentEasyLoader from '../../../shared/components/RentEasyLoader';
import './ManagerDashboard.css';

const ManagerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userLocationSet, setUserLocationSet] = useState(false);
  const [assignedChats, setAssignedChats] = useState([]);
  const [availableListings, setAvailableListings] = useState([]);
  const [verifiedProperties, setVerifiedProperties] = useState([]);
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [earnings, setEarnings] = useState(0);
  const [pendingEarnings, setPendingEarnings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [kycStatus, setKycStatus] = useState(null);
  const [proximityNotifications, setProximityNotifications] = useState([]);
  const [stats, setStats] = useState({
    activeChats: 0,
    pendingVerifications: 0,
    verifiedProperties: 0,
    totalEarnings: 0,
    pendingEarnings: 0,
    completedRentals: 0
  });

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

  // ---------- Load proximity notifications ----------
  
useEffect(() => {
  if (!user) return;

  const fetchInitialNotifications = async () => {
    try {
      // 1. Get manager's location and radius
      const { data: managerProfile, error: profileError } = await supabase
        .from('profiles')
        .select('lat, lng, notification_radius_km')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching manager profile:', profileError);
        return;
      }

      const locationSet = !!(managerProfile?.lat && managerProfile?.lng);
      setUserLocationSet(locationSet);
      if (!locationSet) {
        console.warn('Manager location not set. Please set your location in profile.');
        return;
      }

      // 2. Fetch available listings (not assigned, not estate-firm, with coordinates)
      const { data: availableListings, error: listingsError } = await supabase
        .from('listings')
        .select('*')
        .neq('poster_role', 'estate-firm')
        .is('assigned_manager_id', null)
        .not('lat', 'is', null)
        .not('lng', 'is', null)
        .eq('status', 'active'); // Only active listings

      if (listingsError) {
        console.error('Error fetching listings:', listingsError);
        return;
      }

      // 3. Calculate distance and filter
      const radiusKm = managerProfile.notification_radius_km || 5;
      const withDistance = (availableListings || []).map(listing => {
        const distance = calculateDistance(
          managerProfile.lat,
          managerProfile.lng,
          listing.lat,
          listing.lng
        );
        return {
          id: listing.id,
          listingId: listing.id,
          title: listing.title,
          price: listing.price,
          location: `${listing.city || ''} ${listing.state || ''}`,
          posterRole: listing.poster_role,
          commission: (listing.price || 0) * 0.025,
          distance: `${distance.toFixed(1)}km`,
          expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
          accepted: false
        };
      }).filter(l => parseFloat(l.distance) <= radiusKm);

      setProximityNotifications(withDistance);
    } catch (error) {
      console.error('Error in fetchInitialNotifications:', error);
    }
  };

  fetchInitialNotifications();

  // Real‑time subscription for new listings
  const channel = supabase
    .channel('new-listings')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'listings'
      },
      async (payload) => {
        const newListing = payload.new;
        if (newListing.poster_role === 'estate-firm') return;
        
        // Re‑fetch manager location (could have changed)
        const { data: managerProfile } = await supabase
          .from('profiles')
          .select('lat, lng, notification_radius_km')
          .eq('id', user.id)
          .single();
        
        if (!managerProfile?.lat || !managerProfile?.lng) return;
        
        if (newListing.lat && newListing.lng) {
          const distance = calculateDistance(
            managerProfile.lat,
            managerProfile.lng,
            newListing.lat,
            newListing.lng
          );
          
          if (distance <= (managerProfile.notification_radius_km || 5)) {
            const notification = {
              id: newListing.id,
              listingId: newListing.id,
              title: newListing.title,
              price: newListing.price,
              location: `${newListing.city || ''} ${newListing.state || ''}`,
              posterRole: newListing.poster_role,
              commission: (newListing.price || 0) * 0.025,
              distance: `${distance.toFixed(1)}km`,
              expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
              accepted: false
            };
            setProximityNotifications(prev => {
              if (prev.some(n => n.id === notification.id)) return prev;
              return [notification, ...prev];
            });
          }
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [user]);

  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // ---------- Load all dashboard data with correct stats ----------
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Get all listings where manager is assigned
      const { data: myListings, error: listingsError } = await supabase
        .from('listings')
        .select('*')
        .eq('assigned_manager_id', user.id)
        .order('assigned_at', { ascending: false });

      if (listingsError) throw listingsError;

      const myListingsArray = myListings || [];
      
      // Separate into pending and verified
      const pending = myListingsArray.filter(l => l.verification_status === 'pending_verification');
      const verified = myListingsArray.filter(l => l.verification_status === 'verified' && l.status !== 'rented');
      const completed = myListingsArray.filter(l => l.status === 'rented');
      
      setPendingVerifications(pending);
      setVerifiedProperties(verified);
      
      // 2. Get all chats where manager is involved (monitoring or participating)
      const { data: chatsData, error: chatsError } = await supabase
        .from('chats')
        .select(`
          *,
          listing:listing_id (id, title, price, poster_role, status, verification_status)
        `)
        .or(`monitoring_manager_id.eq.${user.id},participant1_id.eq.${user.id},participant2_id.eq.${user.id}`)
        .order('updated_at', { ascending: false });

      if (chatsError) throw chatsError;

      // Enhance chats with listing details
      const enhancedChats = (chatsData || []).map(chat => {
        const listing = chat.listing || {};
        return {
          ...chat,
          listingTitle: listing.title || 'Unknown Property',
          listingPrice: listing.price || 0,
          listingStatus: listing.status || 'unknown',
          listingVerificationStatus: listing.verification_status,
          posterRole: listing.poster_role,
          chatType: chat.monitoring_manager_id === user.id ? 'monitoring' : 'direct',
          isActive: chat.state === 'active' && listing.status !== 'rented'
        };
      });
      
      setAssignedChats(enhancedChats);
      
      // 3. Calculate earnings from commissions
      // Total earned (paid commissions)
      const { data: paidCommissions, error: paidError } = await supabase
        .from('commissions')
        .select('manager_share')
        .eq('manager_id', user.id)
        .eq('status', 'paid');
      
      const totalEarned = (paidCommissions || []).reduce((sum, c) => sum + (c.manager_share || 0), 0);
      
      // Pending earnings (verified but not yet paid)
      const { data: pendingCommissions, error: pendingError } = await supabase
        .from('commissions')
        .select('manager_share')
        .eq('manager_id', user.id)
        .eq('status', 'verified')
        .eq('paid_to_manager', false);
      
      const pendingEarningsTotal = (pendingCommissions || []).reduce((sum, c) => sum + (c.manager_share || 0), 0);
      
      setEarnings(totalEarned);
      setPendingEarnings(pendingEarningsTotal);
      
      // 4. Calculate all stats
      const activeChatsCount = enhancedChats.filter(c => 
        c.state === 'active' && 
        c.listingStatus !== 'rented' &&
        c.listingVerificationStatus !== 'rented'
      ).length;
      
      const pendingVerificationsCount = pending.length;
      const verifiedPropertiesCount = verified.length;
      const completedRentalsCount = completed.length;
      
      setStats({
        activeChats: activeChatsCount,
        pendingVerifications: pendingVerificationsCount,
        verifiedProperties: verifiedPropertiesCount,
        totalEarnings: totalEarned,
        pendingEarnings: pendingEarningsTotal,
        completedRentals: completedRentalsCount
      });
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadDashboardData();
  }, [user]);

  // ---------- Accept a listing (from proximity notification) ----------
  const acceptListing = async (listingId) => {
    if (kycStatus !== 'approved') {
      alert('⚠️ KYC Verification Required');
      navigate('/dashboard/manager/kyc');
      return;
    }

    try {
      const { data: listing, error: listingError } = await supabase
        .from('listings')
        .select('*')
        .eq('id', listingId)
        .single();
      if (listingError) throw listingError;

      if (listing.poster_role === 'estate-firm' || listing.poster_role === 'estate_firm') {
        alert('Estate firm listings do not require managers');
        return;
      }

      // Update listing
      const { error: updateListingError } = await supabase
        .from('listings')
        .update({
          assigned_manager_id: user.id,
          verification_status: 'pending_verification',
          assigned_at: new Date().toISOString()
        })
        .eq('id', listingId);
      if (updateListingError) throw updateListingError;

      // Create or update chat
      const { data: existingChat } = await supabase
        .from('chats')
        .select('id')
        .eq('listing_id', listingId)
        .maybeSingle();

      if (!existingChat) {
        const chatTemplate = {
          listing_id: listingId,
          participant1_id: listing.poster_role === 'tenant' ? listing.user_id : null,
          participant2_id: listing.poster_role === 'landlord' ? listing.user_id : null,
          monitoring_manager_id: user.id,
          state: 'active',
          manager_assigned: true,
          manager_assigned_at: new Date().toISOString(),
          chat_type: listing.poster_role === 'tenant' ? 'tenant_manager' : 'tenant_landlord',
        };

        const { error: chatError } = await supabase.from('chats').insert([chatTemplate]);
        if (chatError) throw chatError;

        const { data: newChat } = await supabase
          .from('chats')
          .select('id')
          .eq('listing_id', listingId)
          .single();

        await supabase.from('messages').insert([
          {
            chat_id: newChat.id,
            sender_id: '00000000-0000-0000-0000-000000000000',
            content: listing.poster_role === 'tenant'
              ? `🏠 Manager assigned to handle this property. All communication will go through the manager.`
              : `👨‍💼 Manager assigned to monitor this conversation.`,
            is_system_message: true,
          },
        ]);
      } else {
        await supabase
          .from('chats')
          .update({
            monitoring_manager_id: user.id,
            manager_assigned: true,
            manager_assigned_at: new Date().toISOString(),
          })
          .eq('id', existingChat.id);
      }

      setProximityNotifications((prev) => prev.filter((n) => n.listingId !== listingId));

      alert(`✅ You are now assigned to manage "${listing.title}" – please verify the property.`);
      loadDashboardData();
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
      const { data: listing, error: listingError } = await supabase
        .from('listings')
        .select('assigned_manager_id, verification_status')
        .eq('id', listingId)
        .single();

      if (listingError) throw listingError;
      if (listing.assigned_manager_id !== user.id) {
        alert('You can only verify properties assigned to you');
        return;
      }

      const { error: updateError } = await supabase
        .from('listings')
        .update({
          verification_status: 'verified',
          verified: true,
          verification_date: new Date().toISOString(),
          verified_by: user.id,
        })
        .eq('id', listingId);
      if (updateError) throw updateError;

      const { data: chat } = await supabase
        .from('chats')
        .select('id')
        .eq('listing_id', listingId)
        .single();

      if (chat) {
        await supabase.from('messages').insert([
          {
            chat_id: chat.id,
            sender_id: '00000000-0000-0000-0000-000000000000',
            content: `✅ Property verified on-site by manager.`,
            is_system_message: true,
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

  if (loading) {
    return <RentEasyLoader message="Loading your dashboard..." fullScreen />;
  }

  return (
    <div className="manager-dashboard">
      {/* Hero Section */}
      <div className="dashboard-hero">
        <div className="hero-content">
          <div className="hero-left">
            <h1>Welcome back, {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Manager'} 👋</h1>
            <p className="hero-subtitle">Manage your listings, chats, and earnings from one place.</p>
            <div className="hero-badges">
              <span className="badge role-badge">👨‍💼 Manager</span>
              <span className={`badge kyc-badge ${kycStatus === 'approved' ? 'verified' : kycStatus === 'pending' ? 'pending' : 'unverified'}`}>
                {kycStatus === 'approved' ? '✅ KYC Verified' : 
                 kycStatus === 'pending' ? '⏳ KYC Pending' : 
                 '⚠️ KYC Required'}
              </span>
              <span className="badge commission-badge">💰 2.5% Commission</span>
            </div>
          </div>
          <div className="hero-right">
            <div className="hero-stats">
              <div className="hero-stat">
                <span className="stat-value">{stats.activeChats}</span>
                <span className="stat-label">Active Chats</span>
              </div>
              <div className="hero-stat">
                <span className="stat-value">{stats.pendingVerifications}</span>
                <span className="stat-label">Pending Verifications</span>
              </div>
              <div className="hero-stat">
                <span className="stat-value">₦{stats.totalEarnings.toLocaleString()}</span>
                <span className="stat-label">Total Earnings</span>
              </div>
            </div>
            {kycStatus !== 'approved' && (
              <button 
                className="hero-kyc-btn"
                onClick={() => navigate('/dashboard/manager/kyc')}
              >
                Complete KYC Now →
              </button>
            )}
          </div>
        </div>
      </div>

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
          🏠 Verified ({stats.verifiedProperties})
        </button>
        <button
          className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          ⏳ Pending Verification ({stats.pendingVerifications})
        </button>
        <button
          className={`tab-btn ${activeTab === 'earnings' ? 'active' : ''}`}
          onClick={() => setActiveTab('earnings')}
        >
          💰 Earnings (₦{stats.totalEarnings.toLocaleString()})
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
                  <h3>{stats.activeChats}</h3>
                  <p>Active Chats</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">⏳</div>
                <div className="stat-content">
                  <h3>{stats.pendingVerifications}</h3>
                  <p>Pending Verifications</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">🏠</div>
                <div className="stat-content">
                  <h3>{stats.verifiedProperties}</h3>
                  <p>Verified Properties</p>
                </div>
              </div>
              
              <div className="stat-card earnings">
                <div className="stat-icon">💰</div>
                <div className="stat-content">
                  <h3>₦{stats.totalEarnings.toLocaleString()}</h3>
                  <p>Total Earnings</p>
                  {stats.pendingEarnings > 0 && (
                    <small>+ ₦{stats.pendingEarnings.toLocaleString()} pending</small>
                  )}
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
            <ManagerCommissionSummary 
              earnings={stats.totalEarnings}
              pendingEarnings={stats.pendingEarnings}
            />

            {/* RECENT ACTIVITY */}
            <div className="recent-activity">
              <h3>Recent Activity</h3>
              <div className="activity-list">
                {pendingVerifications.slice(0, 2).map(listing => (
                  <div key={listing.id} className="activity-item">
                    <div className="activity-icon">⏳</div>
                    <div className="activity-details">
                      <strong>{listing.title}</strong>
                      <p>Pending verification</p>
                      <small>Assigned {new Date(listing.assigned_at || listing.created_at).toLocaleDateString()}</small>
                    </div>
                    <button 
                      className="btn btn-sm btn-primary"
                      onClick={() => navigate(`/dashboard/manager/verify/${listing.id}`)}
                    >
                      Verify
                    </button>
                  </div>
                ))}
                
                {assignedChats.filter(c => c.isActive).slice(0, 2).map(chat => (
                  <div key={chat.id} className="activity-item">
                    <div className="activity-icon">
                      {chat.chatType === 'monitoring' ? '👁️' : '💬'}
                    </div>
                    <div className="activity-details">
                      <strong>{chat.listingTitle}</strong>
                      <p>{chat.chatType === 'monitoring' ? 'Monitoring Chat' : 'Active Conversation'}</p>
                      <small>Updated {new Date(chat.updated_at).toLocaleDateString()}</small>
                    </div>
                    <button 
                      className="btn btn-sm"
                      onClick={() => navigate(`/dashboard/messages/chat/${chat.id}`)}
                    >
                      Open
                    </button>
                  </div>
                ))}
                
                {pendingVerifications.length === 0 && assignedChats.filter(c => c.isActive).length === 0 && (
                  <div className="empty-activity">
                    <p>No recent activity. Accept a listing to get started!</p>
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

        {/* NOTIFICATIONS TAB - same as before */}
        {activeTab === 'notifications' && (
          <div className="notifications-container">
            <div className="section-header">
              <h2>🔔 Proximity Notifications</h2>
              <p>New listings within your radius - First to accept gets 2.5% commission</p>
            </div>

            {proximityNotifications.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🔕</div>
                <h3>No new notifications</h3>
                <p>
      {!userLocationSet ? 
        'Please set your location in profile to receive proximity notifications.' : 
        'New listings in your area will appear here automatically.'}
    </p>
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
                {assignedChats.map(chat => (
                  <div key={chat.id} className="chat-card">
                    <div className="chat-header">
                      <div className="chat-type-indicator">
                        {chat.chatType === 'monitoring' ? (
                          <span className="badge monitoring">👁️ Monitoring</span>
                        ) : (
                          <span className="badge intermediary">💬 Direct Chat</span>
                        )}
                      </div>
                      <div className="chat-status">
                        <span className={`status-badge ${chat.state}`}>
                          {chat.state?.replace('_', ' ') || 'Active'}
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
                          <span className="label">Your Commission:</span>
                          <span className="value highlight">
                            ₦{(chat.listingPrice * 0.025).toLocaleString()}
                          </span>
                        </div>
                        <div className="detail">
                          <span className="label">Messages:</span>
                          <span className="value">{chat.messages?.length || 0}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="chat-actions">
                      <button 
                        className="btn btn-primary"
                        onClick={() => navigate(`/dashboard/messages/chat/${chat.id}`)}
                      >
                        {chat.chatType === 'monitoring' ? 'Monitor Chat' : 'Open Chat'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PROPERTIES TAB - verified only */}
        {activeTab === 'properties' && (
          <div className="properties-container">
            <div className="section-header">
              <h2>🏠 Verified Properties</h2>
              <p>Properties you've successfully verified</p>
            </div>

            {verifiedProperties.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🏠</div>
                <h3>No verified properties</h3>
                <p>Complete verification for assigned listings to see them here.</p>
              </div>
            ) : (
              <div className="properties-grid">
                {verifiedProperties.map(property => (
                  <div key={property.id} className="property-card">
                    <div className="property-header">
                      <div className="property-badges">
                        <span className="badge verified">✅ Verified</span>
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
                          <span className="label">Your Commission:</span>
                          <span className="value highlight">
                            ₦{(property.price * 0.025).toLocaleString()}
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
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PENDING VERIFICATIONS TAB */}
        {activeTab === 'pending' && (
          <div className="pending-container">
            <div className="section-header">
              <h2>⏳ Pending Verifications</h2>
              <p>Listings assigned to you that require on-site verification</p>
            </div>
            {pendingVerifications.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">✅</div>
                <h3>No pending verifications</h3>
                <p>All assigned listings have been verified.</p>
              </div>
            ) : (
              <div className="pending-grid">
                {pendingVerifications.map(listing => (
                  <div key={listing.id} className="pending-card">
                    <div className="pending-header">
                      <span className="badge pending">Pending Verification</span>
                      {listing.landlord_phone && (
                        <span className="badge info">📞 Landlord phone provided</span>
                      )}
                    </div>
                    <div className="pending-body">
                      <h4>{listing.title}</h4>
                      <div className="pending-details">
                        <div className="detail">
                          <span className="label">Address:</span>
                          <span className="value">{listing.address}</span>
                        </div>
                        <div className="detail">
                          <span className="label">Rent:</span>
                          <span className="value">₦{listing.price?.toLocaleString()}/year</span>
                        </div>
                        <div className="detail">
                          <span className="label">Posted by:</span>
                          <span className="value">
                            {listing.poster_role === 'tenant' ? '👤 Outgoing Tenant' : '🏠 Landlord'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="pending-actions">
                      <button 
                        className="btn btn-primary"
                        onClick={() => navigate(`/dashboard/manager/verify/${listing.id}`)}
                      >
                        Start Verification
                      </button>
                      <button 
                        className="btn btn-secondary"
                        onClick={() => navigate(`/listings/${listing.id}`)}
                      >
                        View Listing
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
                <h2>₦{stats.totalEarnings.toLocaleString()}</h2>
                <p>Lifetime commission earnings</p>
              </div>
              
              <div className="summary-card pending">
                <h4>Pending Earnings</h4>
                <h2>₦{stats.pendingEarnings.toLocaleString()}</h2>
                <p>Awaiting payout</p>
              </div>
              
              <div className="summary-card completed">
                <h4>Completed Rentals</h4>
                <h2>{stats.completedRentals}</h2>
                <p>Properties rented</p>
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
                  <div className="bar-fill" style={{ width: '20%' }}></div>
                </div>
                
                <div className="breakdown-bar renteasy">
                  <div className="bar-label">
                    <span>RentEasy Platform</span>
                    <span>3.5%</span>
                  </div>
                  <div className="bar-fill" style={{ width: '47%' }}></div>
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
                    <span className="value">₦{stats.totalEarnings.toLocaleString()}</span>
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
                    onClick={() => navigate('/dashboard/manager/withdraw')}
                    disabled={stats.totalEarnings < 5000}
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
  );
};

export default ManagerDashboard;