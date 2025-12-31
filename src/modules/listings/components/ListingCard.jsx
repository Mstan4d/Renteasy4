// src/modules/listings/components/ListingCard.jsx
import React from 'react';
import { MapPin, CheckCircle, Clock, User } from 'lucide-react';
import './ListingCard.css';

const ListingCard = ({ listing, onViewDetails, onContact, onVerify, userRole }) => {
  const imageUrl = listing.images?.[0] || `https://picsum.photos/seed/${listing.id}/600/400`;
  const uplift = parseFloat(listing.price) * 0.075;
  const priceAfter = parseFloat(listing.price) + uplift;
  
  const commissionBreakdown = listing.commission?.breakdown || {
    rentEasy: uplift * 0.5333, // 4%
    manager: uplift * 0.3333,  // 2.5%
    referral: uplift * 0.1333   // 1%
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

  return (
    <div className={`listing-card ${!listing.verified ? 'unverified' : ''}`}>
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
            <span className="commission-label">After 7.5% Commission:</span>
            <span className="commission-amount">{formatPrice(priceAfter)}</span>
          </div>
          <div className="commission-breakdown">
            <small>
              Includes: RentEasy (₦{Math.round(commissionBreakdown.rentEasy).toLocaleString()}) + 
              Manager (₦{Math.round(commissionBreakdown.manager).toLocaleString()})
            </small>
          </div>
        </div>

        {/* Poster Info */}
        <div className="poster-info">
          <User size={14} />
          <span>
            Posted by {listing.posterName || 'Anonymous'} • 
            {listing.userRole === 'tenant' ? ' Outgoing Tenant' : ' Landlord'}
          </span>
          <span className="listing-date">
            {formatDate(listing.timestamp)}
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