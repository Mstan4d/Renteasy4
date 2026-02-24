// src/shared/services/profilesService.js
import { supabase } from '../lib/supabaseClient';

export const profilesService = {
  // Get user profile
  async getProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  },

  // Update user profile
  async updateProfile(userId, updates) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  // Verify user (admin only)
  async verifyUser(userId, adminId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          verified: true,
          needs_verification: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      // Log admin activity
      await supabase
        .from('admin_activities')
        .insert([{
          admin_id: adminId,
          action: 'verify_user',
          type: 'user',
          entity_id: userId,
          details: { verified: true },
          created_at: new Date().toISOString()
        }]);

      return data;
    } catch (error) {
      console.error('Error verifying user:', error);
      throw error;
    }
  },

  // Get all users (admin only)
  async getAllUsers(filters = {}) {
    try {
      let query = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters.role) {
        query = query.eq('role', filters.role);
      }
      if (filters.verified !== undefined) {
        query = query.eq('verified', filters.verified);
      }
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }
};