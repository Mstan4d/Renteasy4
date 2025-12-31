// src/modules/providers/pages/ProviderServices.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import {
  PlusCircle, Edit, Trash2, Eye, Filter,
  DollarSign, Star, Clock, Users, TrendingUp,
  CheckCircle, XCircle, MoreVertical, Search
} from 'lucide-react';
import './ProviderServices.css';

const ProviderServices = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, active, paused, draft
  const [sortBy, setSortBy] = useState('newest');
  
  useEffect(() => {
    loadServices();
  }, []);
  
  useEffect(() => {
    filterAndSortServices();
  }, [services, searchTerm, filterStatus, sortBy]);
  
  const loadServices = () => {
    try {
      const providerServices = JSON.parse(localStorage.getItem('providerServices') || '[]');
      const userServices = providerServices.filter(
        service => service.providerId === user?.id || service.providerEmail === user?.email
      );
      
      setServices(userServices);
      setFilteredServices(userServices);
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const filterAndSortServices = () => {
    let filtered = services.filter(service => {
      // Filter by status
      if (filterStatus !== 'all' && service.status !== filterStatus) {
        return false;
      }
      
      // Filter by search term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        return (
          service.title.toLowerCase().includes(term) ||
          service.description.toLowerCase().includes(term) ||
          service.category.toLowerCase().includes(term)
        );
      }
      
      return true;
    });
    
    // Sort services
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'popular':
          return (b.views || 0) - (a.views || 0);
        case 'price_high':
          return (b.price || 0) - (a.price || 0);
        case 'price_low':
          return (a.price || 0) - (b.price || 0);
        default:
          return 0;
      }
    });
    
    setFilteredServices(filtered);
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'paused': return '#f59e0b';
      case 'draft': return '#6b7280';
      case 'pending': return '#3b82f6';
      default: return '#6b7280';
    }
  };
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle size={14} color="#10b981" />;
      case 'paused': return <Clock size={14} color="#f59e0b" />;
      case 'draft': return <Edit size={14} color="#6b7280" />;
      case 'pending': return <Clock size={14} color="#3b82f6" />;
      default: return null;
    }
  };
  
  const toggleServiceStatus = (serviceId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    
    const updatedServices = services.map(service => 
      service.id === serviceId ? { ...service, status: newStatus } : service
    );
    
    setServices(updatedServices);
    
    // Update localStorage
    const allServices = JSON.parse(localStorage.getItem('providerServices') || '[]');
    const updatedAllServices = allServices.map(service =>
      service.id === serviceId ? { ...service, status: newStatus } : service
    );
    
    localStorage.setItem('providerServices', JSON.stringify(updatedAllServices));
    
    alert(`Service ${newStatus === 'active' ? 'activated' : 'paused'} successfully!`);
  };
  
  const deleteService = (serviceId) => {
    if (window.confirm('Are you sure you want to delete this service? This action cannot be undone.')) {
      const updatedServices = services.filter(service => service.id !== serviceId);
      setServices(updatedServices);
      
      // Update localStorage
      const allServices = JSON.parse(localStorage.getItem('providerServices') || '[]');
      const updatedAllServices = allServices.filter(service => service.id !== serviceId);
      localStorage.setItem('providerServices', JSON.stringify(updatedAllServices));
      
      alert('Service deleted successfully!');
    }
  };
  
  const duplicateService = (service) => {
    const newService = {
      ...service,
      id: `SVC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: `${service.title} (Copy)`,
      status: 'draft',
      createdAt: new Date().toISOString(),
      views: 0,
      inquiries: 0,
      rating: 0
    };
    
    const updatedServices = [...services, newService];
    setServices(updatedServices);
    
    // Update localStorage
    const allServices = JSON.parse(localStorage.getItem('providerServices') || '[]');
    allServices.push(newService);
    localStorage.setItem('providerServices', JSON.stringify(allServices));
    
    alert('Service duplicated successfully! Edit the new draft to customize it.');
  };
  
  const calculateServiceStats = () => {
    const activeServices = services.filter(s => s.status === 'active').length;
    const totalViews = services.reduce((sum, service) => sum + (service.views || 0), 0);
    const totalInquiries = services.reduce((sum, service) => sum + (service.inquiries || 0), 0);
    const avgRating = services.length > 0 
      ? (services.reduce((sum, service) => sum + (service.rating || 0), 0) / services.length).toFixed(1)
      : 0;
    
    return { activeServices, totalViews, totalInquiries, avgRating };
  };
  
  const formatPrice = (service) => {
    if (service.priceType === 'hourly') {
      return `₦${service.price}/hour`;
    } else if (service.priceType === 'project') {
      return `₦${service.price}/project`;
    } else if (service.priceType === 'monthly') {
      return `₦${service.price}/month`;
    } else {
      return 'Custom Quote';
    }
  };
  
  const stats = calculateServiceStats();
  
  if (loading) {
    return (
      <div className="services-loading">
        <div className="loading-spinner"></div>
        <p>Loading your services...</p>
      </div>
    );
  }
  
  return (
    <div className="provider-services">
      <div className="services-container">
        {/* Header */}
        <div className="services-header">
          <div className="header-content">
            <h1>Manage Services</h1>
            <p className="subtitle">
              View, edit, and manage all your service listings
            </p>
          </div>
          
          <div className="header-actions">
            <Link to="/providers/post-service" className="btn btn-primary">
              <PlusCircle size={18} />
              Post New Service
            </Link>
          </div>
        </div>
        
        {/* Stats Overview */}
        <div className="services-stats">
          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#10b98120' }}>
              <CheckCircle size={24} color="#10b981" />
            </div>
            <div className="stat-content">
              <h3>{stats.activeServices}</h3>
              <p>Active Services</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#3b82f620' }}>
              <Eye size={24} color="#3b82f6" />
            </div>
            <div className="stat-content">
              <h3>{stats.totalViews}</h3>
              <p>Total Views</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#8b5cf620' }}>
              <Users size={24} color="#8b5cf6" />
            </div>
            <div className="stat-content">
              <h3>{stats.totalInquiries}</h3>
              <p>Total Inquiries</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#f59e0b20' }}>
              <Star size={24} color="#f59e0b" />
            </div>
            <div className="stat-content">
              <h3>{stats.avgRating}</h3>
              <p>Avg. Rating</p>
            </div>
          </div>
        </div>
        
        {/* Filters & Search */}
        <div className="services-controls">
          <div className="search-bar">
            <Search size={18} color="#9ca3af" />
            <input
              type="text"
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="controls-right">
            <div className="filter-group">
              <label>
                <Filter size={16} />
                Status:
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Services</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="draft">Drafts</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            
            <div className="sort-group">
              <label>Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="popular">Most Popular</option>
                <option value="price_high">Price: High to Low</option>
                <option value="price_low">Price: Low to High</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Services Table/Grid */}
        {filteredServices.length === 0 ? (
          <div className="empty-services">
            <div className="empty-icon">🔧</div>
            <h3>No services found</h3>
            <p>
              {services.length === 0 
                ? "You haven't posted any services yet. Get started by posting your first service!"
                : "No services match your current filters. Try adjusting your search criteria."}
            </p>
            {services.length === 0 && (
              <Link to="/providers/post-service" className="btn btn-primary">
                <PlusCircle size={18} />
                Post Your First Service
              </Link>
            )}
          </div>
        ) : (
          <div className="services-list">
            {filteredServices.map(service => (
              <div key={service.id} className="service-card">
                <div className="service-header">
                  <div className="service-status">
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(service.status) }}
                    >
                      {getStatusIcon(service.status)}
                      <span>{service.status.toUpperCase()}</span>
                    </span>
                  </div>
                  
                  <div className="service-actions">
                    <div className="dropdown">
                      <button className="dropdown-toggle">
                        <MoreVertical size={18} />
                      </button>
                      <div className="dropdown-menu">
                        <button 
                          className="dropdown-item"
                          onClick={() => navigate(`/services/edit/${service.id}`)}
                        >
                          <Edit size={14} />
                          Edit Service
                        </button>
                        <button 
                          className="dropdown-item"
                          onClick={() => duplicateService(service)}
                        >
                          <TrendingUp size={14} />
                          Duplicate
                        </button>
                        <button 
                          className="dropdown-item"
                          onClick={() => toggleServiceStatus(service.id, service.status)}
                        >
                          {service.status === 'active' ? (
                            <>
                              <Clock size={14} />
                              Pause Service
                            </>
                          ) : (
                            <>
                              <CheckCircle size={14} />
                              Activate Service
                            </>
                          )}
                        </button>
                        <button 
                          className="dropdown-item delete"
                          onClick={() => deleteService(service.id)}
                        >
                          <Trash2 size={14} />
                          Delete Service
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="service-body">
                  <h3 className="service-title">{service.title}</h3>
                  
                  <p className="service-description">
                    {service.description.length > 120
                      ? `${service.description.substring(0, 120)}...`
                      : service.description}
                  </p>
                  
                  <div className="service-details">
                    <div className="detail-item">
                      <DollarSign size={14} />
                      <span>{formatPrice(service)}</span>
                    </div>
                    
                    <div className="detail-item">
                      <Clock size={14} />
                      <span>{service.estimatedTime || 'Flexible'}</span>
                    </div>
                    
                    {service.category && (
                      <div className="detail-item">
                        <span className="service-category">{service.category}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="service-stats">
                    <div className="stat-item">
                      <Eye size={12} />
                      <span>{service.views || 0} views</span>
                    </div>
                    
                    <div className="stat-item">
                      <Users size={12} />
                      <span>{service.inquiries || 0} inquiries</span>
                    </div>
                    
                    {service.rating > 0 && (
                      <div className="stat-item">
                        <Star size={12} fill="#fbbf24" color="#fbbf24" />
                        <span>{service.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="service-footer">
                  <div className="service-date">
                    Posted: {new Date(service.createdAt).toLocaleDateString()}
                  </div>
                  
                  <div className="footer-actions">
                    <button 
                      className="btn btn-small btn-secondary"
                      onClick={() => navigate(`/services/edit/${service.id}`)}
                    >
                      <Edit size={14} />
                      Edit
                    </button>
                    
                    <button 
                      className="btn btn-small btn-primary"
                      onClick={() => navigate(`/services/${service.id}`)}
                    >
                      <Eye size={14} />
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Quick Tips */}
        <div className="services-tips">
          <h3>Service Management Tips</h3>
          <div className="tips-grid">
            <div className="tip-card">
              <h4>Optimize Your Listings</h4>
              <ul>
                <li>Use clear, descriptive titles</li>
                <li>Add high-quality images</li>
                <li>Set competitive pricing</li>
                <li>Include detailed descriptions</li>
              </ul>
            </div>
            
            <div className="tip-card">
              <h4>Boost Visibility</h4>
              <ul>
                <li>Keep services active</li>
                <li>Respond to inquiries quickly</li>
                <li>Ask clients for reviews</li>
                <li>Update listings regularly</li>
              </ul>
            </div>
            
            <div className="tip-card">
              <h4>Track Performance</h4>
              <ul>
                <li>Monitor view counts</li>
                <li>Track inquiry conversion</li>
                <li>Analyze client feedback</li>
                <li>Adjust based on data</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderServices;