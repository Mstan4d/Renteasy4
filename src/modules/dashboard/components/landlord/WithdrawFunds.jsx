// src/modules/dashboard/components/landlord/WithdrawFunds.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../shared/context/AuthContext';
import { supabase } from '../../../../shared/lib/supabaseClient';
import { 
  ArrowLeft, ShieldCheck, Landmark, 
  Wallet, AlertCircle, CheckCircle2, Loader2,
  Eye, EyeOff, CreditCard, Building, User
} from 'lucide-react';
import './WithdrawFunds.css';

const WithdrawFunds = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [wallet, setWallet] = useState({ available: 0, balance: 0 });
  const [step, setStep] = useState(1);
  const [showAccountNumber, setShowAccountNumber] = useState(false);
  const [editingBank, setEditingBank] = useState(false);
  const [savingBank, setSavingBank] = useState(false);
  const [userBankDetails, setUserBankDetails] = useState({
    bank_name: '',
    account_number: '',
    account_name: ''
  });
  
  const [formData, setFormData] = useState({
    amount: '',
    bank_name: '',
    account_number: '',
    account_name: '',
  });

  useEffect(() => {
    if (user) {
      fetchWalletBalance();
      fetchBankDetails();
    }
  }, [user]);

  const fetchWalletBalance = async () => {
    try {
      // Try to get from landlord_wallets table
      const { data, error } = await supabase
        .from('landlord_wallets')
        .select('available_balance, total_balance')
        .eq('landlord_id', user.id)
        .maybeSingle();

      if (!error && data) {
        setWallet({
          available: data.available_balance || 0,
          balance: data.total_balance || 0
        });
      } else {
        // Fallback to commissions table
        const { data: commissions } = await supabase
          .from('commissions')
          .select('referrer_share')
          .eq('referrer_id', user.id)
          .eq('status', 'verified')
          .eq('paid_to_referrer', false);

        const totalEarned = commissions?.reduce((sum, c) => sum + (c.referrer_share || 0), 0) || 0;
        setWallet({
          available: totalEarned,
          balance: totalEarned
        });
      }
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      setWallet({ available: 0, balance: 0 });
    }
  };

  const fetchBankDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('bank_name, account_number, account_name')
        .eq('id', user.id)
        .single();

      if (!error && data) {
        setUserBankDetails({
          bank_name: data.bank_name || '',
          account_number: data.account_number || '',
          account_name: data.account_name || ''
        });
        
        // Pre-fill form with saved bank details
        setFormData(prev => ({
          ...prev,
          bank_name: data.bank_name || '',
          account_number: data.account_number || '',
          account_name: data.account_name || ''
        }));
      }
    } catch (error) {
      console.error('Error fetching bank details:', error);
    }
  };

  const handleSaveBankDetails = async () => {
    if (!formData.bank_name || !formData.account_number || !formData.account_name) {
      alert('Please fill in all bank details fields');
      return;
    }
    
    if (formData.account_number.length < 10) {
      alert('Please enter a valid account number (minimum 10 digits)');
      return;
    }
    
    setSavingBank(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          bank_name: formData.bank_name,
          account_number: formData.account_number,
          account_name: formData.account_name.toUpperCase(),
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      setUserBankDetails({
        bank_name: formData.bank_name,
        account_number: formData.account_number,
        account_name: formData.account_name.toUpperCase()
      });
      
      setEditingBank(false);
      alert('Bank details saved successfully!');
    } catch (error) {
      console.error('Error saving bank details:', error);
      alert('Failed to save bank details.');
    } finally {
      setSavingBank(false);
    }
  };

  const handleVerifyAccount = async () => {
    if (formData.account_number.length !== 10) {
      alert("Enter valid 10-digit account number");
      return;
    }
    
    if (!formData.bank_name) {
      alert("Please select a bank");
      return;
    }
    
    setIsLoading(true);
    
    // In production, you'd call a Paystack/Flutterwave resolve endpoint here
    setTimeout(() => {
      setFormData(prev => ({ 
        ...prev, 
        account_name: user.user_metadata?.full_name || user.email?.split('@')[0] || "Account Holder" 
      }));
      setStep(2);
      setIsLoading(false);
    }, 1500);
  };

  const handleFinalWithdraw = async () => {
    const amount = Number(formData.amount);
    
    if (amount > wallet.available) {
      alert(`Insufficient balance. Available: ₦${wallet.available.toLocaleString()}`);
      return;
    }
    
    if (amount < 5000) {
      alert("Minimum withdrawal amount is ₦5,000");
      return;
    }
    
    setIsLoading(true);

    try {
      // Get admin user for notification
      const { data: adminUsers } = await supabase
        .from('profiles')
        .select('id')
        .in('role', ['admin', 'super-admin'])
        .limit(1);

      const adminId = adminUsers?.[0]?.id;

      // 1. Create a pending withdrawal request
      const reference = `WD-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      
      const { error: txError } = await supabase
        .from('wallet_transactions')
        .insert([{
          user_id: user.id,
          amount: amount,
          type: 'withdrawal',
          status: 'pending',
          description: `Withdrawal request to ${formData.bank_name} - ${formData.account_number}`,
          reference: reference,
          created_at: new Date().toISOString()
        }]);

      if (txError) throw txError;

      // 2. Log withdrawal details for admin processing
      const { error: payoutError } = await supabase
        .from('payout_requests')
        .insert([{
          user_id: user.id,
          user_role: 'landlord',
          amount: amount,
          bank_details: {
            bank: formData.bank_name,
            number: formData.account_number,
            name: formData.account_name
          },
          reference: reference,
          created_at: new Date().toISOString(),
          status: 'pending'
        }]);

      if (payoutError) throw payoutError;

      // 3. Create notification for admin
      if (adminId) {
        await supabase.from('notifications').insert({
          user_id: adminId,
          title: '💰 New Withdrawal Request',
          message: `Landlord ${user.email} requested withdrawal of ₦${amount.toLocaleString()}`,
          type: 'withdrawal_request',
          data: { 
            user_id: user.id, 
            amount: amount, 
            reference: reference,
            bank_details: formData.bank_name
          },
          created_at: new Date().toISOString()
        });
      }

      // 4. Create notification for landlord
      await supabase.from('notifications').insert({
        user_id: user.id,
        title: '✅ Withdrawal Request Submitted',
        message: `Your withdrawal request of ₦${amount.toLocaleString()} has been submitted. Processing takes 24-48 hours.`,
        type: 'withdrawal_submitted',
        data: { amount: amount, reference: reference },
        created_at: new Date().toISOString()
      });

      setStep(3);
    } catch (err) {
      console.error('Error processing withdrawal:', err);
      alert("Error processing withdrawal: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (num) => `₦${Number(num || 0).toLocaleString()}`;

  const formatAccountNumber = (number) => {
    if (!number) return 'Not provided';
    if (showAccountNumber) return number;
    return '••••' + number.slice(-4);
  };

  const getBankLogo = (bankName) => {
    const logos = {
      'GTBank': '🏦',
      'Zenith Bank': '🏦',
      'Access Bank': '🏦',
      'First Bank': '🏦',
      'UBA': '🏦',
      'Moniepoint': '💳',
      'Opay': '💳',
      'Palmpay': '💳',
      'Kuda Bank': '💳'
    };
    return logos[bankName] || '🏦';
  };

  return (
    <div className="withdraw-container">
      <header className="withdraw-nav">
        <button onClick={() => navigate(-1)} className="back-btn">
          <ArrowLeft size={20} />
        </button>
        <h2>Withdraw Funds</h2>
      </header>

      <div className="withdraw-grid">
        {/* Wallet Overview */}
        <div className="wallet-status-card">
          <div className="wallet-head">
            <Wallet color="#64748b" />
            <span>Available Balance</span>
          </div>
          <h3>{formatCurrency(wallet.available)}</h3>
          <p>Total Portfolio Earnings: {formatCurrency(wallet.balance)}</p>
          <div className="withdraw-policy">
            <AlertCircle size={14} />
            <span>Settlements take 24-48 hours. Min withdrawal: ₦5,000</span>
          </div>
          <div className="commission-info">
            <div className="info-row">
              <span>Your Commission Rate:</span>
              <strong>1.5%</strong>
            </div>
            <small>Earned when your property is rented or from referrals</small>
          </div>
        </div>

        {/* Withdrawal Flow */}
        <div className="form-card">
          {step === 1 && (
            <div className="step-ui">
              <h3>Bank Details</h3>
              
              {userBankDetails.bank_name && !editingBank ? (
                <div className="saved-bank-card">
                  <div className="bank-card-header">
                    <div className="bank-icon">{getBankLogo(userBankDetails.bank_name)}</div>
                    <div className="bank-info-summary">
                      <strong>{userBankDetails.bank_name}</strong>
                      <span className="account-number-preview">
                        {formatAccountNumber(userBankDetails.account_number)}
                      </span>
                    </div>
                    <button 
                      className="edit-bank-btn"
                      onClick={() => setEditingBank(true)}
                    >
                      Edit
                    </button>
                  </div>
                  <div className="bank-account-name">
                    <User size={14} />
                    <span>{userBankDetails.account_name}</span>
                  </div>
                  <button 
                    className="action-btn" 
                    onClick={() => setStep(2)}
                  >
                    Continue with this account
                  </button>
                </div>
              ) : (
                <div className="bank-form">
                  <div className="input-group">
                    <label>Select Bank</label>
                    <div className="select-wrapper">
                      <Building size={16} className="select-icon" />
                      <select 
                        value={formData.bank_name} 
                        onChange={(e) => setFormData({...formData, bank_name: e.target.value})}
                        disabled={userBankDetails.bank_name && !editingBank}
                      >
                        <option value="">Choose Bank</option>
                        <option value="Access Bank">Access Bank</option>
                        <option value="First Bank">First Bank</option>
                        <option value="GTBank">GTBank</option>
                        <option value="UBA">UBA</option>
                        <option value="Zenith Bank">Zenith Bank</option>
                        <option value="Moniepoint">Moniepoint</option>
                        <option value="Opay">Opay</option>
                        <option value="Palmpay">Palmpay</option>
                        <option value="Kuda Bank">Kuda Bank</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="input-group">
                    <label>Account Number</label>
                    <div className="input-with-icon">
                      <CreditCard size={16} className="input-icon" />
                      <input 
                        type={showAccountNumber ? "text" : "password"}
                        maxLength="10"
                        placeholder="0123456789"
                        value={formData.account_number}
                        onChange={(e) => setFormData({...formData, account_number: e.target.value.replace(/\D/g, '')})}
                        disabled={userBankDetails.bank_name && !editingBank}
                      />
                      <button 
                        type="button" 
                        className="toggle-visibility"
                        onClick={() => setShowAccountNumber(!showAccountNumber)}
                      >
                        {showAccountNumber ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="input-group">
                    <label>Account Name</label>
                    <div className="input-with-icon">
                      <User size={16} className="input-icon" />
                      <input 
                        type="text"
                        placeholder="Account holder name"
                        value={formData.account_name}
                        onChange={(e) => setFormData({...formData, account_name: e.target.value.toUpperCase()})}
                        disabled={userBankDetails.bank_name && !editingBank}
                      />
                    </div>
                  </div>
                  
                  <div className="form-actions">
                    {editingBank && (
                      <button 
                        className="btn-cancel"
                        onClick={() => {
                          setEditingBank(false);
                          setFormData({
                            amount: '',
                            bank_name: userBankDetails.bank_name,
                            account_number: userBankDetails.account_number,
                            account_name: userBankDetails.account_name
                          });
                        }}
                      >
                        Cancel
                      </button>
                    )}
                    <button 
                      className="action-btn" 
                      onClick={userBankDetails.bank_name && editingBank ? handleSaveBankDetails : handleVerifyAccount}
                      disabled={isLoading || savingBank}
                    >
                      {isLoading || savingBank ? (
                        <Loader2 className="spinner" />
                      ) : userBankDetails.bank_name && editingBank ? (
                        'Save Changes'
                      ) : (
                        'Verify Account'
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="step-ui">
              <div className="account-verified-tag">
                <ShieldCheck size={16} />
                <span>{formData.account_name || userBankDetails.account_name}</span>
                <button 
                  className="change-account-btn"
                  onClick={() => {
                    setStep(1);
                    setFormData(prev => ({ ...prev, amount: '' }));
                  }}
                >
                  Change
                </button>
              </div>
              
              <h3>Enter Amount</h3>
              <div className="amount-field">
                <span>₦</span>
                <input 
                  type="number" 
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                />
              </div>
              
              <div className="quick-select">
                {[5000, 10000, 50000, 100000, wallet.available].filter(amt => amt <= wallet.available && amt >= 5000).map(amt => (
                  <button 
                    key={amt} 
                    onClick={() => setFormData({...formData, amount: amt})}
                    className={amt === wallet.available ? 'max-btn' : ''}
                  >
                    {amt === wallet.available ? 'Max' : formatCurrency(amt)}
                  </button>
                ))}
              </div>
              
              <div className="withdrawal-summary">
                <div className="summary-row">
                  <span>Amount to withdraw:</span>
                  <strong>{formatCurrency(formData.amount || 0)}</strong>
                </div>
                <div className="summary-row">
                  <span>Processing fee:</span>
                  <strong>₦0</strong>
                </div>
                <div className="summary-row total">
                  <span>You'll receive:</span>
                  <strong>{formatCurrency(formData.amount || 0)}</strong>
                </div>
              </div>
              
              <button 
                className="action-btn primary" 
                onClick={handleFinalWithdraw}
                disabled={isLoading || !formData.amount || formData.amount < 5000 || formData.amount > wallet.available}
              >
                {isLoading ? <Loader2 className="spinner" /> : 'Confirm Withdrawal'}
              </button>
              
              <p className="disclaimer">
                <small>Withdrawals are processed within 24-48 hours. Funds will be sent to your registered bank account.</small>
              </p>
            </div>
          )}

          {step === 3 && (
            <div className="success-ui">
              <CheckCircle2 size={64} color="#10b981" />
              <h3>Withdrawal Request Submitted!</h3>
              <p>Your withdrawal of <strong>{formatCurrency(formData.amount)}</strong> is being processed.</p>
              <div className="success-details">
                <div className="detail-row">
                  <span>Bank:</span>
                  <span>{formData.bank_name || userBankDetails.bank_name}</span>
                </div>
                <div className="detail-row">
                  <span>Account:</span>
                  <span>{formatAccountNumber(formData.account_number || userBankDetails.account_number)}</span>
                </div>
                <div className="detail-row">
                  <span>Amount:</span>
                  <strong>{formatCurrency(formData.amount)}</strong>
                </div>
              </div>
              <div className="success-actions">
                <button 
                  className="action-btn secondary"
                  onClick={() => navigate('/dashboard/landlord/wallet')}
                >
                  View History
                </button>
                <button 
                  className="action-btn outline"
                  onClick={() => {
                    setStep(1);
                    setFormData({ amount: '', bank_name: userBankDetails.bank_name, account_number: userBankDetails.account_number, account_name: userBankDetails.account_name });
                  }}
                >
                  Make Another Withdrawal
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Info Section */}
      <div className="withdraw-info-section">
        <div className="info-card">
          <h4>📋 How It Works</h4>
          <ol>
            <li>Add your bank account details</li>
            <li>Enter the amount you want to withdraw (min ₦5,000)</li>
            <li>Submit request for admin approval</li>
            <li>Funds sent to your bank within 24-48 hours</li>
          </ol>
        </div>
        <div className="info-card">
          <h4>💰 Earnings Breakdown</h4>
          <ul>
            <li><strong>Referral Commission:</strong> 1.5% when someone rents through your link</li>
            <li><strong>Property Posting:</strong> 1.5% when your property gets rented</li>
            <li><strong>Total Commission:</strong> 7.5% (shared with manager and RentEasy)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default WithdrawFunds;