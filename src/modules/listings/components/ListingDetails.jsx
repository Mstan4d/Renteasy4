// src/modules/listings/components/ListingDetails.jsx
import React, { useState, useEffect } from 'react';
import PropertyImage from '../../../shared/components/PropertyImage';
import { 
  ArrowLeft, MapPin, CheckCircle, Clock, User, Phone, Mail, 
  Home, DollarSign, Shield, Star, Image as ImageIcon, Building, Receipt
} from 'lucide-react';
import { supabase } from '../../../shared/lib/supabaseClient';
import { useAuth } from '../../../shared/context/AuthContext';
import VerifiedBadge from '../../../shared/components/VerifiedBadge';
import './ListingDetails.css';

const ListingDetails = ({ 
  listing, 
  onBack, 
  onContact, 
  onVerify, 
  onVerifyUser, 
  onReject, 
  onAcceptToManage, 
  userRole,
  getVerificationType,
  isNearby,
  canManagerVerify,
  canManagerAccept
}) => {
  const { user } = useAuth();
  const [newReview, setNewReview] = useState('');
  const [reviews, setReviews] = useState(listing.reviews || []);
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  // ----- Normalise data from Supabase columns (raw) -----
  const isListingVerified = listing.verified === true;
  const listingStatus = listing.status || 'pending';
  const isUserVerified = listing.user_verified === true;
  const coordinates = listing.coordinates || 
    (listing.lat && listing.lng ? { lat: listing.lat, lng: listing.lng } : null);
  const postedDate = listing.created_at || listing.posted_date;

  // ----- Saved status (unchanged) -----
  useEffect(() => {
    if (user && listing?.id) checkIfSaved();
  }, [user, listing?.id]);

  const checkIfSaved = async () => {
    try {
      const { data } = await supabase
        .from('saved_properties')
        .select('id')
        .eq('user_id', user.id)
        .eq('listing_id', listing.id)
        .maybeSingle();
      setIsSaved(!!data);
    } catch (error) {
      console.error('Error checking saved status:', error);
    }
  };

  const handleSaveToFavorites = async () => {
    if (!user) {
      alert('Please log in to save properties');
      return;
    }
    setSaving(true);
    try {
      if (isSaved) {
        await supabase
          .from('saved_properties')
          .delete()
          .eq('user_id', user.id)
          .eq('listing_id', listing.id);
        setIsSaved(false);
        alert('Removed from saved properties');
      } else {
        await supabase
          .from('saved_properties')
          .insert({ user_id: user.id, listing_id: listing.id, created_at: new Date().toISOString() });
        setIsSaved(true);
        alert('Added to saved properties!');
      }
    } catch (error) {
      console.error('Error saving property:', error);
      alert('Failed to save property');
    } finally {
      setSaving(false);
    }
  };

  // ----- Helper functions -----
  const safeImage = (url) => {
    if (!url || url.startsWith('blob:')) 
      return 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80';
    return url.replace('http://', 'https://');
  };

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

  const formatPrice = (price) => `₦${Math.round(price).toLocaleString()}`;
  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  const openInGoogleMaps = () => {
    const query = coordinates 
      ? `${coordinates.lat},${coordinates.lng}`
      : encodeURIComponent(`${listing.address}, ${listing.lga}, ${listing.state}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  const handleSubmitReview = () => {
    if (newReview.trim()) {
      setReviews([...reviews, newReview.trim()]);
      alert('Review submitted successfully!');
      setNewReview('');
    }
  };

  const getPosterRoleLabel = () => {
    const role = listing.posterRole;
    if (role === 'estate-firm') return 'Estate Firm';
    if (role === 'landlord') return 'Landlord';
    if (role === 'tenant') return 'Outgoing Tenant';
    return 'Unknown';
  };
  const getPosterRoleIcon = () => {
    const role = listing.posterRole;
    if (role === 'estate-firm') return <Building size={16} />;
    if (role === 'landlord') return <Home size={16} />;
    return <User size={16} />;
  };

  return (
    <div className="listing-details">
      <button className="back-button" onClick={onBack}>
        <ArrowLeft size={18} /> Back to Listings
      </button>

      <div className="details-content">
        <div className="details-header">
          <div className="header-left">
            <h1>{listing.title}</h1>
            <div className="listing-status">
              {isListingVerified ? (
                <span className="status-badge verified"><CheckCircle size={16} /> Verified Listing</span>
              ) : listingStatus === 'pending' ? (
                <span className="status-badge pending"><Clock size={16} /> Pending Verification</span>
              ) : listingStatus === 'rejected' ? (
                <span className="status-badge rejected"><Clock size={16} /> Rejected</span>
              ) : null}
            </div>
          </div>
          <div className="header-right">
            <button className="btn btn-primary contact-btn" onClick={onContact}>Contact Now</button>
            {(userRole === 'admin' || userRole === 'manager') && !isListingVerified && listingStatus === 'pending' && (
              <button className="btn btn-success verify-btn" onClick={onVerify}>Verify Listing</button>
            )}
          </div>
        </div>

        {/* Images Gallery */}
        <div className="images-section">
          <h3><ImageIcon size={20} /> Property Images</h3>
          <div className="images-grid">
            {listing.images?.map((img, idx) => (
              <div key={idx} className="image-item">
                <PropertyImage src={safeImage(img)} alt={`${listing.title} - ${idx+1}`} className="image-preview" />
              </div>
            ))}
            {(!listing.images || listing.images.length === 0) && (
              <div className="no-images"><ImageIcon size={48} /><p>No images available</p></div>
            )}
          </div>
        </div>

        {/* Details Grid */}
        <div className="details-grid">
          {/* Left column */}
          <div className="details-column">
            <div className="detail-card">
              <h3><Home size={18} /> Property Information</h3>
              <div className="detail-item">
                <span className="detail-label">Type:</span>
                <span className="detail-value">{listing.property_type || listing.propertyType}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Location:</span>
                <span className="detail-value"><MapPin size={14} /> {listing.address}, {listing.lga}, {listing.state}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Coordinates:</span>
                <span className="detail-value">{coordinates ? `${coordinates.lat?.toFixed(6)}, ${coordinates.lng?.toFixed(6)}` : 'Not available'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Amenities:</span>
                <span className="detail-value">{Array.isArray(listing.amenities) ? listing.amenities.join(', ') : (listing.amenities || 'No amenities listed')}</span>
              </div>
              <div className="detail-item">
               <span className="detail-label">Status:</span>
                <span className={`detail-value status-${isListingVerified ? 'approved' : listingStatus}`}>
                  {isListingVerified ? '✓ Verified' : listingStatus === 'pending' ? '⏳ Pending' : listingStatus === 'rejected' ? '✗ Rejected' : 'Unknown'}
                </span>
              </div>
            </div>

            <div className="detail-card">
              <h3>{getPosterRoleIcon()} Poster Information</h3>
              <div className="detail-item">
                <span className="detail-label">Posted by:</span>
                <span className="detail-value">{listing.posterName || 'Anonymous'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Role:</span>
                <span className="detail-value">{getPosterRoleLabel()}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Verified:</span>
                <span className="detail-value">{isUserVerified ? '✓ Yes' : '✗ No'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Posted on:</span>
                <span className="detail-value">{formatDate(postedDate)}</span>
              </div>
              {listing.isManaged && (
                <div className="detail-item">
                  <span className="detail-label">Managed by:</span>
                  <span className="detail-value">{listing.managedBy || 'Property Manager'}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right column */}
          <div className="details-column">
            <div className="detail-card price-card">
              <h3><DollarSign size={18} /> Pricing Details</h3>
              <div className="price-details">
                <div className="price-item">
                  <span className="price-label">Annual Rent:</span>
                  <span className="price-value">{formatPrice(basePrice)}</span>
                </div>

                {!isEstateFirm && (
                  <div className="commission-section">
                    <h4><Shield size={16} /> Commission Breakdown (7.5%)</h4>
                    <div className="commission-item">
                      <span>RentEasy Commission (3.5%):</span>
                      <span className="commission-renteasy">+ {formatPrice(commissionBreakdown.rentEasy)}</span>
                    </div>
                    <div className="commission-item">
                      <span>Manager Commission (2.5%):</span>
                      <span className="commission-manager">+ {formatPrice(commissionBreakdown.manager)}</span>
                    </div>
                    <div className="commission-item">
                      <span>Referral Commission (1.5%):</span>
                      <span className="commission-referral">+ {formatPrice(commissionBreakdown.referral)}</span>
                    </div>
                  </div>
                )}

                {extraFees.length > 0 && (
                  <div className="extra-fees-section">
                    <h4><Receipt size={16} /> Additional Fees</h4>
                    {extraFees.map((fee, idx) => (
                      <div key={idx} className="fee-item">
                        <span className="fee-name">{fee.name}:</span>
                        <span className="fee-amount">+ {formatPrice(fee.amount)}</span>
                        {fee.description && <small className="fee-description">({fee.description})</small>}
                      </div>
                    ))}
                    <div className="fee-total">
                      <span>Total Additional Fees:</span>
                      <span>{formatPrice(totalExtraFees)}</span>
                    </div>
                  </div>
                )}

                {isEstateFirm && (
                  <div className="commission-section">
                    <h4><Building size={16} /> Estate Firm Listing</h4>
                    <div className="commission-item">
                      <span>No Commission Charged:</span>
                      <span className="commission-free">0%</span>
                    </div>
                    <div className="commission-note"><small>Direct contact with estate firm</small></div>
                  </div>
                )}

                <div className="total-price">
                  <span>Total Payable:</span>
                  <span className="total-amount">{formatPrice(totalPrice)}</span>
                </div>
              </div>
            </div>

            {userRole === 'manager' && !isEstateFirm && !listing.isManaged && (
              <div className="detail-card manager-actions">
                <h3><User size={18} /> Manager Actions</h3>
                <div className="action-buttons">
                  <button 
                    className={`btn ${canManagerAccept ? 'btn-primary' : 'btn-disabled'}`}
                    onClick={onAcceptToManage}
                    disabled={!canManagerAccept || !isNearby}
                    title={!canManagerAccept ? "Complete KYC first" : !isNearby ? "Must be within 1km radius" : "Accept to manage this listing"}
                  >
                    {canManagerAccept 
                      ? (isNearby ? 'Accept to Manage' : 'Too Far (>1km)')
                      : 'Complete KYC First'}
                  </button>
                  <p className="action-note">
                    {!canManagerAccept 
                      ? 'Complete KYC verification to manage listings'
                      : !isNearby 
                        ? 'You must be within 1km radius of the property'
                        : 'First manager to accept gets exclusive management rights'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="description-section">
          <h3>Property Description</h3>
          <div className="description-content">{listing.description || 'No description available.'}</div>
        </div>

        {/* Reviews */}
        <div className="reviews-section">
          <h3><Star size={18} /> Reviews ({reviews.length})</h3>
          <div className="reviews-list">
            {reviews.length > 0 ? (
              reviews.map((review, i) => (
                <div key={i} className="review-item">
                  <p>{review}</p>
                  <span className="review-date">Review #{i+1}</span>
                </div>
              ))
            ) : (
              <p className="no-reviews">No reviews yet. Be the first to review!</p>
            )}
          </div>
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
            <ArrowLeft size={16} /> Back
          </button>
          <button className="btn btn-primary" onClick={onContact}>
            <Phone size={16} /> Contact Now
          </button>
          <button className="btn btn-outline map-btn" onClick={openInGoogleMaps}>
            📍 View on Map
          </button>
          <button 
            className={`btn ${isSaved ? 'btn-success' : 'btn-outline'}`}
            onClick={handleSaveToFavorites}
            disabled={saving}
          >
            <Star size={16} /> {saving ? 'Saving...' : (isSaved ? 'Saved' : 'Save to Favorites')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ListingDetails;