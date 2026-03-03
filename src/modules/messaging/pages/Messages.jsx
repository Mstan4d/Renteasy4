// src/modules/messaging/pages/Messages.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../shared/lib/supabaseClient';
import './Messages.css';

const Messages = () => {
  const { listingId, chatId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [listing, setListing] = useState(null);
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [participantProfiles, setParticipantProfiles] = useState({});
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const subscriptionRef = useRef(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Cleanup subscription
  useEffect(() => {
    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
      }
    };
  }, []);

  // Load data based on URL params
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (chatId) {
      loadExistingChat(chatId);
    } else if (listingId) {
      loadOrCreateChat(listingId);
    } else {
      navigate('/dashboard/messages');
    }
  }, [listingId, chatId, user]);

  // Subscribe to new messages when chat loads
  useEffect(() => {
    if (chat?.id) {
      subscribeToMessages(chat.id);
    }
  }, [chat?.id]);

  // Helper to format time
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
   const isValidUUID = (uuid) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuid && typeof uuid === 'string' && uuidRegex.test(uuid);
};


  // Fetch listing by ID
  const fetchListing = async (id) => {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  };

  // Load existing chat by ID
  const loadExistingChat = async (id) => {
  try {
    setLoading(true);
    const { data: chatData, error: chatError } = await supabase
      .from('chats')
      .select('*')
      .eq('id', id)
      .single();

    if (chatError || !chatData) {
      alert('Chat not found');
      navigate('/listings');
      return;
    }

    // ✅ Validate listing_id
    if (!isValidUUID(chatData.listing_id)) {
      console.error('Invalid listing_id in chat:', chatData.listing_id);
      alert('This chat has an invalid reference to a listing. Please contact support.');
      navigate('/listings');
      return;
    }

    // Check access permission
    if (!hasChatAccess(chatData)) {
      alert('You do not have permission to access this chat');
      navigate('/listings');
      return;
    }

    // Fetch associated listing
    const listingData = await fetchListing(chatData.listing_id);
    setListing(listingData);
    setChat(chatData);

    // Fetch participant names/profiles
    await fetchParticipantProfiles(chatData);

    // Fetch messages
    await fetchMessages(id);
  } catch (error) {
    console.error('Error loading chat:', error);
  } finally {
    setLoading(false);
  }
};
  // Check if current user has access to chat (business rules)
  const hasChatAccess = (chat) => {
    if (!user) return false;
    // Admin and super-admin have full access
    if (user.role === 'admin' || user.role === 'super-admin') return true;
    // Check if user is participant1, participant2, or monitoring manager
    return (
      user.id === chat.participant1_id ||
      user.id === chat.participant2_id ||
      user.id === chat.monitoring_manager_id
    );
  };

  // Fetch profiles for all participants
  const fetchParticipantProfiles = async (chat) => {
    const ids = [
      chat.participant1_id,
      chat.participant2_id,
      chat.monitoring_manager_id
    ].filter(Boolean);
    if (ids.length === 0) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, role, avatar_url')
      .in('id', ids);

    if (error) {
      console.error('Error fetching participant profiles:', error);
      return;
    }

    const profileMap = {};
    data.forEach(p => { profileMap[p.id] = p; });
    setParticipantProfiles(profileMap);
  };

  // Fetch messages for a chat
  const fetchMessages = async (id) => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', id)
      .order('created_at', { ascending: true });

    if (error) throw error;
    setMessages(data || []);

    // Mark unread messages as read (if from others)
    const unread = data.filter(m => m.sender_id !== user.id && !m.read_at);
    if (unread.length > 0) {
      await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .in('id', unread.map(m => m.id));
    }
  };

  // Subscribe to new messages in real-time
  const subscribeToMessages = (chatId) => {
    if (subscriptionRef.current) {
      supabase.removeChannel(subscriptionRef.current);
    }

    const channel = supabase
      .channel(`chat-${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          const newMsg = payload.new;
          // Only add if not from current user (already optimistically added)
          if (newMsg.sender_id !== user.id) {
            setMessages((prev) => [...prev, newMsg]);
          }
        }
      )
      .subscribe();

    subscriptionRef.current = channel;
  };

  // Load or create a chat for a listing
  const loadOrCreateChat = async (listingId) => {
  try {
    setLoading(true);

    // ✅ Validate the listing ID from URL
    if (!isValidUUID(listingId)) {
      alert('Invalid listing ID');
      navigate('/listings');
      return;
    }

      // Fetch listing details
      const listingData = await fetchListing(listingId);
      setListing(listingData);

      // Check if a chat already exists with this listing and current user as participant
      const { data: existingChats, error: fetchError } = await supabase
        .from('chats')
        .select('*')
        .eq('listing_id', listingId);

      if (fetchError) throw fetchError;

      // Look for a chat where current user is participant1, participant2, or monitoring manager
      let existingChat = existingChats?.find(c =>
        c.participant1_id === user.id ||
        c.participant2_id === user.id ||
        c.monitoring_manager_id === user.id
      );

      if (existingChat) {
        // Check access
        if (!hasChatAccess(existingChat)) {
          alert('Access denied');
          navigate('/listings');
          return;
        }
        setChat(existingChat);
        await fetchParticipantProfiles(existingChat);
        await fetchMessages(existingChat.id);
        setLoading(false);
        return;
      }

      // Determine participants based on listing poster role
      let participant1_id = null; // Typically the poster (landlord, tenant, estate firm)
      let participant2_id = user.id; // Incoming tenant
      let monitoring_manager_id = null; // Will be set if manager assigned

      let commission_applied = false;
      let estate_firm_listing = false;
      let state = 'pending_availability';

      if (listingData.poster_role === 'tenant') {
        // Outgoing tenant posting
        participant1_id = listingData.poster_id; // outgoing tenant
        // Check if a manager is already assigned to this listing
        const { data: assignment } = await supabase
          .from('manager_assignments') // Assumes you have this table
          .select('manager_id')
          .eq('listing_id', listingId)
          .maybeSingle();
        if (assignment) {
          monitoring_manager_id = assignment.manager_id;
          state = 'active'; // manager already assigned, chat can be active after availability? Actually need confirmation? For tenant listings, chat can become active only after manager accepts, but we already have assignment.
        } else {
          state = 'pending_manager';
        }
        commission_applied = true;
      } else if (listingData.poster_role === 'landlord') {
        participant1_id = listingData.poster_id;
        commission_applied = true;
        state = 'pending_availability'; // landlord must confirm availability
      } else if (listingData.poster_role === 'estate_firm') {
        participant1_id = listingData.poster_id;
        estate_firm_listing = true;
        commission_applied = false;
        state = 'pending_availability'; // estate firm confirms availability
      }

      // Create new chat
      const { data: newChat, error: createError } = await supabase
        .from('chats')
        .insert([{
          listing_id: listingId,
          participant1_id,
          participant2_id,
          monitoring_manager_id,
          state,
          commission_applied,
          estate_firm_listing,
          manager_assigned: !!monitoring_manager_id,
          // Include other fields like created_at, updated_at (auto by default)
        }])
        .select()
        .single();

      if (createError) throw createError;

      setChat(newChat);
      await fetchParticipantProfiles(newChat);

      // Add a system message
      await supabase.from('messages').insert([{
        chat_id: newChat.id,
        sender_id: '00000000-0000-0000-0000-000000000000', // system
        sender_role: 'system',
        content: `Conversation started for ${listingData.title}`,
        is_system: true,
      }]);

      setMessages([]); // initially empty
    } catch (error) {
      console.error('Error creating chat:', error);
      alert('Could not start conversation');
    } finally {
      setLoading(false);
    }
  };

  // Accept as manager (when manager receives proximity notification)
  const acceptAsManager = async () => {
    if (user.role !== 'manager') return;

    try {
      // Update chat to set monitoring_manager_id
      const { error } = await supabase
        .from('chats')
        .update({
          monitoring_manager_id: user.id,
          manager_assigned: true,
          state: chat.state === 'pending_manager' ? 'pending_availability' : 'active',
        })
        .eq('id', chat.id);

      if (error) throw error;

      // Add system message
      await supabase.from('messages').insert([{
        chat_id: chat.id,
        sender_id: '00000000-0000-0000-0000-000000000000',
        sender_role: 'system',
        content: `👨‍💼 Manager ${participantProfiles[user.id]?.full_name || user.email} has accepted this listing via proximity notification.`,
        is_system: true,
      }]);

      // Refresh chat
      const { data: updatedChat } = await supabase
        .from('chats')
        .select('*')
        .eq('id', chat.id)
        .single();
      setChat(updatedChat);
      await fetchParticipantProfiles(updatedChat);
    } catch (error) {
      console.error('Error accepting as manager:', error);
      alert('Failed to accept as manager');
    }
  };

  // Respond to availability prompt (landlord/estate firm)
  const respondAvailability = async (isAvailable) => {
    if (chat.state !== 'pending_availability') return;

    try {
      const updates = {
        availability_confirmed: isAvailable,
        state: isAvailable ? 'active' : 'locked',
      };

      const { error } = await supabase
        .from('chats')
        .update(updates)
        .eq('id', chat.id);

      if (error) throw error;

      // Add system message
      const role = listing.poster_role === 'landlord' ? 'Landlord' : 'Estate Firm';
      const content = isAvailable
        ? `✅ ${role} confirmed property is available. Chat is now active.`
        : `❌ ${role} indicated property is not available. Chat locked.`;

      await supabase.from('messages').insert([{
        chat_id: chat.id,
        sender_id: '00000000-0000-0000-0000-000000000000',
        sender_role: 'system',
        content,
        is_system: true,
      }]);

      // Refresh chat
      const { data: updatedChat } = await supabase
        .from('chats')
        .select('*')
        .eq('id', chat.id)
        .single();
      setChat(updatedChat);
    } catch (error) {
      console.error('Error responding availability:', error);
    }
  };

  // Send a message
  const sendMessage = async () => {
    if (!messageText.trim() || !chat) return;

    const newMsg = {
      chat_id: chat.id,
      sender_id: user.id,
      sender_role: user.role,
      content: messageText,
      is_system: false,
      created_at: new Date().toISOString(),
    };

    // Optimistically add to UI
    setMessages((prev) => [...prev, newMsg]);
    setMessageText('');

    // Insert into DB
    const { error } = await supabase.from('messages').insert([newMsg]);
    if (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
      // Remove optimistic message
      setMessages((prev) => prev.filter(m => m.created_at !== newMsg.created_at));
    }
  };

  // Handle file upload (attachment)
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !chat) return;

    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${chat.id}/${Date.now()}.${fileExt}`;
      const filePath = `chat-attachments/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('chat-attachments')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('chat-attachments')
        .getPublicUrl(filePath);

      const attachmentUrl = urlData.publicUrl;

      // Create a message with attachment
      const attachmentMsg = {
        chat_id: chat.id,
        sender_id: user.id,
        sender_role: user.role,
        content: `📎 ${file.name}`,
        attachments: [{ url: attachmentUrl, name: file.name, type: file.type }],
        is_system: false,
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, attachmentMsg]);

      const { error: insertError } = await supabase.from('messages').insert([attachmentMsg]);
      if (insertError) throw insertError;
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('File upload failed');
    } finally {
      setUploading(false);
      e.target.value = ''; // reset file input
    }
  };

  // Mark as rented (manager only) with updated commission
  const markAsRented = async () => {
    if (user.role !== 'manager' || chat.monitoring_manager_id !== user.id) {
      alert('Only assigned manager can mark as rented');
      return;
    }

    if (!chat.availability_confirmed) {
      alert('Availability must be confirmed first');
      return;
    }

    // Calculate commission if applicable (updated percentages)
    let commissionDetails = null;
    if (chat.commission_applied && listing.price) {
      const rentalAmount = listing.price;
      commissionDetails = {
        rentalAmount,
        totalCommission: rentalAmount * 0.075, // 7.5%
        managerShare: rentalAmount * 0.025,    // 2.5%
        referrerShare: rentalAmount * 0.015,   // 1.5% (outgoing tenant)
        platformShare: rentalAmount * 0.035,   // 3.5%
        calculatedAt: new Date().toISOString(),
      };
    }

    const updates = {
      rented: true,
      rented_at: new Date().toISOString(),
      rented_by: user.id,
      commission_details: commissionDetails,
      state: 'rented',
    };

    try {
      const { error } = await supabase
        .from('chats')
        .update(updates)
        .eq('id', chat.id);

      if (error) throw error;

      // System message
      const content = commissionDetails
        ? `✅ Property marked as RENTED by manager. Commission of ₦${commissionDetails.totalCommission.toLocaleString()} calculated (2.5% manager, 1.5% referrer, 3.5% RentEasy).`
        : '✅ Property marked as RENTED by manager. No commission (Estate Firm listing).';

      await supabase.from('messages').insert([{
        chat_id: chat.id,
        sender_id: '00000000-0000-0000-0000-000000000000',
        sender_role: 'system',
        content,
        is_system: true,
      }]);

      // Refresh chat
      const { data: updatedChat } = await supabase
        .from('chats')
        .select('*')
        .eq('id', chat.id)
        .single();
      setChat(updatedChat);
    } catch (error) {
      console.error('Error marking as rented:', error);
      alert('Failed to mark as rented');
    }
  };

  // Raise dispute
  const raiseDispute = async () => {
    const reason = window.prompt('Please describe the dispute:');
    if (!reason) return;

    const disputeData = {
      reason,
      raisedBy: user.id,
      raisedAt: new Date().toISOString(),
      status: 'pending',
    };

    try {
      const { error } = await supabase
        .from('chats')
        .update({
          state: 'dispute',
          dispute: disputeData,
        })
        .eq('id', chat.id);

      if (error) throw error;

      await supabase.from('messages').insert([{
        chat_id: chat.id,
        sender_id: '00000000-0000-0000-0000-000000000000',
        sender_role: 'system',
        content: `⚖️ Dispute raised by ${user.role}: ${reason}`,
        is_system: true,
      }]);

      const { data: updatedChat } = await supabase
        .from('chats')
        .select('*')
        .eq('id', chat.id)
        .single();
      setChat(updatedChat);
    } catch (error) {
      console.error('Error raising dispute:', error);
    }
  };

  // Admin override
  const adminOverride = async (action) => {
    if (!(user.role === 'admin' || user.role === 'super-admin')) return;

    let updates = {};
    let messageContent = '';

    switch (action) {
      case 'active':
        updates = { state: 'active', admin_locked: false };
        messageContent = '👑 Admin override: Chat set to active.';
        break;
      case 'locked':
        updates = { state: 'locked', admin_locked: true };
        messageContent = '👑 Admin override: Chat locked.';
        break;
      case 'rented':
        updates = { state: 'rented', rented: true, rented_at: new Date().toISOString(), rented_by: user.id };
        messageContent = '👑 Admin override: Marked as rented.';
        break;
      default:
        return;
    }

    try {
      const { error } = await supabase
        .from('chats')
        .update(updates)
        .eq('id', chat.id);

      if (error) throw error;

      await supabase.from('messages').insert([{
        chat_id: chat.id,
        sender_id: '00000000-0000-0000-0000-000000000000',
        sender_role: 'system',
        content: messageContent,
        is_system: true,
      }]);

      const { data: updatedChat } = await supabase
        .from('chats')
        .select('*')
        .eq('id', chat.id)
        .single();
      setChat(updatedChat);
    } catch (error) {
      console.error('Admin override failed:', error);
    }
  };

  // Copy referral link
  const copyReferralLink = () => {
    const referralLink = `${window.location.origin}/signup?ref=${user.id}`;
    navigator.clipboard.writeText(referralLink);
    alert('Referral link copied!');
  };

  // Render logic
  if (loading) return <div className="messages-loading">Loading chat…</div>;

  if (!chat || !listing) {
    return (
      <div className="not-found-container">
        <h2>Chat Not Found</h2>
        <button onClick={() => navigate('/listings')} className="btn-primary">
          Back to Listings
        </button>
      </div>
    );
  }

  // Business rule: block incoming tenant if manager not assigned for outgoing tenant listing
  if (
    listing.poster_role === 'tenant' &&
    !chat.manager_assigned &&
    user.role === 'tenant' &&
    user.id !== chat.participant1_id && // not the outgoing tenant
    !(user.role === 'admin' || user.role === 'super-admin')
  ) {
    return (
      <div className="messages-locked">
        <h3>⏳ Waiting for RentEasy Manager Assignment</h3>
        <p>
          For listings posted by outgoing tenants, incoming tenants must communicate through an assigned RentEasy manager.
        </p>
        <p>A manager will be assigned via proximity notification shortly.</p>
        <div className="commission-notice">
          <strong>Commission breakdown:</strong>
          <ul>
            <li>Manager: 2.5%</li>
            <li>Referrer (outgoing tenant): 1.5%</li>
            <li>RentEasy: 3.5%</li>
          </ul>
        </div>
      </div>
    );
  }

  const showCommissionInfo = chat.commission_applied && !chat.estate_firm_listing;

  return (
    <div className="messages-page">
      <header className="messages-header">
        <div className="header-top">
          <h2>{listing.title}</h2>
          <div className="listing-tags">
            <span className={`tag tag-${listing.poster_role}`}>
              {listing.poster_role === 'tenant' ? '👤 Outgoing Tenant' :
               listing.poster_role === 'landlord' ? '🏠 Landlord' : '🏢 Estate Firm'}
            </span>
            {showCommissionInfo && <span className="tag tag-commission">💰 7.5% Commission</span>}
            {chat.estate_firm_listing && <span className="tag tag-estate">🏢 No Commission</span>}
          </div>
        </div>
        <div className="header-status">
          <span className={`status-badge status-${chat.state}`}>
            Status: {chat.state?.replace('_', ' ').toUpperCase()}
          </span>
          {chat.monitoring_manager_id && <span className="manager-badge">👨‍💼 Manager Assigned</span>}
          {chat.commission_details?.totalCommission && (
            <span className="commission-badge">
              💸 Commission: ₦{chat.commission_details.totalCommission.toLocaleString()}
            </span>
          )}
        </div>
      </header>

      {/* Manager Accept Box */}
      {user.role === 'manager' && !chat.manager_assigned && chat.state === 'pending_manager' && (
        <div className="manager-accept-box">
          <h4>📱 Proximity Notification Received</h4>
          <p>You are the first manager to receive notification for this listing.</p>
          <button onClick={acceptAsManager} className="btn primary">
            ✅ Accept Listing as Manager
          </button>
          <small>First to accept gets 2.5% commission when rented.</small>
        </div>
      )}

      {/* Availability Prompt */}
      {chat.state === 'pending_availability' && (user.role === 'landlord' || user.role === 'estate-firm') && (
        <div className="availability-box">
          <h4>❓ Is this property still available?</h4>
          <p>Please confirm availability to unlock chat.</p>
          <div className="availability-buttons">
            <button onClick={() => respondAvailability(true)} className="btn success">
              ✅ Yes, Available
            </button>
            <button onClick={() => respondAvailability(false)} className="btn danger">
              ❌ No, Not Available
            </button>
          </div>
          <small>
            {user.role === 'landlord'
              ? 'Chat will include RentEasy manager for commission monitoring.'
              : 'Estate firm listings have no commission or manager involvement.'}
          </small>
        </div>
      )}

      {/* Commission Display */}
      {showCommissionInfo && (
        <div className="commission-display">
          <h4>💰 Commission Breakdown</h4>
          <div className="commission-breakdown">
            <div className="commission-item">
              <span className="label">Total Commission:</span>
              <span className="value">7.5%</span>
            </div>
            <div className="commission-item">
              <span className="label">Manager:</span>
              <span className="value">2.5%</span>
            </div>
            <div className="commission-item">
              <span className="label">Referrer (Outgoing Tenant):</span>
              <span className="value">1.5%</span>
            </div>
            <div className="commission-item">
              <span className="label">RentEasy Platform:</span>
              <span className="value">3.5%</span>
            </div>
          </div>
        </div>
      )}

      {/* Messages Thread */}
      <div className="messages-thread">
        {messages.map((msg, idx) => {
          const isOwn = msg.sender_id === user.id;
          const senderRole = msg.sender_role || (msg.sender_id === 'system' ? 'system' : '');
          const senderName = participantProfiles[msg.sender_id]?.full_name || msg.sender_id?.slice(0, 8) || 'System';
          return (
            <div key={idx} className={`msg ${isOwn ? 'own' : ''} ${msg.is_system ? 'system' : ''}`}>
              <div className="msg-header">
                <small className="msg-sender">
                  {msg.is_system ? '⚙️ SYSTEM' : senderRole.toUpperCase() + ' ' + senderName}
                </small>
                <small className="msg-time">{formatTime(msg.created_at)}</small>
              </div>
              <p className="msg-text">{msg.content}</p>
              {msg.attachments && msg.attachments.length > 0 && (
                <div className="msg-attachments">
                  {msg.attachments.map((att, i) => (
                    <a key={i} href={att.url} target="_blank" rel="noopener noreferrer">
                      📎 {att.name}
                    </a>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      {chat.state === 'active' && !chat.admin_locked && (
        <div className="message-input">
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder={
              listing.poster_role === 'tenant' && user.role === 'tenant' && user.id !== chat.participant1_id
                ? 'Message will be sent to RentEasy manager...'
                : 'Type message…'
            }
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          />
          <button onClick={sendMessage} disabled={!messageText.trim()}>
            Send
          </button>
          {/* File attachment button */}
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileUpload}
            accept="image/*,.pdf,.doc,.docx"
          />
          <button onClick={() => fileInputRef.current.click()} disabled={uploading}>
            {uploading ? 'Uploading...' : '📎'}
          </button>
        </div>
      )}

      {/* Action Buttons */}
      <div className="chat-actions">
        {user.role === 'manager' && chat.monitoring_manager_id === user.id && chat.state === 'active' && (
          <button onClick={markAsRented} className="btn success">
            ✅ Mark as Rented (Triggers Commission)
          </button>
        )}
        {chat.state !== 'rented' && chat.state !== 'locked' && (
          <button onClick={raiseDispute} className="btn warning">
            ⚖️ Raise Dispute
          </button>
        )}
        {chat.state === 'rented' && chat.commission_details && (
          <div className="rented-info">
            <h4>✅ Property Rented</h4>
            <p>Commission of ₦{chat.commission_details.totalCommission?.toLocaleString() || '0'} calculated.</p>
            <div className="commission-split">
              <span>Manager: ₦{chat.commission_details.managerShare?.toLocaleString() || '0'}</span>
              <span>Referrer: ₦{chat.commission_details.referrerShare?.toLocaleString() || '0'}</span>
              <span>RentEasy: ₦{chat.commission_details.platformShare?.toLocaleString() || '0'}</span>
            </div>
          </div>
        )}
        <button onClick={copyReferralLink} className="btn secondary">
          🔗 Copy Referral Link
        </button>
      </div>

      {/* Admin Override Panel */}
      {(user.role === 'admin' || user.role === 'super-admin') && (
        <div className="admin-panel">
          <h4>👑 Admin Override Panel</h4>
          <div className="admin-actions">
            <button onClick={() => adminOverride('active')}>Force Chat Active</button>
            <button onClick={() => adminOverride('locked')}>Lock Chat</button>
            <button onClick={() => adminOverride('rented')}>Force Mark as Rented</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;