// src/modules/admin/pages/AdminListings.jsx (corrected)
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
  const [editPriceModal, setEditPriceModal] = useState(false);
  const [editingListing, setEditingListing] = useState(null);
  const [newPrice, setNewPrice] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    pending: 0,
    rejected: 0,
    totalValue: 0,
    potentialCommission: 0  // 7.5% of totalValue
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
            full_name,
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
        // Use is_verified as the primary verification flag
        verified: listing.is_verified || listing.verified || false,
        rejected: listing.rejected || false,
        userVerified: listing.profile?.verified || false,
        userRole: listing.profile?.role || 'user',
        posterName: listing.profile?.full_name || listing.poster_name || 'Unknown',
        posterEmail: listing.profile?.email,
        status: listing.status,
        views: listing.views || 0,
        inquiries: listing.inquiries || 0,
        createdAt: listing.created_at,
        updatedAt: listing.updated_at,
        rejectionReason: listing.rejection_reason,
        approvedAt: listing.approved_at,
        approvedBy: listing.approved_by,
        verifiedAt: listing.verified_at,
        verifiedBy: listing.verified_by,
        bedrooms: listing.bedrooms,
        bathrooms: listing.bathrooms,
        area: listing.area,
        amenities: listing.amenities,
        // Include any other fields needed
        ...listing
      }));

      setListings(transformedListings);
      
      // Calculate stats
      const total = transformedListings.length;
      const verified = transformedListings.filter(l => l.verified).length;
      const pending = transformedListings.filter(l => !l.verified && !l.rejected).length;
      const rejected = transformedListings.filter(l => l.rejected).length;
      const totalValue = transformedListings.reduce((sum, l) => sum + (parseFloat(l.price) || 0), 0);
      const potentialCommission = totalValue * 0.075; // 7.5% commission
      
      setStats({ total, verified, pending, rejected, totalValue, potentialCommission });
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

  // Apply filters (same as before)
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

  // Function to open edit price modal
const openEditPriceModal = (listing) => {
  setEditingListing(listing);
  setNewPrice(listing.price);
  setEditPriceModal(true);
};

// Function to save updated price
const handleUpdatePrice = async () => {
  if (!editingListing) return;
  try {
    const { error } = await supabase
      .from('listings')
      .update({ 
        price: parseFloat(newPrice), 
        updated_at: new Date().toISOString() 
      })
      .eq('id', editingListing.id);
    if (error) throw error;
    await loadListings();
    setEditPriceModal(false);
    setEditingListing(null);
    alert('Price updated successfully!');
  } catch (error) {
    console.error('Error updating price:', error);
    alert('Failed to update price.');
  }
};

// Function to mark a listing as rented (admin override)
const handleMarkRented = async (listingId) => {
  if (!window.confirm('Mark this listing as rented? It will be removed from public listings.')) return;
  try {
    const { error } = await supabase
      .from('listings')
      .update({ 
        status: 'rented', 
        rented_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', listingId);
    if (error) throw error;
    await loadListings();
    alert('Listing marked as rented.');
  } catch (error) {
    console.error('Error marking as rented:', error);
    alert('Failed to mark as rented.');
  }
};

  // Verify a listing – use correct column names
  const handleVerifyListing = async (listingId) => {
    try {
      // First get the listing to verify (optional, for confirmation)
      const { data: listing, error: fetchError } = await supabase
        .from('listings')
        .select('title')
        .eq('id', listingId)
        .single();

      if (fetchError) throw fetchError;

      // Update the listing with the correct columns
      const { error } = await supabase
        .from('listings')
        .update({
          is_verified: true,            // use is_verified (or verified? we'll assume is_verified)
          verified: true,                // also set verified if it exists
          rejected: false,
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: user?.name,       // text column for approval
          verified_at: new Date().toISOString(),
          verified_by: user?.id,         // uuid column
          updated_at: new Date().toISOString()
        })
        .eq('id', listingId);

      if (error) throw error;

      // Log activity
      await logActivity(`Verified listing: ${listing.title}`, 'listing', listingId);
      
      // Refresh listings
      loadListings();
      
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
        .select('title')
        .eq('id', listingId)
        .single();

      if (fetchError) throw fetchError;

      const { error } = await supabase
        .from('listings')
        .update({
          is_verified: false,
          verified: false,
          rejected: true,
          status: 'rejected',
          rejection_reason: reason,
          rejected_at: new Date().toISOString(),
          rejected_by: user?.name,      // text column
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
        .select('title')
        .eq('id', listingId)
        .single();

      if (fetchError) throw fetchError;

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

  // Log activity function (unchanged)
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

  // Export listings to CSV (unchanged)
  const handleExportListings = () => {
    // ... (same as before)
  };

  // Get status badge (unchanged)
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

      {/* Stats Summary – updated to include potential commission */}
      <div className="stats-summary">
        <div className="stat-card">
          <div className="stat-icon total"><Home /></div>
          <div className="stat-content">
            <h3>{stats.total}</h3>
            <p>Total Listings</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon verified"><CheckCircle /></div>
          <div className="stat-content">
            <h3>{stats.verified}</h3>
            <p>Verified</p>
            <small>{stats.total > 0 ? Math.round((stats.verified / stats.total) * 100) : 0}% verified</small>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon pending"><AlertCircle /></div>
          <div className="stat-content">
            <h3>{stats.pending}</h3>
            <p>Pending Review</p>
            <small>Requires action</small>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon value"><DollarSign /></div>
          <div className="stat-content">
            <h3>₦{(stats.totalValue / 1000000).toFixed(1)}M</h3>
            <p>Total Value</p>
            <small>Avg: ₦{stats.total > 0 ? Math.round(stats.totalValue / stats.total).toLocaleString() : 0}</small>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon commission"><TrendingUp /></div>
          <div className="stat-content">
            <h3>₦{Math.round(stats.potentialCommission).toLocaleString()}</h3>
            <p>Potential Commission (7.5%)</p>
            <small>Total commission if all rented</small>
          </div>
        </div>
      </div>

      {/* Filters (same as before) */}
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

      {/* Listings Table (same JSX, only status badge uses listing.verified) */}
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
                      {listing.verified && listing.verifiedAt && (
                        <small className="text-muted">
                          Verified: {new Date(listing.verifiedAt).toLocaleDateString()}
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
                        <span className="metric"><Eye size={12} /> {listing.views || 0}</span>
                        <span className="metric"><Users size={12} /> {listing.inquiries || 0}</span>
                      </div>
                    </td>
                    <td>
  <div className="action-buttons">
    {/* View button always visible */}
    <button className="btn-view" onClick={() => { setSelectedListing(listing); setShowDetails(true); }} title="View Details">
      <Eye size={16} />
    </button>

    {/* For pending listings – verify/reject */}
    {!listing.verified && !listing.rejected && (
      <>
        <button className="btn-verify" onClick={() => handleVerifyListing(listing.id)} title="Verify Listing">
          <CheckCircle size={16} />
        </button>
        <button className="btn-reject" onClick={() => { const r = prompt('Rejection reason?', 'Violates platform guidelines'); if (r !== null) handleRejectListing(listing.id, r); }} title="Reject Listing">
          <XCircle size={16} />
        </button>
      </>
    )}

    {/* For verified or rejected listings – edit price and mark rented (if not already rented) */}
    {(listing.verified || listing.rejected) && (
      <>
        <button className="btn-edit" onClick={() => openEditPriceModal(listing)} title="Edit Price">
          <Edit size={16} />
        </button>
        {listing.status !== 'rented' && (
          <button className="btn-rented" onClick={() => handleMarkRented(listing.id)} title="Mark as Rented">
            <CheckCircle size={16} />
          </button>
        )}
      </>
    )}

    {/* Delete button always visible */}
    <button className="btn-delete" onClick={() => handleDeleteListing(listing.id)} title="Delete Listing">
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

      {/* Listing Details Modal (similar to before, adapt columns) */}
      {showDetails && selectedListing && (
        <div className="modal-overlay" onClick={() => setShowDetails(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Listing Details</h2>
              <button className="close-modal" onClick={() => setShowDetails(false)}>×</button>
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
                  <div className="detail-item"><strong>Property Type:</strong> {selectedListing.propertyType}</div>
                  <div className="detail-item"><strong>Location:</strong> {selectedListing.state}, {selectedListing.lga}</div>
                  <div className="detail-item"><strong>Address:</strong> {selectedListing.address || 'Not specified'}</div>
                  <div className="detail-item"><strong>Description:</strong> {selectedListing.description}</div>
                  {selectedListing.amenities && (
                    <div className="detail-item">
                      <strong>Amenities:</strong>
                      <div className="amenities-list">
                        {typeof selectedListing.amenities === 'string' 
                          ? JSON.parse(selectedListing.amenities).map((a, i) => <span key={i} className="amenity-tag">{a}</span>)
                          : selectedListing.amenities?.map((a, i) => <span key={i} className="amenity-tag">{a}</span>)}
                      </div>
                    </div>
                  )}
                  {selectedListing.bedrooms && <div className="detail-item"><strong>Bedrooms:</strong> {selectedListing.bedrooms}</div>}
                  {selectedListing.bathrooms && <div className="detail-item"><strong>Bathrooms:</strong> {selectedListing.bathrooms}</div>}
                  {selectedListing.area && <div className="detail-item"><strong>Area:</strong> {selectedListing.area} sqm</div>}
                </div>
                
                <div className="detail-section">
                  <h4>Poster Information</h4>
                  <div className="detail-item"><strong>Name:</strong> {selectedListing.posterName}</div>
                  <div className="detail-item"><strong>Email:</strong> {selectedListing.posterEmail || 'Not provided'}</div>
                  <div className="detail-item"><strong>Role:</strong> {selectedListing.userRole}</div>
                  <div className="detail-item"><strong>User Verified:</strong> {selectedListing.userVerified ? '✓' : '⚠️'}</div>
                  <div className="detail-item"><strong>User ID:</strong> {selectedListing.user_id?.substring(0, 12)}...</div>
                </div>
                
                <div className="detail-section">
                  <h4>Metrics & Dates</h4>
                  <div className="detail-item"><strong>Views:</strong> {selectedListing.views || 0}</div>
                  <div className="detail-item"><strong>Inquiries:</strong> {selectedListing.inquiries || 0}</div>
                  <div className="detail-item"><strong>Created:</strong> {new Date(selectedListing.createdAt).toLocaleString()}</div>
                  <div className="detail-item"><strong>Last Updated:</strong> {new Date(selectedListing.updatedAt).toLocaleString()}</div>
                  {selectedListing.verified && selectedListing.verifiedAt && (
                    <div className="detail-item"><strong>Verified:</strong> {new Date(selectedListing.verifiedAt).toLocaleString()}</div>
                  )}
                  {selectedListing.rejected && selectedListing.rejected_at && (
                    <div className="detail-item"><strong>Rejected:</strong> {new Date(selectedListing.rejected_at).toLocaleString()}</div>
                  )}
                </div>
                
                {selectedListing.rejectionReason && (
                  <div className="detail-section warning">
                    <h4>Rejection Reason</h4>
                    <div className="warning-content">
                      <AlertCircle size={20} />
                      <p>{selectedListing.rejectionReason}</p>
                    </div>
                    {selectedListing.rejected_by && <small>Rejected by: {selectedListing.rejected_by}</small>}
                  </div>
                )}
              </div>
              
              <div className="modal-actions">
                <button className="btn-secondary" onClick={() => setShowDetails(false)}>Close</button>
                {!selectedListing.verified && !selectedListing.rejected && (
                  <>
                    <button className="btn-verify" onClick={() => { handleVerifyListing(selectedListing.id); setShowDetails(false); }}>
                      <CheckCircle size={16} /> Verify
                    </button>
                    <button className="btn-reject" onClick={() => { 
                      const reason = prompt('Rejection reason?', 'Violates platform guidelines');
                      if (reason !== null) { handleRejectListing(selectedListing.id, reason); setShowDetails(false); }
                    }}>
                      <XCircle size={16} /> Reject
                    </button>
                  </>
                )}
                <button className="btn-delete" onClick={() => { 
                  if (window.confirm('Delete this listing?')) { handleDeleteListing(selectedListing.id); setShowDetails(false); }
                }}>
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Edit Price Modal */}
{editPriceModal && (
  <div className="modal-overlay" onClick={() => setEditPriceModal(false)}>
    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      <div className="modal-header">
        <h3>Edit Listing Price</h3>
        <button className="close-modal" onClick={() => setEditPriceModal(false)}>×</button>
      </div>
      <div className="modal-body">
        <div className="form-group">
          <label>New Price (₦)</label>
          <input
            type="number"
            value={newPrice}
            onChange={(e) => setNewPrice(e.target.value)}
            className="form-control"
          />
        </div>
      </div>
      <div className="modal-footer">
        <button className="btn-secondary" onClick={() => setEditPriceModal(false)}>Cancel</button>
        <button className="btn-primary" onClick={handleUpdatePrice}>Save</button>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default AdminListings;