// src/modules/manager/pages/ManagerPayments.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../shared/context/AuthContext'
import './ManagerPayments.css'

const ManagerPayments = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const [payments, setPayments] = useState([])
  const [filter, setFilter] = useState('all') // all, pending, confirmed, withdrawn
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalEarned: 0,
    available: 0,
    withdrawn: 0,
    pending: 0
  })
  const [withdrawalAmount, setWithdrawalAmount] = useState('')
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false)

  useEffect(() => {
    loadPayments()
  }, [])

  const loadPayments = () => {
    const allPayments = JSON.parse(localStorage.getItem('payments') || '[]')
    const managerPayments = allPayments.filter(p => p.managerId === user.id)
    
    // Calculate stats
    const totalEarned = managerPayments.reduce((sum, p) => sum + (p.managerCommission || 0), 0)
    const withdrawn = managerPayments.filter(p => p.paidToManager).reduce((sum, p) => sum + (p.managerCommission || 0), 0)
    const available = totalEarned - withdrawn
    const pending = managerPayments.filter(p => !p.paidToManager).reduce((sum, p) => sum + (p.managerCommission || 0), 0)

    setStats({
      totalEarned,
      available,
      withdrawn,
      pending
    })

    setPayments(managerPayments)
    setLoading(false)
  }

  const getFilteredPayments = () => {
    switch(filter) {
      case 'pending':
        return payments.filter(p => !p.paidToManager)
      case 'confirmed':
        return payments.filter(p => p.paidToManager)
      case 'withdrawn':
        return payments.filter(p => p.paidToManager && p.withdrawalDate)
      default:
        return payments
    }
  }

  const getPaymentStatus = (payment) => {
    if (payment.paidToManager) {
      return { label: 'Paid', color: '#155724', bgColor: '#d4edda', icon: '✅' }
    }
    
    if (payment.status === 'confirmed') {
      return { label: 'Confirmed', color: '#004085', bgColor: '#cce5ff', icon: '💰' }
    }
    
    return { label: 'Pending', color: '#856404', bgColor: '#fff3cd', icon: '⏳' }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getAssociatedListing = (payment) => {
    const listings = JSON.parse(localStorage.getItem('listings') || '[]')
    return listings.find(l => l.id === payment.listingId)
  }

  const getCommissionBreakdown = (payment) => {
    return {
      total: payment.totalCommission || payment.managerCommission * 3, // 2.5% * 3 = 7.5%
      manager: payment.managerCommission,
      referrer: payment.referrerCommission || payment.managerCommission * 0.4, // Approx 1%
      platform: payment.platformCommission || payment.managerCommission * 1.6 // Approx 4%
    }
  }

  if (loading) {
    return <div className="loading">Loading payments...</div>
  }

  return (
    <div className="manager-payments">
      {/* HEADER */}
      <div className="page-header">
        <div>
          <h1>💰 Payments & Commission</h1>
          <p>Track your earnings and request withdrawals</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/dashboard/manager')}
        >
          Back to Dashboard
        </button>
      </div>

      {/* EARNINGS SUMMARY */}
      <div className="earnings-summary">
        <div className="summary-card total">
          <div className="summary-icon">💰</div>
          <div className="summary-content">
            <div className="summary-label">Total Earned</div>
            <div className="summary-amount">{formatCurrency(stats.totalEarned)}</div>
            <div className="summary-sub">Lifetime earnings</div>
          </div>
        </div>
        
        <div className="summary-card available">
          <div className="summary-icon">💳</div>
          <div className="summary-content">
            <div className="summary-label">Available</div>
            <div className="summary-amount">{formatCurrency(stats.available)}</div>
            <div className="summary-sub">Ready for withdrawal</div>
          </div>
          <button 
            className="btn-withdraw"
            onClick={() => navigate('/dashboard/manager/withdraw')}
            disabled={stats.available < 5000}
          >
            Withdraw
          </button>
        </div>
        
        <div className="summary-card withdrawn">
          <div className="summary-icon">✅</div>
          <div className="summary-content">
            <div className="summary-label">Withdrawn</div>
            <div className="summary-amount">{formatCurrency(stats.withdrawn)}</div>
            <div className="summary-sub">Already paid out</div>
          </div>
        </div>
        
        <div className="summary-card pending">
          <div className="summary-icon">⏳</div>
          <div className="summary-content">
            <div className="summary-label">Pending</div>
            <div className="summary-amount">{formatCurrency(stats.pending)}</div>
            <div className="summary-sub">Awaiting confirmation</div>
          </div>
        </div>
      </div>

      {/* WITHDRAWAL CTA */}
      {stats.available >= 5000 && (
        <div className="withdrawal-cta">
          <div className="cta-content">
            <div className="cta-icon">💸</div>
            <div className="cta-text">
              <h4>Withdraw Your Earnings</h4>
              <p>You have ₦{stats.available.toLocaleString()} available for withdrawal</p>
            </div>
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/dashboard/manager/withdraw')}
          >
            Request Withdrawal
          </button>
        </div>
      )}

      {/* FILTERS */}
      <div className="payments-filters">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Payments
        </button>
        <button 
          className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pending ({payments.filter(p => !p.paidToManager).length})
        </button>
        <button 
          className={`filter-btn ${filter === 'confirmed' ? 'active' : ''}`}
          onClick={() => setFilter('confirmed')}
        >
          Confirmed ({payments.filter(p => p.paidToManager).length})
        </button>
      </div>

      {/* PAYMENTS TABLE */}
      <div className="payments-table-container">
        {getFilteredPayments().length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💰</div>
            <h3>No {filter} payments found</h3>
            <p>
              {filter === 'all' ? 'No commission payments yet. Rent properties to earn commissions.' :
               filter === 'pending' ? 'All payments have been confirmed' :
               'No confirmed payments yet'}
            </p>
            {filter !== 'all' && (
              <button 
                className="btn btn-outline"
                onClick={() => setFilter('all')}
              >
                View All Payments
              </button>
            )}
          </div>
        ) : (
          <table className="payments-table">
            <thead>
              <tr>
                <th>Property</th>
                <th>Date</th>
                <th>Rental Amount</th>
                <th>Commission</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {getFilteredPayments().map(payment => {
                const status = getPaymentStatus(payment)
                const listing = getAssociatedListing(payment)
                const breakdown = getCommissionBreakdown(payment)
                
                return (
                  <tr key={payment.id}>
                    <td>
                      <div className="property-info">
                        <strong>{listing?.title || payment.listingTitle}</strong>
                        <small>{listing?.address || 'Unknown address'}</small>
                      </div>
                    </td>
                    <td>
                      {new Date(payment.date || payment.confirmedAt).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="amount-cell">
                        <strong>{formatCurrency(payment.rentalAmount || breakdown.total * 13.33)}</strong>
                        <small>Rental</small>
                      </div>
                    </td>
                    <td>
                      <div className="commission-cell">
                        <strong className="highlight">
                          {formatCurrency(payment.managerCommission)}
                        </strong>
                        <small>Your 2.5% share</small>
                      </div>
                    </td>
                    <td>
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: status.bgColor, color: status.color }}
                      >
                        {status.icon} {status.label}
                      </span>
                    </td>
                    <td>
                      <div className="payment-actions">
                        <button 
                          className="btn btn-sm btn-primary"
                          onClick={() => {
                            if (listing) {
                              navigate(`/listings/${listing.id}`)
                            }
                          }}
                        >
                          View Property
                        </button>
                        <button 
                          className="btn btn-sm btn-outline"
                          onClick={() => {
                            // Show commission breakdown
                            alert(
                              `Commission Breakdown:\n\n` +
                              `Total Rental: ${formatCurrency(payment.rentalAmount || breakdown.total * 13.33)}\n` +
                              `Total Commission (7.5%): ${formatCurrency(breakdown.total)}\n` +
                              `• Manager (You): ${formatCurrency(breakdown.manager)} (2.5%)\n` +
                              `• Referrer: ${formatCurrency(breakdown.referrer)} (1%)\n` +
                              `• RentEasy: ${formatCurrency(breakdown.platform)} (4%)`
                            )
                          }}
                        >
                          View Details
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* COMMISSION BREAKDOWN */}
      <div className="commission-breakdown-section">
        <h3>📊 Commission Structure</h3>
        <div className="breakdown-cards">
          <div className="breakdown-card manager">
            <div className="breakdown-header">
              <span className="breakdown-icon">👨‍💼</span>
              <span className="breakdown-title">Manager (You)</span>
            </div>
            <div className="breakdown-percentage">2.5%</div>
            <div className="breakdown-amount">
              {formatCurrency(stats.totalEarned)}
            </div>
            <div className="breakdown-label">Total Earnings</div>
          </div>
          
          <div className="breakdown-card referrer">
            <div className="breakdown-header">
              <span className="breakdown-icon">👥</span>
              <span className="breakdown-title">Referrer</span>
            </div>
            <div className="breakdown-percentage">1%</div>
            <div className="breakdown-amount">
              {formatCurrency(stats.totalEarned * 0.4)}
            </div>
            <div className="breakdown-label">Total Referral</div>
          </div>
          
          <div className="breakdown-card platform">
            <div className="breakdown-header">
              <span className="breakdown-icon">🏢</span>
              <span className="breakdown-title">RentEasy</span>
            </div>
            <div className="breakdown-percentage">4%</div>
            <div className="breakdown-amount">
              {formatCurrency(stats.totalEarned * 1.6)}
            </div>
            <div className="breakdown-label">Platform Fee</div>
          </div>
          
          <div className="breakdown-card total">
            <div className="breakdown-header">
              <span className="breakdown-icon">💰</span>
              <span className="breakdown-title">Total Commission</span>
            </div>
            <div className="breakdown-percentage">7.5%</div>
            <div className="breakdown-amount">
              {formatCurrency(stats.totalEarned * 3)}
            </div>
            <div className="breakdown-label">Per Rental</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ManagerPayments