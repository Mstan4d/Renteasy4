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

  // Once we have manager location, fetch initial notifications and subscribe
  useEffect(() => {
    if (!managerLocation) return;
    fetchNotifications();
    subscribeToNewListings();
    return () => {
      supabase.removeAllChannels();
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
        setManagerLocation({ lat: data.lat, lng: data.lng });
        setRadius(data.radius_km || 1);
      } else {
        // No location set – maybe prompt manager to set it
        console.warn('Manager location not set');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching manager settings:', error);
    }
  };

  const fetchNotifications = async () => {
    if (!managerLocation) return;
    setLoading(true);
    try {
      // Build a PostGIS query: find listings within radius, not assigned, and not already accepted by this manager
      // We'll use ST_DWithin with geography for meter‑based distance.
      const { data, error } = await supabase
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
        .not('poster_role', 'in', '("estate-firm","estate_firm")') // exclude estate firms
        .is('managed_by', null) // not yet assigned
        .filter('ST_DWithin', 'geom', `POINT(${managerLocation.lng} ${managerLocation.lat})::geography`, radius * 1000) // radius in meters
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Exclude listings already accepted by this manager (though the above query already ensures they're not assigned)
      // But we also need to check manager_assignments to avoid showing listings the manager has already accepted (even if not yet assigned? Actually acceptance should set managed_by, so it's covered.)
      // However, if there's a race condition where another manager accepts, we'll rely on real‑time to remove.
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToNewListings = () => {
    if (!managerLocation) return;

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
          // Check if it's an estate firm – ignore
          if (newListing.poster_role === 'estate-firm' || newListing.poster_role === 'estate_firm') return;

          // Check if it's already assigned
          if (newListing.managed_by) return;

          // Check if within radius using a quick RPC call (or we could calculate client‑side if we have lat/lng)
          // For simplicity, we'll use a Supabase RPC function to check distance
          const { data: within } = await supabase.rpc('is_within_radius', {
            lat1: managerLocation.lat,
            lng1: managerLocation.lng,
            lat2: newListing.lat,
            lng2: newListing.lng,
            radius_km: radius
          });

          if (within) {
            setNotifications(prev => [newListing, ...prev]);
          }
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  };

  const acceptNotification = async (listingId) => {
    try {
      // 1. Update listing to assign this manager
      const { error: updateError } = await supabase
        .from('listings')
        .update({ managed_by: user.id })
        .eq('id', listingId)
        .is('managed_by', null); // ensure it's still unassigned

      if (updateError) throw updateError;

      // 2. Record assignment in manager_assignments
      const { error: insertError } = await supabase
        .from('manager_assignments')
        .insert([{ manager_id: user.id, listing_id: listingId }]);

      if (insertError) throw insertError;

      // 3. Remove from local state
      setNotifications(prev => prev.filter(n => n.id !== listingId));

      // 4. Optionally navigate to chat (if you have that)
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
            {notifications.map(notification => {
              // Compute distance (optional – can be done via a separate query if needed)
              return (
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
              );
            })}
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