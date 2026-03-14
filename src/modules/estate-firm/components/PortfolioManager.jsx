import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building, PlusCircle, Upload, Filter, Download,
  Edit, Trash2, Eye, DollarSign, MapPin,
  CheckCircle, XCircle, MoreVertical, Search,
  Home, Users, TrendingUp, ArrowUpRight, Zap
} from 'lucide-react';
import { supabase } from '../../../shared/lib/supabaseClient';
import { useAuth } from '../../../shared/context/AuthContext';
import { createListingFromUnit } from '../../../shared/utils/listingUtils'; // Phase 5 utility
import './PortfolioManager.css';

const PortfolioManager = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
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
    monthlyRevenue: 0,
    vacantUnits: 0
  });

  useEffect(() => {
    loadProperties();
  }, [user]);

  const loadProperties = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // 1. Fetch external properties from the properties table
      const { data: externalProps, error: externalError } = await supabase
        .from('properties')
        .select(`
          *,
          landlord:landlord_id (id, name, email, phone)
        `)
        .eq('estate_firm_id', user.id)
        .order('created_at', { ascending: false });

      if (externalError) throw externalError;

      // 2. Fetch RentEasy listings where this estate firm is the manager
      const { data: listings, error: listingsError } = await supabase
        .from('listings')
        .select(`
          *,
          landlord:profiles!landlord_id (id, name, email, phone)
        `)
        .eq('estate_firm_id', user.id)
        .order('created_at', { ascending: false });

      if (listingsError) throw listingsError;

      // Transform listings into property-like objects
      const rentEasyProps = (listings || []).map(listing => ({
        id: listing.id,
        estate_firm_id: listing.estate_firm_id,
        name: listing.title,
        address: listing.address,
        city: listing.city,
        state: listing.state,
        description: listing.description,
        landlord_id: listing.landlord_id,
        landlord: listing.landlord,
        source: 'rent-easy',
        listing_id: listing.id,
        created_at: listing.created_at,
        // For a listing, we treat it as a single unit
        units: [{
          id: `unit-${listing.id}`,
          property_id: listing.id,
          unit_number: '1',
          rent_amount: listing.price,
          rent_frequency: listing.rent_frequency || 'yearly',
          status: listing.status === 'rented' ? 'occupied' : 'vacant',
          tenant_id: listing.tenant_id,
        }],
        // We'll compute these later
        occupiedCount: listing.status === 'rented' ? 1 : 0,
        monthlyRent: listing.price && listing.rent_frequency === 'yearly' ? listing.price / 12 : listing.price,
      }));

      // 3. Combine both sets
      const allProperties = [
        ...(externalProps || []).map(p => ({ ...p, source: 'external' })),
        ...rentEasyProps
      ];

      // For each property, fetch units if external
      const enriched = await Promise.all(allProperties.map(async (property) => {
        let units = [];
        if (property.source === 'external') {
          const { data: unitData } = await supabase
            .from('units')
            .select('*')
            .eq('property_id', property.id);
          units = unitData || [];
        } else {
          units = property.units || [];
        }

        const occupiedUnits = units.filter(u => u.status === 'occupied');
        const monthlyRent = occupiedUnits.reduce((sum, u) => {
          let multiplier = 1;
          if (u.rent_frequency === 'yearly') multiplier = 1/12;
          if (u.rent_frequency === 'quarterly') multiplier = 1/3;
          return sum + (u.rent_amount * multiplier);
        }, 0);

        const totalRent = units.reduce((sum, u) => sum + (u.rent_amount || 0), 0);

        return {
          ...property,
          units,
          occupiedCount: occupiedUnits.length,
          monthlyRent,
          totalRent, // for value estimation
        };
      }));

      setProperties(enriched);

      // Calculate stats
      const totalProperties = enriched.length;
      const rentEasyCount = enriched.filter(p => p.source === 'rent-easy').length;
      const externalCount = totalProperties - rentEasyCount;
      const occupiedProperties = enriched.reduce((sum, p) => sum + p.occupiedCount, 0);
      const monthlyRevenue = enriched.reduce((sum, p) => sum + p.monthlyRent, 0);
      const totalValue = enriched.reduce((sum, p) => sum + (p.totalRent * 5 || 0), 0); // rough valuation
      const vacantUnits = enriched.reduce((sum, p) => sum + (p.units?.length || 0) - p.occupiedCount, 0);

      setPortfolioStats({
        totalProperties,
        rentEasyListings: rentEasyCount,
        externalProperties: externalCount,
        managedProperties: totalProperties,
        occupiedProperties,
        totalValue,
        monthlyRevenue,
        vacantUnits
      });

    } catch (error) {
      console.error('Error loading properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProperty = () => {
    // Navigate to a page where user can choose external property or RentEasy listing
    // For simplicity, we'll navigate to external property creation
    navigate('/dashboard/estate-firm/add-external-property');
  };

  const handleBulkUpload = () => {
    navigate('/dashboard/estate-firm/bulk-upload');
  };

  const handleEditProperty = (property) => {
    if (property.source === 'external') {
      navigate(`/dashboard/estate-firm/properties/${property.id}/edit`);
    } else {
      // For RentEasy listings, maybe navigate to listing edit
      navigate(`/dashboard/estate-firm/listings/${property.id}/edit`);
    }
  };

  const handleDeleteProperty = async (propertyId, propertyName, source) => {
    if (!window.confirm(`Are you sure you want to delete "${propertyName}"?`)) return;

    try {
      if (source === 'external') {
        const { error } = await supabase
          .from('properties')
          .delete()
          .eq('id', propertyId)
          .eq('estate_firm_id', user.id);
        if (error) throw error;
      } else {
        // For RentEasy listings, we might archive or just remove from portfolio view
        alert('RentEasy properties cannot be deleted directly from portfolio. You can archive them.');
        return;
      }

      setSelectedProperties(selectedProperties.filter(id => id !== propertyId));
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
      const externalIds = properties
        .filter(p => selectedProperties.includes(p.id) && p.source === 'external')
        .map(p => p.id);

      if (externalIds.length > 0) {
        const { error } = await supabase
          .from('properties')
          .delete()
          .in('id', externalIds)
          .eq('estate_firm_id', user.id);
        if (error) throw error;
      }

      const rentEasyIds = selectedProperties.filter(id =>
        properties.find(p => p.id === id)?.source === 'rent-easy'
      );
      if (rentEasyIds.length > 0) {
        alert('RentEasy properties cannot be bulk deleted. They will be ignored.');
      }

      await loadProperties();
      setSelectedProperties([]);

      await supabase.from('activities').insert({
        user_id: user.id,
        type: 'property',
        action: 'bulk_delete',
        description: `Deleted ${externalIds.length} external properties`,
        created_at: new Date().toISOString()
      });

      alert(`${externalIds.length} properties deleted successfully!`);
    } catch (error) {
      console.error('Error bulk deleting properties:', error);
      alert('Failed to delete properties. Please try again.');
    }
  };

  // Phase 5: Post all vacant units to marketplace
  const handlePostAllVacant = async () => {
    const vacantUnits = [];
    properties.forEach(prop => {
      prop.units?.forEach(unit => {
        if (unit.status === 'vacant') {
          vacantUnits.push({ unit, property: prop });
        }
      });
    });

    if (vacantUnits.length === 0) {
      alert('No vacant units found.');
      return;
    }

    if (!window.confirm(`Post ${vacantUnits.length} vacant unit(s) to RentEasy marketplace?`)) return;

    setLoading(true);
    let success = 0;
    let failed = 0;

    for (const { unit, property } of vacantUnits) {
      try {
        await createListingFromUnit(unit, property, user?.id);
        success++;
      } catch (err) {
        console.error(err);
        failed++;
      }
    }

    alert(`Posted ${success} listings. ${failed} failed.`);
    setLoading(false);
    // Optionally reload properties to reflect any changes (e.g., unit status if we update it)
    await loadProperties();
  };

  const handleExportCSV = () => {
    const csvContent = [
      ['ID', 'Name', 'Address', 'Units', 'Occupied Units', 'Monthly Revenue', 'Landlord', 'Source', 'Created Date'],
      ...filteredProperties.map(p => [
        p.id.substring(0, 8),
        `"${p.name}"`,
        `"${p.address}"`,
        p.units?.length || 0,
        p.occupiedCount,
        `₦${p.monthlyRent.toLocaleString()}`,
        p.landlord?.name || 'None',
        p.source,
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
    { id: 'occupied', label: 'Occupied', count: portfolioStats.occupiedProperties, color: 'purple' },
    { id: 'vacant', label: 'Vacant Units', count: portfolioStats.vacantUnits, color: 'orange' },
  ];

  const filteredProperties = properties.filter(property => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      property.name.toLowerCase().includes(query) ||
      property.address.toLowerCase().includes(query) ||
      (property.landlord?.name || '').toLowerCase().includes(query)
    );
  }).sort((a, b) => {
    if (sortBy === 'recent') return new Date(b.created_at) - new Date(a.created_at);
    if (sortBy === 'rent-high') return (b.monthlyRent || 0) - (a.monthlyRent || 0);
    if (sortBy === 'rent-low') return (a.monthlyRent || 0) - (b.monthlyRent || 0);
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return 0;
  });

  const formatCurrency = (amount) => {
    return `₦${(amount || 0).toLocaleString()}`;
  };

  const getSourceBadge = (source) => {
    if (source === 'rent-easy') {
      return <span className="badge badge-info">RentEasy</span>;
    }
    return <span className="badge badge-secondary">External</span>;
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
            onClick={handleAddProperty}
          >
            <PlusCircle size={18} />
            Add Property
          </button>
          <button
            className="btn btn-outline"
            onClick={handleBulkUpload}
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
          {portfolioStats.vacantUnits > 0 && (
            <button
              className="btn btn-success"
              onClick={handlePostAllVacant}
            >
              <Zap size={18} />
              Post Vacant ({portfolioStats.vacantUnits})
            </button>
          )}
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
                <span className="metric-value">{portfolioStats.vacantUnits}</span>
                <span className="metric-label">Vacant Units</span>
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
            placeholder="Search properties by name, address, or landlord..."
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
                // Bulk edit functionality (placeholder)
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
                <div className="property-header-right">
                  {getSourceBadge(property.source)}
                  <span className="property-status-badge">
                    {property.occupiedCount > 0 ? (
                      <span className="status occupied">Occupied</span>
                    ) : (
                      <span className="status vacant">Vacant</span>
                    )}
                  </span>
                </div>
              </div>

              <div className="property-body">
                <div className="property-title-section">
                  <h4 title={property.name}>{property.name}</h4>
                  <div className="property-location">
                    <MapPin size={14} />
                    <span title={property.address}>{property.address}</span>
                  </div>
                </div>

                <div className="property-details">
                  <div className="detail-row">
                    <span className="label">Units:</span>
                    <span className="value">{property.units?.length || 0}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Occupied:</span>
                    <span className="value">{property.occupiedCount}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Monthly Rent:</span>
                    <span className="value highlight">{formatCurrency(property.monthlyRent)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Landlord:</span>
                    <span className="value">{property.landlord?.name || 'None'}</span>
                  </div>
                </div>
              </div>

              <div className="property-footer">
                <button
                  className="btn-icon"
                  onClick={() => navigate(`/dashboard/estate-firm/properties/${property.id}`)}
                  title="View Details"
                >
                  <Eye size={16} />
                </button>
                <button
                  className="btn-icon"
                  onClick={() => handleEditProperty(property)}
                  title="Edit"
                >
                  <Edit size={16} />
                </button>
                <button
                  className="btn-icon danger"
                  onClick={() => handleDeleteProperty(property.id, property.name, property.source)}
                  title="Delete"
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
                <th>Address</th>
                <th>Units</th>
                <th>Occupied</th>
                <th>Monthly Rent</th>
                <th>Landlord</th>
                <th>Source</th>
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
                      <strong>{property.name}</strong>
                      <small>{property.address}</small>
                    </div>
                  </td>
                  <td>{property.address}</td>
                  <td>{property.units?.length || 0}</td>
                  <td>{property.occupiedCount}</td>
                  <td>{formatCurrency(property.monthlyRent)}</td>
                  <td>{property.landlord?.name || 'None'}</td>
                  <td>{getSourceBadge(property.source)}</td>
                  <td>
                    <div className="list-actions">
                      <button className="btn-icon-sm" onClick={() => navigate(`/dashboard/estate-firm/properties/${property.id}`)}>
                        <Eye size={14} />
                      </button>
                      <button className="btn-icon-sm" onClick={() => handleEditProperty(property)}>
                        <Edit size={14} />
                      </button>
                      <button
                        className="btn-icon-sm danger"
                        onClick={() => handleDeleteProperty(property.id, property.name, property.source)}
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
            onClick={handleAddProperty}
          >
            <PlusCircle size={18} />
            Add Your First Property
          </button>
        </div>
      )}

      {/* Pagination */}
      {filteredProperties.length > 0 && (
        <div className="pagination">
          <button className="pagination-btn" disabled>Previous</button>
          <span className="pagination-info">
            Showing {filteredProperties.length} of {properties.length} properties
          </span>
          <button className="pagination-btn">Next</button>
        </div>
      )}
    </div>
  );
};

export default PortfolioManager;