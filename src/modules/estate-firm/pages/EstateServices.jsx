import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Briefcase, PlusCircle, TrendingUp, Filter,
  Search, Star, MessageSquare, Clock,
  Eye, Edit, Trash2, MoreVertical
} from 'lucide-react';
import './EstateServicesPage.css';

const EstateServicesPage = () => {
  const [services, setServices] = useState([
    {
      id: 'svc_001',
      title: 'Property Management Services',
      description: 'Complete property management including tenant screening, rent collection, and maintenance coordination.',
      category: 'property-management',
      price: '10-15% of monthly rent',
      location: 'Lagos State',
      rating: 4.8,
      reviews: 42,
      status: 'active',
      requests: 12,
      featured: true,
      created: '2024-10-15',
      views: 245
    },
    {
      id: 'svc_002',
      title: 'Real Estate Valuation',
      description: 'Professional property valuation for sales, purchase, or insurance purposes.',
      category: 'valuation',
      price: '₦50,000 - ₦200,000',
      location: 'Nationwide',
      rating: 4.9,
      reviews: 28,
      status: 'active',
      requests: 8,
      featured: true,
      created: '2024-11-05',
      views: 189
    },
    {
      id: 'svc_003',
      title: 'Tenant Screening & Verification',
      description: 'Comprehensive background checks and verification for potential tenants.',
      category: 'verification',
      price: '₦15,000 per tenant',
      location: 'Lagos & Abuja',
      rating: 4.7,
      reviews: 35,
      status: 'active',
      requests: 15,
      featured: false,
      created: '2024-09-20',
      views: 312
    },
    {
      id: 'svc_004',
      title: 'Legal Documentation Services',
      description: 'Preparation and review of tenancy agreements, leases, and property documents.',
      category: 'legal',
      price: '₦30,000 - ₦100,000',
      location: 'Nationwide',
      rating: 4.6,
      reviews: 19,
      status: 'inactive',
      requests: 3,
      featured: false,
      created: '2024-08-10',
      views: 156
    }
  ]);

  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredServices = services.filter(service => {
    if (filter === 'active') return service.status === 'active';
    if (filter === 'inactive') return service.status === 'inactive';
    if (filter === 'featured') return service.featured;
    return true;
  }).filter(service =>
    service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: services.length,
    active: services.filter(s => s.status === 'active').length,
    featured: services.filter(s => s.featured).length,
    totalRequests: services.reduce((sum, s) => sum + s.requests, 0),
    totalViews: services.reduce((sum, s) => sum + s.views, 0)
  };

  const handleToggleStatus = (serviceId) => {
    setServices(services.map(svc => 
      svc.id === serviceId 
        ? { ...svc, status: svc.status === 'active' ? 'inactive' : 'active' }
        : svc
    ));
  };

  const handleDeleteService = (serviceId) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      setServices(services.filter(svc => svc.id !== serviceId));
    }
  };

  return (
    <div className="estate-services-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Service Management</h1>
          <p className="subtitle">Manage your professional services in the marketplace</p>
        </div>
        
        <div className="header-actions">
          <Link to="/dashboard/estate/post-service" className="btn btn-primary">
            <PlusCircle size={18} />
            Post New Service
          </Link>
          <button className="btn btn-outline">
            <TrendingUp size={18} />
            View Analytics
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="services-stats">
        <div className="stat-card">
          <div className="stat-icon total">
            <Briefcase size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total Services</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon active">
            <Star size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.active}</span>
            <span className="stat-label">Active Services</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon featured">
            <TrendingUp size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.featured}</span>
            <span className="stat-label">Featured Services</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon requests">
            <MessageSquare size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.totalRequests}</span>
            <span className="stat-label">Service Requests</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="services-controls">
        <div className="search-bar">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-tabs">
          <button 
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Services ({services.length})
          </button>
          <button 
            className={`filter-tab ${filter === 'active' ? 'active' : ''}`}
            onClick={() => setFilter('active')}
          >
            Active ({stats.active})
          </button>
          <button 
            className={`filter-tab ${filter === 'inactive' ? 'active' : ''}`}
            onClick={() => setFilter('inactive')}
          >
            Inactive ({services.length - stats.active})
          </button>
          <button 
            className={`filter-tab ${filter === 'featured' ? 'active' : ''}`}
            onClick={() => setFilter('featured')}
          >
            Featured ({stats.featured})
          </button>
        </div>
      </div>

      {/* Services Grid */}
      <div className="services-grid">
        {filteredServices.map(service => (
          <div key={service.id} className="service-card">
            <div className="service-header">
              <div className="service-status">
                <span className={`status-badge ${service.status}`}>
                  {service.status}
                </span>
                {service.featured && (
                  <span className="featured-badge">
                    <Star size={12} />
                    Featured
                  </span>
                )}
              </div>
              
              <div className="service-actions">
                <button className="btn-icon">
                  <MoreVertical size={16} />
                </button>
              </div>
            </div>

            <div className="service-body">
              <h3>{service.title}</h3>
              <p className="service-description">{service.description}</p>
              
              <div className="service-meta">
                <div className="meta-item">
                  <span className="label">Price:</span>
                  <span className="value">{service.price}</span>
                </div>
                <div className="meta-item">
                  <span className="label">Location:</span>
                  <span className="value">{service.location}</span>
                </div>
                <div className="meta-item">
                  <span className="label">Posted:</span>
                  <span className="value">{service.created}</span>
                </div>
              </div>

              <div className="service-stats">
                <div className="stat">
                  <Star size={14} />
                  <span>{service.rating} ({service.reviews} reviews)</span>
                </div>
                <div className="stat">
                  <MessageSquare size={14} />
                  <span>{service.requests} requests</span>
                </div>
                <div className="stat">
                  <Eye size={14} />
                  <span>{service.views} views</span>
                </div>
              </div>
            </div>

            <div className="service-footer">
              <button 
                className={`btn btn-sm ${service.status === 'active' ? 'btn-outline' : 'btn-success'}`}
                onClick={() => handleToggleStatus(service.id)}
              >
                {service.status === 'active' ? 'Deactivate' : 'Activate'}
              </button>
              <Link 
                to={`/services/edit/${service.id}`}
                className="btn btn-sm btn-outline"
              >
                <Edit size={14} />
                Edit
              </Link>
              <button 
                className="btn btn-sm btn-outline"
                onClick={() => window.open('/services', '_blank')}
              >
                <Eye size={14} />
                View
              </button>
              <button 
                className="btn btn-sm btn-danger"
                onClick={() => handleDeleteService(service.id)}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredServices.length === 0 && (
        <div className="empty-state">
          <Briefcase size={48} />
          <h3>No services found</h3>
          <p>{searchQuery ? 'Try a different search term' : 'Get started by posting your first service'}</p>
          <Link to="/dashboard/estate/post-service" className="btn btn-primary">
            <PlusCircle size={18} />
            Post Your First Service
          </Link>
        </div>
      )}

      {/* Quick Stats */}
      <div className="quick-stats">
        <div className="stat-summary">
          <h3>Performance Summary</h3>
          <div className="summary-grid">
            <div className="summary-item">
              <span className="label">Total Service Views</span>
              <span className="value">{stats.totalViews.toLocaleString()}</span>
            </div>
            <div className="summary-item">
              <span className="label">Average Rating</span>
              <span className="value">
                {(services.reduce((sum, s) => sum + s.rating, 0) / services.length).toFixed(1)}
              </span>
            </div>
            <div className="summary-item">
              <span className="label">Conversion Rate</span>
              <span className="value">
                {((stats.totalRequests / stats.totalViews) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="summary-item">
              <span className="label">Avg. Response Time</span>
              <span className="value">
                <Clock size={14} />
                2 hours
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EstateServicesPage;