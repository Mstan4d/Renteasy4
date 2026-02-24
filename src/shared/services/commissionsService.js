// src/shared/services/commissionsService.js
import { supabase } from '../lib/supabaseClient';

export const commissionsService = {
  // Get user commissions
  async getUserCommissions(userId) {
    try {
      const { data, error } = await supabase
        .from('commissions')
        .select(`
          *,
          listing:listing_id (title, price, poster_role),
          recipient:recipient_id (name, email)
        `)
        .eq('recipient_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching commissions:', error);
      throw error;
    }
  },

  // Calculate commission for a listing
  calculateCommission(price, posterRole) {
    // BUSINESS RULE: Estate firms have 0% commission
    if (posterRole === 'estate-firm') {
      return {
        total: 0,
        manager: 0,
        poster: 0,
        rentEasy: 0
      };
    }

    // Regular commission: 7.5%
    const total = price * 0.075;
    return {
      total: parseFloat(total.toFixed(2)),
      manager: parseFloat((price * 0.025).toFixed(2)), // 2.5%
      poster: parseFloat((price * 0.015).toFixed(2)),  // 1.5%
      rentEasy: parseFloat((price * 0.035).toFixed(2)) // 3.5%
    };
  },

  // Format currency for display
  formatCurrency(amount) {
    if (!amount && amount !== 0) return '₦0';
    return `₦${amount.toLocaleString('en-NG')}`;
  }
};