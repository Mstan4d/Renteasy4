// src/modules/providers/pages/ProviderReviews.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import {
  Star, Filter, Search, TrendingUp, MessageSquare,
  Download, AlertCircle, CheckCircle, XCircle
} from 'lucide-react';
import ReviewForm from '../../reviews/components/ReviewForm';
import ReviewCard from '../../reviews/components/ReviewCard';
import RatingDisplay, { calculateRatingBreakdown, calculateAverageRating } from '../../reviews/components/RatingDisplay';
import './ProviderReviews.css';

const ProviderReviews = () => {
  const { providerId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [provider, setProvider] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all'); // all, 5, 4, 3, 2, 1
  const [sortBy, setSortBy] = useState('newest'); // newest, helpful, highest, lowest
  const [hasResponseFilter, setHasResponseFilter] = useState('all'); // all, responded, not_responded
  
  useEffect(() => {
    loadReviews();
  }, [providerId]);
  
  useEffect(() => {
    filterAndSortReviews();
  }, [reviews, searchTerm, ratingFilter, sortBy, hasResponseFilter]);
  
  const loadReviews = () => {
    try {
      // Load provider info
      const providers = JSON.parse(localStorage.getItem('serviceProviders') || '[]');
      const foundProvider = providers.find(p => p.id === providerId);
      setProvider(foundProvider);
      
      // Load reviews
      const allReviews = JSON.parse(localStorage.getItem('providerReviews') || '[]');
      const providerReviews = allReviews.filter(review => review.providerId === providerId);
      setReviews(providerReviews);
      setFilteredReviews(providerReviews);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const filterAndSortReviews = () => {
    let filtered = reviews.filter(review => {
      // Filter by rating
      if (ratingFilter !== 'all' && review.rating !== parseInt(ratingFilter)) {
        return false;
      }
      
      // Filter by response
      if (hasResponseFilter === 'responded' && !review.response) {
        return false;
      }
      if (hasResponseFilter === 'not_responded' && review.response) {
        return false;
      }
      
      // Filter by search term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        return (
          review.comment.toLowerCase().includes(term) ||
          review.title?.toLowerCase().includes(term) ||
          review.userName?.toLowerCase().includes(term)
        );
      }
      
      return true;
    });
    
    // Sort reviews
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'highest':
          return b.rating - a.rating;
        case 'lowest':
          return a.rating - b.rating;
        case 'helpful':
          return (b.helpfulCount || 0) - (a.helpfulCount || 0);
        default:
          return 0;
      }
    });
    
    setFilteredReviews(filtered);
  };
  
  const getReviewStats = () => {
    const totalReviews = reviews.length;
    const averageRating = calculateAverageRating(reviews);
    const ratingBreakdown = calculateRatingBreakdown(reviews);
    
    // Calculate response rate
    const respondedReviews = reviews.filter(r => r.response).length;
    const responseRate = totalReviews > 0 
      ? Math.round((respondedReviews / totalReviews) * 100)
      : 0;
    
    // Calculate recommendation rate
    const recommendedReviews = reviews.filter(r => r.recommend).length;
    const recommendationRate = totalReviews > 0
      ? Math.round((recommendedReviews / totalReviews) * 100)
      : 0;
    
    return {
      totalReviews,
      averageRating,
      ratingBreakdown,
      responseRate,
      recommendationRate
    };
  };
  
  const handleReviewSubmit = (newReview) => {
    setReviews(prev => [newReview, ...prev]);
    setShowReviewForm(false);
    loadReviews(); // Reload to update stats
  };
  
  const handleHelpful = (reviewId) => {
    // Update local state
    setReviews(prev => prev.map(review => 
      review.id === reviewId 
        ? { ...review, helpfulCount: (review.helpfulCount || 0) + 1 }
        : review
    ));
  };
  
  const handleReport = (reviewId) => {
    if (window.confirm('Report this review? This will flag it for our moderation team.')) {
      // Update review status
      const allReviews = JSON.parse(localStorage.getItem('providerReviews') || '[]');
      const reviewIndex = allReviews.findIndex(r => r.id === reviewId);
      
      if (reviewIndex !== -1) {
        allReviews[reviewIndex].reported = true;
        allReviews[reviewIndex].reportedAt = new Date().toISOString();
        localStorage.setItem('providerReviews', JSON.stringify(allReviews));
        
        alert('Review reported. Thank you for your feedback.');
      }
    }
  };
  
  const exportReviews = () => {
    const data = filteredReviews.map(review => ({
      Date: new Date(review.createdAt).toLocaleDateString(),
      Rating: review.rating,
      Title: review.title || '',
      Review: review.comment,
      Service: review.serviceUsed || '',
      Recommends: review.recommend ? 'Yes' : 'No',
      Helpful: review.helpfulCount || 0,
      Response: review.response ? 'Yes' : 'No'
    }));
    
    const csv = [
      Object.keys(data[0] || {}).join(','),
      ...data.map(row => Object.values(row).map(value => 
        `"${value?.toString().replace(/"/g, '""') || ''}"`
      ).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${provider?.businessName}-reviews.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };
  
  const stats = getReviewStats();
  
  if (loading) {
    return (
      <div className="reviews-loading">
        <div className="loading-spinner"></div>
        <p>Loading reviews...</p>
      </div>
    );
  }
  
  return (
    <div className="provider-reviews">
      <div className="reviews-container">
        {/* Header */}
        <div className="reviews-header">
          <div className="header-content">
            <h1>
              <Star size={24} />
              Customer Reviews
            </h1>
            <p className="subtitle">
              {provider?.businessName} - {stats.totalReviews} reviews
            </p>
          </div>
          
          <div className="header-actions">
            <button
              className="btn btn-secondary"
              onClick={exportReviews}
              disabled={filteredReviews.length === 0}
            >
              <Download size={18} />
              Export
            </button>
            
            <button
              className="btn btn-primary"
              onClick={() => setShowReviewForm(true)}
            >
              <MessageSquare size={18} />
              Write a Review
            </button>
          </div>
        </div>
        
        {/* Stats Overview */}
        <div className="reviews-stats">
          <div className="stats-card">
            <h3>Review Summary</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-icon" style={{ backgroundColor: '#3b82f620' }}>
                  <Star size={20} color="#3b82f6" />
                </div>
                <div className="stat-content">
                  <span className="stat-value">{stats.averageRating.toFixed(1)}</span>
                  <span className="stat-label">Average Rating</span>
                </div>
              </div>
              
              <div className="stat-item">
                <div className="stat-icon" style={{ backgroundColor: '#10b98120' }}>
                  <MessageSquare size={20} color="#10b981" />
                </div>
                <div className="stat-content">
                  <span className="stat-value">{stats.totalReviews}</span>
                  <span className="stat-label">Total Reviews</span>
                </div>
              </div>
              
              <div className="stat-item">
                <div className="stat-icon" style={{ backgroundColor: '#8b5cf620' }}>
                  <TrendingUp size={20} color="#8b5cf6" />
                </div>
                <div className="stat-content">
                  <span className="stat-value">{stats.recommendationRate}%</span>
                  <span className="stat-label">Recommend</span>
                </div>
              </div>
              
              <div className="stat-item">
                <div className="stat-icon" style={{ backgroundColor: '#f59e0b20' }}>
                  <CheckCircle size={20} color="#f59e0b" />
                </div>
                <div className="stat-content">
                  <span className="stat-value">{stats.responseRate}%</span>
                  <span className="stat-label">Response Rate</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="reviews-content">
          {/* Left Sidebar - Rating Display & Filters */}
          <div className="reviews-sidebar">
            {/* Rating Display */}
            <div className="rating-display-card">
              <RatingDisplay
                rating={stats.averageRating}
                reviewsCount={stats.totalReviews}
                breakdown={stats.ratingBreakdown}
                showDetails={true}
              />
            </div>
            
            {/* Filters */}
            <div className="filters-card">
              <h3>
                <Filter size={18} />
                Filter Reviews
              </h3>
              
              <div className="filter-group">
                <label>Rating</label>
                <select
                  value={ratingFilter}
                  onChange={(e) => setRatingFilter(e.target.value)}
                >
                  <option value="all">All Ratings</option>
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars</option>
                  <option value="1">1 Star</option>
                </select>
              </div>
              
              <div className="filter-group">
                <label>Response</label>
                <select
                  value={hasResponseFilter}
                  onChange={(e) => setHasResponseFilter(e.target.value)}
                >
                  <option value="all">All Reviews</option>
                  <option value="responded">With Response</option>
                  <option value="not_responded">Without Response</option>
                </select>
              </div>
              
              <div className="filter-group">
                <label>Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="highest">Highest Rating</option>
                  <option value="lowest">Lowest Rating</option>
                  <option value="helpful">Most Helpful</option>
                </select>
              </div>
              
              <button
                className="btn btn-secondary btn-small"
                onClick={() => {
                  setSearchTerm('');
                  setRatingFilter('all');
                  setSortBy('newest');
                  setHasResponseFilter('all');
                }}
              >
                Clear All Filters
              </button>
            </div>
            
            {/* Review Guidelines */}
            <div className="guidelines-card">
              <h4>
                <AlertCircle size={16} />
                Review Guidelines
              </h4>
              <ul>
                <li>Reviews must be based on actual experience</li>
                <li>Be respectful and constructive</li>
                <li>No personal information or offensive language</li>
                <li>Focus on service quality and professionalism</li>
                <li>Provider responses must be professional</li>
              </ul>
            </div>
          </div>
          
          {/* Main Content - Reviews List */}
          <div className="reviews-main">
            {/* Search Bar */}
            <div className="search-bar">
              <Search size={18} color="#9ca3af" />
              <input
                type="text"
                placeholder="Search reviews..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className="results-count">
                {filteredReviews.length} review{filteredReviews.length !== 1 ? 's' : ''} found
              </span>
            </div>
            
            {/* Reviews List */}
            {filteredReviews.length === 0 ? (
              <div className="empty-reviews">
                <div className="empty-icon">📝</div>
                <h3>No reviews found</h3>
                <p>
                  {reviews.length === 0 
                    ? "This provider doesn't have any reviews yet. Be the first to share your experience!"
                    : "No reviews match your current filters. Try adjusting your search criteria."}
                </p>
                {reviews.length === 0 && (
                  <button
                    className="btn btn-primary"
                    onClick={() => setShowReviewForm(true)}
                  >
                    <MessageSquare size={18} />
                    Write First Review
                  </button>
                )}
              </div>
            ) : (
              <div className="reviews-list">
                {filteredReviews.map(review => (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    onHelpful={handleHelpful}
                    onReport={handleReport}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Review Form Modal */}
      {showReviewForm && (
        <div className="review-form-modal">
          <div className="modal-content">
            <ReviewForm
              providerId={providerId}
              providerName={provider?.businessName}
              onSubmit={handleReviewSubmit}
              onCancel={() => setShowReviewForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderReviews;