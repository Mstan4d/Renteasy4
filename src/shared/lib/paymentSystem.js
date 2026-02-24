// src/shared/lib/paymentSystem.js
import { supabase } from './supabaseClient';

class PaymentSystem {
  constructor() {
    this.bankDetails = {
      accountName: import.meta.env.VITE_BANK_ACCOUNT_NAME || 'RentEasy',
      accountNumber: import.meta.env.VITE_BANK_ACCOUNT_NUMBER || '1234567890',
      bankName: import.meta.env.VITE_BANK_NAME || 'Wema Bank',
    };
  }

  // Generate unique reference
  generateReference(prefix = 'RENT') {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  }

  // Create payment record
  async createPaymentRecord({ userId, amount, type, metadata = {} }) {
    const reference = this.generateReference();
    
    const { data, error } = await supabase
      .from('payments')
      .insert({
        user_id: userId,
        amount,
        payment_type: type,
        reference,
        metadata: {
          ...metadata,
          bank_details: this.bankDetails,
        },
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Verify payment (for manual bank transfers)
  async verifyPayment(reference, verifiedBy) {
    const { data, error } = await supabase
      .from('payments')
      .update({
        status: 'completed',
        verified_at: new Date().toISOString(),
        verified_by: verifiedBy,
        updated_at: new Date().toISOString()
      })
      .eq('reference', reference)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Reject payment
  async rejectPayment(reference, verifiedBy, reason = '') {
    const { data, error } = await supabase
      .from('payments')
      .update({
        status: 'failed',
        verified_at: new Date().toISOString(),
        verified_by: verifiedBy,
        updated_at: new Date().toISOString(),
        metadata: { rejection_reason: reason }
      })
      .eq('reference', reference)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Handle subscription payment
  async processSubscription(userId, planId, planName, planPrice, durationDays = 30) {
    // Create payment record
    const payment = await this.createPaymentRecord({
      userId,
      amount: planPrice,
      type: 'subscription',
      metadata: { 
        plan_id: planId, 
        plan_name: planName,
        duration_days: durationDays 
      }
    });

    // Return payment details with bank info
    return {
      payment,
      bankDetails: this.bankDetails,
      reference: payment.reference,
      amount: planPrice,
      plan: { name: planName, price: planPrice, duration_days: durationDays }
    };
  }

  // Handle boost payment
  async processBoost(userId, boostPackageId, serviceProviderId, packageName, packagePrice, durationDays = 7) {
    // Create payment record
    const payment = await this.createPaymentRecord({
      userId,
      amount: packagePrice,
      type: 'boost',
      metadata: { 
        boost_package_id: boostPackageId,
        service_provider_id: serviceProviderId,
        duration_days: durationDays,
        package_name: packageName
      }
    });

    return {
      payment,
      bankDetails: this.bankDetails,
      reference: payment.reference,
      amount: packagePrice,
      boostPackage: { name: packageName, price: packagePrice, duration_days: durationDays }
    };
  }

  // Check payment status
  async checkPaymentStatus(reference) {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('reference', reference)
      .single();

    if (error) throw error;
    return data;
  }

  // Get user payments
  async getUserPayments(userId, limit = 50) {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }

  // Activate subscription after payment verification
  async activateSubscription(paymentId) {
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*, user:user_id(id, email)')
      .eq('id', paymentId)
      .single();

    if (paymentError) throw paymentError;

    if (payment.status !== 'completed') {
      throw new Error('Payment not completed');
    }

    const { plan_id, plan_name, duration_days } = payment.metadata;
    
    // Create subscription
    const startsAt = new Date();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (duration_days || 30));

    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .insert({
        user_id: payment.user_id,
        plan_id: plan_id || 'monthly',
        status: 'active',
        amount_paid: payment.amount,
        payment_reference: payment.reference,
        starts_at: startsAt.toISOString(),
        expires_at: expiresAt.toISOString(),
        metadata: { 
          plan_name: plan_name || 'Monthly Subscription',
          payment_id: payment.id 
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (subError) throw subError;

    // Update service provider
    const { error: spError } = await supabase
      .from('service_providers')
      .update({
        has_active_subscription: true,
        subscription_id: subscription.id,
        subscription_end_date: expiresAt.toISOString(),
        free_posts_remaining: 999999, // Unlimited
        updated_at: new Date().toISOString()
      })
      .eq('user_id', payment.user_id);

    if (spError) throw spError;

    // Log activity
    await supabase.from('activities').insert({
      user_id: payment.user_id,
      type: 'subscription',
      action: 'activated',
      description: `Activated subscription: ${plan_name || 'Monthly'}`,
      created_at: new Date().toISOString()
    });

    return subscription;
  }

  // Activate boost after payment verification
  async activateBoost(paymentId) {
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .single();

    if (paymentError) throw paymentError;

    if (payment.status !== 'completed') {
      throw new Error('Payment not completed');
    }

    const { boost_package_id, service_provider_id, duration_days, package_name } = payment.metadata;
    
    // Calculate expiry
    const startsAt = new Date();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (duration_days || 7));

    // Create active boost
    const { data: activeBoost, error: boostActivationError } = await supabase
      .from('active_boosts')
      .insert({
        service_provider_id: service_provider_id,
        boost_package_id: boost_package_id || 'basic_boost',
        status: 'active',
        starts_at: startsAt.toISOString(),
        expires_at: expiresAt.toISOString(),
        payment_reference: payment.reference,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (boostActivationError) throw boostActivationError;

    // Update service provider
    const { error: spError } = await supabase
      .from('service_providers')
      .update({
        current_boost_id: activeBoost.id,
        marketplace_boost_expiry: expiresAt.toISOString(),
        marketplace_boost: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', service_provider_id);

    if (spError) throw spError;

    // Log activity
    await supabase.from('activities').insert({
      user_id: payment.user_id,
      type: 'boost',
      action: 'activated',
      description: `Activated boost package: ${package_name || 'Basic Boost'}`,
      created_at: new Date().toISOString()
    });

    return activeBoost;
  }

  // Get active subscription for user
  async getActiveSubscription(userId) {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .gte('expires_at', new Date().toISOString())
      .order('expires_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  // Get active boost for service provider
  async getActiveBoost(serviceProviderId) {
    const { data, error } = await supabase
      .from('active_boosts')
      .select('*')
      .eq('service_provider_id', serviceProviderId)
      .eq('status', 'active')
      .gte('expires_at', new Date().toISOString())
      .order('expires_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  // Update payment proof
  async updatePaymentProof(paymentId, proofUrl, fileName) {
    const { data, error } = await supabase
      .from('payments')
      .update({
        metadata: {
          proof_url: proofUrl,
          proof_file_name: fileName,
          proof_uploaded_at: new Date().toISOString()
        },
        updated_at: new Date().toISOString()
      })
      .eq('id', paymentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Get pending payments for admin
  async getPendingPayments(limit = 100) {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        user:user_id(id, email, name)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }

  // Record commission payment
  async recordCommissionPayment(listingId, userId, amount, reference) {
    const payment = await this.createPaymentRecord({
      userId,
      amount: amount,
      type: 'commission',
      metadata: {
        listing_id: listingId,
        reference: reference
      }
    });

    // Update listing to mark commission as paid
    await supabase
      .from('listings')
      .update({
        commission_paid: true,
        commission_paid_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', listingId);

    return payment;
  }

  // Handle commission earnings
  async recordEarnings(userId, amount, description, reference) {
    const payment = await this.createPaymentRecord({
      userId,
      amount: amount,
      type: 'earnings',
      metadata: {
        description: description,
        reference: reference
      }
    });

    return payment;
  }

  // Check if user can post (free posts or subscription)
  async canUserPost(userId) {
    const subscription = await this.getActiveSubscription(userId);
    
    if (subscription) {
      return { canPost: true, reason: 'active_subscription', subscription };
    }

    // Check free posts remaining
    const { data: serviceProvider, error } = await supabase
      .from('service_providers')
      .select('free_posts_remaining')
      .eq('user_id', userId)
      .single();

    if (error) {
      return { canPost: false, reason: 'profile_not_found' };
    }

    if (serviceProvider.free_posts_remaining > 0) {
      return { 
        canPost: true, 
        reason: 'free_posts_remaining', 
        postsRemaining: serviceProvider.free_posts_remaining 
      };
    }

    return { canPost: false, reason: 'no_posts_left' };
  }

  // Update free posts count
  async useFreePost(userId) {
    const { data: current, error: fetchError } = await supabase
      .from('service_providers')
      .select('free_posts_used, free_posts_remaining')
      .eq('user_id', userId)
      .single();

    if (fetchError) throw fetchError;

    const { error: updateError } = await supabase
      .from('service_providers')
      .update({
        free_posts_used: (current.free_posts_used || 0) + 1,
        free_posts_remaining: (current.free_posts_remaining || 10) - 1,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (updateError) throw updateError;

    return {
      freePostsUsed: (current.free_posts_used || 0) + 1,
      freePostsRemaining: (current.free_posts_remaining || 10) - 1
    };
  }

  // Get payment statistics
  async getPaymentStats(userId, startDate = null, endDate = null) {
    let query = supabase
      .from('payments')
      .select('*')
      .eq('user_id', userId);

    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data: payments, error } = await query;

    if (error) throw error;

    const completed = payments.filter(p => p.status === 'completed');
    const pending = payments.filter(p => p.status === 'pending');
    const failed = payments.filter(p => p.status === 'failed');

    return {
      totalCompleted: completed.reduce((sum, p) => sum + (p.amount || 0), 0),
      totalPending: pending.reduce((sum, p) => sum + (p.amount || 0), 0),
      totalFailed: failed.reduce((sum, p) => sum + (p.amount || 0), 0),
      completedCount: completed.length,
      pendingCount: pending.length,
      failedCount: failed.length,
      totalCount: payments.length
    };
  }

  // Upload payment proof to storage
  async uploadPaymentProof(file, reference) {
    const fileExt = file.name.split('.').pop();
    const fileName = `payment_proofs/${reference}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('renteasy-payments')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('renteasy-payments')
      .getPublicUrl(fileName);

    return publicUrl;
  }
}

// Create and export a single instance
export const paymentSystem = new PaymentSystem();