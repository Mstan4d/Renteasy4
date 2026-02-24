import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../shared/context/AuthContext';
import { supabase } from '../../../../shared/lib/supabaseClient';
import { 
  ArrowLeft, ShieldCheck, Landmark, 
  Wallet, AlertCircle, CheckCircle2, Loader2 
} from 'lucide-react';
import './WithdrawFunds.css';

const WithdrawFunds = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [wallet, setWallet] = useState({ available: 0, balance: 0 });
  const [step, setStep] = useState(1);
  
  const [formData, setFormData] = useState({
    amount: '',
    bank_name: '',
    account_number: '',
    account_name: '',
  });

  useEffect(() => {
    if (user) fetchWalletBalance();
  }, [user]);

  const fetchWalletBalance = async () => {
    const { data, error } = await supabase
      .from('landlord_wallets')
      .select('available_balance, total_balance')
      .eq('landlord_id', user.id)
      .single();

    if (!error && data) {
      setWallet({
        available: data.available_balance,
        balance: data.total_balance
      });
    }
  };

  const handleVerifyAccount = async () => {
    if (formData.account_number.length !== 10) return alert("Enter valid NUBAN");
    setIsLoading(true);
    // In production, you'd call a Paystack/Flutterwave resolve endpoint here
    setTimeout(() => {
      setFormData(prev => ({ ...prev, account_name: user.full_name || "Verified Name" }));
      setStep(2);
      setIsLoading(false);
    }, 1500);
  };

  const handleFinalWithdraw = async () => {
    if (Number(formData.amount) > wallet.available) return alert("Insufficient balance");
    setIsLoading(true);

    try {
      // 1. Create a pending withdrawal request
      const { error: txError } = await supabase
        .from('wallet_transactions')
        .insert([{
          user_id: user.id,
          amount: Number(formData.amount),
          type: 'withdrawal',
          status: 'pending',
          description: `Withdrawal to ${formData.bank_name}`,
          reference: `WD-${Math.random().toString(36).toUpperCase().slice(2, 10)}`
        }]);

      if (txError) throw txError;

      // 2. Log withdrawal details for admin processing
      await supabase.from('payout_requests').insert([{
        landlord_id: user.id,
        amount: formData.amount,
        bank_details: {
            bank: formData.bank_name,
            number: formData.account_number,
            name: formData.account_name
        }
      }]);

      setStep(3);
    } catch (err) {
      alert("Error processing withdrawal: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (num) => `₦${Number(num).toLocaleString()}`;

  return (
    <div className="withdraw-container">
      <header className="withdraw-nav">
        <button onClick={() => navigate(-1)} className="back-btn"><ArrowLeft size={20}/></button>
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
             <span>Settlements take 24-48 hours.</span>
          </div>
        </div>

        {/* Withdrawal Flow */}
        <div className="form-card">
          {step === 1 && (
            <div className="step-ui">
              <h3>Bank Details</h3>
              <div className="input-group">
                <label>Select Bank</label>
                <select 
                  value={formData.bank_name} 
                  onChange={(e) => setFormData({...formData, bank_name: e.target.value})}
                >
                  <option value="">Choose Bank</option>
                  <option value="GTBank">Guaranty Trust Bank</option>
                  <option value="Zenith">Zenith Bank</option>
                  <option value="Kuda">Kuda Bank</option>
                </select>
              </div>
              <div className="input-group">
                <label>Account Number (NUBAN)</label>
                <input 
                  type="text" 
                  maxLength="10"
                  placeholder="0123456789"
                  value={formData.account_number}
                  onChange={(e) => setFormData({...formData, account_number: e.target.value})}
                />
              </div>
              <button 
                className="action-btn" 
                onClick={handleVerifyAccount}
                disabled={isLoading || !formData.bank_name || formData.account_number.length !== 10}
              >
                {isLoading ? <Loader2 className="spinner" /> : "Verify Account"}
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="step-ui">
              <div className="account-verified-tag">
                <ShieldCheck size={16} /> {formData.account_name}
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
                 {[50000, 100000, wallet.available].map(amt => (
                    <button key={amt} onClick={() => setFormData({...formData, amount: amt})}>
                        {amt === wallet.available ? 'Max' : formatCurrency(amt)}
                    </button>
                 ))}
              </div>
              <button 
                className="action-btn primary" 
                onClick={handleFinalWithdraw}
                disabled={isLoading || !formData.amount || formData.amount < 1000}
              >
                {isLoading ? "Processing..." : "Confirm Payout"}
              </button>
              <button className="text-btn" onClick={() => setStep(1)}>Change Account</button>
            </div>
          )}

          {step === 3 && (
            <div className="success-ui">
              <CheckCircle2 size={64} color="#10b981" />
              <h3>Request Submitted</h3>
              <p>Your withdrawal of <strong>{formatCurrency(formData.amount)}</strong> is being processed.</p>
              <button className="action-btn" onClick={() => navigate('/dashboard/landlord/wallet/history')}>
                View History
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WithdrawFunds;