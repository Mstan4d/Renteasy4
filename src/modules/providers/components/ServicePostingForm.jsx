// src/modules/providers/components/ServicePostingForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import {
  Upload, Tag, DollarSign, Clock, MapPin,
  Calendar, Users, Shield, Star, X
} from 'lucide-react';
import './ServicePostingForm.css';

const ServicePostingForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    subCategory: '',
    description: '',
    detailedDescription: '',
    priceType: 'hourly', // hourly, project, monthly, custom
    price: '',
    priceRange: { min: '', max: '' },
    discount: '',
    availability: {
      startDate: '',
      endDate: '',
      slots: []
    },
    requirements: [],
    deliverables: [],
    tags: [],
    serviceArea: {
      type: 'specific', // specific, city-wide, state-wide, nationwide
      locations: []
    },
    estimatedTime: '',
    teamSize: 1,
    experienceLevel: 'intermediate', // beginner, intermediate, expert
    certificationRequired: false,
    portfolioImages: [],
    faqs: []
  });
  
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  
  useEffect(() => {
    // Load categories from your data
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
      // Add more categories as needed
    ];
    setCategories(serviceCategories);
  }, []);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const services = JSON.parse(localStorage.getItem('providerServices') || '[]');
      const newService = {
        id: `SVC-${Date.now()}`,
        ...formData,
        providerId: user?.id,
        providerEmail: user?.email,
        createdAt: new Date().toISOString(),
        status: 'active',
        views: 0,
        inquiries: 0,
        rating: 0
      };
      
      services.push(newService);
      localStorage.setItem('providerServices', JSON.stringify(services));
      
      // Update provider's services list
      const providers = JSON.parse(localStorage.getItem('serviceProviders') || '[]');
      const providerIndex = providers.findIndex(p => p.userId === user?.id || p.email === user?.email);
      
      if (providerIndex !== -1) {
        providers[providerIndex].services = [
          ...(providers[providerIndex].services || []),
          formData.title
        ];
        localStorage.setItem('serviceProviders', JSON.stringify(providers));
      }
      
      alert('Service posted successfully!');
      navigate('/providers/dashboard');
      
    } catch (error) {
      console.error('Error posting service:', error);
      alert('Failed to post service. Please try again.');
    }
  };
  
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
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="posting-form">
          <div className="form-section">
            <h3>
              <Tag size={18} />
              Service Details
            </h3>
            
            <div className="form-group">
              <label>Service Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="e.g., Professional Electrical Installation"
                required
              />
              <small>Make it descriptive and clear</small>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => {
                    const category = e.target.value;
                    setFormData({...formData, category});
                    const selected = categories.find(c => c.id === category);
                    setSubCategories(selected?.subCategories || []);
                  }}
                  required
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
                    onChange={(e) => setFormData({...formData, subCategory: e.target.value})}
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
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Brief summary of your service (max 150 characters)"
                maxLength={150}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Detailed Description *</label>
              <textarea
                value={formData.detailedDescription}
                onChange={(e) => setFormData({...formData, detailedDescription: e.target.value})}
                placeholder="Describe your service in detail. Include scope, process, benefits..."
                rows={5}
                required
              />
            </div>
          </div>
          
          <div className="form-section">
            <h3>
              <DollarSign size={18} />
              Pricing
            </h3>
            
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
                      name="priceType"
                      value={option.id}
                      checked={formData.priceType === option.id}
                      onChange={(e) => setFormData({...formData, priceType: e.target.value})}
                    />
                    <span className="radio-content">
                      <span className="radio-icon">{option.icon}</span>
                      <span className="radio-text">{option.label}</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
            
            {formData.priceType === 'hourly' && (
              <div className="form-group">
                <label>Hourly Rate (₦) *</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  placeholder="e.g., 5000"
                  min="0"
                  required
                />
              </div>
            )}
            
            {formData.priceType === 'project' && (
              <div className="form-group">
                <label>Project Price (₦) *</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  placeholder="e.g., 50000"
                  min="0"
                  required
                />
              </div>
            )}
            
            {formData.priceType === 'monthly' && (
              <div className="form-group">
                <label>Monthly Retainer (₦) *</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  placeholder="e.g., 100000"
                  min="0"
                  required
                />
              </div>
            )}
            
            {formData.priceType === 'custom' && (
              <div className="form-group">
                <label>Price Range (₦)</label>
                <div className="form-row">
                  <input
                    type="number"
                    placeholder="Minimum"
                    value={formData.priceRange.min}
                    onChange={(e) => setFormData({
                      ...formData,
                      priceRange: {...formData.priceRange, min: e.target.value}
                    })}
                  />
                  <span className="range-separator">to</span>
                  <input
                    type="number"
                    placeholder="Maximum"
                    value={formData.priceRange.max}
                    onChange={(e) => setFormData({
                      ...formData,
                      priceRange: {...formData.priceRange, max: e.target.value}
                    })}
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
                  onChange={(e) => setFormData({...formData, discount: e.target.value})}
                  min="0"
                  max="100"
                />
                <span className="discount-suffix">% off</span>
              </div>
              <small>Offer a discount to attract first-time clients</small>
            </div>
          </div>
          
          <div className="form-section">
            <h3>
              <Clock size={18} />
              Availability & Timeline
            </h3>
            
            <div className="form-row">
              <div className="form-group">
                <label>Estimated Time</label>
                <input
                  type="text"
                  value={formData.estimatedTime}
                  onChange={(e) => setFormData({...formData, estimatedTime: e.target.value})}
                  placeholder="e.g., 2-3 days, 1 week, etc."
                />
              </div>
              
              <div className="form-group">
                <label>
                  <Users size={16} />
                  Team Size
                </label>
                <select
                  value={formData.teamSize}
                  onChange={(e) => setFormData({...formData, teamSize: parseInt(e.target.value)})}
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
                  placeholder="Start Date"
                  value={formData.availability.startDate}
                  onChange={(e) => setFormData({
                    ...formData,
                    availability: {...formData.availability, startDate: e.target.value}
                  })}
                />
                <span className="range-separator">to</span>
                <input
                  type="date"
                  placeholder="End Date"
                  value={formData.availability.endDate}
                  onChange={(e) => setFormData({
                    ...formData,
                    availability: {...formData.availability, endDate: e.target.value}
                  })}
                />
              </div>
            </div>
          </div>
          
          <div className="form-section">
            <h3>
              <MapPin size={18} />
              Service Area
            </h3>
            
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
                      name="coverageType"
                      value={option.id}
                      checked={formData.serviceArea.type === option.id}
                      onChange={(e) => setFormData({
                        ...formData,
                        serviceArea: {...formData.serviceArea, type: e.target.value}
                      })}
                    />
                    <span className="radio-text">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
            
            {formData.serviceArea.type === 'specific' && (
              <div className="form-group">
                <label>Specific Locations</label>
                <div className="tags-input">
                  <input
                    type="text"
                    placeholder="Add a location (e.g., Lekki Phase 1)"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && e.target.value.trim()) {
                        e.preventDefault();
                        setFormData({
                          ...formData,
                          serviceArea: {
                            ...formData.serviceArea,
                            locations: [...formData.serviceArea.locations, e.target.value.trim()]
                          }
                        });
                        e.target.value = '';
                      }
                    }}
                  />
                  <small>Press Enter to add multiple locations</small>
                </div>
                
                {formData.serviceArea.locations.length > 0 && (
                  <div className="tags-list">
                    {formData.serviceArea.locations.map((location, index) => (
                      <span key={index} className="tag">
                        {location}
                        <button
                          type="button"
                          onClick={() => {
                            const newLocations = [...formData.serviceArea.locations];
                            newLocations.splice(index, 1);
                            setFormData({
                              ...formData,
                              serviceArea: {...formData.serviceArea, locations: newLocations}
                            });
                          }}
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="form-section">
            <h3>
              <Shield size={18} />
              Requirements & Features
            </h3>
            
            <div className="form-group">
              <label>Client Requirements</label>
              <div className="requirements-input">
                <input
                  type="text"
                  placeholder="Add a requirement (e.g., Provide access to property)"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && e.target.value.trim()) {
                      e.preventDefault();
                      setFormData({
                        ...formData,
                        requirements: [...formData.requirements, e.target.value.trim()]
                      });
                      e.target.value = '';
                    }
                  }}
                />
                <small>What does the client need to provide?</small>
              </div>
              
              {formData.requirements.length > 0 && (
                <div className="requirements-list">
                  {formData.requirements.map((req, index) => (
                    <div key={index} className="requirement-item">
                      <span>{req}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const newReqs = [...formData.requirements];
                          newReqs.splice(index, 1);
                          setFormData({...formData, requirements: newReqs});
                        }}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="form-group">
              <label>Your Deliverables</label>
              <div className="deliverables-input">
                <input
                  type="text"
                  placeholder="Add a deliverable (e.g., Installation certificate)"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && e.target.value.trim()) {
                      e.preventDefault();
                      setFormData({
                        ...formData,
                        deliverables: [...formData.deliverables, e.target.value.trim()]
                      });
                      e.target.value = '';
                    }
                  }}
                />
                <small>What will you deliver to the client?</small>
              </div>
              
              {formData.deliverables.length > 0 && (
                <div className="deliverables-list">
                  {formData.deliverables.map((del, index) => (
                    <div key={index} className="deliverable-item">
                      <span>{del}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const newDels = [...formData.deliverables];
                          newDels.splice(index, 1);
                          setFormData({...formData, deliverables: newDels});
                        }}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="form-group">
              <label>Service Tags</label>
              <div className="tags-input">
                <input
                  type="text"
                  placeholder="Add tags (e.g., professional, reliable, certified)"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && e.target.value.trim()) {
                      e.preventDefault();
                      setFormData({
                        ...formData,
                        tags: [...formData.tags, e.target.value.trim()]
                      });
                      e.target.value = '';
                    }
                  }}
                />
                <small>Add relevant tags to help clients find your service</small>
              </div>
              
              {formData.tags.length > 0 && (
                <div className="tags-list">
                  {formData.tags.map((tag, index) => (
                    <span key={index} className="tag">
                      #{tag}
                      <button
                        type="button"
                        onClick={() => {
                          const newTags = [...formData.tags];
                          newTags.splice(index, 1);
                          setFormData({...formData, tags: newTags});
                        }}
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/providers/dashboard')}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              <Star size={18} />
              Post Service
            </button>
          </div>
        </form>
        
        {/* Tips Sidebar */}
        <div className="tips-sidebar">
          <div className="tip-card">
            <h4>Tips for a Great Listing</h4>
            <ul>
              <li>
                <strong>Clear Title:</strong> Be specific about what you offer
              </li>
              <li>
                <strong>Detailed Description:</strong> Include scope, process, and benefits
              </li>
              <li>
                <strong>Reasonable Pricing:</strong> Research market rates
              </li>
              <li>
                <strong>High-quality Images:</strong> Showcase your work
              </li>
              <li>
                <strong>Quick Response:</strong> Set realistic response times
              </li>
            </ul>
          </div>
          
          <div className="visibility-card">
            <h4>
              <Star size={16} />
              Boost Visibility
            </h4>
            <p>Get your service featured at the top of search results:</p>
            <ul>
              <li>Complete all profile details</li>
              <li>Add portfolio images</li>
              <li>Offer competitive pricing</li>
              <li>Maintain high response rate</li>
              <li>Collect client reviews</li>
            </ul>
            <button className="btn btn-primary btn-small">
              Learn About Premium
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicePostingForm;