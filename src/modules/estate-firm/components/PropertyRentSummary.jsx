import React, { useState, useEffect } from 'react';
import { Calendar, Clock, AlertCircle, DollarSign, Home, XCircle } from 'lucide-react';
import { supabase } from '../../../shared/lib/supabaseClient';
import './PropertyRentSummary.css';

const PropertyRentSummary = ({ propertyId }) => {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (propertyId) loadData();
  }, [propertyId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const { data: unitsData, error: unitsError } = await supabase
        .from('units')
        .select(`
          *,
          tenant:tenant_id (id, name, email, phone),
          rent_payments:rent_payments(*)
        `)
        .eq('property_id', propertyId)
        .order('unit_number');

      if (unitsError) throw unitsError;

      const unitsWithDetails = unitsData.map(unit => {
        const payments = unit.rent_payments || [];
        const latestPayment = payments.sort((a, b) => 
          new Date(b.paid_date || b.created_at) - new Date(a.paid_date || a.created_at)
        )[0];
        const lastPaidDate = latestPayment?.paid_date || latestPayment?.created_at;
        let nextDueDate = null;
        if (lastPaidDate) {
          const last = new Date(lastPaidDate);
          const freq = unit.rent_frequency || 'monthly';
          nextDueDate = new Date(last);
          if (freq === 'monthly') nextDueDate.setMonth(last.getMonth() + 1);
          else if (freq === 'quarterly') nextDueDate.setMonth(last.getMonth() + 3);
          else if (freq === 'yearly') nextDueDate.setFullYear(last.getFullYear() + 1);
          else if (freq === 'weekly') nextDueDate.setDate(last.getDate() + 7);
        }
        return {
          ...unit,
          lastPaidDate,
          nextDueDate,
          paymentStatus: latestPayment?.status || 'none',
        };
      });

      setUnits(unitsWithDetails);
    } catch (err) {
      console.error('Error loading rent data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveTenant = async (unit) => {
    if (!window.confirm(`Remove tenant ${unit.tenant?.name} from Unit ${unit.unit_number}? This will mark the unit as vacant.`)) return;

    try {
      const { error } = await supabase
        .from('units')
        .update({ tenant_id: null, status: 'vacant' })
        .eq('id', unit.id);

      if (error) throw error;

      // Log activity
      await supabase.from('property_activities').insert({
        property_id: propertyId,
        unit_id: unit.id,
        activity_type: 'tenant_removed',
        description: `Tenant ${unit.tenant?.name} removed from Unit ${unit.unit_number}`,
        created_at: new Date().toISOString()
      });

      // Refresh data
      loadData();
    } catch (err) {
      console.error('Error removing tenant:', err);
      alert('Failed to remove tenant. Please try again.');
    }
  };

  const formatCurrency = (amount) => `₦${(amount || 0).toLocaleString()}`;

  const getDaysUntilDue = (dueDate) => {
    if (!dueDate) return null;
    const diff = new Date(dueDate) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const getAlertLevel = (days) => {
    if (days === null) return 'low';
    if (days < 0) return 'overdue';
    if (days <= 7) return 'high';
    if (days <= 30) return 'medium';
    return 'low';
  };

  if (loading) return <div className="rent-summary loading">Loading rent summary...</div>;
  if (error) return <div className="rent-summary error">Error: {error}</div>;
  if (units.length === 0) return <div className="rent-summary empty">No units for this property.</div>;

  const totalRentDue = units.reduce((sum, u) => sum + (u.rent_amount || 0), 0);
  const occupiedUnits = units.filter(u => u.tenant_id).length;
  const overdueUnits = units.filter(u => {
    const days = getDaysUntilDue(u.nextDueDate);
    return days !== null && days < 0;
  }).length;

  return (
    <div className="property-rent-summary">
      <div className="summary-header">
        <h3>Rent Overview</h3>
        <div className="summary-stats">
          <div className="stat-item">
            <DollarSign size={18} />
            <span className="stat-label">Monthly Rent</span>
            <span className="stat-value">{formatCurrency(totalRentDue)}</span>
          </div>
          <div className="stat-item">
            <Home size={18} />
            <span className="stat-label">Occupied</span>
            <span className="stat-value">{occupiedUnits}/{units.length}</span>
          </div>
          <div className="stat-item">
            <AlertCircle size={18} />
            <span className="stat-label">Overdue</span>
            <span className="stat-value">{overdueUnits}</span>
          </div>
        </div>
      </div>

      <div className="units-rent-list">
        {units.map(unit => {
          const daysUntilDue = getDaysUntilDue(unit.nextDueDate);
          const alertLevel = getAlertLevel(daysUntilDue);
          return (
            <div key={unit.id} className={`unit-rent-item alert-${alertLevel}`}>
              <div className="unit-info">
                <h4>Unit {unit.unit_number}</h4>
                {unit.tenant ? (
                  <div className="tenant-info">
                    <p className="tenant-name">{unit.tenant.name}</p>
                    <button
                      className="remove-tenant-btn"
                      onClick={() => handleRemoveTenant(unit)}
                      title="Remove tenant"
                    >
                      <XCircle size={14} />
                    </button>
                  </div>
                ) : (
                  <p className="vacant">Vacant</p>
                )}
              </div>
              <div className="unit-rent-details">
                <span className="rent-amount">{formatCurrency(unit.rent_amount)}/{unit.rent_frequency}</span>
                {unit.nextDueDate ? (
                  <div className="due-info">
                    <Calendar size={14} />
                    <span className={`due-date ${alertLevel}`}>
                      {new Date(unit.nextDueDate).toLocaleDateString()}
                    </span>
                    <span className="days-left">
                      ({daysUntilDue > 0 ? `${daysUntilDue} days` : daysUntilDue === 0 ? 'Due today' : 'Overdue'})
                    </span>
                  </div>
                ) : (
                  <span className="no-payment">No payments recorded</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PropertyRentSummary;