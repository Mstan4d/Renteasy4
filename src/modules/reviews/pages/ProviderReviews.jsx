// src/modules/reviews/pages/ProviderReviews.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../../shared/lib/supabaseClient';
import { ArrowLeft, Star, Users, Filter } from 'lucide-react';
import ReviewCard from '../components/ReviewCard';
import RatingDisplay from '../components/RatingDisplay';
import './ProviderReviews.css';

const ProviderReviews = () => {
  const { providerId } = useParams();
  const [provider, setProvider] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ratingFilter, setRatingFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [filteredReviews, setFilteredReviews] = useState([]);

  useEffect(() => {
    fetchProviderAndReviews();
  }, [providerId]);

  useEffect(() => {
    filterAndSort();
  }, [reviews, ratingFilter, sortBy]);

  const fetchProviderAndReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch provider profile
      const { data: providerData, error: providerError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('id', providerId)
        .maybeSingle();

      if (providerError) throw providerError;
      if (!providerData) {
        setError('Provider not found');
        setLoading(false);
        return;
      }
      setProvider(providerData);

      // Fetch reviews for this provider
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select(`
          *,
          user:user_id (full_name, verified)
        `)
        .eq('provider_id', providerId)
        .order('created_at', { ascending: false });

      if (reviewsError) throw reviewsError;
      setReviews(reviewsData || []);
    } catch (err) {
      console.error('Error fetching provider reviews:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Compute stats for RatingDisplay
  const getStats = () => {
    const total = reviews.length;
    if (total === 0) {
      return {
        totalReviews: 0,
        averageRating: 0,
        breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      };
    }
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    const avg = sum / total;
    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => {
      if (r.rating >= 1 && r.rating <= 5) breakdown[r.rating]++;
    });
    return {
      totalReviews: total,
      averageRating: avg,
      breakdown
    };
  };

  const filterAndSort = () => {
    let filtered = [...reviews];

    if (ratingFilter !== 'all') {
      filtered = filtered.filter(r => r.rating === parseInt(ratingFilter));
    }

    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        break;
      case 'highest':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'lowest':
        filtered.sort((a, b) => a.rating - b.rating);
        break;
      default:
        break;
    }
    setFilteredReviews(filtered);
  };

  const handleHelpful = async (reviewId) => {
    // Optional: increment helpful count – you'd need a helpful_count column
    // For now, just show a placeholder
    alert('Helpful feature coming soon');
  };

  const handleReport = (reviewId) => {
    if (window.confirm('Report this review?')) {
      alert('Review reported (feature in progress)');
    }
  };

  const stats = getStats();

  if (loading) return <div className="loading">Loading reviews...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!provider) return <div className="not-found">Provider not found</div>;

  return (
    <div className="provider-reviews">
      <div className="reviews-header">
        <Link to="/marketplace" className="back-link">
          <ArrowLeft size={18} /> Back to Marketplace
        </Link>
        <div className="provider-info">
          <h1>{provider.full_name} Reviews</h1>
          <div className="meta">
            <span><Star size={16} fill="#fbbf24" /> {stats.averageRating.toFixed(1)}</span>
            <span><Users size={16} /> {stats.totalReviews} reviews</span>
          </div>
        </div>
      </div>

      <div className="reviews-content">
        <div className="sidebar">
          <RatingDisplay
            rating={stats.averageRating}
            totalReviews={stats.totalReviews}
            breakdown={stats.breakdown}
            showDetails
          />
          <div className="filters">
            <h3><Filter size={16} /> Filter</h3>
            <select value={ratingFilter} onChange={(e) => setRatingFilter(e.target.value)}>
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Rating</option>
              <option value="lowest">Lowest Rating</option>
            </select>
          </div>
        </div>

        <div className="main">
          {filteredReviews.length === 0 ? (
            <div className="empty">No reviews yet.</div>
          ) : (
            filteredReviews.map(review => (
              <ReviewCard
                key={review.id}
                review={review}
                onHelpful={handleHelpful}
                onReport={handleReport}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ProviderReviews;