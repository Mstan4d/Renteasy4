// src/modules/marketplace/components/ProviderCard.jsx
// src/modules/marketplace/components/ProviderCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, Clock, CheckCircle, MessageSquare, Phone, Mail, ExternalLink, Users, Building, Award } from 'lucide-react';
import { serviceCategories, serviceTags } from '../../marketplace/data/serviceCategories'; // Adjusted path
import './ProviderCard.css';
/**
 * ProviderCard - Individual Service Provider Display Card
 * 
 * Features:
 * - Displays provider information in grid/list view modes
 * - Health score visualization with color coding
 * - Service tags with intelligent truncation
 * - Contact action buttons (message, call, email)
 * - Hire request initiation
 * - Responsive design for all screen sizes
 * - Accessibility compliant with proper ARIA labels
 * 
 * Props:
 * @param {Object} provider - Service provider data object
 * @param {string} viewMode - Display mode ('grid' or 'list')
 * @param {Function} onContact - Contact handler function
 * @param {Function} onHire - Hire request handler function
 * @param {Function} onViewDetails - Details view handler function
 * 
 * Data Structure:
 * provider: {
 *   id: string,
 *   name: string,
 *   company: string,
 *   type: string,
 *   tier: string,
 *   rating: number,
 *   reviews: number,
 *   location: string,
 *   state: string,
 *   lga: string,
 *   services: string[],
 *   monthlyRate: number,
 *   hourlyRate: number,
 *   verified: boolean,
 *   healthScore: number,
 *   responseTime: string,
 *   description: string,
 *   logo: string,
 *   contact: { phone, email, website },
 *   tags: string[],
 *   stats: { propertiesManaged, yearsExperience, successRate }
 * }
 */
const ProviderCard = ({ 
  provider, 
  viewMode = 'grid', 
  onContact, 
  onHire, 
  onViewDetails 
}) => {
  // Determine if card is in grid or list view
  const isGridView = viewMode === 'grid';
  
  // Calculate health score color
  const getHealthScoreColor = (score) => {
    if (score >= 90) return '#10b981'; // Excellent - Green
    if (score >= 75) return '#3b82f6'; // Good - Blue
    if (score >= 60) return '#f59e0b'; // Fair - Yellow
    return '#ef4444'; // Poor - Red
  };
  
  // Format price display
  const getPriceDisplay = () => {
    if (provider.monthlyRate) {
      return {
        amount: `₦${provider.monthlyRate.toLocaleString()}`,
        period: '/month',
        type: 'monthly'
      };
    }
    if (provider.hourlyRate) {
      return {
        amount: `₦${provider.hourlyRate.toLocaleString()}`,
        period: '/hour',
        type: 'hourly'
      };
    }
    return {
      amount: 'Contact',
      period: 'for quote',
      type: 'custom'
    };
  };
  
  // Get provider type icon
  const getTypeIcon = () => {
    switch (provider.type) {
      case 'property-manager':
        return <Building size={16} />;
      case 'maintenance':
        return <Award size={16} />;
      case 'cleaning':
        return <Users size={16} />;
      case 'legal':
      case 'financial':
        return <Award size={16} />;
      default:
        return <Building size={16} />;
    }
  };
  
  // Get tier badge color
  const getTierBadgeColor = () => {
    switch (provider.tier) {
      case 'Verified Firm':
        return 'var(--badge-verified)';
      case 'Certified Partner':
        return 'var(--badge-partner)';
      case 'Estate Firm':
        return 'var(--badge-estate)';
      default:
        return 'var(--badge-default)';
    }
  };
  
  // Get response time icon color
  const getResponseTimeColor = () => {
    if (provider.responseTime.includes('1 hour')) return '#10b981';
    if (provider.responseTime.includes('2 hours')) return '#3b82f6';
    if (provider.responseTime.includes('24 hours')) return '#f59e0b';
    return '#6b7280';
  };
  
  // Handle contact button click
  const handleContactClick = (method) => {
    if (onContact) {
      onContact(provider, method);
    }
  };
  
  // Handle hire button click
  const handleHireClick = () => {
    if (onHire) {
      onHire(provider);
    }
  };
  
  // Handle view details click
  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(provider);
    }
  };
  
  // Format services for display (limit to 3 in grid view)
  const displayServices = isGridView 
    ? provider.services.slice(0, 3)
    : provider.services;
  
  const hasMoreServices = provider.services.length > 3 && isGridView;
  
  // Get health score label
  const getHealthScoreLabel = (score) => {
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Needs Improvement';
  };
  
  const priceDisplay = getPriceDisplay();
  const healthScoreColor = getHealthScoreColor(provider.healthScore || 0);
  const tierBadgeColor = getTierBadgeColor();
  const responseTimeColor = getResponseTimeColor();
  
  return (
    <div 
      className={`provider-card ${isGridView ? 'grid-view' : 'list-view'}`}
      role="article"
      aria-labelledby={`provider-name-${provider.id}`}
      onClick={handleViewDetails}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleViewDetails();
        }
      }}
    >
      {/* Card Header - Badges & Basic Info */}
      <div className="card-header">
        <div className="provider-badges">
          {/* Tier Badge */}
          <span 
            className="tier-badge"
            style={{ backgroundColor: tierBadgeColor }}
            aria-label={`Tier: ${provider.tier}`}
          >
            {provider.tier}
          </span>
          
          {/* Verified Badge */}
          {provider.verified && (
            <span className="verified-badge" aria-label="Verified Provider">
              <CheckCircle size={12} />
              Verified
            </span>
          )}
          
          {/* Health Score Badge */}
          {provider.healthScore && (
            <div 
              className="health-score-badge"
              style={{ '--health-score-color': healthScoreColor }}
              title={`Health Score: ${provider.healthScore}% - ${getHealthScoreLabel(provider.healthScore)}`}
              aria-label={`Health score: ${provider.healthScore}%, ${getHealthScoreLabel(provider.healthScore)}`}
            >
              <div className="health-score-circle">
                <span className="health-score-value">
                  {provider.healthScore}%
                </span>
              </div>
              <span className="health-score-label">
                Health Score
              </span>
            </div>
          )}
        </div>
        
        {/* Provider Logo/Image */}
        <div className="provider-image">
          {provider.logo ? (
            <img 
              src={provider.logo} 
              alt={`${provider.company || provider.name} logo`}
              className="provider-logo"
              loading="lazy"
            />
          ) : (
            <div className="provider-icon-placeholder">
              {getTypeIcon()}
            </div>
          )}
        </div>
      </div>
      
      {/* Card Body - Main Content */}
      <div className="card-body">
        {/* Provider Name & Company */}
        <div className="provider-info">
          <h3 
            id={`provider-name-${provider.id}`}
            className="provider-name"
          >
            {provider.name}
          </h3>
          {provider.company && provider.company !== provider.name && (
            <p className="provider-company">
              {provider.company}
            </p>
          )}
        </div>
        
        {/* Location */}
        <div className="provider-location">
          <MapPin size={14} />
          <span>{provider.location}</span>
          {provider.state && provider.lga && (
            <span className="location-details">
              {provider.state}, {provider.lga}
            </span>
          )}
        </div>
        
        {/* Rating & Reviews */}
        // In ProviderCard.jsx, update the rating section to link to reviews
<div className="provider-rating">
  <div className="rating-stars">
    {[...Array(5)].map((_, index) => (
      <Star 
        key={index}
        size={14}
        fill={index < Math.floor(provider.rating) ? "#FFD700" : "none"}
        color={index < Math.floor(provider.rating) ? "#FFD700" : "#e5e7eb"}
      />
    ))}
    <span className="rating-value">
      {provider.rating.toFixed(1)}
    </span>
  </div>
  <Link 
    to={`/providers/${provider.id}/reviews`}
    className="review-count-link"
  >
    ({provider.reviews} reviews)
  </Link>
</div>

{/* Service Type Badge */}
{provider.category && (
  <div className="service-type-badge">
    <span className="badge-icon">
      {serviceCategories.find(c => c.id === provider.category)?.icon || '🔧'}
    </span>
    <span className="badge-text">
      {serviceCategories.find(c => c.id === provider.category)?.name || provider.category}
    </span>
    {provider.serviceType && (
      <>
        <span className="badge-separator">•</span>
        <span className="badge-text">
          {serviceCategories
            .find(c => c.id === provider.category)
            ?.subCategories?.find(s => s.id === provider.serviceType)?.name || provider.serviceType}
        </span>
      </>
    )}
  </div>
)}

{/* Services List (show first 3) */}
{provider.services && provider.services.length > 0 && (
  <div className="provider-services-list">
    <div className="services-title">Services:</div>
    <div className="services-items">
      {provider.services.slice(0, 3).map((service, index) => (
        <span key={index} className="service-item">
          {service}
        </span>
      ))}
      {provider.services.length > 3 && (
        <span className="more-services">
          +{provider.services.length - 3} more
        </span>
      )}
    </div>
  </div>
)}

