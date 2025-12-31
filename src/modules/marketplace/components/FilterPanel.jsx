// src/modules/marketplace/components/FilterPanel.jsx
import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Star, DollarSign, Calendar, X, ChevronDown, ChevronUp } from 'lucide-react';
import { serviceCategories, serviceTags } from '../data/serviceCategories';
import './FilterPanel.css';

const FilterPanel = ({ 
  filters = {},
  onFilterChange,
  searchTerm = '',
  onSearchChange,
  states = [],
  lgas = [],
  disabled = false,
  onClearFilters
}) => {
  const [expandedSections, setExpandedSections] = useState({
    location: true,
    services: false,
    rating: false,
    price: false,
    advanced: false,
    serviceType: false,    // NEW
    serviceFeatures: false, // NEW
    serviceArea: false,    // NEW
    availability: false    // NEW
  });
  
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const [debounceTimer, setDebounceTimer] = useState(null);
  
  // Keep your existing service categories for compatibility
  const legacyServiceCategories = [
    { id: 'property-manager', label: 'Property Managers', icon: '🏢', count: 0 },
    { id: 'maintenance', label: 'Maintenance', icon: '🔧', count: 0 },
    { id: 'cleaning', label: 'Cleaning', icon: '🧹', count: 0 },
    { id: 'legal', label: 'Legal Services', icon: '⚖️', count: 0 },
    { id: 'financial', label: 'Financial', icon: '💰', count: 0 },
    { id: 'inspection', label: 'Property Inspection', icon: '🔍', count: 0 },
    { id: 'valuation', label: 'Valuation', icon: '📊', count: 0 },
    { id: 'contractor', label: 'Contractors', icon: '👷', count: 0 }
  ];
  
  // Sort options
  const sortOptions = [
    { value: 'toprated', label: 'Top Rated', icon: '⭐' },
    { value: 'nearest', label: 'Nearest First', icon: '📍' },
    { value: 'newest', label: 'Newest', icon: '🆕' },
    { value: 'price-low', label: 'Price: Low to High', icon: '⬆️' },
    { value: 'price-high', label: 'Price: High to Low', icon: '⬇️' },
    { value: 'reviews', label: 'Most Reviews', icon: '💬' },
    { value: 'name-asc', label: 'Name: A-Z', icon: '🔤' },
    { value: 'name-desc', label: 'Name: Z-A', icon: '🔤' }
  ];
  
  // Availability options
  const availabilityOptions = [
    { value: 'all', label: 'All Availability' },
    { value: 'immediate', label: 'Immediate', color: '#10b981' },
    { value: 'within-week', label: 'Within 1 Week', color: '#3b82f6' },
    { value: 'within-month', label: 'Within 1 Month', color: '#f59e0b' },
    { value: 'custom', label: 'Custom Schedule', color: '#8b5cf6' }
  ];
  
  // Price range presets
  const pricePresets = [
    { label: 'Under ₦10k', range: [0, 10000] },
    { label: '₦10k - ₦50k', range: [10000, 50000] },
    { label: '₦50k - ₦200k', range: [50000, 200000] },
    { label: '₦200k+', range: [200000, 1000000] },
    { label: 'Custom', range: [0, 1000000], isCustom: true }
  ];
  
  // Rating options with stars
  const ratingOptions = [
    { value: 0, label: 'Any Rating', stars: '' },
    { value: 3, label: '3+ Stars', stars: '⭐⭐⭐' },
    { value: 3.5, label: '3.5+ Stars', stars: '⭐⭐⭐✨' },
    { value: 4, label: '4+ Stars', stars: '⭐⭐⭐⭐' },
    { value: 4.5, label: '4.5+ Stars', stars: '⭐⭐⭐⭐✨' },
    { value: 4.8, label: '4.8+ Stars', stars: '⭐⭐⭐⭐⭐' }
  ];
  
  // Service area options
  const serviceAreaOptions = [
    { id: 'all', name: 'All Areas', icon: '🌍' },
    { id: 'residential', name: 'Residential', icon: '🏠' },
    { id: 'commercial', name: 'Commercial', icon: '🏢' },
    { id: 'industrial', name: 'Industrial', icon: '🏭' }
  ];
  
  // Handle search with debouncing
  const handleSearchChange = (value) => {
    setLocalSearchTerm(value);
    
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    
    const timer = setTimeout(() => {
      onSearchChange(value);
    }, 300);
    
    setDebounceTimer(timer);
  };
  
  // Handle section expansion toggle
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  // Handle state change - reset LGA
  const handleStateChange = (state) => {
    onFilterChange({ 
      state, 
      lga: ''
    });
  };
  
  // Handle service category toggle
  const handleServiceToggle = (serviceId) => {
    const currentServices = filters.services || [];
    const newServices = currentServices.includes(serviceId)
      ? currentServices.filter(id => id !== serviceId)
      : [...currentServices, serviceId];
    
    onFilterChange({ services: newServices });
  };
  
  // Handle price preset selection
  const handlePricePreset = (preset) => {
    if (preset.isCustom) {
      onFilterChange({ priceRange: preset.range });
    } else {
      onFilterChange({ priceRange: preset.range });
    }
  };
  
  // Handle rating selection
  const handleRatingSelect = (rating) => {
    onFilterChange({ minRating: rating });
  };
  
  // Handle availability change
  const handleAvailabilityChange = (availability) => {
    onFilterChange({ availability });
  };
  
  // Handle sort change
  const handleSortChange = (sortBy) => {
    onFilterChange({ sortBy });
  };
  
  // NEW: Handle service category change
  const handleCategoryChange = (category) => {
    onFilterChange({ 
      category, 
      serviceType: '' // Reset service type when category changes
    });
  };
  
  // NEW: Handle service tag toggle
  const handleTagToggle = (tagId) => {
    const currentTags = filters.tags || [];
    const newTags = currentTags.includes(tagId)
      ? currentTags.filter(t => t !== tagId)
      : [...currentTags, tagId];
    onFilterChange({ tags: newTags });
  };
  
  // NEW: Handle service area change
  const handleServiceAreaChange = (areaId) => {
    onFilterChange({ serviceArea: areaId });
  };
  
  // NEW: Handle availability feature toggle
  const handleAvailabilityFeatureToggle = (feature) => {
    onFilterChange({ 
      availabilityFeatures: {
        ...filters.availabilityFeatures,
        [feature]: !filters.availabilityFeatures?.[feature]
      }
    });
  };
  
  // Clear all filters
  const handleClearAll = () => {
    setLocalSearchTerm('');
    onSearchChange('');
    
    if (onClearFilters) {
      onClearFilters();
    }
  };
  
  // Format price for display
  const formatPrice = (amount) => {
    if (amount >= 1000000) {
      return `₦${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `₦${(amount / 1000).toFixed(0)}k`;
    }
    return `₦${amount}`;
  };
  
  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    
    if (filters.state) count++;
    if (filters.lga) count++;
    if (filters.minRating > 0) count++;
    if (filters.verifiedOnly) count++;
    if (filters.withProperties) count++;
    if (filters.services && filters.services.length > 0) count += filters.services.length;
    if (filters.availability && filters.availability !== 'all') count++;
    if (filters.priceRange && (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000000)) count++;
    
    // NEW: Count new filters
    if (filters.category) count++;
    if (filters.serviceType) count++;
    if (filters.tags && filters.tags.length > 0) count += filters.tags.length;
    if (filters.serviceArea && filters.serviceArea !== 'all') count++;
    if (filters.availabilityFeatures) {
      Object.values(filters.availabilityFeatures).forEach(val => {
        if (val) count++;
      });
    }
    
    return count;
  };
  
  const activeFilterCount = getActiveFilterCount();
  
  // Get subcategories for selected category
  const getSubCategories = () => {
    if (!filters.category) return [];
    const category = serviceCategories.find(c => c.id === filters.category);
    return category?.subCategories || [];
  };
  
  return (
    <div className={`filter-panel ${disabled ? 'disabled' : ''}`}>
      {/* Panel Header */}
      <div className="panel-header">
        <div className="header-title">
          <Filter size={18} />
          <h3>Filters</h3>
          {activeFilterCount > 0 && (
            <span className="active-count" aria-label={`${activeFilterCount} active filters`}>
              {activeFilterCount}
            </span>
          )}
        </div>
        
        {activeFilterCount > 0 && (
          <button
            className="clear-all-btn"
            onClick={handleClearAll}
            disabled={disabled}
            aria-label="Clear all filters"
          >
            <X size={14} />
            Clear All
          </button>
        )}
      </div>
      
      {/* Search Section */}
      <div className="search-section">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search providers..."
            value={localSearchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            disabled={disabled}
            className="search-input"
            aria-label="Search service providers"
          />
          {localSearchTerm && (
            <button
              className="clear-search"
              onClick={() => handleSearchChange('')}
              disabled={disabled}
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>
      
      {/* Location Filter Section */}
      <div className="filter-section">
        <button
          className="section-header"
          onClick={() => toggleSection('location')}
          aria-expanded={expandedSections.location}
          disabled={disabled}
        >
          <div className="section-title">
            <MapPin size={16} />
            <span>Location</span>
          </div>
          {expandedSections.location ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        
        {expandedSections.location && (
          <div className="section-content">
            {/* State Filter */}
            <div className="filter-group">
              <label htmlFor="state-filter" className="filter-label">
                State
              </label>
              <select
                id="state-filter"
                value={filters.state || ''}
                onChange={(e) => handleStateChange(e.target.value)}
                disabled={disabled}
                className="filter-select"
                aria-label="Filter by state"
              >
                <option value="">All States</option>
                {states.map(state => (
                  <option key={state.value} value={state.value}>
                    {state.label}
                  </option>
                ))}
              </select>
            </div>
            
            {/* LGA Filter */}
            <div className="filter-group">
              <label htmlFor="lga-filter" className="filter-label">
                Local Government Area (LGA)
              </label>
              <select
                id="lga-filter"
                value={filters.lga || ''}
                onChange={(e) => onFilterChange({ lga: e.target.value })}
                disabled={disabled || !filters.state}
                className="filter-select"
                aria-label="Filter by local government area"
              >
                <option value="">All LGAs</option>
                {lgas.map(lga => (
                  <option key={lga} value={lga}>
                    {lga}
                  </option>
                ))}
              </select>
              {!filters.state && (
                <p className="helper-text">Select a state first to choose LGA</p>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* NEW: Service Type Filter Section */}
      <div className="filter-section">
        <button
          className="section-header"
          onClick={() => toggleSection('serviceType')}
          aria-expanded={expandedSections.serviceType}
          disabled={disabled}
        >
          <div className="section-title">
            <span className="section-icon">🔧</span>
            <span>Service Type</span>
            {(filters.category || filters.serviceType) && (
              <span className="selection-count">
                {filters.category ? '1' : '0'} selected
              </span>
            )}
          </div>
          {expandedSections.serviceType ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        
        {expandedSections.serviceType && (
          <div className="section-content">
            {/* Main Category */}
            <div className="filter-group">
              <label htmlFor="category-filter" className="filter-label">
                Main Category
              </label>
              <select
                id="category-filter"
                value={filters.category || ''}
                onChange={(e) => handleCategoryChange(e.target.value)}
                disabled={disabled}
                className="filter-select"
                aria-label="Filter by service category"
              >
                <option value="">All Categories</option>
                {serviceCategories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Sub-Category */}
            {filters.category && getSubCategories().length > 0 && (
              <div className="filter-group">
                <label htmlFor="serviceType-filter" className="filter-label">
                  Specific Service
                </label>
                <select
                  id="serviceType-filter"
                  value={filters.serviceType || ''}
                  onChange={(e) => onFilterChange({ serviceType: e.target.value })}
                  disabled={disabled}
                  className="filter-select"
                  aria-label="Filter by specific service"
                >
                  <option value="">All Services</option>
                  {getSubCategories().map(subCategory => (
                    <option key={subCategory.id} value={subCategory.id}>
                      {subCategory.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* NEW: Service Features Filter Section */}
      <div className="filter-section">
        <button
          className="section-header"
          onClick={() => toggleSection('serviceFeatures')}
          aria-expanded={expandedSections.serviceFeatures}
          disabled={disabled}
        >
          <div className="section-title">
            <span className="section-icon">🏷️</span>
            <span>Service Features</span>
            {filters.tags?.length > 0 && (
              <span className="selection-count">{filters.tags.length} selected</span>
            )}
          </div>
          {expandedSections.serviceFeatures ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        
        {expandedSections.serviceFeatures && (
          <div className="section-content">
            <div className="service-tags-filter">
              <div className="tags-grid">
                {serviceTags.map(tag => (
                  <button
                    key={tag.id}
                    className={`service-tag-btn ${filters.tags?.includes(tag.id) ? 'selected' : ''}`}
                    onClick={() => handleTagToggle(tag.id)}
                    disabled={disabled}
                    style={{ '--tag-color': tag.color }}
                    aria-pressed={filters.tags?.includes(tag.id)}
                  >
                    <span className="tag-icon">{tag.icon}</span>
                    <span className="tag-name">{tag.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* NEW: Service Area Filter Section */}
      <div className="filter-section">
        <button
          className="section-header"
          onClick={() => toggleSection('serviceArea')}
          aria-expanded={expandedSections.serviceArea}
          disabled={disabled}
        >
          <div className="section-title">
            <span className="section-icon">📍</span>
            <span>Service Area</span>
            {filters.serviceArea && filters.serviceArea !== 'all' && (
              <span className="selection-count">1 selected</span>
            )}
          </div>
          {expandedSections.serviceArea ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        
        {expandedSections.serviceArea && (
          <div className="section-content">
            <div className="service-area-filter">
              <div className="area-options">
                {serviceAreaOptions.map(area => (
                  <button
                    key={area.id}
                    className={`area-option ${filters.serviceArea === area.id ? 'selected' : ''}`}
                    onClick={() => handleServiceAreaChange(area.id)}
                    disabled={disabled}
                    aria-pressed={filters.serviceArea === area.id}
                  >
                    <span className="area-icon">{area.icon}</span>
                    <span className="area-name">{area.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* NEW: Availability Filter Section */}
      <div className="filter-section">
        <button
          className="section-header"
          onClick={() => toggleSection('availability')}
          aria-expanded={expandedSections.availability}
          disabled={disabled}
        >
          <div className="section-title">
            <span className="section-icon">⏰</span>
            <span>Availability</span>
            {filters.availabilityFeatures && Object.values(filters.availabilityFeatures).some(val => val) && (
              <span className="selection-count">
                {Object.values(filters.availabilityFeatures).filter(val => val).length} selected
              </span>
            )}
          </div>
          {expandedSections.availability ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        
        {expandedSections.availability && (
          <div className="section-content">
            <div className="availability-features-filter">
              <div className="availability-options">
                <label className="availability-option">
                  <input
                    type="checkbox"
                    checked={filters.availabilityFeatures?.emergency || false}
                    onChange={() => handleAvailabilityFeatureToggle('emergency')}
                    disabled={disabled}
                    className="availability-checkbox"
                  />
                  <span className="availability-label">
                    <span className="availability-icon">🚨</span>
                    Emergency Services
                  </span>
                </label>
                
                <label className="availability-option">
                  <input
                    type="checkbox"
                    checked={filters.availabilityFeatures?.weekends || false}
                    onChange={() => handleAvailabilityFeatureToggle('weekends')}
                    disabled={disabled}
                    className="availability-checkbox"
                  />
                  <span className="availability-label">
                    <span className="availability-icon">📅</span>
                    Weekend Available
                  </span>
                </label>
                
                <label className="availability-option">
                  <input
                    type="checkbox"
                    checked={filters.availabilityFeatures?.['24-7'] || false}
                    onChange={() => handleAvailabilityFeatureToggle('24-7')}
                    disabled={disabled}
                    className="availability-checkbox"
                  />
                  <span className="availability-label">
                    <span className="availability-icon">⏰</span>
                    24/7 Service
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Service Categories Section (Original) */}
      <div className="filter-section">
        <button
          className="section-header"
          onClick={() => toggleSection('services')}
          aria-expanded={expandedSections.services}
          disabled={disabled}
        >
          <div className="section-title">
            <span className="section-icon">🏢</span>
            <span>Legacy Categories</span>
            {filters.services?.length > 0 && (
              <span className="selection-count">{filters.services.length} selected</span>
            )}
          </div>
          {expandedSections.services ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        
        {expandedSections.services && (
          <div className="section-content">
            <div className="service-categories">
              {legacyServiceCategories.map(category => (
                <button
                  key={category.id}
                  className={`service-category-btn ${
                    filters.services?.includes(category.id) ? 'selected' : ''
                  }`}
                  onClick={() => handleServiceToggle(category.id)}
                  disabled={disabled}
                  aria-pressed={filters.services?.includes(category.id)}
                >
                  <span className="category-icon">{category.icon}</span>
                  <span className="category-label">{category.label}</span>
                  {category.count > 0 && (
                    <span className="category-count">{category.count}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Rating Filter Section */}
      <div className="filter-section">
        <button
          className="section-header"
          onClick={() => toggleSection('rating')}
          aria-expanded={expandedSections.rating}
          disabled={disabled}
        >
          <div className="section-title">
            <Star size={16} />
            <span>Rating</span>
            {filters.minRating > 0 && (
              <span className="selection-count">{filters.minRating}+ Stars</span>
            )}
          </div>
          {expandedSections.rating ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        
        {expandedSections.rating && (
          <div className="section-content">
            <div className="rating-options">
              {ratingOptions.map(option => (
                <button
                  key={option.value}
                  className={`rating-option ${
                    filters.minRating === option.value ? 'selected' : ''
                  }`}
                  onClick={() => handleRatingSelect(option.value)}
                  disabled={disabled}
                  aria-pressed={filters.minRating === option.value}
                >
                  <div className="rating-stars-display">
                    {option.stars}
                  </div>
                  <span className="rating-label">{option.label}</span>
                </button>
              ))}
            </div>
            
            <div className="rating-slider-container">
              <label className="filter-label">
                Minimum Rating: <strong>{filters.minRating || 0}+ Stars</strong>
              </label>
              <input
                type="range"
                min="0"
                max="5"
                step="0.1"
                value={filters.minRating || 0}
                onChange={(e) => onFilterChange({ minRating: parseFloat(e.target.value) })}
                disabled={disabled}
                className="rating-slider"
              />
              <div className="slider-ticks">
                <span>0</span>
                <span>1</span>
                <span>2</span>
                <span>3</span>
                <span>4</span>
                <span>5</span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Price Range Section */}
      <div className="filter-section">
        <button
          className="section-header"
          onClick={() => toggleSection('price')}
          aria-expanded={expandedSections.price}
          disabled={disabled}
        >
          <div className="section-title">
            <DollarSign size={16} />
            <span>Price Range</span>
            {filters.priceRange && (
              <span className="selection-count">
                {formatPrice(filters.priceRange[0])} - {formatPrice(filters.priceRange[1])}
              </span>
            )}
          </div>
          {expandedSections.price ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        
        {expandedSections.price && (
          <div className="section-content">
            <div className="price-presets">
              {pricePresets.map(preset => (
                <button
                  key={preset.label}
                  className={`price-preset-btn ${
                    filters.priceRange?.[0] === preset.range[0] && 
                    filters.priceRange?.[1] === preset.range[1] ? 'selected' : ''
                  }`}
                  onClick={() => handlePricePreset(preset)}
                  disabled={disabled}
                  aria-pressed={
                    filters.priceRange?.[0] === preset.range[0] && 
                    filters.priceRange?.[1] === preset.range[1]
                  }
                >
                  {preset.label}
                </button>
              ))}
            </div>
            
            <div className="price-slider-container">
              <div className="price-inputs">
                <div className="price-input-group">
                  <label className="price-label">Min</label>
                  <div className="price-input-wrapper">
                    <span className="currency-symbol">₦</span>
                    <input
                      type="number"
                      min="0"
                      max="1000000"
                      step="1000"
                      value={filters.priceRange?.[0] || 0}
                      onChange={(e) => onFilterChange({ 
                        priceRange: [parseInt(e.target.value) || 0, filters.priceRange?.[1] || 1000000] 
                      })}
                      disabled={disabled}
                      className="price-input"
                    />
                  </div>
                </div>
                
                <div className="price-input-group">
                  <label className="price-label">Max</label>
                  <div className="price-input-wrapper">
                    <span className="currency-symbol">₦</span>
                    <input
                      type="number"
                      min="0"
                      max="1000000"
                      step="1000"
                      value={filters.priceRange?.[1] || 1000000}
                      onChange={(e) => onFilterChange({ 
                        priceRange: [filters.priceRange?.[0] || 0, parseInt(e.target.value) || 1000000] 
                      })}
                      disabled={disabled}
                      className="price-input"
                    />
                  </div>
                </div>
              </div>
              
              <div className="range-slider-wrapper">
                <input
                  type="range"
                  min="0"
                  max="1000000"
                  step="10000"
                  value={filters.priceRange?.[0] || 0}
                  onChange={(e) => onFilterChange({ 
                    priceRange: [parseInt(e.target.value), filters.priceRange?.[1] || 1000000] 
                  })}
                  disabled={disabled}
                  className="range-slider min-slider"
                />
                <input
                  type="range"
                  min="0"
                  max="1000000"
                  step="10000"
                  value={filters.priceRange?.[1] || 1000000}
                  onChange={(e) => onFilterChange({ 
                    priceRange: [filters.priceRange?.[0] || 0, parseInt(e.target.value)] 
                  })}
                  disabled={disabled}
                  className="range-slider max-slider"
                />
                <div className="slider-track">
                  <div 
                    className="slider-range"
                    style={{
                      left: `${((filters.priceRange?.[0] || 0) / 1000000) * 100}%`,
                      right: `${100 - ((filters.priceRange?.[1] || 1000000) / 1000000) * 100}%`
                    }}
                  />
                </div>
              </div>
              
              <div className="price-limits">
                <span>{formatPrice(0)}</span>
                <span>{formatPrice(1000000)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Advanced Filters Section */}
      <div className="filter-section">
        <button
          className="section-header"
          onClick={() => toggleSection('advanced')}
          aria-expanded={expandedSections.advanced}
          disabled={disabled}
        >
          <div className="section-title">
            <Filter size={16} />
            <span>Advanced Filters</span>
          </div>
          {expandedSections.advanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        
        {expandedSections.advanced && (
          <div className="section-content">
            <div className="toggle-group">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={filters.verifiedOnly || false}
                  onChange={(e) => onFilterChange({ verifiedOnly: e.target.checked })}
                  disabled={disabled}
                  className="toggle-checkbox"
                />
                <span className="toggle-slider"></span>
                <span className="toggle-text">
                  <span className="toggle-icon">✅</span>
                  Verified Providers Only
                </span>
              </label>
            </div>
            
            <div className="toggle-group">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={filters.withProperties || false}
                  onChange={(e) => onFilterChange({ withProperties: e.target.checked })}
                  disabled={disabled}
                  className="toggle-checkbox"
                />
                <span className="toggle-slider"></span>
                <span className="toggle-text">
                  <span className="toggle-icon">🏘️</span>
                  With Existing Properties
                </span>
              </label>
            </div>
            
            <div className="filter-group">
              <label className="filter-label">Availability</label>
              <div className="availability-options">
                {availabilityOptions.map(option => (
                  <button
                    key={option.value}
                    className={`availability-option ${
                      filters.availability === option.value ? 'selected' : ''
                    }`}
                    onClick={() => handleAvailabilityChange(option.value)}
                    disabled={disabled}
                    aria-pressed={filters.availability === option.value}
                    style={option.color ? { '--option-color': option.color } : {}}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="filter-group">
              <label className="filter-label">Sort By</label>
              <div className="sort-options">
                {sortOptions.map(option => (
                  <button
                    key={option.value}
                    className={`sort-option ${
                      filters.sortBy === option.value ? 'selected' : ''
                    }`}
                    onClick={() => handleSortChange(option.value)}
                    disabled={disabled}
                    aria-pressed={filters.sortBy === option.value}
                  >
                    <span className="sort-icon">{option.icon}</span>
                    <span className="sort-label">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Active Filters Summary */}
      {activeFilterCount > 0 && (
        <div className="active-filters-summary">
          <div className="summary-header">
            <span className="summary-title">Active Filters</span>
            <button
              className="summary-clear"
              onClick={handleClearAll}
              disabled={disabled}
            >
              Clear All
            </button>
          </div>
          
          <div className="active-filters-tags">
            {filters.state && (
              <span className="active-filter-tag">
                State: {filters.state}
                <button
                  onClick={() => onFilterChange({ state: '' })}
                  disabled={disabled}
                >
                  <X size={12} />
                </button>
              </span>
            )}
            
            {filters.lga && (
              <span className="active-filter-tag">
                LGA: {filters.lga}
                <button
                  onClick={() => onFilterChange({ lga: '' })}
                  disabled={disabled}
                >
                  <X size={12} />
                </button>
              </span>
            )}
            
            {filters.category && (
              <span className="active-filter-tag">
                Category: {serviceCategories.find(c => c.id === filters.category)?.name || filters.category}
                <button
                  onClick={() => onFilterChange({ category: '', serviceType: '' })}
                  disabled={disabled}
                >
                  <X size={12} />
                </button>
              </span>
            )}
            
            {filters.serviceType && (
              <span className="active-filter-tag">
                Service: {getSubCategories().find(s => s.id === filters.serviceType)?.name || filters.serviceType}
                <button
                  onClick={() => onFilterChange({ serviceType: '' })}
                  disabled={disabled}
                >
                  <X size={12} />
                </button>
              </span>
            )}
            
            {filters.tags?.map(tagId => {
              const tag = serviceTags.find(t => t.id === tagId);
              return tag ? (
                <span key={tagId} className="active-filter-tag">
                  {tag.icon} {tag.name}
                  <button
                    onClick={() => handleTagToggle(tagId)}
                    disabled={disabled}
                  >
                    <X size={12} />
                  </button>
                </span>
              ) : null;
            })}
            
            {filters.serviceArea && filters.serviceArea !== 'all' && (
              <span className="active-filter-tag">
                Area: {serviceAreaOptions.find(a => a.id === filters.serviceArea)?.name || filters.serviceArea}
                <button
                  onClick={() => onFilterChange({ serviceArea: 'all' })}
                  disabled={disabled}
                >
                  <X size={12} />
                </button>
              </span>
            )}
            
            {filters.availabilityFeatures && Object.entries(filters.availabilityFeatures).map(([key, value]) => 
              value ? (
                <span key={key} className="active-filter-tag">
                  {key === 'emergency' ? '🚨 Emergency' : 
                   key === 'weekends' ? '📅 Weekends' : 
                   key === '24-7' ? '⏰ 24/7' : key}
                  <button
                    onClick={() => handleAvailabilityFeatureToggle(key)}
                    disabled={disabled}
                  >
                    <X size={12} />
                  </button>
                </span>
              ) : null
            )}
            
            {/* Keep original active filters */}
            {filters.minRating > 0 && (
              <span className="active-filter-tag">
                Rating: {filters.minRating}+ Stars
                <button
                  onClick={() => onFilterChange({ minRating: 0 })}
                  disabled={disabled}
                >
                  <X size={12} />
                </button>
              </span>
            )}
            
            {filters.verifiedOnly && (
              <span className="active-filter-tag">
                Verified Only
                <button
                  onClick={() => onFilterChange({ verifiedOnly: false })}
                  disabled={disabled}
                >
                  <X size={12} />
                </button>
              </span>
            )}
            
            {filters.services?.map(serviceId => {
              const service = legacyServiceCategories.find(s => s.id === serviceId);
              return service ? (
                <span key={serviceId} className="active-filter-tag">
                  {service.icon} {service.label}
                  <button
                    onClick={() => handleServiceToggle(serviceId)}
                    disabled={disabled}
                  >
                    <X size={12} />
                  </button>
                </span>
              ) : null;
            })}
          </div>
        </div>
      )}
    </div>
  );
};

FilterPanel.defaultProps = {
  filters: {
    state: '',
    lga: '',
    minRating: 0,
    verifiedOnly: false,
    withProperties: false,
    priceRange: [0, 1000000],
    services: [],
    availability: 'all',
    sortBy: 'toprated',
    category: '', // NEW
    serviceType: '', // NEW
    tags: [], // NEW
    serviceArea: 'all', // NEW
    availabilityFeatures: { // NEW
      emergency: false,
      weekends: false,
      '24-7': false
    }
  },
  onFilterChange: () => {},
  searchTerm: '',
  onSearchChange: () => {},
  states: [],
  lgas: [],
  disabled: false,
  onClearFilters: () => {}
};

export default FilterPanel;