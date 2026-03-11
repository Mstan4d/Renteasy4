// src/modules/listings/components/ListingCard.jsx
import React, { useState, useRef } from 'react';
import { MapPin, CheckCircle, Clock, User, Building, Home } from 'lucide-react';
import './ListingCard.css';

const ListingCard = ({ listing, onViewDetails, onContact, onVerify, userRole }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showExtraDetails, setShowExtraDetails] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);

  const cardRef = useRef(null);

  const fallbackImage = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=400&fit=crop';
  const images = listing.images?.length 
    ? listing.images 
    : [listing.image_urls?.[0] || fallbackImage];

  const basePrice = parseFloat(listing.price || listing.rent_amount || 0);
  const isEstateFirm = listing.posterRole === 'estate-firm';
  const commission = isEstateFirm ? 0 : basePrice * 0.075;
  const extraFees = listing.extra_fees || [];
  const totalExtraFees = extraFees.reduce((sum, fee) => sum + (fee.amount || 0), 0);
  const totalPrice = basePrice + commission + totalExtraFees;

  const commissionBreakdown = isEstateFirm ? null : {
    rentEasy: commission * (3.5 / 7.5),
    manager: commission * (2.5 / 7.5),
    referral: commission * (1.5 / 7.5),
  };

  // Carousel navigation (buttons)
  const nextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Swipe handlers
  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEndX(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStartX - touchEndX > 50) {
      // Swipe left
      nextImage({ stopPropagation: () => {} }); // dummy event
    } else if (touchEndX - touchStartX > 50) {
      // Swipe right
      prevImage({ stopPropagation: () => {} });
    }
  };

  // Lightbox handlers
  const openLightbox = (index, e) => {
    e.stopPropagation();
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => setLightboxOpen(false);

  const nextLightboxImage = (e) => {
    e.stopPropagation();
    setLightboxIndex((prev) => (prev + 1) % images.length);
  };

  const prevLightboxImage = (e) => {
    e.stopPropagation();
    setLightboxIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Toggle extra details when clicking on card (but not on interactive elements)
  const handleCardClick = (e) => {
    const target = e.target;
    const isInteractive = target.closest('.carousel-btn') || 
                         target.closest('.dot') ||
                         target.closest('.btn') ||
                         target.closest('.listing-image') ||
                         target.closest('.remove-btn') ||
                         target.closest('.move-btn');
    if (!isInteractive) {
      setShowExtraDetails(!showExtraDetails);
    }
  };

  const formatPrice = (price) => `₦${Math.round(price).toLocaleString()}`;
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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

  return (
    <>
      <div 
        className={`listing-card ${!listing.verified ? 'unverified' : ''} ${listing.posterRole || ''}`}
        ref={cardRef}
        onClick={handleCardClick}
      >
        {/* Image Carousel with Swipe */}
        <div 
          className="listing-image-container"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <img 
            src={images[currentImageIndex]} 
            alt={listing.title}
            onClick={(e) => openLightbox(currentImageIndex, e)}
            className="listing-image"
          />
          
          {listing.verified && (
            <div className="verified-badge" onClick={(e) => e.stopPropagation()}>
              <CheckCircle size={14} />
              <span>Verified</span>
            </div>
          )}
          {!listing.verified && (
            <div className="unverified-badge" onClick={(e) => e.stopPropagation()}>
              <Clock size={14} />
              <span>Pending</span>
            </div>
          )}
          {listing.posterRole === 'estate-firm' && (
            <div className="estate-firm-badge" onClick={(e) => e.stopPropagation()}>
              <Building size={14} />
              <span>0% Commission</span>
            </div>
          )}
          
          {images.length > 1 && (
            <>
              <button className="carousel-btn prev" onClick={prevImage}>‹</button>
              <button className="carousel-btn next" onClick={nextImage}>›</button>
              <div className="carousel-dots">
                {images.map((_, idx) => (
                  <span
                    key={idx}
                    className={`dot ${idx === currentImageIndex ? 'active' : ''}`}
                    onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(idx); }}
                  />
                ))}
              </div>
            </>
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

          {/* Price Summary */}
          <div className="listing-price-summary">
            <div className="price-row">
              <span className="price-label">Annual Rent:</span>
              <span className="price-amount">{formatPrice(basePrice)}</span>
            </div>
            {!isEstateFirm && (
              <div className="price-row commission-row">
                <span className="price-label">Commission (7.5%):</span>
                <span className="commission-amount">+ {formatPrice(commission)}</span>
              </div>
            )}
            <div className="price-row total-row">
              <span className="price-label">Total Payable:</span>
              <span className="total-amount">{formatPrice(totalPrice)}</span>
            </div>
          </div>

          {/* Extra Details (collapsible) */}
          {showExtraDetails && (
            <div className="extra-details" onClick={(e) => e.stopPropagation()}>
              {!isEstateFirm && commissionBreakdown && (
                <div className="commission-breakdown">
                  <p><strong>Commission Breakdown:</strong></p>
                  <p>RentEasy: {formatPrice(commissionBreakdown.rentEasy)} (3.5%)</p>
                  <p>Manager: {formatPrice(commissionBreakdown.manager)} (2.5%)</p>
                  <p>Referral: {formatPrice(commissionBreakdown.referral)} (1.5%)</p>
                </div>
              )}
              {extraFees.length > 0 && (
                <div className="extra-fees-details">
                  <p><strong>Additional Fees:</strong></p>
                  {extraFees.map((fee, idx) => (
                    <div key={idx} className="fee-detail-row">
                      <span>{fee.name}{fee.description && <small> ({fee.description})</small>}:</span>
                      <span>{formatPrice(fee.amount)}</span>
                    </div>
                  ))}
                  <div className="fee-total-row">
                    <span>Total Additional Fees:</span>
                    <span>{formatPrice(totalExtraFees)}</span>
                  </div>
                </div>
              )}
              {/* Poster Info moved here */}
              <div className="poster-info">
                {getRoleIcon()}
                <span>
                  Posted by {listing.posterName || 'Anonymous'} • {getRoleLabel()}
                </span>
                <span className="listing-date">
                  {formatDate(listing.timestamp || listing.createdAt)}
                </span>
              </div>
            </div>
          )}

          {/* Actions (always visible) */}
          <div className="listing-actions" onClick={(e) => e.stopPropagation()}>
            <button 
              className="btn btn-outline view-btn"
              onClick={(e) => { e.stopPropagation(); onViewDetails(); }}
            >
              View Details
            </button>
            <button 
              className="btn btn-primary contact-btn"
              onClick={(e) => { e.stopPropagation(); onContact(); }}
            >
              Contact
            </button>
            
            {(userRole === 'admin' || userRole === 'manager') && !listing.verified && (
              <button 
                className="btn btn-success verify-btn"
                onClick={(e) => { e.stopPropagation(); onVerify(); }}
              >
                Verify
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox Modal (same as before) */}
      {lightboxOpen && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={closeLightbox}>×</button>
            <img src={images[lightboxIndex]} alt={listing.title} className="lightbox-image" />
            {images.length > 1 && (
              <>
                <button className="lightbox-prev" onClick={prevLightboxImage}>‹</button>
                <button className="lightbox-next" onClick={nextLightboxImage}>›</button>
                <div className="lightbox-dots">
                  {images.map((_, idx) => (
                    <span
                      key={idx}
                      className={`dot ${idx === lightboxIndex ? 'active' : ''}`}
                      onClick={(e) => { e.stopPropagation(); setLightboxIndex(idx); }}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ListingCard;