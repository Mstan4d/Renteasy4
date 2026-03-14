// src/modules/dashboard/pages/tenant/TenantLeases.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../shared/context/AuthContext';
import { supabase } from '../../../../shared/lib/supabaseClient';
import VerifiedBadge from '../../../../shared/components/VerifiedBadge';
import './TenantLeases.css';

const TenantLeases = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [leases, setLeases] = useState([]);
  const [activeLease, setActiveLease] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) loadLeases();
  }, [user]);

  const loadLeases = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('leases')
        .select(`
          *,
          property:property_id (id, title, address),
          landlord:landlord_id (id, name, verified, avatar_url)
        `)
        .eq('tenant_id', user.id)
        .order('start_date', { ascending: false });

      if (error) throw error;

      // Transform data to match component's expected structure
      const transformed = (data || []).map(lease => ({
        id: lease.id,
        property: lease.property?.title || 'Unknown Property',
        propertyId: lease.property_id,
        landlord: lease.landlord?.name || lease.landlord_name || 'Unknown',
        landlordVerified: lease.landlord?.verified || lease.landlord_verified,
        startDate: lease.start_date,
        endDate: lease.end_date,
        duration: lease.duration,
        monthlyRent: lease.monthly_rent,
        securityDeposit: lease.security_deposit,
        totalRent: lease.total_rent,
        status: lease.status,
        agreementUrl: lease.agreement_url,
        terms: lease.terms || [],
        // If you have a separate payments table, you'd fetch them here.
        // For now, we'll leave payments empty or store them in lease JSON.
        payments: [],
      }));

      setLeases(transformed);
      setActiveLease(transformed.find(lease => lease.status === 'active'));
    } catch (err) {
      console.error('Error loading leases:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const viewAgreement = (leaseId) => {
    const lease = leases.find(l => l.id === leaseId);
    if (lease?.agreementUrl) {
      window.open(lease.agreementUrl, '_blank');
    } else {
      alert('No agreement document available.');
    }
  };

  const renewLease = (leaseId) => {
    navigate(`/dashboard/tenant/renew-lease/${leaseId}`);
  };

  if (loading) {
    return (
      <div className="tenant-leases">
        <div className="loading-state">Loading leases...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tenant-leases">
        <div className="error-state">
          <p>Failed to load leases: {error}</p>
          <button onClick={loadLeases}>Retry</button>
        </div>
      </div>
    );
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
              <span className="value">₦{activeLease.securityDeposit?.toLocaleString()}</span>
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
      {leases.length === 0 ? (
        <div className="empty-state">
          <p>No leases found.</p>
        </div>
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
                  <span>Total Rent: ₦{lease.totalRent?.toLocaleString()}</span>
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
  );
};

export default TenantLeases;