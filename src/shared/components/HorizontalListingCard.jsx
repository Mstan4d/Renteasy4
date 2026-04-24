// src/shared/components/HorizontalListingCard.jsx
import React from 'react';
import { MapPin, User, Building, Home } from 'lucide-react';
import VerifiedBadge from './VerifiedBadge';
import './HorizontalListingCard.css';

const HorizontalListingCard = ({ listing, onViewDetails }) => {
  const fallbackImage = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=300&h=200&fit=crop';
  const imageUrl = listing.images?.[0] || fallbackImage;

  const formatPrice = (price) => `₦${Math.round(price).toLocaleString()}`;
  const basePrice = parseFloat(listing.price || listing.rent_amount || 0);
  const isEstateFirm = listing.posterRole === 'estate-firm' || listing.commission_rate === 0;
  const commission = isEstateFirm ? 0 : basePrice * 0.075;
  const totalPrice = basePrice + commission;

  const getRoleIcon = () => {
    switch (listing.posterRole) {
      case 'estate-firm': return <Building size={10} />;
      case 'landlord': return <Home size={10} />;
      default: return <User size={10} />;
    }
  };

  const getRoleLabel = () => {
    switch (listing.posterRole) {
      case 'estate-firm': return 'Estate Firm';
      case 'landlord': return 'Landlord';
      case 'tenant': return 'Tenant';
      default: return 'Unknown';
    }
  };

  return (
    <div className="horizontal-listing-card" onClick={() => onViewDetails(listing)}>
      <div className="horizontal-card-image">
        <img src={imageUrl} alt={listing.title} />
        {listing.verified && <VerifiedBadge type="property" size="small" />}
      </div>
      <div className="horizontal-card-content">
        <h4 className="horizontal-card-title">{listing.title}</h4>
        <div className="horizontal-card-location">
          <MapPin size={10} />
          <span>{listing.state} / {listing.lga}</span>
        </div>
        <div className="horizontal-card-price">
          <span className="price-amount">{formatPrice(totalPrice)}</span>
          {!isEstateFirm && <span className="price-note">+7.5%</span>}
        </div>
        <div className="horizontal-card-poster">
          {getRoleIcon()}
          <span>{getRoleLabel()}</span>
        </div>
      </div>
    </div>
  );
};

export default HorizontalListingCard;