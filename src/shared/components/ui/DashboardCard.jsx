import React from 'react';
import { TrendingUp, TrendingDown, Star } from 'lucide-react';

const DashboardCard = ({ 
  title, 
  value, 
  icon, 
  trend, 
  color = 'blue', 
  isRating = false,
  subtitle,
  onClick 
}) => {
  const getColorClasses = () => {
    const colors = {
      blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
      green: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-100' },
      purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100' },
      orange: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100' },
      red: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-100' },
      yellow: { bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-100' }
    };
    return colors[color] || colors.blue;
  };

  const colorClasses = getColorClasses();
  const isPositiveTrend = trend?.includes('+') || trend?.toLowerCase().includes('increase');
  const isNegativeTrend = trend?.includes('-') || trend?.toLowerCase().includes('decrease');

  return (
    <div 
      className={`dashboard-card ${colorClasses.bg} ${colorClasses.border}`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="card-header">
        <div className="card-icon" style={{ color: colorClasses.text.replace('text-', '') }}>
          {icon}
        </div>
        <div className="card-title">
          <h3>{title}</h3>
          {subtitle && <span className="card-subtitle">{subtitle}</span>}
        </div>
      </div>
      
      <div className="card-content">
        {isRating ? (
          <div className="rating-value">
            <span className="value">{value}</span>
            <div className="rating-stars">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i}
                  size={16}
                  fill={i < Math.floor(value) ? "#FFD700" : "none"}
                  stroke={i < value ? "#FFD700" : "#9ca3af"}
                />
              ))}
            </div>
          </div>
        ) : (
          <span className="value">{value}</span>
        )}
        
        {trend && (
          <div className={`card-trend ${isPositiveTrend ? 'positive' : isNegativeTrend ? 'negative' : 'neutral'}`}>
            {isPositiveTrend ? <TrendingUp size={14} /> : 
             isNegativeTrend ? <TrendingDown size={14} /> : null}
            <span>{trend}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardCard;