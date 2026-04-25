// src/modules/messaging/pages/Messages.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../shared/lib/supabaseClient';
import { messagesService } from '../../../shared/services/messagesService';
import Header from '../../../shared/components/Header';
import RentEasyLoader from '../../../shared/components/RentEasyLoader';
import { Home, Shield, Paperclip, X, Image, Video, File } from 'lucide-react';
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
  const [userRole, setUserRole] = useState(null);
  const [isStaff, setIsStaff] = useState(false);
  const [staffRole, setStaffRole] = useState(null);
  const [rentalConfirmation, setRentalConfirmation] = useState(null);
  const [showDispute, setShowDispute] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  
  // File upload states
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [showFilePreview, setShowFilePreview] = useState(false);
  const [isProviderChat, setIsProviderChat] = useState(false);
  const [otherParticipant, setOtherParticipant] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const subscriptionRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Get user role on mount
  useEffect(() => {
    const getUserRole = async () => {
      if (!user) return;
      try {
        const { data: roleData } = await supabase
          .from('estate_firm_profiles')
          .select('staff_role, is_staff_account')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (roleData) {
          setIsStaff(roleData.is_staff_account || false);
          setStaffRole(roleData.staff_role);
        }
        setUserRole(user.role);
      } catch (err) {
        console.warn('Could not fetch user role:', err);
        setUserRole(user.role);
      }
    };
    getUserRole();
  }, [user]);

  // Scroll to bottom on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Detect keyboard on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.visualViewport) {
        const viewportHeight = window.visualViewport.height;
        const windowHeight = window.innerHeight;
        const isKeyboardOpen = viewportHeight < windowHeight - 100;
        
        if (isKeyboardOpen) {
          document.body.classList.add('keyboard-visible');
          setTimeout(() => scrollToBottom(), 100);
        } else {
          document.body.classList.remove('keyboard-visible');
        }
      }
    };

    window.visualViewport?.addEventListener('resize', handleResize);
    return () => window.visualViewport?.removeEventListener('resize', handleResize);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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
     console.log('Params:', { listingId, chatId });
    if (!user) {
      navigate('/login');
      return;
    }
    if (chatId) {
      console.log('Loading existing chat with ID:', chatId);
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

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isValidUUID = (uuid) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuid && typeof uuid === 'string' && uuidRegex.test(uuid);
};

  const fetchListing = async (id) => {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  };

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

    // Check if it's a provider chat (no listing_id or invalid UUID)
    let listingData = null;
    let isProvider = false;
    if (!chatData.listing_id || !isValidUUID(chatData.listing_id)) {
      isProvider = true;
    } else {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('id', chatData.listing_id)
        .maybeSingle();
      if (error || !data) {
        isProvider = true;
      } else {
        listingData = data;
      }
    }

    if (!hasChatAccess(chatData)) {
      alert('You do not have permission to access this chat');
      navigate('/listings');
      return;
    }

    setChat(chatData);
    setIsProviderChat(isProvider);

    if (isProvider) {
      const otherId = chatData.participant1_id === user.id ? chatData.participant2_id : chatData.participant1_id;
      if (otherId) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, full_name, role, avatar_url')
          .eq('id', otherId)
          .single();
        setOtherParticipant(profile);
      }
      setListing(null);
    } else {
      setListing(listingData);
      await loadRentalConfirmation(listingData.id, id);
    }
