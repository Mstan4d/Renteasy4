// src/modules/providers/pages/ProviderPostService.jsx
import React, { useState } from 'react';
import { 
  Upload, X, Plus, DollarSign,
  Clock, MapPin, Calendar, Tag,
  Hash, BookOpen, CheckCircle,
  AlertCircle, Package, Users,
  Briefcase, Home, Building,
  Image as ImageIcon, FileText
} from 'lucide-react';

const ProviderPostService = () => {
  const [step, setStep] = useState(1);
  const [images, setImages] = useState([]);
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    serviceTitle: '',
    serviceCategory: '',
    serviceType: 'one-time', // one-time, recurring, subscription
    description: '',
    
    // Step 2: Details
    experienceYears: '',
    teamSize: '',
    equipmentProvided: false,
    materialsIncluded: false,
    certifications: [],
    
    // Step 3: Pricing
    pricingModel: 'fixed', // fixed, hourly, per-unit
    basePrice: '',
    hourlyRate: '',
    unitType: '',
    pricePerUnit: '',
    minPrice: '',
    maxPrice: '',
    depositRequired: false,
    depositAmount: '',
    
    // Step 4: Availability & Location
    serviceAreas: [],
    workingHours: {
      monday: { from: '09:00', to: '17:00', available: true },
      tuesday: { from: '09:00', to: '17:00', available: true },
      wednesday: { from: '09:00', to: '17:00', available: true },
      thursday: { from: '09:00', to: '17:00', available: true },
      friday: { from: '09:00', to: '17:00', available: true },
      saturday: { from: '10:00', to: '14:00', available: false },
      sunday: { from: '', to: '', available: false }
    },
    leadTime: '24', // hours
    sameDayService: false,
    
    // Step 5: Features & Requirements
    features: [],
    requirements: [],
    tags: []
  });

  const categories = [
    { id: 'cleaning', name: 'Cleaning Services', icon: '🧹' },
    { id: 'painting', name: 'Painting', icon: '🎨' },
    { id: 'plumbing', name: 'Plumbing', icon: '🔧' },
    { id: 'electrical', name: 'Electrical', icon: '⚡' },
    { id: 'security', name: 'Security Installation', icon: '🔒' },
    { id: 'moving', name: 'Moving Services', icon: '🚚' },
    { id: 'gardening', name: 'Gardening', icon: '🌿' },
    { id: 'pest-control', name: 'Pest Control', icon: '🐜' },
    { id: 'ac-repair', name: 'AC Repair', icon: '❄️' },
    { id: 'carpentry', name: 'Carpentry', icon: '🪚' }
  ];

  const featuresList = [
    'Free Consultation',
    'Same Day Service',
    'Weekend Service',
    'Emergency Service',
    'Guaranteed Work',
    'Warranty Included',
    'Eco-Friendly',
    'Insurance Covered',
    'License Certified',
    'Background Checked'
  ];

  const requirementsList = [
    'Deposit Required',
    'ID Verification',
    'Site Visit Required',
    'Material Cost Separate',
    'Parking Space Needed',
    'Power Source Required',
    'Water Access Required',
    'Clear Workspace'
  ];

  const styles = {
    container: {
      maxWidth: '800px',
      margin: '0 auto',
      padding: '1rem',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    header: {
      marginBottom: '2rem'
    },
    title: {
      fontSize: '1.875rem',
      fontWeight: '700',
      color: '#1f2937',
      marginBottom: '0.5rem'
    },
    subtitle: {
      color: '#6b7280',
      fontSize: '1rem'
    },
    progressBar: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '3rem',
      position: 'relative'
    },
    progressLine: {
      position: 'absolute',
      top: '20px',
      left: '40px',
      right: '40px',
      height: '2px',
      background: '#e5e7eb',
      zIndex: 1
    },
    stepCircle: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: '600',
      background: '#e5e7eb',
      color: '#6b7280',
      position: 'relative',
      zIndex: 2,
      transition: 'all 0.3s ease'
    },
    activeStep: {
      background: '#2563eb',
      color: 'white'
    },
    completedStep: {
      background: '#10b981',
      color: 'white'
    },
    stepLabel: {
      position: 'absolute',
      top: '45px',
      fontSize: '0.75rem',
      color: '#6b7280',
      whiteSpace: 'nowrap',
      textAlign: 'center',
      minWidth: '80px'
    },
    activeLabel: {
      color: '#2563eb',
      fontWeight: '600'
    },
    formContainer: {
      background: 'white',
      borderRadius: '1rem',
      border: '1px solid #e5e7eb',
      padding: '2rem'
    },
    stepHeader: {
      marginBottom: '2rem'
    },
    stepTitle: {
      fontSize: '1.5rem',
      fontWeight: '600',
      color: '#1f2937',
      marginBottom: '0.5rem'
    },
    stepDescription: {
      color: '#6b7280',
      fontSize: '0.875rem'
    },
    formGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: '1.5rem'
    },
    '@media (min-width: 640px)': {
      formGrid: {
        gridTemplateColumns: 'repeat(2, 1fr)'
      }
    },
    formGroup: {
      marginBottom: '1rem'
    },
    formLabel: {
      display: 'block',
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#374151',
      marginBottom: '0.5rem'
    },
    requiredStar: {
      color: '#ef4444'
    },
    formInput: {
      width: '100%',
      padding: '0.75rem 1rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.5rem',
      fontSize: '0.875rem',
      color: '#374151',
      transition: 'border-color 0.2s'
    },
    formTextarea: {
      width: '100%',
      padding: '0.75rem 1rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.5rem',
      fontSize: '0.875rem',
      color: '#374151',
      minHeight: '120px',
      resize: 'vertical'
    },
    formSelect: {
      width: '100%',
      padding: '0.75rem 1rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.5rem',
      fontSize: '0.875rem',
      color: '#374151',
      background: 'white',
      cursor: 'pointer'
    },
    categoryGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
      gap: '1rem',
      marginTop: '1rem'
    },
    categoryCard: {
      padding: '1rem',
      border: '2px solid #e5e7eb',
      borderRadius: '0.75rem',
      cursor: 'pointer',
      transition: 'all 0.3s',
      textAlign: 'center'
    },
    selectedCategory: {
      borderColor: '#2563eb',
      background: '#eff6ff'
    },
    categoryIcon: {
      fontSize: '2rem',
      marginBottom: '0.5rem'
    },
    categoryName: {
      fontWeight: '500',
      color: '#374151'
    },
    imageUpload: {
      border: '2px dashed #d1d5db',
      borderRadius: '0.75rem',
      padding: '2rem',
      textAlign: 'center',
      cursor: 'pointer',
      transition: 'all 0.3s'
    },
    uploadIcon: {
      width: '3rem',
      height: '3rem',
      background: '#f3f4f6',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 1rem'
    },
    uploadText: {
      color: '#6b7280',
      fontSize: '0.875rem',
      marginBottom: '1rem'
    },
    imageGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
      gap: '1rem',
      marginTop: '1rem'
    },
    imagePreview: {
      position: 'relative',
      borderRadius: '0.5rem',
      overflow: 'hidden',
      height: '120px'
    },
    image: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    },
    removeImage: {
      position: 'absolute',
      top: '0.5rem',
      right: '0.5rem',
      width: '24px',
      height: '24px',
      background: 'rgba(239, 68, 68, 0.9)',
      color: 'white',
      border: 'none',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer'
    },
    checkboxGroup: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      marginBottom: '1rem'
    },
    checkbox: {
      width: '1.25rem',
      height: '1.25rem',
      borderRadius: '0.25rem',
      border: '2px solid #d1d5db',
      cursor: 'pointer'
    },
    checkboxLabel: {
      fontSize: '0.875rem',
      color: '#374151',
      cursor: 'pointer'
    },
    tagsContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.5rem',
      marginTop: '1rem'
    },
    tag: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.5rem 0.75rem',
      background: '#f3f4f6',
      color: '#374151',
      borderRadius: '9999px',
      fontSize: '0.875rem'
    },
    removeTag: {
      background: 'none',
      border: 'none',
      color: '#9ca3af',
      cursor: 'pointer',
      padding: '0'
    },
    addTagInput: {
      display: 'flex',
      gap: '0.5rem',
      marginTop: '0.5rem'
    },
    tagInput: {
      flex: 1,
      padding: '0.5rem 0.75rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.5rem',
      fontSize: '0.875rem'
    },
    addTagButton: {
      padding: '0.5rem 1rem',
      background: '#2563eb',
      color: 'white',
      border: 'none',
      borderRadius: '0.5rem',
      fontSize: '0.875rem',
      cursor: 'pointer'
    },
    pricingOptions: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem',
      marginTop: '1rem'
    },
    pricingOption: {
      padding: '1.5rem',
      border: '2px solid #e5e7eb',
      borderRadius: '0.75rem',
      cursor: 'pointer',
      textAlign: 'center',
      transition: 'all 0.3s'
    },
    selectedPricing: {
      borderColor: '#2563eb',
      background: '#eff6ff'
    },
    optionIcon: {
      width: '3rem',
      height: '3rem',
      background: '#f3f4f6',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 1rem'
    },
    optionTitle: {
      fontWeight: '600',
      color: '#1f2937',
      marginBottom: '0.25rem'
    },
    optionDescription: {
      fontSize: '0.875rem',
      color: '#6b7280'
    },
    workingHoursGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: '1rem',
      marginTop: '1rem'
    },
    '@media (min-width: 768px)': {
      workingHoursGrid: {
        gridTemplateColumns: 'repeat(2, 1fr)'
      }
    },
    daySchedule: {
      padding: '1rem',
      border: '1px solid #e5e7eb',
      borderRadius: '0.75rem',
      background: '#f9fafb'
    },
    dayHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '1rem'
    },
    dayName: {
      fontWeight: '500',
      color: '#1f2937'
    },
    timeInputs: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    timeInput: {
      padding: '0.5rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.375rem',
      fontSize: '0.875rem',
      width: '100px'
    },
    featuresGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
      gap: '1rem',
      marginTop: '1rem'
    },
    featureCard: {
      padding: '1rem',
      border: '1px solid #e5e7eb',
      borderRadius: '0.75rem',
      cursor: 'pointer',
      transition: 'all 0.3s'
    },
    selectedFeature: {
      borderColor: '#10b981',
      background: '#f0fdf4'
    },
    navigation: {
      display: 'flex',
      justifyContent: 'space-between',
      marginTop: '3rem',
      paddingTop: '2rem',
      borderTop: '1px solid #e5e7eb'
    },
    navButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.75rem 1.5rem',
      border: '1px solid #d1d5db',
      background: 'white',
      borderRadius: '0.5rem',
      fontWeight: '500',
      color: '#374151',
      cursor: 'pointer',
      transition: 'all 0.2s'
    },
    nextButton: {
      background: '#2563eb',
      borderColor: '#2563eb',
      color: 'white'
    },
    publishButton: {
      background: '#10b981',
      borderColor: '#10b981',
      color: 'white',
      fontWeight: '600'
    },
    previewSection: {
      background: '#f9fafb',
      borderRadius: '0.75rem',
      padding: '2rem',
      marginTop: '2rem'
    },
    previewTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
      color: '#1f2937',
      marginBottom: '1rem'
    },
    previewContent: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '1.5rem'
    },
    previewItem: {
      marginBottom: '1rem'
    },
    previewLabel: {
      fontSize: '0.875rem',
      color: '#6b7280',
      marginBottom: '0.25rem'
    },
    previewValue: {
      fontWeight: '500',
      color: '#1f2937'
    }
  };

  const steps = [
    { number: 1, label: 'Basic Info', icon: '📝' },
    { number: 2, label: 'Service Details', icon: '🔧' },
    { number: 3, label: 'Pricing', icon: '💰' },
    { number: 4, label: 'Availability', icon: '📍' },
    { number: 5, label: 'Features', icon: '✨' },
    { number: 6, label: 'Preview', icon: '👁️' }
  ];

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setImages(prev => [...prev, ...newImages].slice(0, 10)); // Limit to 10 images
  };

  const handleRemoveImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddTag = (tag) => {
    if (tag.trim() && !formData.tags.includes(tag.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tag.trim()] });
    }
  };

  const handleRemoveTag = (tag) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
  };

  const handleAddFeature = (feature) => {
    setFormData({
      ...formData,
      features: formData.features.includes(feature)
        ? formData.features.filter(f => f !== feature)
        : [...formData.features, feature]
    });
  };

  const handleAddRequirement = (requirement) => {
    setFormData({
      ...formData,
      requirements: formData.requirements.includes(requirement)
        ? formData.requirements.filter(r => r !== requirement)
        : [...formData.requirements, requirement]
    });
  };

  const handlePublish = () => {
    alert('Service published successfully!');
    // In real app, this would submit to API
  };

  const renderStepContent = () => {
    switch(step) {
      case 1:
        return (
          <div>
            <div style={styles.stepHeader}>
              <h3 style={styles.stepTitle}>Basic Information</h3>
              <p style={styles.stepDescription}>Tell us about your service</p>
            </div>
            
            <div style={styles.formGrid}>
              <div style={{...styles.formGroup, gridColumn: '1 / -1'}}>
                <label style={styles.formLabel}>
                  Service Title <span style={styles.requiredStar}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.serviceTitle}
                  onChange={(e) => setFormData({...formData, serviceTitle: e.target.value})}
                  placeholder="e.g., Professional Deep Cleaning"
                  style={styles.formInput}
                />
              </div>
              
              <div style={{...styles.formGroup, gridColumn: '1 / -1'}}>
                <label style={styles.formLabel}>
                  Category <span style={styles.requiredStar}>*</span>
                </label>
                <div style={styles.categoryGrid}>
                  {categories.map((category) => (
                    <div
                      key={category.id}
                      onClick={() => setFormData({...formData, serviceCategory: category.id})}
                      style={{
                        ...styles.categoryCard,
                        ...(formData.serviceCategory === category.id ? styles.selectedCategory : {})
                      }}
                    >
                      <div style={styles.categoryIcon}>{category.icon}</div>
                      <div style={styles.categoryName}>{category.name}</div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>
                  Service Type <span style={styles.requiredStar}>*</span>
                </label>
                <select
                  value={formData.serviceType}
                  onChange={(e) => setFormData({...formData, serviceType: e.target.value})}
                  style={styles.formSelect}
                >
                  <option value="one-time">One-time Service</option>
                  <option value="recurring">Recurring Service</option>
                  <option value="subscription">Subscription-based</option>
                </select>
              </div>
              
              <div style={{...styles.formGroup, gridColumn: '1 / -1'}}>
                <label style={styles.formLabel}>
                  Service Description <span style={styles.requiredStar}>*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe your service in detail. What makes it special? What do clients get?"
                  style={styles.formTextarea}
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div>
            <div style={styles.stepHeader}>
              <h3 style={styles.stepTitle}>Service Details</h3>
              <p style={styles.stepDescription}>Add specific details about your service</p>
            </div>
            
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>
                  Years of Experience <span style={styles.requiredStar}>*</span>
                </label>
                <select
                  value={formData.experienceYears}
                  onChange={(e) => setFormData({...formData, experienceYears: e.target.value})}
                  style={styles.formSelect}
                >
                  <option value="">Select years</option>
                  <option value="1">1 year</option>
                  <option value="2-5">2-5 years</option>
                  <option value="5-10">5-10 years</option>
                  <option value="10+">10+ years</option>
                </select>
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Team Size</label>
                <select
                  value={formData.teamSize}
                  onChange={(e) => setFormData({...formData, teamSize: e.target.value})}
                  style={styles.formSelect}
                >
                  <option value="">Select size</option>
                  <option value="solo">Solo Professional</option>
                  <option value="small">Small Team (2-5)</option>
                  <option value="medium">Medium Team (6-10)</option>
                  <option value="large">Large Team (10+)</option>
                </select>
              </div>
              
              <div style={{...styles.formGroup, gridColumn: '1 / -1'}}>
                <label style={styles.formLabel}>Service Images</label>
                <div style={styles.imageUpload}>
                  <div style={styles.uploadIcon}>
                    <Upload size={24} color="#6b7280" />
                  </div>
                  <p style={styles.uploadText}>
                    Upload up to 10 images of your work. Recommended size: 1200x800px
                  </p>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{display: 'none'}}
                    id="image-upload"
                  />
                  <label htmlFor="image-upload">
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 1rem',
                      background: '#2563eb',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                      cursor: 'pointer'
                    }}>
                      <Upload size={16} />
                      Choose Images
                    </div>
                  </label>
                </div>
                
                {images.length > 0 && (
                  <div style={styles.imageGrid}>
                    {images.map((img, index) => (
                      <div key={index} style={styles.imagePreview}>
                        <img src={img.preview} alt={`Service ${index}`} style={styles.image} />
                        <button
                          onClick={() => handleRemoveImage(index)}
                          style={styles.removeImage}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div style={{...styles.formGroup, gridColumn: '1 / -1'}}>
                <div style={styles.checkboxGroup}>
                  <input
                    type="checkbox"
                    id="equipmentProvided"
                    checked={formData.equipmentProvided}
                    onChange={(e) => setFormData({...formData, equipmentProvided: e.target.checked})}
                    style={styles.checkbox}
                  />
                  <label htmlFor="equipmentProvided" style={styles.checkboxLabel}>
                    Equipment Provided
                  </label>
                </div>
                
                <div style={styles.checkboxGroup}>
                  <input
                    type="checkbox"
                    id="materialsIncluded"
                    checked={formData.materialsIncluded}
                    onChange={(e) => setFormData({...formData, materialsIncluded: e.target.checked})}
                    style={styles.checkbox}
                  />
                  <label htmlFor="materialsIncluded" style={styles.checkboxLabel}>
                    Materials Included in Price
                  </label>
                </div>
              </div>
              
              <div style={{...styles.formGroup, gridColumn: '1 / -1'}}>
                <label style={styles.formLabel}>Certifications</label>
                <div style={styles.addTagInput}>
                  <input
                    type="text"
                    placeholder="Add certification (e.g., OSHA Certified)"
                    style={styles.tagInput}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddTag(e.target.value);
                        e.target.value = '';
                      }
                    }}
                  />
                  <button
                    onClick={(e) => {
                      const input = e.target.previousSibling;
                      handleAddTag(input.value);
                      input.value = '';
                    }}
                    style={styles.addTagButton}
                  >
                    Add
                  </button>
                </div>
                <div style={styles.tagsContainer}>
                  {formData.tags.map((tag, index) => (
                    <span key={index} style={styles.tag}>
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        style={styles.removeTag}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div>
            <div style={styles.stepHeader}>
              <h3 style={styles.stepTitle}>Pricing</h3>
              <p style={styles.stepDescription}>Set your service pricing</p>
            </div>
            
            <div style={styles.pricingOptions}>
              {[
                { id: 'fixed', name: 'Fixed Price', icon: '💵', description: 'One fixed price for the service' },
                { id: 'hourly', name: 'Hourly Rate', icon: '⏰', description: 'Charge per hour of work' },
                { id: 'per-unit', name: 'Per Unit', icon: '📦', description: 'Price based on units (sq ft, rooms, etc.)' }
              ].map((option) => (
                <div
                  key={option.id}
                  onClick={() => setFormData({...formData, pricingModel: option.id})}
                  style={{
                    ...styles.pricingOption,
                    ...(formData.pricingModel === option.id ? styles.selectedPricing : {})
                  }}
                >
                  <div style={styles.optionIcon}>{option.icon}</div>
                  <div style={styles.optionTitle}>{option.name}</div>
                  <div style={styles.optionDescription}>{option.description}</div>
                </div>
              ))}
            </div>
            
            <div style={styles.formGrid}>
              {formData.pricingModel === 'fixed' && (
                <>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>
                      Base Price <span style={styles.requiredStar}>*</span>
                    </label>
                    <div style={{position: 'relative'}}>
                      <DollarSign style={{
                        position: 'absolute',
                        left: '1rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#6b7280'
                      }} size={20} />
                      <input
                        type="number"
                        value={formData.basePrice}
                        onChange={(e) => setFormData({...formData, basePrice: e.target.value})}
                        placeholder="0.00"
                        style={{...styles.formInput, paddingLeft: '3rem'}}
                      />
                    </div>
                  </div>
                  
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Minimum Price</label>
                    <div style={{position: 'relative'}}>
                      <DollarSign style={{
                        position: 'absolute',
                        left: '1rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#6b7280'
                      }} size={20} />
                      <input
                        type="number"
                        value={formData.minPrice}
                        onChange={(e) => setFormData({...formData, minPrice: e.target.value})}
                        placeholder="0.00"
                        style={{...styles.formInput, paddingLeft: '3rem'}}
                      />
                    </div>
                  </div>
                </>
              )}
              
              {formData.pricingModel === 'hourly' && (
                <>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>
                      Hourly Rate <span style={styles.requiredStar}>*</span>
                    </label>
                    <div style={{position: 'relative'}}>
                      <DollarSign style={{
                        position: 'absolute',
                        left: '1rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#6b7280'
                      }} size={20} />
                      <input
                        type="number"
                        value={formData.hourlyRate}
                        onChange={(e) => setFormData({...formData, hourlyRate: e.target.value})}
                        placeholder="0.00"
                        style={{...styles.formInput, paddingLeft: '3rem'}}
                      />
                    </div>
                  </div>
                  
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Minimum Hours</label>
                    <div style={{position: 'relative'}}>
                      <Clock style={{
                        position: 'absolute',
                        left: '1rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#6b7280'
                      }} size={20} />
                      <input
                        type="number"
                        placeholder="1"
                        style={{...styles.formInput, paddingLeft: '3rem'}}
                      />
                    </div>
                  </div>
                </>
              )}
              
              {formData.pricingModel === 'per-unit' && (
                <>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>
                      Unit Type <span style={styles.requiredStar}>*</span>
                    </label>
                    <select
                      value={formData.unitType}
                      onChange={(e) => setFormData({...formData, unitType: e.target.value})}
                      style={styles.formSelect}
                    >
                      <option value="">Select unit</option>
                      <option value="sq-ft">Square Feet</option>
                      <option value="rooms">Rooms</option>
                      <option value="items">Items</option>
                      <option value="hours">Hours</option>
                    </select>
                  </div>
                  
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>
                      Price Per Unit <span style={styles.requiredStar}>*</span>
                    </label>
                    <div style={{position: 'relative'}}>
                      <DollarSign style={{
                        position: 'absolute',
                        left: '1rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#6b7280'
                      }} size={20} />
                      <input
                        type="number"
                        value={formData.pricePerUnit}
                        onChange={(e) => setFormData({...formData, pricePerUnit: e.target.value})}
                        placeholder="0.00"
                        style={{...styles.formInput, paddingLeft: '3rem'}}
                      />
                    </div>
                  </div>
                </>
              )}
              
              <div style={{...styles.formGroup, gridColumn: '1 / -1'}}>
                <div style={styles.checkboxGroup}>
                  <input
                    type="checkbox"
                    id="depositRequired"
                    checked={formData.depositRequired}
                    onChange={(e) => setFormData({...formData, depositRequired: e.target.checked})}
                    style={styles.checkbox}
                  />
                  <label htmlFor="depositRequired" style={styles.checkboxLabel}>
                    Require Deposit
                  </label>
                </div>
                
                {formData.depositRequired && (
                  <div style={{marginTop: '1rem'}}>
                    <label style={styles.formLabel}>Deposit Amount</label>
                    <div style={{position: 'relative'}}>
                      <DollarSign style={{
                        position: 'absolute',
                        left: '1rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#6b7280'
                      }} size={20} />
                      <input
                        type="number"
                        value={formData.depositAmount}
                        onChange={(e) => setFormData({...formData, depositAmount: e.target.value})}
                        placeholder="0.00"
                        style={{...styles.formInput, paddingLeft: '3rem'}}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div>
            <div style={styles.stepHeader}>
              <h3 style={styles.stepTitle}>Availability & Location</h3>
              <p style={styles.stepDescription}>Set when and where you provide this service</p>
            </div>
            
            <div style={styles.formGrid}>
              <div style={{...styles.formGroup, gridColumn: '1 / -1'}}>
                <label style={styles.formLabel}>
                  Service Areas <span style={styles.requiredStar}>*</span>
                </label>
                <div style={styles.addTagInput}>
                  <input
                    type="text"
                    placeholder="Add service area (e.g., Lagos Island)"
                    style={styles.tagInput}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddTag(e.target.value);
                        e.target.value = '';
                      }
                    }}
                  />
                  <button
                    onClick={(e) => {
                      const input = e.target.previousSibling;
                      handleAddTag(input.value);
                      input.value = '';
                    }}
                    style={styles.addTagButton}
                  >
                    Add
                  </button>
                </div>
                <div style={styles.tagsContainer}>
                  {formData.serviceAreas.map((area, index) => (
                    <span key={index} style={styles.tag}>
                      <MapPin size={12} />
                      {area}
                      <button
                        onClick={() => handleRemoveTag(area)}
                        style={styles.removeTag}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              
              <div style={{...styles.formGroup, gridColumn: '1 / -1'}}>
                <label style={styles.formLabel}>Working Hours</label>
                <div style={styles.workingHoursGrid}>
                  {Object.entries(formData.workingHours).map(([day, schedule]) => (
                    <div key={day} style={styles.daySchedule}>
                      <div style={styles.dayHeader}>
                        <div style={styles.dayName}>
                          {day.charAt(0).toUpperCase() + day.slice(1)}
                        </div>
                        <div style={styles.checkboxGroup}>
                          <input
                            type="checkbox"
                            id={`available-${day}`}
                            checked={schedule.available}
                            onChange={(e) => setFormData({
                              ...formData,
                              workingHours: {
                                ...formData.workingHours,
                                [day]: {...schedule, available: e.target.checked}
                              }
                            })}
                            style={styles.checkbox}
                          />
                          <label htmlFor={`available-${day}`} style={styles.checkboxLabel}>
                            Available
                          </label>
                        </div>
                      </div>
                      
                      {schedule.available && (
                        <div style={styles.timeInputs}>
                          <input
                            type="time"
                            value={schedule.from}
                            onChange={(e) => setFormData({
                              ...formData,
                              workingHours: {
                                ...formData.workingHours,
                                [day]: {...schedule, from: e.target.value}
                              }
                            })}
                            style={styles.timeInput}
                          />
                          <span>to</span>
                          <input
                            type="time"
                            value={schedule.to}
                            onChange={(e) => setFormData({
                              ...formData,
                              workingHours: {
                                ...formData.workingHours,
                                [day]: {...schedule, to: e.target.value}
                              }
                            })}
                            style={styles.timeInput}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>
                  Lead Time (Hours) <span style={styles.requiredStar}>*</span>
                </label>
                <div style={{position: 'relative'}}>
                  <Clock style={{
                    position: 'absolute',
                    left: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#6b7280'
                  }} size={20} />
                  <input
                    type="number"
                    value={formData.leadTime}
                    onChange={(e) => setFormData({...formData, leadTime: e.target.value})}
                    placeholder="24"
                    style={{...styles.formInput, paddingLeft: '3rem'}}
                  />
                </div>
                <p style={{fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem'}}>
                  Time needed before starting service
                </p>
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Same Day Service</label>
                <div style={styles.checkboxGroup}>
                  <input
                    type="checkbox"
                    id="sameDayService"
                    checked={formData.sameDayService}
                    onChange={(e) => setFormData({...formData, sameDayService: e.target.checked})}
                    style={styles.checkbox}
                  />
                  <label htmlFor="sameDayService" style={styles.checkboxLabel}>
                    Available for same-day bookings
                  </label>
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div>
            <div style={styles.stepHeader}>
              <h3 style={styles.stepTitle}>Features & Requirements</h3>
              <p style={styles.stepDescription}>Add special features and client requirements</p>
            </div>
            
            <div style={styles.formGrid}>
              <div style={{...styles.formGroup, gridColumn: '1 / -1'}}>
                <label style={styles.formLabel}>Service Features</label>
                <p style={{fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem'}}>
                  Select features that apply to your service
                </p>
                <div style={styles.featuresGrid}>
                  {featuresList.map((feature) => (
                    <div
                      key={feature}
                      onClick={() => handleAddFeature(feature)}
                      style={{
                        ...styles.featureCard,
                        ...(formData.features.includes(feature) ? styles.selectedFeature : {})
                      }}
                    >
                      <div style={styles.checkboxGroup}>
                        <input
                          type="checkbox"
                          checked={formData.features.includes(feature)}
                          readOnly
                          style={styles.checkbox}
                        />
                        <label style={styles.checkboxLabel}>{feature}</label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div style={{...styles.formGroup, gridColumn: '1 / -1'}}>
                <label style={styles.formLabel}>Client Requirements</label>
                <p style={{fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem'}}>
                  Let clients know what they need to prepare
                </p>
                <div style={styles.featuresGrid}>
                  {requirementsList.map((requirement) => (
                    <div
                      key={requirement}
                      onClick={() => handleAddRequirement(requirement)}
                      style={{
                        ...styles.featureCard,
                        ...(formData.requirements.includes(requirement) ? styles.selectedFeature : {})
                      }}
                    >
                      <div style={styles.checkboxGroup}>
                        <input
                          type="checkbox"
                          checked={formData.requirements.includes(requirement)}
                          readOnly
                          style={styles.checkbox}
                        />
                        <label style={styles.checkboxLabel}>{requirement}</label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 6:
        const selectedCategory = categories.find(c => c.id === formData.serviceCategory);
        
        return (
          <div>
            <div style={styles.stepHeader}>
              <h3 style={styles.stepTitle}>Preview & Publish</h3>
              <p style={styles.stepDescription}>Review your service before publishing</p>
            </div>
            
            <div style={styles.previewSection}>
              <h4 style={styles.previewTitle}>Service Preview</h4>
              <div style={styles.previewContent}>
                <div>
                  <div style={styles.previewItem}>
                    <div style={styles.previewLabel}>Service Title</div>
                    <div style={styles.previewValue}>{formData.serviceTitle || 'Not set'}</div>
                  </div>
                  
                  <div style={styles.previewItem}>
                    <div style={styles.previewLabel}>Category</div>
                    <div style={styles.previewValue}>
                      {selectedCategory ? `${selectedCategory.icon} ${selectedCategory.name}` : 'Not set'}
                    </div>
                  </div>
                  
                  <div style={styles.previewItem}>
                    <div style={styles.previewLabel}>Service Type</div>
                    <div style={styles.previewValue}>
                      {formData.serviceType === 'one-time' ? 'One-time Service' :
                       formData.serviceType === 'recurring' ? 'Recurring Service' :
                       'Subscription-based'}
                    </div>
                  </div>
                  
                  <div style={styles.previewItem}>
                    <div style={styles.previewLabel}>Experience</div>
                    <div style={styles.previewValue}>{formData.experienceYears || 'Not set'}</div>
                  </div>
                </div>
                
                <div>
                  <div style={styles.previewItem}>
                    <div style={styles.previewLabel}>Pricing Model</div>
                    <div style={styles.previewValue}>
                      {formData.pricingModel === 'fixed' ? 'Fixed Price' :
                       formData.pricingModel === 'hourly' ? 'Hourly Rate' :
                       'Per Unit'}
                    </div>
                  </div>
                  
                  <div style={styles.previewItem}>
                    <div style={styles.previewLabel}>Price</div>
                    <div style={styles.previewValue}>
                      {formData.pricingModel === 'fixed' && `₦${parseFloat(formData.basePrice || 0).toLocaleString()}`}
                      {formData.pricingModel === 'hourly' && `₦${parseFloat(formData.hourlyRate || 0).toLocaleString()}/hour`}
                      {formData.pricingModel === 'per-unit' && `₦${parseFloat(formData.pricePerUnit || 0).toLocaleString()}/${formData.unitType}`}
                    </div>
                  </div>
                  
                  <div style={styles.previewItem}>
                    <div style={styles.previewLabel}>Service Areas</div>
                    <div style={styles.previewValue}>
                      {formData.serviceAreas.length > 0 ? formData.serviceAreas.join(', ') : 'Not set'}
                    </div>
                  </div>
                  
                  <div style={styles.previewItem}>
                    <div style={styles.previewLabel}>Features</div>
                    <div style={styles.previewValue}>
                      {formData.features.length > 0 ? formData.features.join(', ') : 'None selected'}
                    </div>
                  </div>
                </div>
              </div>
              
              <div style={{marginTop: '2rem'}}>
                <h5 style={{fontSize: '1rem', fontWeight: '600', color: '#1f2937', marginBottom: '1rem'}}>
                  Description
                </h5>
                <p style={{color: '#6b7280', lineHeight: '1.6'}}>
                  {formData.description || 'No description provided'}
                </p>
              </div>
              
              {images.length > 0 && (
                <div style={{marginTop: '2rem'}}>
                  <h5 style={{fontSize: '1rem', fontWeight: '600', color: '#1f2937', marginBottom: '1rem'}}>
                    Service Images ({images.length})
                  </h5>
                  <div style={styles.imageGrid}>
                    {images.map((img, index) => (
                      <div key={index} style={styles.imagePreview}>
                        <img src={img.preview} alt={`Service ${index}`} style={styles.image} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Post a New Service</h1>
        <p style={styles.subtitle}>Create a new service listing to attract clients</p>
      </div>

      {/* Progress Bar */}
      <div style={styles.progressBar}>
        <div style={styles.progressLine}></div>
        {steps.map((stepItem) => (
          <div key={stepItem.number} style={{position: 'relative', textAlign: 'center'}}>
            <div style={{
              ...styles.stepCircle,
              ...(step > stepItem.number ? styles.completedStep : {}),
              ...(step === stepItem.number ? styles.activeStep : {})
            }}>
              {step > stepItem.number ? '✓' : stepItem.number}
            </div>
            <div style={{
              ...styles.stepLabel,
              ...(step === stepItem.number ? styles.activeLabel : {})
            }}>
              {stepItem.label}
            </div>
          </div>
        ))}
      </div>

      {/* Form */}
      <div style={styles.formContainer}>
        {renderStepContent()}

        {/* Navigation */}
        <div style={styles.navigation}>
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              style={styles.navButton}
            >
              Previous
            </button>
          )}
          
          <div style={{marginLeft: 'auto'}}>
            {step < 6 ? (
              <button
                onClick={() => setStep(step + 1)}
                style={{...styles.navButton, ...styles.nextButton}}
              >
                Next
              </button>
            ) : (
              <button
                onClick={handlePublish}
                style={{...styles.navButton, ...styles.publishButton}}
              >
                <CheckCircle size={20} />
                Publish Service
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderPostService;