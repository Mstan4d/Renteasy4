// src/modules/estate-firm/pages/EstateMyListings.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../shared/lib/supabaseClient';
import {
  ArrowLeft, Tag, Home, DollarSign, Clock,
  CheckCircle, XCircle, AlertCircle, Eye,
  Download, Filter, Search, PlusCircle,
  Calendar, MapPin, User, Building,
  RefreshCw, ChevronRight, X, Check,
  FileText, Upload, Home as HomeIcon
} from 'lucide-react';
import RentEasyLoader from '../../../shared/components/RentEasyLoader';
import ConvertListingModal from '../components/ConvertListingModal';
import ListingModal from '../components/ListingModal';
import './EstateMyListings.css';

const EstateMyListings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [estateFirmId, setEstateFirmId] = useState(null);
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [listingToEdit, setListingToEdit] = useState(null);
  const [markingAsRented, setMarkingAsRented] = useState(false);
  const [showMarkRentedModal, setShowMarkRentedModal] = useState(false);
  const [listingToMark, setListingToMark] = useState(null);
  
  // Role-based state
  const [userRole, setUserRole] = useState('principal');
  const [isStaff, setIsStaff] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    active: 0,
    rented: 0,
    converted: 0,
    total: 0
  });

  const handleAddProperty = () => {
    navigate('/post-property?type=estate-firm');
  };

  // Get user role
  useEffect(() => {
    const getUserRole = async () => {
      if (!user) return;
      try {
        const { data: roleData, error: roleError } = await supabase
          .from('estate_firm_profiles')
          .select('staff_role, is_staff_account, parent_estate_firm_id')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (!roleError && roleData) {
          setUserRole(roleData.staff_role || 'principal');
          setIsStaff(roleData.is_staff_account || false);
        }
      } catch (err) {
        console.warn('Could not fetch user role:', err);
      }
    };
    
    getUserRole();
  }, [user]);

  // Get estate firm profile ID
  useEffect(() => {
    const getEstateFirmId = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('estate_firm_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();
      if (data) setEstateFirmId(data.id);
    };
    getEstateFirmId();
  }, [user]);

  // Load listings with role-based filtering
  useEffect(() => {
    if (estateFirmId) loadListings();
  }, [estateFirmId]);

  // In EstateMyListings.jsx, update the loadListings function:

