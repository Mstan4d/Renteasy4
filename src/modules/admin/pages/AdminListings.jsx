// src/modules/admin/pages/AdminListings.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../shared/lib/supabaseClient';
import {
  Home, CheckCircle, XCircle, Eye, Edit, Trash2,
  Filter, Search, MapPin, DollarSign, Users,
  Download, TrendingUp, AlertCircle, Shield, RefreshCw
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

  // Load listings from Supabase
  const loadListings = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch listings with user information (profile)
      const { data: listingsData, error: listingsError } = await supabase
        .from('listings')
        .select(`
          *,
          profile:user_id (
            id,
            name,
            email,
            role,
            verified
          )
        `)
        .order('created_at', { ascending: false });

      if (listingsError) throw listingsError;

      // Transform data to match expected structure
      const transformedListings = listingsData.map(listing => ({
        id: listing.id,
        title: listing.title,
        description: listing.description,
        price: listing.price,
        state: listing.state,
        lga: listing.lga || listing.city,
        propertyType: listing.property_type,
        verified: listing.verified,
        rejected: listing.rejected,
        userVerified: listing.profile?.verified || false,
        userRole: listing.profile?.role || 'user',
        posterName: listing.profile?.name || 'Unknown',
        posterEmail: listing.profile?.email,
        status: listing.status,
        views: listing.views || 0,
        inquiries: listing.inquiries || 0,
        createdAt: listing.created_at,
        updatedAt: listing.updated_at,
        rejectionReason: listing.rejection_reason,
        approvedAt: listing.approved_at,
        approvedBy: listing.approved_by,
        approvedById: listing.approved_by_id,
        // Add any other fields from Supabase
        ...listing
      }));

      setListings(transformedListings);
      
      // Calculate stats
      const total = transformedListings.length;
      const verified = transformedListings.filter(l => l.verified).length;
      const pending = transformedListings.filter(l => !l.verified && !l.rejected).length;
      const rejected = transformedListings.filter(l => l.rejected).length;
      const totalValue = transformedListings.reduce((sum, l) => sum + (parseFloat(l.price) || 0), 0);
      
      setStats({ total, verified, pending, rejected, totalValue });
    } catch (error) {
      console.error('Error loading listings:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role !== 'admin') return;
    
    loadListings();
    
    // Set up real-time subscription for listings
    const listingsChannel = supabase
      .channel('admin-listings-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'listings'
      }, () => {
        loadListings();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(listingsChannel);
    };
  }, [user, loadListings]);

  // Apply filters
  useEffect(() => {
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
      filtered = filtered.filter(l => l.propertyType?.toLowerCase() === filters.type.toLowerCase());
    }

    // State filter
    if (filters.state) {
      filtered = filtered.filter(l => 
        l.state?.toLowerCase().includes(filters.state.toLowerCase())
      );
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
        l.posterName?.toLowerCase().includes(searchTerm) ||
        l.state?.toLowerCase().includes(searchTerm) ||
        l.lga?.toLowerCase().includes(searchTerm)
      );
    }

    setFilteredListings(filtered);
  }, [filters, listings]);

  // Verify a listing
  const handleVerifyListing = async (listingId) => {
    try {
      // First get the listing to verify
      const { data: listing, error: fetchError } = await supabase
        .from('listings')
        .select('*')
        .eq('id', listingId)
        .single();

      if (fetchError) throw fetchError;

      // Update the listing
      const { error } = await supabase
        .from('listings')
        .update({
          verified: true,
          rejected: false,
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: user?.name,
          approved_by_id: user?.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', listingId);

      if (error) throw error;

      // Log activity
      await logActivity(`Verified listing: ${listing.title}`, 'listing', listingId);
      
      // Refresh listings
      loadListings();
      
      // Show success message
      alert(`Listing "${listing.title}" has been verified!`);
    } catch (error) {
      console.error('Error verifying listing:', error);
      alert('Failed to verify listing. Please try again.');
    }
  };

  // Reject a listing
  const handleRejectListing = async (listingId, reason = 'Violates platform guidelines') => {
    if (!window.confirm('Are you sure you want to reject this listing?')) return;

    try {
      const { data: listing, error: fetchError } = await supabase
        .from('listings')
        .select('*')
        .eq('id', listingId)
        .single();

      if (fetchError) throw fetchError;

      const { error } = await supabase
        .from('listings')
        .update({
          verified: false,
          rejected: true,
          status: 'rejected',
          rejection_reason: reason,
          rejected_at: new Date().toISOString(),
          rejected_by: user?.name,
          rejected_by_id: user?.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', listingId);

      if (error) throw error;

      await logActivity(`Rejected listing: ${listing.title}`, 'listing', listingId);
      loadListings();
      alert(`Listing "${listing.title}" has been rejected.`);
    } catch (error) {
      console.error('Error rejecting listing:', error);
      alert('Failed to reject listing. Please try again.');
    }
  };

  // Delete a listing
  const handleDeleteListing = async (listingId) => {
    if (!window.confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      return;
    }

    try {
      const { data: listing, error: fetchError } = await supabase
        .from('listings')
        .select('*')
        .eq('id', listingId)
        .single();

      if (fetchError) throw fetchError;

      // First, check if there are any related records (like images, messages, etc.)
      // You might want to handle these relationships appropriately
      
      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', listingId);

      if (error) throw error;

      await logActivity(`Deleted listing: ${listing.title}`, 'listing', listingId);
      loadListings();
      alert(`Listing "${listing.title}" has been deleted.`);
    } catch (error) {
      console.error('Error deleting listing:', error);
      alert('Failed to delete listing. It may have related records that need to be handled first.');
    }
  };

  // Log activity function
  const logActivity = async (action, type, entityId = null) => {
    try {
      const { error } = await supabase
        .from('admin_activities')
        .insert({
          admin_id: user?.id,
          action,
          type,
          entity_id: entityId,
          details: { 
            admin_name: user?.name || 'Admin',
            admin_email: user?.email 
          },
          created_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  };

  // Export listings to CSV
  const handleExportListings = () => {
    try {
      const csvContent = [
        ['ID', 'Title', 'Price', 'Location', 'Type', 'Status', 'Posted By', 'Email', 'Views', 'Inquiries', 'Created Date'],
        ...filteredListings.map(l => [
          l.id,
          `"${l.title}"`,
          `₦${Number(l.price).toLocaleString()}`,
          `"${l.state}, ${l.lga}"`,
          l.propertyType,
          l.verified ? 'Verified' : l.rejected ? 'Rejected' : 'Pending',
          `"${l.posterName}"`,
          l.posterEmail || '',
          l.views || 0,
          l.inquiries || 0,
          new Date(l.createdAt).toLocaleDateString()
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `renteasy-listings-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      alert(`Exported ${filteredListings.length} listings to CSV`);
    } catch (error) {
      console.error('Error exporting listings:', error);
      alert('Failed to export listings. Please try again.');
    }
  };

  // Get status badge
  const getStatusBadge = (listing) => {
    if (listing.verified) {
      return <span className="badge-verified">✓ Verified</span>;
    } else if (listing.rejected) {
      return <span className="badge-rejected">✗ Rejected</span>;
    } else {
      return <span className="badge-pending">⏳ Pending</span>;
    }
  };

  // Get unique states for filter suggestions
  const getUniqueStates = () => {
    const states = [...new Set(listings.map(l => l.state).filter(Boolean))];
    return states.sort();
  };

  // Get unique property types
  const getUniquePropertyTypes = () => {
    const types = [...new Set(listings.map(l => l.propertyType).filter(Boolean))];
    return types.sort();
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
          <small>Total: {stats.total} listings | Last updated: {new Date().toLocaleTimeString()}</small>
        </div>
        <div className="header-right">
          <button 
            className="btn-refresh" 
            onClick={loadListings}
            disabled={loading}
          >
            <RefreshCw size={18} className={loading ? 'spinning' : ''} />
            Refresh
          </button>
          <button 
            className="btn-export" 
            onClick={handleExportListings}
            disabled={filteredListings.length === 0}
          >
            <Download size={18} /> Export CSV ({filteredListings.length})
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
            <small>{stats.total > 0 ? Math.round((stats.verified / stats.total) * 100) : 0}% verified</small>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon pending">
            <AlertCircle />
          </div>
          <div className="stat-content">
            <h3>{stats.pending}</h3>
            <p>Pending Review</p>
            <small>Requires action</small>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon value">
            <DollarSign />
          </div>
          <div className="stat-content">
            <h3>₦{(stats.totalValue / 1000000).toFixed(1)}M</h3>
            <p>Total Value</p>
            <small>Average: ₦{stats.total > 0 ? (stats.totalValue / stats.total).toLocaleString() : 0}</small>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-bar">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by title, description, location, or poster..."
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
            {getUniquePropertyTypes().map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          <select 
            value={filters.state}
            onChange={(e) => setFilters({...filters, state: e.target.value})}
          >
            <option value="">All States</option>
            {getUniqueStates().map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Min Price (₦)"
            value={filters.minPrice}
            onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
            min="0"
          />

          <input
            type="number"
            placeholder="Max Price (₦)"
            value={filters.maxPrice}
            onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
            min="0"
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
          <div className="loading-spinner">
            <RefreshCw className="spinning" size={24} />
            <p>Loading listings...</p>
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="empty-state">
            <Home size={48} />
            <h3>No listings found</h3>
            <p>Try adjusting your search or filters</p>
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
              Clear all filters
            </button>
          </div>
        ) : (
          <>
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
                          {listing.propertyType === 'Commercial' ? '🏢' : 
                           listing.propertyType === 'Land' ? '🌱' : '🏠'}
                        </div>
                        <div className="property-details">
                          <strong>{listing.title}</strong>
                          <small>{listing.description?.substring(0, 60)}...</small>
                          <small className="text-muted">
                            ID: {listing.id.substring(0, 8)}... • Created: {new Date(listing.createdAt).toLocaleDateString()}
                          </small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="price-tag">
                        ₦{Number(listing.price).toLocaleString()}
                      </span>
                      <small className="text-muted">
                        {listing.price_per_unit ? `(${listing.price_per_unit})` : ''}
                      </small>
                    </td>
                    <td>
                      <div className="location-info">
                        <MapPin size={14} />
                        <div>
                          <span>{listing.state}</span>
                          <small>{listing.lga}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="type-badge">{listing.propertyType}</span>
                      {listing.bedrooms && <small>{listing.bedrooms} BR</small>}
                    </td>
                    <td>
                      {getStatusBadge(listing)}
                      {listing.verified && listing.approvedAt && (
                        <small className="text-muted">
                          Approved: {new Date(listing.approvedAt).toLocaleDateString()}
                        </small>
                      )}
                    </td>
                    <td>
                      <div className="poster-info">
                        <strong>{listing.posterName}</strong>
                        <small>{listing.userRole}</small>
                        <small className="text-muted">
                          {listing.userVerified ? '✓ Verified User' : '⚠️ Unverified'}
                        </small>
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
                        {listing.bookmarks && (
                          <span className="metric">
                            <Shield size={12} /> {listing.bookmarks || 0}
                          </span>
                        )}
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
                              onClick={() => {
                                const reason = prompt('Enter rejection reason (optional):', 'Violates platform guidelines');
                                if (reason !== null) {
                                  handleRejectListing(listing.id, reason);
                                }
                              }}
                              title="Reject Listing"
                            >
                              <XCircle size={16} />
                            </button>
                          </>
                        )}
                        
                        {(listing.verified || listing.rejected) && (
                          <button 
                            className="btn-edit"
                            onClick={() => alert('Edit functionality coming soon!')}
                            title="Edit Listing"
                          >
                            <Edit size={16} />
                          </button>
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
            
            <div className="table-footer">
              <span>Showing {filteredListings.length} of {listings.length} listings</span>
              <div className="pagination">
                <button disabled>Previous</button>
                <span className="current-page">1</span>
                <button>Next</button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Listing Details Modal */}
      {showDetails && selectedListing && (
        <div className="modal-overlay" onClick={() => setShowDetails(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
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
                    ₦{Number(selectedListing.price).toLocaleString()}
                  </span>
                </div>
              </div>
              
              <div className="details-grid">
                <div className="detail-section">
                  <h4>Property Information</h4>
                  <div className="detail-item">
                    <strong>Property Type:</strong>
                    <span>{selectedListing.propertyType}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Location:</strong>
                    <span>{selectedListing.state}, {selectedListing.lga}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Address:</strong>
                    <span>{selectedListing.address || 'Not specified'}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Description:</strong>
                    <p>{selectedListing.description}</p>
                  </div>
                  {selectedListing.amenities && (
                    <div className="detail-item">
                      <strong>Amenities:</strong>
                      <div className="amenities-list">
                        {JSON.parse(selectedListing.amenities || '[]').map((amenity, index) => (
                          <span key={index} className="amenity-tag">{amenity}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="detail-section">
                  <h4>Poster Information</h4>
                  <div className="detail-item">
                    <strong>Name:</strong>
                    <span>{selectedListing.posterName}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Email:</strong>
                    <span>{selectedListing.posterEmail || 'Not provided'}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Role:</strong>
                    <span className="role-badge">{selectedListing.userRole}</span>
                  </div>
                  <div className="detail-item">
                    <strong>User Verification:</strong>
                    <span>{selectedListing.userVerified ? '✓ Verified User' : '⚠️ Unverified User'}</span>
                  </div>
                  <div className="detail-item">
                    <strong>User ID:</strong>
                    <small className="text-muted">{selectedListing.user_id?.substring(0, 12)}...</small>
                  </div>
                </div>
                
                <div className="detail-section">
                  <h4>Metrics & Dates</h4>
                  <div className="detail-item">
                    <strong>Views:</strong>
                    <span>{selectedListing.views || 0}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Inquiries:</strong>
                    <span>{selectedListing.inquiries || 0}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Created Date:</strong>
                    <span>{new Date(selectedListing.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Last Updated:</strong>
                    <span>{new Date(selectedListing.updatedAt).toLocaleString()}</span>
                  </div>
                  {selectedListing.verified && selectedListing.approvedAt && (
                    <div className="detail-item">
                      <strong>Approved Date:</strong>
                      <span>{new Date(selectedListing.approvedAt).toLocaleString()}</span>
                    </div>
                  )}
                  {selectedListing.rejected && selectedListing.rejected_at && (
                    <div className="detail-item">
                      <strong>Rejected Date:</strong>
                      <span>{new Date(selectedListing.rejected_at).toLocaleString()}</span>
                    </div>
                  )}
                </div>
                
                {selectedListing.rejectionReason && (
                  <div className="detail-section warning">
                    <h4>Rejection Reason</h4>
                    <div className="warning-content">
                      <AlertCircle size={20} />
                      <p>{selectedListing.rejectionReason}</p>
                    </div>
                    {selectedListing.rejected_by && (
                      <small>Rejected by: {selectedListing.rejected_by} on {new Date(selectedListing.rejected_at).toLocaleDateString()}</small>
                    )}
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
                        const reason = prompt('Enter rejection reason (optional):', 'Violates platform guidelines');
                        if (reason !== null) {
                          handleRejectListing(selectedListing.id, reason);
                          setShowDetails(false);
                        }
                      }}
                    >
                      <XCircle size={16} /> Reject Listing
                    </button>
                  </>
                )}
                
                <button 
                  className="btn-delete"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this listing?')) {
                      handleDeleteListing(selectedListing.id);
                      setShowDetails(false);
                    }
                  }}
                >
                  <Trash2 size={16} /> Delete Listing
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminListings;