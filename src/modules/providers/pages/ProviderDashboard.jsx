// src/modules/providers/pages/ProviderDashboard.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import {
  BarChart3, Users, DollarSign, MessageSquare,
  Star, Clock, TrendingUp, Bell, Settings,
  PlusCircle, FileText, CheckCircle, AlertCircle,
  Briefcase, Tag, Calendar, Award, Shield, Edit
} from 'lucide-react';
import { serviceCategories, serviceTags } from '../../marketplace/data/serviceCategories';
import './ProviderDashboard.css';

const ProviderDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [provider, setProvider] = useState(null);
  const [stats, setStats] = useState({
    totalLeads: 0,
    successfulHires: 0,
    pendingRequests: 0,
    totalRevenue: 0,
    rating: 0,
    responseRate: 0,
    profileViews: 0,
    conversionRate: 0
  });
  
  const [recentLeads, setRecentLeads] = useState([]);
  const [recentReviews, setRecentReviews] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [availableServices, setAvailableServices] = useState([]);
  const [isEditingServices, setIsEditingServices] = useState(false);
  const [loading, setLoading] = useState(true);
  const [performanceMetrics, setPerformanceMetrics] = useState({
    avgResponseTime: '2 hours',
    clientSatisfaction: 0,
    repeatClients: 0,
    leadConversion: 0
  });
  
  // Create a ref to map service names to categories
  const serviceCategoryMap = useRef(new Map());
  
  // Initialize available services from marketplace categories
  useEffect(() => {
    const allServices = [];
    
    // Transform your serviceCategories data to extract services
    serviceCategories.forEach(category => {
      if (category.subCategories) {
        category.subCategories.forEach(subCat => {
          const serviceName = subCat.name || subCat.id;
          allServices.push(serviceName);
          // Map service name to its category
          serviceCategoryMap.current.set(serviceName, {
            categoryId: category.id,
            categoryName: category.name,
            serviceId: subCat.id,
            serviceName: serviceName
          });
        });
      }
      // Also include main category as a service option if it has providers
      if (category.providers && category.providers.length > 0) {
        allServices.push(category.name);
        serviceCategoryMap.current.set(category.name, {
          categoryId: category.id,
          categoryName: category.name,
          serviceId: category.id,
          serviceName: category.name
        });
      }
    });
    
    // Add service tags as additional service options
    serviceTags.forEach(tag => {
      allServices.push(tag.name);
      serviceCategoryMap.current.set(tag.name, {
        categoryId: 'tags',
        categoryName: 'Tags',
        serviceId: tag.id,
        serviceName: tag.name
      });
    });
    
    setAvailableServices([...new Set(allServices)]); // Remove duplicates
  }, []);
  
  useEffect(() => {
    loadProviderData();
  }, []);
  
  const loadProviderData = async () => {
    try {
      setLoading(true);
      
      // Load provider profile
      const providers = JSON.parse(localStorage.getItem('serviceProviders') || '[]');
      const userProvider = providers.find(p => p.userId === user?.id || p.email === user?.email);
      
      if (userProvider) {
        setProvider(userProvider);
        
        // Load provider's selected services
        const providerServices = JSON.parse(localStorage.getItem('providerServices') || '[]');
        const userServices = providerServices.filter(s => s.providerId === userProvider.userId);
        setSelectedServices(userServices.map(s => s.title));
        
        // Calculate stats from leads
        const leads = JSON.parse(localStorage.getItem('firmLeads') || '[]');
        const providerLeads = leads.filter(lead => lead.providerId === userProvider.id);
        
        const successfulHires = providerLeads.filter(l => l.status === 'hired').length;
        const respondedLeads = providerLeads.filter(l => l.respondedAt).length;
        
        setStats({
          totalLeads: providerLeads.length,
          successfulHires,
          pendingRequests: providerLeads.filter(l => l.status === 'pending').length,
          totalRevenue: providerLeads
            .filter(l => l.status === 'hired')
            .reduce((sum, lead) => sum + (lead.amount || 0), 0),
          rating: userProvider.rating || 0,
          responseRate: providerLeads.length > 0 ? Math.round((respondedLeads / providerLeads.length) * 100) : 0,
          profileViews: userProvider.views || 0,
          conversionRate: providerLeads.length > 0 ? Math.round((successfulHires / providerLeads.length) * 100) : 0
        });
        
        // Load recent leads (last 5)
        setRecentLeads(providerLeads
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .slice(0, 5));
        
        // Load recent reviews
        const reviews = JSON.parse(localStorage.getItem('providerReviews') || '[]');
        const providerReviews = reviews.filter(r => r.providerId === userProvider.id);
        setRecentReviews(providerReviews
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 3));
        
        // Calculate performance metrics
        if (providerReviews.length > 0) {
          const avgSatisfaction = providerReviews.reduce((sum, r) => sum + r.rating, 0) / providerReviews.length;
          setPerformanceMetrics(prev => ({
            ...prev,
            clientSatisfaction: Math.round(avgSatisfaction * 20), // Convert to percentage
            repeatClients: userProvider.repeatClients || 0,
            leadConversion: providerLeads.length > 0 ? Math.round((successfulHires / providerLeads.length) * 100) : 0
          }));
        }
      }
    } catch (error) {
      console.error('Error loading provider data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const toggleServiceSelection = (service) => {
    if (selectedServices.includes(service)) {
      setSelectedServices(prev => prev.filter(s => s !== service));
    } else {
      setSelectedServices(prev => [...prev, service]);
    }
  };
  
  const saveServiceSelections = () => {
    if (!provider) return;
    
    try {
      // Update provider's services in localStorage
      const providerServices = JSON.parse(localStorage.getItem('providerServices') || '[]');
      
      // Remove existing services for this provider
      const filteredServices = providerServices.filter(s => s.providerId !== provider.userId);
      
      // Add new services with category information
      const newServices = selectedServices.map(service => {
        const serviceInfo = serviceCategoryMap.current.get(service);
        return {
          id: `service_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          providerId: provider.userId,
          title: service,
          description: '',
          category: serviceInfo?.categoryId || 'other',
          subCategory: serviceInfo?.serviceId || service,
          price: 0,
          createdAt: new Date().toISOString()
        };
      });
      
      localStorage.setItem('providerServices', JSON.stringify([
        ...filteredServices,
        ...newServices
      ]));
      
      // Also update provider object with services
      const providers = JSON.parse(localStorage.getItem('serviceProviders') || '[]');
      const updatedProviders = providers.map(p => 
        p.id === provider.id ? { ...p, services: selectedServices } : p
      );
      localStorage.setItem('serviceProviders', JSON.stringify(updatedProviders));
      
      setProvider(prev => ({ ...prev, services: selectedServices }));
      setIsEditingServices(false);
      
      alert('Services updated successfully!');
    } catch (error) {
      console.error('Error saving services:', error);
      alert('Failed to save services. Please try again.');
    }
  };
  
  const handlePostService = () => {
    if (selectedServices.length === 0) {
      setIsEditingServices(true);
      alert('Please select at least one service before posting.');
      return;
    }
    navigate('/providers/post-service');
  };
  
  // Group services by category for better organization
  const getServicesByCategory = () => {
    const servicesByCategory = {};
    
    serviceCategories.forEach(category => {
      const categoryServices = [];
      
      // Add main category as service if it has providers
      if (category.providers && category.providers.length > 0) {
        categoryServices.push({
          name: category.name,
          id: category.id,
          type: 'category'
        });
      }
      
      // Add subcategories
      if (category.subCategories) {
        category.subCategories.forEach(subCat => {
          categoryServices.push({
            name: subCat.name,
            id: subCat.id,
            type: 'subcategory',
            icon: subCat.icon
          });
        });
      }
      
      if (categoryServices.length > 0) {
        servicesByCategory[category.name] = {
          services: categoryServices,
          icon: category.icon,
          description: category.description
        };
      }
    });
    
    // Add tags as a separate category
    if (serviceTags.length > 0) {
      servicesByCategory['Specialties'] = {
        services: serviceTags.map(tag => ({
          name: tag.name,
          id: tag.id,
          type: 'tag',
          icon: tag.icon
        })),
        icon: '🏷️',
        description: 'Special service features and capabilities'
      };
    }
    
    return servicesByCategory;
  };
  
  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }
  
  if (!provider) {
    return (
      <div className="no-provider-found">
        <div className="empty-state">
          <h2>No Provider Profile Found</h2>
          <p>You haven't registered as a service provider yet.</p>
          <Link to="/providers/register" className="btn btn-primary">
            Register Now
          </Link>
        </div>
      </div>
    );
  }
  
  const servicesByCategory = getServicesByCategory();
  
  return (
    <div className="provider-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="welcome-section">
          <h1>Welcome back, {provider.ownerName || provider.businessName}!</h1>
          <p>Here's what's happening with your business today.</p>
        </div>
        
        <div className="header-actions">
          <button 
            className="btn btn-primary"
            onClick={handlePostService}
          >
            <PlusCircle size={18} />
            Post New Service
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => navigate('/providers/profile')}
          >
            <Settings size={18} />
            Manage Profile
          </button>
        </div>
      </header>
      
      {/* Status Banner */}
      <div className={`status-banner ${provider.status}`}>
        <div className="banner-content">
          <div className="status-info">
            <strong>Status:</strong> {provider.status.toUpperCase()}
            {provider.status === 'pending' && ' - Under review'}
            {provider.status === 'approved' && ' - Ready to receive leads'}
            {provider.status === 'rejected' && ' - Please update your information'}
          </div>
          {provider.status === 'pending' && (
            <button className="btn btn-small">
              Check Verification Status
            </button>
          )}
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#3b82f620' }}>
            <Users size={24} color="#3b82f6" />
          </div>
          <div className="stat-content">
            <h3>{stats.totalLeads}</h3>
            <p>Total Leads</p>
          </div>
          <div className="stat-progress">
            <div className="progress-bar" style={{ width: `${stats.conversionRate}%` }}></div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#10b98120' }}>
            <CheckCircle size={24} color="#10b981" />
          </div>
          <div className="stat-content">
            <h3>{stats.successfulHires}</h3>
            <p>Successful Hires</p>
          </div>
          <span className="stat-trend positive">+{stats.conversionRate}% conversion</span>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#f59e0b20' }}>
            <DollarSign size={24} color="#f59e0b" />
          </div>
          <div className="stat-content">
            <h3>₦{stats.totalRevenue.toLocaleString()}</h3>
            <p>Total Revenue</p>
          </div>
          <span className="stat-trend positive">+15%</span>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#8b5cf620' }}>
            <Star size={24} color="#8b5cf6" />
          </div>
          <div className="stat-content">
            <h3>{stats.rating.toFixed(1)}</h3>
            <p>Average Rating</p>
            <div className="rating-stars">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  size={14} 
                  fill={i < Math.floor(stats.rating) ? "#fbbf24" : "#e5e7eb"} 
                  color={i < Math.floor(stats.rating) ? "#fbbf24" : "#e5e7eb"} 
                />
              ))}
            </div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#ec489920' }}>
            <MessageSquare size={24} color="#ec4899" />
          </div>
          <div className="stat-content">
            <h3>{stats.responseRate}%</h3>
            <p>Response Rate</p>
          </div>
          <span className="stat-trend positive">+5%</span>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#14b8a620' }}>
            <TrendingUp size={24} color="#14b8a6" />
          </div>
          <div className="stat-content">
            <h3>{stats.profileViews}</h3>
            <p>Profile Views</p>
          </div>
          <span className="stat-trend positive">+24%</span>
        </div>
      </div>
      
      {/* Service Selection Panel */}
      <div className="service-selection-panel">
        <div className="panel-header">
          <h3><Tag size={20} /> Your Service Categories</h3>
          <button 
            className="btn btn-small btn-secondary"
            onClick={() => setIsEditingServices(!isEditingServices)}
          >
            <Edit size={16} />
            {isEditingServices ? 'Cancel Editing' : 'Edit Services'}
          </button>
        </div>
        
        {isEditingServices ? (
          <div className="editing-mode">
            <p className="edit-instruction">
              Select the services you offer. These will be displayed in the marketplace.
            </p>
            
            <div className="service-categories-grid">
              {Object.entries(servicesByCategory).map(([categoryName, categoryData]) => (
                <div key={categoryName} className="service-category">
                  <h4 className="category-title">
                    <span className="category-icon">{categoryData.icon}</span>
                    {categoryName}
                  </h4>
                  {categoryData.description && (
                    <p className="category-description">{categoryData.description}</p>
                  )}
                  <div className="service-tags">
                    {categoryData.services.map(service => (
                      <button
                        key={service.id}
                        className={`service-tag ${selectedServices.includes(service.name) ? 'selected' : ''}`}
                        onClick={() => toggleServiceSelection(service.name)}
                      >
                        {service.icon && <span className="service-icon">{service.icon}</span>}
                        {service.name}
                        {selectedServices.includes(service.name) && <CheckCircle size={14} />}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="edit-actions">
              <button 
                className="btn btn-secondary"
                onClick={() => setIsEditingServices(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={saveServiceSelections}
                disabled={selectedServices.length === 0}
              >
                Save Services ({selectedServices.length} selected)
              </button>
            </div>
          </div>
        ) : (
          <div className="viewing-mode">
            {provider.services?.length > 0 ? (
              <div className="current-services">
                <div className="services-tags">
                  {provider.services.map(service => (
                    <span key={service} className="service-tag">
                      {service}
                    </span>
                  ))}
                </div>
                <p className="services-note">
                  Your services are visible in the marketplace. Update them to reach more clients.
                </p>
              </div>
            ) : (
              <div className="no-services">
                <p>You haven't selected any services yet. Add services to appear in marketplace searches.</p>
                <button 
                  className="btn btn-primary btn-small"
                  onClick={() => setIsEditingServices(true)}
                >
                  <PlusCircle size={16} />
                  Add Services Now
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Rest of your component remains the same */}
      {/* ... (Keep all the other sections as they were) ... */}
    </div>
  );
};

export default ProviderDashboard;