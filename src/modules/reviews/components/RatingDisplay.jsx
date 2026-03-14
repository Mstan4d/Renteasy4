import React from 'react';
import { Star } from 'lucide-react';
import './RatingDisplay.css';

const RatingDisplay = ({ rating, totalReviews, breakdown, showDetails = false }) => {
  return (
    <div className="rating-display">
      <div className="rating-average">
        <span className="average-number">{rating.toFixed(1)}</span>
        <div className="stars">
          {[1, 2, 3, 4, 5].map(star => (
            <Star
              key={star}
              size={20}
              fill={star <= Math.round(rating) ? '#fbbf24' : 'none'}
              color="#d1d5db"
            />
          ))}
        </div>
        <span className="total-reviews">{totalReviews} reviews</span>
      </div>
      {showDetails && breakdown && (
        <div className="rating-breakdown">
          {[5, 4, 3, 2, 1].map(star => {
            const count = breakdown[star] || 0;
            const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
            return (
              <div key={star} className="breakdown-row">
                <span className="star-label">{star} stars</span>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${percentage}%` }} />
                </div>
                <span className="star-count">{count}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RatingDisplay;