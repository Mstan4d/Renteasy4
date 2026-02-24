// src/shared/services/adminService.js
import { supabase } from '../lib/supabaseClient';

export const adminService = {
  // Get pending KYC submissions
  async getPendingKycSubmissions() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('kyc_status', 'pending')
      .in('role', ['manager', 'estate-firm', 'service-provider']);
    
    if (error) throw error;
    return data;
  },

  // Verify user (approve KYC)
  async verifyUser(userId, adminId) {
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        is_kyc_verified: true,
        kyc_status: 'verified',
        kyc_verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) throw updateError;

    // Log admin activity
    await this.logAdminActivity(adminId, 'user_verified', userId);
    
    return { success: true };
  },

  // Reject KYC
  async rejectUserKyc(userId, adminId, reason) {
    const { error } = await supabase
      .from('profiles')
      .update({
        is_kyc_verified: false,
        kyc_status: 'rejected',
        kyc_rejected_at: new Date().toISOString(),
        kyc_rejection_reason: reason,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) throw error;

    await this.logAdminActivity(adminId, 'user_rejected', userId, { reason });
    return { success: true };
  },

  // Log admin activity (fix the column issue first!)
  async logAdminActivity(adminId, action, targetId, details = {}) {
    // Make sure you've fixed the column name issue first!
    const { error } = await supabase
      .from('admin_activities')
      .insert({
        admin_id: adminId,
        type: action,          // or whatever your column is named
        entity_id: targetId,
        details,
        created_at: new Date().toISOString()
      });
    
    if (error) console.error('Admin log error:', error);
  }
};