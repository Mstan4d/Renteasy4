import React, { useState, useEffect } from 'react';
import { 
  Building, PlusCircle, Upload, Filter, Download, 
  Edit, Trash2, Eye, DollarSign, MapPin,
  CheckCircle, XCircle, MoreVertical, Search,
  Home, Users, TrendingUp, ArrowUpRight
} from 'lucide-react';
import { supabase } from '../../../shared/lib/supabaseClient';
import { useAuth } from '../../../shared/context/AuthContext';
import './PortfolioManager.css';

const PortfolioManager = ({ onAddProperty, onBulkUpload, onEditProperty }) => {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState('grid');
  const [selectedProperties, setSelectedProperties] = useState([]);
  const [sortBy, setSortBy] = useState('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [portfolioStats, setPortfolioStats] = useState({
    totalProperties: 0,
    rentEasyListings: 0,
    externalProperties: 0,
    managedProperties: 0,
    occupiedProperties: 0,
    totalValue: 0,
    monthlyRevenue: 0
  });

  useEffect(() => {
    loadProperties();
  }, [user]);

  const loadProperties = async () => {
  if (!user) return;

  try {
    setLoading(true);

    // 1. Fetch all listings for this estate firm
    const { data: listings, error } = await supabase
      .from('listings')
      .select('*')
      .eq('estate_firm_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // 2. Collect all unique landlord_id and tenant_id
    const ids = new Set();
    listings.forEach(listing => {
      if (listing.landlord_id) ids.add(listing.landlord_id);
      if (listing.tenant_id) ids.add(listing.tenant_id);
    });

    let profiles = [];
    if (ids.size > 0) {
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, email')
        .in('id', Array.from(ids));
      if (profilesError) throw profilesError;
      profiles = profilesData;
    }

    // 3. Create a lookup map
    const profileMap = Object.fromEntries(profiles.map(p => [p.id, p]));

    // 4. Attach landlord and tenant to each listing
    const enrichedData = listings.map(listing => ({
      ...listing,
      landlord: profileMap[listing.landlord_id] || null,
      tenant: profileMap[listing.tenant_id] || null,
    }));

    setProperties(enrichedData);

      // Calculate portfolio stats
      const totalProperties = data?.length || 0;
      const occupiedProperties = data?.filter(p => p.status === 'occupied').length || 0;
      
      const monthlyRevenue = (data || []).reduce((sum, property) => {
        if (property.status !== 'occupied') return sum;
        let multiplier = 1;
        if (property.rent_frequency === 'yearly') multiplier = 1/12;
        if (property.rent_frequency === 'quarterly') multiplier = 1/3;
        if (property.rent_frequency === 'weekly') multiplier = 52/12;
        return sum + ((property.price || 0) * multiplier);
      }, 0);

      const totalValue = (data || []).reduce((sum, property) => {
        // Estimate property value as 5 years of rent
        return sum + ((property.price || 0) * 5);
      }, 0);

      setPortfolioStats({
        totalProperties,
        rentEasyListings: totalProperties, // All are Rent Easy listings for estate firms
        externalProperties: 0,
        managedProperties: totalProperties,
        occupiedProperties,
        totalValue,
        monthlyRevenue
      });

    } catch (error) {
      console.error('Error loading properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProperty = async (propertyId, propertyName) => {
    if (!window.confirm(`Are you sure you want to delete "${propertyName}"?`)) return;

    try {
      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', propertyId)
        .eq('estate_firm_id', user.id);

      if (error) throw error;

      // Remove from selected properties
      setSelectedProperties(selectedProperties.filter(id => id !== propertyId));
      
      // Refresh properties list
      await loadProperties();

      // Log activity
      await supabase.from('activities').insert({
        user_id: user.id,
        type: 'property',
        action: 'delete',
        description: `Deleted property: ${propertyName}`,
        created_at: new Date().toISOString()
      });

      alert('Property deleted successfully!');

    } catch (error) {
      console.error('Error deleting property:', error);
      alert('Failed to delete property. Please try again.');
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedProperties.length} selected properties?`)) return;

    try {
      const { error } = await supabase
        .from('listings')
        .delete()
        .in('id', selectedProperties)
        .eq('estate_firm_id', user.id);

      if (error) throw error;

      // Refresh properties list
      await loadProperties();
      
      // Clear selection
      setSelectedProperties([]);

      // Log activity
      await supabase.from('activities').insert({
        user_id: user.id,
        type: 'property',
        action: 'bulk_delete',
        description: `Deleted ${selectedProperties.length} properties`,
        created_at: new Date().toISOString()
      });

      alert(`${selectedProperties.length} properties deleted successfully!`);

    } catch (error) {
      console.error('Error bulk deleting properties:', error);
      alert('Failed to delete properties. Please try again.');
    }
  };

  const handleExportCSV = () => {
    const csvContent = [
      ['ID', 'Name', 'Address', 'Type', 'Rent Amount', 'Frequency', 'Status', 'Client', 'Tenant', 'Created Date'],
      ...filteredProperties.map(p => [
        p.id.substring(0, 8),
        `"${p.title}"`,
        `"${p.address}"`,
        p.property_type,
        `₦${p.price?.toLocaleString() || 0}`,
        p.rent_frequency,
        p.status,
        p.landlord?.name || 'Owner',
        p.tenant?.name || 'Vacant',
        new Date(p.created_at).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portfolio-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const propertyTypes = [
    { id: 'all', label: 'All Properties', count: portfolioStats.totalProperties, color: 'blue' },
    { id: 'rent-easy', label: 'Rent Easy Listings', count: portfolioStats.rentEasyListings, color: 'green' },
    { id: 'occupied', label: 'Occupied', count: portfolioStats.occupiedProperties, color: 'purple' },
    { id: 'vacant', label: 'Vacant', count: portfolioStats.totalProperties - portfolioStats.occupiedProperties, color: 'orange' },
  ];

  const filteredProperties = properties.filter(property => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      property.title.toLowerCase().includes(query) ||
      property.address.toLowerCase().includes(query) ||
      (property.landlord?.name || '').toLowerCase().includes(query)
    );
  }).sort((a, b) => {
    if (sortBy === 'recent') return new Date(b.created_at) - new Date(a.created_at);
    if (sortBy === 'rent-high') return (b.price || 0) - (a.price || 0);
    if (sortBy === 'rent-low') return (a.price || 0) - (b.price || 0);
    if (sortBy === 'name') return a.title.localeCompare(b.title);
    return 0;
  });

  const getPropertyTypeColor = (type) => {
    switch(type) {
      case 'residential': return '#10b981';
      case 'commercial': return '#8b5cf6';
      case 'industrial': return '#f59e0b';
      case 'land': return '#6366f1';
      default: return '#6b7280';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const calculateRentFrequency = (property) => {
    const amount = property.price || 0;
    let frequency = property.rent_frequency || 'monthly';
    
    switch(frequency) {
      case 'yearly': return formatCurrency(amount) + '/year';
      case 'monthly': return formatCurrency(amount) + '/month';
      case 'quarterly': return formatCurrency(amount) + '/quarter';
      case 'weekly': return formatCurrency(amount) + '/week';
      default: return formatCurrency(amount);
    }
  };

  if (loading) {
    return (
      <div className="portfolio-manager">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading portfolio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="portfolio-manager">
      {/* Header */}
      <div className="manager-header">
        <div>
          <h2>Property Portfolio</h2>
          <p className="subtitle">
            Managing {portfolioStats.totalProperties} properties • 
            <span className="revenue"> {formatCurrency(portfolioStats.monthlyRevenue)}/month</span>
          </p>
        </div>
        
        <div className="header-actions">
          <button 
            className="btn btn-primary" 
            onClick={() => onAddProperty && onAddProperty('rent-easy')}
          >
            <PlusCircle size={18} />
            Add Property
          </button>
          <button 
            className="btn btn-outline" 
            onClick={() => onBulkUpload && onBulkUpload()}
          >
            <Upload size={18} />
            Bulk Import
          </button>
          <button 
            className="btn btn-outline" 
            onClick={handleExportCSV}
          >
            <Download size={18} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="portfolio-stats">
        {propertyTypes.map(type => (
          <div 
            key={type.id} 
            className="stat-card"
            style={{ borderLeftColor: type.color }}
          >
            <Building size={24} color={type.color} />
            <div className="stat-info">
              <span className="stat-label">{type.label}</span>
              <span className="stat-value">{type.count}</span>
              {type.id === 'all' && (
                <small>Value: {formatCurrency(portfolioStats.totalValue)}</small>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Portfolio Performance */}
      <div className="portfolio-performance">
        <div className="performance-card">
          <div className="performance-header">
            <h4>Portfolio Performance</h4>
            <span className="performance-change positive">
              <ArrowUpRight size={14} />
              +12% growth
            </span>
          </div>
          <div className="performance-metrics">
            <div className="metric">
              <Home size={16} />
              <div>
                <span className="metric-value">{portfolioStats.occupiedProperties}</span>
                <span className="metric-label">Occupied Properties</span>
              </div>
            </div>
            <div className="metric">
              <Users size={16} />
              <div>
                <span className="metric-value">
                  {portfolioStats.totalProperties - portfolioStats.occupiedProperties}
                </span>
                <span className="metric-label">Vacant Properties</span>
              </div>
            </div>
            <div className="metric">
              <TrendingUp size={16} />
              <div>
                <span className="metric-value">
                  {portfolioStats.totalProperties > 0 
                    ? `${Math.round((portfolioStats.occupiedProperties / portfolioStats.totalProperties) * 100)}%`
                    : '0%'
                  }
                </span>
                <span className="metric-label">Occupancy Rate</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="portfolio-controls">
        <div className="search-bar">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search properties by name, address, or client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="control-group">
          <div className="view-toggle">
            <button 
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              Grid
            </button>
            <button 
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              List
            </button>
          </div>

          <select 
            className="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="recent">Most Recent</option>
            <option value="rent-high">Rent: High to Low</option>
            <option value="rent-low">Rent: Low to High</option>
            <option value="name">Name: A to Z</option>
            <option value="status">Status</option>
          </select>
        </div>
      </div>

      {/* Selection Actions */}
      {selectedProperties.length > 0 && (
        <div className="selection-bar">
          <div className="selection-info">
            <CheckCircle size={16} />
            <span>{selectedProperties.length} properties selected</span>
          </div>
          <div className="selection-actions">
            <button 
              className="btn btn-sm" 
              onClick={() => {
                // Bulk edit functionality
                console.log('Bulk edit:', selectedProperties);
              }}
            >
              <Edit size={16} />
              Edit Selected
            </button>
            <button 
              className="btn btn-sm btn-danger" 
              onClick={handleBulkDelete}
            >
              <Trash2 size={16} />
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Properties Display */}
      {viewMode === 'grid' ? (
        <div className="properties-grid">
          {filteredProperties.map(property => (
            <div key={property.id} className="property-card">
              <div className="property-header">
                <input
                  type="checkbox"
                  checked={selectedProperties.includes(property.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedProperties([...selectedProperties, property.id]);
                    } else {
                      setSelectedProperties(selectedProperties.filter(id => id !== property.id));
                    }
                  }}
                />
                <span 
                  className="property-type-badge"
                  style={{ backgroundColor: getPropertyTypeColor(property.property_type) }}
                >
                  {property.property_type}
                </span>
                <span className={`property-status ${property.status}`}>
                  {property.status}
                </span>
              </div>

              <div className="property-body">
                <div className="property-title-section">
                  <h4 title={property.title}>{property.title}</h4>
                  <div className="property-location">
                    <MapPin size={14} />
                    <span title={property.address}>{property.address}</span>
                  </div>
                </div>

                <div className="property-details">
                  <div className="detail-row">
                    <span className="label">Client:</span>
                    <span className="value" title={property.landlord?.name || 'Owner'}>
                      {property.landlord?.name || 'Owner'}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Rent:</span>
                    <span className="value highlight">
                      {calculateRentFrequency(property)}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Commission:</span>
                    <span className="value">{property.commission_rate || 0}%</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Tenant:</span>
                    <span className="value">
                      {property.tenant?.name || (property.status === 'occupied' ? 'Tenant' : 'Vacant')}
                    </span>
                  </div>
                </div>

                <div className="property-tags">
                  <span className="tag">{property.property_type}</span>
                  <span className="tag">{property.bedrooms || 0} Beds</span>
                  <span className="tag">{property.bathrooms || 0} Baths</span>
                  {property.area_sqm && (
                    <span className="tag">{property.area_sqm} sqm</span>
                  )}
                </div>
              </div>

              <div className="property-footer">
                <button 
                  className="btn-icon"
                  onClick={() => onEditProperty && onEditProperty(property)}
                  title="Edit"
                >
                  <Edit size={16} />
                </button>
                <button 
                  className="btn-icon"
                  onClick={() => window.open(`/listings/${property.id}`, '_blank')}
                  title="View Details"
                >
                  <Eye size={16} />
                </button>
                <button 
                  className="btn-icon"
                  onClick={() => {
                    // Collect rent functionality
                    alert(`Collect rent for ${property.title}`);
                  }}
                  title="Collect Rent"
                >
                  <DollarSign size={16} />
                </button>
                <button 
                  className="btn-icon danger"
                  onClick={() => handleDeleteProperty(property.id, property.title)}
                  title="Delete Property"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="properties-list">
          <table>
            <thead>
              <tr>
                <th style={{ width: '30px' }}>
                  <input 
                    type="checkbox" 
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedProperties(filteredProperties.map(p => p.id));
                      } else {
                        setSelectedProperties([]);
                      }
                    }}
                    checked={selectedProperties.length === filteredProperties.length && filteredProperties.length > 0}
                  />
                </th>
                <th>Property Name</th>
                <th>Type</th>
                <th>Client</th>
                <th>Rent Amount</th>
                <th>Status</th>
                <th>Tenant</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProperties.map(property => (
                <tr key={property.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedProperties.includes(property.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedProperties([...selectedProperties, property.id]);
                        } else {
                          setSelectedProperties(selectedProperties.filter(id => id !== property.id));
                        }
                      }}
                    />
                  </td>
                  <td>
                    <div className="list-property-info">
                      <strong>{property.title}</strong>
                      <small>{property.address}</small>
                    </div>
                  </td>
                  <td>
                    <span 
                      className="type-badge"
                      style={{ backgroundColor: getPropertyTypeColor(property.property_type) }}
                    >
                      {property.property_type}
                    </span>
                  </td>
                  <td>{property.landlord?.name || 'Owner'}</td>
                  <td>
                    <strong>{calculateRentFrequency(property)}</strong>
                    <small>Commission: {property.commission_rate || 0}%</small>
                  </td>
                  <td>
                    <span className={`status-badge ${property.status}`}>
                      {property.status}
                    </span>
                  </td>
                  <td>{property.tenant?.name || (property.status === 'occupied' ? 'Tenant' : 'Vacant')}</td>
                  <td>
                    <div className="list-actions">
                      <button className="btn-icon-sm">
                        <Edit size={14} />
                      </button>
                      <button className="btn-icon-sm">
                        <Eye size={14} />
                      </button>
                      <button 
                        className="btn-icon-sm danger"
                        onClick={() => handleDeleteProperty(property.id, property.title)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty State */}
      {filteredProperties.length === 0 && (
        <div className="empty-state">
          <Building size={48} />
          <h3>No properties found</h3>
          <p>Try adjusting your search or add a new property</p>
          <button 
            className="btn btn-primary"
            onClick={() => onAddProperty && onAddProperty('rent-easy')}
          >
            <PlusCircle size={18} />
            Add Your First Property
          </button>
        </div>
      )}

      {/* Pagination */}
      {filteredProperties.length > 0 && (
        <div className="pagination">
          <button className="pagination-btn" disabled>
            Previous
          </button>
          <span className="pagination-info">
            Showing {filteredProperties.length} of {properties.length} properties
          </span>
          <button className="pagination-btn">
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default PortfolioManager;