import React from 'react';
import ListingCard from '../../listings/components/ListingCard';
import './HorizontalScrollList.css';

const HorizontalScrollList = ({ listings, title, onViewDetails, onContact, onVerify, userRole }) => {
  if (!listings.length) return null;

  return (
    <div className="horizontal-scroll-section">
      <div className="section-header">
        <h2>{title}</h2>
      </div>
      <div className="scroll-container">
        {listings.map(listing => (
          <div key={listing.id} className="scroll-item">
            <ListingCard
              listing={listing}
              onViewDetails={() => onViewDetails(listing)}
              onContact={() => onContact(listing)}
              onVerify={() => onVerify(listing)}
              userRole={userRole}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default HorizontalScrollList;