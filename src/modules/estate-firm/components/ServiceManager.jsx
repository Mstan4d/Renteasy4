import React, { useState, useEffect } from 'react';
import { 
  Briefcase, PlusCircle, Tag, Users, Star,
  MapPin, Clock, DollarSign, Edit, Trash2,
  Eye, MessageSquare, Filter, Search,
  TrendingUp, CheckCircle, XCircle,
  Phone, Mail, Calendar, Download
} from 'lucide-react';
import { supabase } from '../../../shared/lib/supabaseClient';
import { useAuth } from '../../../shared/context/AuthContext';
import './ServiceManager.css';

const ServiceManager = () => {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [serviceRequests, setServiceRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('services');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [newService, setNewService] = useState({
    title: '',
    description: '',
    category: 'property-management',
    service_type: 'professional',
    price_model: 'fixed',
    price: '',
    location: '',
    duration: ''
  });

  useEffect(() => {
    loadServicesAndRequests();
  }, [user]);

  const loadServicesAndRequests = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Load estate firm services
      const { data: servicesData, error: servicesError } = await supabase
        .from('estate_services')
        .select('*')
        .eq('estate_firm_id', user.id)
        .order('created_at', { ascending: false });

      if (servicesError) throw servicesError;
      setServices(servicesData || []);

      // Load service requests
      const { data: requestsData, error: requestsError } = await supabase
        .from('service_requests')
        .select('*, service:estate_services(title)')
        .eq('estate_firm_id', user.id)
        .order('created_at', { ascending: false });

      if (requestsError) throw requestsError;
      setServiceRequests(requestsData || []);

    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddService = async () => {
    if (!newService.title || !user) return;

    try {
      const { data, error } = await supabase
        .from('estate_services')
        .insert({
          estate_firm_id: user.id,
          name: newService.name,
          email: newService.email,
          phone: newService.phone,
          address: newService.address,
          client_type: newService.client_type,
          status: 'active',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Add activity log
      await supabase.from('activities').insert({
        user_id: user.id,
        type: 'service',
        action: 'add',
        description: `Added new service: ${newService.title}`, // FIXED: Added backticks
        created_at: new Date().toISOString()
      });

      // Refresh services list
      await loadServicesAndRequests();
      
      // Reset form
      setNewService({
        title: '',
        description: '',
        category: 'property-management',
        service_type: 'professional',
        price_model: 'fixed',
        price: '',
        location: '',
        duration: ''
      });
      
      setShowAddServiceModal(false);
      alert('Service added successfully!');

    } catch (error) {
      console.error('Error adding service:', error);
      alert('Failed to add service. Please try again.');
    }
  };

  const handleToggleStatus = async (serviceId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      
      const { error } = await supabase
        .from('estate_services')
        .update({ status: newStatus })
        .eq('id', serviceId);

      if (error) throw error;

      // Refresh services
      await loadServicesAndRequests();

      // Log activity
      await supabase.from('activities').insert({
        user_id: user.id,
        type: 'service',
        action: 'toggle_status',
        description: `Changed service status to ${newStatus}`,
        created_at: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error toggling service status:', error);
      alert('Failed to update service status. Please try again.');
    }
  };

  const handleDeleteService = async (serviceId, serviceTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${serviceTitle}"?`)) return;

    try {
      const { error } = await supabase
        .from('estate_services')
        .delete()
        .eq('id', serviceId);

      if (error) throw error;

      // Refresh services
      await loadServicesAndRequests();

      // Log activity
      await supabase.from('activities').insert({
        user_id: user.id,
        type: 'service',
        action: 'delete',
        description: `Deleted service: ${serviceTitle}`,
        created_at: new Date().toISOString()
      });

      alert('Service deleted successfully!');

    } catch (error) {
      console.error('Error deleting service:', error);
      alert('Failed to delete service. Please try again.');
    }
  };

  const handleUpdateRequestStatus = async (requestId, newStatus) => {
    try {
      const { error } = await supabase
        .from('service_requests')
        .update({ status: newStatus })
        .eq('id', requestId);

      if (error) throw error;

      // Refresh requests
      await loadServicesAndRequests();

      // Log activity
      await supabase.from('activities').insert({
        user_id: user.id,
        type: 'service_request',
        action: 'update_status',
        description: `Updated request status to ${newStatus}`,
        created_at: new Date().toISOString()
      });

      alert(`Request ${newStatus} successfully!`);

    } catch (error) {
      console.error('Error updating request status:', error);
      alert('Failed to update request status. Please try again.');
    }
  };

  const exportServices = () => {
    const csvContent = [
      ['Title', 'Category', 'Type', 'Price Model', 'Price', 'Location', 'Status', 'Requests', 'Created Date'],
      ...services.map(service => [
        service.title,
        service.category,
        service.service_type,
        service.price_model,
        service.price ? `₦${service.price}` : 'Custom',
        service.location,
        service.status,
        service.requests,
        new Date(service.created_at).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `services-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const filteredServices = services.filter(service =>
    service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRequests = serviceRequests.filter(request =>
    request.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    request.property_address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    request.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCategoryColor = (category) => {
    const colors = {
      'property-management': '#3b82f6',
      'valuation': '#10b981',
      'verification': '#8b5cf6',
      'legal': '#f59e0b',
      'maintenance': '#ef4444',
      'marketing': '#ec4899',
      'consultation': '#6366f1'
    };
    return colors[category] || '#6b7280';
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'Custom Quote';
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="service-manager">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading services...</p>
        </div>
      </div>
    );
  }

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
          <button 
            className="btn btn-primary" 
            onClick={() => setShowAddServiceModal(true)}
          >
            <PlusCircle size={18} />
            Add New Service
          </button>
          <button className="btn btn-outline" onClick={exportServices}>
            <Download size={18} />
            Export
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
                  {services.length > 0 
                    ? (services.reduce((sum, s) => sum + s.rating, 0) / services.length).toFixed(1)
                    : '0.0'
                  }
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
                      onClick={() => handleToggleStatus(service.id, service.status)}
                      title={service.status === 'active' ? 'Deactivate' : 'Activate'}
                    >
                      {service.status === 'active' ? 
                        <CheckCircle size={14} /> : 
                        <XCircle size={14} />
                      }
                    </button>
                    <button 
                      className="btn-icon"
                      onClick={() => {
                        // Edit service logic
                        console.log('Edit service:', service.id);
                      }}
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
                      <span>{formatCurrency(service.price)}</span>
                    </div>
                    <div className="detail">
                      <Clock size={14} />
                      <span>{service.duration || 'Flexible'}</span>
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
                  <button 
                    className="btn btn-sm"
                    onClick={() => window.open(`/services/${service.id}`, '_blank')}
                  >
                    <Eye size={14} />
                    View Details
                  </button>
                  <button className="btn btn-sm btn-outline">
                    <TrendingUp size={14} />
                    Promote
                  </button>
                  <button 
                    className="btn-icon" 
                    title="Delete"
                    onClick={() => handleDeleteService(service.id, service.title)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Service Button */}
          <div className="add-service-cta">
            <button 
              className="btn btn-primary btn-lg" 
              onClick={() => setShowAddServiceModal(true)}
            >
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
            {filteredRequests.map(request => (
              <div key={request.id} className="request-card">
                <div className="request-header">
                  <div className="request-info">
                    <h4>{request.service?.title || 'Service Request'}</h4>
                    <div className="request-client">
                      <Users size={14} />
                      <span>{request.client_name}</span>
                      <span className="property">{request.property_address || 'No property specified'}</span>
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
                    <span>Requested: {new Date(request.created_at).toLocaleDateString()}</span>
                  </div>
                  {request.budget && (
                    <div className="detail">
                      <DollarSign size={14} />
                      <span>Budget: {formatCurrency(request.budget)}</span>
                    </div>
                  )}
                </div>

                <div className="request-actions">
                  {request.status === 'pending' && (
                    <>
                      <button 
                        className="btn btn-sm btn-success"
                        onClick={() => handleUpdateRequestStatus(request.id, 'accepted')}
                      >
                        Accept Request
                      </button>
                      <button className="btn btn-sm btn-outline">
                        Message Client
                      </button>
                      <button 
                        className="btn btn-sm btn-danger"
                        onClick={() => handleUpdateRequestStatus(request.id, 'declined')}
                      >
                        Decline
                      </button>
                    </>
                  )}
                  {request.status === 'accepted' && (
                    <>
                      <button 
                        className="btn btn-sm btn-primary"
                        onClick={() => handleUpdateRequestStatus(request.id, 'completed')}
                      >
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
            ))}
          </div>
        </div>
      )}

      {/* Add Service Modal */}
      {showAddServiceModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add New Service</h3>
              <button 
                className="modal-close"
                onClick={() => setShowAddServiceModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Service Title *</label>
                <input
                  type="text"
                  value={newService.title}
                  onChange={(e) => setNewService({...newService, title: e.target.value})}
                  placeholder="Enter service title"
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newService.description}
                  onChange={(e) => setNewService({...newService, description: e.target.value})}
                  placeholder="Describe your service..."
                  className="form-textarea"
                  rows={3}
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={newService.category}
                    onChange={(e) => setNewService({...newService, category: e.target.value})}
                    className="form-select"
                  >
                    <option value="property-management">Property Management</option>
                    <option value="valuation">Valuation</option>
                    <option value="verification">Verification</option>
                    <option value="legal">Legal Services</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="marketing">Marketing</option>
                    <option value="consultation">Consultation</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Service Type</label>
                  <select
                    value={newService.service_type}
                    onChange={(e) => setNewService({...newService, service_type: e.target.value})}
                    className="form-select"
                  >
                    <option value="professional">Professional</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="consultation">Consultation</option>
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label>Pricing Model</label>
                <select
                  value={newService.price_model}
                  onChange={(e) => setNewService({...newService, price_model: e.target.value})}
                  className="form-select"
                >
                  <option value="fixed">Fixed Price</option>
                  <option value="hourly">Hourly Rate</option>
                  <option value="percentage">Percentage</option>
                  <option value="quote">Custom Quote</option>
                </select>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Price</label>
                  <input
                    type="number"
                    value={newService.price}
                    onChange={(e) => setNewService({...newService, price: e.target.value})}
                    placeholder="Amount in NGN"
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Duration</label>
                  <input
                    type="text"
                    value={newService.duration}
                    onChange={(e) => setNewService({...newService, duration: e.target.value})}
                    placeholder="e.g., 2-3 days"
                    className="form-input"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  value={newService.location}
                  onChange={(e) => setNewService({...newService, location: e.target.value})}
                  placeholder="e.g., Lagos"
                  className="form-input"
                />
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn btn-outline"
                onClick={() => setShowAddServiceModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleAddService}
                disabled={!newService.title}
              >
                <PlusCircle size={16} />
                Add Service
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceManager;