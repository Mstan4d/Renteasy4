// src/modules/manager/pages/ManagerNotifications.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../shared/lib/supabaseClient';
import './ManagerNotifications.css';

const ManagerNotifications = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [managerLocation, setManagerLocation] = useState(null);
  const [radius, setRadius] = useState(1); // default 1km

  useEffect(() => {
    if (!user) return;
    fetchManagerSettings();
  }, [user]);

  // Once location is loaded, fetch notifications and set up real‑time subscription
  useEffect(() => {
    if (!managerLocation) return;
    fetchNotifications();
    const subscription = subscribeToNewListings();
    return () => {
      if (subscription) supabase.removeChannel(subscription);
    };
  }, [managerLocation, radius]);

  const fetchManagerSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('lat, lng, radius_km')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      if (data) {
        console.log('Raw lat/lng from DB:', data.lat, data.lng);
        const lat = data.lat ? parseFloat(data.lat) : null;
        const lng = data.lng ? parseFloat(data.lng) : null;
        setManagerLocation({ lat, lng });
        setRadius(data.radius_km || 1);
      } else {
        console.warn('No profile data found');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching manager settings:', error);
      setLoading(false);
    }
  };

  // Helper to calculate distance (Haversine)
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const fetchNotifications = async () => {
  if (!managerLocation) return;

  // Validate coordinates
  if (!managerLocation.lat || !managerLocation.lng || 
      isNaN(managerLocation.lat) || isNaN(managerLocation.lng)) {
    console.warn('Invalid manager location', managerLocation);
    setNotifications([]);
    setLoading(false);
    return;
  }

  setLoading(true);
  try {
    // Fetch all unassigned, non‑estate listings
    const { data: allListings, error } = await supabase
      .from('listings')
      .select(`
        id,
        title,
        price,
        poster_role,
        state,
        lga,
        lat,
        lng,
        created_at,
        address
      `)
      .neq('poster_role', 'estate-firm')
      .neq('poster_role', 'estate_firm')
      .is('managed_by', null)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Filter client‑side by distance using Haversine formula
    const filtered = (allListings || []).filter(listing => {
      if (!listing.lat || !listing.lng) return false;
      const dist = calculateDistance(
        managerLocation.lat, managerLocation.lng,
        listing.lat, listing.lng
      );
      return dist <= radius;
    });
    setNotifications(filtered);
  } catch (error) {
    console.error('Error fetching notifications:', error);
  } finally {
    setLoading(false);
  }
};

  // Real‑time subscription for new listings
  const subscribeToNewListings = () => {
    if (!managerLocation || !managerLocation.lat || !managerLocation.lng) return null;

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
          // Exclude estate firms
          if (newListing.poster_role === 'estate-firm' || newListing.poster_role === 'estate_firm') return;
          // Exclude already assigned listings
          if (newListing.managed_by) return;
          if (!newListing.lat || !newListing.lng) return;

          // Calculate distance client‑side
          const distance = calculateDistance(
            managerLocation.lat, managerLocation.lng,
            newListing.lat, newListing.lng
          );
          if (distance <= radius) {
            setNotifications(prev => [newListing, ...prev]);
          }
        }
      )
      .subscribe();

    return channel;
  };

  const acceptNotification = async (listingId) => {
    try {
      const { error: updateError } = await supabase
        .from('listings')
        .update({ managed_by: user.id })
        .eq('id', listingId)
        .is('managed_by', null);

      if (updateError) throw updateError;

      const { error: insertError } = await supabase
        .from('manager_assignments')
        .insert([{ manager_id: user.id, listing_id: listingId }]);

      if (insertError) throw insertError;

      setNotifications(prev => prev.filter(n => n.id !== listingId));
      navigate('/dashboard/manager');
    } catch (error) {
      console.error('Error accepting listing:', error);
      alert('This listing may have been taken by another manager.');
    }
  };

  const dismissNotification = (listingId) => {
    setNotifications(prev => prev.filter(n => n.id !== listingId));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  // Show loading state
  if (loading) {
    return <div className="loading">Loading notifications...</div>;
  }

  return (
    <div className="manager-notifications">
      <div className="page-header">
        <h1>🔔 Notifications Center</h1>
        <p>New listings within your {radius}km radius</p>
      </div>

      {notifications.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔕</div>
          <h3>No new notifications</h3>
          <p>New listings in your area will appear here automatically</p>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/dashboard/manager')}
          >
            Return to Dashboard
          </button>
        </div>
      ) : (
        <>
          <div className="notifications-header">
            <div className="header-info">
              <h3>{notifications.length} Available Listings</h3>
              <p>First manager to accept gets 2.5% commission</p>
            </div>
            <button
              className="btn btn-outline"
              onClick={clearAll}
            >
              Clear All
            </button>
          </div>

          <div className="notifications-list">
            {notifications.map(notification => (
              <div key={notification.id} className="notification-item">
                <div className="notification-badge">
                  <span className="badge proximity">📍 {radius}km radius</span>
                </div>

                <div className="notification-content">
                  <h4>{notification.title}</h4>

                  <div className="notification-details">
                    <div className="detail-row">
                      <span className="label">Location:</span>
                      <span className="value">{notification.address || `${notification.state}, ${notification.lga}`}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Price:</span>
                      <span className="value">₦{notification.price?.toLocaleString()}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Posted by:</span>
                      <span className="value">
                        {notification.poster_role === 'tenant'
                          ? '👤 Outgoing Tenant'
                          : '🏠 Landlord'}
                      </span>
                    </div>
                    <div className="detail-row highlight">
                      <span className="label">Your Commission:</span>
                      <span className="value">₦{(notification.price * 0.025).toLocaleString()} (2.5%)</span>
                    </div>
                  </div>

                  <div className="notification-actions">
                    <button
                      className="btn btn-accept"
                      onClick={() => acceptNotification(notification.id)}
                    >
                      Accept Listing
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => navigate(`/listings/${notification.id}`)}
                    >
                      View Details
                    </button>
                    <button
                      className="btn btn-outline"
                      onClick={() => dismissNotification(notification.id)}
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="notifications-footer">
            <div className="commission-reminder">
              <span className="reminder-icon">💰</span>
              <div className="reminder-content">
                <strong>Commission Reminder</strong>
                <p>Each successful rental earns you 2.5% commission. First to accept gets the listing!</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ManagerNotifications;