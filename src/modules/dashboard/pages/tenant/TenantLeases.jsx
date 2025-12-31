// src/modules/dashboard/pages/tenant/TenantLeases.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../../shared/context/AuthContext'
import VerifiedBadge from '../../../../shared/components/VerifiedBadge'
import './TenantLeases.css'

const TenantLeases = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const [leases, setLeases] = useState([])
  const [activeLease, setActiveLease] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLeases()
  }, [])

  const loadLeases = () => {
    // Mock data
    const mockLeases = [
      {
        id: 'lease_001',
        property: '2 Bedroom Flat, Lekki Phase 1',
        propertyId: 'prop_001',
        landlord: 'Verified Properties Ltd.',
        landlordVerified: true,
        startDate: '2024-01-15',
        endDate: '2025-01-14',
        duration: '12 months',
        monthlyRent: 450000,
        securityDeposit: 900000,
        totalRent: 5400000,
        status: 'active',
        agreementUrl: '#',
        payments: [
          { month: 'January 2024', amount: 450000, status: 'paid', date: '2024-01-10' },
          { month: 'February 2024', amount: 450000, status: 'paid', date: '2024-02-10' },
          // ... more payments
        ],
        terms: [
          'Rent due on the 1st of each month',
          'Late fee: 5% after 5 days',
          'Maintenance requests through portal',
          'No subletting without permission'
        ]
      },
      {
        id: 'lease_002',
        property: 'Studio Apartment, Victoria Island',
        propertyId: 'prop_002',
        landlord: 'Luxury Homes',
        landlordVerified: true,
        startDate: '2023-06-01',
        endDate: '2024-05-31',
        duration: '12 months',
        monthlyRent: 1800000,
        securityDeposit: 3600000,
        totalRent: 21600000,
        status: 'completed',
        agreementUrl: '#',
        payments: [],
        terms: []
      }
    ]

    setTimeout(() => {
      setLeases(mockLeases)
      setActiveLease(mockLeases.find(lease => lease.status === 'active'))
      setLoading(false)
    }, 800)
  }

  const viewAgreement = (leaseId) => {
    // Open agreement PDF
    alert('Opening agreement PDF...')
  }

  const renewLease = (leaseId) => {
    navigate(`/dashboard/tenant/renew-lease/${leaseId}`)
  }

  return (
    <div className="tenant-leases">
      {/* Header */}
      <div className="leases-header">
        <div>
          <h1>My Leases</h1>
          <p>Manage your rental agreements and lease terms</p>
        </div>
        {activeLease && (
          <div className="active-lease-badge">
            <span className="badge-text">Active Lease</span>
            <span className="badge-property">{activeLease.property}</span>
          </div>
        )}
      </div>

      {/* Active Lease Summary */}
      {activeLease && (
        <div className="active-lease-summary">
          <h3>Current Lease</h3>
          <div className="summary-grid">
            <div className="summary-item">
              <span className="label">Monthly Rent</span>
              <span className="value">₦{activeLease.monthlyRent.toLocaleString()}</span>
            </div>
            <div className="summary-item">
              <span className="label">Lease Ends</span>
              <span className="value">{activeLease.endDate}</span>
            </div>
            <div className="summary-item">
              <span className="label">Duration</span>
              <span className="value">{activeLease.duration}</span>
            </div>
            <div className="summary-item">
              <span className="label">Security Deposit</span>
              <span className="value">₦{activeLease.securityDeposit.toLocaleString()}</span>
            </div>
          </div>
          <div className="summary-actions">
            <button className="btn btn-primary" onClick={() => viewAgreement(activeLease.id)}>
              View Agreement
            </button>
            <button className="btn btn-secondary" onClick={() => renewLease(activeLease.id)}>
              Renew Lease
            </button>
          </div>
        </div>
      )}

      {/* Leases List */}
      {loading ? (
        <div className="loading-state">Loading leases...</div>
      ) : (
        <div className="leases-list">
          {leases.map(lease => (
            <div key={lease.id} className="lease-card">
              <div className="lease-header">
                <div>
                  <h4>{lease.property}</h4>
                  <div className="landlord-info">
                    <span>Landlord: {lease.landlord}</span>
                    {lease.landlordVerified && <VerifiedBadge type="landlord" size="small" />}
                  </div>
                </div>
                <span className={`lease-status status-${lease.status}`}>
                  {lease.status}
                </span>
              </div>
              
              <div className="lease-details">
                <div className="detail-row">
                  <span>Start Date: {lease.startDate}</span>
                  <span>End Date: {lease.endDate}</span>
                </div>
                <div className="detail-row">
                  <span>Monthly Rent: ₦{lease.monthlyRent.toLocaleString()}</span>
                  <span>Total Rent: ₦{lease.totalRent.toLocaleString()}</span>
                </div>
              </div>

              <div className="lease-actions">
                <button className="btn btn-outline btn-sm" onClick={() => viewAgreement(lease.id)}>
                  View Agreement
                </button>
                {lease.status === 'active' && (
                  <button className="btn btn-primary btn-sm" onClick={() => renewLease(lease.id)}>
                    Renew Lease
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default TenantLeases