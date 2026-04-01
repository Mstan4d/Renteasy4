// src/shared/lib/paymentService.js
import { supabase } from './supabaseClient';

// Bank details – you can store these in system_settings table instead of hardcoding
const BANK_DETAILS = {
  bankName: 'Monie Point',
  accountName: 'Stable Pilla Resources',
  accountNumber: '8149113218',
};

export const paymentService = {
  generateReference(prefix = 'PAY') {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  },

  getBankDetails() {
    return BANK_DETAILS;
  },

  async createPayment({ userId, amount, type, reference, metadata = {} }) {
    const { data, error } = await supabase
      .from('payments')
      .insert({
        user_id: userId,
        amount,
        payment_type: type,
        reference,
        status: 'pending',
        metadata,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async uploadProof({ paymentId, userId, file }) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${paymentId}-${Date.now()}.${fileExt}`;
    const filePath = fileName;

    const { error: uploadError } = await supabase.storage
      .from('payment-proofs')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from('payment-proofs')
      .getPublicUrl(filePath);

    // Update payment metadata with proof URL
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        metadata: { proof_url: urlData.publicUrl, uploaded_at: new Date().toISOString() }
      })
      .eq('id', paymentId);

    if (updateError) throw updateError;

    return urlData.publicUrl;
  },

  async createSubscription({ userId, plan, paymentId }) {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + plan.duration_days * 24 * 60 * 60 * 1000);

    const { data, error } = await supabase
      .from('subscriptions')
      .insert({
        user_id: userId,
        plan_id: plan.id,
        payment_id: paymentId,
        amount: plan.price,
        status: 'pending', // will become active after admin verification
        starts_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async createBoost({ userId, package: boostPackage, paymentId }) {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + boostPackage.duration_days * 24 * 60 * 60 * 1000);

    const { data, error } = await supabase
      .from('active_boosts')
      .insert({
        user_id: userId,
        package_id: boostPackage.id,
        payment_id: paymentId,
        status: 'pending',
        starts_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};