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

  // New state for rental flow
  const [viewings, setViewings] = useState([]);
  const [rentalConfirmation, setRentalConfirmation] = useState(null);
  const [paymentProofs, setPaymentProofs] = useState([]);

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

  // Fetch viewings for this chat
  const fetchViewings = async (chatId) => {
    const { data, error } = await supabase
      .from('viewings')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    setViewings(data || []);
  };

  // Fetch rental confirmation for this chat/listing
  const fetchRentalConfirmation = async (listingId, chatId) => {
    const { data, error } = await supabase
      .from('rental_confirmations')
      .select('*')
      .eq('listing_id', listingId)
      .eq('chat_id', chatId)
      .maybeSingle();
    if (error) throw error;
    setRentalConfirmation(data || null);
  };

  // Fetch payment proofs for this chat
  const fetchPaymentProofs = async (chatId) => {
    const { data, error } = await supabase
      .from('payment_proofs')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    setPaymentProofs(data || []);
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

      if (!isValidUUID(chatData.listing_id)) {
        console.error('Invalid listing_id in chat:', chatData.listing_id);
        alert('This chat has an invalid reference to a listing. Please contact support.');
        navigate('/listings');
        return;
      }

      if (!hasChatAccess(chatData)) {
        alert('You do not have permission to access this chat');
        navigate('/listings');
        return;
      }

      const listingData = await fetchListing(chatData.listing_id);
      setListing(listingData);
      setChat(chatData);

      await fetchParticipantProfiles(chatData);
      await fetchMessages(id);
      await fetchViewings(id);
      await fetchRentalConfirmation(listingData.id, id);
      await fetchPaymentProofs(id);
    } catch (error) {
      console.error('Error loading chat:', error);
    } finally {
      setLoading(false);
    }
  };

  // Check if current user has access to chat (business rules)
  const hasChatAccess = (chat) => {
    if (!user) return false;
    if (user.role === 'admin' || user.role === 'super-admin') return true;
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

      if (!isValidUUID(listingId)) {
        alert('Invalid listing ID');
        navigate('/listings');
        return;
      }

      const listingData = await fetchListing(listingId);
      setListing(listingData);

      const { data: existingChats, error: fetchError } = await supabase
        .from('chats')
        .select('*')
        .eq('listing_id', listingId);

      if (fetchError) throw fetchError;

      let existingChat = existingChats?.find(c =>
        c.participant1_id === user.id ||
        c.participant2_id === user.id ||
        c.monitoring_manager_id === user.id
      );

      if (existingChat) {
        if (!hasChatAccess(existingChat)) {
          alert('Access denied');
          navigate('/listings');
          return;
        }
        setChat(existingChat);
        await fetchParticipantProfiles(existingChat);
        await fetchMessages(existingChat.id);
        await fetchViewings(existingChat.id);
        await fetchRentalConfirmation(listingData.id, existingChat.id);
        await fetchPaymentProofs(existingChat.id);
        setLoading(false);
        return;
      }

      // Determine participants based on listing poster role
      let participant1_id = null;
      let participant2_id = user.id;
      let monitoring_manager_id = null;
      let commission_applied = false;
      let estate_firm_listing = false;
      let state = 'pending_availability';

      if (listingData.poster_role === 'tenant') {
        participant1_id = listingData.poster_id;
        const { data: assignment } = await supabase
          .from('manager_assignments')
          .select('manager_id')
          .eq('listing_id', listingId)
          .maybeSingle();
        if (assignment) {
          monitoring_manager_id = assignment.manager_id;
          state = 'active';
        } else {
          state = 'pending_manager';
        }
        commission_applied = true;
      } else if (listingData.poster_role === 'landlord') {
        participant1_id = listingData.poster_id;
        commission_applied = true;
        state = 'pending_availability';
      } else if (listingData.poster_role === 'estate_firm') {
        participant1_id = listingData.poster_id;
        estate_firm_listing = true;
        commission_applied = false;
        state = 'pending_availability';
      }

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
        }])
        .select()
        .single();

      if (createError) throw createError;

      setChat(newChat);
      await fetchParticipantProfiles(newChat);
      await supabase.from('messages').insert([{
        chat_id: newChat.id,
        sender_id: '00000000-0000-0000-0000-000000000000',
        sender_role: 'system',
        content: `Conversation started for ${listingData.title}`,
        is_system: true,
      }]);

      setMessages([]);
      setLoading(false);
    } catch (error) {
      console.error('Error creating chat:', error);
      alert('Could not start conversation');
      setLoading(false);
    }
  };

  // Accept as manager (when manager receives proximity notification)
  const acceptAsManager = async () => {
    if (user.role !== 'manager') return;

    try {
      const { error } = await supabase
        .from('chats')
        .update({
          monitoring_manager_id: user.id,
          manager_assigned: true,
          state: chat.state === 'pending_manager' ? 'pending_availability' : 'active',
        })
        .eq('id', chat.id);

      if (error) throw error;

      // Also update listing: assign manager and set verification_status
      await supabase
        .from('listings')
        .update({
          assigned_manager_id: user.id,
          verification_status: 'pending_verification'
        })
        .eq('id', listing.id);

      await supabase.from('messages').insert([{
        chat_id: chat.id,
        sender_id: '00000000-0000-0000-0000-000000000000',
        sender_role: 'system',
        content: `👨‍💼 Manager ${participantProfiles[user.id]?.full_name || user.email} has accepted this listing.`,
        is_system: true,
      }]);

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

  // ========== NEW FUNCTIONS FOR RENTAL FLOW ==========

  // Record viewing outcome (manager only)
  const recordViewingOutcome = async (outcome, notes = '') => {
    if (user.role !== 'manager' || chat.monitoring_manager_id !== user.id) {
      alert('Only the assigned manager can record viewing outcomes');
      return;
    }

    try {
      const { error } = await supabase
        .from('viewings')
        .insert([{
          chat_id: chat.id,
          listing_id: listing.id,
          manager_id: user.id,
          tenant_id: chat.participant2_id,
          outcome,
          notes,
        }]);
      if (error) throw error;

      await supabase.from('messages').insert([{
        chat_id: chat.id,
        sender_id: '00000000-0000-0000-0000-000000000000',
        sender_role: 'system',
        content: `👁️ Viewing outcome: ${outcome} ${notes ? `– ${notes}` : ''}`,
        is_system: true,
      }]);

      // Refresh viewings
      await fetchViewings(chat.id);
    } catch (error) {
      console.error('Error recording viewing outcome:', error);
      alert('Failed to record outcome');
    }
  };

  // Mark listing as taken (manager only, after accepted viewing)
  const markAsTaken = async () => {
    if (user.role !== 'manager' || chat.monitoring_manager_id !== user.id) {
      alert('Only assigned manager can mark as taken');
      return;
    }

    // Check if there is an accepted viewing
    const acceptedViewing = viewings.find(v => v.outcome === 'accepted');
    if (!acceptedViewing) {
      alert('Tenant must accept the house before marking as taken');
      return;
    }

    try {
      // Update listing status
      await supabase
        .from('listings')
        .update({ status: 'taken', taken_at: new Date().toISOString() })
        .eq('id', listing.id);

      // Create rental confirmation record
      const { error: rcError } = await supabase
        .from('rental_confirmations')
        .insert([{
          listing_id: listing.id,
          chat_id: chat.id,
          landlord_confirmed: false,
          tenant_confirmed: false,
          admin_confirmed: false,
        }]);
      if (rcError) throw rcError;

      await supabase.from('messages').insert([{
        chat_id: chat.id,
        sender_id: '00000000-0000-0000-0000-000000000000',
        sender_role: 'system',
        content: `🏠 Property marked as TAKEN. Awaiting landlord and tenant confirmation.`,
        is_system: true,
      }]);

      // Refresh rental confirmation
      await fetchRentalConfirmation(listing.id, chat.id);
    } catch (error) {
      console.error('Error marking as taken:', error);
      alert('Failed to mark as taken');
    }
  };

  // Tenant confirm rental
  const tenantConfirmRental = async (confirm) => {
    if (user.role !== 'tenant' || user.id !== chat.participant2_id) return;

    try {
      const updates = {
        tenant_confirmed: confirm,
        tenant_confirmed_at: new Date().toISOString(),
      };
      await supabase
        .from('rental_confirmations')
        .update(updates)
        .eq('listing_id', listing.id)
        .eq('chat_id', chat.id);

      await supabase.from('messages').insert([{
        chat_id: chat.id,
        sender_id: '00000000-0000-0000-0000-000000000000',
        sender_role: 'system',
        content: confirm ? `✅ Tenant confirmed rental.` : `❌ Tenant denied rental.`,
        is_system: true,
      }]);

      await fetchRentalConfirmation(listing.id, chat.id);
    } catch (error) {
      console.error('Error confirming rental:', error);
    }
  };

  // Upload payment proof (tenant)
  const uploadPaymentProof = async (file, proofType) => {
    if (!file || !chat) return;

    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `payment_proofs/${chat.id}/${Date.now()}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from('payment-proofs')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('payment-proofs')
        .getPublicUrl(filePath);

      const { error: insertError } = await supabase
        .from('payment_proofs')
        .insert([{
          chat_id: chat.id,
          listing_id: listing.id,
          tenant_id: user.id,
          proof_type: proofType,
          file_url: urlData.publicUrl,
          description: `Payment proof uploaded by tenant`,
        }]);

      if (insertError) throw insertError;

      await supabase.from('messages').insert([{
        chat_id: chat.id,
        sender_id: '00000000-0000-0000-0000-000000000000',
        sender_role: 'system',
        content: `💰 Tenant uploaded payment proof (${proofType}). Pending verification.`,
        is_system: true,
      }]);

      await fetchPaymentProofs(chat.id);
    } catch (error) {
      console.error('Error uploading payment proof:', error);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  // Admin verify payment proof
  const verifyPaymentProof = async (proofId) => {
    if (!(user.role === 'admin' || user.role === 'super-admin')) return;

    try {
      await supabase
        .from('payment_proofs')
        .update({
          verified: true,
          verified_by: user.id,
          verified_at: new Date().toISOString(),
        })
        .eq('id', proofId);

      await supabase.from('messages').insert([{
        chat_id: chat.id,
        sender_id: '00000000-0000-0000-0000-000000000000',
        sender_role: 'system',
        content: `✅ Admin verified payment proof.`,
        is_system: true,
      }]);

      await fetchPaymentProofs(chat.id);
    } catch (error) {
      console.error('Error verifying payment proof:', error);
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

    setMessages((prev) => [...prev, newMsg]);
    setMessageText('');

    const { error } = await supabase.from('messages').insert([newMsg]);
    if (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
      setMessages((prev) => prev.filter(m => m.created_at !== newMsg.created_at));
    }
  };

  // Handle file upload (attachments) – existing
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
      e.target.value = '';
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
      await supabase
        .from('chats')
        .update({ state: 'dispute', dispute: disputeData })
        .eq('id', chat.id);

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
      await supabase
        .from('chats')
        .update(updates)
        .eq('id', chat.id);

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

  // Determine verification status message
  const getVerificationStatusDisplay = () => {
    if (!listing) return null;
    switch (listing.verification_status) {
      case 'pending_verification':
        return { text: '⏳ Pending verification by manager', class: 'pending' };
      case 'pending_admin':
        return { text: '⏳ Pending admin verification (call landlord)', class: 'pending' };
      case 'verified':
        return { text: '✅ Verified', class: 'verified' };
      default:
        return null;
    }
  };

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
    user.id !== chat.participant1_id &&
    !(user.role === 'admin' || user.role === 'super-admin')
  ) {
    return (
      <div className="messages-locked">
        <h3>⏳ Waiting for RentEasy Manager Assignment</h3>
        <p>For listings posted by outgoing tenants, incoming tenants must communicate through an assigned RentEasy manager.</p>
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
  const verificationStatus = getVerificationStatusDisplay();

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
          {verificationStatus && (
            <span className={`status-badge ${verificationStatus.class}`}>
              {verificationStatus.text}
            </span>
          )}
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

      {/* Verification prompt for manager */}
      {user.role === 'manager' && listing.verification_status === 'pending_verification' && (
        <div className="verification-box">
          <h4>🔍 Property Verification Required</h4>
          <p>Visit the property, confirm details, and upload photos.</p>
          <button
            className="btn primary"
            onClick={() => navigate(`/dashboard/manager/verify/${listing.id}`)}
          >
            Start Verification
          </button>
        </div>
      )}

      {/* After manager submits verification, admin pending */}
      {listing.verification_status === 'pending_admin' && (
        <div className="verification-box pending">
          <h4>⏳ Verification Submitted</h4>
          <p>Admin is contacting landlord to confirm. You'll be notified once verified.</p>
        </div>
      )}

      {/* After verification, manager can record viewing outcome */}
      {user.role === 'manager' && listing.verification_status === 'verified' && chat.state === 'active' && (
        <div className="viewing-box">
          <h4>👁️ Record Viewing Outcome</h4>
          <div className="viewing-buttons">
            <button
              className="btn success"
              onClick={() => recordViewingOutcome('accepted')}
            >
              ✅ Tenant Accepted
            </button>
            <button
              className="btn warning"
              onClick={() => recordViewingOutcome('declined')}
            >
              ❌ Tenant Declined
            </button>
            <button
              className="btn secondary"
              onClick={() => recordViewingOutcome('no_show')}
            >
              🚫 Tenant No-Show
            </button>
          </div>
          <small>After acceptance, you can mark the property as taken.</small>
        </div>
      )}

      {/* Mark as taken button (after accepted viewing) */}
      {user.role === 'manager' &&
       viewings.some(v => v.outcome === 'accepted') &&
       listing.status !== 'taken' && (
        <div className="taken-box">
          <button className="btn success" onClick={markAsTaken}>
            🏠 Mark as Taken
          </button>
        </div>
      )}

      {/* Tenant confirmation prompt */}
      {user.role === 'tenant' && rentalConfirmation && !rentalConfirmation.tenant_confirmed && (
        <div className="confirm-rental-box">
          <h4>Did you rent this house?</h4>
          <div className="confirm-buttons">
            <button className="btn success" onClick={() => tenantConfirmRental(true)}>
              ✅ Yes, I rented it
            </button>
            <button className="btn danger" onClick={() => tenantConfirmRental(false)}>
              ❌ No, I did not
            </button>
          </div>
        </div>
      )}

      {/* Payment proof upload (tenant, after rental confirmed) */}
      {user.role === 'tenant' && rentalConfirmation?.tenant_confirmed && (
        <div className="payment-proof-box">
          <h4>Upload Payment Proof (Optional)</h4>
          <p>Upload screenshot, receipt photo, or record an audio message confirming payment.</p>
          <div className="proof-upload-buttons">
            <input
              type="file"
              id="payment-proof-file"
              style={{ display: 'none' }}
              onChange={(e) => {
                if (e.target.files[0]) {
                  const proofType = e.target.files[0].type.startsWith('image/') ? 'screenshot' : 'receipt_photo';
                  uploadPaymentProof(e.target.files[0], proofType);
                }
              }}
              accept="image/*,.pdf,.mp3,.m4a"
            />
            <button
              className="btn secondary"
              onClick={() => document.getElementById('payment-proof-file').click()}
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : '📎 Upload Proof'}
            </button>
          </div>
          {paymentProofs.length > 0 && (
            <div className="proof-list">
              <h5>Uploaded Proofs:</h5>
              {paymentProofs.map(proof => (
                <div key={proof.id} className="proof-item">
                  <a href={proof.file_url} target="_blank" rel="noopener noreferrer">
                    {proof.proof_type} – {new Date(proof.created_at).toLocaleString()}
                  </a>
                  {proof.verified ? (
                    <span className="verified-badge">✅ Verified</span>
                  ) : (
                    <span className="pending-badge">⏳ Pending</span>
                  )}
                  {/* Admin can verify directly in chat */}
                  {(user.role === 'admin' || user.role === 'super-admin') && !proof.verified && (
                    <button className="btn small" onClick={() => verifyPaymentProof(proof.id)}>
                      Verify
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
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