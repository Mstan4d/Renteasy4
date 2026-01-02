// src/shared/components/VerifiedBadge.jsx - UPDATED WITH DATA ATTRIBUTES
import React from 'react'
import './VerifiedBadge.css'

const getBadgeConfig = (type) => {
  const configs = {
    user: {
      color: '#10b981',
      icon: '✓',
      label: 'Verified User',
      tooltip: 'This user has completed identity verification'
    },
    landlord: {
      color: '#3b82f6',
      icon: '🏠',
      label: 'Verified Landlord',
      tooltip: 'This landlord has verified property ownership'
    },
    tenant: {
      color: '#10b981',
      icon: '👤',
      label: 'Verified Tenant',
      tooltip: 'This tenant has completed identity and income verification'
    },
    estate: {
      color: '#8b5cf6',
      icon: '🏢',
      label: 'Verified Estate Firm',
      tooltip: 'This is a verified property management company'
    },
    property: {
      color: '#f59e0b',
      icon: '⭐',
      label: 'Verified Property',
      tooltip: 'This property has been physically verified'
    },
    premium: {
      color: '#ec4899',
      icon: '👑',
      label: 'Premium Verified',
      tooltip: 'Premium verification with enhanced checks'
    }
  }

  return configs[type] || configs.user
}

const VerifiedBadge = ({ 
  type = 'user',
  size = 'medium',
  showTooltip = true,
  tooltipText = '',
  className = '',
  style = {}
}) => {
  const getSizeClass = () => {
    const sizes = {
      small: 'badge-sm',
      medium: 'badge-md',
      large: 'badge-lg'
    }
    return sizes[size] || sizes.medium
  }

  const config = getBadgeConfig(type)

  return (
    <div 
      className={`verified-badge ${getSizeClass()} ${className}`}
      data-type={type}
      style={style}
    >
      <div 
        className="badge-icon"
        style={{ backgroundColor: config.color }}
      >
        {config.icon}
      </div>
      <span className="badge-label">{config.label}</span>

      {showTooltip && (
        <div className="badge-tooltip">
          {tooltipText || config.tooltip}
        </div>
      )}
    </div>
  )
}

export const InlineVerifiedBadge = ({ 
  type = 'user', 
  compact = false, 
  className = '',
  style = {}
}) => {
  const config = getBadgeConfig(type)

  return (
    <span 
      className={`inline-verified-badge ${compact ? 'compact' : ''} ${className}`}
      style={{ 
        backgroundColor: `${config.color}15`,
        borderColor: config.color,
        color: config.color,
        ...style
      }}
      title={config.tooltip}
      data-type={type}
    >
      <span className="inline-badge-icon">{config.icon}</span>
      {!compact && <span className="inline-badge-text">{config.label}</span>}
    </span>
  )
}

// Export a helper function to get badge colors
export const getBadgeColor = (type) => {
  return getBadgeConfig(type).color;
}

export default VerifiedBadge