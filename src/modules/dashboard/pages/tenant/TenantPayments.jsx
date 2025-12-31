// src/modules/dashboard/pages/tenant/TenantPayments.jsx
import React, { useState, useEffect } from 'react'
import { useAuth } from '../../../../shared/context/AuthContext'
import './TenantPayments.css'

const TenantPayments = () => {
  const { user } = useAuth()
  const [payments, setPayments] = useState([])
  const [upcoming, setUpcoming] = useState([])
  const [paymentMethods, setPaymentMethods] = useState([])
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  useEffect(() => {
    // Mock data
    const mockPayments = [
      {
        id: 'pay_001',
        date: '2024-12-01',
        description: 'December Rent',
        amount: 450000,
        method: 'Bank Transfer',
        status: 'paid',
        reference: 'REF123456'
      },
      // ... more payments
    ]
    
    const mockUpcoming = [
      {
        id: 'upcoming_001',
        dueDate: '2024-12-15',
        description: 'January Rent',
        amount: 450000,
        type: 'rent'
      }
    ]
    
    const mockMethods = [
      { id: 'method_1', type: 'bank', bank: 'GTBank', account: '0123456789', primary: true },
      { id: 'method_2', type: 'card', bank: 'Mastercard', last4: '4242', expiry: '12/25' }
    ]

    setPayments(mockPayments)
    setUpcoming(mockUpcoming)
    setPaymentMethods(mockMethods)
  }, [])

  const makePayment = () => {
    setShowPaymentModal(true)
  }

  return (
    <div className="tenant-payments">
      <h1>Payments</h1>
      
      {/* Upcoming Payments */}
      <div className="upcoming-payments">
        <h3>Upcoming Payments</h3>
        {upcoming.map(payment => (
          <div key={payment.id} className="upcoming-card">
            <div>
              <h4>{payment.description}</h4>
              <p>Due: {payment.dueDate}</p>
            </div>
            <div>
              <span className="amount">₦{payment.amount.toLocaleString()}</span>
              <button className="btn btn-primary" onClick={makePayment}>
                Pay Now
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Payment History */}
      <div className="payment-history">
        <h3>Payment History</h3>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Reference</th>
            </tr>
          </thead>
          <tbody>
            {payments.map(payment => (
              <tr key={payment.id}>
                <td>{payment.date}</td>
                <td>{payment.description}</td>
                <td>₦{payment.amount.toLocaleString()}</td>
                <td><span className={`status status-${payment.status}`}>{payment.status}</span></td>
                <td>{payment.reference}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Payment Methods */}
      <div className="payment-methods">
        <h3>Payment Methods</h3>
        <div className="methods-grid">
          {paymentMethods.map(method => (
            <div key={method.id} className="method-card">
              {method.type === 'bank' ? '🏦' : '💳'}
              <div>
                <h4>{method.bank}</h4>
                <p>{method.type === 'bank' ? method.account : `**** ${method.last4}`}</p>
              </div>
              {method.primary && <span className="primary-badge">Primary</span>}
            </div>
          ))}
        </div>
        <button className="btn btn-outline">Add Payment Method</button>
      </div>
    </div>
  )
}

export default TenantPayments