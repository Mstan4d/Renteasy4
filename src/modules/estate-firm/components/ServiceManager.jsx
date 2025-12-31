import React, { useState } from 'react';
import { 
  Briefcase, PlusCircle, Tag, Users, Star,
  MapPin, Clock, DollarSign, Edit, Trash2,
  Eye, MessageSquare, Filter, Search,
  TrendingUp, CheckCircle, XCircle
} from 'lucide-react';

import './ServiceManager.css';

const ServiceManager = () => {
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
      created: '2024-10-15'
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
      created: '2024-11-05'
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
      created: '2024-09-20'
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
      created: '2024-08-10'
    }
  ]);

  const [serviceRequests, setServiceRequests] = useState([
    {
      id: 'req_001',
      serviceId: 'svc_001',
      clientName: 'Mr. Adebayo Johnson',
      property: '3-Bedroom Duplex, Lekki',
      message: 'Looking for full property management services for my Lekki property.',
      status: 'pending',
      date: '2024-12-01',
      budget: '₦200,000/month'
    },
    {
      id: 'req_002',
      serviceId: 'svc_002',
      clientName: 'TechCorp Solutions Ltd',
      property: 'Office Complex, VI',
      message: 'Need property valuation for insurance purposes.',
      status: 'accepted',
      date: '2024-11-28',
      budget: '₦150,000'
    },
    {
      id: 'req_003',
      serviceId: 'svc_003',
      clientName: 'Mrs. Bola Ahmed',
      property: '2-Bedroom Flat, Ikeja',
      message: 'Need tenant screening for new occupant.',
      status: 'completed',
      date: '2024-11-25',
      budget: '₦15,000'
    }
  ]);

  const [activeTab, setActiveTab] = useState('services');
  const [searchQuery, setSearchQuery] = useState('');

  const handleAddService = () => {
    console.log('Open add service form');
  };

  const handleEditService = (service) => {
    console.log('Edit service:', service);
  };

  const handleToggleStatus = (serviceId) => {
    setServices(services.map(svc => 
      svc.id === serviceId 
        ? { ...svc, status: svc.status === 'active' ? 'inactive' : 'active' }
        : svc
    ));
  };

  const handleToggleFeatured = (serviceId) => {
    setServices(services.map(svc => 
      svc.id === serviceId 
        ? { ...svc, featured: !svc.featured }
        : svc
    ));
  };

  const filteredServices = services.filter(service =>
    service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCategoryColor = (category) => {
    const colors = {
      'property-management': '#3b82f6',
      'valuation': '#10b981',
      'verification': '#8b5cf6',
      'legal': '#f59e0b',
      'maintenance': '#ef4444'
    };
    return colors[category] || '#6b7280';
  };

  return (
    <div className="service-manager">
      {/* Header */}
      <div className="manager-header">
        <div>
          <h2>Service Marketplace</h2>
          <p className="subtitle">
            Manage your professional services and client requests
          </p>
        </div>
        
        <div className="header-actions">
          <button className="btn btn-primary" onClick={handleAddService}>
            <PlusCircle size={18} />
            Add New Service
          </button>
          <button className="btn btn-outline">
            <TrendingUp size={18} />
            View Analytics
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="service-tabs">
        <button 
          className={`tab ${activeTab === 'services' ? 'active' : ''}`}
          onClick={() => setActiveTab('services')}
        >
          <Briefcase size={18} />
          My Services ({services.length})
        </button>
        <button 
          className={`tab ${activeTab === 'requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          <MessageSquare size={18} />
          Service Requests ({serviceRequests.length})
        </button>
        <button 
          className={`tab ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <TrendingUp size={18} />
          Performance
        </button>
      </div>

      {/* Services Tab */}
      {activeTab === 'services' && (
        <>
          {/* Stats */}
          <div className="service-stats">
            <div className="stat-card">
              <Briefcase size={24} />
              <div className="stat-info">
                <span className="stat-label">Active Services</span>
                <span className="stat-value">
                  {services.filter(s => s.status === 'active').length}
                </span>
              </div>
            </div>
            
            <div className="stat-card">
              <Users size={24} />
              <div className="stat-info">
                <span className="stat-label">Service Requests</span>
                <span className="stat-value">{serviceRequests.length}</span>
              </div>
            </div>
            
            <div className="stat-card">
              <Star size={24} />
              <div className="stat-info">
                <span className="stat-label">Average Rating</span>
                <span className="stat-value">
                  {(services.reduce((sum, s) => sum + s.rating, 0) / services.length).toFixed(1)}
                </span>
              </div>
            </div>
            
            <div className="stat-card">
              <DollarSign size={24} />
              <div className="stat-info">
                <span className="stat-label">Featured Services</span>
                <span className="stat-value">
                  {services.filter(s => s.featured).length}
                </span>
              </div>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="service-controls">
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
            
            <div className="filter-buttons">
              <button className="btn btn-sm">
                <Filter size={16} />
                Category
              </button>
              <button className="btn btn-sm">
                <Filter size={16} />
                Status
              </button>
            </div>
          </div>

          {/* Services Grid */}
          <div className="services-grid">
            {filteredServices.map(service => (
              <div key={service.id} className="service-card">
                <div className="service-header">
                  <div className="service-category">
                    <span 
                      className="category-badge"
                      style={{ backgroundColor: getCategoryColor(service.category) }}
                    >
                      {service.category.replace('-', ' ')}
                    </span>
                    {service.featured && (
                      <span className="featured-badge">
                        <Star size={12} />
                        Featured
                      </span>
                    )}
                  </div>
                  
                  <div className="service-actions">
                    <button 
                      className={`status-toggle ${service.status}`}
                      onClick={() => handleToggleStatus(service.id)}
                      title={service.status === 'active' ? 'Deactivate' : 'Activate'}
                    >
                      {service.status === 'active' ? 
                        <CheckCircle size={14} /> : 
                        <XCircle size={14} />
                      }
                    </button>
                    <button 
                      className="btn-icon"
                      onClick={() => handleEditService(service)}
                      title="Edit"
                    >
                      <Edit size={14} />
                    </button>
                  </div>
                </div>

                <div className="service-body">
                  <h4>{service.title}</h4>
                  <p className="service-description">{service.description}</p>
                  
                  <div className="service-details">
                    <div className="detail">
                      <MapPin size={14} />
                      <span>{service.location}</span>
                    </div>
                    <div className="detail">
                      <DollarSign size={14} />
                      <span>{service.price}</span>
                    </div>
                    <div className="detail">
                      <Clock size={14} />
                      <span>Posted: {service.created}</span>
                    </div>
                  </div>

                  <div className="service-metrics">
                    <div className="metric">
                      <Star size={14} />
                      <span>
                        {service.rating} ({service.reviews} reviews)
                      </span>
                    </div>
                    <div className="metric">
                      <Users size={14} />
                      <span>{service.requests} requests</span>
                    </div>
                  </div>
                </div>

                <div className="service-footer">
                  <button className="btn btn-sm">
                    <Eye size={14} />
                    View Details
                  </button>
                  <button className="btn btn-sm btn-outline">
                    <TrendingUp size={14} />
                    Promote
                  </button>
                  <button className="btn-icon" title="Delete">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Service Button */}
          <div className="add-service-cta">
            <button className="btn btn-primary btn-lg" onClick={handleAddService}>
              <PlusCircle size={20} />
              Add New Service
            </button>
          </div>
        </>
      )}

      {/* Service Requests Tab */}
      {activeTab === 'requests' && (
        <div className="requests-section">
          <div className="requests-stats">
            <div className="stat">
              <span className="stat-label">Pending</span>
              <span className="stat-value pending">
                {serviceRequests.filter(r => r.status === 'pending').length}
              </span>
            </div>
            <div className="stat">
              <span className="stat-label">Accepted</span>
              <span className="stat-value accepted">
                {serviceRequests.filter(r => r.status === 'accepted').length}
              </span>
            </div>
            <div className="stat">
              <span className="stat-label">Completed</span>
              <span className="stat-value completed">
                {serviceRequests.filter(r => r.status === 'completed').length}
              </span>
            </div>
          </div>

          <div className="requests-list">
            {serviceRequests.map(request => {
              const service = services.find(s => s.id === request.serviceId);
              
              return (
                <div key={request.id} className="request-card">
                  <div className="request-header">
                    <div className="request-info">
                      <h4>{service?.title}</h4>
                      <div className="request-client">
                        <Users size={14} />
                        <span>{request.clientName}</span>
                        <span className="property">{request.property}</span>
                      </div>
                    </div>
                    <span className={`request-status ${request.status}`}>
                      {request.status}
                    </span>
                  </div>

                  <p className="request-message">{request.message}</p>

                  <div className="request-details">
                    <div className="detail">
                      <Calendar size={14} />
                      <span>Requested: {request.date}</span>
                    </div>
                    <div className="detail">
                      <DollarSign size={14} />
                      <span>Budget: {request.budget}</span>
                    </div>
                  </div>

                  <div className="request-actions">
                    {request.status === 'pending' && (
                      <>
                        <button className="btn btn-sm btn-success">
                          Accept Request
                        </button>
                        <button className="btn btn-sm btn-outline">
                          Message Client
                        </button>
                        <button className="btn btn-sm btn-danger">
                          Decline
                        </button>
                      </>
                    )}
                    {request.status === 'accepted' && (
                      <>
                        <button className="btn btn-sm btn-primary">
                          Mark as Complete
                        </button>
                        <button className="btn btn-sm btn-outline">
                          Send Invoice
                        </button>
                      </>
                    )}
                    {request.status === 'completed' && (
                      <button className="btn btn-sm">
                        View Details
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceManager;