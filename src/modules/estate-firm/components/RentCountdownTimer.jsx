import React, { useState, useEffect } from 'react';
import { Calendar, Clock, AlertCircle, Building, ExternalLink, Phone, Mail, MessageSquare } from 'lucide-react';
import { supabase } from '../../../shared/lib/supabaseClient';
import './RentCountdownTimer.css';

const RentCountdownTimer = ({ propertyId, onRenew, onView }) => {
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });
  const [tenant, setTenant] = useState(null);
  const [rentPayments, setRentPayments] = useState([]);

  useEffect(() => {
    if (propertyId) {
      loadPropertyData();
      
      // Update timer every minute
      const timer = setInterval(calculateTimeLeft, 60000);
      return () => clearInterval(timer);
    }
  }, [propertyId]);

  useEffect(() => {
    calculateTimeLeft();
  }, [property]);

  const loadPropertyData = async () => {
    try {
      setLoading(true);

      // Load property with tenant info
      const { data: propertyData, error: propertyError } = await supabase
        .from('listings')
        .select(`
          *,
          tenant:profiles!tenant_id(*),
          landlord:profiles!landlord_id(*)
        `)
        .eq('id', propertyId)
        .single();

      if (propertyError) throw propertyError;
      setProperty(propertyData);

      // Load tenant info if exists
      if (propertyData.tenant_id) {
        const { data: tenantData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', propertyData.tenant_id)
          .single();

        setTenant(tenantData);
      }

      // Load rent payment history
      const { data: paymentsData } = await supabase
        .from('rent_payments')
        .select('*')
        .eq('property_id', propertyId)
        .order('payment_date', { ascending: false })
        .limit(5);

      setRentPayments(paymentsData || []);

    } catch (error) {
      console.error('Error loading property data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTimeLeft = () => {
    if (!property || !property.rent_end_date) {
      setTimeLeft({ days: 0, hours: 0, minutes: 0 });
      return;
    }

    const endDate = new Date(property.rent_end_date);
    const now = new Date();
    const difference = endDate.getTime() - now.getTime();

    if (difference <= 0) {
      setTimeLeft({ days: 0, hours: 0, minutes: 0 });
      return;
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

    setTimeLeft({ days, hours, minutes });
  };

  const getAlertLevel = () => {
    if (timeLeft.days <= 7) return 'high';
    if (timeLeft.days <= 30) return 'medium';
    return 'low';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatRentFrequency = () => {
    if (!property) return '';
    
    const frequency = property.rent_frequency || 'monthly';
    switch(frequency) {
      case 'yearly': return '/year';
      case 'monthly': return '/month';
      case 'quarterly': return '/quarter';
      case 'weekly': return '/week';
      default: return '';
    }
  };

  const calculateDaysUntilDue = () => {
    if (!property || !property.rent_due_date) return null;
    
    const dueDate = new Date(property.rent_due_date);
    const now = new Date();
    const difference = dueDate.getTime() - now.getTime();
    return Math.ceil(difference / (1000 * 60 * 60 * 24));
  };

  const handleSendReminder = async () => {
    if (!property || !tenant) return;

    try {
      // Create notification/reminder
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: tenant.id,
          title: 'Rent Payment Reminder',
          message: `Reminder: Rent payment of ${formatCurrency(property.price)} is due soon for ${property.title}`,
          type: 'rent_reminder',
          property_id: property.id,
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      // Log activity
      await supabase.from('activities').insert({
        user_id: property.estate_firm_id,
        type: 'rent',
        action: 'send_reminder',
        description: `Sent rent reminder to ${tenant.name}`,
        created_at: new Date().toISOString()
      });

      alert('Reminder sent successfully!');

    } catch (error) {
      console.error('Error sending reminder:', error);
      alert('Failed to send reminder. Please try again.');
    }
  };

  const handleRecordPayment = async () => {
    if (!property) return;

    try {
      const paymentAmount = parseFloat(prompt('Enter payment amount:', property.price || '0'));
      
      if (!paymentAmount || isNaN(paymentAmount)) return;

      const { error } = await supabase
        .from('rent_payments')
        .insert({
          property_id: property.id,
          tenant_id: property.tenant_id,
          amount: paymentAmount,
          payment_date: new Date().toISOString(),
          status: 'completed',
          payment_method: 'manual',
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      // Update next due date (add one rent period)
      const dueDate = new Date(property.rent_due_date);
      const frequency = property.rent_frequency || 'monthly';
      
      switch(frequency) {
        case 'monthly':
          dueDate.setMonth(dueDate.getMonth() + 1);
          break;
        case 'quarterly':
          dueDate.setMonth(dueDate.getMonth() + 3);
          break;
        case 'yearly':
          dueDate.setFullYear(dueDate.getFullYear() + 1);
          break;
        case 'weekly':
          dueDate.setDate(dueDate.getDate() + 7);
          break;
      }

      // Update property rent due date
      await supabase
        .from('listings')
        .update({ rent_due_date: dueDate.toISOString() })
        .eq('id', property.id);

      // Log activity
      await supabase.from('activities').insert({
        user_id: property.estate_firm_id,
        type: 'rent',
        action: 'record_payment',
        description: `Recorded rent payment of ${formatCurrency(paymentAmount)} for ${property.title}`,
        created_at: new Date().toISOString()
      });

      alert('Payment recorded successfully!');
      
      // Refresh data
      await loadPropertyData();

    } catch (error) {
      console.error('Error recording payment:', error);
      alert('Failed to record payment. Please try again.');
    }
  };

  if (loading || !property) {
    return (
      <div className="rent-countdown-card loading">
        <div className="spinner"></div>
        <p>Loading rent information...</p>
      </div>
    );
  }

  const alertLevel = getAlertLevel();
  const daysUntilDue = calculateDaysUntilDue();
  const isOverdue = daysUntilDue !== null && daysUntilDue < 0;
  const isDueSoon = daysUntilDue !== null && daysUntilDue <= 7 && daysUntilDue >= 0;

  return (
    <div className={`rent-countdown-card alert-${alertLevel} ${isOverdue ? 'overdue' : ''}`}>
      <div className="countdown-header">
        <div className="property-info">
          <div className="property-name-row">
            <h4>{property.title}</h4>
            <span className="property-client">
              Client: {property.landlord?.name || 'Owner'}
            </span>
          </div>
          <p className="property-location">{property.address}</p>
        </div>
        
        <div className="countdown-indicator">
          <div className="time-left">
            <Clock size={20} />
            <div className="time-display">
              <span className="time-value">{timeLeft.days}</span>
              <span className="time-label">days left</span>
            </div>
          </div>
          {(isOverdue || isDueSoon) && (
            <span className={`alert-badge ${isOverdue ? 'overdue' : 'due-soon'}`}>
              <AlertCircle size={14} />
              {isOverdue ? 'OVERDUE' : 'DUE SOON'}
            </span>
          )}
        </div>
      </div>

      <div className="countdown-details">
        <div className="detail-section">
          <div className="detail-row">
            <div className="detail-item">
              <span className="label">Rent Amount</span>
              <span className="value highlight">
                {formatCurrency(property.price)}
                <span className="frequency">{formatRentFrequency()}</span>
              </span>
            </div>
            <div className="detail-item">
              <span className="label">Next Due</span>
              <span className={`value date ${isOverdue ? 'overdue' : isDueSoon ? 'due-soon' : ''}`}>
                <Calendar size={16} />
                {property.rent_due_date 
                  ? new Date(property.rent_due_date).toLocaleDateString()
                  : 'Not set'
                }
                {daysUntilDue !== null && (
                  <span className="days-indicator">
                    ({isOverdue ? 'Overdue' : `${daysUntilDue} days`})
                  </span>
                )}
              </span>
            </div>
          </div>

          <div className="detail-row">
            <div className="detail-item">
              <span className="label">Lease End</span>
              <span className="value">
                {property.rent_end_date 
                  ? new Date(property.rent_end_date).toLocaleDateString()
                  : 'Not set'
                }
              </span>
            </div>
            <div className="detail-item">
              <span className="label">Status</span>
              <span className={`status-badge ${property.status}`}>
                {property.status === 'occupied' ? '🟢 Occupied' : '🔴 Vacant'}
              </span>
            </div>
          </div>
        </div>

        {tenant && (
          <div className="tenant-section">
            <h5>Current Tenant</h5>
            <div className="tenant-info">
              <div className="tenant-name">
                <strong>{tenant.name}</strong>
                <span className="tenant-contact">
                  {tenant.phone && (
                    <a href={`tel:${tenant.phone}`} className="contact-link">
                      <Phone size={14} />
                    </a>
                  )}
                  {tenant.email && (
                    <a href={`mailto:${tenant.email}`} className="contact-link">
                      <Mail size={14} />
                    </a>
                  )}
                </span>
              </div>
              <div className="tenant-details">
                <span>Since: {new Date(property.lease_start_date || property.created_at).toLocaleDateString()}</span>
                <span>Payment History: {rentPayments.filter(p => p.status === 'completed').length} paid</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="countdown-progress">
        <div className="progress-header">
          <span>Lease Progress</span>
          <span>
            {timeLeft.days <= 0 
              ? 'Lease Ended' 
              : `${timeLeft.days} days remaining`
            }
          </span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ 
              width: property.rent_end_date 
                ? `${Math.min(100, Math.max(0, 100 - (timeLeft.days * 100 / 365)))}%`
                : '0%',
              backgroundColor: alertLevel === 'high' ? '#ef4444' : 
                              alertLevel === 'medium' ? '#f59e0b' : '#10b981'
            }}
          ></div>
        </div>
        <div className="progress-labels">
          <span>Start: {property.lease_start_date 
            ? new Date(property.lease_start_date).toLocaleDateString()
            : 'Not set'
          }</span>
          <span>End: {property.rent_end_date 
            ? new Date(property.rent_end_date).toLocaleDateString()
            : 'Not set'
          }</span>
        </div>
      </div>

      <div className="countdown-actions">
        <div className="primary-actions">
          <button 
            className="btn btn-sm btn-primary"
            onClick={() => onRenew && onRenew(property)}
          >
            Renew Lease
          </button>
          <button 
            className="btn btn-sm btn-outline"
            onClick={() => onView && onView(property)}
          >
            <ExternalLink size={14} />
            View Details
          </button>
        </div>
        
        <div className="secondary-actions">
          <button 
            className="btn btn-sm btn-outline"
            onClick={handleRecordPayment}
          >
            Record Payment
          </button>
          {tenant && (
            <button 
              className="btn btn-sm btn-outline"
              onClick={handleSendReminder}
            >
              Send Reminder
            </button>
          )}
          {tenant?.phone && (
            <a 
              href={`tel:${tenant.phone}`}
              className="btn btn-sm btn-outline"
            >
              <Phone size={14} />
              Call Tenant
            </a>
          )}
        </div>
      </div>

      {/* Payment History Preview */}
      {rentPayments.length > 0 && (
        <div className="payment-history-preview">
          <h6>Recent Payments</h6>
          <div className="payments-list">
            {rentPayments.slice(0, 3).map(payment => (
              <div key={payment.id} className="payment-item">
                <span className="payment-date">
                  {new Date(payment.payment_date).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </span>
                <span className="payment-amount">{formatCurrency(payment.amount)}</span>
                <span className={`payment-status ${payment.status}`}>
                  {payment.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RentCountdownTimer;