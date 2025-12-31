// src/modules/providers/pages/ProviderRegistration.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import { 
  Building, UserCheck, CreditCard, CheckCircle, 
  MapPin, Phone, Mail, Globe, FileText, 
  Award, Clock, Users, Shield, Star 
} from 'lucide-react';
import './ProviderRegistration.css';

const serviceCategories = [
  { id: 'property-management', name: 'Property Management', icon: '🏢' },
  { id: 'skilled-trades', name: 'Skilled Trades', icon: '🔧' },
  { id: 'cleaning-services', name: 'Cleaning Services', icon: '🧹' },
  { id: 'maintenance-repairs', name: 'Maintenance & Repairs', icon: '🛠️' },
  { id: 'legal-services', name: 'Legal Services', icon: '⚖️' },
  { id: 'financial-services', name: 'Financial Services', icon: '💰' },
  { id: 'security-services', name: 'Security Services', icon: '🔒' },
  { id: 'landscaping', name: 'Landscaping', icon: '🌿' },
  { id: 'interior-design', name: 'Interior Design', icon: '🎨' },
  { id: 'moving-services', name: 'Moving Services', icon: '🚚' }
];

const pricingModels = [
  { id: 'hourly', name: 'Hourly Rate', description: 'Charge per hour of work' },
  { id: 'project', name: 'Project-based', description: 'Fixed price per project' },
  { id: 'monthly', name: 'Monthly Retainer', description: 'Monthly subscription' },
  { id: 'commission', name: 'Commission-based', description: 'Percentage of transaction' },
  { id: 'custom', name: 'Custom Pricing', description: 'Negotiable rates' }
];

