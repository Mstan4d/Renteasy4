// src/shared/components/VerifiedBadge.jsx
import React from 'react'
import './VerifiedBadge.css'

// ✅ SHARED HELPER (accessible to both components)
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
  tooltipText = ''
}) => {

  const getSizeClasses = () => {
    const sizes = {
      small: 'badge-sm',
      medium: 'badge-md',
      large: 'badge-lg'
    }
    return sizes[size] || sizes.medium
  }

  const config = getBadgeConfig(type)

  return (
    <div className={`verified-badge ${getSizeClasses()}`}>
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

// ✅ Inline Badge now works perfectly
export const InlineVerifiedBadge = ({ type = 'user', compact = false }) => {
  const config = getBadgeConfig(type)

  return (
    <span 
      className={`inline-verified-badge ${compact ? 'compact' : ''}`}
      style={{ 
        backgroundColor: `${config.color}15`,
        borderColor: config.color,
        color: config.color
      }}
      title={config.tooltip}
    >
      <span className="inline-badge-icon">{config.icon}</span>
      {!compact && <span className="inline-badge-text">{config.label}</span>}
    </span>
  )
}

export default VerifiedBadge