// src/modules/dashboard/pages/landlord/LandlordProperties.jsx (corrected)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../shared/context/AuthContext';
import { supabase } from '../../../../shared/lib/supabaseClient';
import RentEasyLoader from '../../../../shared/components/RentEasyLoader';
import {
  PlusCircle, Edit3, Eye, Send, Home, Building,
  DollarSign, MapPin, Calendar, AlertCircle, X,
  CheckCircle, Clock, Bell, Trash2, RefreshCw,
  FileText, Users, Mail
} from 'lucide-react';
import './LandlordProperties.css';

const LandlordProperties = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState([]);
  const [externalProperties, setExternalProperties] = useState([]);
  const [activeTab, setActiveTab] = useState('renteasy');
  const [showAddExternalModal, setShowAddExternalModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [reminderMessage, setReminderMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState(null);

  // External property form state
  const [externalForm, setExternalForm] = useState({
    title: '',
    address: '',
    price: '',
    bedrooms: 1,
    bathrooms: 1,
    property_type: 'apartment',
    description: '',
    status: 'vacant'
  });

  useEffect(() => {
    if (user) fetchProperties();
  }, [user]);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      // Simple query without embedding tenant details
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('user_id', user.id)
        .eq('poster_role', 'landlord')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Separate RentEasy listings (is_external = false) and external (is_external = true)
      const renteasy = (data || []).filter(p => !p.is_external);
      const external = (data || []).filter(p => p.is_external === true);
      setProperties(renteasy);
      setExternalProperties(external);
    } catch (err) {
      console.error('Error fetching properties:', err);
      setError('Failed to load properties. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddExternalProperty = async (e) => {
    e.preventDefault();
    setAdding(true);
    try {
      const newProperty = {
        user_id: user.id,
        poster_role: 'landlord',
        is_external: true,
        title: externalForm.title,
        address: externalForm.address,
        price: parseFloat(externalForm.price),
        bedrooms: parseInt(externalForm.bedrooms),
        bathrooms: parseInt(externalForm.bathrooms),
        property_type: externalForm.property_type,
        description: externalForm.description,
        status: externalForm.status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('listings')
        .insert([newProperty])
        .select()
        .single();

      if (error) throw error;

      setExternalProperties(prev => [data, ...prev]);
      setShowAddExternalModal(false);
      setExternalForm({
        title: '',
        address: '',
        price: '',
        bedrooms: 1,
        bathrooms: 1,
        property_type: 'apartment',
        description: '',
        status: 'vacant'
      });
    } catch (err) {
      console.error('Error adding property:', err);
      alert('Failed to add property. Please try again.');
    } finally {
      setAdding(false);
    }
  };

  const sendRentReminder = async () => {
    if (!selectedProperty || !reminderMessage.trim()) return;
    setSending(true);
    try {
      // Insert notification for the tenant
      const { error } = await supabase
        .from('landlord_notifications')
        .insert({
          landlord_id: user.id,
          tenant_id: selectedProperty.tenant_id,
          title: `Rent Reminder for ${selectedProperty.title}`,
          message: reminderMessage,
          type: 'rent_reminder',
          created_at: new Date().toISOString(),
          metadata: { property_id: selectedProperty.id, due_date: new Date().toISOString() }
        });

      if (error) throw error;

      alert('Reminder sent successfully!');
      setShowReminderModal(false);
      setReminderMessage('');
      setSelectedProperty(null);
    } catch (err) {
      console.error('Error sending reminder:', err);
      alert('Failed to send reminder. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const openReminderModal = async (property) => {
    setSelectedProperty(property);
    if (property.tenant_id) {
      // Fetch tenant details on demand
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, email, phone')
        .eq('id', property.tenant_id)
        .single();
      if (!error && data) {
        setSelectedProperty({ ...property, tenant: data });
      }
    }
    setShowReminderModal(true);
  };

  const formatCurrency = (amount) => `₦${Number(amount || 0).toLocaleString('en-NG')}`;
  const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString() : '';

  const getStatusBadge = (status) => {
    const config = {
      'vacant': { label: 'Vacant', color: '#10b981', icon: <CheckCircle size={12} /> },
      'rented': { label: 'Rented', color: '#3b82f6', icon: <Home size={12} /> },
      'pending': { label: 'Pending', color: '#f59e0b', icon: <Clock size={12} /> }
    };
    const s = config[status] || { label: status, color: '#6b7280', icon: null };
    return (
      <span className="status-badge" style={{ backgroundColor: `${s.color}15`, color: s.color }}>
        {s.icon} {s.label}
      </span>
    );
  };

  if (loading) {
    return <RentEasyLoader message="Loading your Properties..." fullScreen />;
  }

  const currentProperties = activeTab === 'renteasy' ? properties : externalProperties;
  const hasProperties = currentProperties.length > 0;

  return (
    <div className="landlord-properties">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>My Properties</h1>
          <p>Manage your properties and send rent reminders</p>
        </div>
        <div className="header-actions">
          <button className="btn-outline" onClick={fetchProperties}>
            <RefreshCw size={16} /> Refresh
          </button>
          <button className="btn-primary" onClick={() => setShowAddExternalModal(true)}>
            <PlusCircle size={16} /> Add External Property
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'renteasy' ? 'active' : ''}`}
          onClick={() => setActiveTab('renteasy')}
        >
          <Building size={16} /> RentEasy Listings ({properties.length})
        </button>
        <button
          className={`tab ${activeTab === 'external' ? 'active' : ''}`}
          onClick={() => setActiveTab('external')}
        >
          <Home size={16} /> External Properties ({externalProperties.length})
        </button>
      </div>

      {error && (
        <div className="error-banner">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button onClick={fetchProperties}>Retry</button>
        </div>
      )}

      {!hasProperties ? (
        <div className="empty-state">
          {activeTab === 'renteasy' ? (
            <>
              <Building size={48} />
              <h3>No RentEasy listings yet</h3>
              <p>Post your first property to start earning commission.</p>
              <button className="btn-primary" onClick={() => navigate('/post-property')}>
                Post Property
              </button>
            </>
          ) : (
            <>
              <Home size={48} />
              <h3>No external properties</h3>
              <p>Add properties you manage offline to keep track.</p>
              <button className="btn-primary" onClick={() => setShowAddExternalModal(true)}>
                Add External Property
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="properties-grid">
          {currentProperties.map(property => (
            <div key={property.id} className="property-card">
              <div className="card-header">
                <div className="card-title">
                  <h3>{property.title}</h3>
                  {getStatusBadge(property.status)}
                </div>
                <div className="card-price">
                  <span>Annual Rent</span>
                  <strong>{formatCurrency(property.price)}</strong>
                </div>
              </div>
              <div className="card-details">
                <div className="detail-row">
                  <MapPin size={14} />
                  <span>{property.address}</span>
                </div>
                <div className="detail-row">
                  <Calendar size={14} />
                  <span>Listed: {formatDate(property.created_at)}</span>
                </div>
                <div className="detail-row">
                  <DollarSign size={14} />
                  <span>Your Commission: {formatCurrency(property.price * 0.015)} (1.5%)</span>
                </div>
              </div>
              <div className="card-actions">
                <button
                  className="btn-icon"
                  onClick={() => navigate(`/dashboard/landlord/properties/${property.id}`)}
                  title="View Details"
                >
                  <Eye size={18} />
                </button>
                <button
                  className="btn-icon"
                  onClick={() => navigate(`/dashboard/landlord/properties/${property.id}/edit`)}
                  title="Edit"
                >
                  <Edit3 size={18} />
                </button>
                {property.status === 'rented' && property.tenant_id && (
                  <button
                    className="btn-icon send-reminder"
                    onClick={() => openReminderModal(property)}
                    title="Send Rent Reminder"
                  >
                    <Bell size={18} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add External Property Modal – unchanged */}
      {showAddExternalModal && (
        <div className="modal-overlay" onClick={() => setShowAddExternalModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add External Property</h2>
              <button className="close-btn" onClick={() => setShowAddExternalModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddExternalProperty}>
              {/* ... form fields same as before ... */}
            </form>
          </div>
        </div>
      )}

      {/* Send Rent Reminder Modal – unchanged */}
      {showReminderModal && selectedProperty && (
        <div className="modal-overlay" onClick={() => setShowReminderModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Send Rent Reminder</h2>
              <button className="close-btn" onClick={() => setShowReminderModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="reminder-info">
              <p><strong>Property:</strong> {selectedProperty.title}</p>
              <p><strong>Tenant:</strong> {selectedProperty.tenant?.full_name || selectedProperty.tenant?.email || 'Unknown'}</p>
            </div>
            <div className="form-group">
              <label>Message</label>
              <textarea
                rows="4"
                value={reminderMessage}
                onChange={e => setReminderMessage(e.target.value)}
                placeholder="e.g., Dear tenant, rent for this month is due on the 5th. Please ensure prompt payment."
                required
              />
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-secondary" onClick={() => setShowReminderModal(false)}>
                Cancel
              </button>
              <button type="button" className="btn-primary" onClick={sendRentReminder} disabled={sending}>
                {sending ? 'Sending...' : 'Send Reminder'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandlordProperties;