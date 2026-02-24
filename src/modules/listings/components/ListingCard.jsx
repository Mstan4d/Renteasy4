// src/modules/listings/components/ListingCard.jsx
import React from 'react';
import { MapPin, CheckCircle, Clock, User, Building, Home } from 'lucide-react';
import './ListingCard.css';

const ListingCard = ({ listing, onViewDetails, onContact, onVerify, userRole }) => {
  const imageUrl = listing.images?.[0] || 
                 listing.image_urls?.[0] || 
                 https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=400&fit=crop;

                 // Fix price display:
const price = listing.price || listing.rent_amount || 0;
const formattedPrice = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN'
}).format(parseFloat(price));

// Fix role display:
const posterRole = listing.posterRole || listing.userRole;
const roleLabel = {
  'tenant': '👤 Outgoing Tenant',
  'landlord': '🏠 Landlord',
  'estate-firm': '🏢 Estate Firm'
}[posterRole] || 'Unknown';
  
  // CORRECT COMMISSION CALCULATION
  const isEstateFirm = listing.posterRole === 'estate-firm';
  const uplift = isEstateFirm ? 0 : parseFloat(listing.price) * 0.075;
  const priceAfter = isEstateFirm ? parseFloat(listing.price) : parseFloat(listing.price) + uplift;
  
  const commissionBreakdown = isEstateFirm 
    ? { rentEasy: 0, manager: 0, referral: 0 }
    : listing.commission?.breakdown || {
        rentEasy: uplift * (3.5/7.5),    // 3.5%
        manager: uplift * (2.5/7.5),     // 2.5%
        referral: uplift * (1.5/7.5)     // 1.5%
      };

  const formatPrice = (price) => {
    return `₦${parseFloat(price).toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Get role icon
  const getRoleIcon = () => {
    switch(listing.posterRole || listing.userRole) {
      case 'estate-firm': return <Building size={14} />;
      case 'landlord': return <Home size={14} />;
      default: return <User size={14} />;
    }
  };

  // Get role label
  const getRoleLabel = () => {
    switch(listing.posterRole || listing.userRole) {
      case 'estate-firm': return 'Estate Firm';
      case 'landlord': return 'Landlord';
      case 'tenant': return 'Outgoing Tenant';
      default: return 'Unknown';
    }
  };

  return (
    <div className={`listing-card ${!listing.verified ? 'unverified' : ''} ${listing.posterRole || ''}`}>
      {/* Image */}
      <div className="listing-image">
        <img src={imageUrl} alt={listing.title} />
        {listing.verified && (
          <div className="verified-badge">
            <CheckCircle size={14} />
            <span>Verified</span>
          </div>
        )}
        {!listing.verified && (
          <div className="unverified-badge">
            <Clock size={14} />
            <span>Pending</span>
          </div>
        )}
        {listing.posterRole === 'estate-firm' && (
          <div className="estate-firm-badge">
            <Building size={14} />
            <span>0% Commission</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="listing-content">
        <h3 className="listing-title">{listing.title}</h3>
        
        <div className="listing-meta">
          <span className="property-type">{listing.propertyType}</span>
          <span className="separator">•</span>
          <span className="location">
            <MapPin size={14} />
            {listing.state} / {listing.lga}
          </span>
        </div>

        <p className="listing-description">
          {listing.description?.substring(0, 100)}...
        </p>

        {/* Price Section */}
        <div className="listing-price">
          <div className="original-price">
            <span className="price-label">Monthly Rent:</span>
            <span className="price-amount">{formatPrice(listing.price)}</span>
          </div>
          <div className="commission-price">
            <span className="commission-label">
              {isEstateFirm ? 'Total Payable:' : 'After 7.5% Commission:'}
            </span>
            <span className="commission-amount">{formatPrice(priceAfter)}</span>
          </div>
          {!isEstateFirm && (
            <div className="commission-breakdown">
              <small>
                Breakdown: RentEasy ({formatPrice(Math.round(commissionBreakdown.rentEasy))}) + 
                Manager ({formatPrice(Math.round(commissionBreakdown.manager))}) + 
                Referral ({formatPrice(Math.round(commissionBreakdown.referral))})
              </small>
            </div>
          )}
        </div>

        {/* Poster Info */}
        <div className="poster-info">
          {getRoleIcon()}
          <span>
            Posted by {listing.posterName || 'Anonymous'} • {getRoleLabel()}
          </span>
          <span className="listing-date">
            {formatDate(listing.timestamp || listing.createdAt)}
          </span>
        </div>

        {/* Actions */}
        <div className="listing-actions">
          <button 
            className="btn btn-outline view-btn"
            onClick={onViewDetails}
          >
            View Details
          </button>
          <button 
            className="btn btn-primary contact-btn"
            onClick={onContact}
          >
            Contact
          </button>
          
          {/* Verify button for admin/manager */}
          {(userRole === 'admin' || userRole === 'manager') && !listing.verified && (
            <button 
              className="btn btn-success verify-btn"
              onClick={onVerify}
            >
              Verify
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListingCard;