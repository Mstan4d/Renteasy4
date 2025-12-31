// src/modules/dashboard/components/landlord/WithdrawFunds.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../shared/context/AuthContext';
import './WithdrawFunds.css';

const WithdrawFunds = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [walletData, setWalletData] = useState(null);
  const [banks, setBanks] = useState([]);
  const [formData, setFormData] = useState({
    amount: '',
    bankId: '',
    accountNumber: '',
    accountName: '',
    password: ''
  });
  const [verificationStep, setVerificationStep] = useState(1);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const mockWallet = {
          balance: 1250000,
          pending: 250000,
          available: 1000000,
          lastWithdrawal: {
            amount: 500000,
            date: '2024-11-15',
            status: 'completed'
          }
        };
        
        const mockBanks = [
          { id: 1, name: 'Zenith Bank', code: '057' },
          { id: 2, name: 'Guaranty Trust Bank', code: '058' },
          { id: 3, name: 'Access Bank', code: '044' },
          { id: 4, name: 'First Bank', code: '011' },
          { id: 5, name: 'United Bank for Africa', code: '033' },
          { id: 6, name: 'Sterling Bank', code: '232' },
          { id: 7, name: 'Union Bank', code: '032' },
          { id: 8, name: 'Fidelity Bank', code: '070' }
        ];
        
        setWalletData(mockWallet);
        setBanks(mockBanks);
        
        // Set default form data
        setFormData(prev => ({
          ...prev,
          bankId: '1',
          accountNumber: '1234567890',
          accountName: user?.name || 'Property Owner'
        }));
        
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      loadData();
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBankSelect = (bankId) => {
    setFormData(prev => ({
      ...prev,
      bankId
    }));
  };

  const validateAccount = async () => {
    if (!formData.accountNumber || !formData.bankId) {
      alert('Please select a bank and enter account number');
      return;
    }
    
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Simulate account verification
      setFormData(prev => ({
        ...prev,
        accountName: 'Verified Account Name'
      }));
      setVerificationStep(2);
    } catch (error) {
      alert('Account verification failed. Please check details.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.password) {
      alert('Please fill all required fields');
      return;
    }
    
    if (parseFloat(formData.amount) > walletData.available) {
      alert('Amount exceeds available balance');
      return;
    }
    
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Show success message
      alert(`Success! ₦${parseFloat(formData.amount).toLocaleString()} withdrawal initiated.`);
      
      // Navigate back or to history
      navigate('/dashboard/landlord/wallet/history');
    } catch (error) {
      alert('Withdrawal failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const goBack = () => {
    navigate('/dashboard/landlord');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (isLoading && !walletData) {
    return (
      <div className="withdraw-loading">
        <div className="loading-spinner"></div>
        <p>Loading wallet information...</p>
      </div>
    );
  }

  return (
    <div className="withdraw-funds">
      {/* Header */}
      <div className="withdraw-header">
        <button className="btn btn-back" onClick={goBack}>
          ← Back to Dashboard
        </button>
        <h1>Withdraw Funds</h1>
        <p>Transfer money from your wallet to your bank account</p>
      </div>

      <div className="withdraw-content">
        {/* Left Column - Wallet Info */}
        <div className="wallet-info-section">
          <div className="balance-card">
            <h3>Wallet Balance</h3>
            <div className="balance-amount">
              {formatCurrency(walletData?.balance || 0)}
            </div>
            
            <div className="balance-breakdown">
              <div className="breakdown-item">
                <span className="label">Available for withdrawal</span>
                <span className="value available">
                  {formatCurrency(walletData?.available || 0)}
                </span>
              </div>
              <div className="breakdown-item">
                <span className="label">Pending clearance</span>
                <span className="value pending">
                  {formatCurrency(walletData?.pending || 0)}
                </span>
              </div>
            </div>
            
            <div className="last-withdrawal">
              <h4>Last Withdrawal</h4>
              <p>
                {formatCurrency(walletData?.lastWithdrawal.amount || 0)} 
                on {new Date(walletData?.lastWithdrawal.date || new Date()).toLocaleDateString()}
              </p>
              <span className={`status ${walletData?.lastWithdrawal.status}`}>
                {walletData?.lastWithdrawal.status}
              </span>
            </div>
          </div>
          
          <div className="info-card">
            <h3>💡 Quick Tips</h3>
            <ul className="tips-list">
              <li>Withdrawals are processed within 24 hours</li>
              <li>Minimum withdrawal: ₦1,000</li>
              <li>Maximum per transaction: ₦5,000,000</li>
              <li>No withdrawal fees apply</li>
              <li>Weekend withdrawals processed on Monday</li>
            </ul>
          </div>
        </div>

        {/* Right Column - Withdrawal Form */}
        <div className="withdraw-form-section">
          <div className="form-stepper">
            <div className={`step ${verificationStep >= 1 ? 'active' : ''}`}>
              <div className="step-number">1</div>
              <div className="step-label">Account Details</div>
            </div>
            <div className="step-line"></div>
            <div className={`step ${verificationStep >= 2 ? 'active' : ''}`}>
              <div className="step-number">2</div>
              <div className="step-label">Amount & Security</div>
            </div>
            <div className="step-line"></div>
            <div className={`step ${verificationStep === 3 ? 'active' : ''}`}>
              <div className="step-number">3</div>
              <div className="step-label">Confirmation</div>
            </div>
          </div>

          {verificationStep === 1 ? (
            <div className="form-step">
              <h3>Select Bank Account</h3>
              
              <div className="form-group">
                <label>Select Bank</label>
                <div className="banks-grid">
                  {banks.map(bank => (
                    <button
                      key={bank.id}
                      type="button"
                      className={`bank-card ${formData.bankId === bank.id.toString() ? 'selected' : ''}`}
                      onClick={() => handleBankSelect(bank.id.toString())}
                    >
                      <div className="bank-logo">
                        {bank.name.charAt(0)}
                      </div>
                      <span className="bank-name">{bank.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="accountNumber">Account Number</label>
                <input
                  type="text"
                  id="accountNumber"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleInputChange}
                  placeholder="Enter 10-digit account number"
                  maxLength="10"
                />
              </div>

              <div className="form-group">
                <label htmlFor="accountName">Account Name</label>
                <input
                  type="text"
                  id="accountName"
                  name="accountName"
                  value={formData.accountName}
                  onChange={handleInputChange}
                  placeholder="Account name will appear after verification"
                  readOnly={!!formData.accountName && formData.accountName !== 'Verified Account Name'}
                />
                <small className="help-text">
                  Account name will be automatically verified
                </small>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={validateAccount}
                  disabled={isLoading}
                >
                  {isLoading ? 'Verifying...' : 'Verify Account'}
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={goBack}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : verificationStep === 2 ? (
            <div className="form-step">
              <h3>Enter Amount & Security</h3>
              
              <div className="account-summary">
                <div className="summary-item">
                  <span className="label">Bank:</span>
                  <span className="value">
                    {banks.find(b => b.id.toString() === formData.bankId)?.name}
                  </span>
                </div>
                <div className="summary-item">
                  <span className="label">Account:</span>
                  <span className="value">{formData.accountNumber}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Name:</span>
                  <span className="value">{formData.accountName}</span>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="amount">Amount to Withdraw (₦)</label>
                <div className="amount-input-group">
                  <span className="currency">₦</span>
                  <input
                    type="number"
                    id="amount"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    min="1000"
                    max={walletData?.available || 1000000}
                  />
                </div>
                <div className="amount-options">
                  <button
                    type="button"
                    className="amount-btn"
                    onClick={() => setFormData(prev => ({ ...prev, amount: '50000' }))}
                  >
                    ₦50,000
                  </button>
                  <button
                    type="button"
                    className="amount-btn"
                    onClick={() => setFormData(prev => ({ ...prev, amount: '100000' }))}
                  >
                    ₦100,000
                  </button>
                  <button
                    type="button"
                    className="amount-btn"
                    onClick={() => setFormData(prev => ({ ...prev, amount: '250000' }))}
                  >
                    ₦250,000
                  </button>
                  <button
                    type="button"
                    className="amount-btn"
                    onClick={() => setFormData(prev => ({ ...prev, amount: (walletData?.available || 0).toString() }))}
                  >
                    All
                  </button>
                </div>
                <small className="help-text">
                  Available: {formatCurrency(walletData?.available || 0)}
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="password">Enter Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your account password"
                />
                <small className="help-text">
                  Required for security verification
                </small>
              </div>

              <div className="fee-breakdown">
                <h4>Transaction Summary</h4>
                <div className="breakdown-item">
                  <span>Withdrawal Amount</span>
                  <span>{formData.amount ? `₦${parseFloat(formData.amount).toLocaleString()}` : '₦0'}</span>
                </div>
                <div className="breakdown-item">
                  <span>Processing Fee</span>
                  <span>₦0</span>
                </div>
                <div className="breakdown-item total">
                  <span>Total You Receive</span>
                  <span>{formData.amount ? `₦${parseFloat(formData.amount).toLocaleString()}` : '₦0'}</span>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleWithdraw}
                  disabled={isLoading || !formData.amount || !formData.password}
                >
                  {isLoading ? 'Processing...' : 'Withdraw Now'}
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setVerificationStep(1)}
                >
                  Back
                </button>
              </div>
            </div>
          ) : (
            <div className="success-step">
              <div className="success-icon">✅</div>
              <h3>Withdrawal Successful!</h3>
              <p>Your withdrawal request has been submitted successfully.</p>
              
              <div className="transaction-details">
                <div className="detail-item">
                  <span className="label">Transaction ID:</span>
                  <span className="value">TX-{Date.now().toString(36).toUpperCase()}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Amount:</span>
                  <span className="value">{formatCurrency(parseFloat(formData.amount) || 0)}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Bank:</span>
                  <span className="value">
                    {banks.find(b => b.id.toString() === formData.bankId)?.name}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="label">Estimated Arrival:</span>
                  <span className="value">Within 24 hours</span>
                </div>
              </div>

              <div className="success-actions">
                <button
                  className="btn btn-primary"
                  onClick={() => navigate('/dashboard/landlord/wallet/history')}
                >
                  View Transaction History
                </button>
                <button
                  className="btn btn-outline"
                  onClick={() => {
                    setVerificationStep(1);
                    setFormData(prev => ({ ...prev, amount: '', password: '' }));
                  }}
                >
                  Make Another Withdrawal
                </button>
                <button
                  className="btn btn-text"
                  onClick={goBack}
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WithdrawFunds;