const loadListings = async () => {
  if (!estateFirmId) return;
  
  setLoading(true);
  try {
    // Get user role and staff info
    let effectiveFirmId = estateFirmId;
    let currentUserRole = 'principal';
    let isStaff = false;
    
    const { data: roleData } = await supabase
      .from('estate_firm_profiles')
      .select('staff_role, is_staff_account, parent_estate_firm_id')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (roleData) {
      currentUserRole = roleData.staff_role || 'principal';
      isStaff = roleData.is_staff_account || false;
      
      // If staff, use parent firm ID
      if (isStaff && roleData.parent_estate_firm_id) {
        effectiveFirmId = roleData.parent_estate_firm_id;
      }
    }
    
    // Build query
    let query = supabase
      .from('listings')
      .select(`
        *,
        unit:unit_id (
          id,
          property_id,
          unit_number,
          status,
          tenant_name,
          property:property_id (
            id,
            name,
            address
          )
        )
      `)
      .eq('estate_firm_id', effectiveFirmId);
    
    // If associate, only show their own listings
    if (currentUserRole === 'associate') {
      query = query.eq('created_by_staff_id', user.id);
      console.log('Associate filter: showing only listings created by staff ID:', user.id);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    
    console.log('Listings loaded:', data?.length);
    setListings(data || []);
    
    const active = data?.filter(l => l.status === 'pending' || l.status === 'approved').length || 0;
    const rented = data?.filter(l => l.status === 'rented' && !l.unit_id).length || 0;
    const converted = data?.filter(l => l.unit_id).length || 0;
    setStats({ active, rented, converted, total: data?.length || 0 });
  } catch (error) {
    console.error('Error loading listings:', error);
  } finally {
    setLoading(false);
  }
};

  // Mark listing as rented directly
  const handleMarkAsRented = async (listing) => {
    setListingToMark(listing);
    setShowMarkRentedModal(true);
  };

  const confirmMarkAsRented = async () => {
    if (!listingToMark) return;
    
    setMarkingAsRented(true);
    try {
      // Update listing status to 'rented'
      const { error } = await supabase
        .from('listings')
        .update({
          status: 'rented',
          rented_at: new Date().toISOString(),
          rented_by: user.id
        })
        .eq('id', listingToMark.id);
      
      if (error) throw error;

      // Send notification to tenant (if there's a tenant in the chat)
      const { data: chats } = await supabase
        .from('chats')
        .select('participant2_id')
        .eq('listing_id', listingToMark.id)
        .eq('chat_type', 'tenant_estate_firm')
        .maybeSingle();
      
      if (chats?.participant2_id) {
        await supabase.from('notifications').insert({
          user_id: chats.participant2_id,
          type: 'listing_rented',
          title: 'Property Rented!',
          message: `The property "${listingToMark.title}" has been rented. You will receive lease details shortly.`,
          link: '/dashboard/tenant/leases',
          created_at: new Date().toISOString()
        });
      }

      alert('Property marked as rented successfully!');
      setShowMarkRentedModal(false);
      setListingToMark(null);
      loadListings();
      
    } catch (error) {
      console.error('Error marking as rented:', error);
      alert('Failed to mark as rented. Please try again.');
    } finally {
      setMarkingAsRented(false);
    }
  };

  const handleConvertClick = (listing, e) => {
    if (e) e.stopPropagation();
    setSelectedListing(listing);
    setShowConvertModal(true);
  };

  const handleCardClick = (listing) => {
    if (listing.status === 'rented' && !listing.unit_id) {
      handleConvertClick(listing);
    } else if (listing.unit_id) {
      navigate(`/dashboard/estate-firm/properties/${listing.unit?.property_id}`);
    } else {
      window.open(`/listings/${listing.id}`, '_blank');
    }
  };

  const getStatusBadge = (listing) => {
    if (listing.unit_id) return <span className="status-badge converted">✅ Converted</span>;
    if (listing.status === 'rented') return <span className="status-badge rented">🏠 Rented - Convert Now</span>;
    if (listing.status === 'pending' || listing.status === 'approved') return <span className="status-badge active">📢 Active</span>;
    return <span className="status-badge">{listing.status}</span>;
  };

  const formatPrice = (price) => `₦${(price || 0).toLocaleString()}`;
  const formatDate = (date) => new Date(date).toLocaleDateString();

  // Filter listings based on active tab and search
  useEffect(() => {
    let filtered = [...listings];
    if (activeTab === 'active') {
      filtered = filtered.filter(l => l.status === 'pending' || l.status === 'approved');
    } else if (activeTab === 'rented') {
      filtered = filtered.filter(l => l.status === 'rented' && !l.unit_id);
    } else if (activeTab === 'converted') {
      filtered = filtered.filter(l => l.unit_id);
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(l => 
        l.title?.toLowerCase().includes(term) ||
        l.address?.toLowerCase().includes(term) ||
        l.city?.toLowerCase().includes(term)
      );
    }
    setFilteredListings(filtered);
  }, [listings, activeTab, searchTerm]);

  if (loading) return <RentEasyLoader message="Loading your Listings..." fullScreen />;

  return (
    <div className="estate-my-listings">
      {/* Role Banner for Associates */}
      {userRole === 'associate' && (
        <div className="role-banner">
          <span>🤝 Associate View - You can only see listings you created</span>
        </div>
      )}

      {/* Header */}
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('/dashboard/estate-firm')}>
          <ArrowLeft size={20} /> Back to Dashboard
        </button>
        <div className="header-content">
          <div>
            <h1>My RentEasy Listings</h1>
            <p className="subtitle">Manage and convert your marketplace listings</p>
          </div>
          <button className="btn btn-primary" onClick={handleAddProperty}>
            <PlusCircle size={18} /> New Listing
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card" onClick={() => setActiveTab('active')}>
          <div className="stat-icon active"><Tag size={24} /></div>
          <div className="stat-details">
            <span className="stat-value">{stats.active}</span>
            <span className="stat-label">Active Listings</span>
          </div>
        </div>
        <div className="stat-card" onClick={() => setActiveTab('rented')}>
          <div className="stat-icon warning"><Clock size={24} /></div>
          <div className="stat-details">
            <span className="stat-value">{stats.rented}</span>
            <span className="stat-label">Need Conversion</span>
          </div>
        </div>
        <div className="stat-card" onClick={() => setActiveTab('converted')}>
          <div className="stat-icon success"><CheckCircle size={24} /></div>
          <div className="stat-details">
            <span className="stat-value">{stats.converted}</span>
            <span className="stat-label">Converted</span>
          </div>
        </div>
        <div className="stat-card" onClick={() => setActiveTab('all')}>
          <div className="stat-icon total"><Home size={24} /></div>
          <div className="stat-details">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total Listings</span>
          </div>
        </div>
      </div>

      {/* Tabs and Search */}
      <div className="listings-controls">
        <div className="tabs">
          <button className={`tab ${activeTab === 'active' ? 'active' : ''}`} onClick={() => setActiveTab('active')}>Active ({stats.active})</button>
          <button className={`tab ${activeTab === 'rented' ? 'active' : ''}`} onClick={() => setActiveTab('rented')}>Need Conversion ({stats.rented})</button>
          <button className={`tab ${activeTab === 'converted' ? 'active' : ''}`} onClick={() => setActiveTab('converted')}>Converted ({stats.converted})</button>
          <button className={`tab ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>All ({stats.total})</button>
        </div>
        <div className="search-box">
          <Search size={18} />
          <input type="text" placeholder="Search listings by title or location..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      {/* Listings Grid */}
      {filteredListings.length === 0 ? (
        <div className="empty-state">
          <Tag size={48} />
          <h3>No listings found</h3>
          <p>{activeTab === 'rented' ? 'No rented listings waiting for conversion' : activeTab === 'active' ? 'No active listings. Create your first RentEasy listing!' : 'No listings match your criteria'}</p>
          {(activeTab === 'active' || activeTab === 'all') && (
            <button className="btn btn-primary" onClick={handleAddProperty}>
              <PlusCircle size={18} /> Create New Listing
            </button>
          )}
        </div>
      ) : (
        <div className="listings-grid">
          {filteredListings.map(listing => (
            <div 
              key={listing.id} 
              className={`listing-card ${listing.status === 'rented' && !listing.unit_id ? 'convertible' : ''}`}
              onClick={() => handleCardClick(listing)}
            >
              <div className="listing-image">
                {listing.images?.[0] ? (
                  <img src={listing.images[0]} alt={listing.title} />
                ) : (
                  <div className="image-placeholder"><Home size={32} /></div>
                )}
                {getStatusBadge(listing)}
                {listing.status === 'rented' && !listing.unit_id && (
                  <div className="convert-badge">Click to Convert</div>
                )}
                {listing.status === 'approved' && (
                  <button 
                    className="mark-rented-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkAsRented(listing);
                    }}
                    title="Mark as Rented"
                  >
                    <HomeIcon size={14} /> Mark Rented
                  </button>
                )}
              </div>

              <div className="listing-content">
                <h3 className="listing-title">{listing.title || 'Untitled'}</h3>
                <div className="listing-details">
                  <div className="detail"><DollarSign size={14} /><span>{formatPrice(listing.price)}/year</span></div>
                  <div className="detail"><MapPin size={14} /><span>{listing.city || listing.state || 'Location not set'}</span></div>
                  <div className="detail"><Calendar size={14} /><span>Posted {formatDate(listing.created_at)}</span></div>
                </div>

                {/* Show created by for executives/principals to see which associate created it */}
                {userRole !== 'associate' && listing.created_by_staff_id && (
                  <div className="created-by-info">
                    <User size={12} />
                    <span>Created by: {listing.created_by_name || 'Staff'}</span>
                  </div>
                )}

                {/* Conversion Actions for rented listings */}
                {listing.status === 'rented' && !listing.unit_id && (
                  <div className="conversion-actions">
                    <button 
                      className="btn-convert" 
                      onClick={(e) => handleConvertClick(listing, e)}
                    >
                      <Upload size={16} /> Convert to Unit
                    </button>
                    <p className="convert-hint">This listing is rented. Click to add to your portfolio.</p>
                  </div>
                )}

                {/* Mark as Rented button for active listings (estate firm only) */}
                {listing.status === 'approved' && (
                  <div className="mark-rented-actions">
                    <button 
                      className="btn-mark-rented" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsRented(listing);
                      }}
                    >
                      <HomeIcon size={16} /> Mark as Rented
                    </button>
                    <p className="mark-hint">Mark when property is rented</p>
                  </div>
                )}

                {listing.unit_id && (
                  <div className="unit-info">
                    <CheckCircle size={16} className="text-success" />
                    <span>Converted to unit in {listing.unit?.property?.name || 'property'}</span>
                    <button 
                      className="btn-view-unit" 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/dashboard/estate-firm/properties/${listing.unit?.property_id}`);
                      }}
                    >
                      <Eye size={14} /> View Unit
                    </button>
                  </div>
                )}

                {/* Footer */}
                <div className="listing-footer">
                  <button 
                    className="btn-view" 
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(`/listings/${listing.id}`, '_blank');
                    }}
                  >
                    <Eye size={14} /> View Listing
                  </button>
                  {!listing.unit_id && listing.status !== 'rented' && listing.status !== 'approved' && (
                    <button 
                      className="btn-edit"
                      onClick={(e) => {
                        e.stopPropagation();
                        setListingToEdit(listing);
                        setShowEditModal(true);
                      }}
                    >
                      Edit
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mark as Rented Confirmation Modal */}
      {showMarkRentedModal && listingToMark && (
        <div className="modal-overlay" onClick={() => setShowMarkRentedModal(false)}>
          <div className="mark-rented-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Mark as Rented</h2>
              <button className="close-btn" onClick={() => setShowMarkRentedModal(false)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div className="listing-preview">
                <h3>{listingToMark.title}</h3>
                <p>{listingToMark.address}</p>
                <div className="price">{formatPrice(listingToMark.price)}/year</div>
              </div>
              <div className="warning-message">
                <AlertCircle size={20} />
                <p>Marking this listing as rented will remove it from the marketplace. You will need to convert it to a unit to add tenant details.</p>
              </div>
              <div className="confirmation-actions">
                <button className="btn-secondary" onClick={() => setShowMarkRentedModal(false)}>Cancel</button>
                <button className="btn-primary" onClick={confirmMarkAsRented} disabled={markingAsRented}>
                  {markingAsRented ? 'Marking...' : 'Confirm Mark as Rented'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Convert Modal */}
      {showConvertModal && selectedListing && (
        <ConvertListingModal
          listing={selectedListing}
          estateFirmId={estateFirmId}
          onClose={() => { setShowConvertModal(false); setSelectedListing(null); }}
          onSuccess={() => { 
            loadListings(); 
            setShowConvertModal(false); 
            setSelectedListing(null); 
          }}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && listingToEdit && (
        <ListingModal
          mode="edit"
          existingListing={listingToEdit}
          estateFirmId={estateFirmId}
          onClose={() => { setShowEditModal(false); setListingToEdit(null); }}
          onSuccess={() => {
            loadListings();
            setShowEditModal(false);
            setListingToEdit(null);
          }}
        />
      )}
    </div>
  );
};

export default EstateMyListings;