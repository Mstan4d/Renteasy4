import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../../shared/lib/supabaseClient';
import { useAuth } from '../../../../shared/context/AuthContext';
import { 
  CheckCircle, MapPin, Home, Phone, Mail, 
  Image as ImageIcon, User, Calendar, Shield, AlertCircle 
} from 'lucide-react';
import './ConfirmationStep.css';

const ConfirmationStep = ({ 
  formData, 
  commission, 
  userRole, 
  onSubmit, // We will use our internal handleSupabaseSubmit instead
  onBack 
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Safe calculation of total images to prevent the 'length' crash
  const totalImages = formData?.images 
    ? Object.values(formData.images).reduce((sum, arr) => sum + (arr?.length || 0), 0) 
    : 0;

  const formatPrice = (price) => {
    const num = parseFloat(price) || 0;
    return `₦${num.toLocaleString()}`;
  };

  const handleSupabaseSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const uploadedImageUrls = [];

      // 1. Upload Images to Supabase Storage
      for (const [group, files] of Object.entries(formData.images)) {
        if (!Array.isArray(files)) continue;

        for (const file of files) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const filePath = `${user.id}/${Date.now()}-${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('property-images')
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('property-images')
            .getPublicUrl(filePath);

          uploadedImageUrls.push({ url: publicUrl, group });
        }
      }

      // 2. Insert into Database (Status is 'unverified' by default)
      const { error: dbError } = await supabase
        .from('properties')
        .insert([{
          title: formData.title,
          description: formData.description,
          price: parseFloat(formData.price),
          address: formData.address,
          state: formData.state,
          lga: formData.lga,
          property_type: formData.propertyType,
          images: uploadedImageUrls,
          owner_id: user.id,
          role_at_posting: userRole,
          commission_poster_rate: 1.5, // Your 1.5% commission rate
          status: 'unverified', // Goes live as unverified immediately
          contact_phone: formData.contactPhone,
          has_landlord_consent: formData.hasLandlordConsent || false,
          coordinates: formData.coordinates || null
        }]);

      if (dbError) throw dbError;

      alert("🎉 Property posted! It is now live as 'Unverified'. Admin review is pending.");
      navigate(userRole === 'estate-firm' ? '/dashboard/estate-firm' : '/dashboard');

    } catch (error) {
      console.error("Submission Error:", error);
      alert(`Failed to post: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCommissionBreakdown = () => {
    if (userRole === 'estate-firm') {
      return (
        <div className="commission-breakdown-section">
          <h4><Shield size={18} /> Estate Firm Listing</h4>
          <div className="estate-commission-info">
            <p>✅ Monthly Subscription Active</p>
            <p>✅ 1.5% Poster Bonus eligibility enabled</p>
          </div>
        </div>
      );
    }

    return (
      <div className="commission-breakdown-section">
        <h4><Shield size={18} /> Commission Breakdown (7.5% Total)</h4>
        <div className="commission-grid">
          <div className="commission-item">
            <span>Monthly Rent:</span>
            <span>{formatPrice(formData.price)}</span>
          </div>
          <div className="commission-item highlight">
            <span>Your Poster Commission (1.5%):</span>
            <span className="poster-earn">+ {formatPrice(formData.price * 0.015)}</span>
          </div>
        </div>
      </div>
    );
  };

  const renderImageSummary = () => {
    const groups = [
      { key: 'kitchen', label: 'Kitchen' },
      { key: 'dining', label: 'Living/Dining' },
      { key: 'outside', label: 'Exterior' },
      { key: 'inside', label: 'Interior' },
      { key: 'other', label: 'Other' }
    ];

    return (
      <div className="images-summary-section">
        <h4><ImageIcon size={18} /> Images ({totalImages})</h4>
        <div className="image-groups-summary">
          {groups.map(group => {
            const count = formData.images?.[group.key]?.length || 0;
            return (
              <div key={group.key} className="image-group-summary">
                <span>{group.label}:</span>
                <span className={count > 0 ? 'has-images' : 'no-images'}>{count}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="confirmation-step">
      <div className="step-header">
        <CheckCircle size={24} color="#10b981" />
        <h2>Final Confirmation</h2>
      </div>

      <div className="confirmation-content">
        {/* Property Summary Card */}
        <div className="summary-card">
          <div className="detail-item"><strong>Title:</strong> {formData.title}</div>
          <div className="detail-item"><strong>Location:</strong> {formData.address}, {formData.lga}, {formData.state}</div>
          <div className="detail-item"><strong>Price:</strong> {formatPrice(formData.price)}</div>
        </div>

        {renderCommissionBreakdown()}
        {renderImageSummary()}

        <div className="user-info-section">
          <h4><User size={18} /> Contact Details</h4>
          <p><strong>Name:</strong> {formData.userName || user?.fullName}</p>
          <p><strong>Phone:</strong> {formData.contactPhone}</p>
        </div>
      </div>

      <div className="confirmation-actions">
        <button className="btn-secondary" onClick={onBack} disabled={isSubmitting}>
          Back to Edit
        </button>
        <button 
          className="btn-success submit-btn" 
          onClick={handleSupabaseSubmit} 
          disabled={isSubmitting || totalImages === 0}
        >
          {isSubmitting ? "Uploading & Posting..." : "Confirm & Post Property"}
        </button>
      </div>
    </div>
  );
};

export default ConfirmationStep;