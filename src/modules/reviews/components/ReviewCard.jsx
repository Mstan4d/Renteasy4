// src/modules/reviews/components/ReviewCard.jsx
import React, { useState } from 'react';
import { Star, ThumbsUp, MessageSquare, CheckCircle, Flag } from 'lucide-react';
import './ReviewCard.css';

const ReviewCard = ({ review, onHelpful, onReport }) => {
  const [helpfulClicked, setHelpfulClicked] = useState(false);
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [response, setResponse] = useState('');
  const [submittingResponse, setSubmittingResponse] = useState(false);

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

  const handleHelpful = () => {
    if (!helpfulClicked) {
      setHelpfulClicked(true);
      // Update in localStorage
      const reviews = JSON.parse(localStorage.getItem('providerReviews') || '[]');
      const reviewIndex = reviews.findIndex(r => r.id === review.id);
      
      if (reviewIndex !== -1) {
        reviews[reviewIndex].helpfulCount = (reviews[reviewIndex].helpfulCount || 0) + 1;
        localStorage.setItem('providerReviews', JSON.stringify(reviews));
      }
      
      if (onHelpful) {
        onHelpful(review.id);
      }
    }
  };

  const handleSubmitResponse = async (e) => {
    e.preventDefault();
    if (!response.trim()) return;
    
    setSubmittingResponse(true);
    
    try {
      // Update review with response
      const reviews = JSON.parse(localStorage.getItem('providerReviews') || '[]');
      const reviewIndex = reviews.findIndex(r => r.id === review.id);
      
      if (reviewIndex !== -1) {
        reviews[reviewIndex].response = {
          text: response,
          date: new Date().toISOString(),
          providerName: 'Provider Response'
        };
        
        localStorage.setItem('providerReviews', JSON.stringify(reviews));
        
        setShowResponseForm(false);
        setResponse('');
        alert('Response submitted successfully!');
      }
    } catch (error) {
      console.error('Error submitting response:', error);
      alert('Failed to submit response');
    } finally {
      setSubmittingResponse(false);
    }
  };

  return (
    <div className="review-card">
      {/* Review Header */}
      <div className="review-header">
        <div className="reviewer-info">
          <div className="avatar">
            {review.anonymous ? 'A' : review.userName?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="reviewer-details">
            <div className="reviewer-name">
              {review.anonymous ? 'Anonymous' : review.userName}
              {review.verifiedPurchase && (
                <span className="verified-badge">
                  <CheckCircle size={12} />
                  Verified Client
                </span>
              )}
            </div>
            <div className="review-meta">
              <span className="review-date">
                {formatDate(review.createdAt)}
              </span>
              {review.serviceUsed && (
                <>
                  <span className="meta-separator">•</span>
                  <span className="service-used">
                    {review.serviceUsed}
                  </span>
                </>
              )}
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

      {/* Review Title */}
      {review.title && (
        <h4 className="review-title">{review.title}</h4>
      )}

      {/* Review Content */}
      <div className="review-content">
        <p>{review.comment}</p>
        
        {/* Images */}
        {review.images && review.images.length > 0 && (
          <div className="review-images">
            {review.images.map((image, index) => (
              <div key={index} className="review-image">
                <img src={image} alt={`Review ${index + 1}`} />
              </div>
            ))}
          </div>
        )}

        {/* Recommendation */}
        {review.recommend !== undefined && (
          <div className="recommendation">
            {review.recommend ? (
              <span className="recommended">✓ Recommended</span>
            ) : (
              <span className="not-recommended">✗ Not Recommended</span>
            )}
          </div>
        )}
      </div>

      {/* Review Footer */}
      <div className="review-footer">
        <div className="review-actions">
          <button
            className={`helpful-btn ${helpfulClicked ? 'clicked' : ''}`}
            onClick={handleHelpful}
            disabled={helpfulClicked}
          >
            <ThumbsUp size={14} />
            Helpful ({review.helpfulCount || 0})
          </button>
          
          <button
            className="report-btn"
            onClick={() => onReport && onReport(review.id)}
          >
            <Flag size={14} />
            Report
          </button>
        </div>

        <div className="review-stats">
          <span className="review-id">Review #{review.id.substring(0, 8)}</span>
        </div>
      </div>

      {/* Provider Response */}
      {review.response ? (
        <div className="provider-response">
          <div className="response-header">
            <div className="response-avatar">P</div>
            <div className="response-info">
              <div className="responder-name">
                {review.response.providerName}
                <span className="response-label">Provider Response</span>
              </div>
              <div className="response-date">
                {formatDate(review.response.date)}
              </div>
            </div>
          </div>
          <div className="response-content">
            <p>{review.response.text}</p>
          </div>
        </div>
      ) : (
        // Response Form (for provider)
        showResponseForm && (
          <form className="response-form" onSubmit={handleSubmitResponse}>
            <div className="form-group">
              <label>Write a response</label>
              <textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="Thank the client for their review or address their concerns..."
                rows={3}
                required
              />
            </div>
            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary btn-small"
                onClick={() => setShowResponseForm(false)}
                disabled={submittingResponse}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary btn-small"
                disabled={submittingResponse || !response.trim()}
              >
                {submittingResponse ? 'Submitting...' : 'Submit Response'}
              </button>
            </div>
          </form>
        )
      )}
    </div>
  );
};

export default ReviewCard;