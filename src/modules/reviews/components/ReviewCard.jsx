// src/modules/reviews/components/ReviewCard.jsx
import React, { useState } from 'react';
import { Star, ThumbsUp, CheckCircle, Flag } from 'lucide-react';
import { supabase } from '../../../shared/lib/supabaseClient';
import './ReviewCard.css';

const ReviewCard = ({ review, onHelpful, onReport }) => {
  const [helpfulClicked, setHelpfulClicked] = useState(false);
  const [helpfulCount, setHelpfulCount] = useState(review.helpful_count || 0);
  const [updating, setUpdating] = useState(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleHelpful = async () => {
    if (helpfulClicked || updating) return;
    setUpdating(true);
    try {
      // Increment helpful count in database
      const { error } = await supabase
        .from('reviews')
        .update({ helpful_count: helpfulCount + 1 })
        .eq('id', review.id);

      if (error) throw error;

      setHelpfulCount(prev => prev + 1);
      setHelpfulClicked(true);
      if (onHelpful) onHelpful(review.id);
    } catch (err) {
      console.error('Error marking helpful:', err);
    } finally {
      setUpdating(false);
    }
  };

  const handleReport = () => {
    if (window.confirm('Report this review?')) {
      // You could insert into a reports table here
      if (onReport) onReport(review.id);
    }
  };

  return (
    <div className="review-card">
      {/* Header */}
      <div className="review-header">
        <div className="reviewer-info">
          <div className="avatar">
            {review.user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="reviewer-details">
            <div className="reviewer-name">
              {review.user?.full_name || 'Anonymous'}
              {/* Optionally add a verified badge if the user is verified */}
              {review.user?.verified && (
                <span className="verified-badge">
                  <CheckCircle size={12} />
                  Verified
                </span>
              )}
            </div>
            <div className="review-meta">
              <span className="review-date">{formatDate(review.created_at)}</span>
            </div>
          </div>
        </div>

        <div className="review-rating">
          <div className="stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={16}
                fill={star <= review.rating ? "#FFD700" : "none"}
                color={star <= review.rating ? "#FFD700" : "#e5e7eb"}
              />
            ))}
          </div>
          <span className="rating-value">{review.rating}.0</span>
        </div>
      </div>

      {/* Review Content */}
      {review.comment && (
        <div className="review-content">
          <p>{review.comment}</p>
        </div>
      )}

      {/* Footer */}
      <div className="review-footer">
        <div className="review-actions">
          <button
            className={`helpful-btn ${helpfulClicked ? 'clicked' : ''}`}
            onClick={handleHelpful}
            disabled={helpfulClicked || updating}
          >
            <ThumbsUp size={14} />
            Helpful ({helpfulCount})
          </button>

          <button className="report-btn" onClick={handleReport}>
            <Flag size={14} />
            Report
          </button>
        </div>
      </div>

      {/* Provider Response (if exists) */}
      {review.response && (
        <div className="provider-response">
          <div className="response-header">
            <div className="response-avatar">P</div>
            <div className="response-info">
              <div className="responder-name">
                {review.response.providerName || 'Provider'}
                <span className="response-label">Response</span>
              </div>
              <div className="response-date">
                {formatDate(review.response.created_at)}
              </div>
            </div>
          </div>
          <div className="response-content">
            <p>{review.response.text}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewCard;