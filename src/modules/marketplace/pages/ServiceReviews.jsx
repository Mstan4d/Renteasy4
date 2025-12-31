// src/modules/marketplace/pages/ServiceReviews.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Star, Filter, Search, TrendingUp,
  MessageSquare, Users, CheckCircle
} from 'lucide-react';
import ReviewCard from '../../reviews/components/ReviewCard';
import RatingDisplay, { calculateRatingBreakdown, calculateAverageRating } from '../../reviews/components/RatingDisplay';
import '../pages/Marketplace.css';

const ServiceReviews = () => {
  const { serviceId } = useParams();
  const [service, setService] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [ratingFilter, setRatingFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    loadServiceAndReviews();
  }, [serviceId]);

  useEffect(() => {
    filterAndSortReviews();
  }, [reviews, ratingFilter, sortBy]);

  const loadServiceAndReviews = () => {
    try {
      // Load service
      const services = JSON.parse(localStorage.getItem('providerServices') || '[]');
      const foundService = services.find(s => s.id === serviceId);
      setService(foundService);

      // Load provider
      const providers = JSON.parse(localStorage.getItem('serviceProviders') || '[]');
      const provider = providers.find(p => p.id === foundService?.providerId);
      
      if (foundService && provider) {
        // Load reviews for this provider
        const allReviews = JSON.parse(localStorage.getItem('providerReviews') || '[]');
        const serviceReviews = allReviews.filter(review => 
          review.providerId === foundService.providerId &&
          review.serviceUsed === foundService.title
        );
        
        setReviews(serviceReviews);
        setFilteredReviews(serviceReviews);
      }
    } catch (error) {
      console.error('Error loading service reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortReviews = () => {
    let filtered = reviews.filter(review => {
      if (ratingFilter !== 'all' && review.rating !== parseInt(ratingFilter)) {
        return false;
      }
      return true;
    });

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
    
    const recommendedReviews = reviews.filter(r => r.recommend).length;
    const recommendationRate = totalReviews > 0
      ? Math.round((recommendedReviews / totalReviews) * 100)
      : 0;

    return {
      totalReviews,
      averageRating,
      ratingBreakdown,
      recommendationRate
    };
  };

  const handleHelpful = (reviewId) => {
    setReviews(prev => prev.map(review => 
      review.id === reviewId 
        ? { ...review, helpfulCount: (review.helpfulCount || 0) + 1 }
        : review
    ));
  };

  const handleReport = (reviewId) => {
    if (window.confirm('Report this review?')) {
      const allReviews = JSON.parse(localStorage.getItem('providerReviews') || '[]');
      const reviewIndex = allReviews.findIndex(r => r.id === reviewId);
      
      if (reviewIndex !== -1) {
        allReviews[reviewIndex].reported = true;
        localStorage.setItem('providerReviews', JSON.stringify(allReviews));
        alert('Review reported.');
      }
    }
  };

  const stats = getReviewStats();

  if (loading) {
    return (
      <div className="service-reviews-loading">
        <div className="loading-spinner"></div>
        <p>Loading reviews...</p>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="service-not-found">
        <h2>Service not found</h2>
        <p>The service you're looking for doesn't exist.</p>
        <Link to="/services" className="btn btn-primary">
          <ArrowLeft size={16} />
          Back to Services
        </Link>
      </div>
    );
  }

  return (
    <div className="service-reviews">
      <div className="reviews-header">
        <Link to={`/services`} className="back-link">
          <ArrowLeft size={18} />
          Back to Services
        </Link>
        
        <div className="service-info">
          <h1>{service.title} Reviews</h1>
          <div className="service-meta">
            <div className="meta-item">
              <Star size={16} fill="#fbbf24" color="#fbbf24" />
              <span>{stats.averageRating.toFixed(1)}</span>
            </div>
            <div className="meta-item">
              <Users size={16} />
              <span>{stats.totalReviews} reviews</span>
            </div>
            <div className="meta-item">
              <CheckCircle size={16} color="#10b981" />
              <span>{stats.recommendationRate}% recommend</span>
            </div>
          </div>
        </div>
      </div>

      <div className="reviews-content">
        {/* Left Sidebar */}
        <div className="reviews-sidebar">
          <div className="rating-card">
            <RatingDisplay
              rating={stats.averageRating}
              reviewsCount={stats.totalReviews}
              breakdown={stats.ratingBreakdown}
              showDetails={true}
            />
          </div>

          <div className="filters-card">
            <h3>
              <Filter size={16} />
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
          </div>

          <div className="cta-card">
            <h3>Share Your Experience</h3>
            <p>Used this service? Help others by sharing your review.</p>
            <Link 
              to={`/services/${serviceId}/write-review`}
              className="btn btn-primary"
            >
              <MessageSquare size={16} />
              Write a Review
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="reviews-main">
          {filteredReviews.length === 0 ? (
            <div className="empty-reviews">
              <div className="empty-icon">📝</div>
              <h3>No reviews yet</h3>
              <p>Be the first to review this service!</p>
              <Link 
                to={`/services/${serviceId}/write-review`}
                className="btn btn-primary"
              >
                <MessageSquare size={16} />
                Write First Review
              </Link>
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
  );
};

export default ServiceReviews;