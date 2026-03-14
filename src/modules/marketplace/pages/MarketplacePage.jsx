// src/modules/marketplace/pages/MarketplacePage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Filter, Star, MapPin, Clock, CheckCircle, 
  Users, TrendingUp, Building, Home, Briefcase,
  Award, Shield, Eye, MessageSquare, Phone, Calendar,
  DollarSign, Sparkles, AlertCircle, Zap, Crown, Settings, ToolCase,
  Navigation
} from 'lucide-react';
import { supabase } from '../../../shared/lib/supabaseClient';
import { useAuth } from '../../../shared/context/AuthContext';
import { messagesService } from '../../../shared/services/messagesService';
import { locationService } from '../../../shared/services/locationService';
import './Marketplace.css';

const ITEMS_PER_PAGE = 10;
const BOOST_RATIO = 0.8; // 80% boosted, 20% non-boosted

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
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [userLocation, setUserLocation] = useState(null);

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

  const [boostedUserIds, setBoostedUserIds] = useState([]);

  // Detect user location on mount
  useEffect(() => {
    const detectLocation = async () => {
      const location = await locationService.detectUserLocation();
      if (location?.state) {
        setUserLocation(location);
        // Optionally pre‑fill filters with detected location
        // setFilters(prev => ({ ...prev, state: location.state, lga: location.lga || '' }));
      }
    };
    detectLocation();
  }, []);

  // Fetch boosted user IDs from active_boosts
  useEffect(() => {
    const fetchBoostedUsers = async () => {
      const { data, error } = await supabase
        .from('active_boosts')
        .select('user_id')
        .eq('status', 'active')
        .gte('expires_at', new Date().toISOString());
      if (!error && data) {
        setBoostedUserIds(data.map(b => b.user_id));
      }
    };
    fetchBoostedUsers();
  }, []);

  // Main data fetching with boost and location
  useEffect(() => {
    if (boostedUserIds === null) return;
    loadMarketplaceWithBoost();
  }, [activeTab, searchTerm, filters, page, userLocation, boostedUserIds]);

  const loadMarketplaceWithBoost = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Build base query for profiles (both estate firms and service providers)
      let baseQuery = supabase
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
          role,
          created_at,
          free_booking_used,
          total_bookings,
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
        `, { count: 'exact' });

      // Apply role filter based on active tab
      if (activeTab === 'estate-firms') {
        baseQuery = baseQuery.or('role.eq.estate-firm,role.eq.estate_firm');
      } else if (activeTab === 'services') {
        baseQuery = baseQuery.eq('role', 'service-provider');
      } else {
        // 'all' – include both roles
        baseQuery = baseQuery.or('role.eq.estate-firm,role.eq.estate_firm,role.eq.service-provider');
      }

      // Apply location filter from detected location if not overridden by manual filter
      const effectiveState = filters.state || (userLocation?.state || null);
      const effectiveLga = filters.lga || (userLocation?.lga || null);
      if (effectiveState) {
        baseQuery = baseQuery.eq('state', effectiveState);
        if (effectiveLga) baseQuery = baseQuery.eq('lga', effectiveLga);
      }

      // Apply other filters (search, rating, etc.) – we'll do after fetching because they are more complex

      // Get total count (without pagination)
      const { count, error: countError } = await baseQuery;
      if (countError) throw countError;
      setTotalCount(count || 0);

      // Separate boosted and non-boosted queries
      let boostedQuery = baseQuery;
      let nonBoostedQuery = baseQuery;

      if (boostedUserIds.length > 0) {
        const boostedIds = boostedUserIds.join(',');
        boostedQuery = boostedQuery.in('id', boostedUserIds);
        nonBoostedQuery = nonBoostedQuery.not('id', 'in', `(${boostedIds})`);
      } else {
        boostedQuery = boostedQuery.filter('id', 'eq', '0'); // return none
      }

      // Pagination offsets
      const boostedNeeded = Math.round(ITEMS_PER_PAGE * BOOST_RATIO); // 8
      const nonBoostedNeeded = ITEMS_PER_PAGE - boostedNeeded; // 2

      const boostedOffset = (page - 1) * boostedNeeded;
      const nonBoostedOffset = (page - 1) * nonBoostedNeeded;

      // Fetch boosted profiles
      const { data: boostedProfiles, error: boostedError } = await boostedQuery
        .order('created_at', { ascending: false })
        .range(boostedOffset, boostedOffset + boostedNeeded - 1);

      if (boostedError) throw boostedError;

      // Fetch non-boosted profiles
      const { data: nonBoostedProfiles, error: nonBoostedError } = await nonBoostedQuery
        .order('created_at', { ascending: false })
        .range(nonBoostedOffset, nonBoostedOffset + nonBoostedNeeded - 1);

      if (nonBoostedError) throw nonBoostedError;

      // Combine and shuffle
      const shuffledBoosted = shuffleArray(boostedProfiles || []);
      const shuffledNonBoosted = shuffleArray(nonBoostedProfiles || []);

      const combined = [];
      const maxLength = Math.max(shuffledBoosted.length, shuffledNonBoosted.length);
      for (let i = 0; i < maxLength; i++) {
        if (i < shuffledBoosted.length) combined.push(shuffledBoosted[i]);
        if (i < shuffledNonBoosted.length) combined.push(shuffledNonBoosted[i]);
      }

      const pageProfiles = combined.slice(0, ITEMS_PER_PAGE);

      // Now transform these profiles into marketplace items (estate firms and service providers)
      // Also fetch related data (service_providers, estate_services, etc.) only for these IDs
      const profileIds = pageProfiles.map(p => p.id);

      // Fetch estate firm profiles for visibility
      const { data: estateFirmProfiles } = await supabase
        .from('estate_firm_profiles')
        .select('id, free_posts_remaining, subscription_status, subscription_expiry')
        .in('id', profileIds);

      const profileMap = {};
      estateFirmProfiles?.forEach(p => profileMap[p.id] = p);

      // Fetch service_providers details
      let providerDetailsMap = {};
      const serviceProviderIds = pageProfiles.filter(p => p.role === 'service-provider').map(p => p.id);
      if (serviceProviderIds.length > 0) {
        const { data: spDetails } = await supabase
          .from('service_providers')
          .select('*')
          .in('user_id', serviceProviderIds);
        providerDetailsMap = (spDetails || []).reduce((acc, detail) => {
          acc[detail.user_id] = detail;
          return acc;
        }, {});
      }

      // Fetch services for providers
      let servicesByProvider = {};
      if (serviceProviderIds.length > 0) {
        const { data: servicesData } = await supabase
          .from('services')
          .select('provider_id, service_title')
          .in('provider_id', serviceProviderIds);
        servicesByProvider = (servicesData || []).reduce((acc, srv) => {
          if (!acc[srv.provider_id]) acc[srv.provider_id] = [];
          acc[srv.provider_id].push(srv.service_title);
          return acc;
        }, {});
      }

      // Fetch estate services for this page (if needed)
      // We'll limit to services related to the estate firms in this page
      const estateFirmIds = pageProfiles.filter(p => p.role === 'estate-firm' || p.role === 'estate_firm').map(p => p.id);
      let estateServices = [];
      if (estateFirmIds.length > 0) {
        const { data: esData } = await supabase
          .from('estate_services')
          .select('*')
          .eq('status', 'active')
          .in('estate_firm_id', estateFirmIds)
          .order('created_at', { ascending: false });
        estateServices = esData || [];
      }

      // Fetch review stats for these profiles
      const { data: reviewStats } = await supabase
        .from('reviews')
        .select('provider_id, rating')
        .in('provider_id', profileIds);

      const reviewMap = {};
      reviewStats?.forEach(r => {
        if (!reviewMap[r.provider_id]) {
          reviewMap[r.provider_id] = { total: 0, count: 0 };
        }
        reviewMap[r.provider_id].total += r.rating;
        reviewMap[r.provider_id].count += 1;
      });

      // Transform profiles into marketplace items (estate firms)
      const transformedEstateFirms = pageProfiles
        .filter(p => p.role === 'estate-firm' || p.role === 'estate_firm')
        .map(firm => {
          const profile = profileMap[firm.id];
          const hasActiveSub = profile?.subscription_status === 'active' && new Date(profile.subscription_expiry) > new Date();
          const hasFreePosts = (profile?.free_posts_remaining || 0) > 0;
          const isVisible = hasActiveSub || hasFreePosts; // always true for marketplace appearance? The original logic used this to filter, but marketplace visibility is always on. We'll keep it for consistency.
          if (!isVisible) return null;

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
        })
        .filter(Boolean);

      // Transform estate services
      const transformedEstateServices = estateServices
        .map(service => {
          const firm = pageProfiles.find(f => f.id === service.estate_firm_id);
          if (!firm) return null;
          const isFirmVerified = firm.is_kyc_verified || firm.kyc_status === 'approved';
          const isFirmBoosted = firm.active_boosts?.some(b => b.started_at && new Date(b.expires_at) > new Date());

          return {
            id: service.id,
            type: 'service',
            serviceType: 'estate',
            name: service.title,
            description: service.description,
            providerName: firm.full_name || 'Estate Firm',
            providerId: firm.id,
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

      // Transform service providers
      const transformedServiceProviders = pageProfiles
        .filter(p => p.role === 'service-provider')
        .map(profile => {
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

      // Combine all items for this page
      const pageItems = [
        ...transformedEstateFirms,
        ...transformedEstateServices,
        ...transformedServiceProviders
      ];

      // Apply search and other filters locally (since we fetched only needed profiles)
      const filteredPageItems = pageItems.filter(item => {
        if (!item) return false;

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

        return true;
      });

      // Sort the filtered page items
      const sortedPageItems = [...filteredPageItems].sort((a, b) => {
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

      setMarketplaceData({
        estateFirms: transformedEstateFirms,
        serviceProviders: transformedServiceProviders,
        allItems: sortedPageItems
      });

    } catch (err) {
      console.error('Error fetching marketplace data:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const shuffleArray = (array) => {
    const a = [...array];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  // Action handlers (unchanged from original)
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

  // Badge rendering (unchanged)
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
        <button onClick={() => loadMarketplaceWithBoost()}>Retry</button>
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
          {userLocation && (
            <div className="location-info">
              <Navigation size={16} />
              <span>Showing providers near {userLocation.city ? `${userLocation.city}, ` : ''}{userLocation.state}</span>
            </div>
          )}
        </div>
      </div>

      {/* Search and Filter Bar (unchanged) */}
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

      {/* Category Tabs (unchanged) */}
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
        <p>{marketplaceData.allItems.length} {activeTab === 'all' ? 'services' : activeTab.replace('-', ' ')} found (page {page} of {totalPages})</p>
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
          </div>
        ) : (
          marketplaceData.allItems.map((item) => {
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

                {/* Card Body (unchanged) */}
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

                {/* Card Footer (unchanged) */}
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
                      <button 
                        className="btn btn-outline"
                        onClick={() => navigate(`/services/${item.id}`)}
                      >
                        <Eye size={16} />
                        <span>View Details</span>
                      </button>
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
                  {/* Write Review button */}
                  {user && (
                    <button 
                      className="btn btn-outline btn-sm"
                      onClick={() => {
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button 
            disabled={page === 1} 
            onClick={() => setPage(p => p - 1)}
          >
            Previous
          </button>
          <span>Page {page} of {totalPages}</span>
          <button 
            disabled={page === totalPages} 
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </button>
        </div>
      )}

      {/* Business Rules Info (unchanged) */}
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

      {/* Pricing Plan Modal (unchanged) */}
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