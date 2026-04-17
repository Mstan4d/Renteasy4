// src/modules/manager/pages/ManagerNotifications.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../shared/lib/supabaseClient';
import NotificationSound from '../../../shared/components/NotificationSound';
import './ManagerNotifications.css';

const ManagerNotifications = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [managerLocation, setManagerLocation] = useState(null);
  const [radius, setRadius] = useState(1);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [playNotificationSound, setPlayNotificationSound] = useState(false);
  const [playAcceptSound, setPlayAcceptSound] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [showAudioPermissionBanner, setShowAudioPermissionBanner] = useState(true);
  const [pendingSound, setPendingSound] = useState(false);

  // Detect user interaction for audio permission
  useEffect(() => {
    const handleUserInteraction = () => {
      setHasUserInteracted(true);
      setShowAudioPermissionBanner(false);
      // Play any pending sound that was waiting
      if (pendingSound) {
        setPlayNotificationSound(true);
        setTimeout(() => setPlayNotificationSound(false), 100);
        setPendingSound(false);
      }
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };
    
    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('keydown', handleUserInteraction);
    document.addEventListener('touchstart', handleUserInteraction);
    
    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };
  }, [pendingSound]);

  useEffect(() => {
    if (!user) return;
    fetchManagerSettings();
  }, [user]);

  useEffect(() => {
  if (!managerLocation || !managerLocation.lat || !managerLocation.lng) return;
  
  fetchNotifications();
  const subscription = subscribeToNewListings();
  return () => {
    if (subscription) supabase.removeChannel(subscription);
  };
}, [managerLocation, radius]);

