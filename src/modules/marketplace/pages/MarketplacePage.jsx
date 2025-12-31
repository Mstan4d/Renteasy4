// src/modules/marketplace/pages/MarketplacePage.jsx - ENHANCED VERSION
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import { 
  Search, Filter, Star, MapPin, Clock, CheckCircle, 
  Users, TrendingUp, Download, Building, Home, Briefcase,
  Award, Shield, ThumbsUp, Eye, MessageSquare, Phone
} from 'lucide-react';
import ProviderCard from '../components/ProviderCard';
import FilterPanel from '../components/FilterPanel';
import StatsOverview from '../components/StatsOverview';
import ExportModal from '../components/ExportModal';
import { serviceCategories, serviceTags } from '../data/serviceCategories';
import './Marketplace.css';

/**
 * MarketplacePage - Professional Service Provider Discovery
 * Includes Managers, Estate Firms, and Service Providers with reputation scoring
 */
const MarketplacePage = () => {
  // ================= STATE MANAGEMENT =================
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [providers, setProviders] = useState([]);
  const [filteredProviders, setFilteredProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [activeView, setActiveView] = useState('grid'); // grid, list
  const [activeTab, setActiveTab] = useState('all'); // all, estate-firms, property-managers, services
  const [isLoading, setIsLoading] = useState(true);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // Search & Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    state: '',
    lga: '',
    minRating: 4.0,
    verifiedOnly: true,
    priceRange: [0, 1000000],
    services: [],
    availability: 'all',
    category: '',
    serviceType: '',
    tags: [],
    serviceArea: 'all',
    providerType: 'all', // 'all', 'estate-firm', 'property-manager', 'service-provider'
    minExperience: 0,
    minReputation: 0,
    sortBy: 'reputation' // reputation, rating, experience, newest, response-time
  });
  
  // Analytics states
  const [analytics, setAnalytics] = useState({
    totalProviders: 0,
    avgRating: 0,
    verifiedCount: 0,
    totalReputation: 0,
    topServices: [],
    monthlyGrowth: 0,
    byType: {
      estateFirms: 0,
      propertyManagers: 0,
      serviceProviders: 0
    },
    reputationDistribution: {
      elite: 0,      // 90-100
      excellent: 0,  // 80-89
      good: 0,       // 70-79
      average: 0     // Below 70
    }
  });

  // ================= REPUTATION CALCULATION FUNCTIONS =================
  
  const calculateReputationScore = (provider) => {
    let score = 50; // Base score
    
    // Verification status (20 points)
    if (provider.verified) score += 20;
    if (provider.verificationLevel === 'verified') score += 10;
    
    // Experience (20 points)
    if (provider.stats?.yearsExperience) {
      if (provider.stats.yearsExperience >= 10) score += 20;
      else if (provider.stats.yearsExperience >= 5) score += 15;
      else if (provider.stats.yearsExperience >= 2) score += 10;
      else score += 5;
    }
    
    // Ratings and reviews (20 points)
    if (provider.rating >= 4.5) score += 20;
    else if (provider.rating >= 4.0) score += 15;
    else if (provider.rating >= 3.5) score += 10;
    else if (provider.rating > 0) score += 5;
    
    if (provider.reviews >= 50) score += 10;
    else if (provider.reviews >= 20) score += 7;
    else if (provider.reviews >= 10) score += 5;
    else if (provider.reviews >= 5) score += 3;
    
    // Performance metrics (15 points)
    if (provider.stats?.successRate >= 95) score += 15;
    else if (provider.stats?.successRate >= 90) score += 12;
    else if (provider.stats?.successRate >= 85) score += 9;
    else if (provider.stats?.successRate >= 80) score += 6;
    else if (provider.stats?.successRate >= 70) score += 3;
    
    // Response time (10 points)
    if (provider.responseTime?.includes('Within 1 hour')) score += 10;
    else if (provider.responseTime?.includes('Within 2 hours')) score += 8;
    else if (provider.responseTime?.includes('Within 4 hours')) score += 6;
    else if (provider.responseTime?.includes('Within 24 hours')) score += 4;
    else score += 2;
    
    // Professional qualifications (15 points)
    if (provider.qualifications?.includes('certified')) score += 5;
    if (provider.qualifications?.includes('licensed')) score += 5;
    if (provider.qualifications?.includes('insured')) score += 5;
    
    // Client portfolio (10 points)
    if (provider.stats?.propertiesManaged >= 100) score += 10;
    else if (provider.stats?.propertiesManaged >= 50) score += 8;
    else if (provider.stats?.propertiesManaged >= 20) score += 6;
    else if (provider.stats?.propertiesManaged >= 10) score += 4;
    else if (provider.stats?.propertiesManaged >= 5) score += 2;
    
    // Ensure score is between 0-100
    return Math.min(100, Math.max(0, score));
  };
  
  const getReputationBadge = (score) => {
    if (score >= 90) return { level: 'Elite', color: '#7C3AED', icon: '🏆' };
    if (score >= 80) return { level: 'Excellent', color: '#10B981', icon: '⭐' };
    if (score >= 70) return { level: 'Good', color: '#3B82F6', icon: '👍' };
    return { level: 'Average', color: '#6B7280', icon: '📊' };
  };
  
  const calculateAnalytics = (providers) => {
    const total = providers.length;
    const verifiedCount = providers.filter(p => p.verified).length;
    const avgRating = providers.reduce((sum, p) => sum + p.rating, 0) / total || 0;
    const avgReputation = providers.reduce((sum, p) => sum + (p.reputationScore || 0), 0) / total || 0;
    
    // Count by type
    const estateFirmsCount = providers.filter(p => p.type === 'estate-firm').length;
    const propertyManagersCount = providers.filter(p => p.type === 'property-manager').length;
    const serviceProvidersCount = providers.filter(p => p.type === 'service-provider').length;
    
    // Reputation distribution
    const reputationDistribution = {
      elite: providers.filter(p => (p.reputationScore || 0) >= 90).length,
      excellent: providers.filter(p => (p.reputationScore || 0) >= 80 && (p.reputationScore || 0) < 90).length,
      good: providers.filter(p => (p.reputationScore || 0) >= 70 && (p.reputationScore || 0) < 80).length,
      average: providers.filter(p => (p.reputationScore || 0) < 70).length
    };
    
    // Count services frequency
    const serviceCounts = {};
    providers.forEach(p => {
      p.services?.forEach(service => {
        serviceCounts[service] = (serviceCounts[service] || 0) + 1;
      });
    });
    
    const topServices = Object.entries(serviceCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([service]) => service);
    
    setAnalytics({
      totalProviders: total,
      avgRating: parseFloat(avgRating.toFixed(1)),
      verifiedCount,
      totalReputation: parseFloat(avgReputation.toFixed(1)),
      topServices,
      monthlyGrowth: 15.2,
      byType: {
        estateFirms: estateFirmsCount,
        propertyManagers: propertyManagersCount,
        serviceProviders: serviceProvidersCount
      },
      reputationDistribution
    });
  };
  
  // ================= DATA LOADING & TRANSFORMATION =================
  
  useEffect(() => {
    const loadMarketplaceData = async () => {
      setIsLoading(true);
      
      try {
        // Load all verified estate firms
        const estateVerifications = JSON.parse(localStorage.getItem('estateVerifications') || '[]');
        const approvedEstateFirms = estateVerifications.filter(firm => 
          firm.status === 'approved' && firm.verificationStatus === 'approved'
        );
        
        // Load managers
        const managers = JSON.parse(localStorage.getItem('managers') || '[]');
        const activeManagers = managers.filter(m => m.status === 'active');
        
        // Load service providers
        const serviceProviders = JSON.parse(localStorage.getItem('serviceProviders') || '[]');
        const approvedProviders = serviceProviders.filter(p => p.status === 'approved');
        
        // Transform estate firms with reputation scoring
        const transformedEstateFirms = approvedEstateFirms.map(firm => {
          const reputationScore = calculateReputationScore({
            verified: true,
            verificationLevel: 'verified',
            stats: {
              yearsExperience: firm.yearsInOperation || 3,
              successRate: 92,
              propertiesManaged: firm.propertiesCount || 15
            },
            rating: 4.7,
            reviews: 24,
            responseTime: 'Within 2 hours',
            qualifications: firm.certifications || []
          });
          
          const reputationBadge = getReputationBadge(reputationScore);
          
          return {
            id: firm.id || `estate-${Date.now()}`,
            type: 'estate-firm',
            name: firm.businessName,
            company: firm.businessName,
            description: firm.description || `Professional ${firm.businessType} serving ${firm.state || 'multiple'} areas.`,
            logo: firm.logo || null,
            
            // Contact Info
            contact: {
              phone: firm.contactPhone,
              email: firm.contactEmail,
              website: firm.website,
              address: firm.officeAddress
            },
            
            // Location
            location: `${firm.city}, ${firm.state}`,
            state: firm.state,
            lga: firm.lga || firm.city,
            coverage: firm.coverageAreas || [{ state: firm.state, lgas: [firm.lga || firm.city] }],
            
            // Services
            services: firm.servicesOffered || ['Property Management', 'Sales & Rentals', 'Property Valuation', 'Legal Services'],
            categories: ['property-management', 'real-estate'],
            tags: ['estate-firm', 'verified', 'professional'],
            
            // Ratings
            rating: 4.7,
            reviews: 24,
            responseTime: 'Within 2 hours',
            
            // Stats
            stats: {
              yearsExperience: firm.yearsInOperation || 3,
              successRate: 92,
              propertiesManaged: firm.propertiesCount || 15,
              clientsServed: 45,
              responseRate: 98
            },
            
            // Verification & Reputation
            verified: true,
            verificationLevel: 'verified',
            verificationDate: firm.reviewDate || new Date().toISOString(),
            reputationScore,
            reputationBadge,
            tier: reputationBadge.level,
            
            // Additional Info
            specialties: firm.specialties || ['Residential', 'Commercial', 'Industrial'],
            certifications: firm.certifications || ['CAC Registered', 'NIESV Member'],
            languages: ['English', 'Yoruba', 'Hausa', 'Igbo'],
            
            // Pricing
            pricing: {
              consultationFee: 50000,
              managementFee: '8-12%',
              minContract: '6 months'
            },
            
            // Performance Metrics
            performance: {
              onTimeDelivery: 95,
              clientSatisfaction: 96,
              repeatClients: 65,
              avgResponseTime: '1.5 hours'
            },
            
            // Social Proof
            testimonials: [
              { client: 'Mr. Ade Johnson', review: 'Professional and reliable. Managed my property portfolio excellently.', rating: 5 },
              { client: 'TechCorp Ltd', review: 'Handled our corporate housing needs perfectly.', rating: 5 }
            ]
          };
        });
        
        // Transform property managers
        const transformedManagers = activeManagers.map(manager => {
          const reputationScore = calculateReputationScore({
            verified: true,
            verificationLevel: 'verified',
            stats: {
              yearsExperience: 4,
              successRate: 94,
              propertiesManaged: manager.managedProperties?.length || 8
            },
            rating: 4.8,
            reviews: 18,
            responseTime: 'Within 1 hour'
          });
          
          return {
            id: manager.id,
            type: 'property-manager',
            name: manager.name,
            company: 'Property Manager',
            description: 'Professional property manager specializing in residential and commercial properties.',
            // ... rest of manager data with reputation
            reputationScore,
            reputationBadge: getReputationBadge(reputationScore)
          };
        });
        
        // Combine all providers
        const allProviders = [...transformedEstateFirms, ...transformedManagers];
        
        setProviders(allProviders);
        setFilteredProviders(allProviders);
        calculateAnalytics(allProviders);
        
      } catch (error) {
        console.error('Error loading marketplace data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadMarketplaceData();
  }, []);
  
  // ================= FILTERING & SEARCH =================
  
  useEffect(() => {
    if (!providers.length) return;

    let filtered = providers;
    
    // Apply provider type filter
    if (filters.providerType && filters.providerType !== 'all') {
      filtered = filtered.filter(provider => provider.type === filters.providerType);
    }
    
    // Apply tab filter
    if (activeTab !== 'all') {
      filtered = filtered.filter(provider => {
        if (activeTab === 'estate-firms') return provider.type === 'estate-firm';
        if (activeTab === 'property-managers') return provider.type === 'property-manager';
        return true;
      });
    }
    
    // Apply search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(provider =>
        provider.name.toLowerCase().includes(term) ||
        provider.company.toLowerCase().includes(term) ||
        provider.description.toLowerCase().includes(term) ||
        (provider.services && provider.services.some(service => 
          service.toLowerCase().includes(term)
        ))
      );
    }
    
    // Apply state filter
    if (filters.state) {
      filtered = filtered.filter(provider => {
        const stateMatch = provider.state === filters.state;
        const coverageMatch = provider.coverage?.some(area => area.state === filters.state);
        return stateMatch || coverageMatch;
      });
    }
    
    // Apply rating filter
    filtered = filtered.filter(provider => provider.rating >= filters.minRating);
    
    // Apply reputation filter
    filtered = filtered.filter(provider => 
      (provider.reputationScore || 0) >= filters.minReputation
    );
    
    // Apply experience filter
    filtered = filtered.filter(provider => 
      (provider.stats?.yearsExperience || 0) >= filters.minExperience
    );
    
    // Apply verification filter
    if (filters.verifiedOnly) {
      filtered = filtered.filter(provider => provider.verified);
    }
    
    // Apply service type filter
    if (filters.serviceType) {
      filtered = filtered.filter(provider => 
        provider.services && provider.services.some(service => 
          service.toLowerCase().includes(filters.serviceType.toLowerCase())
        )
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'reputation':
          return (b.reputationScore || 0) - (a.reputationScore || 0);
        case 'rating':
          return b.rating - a.rating;
        case 'experience':
          return (b.stats?.yearsExperience || 0) - (a.stats?.yearsExperience || 0);
        case 'newest':
          return new Date(b.verificationDate || 0) - new Date(a.verificationDate || 0);
        case 'response-time':
          return a.responseTime.localeCompare(b.responseTime);
        default:
          return 0;
      }
    });
    
    setFilteredProviders(filtered);
  }, [providers, searchTerm, activeTab, filters]);
  
  // ================= EVENT HANDLERS =================
  
  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };
  
  const handleExport = (format) => {
    console.log(`Exporting ${filteredProviders.length} providers as ${format}`);
    // Implementation for export
  };
  
  const handleContactProvider = (provider, method) => {
    const lead = {
      id: Date.now(),
      providerId: provider.id,
      providerName: provider.name,
      providerType: provider.type,
      providerReputation: provider.reputationScore,
      contactedBy: user?.email || 'guest',
      method: method,
      timestamp: new Date().toISOString()
    };

    const leads = JSON.parse(localStorage.getItem("marketplaceLeads") || "[]");
    leads.push(lead);
    localStorage.setItem("marketplaceLeads", JSON.stringify(leads));
    
    if (method === 'hire') {
      alert(`Hire request sent to ${provider.name}! They will contact you shortly.`);
    } else {
      alert(`Contact request sent to ${provider.name}!`);
    }
  };
  
  const handleBecomeProvider = () => {
    if (!user) {
      navigate('/signup', { state: { role: 'estate-firm' } });
    } else if (user.role === 'estate-firm') {
      navigate('/dashboard/estate-firm/verification');
    } else {
      alert('Please register as an estate firm first.');
    }
  };
  
  const renderReputationLegend = () => (
    <div className="reputation-legend">
      <h4>Reputation Levels</h4>
      <div className="legend-items">
        <div className="legend-item elite">
          <span className="legend-icon">🏆</span>
          <span className="legend-label">Elite (90-100)</span>
          <span className="legend-count">{analytics.reputationDistribution.elite}</span>
        </div>
        <div className="legend-item excellent">
          <span className="legend-icon">⭐</span>
          <span className="legend-label">Excellent (80-89)</span>
          <span className="legend-count">{analytics.reputationDistribution.excellent}</span>
        </div>
        <div className="legend-item good">
          <span className="legend-icon">👍</span>
          <span className="legend-label">Good (70-79)</span>
          <span className="legend-count">{analytics.reputationDistribution.good}</span>
        </div>
        <div className="legend-item average">
          <span className="legend-icon">📊</span>
          <span className="legend-label">Average (Below 70)</span>
          <span className="legend-count">{analytics.reputationDistribution.average}</span>
        </div>
      </div>
    </div>
  );
  
  // ================= RENDER LOADING STATE =================
  if (isLoading) {
    return (
      <div className="marketplace-loading">
        <div className="loading-spinner"></div>
        <p>Loading professional service providers...</p>
      </div>
    );
  }
  
  // ================= MAIN RENDER =================
  return (
    <div className="marketplace">
      {/* Header Section */}
      <header className="marketplace-header">
        <div className="header-content">
          <h1 className="page-title">
            Professional <span className="highlight">Real Estate</span> Services
          </h1>
          <p className="page-subtitle">
            Find verified estate firms, property managers, and service providers with reputation scoring
          </p>
          
          {/* Quick Stats */}
          <div className="header-stats">
            <div className="header-stat">
              <Building size={20} />
              <div>
                <span className="stat-number">{analytics.byType.estateFirms}</span>
                <span className="stat-label">Estate Firms</span>
              </div>
            </div>
            <div className="header-stat">
              <Award size={20} />
              <div>
                <span className="stat-number">{analytics.totalReputation}</span>
                <span className="stat-label">Avg. Reputation</span>
              </div>
            </div>
            <div className="header-stat">
              <Shield size={20} />
              <div>
                <span className="stat-number">{analytics.verifiedCount}</span>
                <span className="stat-label">Verified</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="header-actions">
          <button 
            className="btn btn-secondary"
            onClick={() => setShowExportModal(true)}
          >
            <Download size={18} />
            Export Results
          </button>
         
        </div>
      </header>
      
      {/* Main Content Area */}
      <div className="marketplace-content">
        {/* Left Sidebar - Filters & Legend */}
        <aside className="filters-sidebar">
          <div className="filters-header">
            <h3><Filter size={18} /> Filters</h3>
            <button 
              className="btn-text"
              onClick={() => setFilters({
                state: '',
                lga: '',
                minRating: 4.0,
                verifiedOnly: true,
                priceRange: [0, 1000000],
                services: [],
                availability: 'all',
                category: '',
                serviceType: '',
                tags: [],
                serviceArea: 'all',
                providerType: 'all',
                minExperience: 0,
                minReputation: 0,
                sortBy: 'reputation'
              })}
            >
              Clear All
            </button>
          </div>
          
          <div className="search-container">
            <div className="search-box">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search estate firms or services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
          
          <FilterPanel 
            filters={filters}
            onFilterChange={handleFilterChange}
            providerTypes={[
              { value: 'all', label: 'All Providers' },
              { value: 'estate-firm', label: 'Estate Firms' },
              { value: 'property-manager', label: 'Property Managers' }
            ]}
            showReputationFilter={true}
          />
          
          {renderReputationLegend()}
        </aside>
        
        {/* Main Content */}
        <main className="providers-main">
          {/* Tabs & View Controls */}
          <div className="content-controls">
            <div className="service-tabs">
              <button 
                className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                onClick={() => setActiveTab('all')}
              >
                <Building size={16} /> All Services
              </button>
              <button 
                className={`tab-btn ${activeTab === 'estate-firms' ? 'active' : ''}`}
                onClick={() => setActiveTab('estate-firms')}
              >
                <Home size={16} /> Estate Firms
              </button>
              <button 
                className={`tab-btn ${activeTab === 'property-managers' ? 'active' : ''}`}
                onClick={() => setActiveTab('property-managers')}
              >
                <Briefcase size={16} /> Property Managers
              </button>
            </div>
            
            <div className="view-controls">
              <span className="results-count">
                {filteredProviders.length} providers found
                {filters.providerType === 'estate-firm' && ` • ${analytics.byType.estateFirms} estate firms`}
              </span>
              <div className="sort-options">
                <select 
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange({ sortBy: e.target.value })}
                  className="sort-select"
                >
                  <option value="reputation">Sort by Reputation</option>
                  <option value="rating">Sort by Rating</option>
                  <option value="experience">Sort by Experience</option>
                  <option value="newest">Sort by Newest</option>
                  <option value="response-time">Sort by Response Time</option>
                </select>
              </div>
              <div className="view-toggle">
                <button 
                  className={`view-btn ${activeView === 'grid' ? 'active' : ''}`}
                  onClick={() => setActiveView('grid')}
                  title="Grid View"
                >
                  ▦ Grid
                </button>
                <button 
                  className={`view-btn ${activeView === 'list' ? 'active' : ''}`}
                  onClick={() => setActiveView('list')}
                  title="List View"
                >
                  ≡ List
                </button>
              </div>
            </div>
          </div>
          
          {/* Providers Grid/List */}
          {filteredProviders.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <Building size={48} />
              </div>
              <h3>No estate firms found</h3>
              <p>Try adjusting your search criteria or filters</p>
              <button 
                className="btn btn-primary"
                onClick={handleBecomeProvider}
              >
                <Building size={18} /> Register as Estate Firm
              </button>
            </div>
          ) : (
            <div className={`providers-container ${activeView}-view`}>
              {filteredProviders.map((provider) => {
                const reputationBadge = getReputationBadge(provider.reputationScore || 0);
                
                return (
                  <div key={provider.id} className="provider-card">
                    {/* Card Header with Reputation Badge */}
                    <div className="card-header">
                      <div className="provider-type">
                        {provider.type === 'estate-firm' ? (
                          <span className="type-badge estate">
                            <Building size={14} /> Estate Firm
                          </span>
                        ) : (
                          <span className="type-badge manager">
                            <Briefcase size={14} /> Property Manager
                          </span>
                        )}
                      </div>
                      <div className="reputation-badge" style={{ backgroundColor: reputationBadge.color }}>
                        <span className="reputation-icon">{reputationBadge.icon}</span>
                        <span className="reputation-level">{reputationBadge.level}</span>
                        <span className="reputation-score">{provider.reputationScore || 0}</span>
                      </div>
                    </div>
                    
                    {/* Provider Info */}
                    <div className="provider-info">
                      <div className="provider-logo">
                        {provider.logo ? (
                          <img src={provider.logo} alt={provider.name} />
                        ) : (
                          <div className="logo-placeholder">
                            {provider.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="provider-details">
                        <h3 className="provider-name">{provider.name}</h3>
                        <p className="provider-description">{provider.description}</p>
                        
                        <div className="provider-meta">
                          <div className="meta-item">
                            <MapPin size={14} />
                            <span>{provider.location}</span>
                          </div>
                          <div className="meta-item">
                            <Clock size={14} />
                            <span>{provider.responseTime}</span>
                          </div>
                        </div>
                        
                        {/* Ratings */}
                        <div className="provider-rating">
                          <div className="stars">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                size={16} 
                                className={i < Math.floor(provider.rating) ? 'filled' : 'empty'}
                              />
                            ))}
                          </div>
                          <span className="rating-text">{provider.rating} ({provider.reviews} reviews)</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Services & Specialties */}
                    <div className="provider-services">
                      <h4>Services Offered</h4>
                      <div className="services-tags">
                        {provider?.services?.slice(0, 4).map((service, index) => (
                          <span key={index} className="service-tag">{service}</span>
                        ))}
                        {provider?.services?.length > 4 && (
                          <span className="service-tag more">+{provider.services.length - 4} more</span>
                        )}
                      </div>
                    </div>
                    
                    {/* Stats */}
                    <div className="provider-stats">
                      <div className="stat">
                        <span className="stat-value">{provider.stats?.yearsExperience || 0}+</span>
                        <span className="stat-label">Years</span>
                      </div>
                      <div className="stat">
                        <span className="stat-value">{provider.stats?.propertiesManaged || 0}</span>
                        <span className="stat-label">Properties</span>
                      </div>
                      <div className="stat">
                        <span className="stat-value">{provider.stats?.successRate || 0}%</span>
                        <span className="stat-label">Success Rate</span>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="card-actions">
                      <button 
                        className="btn btn-outline"
                        onClick={() => {
                          setSelectedProvider(provider);
                          setShowDetailModal(true);
                        }}
                      >
                        <Eye size={16} /> View Details
                      </button>
                      <button 
                        className="btn btn-primary"
                        onClick={() => handleContactProvider(provider, 'hire')}
                      >
                        <MessageSquare size={16} /> Hire Now
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {/* How It Works Section */}
          <div className="how-it-works">
            <h3>How to Hire Estate Firms</h3>
            <div className="steps">
              <div className="step">
                <div className="step-number">1</div>
                <h4>Browse Verified Firms</h4>
                <p>Filter by location, services, and reputation scores</p>
              </div>
              <div className="step">
                <div className="step-number">2</div>
                <h4>Review Profiles</h4>
                <p>Check ratings, experience, and client testimonials</p>
              </div>
              <div className="step">
                <div className="step-number">3</div>
                <h4>Contact & Hire</h4>
                <p>Send a hire request and discuss your property needs</p>
              </div>
            </div>
          </div>
        </main>
      </div>
      
      {/* Export Modal */}
      {showExportModal && (
        <ExportModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          onExport={handleExport}
          dataCount={filteredProviders.length}
        />
      )}
      
      {/* Provider Detail Modal */}
      {showDetailModal && selectedProvider && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedProvider.name}</h2>
              <button className="modal-close" onClick={() => setShowDetailModal(false)}>×</button>
            </div>
            <div className="modal-body">
              {/* Detailed provider information */}
              <div className="provider-full-details">
                <h3>Contact Information</h3>
                <p><strong>Phone:</strong> {selectedProvider.contact?.phone || 'Not provided'}</p>
                <p><strong>Email:</strong> {selectedProvider.contact?.email}</p>
                <p><strong>Location:</strong> {selectedProvider.location}</p>
                
                <h3>Services</h3>
                <ul>
                  {selectedProvider.services.map((service, index) => (
                    <li key={index}>{service}</li>
                  ))}
                </ul>
                
                <button 
                  className="btn btn-primary"
                  onClick={() => handleContactProvider(selectedProvider, 'hire')}
                >
                  <Phone size={16} /> Contact Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketplacePage;