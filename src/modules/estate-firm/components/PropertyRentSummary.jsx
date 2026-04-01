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
      
      // 1. Get units with tenant info
      const { data: unitsData, error: unitsError } = await supabase
        .from('units')
        .select(`
          *,
          tenant:tenant_id (
            id, 
            full_name, 
            name, 
            email, 
            phone
          )
        `)
        .eq('property_id', propertyId)
        .order('unit_number');

      if (unitsError) throw unitsError;

      if (!unitsData || unitsData.length === 0) {
        setUnits([]);
        setLoading(false);
        return;
      }

      // 2. Get unit IDs
      const unitIds = unitsData.map(u => u.id);

      // 3. Get payments for these units
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

      // 4. Process units with payment info
      const unitsWithDetails = unitsData.map(unit => {
        const payments = paymentsMap[unit.id] || [];
        const latestPayment = payments[0];
        const lastPaidDate = latestPayment?.payment_date;
        
        let nextDueDate = null;
        if (lastPaidDate) {
          const last = new Date(lastPaidDate);
          const freq = unit.rent_frequency || 'monthly';
          nextDueDate = new Date(last);
          if (freq === 'monthly') nextDueDate.setMonth(last.getMonth() + 1);
          else if (freq === 'quarterly') nextDueDate.setMonth(last.getMonth() + 3);
          else if (freq === 'yearly') nextDueDate.setFullYear(last.getFullYear() + 1);
        } else if (unit.lease_start_date) {
          // If no payments, use lease start date
          nextDueDate = new Date(unit.lease_start_date);
        }

        return {
          ...unit,
          tenant: unit.tenant,
          lastPaidDate,
          nextDueDate,
          paymentStatus: latestPayment?.status || 'none',
          payments: payments
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
    const tenantName = unit.tenant?.full_name || unit.tenant?.name || 'Tenant';
    if (!window.confirm(`Remove ${tenantName} from Unit ${unit.unit_number}? This will mark the unit as vacant and end the lease.`)) return;

    try {
      // 1. Update unit
      const { error: unitError } = await supabase
        .from('units')
        .update({
          tenant_id: null,
          tenant_name: null,
          tenant_phone: null,
          tenant_email: null,
          status: 'vacant',
          lease_end_date: new Date().toISOString().split('T')[0]
        })
        .eq('id', unit.id);

      if (unitError) throw unitError;

      // 2. Update lease to completed
      if (unit.lease_id) {
        await supabase
          .from('leases')
          .update({
            status: 'completed',
            updated_at: new Date().toISOString()
          })
          .eq('id', unit.lease_id);
      }

      // 3. Log activity
      await supabase.from('property_activities').insert({
        property_id: propertyId,
        unit_id: unit.id,
        activity_type: 'tenant_removed',
        description: `Tenant ${tenantName} removed from Unit ${unit.unit_number}`,
        created_at: new Date().toISOString()
      });

      // 4. Send notification to tenant
      if (unit.tenant?.id) {
        await supabase.from('notifications').insert({
          user_id: unit.tenant.id,
          type: 'lease_ended',
          title: 'Lease Ended',
          message: `Your lease for ${unit.property_title} Unit ${unit.unit_number} has ended.`,
          link: '/dashboard/tenant/rental-history',
          created_at: new Date().toISOString()
        });
      }

      alert('Tenant removed successfully');
      loadData(); // Refresh
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
            <span className="stat-label">Annual Rent</span>
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
                    <p className="tenant-name">{unit.tenant.full_name || unit.tenant.name}</p>
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
                <span className="rent-amount">{formatCurrency(unit.rent_amount)}/{unit.rent_frequency || 'monthly'}</span>
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