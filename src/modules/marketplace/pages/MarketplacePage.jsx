// src/modules/marketplace/pages/MarketplacePage.jsx - FIXED WITH CORRECT COLUMNS

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Star, MapPin, Clock, Building, Home, Briefcase,
  Award, Shield, Eye, MessageSquare, DollarSign, Sparkles, 
  AlertCircle, Zap, ToolCase, Navigation, CheckCircle, XCircle, PlusCircle
} from 'lucide-react';
import { supabase } from '../../../shared/lib/supabaseClient';
import { useAuth } from '../../../shared/context/AuthContext';
import { messagesService } from '../../../shared/services/messagesService';
import RentEasyLoader from '../../../shared/components/RentEasyLoader';
import Header from '../../../shared/components/Header';
import { locationService } from '../../../shared/services/locationService';
import './Marketplace.css';

const MarketplacePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    state: '',
    lga: '',
    minRating: 0,
    verifiedOnly: false,
    boostOnly: false,
    sortBy: 'relevance'
  });

  const [marketplaceData, setMarketplaceData] = useState({
    estateFirms: [],
    estateServices: [],
    serviceProviders: [],
    allItems: []
  });

  // Detect user location on mount
  useEffect(() => {
    const detectLocation = async () => {
      const location = await locationService.detectUserLocation();
      if (location?.state) {
        setUserLocation(location);
      }
    };
    detectLocation();
  }, []);

  const loadMarketplaceData = useCallback(async () => {
  setIsLoading(true);
  setError(null);
  try {
    console.log('Loading marketplace data...');

    // ========== 1. Get active subscription user IDs ==========
    const now = new Date().toISOString().split('T')[0]; // YYYY-MM-DD for date column
    const { data: activeSubs, error: subError } = await supabase
      .from('subscriptions')
      .select('user_id')
      .eq('status', 'active')
      .gte('expires_at', now);

    if (subError) throw subError;

    const activeUserIds = activeSubs?.map(s => s.user_id) || [];
    console.log('Active subscription users:', activeUserIds.length);

    // ========== 2. Estate firms (only those with active subscription) ==========
    let transformedEstateFirms = [];
    let transformedEstateServices = [];

    if (activeUserIds.length > 0) {
      // Fetch estate firm profiles for those users
      const { data: estateFirmProfiles, error: estateFirmError } = await supabase
        .from('estate_firm_profiles')
        .select(`
          id,
          firm_name,
          description,
          logo_url,
          cover_image_url,
          verification_status,
          boost_status,
          boost_expiry,
          rating,
          user_id,
          address,
          contact_phone,
          contact_email
        `)
        .eq('is_active', true)
        .in('user_id', activeUserIds);

      if (estateFirmError) console.error('Error fetching estate firms:', estateFirmError);

      // Get user profiles for these firms (optional)
      const userIds = estateFirmProfiles?.map(p => p.user_id).filter(Boolean) || [];
      let userProfilesMap = {};
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, email, phone, location, state, lga, rating, reviews_count')
          .in('id', userIds);
        profiles?.forEach(p => { userProfilesMap[p.id] = p; });
      }

      // Transform estate firms
      estateFirmProfiles?.forEach(firm => {
        const userProfile = userProfilesMap[firm.user_id];
        const isBoosted = firm.boost_status === 'boosted' && firm.boost_expiry > new Date().toISOString();
        const rating = Number(firm.rating) || Number(userProfile?.rating) || 0;
        const reviews = Number(userProfile?.reviews_count) || 0;

        transformedEstateFirms.push({
          id: firm.id,
          type: 'estate-firm',
          name: firm.firm_name,
          description: firm.description || 'Professional estate management services',
          coverImage: firm.cover_image_url || null,
          logo: firm.logo_url || null,
          location: firm.address || userProfile?.location || `${userProfile?.state || ''} ${userProfile?.lga || ''}`.trim() || 'Nigeria',
          rating,
          reviews,
          verificationState: firm.verification_status === 'verified' ? 'verified' : 'unverified',
          boostState: isBoosted ? 'boosted' : 'not-boosted',
          responseTime: '2-4 hours',
          contact: {
            phone: firm.contact_phone || userProfile?.phone,
            email: firm.contact_email || userProfile?.email
          },
          createdAt: new Date().toISOString()
        });
      });

      // ========== 3. Estate services (only those belonging to these firms) ==========
      const estateFirmIds = estateFirmProfiles?.map(f => f.id) || [];
      if (estateFirmIds.length > 0) {
        const { data: services, error: estateServicesError } = await supabase
          .from('estate_services')
          .select('*')
          .eq('status', 'active')
          .in('estate_firm_id', estateFirmIds)
          .order('created_at', { ascending: false });

        if (estateServicesError) console.error('Error fetching estate services:', estateServicesError);

        // Build a map of firm details for quick lookup
        let firmMap = {};
        estateFirmProfiles?.forEach(f => { firmMap[f.id] = f; });

        services?.forEach(service => {
          const estateFirm = firmMap[service.estate_firm_id];
          const isBoosted = estateFirm?.boost_status === 'boosted' && estateFirm?.boost_expiry > new Date().toISOString();

          let priceDisplay = '';
          if (service.price_model === 'fixed' && service.price) {
            priceDisplay = `₦${Number(service.price).toLocaleString()}`;
          } else if (service.price_model === 'hourly' && service.hourly_rate) {
            priceDisplay = `₦${Number(service.hourly_rate).toLocaleString()}/hr`;
          } else if (service.price_model === 'percentage' && service.percentage) {
            priceDisplay = `${service.percentage}%`;
          } else {
            priceDisplay = 'Contact for pricing';
          }

          transformedEstateServices.push({
            id: service.id,
            type: 'estate-service',
            name: service.title,
            description: service.description,
            coverImage: service.images?.[0] || null,
            providerId: service.estate_firm_id,
            providerName: estateFirm?.firm_name || 'Estate Firm',
            providerLogo: estateFirm?.logo_url,
            location: service.location || 'Nigeria',
            priceModel: service.price_model,
            priceDisplay,
            rating: Number(service.rating) || 0,
            reviews: Number(service.reviews) || 0,
            verificationState: estateFirm?.verification_status === 'verified' ? 'verified' : 'unverified',
            boostState: isBoosted ? 'boosted' : 'not-boosted',
            responseTime: '2-4 hours',
            createdAt: service.created_at
          });
        });
      }
    } else {
      console.log('No active subscriptions – estate firms and services will be hidden.');
    }

    // ========== 4. Service providers (always visible) ==========
    const { data: serviceProvidersData, error: serviceProvidersError } = await supabase
      .from('service_providers')
      .select(`
        id,
        business_name,
        title,
        description,
        avatar_url,
        location,
        state,
        lga,
        services,
        price_range_low,
        price_range_high,
        response_time,
        years_experience,
        success_rate,
        verification_status,
        user_id
      `)
      .eq('status', 'active');

    if (serviceProvidersError) console.error('Error fetching service providers:', serviceProvidersError);

    // Get user profiles for service providers
    const providerUserIds = serviceProvidersData?.map(p => p.user_id).filter(Boolean) || [];
    let providerProfilesMap = {};
    if (providerUserIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email, phone, rating, reviews_count, is_kyc_verified')
        .in('id', providerUserIds);
      profiles?.forEach(p => { providerProfilesMap[p.id] = p; });
    }

    const transformedServiceProviders = (serviceProvidersData || []).map(provider => {
      const profile = providerProfilesMap[provider.user_id];
      const isVerified = profile?.is_kyc_verified === true || provider.verification_status === 'verified';
      const priceLow = Number(provider.price_range_low) || 0;
      const priceHigh = Number(provider.price_range_high) || 0;
      const priceRange = priceLow && priceHigh 
        ? `₦${priceLow.toLocaleString()} - ₦${priceHigh.toLocaleString()}`
        : 'Contact for pricing';

      return {
        id: provider.id,
        userId: provider.user_id,
        type: 'service-provider',
        name: provider.business_name || profile?.full_name || 'Service Provider',
        title: provider.title || '',
        description: provider.description || 'Experienced professional',
        coverImage: provider.avatar_url || null,
        profileImage: provider.avatar_url,
        location: provider.location || `${provider.state || ''} ${provider.lga || ''}`.trim() || 'Nigeria',
        rating: Number(profile?.rating) || 0,
        reviews: Number(profile?.reviews_count) || 0,
        services: provider.services || [],
        priceRange,
        verificationState: isVerified ? 'verified' : 'unverified',
        boostState: 'not-boosted',
        responseTime: provider.response_time || 'Within 2-4 hours',
        yearsExperience: provider.years_experience || 0,
        successRate: provider.success_rate || 95,
        createdAt: provider.created_at
      };
    });

    // ========== 5. Combine items based on active tab ==========
    let allItems = [];
    if (activeTab === 'all') {
      allItems = [...transformedEstateFirms, ...transformedEstateServices, ...transformedServiceProviders];
    } else if (activeTab === 'estate-firms') {
      allItems = [...transformedEstateFirms, ...transformedEstateServices];
    } else if (activeTab === 'services') {
      allItems = transformedServiceProviders;
    }

    // ========== 6. Apply search filter ==========
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      allItems = allItems.filter(item => {
        const searchable = [
          item.name,
          item.title || '',
          item.description,
          ...(item.services || []),
          item.location
        ].join(' ').toLowerCase();
        return searchable.includes(term);
      });
    }

    // ========== 7. Apply explicit location filter (if user selected a state) ==========
    if (filters.state) {
      allItems = allItems.filter(item => 
        item.location?.toLowerCase().includes(filters.state.toLowerCase())
      );
    }

    // ========== 8. Apply verification and boost filters ==========
    if (filters.verifiedOnly) {
      allItems = allItems.filter(item => item.verificationState === 'verified');
    }
    if (filters.boostOnly) {
      allItems = allItems.filter(item => item.boostState === 'boosted');
    }
    if (filters.minRating > 0) {
      allItems = allItems.filter(item => item.rating >= filters.minRating);
    }

    // ========== 9. Sort items ==========
    allItems.sort((a, b) => {
      switch (filters.sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'boosted':
          if (a.boostState === 'boosted' && b.boostState !== 'boosted') return -1;
          if (a.boostState !== 'boosted' && b.boostState === 'boosted') return 1;
          return b.rating - a.rating;
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        default:
          if (a.boostState === 'boosted' && b.boostState !== 'boosted') return -1;
          if (a.boostState !== 'boosted' && b.boostState === 'boosted') return 1;
          return b.rating - a.rating;
      }
    });

    setMarketplaceData({
      estateFirms: transformedEstateFirms,
      estateServices: transformedEstateServices,
      serviceProviders: transformedServiceProviders,
      allItems
    });

    console.log('Total items loaded:', allItems.length);

  } catch (err) {
    console.error('Error fetching marketplace data:', err);
    setError(err.message);
  } finally {
    setIsLoading(false);
    setIsRefreshing(false);
  }
}, [activeTab, searchTerm, filters, userLocation]);

  // Load data when dependencies change
  useEffect(() => {
    loadMarketplaceData();
  }, [loadMarketplaceData]);

  const handleContactServiceProvider = async (item) => {
  if (!user) {
    navigate('/login');
    return;
  }

  let providerUserId = null;

  // For service providers, we already have userId from the item
  if (item.type === 'service-provider') {
    providerUserId = item.userId;
  } 
  // For estate firms or estate services, we need to fetch the user_id from the estate_firm_profiles table
  else if (item.type === 'estate-firm' || item.type === 'estate-service') {
    try {
      // Fetch the estate firm profile to get user_id
      const { data, error } = await supabase
        .from('estate_firm_profiles')
        .select('user_id')
        .eq('id', item.id)
        .single();

      if (error) throw error;
      providerUserId = data.user_id;
    } catch (err) {
      console.error('Error fetching firm user ID:', err);
      alert('Could not find provider details. Please try again.');
      return;
    }
  }

  if (!providerUserId) {
    alert('Provider not found');
    return;
  }

  // Check if the user is trying to contact themselves
  if (providerUserId === user.id) {
    alert('You cannot contact yourself.');
    return;
  }

  try {
    const result = await messagesService.initiateProviderChat(providerUserId, user.id, user.role);
    if (result?.chatId) {
      navigate(`/dashboard/messages/chat/${result.chatId}`);
    } else {
      alert('Failed to start chat. Please try again.');
    }
  } catch (error) {
    console.error('Error starting chat:', error);
    alert(error.message || 'Failed to start chat');
  }
};

  const handleContactEstateFirm = (item) => {
    if (item.verificationState !== 'verified') {
      alert(`${item.name} is not yet verified. Please check back later.`);
      return;
    }
    handleContactServiceProvider({ providerId: item.id });
  };

  const renderBadges = (item) => {
    const badges = [];

    if (item.verificationState === 'verified') {
      badges.push({
        type: 'verified',
        label: 'Verified',
        icon: <Shield size={12} />,
        color: '#10b981'
      });
    }

    if (item.boostState === 'boosted') {
      badges.push({
        type: 'boosted',
        label: 'Boosted',
        icon: <Zap size={12} />,
        color: '#f59e0b'
      });
    }

    return badges;
  };

  if (isLoading) {
    return <RentEasyLoader message="Loading Marketplace..." fullScreen />;
  }

  if (error) {
    return (
      <div className="marketplace-error">
        <AlertCircle size={48} />
        <h3>Failed to load marketplace</h3>
        <p>{error}</p>
        <button onClick={() => loadMarketplaceData()}>Retry</button>
      </div>
    );
  }
  

  return (
    <div className="marketplace-container">
      <Header />
      {/* Hero Section – not a header, just a banner */}
<div className="marketplace-hero">
  <div className="hero-content">
    <h1>Professional Services Marketplace</h1>
    <p className="hero-subtitle">
      Find trusted estate firms and service providers. <span className="highlight">Verified</span> and <span className="highlight">Boosted</span> listings highlighted.
    </p>
    {userLocation && (
      <div className="hero-location">
        <Navigation size={16} />
        <span>Showing providers near {userLocation.city ? `${userLocation.city}, ` : ''}{userLocation.state}</span>
      </div>
    )}
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
          <ToolCase size={18} />
          <span>Service Providers</span>
        </button>
      </div>

      {/* Results Count */}
      <div className="results-info">
        <p>{marketplaceData.allItems.length} {activeTab === 'all' ? 'items' : activeTab.replace('-', ' ')} found</p>
      </div>

      {/* Marketplace Grid */}
      <div className="marketplace-grid">
        {marketplaceData.allItems.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <Search size={48} />
            </div>
            <h3>No services found</h3>
            <p>Try adjusting your search or filters</p>
            {!searchTerm && !filters.verifiedOnly && !filters.boostOnly && (
              <button 
                className="btn btn-primary"
                onClick={() => {
                  if (user?.role === 'estate-firm') {
                    navigate('/dashboard/estate-firm/post-service');
                  } else {
                    alert('Please log in as an estate firm to post services');
                  }
                }}
              >
                <PlusCircle size={16} />
                Post Your First Service
              </button>
            )}
          </div>
        ) : (
          marketplaceData.allItems.map((item) => {
            const badges = renderBadges(item);
            return (
              <div key={`${item.type}-${item.id}`} className={`service-card ${item.boostState === 'boosted' ? 'boosted' : ''}`}>
                {/* Cover Image */}
                {item.coverImage && (
                  <div className="card-cover">
                    <img src={item.coverImage} alt={item.name} />
                  </div>
                )}
                
                <div className="card-content">
                  {/* Card Header */}
                  <div className="card-header">
                    <div className="provider-type">
                      {item.type === 'estate-firm' ? (
                        <span className="type-label"><Building size={14} /> Estate Firm</span>
                      ) : item.type === 'estate-service' ? (
                        <span className="type-label"><Briefcase size={14} /> Service</span>
                      ) : (
                        <span className="type-label"><ToolCase size={14} /> Provider</span>
                      )}
                    </div>
                    <div className="badges-container">
                      {badges.map((badge, idx) => (
                        <span key={idx} className="badge" style={{ backgroundColor: badge.color }}>
                          {badge.icon}
                          <span className="badge-text">{badge.label}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Provider Info */}
                  <div className="provider-info">
                    <div className="provider-avatar">
                      {item.type === 'estate-firm' || item.type === 'estate-service' ? (
                        item.logo ? <img src={item.logo} alt={item.name} /> : <Building size={32} />
                      ) : (
                        item.profileImage ? <img src={item.profileImage} alt={item.name} /> : <ToolCase size={32} />
                      )}
                    </div>
                    <div className="provider-details">
                      <h3 className="provider-name">{item.name}</h3>
                      {item.title && <p className="provider-title">{item.title}</p>}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="provider-description">
                    {item.description?.length > 120 ? `${item.description.substring(0, 120)}...` : item.description}
                  </p>

                  {/* Rating */}
                  <div className="rating-container">
                    <div className="stars">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} fill={i < Math.floor(item.rating) ? "currentColor" : "none"} />
                      ))}
                    </div>
                    <span className="rating-text">{item.rating.toFixed(1)} ({item.reviews} reviews)</span>
                  </div>

                  {/* Location & Price */}
                  <div className="provider-meta">
                    <div className="meta-item">
                      <MapPin size={14} />
                      <span>{item.location?.split(',')[0] || 'Nigeria'}</span>
                    </div>
                    {item.priceDisplay && (
                      <div className="meta-item">
                        <DollarSign size={14} />
                        <span className="price">{item.priceDisplay}</span>
                      </div>
                    )}
                    {item.priceRange && !item.priceDisplay && (
                      <div className="meta-item">
                        <DollarSign size={14} />
                        <span className="price">{item.priceRange}</span>
                      </div>
                    )}
                    <div className="meta-item">
                      <Clock size={14} />
                      <span>{item.responseTime}</span>
                    </div>
                  </div>

                  {/* Services Tags - for service providers only */}
                  {item.services && item.services.length > 0 && (
                    <div className="services-tags">
                      {item.services.slice(0, 3).map((service, idx) => (
                        <span key={idx} className="service-tag">{service}</span>
                      ))}
                      {item.services.length > 3 && (
                        <span className="service-tag">+{item.services.length - 3} more</span>
                      )}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="card-footer">
                    <button 
                      className="btn btn-primary"
                      onClick={() => {
                        if (item.type === 'estate-firm' || item.type === 'estate-service') {
                          handleContactEstateFirm(item);
                        } else {
                          handleContactServiceProvider(item);
                        }
                      }}
                      disabled={item.verificationState !== 'verified'}
                    >
                      <MessageSquare size={16} />
                      <span>Contact</span>
                    </button>
                    <button 
                      className="btn btn-outline"
                      onClick={() => navigate(`/services/${item.id}`)}
                    >
                      <Eye size={16} />
                      <span>View Details</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Business Rules Info */}
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