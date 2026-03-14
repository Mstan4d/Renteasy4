// src/modules/estate-firm/components/ServicePostForm.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase, Tag, DollarSign, MapPin,
  FileText, Clock, Image, CheckCircle,
  X, Upload, Save, Globe
} from 'lucide-react';
import { supabase } from '../../../shared/lib/supabaseClient';
import { nigerianStates } from '../../../shared/data/nigerianLocations';
import './ServicePostForm.css';

const ServicePostForm = ({ firmDetails, onSuccess }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'property-management',
    serviceType: 'professional',
    priceModel: 'fixed',
    price: '',
    hourlyRate: '',
    percentage: '',
    location: '',
    coverage: 'lagos',
    serviceAreas: [],
    duration: '',
    features: [],
    benefits: [],
    requirements: [],
    contactEmail: firmDetails?.contact?.email || '',
    contactPhone: firmDetails?.contact?.phone || '',
    website: firmDetails?.contact?.website || '',
    postedBy: {
      type: 'estate-firm',
      id: firmDetails?.id,
      name: firmDetails?.name,
      verified: firmDetails?.verified || false,
      rating: firmDetails?.rating || 0
    }
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imageFiles, setImageFiles] = useState([]); // array of { file, previewUrl }

  // Service categories (unchanged)
  const serviceCategories = [
    { id: 'property-management', name: 'Property Management', description: 'Full property management services', icon: '🏢' },
    { id: 'valuation', name: 'Property Valuation', description: 'Professional property appraisal', icon: '💰' },
    { id: 'tenant-screening', name: 'Tenant Screening', description: 'Background checks & verification', icon: '🔍' },
    { id: 'legal-services', name: 'Legal Services', description: 'Documentation & legal support', icon: '⚖️' },
    { id: 'maintenance', name: 'Maintenance & Repairs', description: 'Property maintenance services', icon: '🔧' },
    { id: 'property-marketing', name: 'Property Marketing', description: 'Marketing & advertising services', icon: '📢' },
    { id: 'consultation', name: 'Consultation', description: 'Professional advice & planning', icon: '💼' },
    { id: 'rent-collection', name: 'Rent Collection', description: 'Rent payment management', icon: '💳' }
  ];

  // Common service features (unchanged)
  const commonFeatures = [
    '24/7 Support', 'Online Tracking', 'Detailed Reports',
    'Fast Response', 'Certified Professionals', 'Guaranteed Service',
    'Free Consultation', 'Flexible Payment', 'Digital Documentation'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategorySelect = (categoryId) => {
    setFormData(prev => ({ ...prev, category: categoryId }));
  };

  const handleServiceAreaToggle = (areaValue) => {
    setFormData(prev => {
      const areas = prev.serviceAreas.includes(areaValue)
        ? prev.serviceAreas.filter(a => a !== areaValue)
        : [...prev.serviceAreas, areaValue];
      return { ...prev, serviceAreas: areas };
    });
  };

  const handleFeatureToggle = (feature) => {
    setFormData(prev => {
      const features = prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature];
      return { ...prev, features: features };
    });
  };

  const handleRequirementAdd = () => {
    const requirement = prompt('Enter a client requirement:');
    if (requirement && !formData.requirements.includes(requirement)) {
      setFormData(prev => ({
        ...prev,
        requirements: [...prev.requirements, requirement]
      }));
    }
  };

  const handleBenefitAdd = () => {
    const benefit = prompt('Enter a service benefit:');
    if (benefit && !formData.benefits.includes(benefit)) {
      setFormData(prev => ({
        ...prev,
        benefits: [...prev.benefits, benefit]
      }));
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => ({
      file,
      previewUrl: URL.createObjectURL(file)
    }));
    setImageFiles(prev => [...prev, ...newImages]);
  };

  const removeImage = (index) => {
    setImageFiles(prev => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[index].previewUrl);
      newImages.splice(index, 1);
      return newImages;
    });
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      alert('Please enter a service title');
      return false;
    }
    if (!formData.description.trim()) {
      alert('Please enter a service description');
      return false;
    }
    if (!formData.priceModel) {
      alert('Please select a pricing model');
      return false;
    }
    if (formData.priceModel === 'fixed' && !formData.price) {
      alert('Please enter a price');
      return false;
    }
    if (formData.priceModel === 'hourly' && !formData.hourlyRate) {
      alert('Please enter an hourly rate');
      return false;
    }
    if (formData.priceModel === 'percentage' && !formData.percentage) {
      alert('Please enter a percentage');
      return false;
    }
    if (!formData.location) {
      alert('Please select a primary location');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setUploadingImages(true);

    try {
      // Upload images (if any)
      const uploadedUrls = [];
      for (const img of imageFiles) {
        if (img.file) {
          const fileExt = img.file.name.split('.').pop();
          const fileName = `${firmDetails.id}/${Date.now()}-${Math.random()}.${fileExt}`;
          const filePath = `service-images/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('service-images')
            .upload(filePath, img.file);

          if (uploadError) throw uploadError;

          const { data: urlData } = supabase.storage
            .from('service-images')
            .getPublicUrl(filePath);

          uploadedUrls.push(urlData.publicUrl);
        }
      }

      // Prepare data for Supabase
      const serviceData = {
        estate_firm_id: firmDetails.id,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        service_type: formData.serviceType,
        price_model: formData.priceModel,
        price: formData.priceModel === 'fixed' ? parseFloat(formData.price) : null,
        hourly_rate: formData.priceModel === 'hourly' ? parseFloat(formData.hourlyRate) : null,
        percentage: formData.priceModel === 'percentage' ? parseFloat(formData.percentage) : null,
        location: formData.location,
        coverage: formData.coverage,
        service_areas: formData.serviceAreas,
        duration: formData.duration || null,
        features: formData.features,
        benefits: formData.benefits,
        requirements: formData.requirements,
        images: uploadedUrls,
        contact_phone: formData.contactPhone,
        contact_email: formData.contactEmail,
        website: formData.website || null,
        status: 'active'
      };

      const { data, error } = await supabase
        .from('estate_services')
        .insert([serviceData])
        .select()
        .single();

      if (error) throw error;

      alert('Service successfully posted to marketplace!');
      if (onSuccess) onSuccess(data);

      // Reset form
      setFormData({
        title: '',
        description: '',
        category: 'property-management',
        serviceType: 'professional',
        priceModel: 'fixed',
        price: '',
        hourlyRate: '',
        percentage: '',
        location: '',
        coverage: 'lagos',
        serviceAreas: [],
        duration: '',
        features: [],
        benefits: [],
        requirements: [],
        contactEmail: firmDetails?.contact?.email || '',
        contactPhone: firmDetails?.contact?.phone || '',
        website: firmDetails?.contact?.website || '',
        postedBy: {
          type: 'estate-firm',
          id: firmDetails?.id,
          name: firmDetails?.name,
          verified: firmDetails?.verified || false,
          rating: firmDetails?.rating || 0
        }
      });
      setImageFiles([]);
      setCurrentStep(1);
    } catch (error) {
      console.error('Error posting service:', error);
      alert('Failed to post service. Please try again.');
    } finally {
      setIsSubmitting(false);
      setUploadingImages(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="form-step">
            <h3>Service Details</h3>
            
            <div className="form-group">
              <label>Service Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Professional Property Management Services"
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label>Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your service in detail. What do you offer? Who is it for?"
                className="form-textarea"
                rows={5}
                required
              />
            </div>

            <div className="form-group">
              <label>Service Category *</label>
              <div className="category-grid">
                {serviceCategories.map(category => (
                  <div
                    key={category.id}
                    className={`category-card ${formData.category === category.id ? 'selected' : ''}`}
                    onClick={() => handleCategorySelect(category.id)}
                  >
                    <span className="category-icon">{category.icon}</span>
                    <div className="category-info">
                      <span className="category-name">{category.name}</span>
                      <small>{category.description}</small>
                    </div>
                    {formData.category === category.id && (
                      <CheckCircle className="check-icon" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Service Type</label>
              <div className="radio-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="serviceType"
                    value="professional"
                    checked={formData.serviceType === 'professional'}
                    onChange={handleInputChange}
                  />
                  <span>Professional Service</span>
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="serviceType"
                    value="maintenance"
                    checked={formData.serviceType === 'maintenance'}
                    onChange={handleInputChange}
                  />
                  <span>Maintenance Service</span>
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="serviceType"
                    value="consultation"
                    checked={formData.serviceType === 'consultation'}
                    onChange={handleInputChange}
                  />
                  <span>Consultation</span>
                </label>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="form-step">
            <h3>Pricing & Location</h3>
            
            <div className="form-group">
              <label>Pricing Model *</label>
              <div className="price-model-grid">
                <div
                  className={`price-model-card ${formData.priceModel === 'fixed' ? 'selected' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, priceModel: 'fixed' }))}
                >
                  <DollarSign size={24} />
                  <span>Fixed Price</span>
                  <small>One-time fee</small>
                </div>
                <div
                  className={`price-model-card ${formData.priceModel === 'hourly' ? 'selected' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, priceModel: 'hourly' }))}
                >
                  <Clock size={24} />
                  <span>Hourly Rate</span>
                  <small>Pay by the hour</small>
                </div>
                <div
                  className={`price-model-card ${formData.priceModel === 'percentage' ? 'selected' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, priceModel: 'percentage' }))}
                >
                  <Tag size={24} />
                  <span>Percentage</span>
                  <small>% of transaction</small>
                </div>
                <div
                  className={`price-model-card ${formData.priceModel === 'quote' ? 'selected' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, priceModel: 'quote' }))}
                >
                  <FileText size={24} />
                  <span>Get Quote</span>
                  <small>Custom pricing</small>
                </div>
              </div>
            </div>

            {/* Price inputs based on model */}
            {formData.priceModel === 'fixed' && (
              <div className="form-group">
                <label>Price (₦) *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="e.g., 50000"
                  className="form-input"
                />
              </div>
            )}
            {formData.priceModel === 'hourly' && (
              <div className="form-group">
                <label>Hourly Rate (₦) *</label>
                <input
                  type="number"
                  name="hourlyRate"
                  value={formData.hourlyRate}
                  onChange={handleInputChange}
                  placeholder="e.g., 5000"
                  className="form-input"
                />
              </div>
            )}
            {formData.priceModel === 'percentage' && (
              <div className="form-group">
                <label>Percentage (%) *</label>
                <input
                  type="number"
                  name="percentage"
                  value={formData.percentage}
                  onChange={handleInputChange}
                  placeholder="e.g., 10"
                  className="form-input"
                  min="1"
                  max="100"
                />
              </div>
            )}

            <div className="form-group">
              <label>Estimated Duration</label>
              <input
                type="text"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                placeholder="e.g., 2-3 days, 1 week, etc."
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Primary Location *</label>
              <select
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="form-select"
                required
              >
                <option value="">Select Location</option>
                {nigerianStates.map(state => (
                  <option key={state.value} value={state.value}>
                    {state.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Service Coverage Areas</label>
              <div className="service-areas">
                {nigerianStates.map(state => (
                  <div
                    key={state.value}
                    className={`area-tag ${formData.serviceAreas.includes(state.value) ? 'selected' : ''}`}
                    onClick={() => handleServiceAreaToggle(state.value)}
                  >
                    {state.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="form-step">
            <h3>Service Features & Requirements</h3>
            
            <div className="form-group">
              <label>Service Features</label>
              <div className="features-grid">
                {commonFeatures.map(feature => (
                  <div
                    key={feature}
                    className={`feature-tag ${formData.features.includes(feature) ? 'selected' : ''}`}
                    onClick={() => handleFeatureToggle(feature)}
                  >
                    {feature}
                    {formData.features.includes(feature) && <CheckCircle size={12} />}
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Service Benefits</label>
              <div className="benefits-list">
                {formData.benefits.map((benefit, index) => (
                  <div key={index} className="benefit-item">
                    <span>✓ {benefit}</span>
                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        benefits: prev.benefits.filter((_, i) => i !== index)
                      }))}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="add-benefit-btn"
                  onClick={handleBenefitAdd}
                >
                  + Add Benefit
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Client Requirements</label>
              <div className="requirements-list">
                {formData.requirements.map((req, index) => (
                  <div key={index} className="requirement-item">
                    <span>• {req}</span>
                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        requirements: prev.requirements.filter((_, i) => i !== index)
                      }))}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="add-requirement-btn"
                  onClick={handleRequirementAdd}
                >
                  + Add Requirement
                </button>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="form-step">
            <h3>Media & Contact</h3>
            
            <div className="form-group">
              <label>Service Images</label>
              <div className="image-upload">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  id="service-images"
                  style={{ display: 'none' }}
                />
                <label htmlFor="service-images" className="upload-label">
                  <Upload size={24} />
                  <span>Upload Service Images</span>
                  <small>Showcase your work or office</small>
                </label>
                
                {imageFiles.length > 0 && (
                  <div className="image-preview">
                    {imageFiles.map((img, index) => (
                      <div key={index} className="preview-image">
                        <img src={img.previewUrl} alt={`Service ${index + 1}`} />
                        <button
                          type="button"
                          className="remove-image"
                          onClick={() => removeImage(index)}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Contact Phone *</label>
                <input
                  type="tel"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label>Contact Email *</label>
                <input
                  type="email"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Website (Optional)</label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                placeholder="https://yourcompany.com"
                className="form-input"
              />
            </div>

            <div className="posting-as-firm">
              <div className="firm-badge">
                <Briefcase size={20} />
                <div className="firm-info">
                  <strong>{formData.postedBy.name}</strong>
                  {formData.postedBy.verified && (
                    <span className="verified-tag">Verified Firm</span>
                  )}
                </div>
              </div>
              <p className="posting-notice">
                This service will be listed under your estate firm profile in the marketplace
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="service-post-form">
      <div className="form-header">
        <h2>Post Service to Marketplace</h2>
        <p className="subtitle">Offer your professional services to clients</p>
      </div>

      <div className="progress-steps">
        {[1, 2, 3, 4].map(step => (
          <div key={step} className="step-container">
            <div
              className={`step-circle ${currentStep >= step ? 'active' : ''}`}
              onClick={() => currentStep > step && setCurrentStep(step)}
            >
              {step}
            </div>
            <span className="step-label">
              {step === 1 && 'Details'}
              {step === 2 && 'Pricing'}
              {step === 3 && 'Features'}
              {step === 4 && 'Media'}
            </span>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {renderStep()}

        <div className="form-actions">
          {currentStep > 1 && (
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setCurrentStep(currentStep - 1)}
              disabled={isSubmitting}
            >
              Previous
            </button>
          )}

          {currentStep < 4 ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setCurrentStep(currentStep + 1)}
            >
              Continue
            </button>
          ) : (
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner"></span>
                  Posting Service...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Post to Marketplace
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ServicePostForm;