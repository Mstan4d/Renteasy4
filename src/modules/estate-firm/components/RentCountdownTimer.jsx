import React from 'react';
import { Calendar, Clock, AlertCircle, Building, ExternalLink } from 'lucide-react';
import './RentCountdownTimer.css';


const RentCountdownTimer = ({ property, showSource = false, onRenew, onView }) => {
  const calculateDaysLeft = (dateString) => {
    const targetDate = new Date(dateString);
    const today = new Date();
    const difference = targetDate.getTime() - today.getTime();
    return Math.ceil(difference / (1000 * 3600 * 24));
  };

  const daysLeft = calculateDaysLeft(property.rentEndDate);
  
  const getAlertLevel = (days) => {
    if (days <= 7) return 'high';
    if (days <= 30) return 'medium';
    return 'low';
  };

  const alertLevel = getAlertLevel(daysLeft);
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getPropertySource = () => {
    switch(property.type) {
      case 'rent-easy-listing':
        return { label: 'Rent Easy', color: '#3b82f6', bgColor: '#eff6ff' };
      case 'external-property':
        return { label: 'External', color: '#10b981', bgColor: '#d1fae5' };
      case 'managed-property':
        return { label: 'Managed', color: '#8b5cf6', bgColor: '#f3e8ff' };
      default:
        return { label: 'Property', color: '#6b7280', bgColor: '#f3f4f6' };
    }
  };

  const propertySource = getPropertySource();

  const getTimeUnit = () => {
    if (daysLeft < 0) return { text: 'Overdue', color: '#ef4444' };
    if (daysLeft === 0) return { text: 'Today', color: '#f59e0b' };
    if (daysLeft === 1) return { text: 'Tomorrow', color: '#f59e0b' };
    if (daysLeft < 7) return { text: `${daysLeft} days`, color: '#f59e0b' };
    if (daysLeft < 30) {
      const weeks = Math.floor(daysLeft / 7);
      return { text: `${weeks} week${weeks > 1 ? 's' : ''}`, color: '#10b981' };
    }
    const months = Math.floor(daysLeft / 30);
    return { text: `${months} month${months > 1 ? 's' : ''}`, color: '#10b981' };
  };

  const timeUnit = getTimeUnit();

  return (
    <div className={`rent-countdown-card alert-${alertLevel}`}>
      <div className="countdown-header">
        <div className="property-info">
          <div className="property-name-row">
            <h4>{property.name}</h4>
            {showSource && (
              <span 
                className="property-source-badge"
                style={{
                  backgroundColor: propertySource.bgColor,
                  color: propertySource.color,
                  borderColor: propertySource.color
                }}
              >
                <Building size={12} />
                {propertySource.label}
              </span>
            )}
          </div>
          <p className="property-client">
            Client: <strong>{property.clientName}</strong>
          </p>
        </div>
        
        <div className="countdown-indicator">
          <div className="time-left" style={{ color: timeUnit.color }}>
            <Clock size={16} />
            <span>{timeUnit.text}</span>
          </div>
          {daysLeft < 0 && (
            <span className="overdue-badge">
              <AlertCircle size={12} />
              OVERDUE
            </span>
          )}
        </div>
      </div>

      <div className="countdown-details">
        <div className="detail-row">
          <div className="detail-item">
            <span className="label">Rent Amount</span>
            <span className="value">{formatCurrency(property.rentAmount)}/{property.rentFrequency}</span>
          </div>
          <div className="detail-item">
            <span className="label">Next Due</span>
            <span className="value date">
              <Calendar size={14} />
              {property.rentDueDate}
            </span>
          </div>
        </div>

        <div className="detail-row">
          <div className="detail-item">
            <span className="label">Tenant</span>
            <span className="value">{property.tenant?.name || 'No tenant'}</span>
          </div>
          <div className="detail-item">
            <span className="label">Status</span>
            <span className={`status-badge ${property.status}`}>
              {property.status === 'occupied' ? '🟢 Occupied' : '🔴 Vacant'}
            </span>
          </div>
        </div>
      </div>

      <div className="countdown-progress">
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ 
              width: `${Math.min(100, Math.max(0, 100 - (daysLeft * 100 / 365)))}%`,
              backgroundColor: alertLevel === 'high' ? '#ef4444' : 
                              alertLevel === 'medium' ? '#f59e0b' : '#10b981'
            }}
          ></div>
        </div>
        <div className="progress-labels">
          <span>Start: {property.rentStartDate || 'N/A'}</span>
          <span>Ends: {property.rentEndDate}</span>
        </div>
      </div>

      <div className="countdown-actions">
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
        {property.tenant?.phone && (
          <a 
            href={`tel:${property.tenant.phone}`}
            className="btn btn-sm btn-outline"
          >
            📞 Call Tenant
          </a>
        )}
      </div>
    </div>
  );
};

export default RentCountdownTimer;