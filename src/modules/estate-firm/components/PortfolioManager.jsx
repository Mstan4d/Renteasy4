import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Building, PlusCircle, Upload, Filter, Download,
  Edit, Trash2, Eye, DollarSign, MapPin,
  CheckCircle, XCircle, MoreVertical, Search,
  Home, Users, TrendingUp, ArrowUpRight, Zap,
  ChevronDown, ChevronUp, User, Calendar,
  FileText, ClipboardList, Tag
} from 'lucide-react';
import { supabase } from '../../../shared/lib/supabaseClient';
import { useAuth } from '../../../shared/context/AuthContext';
import { createListingFromUnit } from '../../../shared/utils/listingUtils';
import RentEasyLoader from '../../../shared/components/RentEasyLoader';
import ConvertListingModal from '../components/ConvertListingModal';
import './PortfolioManager.css';

const PortfolioManager = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [estateFirmProfileId, setEstateFirmProfileId] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  
  const [sortBy, setSortBy] = useState('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [groupByLandlord, setGroupByLandlord] = useState(true);
  const [expandedLandlords, setExpandedLandlords] = useState({});
  
  const [properties, setProperties] = useState([]);
  const [landlords, setLandlords] = useState([]);
  const [loading, setLoading] = useState(true);
 
  const [showPostModal, setShowPostModal] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);
   // State for bulk posting
  const [bulkUnits, setBulkUnits] = useState([]);
  const [currentBulkIndex, setCurrentBulkIndex] = useState(0);
const [showBulkModal, setShowBulkModal] = useState(false);


// Inside the component:
const [showConvertModal, setShowConvertModal] = useState(false);
const [selectedListingForConvert, setSelectedListingForConvert] = useState(null);
  const [portfolioStats, setPortfolioStats] = useState({
    totalProperties: 0,
    totalUnits: 0,
    occupiedUnits: 0,
    vacantUnits: 0,
    listedUnits: 0,
    monthlyRevenue: 0,
    totalLandlords: 0
  });

  useEffect(() => {
    const fetchProfileId = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from('estate_firm_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();
      if (!error && data) {
        setEstateFirmProfileId(data.id);
      } else {
        console.error('Could not fetch estate firm profile ID', error);
      }
    };
    fetchProfileId();
  }, [user]);

  useEffect(() => {
    if (estateFirmProfileId) {
      loadPortfolioData();
    }
  }, [estateFirmProfileId, location.key]);

const loadPortfolioData = async () => {
  if (!estateFirmProfileId) return;

  try {
    setLoading(true);
    console.log('Loading portfolio data for estate firm ID:', estateFirmProfileId);

    // 1. Load all landlords for this estate firm
    const { data: landlordsData, error: landlordsError } = await supabase
      .from('estate_landlords')
      .select('*')
      .eq('estate_firm_id', estateFirmProfileId)
      .order('name');

    if (landlordsError) throw landlordsError;
    setLandlords(landlordsData || []);
    console.log('Landlords loaded:', landlordsData?.length);

    // 2. Load all properties with their units
    const { data: propertiesData, error: propertiesError } = await supabase
      .from('properties')
      .select('*')
      .eq('estate_firm_id', estateFirmProfileId)
      .order('created_at', { ascending: false });

    if (propertiesError) throw propertiesError;
    console.log('Properties loaded:', propertiesData?.length);

    // 3. Load units for these properties
    const propertyIds = (propertiesData || []).map(p => p.id);
    let unitsData = [];
    if (propertyIds.length > 0) {
      const { data: units, error: unitsError } = await supabase
        .from('units')
        .select('*')
        .in('property_id', propertyIds);
      if (!unitsError) unitsData = units || [];
      console.log('Units loaded:', unitsData.length);
    }

    // 4. Load RentEasy listings that haven't been converted yet
    const { data: listingsData, error: listingsError } = await supabase
      .from('listings')
      .select(`
        *,
        landlord:landlord_id (*)
      `)
      .eq('estate_firm_id', estateFirmProfileId)
      .is('unit_id', null)
      .in('status', ['pending', 'approved', 'rented']);

    if (listingsError) throw listingsError;
    console.log('Unconverted listings loaded:', listingsData?.length);

    // 5. Group units by property
    const unitsByProperty = {};
    unitsData.forEach(unit => {
      if (!unitsByProperty[unit.property_id]) {
        unitsByProperty[unit.property_id] = [];
      }
      unitsByProperty[unit.property_id].push(unit);
    });

    // 6. Transform regular properties with their units
    const regularProperties = (propertiesData || []).map(property => {
      const units = unitsByProperty[property.id] || [];
      const occupiedUnits = units.filter(u => u.status === 'occupied');
      const vacantUnits = units.filter(u => u.status === 'vacant');
      
      const monthlyRent = occupiedUnits.reduce((sum, u) => {
        if (u.rent_frequency === 'yearly') return sum + (u.rent_amount / 12);
        if (u.rent_frequency === 'monthly') return sum + u.rent_amount;
        if (u.rent_frequency === 'quarterly') return sum + (u.rent_amount / 3);
        return sum + (u.rent_amount / 12);
      }, 0);

      return {
        ...property,
        is_listing: false,
        source: 'external',
        units,
        unitCount: units.length,
        occupiedCount: occupiedUnits.length,
        vacantCount: vacantUnits.length,
        monthlyRent
      };
    });

    // 7. Transform listings into virtual properties for display
    const listingProperties = (listingsData || []).map(listing => ({
      id: listing.id,
      is_listing: true,
      listing_id: listing.id,
      estate_firm_id: listing.estate_firm_id,
      landlord_id: listing.landlord_id,
      landlord: listing.landlord,
      name: listing.title || 'Untitled Listing',
      address: listing.address,
      city: listing.city,
      state: listing.state,
      lga: listing.lga,
      property_type: listing.property_type,
      status: listing.status,
      source: 'rent-easy-listing',
      created_at: listing.created_at,
      units: [],
      unitCount: 1,
      occupiedCount: listing.status === 'rented' ? 1 : 0,
      vacantCount: listing.status !== 'rented' ? 1 : 0,
      monthlyRent: listing.price && listing.rent_frequency === 'yearly' ? listing.price / 12 : listing.price
    }));

    // 8. Combine all
    const allProperties = [...regularProperties, ...listingProperties];

    // 9. Calculate stats
    const totalUnits = allProperties.reduce((sum, p) => sum + (p.unitCount || 0), 0);
    const occupiedUnits = allProperties.reduce((sum, p) => sum + (p.occupiedCount || 0), 0);
    const vacantUnits = allProperties.reduce((sum, p) => sum + (p.vacantCount || 0), 0);
    const listedUnits = allProperties.filter(p => p.source === 'rent-easy-listing').length;
    const monthlyRevenue = allProperties.reduce((sum, p) => sum + (p.monthlyRent || 0), 0);

    setProperties(allProperties);
    setPortfolioStats({
      totalProperties: allProperties.length,
      totalUnits,
      occupiedUnits,
      vacantUnits,
      listedUnits,
      monthlyRevenue,
      totalLandlords: landlordsData?.length || 0
    });

    console.log('Portfolio stats calculated:', {
      totalProperties: allProperties.length,
      totalUnits,
      occupiedUnits,
      vacantUnits,
      monthlyRevenue
    });

    // Initialize all landlords as expanded
    const initialExpanded = {};
    (landlordsData || []).forEach(l => {
      initialExpanded[l.id] = true;
    });
    setExpandedLandlords(initialExpanded);

  } catch (error) {
    console.error('Error loading portfolio data:', error);
  } finally {
    setLoading(false);
  }
};

  const handleExportCSV = () => {
  const csvContent = [
    ['Property Name', 'Address', 'Landlord', 'Units', 'Occupied', 'Vacant', 'Monthly Revenue', 'Source'],
    ...properties.map(p => [
      `"${p.name || ''}"`,
      `"${p.address || ''}"`,
      `"${p.landlord?.name || 'None'}"`,
      p.unitCount || 0,
      p.occupiedCount || 0,
      p.vacantCount || 0,
      `₦${(p.monthlyRent || 0).toLocaleString()}`,
      p.source || 'external'
    ])
  ].map(row => row.join(',')).join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `portfolio-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
};

const handleBulkUpload = () => {
  navigate('/dashboard/estate-firm/bulk-upload');
};

  const handleAddProperty = () => {
    navigate('/dashboard/estate-firm/add-external-property');
  };

// Replace the bulk post handler
const handlePostAllVacant = async () => {
  const vacantUnits = [];
  properties.forEach(prop => {
    prop.units?.forEach(unit => {
      if (unit.status === 'vacant' && !unit.is_listed_on_renteasy) {
        vacantUnits.push({ unit, property: prop });
      }
    });
  });

  if (vacantUnits.length === 0) {
    alert('No vacant units found.');
    return;
  }

  if (!window.confirm(`Post ${vacantUnits.length} vacant unit(s) to RentEasy? You'll be able to add extra fees and images for each.`)) return;

  setBulkUnits(vacantUnits);
  setCurrentBulkIndex(0);
  setShowBulkModal(true);
};

const handleBulkUnitSuccess = (postedListing) => {
  const nextIndex = currentBulkIndex + 1;
  if (nextIndex < bulkUnits.length) {
    setCurrentBulkIndex(nextIndex);
  } else {
    alert(`All ${bulkUnits.length} units have been posted successfully!`);
    setShowBulkModal(false);
    setBulkUnits([]);
    setCurrentBulkIndex(0);
    loadPortfolioData();
  }
};
  const handleEditProperty = (property) => {
    if (property.is_listing) {
      navigate(`/dashboard/estate-firm/my-listings`);
    } else {
      navigate(`/dashboard/estate-firm/properties/${property.id}/edit`);
    }
  };

  const handleDeleteProperty = async (propertyId, propertyName, source) => {
    if (!window.confirm(`Are you sure you want to delete "${propertyName}"?`)) return;

    try {
      if (source === 'external') {
        const { error: deleteError } = await supabase
          .from('properties')
          .delete()
          .eq('id', propertyId)
          .eq('estate_firm_id', estateFirmProfileId);

        if (deleteError) throw deleteError;
      } else {
        alert('Listings cannot be deleted here. Go to "My Listings" to manage them.');
        return;
      }

      await loadPortfolioData();
      alert('Property deleted successfully!');
    } catch (error) {
      console.error('Error deleting property:', error);
      alert('Failed to delete property. Please try again.');
    }
  };

  // Update the handler
