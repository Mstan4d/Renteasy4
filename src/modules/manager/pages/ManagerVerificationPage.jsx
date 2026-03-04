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

  // Form fields
  const [landlordPhone, setLandlordPhone] = useState('');
  const [priceConfirmed, setPriceConfirmed] = useState(true);
  const [newPrice, setNewPrice] = useState('');
  const [notes, setNotes] = useState('');
  const [images, setImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'manager') {
      navigate('/login');
      return;
    }
    fetchListing();
  }, [listingId, user, navigate]);

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

      // Prefill landlord phone if already provided by tenant
      if (data.landlord_phone) setLandlordPhone(data.landlord_phone);
    } catch (error) {
      console.error('Error fetching listing:', error);
      alert('Listing not found');
      navigate('/dashboard/manager');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!landlordPhone.trim()) {
      alert('Landlord phone number is required');
      return;
    }

    setSubmitting(true);

    try {
      // Upload images (if any)
      const imageUrls = [];
      if (images.length > 0) {
        setUploadingImages(true);
        for (const file of images) {
          const fileName = `verifications/${listingId}/${Date.now()}_${file.name}`;
          const { error: uploadError } = await supabase.storage
            .from('listing-verifications')
            .upload(fileName, file);
          if (uploadError) throw uploadError;

          const { data: urlData } = supabase.storage
            .from('listing-verifications')
            .getPublicUrl(fileName);
          imageUrls.push(urlData.publicUrl);
        }
        setUploadingImages(false);
      }

      // Update listing
      const updates = {
        landlord_phone: landlordPhone,
        price_confirmed: priceConfirmed,
        verification_notes: notes,
        verification_images: imageUrls,
        verification_status: 'pending_admin',
        verification_submitted_at: new Date().toISOString(),
      };
      if (!priceConfirmed && newPrice) {
        updates.price = parseFloat(newPrice);
      }

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
          content: `✅ Manager submitted verification. Awaiting admin confirmation.`,
          is_system: true,
        }]);
      }

      alert('Verification submitted successfully. Admin will contact landlord.');
      navigate('/dashboard/manager');
    } catch (error) {
      console.error('Error submitting verification:', error);
      alert('Failed to submit verification. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading">Loading listing details...</div>;
  if (!listing) return <div className="error">Listing not found</div>;

  return (
    <div className="manager-verification-page">
      <h1>Verify Property</h1>
      <div className="listing-summary">
        <h2>{listing.title}</h2>
        <p><strong>Address:</strong> {listing.address}</p>
        <p><strong>Current Rent:</strong> ₦{listing.price?.toLocaleString()}/year</p>
        {listing.landlord_phone && (
          <p><strong>Landlord Phone (provided by poster):</strong> {listing.landlord_phone}</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="verification-form">
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
        </div>

        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={priceConfirmed}
              onChange={(e) => setPriceConfirmed(e.target.checked)}
            />
            Rent price is correct
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

        <div className="form-group">
          <label htmlFor="notes">Additional Notes</label>
          <textarea
            id="notes"
            rows="4"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any observations, caretaker name, etc."
          />
        </div>

        <div className="form-group">
          <label>Upload Photos (optional)</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => setImages(Array.from(e.target.files))}
          />
          <small>You can upload multiple photos of the property.</small>
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