console.log('Loading chat ID:', id);
console.log('Chat data:', chatData);
console.log('isValidUUID(chatData.listing_id):', isValidUUID(chatData.listing_id));
    await fetchParticipantProfiles(chatData);
    await fetchMessages(id);
  } catch (error) {
    console.error('Error loading chat:', error);
    alert('Failed to load chat');
  } finally {
    setLoading(false);
  }
};

  const loadOrCreateChat = async (id) => {
    try {
      setLoading(true);
      
      if (!isValidUUID(id)) {
        alert('Invalid listing ID');
        navigate('/listings');
        return;
      }

      const listingData = await fetchListing(id);
      setListing(listingData);
      
      const result = await messagesService.initiateContact(id, user.id, user.role);
      
      if (result.existing) {
        navigate(`/dashboard/messages/chat/${result.chatId}`);
      } else {
        navigate(`/dashboard/messages/chat/${result.chatId}`);
      }
      
    } catch (error) {
      console.error('Error creating chat:', error);
      alert(error.message);
      navigate('/listings');
    } finally {
      setLoading(false);
    }
  };

  const hasChatAccess = (chat) => {
    if (!user) return false;
    if (user.role === 'admin' || user.role === 'super-admin') return true;
    
    if (user.role === 'estate-firm') {
      if (isStaff) {
        if (staffRole === 'associate') {
          return chat.created_by_staff_id === user.id;
        }
        if (staffRole === 'executive') {
          return true;
        }
      }
      return true;
    }
    
    return (
      user.id === chat.participant1_id ||
      user.id === chat.participant2_id ||
      user.id === chat.monitoring_manager_id
    );
  };

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

    if (!error && data) {
      const profileMap = {};
      data.forEach(p => { profileMap[p.id] = p; });
      setParticipantProfiles(profileMap);
    }
  };

  const fetchMessages = async (id) => {
    console.log('🔍 Fetching messages for chat ID:', id);
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', id)
      .order('created_at', { ascending: true });

     if (error) {
    console.error('❌ Error fetching messages:', error);
  } else {
    console.log('✅ Fetched messages count:', data?.length);
    setMessages(data || []);
  }

    const unread = data.filter(m => m.sender_id !== user.id && !m.read_at);
    if (unread.length > 0) {
      await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .in('id', unread.map(m => m.id));
    }
  };

  const loadRentalConfirmation = async (listingId, chatId) => {
    const { data } = await supabase
      .from('rental_confirmations')
      .select('*')
      .eq('listing_id', listingId)
      .eq('chat_id', chatId)
      .maybeSingle();
    
    setRentalConfirmation(data);
  };

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

  // File upload handling
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      const maxSize = 50 * 1024 * 1024; // 50MB
      if (file.size > maxSize) {
        alert(`${file.name} is too large. Max size 50MB`);
        return false;
      }
      return true;
    });
    
    setSelectedFiles(prev => [...prev, ...validFiles]);
    setShowFilePreview(true);
    e.target.value = '';
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    if (selectedFiles.length === 1) {
      setShowFilePreview(false);
    }
  };

  const getFileIcon = (file) => {
    if (file.type.startsWith('image/')) return <Image size={20} />;
    if (file.type.startsWith('video/')) return <Video size={20} />;
    return <File size={20} />;
  };

  const uploadFile = async (file, chatId) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${chatId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `chat-attachments/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('chat-attachments')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from('chat-attachments')
      .getPublicUrl(filePath);

    return {
      url: urlData.publicUrl,
      name: file.name,
      type: file.type,
      size: file.size
    };
  };

  const sendMessageWithFiles = async () => {
    if ((!messageText.trim() && selectedFiles.length === 0) || !chat) return;

    if (chat.state !== 'active' || chat.admin_locked) {
      alert('This chat is locked. You cannot send messages.');
      return;
    }

    setUploading(true);
    
    try {
      // Upload all files first
      const uploadedFiles = [];
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        try {
          const uploaded = await uploadFile(file, chat.id);
          uploadedFiles.push(uploaded);
          setUploadProgress(prev => ({ ...prev, [i]: 100 }));
        } catch (error) {
          console.error(`Error uploading ${file.name}:`, error);
          alert(`Failed to upload ${file.name}. Please try again.`);
          setUploading(false);
          return;
        }
      }

      // Create message with attachments
      const newMsg = {
        chat_id: chat.id,
        sender_id: user.id,
        content: messageText.trim() || (uploadedFiles.length > 0 ? '📎 File attached' : ''),
        attachments: uploadedFiles,
        is_system_message: false,
        created_at: new Date().toISOString(),
      };

      // Add to UI immediately
      setMessages((prev) => [...prev, newMsg]);
      setMessageText('');
      setSelectedFiles([]);
      setShowFilePreview(false);
      setUploadProgress({});

      // Save to database
      const { error } = await supabase.from('messages').insert([newMsg]);
      if (error) {
        console.error('Error sending message:', error);
        alert('Failed to send message');
        setMessages((prev) => prev.filter(m => m.created_at !== newMsg.created_at));
      }else {
  console.log('Message inserted successfully');
}
    } catch (error) {
      console.error('Error sending message with files:', error);
      alert('Failed to send message');
    }
     finally {
      setUploading(false);
    }
  };

  const sendMessage = async () => {
    if (!messageText.trim() && selectedFiles.length === 0) return;
    await sendMessageWithFiles();
  };

  // Render attachment preview
  const renderAttachment = (attachment, idx) => {
    if (attachment.type?.startsWith('image/')) {
      return (
        <a href={attachment.url} target="_blank" rel="noopener noreferrer" key={idx} className="message-attachment image">
          <img src={attachment.url} alt={attachment.name} />
        </a>
      );
    } else if (attachment.type?.startsWith('video/')) {
      return (
        <video key={idx} controls className="message-attachment video">
          <source src={attachment.url} type={attachment.type} />
          Your browser does not support the video tag.
        </video>
      );
    } else {
      return (
        <a href={attachment.url} target="_blank" rel="noopener noreferrer" key={idx} className="message-attachment document">
          <File size={20} />
          <span>{attachment.name}</span>
          <small>({formatFileSize(attachment.size)})</small>
        </a>
      );
    }
  };

  // Rest of the rental confirmation functions (same as before)
  const handleConfirmRental = async (role) => {
    if (!chat || !listing) return;
    
    const progress = getConfirmationProgress();
    const roleConfig = progress.roles?.[role];
    
    if (roleConfig?.requiresPrevious) {
      const previousRole = roleConfig.previousRole;
      const previousConfirmed = progress.roles?.[previousRole]?.confirmed;
      
      if (!previousConfirmed) {
        alert(`Please wait for ${previousRole} to confirm first.`);
        return;
      }
    }
    
    setUploading(true);
    try {
      const updateData = {};
      
      if (role === 'tenant') {
        updateData.tenant_confirmed = true;
        updateData.tenant_confirmed_by = user.id;
        updateData.tenant_confirmed_at = new Date().toISOString();
      } else if (role === 'manager') {
        updateData.manager_confirmed = true;
        updateData.manager_confirmed_by = user.id;
        updateData.manager_confirmed_at = new Date().toISOString();
      } else if (role === 'landlord') {
        updateData.landlord_confirmed = true;
        updateData.landlord_confirmed_by = user.id;
        updateData.landlord_confirmed_at = new Date().toISOString();
      } else if (role === 'estateFirm') {
        updateData.estate_firm_confirmed = true;
        updateData.estate_firm_confirmed_by = user.id;
        updateData.estate_firm_confirmed_at = new Date().toISOString();
      }
      
      if (rentalConfirmation?.id) {
        await supabase
          .from('rental_confirmations')
          .update(updateData)
          .eq('id', rentalConfirmation.id);
      } else {
        await supabase
          .from('rental_confirmations')
          .insert({
            listing_id: listing.id,
            chat_id: chat.id,
            ...updateData,
            current_stage: 'pending'
          });
      }
      
      await supabase.from('messages').insert({
        chat_id: chat.id,
        sender_id: '2253f74f-2dc3-4a87-ad03-e897d1e13353',
        content: `✅ ${role.toUpperCase()} has confirmed that this property has been rented.`,
        is_system_message: true,
        created_at: new Date().toISOString()
      });
      
      await loadRentalConfirmation(listing.id, chat.id);
      alert(`${role} confirmation recorded!`);
    } catch (error) {
      console.error('Error confirming rental:', error);
      alert('Failed to confirm. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleAdminFinalize = async () => {
    const progress = getConfirmationProgress();
    
    let allConfirmed = true;
    let missingRole = '';
    
    if (listing.poster_role === 'estate-firm') {
      if (!progress.roles?.tenant?.confirmed) {
        allConfirmed = false;
        missingRole = 'Tenant';
      }
      if (!progress.roles?.estateFirm?.confirmed) {
        allConfirmed = false;
        missingRole = 'Estate Firm';
      }
    } else if (listing.poster_role === 'tenant') {
      if (!progress.roles?.tenant?.confirmed) {
        allConfirmed = false;
        missingRole = 'Incoming Tenant';
      }
      if (!progress.roles?.manager?.confirmed) {
        allConfirmed = false;
        missingRole = 'Manager';
      }
    } else if (listing.poster_role === 'landlord') {
      if (!progress.roles?.tenant?.confirmed) {
        allConfirmed = false;
        missingRole = 'Tenant';
      }
      if (!progress.roles?.landlord?.confirmed) {
        allConfirmed = false;
        missingRole = 'Landlord';
      }
      if (!progress.roles?.manager?.confirmed) {
        allConfirmed = false;
        missingRole = 'Manager';
      }
    }
    
    if (!allConfirmed) {
      alert(`Cannot finalize yet. Waiting for ${missingRole} confirmation.`);
      return;
    }
    
    if (!window.confirm('All parties have confirmed. Finalize rental?')) return;
    
    setUploading(true);
    try {
      const rentalAmount = listing.price || 0;
      
      await supabase
        .from('rental_confirmations')
        .update({
          admin_confirmed: true,
          admin_confirmed_by: user.id,
          admin_confirmed_at: new Date().toISOString(),
          current_stage: 'completed',
          commission_distributed: listing.poster_role !== 'estate-firm'
        })
        .eq('id', rentalConfirmation.id);
      
      if (listing.poster_role !== 'estate-firm') {
        const managerShare = rentalAmount * 0.025;
        const referrerShare = rentalAmount * 0.015;
        
        await supabase.from('commissions').insert({
          listing_id: listing.id,
          manager_id: chat.monitoring_manager_id,
          referrer_id: listing.user_id,
          rental_amount: rentalAmount,
          manager_share: managerShare,
          referrer_share: referrerShare,
          platform_share: rentalAmount * 0.035,
          status: 'pending_distribution'
        });
      }
      
      await supabase
        .from('listings')
        .update({
          status: 'rented',
          rented_at: new Date().toISOString(),
          rented_by: user.id
        })
        .eq('id', listing.id);
      
      const commissionText = listing.poster_role !== 'estate-firm' 
        ? `Commission: Manager ₦${(rentalAmount * 0.025).toLocaleString()}, Referrer ₦${(rentalAmount * 0.015).toLocaleString()}`
        : `No commission (Estate Firm Listing)`;
      
      await supabase.from('messages').insert({
        chat_id: chat.id,
        sender_id: '2253f74f-2dc3-4a87-ad03-e897d1e13353',
        content: `🏠 RENTAL FINALIZED: Property marked as rented. ${commissionText}`,
        is_system_message: true,
        created_at: new Date().toISOString()
      });
      
      alert('Rental finalized successfully!');
      window.location.reload();
    } catch (error) {
      console.error('Error finalizing rental:', error);
      alert('Failed to finalize rental.');
    } finally {
      setUploading(false);
    }
  };

  const handleAdminOverride = async () => {
    const reason = prompt('Reason for override (required):');
    if (!reason) return;
    
    setUploading(true);
    try {
      await supabase
        .from('rental_confirmations')
        .update({
          admin_confirmed: true,
          admin_confirmed_by: user.id,
          admin_confirmed_at: new Date().toISOString(),
          admin_override: true,
          override_reason: reason,
          current_stage: 'completed',
          commission_distributed: listing.poster_role !== 'estate-firm'
        })
        .eq('id', rentalConfirmation.id);
      
      await supabase.from('messages').insert({
        chat_id: chat.id,
        sender_id: '2253f74f-2dc3-4a87-ad03-e897d1e13353',
        content: `👑 ADMIN OVERRIDE: Rental confirmed by admin. Reason: ${reason}`,
        is_system_message: true,
        created_at: new Date().toISOString()
      });
      
      alert('Override successful!');
      window.location.reload();
    } catch (error) {
      console.error('Error overriding:', error);
      alert('Failed to override.');
    } finally {
      setUploading(false);
    }
  };

  const handleRaiseDispute = async () => {
    if (!disputeReason) return;
    
    setUploading(true);
    try {
      await supabase
        .from('rental_confirmations')
        .update({
          disputed: true,
          dispute_reason: disputeReason,
          current_stage: 'disputed'
        })
        .eq('id', rentalConfirmation.id);
      
      await supabase.from('messages').insert({
        chat_id: chat.id,
        sender_id: user.id,
        content: `⚖️ DISPUTE RAISED: ${disputeReason}. Admin will review.`,
        is_system_message: true,
        created_at: new Date().toISOString()
      });
      
      alert('Dispute raised. Admin will investigate.');
      setShowDispute(false);
      setDisputeReason('');
    } catch (error) {
      console.error('Error raising dispute:', error);
    } finally {
      setUploading(false);
    }
  };

  const getConfirmationProgress = () => {
    if (!rentalConfirmation) return { progress: 0, text: 'No confirmation started', roles: null };
    
    if (listing.poster_role === 'estate-firm') {
      const tenantConfirmed = rentalConfirmation.tenant_confirmed;
      const estateFirmConfirmed = rentalConfirmation.estate_firm_confirmed;
      const adminConfirmed = rentalConfirmation.admin_confirmed;
      
      let confirmedCount = 0;
      if (tenantConfirmed) confirmedCount++;
      if (estateFirmConfirmed) confirmedCount++;
      if (adminConfirmed) confirmedCount++;
      
      const isEstateFirm = user.role === 'estate-firm' && user.id === listing.user_id;
      
      return {
        progress: (confirmedCount / 3) * 100,
        text: `${confirmedCount}/3 confirmations received`,
        roles: {
          tenant: { 
            confirmed: tenantConfirmed, 
            canConfirm: user.role === 'tenant' && user.id === chat?.participant2_id, 
            label: 'Tenant',
            order: 1
          },
          estateFirm: { 
            confirmed: estateFirmConfirmed, 
            canConfirm: isEstateFirm && tenantConfirmed,
            label: 'Estate Firm',
            order: 2,
            requiresPrevious: true,
            previousRole: 'tenant'
          },
          admin: { 
            confirmed: adminConfirmed, 
            canConfirm: (user.role === 'admin' || user.role === 'super-admin') && estateFirmConfirmed,
            label: 'Admin',
            order: 3,
            requiresPrevious: true,
            previousRole: 'estateFirm'
          }
        }
      };
    } else if (listing.poster_role === 'tenant') {
      const tenantConfirmed = rentalConfirmation.tenant_confirmed;
      const managerConfirmed = rentalConfirmation.manager_confirmed;
      const adminConfirmed = rentalConfirmation.admin_confirmed;
      
      let confirmedCount = 0;
      if (tenantConfirmed) confirmedCount++;
      if (managerConfirmed) confirmedCount++;
      if (adminConfirmed) confirmedCount++;
      
      return {
        progress: (confirmedCount / 3) * 100,
        text: `${confirmedCount}/3 confirmations received`,
        roles: {
          tenant: { 
            confirmed: tenantConfirmed, 
            canConfirm: user.role === 'tenant' && (user.id === chat.participant1_id || user.id === chat.participant2_id),
            label: 'Incoming Tenant',
            order: 1
          },
          manager: { 
            confirmed: managerConfirmed, 
            canConfirm: user.role === 'manager' && chat?.monitoring_manager_id === user.id && tenantConfirmed,
            label: 'Manager',
            order: 2,
            requiresPrevious: true,
            previousRole: 'tenant'
          },
          admin: { 
            confirmed: adminConfirmed, 
            canConfirm: (user.role === 'admin' || user.role === 'super-admin') && managerConfirmed,
            label: 'Admin',
            order: 3,
            requiresPrevious: true,
            previousRole: 'manager'
          }
        }
      };
    } else if (listing.poster_role === 'landlord') {
      const tenantConfirmed = rentalConfirmation.tenant_confirmed;
      const landlordConfirmed = rentalConfirmation.landlord_confirmed;
      const managerConfirmed = rentalConfirmation.manager_confirmed;
      const adminConfirmed = rentalConfirmation.admin_confirmed;
      
      let confirmedCount = 0;
      if (tenantConfirmed) confirmedCount++;
      if (landlordConfirmed) confirmedCount++;
      if (managerConfirmed) confirmedCount++;
      if (adminConfirmed) confirmedCount++;
      
      return {
        progress: (confirmedCount / 4) * 100,
        text: `${confirmedCount}/4 confirmations received`,
        roles: {
          tenant: { 
            confirmed: tenantConfirmed, 
            canConfirm: user.role === 'tenant' && user.id === chat?.participant2_id, 
            label: 'Tenant',
            order: 1
          },
          landlord: { 
            confirmed: landlordConfirmed, 
            canConfirm: user.role === 'landlord' && user.id === listing.user_id && tenantConfirmed,
            label: 'Landlord',
            order: 2,
            requiresPrevious: true,
            previousRole: 'tenant'
          },
          manager: { 
            confirmed: managerConfirmed, 
            canConfirm: user.role === 'manager' && chat?.monitoring_manager_id === user.id && landlordConfirmed,
            label: 'Manager',
            order: 3,
            requiresPrevious: true,
            previousRole: 'landlord'
          },
          admin: { 
            confirmed: adminConfirmed, 
            canConfirm: (user.role === 'admin' || user.role === 'super-admin') && managerConfirmed,
            label: 'Admin',
            order: 4,
            requiresPrevious: true,
            previousRole: 'manager'
          }
        }
      };
    }
    
    return { progress: 0, text: '', roles: null };
  };

  const getUserSpecificMessage = (msg) => {
    if (!msg.is_system_message) return msg.content;
    return msg.content;
  };

  const canSendMessage = () => {
  if (chat?.state !== 'active') return false;
  if (chat?.admin_locked) return false;
  if (isProviderChat) return true;
  if (listing?.status === 'rented') return false;
  return true;
};

  if (loading) {
    return <RentEasyLoader message="Loading Messages..." fullScreen />;
  }

  if (!chat) {
  return (
    <div className="not-found-container">
      <h2>Chat Not Found</h2>
      <button onClick={() => navigate('/listings')} className="btn-primary">
        Back to Listings
      </button>
    </div>
  );
}

  const progress = getConfirmationProgress();
  const showRentalFlow = !isProviderChat && listing && listing.status !== 'rented';

  return (
    <div className="messages-page">
      <Header />
      <div className="messages-container">
        {/* Role Banner for Staff */}
        {user.role === 'estate-firm' && isStaff && staffRole === 'associate' && (
          <div className="role-banner">
            <Shield size={16} />
            <span>Associate View - You can only reply to messages from your listings</span>
          </div>
        )}

        {/* Header */}
        <header className="messages-header">
  <div className="header-top">
    {isProviderChat ? (
      <h2>Chat with {otherParticipant?.full_name || 'Provider'}</h2>
    ) : (
      <h2>{listing?.title}</h2>
    )}
    <div className="listing-tags">
      {!isProviderChat && listing && (
        <>
          <span className={`tag tag-${listing.poster_role}`}>
            {listing.poster_role === 'tenant' ? '👤 Outgoing Tenant' :
             listing.poster_role === 'landlord' ? '🏠 Landlord' : '🏢 Estate Firm'}
          </span>
          {listing.poster_role !== 'estate-firm' && <span className="tag tag-commission">💰 7.5% Commission</span>}
          {listing.poster_role === 'estate-firm' && <span className="tag tag-estate">🏢 No Commission</span>}
        </>
      )}
      {isProviderChat && (
        <span className="tag tag-provider">💬 Service Provider</span>
      )}
    </div>
  </div>
  <div className="header-status">
    {!isProviderChat && listing && (
      <span className={`status-badge status-${listing.status === 'rented' ? 'rented' : chat?.state}`}>
        Status: {listing.status === 'rented' ? 'RENTED' : (chat?.state?.replace('_', ' ').toUpperCase() || 'ACTIVE')}
      </span>
    )}
    {chat?.monitoring_manager_id && <span className="manager-badge">👨‍💼 Manager Assigned</span>}
  </div>
</header>

        {/* Scrollable Area */}
        <div className="messages-scroll-area" ref={messagesContainerRef}>
          {/* Rental Confirmation Flow */}
          {!isProviderChat && showRentalFlow && progress.roles && (
            <div className="rental-confirmation-flow">
              <div className="confirmation-header">
                <h3>🏠 Rental Confirmation Process</h3>
                <p>All parties must confirm before commission is released</p>
              </div>

              <div className="progress-section">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${progress.progress}%` }}></div>
                </div>
                <div className="progress-text">{progress.text}</div>
              </div>

              <div className="confirmation-steps">
                {Object.entries(progress.roles).map(([key, role]) => (
                  <div key={key} className={`step ${role.confirmed ? 'completed' : 'pending'} ${role.requiresPrevious && !role.confirmed ? 'disabled' : ''}`}>
                    <div className="step-icon">{role.confirmed ? '✓' : '○'}</div>
                    <div className="step-content">
                      <div className="step-title">{role.label}</div>
                      <div className="step-status">
                        {role.confirmed ? 'Confirmed ✓' : 'Waiting for confirmation...'}
                      </div>
                      {role.canConfirm && !role.confirmed && !rentalConfirmation?.admin_confirmed && (
                        <button 
                          className="btn-confirm"
                          onClick={() => handleConfirmRental(key)}
                          disabled={uploading}
                        >
                          Confirm Rental
                        </button>
                      )}
                    </div>
                    <div className="step-order">Step {role.order}</div>
                  </div>
                ))}
              </div>

              {/* Admin Actions */}
              {(user.role === 'admin' || user.role === 'super-admin') && rentalConfirmation && !rentalConfirmation.admin_confirmed && (
                <div className="admin-actions">
                  {(() => {
                    let allConfirmed = true;
                    if (listing.poster_role === 'estate-firm') {
                      allConfirmed = rentalConfirmation.tenant_confirmed && rentalConfirmation.estate_firm_confirmed;
                    } else if (listing.poster_role === 'tenant') {
                      allConfirmed = rentalConfirmation.tenant_confirmed && rentalConfirmation.manager_confirmed;
                    } else if (listing.poster_role === 'landlord') {
                      allConfirmed = rentalConfirmation.tenant_confirmed && rentalConfirmation.landlord_confirmed && rentalConfirmation.manager_confirmed;
                    }
                    
                    if (allConfirmed) {
                      return (
                        <button className="btn-finalize" onClick={handleAdminFinalize} disabled={uploading}>
                          ✅ Finalize Rental & Release {listing.poster_role !== 'estate-firm' ? 'Commission' : 'Rental'}
                        </button>
                      );
                    } else {
                      return (
                        <button className="btn-override" onClick={handleAdminOverride} disabled={uploading}>
                          ⚠️ Override & Force Complete
                        </button>
                      );
                    }
                  })()}
                </div>
              )}

              {/* Dispute Section */}
              {!rentalConfirmation?.admin_confirmed && !rentalConfirmation?.disputed && (
                <div className="dispute-section">
                  {!showDispute ? (
                    <button className="btn-dispute" onClick={() => setShowDispute(true)}>
                      ⚖️ Raise Dispute
                    </button>
                  ) : (
                    <div className="dispute-form">
                      <textarea
                        placeholder="Describe why you're disputing this rental confirmation..."
                        value={disputeReason}
                        onChange={(e) => setDisputeReason(e.target.value)}
                        rows="3"
                      />
                      <div className="dispute-actions">
                        <button onClick={handleRaiseDispute} disabled={!disputeReason || uploading}>
                          Submit Dispute
                        </button>
                        <button onClick={() => setShowDispute(false)}>Cancel</button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Dispute Display */}
              {rentalConfirmation?.disputed && (
                <div className="dispute-active">
                  <div className="dispute-icon">⚖️</div>
                  <div>
                    <strong>Dispute Active</strong>
                    <p>{rentalConfirmation.dispute_reason}</p>
                    <small>Admin will review and resolve this dispute.</small>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Completed State */}
          {!isProviderChat && listing?.status === 'rented' && (
            <div className="rental-confirmation-completed">
              <div className="completed-icon">✅</div>
              <h4>Property Successfully Rented</h4>
              <p>This property has been rented and {listing.poster_role !== 'estate-firm' ? 'commission has been distributed.' : 'the transaction is complete.'}</p>
            </div>
          )}

          {/* Messages Thread */}
          <div className="messages-thread">
            {messages.map((msg, idx) => {
              const isOwn = msg.sender_id === user.id;
              const senderRole = msg.sender_role || (msg.sender_id === '00000000-0000-0000-0000-000000000000' ? 'system' : '');
              const senderName = participantProfiles[msg.sender_id]?.full_name || 
                                (msg.sender_id === '00000000-0000-0000-0000-000000000000' ? 'System' : 
                                msg.sender_id?.slice(0, 8) || 'User');
              
              const displayContent = getUserSpecificMessage(msg);
              
              return (
                <div key={idx} className={`msg ${isOwn ? 'own' : ''} ${msg.is_system_message ? 'system' : ''}`}>
                  <div className="msg-header">
                    <small className="msg-sender">
                      {msg.is_system_message ? '⚙️ SYSTEM' : senderRole.toUpperCase() + ' ' + senderName}
                    </small>
                    <small className="msg-time">{formatTime(msg.created_at)}</small>
                  </div>
                  {displayContent && <p className="msg-text">{displayContent}</p>}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="msg-attachments">
                      {msg.attachments.map((attachment, i) => renderAttachment(attachment, i))}
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Message Input with File Upload */}
        {canSendMessage() && (
          <div className="message-input">
            {/* File Preview Modal */}
            {showFilePreview && selectedFiles.length > 0 && (
              <div className="file-preview-modal">
                <div className="file-preview-header">
                  <h4>Attachments ({selectedFiles.length})</h4>
                  <button onClick={() => {
                    setSelectedFiles([]);
                    setShowFilePreview(false);
                  }} className="close-preview">
                    <X size={18} />
                  </button>
                </div>
                <div className="file-preview-list">
                  {selectedFiles.map((file, idx) => (
                    <div key={idx} className="file-preview-item">
                      <div className="file-info">
                        {getFileIcon(file)}
                        <div className="file-details">
                          <span className="file-name">{file.name}</span>
                          <span className="file-size">{formatFileSize(file.size)}</span>
                        </div>
                      </div>
                      {uploadProgress[idx] !== undefined && (
                        <div className="upload-progress">
                          <div className="progress-bar" style={{ width: `${uploadProgress[idx]}%` }}></div>
                        </div>
                      )}
                      <button onClick={() => removeFile(idx)} className="remove-file">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="input-wrapper">
              <button 
                className="file-upload-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                title="Attach file"
              >
                <Paperclip size={20} />
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleFileSelect}
                  multiple
                  accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                />
              </button>
              
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder={selectedFiles.length > 0 ? "Add a caption..." : "Type message or attach files..."}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                disabled={uploading}
              />
              
              <button 
                onClick={sendMessage} 
                disabled={(!messageText.trim() && selectedFiles.length === 0) || uploading}
              >
                {uploading ? 'Sending...' : 'Send'}
              </button>
            </div>
            
            {selectedFiles.length > 0 && !showFilePreview && (
              <div className="files-indicator" onClick={() => setShowFilePreview(true)}>
                <Paperclip size={14} />
                <span>{selectedFiles.length} file(s) ready</span>
              </div>
            )}
          </div>
        )}

        {/* Locked chat message */}
        {!canSendMessage() && listing.status !== 'rented' && (
          <div className="chat-locked-message">
            <p>🔒 This chat is {chat.state}. You cannot send messages.</p>
            {chat.state === 'pending_manager' && (
              <p>A manager will be assigned shortly to assist with your inquiry.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;