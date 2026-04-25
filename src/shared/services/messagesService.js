// src/shared/services/messagesService.js
import { supabase } from '../lib/supabaseClient';

export const messagesService = {
  async initiateContact(listingId, userId, userRole) {
    try {
      console.log('=== initiateContact DEBUG ===');
      console.log('Listing ID:', listingId);
      console.log('User ID:', userId);
      console.log('User Role:', userRole);

      // Get user profile
      const { data: userProfile, error: userError } = await supabase
        .from('profiles')
        .select('id, full_name, role')
        .eq('id', userId)
        .single();

      if (userError || !userProfile) {
        throw new Error('Your profile was not found. Please log out and log in again.');
      }

      // Get listing
      const { data: listing, error: listingError } = await supabase
        .from('listings')
        .select('*')
        .eq('id', listingId)
        .single();

      if (listingError || !listing) {
        throw new Error('Listing not found or has been removed');
      }

      console.log('Listing found:', {
        id: listing.id,
        poster_role: listing.poster_role,
        assigned_manager_id: listing.assigned_manager_id,
        managed_by: listing.managed_by,
        poster_id: listing.user_id
      });

      // Check if listing is active
      if (listing.status === 'rented' || listing.status === 'rejected' || listing.status === 'inactive') {
        throw new Error('This property is no longer available');
      }

      let otherPartyId = null;
      let otherPartyRole = null;
      let monitoringManagerId = null;
      let chatType = null;

      // ============================================================
      // BUSINESS RULES FOR OUTGOING TENANT LISTINGS
      // ============================================================
      
      if (listing.poster_role === 'tenant') {
        // This is an outgoing tenant listing
        
        if (userRole === 'tenant' && userId !== listing.user_id) {
          // INCOMING TENANT contacting the listing
          const assignedManagerId = listing.assigned_manager_id || listing.managed_by;
          
          if (!assignedManagerId) {
            throw new Error('This listing is waiting for a manager to be assigned. Please try again later.');
          }
          
          // Incoming tenant chats with the assigned MANAGER
          otherPartyId = assignedManagerId;
          otherPartyRole = 'manager';
          monitoringManagerId = assignedManagerId;
          chatType = 'tenant_manager';
          
          console.log('✅ Incoming Tenant → Manager');
        } 
        else if (userRole === 'manager') {
          // MANAGER contacting the listing (to chat with outgoing tenant)
          otherPartyId = listing.user_id;
          otherPartyRole = 'tenant';
          monitoringManagerId = userId;
          chatType = 'tenant_manager';
          
          console.log('✅ Manager → Outgoing Tenant');
        }
        else if (userRole === 'tenant' && userId === listing.user_id) {
          // OUTGOING TENANT contacting their own listing (should go through manager)
          const assignedManagerId = listing.assigned_manager_id || listing.managed_by;
          
          if (!assignedManagerId) {
            throw new Error('No manager assigned to this listing yet.');
          }
          
          otherPartyId = assignedManagerId;
          otherPartyRole = 'manager';
          monitoringManagerId = assignedManagerId;
          chatType = 'tenant_manager';
          
          console.log('✅ Outgoing Tenant → Manager');
        }
      }
      
      // Landlord Listing
      else if (listing.poster_role === 'landlord') {
        if (userRole === 'tenant') {
          // Tenant contacting landlord listing
          const assignedManagerId = listing.assigned_manager_id || listing.managed_by;
          
          if (assignedManagerId) {
            // Landlord has assigned a manager - tenant chats with manager
            otherPartyId = assignedManagerId;
            otherPartyRole = 'manager';
            monitoringManagerId = assignedManagerId;
            chatType = 'tenant_manager';
            console.log('✅ Tenant → Manager (Landlord assigned)');
          } else {
            // No manager - tenant chats with landlord directly
            otherPartyId = listing.landlord_id || listing.user_id;
            otherPartyRole = 'landlord';
            chatType = 'tenant_landlord';
            console.log('✅ Tenant → Landlord (Direct)');
          }
        }
        else if (userRole === 'manager') {
          // Manager contacting landlord listing
          otherPartyId = listing.landlord_id || listing.user_id;
          otherPartyRole = 'landlord';
          monitoringManagerId = userId;
          chatType = 'tenant_landlord';
          console.log('✅ Manager → Landlord');
        }
        else if (userRole === 'landlord') {
          // Landlord responding
          otherPartyId = listing.assigned_manager_id || listing.user_id;
          otherPartyRole = listing.assigned_manager_id ? 'manager' : 'landlord';
          chatType = 'tenant_landlord';
          console.log('✅ Landlord responding');
        }
      }
      
      // Estate Firm Listing
      else if (listing.poster_role === 'estate-firm') {
        if (userRole === 'tenant') {
          // Tenant contacting estate firm
          otherPartyId = listing.user_id;
          otherPartyRole = 'estate-firm';
          chatType = 'tenant_estate_firm';
          console.log('✅ Tenant → Estate Firm');
        }
        else if (userRole === 'estate-firm') {
          // Estate firm responding
          otherPartyId = listing.user_id;
          otherPartyRole = 'estate-firm';
          chatType = 'tenant_estate_firm';
          console.log('✅ Estate Firm responding');
        }
      }

      // Validate we have a party to contact
      if (!otherPartyId) {
        throw new Error('Unable to identify who to contact. Please contact support.');
      }

      // Don't allow self-contact
      if (userId === otherPartyId) {
        throw new Error('You cannot contact yourself for your own listing');
      }

      // Check for existing chat
      const { data: existingChat } = await supabase
        .from('chats')
        .select('id, chat_type, state')
        .eq('listing_id', listingId)
        .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`)
        .maybeSingle();

      if (existingChat) {
        console.log('Existing chat found:', existingChat.id);
        return { 
          chatId: existingChat.id, 
          existing: true, 
          chatType: existingChat.chat_type,
          state: existingChat.state
        };
      }

      // Create new chat - ONLY use columns that exist in your table
      const chatData = {
        listing_id: listingId,
        participant1_id: userId,
        participant2_id: otherPartyId,
        participant1_role: userRole,
        participant2_role: otherPartyRole,
        monitoring_manager_id: monitoringManagerId,
        chat_type: chatType,
        state: 'active',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        unread_count: 1,
        needs_manager: false,
        estate_firm_listing: listing.poster_role === 'estate-firm',
        manager_assigned: !!monitoringManagerId,
        commission_applied: listing.poster_role !== 'estate-firm',
        other_party_id: otherPartyId,
        tenant_id: userRole === 'tenant' ? userId : null
      };

      console.log('Creating new chat with existing columns:', {
        chat_type: chatType,
        participant1: userId,
        participant2: otherPartyId,
        monitoring_manager: monitoringManagerId
      });

      const { data: newChat, error: chatError } = await supabase
        .from('chats')
        .insert([chatData])
        .select()
        .single();

      if (chatError) {
        console.error('Chat creation error:', chatError);
        throw new Error(`Failed to create chat: ${chatError.message}`);
      }

      // Add initial system message
      let initialMessage = '';
      
      if (listing.poster_role === 'tenant') {
        if (userRole === 'tenant' && userId !== listing.user_id) {
          initialMessage = `👋 Hello! You're chatting with the RentEasy manager for "${listing.title}". They will help you with the rental process and coordinate with the outgoing tenant.`;
        } else if (userRole === 'manager') {
          initialMessage = `👋 Hello! You're the assigned manager for "${listing.title}". You can now communicate with the outgoing tenant.`;
        } else if (userRole === 'tenant' && userId === listing.user_id) {
          initialMessage = `👋 Hello! You're the outgoing tenant for "${listing.title}". The assigned manager will help find a new tenant.`;
        }
      } else if (listing.poster_role === 'landlord') {
        if (userRole === 'tenant') {
          initialMessage = `👋 Hello! You're interested in "${listing.title}". ${monitoringManagerId ? 'A RentEasy manager is monitoring this conversation.' : 'The landlord will respond shortly.'}`;
        } else if (userRole === 'manager') {
          initialMessage = `👋 Hello! You're monitoring this conversation for "${listing.title}".`;
        }
      } else if (listing.poster_role === 'estate-firm') {
        initialMessage = `👋 Hello! You've contacted the estate firm for "${listing.title}". They will respond shortly.`;
      }

      await supabase.from('messages').insert({
        chat_id: newChat.id,
        sender_id: '2253f74f-2dc3-4a87-ad03-e897d1e13353',
        content: initialMessage,
        is_system_message: true,
        created_at: new Date().toISOString()
      });

      // Send notifications
      await this.sendNotification(newChat.id, listing, otherPartyId, monitoringManagerId);

      return { 
        chatId: newChat.id, 
        existing: false,
        listingTitle: listing.title,
        chatType: chatType
      };

    } catch (error) {
      console.error('Error in initiateContact:', error);
      throw error;
    }
  },

  async sendNotification(chatId, listing, otherPartyId, monitoringManagerId) {
    // Notify the other party
    if (otherPartyId) {
      await supabase.from('notifications').insert({
        user_id: otherPartyId,
        title: 'New Message',
        message: `Someone is interested in "${listing.title}". Click to respond.`,
        type: 'new_chat',
        data: { chatId, listingId: listing.id },
        created_at: new Date().toISOString()
      });
    }

    // Notify monitoring manager if different
    if (monitoringManagerId && monitoringManagerId !== otherPartyId) {
      await supabase.from('notifications').insert({
        user_id: monitoringManagerId,
        title: 'New Chat to Monitor',
        message: `A new conversation has started for "${listing.title}". Please monitor.`,
        type: 'chat_monitoring',
        data: { chatId, listingId: listing.id },
        created_at: new Date().toISOString()
      });
    }
  },

  async getChatMessages(chatId) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async sendMessage(chatId, senderId, content, isSystemMessage = false) {
    const { data, error } = await supabase
      .from('messages')
      .insert([{
        chat_id: chatId,
        sender_id: senderId,
        content: content,
        is_system_message: isSystemMessage,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;

    await supabase
      .from('chats')
      .update({ 
        last_message: content, 
        last_message_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        unread_count: supabase.raw('unread_count + 1')
      })
      .eq('id', chatId)
      .neq('participant1_id', senderId);

    return data;
  },

  async getUserChats(userId) {
    const { data, error } = await supabase
      .from('chats')
      .select(`
        *,
        listing:listing_id (id, title, images, price, address, poster_role, status),
        other_party:other_party_id (id, full_name, avatar_url, role)
      `)
      .or(`participant1_id.eq.${userId},participant2_id.eq.${userId},monitoring_manager_id.eq.${userId}`)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async markChatAsRead(chatId, userId) {
    await supabase
      .from('chats')
      .update({ unread_count: 0 })
      .eq('id', chatId);
    
    await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('chat_id', chatId)
      .neq('sender_id', userId)
      .is('read_at', null);
  },
    // ✅ ADD THE NEW FUNCTION HERE, INSIDE THE OBJECT
  async initiateProviderChat(providerUserId, userId, userRole) {
    // providerUserId: the user ID of the service provider or estate firm
    // userId: current user ID
    // userRole: current user role (tenant, landlord, etc.)

    // Check if a chat already exists between these two users
    const { data: existingChat } = await supabase
      .from('chats')
      .select('id')
      .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`)
      .or(`participant1_id.eq.${providerUserId},participant2_id.eq.${providerUserId}`)
      .maybeSingle();

    if (existingChat) {
      return { chatId: existingChat.id, existing: true };
    }

    // Determine chat_type
    const chatType = 'provider';

    // Create new chat
    const chatData = {
      participant1_id: userId,
      participant2_id: providerUserId,
      participant1_role: userRole,
      participant2_role: 'service-provider || estate-firm',
      chat_type: chatType,
      state: 'active',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      unread_count: 1,
    };

    const { data: newChat, error } = await supabase
      .from('chats')
      .insert([chatData])
      .select()
      .single();

    if (error) throw error;

    // Add initial system message
    await supabase.from('messages').insert({
      chat_id: newChat.id,
      sender_id: '2253f74f-2dc3-4a87-ad03-e897d1e13353',
      content: `👋 You have started a conversation with a service provider.`,
      is_system_message: true,
      created_at: new Date().toISOString(),
    });

    return { chatId: newChat.id, existing: false };
  }
};

