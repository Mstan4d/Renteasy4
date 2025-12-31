// src/modules/reviews/components/ReviewForm.jsx
import React, { useState } from 'react';
import { useAuth } from '../../../shared/context/AuthContext';
import { Star, MessageSquare, Image as ImageIcon, Send, X } from 'lucide-react';
import './ReviewForm.css';

const ReviewForm = ({ providerId, providerName, onSubmit, onCancel }) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    comment: '',
    images: [],
    serviceUsed: '',
    recommend: true,
    anonymous: false
  });
  const [loading, setLoading] = useState(false);
  const [imagePreviews, setImagePreviews] = useState([]);

  const ratingLabels = [
    'Very Poor',
    'Poor',
    'Average',
    'Good',
    'Excellent'
  ];

  const serviceTypes = [
    'Property Management',
    'Maintenance',
    'Cleaning',
    'Legal Services',
    'Financial Services',
    'Security',
    'Landscaping',
    'Interior Design',
    'Moving Services',
    'Other'
  ];

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + imagePreviews.length > 5) {
      alert('Maximum 5 images allowed');
      return;
    }

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result]);
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, file]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }
    
    if (formData.comment.trim().length < 10) {
      alert('Please write a review with at least 10 characters');
      return;
    }

    setLoading(true);

    try {
      const review = {
        id: `REV-${Date.now()}`,
        providerId,
        providerName,
        userId: user?.id,
        userName: formData.anonymous ? 'Anonymous' : user?.name || user?.email?.split('@')[0],
        userEmail: user?.email,
        rating,
        title: formData.title,
        comment: formData.comment,
        serviceUsed: formData.serviceUsed,
        recommend: formData.recommend,
        anonymous: formData.anonymous,
        images: imagePreviews,
        verifiedPurchase: true, // You can track this from your lead system
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        helpfulCount: 0,
        response: null
      };

      // Save to localStorage
      const reviews = JSON.parse(localStorage.getItem('providerReviews') || '[]');
      reviews.push(review);
      localStorage.setItem('providerReviews', JSON.stringify(reviews));

      // Update provider's average rating
      updateProviderRating(providerId, rating);

      // Show success message
      alert('Thank you for your review!');
      
      if (onSubmit) {
        onSubmit(review);
      }

      // Reset form
      setRating(0);
      setFormData({
        title: '',
        comment: '',
        images: [],
        serviceUsed: '',
        recommend: true,
        anonymous: false
      });
      setImagePreviews([]);

    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateProviderRating = (providerId, newRating) => {
    try {
      const providers = JSON.parse(localStorage.getItem('serviceProviders') || '[]');
      const providerIndex = providers.findIndex(p => p.id === providerId);
      
      if (providerIndex !== -1) {
        const provider = providers[providerIndex];
        const currentReviews = provider.reviews || [];
        const totalReviews = currentReviews.length + 1;
        const currentAverage = provider.rating || 0;
        
        // Calculate new average
        const newAverage = ((currentAverage * currentReviews.length) + newRating) / totalReviews;
        
        providers[providerIndex] = {
          ...provider,
          rating: parseFloat(newAverage.toFixed(1)),
          reviews: totalReviews,
          lastReviewDate: new Date().toISOString()
        };
        
        localStorage.setItem('serviceProviders', JSON.stringify(providers));
      }
    } catch (error) {
      console.error('Error updating provider rating:', error);
    }
  };

  return (
    <div className="review-form-container">
      <div className="review-form-header">
        <h3>Write a Review</h3>
        <p className="subtitle">Share your experience with {providerName}</p>
        {onCancel && (
          <button className="close-btn" onClick={onCancel}>
            <X size={20} />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="review-form">
        {/* Overall Rating */}
        <div className="rating-section">
          <label className="section-label">
            Overall Rating *
            <span className="rating-value">
              {rating > 0 ? rating : 'Select'}
            </span>
          </label>
          
          <div className="star-rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="star-btn"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
              >
                <Star
                  size={32}
                  fill={
                    star <= (hoverRating || rating)
                      ? "#FFD700"
                      : "none"
                  }
                  color={
                    star <= (hoverRating || rating)
                      ? "#FFD700"
                      : "#e5e7eb"
                  }
                />
              </button>
            ))}
          </div>
          
          <div className="rating-label">
            {rating > 0 && (
              <span className="label-text">
                {ratingLabels[rating - 1]}
              </span>
            )}
          </div>
        </div>

        {/* Review Title */}
        <div className="form-group">
          <label>Review Title (Optional)</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            placeholder="Summarize your experience in a few words"
            maxLength={100}
          />
        </div>

        {/* Service Used */}
        <div className="form-group">
          <label>Service You Used *</label>
          <select
            value={formData.serviceUsed}
            onChange={(e) => setFormData({...formData, serviceUsed: e.target.value})}
            required
          >
            <option value="">Select service</option>
            {serviceTypes.map(service => (
              <option key={service} value={service}>{service}</option>
            ))}
          </select>
        </div>

        {/* Review Comment */}
        <div className="form-group">
          <label>
            Your Review *
            <span className="char-count">
              {formData.comment.length}/500
            </span>
          </label>
          <textarea
            value={formData.comment}
            onChange={(e) => setFormData({...formData, comment: e.target.value})}
            placeholder="Share details of your experience. What did you like? What could be improved?"
            rows={5}
            maxLength={500}
            required
          />
          <small className="hint">
            Include specifics about the service quality, timeliness, communication, and value.
          </small>
        </div>

        {/* Image Upload */}
        <div className="form-group">
          <label>
            <ImageIcon size={16} />
            Upload Photos (Optional)
          </label>
          <div className="image-upload-section">
            <div className="image-preview-grid">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="image-preview">
                  <img src={preview} alt={`Review ${index + 1}`} />
                  <button
                    type="button"
                    className="remove-image-btn"
                    onClick={() => removeImage(index)}
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              
              {imagePreviews.length < 5 && (
                <label className="upload-image-btn">
                  <ImageIcon size={20} />
                  <span>Add Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    hidden
                  />
                </label>
              )}
            </div>
            <small>Upload up to 5 photos (JPEG, PNG, max 5MB each)</small>
          </div>
        </div>

        {/* Additional Options */}
        <div className="additional-options">
          <label className="checkbox-option">
            <input
              type="checkbox"
              checked={formData.recommend}
              onChange={(e) => setFormData({...formData, recommend: e.target.checked})}
            />
            <span className="checkmark"></span>
            <span className="option-text">I recommend this provider</span>
          </label>
          
          <label className="checkbox-option">
            <input
              type="checkbox"
              checked={formData.anonymous}
              onChange={(e) => setFormData({...formData, anonymous: e.target.checked})}
            />
            <span className="checkmark"></span>
            <span className="option-text">Post anonymously</span>
          </label>
        </div>

        {/* Submit Button */}
        <div className="form-actions">
          {onCancel && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </button>
          )}
          
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || rating === 0 || formData.comment.trim().length < 10}
          >
            {loading ? (
              'Submitting...'
            ) : (
              <>
                <Send size={16} />
                Submit Review
              </>
            )}
          </button>
        </div>

        {/* Review Guidelines */}
        <div className="review-guidelines">
          <h4>Review Guidelines</h4>
          <ul>
            <li>Be honest and objective about your experience</li>
            <li>Focus on the service quality and professionalism</li>
            <li>Do not include personal information</li>
            <li>Do not use offensive language</li>
            <li>Reviews must be based on actual experience</li>
          </ul>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;