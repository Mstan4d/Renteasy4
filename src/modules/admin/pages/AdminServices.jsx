// src/modules/admin/pages/AdminServices.jsx
import React, { useState, useEffect } from 'react';
import {
  Building, Wrench, Home, Users, CheckCircle,
  XCircle, Clock, Search, Filter, Plus,
  Edit, Trash2, Eye, MapPin, Phone, Mail,
  Star, TrendingUp, DollarSign, AlertCircle
} from 'lucide-react';
import './AdminServices.css';

const AdminServices = () => {
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    featured: 0,
    categories: 0
  });

  const serviceCategories = [
    'plumbing', 'electrical', 'cleaning', 'moving', 
    'repair', 'maintenance', 'painting', 'pest_control',
    'landscaping', 'security', 'furniture', 'other'
  ];

  useEffect(() => {
    loadServices();
  }, []);

  useEffect(() => {
    filterServices();
  }, [searchTerm, categoryFilter, statusFilter, services]);

  const loadServices = () => {
    try {
      const serviceProviders = JSON.parse(localStorage.getItem('serviceProviders') || '[]');
      const managers = JSON.parse(localStorage.getItem('managers') || '[]');
      const estateProperties = JSON.parse(localStorage.getItem('estateProperties') || '[]');
      
      // Combine all services
      const allServices = [
        ...serviceProviders.map(p => ({ ...p, type: 'provider' })),
        ...managers.map(m => ({ ...m, type: 'manager' })),
        ...estateProperties.map(e => ({ ...e, type: 'estate' }))
      ];
      
      setServices(allServices);
      calculateStats(allServices);
    } catch (error) {
      console.error('Error loading services:', error);
    }
  };

  const calculateStats = (servicesData) => {
    const total = servicesData.length;
    const active = servicesData.filter(s => s.status === 'active' || s.verified).length;
    const pending = servicesData.filter(s => s.status === 'pending' || !s.verified).length;
    const featured = servicesData.filter(s => s.featured).length;
    const categories = [...new Set(servicesData.map(s => s.category || s.serviceType))].length;
    
    setStats({ total, active, pending, featured, categories });
  };

  const filterServices = () => {
    let filtered = [...services];
    
    if (searchTerm) {
      filtered = filtered.filter(service =>
        service.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.ownerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.serviceType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(service => 
        service.category === categoryFilter || service.serviceType === categoryFilter
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(service => 
        statusFilter === 'active' ? (service.status === 'active' || service.verified) :
        statusFilter === 'pending' ? (service.status === 'pending' || !service.verified) :
        statusFilter === 'featured' ? service.featured : true
      );
    }
    
    setFilteredServices(filtered);
  };

  const addNewService = () => {
    setEditingService(null);
    setShowForm(true);
  };

  const editService = (service) => {
    setEditingService(service);
    setShowForm(true);
  };

  const deleteService = (serviceId) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    
    // Remove from appropriate storage based on type
    const service = services.find(s => s.id === serviceId);
    if (!service) return;
    
    let storageKey;
    switch(service.type) {
      case 'provider': storageKey = 'serviceProviders'; break;
      case 'manager': storageKey = 'managers'; break;
      case 'estate': storageKey = 'estateProperties'; break;
      default: return;
    }
    
    const storedData = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const updatedData = storedData.filter(s => s.id !== serviceId);
    localStorage.setItem(storageKey, JSON.stringify(updatedData));
    
    loadServices();
  };

  const toggleServiceStatus = (serviceId, newStatus) => {
    const service = services.find(s => s.id === serviceId);
    if (!service) return;
    
    let storageKey;
    switch(service.type) {
      case 'provider': storageKey = 'serviceProviders'; break;
      case 'manager': storageKey = 'managers'; break;
      case 'estate': storageKey = 'estateProperties'; break;
      default: return;
    }
    
    const storedData = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const updatedData = storedData.map(s =>
      s.id === serviceId 
        ? { ...s, status: newStatus, verified: newStatus === 'active' } 
        : s
    );
    
    localStorage.setItem(storageKey, JSON.stringify(updatedData));
    loadServices();
  };

  const toggleFeatured = (serviceId) => {
    const service = services.find(s => s.id === serviceId);
    if (!service) return;
    
    let storageKey;
    switch(service.type) {
      case 'provider': storageKey = 'serviceProviders'; break;
      case 'manager': storageKey = 'managers'; break;
      case 'estate': storageKey = 'estateProperties'; break;
      default: return;
    }
    
    const storedData = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const updatedData = storedData.map(s =>
      s.id === serviceId ? { ...s, featured: !s.featured } : s
    );
    
    localStorage.setItem(storageKey, JSON.stringify(updatedData));
    loadServices();
  };

  const handleSaveService = (serviceData) => {
    // Determine storage key based on service type
    const storageKey = serviceData.type === 'provider' ? 'serviceProviders' :
                      serviceData.type === 'manager' ? 'managers' : 'estateProperties';
    
    const storedData = JSON.parse(localStorage.getItem(storageKey) || '[]');
    
    if (editingService) {
      // Update existing service
      const updatedData = storedData.map(s =>
        s.id === editingService.id ? { ...serviceData, id: editingService.id } : s
      );
      localStorage.setItem(storageKey, JSON.stringify(updatedData));
    } else {
      // Add new service
      const newService = {
        ...serviceData,
        id: `service-${Date.now()}`,
        createdAt: new Date().toISOString(),
        verified: false,
        status: 'pending',
        featured: false
      };
      localStorage.setItem(storageKey, JSON.stringify([...storedData, newService]));
    }
    
    setShowForm(false);
    setEditingService(null);
    loadServices();
  };

  const getServiceIcon = (category) => {
    switch(category) {
      case 'plumbing': return '🚰';
      case 'electrical': return '⚡';
      case 'cleaning': return '🧹';
      case 'moving': return '🚚';
      case 'repair': return '🔧';
      case 'maintenance': return '🛠️';
      case 'painting': return '🎨';
      case 'pest_control': return '🐜';
      case 'landscaping': return '🌳';
      case 'security': return '🔒';
      case 'furniture': return '🛋️';
      default: return '🏢';
    }
  };

  const getStatusColor = (service) => {
    if (service.featured) return 'featured';
    if (service.status === 'active' || service.verified) return 'active';
    if (service.status === 'pending' || !service.verified) return 'pending';
    return 'inactive';
  };

  return (
    <div className="admin-services">
      <div className="services-header">
        <div className="header-left">
          <h1><Building size={28} /> Service Providers</h1>
          <p>Manage service providers, property managers, and estate services</p>
        </div>
        <div className="header-right">
          <button className="btn-add-service" onClick={addNewService}>
            <Plus size={18} /> Add Service
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="services-stats">
        <div className="stat-card">
          <div className="stat-icon total">
            <Building size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.total}</h3>
            <p>Total Services</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon active">
            <CheckCircle size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.active}</h3>
            <p>Active</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon pending">
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.pending}</h3>
            <p>Pending</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon featured">
            <Star size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.featured}</h3>
            <p>Featured</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon categories">
            <Wrench size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.categories}</h3>
            <p>Categories</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="services-filters">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-group">
          <select 
            value={categoryFilter} 
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Categories</option>
            {serviceCategories.map(category => (
              <option key={category} value={category}>
                {category.replace('_', ' ').toUpperCase()}
              </option>
            ))}
          </select>
          
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="featured">Featured</option>
          </select>
          
          <button className="btn-filter" onClick={() => {
            setSearchTerm('');
            setCategoryFilter('all');
            setStatusFilter('all');
          }}>
            <Filter size={16} /> Clear Filters
          </button>
        </div>
      </div>

      {/* Services Grid */}
      <div className="services-grid">
        {filteredServices.length > 0 ? (
          filteredServices.map(service => (
            <div key={service.id} className={`service-card ${getStatusColor(service)}`}>
              <div className="card-header">
                <div className="service-icon">
                  {getServiceIcon(service.category || service.serviceType)}
                </div>
                <div className="service-info">
                  <h4>{service.businessName || service.ownerName || service.propertyName}</h4>
                  <div className="service-meta">
                    <span className="service-type">{service.type}</span>
                    <span className="service-category">
                      {service.category || service.serviceType}
                    </span>
                  </div>
                </div>
                {service.featured && (
                  <span className="featured-badge">
                    <Star size={14} /> Featured
                  </span>
                )}
              </div>
              
              <div className="card-body">
                <p className="service-description">
                  {service.description || service.servicesOffered || 'No description available'}
                </p>
                
                <div className="service-details">
                  <div className="detail-item">
                    <MapPin size={14} />
                    <span>{service.state || service.location || 'Location not specified'}</span>
                  </div>
                  {service.phone && (
                    <div className="detail-item">
                      <Phone size={14} />
                      <span>{service.phone}</span>
                    </div>
                  )}
                  {service.email && (
                    <div className="detail-item">
                      <Mail size={14} />
                      <span>{service.email}</span>
                    </div>
                  )}
                  {service.rating && (
                    <div className="detail-item">
                      <Star size={14} />
                      <span>{service.rating}/5 ({service.reviews || 0} reviews)</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="card-footer">
                <div className="service-actions">
                  <button 
                    className="btn-view"
                    onClick={() => alert(`Viewing ${service.businessName || service.ownerName}`)}
                  >
                    <Eye size={16} />
                  </button>
                  <button 
                    className="btn-edit"
                    onClick={() => editService(service)}
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    className="btn-delete"
                    onClick={() => deleteService(service.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                
                <div className="service-status">
                  {(service.status === 'pending' || !service.verified) ? (
                    <button 
                      className="btn-approve"
                      onClick={() => toggleServiceStatus(service.id, 'active')}
                    >
                      <CheckCircle size={16} /> Approve
                    </button>
                  ) : (
                    <button 
                      className="btn-deactivate"
                      onClick={() => toggleServiceStatus(service.id, 'inactive')}
                    >
                      <XCircle size={16} /> Deactivate
                    </button>
                  )}
                  
                  <button 
                    className={`btn-featured ${service.featured ? 'active' : ''}`}
                    onClick={() => toggleFeatured(service.id)}
                  >
                    <Star size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-services">
            <Building size={48} />
            <p>No services found</p>
            <button className="btn-add-service" onClick={addNewService}>
              <Plus size={16} /> Add Your First Service
            </button>
          </div>
        )}
      </div>

      {/* Service Form Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingService ? 'Edit Service' : 'Add New Service'}</h3>
              <button className="btn-close" onClick={() => {
                setShowForm(false);
                setEditingService(null);
              }}>
                <XCircle size={20} />
              </button>
            </div>
            
            <div className="modal-body">
              <ServiceForm 
                service={editingService}
                onSave={handleSaveService}
                onCancel={() => {
                  setShowForm(false);
                  setEditingService(null);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Service Form Component
const ServiceForm = ({ service, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    type: service?.type || 'provider',
    businessName: service?.businessName || '',
    ownerName: service?.ownerName || '',
    serviceType: service?.serviceType || 'other',
    description: service?.description || '',
    phone: service?.phone || '',
    email: service?.email || '',
    address: service?.address || '',
    state: service?.state || '',
    city: service?.city || '',
    website: service?.website || '',
    servicesOffered: service?.servicesOffered || '',
    experience: service?.experience || '',
    licenseNumber: service?.licenseNumber || '',
    insurance: service?.insurance || false,
    pricing: service?.pricing || {},
    availability: service?.availability || 'weekdays'
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form className="service-form" onSubmit={handleSubmit}>
      <div className="form-section">
        <h4>Basic Information</h4>
        <div className="form-grid">
          <div className="form-group">
            <label>Service Type *</label>
            <select 
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
            >
              <option value="provider">Service Provider</option>
              <option value="manager">Property Manager</option>
              <option value="estate">Estate Property</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>
              {formData.type === 'provider' ? 'Business Name *' : 
               formData.type === 'manager' ? 'Manager Name *' : 'Property Name *'}
            </label>
            <input
              type="text"
              name={formData.type === 'provider' ? 'businessName' : 
                    formData.type === 'manager' ? 'ownerName' : 'propertyName'}
              value={formData.businessName || formData.ownerName}
              onChange={handleChange}
              required
              placeholder={formData.type === 'provider' ? 'Enter business name' : 
                         formData.type === 'manager' ? 'Enter manager name' : 'Enter property name'}
            />
          </div>
          
          <div className="form-group">
            <label>Category *</label>
            <select 
              name="serviceType"
              value={formData.serviceType}
              onChange={handleChange}
              required
            >
              <option value="plumbing">Plumbing</option>
              <option value="electrical">Electrical</option>
              <option value="cleaning">Cleaning</option>
              <option value="moving">Moving</option>
              <option value="repair">Repair</option>
              <option value="maintenance">Maintenance</option>
              <option value="painting">Painting</option>
              <option value="pest_control">Pest Control</option>
              <option value="landscaping">Landscaping</option>
              <option value="security">Security</option>
              <option value="furniture">Furniture</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="form-section">
        <h4>Contact Information</h4>
        <div className="form-grid">
          <div className="form-group">
            <label>Phone Number *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              placeholder="+234 800 000 0000"
            />
          </div>
          
          <div className="form-group">
            <label>Email Address *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="contact@service.com"
            />
          </div>
          
          <div className="form-group">
            <label>Website</label>
            <input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleChange}
              placeholder="https://service.com"
            />
          </div>
        </div>
      </div>
      
      <div className="form-section">
        <h4>Location</h4>
        <div className="form-grid">
          <div className="form-group">
            <label>State *</label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              required
              placeholder="Lagos"
            />
          </div>
          
          <div className="form-group">
            <label>City *</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
              placeholder="Ikeja"
            />
          </div>
          
          <div className="form-group full-width">
            <label>Full Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Street address, landmark"
            />
          </div>
        </div>
      </div>
      
      <div className="form-section">
        <h4>Additional Information</h4>
        <div className="form-group">
          <label>Description *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={4}
            placeholder="Describe your services, expertise, and what makes you unique..."
          />
        </div>
        
        <div className="form-group">
          <label>Services Offered</label>
          <textarea
            name="servicesOffered"
            value={formData.servicesOffered}
            onChange={handleChange}
            rows={3}
            placeholder="List specific services you offer (comma separated)"
          />
        </div>
        
        <div className="form-checkbox">
          <label>
            <input
              type="checkbox"
              name="insurance"
              checked={formData.insurance}
              onChange={handleChange}
            />
            <span>Has Insurance Coverage</span>
          </label>
        </div>
      </div>
      
      <div className="form-actions">
        <button type="button" className="btn-cancel" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn-submit">
          {service ? 'Update Service' : 'Add Service'}
        </button>
      </div>
    </form>
  );
};

export default AdminServices;