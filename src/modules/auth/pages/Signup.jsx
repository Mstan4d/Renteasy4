// src/modules/auth/pages/Signup.jsx - UPDATED with Provider Form
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import { serviceCategories } from '../../marketplace/data/serviceCategories';
import { Briefcase, MapPin, FileText, CheckCircle, Building, Phone, Globe, Calendar } from 'lucide-react';
import './Signup.css';

const Signup = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    role: 'tenant',
    referralCode: ''
  });
  
  // Provider-specific form data
  const [providerFormData, setProviderFormData] = useState({
    businessName: '',
    businessType: 'individual', // 'individual' or 'company'
    yearsInBusiness: '',
    description: '',
    address: '',
    city: '',
    state: '',
    website: '',
    selectedServices: [],
    coverageStates: [],
    emergencyService: false,
    available24_7: false,
    registeredBusiness: false
  });
  
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errors, setErrors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCommissionInfo, setShowCommissionInfo] = useState(false);
  const [showProviderForm, setShowProviderForm] = useState(false);
  const [availableStates] = useState([
    'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno', 'Cross River', 
    'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 
    'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 
    'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
  ]);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const ROLES_CONFIG = [
    {
      value: 'tenant',
      label: 'Tenant',
      description: 'Looking to rent a property',
      canPostListings: false,
      hasCommission: false
    },
    {
      value: 'landlord',
      label: 'Landlord',
      description: 'Own property to rent out',
      canPostListings: true,
      hasCommission: true,
      commissionRate: '7.5%'
    },
    {
      value: 'manager',
      label: 'Property Manager',
      description: 'Manage properties for landlords',
      canPostListings: true,
      hasCommission: true,
      commissionRate: '2.5%'
    },
    {
      value: 'service-provider',
      label: 'Service Provider',
      description: 'Offer services (cleaning, repairs, etc.)',
      canPostListings: false,
      hasCommission: false
    },
    {
      value: 'estate-firm',
      label: 'Estate Firm',
      description: 'Real estate company or agency',
      canPostListings: true,
      hasCommission: true,
      commissionRate: 'Custom'
    }
  ];
  
  const ROLE_DASHBOARDS = {
    'tenant': '/dashboard',
    'landlord': '/dashboard',
    'manager': '/dashboard',
    'service-provider': '/dashboard',
    'estate-firm': '/dashboard'
  };
  
  // Get all available services from categories
  const [availableServices, setAvailableServices] = useState([]);
  
  useEffect(() => {
    // Load all services from categories
    const services = [];
    serviceCategories.forEach(category => {
      // Add main category as service option
      services.push({
        id: category.id,
        name: category.name,
        category: category.name,
        icon: category.icon
      });
      
      // Add subcategories if they exist
      if (category.subCategories) {
        category.subCategories.forEach(subCat => {
          services.push({
            id: subCat.id,
            name: subCat.name,
            category: category.name,
            icon: subCat.icon
          });
        });
      }
    });
    setAvailableServices(services);
  }, []);
  
  useEffect(() => {
    // Show provider form when role changes to service-provider
    setShowProviderForm(formData.role === 'service-provider');
    
    const selectedRole = ROLES_CONFIG.find(r => r.value === formData.role);
    setShowCommissionInfo(selectedRole?.hasCommission || false);
  }, [formData.role]);
  
  const handleInputChange = (e) => {
    const { id, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setTermsAccepted(checked);
    } else {
      if (id === 'email' && value.toLowerCase().includes('admin@renteasy.com')) {
        setErrors(['This email cannot be used for public signup. Admin accounts are created internally.']);
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        [id]: value
      }));
    }
    
    if (errors.length > 0) {
      setErrors([]);
    }
  };
  
  const handleProviderInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setProviderFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const toggleServiceSelection = (serviceId) => {
    setProviderFormData(prev => {
      const isSelected = prev.selectedServices.includes(serviceId);
      if (isSelected) {
        return {
          ...prev,
          selectedServices: prev.selectedServices.filter(id => id !== serviceId)
        };
      } else {
        return {
          ...prev,
          selectedServices: [...prev.selectedServices, serviceId]
        };
      }
    });
  };
  
  const toggleStateSelection = (state) => {
    setProviderFormData(prev => {
      const isSelected = prev.coverageStates.includes(state);
      if (isSelected) {
        return {
          ...prev,
          coverageStates: prev.coverageStates.filter(s => s !== state)
        };
      } else {
        return {
          ...prev,
          coverageStates: [...prev.coverageStates, state]
        };
      }
    });
  };
  
  const validateForm = () => {
    const newErrors = [];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[+]?[\d\s-]{10,}$/;
    
    // Basic form validation
    if (!formData.email.trim()) {
      newErrors.push('Email address is required');
    } else if (!emailRegex.test(formData.email)) {
      newErrors.push('Please enter a valid email address');
    }
    
    if (!formData.fullName.trim()) {
      newErrors.push('Full name is required');
    } else if (formData.fullName.trim().length < 2) {
      newErrors.push('Full name must be at least 2 characters');
    }
    
    if (!formData.phone.trim()) {
      newErrors.push('Phone number is required');
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.push('Please enter a valid phone number');
    }
    
    if (!formData.password) {
      newErrors.push('Password is required');
    } else if (formData.password.length < 8) {
      newErrors.push('Password must be at least 8 characters long');
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.push('Password must contain uppercase, lowercase, and numbers');
    }
    
    if (!formData.confirmPassword) {
      newErrors.push('Please confirm your password');
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.push('Passwords do not match');
    }
    
    // Provider-specific validation
    if (formData.role === 'service-provider') {
      if (!providerFormData.businessName.trim()) {
        newErrors.push('Business name is required for service providers');
      }
      
      if (providerFormData.selectedServices.length === 0) {
        newErrors.push('Please select at least one service you offer');
      }
      
      if (providerFormData.coverageStates.length === 0) {
        newErrors.push('Please select at least one state where you provide services');
      }
      
      if (!providerFormData.city.trim()) {
        newErrors.push('City is required');
      }
      
      if (!providerFormData.state.trim()) {
        newErrors.push('State is required');
      }
    }
    
    if (!termsAccepted) {
      newErrors.push('You must accept the Terms & Conditions and Privacy Policy');
    }
    
    return newErrors;
  };
  
  const generateUsername = (email) => {
    return email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '_');
  };
  
  const generateReferralCode = (username) => {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 6);
    return `${username.toUpperCase().substring(0, 4)}${randomStr}${timestamp.substring(0, 4)}`;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setIsLoading(false);
      return;
    }
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (formData.email.toLowerCase().includes('admin@renteasy.com')) {
        setErrors(['Admin accounts cannot be created through public signup.']);
        setIsLoading(false);
        return;
      }
      
      const username = generateUsername(formData.email);
      const userReferralCode = generateReferralCode(username);
      
      const userData = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email: formData.email,
        fullName: formData.fullName,
        username: username,
        phone: formData.phone,
        role: formData.role,
        referralCode: userReferralCode,
        referredBy: formData.referralCode || null,
        isVerified: false,
        isActive: true,
        createdAt: new Date().toISOString(),
        profileComplete: false,
        commissionEarned: 0,
        listings: [],
        preferences: {
          notifications: true,
          emailUpdates: true
        }
      };
      
      const selectedRole = ROLES_CONFIG.find(r => r.value === formData.role);
      if (selectedRole?.hasCommission) {
        userData.commissionRate = selectedRole.commissionRate;
        userData.payoutMethod = 'pending';
      }
      
      // For service providers, add provider-specific data
      if (formData.role === 'service-provider') {
        userData.providerInfo = {
          businessName: providerFormData.businessName,
          businessType: providerFormData.businessType,
          yearsInBusiness: providerFormData.yearsInBusiness,
          coverageStates: providerFormData.coverageStates,
          city: providerFormData.city,
          state: providerFormData.state
        };
      }
      
      const existingUsers = JSON.parse(localStorage.getItem('renteasy_users') || '[]');
      
      const userExists = existingUsers.find(u => u.email === formData.email);
      if (userExists) {
        setErrors(['This email is already registered. Please use a different email or try logging in.']);
        setIsLoading(false);
        return;
      }
      
      existingUsers.push(userData);
      localStorage.setItem('renteasy_users', JSON.stringify(existingUsers));
      
      // Create provider profile if role is service-provider
      if (formData.role === 'service-provider') {
        const providerProfile = {
          id: `provider_${Date.now()}`,
          userId: userData.id,
          email: userData.email,
          phone: userData.phone,
          ownerName: userData.fullName,
          businessName: providerFormData.businessName,
          businessType: providerFormData.businessType,
          description: providerFormData.description,
          address: providerFormData.address,
          city: providerFormData.city,
          state: providerFormData.state,
          coverage: {
            states: providerFormData.coverageStates
          },
          yearsInBusiness: parseInt(providerFormData.yearsInBusiness) || 0,
          website: providerFormData.website,
          services: providerFormData.selectedServices.map(serviceId => {
            const service = availableServices.find(s => s.id === serviceId);
            return service ? service.name : serviceId;
          }),
          tags: [
            ...(providerFormData.emergencyService ? ['emergency'] : []),
            ...(providerFormData.available24_7 ? ['24-7'] : []),
            ...(providerFormData.registeredBusiness ? ['licensed'] : [])
          ],
          status: 'pending',
          verificationLevel: 'basic',
          rating: 0,
          reviews: [],
          responseTime: 'Within 24 hours',
          responseRate: 0,
          views: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        // Save provider profile
        const existingProviders = JSON.parse(localStorage.getItem('serviceProviders') || '[]');
        existingProviders.push(providerProfile);
        localStorage.setItem('serviceProviders', JSON.stringify(existingProviders));
        
        // Save provider services
        const providerServices = JSON.parse(localStorage.getItem('providerServices') || '[]');
        providerFormData.selectedServices.forEach(serviceId => {
          const service = availableServices.find(s => s.id === serviceId);
          if (service) {
            providerServices.push({
              id: `service_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              providerId: userData.id,
              title: service.name,
              description: providerFormData.description || '',
              category: service.category,
              price: 0,
              createdAt: new Date().toISOString()
            });
          }
        });
        localStorage.setItem('providerServices', JSON.stringify(providerServices));
      }
      
      login({
        email: userData.email,
        role: userData.role,
        name: userData.fullName,
        username: userData.username,
        id: userData.id
      });
      
      alert(`Welcome to RentEasy, ${userData.fullName}! Your referral code is: ${userData.referralCode}`);
      
      const dashboardPath = ROLE_DASHBOARDS[formData.role] || '/dashboard';
      navigate(dashboardPath);
      
    } catch (error) {
      console.error('Registration error:', error);
      
      if (error.message.includes('email already exists')) {
        setErrors(['This email is already registered. Please use a different email or try logging in.']);
      } else if (error.message.includes('network')) {
        setErrors(['Network error. Please check your internet connection and try again.']);
      } else {
        setErrors(['Registration failed. Please try again or contact support.']);
      }
      
    } finally {
      setIsLoading(false);
    }
  };
  
  const getRoleDescription = () => {
    const role = ROLES_CONFIG.find(r => r.value === formData.role);
    return role ? role.description : '';
  };
  
  const getCommissionInfo = () => {
    const role = ROLES_CONFIG.find(r => r.value === formData.role);
    
    if (!role?.hasCommission) return null;
    
    return (
      <div className="commission-info">
        <h4>Commission Information</h4>
        <p>
          As a {role.label}, you'll earn <strong>{role.commissionRate}</strong> commission 
          on successful rentals through RentEasy.
        </p>
        <div className="commission-breakdown">
          <p><small>Commission breakdown:</small></p>
          <ul>
            <li>Platform fee: 4%</li>
            {role.value === 'landlord' && <li>Your commission: 7.5%</li>}
            {role.value === 'manager' && <li>Your commission: 2.5%</li>}
            {role.value === 'estate-firm' && <li>Your commission: Custom rate</li>}
            <li>Referral bonus: 1% (when applicable)</li>
          </ul>
        </div>
      </div>
    );
  };
  
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Group services by category for better organization
  const servicesByCategory = {};
  availableServices.forEach(service => {
    if (!servicesByCategory[service.category]) {
      servicesByCategory[service.category] = [];
    }
    servicesByCategory[service.category].push(service);
  });
  
  return (
    <div className="signup-container">
      <div className="signup-card">
        <div className="signup-header">
          <h2 className="signup-title">Join RentEasy</h2>
          <p className="signup-subtitle">
            Create your account and start your rental journey today
          </p>
        </div>
        
        {errors.length > 0 && (
          <div className="error-alert" role="alert">
            <h4 className="error-title">Please fix the following:</h4>
            {errors.map((error, index) => (
              <p key={index} className="error-text">
                ⚠️ {error}
              </p>
            ))}
          </div>
        )}
        
        {isDevelopment && (
          <div className="admin-warning-dev">
            <div className="warning-icon">⚠️</div>
            <div className="warning-content">
              <p><strong>Note for Development:</strong> Admin accounts cannot be created through public signup.</p>
              <p>Use the admin login button on the login page or contact system administrator.</p>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="signup-form" noValidate>
          <fieldset className="form-section">
            <legend className="section-title">Personal Information</legend>
            
            <div className="form-group">
              <label htmlFor="fullName" className="form-label">Full Name *</label>
              <input
                type="text"
                id="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter your full name"
                disabled={isLoading}
                aria-required="true"
              />
              <small className="form-help">As it appears on your ID card</small>
            </div>
            
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email Address *</label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter your email"
                disabled={isLoading}
                aria-required="true"
              />
              <small className="form-help">We'll send verification to this address</small>
            </div>
            
            <div className="form-group">
              <label htmlFor="phone" className="form-label">Phone Number *</label>
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="form-input"
                placeholder="e.g., +234 801 234 5678"
                disabled={isLoading}
                aria-required="true"
              />
              <small className="form-help">Used for property-related communications</small>
            </div>
          </fieldset>
          
          <fieldset className="form-section">
            <legend className="section-title">Account Security</legend>
            
            <div className="form-group">
              <label htmlFor="password" className="form-label">Password *</label>
              <input
                type="password"
                id="password"
                value={formData.password}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Create a strong password"
                disabled={isLoading}
                aria-required="true"
              />
              <small className="form-help">Minimum 8 characters with uppercase, lowercase, and numbers</small>
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">Confirm Password *</label>
              <input
                type="password"
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Re-enter your password"
                disabled={isLoading}
                aria-required="true"
              />
            </div>
          </fieldset>
          
          <fieldset className="form-section">
            <legend className="section-title">I want to join as a...</legend>
            
            <div className="form-group">
              <label htmlFor="role" className="form-label">Select Your Role *</label>
              <select
                id="role"
                value={formData.role}
                onChange={handleInputChange}
                className="form-select"
                disabled={isLoading}
                aria-required="true"
              >
                {ROLES_CONFIG.map(role => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
              <p className="role-description">{getRoleDescription()}</p>
            </div>
            
            {showCommissionInfo && getCommissionInfo()}
            
            <div className="form-group">
              <label htmlFor="referralCode" className="form-label">Referral Code (Optional)</label>
              <input
                type="text"
                id="referralCode"
                value={formData.referralCode}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter referral code if you have one"
                disabled={isLoading}
              />
              <small className="form-help">Get 1% commission bonus when you refer others</small>
            </div>
          </fieldset>
          
          {/* Service Provider Specific Form */}
          {showProviderForm && (
            <fieldset className="form-section provider-form">
              <legend className="section-title">
                <Briefcase size={20} />
                Business Information
              </legend>
              
              <div className="form-group">
                <label htmlFor="businessName" className="form-label">Business Name *</label>
                <input
                  type="text"
                  id="businessName"
                  name="businessName"
                  value={providerFormData.businessName}
                  onChange={handleProviderInputChange}
                  className="form-input"
                  placeholder="Enter your business name"
                  disabled={isLoading}
                  aria-required="true"
                />
                <small className="form-help">This will be displayed in the marketplace</small>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="businessType" className="form-label">Business Type</label>
                  <select
                    id="businessType"
                    name="businessType"
                    value={providerFormData.businessType}
                    onChange={handleProviderInputChange}
                    className="form-select"
                    disabled={isLoading}
                  >
                    <option value="individual">Individual/Proprietor</option>
                    <option value="company">Registered Company</option>
                    <option value="partnership">Partnership</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="yearsInBusiness" className="form-label">Years in Business</label>
                  <input
                    type="number"
                    id="yearsInBusiness"
                    name="yearsInBusiness"
                    value={providerFormData.yearsInBusiness}
                    onChange={handleProviderInputChange}
                    className="form-input"
                    placeholder="e.g., 5"
                    min="0"
                    max="50"
                    disabled={isLoading}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="description" className="form-label">Business Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={providerFormData.description}
                  onChange={handleProviderInputChange}
                  className="form-textarea"
                  placeholder="Describe your business and services..."
                  rows="3"
                  disabled={isLoading}
                />
                <small className="form-help">This helps clients understand what you offer</small>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="city" className="form-label">City *</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={providerFormData.city}
                    onChange={handleProviderInputChange}
                    className="form-input"
                    placeholder="e.g., Lagos"
                    disabled={isLoading}
                    aria-required="true"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="state" className="form-label">State *</label>
                  <select
                    id="state"
                    name="state"
                    value={providerFormData.state}
                    onChange={handleProviderInputChange}
                    className="form-select"
                    disabled={isLoading}
                    aria-required="true"
                  >
                    <option value="">Select State</option>
                    {availableStates.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="address" className="form-label">Business Address</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={providerFormData.address}
                  onChange={handleProviderInputChange}
                  className="form-input"
                  placeholder="Full business address"
                  disabled={isLoading}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="website" className="form-label">Website</label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={providerFormData.website}
                  onChange={handleProviderInputChange}
                  className="form-input"
                  placeholder="https://yourbusiness.com"
                  disabled={isLoading}
                />
              </div>
              
              {/* Service Selection */}
              <div className="form-group">
                <label className="form-label">Services You Offer *</label>
                <div className="services-selection">
                  {Object.entries(servicesByCategory).map(([category, services]) => (
                    <div key={category} className="service-category">
                      <h4 className="service-category-title">{category}</h4>
                      <div className="service-options">
                        {services.map(service => (
                          <label key={service.id} className="service-option">
                            <input
                              type="checkbox"
                              checked={providerFormData.selectedServices.includes(service.id)}
                              onChange={() => toggleServiceSelection(service.id)}
                              disabled={isLoading}
                              className="service-checkbox"
                            />
                            <span className="service-label">
                              <span className="service-icon">{service.icon}</span>
                              {service.name}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <small className="form-help">
                  Selected: {providerFormData.selectedServices.length} services
                </small>
              </div>
              
              {/* Coverage Areas */}
              <div className="form-group">
                <label className="form-label">Coverage States *</label>
                <div className="states-selection">
                  {availableStates.map(state => (
                    <label key={state} className="state-option">
                      <input
                        type="checkbox"
                        checked={providerFormData.coverageStates.includes(state)}
                        onChange={() => toggleStateSelection(state)}
                        disabled={isLoading}
                        className="state-checkbox"
                      />
                      <span className="state-label">{state}</span>
                    </label>
                  ))}
                </div>
                <small className="form-help">
                  Selected: {providerFormData.coverageStates.length} states
                </small>
              </div>
              
              {/* Service Features */}
              <div className="form-group">
                <label className="form-label">Service Features</label>
                <div className="features-grid">
                  <label className="feature-option">
                    <input
                      type="checkbox"
                      name="emergencyService"
                      checked={providerFormData.emergencyService}
                      onChange={handleProviderInputChange}
                      disabled={isLoading}
                      className="feature-checkbox"
                    />
                    <span className="feature-label">
                      <span className="feature-icon">🚨</span>
                      Emergency Service
                    </span>
                  </label>
                  
                  <label className="feature-option">
                    <input
                      type="checkbox"
                      name="available24_7"
                      checked={providerFormData.available24_7}
                      onChange={handleProviderInputChange}
                      disabled={isLoading}
                      className="feature-checkbox"
                    />
                    <span className="feature-label">
                      <span className="feature-icon">⏰</span>
                      24/7 Available
                    </span>
                  </label>
                  
                  <label className="feature-option">
                    <input
                      type="checkbox"
                      name="registeredBusiness"
                      checked={providerFormData.registeredBusiness}
                      onChange={handleProviderInputChange}
                      disabled={isLoading}
                      className="feature-checkbox"
                    />
                    <span className="feature-label">
                      <span className="feature-icon">📜</span>
                      Registered Business
                    </span>
                  </label>
                </div>
              </div>
            </fieldset>
          )}
          
          <div className="terms-group">
            <label className="terms-label">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={handleInputChange}
                disabled={isLoading}
                className="terms-checkbox"
              />
              <span className="terms-text">
                I agree to the{' '}
                <Link to="/terms" className="terms-link">Terms & Conditions</Link>
                {' '}and{' '}
                <Link to="/privacy" className="terms-link">Privacy Policy</Link>
                *
              </span>
            </label>
          </div>
          
          <button 
            type="submit" 
            className="submit-button"
            disabled={isLoading || !termsAccepted}
            aria-busy={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner" aria-hidden="true"></span>
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>
        
        <div className="divider">
          <span className="divider-text">Already have an account?</span>
        </div>
        
        <div className="login-link">
          <Link to="/login" className="login-action">
            Sign in to your account
          </Link>
        </div>
        
        <div className="benefits-section">
          <h4 className="benefits-title">Why join RentEasy?</h4>
          <ul className="benefits-list">
            <li>✓ Rent directly without agent commissions</li>
            <li>✓ Verified properties and landlords</li>
            <li>✓ Earn commissions as a landlord or manager</li>
            <li>✓ Secure communication and documentation</li>
            <li>✓ Property management tools</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Signup;