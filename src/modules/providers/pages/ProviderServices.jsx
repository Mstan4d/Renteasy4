// src/modules/providers/pages/ProviderServices.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../shared/lib/supabaseClient';
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

  // Fetch services on mount
  useEffect(() => {
    if (user?.id) {
      fetchServices();
    }
  }, [user]);

  // Apply client-side filtering and sorting when services or filters change
  useEffect(() => {
    filterAndSortServices();
  }, [services, searchTerm, filterStatus, sortBy]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('provider_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
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
          service.service_title?.toLowerCase().includes(term) ||
          service.description?.toLowerCase().includes(term) ||
          service.service_category?.toLowerCase().includes(term)
        );
      }

      return true;
    });

    // Sort services
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at) - new Date(a.created_at);
        case 'oldest':
          return new Date(a.created_at) - new Date(b.created_at);
        case 'popular':
          return (b.views || 0) - (a.views || 0);
        case 'price_high':
          return (b.base_price || 0) - (a.base_price || 0);
        case 'price_low':
          return (a.base_price || 0) - (b.base_price || 0);
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

  const toggleServiceStatus = async (serviceId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';

    try {
      const { error } = await supabase
        .from('services')
        .update({ status: newStatus })
        .eq('id', serviceId);

      if (error) throw error;

      // Update local state
      setServices(prev =>
        prev.map(s => (s.id === serviceId ? { ...s, status: newStatus } : s))
      );

      alert(`Service ${newStatus === 'active' ? 'activated' : 'paused'} successfully!`);
    } catch (error) {
      console.error('Error toggling service status:', error);
      alert('Failed to update service status.');
    }
  };

  const deleteService = async (serviceId) => {
    if (!window.confirm('Are you sure you want to delete this service? This action cannot be undone.')) return;

    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId);

      if (error) throw error;

      setServices(prev => prev.filter(s => s.id !== serviceId));
      alert('Service deleted successfully!');
    } catch (error) {
      console.error('Error deleting service:', error);
      alert('Failed to delete service.');
    }
  };

  const duplicateService = async (service) => {
    // Create a copy with new fields
    const newService = {
      provider_id: user.id,
      service_title: `${service.service_title} (Copy)`,
      service_category: service.service_category,
      service_type: service.service_type,
      description: service.description,
      experience_years: service.experience_years,
      team_size: service.team_size,
      equipment_provided: service.equipment_provided,
      materials_included: service.materials_included,
      certifications: service.certifications,
      pricing_model: service.pricing_model,
      base_price: service.base_price,
      hourly_rate: service.hourly_rate,
      unit_type: service.unit_type,
      price_per_unit: service.price_per_unit,
      min_price: service.min_price,
      max_price: service.max_price,
      deposit_required: service.deposit_required,
      deposit_amount: service.deposit_amount,
      service_areas: service.service_areas,
      working_hours: service.working_hours,
      lead_time: service.lead_time,
      same_day_service: service.same_day_service,
      features: service.features,
      requirements: service.requirements,
      tags: service.tags,
      images: service.images,
      status: 'draft'
    };

    try {
      const { data, error } = await supabase
        .from('services')
        .insert([newService])
        .select();

      if (error) throw error;

      // Add the new service to local state
      setServices(prev => [data[0], ...prev]);
      alert('Service duplicated successfully! Edit the new draft to customize it.');
    } catch (error) {
      console.error('Error duplicating service:', error);
      alert('Failed to duplicate service.');
    }
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
    if (service.pricing_model === 'hourly') {
      return `₦${service.hourly_rate}/hour`;
    } else if (service.pricing_model === 'per_unit') {
      return `₦${service.price_per_unit}/${service.unit_type || 'unit'}`;
    } else if (service.pricing_model === 'fixed') {
      return `₦${service.base_price}/project`;
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
            <Link to="/dashboard/provider/post-service" className="btn btn-primary">
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
                  <h3 className="service-title">{service.service_title}</h3>

                  <p className="service-description">
                    {service.description && service.description.length > 120
                      ? `${service.description.substring(0, 120)}...`
                      : service.description || ''}
                  </p>

                  <div className="service-details">
                    <div className="detail-item">
                      <DollarSign size={14} />
                      <span>{formatPrice(service)}</span>
                    </div>

                    <div className="detail-item">
                      <Clock size={14} />
                      <span>{service.duration || 'Flexible'}</span>
                    </div>

                    {service.service_category && (
                      <div className="detail-item">
                        <span className="service-category">{service.service_category}</span>
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
                    Posted: {new Date(service.created_at).toLocaleDateString()}
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