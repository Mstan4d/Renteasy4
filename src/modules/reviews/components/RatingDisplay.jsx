// src/modules/reviews/components/RatingDisplay.jsx
import React from 'react';
import { Star, TrendingUp, BarChart3, Users } from 'lucide-react';
import './RatingDisplay.css';

const RatingDisplay = ({ rating, reviewsCount, breakdown, showDetails = true }) => {
  // Calculate percentages for each star
  const calculatePercentages = () => {
    const total = breakdown?.reduce((sum, count) => sum + count, 0) || 0;
    return breakdown?.map(count => 
      total > 0 ? Math.round((count / total) * 100) : 0
    ) || [0, 0, 0, 0, 0];
  };

  const percentages = calculatePercentages();
  const breakdownLabels = ['5 stars', '4 stars', '3 stars', '2 stars', '1 star'];

  return (
    <div className="rating-display">
      {/* Overall Rating */}
      <div className="overall-rating">
        <div className="rating-number">
          {rating?.toFixed(1) || '0.0'}
        </div>
        <div className="rating-stars">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={20}
              fill={star <= Math.round(rating) ? "#FFD700" : "none"}
              color={star <= Math.round(rating) ? "#FFD700" : "#e5e7eb"}
            />
          ))}
        </div>
        <div className="rating-count">
          Based on {reviewsCount || 0} review{reviewsCount !== 1 ? 's' : ''}
        </div>
      </div>

      {showDetails && (
        <>
          {/* Rating Breakdown */}
          <div className="rating-breakdown">
            <h4 className="breakdown-title">
              <BarChart3 size={16} />
              Rating Breakdown
            </h4>
            
            <div className="breakdown-bars">
              {percentages.map((percentage, index) => (
                <div key={index} className="breakdown-row">
                  <span className="star-label">
                    {breakdownLabels[4 - index]}
                  </span>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="percentage">
                    {percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Rating Summary */}
          <div className="rating-summary">
            <div className="summary-item">
              <TrendingUp size={18} />
              <div className="summary-content">
                <span className="summary-value">
                  {reviewsCount || 0}
                </span>
                <span className="summary-label">
                  Total Reviews
                </span>
              </div>
            </div>
            
            <div className="summary-item">
              <Star size={18} fill="#FFD700" color="#FFD700" />
              <div className="summary-content">
                <span className="summary-value">
                  {rating?.toFixed(1) || '0.0'}
                </span>
                <span className="summary-label">
                  Average Rating
                </span>
              </div>
            </div>
            
            <div className="summary-item">
              <Users size={18} />
              <div className="summary-content">
                <span className="summary-value">
                  {breakdown ? breakdown[4] + breakdown[3] : 0}
                </span>
                <span className="summary-label">
                  Recommend
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Helper function to calculate rating breakdown from reviews
export const calculateRatingBreakdown = (reviews) => {
  const breakdown = [0, 0, 0, 0, 0]; // 5,4,3,2,1 stars
  
  reviews?.forEach(review => {
    if (review.rating >= 1 && review.rating <= 5) {
      breakdown[5 - review.rating]++; // 5-star index 0, 1-star index 4
    }
  });
  
  return breakdown;
};

// Helper function to calculate average rating
export const calculateAverageRating = (reviews) => {
  if (!reviews || reviews.length === 0) return 0;
  
  const sum = reviews.reduce((total, review) => total + (review.rating || 0), 0);
  return sum / reviews.length;
};

export default RatingDisplay;