import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Briefcase, PlusCircle, TrendingUp, Filter,
  Search, Star, MessageSquare, Clock,
  Eye, Edit, Trash2, MoreVertical
} from 'lucide-react';
import { supabase } from '../../../shared/lib/supabaseClient';
import { useAuth } from '../../../shared/context/AuthContext';
import './EstateServicesPage.css';

const EstateServicesPage = () => {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    featured: 0,
    totalRequests: 0,
    totalViews: 0
  });

  useEffect(() => {
    if (user) {
      loadServices();
    }
  }, [user]);

  const loadServices = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('estate_services')
        .select('*')
        .eq('estate_firm_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setServices(data || []);

      // Calculate stats
      const total = data?.length || 0;
      const active = data?.filter(s => s.status === 'active').length || 0;
      const featured = data?.filter(s => s.featured).length || 0;
      const totalRequests = data?.reduce((sum, s) => sum + (s.requests || 0), 0) || 0;
      const totalViews = data?.reduce((sum, s) => sum + (s.views || 0), 0) || 0;

      setStats({ total, active, featured, totalRequests, totalViews });

    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (serviceId) => {
    try {
      const service = services.find(s => s.id === serviceId);
      const newStatus = service.status === 'active' ? 'inactive' : 'active';

      const { error } = await supabase
        .from('estate_services')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', serviceId)
        .eq('estate_firm_id', user.id);

      if (error) throw error;

      // Update local state
      setServices(services.map(s => 
        s.id === serviceId ? { ...s, status: newStatus } : s
      ));

      // Update stats
      setStats(prev => ({
        ...prev,
        active: newStatus === 'active' ? prev.active + 1 : prev.active - 1
      }));

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
        .eq('id', serviceId)
        .eq('estate_firm_id', user.id);

      if (error) throw error;

      // Update local state
      setServices(services.filter(s => s.id !== serviceId));

      // Update stats
      const deletedService = services.find(s => s.id === serviceId);
      setStats(prev => ({
        ...prev,
        total: prev.total - 1,
        active: deletedService?.status === 'active' ? prev.active - 1 : prev.active,
        featured: deletedService?.featured ? prev.featured - 1 : prev.featured
      }));

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

  const filteredServices = services
    .filter(service => {
      if (filter === 'active') return service.status === 'active';
      if (filter === 'inactive') return service.status === 'inactive';
      if (filter === 'featured') return service.featured;
      return true;
    })
    .filter(service =>
      service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

  if (loading) {
    return (
      <div className="estate-services-page">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading services...</p>
        </div>
      </div>
    );
  }

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