import React, { useState, useRef } from 'react';
import { MapPin, Clock, User, Building, Home, Play, Shield } from 'lucide-react';
import VerifiedBadge from '../../../shared/components/VerifiedBadge';
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

  const isVideo = (url) => /\.(mp4|mov|webm|ogg)$/i.test(url);

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

  const nextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleTouchStart = (e) => setTouchStartX(e.touches[0].clientX);
  const handleTouchMove = (e) => setTouchEndX(e.touches[0].clientX);
  const handleTouchEnd = () => {
    if (touchStartX - touchEndX > 50) {
      nextImage({ stopPropagation: () => {} });
    } else if (touchEndX - touchStartX > 50) {
      prevImage({ stopPropagation: () => {} });
    }
  };

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

  const [lightboxTouchStart, setLightboxTouchStart] = useState(0);
  const [lightboxTouchEnd, setLightboxTouchEnd] = useState(0);

  const handleLightboxTouchStart = (e) => setLightboxTouchStart(e.touches[0].clientX);
  const handleLightboxTouchMove = (e) => setLightboxTouchEnd(e.touches[0].clientX);
  const handleLightboxTouchEnd = () => {
    if (lightboxTouchStart - lightboxTouchEnd > 50) {
      nextLightboxImage({ stopPropagation: () => {} });
    } else if (lightboxTouchEnd - lightboxTouchStart > 50) {
      prevLightboxImage({ stopPropagation: () => {} });
    }
  };

  const handleCardClick = (e) => {
    const target = e.target;
    const isInteractive = target.closest('.carousel-btn') || 
                         target.closest('.dot') ||
                         target.closest('.btn') ||
                         target.closest('.listing-image') ||
                         target.closest('.play-overlay') ||
                         target.closest('.verified-badge');
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
    switch(listing.posterRole) {
      case 'estate-firm': return <Building size={14} />;
      case 'landlord': return <Home size={14} />;
      case 'tenant': return <User size={14} />;
      default: return <User size={14} />;
    }
  };

  const getRoleLabel = () => {
    switch(listing.posterRole) {
      case 'estate-firm': return 'Estate Firm';
      case 'landlord': return 'Landlord';
      case 'tenant': return 'Outgoing Tenant';
      default: return 'Unknown';
    }
  };

  const getVerificationType = () => {
    if (listing.posterRole === 'estate-firm') return 'estate';
    if (listing.posterRole === 'landlord') return 'landlord';
    if (listing.posterRole === 'tenant') return 'tenant';
    return 'user';
  };

  return (
    <>
      <div 
        className={`listing-card ${!listing.verified ? 'unverified' : ''} ${listing.posterRole || ''}`}
        ref={cardRef}
        onClick={handleCardClick}
      >
        {/* Image Carousel */}
        <div 
          className="listing-image-container"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {isVideo(images[currentImageIndex]) ? (
            <div className="video-thumbnail" onClick={(e) => openLightbox(currentImageIndex, e)}>
              <img 
                src={images[currentImageIndex]} 
                alt={listing.title}
                className="listing-image"
              />
              <div className="play-overlay">
                <Play size={32} />
              </div>
            </div>
          ) : (
            <img 
              src={images[currentImageIndex]} 
              alt={listing.title}
              onClick={(e) => openLightbox(currentImageIndex, e)}
              className="listing-image"
            />
          )}
          
          {/* Badges */}
          <div className="badges-container">
            {listing.verified && (
              <VerifiedBadge type="property" size="small" showTooltip={true} />
            )}
            {listing.userVerified && (
              <VerifiedBadge type={getVerificationType()} size="small" showTooltip={true} />
            )}
            {listing.posterRole === 'estate-firm' && (
              <div className="estate-firm-badge">
                <Building size={14} />
                <span>0% Commission</span>
              </div>
            )}
            {!listing.verified && !listing.userVerified && listing.posterRole !== 'estate-firm' && (
              <div className="pending-badge">
                <Clock size={14} />
                <span>Pending</span>
              </div>
            )}
          </div>
          
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
            <span className="property-type">{listing.property_type || listing.propertyType}</span>
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

          {/* Extra Details */}
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
              <div className="poster-info">
                {getRoleIcon()}
                <span>
                  Posted by {listing.posterName || 'Anonymous'} • {getRoleLabel()}
                </span>
                <span className="listing-date">
                  {formatDate(listing.created_at || listing.posted_date)}
                </span>
              </div>

              {/* Actions */}
              <div className="listing-actions">
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
          )}
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <div 
            className="lightbox-content" 
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleLightboxTouchStart}
            onTouchMove={handleLightboxTouchMove}
            onTouchEnd={handleLightboxTouchEnd}
          >
            <button className="lightbox-close" onClick={closeLightbox}>×</button>
            
            {isVideo(images[lightboxIndex]) ? (
              <video controls autoPlay className="lightbox-video">
                <source src={images[lightboxIndex]} />
                Your browser does not support the video tag.
              </video>
            ) : (
              <img src={images[lightboxIndex]} alt={listing.title} className="lightbox-image" />
            )}
            
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