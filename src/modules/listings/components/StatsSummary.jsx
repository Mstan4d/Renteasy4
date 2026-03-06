import React from 'react';
import { CheckCircle, Clock, DollarSign, Home } from 'lucide-react';
import './StatsSummary.css';

const StatsSummary = ({ stats }) => {
  return (
    <div className="stats-summary">
      <div className="stat-item">
        <div className="stat-icon total">
          <Home size={16} />
        </div>
        <div className="stat-content">
          <span className="stat-value">{stats.total || 0}</span>
          <span className="stat-label">Total</span>
        </div>
      </div>
      
      <div className="stat-item">
        <div className="stat-icon verified">
          <CheckCircle size={16} />
        </div>
        <div className="stat-content">
          <span className="stat-value">{stats.verified || 0}</span>
          <span className="stat-label">Verified</span>
        </div>
      </div>
      
      <div className="stat-item">
        <div className="stat-icon pending">
          <Clock size={16} />
        </div>
        <div className="stat-content">
          <span className="stat-value">{stats.pending || 0}</span>
          <span className="stat-label">Pending</span>
        </div>
      </div>
      
      <div className="stat-item">
        <div className="stat-icon price">
          <DollarSign size={16} />
        </div>
        <div className="stat-content">
          <span className="stat-value">₦{(stats.avgPrice || 0).toLocaleString()}</span>
          <span className="stat-label">Avg</span>
        </div>
      </div>
    </div>
  );
};

export default StatsSummary;