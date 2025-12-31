// src/modules/admin/pages/AdminListings.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../shared/context/AuthContext';
import {
  Home, CheckCircle, XCircle, Eye, Edit, Trash2,
  Filter, Search, MapPin, DollarSign, Users,
  Download, TrendingUp, AlertCircle, Shield
} from 'lucide-react';
import './AdminStyles.css';

const AdminListings = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    pending: 0,
    rejected: 0,
    totalValue: 0
  });

  const [filters, setFilters] = useState({
    status: 'all', // all, verified, pending, rejected
    type: 'all',
    state: '',
    minPrice: '',
    maxPrice: '',
    search: ''
  });

  useEffect(() => {
    if (user?.role !== 'admin') return;
    loadListings();
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [filters, listings]);

  const loadListings = () => {
    try {
      setLoading(true);
      const storedListings = JSON.parse(localStorage.getItem('listings') || '[]');
      const sampleListings = getSampleListings();
      const allListings = [...storedListings, ...sampleListings];
      
      setListings(allListings);
      
      // Calculate stats
      const total = allListings.length;
      const verified = allListings.filter(l => l.verified).length;
      const pending = allListings.filter(l => !l.verified && !l.rejected).length;
      const rejected = allListings.filter(l => l.rejected).length;
      const totalValue = allListings.reduce((sum, l) => sum + (parseFloat(l.price) || 0), 0);
      
      setStats({ total, verified, pending, rejected, totalValue });
    } catch (error) {
      console.error('Error loading listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSampleListings = () => {
    return [
      {
        id: 'admin_1',
        title: 'Luxury 3-Bedroom Penthouse',
        description: 'Penthouse with panoramic views of Lagos',
        price: 12000000,
        state: 'Lagos',
        lga: 'Victoria Island',
        propertyType: 'Penthouse',
        verified: true,
        userVerified: true,
        userRole: 'landlord',
        posterName: 'Premium Properties Ltd.',
        postedDate: '2024-12-01',
        status: 'available',
        views: 245,
        inquiries: 12
      },
      {
        id: 'admin_2',
        title: 'Affordable Studio Apartment',
        description: 'Perfect for students, close to universities',
        price: 450000,
        state: 'Ogun',
        lga: 'Abeokuta South',
        propertyType: 'Studio',
        verified: false,
        userVerified: false,
        userRole: 'tenant',
        posterName: 'Student Moving Out',
        postedDate: '2024-12-10',
        status: 'available',
        views: 89,
        inquiries: 5
      },
      {
        id: 'admin_3',
        title: 'Commercial Space in CBD',
        description: 'Prime location for business, 500 sqm',
        price: 5000000,
        state: 'Abuja',
        lga: 'Garki',
        propertyType: 'Commercial',
        verified: true,
        userVerified: true,
        userRole: 'estate-firm',
        posterName: 'Prime Real Estate',
        postedDate: '2024-12-05',
        status: 'available',
        views: 156,
        inquiries: 8
      }
    ];
  };

  const applyFilters = () => {
    let filtered = [...listings];

    // Status filter
    if (filters.status !== 'all') {
      if (filters.status === 'verified') {
        filtered = filtered.filter(l => l.verified);
      } else if (filters.status === 'pending') {
        filtered = filtered.filter(l => !l.verified && !l.rejected);
      } else if (filters.status === 'rejected') {
        filtered = filtered.filter(l => l.rejected);
      }
    }

    // Type filter
    if (filters.type !== 'all') {
      filtered = filtered.filter(l => l.propertyType === filters.type);
    }

    // State filter
    if (filters.state) {
      filtered = filtered.filter(l => l.state === filters.state);
    }

    // Price filters
    if (filters.minPrice) {
      filtered = filtered.filter(l => (parseFloat(l.price) || 0) >= parseFloat(filters.minPrice));
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(l => (parseFloat(l.price) || 0) <= parseFloat(filters.maxPrice));
    }

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(l => 
        l.title?.toLowerCase().includes(searchTerm) ||
        l.description?.toLowerCase().includes(searchTerm) ||
        l.posterName?.toLowerCase().includes(searchTerm)
      );
    }

    setFilteredListings(filtered);
  };

  const handleVerifyListing = (listingId) => {
    const updatedListings = listings.map(listing => 
      listing.id === listingId ? { ...listing, verified: true, rejected: false } : listing
    );
    
    localStorage.setItem('listings', JSON.stringify(updatedListings));
    setListings(updatedListings);
    
    // Log activity
    const activity = {
      id: Date.now(),
      action: `Verified listing: ${listings.find(l => l.id === listingId)?.title}`,
      type: 'listing',
      admin: user?.name,
      timestamp: new Date().toISOString()
    };
    
    const activities = JSON.parse(localStorage.getItem('adminActivities') || '[]');
    activities.unshift(activity);
    localStorage.setItem('adminActivities', JSON.stringify(activities.slice(0, 100)));
  };

  const handleRejectListing = (listingId, reason = 'Violates guidelines') => {
    const updatedListings = listings.map(listing => 
      listing.id === listingId ? { ...listing, verified: false, rejected: true, rejectionReason: reason } : listing
    );
    
    localStorage.setItem('listings', JSON.stringify(updatedListings));
    setListings(updatedListings);
    
    const activity = {
      id: Date.now(),
      action: `Rejected listing: ${listings.find(l => l.id === listingId)?.title}`,
      type: 'listing',
      admin: user?.name,
      timestamp: new Date().toISOString()
    };
    
    const activities = JSON.parse(localStorage.getItem('adminActivities') || '[]');
    activities.unshift(activity);
    localStorage.setItem('adminActivities', JSON.stringify(activities.slice(0, 100)));
  };

  const handleDeleteListing = (listingId) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      const updatedListings = listings.filter(l => l.id !== listingId);
      localStorage.setItem('listings', JSON.stringify(updatedListings));
      setListings(updatedListings);
      
      const activity = {
        id: Date.now(),
        action: `Deleted listing: ${listings.find(l => l.id === listingId)?.title}`,
        type: 'listing',
        admin: user?.name,
        timestamp: new Date().toISOString()
      };
      
      const activities = JSON.parse(localStorage.getItem('adminActivities') || '[]');
      activities.unshift(activity);
      localStorage.setItem('adminActivities', JSON.stringify(activities.slice(0, 100)));
    }
  };

  const handleExportListings = () => {
    const csvContent = [
      ['ID', 'Title', 'Price', 'Location', 'Type', 'Status', 'Posted By', 'Views', 'Inquiries'],
      ...filteredListings.map(l => [
        l.id,
        l.title,
        `₦${l.price?.toLocaleString()}`,
        `${l.state}, ${l.lga}`,
        l.propertyType,
        l.verified ? 'Verified' : l.rejected ? 'Rejected' : 'Pending',
        l.posterName,
        l.views || 0,
        l.inquiries || 0
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `renteasy-listings-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getStatusBadge = (listing) => {
    if (listing.verified) {
      return <span className="badge-verified">✓ Verified</span>;
    } else if (listing.rejected) {
      return <span className="badge-rejected">✗ Rejected</span>;
    } else {
      return <span className="badge-pending">⏳ Pending</span>;
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="admin-access-denied">
        <h2>⛔ Admin Access Required</h2>
        <p>You need administrator privileges to access this page.</p>
      </div>
    );
  }

  return (
      <div className="admin-listings">
        {/* Header */}
        <div className="page-header">
          <div className="header-left">
            <h1><Home size={24} /> Property Listings</h1>
            <p>Manage and moderate all property listings on RentEasy</p>
          </div>
          <div className="header-right">
            <button className="btn-export" onClick={handleExportListings}>
              <Download size={18} /> Export CSV
            </button>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="stats-summary">
          <div className="stat-card">
            <div className="stat-icon total">
              <Home />
            </div>
            <div className="stat-content">
              <h3>{stats.total}</h3>
              <p>Total Listings</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon verified">
              <CheckCircle />
            </div>
            <div className="stat-content">
              <h3>{stats.verified}</h3>
              <p>Verified</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon pending">
              <AlertCircle />
            </div>
            <div className="stat-content">
              <h3>{stats.pending}</h3>
              <p>Pending Review</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon value">
              <DollarSign />
            </div>
            <div className="stat-content">
              <h3>₦{(stats.totalValue / 1000000).toFixed(1)}M</h3>
              <p>Total Value</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="search-bar">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search listings..."
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
            />
          </div>
          
          <div className="filter-controls">
            <select 
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
            >
              <option value="all">All Status</option>
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>

            <select 
              value={filters.type}
              onChange={(e) => setFilters({...filters, type: e.target.value})}
            >
              <option value="all">All Types</option>
              <option value="Self Contain">Self Contain</option>
              <option value="1 Bedroom">1 Bedroom</option>
              <option value="2 Bedroom">2 Bedroom</option>
              <option value="3 Bedroom">3 Bedroom</option>
              <option value="Duplex">Duplex</option>
              <option value="Commercial">Commercial</option>
            </select>

            <input
              type="number"
              placeholder="Min Price"
              value={filters.minPrice}
              onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
            />

            <input
              type="number"
              placeholder="Max Price"
              value={filters.maxPrice}
              onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
            />

            <button 
              className="btn-clear"
              onClick={() => setFilters({
                status: 'all',
                type: 'all',
                state: '',
                minPrice: '',
                maxPrice: '',
                search: ''
              })}
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Listings Table */}
        <div className="listings-table-container">
          {loading ? (
            <div className="loading-spinner">Loading listings...</div>
          ) : filteredListings.length === 0 ? (
            <div className="empty-state">
              <Home size={48} />
              <h3>No listings found</h3>
              <p>Try adjusting your search or filters</p>
            </div>
          ) : (
            <table className="listings-table">
              <thead>
                <tr>
                  <th>Property</th>
                  <th>Price</th>
                  <th>Location</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Posted By</th>
                  <th>Metrics</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredListings.map(listing => (
                  <tr key={listing.id}>
                    <td>
                      <div className="property-info">
                        <div className="property-avatar">
                          {listing.propertyType === 'Commercial' ? '🏢' : '🏠'}
                        </div>
                        <div className="property-details">
                          <strong>{listing.title}</strong>
                          <small>{listing.description?.substring(0, 50)}...</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="price-tag">
                        ₦{listing.price?.toLocaleString()}
                      </span>
                    </td>
                    <td>
                      <div className="location-info">
                        <MapPin size={14} />
                        <span>{listing.state}, {listing.lga}</span>
                      </div>
                    </td>
                    <td>
                      <span className="type-badge">{listing.propertyType}</span>
                    </td>
                    <td>
                      {getStatusBadge(listing)}
                    </td>
                    <td>
                      <div className="poster-info">
                        <strong>{listing.posterName}</strong>
                        <small>{listing.userRole}</small>
                      </div>
                    </td>
                    <td>
                      <div className="metrics">
                        <span className="metric">
                          <Eye size={12} /> {listing.views || 0}
                        </span>
                        <span className="metric">
                          <Users size={12} /> {listing.inquiries || 0}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn-view"
                          onClick={() => {
                            setSelectedListing(listing);
                            setShowDetails(true);
                          }}
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        
                        {!listing.verified && !listing.rejected && (
                          <>
                            <button 
                              className="btn-verify"
                              onClick={() => handleVerifyListing(listing.id)}
                              title="Verify Listing"
                            >
                              <CheckCircle size={16} />
                            </button>
                            <button 
                              className="btn-reject"
                              onClick={() => handleRejectListing(listing.id)}
                              title="Reject Listing"
                            >
                              <XCircle size={16} />
                            </button>
                          </>
                        )}
                        
                        <button 
                          className="btn-delete"
                          onClick={() => handleDeleteListing(listing.id)}
                          title="Delete Listing"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          
          {filteredListings.length > 0 && (
            <div className="table-footer">
              <span>Showing {filteredListings.length} of {listings.length} listings</span>
              <div className="pagination">
                <button disabled>Previous</button>
                <span className="current-page">1</span>
                <button>Next</button>
              </div>
            </div>
          )}
        </div>

        {/* Listing Details Modal */}
        {showDetails && selectedListing && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h2>Listing Details</h2>
                <button 
                  className="close-modal"
                  onClick={() => setShowDetails(false)}
                >
                  ×
                </button>
              </div>
              
              <div className="listing-details-content">
                <div className="listing-header">
                  <h3>{selectedListing.title}</h3>
                  <div className="listing-status">
                    {getStatusBadge(selectedListing)}
                    <span className="price-large">
                      ₦{selectedListing.price?.toLocaleString()}
                    </span>
                  </div>
                </div>
                
                <div className="details-grid">
                  <div className="detail-section">
                    <h4>Property Information</h4>
                    <div className="detail-item">
                      <strong>Type:</strong>
                      <span>{selectedListing.propertyType}</span>
                    </div>
                    <div className="detail-item">
                      <strong>Location:</strong>
                      <span>{selectedListing.state}, {selectedListing.lga}</span>
                    </div>
                    <div className="detail-item">
                      <strong>Description:</strong>
                      <span>{selectedListing.description}</span>
                    </div>
                  </div>
                  
                  <div className="detail-section">
                    <h4>Poster Information</h4>
                    <div className="detail-item">
                      <strong>Name:</strong>
                      <span>{selectedListing.posterName}</span>
                    </div>
                    <div className="detail-item">
                      <strong>Role:</strong>
                      <span className="role-badge">{selectedListing.userRole}</span>
                    </div>
                    <div className="detail-item">
                      <strong>Verification:</strong>
                      <span>{selectedListing.userVerified ? '✓ Verified User' : '⚠️ Unverified User'}</span>
                    </div>
                  </div>
                  
                  <div className="detail-section">
                    <h4>Metrics</h4>
                    <div className="detail-item">
                      <strong>Views:</strong>
                      <span>{selectedListing.views || 0}</span>
                    </div>
                    <div className="detail-item">
                      <strong>Inquiries:</strong>
                      <span>{selectedListing.inquiries || 0}</span>
                    </div>
                    <div className="detail-item">
                      <strong>Posted Date:</strong>
                      <span>{new Date(selectedListing.postedDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  {selectedListing.rejectionReason && (
                    <div className="detail-section warning">
                      <h4>Rejection Reason</h4>
                      <p>{selectedListing.rejectionReason}</p>
                    </div>
                  )}
                </div>
                
                <div className="modal-actions">
                  <button 
                    className="btn-secondary"
                    onClick={() => setShowDetails(false)}
                  >
                    Close
                  </button>
                  
                  {!selectedListing.verified && !selectedListing.rejected && (
                    <>
                      <button 
                        className="btn-verify"
                        onClick={() => {
                          handleVerifyListing(selectedListing.id);
                          setShowDetails(false);
                        }}
                      >
                        <CheckCircle size={16} /> Verify Listing
                      </button>
                      <button 
                        className="btn-reject"
                        onClick={() => {
                          const reason = prompt('Enter rejection reason:', 'Violates guidelines');
                          if (reason) {
                            handleRejectListing(selectedListing.id, reason);
                            setShowDetails(false);
                          }
                        }}
                      >
                        <XCircle size={16} /> Reject Listing
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
  );
};

export default AdminListings;