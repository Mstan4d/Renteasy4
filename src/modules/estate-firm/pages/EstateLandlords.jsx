import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import RentEasyLoader from '../../../shared/components/RentEasyLoader';
import { supabase } from '../../../shared/lib/supabaseClient';
import {
  Building, Users, Plus, Edit, Trash2, Search,
  Mail, Phone, Banknote, UserCheck, UserX,
  ChevronRight, X, Save, Eye, Home
} from 'lucide-react';
import './EstateLandlords.css';

const EstateLandlords = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [estateFirmId, setEstateFirmId] = useState(null);
  const [landlords, setLandlords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingLandlord, setEditingLandlord] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    bank_name: '',
    account_number: '',
    account_name: '',
    notes: '',
    has_renteasy_account: false,
    renteasy_user_id: null
  });
  
  // Search for RentEasy users
  const [searchUsers, setSearchUsers] = useState([]);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');

  // Get estate firm profile ID
  useEffect(() => {
    const getEstateFirmId = async () => {
      const { data } = await supabase
        .from('estate_firm_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      if (data) {
        setEstateFirmId(data.id);
      }
    };
    getEstateFirmId();
  }, [user]);

  // Load landlords
  useEffect(() => {
    if (estateFirmId) {
      loadLandlords();
    }
  }, [estateFirmId]);

  // Inside EstateLandlords.jsx, replace the loadLandlords function:

