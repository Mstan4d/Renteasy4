import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../shared/lib/supabaseClient';
import SubscriptionModal from '../components/SubscriptionModal';
import RentEasyLoader from '../../../shared/components/RentEasyLoader';
import {
  Crown, Zap, Calendar, CheckCircle, XCircle,
  ArrowLeft, CreditCard, Receipt, AlertCircle
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

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);

      // 1. Get estate firm profile ID
      const { data: firm, error: firmError } = await supabase
        .from('estate_firm_profiles')
        .select('id, subscription_status, subscription_expiry, free_posts_remaining')
        .eq('user_id', user.id)
        .single();
      if (firmError) throw firmError;
      setEstateFirmId(firm.id);

      // 2. Get current active subscription
      const { data: currentSub, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('profile_id', user.id)
        .eq('status', 'active')
        .gte('expires_at', new Date().toISOString())
        .order('expires_at', { ascending: false })
        .maybeSingle();
      if (subError) throw subError;

      // 3. Get subscription history (all past subscriptions, including pending)
      const { data: history, error: histError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('profile_id', user.id)
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
  return <RentEasyLoader message="Loading your clients..." fullScreen />;
}

  const hasActiveSubscription = subscription?.status === 'active';

  return (
    <div className="estate-subscription">
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
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              <CreditCard size={16} /> Renew or Upgrade
            </button>
          </div>
        ) : (
          <div className="plan-details free">
            <div className="detail-row">
              <span>Status:</span>
              <span className="badge warning">Free</span>
            </div>
            <div className="detail-row">
              <span>Free posts remaining:</span>
              <span>{subscription?.free_posts_remaining ?? 25}</span>
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
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              <Crown size={16} /> Subscribe Now
            </button>
          </div>
        )}
      </div>

      {/* Subscription History */}
      {subscriptionHistory.length > 0 && (
        <div className="history-section">
          <h3>Subscription History</h3>
          <div className="history-table">
            <table>
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

      {/* Subscription Modal */}
      <SubscriptionModal
        show={showModal}
        onHide={() => setShowModal(false)}
        onSubscriptionSuccess={handleSubscriptionSuccess}
      />
    </div>
  );
};

export default EstateSubscription;