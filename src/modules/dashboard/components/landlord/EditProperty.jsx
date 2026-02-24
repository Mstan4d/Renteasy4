import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../../shared/context/AuthContext';
import { supabase } from '../../../../shared/lib/supabaseClient';
import { ArrowLeft, Save, Trash2, Camera, Loader2 } from 'lucide-react';
import './EditProperty.css';

const EditProperty = () => {
  const { user } = useAuth();
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    address: '',
    price: '',
    property_type: 'duplex',
    bedrooms: '3',
    bathrooms: '3',
    area: '',
    description: '',
    amenities: [],
    year_built: '',
    parking: '1',
    status: 'vacant'
  });

  useEffect(() => {
    if (user && propertyId) fetchProperty();
  }, [user, propertyId]);

  const fetchProperty = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('id', propertyId)
        .single();

      if (error) throw error;
      if (data) setFormData(data);
    } catch (error) {
      console.error('Error fetching property:', error.message);
      alert('Could not load property details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAmenityToggle = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('listings')
        .update({
          ...formData,
          updated_at: new Date()
        })
        .eq('id', propertyId);

      if (error) throw error;
      
      alert('Property updated successfully!');
      navigate(`/dashboard/landlord/properties/${propertyId}`);
    } catch (error) {
      alert('Update failed: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableAmenities = [
    'Swimming Pool', '24/7 Security', 'Power Backup', 'Gym', 
    'Parking', 'Garden', 'Water Supply', 'WiFi', 'CCTV', 'Furnished'
  ];

  if (isLoading) return <div className="edit-loading"><Loader2 className="spinner" /> Loading Property...</div>;

  return (
    <div className="edit-property-container">
      <header className="edit-header-nav">
        <button className="back-circle-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1>Edit Listing</h1>
          <p>Update {formData.title || 'Property'}</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="modern-edit-form">
        {/* Essential Info */}
        <section className="form-card">
          <h3><span className="step-num">1</span> Basic Details</h3>
          <div className="input-group">
            <label>Property Title</label>
            <input name="title" value={formData.title} onChange={handleInputChange} required />
          </div>
          <div className="input-group">
            <label>Location / Address</label>
            <input name="address" value={formData.address} onChange={handleInputChange} required />
          </div>
          <div className="grid-2">
            <div className="input-group">
              <label>Type</label>
              <select name="property_type" value={formData.property_type} onChange={handleInputChange}>
                <option value="duplex">Duplex</option>
                <option value="flat">Flat</option>
                <option value="terrace">Terrace</option>
                <option value="self_contain">Self-Contain</option>
              </select>
            </div>
            <div className="input-group">
              <label>Status</label>
              <select name="status" value={formData.status} onChange={handleInputChange}>
                <option value="vacant">Vacant (Available)</option>
                <option value="rented">Rented</option>
                <option value="pending">Under Maintenance</option>
              </select>
            </div>
          </div>
        </section>

        {/* Pricing & Commission */}
        <section className="form-card highlight-card">
          <h3><span className="step-num">2</span> Pricing & Earnings</h3>
          <div className="input-group">
            <label>Monthly Rent (₦)</label>
            <input type="number" name="price" value={formData.price} onChange={handleInputChange} required />
          </div>
          <div className="commission-preview">
            <p>Your Estimated Commission (1.5%):</p>
            <strong>₦{(formData.price * 0.015).toLocaleString()}</strong>
            <span>Earned upon successful rental verification</span>
          </div>
        </section>

        {/* Amenities */}
        <section className="form-card">
          <h3><span className="step-num">3</span> Features</h3>
          <div className="amenities-selection">
            {availableAmenities.map(amenity => (
              <button 
                key={amenity}
                type="button"
                className={`amenity-chip ${formData.amenities.includes(amenity) ? 'active' : ''}`}
                onClick={() => handleAmenityToggle(amenity)}
              >
                {amenity}
              </button>
            ))}
          </div>
        </section>

        <div className="form-submit-row">
          <button type="button" className="btn-cancel" onClick={() => navigate(-1)}>Cancel</button>
          <button type="submit" className="btn-save" disabled={isSubmitting}>
            {isSubmitting ? 'Syncing...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProperty;