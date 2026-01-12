// src/modules/manager/pages/ManagerWithdrawal.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../shared/context/AuthContext'
import './ManagerWithdrawal.css'

const ManagerWithdrawal = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    availableBalance: 0,
    minimumWithdrawal: 5000,
    processingFeePercent: 1,
    processingTime: '24-48 hours'
  })
  
  const [withdrawalData, setWithdrawalData] = useState({
    amount: '',
    bankCode: '',
    accountNumber: '',
    accountName: '',
    narration: ''
  })
  
  const [banks, setBanks] = useState([])
  const [verifyingAccount, setVerifyingAccount] = useState(false)
  const [accountDetails, setAccountDetails] = useState(null)
  const [errors, setErrors] = useState({})
  const [savedAccounts, setSavedAccounts] = useState([])

  // Nigerian banks data (can be moved to separate file or API later)
  const nigerianBanks = [
    { code: "044", name: "Access Bank" },
    { code: "063", name: "Access Bank (Diamond)" },
    { code: "035A", name: "ALAT by WEMA" },
    { code: "090110", name: "ASO Savings and Loans" },
    { code: "401", name: "ASO Savings and Loans (Old)" },
    { code: "023", name: "Citibank Nigeria" },
    { code: "050", name: "Ecobank Nigeria" },
    { code: "562", name: "Ekondo Microfinance Bank" },
    { code: "070", name: "Fidelity Bank" },
    { code: "011", name: "First Bank of Nigeria" },
    { code: "214", name: "First City Monument Bank" },
    { code: "413", name: "FSDH Merchant Bank" },
    { code: "00103", name: "Globus Bank" },
    { code: "058", name: "Guaranty Trust Bank" },
    { code: "030", name: "Heritage Bank" },
    { code: "301", name: "Jaiz Bank" },
    { code: "082", name: "Keystone Bank" },
    { code: "101", name: "Kuda Bank" },
    { code: "50211", name: "Lagos Building Investment Company" },
    { code: "90052", name: "Moniepoint Microfinance Bank" },
    { code: "526", name: "Parallex Bank" },
    { code: "311", name: "Paga" },
    { code: "999991", name: "PalmPay" },
    { code: "999992", name: "Paga" },
    { code: "076", name: "Polaris Bank" },
    { code: "104", name: "Providus Bank" },
    { code: "125", name: "Rubies MFB" },
    { code: "221", name: "Stanbic IBTC Bank" },
    { code: "068", name: "Standard Chartered Bank" },
    { code: "232", name: "Sterling Bank" },
    { code: "100", name: "Suntrust Bank" },
    { code: "302", name: "TAJBank" },
    { code: "51211", name: "TCF MFB" },
    { code: "102", name: "Titan Trust Bank" },
    { code: "032", name: "Union Bank of Nigeria" },
    { code: "033", name: "United Bank for Africa" },
    { code: "215", name: "Unity Bank" },
    { code: "566", name: "VFD Microfinance Bank" },
    { code: "035", name: "Wema Bank" },
    { code: "057", name: "Zenith Bank" }
  ]

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = () => {
    // Load payments data
    const allPayments = JSON.parse(localStorage.getItem('payments') || '[]')
    const managerPayments = allPayments.filter(p => p.managerId === user.id)
    
    const totalEarned = managerPayments.reduce((sum, p) => sum + (p.managerCommission || 0), 0)
    const withdrawn = managerPayments.filter(p => p.paidToManager).reduce((sum, p) => sum + (p.managerCommission || 0), 0)
    const availableBalance = totalEarned - withdrawn

    setStats(prev => ({
      ...prev,
      availableBalance
    }))

    // Load saved bank accounts from user profile
    const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}')
    if (userProfile.bankAccounts) {
      setSavedAccounts(userProfile.bankAccounts)
    }

    setBanks(nigerianBanks.sort((a, b) => a.name.localeCompare(b.name)))
    setLoading(false)
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const handleInputChange = (field, value) => {
    setWithdrawalData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }))
    }

    // Auto-verify account number when 10 digits are entered
    if (field === 'accountNumber' && value.length === 10 && withdrawalData.bankCode) {
      verifyAccountNumber(value, withdrawalData.bankCode)
    }
  }

  const handleBankChange = (bankCode) => {
    setWithdrawalData(prev => ({
      ...prev,
      bankCode,
      accountName: '' // Reset account name when bank changes
    }))
    
    // If account number already exists, verify again
    if (withdrawalData.accountNumber.length === 10) {
      verifyAccountNumber(withdrawalData.accountNumber, bankCode)
    }
  }

  const verifyAccountNumber = async (accountNumber, bankCode) => {
    if (!accountNumber || !bankCode) return
    
    setVerifyingAccount(true)
    
    // Simulate API call to verify account (replace with real API later)
    setTimeout(() => {
      const selectedBank = banks.find(bank => bank.code === bankCode)
      const mockAccountNames = [
        `${user?.name || 'Manager'} Account`,
        `${user?.name?.split(' ')[0] || 'User'} ${Math.floor(Math.random() * 100)}`,
        'Verified Account Holder',
        user?.name || 'Account Holder'
      ]
      
      const accountDetails = {
        accountNumber,
        accountName: mockAccountNames[Math.floor(Math.random() * mockAccountNames.length)],
        bankCode,
        bankName: selectedBank?.name || 'Unknown Bank',
        verified: true
      }
      
      setAccountDetails(accountDetails)
      setWithdrawalData(prev => ({
        ...prev,
        accountName: accountDetails.accountName
      }))
      setVerifyingAccount(false)
    }, 1500)
  }

  const validateForm = () => {
    const newErrors = {}
    
    // Amount validation
    const amount = parseFloat(withdrawalData.amount)
    if (!amount || amount < stats.minimumWithdrawal) {
      newErrors.amount = `Minimum withdrawal is ₦${stats.minimumWithdrawal.toLocaleString()}`
    }
    if (amount > stats.availableBalance) {
      newErrors.amount = `Insufficient balance. Available: ${formatCurrency(stats.availableBalance)}`
    }
    
    // Bank validation
    if (!withdrawalData.bankCode) {
      newErrors.bankCode = 'Please select a bank'
    }
    
    // Account number validation
    if (!withdrawalData.accountNumber || withdrawalData.accountNumber.length !== 10) {
      newErrors.accountNumber = 'Account number must be 10 digits'
    }
    
    // Account name validation
    if (!withdrawalData.accountName || withdrawalData.accountName.trim().length < 2) {
      newErrors.accountName = 'Please enter a valid account name'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    // Create withdrawal request
    const withdrawalRequest = {
      id: `withdraw_${Date.now()}`,
      managerId: user.id,
      managerName: user.name,
      amount: parseFloat(withdrawalData.amount),
      bankDetails: {
        bankCode: withdrawalData.bankCode,
        bankName: banks.find(b => b.code === withdrawalData.bankCode)?.name || 'Unknown Bank',
        accountNumber: withdrawalData.accountNumber,
        accountName: withdrawalData.accountName
      },
      status: 'pending',
      requestDate: new Date().toISOString(),
      processingFee: parseFloat(withdrawalData.amount) * (stats.processingFeePercent / 100),
      netAmount: parseFloat(withdrawalData.amount) * (1 - stats.processingFeePercent / 100),
      expectedDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      narration: withdrawalData.narration || `Withdrawal by ${user.name}`
    }
    
    // Save withdrawal request
    const withdrawals = JSON.parse(localStorage.getItem('withdrawals') || '[]')
    withdrawals.push(withdrawalRequest)
    localStorage.setItem('withdrawals', JSON.stringify(withdrawals))
    
    // Save bank account to user profile for future use
    saveBankAccountToProfile()
    
    // Show success message
    alert(`✅ Withdrawal request submitted successfully!\n\n` +
          `Amount: ${formatCurrency(withdrawalRequest.amount)}\n` +
          `Net Amount: ${formatCurrency(withdrawalRequest.netAmount)}\n` +
          `Processing Fee (${stats.processingFeePercent}%): ${formatCurrency(withdrawalRequest.processingFee)}\n` +
          `Expected by: ${new Date(withdrawalRequest.expectedDate).toLocaleDateString()}\n\n` +
          `Your withdrawal is being processed and will be completed within ${stats.processingTime}.`)
    
    // Redirect to payments page
    navigate('/dashboard/manager/payments')
  }

  const saveBankAccountToProfile = () => {
    const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}')
    
    const newAccount = {
      bankCode: withdrawalData.bankCode,
      bankName: banks.find(b => b.code === withdrawalData.bankCode)?.name || 'Unknown Bank',
      accountNumber: withdrawalData.accountNumber,
      accountName: withdrawalData.accountName,
      verified: true,
      lastUsed: new Date().toISOString()
    }
    
    // Add to saved accounts if not already exists
    const existingIndex = savedAccounts.findIndex(acc => 
      acc.bankCode === newAccount.bankCode && 
      acc.accountNumber === newAccount.accountNumber
    )
    
    if (existingIndex === -1) {
      const updatedAccounts = [...savedAccounts, newAccount]
      setSavedAccounts(updatedAccounts)
      userProfile.bankAccounts = updatedAccounts
      localStorage.setItem('userProfile', JSON.stringify(userProfile))
    }
  }

  const selectSavedAccount = (account) => {
    setWithdrawalData({
      amount: '',
      bankCode: account.bankCode,
      accountNumber: account.accountNumber,
      accountName: account.accountName,
      narration: ''
    })
    setAccountDetails({
      accountNumber: account.accountNumber,
      accountName: account.accountName,
      bankCode: account.bankCode,
      bankName: account.bankName,
      verified: true
    })
  }

  const getFeeBreakdown = () => {
    const amount = parseFloat(withdrawalData.amount) || 0
    const processingFee = amount * (stats.processingFeePercent / 100)
    const netAmount = amount - processingFee
    
    return {
      amount,
      processingFee,
      netAmount
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading withdrawal information...</p>
      </div>
    )
  }

  return (
    <div className="manager-withdrawal">
      {/* HEADER */}
      <div className="withdrawal-header">
        <button 
          className="btn-back"
          onClick={() => navigate('/dashboard/manager/payments')}
        >
          ← Back to Payments
        </button>
        <h1>💸 Request Withdrawal</h1>
        <p>Transfer your earnings to your bank account</p>
      </div>

      <div className="withdrawal-container">
        {/* LEFT SIDE: BALANCE & SAVED ACCOUNTS */}
        <div className="withdrawal-sidebar">
          {/* BALANCE CARD */}
          <div className="balance-card">
            <div className="balance-header">
              <span className="balance-icon">💰</span>
              <h3>Available Balance</h3>
            </div>
            <div className="balance-amount">
              {formatCurrency(stats.availableBalance)}
            </div>
            <div className="balance-info">
              <div className="info-item">
                <span className="label">Minimum Withdrawal:</span>
                <span className="value">₦5,000</span>
              </div>
              <div className="info-item">
                <span className="label">Processing Time:</span>
                <span className="value">{stats.processingTime}</span>
              </div>
              <div className="info-item">
                <span className="label">Processing Fee:</span>
                <span className="value">{stats.processingFeePercent}%</span>
              </div>
            </div>
          </div>

          {/* SAVED ACCOUNTS */}
          {savedAccounts.length > 0 && (
            <div className="saved-accounts">
              <h3>💳 Saved Bank Accounts</h3>
              <div className="accounts-list">
                {savedAccounts.map((account, index) => (
                  <div 
                    key={index}
                    className={`account-item ${
                      account.bankCode === withdrawalData.bankCode && 
                      account.accountNumber === withdrawalData.accountNumber ? 'selected' : ''
                    }`}
                    onClick={() => selectSavedAccount(account)}
                  >
                    <div className="account-icon">🏦</div>
                    <div className="account-details">
                      <strong>{account.accountName}</strong>
                      <div className="account-info">
                        <span>{account.bankName}</span>
                        <span>••••{account.accountNumber.slice(-4)}</span>
                      </div>
                    </div>
                    {account.verified && (
                      <span className="verified-badge">✅</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* WITHDRAWAL HISTORY LINK */}
          <div className="history-link">
            <button 
              className="btn btn-outline"
              onClick={() => navigate('/dashboard/manager/payments?tab=withdrawals')}
            >
              View Withdrawal History
            </button>
          </div>
        </div>

        {/* RIGHT SIDE: WITHDRAWAL FORM */}
        <div className="withdrawal-form-container">
          <form onSubmit={handleSubmit} className="withdrawal-form">
            {/* AMOUNT INPUT */}
            <div className="form-section">
              <h3>1. Enter Amount</h3>
              <div className="form-group">
                <label>Amount to Withdraw (₦)</label>
                <input
                  type="number"
                  value={withdrawalData.amount}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                  placeholder="Enter amount"
                  min={stats.minimumWithdrawal}
                  max={stats.availableBalance}
                  className={errors.amount ? 'error' : ''}
                />
                {errors.amount && (
                  <div className="error-message">{errors.amount}</div>
                )}
                <div className="form-hint">
                  Min: ₦{stats.minimumWithdrawal.toLocaleString()} • Max: {formatCurrency(stats.availableBalance)}
                </div>
              </div>

              {/* FEE BREAKDOWN */}
              {withdrawalData.amount && (
                <div className="fee-breakdown">
                  <h4>Breakdown</h4>
                  <div className="breakdown-item">
                    <span>Withdrawal Amount:</span>
                    <span>{formatCurrency(getFeeBreakdown().amount)}</span>
                  </div>
                  <div className="breakdown-item">
                    <span>Processing Fee ({stats.processingFeePercent}%):</span>
                    <span>{formatCurrency(getFeeBreakdown().processingFee)}</span>
                  </div>
                  <div className="breakdown-item total">
                    <span>You'll Receive:</span>
                    <span>{formatCurrency(getFeeBreakdown().netAmount)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* BANK DETAILS */}
            <div className="form-section">
              <h3>2. Bank Details</h3>
              
              {/* BANK SELECTION */}
              <div className="form-group">
                <label>Select Bank</label>
                <select
                  value={withdrawalData.bankCode}
                  onChange={(e) => handleBankChange(e.target.value)}
                  className={errors.bankCode ? 'error' : ''}
                >
                  <option value="">Choose your bank</option>
                  {banks.map(bank => (
                    <option key={bank.code} value={bank.code}>
                      {bank.name}
                    </option>
                  ))}
                </select>
                {errors.bankCode && (
                  <div className="error-message">{errors.bankCode}</div>
                )}
              </div>

              {/* ACCOUNT NUMBER */}
              <div className="form-group">
                <label>Account Number</label>
                <div className="input-with-button">
                  <input
                    type="text"
                    value={withdrawalData.accountNumber}
                    onChange={(e) => handleInputChange('accountNumber', e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="10-digit account number"
                    className={errors.accountNumber ? 'error' : ''}
                  />
                  {verifyingAccount && (
                    <span className="verifying">Verifying...</span>
                  )}
                </div>
                {errors.accountNumber && (
                  <div className="error-message">{errors.accountNumber}</div>
                )}
              </div>

              {/* ACCOUNT NAME */}
              <div className="form-group">
                <label>Account Name</label>
                <input
                  type="text"
                  value={withdrawalData.accountName}
                  onChange={(e) => handleInputChange('accountName', e.target.value)}
                  placeholder="Account holder name"
                  className={errors.accountName ? 'error' : ''}
                  readOnly={accountDetails?.verified}
                />
                {errors.accountName && (
                  <div className="error-message">{errors.accountName}</div>
                )}
                {accountDetails?.verified && (
                  <div className="success-message">
                    ✅ Verified Account: {accountDetails.accountName}
                  </div>
                )}
              </div>

              {/* NARRATION */}
              <div className="form-group">
                <label>Narration (Optional)</label>
                <input
                  type="text"
                  value={withdrawalData.narration}
                  onChange={(e) => handleInputChange('narration', e.target.value)}
                  placeholder="e.g., RentEasy Manager Withdrawal"
                  maxLength={50}
                />
                <div className="form-hint">
                  This will appear on your bank statement
                </div>
              </div>
            </div>

            {/* SECURITY NOTE */}
            <div className="security-note">
              <div className="note-icon">🔒</div>
              <div className="note-content">
                <strong>Security & Processing Information</strong>
                <p>• Your funds are secure and insured</p>
                <p>• Processing time: {stats.processingTime}</p>
                <p>• You'll receive an email confirmation</p>
                <p>• Contact support if not received within 48 hours</p>
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary btn-submit"
                disabled={!withdrawalData.amount || !withdrawalData.bankCode || !withdrawalData.accountNumber}
              >
                Request Withdrawal
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => navigate('/dashboard/manager/payments')}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* QUICK INFO */}
      <div className="quick-info-grid">
        <div className="info-card">
          <div className="info-icon">⏱️</div>
          <div className="info-content">
            <h4>Fast Processing</h4>
            <p>Most withdrawals completed within 24 hours</p>
          </div>
        </div>
        
        <div className="info-card">
          <div className="info-icon">🔒</div>
          <div className="info-content">
            <h4>Secure Transfers</h4>
            <p>Bank-level security for all transactions</p>
          </div>
        </div>
        
        <div className="info-card">
          <div className="info-icon">💳</div>
          <div className="info-content">
            <h4>All Nigerian Banks</h4>
            <p>Support for 40+ banks nationwide</p>
          </div>
        </div>
        
        <div className="info-card">
          <div className="info-icon">📧</div>
          <div className="info-content">
            <h4>Email Notifications</h4>
            <p>Instant confirmation and updates</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ManagerWithdrawal