{/* Tags Display */}
{provider.tags && provider.tags.length > 0 && (
  <div className="provider-tags">
    {provider.tags.slice(0, 4).map((tagId, index) => {
      const tag = serviceTags.find(t => t.id === tagId);
      return tag ? (
        <span 
          key={tagId} 
          className="tag-badge"
          style={{ backgroundColor: tag.color }}
          title={tag.name}
        >
          <span className="tag-icon">{tag.icon}</span>
          <span className="tag-name">{tag.name}</span>
        </span>
      ) : null;
    })}
    {provider.tags.length > 4 && (
      <span className="more-tags">+{provider.tags.length - 4}</span>
    )}
  </div>
)}

{/* Availability Info */}
{provider.availability && (
  <div className="provider-availability">
    {provider.availability.emergency && (
      <span className="availability-badge emergency" title="Emergency Services">
        🚨 Emergency
      </span>
    )}
    {provider.availability['24-7'] && (
      <span className="availability-badge" title="24/7 Available">
        ⏰ 24/7
      </span>
    )}
    {provider.availability.weekends && (
      <span className="availability-badge" title="Weekend Available">
        📅 Weekends
      </span>
    )}
  </div>
)}
        
        {/* Response Time */}
        <div className="response-time" style={{ color: responseTimeColor }}>
          <Clock size={14} />
          <span>Response: {provider.responseTime}</span>
        </div>
        
        {/* Description */}
        {provider.description && (
          <p className="provider-description">
            {provider.description}
          </p>
        )}
        
        {/* Services Tags */}
        <div className="services-section">
          <div className="services-tags">
            {displayServices.map((service, index) => (
              <span key={index} className="service-tag">
                {service}
              </span>
            ))}
            {hasMoreServices && (
              <span className="more-services-tag">
                +{provider.services.length - 3} more
              </span>
            )}
          </div>
        </div>
        
        {/* Provider Stats (List View Only) */}
        {!isGridView && provider.stats && (
          <div className="provider-stats">
            {provider.stats.propertiesManaged && (
              <div className="stat-item">
                <Building size={14} />
                <span>{provider.stats.propertiesManaged} Properties</span>
              </div>
            )}
            {provider.stats.yearsExperience && (
              <div className="stat-item">
                <Award size={14} />
                <span>{provider.stats.yearsExperience} Years</span>
              </div>
            )}
            {provider.stats.successRate && (
              <div className="stat-item">
                <Star size={14} />
                <span>{provider.stats.successRate}% Success Rate</span>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Card Footer - Price & Actions */}
      <div className="card-footer">
        {/* Price Display */}
        <div className="price-section">
          <div className="price-display">
            <span className="price-amount">{priceDisplay.amount}</span>
            <span className="price-period">{priceDisplay.period}</span>
          </div>
          {priceDisplay.type !== 'custom' && (
            <div className="price-type">
              {priceDisplay.type === 'monthly' ? 'Monthly Rate' : 'Hourly Rate'}
            </div>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="action-buttons">
          {/* Quick Contact Buttons */}
          <div className="quick-contact-buttons">
            <button
              className="contact-button message"
              onClick={(e) => {
                e.stopPropagation();
                handleContactClick('message');
              }}
              aria-label={`Send message to ${provider.name}`}
              title="Send Message"
            >
              <MessageSquare size={16} />
            </button>
            <button
              className="contact-button call"
              onClick={(e) => {
                e.stopPropagation();
                handleContactClick('phone');
              }}
              aria-label={`Call ${provider.name}`}
              title="Call"
            >
              <Phone size={16} />
            </button>
            <button
              className="contact-button email"
              onClick={(e) => {
                e.stopPropagation();
                handleContactClick('email');
              }}
              aria-label={`Email ${provider.name}`}
              title="Email"
            >
              <Mail size={16} />
            </button>
          </div>
          
          {/* Primary Action Button */}
          <button
            className="primary-action-button"
            onClick={(e) => {
              e.stopPropagation();
              handleHireClick();
            }}
            aria-label={`Hire ${provider.name}`}
          >
            Hire Now
          </button>
        </div>
      </div>
      
      {/* View Details Link (List View Only) */}
      {!isGridView && (
        <div className="view-details-link">
          <button
            className="details-button"
            onClick={handleViewDetails}
            aria-label={`View detailed information about ${provider.name}`}
          >
            View Full Details
            <ExternalLink size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

// Default props
ProviderCard.defaultProps = {
  provider: {
    id: '',
    name: 'Service Provider',
    company: '',
    type: 'property-manager',
    tier: 'Verified Firm',
    rating: 4.0,
    reviews: 0,
    location: 'Location',
    services: [],
    verified: true,
    healthScore: 85,
    responseTime: 'Within 24 hours',
    description: 'Professional service provider description',
    logo: '',
    contact: {},
    tags: [],
    stats: {}
  },
  viewMode: 'grid',
  onContact: () => {},
  onHire: () => {},
  onViewDetails: () => {}
};

export default ProviderCard;