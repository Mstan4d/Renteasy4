// src/modules/manager/components/ProximityAlert.jsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../../../shared/lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import './ProximityAlert.css'

const ProximityAlert = ({ managerId, managerState }) => {
  const [incomingListing, setIncomingListing] = useState(null);
const navigate = useNavigate();

  useEffect(() => {
  const channel = supabase
    .channel('proximity-notifications')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'manager_notifications',
      filter: `manager_id=eq.${managerId}`
    }, async (payload) => {
      // 1. PLAY THE SOUND IMMEDIATELY
      const audio = new Audio('/notification-ping.mp3.aac');
      audio.play().catch(err => console.log("Audio play blocked by browser:", err));

      // 2. FETCH LISTING DATA
      const { data: listing } = await supabase
        .from('listings')
        .select('*')
        .eq('id', payload.new.listing_id)
        .single();

      if (listing) {
        setIncomingListing({ ...listing, notificationId: payload.new.id });
      }
    })
    .subscribe();

  return () => supabase.removeChannel(channel);
}, [managerId]);

  const claimListing = async () => {
  const { data, error } = await supabase
    .from('manager_notifications')
    .update({ status: 'claimed' })
    .eq('id', incomingListing.notificationId)
    .eq('status', 'sent');

  if (!error) {
    // 1. Get the Chat ID for this listing
    const { data: chatData } = await supabase
      .from('chats')
      .select('id')
      .eq('listing_id', incomingListing.id)
      .single();

    // 2. Redirect the manager to that chat immediately
    if (chatData) {
      navigate(/dashboard/messages/chat/${chatData.id});
    }
    
    setIncomingListing(null);
  } else {
    alert("Listing already claimed by another manager!");
    setIncomingListing(null);
  }
};
  if (!incomingListing) return null;

  return (
    <div className="proximity-popup">
      <div className="popup-content">
        <h3>🏠 New Listing Nearby!</h3>
        <p>{incomingListing.title}</p>
        <p><strong>Commission:</strong> 2.5% (approx ₦{(incomingListing.price * 0.025).toLocaleString()})</p>
        <button onClick={claimListing} className="btn-claim">Claim Now</button>
        <button onClick={() => setIncomingListing(null)} className="btn-dismiss">Ignore</button>
      </div>
    </div>
  );
};

export default ProximityAlert