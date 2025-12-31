import React from 'react';
import { TrendingUp, TrendingDown, AlertCircle, Home, Shield } from 'lucide-react';
import './PropertyHealthScore.css';


const PropertyHealthScore = ({ property, score, showSource = false }) => {
  const getScoreColor = (score) => {
    if (score >= 80) return { color: '#10b981', label: 'Excellent', icon: <Shield color="#10b981" /> };
    if (score >= 60) return { color: '#3b82f6', label: 'Good', icon: <TrendingUp color="#3b82f6" /> };
    if (score >= 40) return { color: '#f59e0b', label: 'Fair', icon: <AlertCircle color="#f59e0b" /> };
    return { color: '#ef4444', label: 'Poor', icon: <TrendingDown color="#ef4444" /> };
  };

  const getPropertySource = () => {
    switch(property.type) {
      case 'rent-easy-listing': return { label: 'Rent Easy', color: '#3b82f6' };
      case 'external-property': return { label: 'External', color: '#10b981' };
      case 'managed-property': return { label: 'Managed', color: '#8b5cf6' };
      default: return { label: 'Property', color: '#6b7280' };
    }
  };

  const scoreData = getScoreColor(score);
  const propertySource = getPropertySource();

  const getRecommendations = (score) => {
    if (score >= 80) return ['Property in excellent condition', 'Regular maintenance up to date'];
    if (score >= 60) return ['Schedule routine maintenance', 'Consider minor upgrades'];
    if (score >= 40) return ['Needs attention soon', 'Schedule inspection'];
    return ['Urgent attention needed', 'Consider major repairs'];
  };

  const recommendations = getRecommendations(score);

  return (
    <div className="property-health-card">
      <div className="health-header">
        <div className="property-info">
          <div className="property-title">
            <Home size={16} />
            <h4>{property.name}</h4>
            {showSource && (
              <span 
                className="source-tag"
                style={{ backgroundColor: `${propertySource.color}20`, color: propertySource.color }}
              >
                {propertySource.label}
              </span>
            )}
          </div>
          <p className="property-location">{property.address}</p>
        </div>
        
        <div className="health-score-display">
          <div 
            className="score-circle"
            style={{ 
              background: `conic-gradient(${scoreData.color} ${score * 3.6}deg, #f3f4f6 0deg)` 
            }}
          >
            <div className="score-inner">
              <span className="score-value">{score}</span>
              <span className="score-label">/100</span>
            </div>
          </div>
          <div className="score-rating">
            {scoreData.icon}
            <span style={{ color: scoreData.color }}>{scoreData.label}</span>
          </div>
        </div>
      </div>

      <div className="health-details">
        <div className="detail-item">
          <span className="label">Last Inspection</span>
          <span className="value">{property.nextMaintenance || 'N/A'}</span>
        </div>
        <div className="detail-item">
          <span className="label">Tenant Rating</span>
          <span className="value">4.7/5</span>
        </div>
        <div className="detail-item">
          <span className="label">Maintenance Due</span>
          <span className="value">{property.nextMaintenance || 'None scheduled'}</span>
        </div>
      </div>

      <div className="health-recommendations">
        <h5>Recommendations:</h5>
        <ul>
          {recommendations.map((rec, index) => (
            <li key={index}>
              <div className="recommendation-dot" style={{ backgroundColor: scoreData.color }}></div>
              {rec}
            </li>
          ))}
        </ul>
      </div>

      <div className="health-actions">
        <button className="btn btn-sm btn-outline">
          Schedule Inspection
        </button>
        <button className="btn btn-sm btn-outline">
          View Reports
        </button>
        <button className="btn btn-sm" style={{ backgroundColor: scoreData.color, color: 'white' }}>
          Update Score
        </button>
      </div>
    </div>
  );
};

export default PropertyHealthScore;