const ProviderRegistration = () => {
  const navigate = useNavigate();
  const { user, updateUserRole } = useAuth();
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    businessName: '',
    businessType: 'individual', // individual, company, partnership
    ownerName: '',
    email: '',
    phone: '',
    website: '',
    yearsInBusiness: 1,
    employeeCount: '1-5',
    
    // Step 2: Service Details
    categories: [],
    services: [],
    description: '',
    serviceAreas: [], // residential, commercial, industrial
    coverage: {
      states: [],
      lgAs: [],
      nationwide: false
    },
    
    // Step 3: Pricing & Availability
    pricingModel: 'hourly',
    hourlyRate: '',
    projectRate: '',
    monthlyRetainer: '',
    commissionRate: '',
    availability: {
      emergency: false,
      weekends: false,
      holidays: false,
      '24-7': false
    },
    responseTime: '24-hours',
    
    // Step 4: Verification & Documents
    isRegisteredBusiness: false,
    taxId: '',
    cacNumber: '',
    documents: {
      idCard: null,
      businessRegistration: null,
      taxCertificate: null
    },
    
    // Step 5: Profile & Branding
    logo: null,
    coverImage: null,
    portfolioImages: [],
    certifications: [],
    testimonials: []
  });
  
  const [loading, setLoading] = useState(false);
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleNestedChange = (parent, child, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [child]: value
      }
    }));
  };
  
  const handleArrayToggle = (arrayName, value) => {
    setFormData(prev => {
      const currentArray = prev[arrayName] || [];
      const updatedArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      return { ...prev, [arrayName]: updatedArray };
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Save provider data to localStorage
      const providers = JSON.parse(localStorage.getItem('serviceProviders') || '[]');
      const newProvider = {
        id: `PROV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...formData,
        userId: user?.id,
        email: user?.email || formData.email,
        status: 'pending', // pending, approved, rejected
        verificationLevel: 'basic', // basic, verified, premium
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        rating: 0,
        reviews: [],
        healthScore: 50, // Starting score
        featured: false
      };
      
      providers.push(newProvider);
      localStorage.setItem('serviceProviders', JSON.stringify(providers));
      
      // Update user role
      if (user) {
        await updateUserRole('service-provider');
      }
      
      // Show success message
      alert('Registration submitted successfully! Your account will be reviewed within 24-48 hours.');
      navigate('/providers/dashboard');
      
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <div className="registration-step">
            <h2 className="step-title">Business Information</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>
                  <Building size={16} />
                  Business Name *
                </label>
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleInputChange}
                  placeholder="Your business name"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>
                  <UserCheck size={16} />
                  Business Type *
                </label>
                <select
                  name="businessType"
                  value={formData.businessType}
                  onChange={handleInputChange}
                  required
                >
                  <option value="individual">Individual/Freelancer</option>
                  <option value="company">Registered Company</option>
                  <option value="partnership">Partnership</option>
                  <option value="estate-firm">Estate Firm</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>
                  <UserCheck size={16} />
                  Owner/Contact Person *
                </label>
                <input
                  type="text"
                  name="ownerName"
                  value={formData.ownerName}
                  onChange={handleInputChange}
                  placeholder="Full name"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>
                  <Phone size={16} />
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+234 XXX XXX XXXX"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>
                  <Mail size={16} />
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="business@email.com"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>
                  <Globe size={16} />
                  Website (Optional)
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="https://yourwebsite.com"
                />
              </div>
              
              <div className="form-group">
                <label>
                  <Clock size={16} />
                  Years in Business *
                </label>
                <select
                  name="yearsInBusiness"
                  value={formData.yearsInBusiness}
                  onChange={handleInputChange}
                  required
                >
                  {[1,2,3,4,5,6,7,8,9,10,'10+'].map(year => (
                    <option key={year} value={year}>{year} {year === 1 ? 'year' : 'years'}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>
                  <Users size={16} />
                  Team Size *
                </label>
                <select
                  name="employeeCount"
                  value={formData.employeeCount}
                  onChange={handleInputChange}
                  required
                >
                  <option value="1-5">1-5 employees</option>
                  <option value="6-10">6-10 employees</option>
                  <option value="11-20">11-20 employees</option>
                  <option value="21-50">21-50 employees</option>
                  <option value="50+">50+ employees</option>
                </select>
              </div>
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="registration-step">
            <h2 className="step-title">Service Details</h2>
            
            <div className="form-group">
              <label>
                <Award size={16} />
                Service Categories *
              </label>
              <div className="categories-grid">
                {serviceCategories.map(category => (
                  <div
                    key={category.id}
                    className={`category-card ${
                      formData.categories.includes(category.id) ? 'selected' : ''
                    }`}
                    onClick={() => handleArrayToggle('categories', category.id)}
                  >
                    <span className="category-icon">{category.icon}</span>
                    <span className="category-name">{category.name}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="form-group">
              <label>Services Offered *</label>
              <div className="services-input">
                <input
                  type="text"
                  placeholder="Add a service (e.g., Electrical Installation)"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && e.target.value.trim()) {
                      e.preventDefault();
                      setFormData(prev => ({
                        ...prev,
                        services: [...prev.services, e.target.value.trim()]
                      }));
                      e.target.value = '';
                    }
                  }}
                />
                <small>Press Enter to add multiple services</small>
              </div>
              
              {formData.services.length > 0 && (
                <div className="services-list">
                  {formData.services.map((service, index) => (
                    <span key={index} className="service-tag">
                      {service}
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            services: prev.services.filter((_, i) => i !== index)
                          }));
                        }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            
            <div className="form-group">
              <label>Service Areas *</label>
              <div className="checkbox-group">
                {['residential', 'commercial', 'industrial'].map(area => (
                  <label key={area} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.serviceAreas.includes(area)}
                      onChange={() => handleArrayToggle('serviceAreas', area)}
                    />
                    <span className="checkbox-text">
                      {area.charAt(0).toUpperCase() + area.slice(1)} Properties
                    </span>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="form-group">
              <label>Service Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your services, expertise, and what makes you unique..."
                rows={4}
                required
              />
            </div>
            
            <div className="form-group">
              <label>
                <MapPin size={16} />
                Service Coverage *
              </label>
              <div className="coverage-section">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.coverage.nationwide}
                    onChange={(e) => handleNestedChange('coverage', 'nationwide', e.target.checked)}
                  />
                  <span className="checkbox-text">Nationwide Coverage</span>
                </label>
                
                {!formData.coverage.nationwide && (
                  <>
                    <div className="form-group-sm">
                      <label>States Served</label>
                      <input
                        type="text"
                        placeholder="Lagos, Abuja, Rivers (comma separated)"
                        onChange={(e) => handleNestedChange('coverage', 'states', e.target.value.split(',').map(s => s.trim()))}
                      />
                    </div>
                    
                    <div className="form-group-sm">
                      <label>Specific LGAs/Cities</label>
                      <input
                        type="text"
                        placeholder="Lekki, Victoria Island, Ikeja"
                        onChange={(e) => handleNestedChange('coverage', 'lgAs', e.target.value.split(',').map(s => s.trim()))}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="registration-step">
            <h2 className="step-title">Pricing & Availability</h2>
            
            <div className="form-group">
              <label>
                <CreditCard size={16} />
                Pricing Model *
              </label>
              <div className="pricing-grid">
                {pricingModels.map(model => (
                  <div
                    key={model.id}
                    className={`pricing-card ${
                      formData.pricingModel === model.id ? 'selected' : ''
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, pricingModel: model.id }))}
                  >
                    <h4>{model.name}</h4>
                    <p>{model.description}</p>
                  </div>
                ))}
              </div>
            </div>
            
            {formData.pricingModel === 'hourly' && (
              <div className="form-group">
                <label>Hourly Rate (₦) *</label>
                <input
                  type="number"
                  name="hourlyRate"
                  value={formData.hourlyRate}
                  onChange={handleInputChange}
                  placeholder="e.g., 5000"
                  min="0"
                  required
                />
              </div>
            )}
            
            {formData.pricingModel === 'project' && (
              <div className="form-group">
                <label>Average Project Rate (₦) *</label>
                <input
                  type="number"
                  name="projectRate"
                  value={formData.projectRate}
                  onChange={handleInputChange}
                  placeholder="e.g., 50000"
                  min="0"
                  required
                />
              </div>
            )}
            
            {formData.pricingModel === 'monthly' && (
              <div className="form-group">
                <label>Monthly Retainer (₦) *</label>
                <input
                  type="number"
                  name="monthlyRetainer"
                  value={formData.monthlyRetainer}
                  onChange={handleInputChange}
                  placeholder="e.g., 100000"
                  min="0"
                  required
                />
              </div>
            )}
            
            <div className="form-group">
              <label>Availability *</label>
              <div className="checkbox-grid">
                {Object.entries(formData.availability).map(([key, value]) => (
                  <label key={key} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => handleNestedChange('availability', key, e.target.checked)}
                    />
                    <span className="checkbox-text">
                      {key === '24-7' ? '24/7 Service' : 
                       key === 'emergency' ? 'Emergency Services' :
                       key.charAt(0).toUpperCase() + key.slice(1)}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="form-group">
              <label>Typical Response Time *</label>
              <select
                name="responseTime"
                value={formData.responseTime}
                onChange={handleInputChange}
                required
              >
                <option value="1-hour">Within 1 hour</option>
                <option value="2-hours">Within 2 hours</option>
                <option value="24-hours">Within 24 hours</option>
                <option value="48-hours">Within 48 hours</option>
                <option value="varies">Varies</option>
              </select>
            </div>
          </div>
        );
        
      case 4:
        return (
          <div className="registration-step">
            <h2 className="step-title">Verification & Documents</h2>
            
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="isRegisteredBusiness"
                  checked={formData.isRegisteredBusiness}
                  onChange={handleInputChange}
                />
                <span className="checkbox-text">
                  <Shield size={16} />
                  This is a registered business
                </span>
              </label>
            </div>
            
            {formData.isRegisteredBusiness && (
              <>
                <div className="form-group">
                  <label>CAC Registration Number</label>
                  <input
                    type="text"
                    name="cacNumber"
                    value={formData.cacNumber}
                    onChange={handleInputChange}
                    placeholder="RC-XXXXXX"
                  />
                </div>
                
                <div className="form-group">
                  <label>Tax Identification Number (TIN)</label>
                  <input
                    type="text"
                    name="taxId"
                    value={formData.taxId}
                    onChange={handleInputChange}
                    placeholder="XXXXX-XXXX"
                  />
                </div>
              </>
            )}
            
            <div className="form-group">
              <label>Upload Documents (Optional)</label>
              <div className="document-uploads">
                <div className="upload-box">
                  <FileText size={24} />
                  <p>Business Registration</p>
                  <small>PDF, JPG, PNG (Max 5MB)</small>
                </div>
                <div className="upload-box">
                  <FileText size={24} />
                  <p>Tax Certificate</p>
                  <small>PDF, JPG, PNG (Max 5MB)</small>
                </div>
                <div className="upload-box">
                  <UserCheck size={24} />
                  <p>ID Card</p>
                  <small>PDF, JPG, PNG (Max 5MB)</small>
                </div>
              </div>
            </div>
            
            <div className="verification-benefits">
              <h4>
                <Star size={16} />
                Verification Benefits
              </h4>
              <ul>
                <li>✓ Higher ranking in search results</li>
                <li>✓ Verified badge on your profile</li>
                <li>✓ Access to premium leads</li>
                <li>✓ Increased customer trust</li>
                <li>✓ Priority customer support</li>
              </ul>
            </div>
          </div>
        );
        
      case 5:
        return (
          <div className="registration-step">
            <h2 className="step-title">Review & Submit</h2>
            
            <div className="review-summary">
              <div className="summary-section">
                <h4>
                  <Building size={16} />
                  Business Details
                </h4>
                <p><strong>Name:</strong> {formData.businessName}</p>
                <p><strong>Type:</strong> {formData.businessType}</p>
                <p><strong>Contact:</strong> {formData.ownerName}</p>
                <p><strong>Phone:</strong> {formData.phone}</p>
              </div>
              
              <div className="summary-section">
                <h4>
                  <Award size={16} />
                  Services
                </h4>
                <p><strong>Categories:</strong> {formData.categories.length}</p>
                <p><strong>Services:</strong> {formData.services.slice(0, 3).join(', ')}...</p>
                <p><strong>Coverage:</strong> {formData.coverage.nationwide ? 'Nationwide' : 'Selected areas'}</p>
              </div>
              
              <div className="summary-section">
                <h4>
                  <CreditCard size={16} />
                  Pricing & Availability
                </h4>
                <p><strong>Model:</strong> {formData.pricingModel}</p>
                <p><strong>Response Time:</strong> {formData.responseTime}</p>
                <p><strong>Availability:</strong> {
                  Object.entries(formData.availability)
                    .filter(([_, value]) => value)
                    .map(([key]) => key)
                    .join(', ')
                }</p>
              </div>
            </div>
            
            <div className="terms-agreement">
              <label className="checkbox-label">
                <input type="checkbox" required />
                <span className="checkbox-text">
                  I agree to the <Link to="/terms">Terms of Service</Link> and <Link to="/privacy">Privacy Policy</Link>
                </span>
              </label>
              
              <label className="checkbox-label">
                <input type="checkbox" required />
                <span className="checkbox-text">
                  I understand that RentEasy charges a 2% commission on successful service connections
                </span>
              </label>
              
              <label className="checkbox-label">
                <input type="checkbox" required />
                <span className="checkbox-text">
                  I will maintain professional standards and respond to client inquiries promptly
                </span>
              </label>
            </div>
            
            <div className="submit-section">
              <button
                type="submit"
                className="btn btn-primary btn-large"
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Complete Registration'}
              </button>
              <p className="disclaimer">
                Your application will be reviewed within 24-48 hours. You'll receive an email once approved.
              </p>
            </div>
          </div>
        );
    }
  };
  
  return (
    <div className="provider-registration">
      <div className="registration-container">
        {/* Header */}
        <header className="registration-header">
          <h1>
            <span className="highlight">Join</span> Our Professional Services Network
          </h1>
          <p className="subtitle">
            Connect with thousands of clients needing your expertise. Grow your business with RentEasy.
          </p>
        </header>
        
        {/* Progress Bar */}
        <div className="progress-bar">
          {[1,2,3,4,5].map((stepNum) => (
            <div
              key={stepNum}
              className={`progress-step ${step === stepNum ? 'active' : ''} ${step > stepNum ? 'completed' : ''}`}
              onClick={() => step > stepNum && setStep(stepNum)}
            >
              <div className="step-number">
                {step > stepNum ? <CheckCircle size={16} /> : stepNum}
              </div>
              <div className="step-label">
                {stepNum === 1 && 'Business Info'}
                {stepNum === 2 && 'Services'}
                {stepNum === 3 && 'Pricing'}
                {stepNum === 4 && 'Verification'}
                {stepNum === 5 && 'Review'}
              </div>
            </div>
          ))}
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="registration-form">
          {renderStep()}
          
          {/* Navigation Buttons */}
          <div className="form-navigation">
            {step > 1 && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setStep(step - 1)}
              >
                ← Previous
              </button>
            )}
            
            {step < 5 && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setStep(step + 1)}
              >
                Next →
              </button>
            )}
          </div>
        </form>
        
        {/* Benefits Sidebar */}
        <aside className="benefits-sidebar">
          <div className="benefits-card">
            <h3>Why Join?</h3>
            <ul className="benefits-list">
              <li>
                <CheckCircle size={18} />
                <div>
                  <strong>Access to Clients</strong>
                  <small>Thousands of property owners & managers</small>
                </div>
              </li>
              <li>
                <CheckCircle size={18} />
                <div>
                  <strong>Verified Leads</strong>
                  <small>Pre-screened, quality service requests</small>
                </div>
              </li>
              <li>
                <CheckCircle size={18} />
                <div>
                  <strong>Business Tools</strong>
                  <small>Free dashboard & management tools</small>
                </div>
              </li>
              <li>
                <CheckCircle size={18} />
                <div>
                  <strong>Growth Opportunities</strong>
                  <small>Scale your business with our network</small>
                </div>
              </li>
              <li>
                <CheckCircle size={18} />
                <div>
                  <strong>Trust & Credibility</strong>
                  <small>Verified badge increases customer trust</small>
                </div>
              </li>
            </ul>
            
            <div className="commission-notice">
              <h4>Commission Structure</h4>
              <div className="commission-rates">
                <div className="rate-item">
                  <span className="rate">2%</span>
                  <span className="label">On successful hires</span>
                </div>
                <div className="rate-item">
                  <span className="rate">0%</span>
                  <span className="label">On initial contact</span>
                </div>
                <div className="rate-item">
                  <span className="rate">Free</span>
                  <span className="label">Profile listing</span>
                </div>
              </div>
            </div>
            
            <div className="support-info">
              <p>
                <strong>Need help?</strong> Contact our provider support team:
              </p>
              <p className="support-contact">
                📞 01-700-8000 | ✉️ providers@renteasy.com
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ProviderRegistration;