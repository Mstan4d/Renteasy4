// src/shared/services/messagesService.js
import { supabase } from '../lib/supabaseClient';

export const messagesService = {
  async initiateContact(listingId, userId, userRole) {
    try {
      // First, get the listing details
      const { data: listing, error: listingError } = await supabase
        .from('listings')
        .select(`
          *,
          user:user_id (id, full_name, email, role, verified),
          manager:managed_by (id, full_name, email, phone)
        `)
        .eq('id', listingId)
        .single();

      if (listingError) throw listingError;
      if (!listing) throw new Error('Listing not found');

      console.log('Listing for contact:', {
        id: listing.id,
        posterRole: listing.poster_role,
        posterId: listing.user_id,
        managedById: listing.managed_by
      });

      const validPosterRoles = ['tenant', 'landlord', 'estate-firm'];
      if (!validPosterRoles.includes(listing.poster_role)) {
        throw new Error(`Invalid listing type: "${listing.poster_role}". Must be one of: ${validPosterRoles.join(', ')}`);
      }

      let chatType, otherPartyId, monitoringManagerId = null;

      switch (listing.poster_role) {
        case 'tenant': // Outgoing tenant
          if (!listing.managed_by) {
            chatType = 'tenant_manager_pending';
            otherPartyId = null;
          } else {
            chatType = 'tenant_manager';
            otherPartyId = listing.managed_by;
            monitoringManagerId = listing.managed_by;
          }
          break;

        case 'landlord':
          chatType = 'tenant_landlord';
          otherPartyId = listing.user_id;
          monitoringManagerId = listing.managed_by;
          break;

        case 'estate-firm':
          chatType = 'tenant_estate_firm';
          otherPartyId = listing.user_id;
          monitoringManagerId = null;
          break;

        default:
          throw new Error(`Unhandled poster role: ${listing.poster_role}`);
      }

      // Check if chat already exists
      const { data: existingChat } = await supabase
        .from('chats')
        .select('id')
        .eq('property_id', listingId)
        .eq('tenant_id', userId)
        .single();

      if (existingChat) {
        return { chatId: existingChat.id, existing: true };
      }

      if (userId === listing.user_id) {
        throw new Error('You cannot contact yourself for your own listing');
      }

      const chatData = {
        property_id: listingId,
        tenant_id: userId,
        chat_type: chatType,
        other_party_id: otherPartyId,
        monitoring_manager_id: monitoringManagerId,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...(chatType === 'tenant_manager_pending' && { needs_manager: true })
      };

      const { data: newChat, error: chatError } = await supabase
        .from('chats')
        .insert([chatData])
        .select()
        .single();

      if (chatError) throw chatError;

      let initialMessage = '';
      if (chatType === 'tenant_manager_pending') {
        initialMessage = `👋 Hello! You've expressed interest in this property. A RentEasy manager will be assigned shortly to assist you.`;
      } else if (chatType === 'tenant_manager') {
        initialMessage = `👋 Hello! You've contacted the manager for this property. How can I assist you with your inquiry about "${listing.title}"?`;
      } else if (chatType === 'tenant_landlord') {
        initialMessage = `👋 Hello! You've contacted the landlord for "${listing.title}". Please be respectful and discuss property details.`;
      } else if (chatType === 'tenant_estate_firm') {
        initialMessage = `👋 Hello! You've contacted the estate firm for "${listing.title}". They will respond to your inquiry shortly.`;
      }

      if (initialMessage) {
        await supabase
          .from('messages')
          .insert([{
            chat_id: newChat.id,
            sender_id: userId,
            content: initialMessage,
            is_system_message: true,
            system_type: 'initial_contact',
            created_at: new Date().toISOString()
          }]);
      }

      if (chatType === 'tenant_landlord' && monitoringManagerId) {
        await this.notifyManager(monitoringManagerId, listingId, newChat.id);
      }

      if (chatType === 'tenant_manager_pending') {
        await this.notifyAvailableManagers(listingId, newChat.id);
      }

      return { 
        chatId: newChat.id, 
        existing: false,
        chatType: chatType,
        listingTitle: listing.title
      };

    } catch (error) {
      console.error('Error in initiateContact:', error);
      throw error;
    }
  },

  async notifyManager(managerId, listingId, chatId) {
    try {
      await supabase
        .from('notifications')
        .insert([{
          user_id: managerId,
          title: 'New Chat to Monitor',
          message: 'A tenant has contacted a landlord in your area. Please monitor the conversation.',
          type: 'chat_monitoring',
          data: { listingId, chatId },
          created_at: new Date().toISOString()
        }]);
    } catch (error) {
      console.error('Error notifying manager:', error);
    }
  },

  async notifyAvailableManagers(listingId, chatId) {
    try {
      const { data: listing } = await supabase
        .from('listings')
        .select('state, city, lga')
        .eq('id', listingId)
        .single();

      if (!listing) return;

      const { data: managers } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('role', 'manager')
        .eq('verified', true)
        .eq('state', listing.state)
        .limit(10);

      if (managers && managers.length > 0) {
        const notifications = managers.map(manager => ({
          user_id: manager.id,
          title: 'New Tenant Inquiry',
          message: `A tenant is interested in a property in ${listing.city || listing.state}. Click to accept management.`,
          type: 'tenant_inquiry',
          data: { listingId, chatId },
          created_at: new Date().toISOString()
        }));

        await supabase
          .from('notifications')
          .insert(notifications);
      }
    } catch (error) {
      console.error('Error notifying available managers:', error);
    }
  },

  async getChatMessages(chatId) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  },

  async sendMessage(chatId, senderId, content, isSystemMessage = false) {
    try {
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
        .update({ updated_at: new Date().toISOString() })
        .eq('id', chatId);

      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  async getUserChats(userId) {
    try {
      const { data, error } = await supabase
        .from('chats')
        .select(`
          *,
          property:property_id (id, title, images, price, address),
          other_party:other_party_id (id, full_name, avatar_url),
          tenant:tenant_id (id, full_name, avatar_url),
          manager:monitoring_manager_id (id, full_name)
        `)
        .or(`tenant_id.eq.${userId},other_party_id.eq.${userId},monitoring_manager_id.eq.${userId}`)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user chats:', error);
      throw error;
    }
  },

  // ✅ NEW METHOD: Initiate chat with a provider (estate firm or service provider)
  async initiateProviderChat(providerId, userId, userRole) {
    try {
      // Check if a chat already exists between these two users
      const { data: existingChat, error: checkError } = await supabase
        .from('chats')
        .select('id')
        .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`)
        .or(`participant1_id.eq.${providerId},participant2_id.eq.${providerId}`)
        .maybeSingle();

      if (checkError) throw checkError;
      if (existingChat) {
        return { chatId: existingChat.id };
      }

      // Create new chat
      const { data: newChat, error: insertError } = await supabase
        .from('chats')
        .insert({
          participant1_id: userId,
          participant2_id: providerId,
          state: 'active',
          chat_type: 'provider',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Add a system message
      await supabase.from('messages').insert({
        chat_id: newChat.id,
        sender_id: '00000000-0000-0000-0000-000000000000',
        content: 'Chat started',
        is_system: true
      });

      return { chatId: newChat.id };
    } catch (error) {
      console.error('Error initiating provider chat:', error);
      throw error;
    }
  }
};