// src/modules/listings/components/StatsSummary.jsx
import React from 'react';
import { CheckCircle, Clock, DollarSign, Home } from 'lucide-react';
import './StatsSummary.css';

const StatsSummary = ({ stats }) => {
  return (
    <div className="stats-summary">
      <div className="stat-item">
        <div className="stat-icon total">
          <Home size={20} />
        </div>
        <div className="stat-content">
          <span className="stat-value">{stats.total}</span>
          <span className="stat-label">Total Properties</span>
        </div>
      </div>
      
      <div className="stat-item">
        <div className="stat-icon verified">
          <CheckCircle size={20} />
        </div>
        <div className="stat-content">
          <span className="stat-value">{stats.verified}</span>
          <span className="stat-label">Verified</span>
        </div>
      </div>
      
      <div className="stat-item">
        <div className="stat-icon pending">
          <Clock size={20} />
        </div>
        <div className="stat-content">
          <span className="stat-value">{stats.unverified}</span>
          <span className="stat-label">Pending</span>
        </div>
      </div>
      
      <div className="stat-item">
        <div className="stat-icon price">
          <DollarSign size={20} />
        </div>
        <div className="stat-content">
          <span className="stat-value">₦{stats.avgPrice.toLocaleString()}</span>
          <span className="stat-label">Avg. Price</span>
        </div>
      </div>
    </div>
  );
};

export default StatsSummary;