const loadLandlords = async () => {
  setLoading(true);
  try {
    // 1. Fetch all landlords for this estate firm
    const { data: landlordsData, error } = await supabase
      .from('estate_landlords')
      .select('*')
      .eq('estate_firm_id', estateFirmId)
      .order('name');

    if (error) throw error;

    // 2. If we have landlords, fetch property counts for each
    let landlordsWithCounts = landlordsData || [];
    if (landlordsData && landlordsData.length > 0) {
      const landlordIds = landlordsData.map(l => l.id);

      // Fetch properties that belong to these landlords
      const { data: properties } = await supabase
        .from('properties')
        .select('landlord_id')
        .eq('estate_firm_id', estateFirmId)
        .in('landlord_id', landlordIds);

      // Count properties per landlord
      const counts = {};
      (properties || []).forEach(p => {
        counts[p.landlord_id] = (counts[p.landlord_id] || 0) + 1;
      });

      // Attach count to each landlord
      landlordsWithCounts = landlordsData.map(l => ({
        ...l,
        property_count: counts[l.id] || 0
      }));
    }

    setLandlords(landlordsWithCounts);
  } catch (error) {
    console.error('Error loading landlords:', error);
  } finally {
    setLoading(false);
  }
};

  const searchRentEasyUsers = async (term) => {
    if (!term.trim()) return;
    
    setSearchingUsers(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, phone, avatar_url')
        .eq('role', 'landlord')
        .or(`full_name.ilike.%${term}%,email.ilike.%${term}%,phone.ilike.%${term}%`)
        .limit(10);

      if (error) throw error;
      setSearchUsers(data || []);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setSearchingUsers(false);
    }
  };

  const handleAddLandlord = () => {
    setEditingLandlord(null);
    setFormData({
      name: '',
      phone: '',
      email: '',
      bank_name: '',
      account_number: '',
      account_name: '',
      notes: '',
      has_renteasy_account: false,
      renteasy_user_id: null
    });
    setSearchUsers([]);
    setUserSearchTerm('');
    setShowModal(true);
  };

  const handleEditLandlord = (landlord) => {
    setEditingLandlord(landlord);
    setFormData({
      name: landlord.name || '',
      phone: landlord.phone || '',
      email: landlord.email || '',
      bank_name: landlord.bank_details?.bank_name || '',
      account_number: landlord.bank_details?.account_number || '',
      account_name: landlord.bank_details?.account_name || '',
      notes: landlord.notes || '',
      has_renteasy_account: landlord.has_renteasy_account || false,
      renteasy_user_id: landlord.renteasy_user_id || null
    });
    setShowModal(true);
  };

  const handleDeleteLandlord = async (landlordId) => {
    if (!window.confirm('Are you sure? This will unlink all properties owned by this landlord.')) return;
    
    try {
      const { error } = await supabase
        .from('estate_landlords')
        .delete()
        .eq('id', landlordId)
        .eq('estate_firm_id', estateFirmId);

      if (error) throw error;
      loadLandlords();
    } catch (error) {
      console.error('Error deleting landlord:', error);
      alert('Failed to delete landlord');
    }
  };

  const handleSelectUser = (user) => {
    setFormData({
      ...formData,
      name: user.full_name || formData.name,
      email: user.email || formData.email,
      phone: user.phone || formData.phone,
      has_renteasy_account: true,
      renteasy_user_id: user.id
    });
    setSearchUsers([]);
    setUserSearchTerm('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Name is required');
      return;
    }

    try {
      const landlordData = {
        estate_firm_id: estateFirmId,
        name: formData.name,
        phone: formData.phone || null,
        email: formData.email || null,
        bank_details: {
          bank_name: formData.bank_name,
          account_number: formData.account_number,
          account_name: formData.account_name
        },
        notes: formData.notes || null,
        has_renteasy_account: formData.has_renteasy_account,
        renteasy_user_id: formData.renteasy_user_id
      };

      let error;
      
      if (editingLandlord) {
        // Update
        const { error: updateError } = await supabase
          .from('estate_landlords')
          .update(landlordData)
          .eq('id', editingLandlord.id)
          .eq('estate_firm_id', estateFirmId);
        error = updateError;
      } else {
        // Insert
        const { error: insertError } = await supabase
          .from('estate_landlords')
          .insert([landlordData]);
        error = insertError;
      }

      if (error) throw error;

      setShowModal(false);
      loadLandlords();
    } catch (error) {
      console.error('Error saving landlord:', error);
      alert('Failed to save landlord');
    }
  };

  const filteredLandlords = landlords.filter(l => 
    l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.phone?.includes(searchTerm)
  );

  
   if (loading) {
  return <RentEasyLoader message="Loading your clients..." fullScreen />;
}

  return (
    <div className="estate-landlords">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Landlords</h1>
          <p className="subtitle">Manage property owners you work with</p>
        </div>
        
        <button className="btn btn-primary" onClick={handleAddLandlord}>
          <Plus size={18} />
          Add Landlord
        </button>
      </div>

      {/* Search Bar */}
      <div className="search-bar">
        <Search size={18} />
        <input
          type="text"
          placeholder="Search landlords by name, email, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Landlords Grid */}
      {filteredLandlords.length === 0 ? (
        <div className="empty-state">
          <Building size={48} />
          <h3>No landlords yet</h3>
          <p>Add your first landlord to get started</p>
          <button className="btn btn-primary" onClick={handleAddLandlord}>
            <Plus size={18} />
            Add Landlord
          </button>
        </div>
      ) : (
        <div className="landlords-grid">
          {filteredLandlords.map(landlord => (
            <div key={landlord.id} className="landlord-card">
              <div className="card-header">
                <div className="landlord-avatar">
                  {landlord.name.charAt(0).toUpperCase()}
                </div>
                <div className="landlord-info">
                  <h3>{landlord.name}</h3>
                  {landlord.has_renteasy_account ? (
                    <span className="badge renteasy">
                      <UserCheck size={12} /> RentEasy User
                    </span>
                  ) : (
                    <span className="badge manual">
                      <UserX size={12} /> Manual Contact
                    </span>
                  )}
                </div>
              </div>

              <div className="card-body">
                {landlord.email && (
                  <div className="detail">
                    <Mail size={14} />
                    <span>{landlord.email}</span>
                  </div>
                )}
                {landlord.phone && (
                  <div className="detail">
                    <Phone size={14} />
                    <span>{landlord.phone}</span>
                  </div>
                )}
                <div className="detail">
                  <Home size={14} />
                  <span>{landlord.property_count || 0} properties</span>
                </div>
                {landlord.bank_details?.bank_name && (
                  <div className="detail">
                    <Banknote size={14} />
                    <span>{landlord.bank_details.bank_name}</span>
                  </div>
                )}
              </div>

              <div className="card-footer">
                <button 
                  className="btn-icon"
                  onClick={() => navigate(`/dashboard/estate-firm/landlords/${landlord.id}`)}
                >
                  <Eye size={16} />
                </button>
                <button 
                  className="btn-icon"
                  onClick={() => handleEditLandlord(landlord)}
                >
                  <Edit size={16} />
                </button>
                <button 
                  className="btn-icon danger"
                  onClick={() => handleDeleteLandlord(landlord.id)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingLandlord ? 'Edit Landlord' : 'Add Landlord'}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {/* Search RentEasy Users */}
                <div className="search-user-section">
                  <label>Link to RentEasy Account (Optional)</label>
                  <div className="user-search-box">
                    <input
                      type="text"
                      placeholder="Search by name, email, or phone..."
                      value={userSearchTerm}
                      onChange={(e) => setUserSearchTerm(e.target.value)}
                    />
                    <button 
                      type="button"
                      onClick={() => searchRentEasyUsers(userSearchTerm)}
                      disabled={searchingUsers}
                    >
                      {searchingUsers ? 'Searching...' : 'Search'}
                    </button>
                  </div>

                  {searchUsers.length > 0 && (
                    <div className="search-results">
                      {searchUsers.map(user => (
                        <div 
                          key={user.id} 
                          className="user-result"
                          onClick={() => handleSelectUser(user)}
                        >
                          <div className="user-avatar">
                            {user.avatar_url ? (
                              <img src={user.avatar_url} alt={user.full_name} />
                            ) : (
                              <div className="avatar-placeholder">
                                {user.full_name?.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div className="user-info">
                            <strong>{user.full_name}</strong>
                            <small>{user.email} • {user.phone}</small>
                          </div>
                          <button type="button" className="select-btn">Select</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label>Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>

                <div className="form-section">
                  <h4>Bank Details (for payouts)</h4>
                  <div className="form-group">
                    <label>Bank Name</label>
                    <input
                      type="text"
                      value={formData.bank_name}
                      onChange={(e) => setFormData({...formData, bank_name: e.target.value})}
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Account Number</label>
                      <input
                        type="text"
                        value={formData.account_number}
                        onChange={(e) => setFormData({...formData, account_number: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Account Name</label>
                      <input
                        type="text"
                        value={formData.account_name}
                        onChange={(e) => setFormData({...formData, account_name: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label>Notes</label>
                  <textarea
                    rows="3"
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    placeholder="Any additional information about this landlord..."
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <Save size={16} />
                  {editingLandlord ? 'Update' : 'Save'} Landlord
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EstateLandlords;