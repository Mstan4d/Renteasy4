// src/shared/services/referralsService.js
import { supabase } from '../lib/supabaseClient';

export const referralsService = {
  // Create referral
  async createReferral(referrerId, referredId, referralCode) {
    try {
      const { data, error } = await supabase
        .from('referrals')
        .insert([{
          referrer_id: referrerId,
          referred_id: referredId,
          referral_code: referralCode,
          status: 'signed_up',
          bonus_amount: 5000,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating referral:', error);
      throw error;
    }
  },

  // Get user's referrals
  async getUserReferrals(userId) {
    try {
      const { data, error } = await supabase
        .from('referrals')
        .select(`
          *,
          referred:referred_id (id, name, email, role, created_at)
        `)
        .eq('referrer_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching referrals:', error);
      throw error;
    }
  },

  // Update referral status when referred user rents
  async markAsRented(referredId) {
    try {
      const { data, error } = await supabase
        .from('referrals')
        .update({
          status: 'rented',
          updated_at: new Date().toISOString()
        })
        .eq('referred_id', referredId)
        .eq('status', 'signed_up')
        .select()
        .single();

      if (error) throw error;

      // If referral found, create commission record
      if (data) {
        await supabase
          .from('commissions')
          .insert([{
            amount: data.bonus_amount,
            commission_type: 'referral',
            recipient_id: data.referrer_id,
            recipient_type: 'referrer',
            status: 'pending',
            description: `Referral bonus: ${data.referred?.name || 'User'} rented a house`,
            created_at: new Date().toISOString()
          }]);
      }

      return data;
    } catch (error) {
      console.error('Error marking referral as rented:', error);
      throw error;
    }
  }
};