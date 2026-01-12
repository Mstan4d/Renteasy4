import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProviderPageTemplate from '../templates/ProviderPageTemplate';
import {
  FaCreditCard,
  FaReceipt,
  FaHistory,
  FaDownload,
  FaPrint,
  FaBell,
  FaCalendarAlt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaMoneyBillWave,
  FaPercentage,
  FaSync,
  FaFileInvoice,
  FaShieldAlt,
  FaQuestionCircle
} from 'react-icons/fa';

const ProviderBilling = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [subscriptionStatus, setSubscriptionStatus] = useState({
    isSubscribed: false,
    currentPlan: 'free',
    freeBookingsUsed: 7,
    freeBookingsLimit: 10,
    nextBillingDate: '2024-02-28',
    monthlyFee: 3000,
    autoRenew: true
  });
  const [invoices, setInvoices] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [billingHistory, setBillingHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API calls
    setTimeout(() => {
      // Mock invoices data
      const mockInvoices = [
        {
          id: 'INV-2024-001',
          date: '2024-01-15',
          description: 'Monthly Subscription - January 2024',
          amount: 3000,
          status: 'paid',
          dueDate: '2024-01-10',
          paidDate: '2024-01-08',
          downloadUrl: '#'
        },
        {
          id: 'INV-2023-012',
          date: '2023-12-15',
          description: 'Monthly Subscription - December 2023',
          amount: 3000,
          status: 'paid',
          dueDate: '2023-12-10',
          paidDate: '2023-12-07',
          downloadUrl: '#'
        },
        {
          id: 'INV-2023-011',
          date: '2023-11-15',
          description: 'Monthly Subscription - November 2023',
          amount: 3000,
          status: 'overdue',
          dueDate: '2023-11-10',
          paidDate: null,
          downloadUrl: '#'
        }
      ];

      // Mock payment methods
      const mockPaymentMethods = [
        {
          id: 'card-001',
          type: 'card',
          last4: '4242',
          brand: 'visa',
          expiry: '12/25',
          isDefault: true,
          name: 'Chika Okafor'
        },
        {
          id: 'bank-001',
          type: 'bank',
          bankName: 'GTBank',
          accountNumber: '0123456789',
          accountName: 'Chika Okafor',
          isDefault: false
        }
      ];

      // Mock billing history
      const mockBillingHistory = [
        {
          id: 'PAY-001',
          date: '2024-01-08',
          type: 'subscription',
          description: 'Monthly Subscription Fee',
          amount: 3000,
          status: 'completed',
          method: 'visa ••4242',
          reference: 'TXN-789456123'
        },
        {
          id: 'PAY-002',
          date: '2023-12-07',
          type: 'subscription',
          description: 'Monthly Subscription Fee',
          amount: 3000,
          status: 'completed',
          method: 'visa ••4242',
          reference: 'TXN-456123789'
        },
        {
          id: 'PAY-003',
          date: '2023-11-05',
          type: 'booking_payment',
          description: 'Payment from Adebayo Johnson (Office Cleaning)',
          amount: 45000,
          status: 'completed',
          method: 'bank_transfer',
          reference: 'BANK-987654'
        },
        {
          id: 'PAY-004',
          date: '2023-10-28',
          type: 'refund',
          description: 'Refund to Jane Smith (Cancelled Booking)',
          amount: -15000,
          status: 'completed',
          method: 'wallet',
          reference: 'REF-456789'
        }
      ];

      setInvoices(mockInvoices);
      setPaymentMethods(mockPaymentMethods);
      setBillingHistory(mockBillingHistory);
      setLoading(false);
    }, 1000);
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-NG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleUpgradeSubscription = () => {
    alert('Redirecting to subscription upgrade page...');
    // In real app, navigate to /dashboard/provider/subscribe
  };

  const handleAddPaymentMethod = () => {
    alert('Opening payment method form...');
  };

  const handleSetDefaultPayment = (id) => {
    const updatedMethods = paymentMethods.map(method => ({
      ...method,
      isDefault: method.id === id
    }));
    setPaymentMethods(updatedMethods);
    alert('Default payment method updated!');
  };

  const handleRemovePaymentMethod = (id) => {
    if (window.confirm('Are you sure you want to remove this payment method?')) {
      const updatedMethods = paymentMethods.filter(method => method.id !== id);
      setPaymentMethods(updatedMethods);
      alert('Payment method removed!');
    }
  };

  const handleToggleAutoRenew = () => {
    setSubscriptionStatus(prev => ({
      ...prev,
      autoRenew: !prev.autoRenew
    }));
    alert(`Auto-renew ${subscriptionStatus.autoRenew ? 'disabled' : 'enabled'}!`);
  };

  const calculateFreeBookingsLeft = () => {
    return Math.max(0, subscriptionStatus.freeBookingsLimit - subscriptionStatus.freeBookingsUsed);
  };

  const freeBookingsPercentage = () => {
    return (subscriptionStatus.freeBookingsUsed / subscriptionStatus.freeBookingsLimit) * 100;
  };

  if (loading) {
    return (
      <ProviderPageTemplate
        title="Billing & Payments"
        subtitle="Loading your billing information..."
      >
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <div className="loading-spinner"></div>
          <p style={{ marginTop: '1rem', color: '#666' }}>
            Fetching your billing details...
          </p>
        </div>
      </ProviderPageTemplate>
    );
  }

  return (
    <ProviderPageTemplate
      title="Billing & Payments"
      subtitle="Manage subscriptions, invoices, and payment methods"
      actions={
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn-secondary">
            <FaDownload style={{ marginRight: '0.5rem' }} />
            Export Statements
          </button>
          {!subscriptionStatus.isSubscribed && (
            <button 
              className="btn-primary"
              onClick={handleUpgradeSubscription}
            >
              <FaCreditCard style={{ marginRight: '0.5rem' }} />
              Subscribe Now
            </button>
          )}
        </div>
      }
    >
      {/* Tabs Navigation */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-header" style={{ padding: '0', borderBottom: '1px solid #e0e0e0' }}>
          <div style={{ display: 'flex', overflowX: 'auto' }}>
            {['overview', 'invoices', 'payment-methods', 'history'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '1rem 1.5rem',
                  border: 'none',
                  background: 'none',
                  borderBottom: `3px solid ${activeTab === tab ? '#1a237e' : 'transparent'}`,
                  color: activeTab === tab ? '#1a237e' : '#666',
                  fontWeight: activeTab === tab ? '600' : '400',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.3s ease'
                }}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="card-body" style={{ padding: '2rem' }}>
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div>
              {/* Subscription Status Card */}
              <div className="card" style={{ marginBottom: '2rem', borderLeft: '4px solid #2196f3' }}>
                <div className="card-header">
                  <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FaCreditCard />
                    Subscription Status
                  </h3>
                  {subscriptionStatus.isSubscribed && (
                    <button 
                      className="btn-secondary"
                      onClick={handleToggleAutoRenew}
                      style={{ fontSize: '0.9rem' }}
                    >
                      <FaSync style={{ marginRight: '0.5rem' }} />
                      {subscriptionStatus.autoRenew ? 'Disable Auto-renew' : 'Enable Auto-renew'}
                    </button>
                  )}
                </div>
                
                <div className="card-body">
                  <div className="provider-grid" style={{ marginBottom: '1.5rem' }}>
                    <div className="provider-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <h4 style={{ margin: '0 0 0.5rem 0', color: '#666', fontSize: '0.9rem' }}>
                            Current Plan
                          </h4>
                          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1a237e' }}>
                            {subscriptionStatus.currentPlan === 'free' ? 'Free Trial' : 'Premium'}
                          </div>
                        </div>
                        <div style={{ 
                          padding: '0.5rem', 
                          background: subscriptionStatus.currentPlan === 'free' ? '#e8f5e9' : '#e3f2fd',
                          borderRadius: '8px'
                        }}>
                          {subscriptionStatus.currentPlan === 'free' ? (
                            <FaCheckCircle style={{ color: '#4caf50', fontSize: '1.5rem' }} />
                          ) : (
                            <FaShieldAlt style={{ color: '#2196f3', fontSize: '1.5rem' }} />
                          )}
                        </div>
                      </div>
                      
                      {subscriptionStatus.currentPlan === 'free' && (
                        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #eee' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '0.9rem', color: '#666' }}>
                              Free Bookings Used
                            </span>
                            <span style={{ fontWeight: '600' }}>
                              {subscriptionStatus.freeBookingsUsed} / {subscriptionStatus.freeBookingsLimit}
                            </span>
                          </div>
                          <div style={{ 
                            width: '100%', 
                            height: '8px', 
                            background: '#e0e0e0',
                            borderRadius: '4px',
                            overflow: 'hidden'
                          }}>
                            <div 
                              style={{ 
                                width: `${freeBookingsPercentage()}%`,
                                height: '100%',
                                background: freeBookingsPercentage() > 80 ? '#f44336' : 
                                          freeBookingsPercentage() > 60 ? '#ff9800' : '#4caf50',
                                borderRadius: '4px'
                              }}
                            ></div>
                          </div>
                          <p style={{ 
                            margin: '0.5rem 0 0 0', 
                            fontSize: '0.85rem',
                            color: freeBookingsPercentage() > 80 ? '#f44336' : '#666'
                          }}>
                            {calculateFreeBookingsLeft()} free bookings remaining
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="provider-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <h4 style={{ margin: '0 0 0.5rem 0', color: '#666', fontSize: '0.9rem' }}>
                            Monthly Fee
                          </h4>
                          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1a237e' }}>
                            {subscriptionStatus.currentPlan === 'free' ? '₦0' : formatCurrency(subscriptionStatus.monthlyFee)}
                          </div>
                        </div>
                        <div style={{ 
                          padding: '0.5rem', 
                          background: '#fff3e0',
                          borderRadius: '8px'
                        }}>
                          <FaMoneyBillWave style={{ color: '#ff9800', fontSize: '1.5rem' }} />
                        </div>
                      </div>
                      <p style={{ margin: '1rem 0 0 0', fontSize: '0.9rem', color: '#666' }}>
                        {subscriptionStatus.currentPlan === 'free' 
                          ? 'Free until 10 bookings' 
                          : 'Billed monthly'}
                      </p>
                    </div>

                    <div className="provider-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <h4 style={{ margin: '0 0 0.5rem 0', color: '#666', fontSize: '0.9rem' }}>
                            Next Billing Date
                          </h4>
                          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1a237e' }}>
                            {subscriptionStatus.currentPlan === 'free' 
                              ? `${calculateFreeBookingsLeft()} left` 
                              : formatDate(subscriptionStatus.nextBillingDate)}
                          </div>
                        </div>
                        <div style={{ 
                          padding: '0.5rem', 
                          background: '#f3e5f5',
                          borderRadius: '8px'
                        }}>
                          <FaCalendarAlt style={{ color: '#9c27b0', fontSize: '1.5rem' }} />
                        </div>
                      </div>
                      <p style={{ margin: '1rem 0 0 0', fontSize: '0.9rem', color: '#666' }}>
                        {subscriptionStatus.currentPlan === 'free' 
                          ? 'After free bookings' 
                          : subscriptionStatus.autoRenew ? 'Auto-renew enabled' : 'Auto-renew disabled'}
                      </p>
                    </div>
                  </div>

                  {/* Important Notes */}
                  <div style={{ 
                    padding: '1rem', 
                    background: '#e8f5e9', 
                    borderRadius: '8px',
                    borderLeft: '4px solid #4caf50',
                    marginTop: '1rem'
                  }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#2e7d32' }}>
                      <FaBell style={{ marginRight: '0.5rem' }} />
                      Important Information
                    </h4>
                    <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#2e7d32' }}>
                      <li>First 10 bookings are free for all service providers</li>
                      <li>After 10 bookings, ₦3,000 monthly subscription applies</li>
                      <li>No RentEasy commission on service bookings - you keep 100% of your earnings</li>
                      <li>Subscription is required to continue appearing in marketplace</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="card" style={{ marginBottom: '2rem' }}>
                <div className="card-header">
                  <h3 className="card-title">Quick Actions</h3>
                </div>
                <div className="card-body">
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <button className="btn-secondary" style={{ textAlign: 'left', padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <FaFileInvoice style={{ color: '#2196f3' }} />
                        <strong>View Invoices</strong>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>
                        Access and download all invoices
                      </p>
                    </button>
                    
                    <button 
                      className="btn-secondary" 
                      style={{ textAlign: 'left', padding: '1rem' }}
                      onClick={handleAddPaymentMethod}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <FaCreditCard style={{ color: '#4caf50' }} />
                        <strong>Add Payment Method</strong>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>
                        Add new card or bank account
                      </p>
                    </button>
                    
                    <button className="btn-secondary" style={{ textAlign: 'left', padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <FaHistory style={{ color: '#ff9800' }} />
                        <strong>Billing History</strong>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>
                        View transaction history
                      </p>
                    </button>
                    
                    <Link 
                      to="/dashboard/provider/subscription" 
                      className="btn-secondary"
                      style={{ textAlign: 'left', padding: '1rem', textDecoration: 'none' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <FaPercentage style={{ color: '#9c27b0' }} />
                        <strong>Subscription Plans</strong>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>
                        View available plans
                      </p>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Invoices Tab */}
          {activeTab === 'invoices' && (
            <div>
              <div className="card-header" style={{ marginBottom: '1.5rem' }}>
                <h3 className="card-title">Invoices</h3>
                <button className="btn-secondary">
                  <FaDownload style={{ marginRight: '0.5rem' }} />
                  Download All
                </button>
              </div>

              {invoices.length === 0 ? (
                <div className="empty-state">
                  <FaReceipt style={{ fontSize: '3rem', color: '#ccc', marginBottom: '1rem' }} />
                  <h3>No invoices found</h3>
                  <p>Your invoices will appear here once you start your subscription.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
                        <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Invoice #</th>
                        <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Date</th>
                        <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Description</th>
                        <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Amount</th>
                        <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Status</th>
                        <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map((invoice) => (
                        <tr key={invoice.id} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '1rem' }}>
                            <strong>{invoice.id}</strong>
                          </td>
                          <td style={{ padding: '1rem' }}>
                            {formatDate(invoice.date)}
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <div>{invoice.description}</div>
                            <div style={{ fontSize: '0.85rem', color: '#666' }}>
                              Due: {formatDate(invoice.dueDate)}
                            </div>
                          </td>
                          <td style={{ padding: '1rem', fontWeight: '600' }}>
                            {formatCurrency(invoice.amount)}
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <span style={{
                              padding: '0.25rem 0.75rem',
                              borderRadius: '20px',
                              fontSize: '0.85rem',
                              fontWeight: '600',
                              background: invoice.status === 'paid' ? '#e8f5e9' : 
                                        invoice.status === 'overdue' ? '#ffebee' : '#fff3e0',
                              color: invoice.status === 'paid' ? '#2e7d32' : 
                                    invoice.status === 'overdue' ? '#c62828' : '#ef6c00'
                            }}>
                              {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                            </span>
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button className="btn-secondary" style={{ padding: '0.5rem' }}>
                                <FaDownload />
                              </button>
                              <button className="btn-secondary" style={{ padding: '0.5rem' }}>
                                <FaPrint />
                              </button>
                              {invoice.status === 'overdue' && (
                                <button className="btn-primary" style={{ padding: '0.5rem 1rem' }}>
                                  Pay Now
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Payment Methods Tab */}
          {activeTab === 'payment-methods' && (
            <div>
              <div className="card-header" style={{ marginBottom: '1.5rem' }}>
                <h3 className="card-title">Payment Methods</h3>
                <button 
                  className="btn-primary"
                  onClick={handleAddPaymentMethod}
                >
                  <FaCreditCard style={{ marginRight: '0.5rem' }} />
                  Add New Method
                </button>
              </div>

              {paymentMethods.length === 0 ? (
                <div className="empty-state">
                  <FaCreditCard style={{ fontSize: '3rem', color: '#ccc', marginBottom: '1rem' }} />
                  <h3>No payment methods</h3>
                  <p>Add a payment method to start your subscription.</p>
                  <button 
                    className="btn-primary"
                    onClick={handleAddPaymentMethod}
                  >
                    Add Payment Method
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {paymentMethods.map((method) => (
                    <div 
                      key={method.id} 
                      className="card" 
                      style={{ 
                        borderLeft: `4px solid ${method.isDefault ? '#4caf50' : '#e0e0e0'}`,
                        background: method.isDefault ? '#f8f9fa' : 'white'
                      }}
                    >
                      <div className="card-body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{ 
                            padding: '0.75rem',
                            background: method.type === 'card' ? '#e3f2fd' : '#f3e5f5',
                            borderRadius: '8px'
                          }}>
                            <FaCreditCard style={{ 
                              color: method.type === 'card' ? '#2196f3' : '#9c27b0',
                              fontSize: '1.5rem'
                            }} />
                          </div>
                          
                          <div>
                            <h4 style={{ margin: '0 0 0.5rem 0' }}>
                              {method.type === 'card' 
                                ? `${method.brand?.toUpperCase()} •••• ${method.last4}`
                                : `${method.bankName}`
                              }
                            </h4>
                            <p style={{ margin: '0', color: '#666' }}>
                              {method.type === 'card' 
                                ? `Expires ${method.expiry} • ${method.name}`
                                : `Account: ${method.accountNumber} • ${method.accountName}`
                              }
                              {method.isDefault && (
                                <span style={{ 
                                  marginLeft: '0.5rem',
                                  padding: '0.25rem 0.5rem',
                                  background: '#e8f5e9',
                                  color: '#2e7d32',
                                  borderRadius: '4px',
                                  fontSize: '0.85rem'
                                }}>
                                  Default
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          {!method.isDefault && (
                            <button 
                              className="btn-secondary"
                              onClick={() => handleSetDefaultPayment(method.id)}
                              style={{ fontSize: '0.9rem' }}
                            >
                              Set as Default
                            </button>
                          )}
                          <button 
                            className="btn-secondary"
                            onClick={() => handleRemovePaymentMethod(method.id)}
                            style={{ 
                              background: method.isDefault ? 'transparent' : 'transparent',
                              color: method.isDefault ? '#666' : '#f44336',
                              border: method.isDefault ? '1px solid #ddd' : '1px solid #f44336'
                            }}
                          >
                            {method.isDefault ? 'Cannot remove default' : 'Remove'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Payment Security Note */}
              <div style={{ 
                marginTop: '2rem',
                padding: '1rem',
                background: '#e3f2fd',
                borderRadius: '8px',
                borderLeft: '4px solid #2196f3'
              }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                  <FaShieldAlt style={{ color: '#2196f3', fontSize: '1.2rem', marginTop: '0.25rem' }} />
                  <div>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#1565c0' }}>
                      Payment Security
                    </h4>
                    <p style={{ margin: 0, color: '#1565c0' }}>
                      Your payment information is encrypted and securely stored. We never store your full card details.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div>
              <div className="card-header" style={{ marginBottom: '1.5rem' }}>
                <h3 className="card-title">Billing History</h3>
                <button className="btn-secondary">
                  <FaDownload style={{ marginRight: '0.5rem' }} />
                  Export History
                </button>
              </div>

              {billingHistory.length === 0 ? (
                <div className="empty-state">
                  <FaHistory style={{ fontSize: '3rem', color: '#ccc', marginBottom: '1rem' }} />
                  <h3>No billing history</h3>
                  <p>Your transaction history will appear here once you make payments.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
                        <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Date</th>
                        <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Type</th>
                        <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Description</th>
                        <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Amount</th>
                        <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Status</th>
                        <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Reference</th>
                      </tr>
                    </thead>
                    <tbody>
                      {billingHistory.map((transaction) => (
                        <tr key={transaction.id} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '1rem' }}>
                            {formatDate(transaction.date)}
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <span style={{
                              padding: '0.25rem 0.75rem',
                              borderRadius: '20px',
                              fontSize: '0.85rem',
                              background: transaction.type === 'subscription' ? '#e3f2fd' : 
                                        transaction.type === 'booking_payment' ? '#e8f5e9' : '#ffebee',
                              color: transaction.type === 'subscription' ? '#1565c0' : 
                                    transaction.type === 'booking_payment' ? '#2e7d32' : '#c62828'
                            }}>
                              {transaction.type.replace('_', ' ')}
                            </span>
                          </td>
                          <td style={{ padding: '1rem' }}>
                            {transaction.description}
                            <div style={{ fontSize: '0.85rem', color: '#666' }}>
                              {transaction.method}
                            </div>
                          </td>
                          <td style={{ 
                            padding: '1rem', 
                            fontWeight: '600',
                            color: transaction.amount >= 0 ? '#2e7d32' : '#c62828'
                          }}>
                            {transaction.amount >= 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              padding: '0.25rem 0.75rem',
                              borderRadius: '20px',
                              fontSize: '0.85rem',
                              background: transaction.status === 'completed' ? '#e8f5e9' : '#fff3e0',
                              color: transaction.status === 'completed' ? '#2e7d32' : '#ef6c00'
                            }}>
                              {transaction.status === 'completed' ? (
                                <FaCheckCircle style={{ fontSize: '0.8rem' }} />
                              ) : (
                                <FaExclamationTriangle style={{ fontSize: '0.8rem' }} />
                              )}
                              {transaction.status}
                            </span>
                          </td>
                          <td style={{ padding: '1rem', fontFamily: 'monospace', fontSize: '0.9rem' }}>
                            {transaction.reference}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FaQuestionCircle />
            Billing FAQ
          </h3>
        </div>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            <div>
              <h4 style={{ margin: '0 0 0.5rem 0', color: '#1a237e' }}>How many free bookings do I get?</h4>
              <p style={{ margin: 0, color: '#666' }}>
                All new service providers get 10 free bookings. After that, ₦3,000 monthly subscription applies.
              </p>
            </div>
            
            <div>
              <h4 style={{ margin: '0 0 0.5rem 0', color: '#1a237e' }}>Is there commission on bookings?</h4>
              <p style={{ margin: 0, color: '#666' }}>
                No! Unlike property rentals, service providers keep 100% of their earnings. No RentEasy commission on service bookings.
              </p>
            </div>
            
            <div>
              <h4 style={{ margin: '0 0 0.5rem 0', color: '#1a237e' }}>When will I be charged?</h4>
              <p style={{ margin: 0, color: '#666' }}>
                Subscription fee is charged monthly, starting after your 10th booking. You'll be notified before any charge.
              </p>
            </div>
            
            <div>
              <h4 style={{ margin: '0 0 0.5rem 0', color: '#1a237e' }}>Can I cancel my subscription?</h4>
              <p style={{ margin: 0, color: '#666' }}>
                Yes, you can cancel anytime. You'll continue to appear in marketplace until your current billing period ends.
              </p>
            </div>
          </div>
          
          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <Link 
              to="/dashboard/provider/support" 
              className="btn-secondary"
              style={{ textDecoration: 'none' }}
            >
              Need more help? Contact Support
            </Link>
          </div>
        </div>
      </div>
    </ProviderPageTemplate>
  );
};

export default ProviderBilling;