// Fallback: also fetch from manager_notifications table (more reliable)
useEffect(() => {
  if (!user) return;

 const fetchManagerNotifications = async () => {
  const { data, error } = await supabase
    .from('manager_notifications')
    .select(`
      *,
      listing:listings(id, title, lat, lng, address, price, state, city, created_at)
    `)
    .eq('manager_id', user.id)
    .eq('is_read', false)
    .order('created_at', { ascending: false });

  if (!error && data && data.length > 0) {
    const formatted = data.map(n => ({
      id: n.listing_id,
      title: n.listing?.title,
      price: n.listing?.price,
      poster_role: 'tenant',
      created_at: n.listing?.created_at,
      lat: n.listing?.lat,
      lng: n.listing?.lng,
      address: n.listing?.address,
      state: n.listing?.state,
      city: n.listing?.city,
      distance: n.distance,
      notification_id: n.id
    }));
    setNotifications(prev => {
      const existingIds = new Set(prev.map(p => p.id));
      const newOnes = formatted.filter(f => !existingIds.has(f.id));
      return [...newOnes, ...prev];
    });
  }
};

  fetchManagerNotifications();
  const interval = setInterval(fetchManagerNotifications, 30000); // every 30 sec
  return () => clearInterval(interval);
}, [user]);

  const fetchManagerSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('lat, lng, radius_km')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      if (data) {
        const lat = data.lat ? parseFloat(data.lat) : null;
        const lng = data.lng ? parseFloat(data.lng) : null;
        setManagerLocation({ lat, lng });
        setRadius(data.radius_km || 1);
      }
    } catch (error) {
      console.error('Error fetching manager settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const playNotificationSoundWithInteraction = () => {
    if (!hasUserInteracted) {
      console.log('⚠️ User hasn\'t interacted yet, sound will play after first click');
      setPendingSound(true);
      return;
    }
    
    if (!audioEnabled) return;
    
    try {
      // Add cache-busting to prevent caching issues
      const audio = new Audio(`/sounds/notification-ping.mp3?t=${Date.now()}`);
      audio.volume = 1.0;
      audio.play().then(() => {
        console.log('✅ Custom sound played successfully!');
      }).catch(e => {
        console.log('Custom sound failed, using fallback:', e);
        // Fallback Web Audio
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.frequency.value = 880;
        gainNode.gain.value = 0.3;
        oscillator.start();
        setTimeout(() => {
          oscillator.stop();
          audioContext.close();
        }, 200);
      });
    } catch(e) {
      console.log('Sound error:', e);
    }
  };

  const fetchNotifications = async () => {
    if (!managerLocation) return;

    if (!managerLocation.lat || !managerLocation.lng || 
        isNaN(managerLocation.lat) || isNaN(managerLocation.lng)) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
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

      const filtered = (allListings || []).filter(listing => {
        if (!listing.lat || !listing.lng) return false;
        const dist = calculateDistance(
          managerLocation.lat, managerLocation.lng,
          listing.lat, listing.lng
        );
        return dist <= radius;
      });
      
      const currentListingIds = new Set(notifications.map(n => n.id));
      const newListings = filtered.filter(l => !currentListingIds.has(l.id));
      
      if (newListings.length > 0 && !loading) {
        console.log(`🎵 Found ${newListings.length} new listings, playing sound!`);
        playNotificationSoundWithInteraction();
        
        if (Notification.permission === 'granted') {
          newListings.forEach(listing => {
            new Notification('🔔 New Property Alert!', {
              body: `${listing.title} - ₦${listing.price?.toLocaleString()} (${listing.lga || listing.state})`,
              icon: '/logo192.png'
            });
          });
        } else if (Notification.permission !== 'denied') {
          Notification.requestPermission();
        }
      }
      
      setNotifications(filtered);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToNewListings = () => {
    if (!managerLocation || !managerLocation.lat || !managerLocation.lng) {
      console.log('❌ No manager location, cannot subscribe');
      return null;
    }

    console.log('✅ Subscribing to new listings with manager location:', managerLocation);
    console.log('✅ Manager radius:', radius, 'km');

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
          console.log('🔔 New listing detected!', payload.new);
          const newListing = payload.new;
          
          if (newListing.poster_role === 'estate-firm' || newListing.poster_role === 'estate_firm') {
            console.log('⏭️ Skipping estate firm listing');
            return;
          }
          if (newListing.managed_by) {
            console.log('⏭️ Listing already managed');
            return;
          }
          if (!newListing.lat || !newListing.lng) {
            console.log('⏭️ Listing has no coordinates');
            return;
          }

          const distance = calculateDistance(
            managerLocation.lat, managerLocation.lng,
            newListing.lat, newListing.lng
          );
          
          console.log(`📍 Listing distance: ${distance.toFixed(2)}km (radius: ${radius}km)`);
          
          if (distance <= radius) {
            console.log('🔊 Playing notification sound!');
            
            playNotificationSoundWithInteraction();
            
            if (Notification.permission === 'granted') {
              new Notification('🔔 New Property Nearby!', {
                body: `${newListing.title} - ₦${newListing.price?.toLocaleString()} (${distance.toFixed(1)}km away)`,
                icon: '/logo192.png'
              });
            }
            
            setNotifications(prev => {
              const exists = prev.some(n => n.id === newListing.id);
              if (exists) return prev;
              return [{
                ...newListing,
                distance: distance.toFixed(1)
              }, ...prev];
            });
          } else {
            console.log(`❌ Listing outside radius: ${distance.toFixed(2)}km > ${radius}km`);
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Subscription status:', status);
      });

    return channel;
  };

  const acceptNotification = async (listingId) => {
  try {
    // Get manager's name
    const { data: managerProfile } = await supabase
      .from('profiles')
      .select('full_name, name')
      .eq('id', user.id)
      .single();
    
    const managerName = managerProfile?.full_name || managerProfile?.name || user.email;
    
    // Update listing with manager assignment
    const { error: updateError } = await supabase
      .from('listings')
      .update({ 
        managed_by: user.id,
        managed_by_name: managerName,
        assigned_manager_id: user.id,
        verification_status: 'pending_verification',
        assigned_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', listingId)
      .is('managed_by', null);

    if (updateError) throw updateError;

    // Create manager assignment record
    const { error: insertError } = await supabase
      .from('manager_assignments')
      .insert([{ 
        manager_id: user.id, 
        listing_id: listingId,
        assigned_at: new Date().toISOString()
      }]);

    if (insertError) throw insertError;

    setPlayAcceptSound(true);
    setTimeout(() => setPlayAcceptSound(false), 100);
    
    setNotifications(prev => prev.filter(n => n.id !== listingId));
    
    alert('✅ Listing accepted! You are now managing this property.');
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

  useEffect(() => {
    if ('Notification' in window && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
  }, []);

  if (loading) {
    return (
      <div className="manager-notifications">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="manager-notifications">
      {/* Sound Components */}
      <NotificationSound play={playNotificationSound} soundType="notification" />
      <NotificationSound play={playAcceptSound} soundType="accept" />
      
      {/* Audio Permission Banner */}
      {showAudioPermissionBanner && !hasUserInteracted && (
        <div className="audio-permission-banner">
          <div className="banner-content">
            <span className="banner-icon">🔊</span>
            <div>
              <h4>Enable Audio Alerts</h4>
              <p>Click anywhere on this page to enable sound notifications for new listings.</p>
            </div>
            <button 
              className="banner-close"
              onClick={() => {
                setHasUserInteracted(true);
                setShowAudioPermissionBanner(false);
                if (pendingSound) {
                  setPlayNotificationSound(true);
                  setTimeout(() => setPlayNotificationSound(false), 100);
                  setPendingSound(false);
                }
              }}
            >
              Enable Sound
            </button>
          </div>
        </div>
      )}
      
      {/* Audio Toggle Button */}
      <div className="audio-toggle">
        <button 
          className={`audio-btn ${audioEnabled ? 'enabled' : 'disabled'}`}
          onClick={() => setAudioEnabled(!audioEnabled)}
          title={audioEnabled ? 'Disable sound alerts' : 'Enable sound alerts'}
        >
          {audioEnabled ? '🔊' : '🔇'}
        </button>
      </div>

      {/* Test Sound Button */}
      <div className="test-sound-container">
        <button 
          className="test-sound-btn"
          onClick={() => {
            playNotificationSoundWithInteraction();
          }}
          title="Test Sound"
        >
          🔊 Test Sound
        </button>
      </div>

      <div className="page-header">
        <h1>🔔 Notifications Center</h1>
        <p>New listings within your {radius}km radius will appear here with sound alerts</p>
      </div>

      {notifications.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔕</div>
          <h3>No new notifications</h3>
          <p>New listings in your area will appear here with a sound alert</p>
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
              className="btn-clear"
              onClick={clearAll}
            >
              Clear All
            </button>
          </div>

          <div className="notifications-list">
            {notifications.map(notification => {
              const distance = notification.lat && notification.lng ? 
                calculateDistance(managerLocation.lat, managerLocation.lng, notification.lat, notification.lng) : null;
              
              return (
                <div key={notification.id} className="notification-item">
                  <div className="notification-badge">
                    <span className="badge proximity">📍 {distance ? `${distance.toFixed(1)}km away` : 'Nearby'}</span>
                    <span className="badge commission">💰 ₦{(notification.price * 0.025).toLocaleString()} commission</span>
                    <span className="badge time">🕐 {new Date(notification.created_at).toLocaleTimeString()}</span>
                  </div>

                  <div className="notification-content">
                    <h4>{notification.title}</h4>

                    <div className="notification-details">
                      <div className="detail-row">
                        <span className="label">Location:</span>
                        <span className="value">{notification.address || `${notification.lga}, ${notification.state}`}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Price:</span>
                        <span className="value">₦{notification.price?.toLocaleString()}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Posted by:</span>
                        <span className="value">
                          {notification.poster_role === 'tenant' ? '👤 Outgoing Tenant' : '🏠 Landlord'}
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
                        ✅ Accept Listing
                      </button>
                      <button
                        className="btn btn-secondary"
                        onClick={() => navigate(`/listings/${notification.id}`)}
                      >
                        📍 View Details
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
              <div className="reminder-icon">💰</div>
              <div className="reminder-content">
                <strong>🔊 Audio Alerts Active!</strong>
                <p>You'll hear a sound when new listings appear. First to accept gets the 2.5% commission!</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ManagerNotifications;