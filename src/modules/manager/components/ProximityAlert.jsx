// src/modules/manager/components/ProximityAlert.jsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../../../shared/lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import './ProximityAlert.css';

const ProximityAlert = ({ managerId, managerState, kycStatus }) => {
  const [incomingListing, setIncomingListing] = useState(null);
  const [claiming, setClaiming] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!managerId) return;

    const channel = supabase
      .channel('proximity-notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'manager_notifications',
        filter: `manager_id=eq.${managerId}`
      }, async (payload) => {
        console.log('🔔 New proximity notification!', payload.new);
        
        // Play sound
        try {
          const audio = new Audio('/sounds/notification-ping.mp3');
          audio.volume = 0.8;
          await audio.play();
        } catch (err) {
          console.log('Audio play blocked by browser:', err);
        }

        // Fetch listing details
        const { data: listing, error } = await supabase
          .from('listings')
          .select('*')
          .eq('id', payload.new.listing_id)
          .single();

        if (listing && !error) {
          setIncomingListing({ 
            ...listing, 
            notificationId: payload.new.id,
            commission: (listing.price || 0) * 0.025
          });
          
          // Auto-hide after 30 seconds
          setTimeout(() => {
            setIncomingListing(null);
          }, 30000);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [managerId]);

  const claimListing = async () => {
    if (kycStatus !== 'approved') {
      alert('⚠️ Please complete KYC verification before claiming listings.');
      navigate('/dashboard/manager/kyc');
      return;
    }

    setClaiming(true);
    
    try {
      // Update notification as claimed
      const { error: updateError } = await supabase
        .from('manager_notifications')
        .update({ 
          accepted: true,
          claimed_at: new Date().toISOString()
        })
        .eq('id', incomingListing.notificationId)
        .eq('accepted', false);

      if (updateError) throw updateError;

      // Check if chat exists
      const { data: existingChat, error: chatError } = await supabase
        .from('chats')
        .select('id')
        .eq('listing_id', incomingListing.id)
        .maybeSingle();

      if (existingChat) {
        navigate(`/dashboard/messages/chat/${existingChat.id}`);
      } else {
        navigate(`/dashboard/manager/chats`);
      }
      
      setIncomingListing(null);
    } catch (error) {
      console.error('Error claiming listing:', error);
      alert('This listing may have been claimed by another manager.');
      setIncomingListing(null);
    } finally {
      setClaiming(false);
    }
  };

  if (!incomingListing) return null;

  return (
    <div className="proximity-popup">
      <div className="popup-content">
        <div className="popup-header">
          <span className="popup-icon">🏠</span>
          <h3>New Listing Nearby!</h3>
          <button 
            className="popup-close"
            onClick={() => setIncomingListing(null)}
          >
            ×
          </button>
        </div>
        
        <div className="popup-body">
          <h4>{incomingListing.title}</h4>
          <div className="popup-details">
            <div className="detail-row">
              <span className="label">📍 Location:</span>
              <span className="value">{incomingListing.city || ''} {incomingListing.state || ''}</span>
            </div>
            <div className="detail-row">
              <span className="label">💰 Rent:</span>
              <span className="value">₦{incomingListing.price?.toLocaleString()}/year</span>
            </div>
            <div className="detail-row highlight">
              <span className="label">🎯 Your Commission:</span>
              <span className="value">₦{incomingListing.commission?.toLocaleString()} (2.5%)</span>
            </div>
          </div>
        </div>
        
        <div className="popup-footer">
          <button 
            onClick={claimListing} 
            className="btn-claim"
            disabled={claiming}
          >
            {claiming ? 'Claiming...' : 'Claim Now →'}
          </button>
          <button 
            onClick={() => setIncomingListing(null)} 
            className="btn-dismiss"
          >
            Ignore
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProximityAlert;