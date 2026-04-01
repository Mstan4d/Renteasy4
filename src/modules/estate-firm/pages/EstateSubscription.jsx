import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../shared/lib/supabaseClient';
import SubscriptionModal from '../components/SubscriptionModal';
import RentEasyLoader from '../../../shared/components/RentEasyLoader';
import {
  Crown, Zap, Calendar, CheckCircle, XCircle,
  ArrowLeft, CreditCard, Receipt, AlertCircle, Shield
} from 'lucide-react';
import './EstateSubscription.css';

const EstateSubscription = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [estateFirmId, setEstateFirmId] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [subscriptionHistory, setSubscriptionHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [userRole, setUserRole] = useState('principal');
  const [canSubscribe, setCanSubscribe] = useState(true);

  useEffect(() => {
    if (user) {
      getUserRole();
      loadData();
    }
  }, [user]);

  const getUserRole = async () => {
    try {
      const { data: roleData, error } = await supabase
        .from('estate_firm_profiles')
        .select('staff_role')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (!error && roleData) {
        const role = roleData.staff_role || 'principal';
        setUserRole(role);
        // Only Principal and Executive can subscribe
        setCanSubscribe(role === 'principal' || role === 'executive');
      }
    } catch (err) {
      console.warn('Could not fetch user role:', err);
      setCanSubscribe(true);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);

      // Get user role first to determine which firm ID to use
      let effectiveUserId = user.id;
      
      const { data: roleData } = await supabase
        .from('estate_firm_profiles')
        .select('staff_role, parent_estate_firm_id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      // If staff, use parent firm ID for subscription checks
      if (roleData?.staff_role === 'associate' || roleData?.staff_role === 'executive') {
        if (roleData.parent_estate_firm_id) {
          effectiveUserId = roleData.parent_estate_firm_id;
        }
      }

      // 1. Get estate firm profile
      const { data: firm, error: firmError } = await supabase
        .from('estate_firm_profiles')
        .select('id, subscription_status, subscription_expiry, free_posts_remaining')
        .eq('id', effectiveUserId)
        .single();
      if (firmError) throw firmError;
      setEstateFirmId(firm.id);

      // 2. Get current active subscription for the firm
      const { data: currentSub, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('profile_id', effectiveUserId)
        .eq('status', 'active')
        .gte('expires_at', new Date().toISOString())
        .order('expires_at', { ascending: false })
        .maybeSingle();
      if (subError) throw subError;

      // 3. Get subscription history for the firm
      const { data: history, error: histError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('profile_id', effectiveUserId)
        .order('created_at', { ascending: false });
      if (histError) throw histError;

      setSubscription(currentSub);
      setSubscriptionHistory(history || []);

    } catch (error) {
      console.error('Error loading subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscriptionSuccess = () => {
    loadData(); // refresh after subscription
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString();
  };

  const formatCurrency = (amount) => `₦${(amount || 0).toLocaleString()}`;

  if (loading) {
    return <RentEasyLoader message="Loading subscription data..." fullScreen />;
  }

  const hasActiveSubscription = subscription?.status === 'active';

  // Associates cannot access subscription page at all
  if (userRole === 'associate') {
    return (
      <div className="estate-subscription restricted">
        <div className="restricted-card">
          <Shield size={48} />
          <h2>Access Restricted</h2>
          <p>Only Firm Principal and Executives can manage subscriptions.</p>
          <p className="restricted-note">Please contact your firm administrator for subscription-related matters.</p>
          <button className="btn btn-primary" onClick={() => navigate('/dashboard/estate-firm')}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="estate-subscription">
      {/* Role Banner for Executive */}
      {userRole === 'executive' && (
        <div className="role-banner executive">
          <Shield size={16} />
          <span>Executive View - You can manage subscriptions for the firm</span>
        </div>
      )}

      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('/dashboard/estate-firm')}>
          <ArrowLeft size={20} /> Back to Dashboard
        </button>
        <h1>Subscription Management</h1>
        <p>Manage your plan, view benefits, and track your subscription history</p>
      </div>

      {/* Current Plan Card */}
      <div className="current-plan-card">
        <div className="plan-header">
          <Crown size={32} className="crown-icon" />
          <h2>{hasActiveSubscription ? 'Premium Plan' : 'Free Plan'}</h2>
        </div>

        {hasActiveSubscription ? (
          <div className="plan-details active">
            <div className="detail-row">
              <span>Status:</span>
              <span className="badge success">Active</span>
            </div>
            <div className="detail-row">
              <span>Plan Type:</span>
              <span>{subscription.plan_type || 'Premium Monthly'}</span>
            </div>
            <div className="detail-row">
              <span>Amount:</span>
              <span>{formatCurrency(subscription.amount)}</span>
            </div>
            <div className="detail-row">
              <span>Expires on:</span>
              <span>{formatDate(subscription.expires_at)}</span>
            </div>
            <div className="benefits-list">
              <h4>Your Benefits:</h4>
              <ul>
                <li><CheckCircle size={16} /> 0% Commission on all listings</li>
                <li><CheckCircle size={16} /> Unlimited property posts</li>
                <li><CheckCircle size={16} /> Priority support</li>
                <li><CheckCircle size={16} /> Advanced analytics</li>
              </ul>
            </div>
            {canSubscribe && (
              <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                <CreditCard size={16} /> Renew or Upgrade
              </button>
            )}
          </div>
        ) : (
          <div className="plan-details free">
            <div className="detail-row">
              <span>Status:</span>
              <span className="badge warning">Free</span>
            </div>
            <div className="detail-row">
              <span>Free posts remaining:</span>
              <span>{subscription?.free_posts_remaining ?? 15}</span>
            </div>
            <div className="benefits-list">
              <h4>Premium Benefits (upon subscription):</h4>
              <ul>
                <li><CheckCircle size={16} /> 0% Commission on all listings</li>
                <li><CheckCircle size={16} /> Unlimited property posts</li>
                <li><CheckCircle size={16} /> Priority support</li>
                <li><CheckCircle size={16} /> Advanced analytics</li>
              </ul>
            </div>
            {canSubscribe && (
              <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                <Crown size={16} /> Subscribe Now
              </button>
            )}
          </div>
        )}
      </div>

      {/* Subscription History - Only show if user has permission */}
      {canSubscribe && subscriptionHistory.length > 0 && (
        <div className="history-section">
          <h3>Subscription History</h3>
          <div className="history-table">
            <table className="subscription-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Plan</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Expires</th>
                </tr>
              </thead>
              <tbody>
                {subscriptionHistory.map((sub, idx) => (
                  <tr key={idx}>
                    <td>{formatDate(sub.created_at)}</td>
                    <td>{sub.plan_type || 'Premium'}</td>
                    <td>{formatCurrency(sub.amount)}</td>
                    <td>
                      <span className={`badge ${sub.status}`}>
                        {sub.status}
                      </span>
                    </td>
                    <td>{formatDate(sub.expires_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Subscription Modal - Only show if can subscribe */}
      {showModal && canSubscribe && (
        <SubscriptionModal
          show={showModal}
          onHide={() => setShowModal(false)}
          onSubscriptionSuccess={handleSubscriptionSuccess}
        />
      )}
    </div>
  );
};

export default EstateSubscription;