// src/modules/listings/components/HorizontalScrollList.jsx
import React from 'react';
import HorizontalListingCard from '../../../shared/components/HorizontalListingCard';
import './HorizontalScrollList.css';

const HorizontalScrollList = ({ listings, title, onViewDetails }) => {
  if (!listings?.length) return null;

  return (
    <div className="horizontal-scroll-section">
      <div className="section-header">
        <h2>{title}</h2>
      </div>
      <div className="scroll-container">
        {listings.map(listing => (
          <div key={listing.id} className="scroll-item">
            <HorizontalListingCard
              listing={listing}
              onViewDetails={onViewDetails}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default HorizontalScrollList;