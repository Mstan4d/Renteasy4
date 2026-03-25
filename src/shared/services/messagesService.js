// src/shared/services/messagesService.js
import { supabase } from '../lib/supabaseClient';

export const messagesService = {
  async initiateContact(listingId, userId, userRole) {
    try {
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
        estate_firm_id: listing.estate_firm_id,
        landlord_id: listing.landlord_id,
        tenant_id: listing.tenant_id,
        user_id: listing.user_id
      });

      // Check if listing is active
      if (listing.status === 'rented' || listing.status === 'rejected' || listing.status === 'inactive') {
        throw new Error('This property is no longer available');
      }

      // Determine the other party ID
      let otherPartyId = null;
      let otherPartyRole = null;
      
      if (listing.poster_role === 'estate-firm' && listing.estate_firm_id) {
        // Try to get estate firm profile
        const { data: firmProfile, error: firmError } = await supabase
          .from('estate_firm_profiles')
          .select('user_id, firm_name')
          .eq('id', listing.estate_firm_id)
          .maybeSingle();
        
        if (firmProfile) {
          otherPartyId = firmProfile.user_id;
          otherPartyRole = 'estate-firm';
          console.log('Found estate firm profile, using user_id:', otherPartyId);
        } else {
          // Try direct profile lookup
          const { data: directProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', listing.estate_firm_id)
            .maybeSingle();
          
          if (directProfile) {
            otherPartyId = directProfile.id;
            otherPartyRole = 'estate-firm';
            console.log('Using estate_firm_id as direct profile ID:', otherPartyId);
          } else if (listing.user_id) {
            otherPartyId = listing.user_id;
            otherPartyRole = 'estate-firm';
            console.log('Using listing.user_id as fallback:', otherPartyId);
          } else {
            throw new Error('Unable to find the estate firm\'s profile. Please contact support.');
          }
        }
        
      } else if (listing.poster_role === 'landlord' && listing.landlord_id) {
        otherPartyId = listing.landlord_id;
        otherPartyRole = 'landlord';
        
      } else if (listing.poster_role === 'tenant' && listing.tenant_id) {
        otherPartyId = listing.tenant_id;
        otherPartyRole = 'tenant';
        
      } else if (listing.user_id) {
        otherPartyId = listing.user_id;
        otherPartyRole = listing.poster_role || 'user';
      }

      if (!otherPartyId) {
        throw new Error('Unable to identify property owner. Please contact support.');
      }

      // Verify other party exists in profiles
      const { data: otherProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', otherPartyId)
        .maybeSingle();

      if (!otherProfile) {
        throw new Error('The property owner\'s profile was not found. Please contact support.');
      }

      // Don't allow self-contact
      if (userId === otherPartyId) {
        throw new Error('You cannot contact yourself for your own listing');
      }

      // Check for existing chat
      const { data: existingChat } = await supabase
        .from('chats')
        .select('id')
        .eq('listing_id', listingId)
        .eq('tenant_id', userId)
        .maybeSingle();

      if (existingChat) {
        return { chatId: existingChat.id, existing: true };
      }

      // Determine monitoring manager
      let monitoringManagerId = null;
      if (listing.managed_by) {
        const { data: managerProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', listing.managed_by)
          .maybeSingle();
        if (managerProfile) monitoringManagerId = managerProfile.id;
      }

      // Create chat
      const chatData = {
        listing_id: listingId,
        tenant_id: userId,
        other_party_id: otherPartyId,
        participant1_id: userId,
        participant2_id: otherPartyId,
        participant1_role: userRole,
        participant2_role: otherPartyRole,
        monitoring_manager_id: monitoringManagerId,
        chat_type: this.getChatType(listing.poster_role),
        status: 'active',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        unread_count: 1,
        needs_manager: listing.poster_role === 'tenant' && !listing.managed_by,
        estate_firm_listing: listing.poster_role === 'estate-firm',
        manager_assigned: !!monitoringManagerId
      };

      console.log('Creating chat with:', {
        tenant_id: userId,
        other_party_id: otherPartyId,
        participant2_role: otherPartyRole
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

      // Add initial message
      const initialMessage = this.getInitialMessage(listing.poster_role, listing.title);
      await supabase.from('messages').insert([{
        chat_id: newChat.id,
        sender_id: userId,
        content: initialMessage,
        is_system_message: true,
        created_at: new Date().toISOString()
      }]);

      // Notify managers if needed
      if (listing.poster_role === 'tenant' && !listing.managed_by) {
        await this.notifyAvailableManagers(listing, newChat.id);
      }
      if (monitoringManagerId) {
        await this.notifyManager(monitoringManagerId, listingId, newChat.id);
      }

      return { 
        chatId: newChat.id, 
        existing: false,
        listingTitle: listing.title
      };

    } catch (error) {
      console.error('Error in initiateContact:', error);
      throw error;
    }
  },

  getChatType(posterRole) {
    const types = {
      'estate-firm': 'tenant_estate_firm',
      'landlord': 'tenant_landlord',
      'tenant': 'tenant_tenant'
    };
    return types[posterRole] || 'direct';
  },

  getInitialMessage(posterRole, listingTitle) {
    const messages = {
      'estate-firm': `👋 Hello! You've contacted the estate firm for "${listingTitle}". They will respond shortly.`,
      'landlord': `👋 Hello! You've contacted the landlord for "${listingTitle}". Please be respectful.`,
      'tenant': `👋 Hello! You've contacted the outgoing tenant for "${listingTitle}". They can provide information.`,
      'default': `👋 Hello! You've expressed interest in "${listingTitle}". The owner will respond shortly.`
    };
    return messages[posterRole] || messages.default;
  },

  async notifyManager(managerId, listingId, chatId) {
    await supabase.from('notifications').insert([{
      user_id: managerId,
      title: 'New Chat to Monitor',
      message: 'A tenant has contacted a landlord. Please monitor.',
      type: 'chat_monitoring',
      data: { listingId, chatId },
      created_at: new Date().toISOString()
    }]);
  },

  async notifyAvailableManagers(listing, chatId) {
    const { data: managers } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'manager')
      .eq('verified', true)
      .eq('state', listing.state)
      .limit(10);

    if (managers?.length) {
      const notifications = managers.map(manager => ({
        user_id: manager.id,
        title: 'New Tenant Inquiry',
        message: `A tenant is interested in a property in ${listing.city || listing.state}.`,
        type: 'tenant_inquiry',
        data: { listingId: listing.id, chatId },
        created_at: new Date().toISOString()
      }));
      await supabase.from('notifications').insert(notifications);
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
        listing:listing_id (id, title, images, price, address),
        other_party:other_party_id (id, full_name, avatar_url),
        tenant:tenant_id (id, full_name)
      `)
      .or(`tenant_id.eq.${userId},other_party_id.eq.${userId},monitoring_manager_id.eq.${userId}`)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async markChatAsRead(chatId) {
    await supabase
      .from('chats')
      .update({ unread_count: 0 })
      .eq('id', chatId);
  }
};