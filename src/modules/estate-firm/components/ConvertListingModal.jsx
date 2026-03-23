import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Upload, AlertCircle, DollarSign, Check } from 'lucide-react';
import { supabase } from '../../../shared/lib/supabaseClient';
import { useAuth } from '../../../shared/context/AuthContext';
import './ConvertListingModal.css';

const ConvertListingModal = ({ listing, estateFirmId, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [extraFees, setExtraFees] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [existingPropertyId, setExistingPropertyId] = useState(listing.property_id || '');

  // Load existing data from the listing
  useEffect(() => {
    setExtraFees(listing.extra_fees || []);
    const existingImages = (listing.images || []).map((url, idx) => ({
      url,
      preview: url,
      name: `image-${idx}`,
      needsUpload: false,
    }));
    setImages(existingImages);
  }, [listing]);

  const formatPrice = (price) => {
    if (!price || isNaN(price)) return '0';
    return price.toLocaleString();
  };

  const addFee = () => {
    setExtraFees([...extraFees, { name: '', amount: 0, description: '' }]);
  };

  const updateFee = (index, field, value) => {
    const updated = [...extraFees];
    updated[index] = { ...updated[index], [field]: value };
    setExtraFees(updated);
  };

  const removeFee = (index) => {
    setExtraFees(extraFees.filter((_, i) => i !== index));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = [];
    for (const file of files) {
      const objectUrl = URL.createObjectURL(file);
      newImages.push({
        file,
        preview: objectUrl,
        name: file.name,
        size: file.size,
        needsUpload: true
      });
    }
    setImages([...images, ...newImages]);
  };

  const removeImage = (index) => {
    const newImages = [...images];
    if (newImages[index].preview?.startsWith('blob:')) {
      URL.revokeObjectURL(newImages[index].preview);
    }
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const uploadImagesToStorage = async (listingId) => {
    const uploadedUrls = [];
    for (const img of images) {
      if (img.url && !img.needsUpload) {
        uploadedUrls.push(img.url);
        continue;
      }
      if (img.file) {
        const fileExt = img.file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const filePath = `listings/${listingId}/${fileName}`;
        const { error: uploadError } = await supabase.storage
          .from('property-images')
          .upload(filePath, img.file);
        if (!uploadError) {
          const { data: urlData } = supabase.storage.from('property-images').getPublicUrl(filePath);
          uploadedUrls.push(urlData.publicUrl);
        }
      }
    }
    return uploadedUrls;
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      let propertyId = existingPropertyId;
      if (!propertyId) {
        // Create property with both name and title (if table has both)
        const propertyData = {
          estate_firm_id: estateFirmId,
          landlord_id: listing.landlord_id || null, // may be required; if null, FK may fail
          name: listing.title || 'Property',
          title: listing.title || 'Property', // <-- add title to satisfy NOT NULL
          address: listing.address,
          city: listing.city,
          state: listing.state,
          lga: listing.lga,
          property_type: listing.property_type,
          status: 'active',
          created_at: new Date().toISOString()
        };
        const { data: property, error: propError } = await supabase
          .from('properties')
          .insert(propertyData)
          .select()
          .single();
        if (propError) throw propError;
        propertyId = property.id;
      }

      // Create unit
      const { data: unit, error: unitError } = await supabase
        .from('units')
        .insert({
          property_id: propertyId,
          unit_number: '1',
          rent_amount: listing.price || 0,
          rent_frequency: listing.rent_frequency || 'yearly',
          status: 'vacant',
          source: 'renteasy',
          listing_id: listing.id,
          created_at: new Date().toISOString()
        })
        .select()
        .single();
      if (unitError) throw unitError;

      // Update listing
      const updateData = {
        unit_id: unit.id,
        converted_at: new Date().toISOString(),
        extra_fees: extraFees,
        status: 'rented',
      };

      let imageUrls = [];
      if (images.length > 0) {
        imageUrls = await uploadImagesToStorage(listing.id);
        if (imageUrls.length > 0) {
          updateData.images = imageUrls;
        }
      }

      const { error: updateError } = await supabase
        .from('listings')
        .update(updateData)
        .eq('id', listing.id);
      if (updateError) throw updateError;

      await supabase.from('activities').insert({
        user_id: user?.id,
        type: 'listing',
        action: 'convert',
        description: `Converted listing "${listing.title}" to unit`,
        created_at: new Date().toISOString()
      });

      onSuccess(unit);
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to convert listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Convert Listing to Unit</h2>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="modal-body">
          <div className="listing-preview">
            <h3>{listing.title || 'Untitled Listing'}</h3>
            <p className="address">{listing.address || 'No address'}</p>
            <div className="price-tag">
              <DollarSign size={16} />
              <span>₦{formatPrice(listing.price)}/year</span>
            </div>
          </div>

          <div className="conversion-info">
            <AlertCircle size={20} className="info-icon" />
            <p>After conversion, you can add a tenant and start tracking rent payments.</p>
          </div>

          <div className="form-group">
            <label>Property (optional)</label>
            <select
              className="form-select"
              value={existingPropertyId}
              onChange={(e) => setExistingPropertyId(e.target.value)}
            >
              <option value="">Create new property</option>
            </select>
            <small className="hint">Select an existing property or create a new one</small>
          </div>

          {/* Extra Fees Section */}
          <div className="extra-fees-section">
            <h4>Additional Fees (Optional)</h4>
            {extraFees.map((fee, idx) => (
              <div key={idx} className="fee-row">
                <input
                  type="text"
                  placeholder="Fee name (e.g., Agency Fee)"
                  value={fee.name}
                  onChange={(e) => updateFee(idx, 'name', e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Amount (₦)"
                  value={fee.amount}
                  onChange={(e) => updateFee(idx, 'amount', parseFloat(e.target.value) || 0)}
                />
                <input
                  type="text"
                  placeholder="Description (optional)"
                  value={fee.description}
                  onChange={(e) => updateFee(idx, 'description', e.target.value)}
                />
                <button type="button" onClick={() => removeFee(idx)}><Trash2 size={16} /></button>
              </div>
            ))}
            <button type="button" className="btn-outline" onClick={addFee}>
              <Plus size={14} /> Add Fee
            </button>
          </div>

          {/* Image Upload Section */}
          <div className="image-upload-section">
            <h4>Images (Optional)</h4>
            <div className="image-upload-area">
              <label className="upload-label">
                <Upload size={24} />
                <span>Upload images</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
              </label>
              {images.length > 0 && (
                <div className="image-previews">
                  {images.map((img, idx) => (
                    <div key={idx} className="preview">
                      <img src={img.preview} alt={`preview ${idx}`} />
                      <button onClick={() => removeImage(idx)}><X size={14} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <small className="hint">First image will be the cover photo. Max 5MB each.</small>
          </div>

          {error && <div className="error-message">{error}</div>}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Converting...' : 'Convert to Unit'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConvertListingModal;