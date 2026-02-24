// src/modules/providers/components/ServicePostingForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../shared/lib/supabaseClient';
import {
  Upload, Tag, DollarSign, Clock, MapPin,
  Calendar, Users, Shield, Star, X, AlertCircle, CheckCircle
} from 'lucide-react';
import './ServicePostingForm.css';

const ServicePostingForm = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    subCategory: '',
    description: '',
    detailedDescription: '',
    pricing_model: 'hourly', // will match DB column
    price: '',
    price_min: '',
    price_max: '',
    discount: '',
    availability_start: '',
    availability_end: '',
    requirements: [],
    deliverables: [],
    tags: [],
    service_area_type: 'specific',
    service_locations: [],
    estimated_time: '',
    team_size: 1,
    experience_level: 'intermediate', // optional
    certification_required: false,
    portfolio_images: [],
    faqs: []
  });

  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);

  // Load categories from a categories table or static data
  useEffect(() => {
    // You can later fetch categories from Supabase if you have a categories table
    const serviceCategories = [
      { id: 'property-management', name: 'Property Management', subCategories: [
        { id: 'full-management', name: 'Full Property Management' },
        { id: 'tenant-screening', name: 'Tenant Screening' },
        { id: 'rent-collection', name: 'Rent Collection' }
      ]},
      { id: 'skilled-trades', name: 'Skilled Trades', subCategories: [
        { id: 'electrician', name: 'Electrician' },
        { id: 'plumber', name: 'Plumber' },
        { id: 'carpenter', name: 'Carpenter' }
      ]},
      { id: 'cleaning', name: 'Cleaning Services', subCategories: [
        { id: 'deep-cleaning', name: 'Deep Cleaning' },
        { id: 'office-cleaning', name: 'Office Cleaning' },
        { id: 'move-in-out', name: 'Move-in/out Cleaning' }
      ]},
      { id: 'security', name: 'Security Services', subCategories: [
        { id: 'cctv', name: 'CCTV Installation' },
        { id: 'alarm', name: 'Alarm Systems' },
        { id: 'guard', name: 'Security Guards' }
      ]}
    ];
    setCategories(serviceCategories);
  }, []);

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle array inputs (tags, locations, requirements, deliverables)
  const addArrayItem = (field, value) => {
    if (!value.trim()) return;
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], value.trim()]
    }));
  };

  const removeArrayItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  // Submit form to Supabase
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    // Validate required fields
    if (!formData.title || !formData.description || !formData.category) {
      setError('Please fill in all required fields (title, category, description).');
      setIsSubmitting(false);
      return;
    }

    // Check authentication
    if (!user || !profile) {
      setError('You must be logged in to post a service.');
      setIsSubmitting(false);
      return;
    }

    // Ensure user has role service-provider (optional check)
    if (profile.role !== 'service-provider' && profile.role !== 'provider') {
      setError('Only service providers can post services.');
      setIsSubmitting(false);
      return;
    }

    try {
      // Prepare data for insertion – map form fields to DB columns
      const serviceData = {
        provider_id: user.id,
        title: formData.title,
        category: formData.category,
        sub_category: formData.subCategory || null,
        description: formData.description,
        detailed_description: formData.detailedDescription || null,
        pricing_model: formData.pricing_model,
        price: formData.pricing_model !== 'custom' ? (parseFloat(formData.price) || null) : null,
        price_min: formData.pricing_model === 'custom' ? (parseFloat(formData.price_min) || null) : null,
        price_max: formData.pricing_model === 'custom' ? (parseFloat(formData.price_max) || null) : null,
        discount: formData.discount ? parseInt(formData.discount) : null,
        estimated_time: formData.estimated_time || null,
        team_size: parseInt(formData.team_size) || 1,
        availability_start: formData.availability_start || null,
        availability_end: formData.availability_end || null,
        service_area_type: formData.service_area_type,
        service_locations: formData.service_locations,
        requirements: formData.requirements,
        deliverables: formData.deliverables,
        tags: formData.tags,
        portfolio_images: formData.portfolio_images, // you may handle file uploads separately
        faqs: formData.faqs.length ? JSON.stringify(formData.faqs) : null,
        status: 'active'
      };

      const { data, error: insertError } = await supabase
        .from('provider_services')
        .insert([serviceData])
        .select()
        .single();

      if (insertError) throw insertError;

      // Success
      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard/provider'); // or to a list of services
      }, 2000);

    } catch (err) {
      console.error('Error posting service:', err);
      setError(err.message || 'Failed to post service. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to render array input with tags
  const renderArrayInput = (field, placeholder, hint) => (
    <div className="array-input-group">
      <div className="tags-input">
        <input
          type="text"
          placeholder={placeholder}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addArrayItem(field, e.target.value);
              e.target.value = '';
            }
          }}
        />
        {hint && <small>{hint}</small>}
      </div>
      {formData[field].length > 0 && (
        <div className="tags-list">
          {formData[field].map((item, index) => (
            <span key={index} className="tag">
              {field === 'tags' ? `#${item}` : item}
              <button type="button" onClick={() => removeArrayItem(field, index)}>
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="service-posting-form">
      <div className="form-container">
        {/* Header */}
        <div className="form-header">
          <h1>
            <span className="highlight">Post</span> a New Service
          </h1>
          <p className="subtitle">
            Fill in the details below to create your service listing
          </p>
        </div>

        {/* Error / Success messages */}
        {error && (
          <div className="message error">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="message success">
            <CheckCircle size={20} />
            <span>Service posted successfully! Redirecting...</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="posting-form">
          {/* Service Details */}
          <div className="form-section">
            <h3><Tag size={18} /> Service Details</h3>

            <div className="form-group">
              <label>Service Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g., Professional Electrical Installation"
                required
                disabled={isSubmitting}
              />
              <small>Make it descriptive and clear</small>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => {
                    const cat = e.target.value;
                    handleInputChange('category', cat);
                    const selected = categories.find(c => c.id === cat);
                    setSubCategories(selected?.subCategories || []);
                  }}
                  required
                  disabled={isSubmitting}
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {formData.category && subCategories.length > 0 && (
                <div className="form-group">
                  <label>Sub-category</label>
                  <select
                    value={formData.subCategory}
                    onChange={(e) => handleInputChange('subCategory', e.target.value)}
                    disabled={isSubmitting}
                  >
                    <option value="">Select sub-category</option>
                    {subCategories.map(sub => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Short Description *</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Brief summary of your service (max 150 characters)"
                maxLength={150}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label>Detailed Description *</label>
              <textarea
                value={formData.detailedDescription}
                onChange={(e) => handleInputChange('detailedDescription', e.target.value)}
                placeholder="Describe your service in detail. Include scope, process, benefits..."
                rows={5}
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Pricing */}
          <div className="form-section">
            <h3><DollarSign size={18} /> Pricing</h3>

            <div className="form-group">
              <label>Pricing Model *</label>
              <div className="radio-group">
                {[
                  { id: 'hourly', label: 'Hourly Rate', icon: '⏰' },
                  { id: 'project', label: 'Project-based', icon: '📋' },
                  { id: 'monthly', label: 'Monthly Retainer', icon: '📅' },
                  { id: 'custom', label: 'Custom Quote', icon: '💬' }
                ].map(option => (
                  <label key={option.id} className="radio-label">
                    <input
                      type="radio"
                      name="pricing_model"
                      value={option.id}
                      checked={formData.pricing_model === option.id}
                      onChange={(e) => handleInputChange('pricing_model', e.target.value)}
                      disabled={isSubmitting}
                    />
                    <span className="radio-content">
                      <span className="radio-icon">{option.icon}</span>
                      <span className="radio-text">{option.label}</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {formData.pricing_model !== 'custom' && (
              <div className="form-group">
                <label>Price (₦) *</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  placeholder="e.g., 5000"
                  min="0"
                  required
                  disabled={isSubmitting}
                />
              </div>
            )}

            {formData.pricing_model === 'custom' && (
              <div className="form-group">
                <label>Price Range (₦)</label>
                <div className="form-row">
                  <input
                    type="number"
                    placeholder="Min"
                    value={formData.price_min}
                    onChange={(e) => handleInputChange('price_min', e.target.value)}
                    min="0"
                    disabled={isSubmitting}
                  />
                  <span className="range-separator">to</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={formData.price_max}
                    onChange={(e) => handleInputChange('price_max', e.target.value)}
                    min="0"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label>Discount Offer (Optional)</label>
              <div className="discount-input">
                <input
                  type="number"
                  placeholder="e.g., 10"
                  value={formData.discount}
                  onChange={(e) => handleInputChange('discount', e.target.value)}
                  min="0"
                  max="100"
                  disabled={isSubmitting}
                />
                <span className="discount-suffix">% off</span>
              </div>
              <small>Offer a discount to attract first-time clients</small>
            </div>
          </div>

          {/* Availability & Timeline */}
          <div className="form-section">
            <h3><Clock size={18} /> Availability & Timeline</h3>

            <div className="form-row">
              <div className="form-group">
                <label>Estimated Time</label>
                <input
                  type="text"
                  value={formData.estimated_time}
                  onChange={(e) => handleInputChange('estimated_time', e.target.value)}
                  placeholder="e.g., 2-3 days, 1 week, etc."
                  disabled={isSubmitting}
                />
              </div>

              <div className="form-group">
                <label><Users size={16} /> Team Size</label>
                <select
                  value={formData.team_size}
                  onChange={(e) => handleInputChange('team_size', parseInt(e.target.value))}
                  disabled={isSubmitting}
                >
                  {[1,2,3,4,5,6,7,8,9,10].map(num => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'person' : 'people'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Availability Date Range</label>
              <div className="form-row">
                <input
                  type="date"
                  value={formData.availability_start}
                  onChange={(e) => handleInputChange('availability_start', e.target.value)}
                  disabled={isSubmitting}
                />
                <span className="range-separator">to</span>
                <input
                  type="date"
                  value={formData.availability_end}
                  onChange={(e) => handleInputChange('availability_end', e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* Service Area */}
          <div className="form-section">
            <h3><MapPin size={18} /> Service Area</h3>

            <div className="form-group">
              <label>Coverage Type</label>
              <div className="radio-group">
                {[
                  { id: 'specific', label: 'Specific Locations' },
                  { id: 'city-wide', label: 'City-wide' },
                  { id: 'state-wide', label: 'State-wide' },
                  { id: 'nationwide', label: 'Nationwide' }
                ].map(option => (
                  <label key={option.id} className="radio-label">
                    <input
                      type="radio"
                      name="service_area_type"
                      value={option.id}
                      checked={formData.service_area_type === option.id}
                      onChange={(e) => handleInputChange('service_area_type', e.target.value)}
                      disabled={isSubmitting}
                    />
                    <span className="radio-text">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {formData.service_area_type === 'specific' && (
              <div className="form-group">
                {renderArrayInput('service_locations', 'Add a location (e.g., Lekki Phase 1)', 'Press Enter to add multiple locations')}
              </div>
            )}
          </div>

          {/* Requirements & Features */}
          <div className="form-section">
            <h3><Shield size={18} /> Requirements & Features</h3>

            <div className="form-group">
              <label>Client Requirements</label>
              {renderArrayInput('requirements', 'Add a requirement (e.g., Provide access to property)', 'What does the client need to provide?')}
            </div>

            <div className="form-group">
              <label>Your Deliverables</label>
              {renderArrayInput('deliverables', 'Add a deliverable (e.g., Installation certificate)', 'What will you deliver to the client?')}
            </div>

            <div className="form-group">
              <label>Service Tags</label>
              {renderArrayInput('tags', 'Add tags (e.g., professional, reliable, certified)', 'Add relevant tags to help clients find your service')}
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/dashboard/provider')}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting || success}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner"></span>
                  Posting...
                </>
              ) : (
                <>
                  <Star size={18} />
                  Post Service
                </>
              )}
            </button>
          </div>
        </form>

        {/* Tips Sidebar (unchanged) */}
        <div className="tips-sidebar">
          <div className="tip-card">
            <h4>Tips for a Great Listing</h4>
            <ul>
              <li><strong>Clear Title:</strong> Be specific about what you offer</li>
              <li><strong>Detailed Description:</strong> Include scope, process, and benefits</li>
              <li><strong>Reasonable Pricing:</strong> Research market rates</li>
              <li><strong>High-quality Images:</strong> Showcase your work</li>
              <li><strong>Quick Response:</strong> Set realistic response times</li>
            </ul>
          </div>
          <div className="visibility-card">
            <h4><Star size={16} /> Boost Visibility</h4>
            <p>Get your service featured at the top of search results:</p>
            <ul>
              <li>Complete all profile details</li>
              <li>Add portfolio images</li>
              <li>Offer competitive pricing</li>
              <li>Maintain high response rate</li>
              <li>Collect client reviews</li>
            </ul>
            <button className="btn btn-primary btn-small" onClick={() => navigate('/dashboard/provider/subscription')}>
              Learn About Premium
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicePostingForm;