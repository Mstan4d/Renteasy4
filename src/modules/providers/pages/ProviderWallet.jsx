import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FaWallet,
  FaMoneyBillWave,
  FaArrowUp,
  FaArrowDown,
  FaHistory,
  FaCreditCard,
  FaShieldAlt,
  FaChartLine,
  FaSync,
  FaPrint,
  FaDownload,
  FaFilter,
  FaSearch,
  FaArrowLeft,
  FaPlus,
  FaCalendarAlt,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaUniversity
} from 'react-icons/fa';

const ProviderWallet = () => {
  const navigate = useNavigate();
  const [walletBalance, setWalletBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('bank');

  // Wallet stats
  const [walletStats, setWalletStats] = useState({
    totalEarnings: 0,
    pendingPayouts: 0,
    totalWithdrawn: 0,
    nextPayoutDate: null
  });

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = () => {
    setLoading(true);
    
    setTimeout(() => {
      // Mock data
      setWalletBalance(125750);
      
      setWalletStats({
        totalEarnings: 385400,
        pendingPayouts: 45250,
        totalWithdrawn: 259650,
        nextPayoutDate: '2024-01-25'
      });
      
      setTransactions([
        {
          id: 'txn-001',
          type: 'credit',
          amount: 25000,
          description: 'Service Booking - House Cleaning',
          date: '2024-01-15T14:30:00',
          status: 'completed',
          reference: 'BK-789456'
        },
        {
          id: 'txn-002',
          type: 'debit',
          amount: 1500,
          description: 'Boost Purchase - Premium Plan',
          date: '2024-01-14T10:15:00',
          status: 'completed',
          reference: 'BST-852369'
        },
        {
          id: 'txn-003',
          type: 'credit',
          amount: 18000,
          description: 'Service Booking - Office Painting',
          date: '2024-01-12T16:45:00',
          status: 'completed',
          reference: 'BK-741258'
        },
        {
          id: 'txn-004',
          type: 'debit',
          amount: 50000,
          description: 'Withdrawal to Bank',
          date: '2024-01-10T09:20:00',
          status: 'completed',
          reference: 'WDL-963852'
        },
        {
          id: 'txn-005',
          type: 'credit',
          amount: 12500,
          description: 'Service Booking - Carpet Cleaning',
          date: '2024-01-08T11:10:00',
          status: 'pending',
          reference: 'BK-456123'
        },
        {
          id: 'txn-006',
          type: 'credit',
          amount: 8000,
          description: 'Referral Commission',
          date: '2024-01-05T13:25:00',
          status: 'completed',
          reference: 'REF-789123'
        }
      ]);
      
      setLoading(false);
    }, 1000);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-NG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return '#10B981';
      case 'pending':
        return '#F59E0B';
      case 'failed':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <FaCheckCircle style={{ color: '#10B981' }} />;
      case 'pending':
        return <FaClock style={{ color: '#F59E0B' }} />;
      case 'failed':
        return <FaTimesCircle style={{ color: '#EF4444' }} />;
      default:
        return null;
    }
  };

  const filteredTransactions = transactions.filter(txn => {
    if (filter === 'all') return true;
    if (filter === 'credits') return txn.type === 'credit';
    if (filter === 'debits') return txn.type === 'debit';
    return true;
  });

  const handleWithdraw = () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (parseFloat(withdrawAmount) > walletBalance) {
      alert('Insufficient balance');
      return;
    }

    // Simulate withdrawal
    setLoading(true);
    setTimeout(() => {
      setWalletBalance(prev => prev - parseFloat(withdrawAmount));
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      setLoading(false);
      
      // Add withdrawal transaction
      const newTransaction = {
        id: `wdl-${Date.now()}`,
        type: 'debit',
        amount: parseFloat(withdrawAmount),
        description: 'Withdrawal to Bank Account',
        date: new Date().toISOString(),
        status: 'pending',
        reference: `WDL-${Math.floor(Math.random() * 1000000)}`
      };
      
      setTransactions(prev => [newTransaction, ...prev]);
      
      alert(`Withdrawal request for ${formatCurrency(parseFloat(withdrawAmount))} submitted successfully!`);
    }, 1500);
  };

  const handleExportTransactions = () => {
    // Simulate export
    alert('Transaction history exported successfully!');
  };

  if (loading && transactions.length === 0) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#f5f5f5'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #1a237e',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p style={{ color: '#666' }}>Loading wallet data...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      {/* Header */}
      <div style={{ 
        background: 'white', 
        borderBottom: '1px solid #e0e0e0',
        padding: '1rem 0'
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          padding: '0 1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link 
              to="/dashboard/provider"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#1a237e',
                textDecoration: 'none',
                fontWeight: '600'
              }}
            >
              <FaArrowLeft />
              Back to Dashboard
            </Link>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button 
              onClick={() => setShowWithdrawModal(true)}
              style={{
                padding: '0.5rem 1rem',
                background: '#1a237e',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <FaArrowUp />
              Withdraw Funds
            </button>
          </div>
        </div>
      </div>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
        {/* Wallet Overview */}
        <div style={{ 
          background: 'linear-gradient(135deg, #1a237e 0%, #311b92 100%)',
          borderRadius: '12px',
          padding: '2rem',
          color: 'white',
          marginBottom: '2rem',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
              <div>
                <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <FaWallet style={{ fontSize: '2.5rem' }} />
                  My Wallet
                </h1>
                <p style={{ margin: 0, fontSize: '1.1rem', opacity: 0.9 }}>
                  Manage your earnings, withdrawals, and transactions
                </p>
              </div>
              
              <div style={{ 
                background: 'rgba(255, 255, 255, 0.1)',
                padding: '1rem 1.5rem',
                borderRadius: '12px',
                backdropFilter: 'blur(10px)'
              }}>
                <div style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '0.25rem' }}>
                  Available Balance
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: '700' }}>
                  {formatCurrency(walletBalance)}
                </div>
              </div>
            </div>
            
            {/* Stats Cards */}
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              marginTop: '1.5rem'
            }}>
              <div style={{ 
                background: 'rgba(255, 255, 255, 0.1)', 
                padding: '1rem',
                borderRadius: '8px',
                backdropFilter: 'blur(10px)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <FaChartLine />
                  <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Total Earnings</div>
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                  {formatCurrency(walletStats.totalEarnings)}
                </div>
              </div>
              
              <div style={{ 
                background: 'rgba(255, 255, 255, 0.1)', 
                padding: '1rem',
                borderRadius: '8px',
                backdropFilter: 'blur(10px)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <FaClock />
                  <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Pending Payouts</div>
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                  {formatCurrency(walletStats.pendingPayouts)}
                </div>
              </div>
              
              <div style={{ 
                background: 'rgba(255, 255, 255, 0.1)', 
                padding: '1rem',
                borderRadius: '8px',
                backdropFilter: 'blur(10px)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <FaMoneyBillWave />
                  <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Total Withdrawn</div>
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                  {formatCurrency(walletStats.totalWithdrawn)}
                </div>
              </div>
              
              <div style={{ 
                background: 'rgba(255, 255, 255, 0.1)', 
                padding: '1rem',
                borderRadius: '8px',
                backdropFilter: 'blur(10px)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <FaCalendarAlt />
                  <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Next Payout</div>
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                  {walletStats.nextPayoutDate ? formatDate(walletStats.nextPayoutDate).split(',')[0] : 'N/A'}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
          {/* Transactions */}
          <div>
            <div style={{ 
              background: 'white',
              borderRadius: '12px',
              padding: '1.5rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ margin: 0, color: '#1a237e', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FaHistory />
                  Transaction History
                </h2>
                
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      onClick={() => setFilter('all')}
                      style={{
                        padding: '0.5rem 1rem',
                        background: filter === 'all' ? '#1a237e' : '#f1f5f9',
                        color: filter === 'all' ? 'white' : '#1a237e',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '0.9rem'
                      }}
                    >
                      All
                    </button>
                    <button 
                      onClick={() => setFilter('credits')}
                      style={{
                        padding: '0.5rem 1rem',
                        background: filter === 'credits' ? '#10B981' : '#f1f5f9',
                        color: filter === 'credits' ? 'white' : '#10B981',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '0.9rem'
                      }}
                    >
                      Credits
                    </button>
                    <button 
                      onClick={() => setFilter('debits')}
                      style={{
                        padding: '0.5rem 1rem',
                        background: filter === 'debits' ? '#EF4444' : '#f1f5f9',
                        color: filter === 'debits' ? 'white' : '#EF4444',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '0.9rem'
                      }}
                    >
                      Debits
                    </button>
                  </div>
                  
                  <button 
                    onClick={handleExportTransactions}
                    style={{
                      padding: '0.5rem 1rem',
                      background: 'white',
                      border: '1px solid #1a237e',
                      borderRadius: '8px',
                      color: '#1a237e',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <FaDownload />
                    Export
                  </button>
                </div>
              </div>
              
              {filteredTransactions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
                  <FaHistory style={{ fontSize: '3rem', marginBottom: '1rem', color: '#ddd' }} />
                  <p style={{ margin: '0 0 1rem 0' }}>No transactions found</p>
                </div>
              ) : (
                <div style={{ 
                  maxHeight: '500px',
                  overflowY: 'auto',
                  borderRadius: '8px',
                  border: '1px solid #e0e0e0'
                }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ 
                        background: '#f8f9fa',
                        borderBottom: '1px solid #e0e0e0'
                      }}>
                        <th style={{ padding: '1rem', textAlign: 'left', color: '#666', fontWeight: '600', fontSize: '0.9rem' }}>
                          Description
                        </th>
                        <th style={{ padding: '1rem', textAlign: 'left', color: '#666', fontWeight: '600', fontSize: '0.9rem' }}>
                          Date
                        </th>
                        <th style={{ padding: '1rem', textAlign: 'left', color: '#666', fontWeight: '600', fontSize: '0.9rem' }}>
                          Amount
                        </th>
                        <th style={{ padding: '1rem', textAlign: 'left', color: '#666', fontWeight: '600', fontSize: '0.9rem' }}>
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTransactions.map((txn) => (
                        <tr 
                          key={txn.id}
                          style={{ 
                            borderBottom: '1px solid #f0f0f0',
                            transition: 'background 0.2s ease',
                            cursor: 'pointer'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#f8f9fa'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                        >
                          <td style={{ padding: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '8px',
                                background: txn.type === 'credit' ? '#D1FAE5' : '#FEE2E2',
                                color: txn.type === 'credit' ? '#10B981' : '#EF4444',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1rem'
                              }}>
                                {txn.type === 'credit' ? <FaArrowDown /> : <FaArrowUp />}
                              </div>
                              <div>
                                <div style={{ fontWeight: '600', color: '#333' }}>
                                  {txn.description}
                                </div>
                                <div style={{ fontSize: '0.85rem', color: '#666' }}>
                                  Ref: {txn.reference}
                                </div>
                              </div>
                            </div>
                          </td>
                          
                          <td style={{ padding: '1rem', color: '#666', fontSize: '0.9rem' }}>
                            {formatDate(txn.date)}
                          </td>
                          
                          <td style={{ padding: '1rem' }}>
                            <div style={{ 
                              fontWeight: '700',
                              color: txn.type === 'credit' ? '#10B981' : '#EF4444'
                            }}>
                              {txn.type === 'credit' ? '+' : '-'}{formatCurrency(txn.amount)}
                            </div>
                          </td>
                          
                          <td style={{ padding: '1rem' }}>
                            <div style={{ 
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem'
                            }}>
                              {getStatusIcon(txn.status)}
                              <span style={{ 
                                color: getStatusColor(txn.status),
                                fontWeight: '600',
                                fontSize: '0.9rem'
                              }}>
                                {txn.status.charAt(0).toUpperCase() + txn.status.slice(1)}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginTop: '1.5rem',
                paddingTop: '1rem',
                borderTop: '1px solid #e0e0e0'
              }}>
                <div style={{ fontSize: '0.9rem', color: '#666' }}>
                  Showing {filteredTransactions.length} of {transactions.length} transactions
                </div>
                
                <Link 
                  to="/dashboard/provider/transactions"
                  style={{
                    color: '#1a237e',
                    textDecoration: 'none',
                    fontWeight: '600',
                    fontSize: '0.9rem'
                  }}
                >
                  View Full Transaction History →
                </Link>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            {/* Quick Actions */}
            <div style={{ 
              background: 'white',
              borderRadius: '12px',
              padding: '1.5rem',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{ margin: '0 0 1rem 0', color: '#1a237e', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FaSync />
                Quick Actions
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button 
                  onClick={() => setShowWithdrawModal(true)}
                  style={{
                    padding: '1rem',
                    background: '#1a237e',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <span>Withdraw Funds</span>
                  <FaArrowUp />
                </button>
                
                <button 
                  onClick={() => navigate('/dashboard/provider/earnings')}
                  style={{
                    padding: '1rem',
                    background: '#10B981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <span>View Earnings</span>
                  <FaChartLine />
                </button>
                
                <button 
                  onClick={() => navigate('/dashboard/provider/payouts')}
                  style={{
                    padding: '1rem',
                    background: '#F59E0B',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <span>Payout History</span>
                  <FaMoneyBillWave />
                </button>
              </div>
            </div>

            {/* Payment Methods */}
            <div style={{ 
              background: 'white',
              borderRadius: '12px',
              padding: '1.5rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, color: '#1a237e', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FaCreditCard />
                  Payment Methods
                </h3>
                <button 
                  onClick={() => navigate('/dashboard/provider/payment-methods')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#1a237e',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.9rem'
                  }}
                >
                  Manage
                </button>
              </div>
              
              <div style={{ 
                background: '#f8f9fa',
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <FaUniversity style={{ color: '#1a237e' }} />
                  <div>
                    <div style={{ fontWeight: '600', color: '#333' }}>Guaranty Trust Bank</div>
                    <div style={{ fontSize: '0.9rem', color: '#666' }}>**** **** 4532</div>
                  </div>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#666' }}>
                  Primary withdrawal method
                </div>
              </div>
              
              <div style={{ 
                background: '#f8f9fa',
                padding: '1rem',
                borderRadius: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <FaShieldAlt style={{ color: '#10B981' }} />
                  <div>
                    <div style={{ fontWeight: '600', color: '#333' }}>RentEasy Wallet</div>
                    <div style={{ fontSize: '0.9rem', color: '#666' }}>
                      Balance: {formatCurrency(walletBalance)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '500px',
            width: '100%',
            animation: 'slideIn 0.3s ease'
          }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#1a237e' }}>
              <FaArrowUp style={{ marginRight: '0.5rem' }} />
              Withdraw Funds
            </h3>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ 
                background: '#f8f9fa',
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '1.5rem'
              }}>
                <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.25rem' }}>
                  Available Balance
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1a237e' }}>
                  {formatCurrency(walletBalance)}
                </div>
              </div>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#333' }}>
                  Amount to Withdraw (₦)
                </label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="Enter amount"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                />
                <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#666' }}>
                  Minimum withdrawal: ₦1,000
                </div>
              </div>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#333' }}>
                  Withdrawal Method
                </label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button 
                    onClick={() => setWithdrawMethod('bank')}
                    style={{
                      flex: 1,
                      padding: '1rem',
                      background: withdrawMethod === 'bank' ? '#E3F2FD' : '#f8f9fa',
                      border: `1px solid ${withdrawMethod === 'bank' ? '#1a237e' : '#ddd'}`,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <FaUniversity style={{ color: withdrawMethod === 'bank' ? '#1a237e' : '#666' }} />
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontWeight: '600', color: withdrawMethod === 'bank' ? '#1a237e' : '#333' }}>
                        Bank Transfer
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#666' }}>1-2 business days</div>
                    </div>
                  </button>
                  
                  <button 
                    onClick={() => setWithdrawMethod('wallet')}
                    style={{
                      flex: 1,
                      padding: '1rem',
                      background: withdrawMethod === 'wallet' ? '#E3F2FD' : '#f8f9fa',
                      border: `1px solid ${withdrawMethod === 'wallet' ? '#1a237e' : '#ddd'}`,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <FaWallet style={{ color: withdrawMethod === 'wallet' ? '#1a237e' : '#666' }} />
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontWeight: '600', color: withdrawMethod === 'wallet' ? '#1a237e' : '#333' }}>
                        RentEasy Wallet
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#666' }}>Instant</div>
                    </div>
                  </button>
                </div>
              </div>
              
              <div style={{ 
                padding: '1rem',
                background: '#FFF3E0',
                borderRadius: '8px',
                borderLeft: '4px solid #F59E0B',
                marginBottom: '1.5rem'
              }}>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#EF6C00' }}>
                  <strong>Note:</strong> Withdrawals may take 1-2 business days to process. A 1% transaction fee applies.
                </p>
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button 
                onClick={() => setShowWithdrawModal(false)}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'white',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  color: '#666',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              
              <button 
                onClick={handleWithdraw}
                disabled={loading || !withdrawAmount}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#1a237e',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  opacity: loading || !withdrawAmount ? 0.7 : 1
                }}
              >
                {loading ? (
                  <>
                    <div className="loading-spinner-small"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <FaArrowUp />
                    Withdraw Now
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .loading-spinner-small {
          width: 20px;
          height: 20px;
          border: 2px solid #f3f3f3;
          border-top: 2px solid #1a237e;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @media (max-width: 1024px) {
          main > div {
            grid-template-columns: 1fr;
          }
        }
        
        @media (max-width: 768px) {
          .transaction-filters {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .transaction-header {
            flex-direction: column;
            gap: 1rem;
          }
        }
        
        @media (max-width: 480px) {
          .withdrawal-methods {
            flex-direction: column;
          }
          
          .wallet-stats {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default ProviderWallet;