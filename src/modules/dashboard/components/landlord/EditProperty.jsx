// src/modules/dashboard/components/landlord/EditProperty.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../../shared/context/AuthContext';
import './EditProperty.css';

const EditProperty = () => {
  const { user } = useAuth();
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    address: '',
    price: '',
    type: 'duplex',
    bedrooms: '3',
    bathrooms: '3',
    area: '',
    description: '',
    amenities: [],
    yearBuilt: '',
    parking: '1',
    status: 'vacant'
  });

  useEffect(() => {
    const loadProperty = async () => {
      setIsLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock property data
        const mockProperty = {
          title: '3 Bedroom Duplex in Lekki',
          address: '123 Lekki Phase 1, Lagos, Nigeria',
          price: '3500000',
          type: 'duplex',
          bedrooms: '3',
          bathrooms: '3',
          area: '3500',
          description: 'A modern 3-bedroom duplex in prime Lekki location. Features include spacious living areas, modern kitchen, ensuite bedrooms, and private garden.',
          amenities: ['Swimming Pool', '24/7 Security', 'Power Backup', 'Gym', 'Parking'],
          yearBuilt: '2018',
          parking: '2',
          status: 'rented'
        };
        
        setFormData(mockProperty);
      } catch (error) {
        console.error('Error loading property:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user && propertyId) {
      loadProperty();
    }
  }, [user, propertyId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert('Property updated successfully!');
      navigate(`/dashboard/landlord/properties/${propertyId}`);
    } catch (error) {
      alert('Failed to update property. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const goBack = () => {
    navigate(`/dashboard/landlord/properties/${propertyId}`);
  };

  const availableAmenities = [
    'Swimming Pool', '24/7 Security', 'Power Backup', 'Gym', 
    'Parking', 'Garden', 'Water Supply', 'WiFi', 'CCTV',
    'Playground', 'Elevator', 'Pet Friendly', 'Furnished'
  ];

  if (isLoading) {
    return (
      <div className="edit-property-loading">
        <div className="loading-spinner"></div>
        <p>Loading property information...</p>
      </div>
    );
  }

  return (
    <div className="edit-property">
      {/* Header */}
      <div className="edit-header">
        <button className="btn btn-back" onClick={goBack}>
          ← Back to Property
        </button>
        <h1>Edit Property</h1>
        <p>Update your property details and photos</p>
      </div>

      <form onSubmit={handleSubmit} className="edit-form">
        <div className="form-sections">
          
          {/* Basic Information */}
          <div className="form-section">
            <h3>Basic Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="title">Property Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., 3 Bedroom Duplex in Lekki"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="address">Full Address *</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  placeholder="Complete address with city and state"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="type">Property Type *</label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                >
                  <option value="duplex">Duplex</option>
                  <option value="flat">Flat</option>
                  <option value="terrace">Terrace</option>
                  <option value="bungalow">Bungalow</option>
                  <option value="self_contain">Self-Contain</option>
                  <option value="apartment">Apartment</option>
                  <option value="mansion">Mansion</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="status">Status *</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                >
                  <option value="vacant">Vacant</option>
                  <option value="rented">Rented</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="form-section">
            <h3>Pricing Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="price">Monthly Rent (₦) *</label>
                <div className="price-input">
                  <span className="currency">₦</span>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    min="10000"
                    step="50000"
                    placeholder="3500000"
                  />
                </div>
                <small className="help-text">
                  Enter amount in Nigerian Naira
                </small>
              </div>
              
              <div className="form-group">
                <label htmlFor="commission">Commission Rate</label>
                <div className="commission-display">
                  <span className="rate">7.5%</span>
                  <span className="amount">
                    = ₦{(parseInt(formData.price) * 0.075).toLocaleString()}/month
                  </span>
                </div>
                <small className="help-text">
                  This is your earnings per successful rental
                </small>
              </div>
            </div>
          </div>

          {/* Property Details */}
          <div className="form-section">
            <h3>Property Details</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="bedrooms">Bedrooms *</label>
                <select
                  id="bedrooms"
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleInputChange}
                  required
                >
                  {[1,2,3,4,5,6,7,8].map(num => (
                    <option key={num} value={num}>{num} {num === 1 ? 'Bedroom' : 'Bedrooms'}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="bathrooms">Bathrooms *</label>
                <select
                  id="bathrooms"
                  name="bathrooms"
                  value={formData.bathrooms}
                  onChange={handleInputChange}
                  required
                >
                  {[1,2,3,4,5,6].map(num => (
                    <option key={num} value={num}>{num} {num === 1 ? 'Bathroom' : 'Bathrooms'}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="area">Square Footage *</label>
                <div className="area-input">
                  <input
                    type="number"
                    id="area"
                    name="area"
                    value={formData.area}
                    onChange={handleInputChange}
                    required
                    min="100"
                    step="100"
                    placeholder="3500"
                  />
                  <span className="unit">sq ft</span>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="yearBuilt">Year Built</label>
                <input
                  type="number"
                  id="yearBuilt"
                  name="yearBuilt"
                  value={formData.yearBuilt}
                  onChange={handleInputChange}
                  min="1900"
                  max={new Date().getFullYear()}
                  placeholder="2018"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="parking">Parking Spaces</label>
                <select
                  id="parking"
                  name="parking"
                  value={formData.parking}
                  onChange={handleInputChange}
                >
                  <option value="0">No Parking</option>
                  <option value="1">1 Car</option>
                  <option value="2">2 Cars</option>
                  <option value="3">3 Cars</option>
                  <option value="4">4+ Cars</option>
                  <option value="street">Street Parking</option>
                </select>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="form-section">
            <h3>Description</h3>
            <div className="form-group">
              <label htmlFor="description">Property Description *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows="6"
                placeholder="Describe your property in detail. Include features, neighborhood information, and unique selling points."
              />
              <small className="help-text">
                Minimum 100 characters. Good descriptions attract more tenants.
              </small>
            </div>
          </div>

          {/* Amenities */}
          <div className="form-section">
            <h3>Amenities & Features</h3>
            <div className="amenities-grid">
              {availableAmenities.map(amenity => (
                <div key={amenity} className="amenity-item">
                  <input
                    type="checkbox"
                    id={`amenity-${amenity}`}
                    checked={formData.amenities.includes(amenity)}
                    onChange={() => handleAmenityToggle(amenity)}
                    className="amenity-checkbox"
                  />
                  <label htmlFor={`amenity-${amenity}`} className="amenity-label">
                    <span className="amenity-icon">
                      {amenity === 'Swimming Pool' ? '🏊‍♂️' :
                       amenity === '24/7 Security' ? '👮' :
                       amenity === 'Power Backup' ? '⚡' :
                       amenity === 'Gym' ? '💪' :
                       amenity === 'Parking' ? '🅿️' :
                       amenity === 'Garden' ? '🌳' :
                       amenity === 'Water Supply' ? '🚰' :
                       amenity === 'WiFi' ? '📶' :
                       amenity === 'CCTV' ? '📹' :
                       amenity === 'Playground' ? '🎪' :
                       amenity === 'Elevator' ? '🛗' :
                       amenity === 'Pet Friendly' ? '🐾' :
                       amenity === 'Furnished' ? '🛋️' : '🏠'}
                    </span>
                    <span className="amenity-text">{amenity}</span>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Photos */}
          <div className="form-section">
            <h3>Property Photos</h3>
            <div className="photos-upload">
              <div className="upload-area">
                <div className="upload-icon">📷</div>
                <h4>Drag & Drop Photos Here</h4>
                <p>or click to browse files</p>
                <small className="help-text">
                  Upload high-quality images (JPEG, PNG). Max 10 photos, 5MB each.
                </small>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="file-input"
                  onChange={(e) => {
                    // Handle file upload logic here
                    console.log('Files selected:', e.target.files);
                  }}
                />
              </div>
              
              <div className="uploaded-photos">
                <div className="photo-count">
                  <span>Current Photos: 3</span>
                  <button type="button" className="btn btn-sm btn-outline">
                    View All
                  </button>
                </div>
                <div className="photo-thumbnails">
                  <div className="thumbnail">🏠</div>
                  <div className="thumbnail">🛋️</div>
                  <div className="thumbnail">🍳</div>
                  <div className="add-thumbnail">+</div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={goBack}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                // Save as draft logic
                alert('Property saved as draft!');
              }}
              disabled={isSubmitting}
            >
              Save as Draft
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Updating...' : 'Update Property'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditProperty;