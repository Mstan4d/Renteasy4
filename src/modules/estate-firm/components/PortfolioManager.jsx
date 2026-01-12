import React, { useState } from 'react';
import { 
  Building, PlusCircle, Upload, Filter, Download, 
  Edit, Trash2, Eye, DollarSign, MapPin,
  CheckCircle, XCircle, MoreVertical
} from 'lucide-react';
import './PortfolioManager.css'; // Add this line

const PortfolioManager = ({ properties, onAddProperty, onBulkUpload, onEditProperty }) => {
  const [viewMode, setViewMode] = useState('grid');
  const [selectedProperties, setSelectedProperties] = useState([]);
  const [sortBy, setSortBy] = useState('recent');
  const [searchQuery, setSearchQuery] = useState('');

  const propertyTypes = [
    { id: 'all', label: 'All Properties', count: properties.length, color: 'blue' },
    { id: 'rent-easy', label: 'Rent Easy Listings', count: properties.filter(p => p.type === 'rent-easy-listing').length, color: 'green' },
    { id: 'external', label: 'External Properties', count: properties.filter(p => p.type === 'external-property').length, color: 'purple' },
    { id: 'managed', label: 'Managed Only', count: properties.filter(p => p.type === 'managed-property').length, color: 'orange' },
  ];

  const filteredProperties = properties.filter(property => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      property.name.toLowerCase().includes(query) ||
      property.address.toLowerCase().includes(query) ||
      property.clientName.toLowerCase().includes(query)
    );
  }).sort((a, b) => {
    if (sortBy === 'recent') return new Date(b.addedDate) - new Date(a.addedDate);
    if (sortBy === 'rent-high') return b.rentAmount - a.rentAmount;
    if (sortBy === 'rent-low') return a.rentAmount - b.rentAmount;
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return 0;
  });

  const handleExportCSV = () => {
    const csvContent = [
      ['Name', 'Address', 'Client', 'Rent Amount', 'Status', 'Next Payment', 'Type'],
      ...filteredProperties.map(p => [
        p.name,
        p.address,
        p.clientName,
        `₦${p.rentAmount.toLocaleString()}`,
        p.status,
        p.rentDueDate,
        p.type === 'rent-easy-listing' ? 'Rent Easy' : 'External'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'estate-portfolio.csv';
    a.click();
  };

  const handleDeleteSelected = () => {
    if (window.confirm(`Delete ${selectedProperties.length} selected properties?`)) {
      console.log('Deleting:', selectedProperties);
      setSelectedProperties([]);
    }
  };

  const getPropertyTypeColor = (type) => {
    switch(type) {
      case 'rent-easy-listing': return '#10b981';
      case 'external-property': return '#8b5cf6';
      case 'managed-property': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  return (
    <div className="portfolio-manager">
      {/* Header */}
      <div className="manager-header">
        <div>
          <h2>Property Portfolio</h2>
          <p className="subtitle">Manage {properties.length} properties across your portfolio</p>
        </div>
        
        <div className="header-actions">
          <button 
            className="btn btn-primary" 
            onClick={() => onAddProperty && onAddProperty('external')}
          >
            <PlusCircle size={18} />
            Add Property
          </button>
          <button 
            className="btn btn-outline" 
            onClick={() => onBulkUpload()}
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
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="portfolio-controls">
        <div className="search-bar">
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
            <button className="btn btn-sm" onClick={() => console.log('Bulk edit')}>
              <Edit size={16} />
              Edit Selected
            </button>
            <button className="btn btn-sm btn-danger" onClick={handleDeleteSelected}>
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
                  className="property-source-badge"
                  style={{ backgroundColor: getPropertyTypeColor(property.type) }}
                >
                  {property.type === 'rent-easy-listing' ? 'Rent Easy' : 
                   property.type === 'external-property' ? 'External' : 'Managed'}
                </span>
              </div>

              <div className="property-body">
                <div className="property-title-section">
                  <h4>{property.name}</h4>
                  <div className="property-location">
                    <MapPin size={14} />
                    <span>{property.address}</span>
                  </div>
                </div>

                <div className="property-details">
                  <div className="detail-row">
                    <span className="label">Client:</span>
                    <span className="value">{property.clientName}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Rent:</span>
                    <span className="value highlight">
                      ₦{property.rentAmount.toLocaleString()}/{property.rentFrequency}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Next Payment:</span>
                    <span className="value date">{property.rentDueDate}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Status:</span>
                    <span className={`status ${property.status}`}>
                      {property.status === 'occupied' ? '🟢 Occupied' : '🔴 Vacant'}
                    </span>
                  </div>
                </div>

                <div className="property-tags">
                  <span className="tag">{property.category}</span>
                  <span className="tag">{property.commissionRate}% commission</span>
                  {property.healthScore && (
                    <span className={`tag health-${Math.floor(property.healthScore / 20)}`}>
                      Score: {property.healthScore}
                    </span>
                  )}
                </div>
              </div>

              <div className="property-footer">
                <button 
                  className="btn-icon"
                  onClick={() => onEditProperty(property)}
                  title="Edit"
                >
                  <Edit size={16} />
                </button>
                <button 
                  className="btn-icon"
                  onClick={() => console.log('View details', property.id)}
                  title="View Details"
                >
                  <Eye size={16} />
                </button>
                <button 
                  className="btn-icon"
                  onClick={() => console.log('Collect rent', property.id)}
                  title="Collect Rent"
                >
                  <DollarSign size={16} />
                </button>
                <button 
                  className="btn-icon"
                  onClick={() => console.log('More options', property.id)}
                  title="More Options"
                >
                  <MoreVertical size={16} />
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
                  <input type="checkbox" />
                </th>
                <th>Property Name</th>
                <th>Type</th>
                <th>Client</th>
                <th>Rent Amount</th>
                <th>Status</th>
                <th>Next Payment</th>
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
                  <td>
                    <span className="type-badge">
                      {property.type === 'rent-easy-listing' ? 'Rent Easy' : 'External'}
                    </span>
                  </td>
                  <td>{property.clientName}</td>
                  <td>
                    <strong>₦{property.rentAmount.toLocaleString()}</strong>
                    <small>/{property.rentFrequency}</small>
                  </td>
                  <td>
                    <span className={`status-badge ${property.status}`}>
                      {property.status}
                    </span>
                  </td>
                  <td>{property.rentDueDate}</td>
                  <td>
                    <div className="list-actions">
                      <button className="btn-icon-sm">
                        <Edit size={14} />
                      </button>
                      <button className="btn-icon-sm">
                        <Eye size={14} />
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
            onClick={() => onAddProperty('external')}
          >
            <PlusCircle size={18} />
            Add Your First Property
          </button>
        </div>
      )}
    </div>
  );
};

export default PortfolioManager;