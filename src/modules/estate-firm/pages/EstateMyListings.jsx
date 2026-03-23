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
  FileText, Upload
} from 'lucide-react';
import RentEasyLoader from '../../../shared/components/RentEasyLoader';
import ConvertListingModal from '../components/ConvertListingModal';
import ListingModal from '../components/ListingModal'; // new import
import './EstateMyListings.css';

const EstateMyListings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [estateFirmId, setEstateFirmId] = useState(null);
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active'); // 'active', 'rented', 'converted', 'all'
  const [searchTerm, setSearchTerm] = useState('');
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [converting, setConverting] = useState(false);
  
  // State for edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [listingToEdit, setListingToEdit] = useState(null);

  // Stats
  const [stats, setStats] = useState({
    active: 0,
    rented: 0,
    converted: 0,
    total: 0
  });

  // Helper to navigate to post property
  const handleAddProperty = () => {
    navigate('/post-property?type=estate-firm');
  };

  // Get estate firm profile ID
  useEffect(() => {
    const getEstateFirmId = async () => {
      const { data } = await supabase
        .from('estate_firm_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();
      if (data) setEstateFirmId(data.id);
    };
    getEstateFirmId();
  }, [user]);

  // Load listings
  useEffect(() => {
    if (estateFirmId) loadListings();
  }, [estateFirmId]);

  const loadListings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
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
        .eq('estate_firm_id', estateFirmId)
        .order('created_at', { ascending: false });

      if (error) throw error;
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

  const handleConvert = async () => {
    // ... existing convert logic (unchanged)
  };

  const getStatusBadge = (listing) => {
    if (listing.unit_id) return <span className="status-badge converted">Converted</span>;
    if (listing.status === 'rented') return <span className="status-badge rented">Rented - Needs Conversion</span>;
    if (listing.status === 'pending' || listing.status === 'approved') return <span className="status-badge active">Active</span>;
    return <span className="status-badge">{listing.status}</span>;
  };

  const formatPrice = (price) => `₦${(price || 0).toLocaleString()}`;
  const formatDate = (date) => new Date(date).toLocaleDateString();

  if (loading) return <RentEasyLoader message="Loading your Listings..." fullScreen />;

  return (
    <div className="estate-my-listings">
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
            <div key={listing.id} className="listing-card">
              <div className="listing-image">
                {listing.images?.[0] ? (
                  <img src={listing.images[0]} alt={listing.title} />
                ) : (
                  <div className="image-placeholder"><Home size={32} /></div>
                )}
                {getStatusBadge(listing)}
              </div>

              <div className="listing-content">
                <h3 className="listing-title">{listing.title || 'Untitled'}</h3>
                <div className="listing-details">
                  <div className="detail"><DollarSign size={14} /><span>{formatPrice(listing.price)}/year</span></div>
                  <div className="detail"><MapPin size={14} /><span>{listing.city || listing.state || 'Location not set'}</span></div>
                  <div className="detail"><Calendar size={14} /><span>Posted {formatDate(listing.created_at)}</span></div>
                </div>

                {/* Conversion Actions */}
                {listing.status === 'rented' && !listing.unit_id && (
                  <div className="conversion-actions">
                    <button className="btn-convert" onClick={() => { setSelectedListing(listing); setShowConvertModal(true); }}>
                      <Upload size={16} /> Convert to Unit
                    </button>
                    <p className="convert-hint">This listing is rented. Add it to your portfolio to start tracking payments.</p>
                  </div>
                )}

                {listing.unit_id && (
                  <div className="unit-info">
                    <CheckCircle size={16} className="text-success" />
                    <span>Converted to unit in {listing.unit?.property?.name || 'property'}</span>
                    <button className="btn-view-unit" onClick={() => navigate(`/dashboard/estate-firm/properties/${listing.unit?.property_id}`)}>
                      <Eye size={14} /> View Unit
                    </button>
                  </div>
                )}

                {/* Footer */}
                <div className="listing-footer">
                  <button className="btn-view" onClick={() => navigate(`/listings/${listing.id}`)}>
                    <Eye size={14} /> View Listing
                  </button>
                  {!listing.unit_id && listing.status !== 'rented' && (
                    <button 
                      className="btn-edit"
                      onClick={() => {
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

      {/* Convert Modal */}
      {showConvertModal && selectedListing && (
        <ConvertListingModal
          listing={selectedListing}
          estateFirmId={estateFirmId}
          onClose={() => { setShowConvertModal(false); setSelectedListing(null); }}
          onSuccess={() => { loadListings(); setShowConvertModal(false); setSelectedListing(null); }}
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
            loadListings(); // refresh after edit
            setShowEditModal(false);
            setListingToEdit(null);
          }}
        />
      )}
    </div>
  );
};

export default EstateMyListings;