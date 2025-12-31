// src/modules/listings/components/ListingDetails.jsx
import React, { useState } from 'react';
import { 
  ArrowLeft, MapPin, CheckCircle, Clock, User, Phone, Mail, 
  Home, DollarSign, Shield, Star, Image as ImageIcon
} from 'lucide-react';
import './ListingDetails.css';

const ListingDetails = ({ listing, onBack, onContact, onVerify, userRole }) => {
  const [newReview, setNewReview] = useState('');
  const [reviews, setReviews] = useState(listing.reviews || []);

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
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const openInGoogleMaps = (listing) => {
    const query = listing.coordinates
      ? `${listing.coordinates.lat},${listing.coordinates.lng}`
      : encodeURIComponent(`${listing.address}, ${listing.lga}, ${listing.state}`);
  
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  const handleSubmitReview = () => {
    if (newReview.trim()) {
      const updatedReviews = [...reviews, newReview.trim()];
      setReviews(updatedReviews);
      
      // Update localStorage
      const allListings = JSON.parse(localStorage.getItem('listings') || '[]');
      const updatedListings = allListings.map(l => 
        l.id === listing.id ? { ...l, reviews: updatedReviews } : l
      );
      localStorage.setItem('listings', JSON.stringify(updatedListings));
      
      setNewReview('');
      alert('Review submitted successfully!');
    }
  };

  return (
    <div className="listing-details">
      {/* Back Button */}
      <button className="back-button" onClick={onBack}>
        <ArrowLeft size={18} />
        Back to Listings
      </button>

      {/* Main Content */}
      <div className="details-content">
        {/* Header */}
        <div className="details-header">
          <div className="header-left">
            <h1>{listing.title}</h1>
            <div className="listing-status">
              {listing.verified ? (
                <span className="status-badge verified">
                  <CheckCircle size={16} />
                  Verified Listing
                </span>
              ) : (
                <span className="status-badge pending">
                  <Clock size={16} />
                  Pending Verification
                </span>
              )}
            </div>
          </div>
          <div className="header-right">
            <button className="btn btn-primary contact-btn" onClick={onContact}>
              Contact Now
            </button>
            {(userRole === 'admin' || userRole === 'manager') && !listing.verified && (
              <button className="btn btn-success verify-btn" onClick={onVerify}>
                Verify Listing
              </button>
            )}
          </div>
        </div>

        {/* Images Gallery */}
        <div className="images-section">
          <h3>
            <ImageIcon size={20} />
            Property Images
          </h3>
          <div className="images-grid">
            {listing.images?.map((image, index) => (
              <div key={index} className="image-item">
                <img src={image} alt={`${listing.title} - ${index + 1}`} />
              </div>
            ))}
            {(!listing.images || listing.images.length === 0) && (
              <div className="no-images">
                <ImageIcon size={48} />
                <p>No images available for this property</p>
              </div>
            )}
          </div>
        </div>

        {/* Property Details Grid */}
        <div className="details-grid">
          {/* Left Column */}
          <div className="details-column">
            <div className="detail-card">
              <h3>
                <Home size={18} />
                Property Information
              </h3>
              <div className="detail-item">
                <span className="detail-label">Type:</span>
                <span className="detail-value">{listing.propertyType}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Location:</span>
                <span className="detail-value">
                  <MapPin size={14} />
                  {listing.address}, {listing.lga}, {listing.state}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Coordinates:</span>
                <span className="detail-value">
                  {listing.coordinates?.lat?.toFixed(6)}, {listing.coordinates?.lng?.toFixed(6)}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Amenities:</span>
                <span className="detail-value">
                  {listing.amenities?.join(', ') || 'Not specified'}
                </span>
              </div>
            </div>

            <div className="detail-card">
              <h3>
                <User size={18} />
                Poster Information
              </h3>
              <div className="detail-item">
                <span className="detail-label">Posted by:</span>
                <span className="detail-value">{listing.posterName || 'Anonymous'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Role:</span>
                <span className="detail-value">
                  {listing.userRole === 'tenant' ? 'Outgoing Tenant' : 'Landlord'}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Posted on:</span>
                <span className="detail-value">{formatDate(listing.timestamp)}</span>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="details-column">
            <div className="detail-card price-card">
              <h3>
                <DollarSign size={18} />
                Pricing Details
              </h3>
              <div className="price-details">
                <div className="price-item">
                  <span className="price-label">Monthly Rent:</span>
                  <span className="price-value">{formatPrice(listing.price)}</span>
                </div>
                
                <div className="commission-section">
                  <h4>
                    <Shield size={16} />
                    Commission Breakdown (7.5%)
                  </h4>
                  <div className="commission-item">
                    <span>RentEasy Commission (4%):</span>
                    <span className="commission-renteasy">
                      + {formatPrice(commissionBreakdown.rentEasy)}
                    </span>
                  </div>
                  <div className="commission-item">
                    <span>Manager Commission (2.5%):</span>
                    <span className="commission-manager">
                      + {formatPrice(commissionBreakdown.manager)}
                    </span>
                  </div>
                  {commissionBreakdown.referral > 0 && (
                    <div className="commission-item">
                      <span>Referral Commission (1%):</span>
                      <span className="commission-referral">
                        + {formatPrice(commissionBreakdown.referral)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="total-price">
                  <span>Total Payable:</span>
                  <span className="total-amount">{formatPrice(priceAfter)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="description-section">
          <h3>Property Description</h3>
          <div className="description-content">
            {listing.description || 'No description available.'}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="reviews-section">
          <h3>
            <Star size={18} />
            Reviews ({reviews.length})
          </h3>
          
          <div className="reviews-list">
            {reviews.length > 0 ? (
              reviews.map((review, index) => (
                <div key={index} className="review-item">
                  <p>{review}</p>
                  <span className="review-date">Review #{index + 1}</span>
                </div>
              ))
            ) : (
              <p className="no-reviews">No reviews yet. Be the first to review!</p>
            )}
          </div>

          {/* Add Review */}
          <div className="add-review">
            <textarea
              value={newReview}
              onChange={(e) => setNewReview(e.target.value)}
              placeholder="Write your review about this property..."
              rows={3}
            />
            <button 
              className="btn btn-primary"
              onClick={handleSubmitReview}
              disabled={!newReview.trim()}
            >
              Submit Review
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="details-actions">
          <button className="btn btn-outline" onClick={onBack}>
            <ArrowLeft size={16} />
            Back to Listings
          </button>
          <button className="btn btn-primary" onClick={onContact}>
            <Phone size={16} />
            Contact Now
          </button>
          <button
            className="btn btn-outline map-btn"
              onClick={() => openInGoogleMaps(listing)}
              >
             📍 View on Map
          </button>
          <button className="btn btn-success" onClick={() => {
            // Save to favorites
            const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
            if (!favorites.includes(listing.id)) {
              favorites.push(listing.id);
              localStorage.setItem('favorites', JSON.stringify(favorites));
              alert('Added to favorites!');
            }
          }}>
            <Star size={16} />
            Save to Favorites
          </button>
        </div>
      </div>
    </div>
  );
};

export default ListingDetails;