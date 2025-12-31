// src/modules/admin/components/AdminStatsCard.jsx
import React from 'react';
import './AdminStatsCard.css';

const AdminStatsCard = ({ 
  title, 
  value, 
  icon, 
  change, 
  color = 'blue', 
  alert = false,
  onClick 
}) => {
  // Color configurations for different stat types
  const colorConfig = {
    blue: {
      bg: '#dbeafe',
      iconBg: '#3b82f6',
      text: '#1e40af',
      changeText: '#3b82f6'
    },
    green: {
      bg: '#d1fae5',
      iconBg: '#10b981',
      text: '#065f46',
      changeText: '#059669'
    },
    orange: {
      bg: '#fef3c7',
      iconBg: '#f59e0b',
      text: '#92400e',
      changeText: '#d97706'
    },
    purple: {
      bg: '#f3e8ff',
      iconBg: '#8b5cf6',
      text: '#6d28d9',
      changeText: '#7c3aed'
    },
    red: {
      bg: '#fee2e2',
      iconBg: '#ef4444',
      text: '#991b1b',
      changeText: '#dc2626'
    },
    teal: {
      bg: '#ccfbf1',
      iconBg: '#14b8a6',
      text: '#0f766e',
      changeText: '#0d9488'
    },
    indigo: {
      bg: '#e0e7ff',
      iconBg: '#6366f1',
      text: '#4338ca',
      changeText: '#4f46e5'
    },
    yellow: {
      bg: '#fef9c3',
      iconBg: '#eab308',
      text: '#854d0e',
      changeText: '#ca8a04'
    }
  };

  const config = colorConfig[color] || colorConfig.blue;

  // Determine if change is positive/negative or neutral
  const getChangeType = (changeText) => {
    if (!changeText) return 'neutral';
    if (changeText.includes('+') || changeText.toLowerCase().includes('growth')) {
      return 'positive';
    }
    if (changeText.includes('-') || 
        changeText.toLowerCase().includes('pending') || 
        changeText.toLowerCase().includes('attention')) {
      return 'negative';
    }
    return 'neutral';
  };

  const changeType = getChangeType(change);

  return (
    <div 
      className={`admin-stats-card ${alert ? 'alert' : ''}`}
      onClick={onClick}
      style={{ 
        backgroundColor: config.bg,
        borderColor: config.iconBg + '40'
      }}
    >
      <div className="card-header">
        <div 
          className="card-icon"
          style={{ backgroundColor: config.iconBg }}
        >
          {React.cloneElement(icon, { 
            size: 20,
            color: 'white'
          })}
        </div>
        
        {alert && (
          <span className="alert-indicator" style={{ color: config.iconBg }}>
            ⚡
          </span>
        )}
      </div>

      <div className="card-content">
        <h3 className="card-value" style={{ color: config.text }}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </h3>
        
        <p className="card-title" style={{ color: config.text + 'cc' }}>
          {title}
        </p>
      </div>

      {change && (
        <div className="card-footer">
          <span 
            className={`change-indicator ${changeType}`}
            style={{ 
              color: changeType === 'positive' ? '#059669' : 
                     changeType === 'negative' ? '#dc2626' : 
                     config.changeText 
            }}
          >
            {changeType === 'positive' && '↑ '}
            {changeType === 'negative' && '↓ '}
            {change}
          </span>
        </div>
      )}

      {/* Hover effect overlay */}
      <div className="card-hover-overlay" style={{ backgroundColor: config.iconBg + '20' }} />
    </div>
  );
};

export default AdminStatsCard;