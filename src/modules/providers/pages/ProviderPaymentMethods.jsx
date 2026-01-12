// src/modules/providers/pages/ProviderPaymentMethods.jsx
import React, { useState } from 'react';
import { 
  Plus, CreditCard, Building, Smartphone, 
  CheckCircle, Edit2, Trash2, Shield,
  AlertCircle, ChevronRight
} from 'lucide-react';

const ProviderPaymentMethods = () => {
  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: 1,
      type: 'bank',
      name: 'Guaranty Trust Bank',
      icon: <Building size={24} />,
      number: '0123456789',
      default: true,
      verified: true
    },
    {
      id: 2,
      type: 'bank',
      name: 'Access Bank',
      icon: <Building size={24} />,
      number: '9876543210',
      default: false,
      verified: true
    },
    {
      id: 3,
      type: 'mobile',
      name: 'OPay',
      icon: <Smartphone size={24} />,
      number: '08123456789',
      default: false,
      verified: true
    },
    {
      id: 4,
      type: 'card',
      name: 'Visa Card',
      icon: <CreditCard size={24} />,
      number: '**** **** **** 4321',
      default: false,
      verified: false,
      expiry: '12/25'
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newMethod, setNewMethod] = useState({
    type: 'bank',
    name: '',
    number: '',
    makeDefault: false
  });

  const styles = {
    container: {
      maxWidth: '800px',
      margin: '0 auto',
      padding: '1.5rem'
    },
    header: {
      marginBottom: '2rem'
    },
    title: {
      fontSize: '1.875rem',
      fontWeight: '700',
      color: '#111827',
      marginBottom: '0.5rem'
    },
    subtitle: {
      color: '#6b7280',
      fontSize: '1rem'
    },
    methodsList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      marginBottom: '2rem'
    },
    methodCard: {
      background: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '0.75rem',
      padding: '1.5rem',
      transition: 'all 0.3s ease'
    },
    methodHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '1rem'
    },
    methodInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem'
    },
    methodIcon: {
      width: '3rem',
      height: '3rem',
      borderRadius: '0.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    methodDetails: {
      flex: 1
    },
    methodName: {
      fontSize: '1.125rem',
      fontWeight: '600',
      color: '#111827',
      marginBottom: '0.25rem'
    },
    methodType: {
      fontSize: '0.875rem',
      color: '#6b7280'
    },
    methodStatus: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem'
    },
    defaultBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.25rem',
      padding: '0.25rem 0.75rem',
      background: '#d1fae5',
      color: '#065f46',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: '600'
    },
    verifiedBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.25rem',
      padding: '0.25rem 0.75rem',
      background: '#dbeafe',
      color: '#1e40af',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: '600'
    },
    methodNumber: {
      fontFamily: 'monospace',
      fontSize: '1.125rem',
      fontWeight: '600',
      color: '#111827',
      marginBottom: '0.5rem'
    },
    methodFooter: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: '1rem',
      borderTop: '1px solid #e5e7eb'
    },
    expiryText: {
      fontSize: '0.875rem',
      color: '#6b7280'
    },
    methodActions: {
      display: 'flex',
      gap: '0.5rem'
    },
    actionButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem',
      padding: '0.5rem 0.75rem',
      border: '1px solid #e5e7eb',
      background: 'white',
      borderRadius: '0.5rem',
      fontSize: '0.75rem',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    addMethodButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      width: '100%',
      padding: '1.5rem',
      border: '2px dashed #d1d5db',
      background: 'transparent',
      borderRadius: '0.75rem',
      color: '#6b7280',
      fontSize: '1rem',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      marginBottom: '2rem'
    },
    addForm: {
      background: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '0.75rem',
      padding: '1.5rem',
      marginBottom: '2rem'
    },
    formTitle: {
      fontSize: '1.125rem',
      fontWeight: '600',
      color: '#111827',
      marginBottom: '1rem'
    },
    formGroup: {
      marginBottom: '1rem'
    },
    formLabel: {
      display: 'block',
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#374151',
      marginBottom: '0.5rem'
    },
    formSelect: {
      width: '100%',
      padding: '0.625rem 0.75rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.5rem',
      fontSize: '0.875rem',
      color: '#374151',
      background: 'white',
      cursor: 'pointer'
    },
    formInput: {
      width: '100%',
      padding: '0.625rem 0.75rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.5rem',
      fontSize: '0.875rem',
      color: '#374151'
    },
    checkboxGroup: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      marginTop: '1rem'
    },
    formActions: {
      display: 'flex',
      gap: '0.75rem',
      marginTop: '1.5rem'
    },
    cancelButton: {
      padding: '0.625rem 1.25rem',
      border: '1px solid #d1d5db',
      background: 'white',
      borderRadius: '0.5rem',
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#374151',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    saveButton: {
      padding: '0.625rem 1.25rem',
      border: 'none',
      background: '#2563eb',
      borderRadius: '0.5rem',
      fontSize: '0.875rem',
      fontWeight: '500',
      color: 'white',
      cursor: 'pointer',
      transition: 'background-color 0.2s ease'
    },
    securityInfo: {
      background: '#eff6ff',
      border: '1px solid #93c5fd',
      borderRadius: '0.75rem',
      padding: '1.5rem',
      marginTop: '2rem'
    },
    securityHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      marginBottom: '1rem'
    },
    securityTitle: {
      fontWeight: '600',
      color: '#1e40af'
    },
    securityList: {
      listStyle: 'none',
      padding: 0,
      margin: 0
    },
    securityItem: {
      position: 'relative',
      paddingLeft: '1.5rem',
      marginBottom: '0.5rem',
      fontSize: '0.875rem',
      color: '#1e40af'
    },
    loadingText: {
      textAlign: 'center',
      color: '#6b7280',
      padding: '2rem'
    }
  };

  const handleAddMethod = () => {
    if (!newMethod.name || !newMethod.number) {
      alert('Please fill in all required fields');
      return;
    }

    const newId = paymentMethods.length + 1;
    const newMethodObj = {
      id: newId,
      type: newMethod.type,
      name: newMethod.name,
      icon: newMethod.type === 'bank' ? <Bank size={24} /> : 
            newMethod.type === 'mobile' ? <Smartphone size={24} /> : 
            <CreditCard size={24} />,
      number: newMethod.number,
      default: newMethod.makeDefault,
      verified: false
    };

    // If setting as default, update all other methods
    let updatedMethods = [...paymentMethods, newMethodObj];
    if (newMethod.makeDefault) {
      updatedMethods = updatedMethods.map(method => ({
        ...method,
        default: method.id === newId
      }));
    }

    setPaymentMethods(updatedMethods);
    setShowAddForm(false);
    setNewMethod({ type: 'bank', name: '', number: '', makeDefault: false });
  };

  const handleSetDefault = (id) => {
    setPaymentMethods(paymentMethods.map(method => ({
      ...method,
      default: method.id === id
    })));
  };

  const handleDeleteMethod = (id) => {
    if (paymentMethods.find(m => m.id === id)?.default) {
      alert('Cannot delete default payment method. Please set another method as default first.');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this payment method?')) {
      setPaymentMethods(paymentMethods.filter(method => method.id !== id));
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Payment Methods</h1>
        <p style={styles.subtitle}>Manage your bank accounts and payment options for withdrawals</p>
      </div>

      {/* Add New Method Button */}
      <button 
        onClick={() => setShowAddForm(true)}
        style={styles.addMethodButton}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = '#2563eb';
          e.currentTarget.style.color = '#2563eb';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = '#d1d5db';
          e.currentTarget.style.color = '#6b7280';
        }}
      >
        <Plus size={20} />
        <span>Add New Payment Method</span>
      </button>

      {/* Add Method Form */}
      {showAddForm && (
        <div style={styles.addForm}>
          <h3 style={styles.formTitle}>Add New Payment Method</h3>
          
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Method Type</label>
            <select 
              value={newMethod.type}
              onChange={(e) => setNewMethod({...newMethod, type: e.target.value})}
              style={styles.formSelect}
            >
              <option value="bank">Bank Account</option>
              <option value="mobile">Mobile Wallet</option>
              <option value="card">Debit Card</option>
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.formLabel}>
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
              style={styles.formInput}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.formLabel}>
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
              style={styles.formInput}
            />
          </div>

          <div style={styles.checkboxGroup}>
            <input
              type="checkbox"
              id="makeDefault"
              checked={newMethod.makeDefault}
              onChange={(e) => setNewMethod({...newMethod, makeDefault: e.target.checked})}
            />
            <label htmlFor="makeDefault" style={{fontSize: '0.875rem', color: '#374151'}}>
              Set as default payment method
            </label>
          </div>

          <div style={styles.formActions}>
            <button 
              onClick={() => {
                setShowAddForm(false);
                setNewMethod({ type: 'bank', name: '', number: '', makeDefault: false });
              }}
              style={styles.cancelButton}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#9ca3af';
                e.currentTarget.style.background = '#f9fafb';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#d1d5db';
                e.currentTarget.style.background = 'white';
              }}
            >
              Cancel
            </button>
            <button 
              onClick={handleAddMethod}
              style={styles.saveButton}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#1d4ed8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#2563eb';
              }}
            >
              Add Payment Method
            </button>
          </div>
        </div>
      )}

      {/* Payment Methods List */}
      <div style={styles.methodsList}>
        {paymentMethods.length === 0 ? (
          <div style={styles.loadingText}>No payment methods added yet</div>
        ) : (
          paymentMethods.map((method) => (
            <div key={method.id} style={styles.methodCard}>
              <div style={styles.methodHeader}>
                <div style={styles.methodInfo}>
                  <div style={{
                    ...styles.methodIcon,
                    background: method.type === 'bank' ? '#dbeafe' : 
                               method.type === 'mobile' ? '#d1fae5' : '#f3e8ff'
                  }}>
                    {method.icon}
                  </div>
                  <div style={styles.methodDetails}>
                    <h3 style={styles.methodName}>{method.name}</h3>
                    <p style={styles.methodType}>
                      {method.type === 'bank' ? 'Bank Account' : 
                       method.type === 'mobile' ? 'Mobile Wallet' : 'Debit Card'}
                    </p>
                  </div>
                </div>
                
                <div style={styles.methodStatus}>
                  {method.default && (
                    <span style={styles.defaultBadge}>
                      <CheckCircle size={12} />
                      Default
                    </span>
                  )}
                  {method.verified ? (
                    <span style={styles.verifiedBadge}>
                      <Shield size={12} />
                      Verified
                    </span>
                  ) : (
                    <span style={{
                      ...styles.verifiedBadge,
                      background: '#fef3c7',
                      color: '#92400e'
                    }}>
                      <AlertCircle size={12} />
                      Pending
                    </span>
                  )}
                </div>
              </div>

              <div style={styles.methodNumber}>{method.number}</div>
              
              <div style={styles.methodFooter}>
                {method.expiry && (
                  <div style={styles.expiryText}>Expires {method.expiry}</div>
                )}
                
                <div style={styles.methodActions}>
                  {!method.default && (
                    <button
                      onClick={() => handleSetDefault(method.id)}
                      style={{
                        ...styles.actionButton,
                        background: '#dbeafe',
                        color: '#1e40af',
                        borderColor: '#93c5fd'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#bfdbfe';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#dbeafe';
                      }}
                    >
                      <CheckCircle size={12} />
                      Set Default
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleDeleteMethod(method.id)}
                    style={{
                      ...styles.actionButton,
                      background: '#fee2e2',
                      color: '#991b1b',
                      borderColor: '#fca5a5'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#fecaca';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#fee2e2';
                    }}
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
      <div style={styles.securityInfo}>
        <div style={styles.securityHeader}>
          <Shield size={20} color="#3b82f6" />
          <h4 style={styles.securityTitle}>Payment Security</h4>
        </div>
        <ul style={styles.securityList}>
          <li style={styles.securityItem}>
            Your payment details are encrypted and stored securely
          </li>
          <li style={styles.securityItem}>
            New payment methods require verification before use
          </li>
          <li style={styles.securityItem}>
            You can only delete non-default payment methods
          </li>
          <li style={styles.securityItem}>
            Withdrawals are processed within 1-3 business days
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ProviderPaymentMethods;