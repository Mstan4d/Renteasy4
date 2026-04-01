// src/modules/manager/pages/ManagerVerificationPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../shared/lib/supabaseClient';
import './ManagerVerificationPage.css';

const ManagerVerificationPage = () => {
  const { listingId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Form fields - using column names that exist
  const [landlordPhone, setLandlordPhone] = useState('');
  const [priceConfirmed, setPriceConfirmed] = useState(true);
  const [newPrice, setNewPrice] = useState('');
  const [notes, setNotes] = useState('');
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'manager') {
      navigate('/login');
      return;
    }
    fetchListing();
  }, [listingId, user, navigate]);

  // Create image previews
  useEffect(() => {
    const previews = images.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
    
    return () => {
      previews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [images]);

  const fetchListing = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('id', listingId)
        .single();

      if (error) throw error;
      setListing(data);

      // Prefill landlord phone if already provided
      if (data.landlord_phone) setLandlordPhone(data.landlord_phone);
    } catch (error) {
      console.error('Error fetching listing:', error);
      alert('Listing not found');
      navigate('/dashboard/manager');
    } finally {
      setLoading(false);
    }
  };

  const uploadImages = async () => {
    if (images.length === 0) return [];
    
    const uploadedUrls = [];
    setUploadingImages(true);
    
    // Try to use property-images bucket (more likely to exist)
    const bucketName = 'property-images';
    
    for (let i = 0; i < images.length; i++) {
      const file = images[i];
      const fileExt = file.name.split('.').pop();
      const fileName = `verifications/${listingId}/${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`);
      }
      
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);
      
      uploadedUrls.push(urlData.publicUrl);
      setUploadProgress(((i + 1) / images.length) * 100);
    }
    
    setUploadingImages(false);
    return uploadedUrls;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!landlordPhone.trim()) {
      alert('Landlord phone number is required');
      return;
    }

    setSubmitting(true);

    try {
      // Upload images
      const imageUrls = await uploadImages();

      // Prepare updates with only columns that exist
      const updates = {
        landlord_phone: landlordPhone,
        verification_notes: notes,
        verification_images: imageUrls,
        verification_status: 'pending_admin',
        verification_submitted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Only add price_confirmed and price if they exist
      if (typeof priceConfirmed !== 'undefined') {
        updates.price_confirmed = priceConfirmed;
      }
      
      if (!priceConfirmed && newPrice) {
        updates.price = parseFloat(newPrice);
      }

      console.log('Updating listing with:', updates);

      const { error: updateError } = await supabase
        .from('listings')
        .update(updates)
        .eq('id', listingId);

      if (updateError) throw updateError;

      // Add a system message in the associated chat
      const { data: chat } = await supabase
        .from('chats')
        .select('id')
        .eq('listing_id', listingId)
        .maybeSingle();

      if (chat) {
        await supabase.from('messages').insert([{
          chat_id: chat.id,
          sender_id: '00000000-0000-0000-0000-000000000000',
          sender_role: 'system',
          content: `✅ Verification submitted for "${listing?.title}". Awaiting admin confirmation.`,
          is_system_message: true,
          created_at: new Date().toISOString()
        }]);
      }

      alert('Verification submitted successfully! Admin will review and confirm.');
      navigate('/dashboard/manager');
    } catch (error) {
      console.error('Error submitting verification:', error);
      alert(`Failed to submit verification: ${error.message || 'Please try again.'}`);
    } finally {
      setSubmitting(false);
      setUploadProgress(0);
    }
  };

  if (loading) return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Loading listing details...</p>
    </div>
  );
  
  if (!listing) return (
    <div className="error-container">
      <h2>Listing Not Found</h2>
      <button onClick={() => navigate('/dashboard/manager')}>Back to Dashboard</button>
    </div>
  );

  return (
    <div className="manager-verification-page">
      <div className="page-header">
        <h1>🏠 Verify Property</h1>
        <p>Complete this verification to confirm property details</p>
      </div>

      <div className="listing-summary">
        <h2>{listing.title}</h2>
        <div className="summary-grid">
          <div className="summary-item">
            <span className="label">Address:</span>
            <span className="value">{listing.address}</span>
          </div>
          <div className="summary-item">
            <span className="label">Current Rent:</span>
            <span className="value price">₦{listing.price?.toLocaleString()}/year</span>
          </div>
          {listing.landlord_phone && (
            <div className="summary-item">
              <span className="label">Landlord Phone (provided):</span>
              <span className="value">{listing.landlord_phone}</span>
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="verification-form">
        <div className="form-section">
          <h3>Contact Information</h3>
          <div className="form-group">
            <label htmlFor="landlordPhone">Landlord's Phone Number *</label>
            <input
              type="tel"
              id="landlordPhone"
              value={landlordPhone}
              onChange={(e) => setLandlordPhone(e.target.value)}
              placeholder="e.g., 08012345678"
              required
            />
            <small>This will be used to confirm verification</small>
          </div>
        </div>

        <div className="form-section">
          <h3>Pricing Verification</h3>
          <div className="checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={priceConfirmed}
                onChange={(e) => setPriceConfirmed(e.target.checked)}
              />
              <span>Rent price is correct</span>
            </label>
          </div>

          {!priceConfirmed && (
            <div className="form-group">
              <label htmlFor="newPrice">Correct Rent Amount (₦/year)</label>
              <input
                type="number"
                id="newPrice"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                placeholder="e.g., 1800000"
                required={!priceConfirmed}
              />
            </div>
          )}
        </div>

        <div className="form-section">
          <h3>Additional Details</h3>
          <div className="form-group">
            <label htmlFor="notes">Notes / Observations</label>
            <textarea
              id="notes"
              rows="4"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any observations, caretaker name, condition notes, etc."
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Verification Photos</h3>
          <div className="file-upload-area">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setImages(Array.from(e.target.files))}
              id="verification-images"
              style={{ display: 'none' }}
            />
            <label htmlFor="verification-images" className="upload-label">
              <span className="upload-icon">📸</span>
              <span>Click to upload photos</span>
              <small>Upload photos of the property (optional)</small>
            </label>
            {imagePreviews.length > 0 && (
              <div className="image-previews">
                {imagePreviews.map((preview, idx) => (
                  <div key={idx} className="preview-item">
                    <img src={preview} alt={`Preview ${idx + 1}`} />
                    <button 
                      type="button" 
                      className="remove-image"
                      onClick={() => setImages(prev => prev.filter((_, i) => i !== idx))}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          {uploadingImages && (
            <div className="upload-progress">
              <div className="progress-bar" style={{ width: `${uploadProgress}%` }}></div>
              <span>Uploading images... {Math.round(uploadProgress)}%</span>
            </div>
          )}
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={submitting || uploadingImages}>
            {submitting ? 'Submitting...' : 'Submit Verification'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ManagerVerificationPage;