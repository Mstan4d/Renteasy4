import React, { useState } from 'react';
import { X, Plus, Trash2, Upload, Check } from 'lucide-react';
import { supabase } from '../../../shared/lib/supabaseClient';
import { createListingFromUnit } from '../../../shared/utils/listingUtils';
import './PostVacantModal.css';

const PostVacantModal = ({ unit, property, estateFirmId, onClose, onSuccess }) => {
  const [extraFees, setExtraFees] = useState([]);
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

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

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    const uploadedImages = [];
    for (const file of files) {
      const objectUrl = URL.createObjectURL(file);
      uploadedImages.push({
        file,
        preview: objectUrl,
        name: file.name,
        size: file.size,
        needsUpload: true
      });
    }
    setImages([...images, ...uploadedImages]);
  };

  const removeImage = (index) => {
    const newImages = [...images];
    URL.revokeObjectURL(newImages[index].preview);
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
    setUploading(true);
    setError('');

    try {
      // 1. Create listing (initially without images)
      const listing = await createListingFromUnit(unit, property, estateFirmId, extraFees);
      if (!listing || !listing.id) throw new Error('Failed to create listing');

      // 2. Upload images (if any)
      let imageUrls = [];
      if (images.length > 0) {
        imageUrls = await uploadImagesToStorage(listing.id);
        if (imageUrls.length > 0) {
          const { error: updateError } = await supabase
            .from('listings')
            .update({ images: imageUrls })
            .eq('id', listing.id);
          if (updateError) console.error('Image update error:', updateError);
        }
      }

      // 3. Mark unit as listed
      await supabase
        .from('units')
        .update({ is_listed_on_renteasy: true, listing_id: listing.id })
        .eq('id', unit.id);

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to post listing');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Post to RentEasy</h2>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="modal-body">
          <p><strong>Unit:</strong> {unit.unit_number}</p>
          <p><strong>Property:</strong> {property.name}</p>
          <p><strong>Rent:</strong> ₦{unit.rent_amount.toLocaleString()}/{unit.rent_frequency}</p>

          {/* Extra Fees Section (same as in BasicInfoStep) */}
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
          <button className="btn-primary" onClick={handleSubmit} disabled={uploading}>
            {uploading ? 'Posting...' : 'Post to RentEasy'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostVacantModal;