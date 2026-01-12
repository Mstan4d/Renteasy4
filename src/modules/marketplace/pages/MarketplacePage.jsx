// src/modules/marketplace/pages/MarketplacePage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Filter, Star, MapPin, Clock, CheckCircle, 
  Users, TrendingUp, Building, Home, Briefcase, ToolCaseIcon,
  Award, Shield, Eye, MessageSquare, Phone, Calendar,
  DollarSign, Sparkles, AlertCircle, Zap, Crown, Settings, ToolCase
} from 'lucide-react';
import './Marketplace.css';

const MarketplacePage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'estate-firms', 'services'
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Correct filters according to business plan
  const [filters, setFilters] = useState({
    state: '',
    lga: '',
    minRating: 0,
    verifiedOnly: false,
    boostOnly: false,
    serviceType: '',
    category: '',
    sortBy: 'relevance' // 'relevance', 'rating', 'boosted', 'newest'
  });

  // Sample data structure following business rules
  const [marketplaceData, setMarketplaceData] = useState({
    estateFirms: [],
    serviceProviders: [],
    allItems: []
  });

  // Load data according to business rules
  useEffect(() => {
    const loadMarketplaceData = () => {
      setIsLoading(true);
      
      // ========== ESTATE FIRMS (Following Business Rules) ==========
      // Rule: All estate firms appear immediately after registration
      // Rule: Appear even if unverified or unsubscribed
      const estateFirms = [
        {
          id: 1,
          type: 'estate-firm',
          name: 'Prime Properties Ltd',
          description: 'Professional real estate management company with 15+ years experience',
          logo: '🏢',
          location: 'Lagos, Nigeria',
          rating: 4.8,
          reviews: 124,
          services: ['Property Management', 'Sales & Rentals', 'Valuation'],
          
          // INDEPENDENT STATES (Critical Rule)
          verificationState: 'verified', // 'unverified' | 'verified' (KYC by admin)
          boostState: 'boosted',         // 'not-boosted' | 'boosted' (paid promotion)
          subscriptionState: 'subscribed', // Only affects posting properties, NOT marketplace visibility
          
          // Badges based on independent states
          badges: ['verified', 'boosted'],
          
          // Performance metrics
          yearsExperience: 15,
          propertiesManaged: 245,
          responseTime: '1-2 hours',
          
          // Contact (visible after verification)
          contact: {
            phone: '+2348012345678',
            email: 'info@primeproperties.com'
          }
        },
        {
          id: 2,
          type: 'estate-firm',
          name: 'Urban Living Realty',
          description: 'Specialized in commercial and residential properties',
          logo: '🏘️',
          location: 'Abuja, Nigeria',
          rating: 4.5,
          reviews: 89,
          services: ['Commercial Leasing', 'Property Maintenance', 'Consultation'],
          
          // Different state combinations
          verificationState: 'verified',
          boostState: 'not-boosted',
          subscriptionState: 'unsubscribed',
          
          badges: ['verified'],
          yearsExperience: 8,
          propertiesManaged: 120,
          responseTime: '2-4 hours'
        },
        {
          id: 3,
          type: 'estate-firm',
          name: 'New Horizon Properties',
          description: 'New real estate startup focusing on modern apartments',
          logo: '🌅',
          location: 'Port Harcourt, Nigeria',
          rating: 4.2,
          reviews: 23,
          services: ['Apartment Rentals', 'Property Sales'],
          
          // Unverified and not boosted
          verificationState: 'unverified',
          boostState: 'not-boosted',
          subscriptionState: 'unsubscribed',
          
          badges: ['unverified'],
          yearsExperience: 2,
          propertiesManaged: 45,
          responseTime: '4-6 hours'
        }
      ];

      // ========== SERVICE PROVIDERS (Following Business Rules) ==========
      // Rule: Automatically listed upon registering
      // Rule: Free until booked 10 times, then ₦3000/month subscription
      const serviceProviders = [
        {
          id: 101,
          type: 'service-provider',
          name: 'Mike Adekunle',
          title: 'Professional Painter',
          description: '15 years experience in residential and commercial painting',
          profileImage: '👨‍🎨',
          location: 'Lagos Island',
          rating: 4.9,
          reviews: 56,
          services: ['Interior Painting', 'Exterior Painting', 'Wallpaper Installation'],
          category: 'painting',
          priceRange: '₦15,000 - ₦80,000',
          
          // Independent States
          verificationState: 'verified',
          boostState: 'boosted',
          subscriptionState: 'free', // Free until 10 bookings
          
          badges: ['verified', 'boosted'],
          
          // Booking tracking for subscription
          bookingsCount: 7, // Free bookings used
          totalBookings: 243,
          
          // Performance metrics
          yearsExperience: 15,
          successRate: 98,
          responseTime: 'Within 2 hours',
          
          // Service-specific details
          availability: 'Mon-Sat, 8am-6pm',
          areasServed: ['Lagos Island', 'Victoria Island', 'Ikoyi']
        },
        {
          id: 102,
          type: 'service-provider',
          name: 'CleanPro Services',
          title: 'Professional Cleaning Company',
          description: 'Deep cleaning, move-in/move-out cleaning, office cleaning',
          profileImage: '🧹',
          location: 'Abuja Central',
          rating: 4.7,
          reviews: 134,
          services: ['Deep Cleaning', 'Office Cleaning', 'Move-in Cleaning'],
          category: 'cleaning',
          priceRange: '₦8,000 - ₦35,000',
          
          verificationState: 'verified',
          boostState: 'not-boosted',
          subscriptionState: 'subscribed', // Already subscribed after 10+ bookings
          
          badges: ['verified'],
          bookingsCount: 12,
          totalBookings: 567,
          yearsExperience: 8,
          successRate: 96,
          responseTime: 'Within 4 hours'
        },
        {
          id: 103,
          type: 'service-provider',
          name: 'John Plumbing Works',
          title: 'Licensed Plumber',
          description: 'Emergency plumbing repairs and installations',
          profileImage: '🔧',
          location: 'Ikeja, Lagos',
          rating: 4.6,
          reviews: 78,
          services: ['Pipe Repair', 'Drain Cleaning', 'Toilet Installation'],
          category: 'plumbing',
          priceRange: '₦5,000 - ₦50,000',
          
          verificationState: 'unverified',
          boostState: 'not-boosted',
          subscriptionState: 'free',
          
          badges: ['unverified'],
          bookingsCount: 3,
          totalBookings: 89,
          yearsExperience: 12,
          successRate: 94,
          responseTime: 'Within 1 hour'
        },
        {
          id: 104,
          type: 'service-provider',
          name: 'SafeLock Security',
          title: 'Security Installation',
          description: 'CCTV, alarm systems, and security consultations',
          profileImage: '🔒',
          location: 'Lekki, Lagos',
          rating: 4.8,
          reviews: 45,
          services: ['CCTV Installation', 'Alarm Systems', 'Security Audit'],
          category: 'security',
          priceRange: '₦25,000 - ₦150,000',
          
          verificationState: 'verified',
          boostState: 'boosted',
          subscriptionState: 'free',
          
          badges: ['verified', 'boosted'],
          bookingsCount: 9, // Almost reaching 10 free bookings limit
          totalBookings: 156,
          yearsExperience: 6,
          successRate: 97,
          responseTime: 'Within 3 hours'
        }
      ];

      // Combine all items
      const allItems = [...estateFirms, ...serviceProviders];
      
      // Sort: Boosted items first, then by rating
      const sortedItems = allItems.sort((a, b) => {
        // Boosted items go to top
        if (a.boostState === 'boosted' && b.boostState !== 'boosted') return -1;
        if (a.boostState !== 'boosted' && b.boostState === 'boosted') return 1;
        
        // Then by rating
        return b.rating - a.rating;
      });

      setMarketplaceData({
        estateFirms,
        serviceProviders,
        allItems: sortedItems
      });
      
      setIsLoading(false);
    };

    loadMarketplaceData();
  }, []);

  // Filter items based on search and filters
  const filteredItems = marketplaceData.allItems.filter(item => {
    // Filter by tab
    if (activeTab === 'estate-firms' && item.type !== 'estate-firm') return false;
    if (activeTab === 'services' && item.type !== 'service-provider') return false;
    
    // Search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const searchable = [
        item.name,
        item.description,
        ...(item.services || []),
        item.location
      ].join(' ').toLowerCase();
      
      if (!searchable.includes(term)) return false;
    }
    
    // Verified only filter
    if (filters.verifiedOnly && item.verificationState !== 'verified') return false;
    
    // Boost only filter
    if (filters.boostOnly && item.boostState !== 'boosted') return false;
    
    // Minimum rating
    if (item.rating < filters.minRating) return false;
    
    // Service type filter
    if (filters.serviceType && item.type === 'service-provider') {
      if (!item.services.some(s => s.toLowerCase().includes(filters.serviceType.toLowerCase()))) {
        return false;
      }
    }
    
    // Category filter
    if (filters.category && item.type === 'service-provider') {
      if (item.category !== filters.category) return false;
    }
    
    return true;
  });

  // Apply sorting
  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (filters.sortBy) {
      case 'rating':
        return b.rating - a.rating;
      case 'boosted':
        if (a.boostState === 'boosted' && b.boostState !== 'boosted') return -1;
        if (a.boostState !== 'boosted' && b.boostState === 'boosted') return 1;
        return 0;
      case 'newest':
        return b.id - a.id; // Using ID as proxy for newness
      default:
        // Relevance: Boosted first, then rating
        if (a.boostState === 'boosted' && b.boostState !== 'boosted') return -1;
        if (a.boostState !== 'boosted' && b.boostState === 'boosted') return 1;
        return b.rating - a.rating;
    }
  });

  // Handle booking service provider
  const handleBookService = (provider) => {
    // Track booking count for subscription logic
    const bookingsCount = provider.bookingsCount + 1;
    
    if (bookingsCount >= 10 && provider.subscriptionState === 'free') {
      alert(`${provider.name} has reached 10 free bookings. They now require a ₦3,000 monthly subscription to continue receiving bookings.`);
      // In real implementation, trigger subscription requirement
    }
    
    // Navigate to booking page
    navigate(`/dashboard/provider/booking/${provider.id}`);
  };

  // Handle contact estate firm
  const handleContactEstateFirm = (firm) => {
    if (firm.verificationState === 'verified') {
      // Show contact info or open chat
      alert(`Contact ${firm.name}:\nPhone: ${firm.contact?.phone || 'Available after verification'}\nEmail: ${firm.contact?.email || 'Available after verification'}`);
    } else {
      alert(`${firm.name} is not yet verified. Please check back later or contact RentEasy support.`);
    }
  };

  // Render badge based on independent states
  const renderBadges = (item) => {
    const badges = [];
    
    // Verification Badge (ONLY for KYC approval)
    if (item.verificationState === 'verified') {
      badges.push({
        type: 'verified',
        label: item.type === 'estate-firm' ? 'Verified Estate Firm' : 'Verified Service Provider',
        icon: <Shield size={12} />,
        color: 'var(--badge-verified)'
      });
    } else {
      badges.push({
        type: 'unverified',
        label: 'Unverified',
        icon: <AlertCircle size={12} />,
        color: 'var(--badge-unverified)'
      });
    }
    
    // Boost Badge (Independent of verification)
    if (item.boostState === 'boosted') {
      badges.push({
        type: 'boosted',
        label: 'Boosted',
        icon: <Zap size={12} />,
        color: 'var(--badge-boosted)'
      });
    }
    
    // Subscription status (Only for service providers, shown differently)
    if (item.type === 'service-provider') {
      if (item.subscriptionState === 'free') {
        badges.push({
          type: 'free-bookings',
          label: `${10 - item.bookingsCount} free bookings left`,
          icon: <Sparkles size={12} />,
          color: 'var(--badge-free)'
        });
      }
    }
    
    return badges;
  };

  if (isLoading) {
    return (
      <div className="marketplace-loading">
        <div className="loading-spinner"></div>
        <p>Loading marketplace...</p>
      </div>
    );
  }

  return (
    <div className="marketplace-container">
      {/* Header */}
      <div className="marketplace-header">
        <div className="header-content">
          <h1>Professional Services Marketplace</h1>
          <p className="subtitle">
            Find trusted estate firms and service providers. <span className="highlight">Verified</span> and <span className="highlight">Boosted</span> listings highlighted.
          </p>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="search-filter-bar">
        <div className="search-container">
          <div className="search-input-wrapper">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Search estate firms, services, or providers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="filter-controls">
          <div className="filter-group">
            <select 
              value={filters.sortBy}
              onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
              className="filter-select"
            >
              <option value="relevance">Sort by Relevance</option>
              <option value="rating">Highest Rated</option>
              <option value="boosted">Boosted First</option>
              <option value="newest">Newest First</option>
            </select>
          </div>
          
          <button 
            className={`filter-toggle ${filters.verifiedOnly ? 'active' : ''}`}
            onClick={() => setFilters({...filters, verifiedOnly: !filters.verifiedOnly})}
          >
            <Shield size={16} />
            <span>Verified Only</span>
          </button>
          
          <button 
            className={`filter-toggle ${filters.boostOnly ? 'active' : ''}`}
            onClick={() => setFilters({...filters, boostOnly: !filters.boostOnly})}
          >
            <Zap size={16} />
            <span>Boosted Only</span>
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="category-tabs">
        <button 
          className={`tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          <Briefcase size={18} />
          <span>All Services</span>
        </button>
        <button 
          className={`tab ${activeTab === 'estate-firms' ? 'active' : ''}`}
          onClick={() => setActiveTab('estate-firms')}
        >
          <Building size={18} />
          <span>Estate Firms</span>
        </button>
        <button 
          className={`tab ${activeTab === 'services' ? 'active' : ''}`}
          onClick={() => setActiveTab('services')}
        >
          <ToolCaseIcon size={18} />
          <span>Service Providers</span>
        </button>
      </div>

      {/* Results Count */}
      <div className="results-info">
        <p>{sortedItems.length} {activeTab === 'all' ? 'services' : activeTab.replace('-', ' ')} found</p>
      </div>

      {/* Marketplace Grid */}
      <div className="marketplace-grid">
        {sortedItems.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <Search size={48} />
            </div>
            <h3>No services found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        ) : (
          sortedItems.map((item) => {
            const badges = renderBadges(item);
            
            return (
              <div key={item.id} className={`service-card ${item.boostState === 'boosted' ? 'boosted' : ''}`}>
                {/* Card Header with Badges */}
                <div className="card-header">
                  <div className="provider-type">
                    {item.type === 'estate-firm' ? (
                      <span className="type-label">
                        <Building size={14} /> Estate Firm
                      </span>
                    ) : (
                      <span className="type-label">
                        <ToolCaseIcon size={14} /> Service Provider
                      </span>
                    )}
                  </div>
                  
                  <div className="badges-container">
                    {badges.map((badge, index) => (
                      <span 
                        key={index} 
                        className="badge"
                        style={{ backgroundColor: badge.color }}
                        title={badge.label}
                      >
                        {badge.icon}
                        <span className="badge-text">{badge.type === 'free-bookings' ? 'Free' : badge.type}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Provider Info */}
                <div className="card-body">
                  <div className="provider-info">
                    <div className="provider-avatar">
                      {item.logo || item.profileImage}
                    </div>
                    <div className="provider-details">
                      <h3 className="provider-name">{item.name}</h3>
                      {item.title && <p className="provider-title">{item.title}</p>}
                      <p className="provider-description">{item.description}</p>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="rating-container">
                    <div className="stars">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i}
                          size={16}
                          fill={i < Math.floor(item.rating) ? "currentColor" : "none"}
                          className={i < Math.floor(item.rating) ? "filled" : "empty"}
                        />
                      ))}
                    </div>
                    <span className="rating-text">
                      {item.rating} • {item.reviews} reviews
                    </span>
                  </div>

                  {/* Location & Response */}
                  <div className="provider-meta">
                    <div className="meta-item">
                      <MapPin size={14} />
                      <span>{item.location}</span>
                    </div>
                    <div className="meta-item">
                      <Clock size={14} />
                      <span>{item.responseTime}</span>
                    </div>
                  </div>

                  {/* Services Offered */}
                  <div className="services-container">
                    <h4>Services Offered:</h4>
                    <div className="services-tags">
                      {item.services.slice(0, 3).map((service, index) => (
                        <span key={index} className="service-tag">
                          {service}
                        </span>
                      ))}
                      {item.services.length > 3 && (
                        <span className="service-tag more">
                          +{item.services.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="stats-grid">
                    <div className="stat-item">
                      <span className="stat-value">{item.yearsExperience}+</span>
                      <span className="stat-label">Years</span>
                    </div>
                    {item.type === 'estate-firm' ? (
                      <div className="stat-item">
                        <span className="stat-value">{item.propertiesManaged}</span>
                        <span className="stat-label">Properties</span>
                      </div>
                    ) : (
                      <div className="stat-item">
                        <span className="stat-value">{item.totalBookings}</span>
                        <span className="stat-label">Bookings</span>
                      </div>
                    )}
                    <div className="stat-item">
                      <span className="stat-value">{item.successRate || 95}%</span>
                      <span className="stat-label">Success</span>
                    </div>
                  </div>
                </div>

                {/* Card Footer - Actions */}
                <div className="card-footer">
                  {item.type === 'estate-firm' ? (
                    <>
                      <button 
                        className="btn btn-outline"
                        onClick={() => handleContactEstateFirm(item)}
                      >
                        <Eye size={16} />
                        <span>View Details</span>
                      </button>
                      <button 
                        className="btn btn-primary"
                        onClick={() => handleContactEstateFirm(item)}
                        disabled={item.verificationState !== 'verified'}
                      >
                        <MessageSquare size={16} />
                        <span>Contact</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="price-info">
                        <DollarSign size={16} />
                        <span className="price-range">{item.priceRange}</span>
                      </div>
                      <button 
                        className="btn btn-primary"
                        onClick={() => handleBookService(item)}
                      >
                        <Calendar size={16} />
                        <span>Book Now</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Business Rules Explanation */}
      <div className="business-rules-info">
        <div className="rules-header">
          <Award size={24} />
          <h3>Marketplace Rules</h3>
        </div>
        <div className="rules-grid">
          <div className="rule-card">
            <div className="rule-icon verified">
              <Shield size={20} />
            </div>
            <h4>Verification</h4>
            <p>Verified badge means admin-approved KYC. Independent of subscription or boost.</p>
          </div>
          <div className="rule-card">
            <div className="rule-icon boosted">
              <Zap size={20} />
            </div>
            <h4>Boosted Listings</h4>
            <p>Paid promotion for better visibility. Does not imply verification.</p>
          </div>
          <div className="rule-card">
            <div className="rule-icon free">
              <Sparkles size={20} />
            </div>
            <h4>Free Bookings</h4>
            <p>Service providers get 10 free bookings before requiring ₦3,000/month subscription.</p>
          </div>
          <div className="rule-card">
            <div className="rule-icon visibility">
              <Eye size={20} />
            </div>
            <h4>Always Visible</h4>
            <p>All registered providers appear in marketplace, regardless of subscription status.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketplacePage;