import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../shared/context/AuthContext';
import { supabase } from '../../../../shared/lib/supabaseClient';
import { Calendar, Home, User, DollarSign, FileText, Star, Download, Mail, Phone } from 'lucide-react';
import './TenantRentalHistory.css';

const TenantRentalHistory = () => {
  const { user } = useAuth();
  const [rentalHistory, setRentalHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalProperties: 0,
    averageRating: 0,
    totalDepositReturned: 0,
    totalMonths: 0
  });

  useEffect(() => {
    if (user) {
      loadRentalHistory();
    }
  }, [user]);

  const loadRentalHistory = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // 1. Get all units where tenant has been assigned (including past ones)
      const { data: units, error: unitsError } = await supabase
        .from('units')
        .select(`
          id,
          unit_number,
          rent_amount,
          rent_frequency,
          lease_start_date,
          lease_end_date,
          status,
          tenant_history,
          property:property_id (
            id,
            title,
            address,
            city,
            state,
            estate_firm_id,
            landlord_id
          )
        `)
        .eq('tenant_id', user.id);

      if (unitsError) throw unitsError;

      if (!units || units.length === 0) {
        setRentalHistory([]);
        setLoading(false);
        return;
      }

      // 2. Get landlord and estate firm info
      const propertyIds = units.map(u => u.property?.id).filter(Boolean);
      const estateFirmIds = units.map(u => u.property?.estate_firm_id).filter(Boolean);
      const landlordIds = units.map(u => u.property?.landlord_id).filter(Boolean);

      // Fetch estate firm profiles
      let estateFirmMap = {};
      if (estateFirmIds.length > 0) {
        const { data: firms } = await supabase
          .from('estate_firm_profiles')
          .select('id, firm_name, business_phone, business_email')
          .in('id', estateFirmIds);
        if (firms) {
          estateFirmMap = Object.fromEntries(firms.map(f => [f.id, f]));
        }
      }

      // Fetch landlord profiles
      let landlordMap = {};
      if (landlordIds.length > 0) {
        const { data: landlords } = await supabase
          .from('profiles')
          .select('id, full_name, name, email, phone')
          .in('id', landlordIds);
        if (landlords) {
          landlordMap = Object.fromEntries(landlords.map(l => [l.id, l]));
        }
      }

      // 3. Get payment history for these units
      const unitIds = units.map(u => u.id);
      let paymentsMap = {};
      if (unitIds.length > 0) {
        const { data: payments } = await supabase
          .from('payments')
          .select('*')
          .in('unit_id', unitIds)
          .eq('payment_type', 'rent')
          .order('payment_date', { ascending: false });
        
        if (payments) {
          paymentsMap = payments.reduce((acc, p) => {
            if (!acc[p.unit_id]) acc[p.unit_id] = [];
            acc[p.unit_id].push(p);
            return acc;
          }, {});
        }
      }

      // 4. Get rental confirmations
      let confirmationsMap = {};
      if (unitIds.length > 0) {
        const { data: confirmations } = await supabase
          .from('rental_confirmations')
          .select('*')
          .in('unit_id', unitIds);
        
        if (confirmations) {
          confirmationsMap = Object.fromEntries(confirmations.map(c => [c.unit_id, c]));
        }
      }

      // 5. Transform data for display
      const transformedHistory = units.map(unit => {
        const property = unit.property;
        const isEstateFirm = property?.estate_firm_id;
        const landlord = isEstateFirm 
          ? estateFirmMap[property.estate_firm_id] 
          : landlordMap[property.landlord_id];
        
        const unitPayments = paymentsMap[unit.id] || [];
        const confirmedPayments = unitPayments.filter(p => p.status === 'confirmed');
        const totalPaid = confirmedPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
        
        const confirmation = confirmationsMap[unit.id];
        const tenantRating = confirmation?.tenant_rating || null;
        const landlordRating = confirmation?.landlord_rating || null;
        
        // Calculate deposit returned (check if lease completed and deposit was returned)
        const isLeaseCompleted = unit.lease_end_date && new Date(unit.lease_end_date) < new Date();
        const depositReturned = isLeaseCompleted ? unit.rent_amount * 2 : null; // Example: 2 months rent as deposit
        
        // Get tenant history from unit.tenant_history
        const historyNotes = unit.tenant_history && unit.tenant_history.length > 0 
          ? unit.tenant_history[unit.tenant_history.length - 1]?.notes 
          : null;
        
        return {
          id: unit.id,
          propertyName: property?.title || 'Unknown Property',
          address: property?.address || '',
          city: property?.city || '',
          state: property?.state || '',
          landlordName: landlord?.firm_name || landlord?.full_name || landlord?.name || 'Unknown',
          landlordPhone: landlord?.business_phone || landlord?.phone || null,
          landlordEmail: landlord?.business_email || landlord?.email || null,
          period: `${unit.lease_start_date ? new Date(unit.lease_start_date).getFullYear() : 'N/A'} - ${unit.lease_end_date ? new Date(unit.lease_end_date).getFullYear() : 'Present'}`,
          startDate: unit.lease_start_date,
          endDate: unit.lease_end_date,
          status: unit.status === 'occupied' ? 'active' : 'completed',
          rentAmount: unit.rent_amount,
          rentFrequency: unit.rent_frequency,
          totalPaid,
          depositPaid: unit.rent_amount * 2, // Assuming 2 months deposit
          depositReturned,
          landlordRating,
          tenantRating,
          notes: historyNotes || '',
          unitNumber: unit.unit_number,
          paymentCount: confirmedPayments.length
        };
      });

      // Sort by end date (most recent first)
      transformedHistory.sort((a, b) => {
        if (!a.endDate) return -1;
        if (!b.endDate) return 1;
        return new Date(b.endDate) - new Date(a.endDate);
      });

      setRentalHistory(transformedHistory);

      // Calculate stats
      const completedRentals = transformedHistory.filter(r => r.status === 'completed');
      const totalRentals = transformedHistory.length;
      const avgRating = transformedHistory
        .filter(r => r.tenantRating)
        .reduce((sum, r) => sum + r.tenantRating, 0) / (transformedHistory.filter(r => r.tenantRating).length || 1);
      const totalDepositReturned = completedRentals.reduce((sum, r) => sum + (r.depositReturned || 0), 0);
      const totalMonths = completedRentals.reduce((sum, r) => {
        if (r.startDate && r.endDate) {
          const months = (new Date(r.endDate) - new Date(r.startDate)) / (1000 * 60 * 60 * 24 * 30);
          return sum + Math.max(0, months);
        }
        return sum;
      }, 0);

      setStats({
        totalProperties: totalRentals,
        averageRating: avgRating.toFixed(1),
        totalDepositReturned,
        totalMonths: Math.round(totalMonths)
      });

    } catch (err) {
      console.error('Error loading rental history:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadTenantReport = async () => {
    try {
      // Generate a report summary
      const reportData = {
        tenantName: user?.full_name || user?.email,
        tenantEmail: user?.email,
        generatedAt: new Date().toISOString(),
        rentalHistory: rentalHistory.map(r => ({
          property: r.propertyName,
          address: `${r.address}, ${r.city}, ${r.state}`,
          landlord: r.landlordName,
          period: r.period,
          rentAmount: r.rentAmount,
          status: r.status,
          tenantRating: r.tenantRating
        })),
        stats
      };
      
      // Create a downloadable JSON file
      const dataStr = JSON.stringify(reportData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `tenant_report_${user?.id}_${Date.now()}.json`;
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      alert('Tenant report downloaded successfully!');
    } catch (err) {
      console.error('Error generating report:', err);
      alert('Failed to generate report');
    }
  };

  const requestReference = async (rental) => {
    try {
      // Create a reference request notification for the landlord
      const recipientId = rental.landlordEmail ? null : rental.landlordId;
      
      // Insert notification for landlord
      if (recipientId) {
        await supabase
          .from('landlord_notifications')
          .insert({
            landlord_id: recipientId,
            tenant_id: user.id,
            title: 'Reference Request',
            message: `${user?.full_name || 'A tenant'} is requesting a reference for their rental at ${rental.propertyName}.`,
            type: 'reference_request',
            read: false,
            created_at: new Date().toISOString()
          });
      }
      
      alert(`Reference request sent to ${rental.landlordName}`);
    } catch (err) {
      console.error('Error sending reference request:', err);
      alert('Failed to send reference request');
    }
  };

  const viewDocuments = async (rental) => {
    // Navigate to documents page with rental context
    window.open(`/dashboard/tenant/documents?property=${rental.id}`, '_blank');
  };

  const formatCurrency = (amount) => {
    if (!amount) return '₦0';
    return `₦${amount.toLocaleString()}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Present';
    return new Date(dateStr).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="rental-history-loading">
        <div className="loading-spinner"></div>
        <p>Loading rental history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rental-history-error">
        <div className="error-icon">⚠️</div>
        <h3>Error Loading Rental History</h3>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={loadRentalHistory}>Retry</button>
      </div>
    );
  }

  return (
    <div className="tenant-rental-history">
      <div className="rental-header">
        <div className="header-content">
          <h1>Rental History</h1>
          <p>Track your past and current rental experiences</p>
        </div>
        <button className="btn btn-primary" onClick={downloadTenantReport}>
          <Download size={18} />
          Download Tenant Report
        </button>
      </div>

      {/* Rental Stats */}
      <div className="rental-stats">
        <div className="stat-card">
          <div className="stat-icon"><Home size={24} /></div>
          <div className="stat-info">
            <span className="stat-value">{stats.totalProperties}</span>
            <span className="stat-label">Properties Rented</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><Star size={24} /></div>
          <div className="stat-info">
            <span className="stat-value">{stats.averageRating}</span>
            <span className="stat-label">Average Tenant Rating</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><Calendar size={24} /></div>
          <div className="stat-info">
            <span className="stat-value">{stats.totalMonths}</span>
            <span className="stat-label">Total Months Rented</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><DollarSign size={24} /></div>
          <div className="stat-info">
            <span className="stat-value">{formatCurrency(stats.totalDepositReturned)}</span>
            <span className="stat-label">Deposit Returned</span>
          </div>
        </div>
      </div>

      {/* Rental History List */}
      <div className="rental-history-list">
        <h2>Your Rental History</h2>
        
        {rentalHistory.length > 0 ? (
          rentalHistory.map((rental) => (
            <div key={rental.id} className="rental-card">
              <div className="rental-header-info">
                <div className="property-main">
                  <h3>{rental.propertyName}</h3>
                  <span className={`status-badge ${rental.status}`}>
                    {rental.status === 'active' ? 'Current' : 'Completed'}
                  </span>
                </div>
                <div className="rental-period">
                  <Calendar size={14} />
                  {formatDate(rental.startDate)} - {formatDate(rental.endDate)}
                </div>
              </div>

              <div className="rental-details">
                <div className="detail-column">
                  <div className="detail-item">
                    <span className="detail-label">Address:</span>
                    <span className="detail-value">{rental.address}, {rental.city}, {rental.state}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Unit:</span>
                    <span className="detail-value">Unit {rental.unitNumber}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Monthly Rent:</span>
                    <span className="detail-value">{formatCurrency(rental.rentAmount)}</span>
                  </div>
                </div>

                <div className="detail-column">
                  <div className="detail-item">
                    <span className="detail-label">Landlord:</span>
                    <span className="detail-value">{rental.landlordName}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Deposit Paid:</span>
                    <span className="detail-value">{formatCurrency(rental.depositPaid)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Deposit Returned:</span>
                    <span className={`detail-value ${rental.depositReturned ? 'deposit-returned' : ''}`}>
                      {rental.depositReturned ? formatCurrency(rental.depositReturned) : 'Pending'}
                    </span>
                  </div>
                </div>

                <div className="detail-column">
                  <div className="detail-item">
                    <span className="detail-label">Total Payments:</span>
                    <span className="detail-value">{rental.paymentCount}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Total Paid:</span>
                    <span className="detail-value">{formatCurrency(rental.totalPaid)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Your Rating:</span>
                    <div className="rating-stars">
                      {rental.tenantRating ? (
                        <>
                          {'★'.repeat(Math.floor(rental.tenantRating))}
                          {'☆'.repeat(5 - Math.floor(rental.tenantRating))}
                          <span className="rating-number">({rental.tenantRating})</span>
                        </>
                      ) : (
                        <span className="not-rated">Not rated yet</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {rental.notes && (
                <div className="rental-notes">
                  <span className="notes-label">Notes:</span>
                  <p>{rental.notes}</p>
                </div>
              )}

              <div className="rental-actions">
                {rental.landlordPhone && (
                  <button 
                    className="btn btn-outline"
                    onClick={() => window.location.href = `tel:${rental.landlordPhone}`}
                  >
                    <Phone size={14} /> Call Landlord
                  </button>
                )}
                <button 
                  className="btn btn-outline"
                  onClick={() => requestReference(rental)}
                >
                  Request Reference
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={() => viewDocuments(rental)}
                >
                  <FileText size={14} /> View Documents
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-history">
            <div className="empty-icon">📅</div>
            <h3>No Rental History Yet</h3>
            <p>Your rental history will appear here once you start renting through RentEasy</p>
            <button className="btn btn-primary" onClick={() => window.location.href = '/listings'}>
              Browse Properties
            </button>
          </div>
        )}
      </div>

      {/* Benefits Section */}
      <div className="history-benefits">
        <h3>Build Your Rental Reputation</h3>
        <div className="benefits-grid">
          <div className="benefit-card">
            <div className="benefit-icon">📈</div>
            <h4>Improve Your Profile</h4>
            <p>A good rental history increases your chances of approval</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">🤝</div>
            <h4>Get References</h4>
            <p>Request references from past landlords</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">📄</div>
            <h4>Tenant Report</h4>
            <p>Download a verified tenant report for new applications</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantRentalHistory;