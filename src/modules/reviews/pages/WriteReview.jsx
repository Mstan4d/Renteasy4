// src/modules/reviews/pages/WriteReview.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../../shared/lib/supabaseClient';
import { useAuth } from '../../../shared/context/AuthContext';
import { Star, ArrowLeft } from 'lucide-react';
import './WriteReview.css';

const WriteReview = () => {
  const { providerId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [provider, setProvider] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [existingReview, setExistingReview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: `/write-review/${providerId}` } });
      return;
    }
    fetchProviderAndExistingReview();
  }, [providerId, user]);

  const fetchProviderAndExistingReview = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Provider ID from URL:', providerId);
      if (!providerId) {
        setError('No provider ID provided in URL');
        setLoading(false);
        return;
      }

      // First, try to fetch from profiles (for service providers and estate firms as profiles)
      const { data: providerData, error: providerError } = await supabase
        .from('profiles')
        .select('id, full_name, role')
        .eq('id', providerId)
        .maybeSingle();

      console.log('Profiles query result:', providerData, providerError);

      if (providerError) throw providerError;

      if (providerData) {
        setProvider(providerData);
      } else {
        // If not found in profiles, try estate_firm_profiles (for estate services)
        const { data: estateFirmData, error: estateError } = await supabase
          .from('estate_firm_profiles')
          .select('id, firm_name')
          .eq('id', providerId)
          .maybeSingle();

        console.log('Estate firm profiles query result:', estateFirmData, estateError);

        if (estateError) throw estateError;
        if (estateFirmData) {
          setProvider({
            id: estateFirmData.id,
            full_name: estateFirmData.firm_name,
            role: 'estate-firm'
          });
        } else {
          setError('Provider not found. Please check the URL and try again.');
          setLoading(false);
          return;
        }
      }

      // Check if user already reviewed this provider
      const { data: existing } = await supabase
        .from('reviews')
        .select('*')
        .eq('provider_id', providerId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) {
        setExistingReview(existing);
        setRating(existing.rating);
        setComment(existing.comment || '');
      }
    } catch (err) {
      console.error('Error fetching provider:', err);
      setError('Failed to load provider. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('reviews')
        .upsert({
          provider_id: providerId,
          user_id: user.id,
          rating,
          comment,
          updated_at: new Date().toISOString()
        }, { onConflict: 'provider_id, user_id' });

      if (error) throw error;

      alert('Review submitted successfully!');
      navigate(`/provider/${providerId}/reviews`);
    } catch (err) {
      console.error('Error submitting review:', err);
      alert('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;
  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!provider) return <div className="error">Provider not found</div>;

  return (
    <div className="write-review">
      <div className="header">
        <button onClick={() => navigate(-1)} className="back-btn">
          <ArrowLeft size={20} />
        </button>
        <h1>{existingReview ? 'Edit Your Review' : 'Write a Review'}</h1>
      </div>

      <div className="provider-info">
        <h2>{provider.full_name}</h2>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="rating-section">
          <label>Your Rating *</label>
          <div className="stars">
            {[1, 2, 3, 4, 5].map(star => (
              <Star
                key={star}
                size={32}
                className={`star ${star <= (hoverRating || rating) ? 'filled' : ''}`}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
              />
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Your Review (optional)</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this provider..."
            rows="5"
          />
        </div>

        <div className="actions">
          <button type="button" onClick={() => navigate(-1)} className="btn-outline">
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default WriteReview;