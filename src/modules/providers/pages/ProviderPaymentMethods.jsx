// src/modules/providers/pages/ProviderPaymentMethods.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../shared/lib/supabaseClient';
import {
  Plus, CreditCard, Building, Smartphone,
  CheckCircle, Edit2, Trash2, Shield,
  AlertCircle, ChevronRight
} from 'lucide-react';
import './ProviderPaymentMethods.css'; // external CSS

const ProviderPaymentMethods = () => {
  const { user } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMethod, setNewMethod] = useState({
    type: 'bank',
    name: '',
    number: '',
    makeDefault: false
  });

  // Fetch payment methods on mount
  useEffect(() => {
    if (user?.id) {
      fetchPaymentMethods();
    }
  }, [user]);

  const fetchPaymentMethods = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPaymentMethods(data || []);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMethod = async () => {
    if (!newMethod.name || !newMethod.number) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      // If setting as default, we need to unset any existing default
      if (newMethod.makeDefault) {
        const { error: updateError } = await supabase
          .from('payment_methods')
          .update({ is_default: false })
          .eq('user_id', user.id)
          .eq('is_default', true);

        if (updateError) throw updateError;
      }

      // Insert new method
      const { data, error } = await supabase
        .from('payment_methods')
        .insert([{
          user_id: user.id,
          type: newMethod.type,
          name: newMethod.name,
          account_number: newMethod.number,
          is_default: newMethod.makeDefault,
          verified: false, // new methods are unverified
          // For cards, you might collect expiry separately
        }])
        .select();

      if (error) throw error;

      // Refresh list
      await fetchPaymentMethods();
      setShowAddForm(false);
      setNewMethod({ type: 'bank', name: '', number: '', makeDefault: false });
    } catch (error) {
      console.error('Error adding payment method:', error);
      alert('Failed to add payment method. Please try again.');
    }
  };

  const handleSetDefault = async (id) => {
    try {
      // First, unset any existing default
      const { error: updateError } = await supabase
        .from('payment_methods')
        .update({ is_default: false })
        .eq('user_id', user.id)
        .eq('is_default', true);

      if (updateError) throw updateError;

      // Set the new default
      const { error } = await supabase
        .from('payment_methods')
        .update({ is_default: true })
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setPaymentMethods(paymentMethods.map(method => ({
        ...method,
        is_default: method.id === id
      })));
    } catch (error) {
      console.error('Error setting default:', error);
      alert('Failed to set default payment method.');
    }
  };

  const handleDeleteMethod = async (id) => {
    const method = paymentMethods.find(m => m.id === id);
    if (method?.is_default) {
      alert('Cannot delete default payment method. Please set another method as default first.');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this payment method?')) return;

    try {
      const { error } = await supabase
        .from('payment_methods')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setPaymentMethods(paymentMethods.filter(method => method.id !== id));
    } catch (error) {
      console.error('Error deleting payment method:', error);
      alert('Failed to delete payment method.');
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'bank': return <Building size={24} />;
      case 'mobile': return <Smartphone size={24} />;
      case 'card': return <CreditCard size={24} />;
      default: return <CreditCard size={24} />;
    }
  };

  if (loading) return <div className="loading">Loading payment methods...</div>;

  return (
    <div className="provider-payment-methods">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Payment Methods</h1>
        <p className="page-subtitle">Manage your bank accounts and payment options for withdrawals</p>
      </div>

      {/* Add New Method Button */}
      <button className="add-method-button" onClick={() => setShowAddForm(true)}>
        <Plus size={20} />
        <span>Add New Payment Method</span>
      </button>

      {/* Add Method Form */}
      {showAddForm && (
        <div className="add-form">
          <h3 className="form-title">Add New Payment Method</h3>
          
          <div className="form-group">
            <label className="form-label">Method Type</label>
            <select 
              value={newMethod.type}
              onChange={(e) => setNewMethod({...newMethod, type: e.target.value})}
              className="form-select"
            >
              <option value="bank">Bank Account</option>
              <option value="mobile">Mobile Wallet</option>
              <option value="card">Debit Card</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              {newMethod.type === 'bank' ? 'Bank Name' : 
               newMethod.type === 'mobile' ? 'Wallet Name' : 'Card Name'}
            </label>
            <input
              type="text"
              value={newMethod.name}
              onChange={(e) => setNewMethod({...newMethod, name: e.target.value})}
              placeholder={
                newMethod.type === 'bank' ? 'e.g., Guaranty Trust Bank' :
                newMethod.type === 'mobile' ? 'e.g., OPay' :
                'e.g., Visa Card'
              }
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              {newMethod.type === 'bank' ? 'Account Number' : 
               newMethod.type === 'mobile' ? 'Phone Number' : 'Card Number'}
            </label>
            <input
              type="text"
              value={newMethod.number}
              onChange={(e) => setNewMethod({...newMethod, number: e.target.value})}
              placeholder={
                newMethod.type === 'bank' ? '0123456789' :
                newMethod.type === 'mobile' ? '08123456789' :
                '1234 5678 9012 3456'
              }
              className="form-input"
            />
          </div>

          <div className="checkbox-group">
            <input
              type="checkbox"
              id="makeDefault"
              checked={newMethod.makeDefault}
              onChange={(e) => setNewMethod({...newMethod, makeDefault: e.target.checked})}
            />
            <label htmlFor="makeDefault">Set as default payment method</label>
          </div>

          <div className="form-actions">
            <button 
              className="cancel-button"
              onClick={() => {
                setShowAddForm(false);
                setNewMethod({ type: 'bank', name: '', number: '', makeDefault: false });
              }}
            >
              Cancel
            </button>
            <button className="save-button" onClick={handleAddMethod}>
              Add Payment Method
            </button>
          </div>
        </div>
      )}

      {/* Payment Methods List */}
      <div className="methods-list">
        {paymentMethods.length === 0 ? (
          <div className="empty-state">No payment methods added yet</div>
        ) : (
          paymentMethods.map((method) => (
            <div key={method.id} className="method-card">
              <div className="method-header">
                <div className="method-info">
                  <div className={`method-icon method-icon-${method.type}`}>
                    {getIcon(method.type)}
                  </div>
                  <div className="method-details">
                    <h3 className="method-name">{method.name}</h3>
                    <p className="method-type">
                      {method.type === 'bank' ? 'Bank Account' : 
                       method.type === 'mobile' ? 'Mobile Wallet' : 'Debit Card'}
                    </p>
                  </div>
                </div>
                
                <div className="method-status">
                  {method.is_default && (
                    <span className="default-badge">
                      <CheckCircle size={12} />
                      Default
                    </span>
                  )}
                  {method.verified ? (
                    <span className="verified-badge">
                      <Shield size={12} />
                      Verified
                    </span>
                  ) : (
                    <span className="pending-badge">
                      <AlertCircle size={12} />
                      Pending
                    </span>
                  )}
                </div>
              </div>

              <div className="method-number">{method.account_number}</div>
              
              <div className="method-footer">
                {method.expiry && (
                  <div className="expiry-text">Expires {method.expiry}</div>
                )}
                
                <div className="method-actions">
                  {!method.is_default && (
                    <button
                      className="action-button set-default"
                      onClick={() => handleSetDefault(method.id)}
                    >
                      <CheckCircle size={12} />
                      Set Default
                    </button>
                  )}
                  
                  <button
                    className="action-button delete-button"
                    onClick={() => handleDeleteMethod(method.id)}
                  >
                    <Trash2 size={12} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Security Information */}
      <div className="security-info">
        <div className="security-header">
          <Shield size={20} />
          <h4 className="security-title">Payment Security</h4>
        </div>
        <ul className="security-list">
          <li className="security-item">
            Your payment details are encrypted and stored securely
          </li>
          <li className="security-item">
            New payment methods require verification before use
          </li>
          <li className="security-item">
            You can only delete non-default payment methods
          </li>
          <li className="security-item">
            Withdrawals are processed within 1-3 business days
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ProviderPaymentMethods;