const handlePostToRentEasy = (unit, property) => {
  setSelectedUnit(unit);
  setSelectedProperty(property);
  setShowPostModal(true);
};

  const handleConvertListing = (listing) => {
    navigate('/dashboard/estate-firm/my-listings', { state: { highlightListing: listing.id } });
  };

  const toggleLandlord = (landlordId) => {
    setExpandedLandlords(prev => ({
      ...prev,
      [landlordId]: !prev[landlordId]
    }));
  };

  const getPropertiesByLandlord = () => {
    const grouped = {};
    
    // Initialize with all landlords
    landlords.forEach(landlord => {
      grouped[landlord.id] = {
        landlord,
        properties: []
      };
    });

    // Add unassigned group
    grouped['unassigned'] = {
      landlord: { id: 'unassigned', name: 'Unassigned', phone: '', email: '' },
      properties: []
    };

    // Group properties
    properties.forEach(property => {
      const landlordId = property.landlord_id || 'unassigned';
      if (!grouped[landlordId]) {
        grouped[landlordId] = {
          landlord: property.landlord || { id: landlordId, name: 'Unknown', phone: '', email: '' },
          properties: []
        };
      }
      grouped[landlordId].properties.push(property);
    });

    return grouped;
  };

  const filteredProperties = properties.filter(property => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      property.name?.toLowerCase().includes(query) ||
      property.address?.toLowerCase().includes(query) ||
      property.landlord?.name?.toLowerCase().includes(query)
    );
  }).sort((a, b) => {
    if (sortBy === 'recent') return new Date(b.created_at) - new Date(a.created_at);
    if (sortBy === 'rent-high') return (b.monthlyRent || 0) - (a.monthlyRent || 0);
    if (sortBy === 'rent-low') return (a.monthlyRent || 0) - (b.monthlyRent || 0);
    if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
    return 0;
  });

  const groupedProperties = getPropertiesByLandlord();

  const formatCurrency = (amount) => `₦${(amount || 0).toLocaleString()}`;

  const getStatusBadge = (status) => {
    switch(status) {
      case 'occupied':
        return <span className="status-badge occupied"><CheckCircle size={12} /> Occupied</span>;
      case 'vacant':
        return <span className="status-badge vacant"><Home size={12} /> Vacant</span>;
      default:
        return <span className="status-badge">{status}</span>;
    }
  };

  const getSourceBadge = (source) => {
    if (source === 'rent-easy-listing') {
      return <span className="badge badge-warning">RentEasy Listing</span>;
    }
    return <span className="badge badge-secondary">External</span>;
  };

   if (loading) {
  return <RentEasyLoader message="Loading your Portfolio..." fullScreen />;
}

  return (
    <div className="portfolio-manager">
      {/* Header */}
      <div className="manager-header">
        <div>
          <h2>Property Portfolio</h2>
          <p className="subtitle">
            Managing {portfolioStats.totalProperties} properties • 
            {portfolioStats.totalUnits} units •
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
        </div>
      </div>

      {/* Stats Cards */}
      <div className="portfolio-stats">
        <div className="stat-card">
          <Building size={24} color="#3b82f6" />
          <div className="stat-info">
            <span className="stat-label">Properties</span>
            <span className="stat-value">{portfolioStats.totalProperties}</span>
          </div>
        </div>
        <div className="stat-card">
          <Home size={24} color="#10b981" />
          <div className="stat-info">
            <span className="stat-label">Total Units</span>
            <span className="stat-value">{portfolioStats.totalUnits}</span>
          </div>
        </div>
        <div className="stat-card">
          <Users size={24} color="#8b5cf6" />
          <div className="stat-info">
            <span className="stat-label">Landlords</span>
            <span className="stat-value">{portfolioStats.totalLandlords}</span>
          </div>
        </div>
        <div className="stat-card">
          <CheckCircle size={24} color="#059669" />
          <div className="stat-info">
            <span className="stat-label">Occupied</span>
            <span className="stat-value">{portfolioStats.occupiedUnits}</span>
          </div>
        </div>
        <div className="stat-card">
          <XCircle size={24} color="#dc2626" />
          <div className="stat-info">
            <span className="stat-label">Vacant</span>
            <span className="stat-value">{portfolioStats.vacantUnits}</span>
          </div>
        </div>
        <div className="stat-card">
          <Tag size={24} color="#f59e0b" />
          <div className="stat-info">
            <span className="stat-label">Listed</span>
            <span className="stat-value">{portfolioStats.listedUnits}</span>
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
          <button
            className={`group-toggle ${groupByLandlord ? 'active' : ''}`}
            onClick={() => setGroupByLandlord(!groupByLandlord)}
          >
            <Users size={16} />
            {groupByLandlord ? 'Grouped by Landlord' : 'Flat View'}
          </button>

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

      {/* Properties Display */}
      {groupByLandlord ? (
        <div className="landlord-groups">
          {Object.entries(groupedProperties).map(([landlordId, group]) => {
            if (group.properties.length === 0) return null;
            
            const isExpanded = expandedLandlords[landlordId];
            const landlordTotalUnits = group.properties.reduce((sum, p) => sum + (p.unitCount || 0), 0);
            const landlordOccupied = group.properties.reduce((sum, p) => sum + (p.occupiedCount || 0), 0);
            const landlordRevenue = group.properties.reduce((sum, p) => sum + (p.monthlyRent || 0), 0);

            return (
              <div key={landlordId} className="landlord-group">
                <div 
                  className="landlord-header"
                  onClick={() => toggleLandlord(landlordId)}
                >
                  <div className="landlord-info">
                    <User size={20} />
                    <div>
                      <h3>{group.landlord.name}</h3>
                      <div className="landlord-meta">
                        <span>{group.properties.length} properties</span>
                        <span>•</span>
                        <span>{landlordTotalUnits} units</span>
                        <span>•</span>
                        <span>{landlordOccupied} occupied</span>
                        <span>•</span>
                        <span>{formatCurrency(landlordRevenue)}/month</span>
                      </div>
                    </div>
                  </div>
                  <button className="expand-btn">
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                </div>

                {isExpanded && (
                  <div className="landlord-properties">
                    {group.properties.map(property => (
                      <div key={property.id} className="property-item">
                        <div className="property-main">
                          <div className="property-icon">
                            {property.is_listing ? <Tag size={20} /> : <Building size={20} />}
                          </div>
                          <div className="property-info">
                            <h4>{property.name}</h4>
                            <div className="property-meta">
                              <span>{property.address || 'No address'}</span>
                              <span className="badge">{property.property_type}</span>
                              {getSourceBadge(property.source)}
                            </div>
                            <div className="unit-preview">
                              <span>{property.unitCount} units</span>
                              <span className="occupied">{property.occupiedCount} occupied</span>
                              <span className="vacant">{property.vacantCount} vacant</span>
                            </div>
                          </div>
                          <div className="property-actions">
                            <button
  className="btn-icon"
  onClick={() => {
    if (property.is_listing) {
      // Navigate to My Listings page (where the user can manage the listing)
      navigate('/dashboard/estate-firm/my-listings');
    } else {
      navigate(`/dashboard/estate-firm/properties/${property.id}`);
    }
  }}
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
                            {property.is_listing && (
                           <button
                            className="btn-icon success"
                             onClick={() => {
                                 setSelectedListingForConvert(property);
                                 setShowConvertModal(true);
                                }}
                               title="Convert to Unit"
                             >
                                    <FileText size={16} />
                              </button>
                             )}
                            {!property.is_listing && property.vacantCount > 0 && (
                              <button
                                className="btn-icon warning"
                                onClick={() => handlePostToRentEasy(property.units[0], property)}
                                title="Post to RentEasy"
                              >
                                <Upload size={16} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        // Flat view (existing grid/list code)
        viewMode === 'grid' ? (
          <div className="properties-grid">
            {filteredProperties.map(property => (
              <div key={property.id} className="property-card">
                <div className="property-header">
                  {getSourceBadge(property.source)}
                  <span className="property-status-badge">
                    {property.occupiedCount > 0 ? 'Occupied' : 'Vacant'}
                  </span>
                </div>

                <div className="property-body">
                  <h4>{property.name}</h4>
                  <div className="property-location">
                    <MapPin size={14} />
                    <span>{property.address || 'No address'}</span>
                  </div>

                  <div className="property-details">
                    <div className="detail-row">
                      <span className="label">Units:</span>
                      <span className="value">{property.unitCount || 0}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Occupied:</span>
                      <span className="value">{property.occupiedCount || 0}</span>
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

                  <div className="property-actions">
                    <button
                      className="btn-icon"
                      onClick={() => navigate(`/dashboard/estate-firm/properties/${property.id}`)}
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      className="btn-icon"
                      onClick={() => handleEditProperty(property)}
                    >
                      <Edit size={16} />
                    </button>
                    {property.is_listing && property.status !== 'rented' && (
                      <button
                        className="btn-icon success"
                        onClick={() => handleConvertListing(property)}
                      >
                        <FileText size={16} />
                      </button>
                    )}
                    {!property.is_listing && property.vacantCount > 0 && (
                      <button
                        className="btn-icon warning"
                        onClick={() => handlePostToRentEasy(property.units[0], property)}
                      >
                        <Upload size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="properties-list">
            <table>
              <thead>
                <tr>
                  <th>Property</th>
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
                      <div className="list-property-info">
                        <strong>{property.name}</strong>
                        <small>{property.property_type}</small>
                      </div>
                    </td>
                    <td>{property.address || 'N/A'}</td>
                    <td>{property.unitCount || 0}</td>
                    <td>{property.occupiedCount || 0}</td>
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
                        {property.is_listing && property.status !== 'rented' && (
                          <button className="btn-icon-sm success" onClick={() => handleConvertListing(property)}>
                            <FileText size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      
{showPostModal && selectedUnit && selectedProperty && (
  <PostVacantModal
    unit={selectedUnit}
    property={selectedProperty}
    estateFirmId={estateFirmProfileId}
    onClose={() => setShowPostModal(false)}
    onSuccess={() => {
      loadPortfolioData(); // refresh
    }}
  />
)}

{showConvertModal && selectedListingForConvert && (
  <ConvertListingModal
    listing={selectedListingForConvert}
    estateFirmId={estateFirmProfileId}
    onClose={() => {
      setShowConvertModal(false);
      setSelectedListingForConvert(null);
    }}
    onSuccess={() => {
      loadPortfolioData(); // refresh
      setShowConvertModal(false);
      setSelectedListingForConvert(null);
    }}
  />
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
    </div>
  );
};

export default PortfolioManager;