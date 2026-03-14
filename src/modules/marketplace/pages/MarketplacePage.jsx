// src/modules/marketplace/pages/MarketplacePage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Filter, Star, MapPin, Clock, CheckCircle, 
  Users, TrendingUp, Building, Home, Briefcase,
  Award, Shield, Eye, MessageSquare, Phone, Calendar,
  DollarSign, Sparkles, AlertCircle, Zap, Crown, Settings, ToolCase
} from 'lucide-react';
import { supabase } from '../../../shared/lib/supabaseClient';
import { useAuth } from '../../../shared/context/AuthContext';
import { messagesService } from '../../../shared/services/messagesService';
import './Marketplace.css';

const MarketplacePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [providerPlans, setProviderPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    state: '',
    lga: '',
    minRating: 0,
    verifiedOnly: false,
    boostOnly: false,
    serviceType: '',
    category: '',
    sortBy: 'relevance'
  });

  const [marketplaceData, setMarketplaceData] = useState({
    estateFirms: [],
    serviceProviders: [],
    allItems: []
  });

  // ---------- Fetch Data from Supabase ----------
  useEffect(() => {
    fetchMarketplaceData();
  }, []);

  const fetchMarketplaceData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Fetch Estate Firms
      const { data: estateFirms, error: efError } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          email,
          phone,
          avatar_url,
          location,
          state,
          lga,
          rating,
          reviews_count,
          kyc_status,
          is_kyc_verified,
          created_at,
          subscriptions!user_id (
            id,
            plan_type,
            status,
            expires_at
          ),
          active_boosts!user_id (
            id,
            started_at,
            expires_at,
            package:boost_packages!inner (
              priority_level
            )
          )
        `)
        .or('role.eq.estate-firm,role.eq.estate_firm')
        .order('created_at', { ascending: false });
      if (efError) throw efError;

      // 2. Fetch Service Provider profiles
      const { data: serviceProviderProfiles, error: spError } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          email,
          phone,
          avatar_url,
          rating,
          reviews_count,
          kyc_status,
          is_kyc_verified,
          free_booking_used,
          total_bookings,
          created_at,
          subscriptions!user_id (
            id,
            plan_type,
            status,
            expires_at
          ),
          active_boosts!user_id (
            id,
            started_at,
            expires_at,
            package:boost_packages!inner (
              priority_level
            )
          )
        `)
        .eq('role', 'service-provider')
        .order('created_at', { ascending: false });
      if (spError) throw spError;

      // 3. Fetch estate firm profiles for visibility (subscription/free posts)
      const estateFirmIds = estateFirms.map(f => f.id);
      const { data: estateFirmProfiles } = await supabase
        .from('estate_firm_profiles')
        .select('id, free_posts_remaining, subscription_status, subscription_expiry')
        .in('id', estateFirmIds);

      const profileMap = {};
      estateFirmProfiles?.forEach(p => profileMap[p.id] = p);

      // 4. Fetch service_providers details
      let providerDetailsMap = {};
      if (serviceProviderProfiles?.length) {
        const providerIds = serviceProviderProfiles.map(p => p.id);
        const { data: spDetails, error: spDetailsError } = await supabase
          .from('service_providers')
          .select('*')
          .in('user_id', providerIds);
        if (spDetailsError) throw spDetailsError;
        providerDetailsMap = (spDetails || []).reduce((acc, detail) => {
          acc[detail.user_id] = detail;
          return acc;
        }, {});
      }

      // 5. Fetch services for providers
      let servicesByProvider = {};
      if (serviceProviderProfiles?.length) {
        const providerIds = serviceProviderProfiles.map(p => p.id);
        const { data: servicesData, error: srvError } = await supabase
          .from('services')
          .select('provider_id, service_title')
          .in('provider_id', providerIds);
        if (srvError) throw srvError;
        servicesByProvider = (servicesData || []).reduce((acc, srv) => {
          if (!acc[srv.provider_id]) acc[srv.provider_id] = [];
          acc[srv.provider_id].push(srv.service_title);
          return acc;
        }, {});
      }

      // 6. Fetch estate services
      const { data: estateServices, error: esError } = await supabase
        .from('estate_services')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      if (esError) throw esError;

      // 7. Fetch review stats for all providers
      const allProviderIds = [
        ...estateFirms.map(f => f.id),
        ...serviceProviderProfiles.map(p => p.id)
      ];
      const { data: reviewStats } = await supabase
        .from('reviews')
        .select('provider_id, rating')
        .in('provider_id', allProviderIds);

      const reviewMap = {};
      reviewStats?.forEach(r => {
        if (!reviewMap[r.provider_id]) {
          reviewMap[r.provider_id] = { total: 0, count: 0 };
        }
        reviewMap[r.provider_id].total += r.rating;
        reviewMap[r.provider_id].count += 1;
      });

      // 8. Transform estate firms with visibility filter
      const transformedEstateFirms = (estateFirms || [])
        .filter(firm => {
          const profile = profileMap[firm.id];
          if (!profile) return true;
          const hasActiveSub = profile.subscription_status === 'active' && new Date(profile.subscription_expiry) > new Date();
          const hasFreePosts = (profile.free_posts_remaining || 0) > 0;
          return hasActiveSub || hasFreePosts;
        })
        .map(firm => {
          const activeBoost = firm.active_boosts?.find(b => 
            b.started_at && new Date(b.expires_at) > new Date()
          );
          const isBoosted = !!activeBoost;
          const boostPriority = activeBoost?.package?.priority_level || 0;
          const isVerified = firm.is_kyc_verified === true || firm.kyc_status === 'approved';
          const subscription = firm.subscriptions?.[0];
          const isSubscribed = subscription?.status === 'active' && 
            (!subscription.expires_at || new Date(subscription.expires_at) > new Date());
          const stats = reviewMap[firm.id] || { total: 0, count: 0 };
          const avgRating = stats.count > 0 ? stats.total / stats.count : 0;

          return {
            id: firm.id,
            type: 'estate-firm',
            name: firm.full_name || 'Estate Firm',
            description: 'Professional real estate services',
            logo: firm.avatar_url || '🏢',
            location: firm.location || `${firm.state || ''} ${firm.lga || ''}`.trim() || 'Nigeria',
            rating: avgRating,
            reviews: stats.count,
            services: ['Property Management', 'Sales & Rentals', 'Valuation'],
            verificationState: isVerified ? 'verified' : 'unverified',
            boostState: isBoosted ? 'boosted' : 'not-boosted',
            subscriptionState: isSubscribed ? 'subscribed' : 'unsubscribed',
            badges: [
              ...(isVerified ? ['verified'] : []),
              ...(isBoosted ? ['boosted'] : []),
              ...(!isVerified ? ['unverified'] : [])
            ],
            yearsExperience: firm.years_experience ?? 5,
            propertiesManaged: firm.properties_managed ?? 120,
            responseTime: firm.response_time ?? '2-4 hours',
            contact: {
              phone: firm.phone,
              email: firm.email
            },
            boostPriority,
            createdAt: firm.created_at || new Date().toISOString()
          };
        });

      // 9. Transform estate services into marketplace items
      const transformedEstateServices = (estateServices || [])
  .map(service => {
    const firm = estateFirms.find(f => f.id === service.estate_firm_id);
    const profile = profileMap[service.estate_firm_id];
    const firmVisible = profile 
      ? (profile.subscription_status === 'active' && new Date(profile.subscription_expiry) > new Date()) 
        || (profile.free_posts_remaining || 0) > 0
      : true;
    if (!firmVisible || !firm) return null; // skip if firm not found or not visible

    const isFirmVerified = firm?.is_kyc_verified || firm?.kyc_status === 'approved';
    const isFirmBoosted = firm?.active_boosts?.some(b => b.started_at && new Date(b.expires_at) > new Date());

    return {
      id: service.id,
      type: 'service',
      serviceType: 'estate',
      name: service.title,
      description: service.description,
      providerName: firm?.full_name || 'Estate Firm',
      providerId: firm?.id, // ✅ use the firm's profiles.id
      category: service.category,
      priceModel: service.price_model,
      price: service.price,
      hourlyRate: service.hourly_rate,
      percentage: service.percentage,
      location: service.location,
      serviceAreas: service.service_areas,
      features: service.features,
      benefits: service.benefits,
      requirements: service.requirements,
      images: service.images,
      contactPhone: service.contact_phone,
      contactEmail: service.contact_email,
      website: service.website,
      rating: 0,
      reviews: 0,
      verificationState: isFirmVerified ? 'verified' : 'unverified',
      boostState: isFirmBoosted ? 'boosted' : 'not-boosted',
      badges: [
        ...(isFirmVerified ? ['verified'] : []),
        ...(isFirmBoosted ? ['boosted'] : []),
        ...(!isFirmVerified ? ['unverified'] : [])
      ],
      createdAt: service.created_at
    };
  })
  .filter(Boolean);
      // 10. Transform service providers
      const transformedServiceProviders = (serviceProviderProfiles || []).map(profile => {
        const providerDetails = providerDetailsMap[profile.id] || {};
        const activeBoost = profile.active_boosts?.find(b => 
          b.started_at && new Date(b.expires_at) > new Date()
        );
        const isBoosted = !!activeBoost;
        const boostPriority = activeBoost?.package?.priority_level || 0;
        const isVerified = profile.is_kyc_verified === true || profile.kyc_status === 'approved';
        const subscription = profile.subscriptions?.[0];
        const isSubscribed = subscription?.status === 'active' && 
          (!subscription.expires_at || new Date(subscription.expires_at) > new Date());

        const freeBookingUsed = profile.free_booking_used || 0;
        const freeBookingLimit = 10;
        const freeBookingsLeft = Math.max(0, freeBookingLimit - freeBookingUsed);
        const subscriptionState = freeBookingUsed >= freeBookingLimit 
          ? (isSubscribed ? 'subscribed' : 'requires_subscription') 
          : 'free';

        const priceLow = providerDetails.price_range_low || 0;
        const priceHigh = providerDetails.price_range_high || 0;
        const priceRange = priceLow && priceHigh 
          ? `₦${priceLow.toLocaleString()} - ₦${priceHigh.toLocaleString()}`
          : 'Contact for pricing';

        const providerServicesFromSP = providerDetails.services || [];
        const providerServicesFromTable = servicesByProvider[profile.id] || [];
        const allServices = [...new Set([...providerServicesFromSP, ...providerServicesFromTable])];

        const stats = reviewMap[profile.id] || { total: 0, count: 0 };
        const avgRating = stats.count > 0 ? stats.total / stats.count : 0;

        return {
          id: profile.id,
          providerId: providerDetails.id || profile.id,
          type: 'service-provider',
          name: providerDetails.business_name || profile.full_name || 'Service Provider',
          title: providerDetails.title || '',
          description: providerDetails.description || 'Experienced professional',
          profileImage: providerDetails.avatar_url || profile.avatar_url || '👨‍🔧',
          location: providerDetails.location || profile.location || 
                    `${providerDetails.state || ''} ${providerDetails.lga || ''}`.trim() || 'Nigeria',
          rating: avgRating,
          reviews: stats.count,
          services: allServices,
          category: providerDetails.category || '',
          priceRange,
          verificationState: isVerified ? 'verified' : 'unverified',
          boostState: isBoosted ? 'boosted' : 'not-boosted',
          subscriptionState,
          badges: [
            ...(isVerified ? ['verified'] : []),
            ...(isBoosted ? ['boosted'] : []),
            ...(!isVerified ? ['unverified'] : [])
          ],
          bookingsCount: freeBookingUsed,
          freeBookingsLeft,
          totalBookings: profile.total_bookings || 0,
          yearsExperience: providerDetails.years_experience || 0,
          successRate: providerDetails.success_rate || 95,
          responseTime: providerDetails.response_time || 'Within 2-4 hours',
          areasServed: providerDetails.areas_served || [],
          boostPriority,
          createdAt: profile.created_at || new Date().toISOString()
        };
      });

      // 11. Combine all items
      const allItems = [
        ...transformedEstateFirms,
        ...transformedEstateServices,
        ...transformedServiceProviders
      ].filter(Boolean);

      // 12. Sort items
      const sortedItems = allItems.sort((a, b) => {
        if (a.boostState === 'boosted' && b.boostState !== 'boosted') return -1;
        if (a.boostState !== 'boosted' && b.boostState === 'boosted') return 1;
        if (a.boostState === 'boosted' && b.boostState === 'boosted') {
          return (b.boostPriority || 0) - (a.boostPriority || 0);
        }
        if (b.rating !== a.rating) return b.rating - a.rating;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });

      setMarketplaceData({
        estateFirms: transformedEstateFirms,
        serviceProviders: transformedServiceProviders,
        allItems: sortedItems
      });

    } catch (err) {
      console.error('Error fetching marketplace data:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ---------- Filtering & Sorting (client-side) ----------
  const filteredItems = marketplaceData.allItems.filter(item => {
    if (!item) return false;

    // Tab filter
    if (activeTab === 'estate-firms' && item.type !== 'estate-firm') return false;
    if (activeTab === 'services' && item.type !== 'service-provider' && item.type !== 'service') return false;

    // Search
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const searchable = [
        item.name,
        item.title || '',
        item.description,
        ...(item.services || []),
        item.location
      ].join(' ').toLowerCase();
      if (!searchable.includes(term)) return false;
    }

    // Verified only
    if (filters.verifiedOnly && item.verificationState !== 'verified') return false;

    // Boosted only
    if (filters.boostOnly && item.boostState !== 'boosted') return false;

    // Min rating
    if (item.rating < filters.minRating) return false;

    // Service type / category
    if (filters.serviceType && (item.type === 'service-provider' || item.type === 'service')) {
      if (!item.services?.some(s => s.toLowerCase().includes(filters.serviceType.toLowerCase()))) {
        return false;
      }
    }
    if (filters.category && (item.type === 'service-provider' || item.type === 'service')) {
      if (item.category !== filters.category) return false;
    }

    // Location filters
    if (filters.state && item.location) {
      if (!item.location.toLowerCase().includes(filters.state.toLowerCase())) return false;
    }

    return true;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    if (!a || !b) return 0;
    switch (filters.sortBy) {
      case 'rating':
        return b.rating - a.rating;
      case 'boosted':
        if (a.boostState === 'boosted' && b.boostState !== 'boosted') return -1;
        if (a.boostState !== 'boosted' && b.boostState === 'boosted') return 1;
        if (a.boostState === 'boosted' && b.boostState === 'boosted') {
          return (b.boostPriority || 0) - (a.boostPriority || 0);
        }
        return 0;
      case 'newest':
        return new Date(b.createdAt) - new Date(a.createdAt);
      default: // relevance
        if (a.boostState === 'boosted' && b.boostState !== 'boosted') return -1;
        if (a.boostState !== 'boosted' && b.boostState === 'boosted') return 1;
        if (a.boostState === 'boosted' && b.boostState === 'boosted') {
          return (b.boostPriority || 0) - (a.boostPriority || 0);
        }
        return b.rating - a.rating;
    }
  });

  // ---------- Action Handlers ----------
  const handleBookService = async (provider) => {
    setSelectedProvider(provider);
    setLoadingPlans(true);
    setShowPricingModal(true);

    const { data, error } = await supabase
      .from('pricing_plans')
      .select('*')
      .eq('provider_id', provider.id)
      .eq('active', true);

    if (error) {
      console.error('Error fetching pricing plans:', error);
      setProviderPlans([]);
    } else {
      setProviderPlans(data || []);
    }
    setLoadingPlans(false);
  };

  const handleBookWithPlan = async (plan) => {
    if (!selectedProvider) return;

    if (selectedProvider.subscriptionState === 'free') {
      const newCount = (selectedProvider.bookingsCount || 0) + 1;
      if (newCount >= 10) {
        alert(`${selectedProvider.name} has reached 10 free bookings. They now require a ₦3,000 monthly subscription to continue receiving bookings.`);
        navigate('/dashboard/provider/subscription');
        setShowPricingModal(false);
        return;
      } else {
        const { error } = await supabase
          .from('profiles')
          .update({ free_booking_used: newCount })
          .eq('id', selectedProvider.id);
        if (error) console.error('Failed to update free booking count:', error);
      }
    }

    // Here you would create a booking record
    alert(`Booking initiated for ${plan.name} with ${selectedProvider.name}`);
    setShowPricingModal(false);
  };

  const handleContactServiceProvider = async (provider) => {
    if (!user) {
      navigate('/login');
      return;
    }
    const providerId = provider.providerId || provider.id;
    try {
      const result = await messagesService.initiateProviderChat(providerId, user.id, user.role);
      if (result?.chatId) {
        navigate(`/dashboard/messages/chat/${result.chatId}`);
      } else {
        alert('Failed to start chat. Please try again.');
      }
    } catch (error) {
      console.error('Error starting chat with provider:', error);
      alert(error.message || 'Failed to start chat');
    }
  };

  const handleContactEstateFirm = (firm) => {
    if (firm.verificationState !== 'verified') {
      alert(`${firm.name} is not yet verified. Please check back later or contact RentEasy support.`);
      return;
    }
    handleContactServiceProvider({ providerId: firm.id });
  };

  // ---------- Badge Rendering ----------
  const renderBadges = (item) => {
    const badges = [];

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

    if (item.boostState === 'boosted') {
      badges.push({
        type: 'boosted',
        label: 'Boosted',
        icon: <Zap size={12} />,
        color: 'var(--badge-boosted)'
      });
    }

    if (item.type === 'service-provider' && item.subscriptionState === 'free') {
      badges.push({
        type: 'free-bookings',
        label: `${item.freeBookingsLeft} free booking${item.freeBookingsLeft !== 1 ? 's' : ''} left`,
        icon: <Sparkles size={12} />,
        color: 'var(--badge-free)'
      });
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

  if (error) {
    return (
      <div className="marketplace-error">
        <AlertCircle size={48} />
        <h3>Failed to load marketplace</h3>
        <p>{error}</p>
        <button onClick={fetchMarketplaceData}>Retry</button>
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
          <ToolCase size={18} />
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
                {/* Card Header */}
                <div className="card-header">
                  <div className="provider-type">
                    {item.type === 'estate-firm' ? (
                      <span className="type-label">
                        <Building size={14} /> Estate Firm
                      </span>
                    ) : item.type === 'service' ? (
                      <span className="type-label">
                        <Briefcase size={14} /> Service
                      </span>
                    ) : (
                      <span className="type-label">
                        <ToolCase size={14} /> Service Provider
                      </span>
                    )}
                  </div>
                  <div className="badges-container">
                    {badges.map((badge, idx) => (
                      <span 
                        key={idx} 
                        className="badge"
                        style={{ backgroundColor: badge.color }}
                        title={badge.label}
                      >
                        {badge.icon}
                        <span className="badge-text">
                          {badge.type === 'free-bookings' ? 'Free' : badge.type === 'boosted' ? 'Boosted' : badge.type === 'verified' ? 'Verified' : 'Unverified'}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Body */}
                <div className="card-body">
                  <div className="provider-info">
                    <div className="provider-avatar">
                      {item.type === 'estate-firm' ? item.logo : item.profileImage}
                    </div>
                    <div className="provider-details">
                      <h3 className="provider-name">{item.name}</h3>
                      {item.title && <p className="provider-title">{item.title}</p>}
                      <p className="provider-description">{item.description}</p>
                    </div>
                  </div>

                  {/* Rating (clickable) */}
                  <div 
                    className="rating-container"
                    onClick={() => navigate(`/provider/${item.id}/reviews`)}
                  >
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
                      {item.rating.toFixed(1)} • {item.reviews} reviews
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
                  {item.services && item.services.length > 0 && (
                    <div className="services-container">
                      <h4>Services Offered:</h4>
                      <div className="services-tags">
                        {item.services.slice(0, 3).map((service, idx) => (
                          <span key={idx} className="service-tag">{service}</span>
                        ))}
                        {item.services.length > 3 && (
                          <span className="service-tag more">+{item.services.length - 3} more</span>
                        )}
                      </div>
                    </div>
                  )}

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

                {/* Card Footer */}
                <div className="card-footer">
                  {item.type === 'estate-firm' ? (
                    <>
                      <button 
                        className="btn btn-outline"
                        onClick={() => navigate(`/services/${item.id}`)}
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
                  ) : item.type === 'service' ? (
                    <>
                      {/* Only show View Details for services and service providers, not for estate firms */}
{item.type !== 'estate-firm' && (
  <button 
    className="btn btn-outline"
    onClick={() => navigate(`/services/${item.id}`)}
  >
    <Eye size={16} />
    <span>View Details</span>
  </button>
)}
                      <button 
                        className="btn btn-primary"
                        onClick={() => handleContactServiceProvider(item)}
                        disabled={item.verificationState !== 'verified'}
                      >
                        <MessageSquare size={16} />
                        <span>Contact</span>
                      </button>
                    </>
                  ) : (
                    // service-provider
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
                      <button 
                        className="btn btn-outline"
                        onClick={() => handleContactServiceProvider(item)}
                      >
                        <MessageSquare size={16} />
                        <span>Contact</span>
                      </button>
                    </>
                  )}
                  {/* Write Review button – visible for all types when user logged in */}
                  {user && (
  <button 
    className="btn btn-outline btn-sm"
    onClick={() => {
      // For service items, use providerId; for others, use item.id
      const reviewId = item.type === 'service' ? item.providerId : item.id;
      navigate(`/write-review/${reviewId}`);
    }}
  >
    <Star size={14} /> Write Review
  </button>
)}
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

      {/* Pricing Plan Modal */}
      {showPricingModal && selectedProvider && (
        <div className="modal-overlay" onClick={() => setShowPricingModal(false)}>
          <div className="modal-content" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Select a Plan for {selectedProvider.name}</h3>
              <button className="modal-close" onClick={() => setShowPricingModal(false)}>×</button>
            </div>
            <div className="modal-body">
              {loadingPlans ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>Loading plans...</div>
              ) : providerPlans.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <p>No active pricing plans available for this provider.</p>
                  <p>Please check back later or contact the provider directly.</p>
                </div>
              ) : (
                <div className="plans-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {providerPlans.map(plan => (
                    <div key={plan.id} className="plan-card" style={{
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      padding: '1rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <h4 style={{ margin: '0 0 0.5rem 0' }}>{plan.name}</h4>
                        <p style={{ margin: '0 0 0.5rem 0', color: '#666' }}>{plan.description}</p>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                          <span style={{ fontWeight: '600', color: '#1a237e' }}>
                            {plan.currency}{plan.price.toLocaleString()}
                            {plan.type === 'hourly' && '/hour'}
                            {plan.type === 'per_unit' && `/${plan.unit}`}
                            {plan.type === 'monthly' && '/month'}
                          </span>
                          {plan.popular && (
                            <span style={{
                              background: '#ff9800',
                              color: 'white',
                              padding: '0.2rem 0.5rem',
                              borderRadius: '4px',
                              fontSize: '0.8rem'
                            }}>Popular</span>
                          )}
                        </div>
                        <div style={{ marginTop: '0.5rem' }}>
                          {plan.features && plan.features.slice(0, 3).map((f, i) => (
                            <span key={i} style={{
                              display: 'inline-block',
                              background: '#f5f5f5',
                              padding: '0.2rem 0.5rem',
                              borderRadius: '4px',
                              fontSize: '0.8rem',
                              marginRight: '0.5rem',
                              marginBottom: '0.3rem'
                            }}>{f}</span>
                          ))}
                          {plan.features && plan.features.length > 3 && (
                            <span style={{ fontSize: '0.8rem', color: '#666' }}>+{plan.features.length - 3} more</span>
                          )}
                        </div>
                      </div>
                      <button
                        className="btn btn-primary"
                        style={{ padding: '0.5rem 1rem' }}
                        onClick={() => handleBookWithPlan(plan)}
                      >
                        Book Now
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowPricingModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketplacePage;