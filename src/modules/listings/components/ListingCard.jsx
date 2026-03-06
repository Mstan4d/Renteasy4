// src/modules/listings/components/ListingCard.jsx
import React from 'react';
import { MapPin, CheckCircle, Clock, User, Building, Home, Receipt } from 'lucide-react';
import './ListingCard.css';

const ListingCard = ({ listing, onViewDetails, onContact, onVerify, userRole }) => {
  const imageUrl = listing.images?.[0] || 
                 listing.image_urls?.[0] || 
                 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=400&fit=crop';

  const basePrice = parseFloat(listing.price || listing.rent_amount || 0);
  const isEstateFirm = listing.posterRole === 'estate-firm';

  // Commission calculation (7.5% only for non-estate)
  const commission = isEstateFirm ? 0 : basePrice * 0.075;

  // Extra fees – expecting array of { name, amount, description? }
  const extraFees = listing.extra_fees || [];
  const totalExtraFees = extraFees.reduce((sum, fee) => sum + (fee.amount || 0), 0);

  // Total price
  const totalPrice = basePrice + commission + totalExtraFees;

  // Commission breakdown (for tooltip or small display)
  const commissionBreakdown = isEstateFirm ? null : {
    rentEasy: commission * (3.5 / 7.5),
    manager: commission * (2.5 / 7.5),
    referral: commission * (1.5 / 7.5),
  };

  const formatPrice = (price) => {
    return `₦${Math.round(price).toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getRoleIcon = () => {
    switch(listing.posterRole || listing.userRole) {
      case 'estate-firm': return <Building size={14} />;
      case 'landlord': return <Home size={14} />;
      default: return <User size={14} />;
    }
  };

  const getRoleLabel = () => {
    switch(listing.posterRole || listing.userRole) {
      case 'estate-firm': return 'Estate Firm';
      case 'landlord': return 'Landlord';
      case 'tenant': return 'Outgoing Tenant';
      default: return 'Unknown';
    }
  };

  // Limit extra fees shown initially to first 2, with a "+X more" indicator
  const visibleFees = extraFees.slice(0, 2);
  const hiddenFeesCount = extraFees.length - visibleFees.length;

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
            <span className="price-label">Annual Rent:</span>
            <span className="price-amount">{formatPrice(basePrice)}</span>
          </div>

          {!isEstateFirm && (
            <div className="commission-item">
              <span className="commission-label">Commission (7.5%):</span>
              <span className="commission-amount">+ {formatPrice(commission)}</span>
            </div>
          )}

          {/* Extra Fees */}
          {extraFees.length > 0 && (
            <div className="extra-fees">
              <span className="fees-label">Additional Fees:</span>
              <div className="fees-list">
                {visibleFees.map((fee, idx) => (
                  <div key={idx} className="fee-item">
                    <span className="fee-name">{fee.name}:</span>
                    <span className="fee-amount">+ {formatPrice(fee.amount)}</span>
                  </div>
                ))}
                {hiddenFeesCount > 0 && (
                  <div className="fee-item more-fees">
                    <span className="fee-name">+{hiddenFeesCount} more</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Total Price */}
          <div className="total-price">
            <span className="total-label">Total Payable:</span>
            <span className="total-amount">{formatPrice(totalPrice)}</span>
          </div>

          {/* Detailed breakdown (optional, can be shown on hover or in details) */}
          {!isEstateFirm && commissionBreakdown && (
            <div className="commission-breakdown">
              <small>
                Breakdown: RentEasy ({formatPrice(commissionBreakdown.rentEasy)}) + 
                Manager ({formatPrice(commissionBreakdown.manager)}) + 
                Referral ({formatPrice(commissionBreakdown.referral)})
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