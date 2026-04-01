// src/modules/estate-firm/pages/PropertyDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../shared/lib/supabaseClient';
import { documentGenerator } from '../../../shared/lib/documentGenerator';
import UnitModal from '../components/UnitModal';
import PropertyRentSummary from '../components/PropertyRentSummary';
import RentEasyLoader from '../../../shared/components/RentEasyLoader';
import {
  Building, ArrowLeft, Home, Users, DollarSign, Calendar,
  Plus, Edit, Trash2, Eye, Download, Send, Clock,
  CheckCircle, XCircle, AlertCircle, MapPin, Phone, Mail,
  FileText, Receipt, Zap, Bell, User, UserPlus, Search, X, Shield
} from 'lucide-react';
import './PropertyDetail.css';

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [property, setProperty] = useState(null);
  const [units, setUnits] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [showTenantModal, setShowTenantModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [selectedUnitForTenant, setSelectedUnitForTenant] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    description: '',
  });

  // Role-based state
  const [userRole, setUserRole] = useState('principal');
  const [canEdit, setCanEdit] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);

  // Landlord search states
  const [showLandlordSearch, setShowLandlordSearch] = useState(false);
  const [landlordSearchTerm, setLandlordSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchingLandlords, setSearchingLandlords] = useState(false);
  const [linkingLandlordId, setLinkingLandlordId] = useState(null);
  const [searchError, setSearchError] = useState(null);
  const [showSendDocumentModal, setShowSendDocumentModal] = useState(false);
  const [selectedLandlordForDocument, setSelectedLandlordForDocument] = useState(null);
  const [documentType, setDocumentType] = useState('lease_agreement');
  const [documentMessage, setDocumentMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sendingError, setSendingError] = useState(null);

  // Get user role
  // Replace the role permission logic (around line 66-86)
useEffect(() => {
  const getUserRole = async () => {
    if (!user) return;
    try {
      const { data: roleData, error } = await supabase
        .from('estate_firm_profiles')
        .select('staff_role')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (!error && roleData) {
        const role = roleData.staff_role || 'principal';
        setUserRole(role);
        // Associates can now edit their own properties
        setCanEdit(role === 'principal' || role === 'executive' || role === 'associate');
      }
      
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) {
        setCurrentUserId(userData.user.id);
      }
    } catch (err) {
      console.warn('Could not fetch user role:', err);
      setCanEdit(true);
    }
  };
  getUserRole();
}, [user]);

  useEffect(() => {
    if (!user) return;
    loadProperty();
  }, [id, user]);

  const loadProperty = async () => {
    setLoading(true);
    try {
      // Get effective firm ID and role first
      let effectiveFirmId = null;
      let isAssociate = userRole === 'associate';
      
      // 1. Fetch property
      const { data: prop, error: propError } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single();
      if (propError) throw propError;
      if (!prop) throw new Error('Property not found');
      
      // Check if associate has access to this property
      if (isAssociate && currentUserId) {
        const { data: checkAccess } = await supabase
          .from('properties')
          .select('id')
          .eq('id', id)
          .eq('created_by_staff_id', currentUserId)
          .single();
        
        if (!checkAccess) {
          throw new Error('You do not have access to this property');
        }
      }

      // 2. Fetch landlord if landlord_id exists
      let landlord = null;
      if (prop.landlord_id) {
        const { data: landlordData, error: landlordError } = await supabase
          .from('estate_landlords')
          .select('*')
          .eq('id', prop.landlord_id)
          .single();
        if (!landlordError && landlordData) {
          landlord = landlordData;
        }
      }

      // Attach landlord to property object
      const propertyWithLandlord = { ...prop, landlord };

      // 3. Fetch units with tenant info
      let unitsQuery = supabase
        .from('units')
        .select(`
          *,
          tenant:tenant_id (id, full_name, name, email, phone)
        `)
        .eq('property_id', id)
        .order('unit_number', { ascending: true });
      
      // If associate, only get their units
      if (isAssociate && currentUserId) {
        unitsQuery = unitsQuery.eq('created_by_staff_id', currentUserId);
      }
      
      const { data: unitsData, error: unitsError } = await unitsQuery;
      if (unitsError) throw unitsError;

      setProperty(propertyWithLandlord);
      setUnits(unitsData || []);

      // 4. Fetch recent activities
      const { data: activitiesData, error: actError } = await supabase
        .from('property_activities')
        .select(`
          *,
          unit:unit_id (unit_number),
          client:client_id (name)
        `)
        .eq('property_id', id)
        .order('created_at', { ascending: false })
        .limit(20);
      if (actError) throw actError;
      setActivities(activitiesData || []);

    } catch (err) {
      console.error('Error loading property:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Search landlords from estate_landlords (with role filtering)
  const searchLandlords = async () => {
    if (!landlordSearchTerm.trim()) return;
    
    setSearchingLandlords(true);
    setSearchError(null);
    
    try {
      // Search in estate_landlords table
      let query = supabase
        .from('estate_landlords')
        .select('*')
        .eq('estate_firm_id', property?.estate_firm_id)
        .or(`name.ilike.%${landlordSearchTerm}%,email.ilike.%${landlordSearchTerm}%,phone.ilike.%${landlordSearchTerm}%`)
        .limit(20);
      
      let landlords = [];
      const { data: allLandlords, error } = await query;
      if (error) throw error;
      
      // If associate, only show landlords from their properties
      if (userRole === 'associate' && currentUserId) {
        const { data: myProperties } = await supabase
          .from('properties')
          .select('landlord_id')
          .eq('estate_firm_id', property?.estate_firm_id)
          .eq('created_by_staff_id', currentUserId)
          .not('landlord_id', 'is', null);
        
        const myLandlordIds = [...new Set(myProperties?.map(p => p.landlord_id))];
        landlords = (allLandlords || []).filter(l => myLandlordIds.includes(l.id));
      } else {
        landlords = allLandlords || [];
      }
      
      // Get property counts
      const landlordIds = landlords.map(l => l.id);
      let propertyCountQuery = supabase
        .from('properties')
        .select('landlord_id')
        .in('landlord_id', landlordIds)
        .eq('estate_firm_id', property?.estate_firm_id);
      
      if (userRole === 'associate') {
        propertyCountQuery = propertyCountQuery.eq('created_by_staff_id', currentUserId);
      }
      
      const { data: properties } = await propertyCountQuery;
      
      const propertyCounts = {};
      properties?.forEach(p => {
        propertyCounts[p.landlord_id] = (propertyCounts[p.landlord_id] || 0) + 1;
      });
      
      const results = landlords.map(l => ({
        ...l,
        property_count: propertyCounts[l.id] || 0
      }));
      
      setSearchResults(results);
      
      if (results.length === 0) {
        setSearchError('No landlords found. You can only add landlords linked to your properties.');
      }
    } catch (error) {
      console.error('Error searching landlords:', error);
      setSearchError('Failed to search landlords. Please try again.');
    } finally {
      setSearchingLandlords(false);
    }
  };

  // Link landlord to property - Only Principal and Executive
  const linkLandlordToProperty = async (landlord) => {
    if (!canEdit) {
      alert('Only Principal and Executive can link landlords.');
      return;
    }
    
    setLinkingLandlordId(landlord.id);
    
    try {
      const { error } = await supabase
        .from('properties')
        .update({
          landlord_id: landlord.id
        })
        .eq('id', id);
      
      if (error) throw error;
      
      await loadProperty();
      setShowLandlordSearch(false);
      setLandlordSearchTerm('');
      setSearchResults([]);
      alert('Landlord linked successfully!');
    } catch (error) {
      console.error('Error linking landlord:', error);
      alert('Failed to link landlord. Please try again.');
    } finally {
      setLinkingLandlordId(null);
    }
  };

  // Send document to landlord - Only Principal and Executive
  const sendDocumentToLandlord = async () => {
    if (!canEdit) {
      alert('Only Principal and Executive can send documents.');
      return;
    }
    
    if (!selectedLandlordForDocument) return;
    
    setSending(true);
    setSendingError(null);
    
    try {
      const documentData = {
        estate_firm_id: property?.estate_firm_id,
        landlord_id: selectedLandlordForDocument.id,
        property_id: id,
        document_type: documentType,
        message: documentMessage,
        status: 'sent',
        sent_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      };
      
      const { data: document, error: docError } = await supabase
        .from('estate_documents')
        .insert(documentData)
        .select()
        .single();
      
      if (docError) throw docError;
      
      if (selectedLandlordForDocument.has_renteasy_account) {
        await supabase.from('notifications').insert({
          user_id: selectedLandlordForDocument.id,
          type: 'document_shared',
          title: 'New Document Shared',
          message: `A ${documentType.replace('_', ' ')} for ${property.title} has been shared with you.`,
          link: `/dashboard/documents/${document.id}`,
          created_at: new Date().toISOString()
        });
      }
      
      await supabase.from('property_activities').insert({
        property_id: id,
        activity_type: 'document_sent',
        description: `${documentType.replace('_', ' ')} sent to ${selectedLandlordForDocument.name}`,
        created_at: new Date().toISOString()
      });
      
      alert('Document sent successfully!');
      setShowSendDocumentModal(false);
      setDocumentType('lease_agreement');
      setDocumentMessage('');
    } catch (error) {
      console.error('Error sending document:', error);
      setSendingError('Failed to send document. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleSendDocumentToLandlord = (landlord) => {
    if (!canEdit) {
      alert('Only Principal and Executive can send documents.');
      return;
    }
    setSelectedLandlordForDocument(landlord);
    setShowSendDocumentModal(true);
  };

  const handleAddUnit = () => {
    if (!canEdit) {
      alert('Only Principal and Executive can add units.');
      return;
    }
    setEditingUnit(null);
    setShowUnitModal(true);
  };

  const handleEditUnit = (unit) => {
    if (!canEdit) {
      alert('Only Principal and Executive can edit units.');
      return;
    }
    setEditingUnit(unit);
    setShowUnitModal(true);
  };

  const handleAddTenant = (unit) => {
    if (!canEdit) {
      alert('Only Principal and Executive can add tenants.');
      return;
    }
    setSelectedUnitForTenant(unit);
    setShowTenantModal(true);
  };

  const handleUnitSaved = () => {
    loadProperty();
  };

  const handleTenantSaved = () => {
    loadProperty();
  };

  const handleDeleteUnit = async (unitId) => {
    if (!canEdit) {
      alert('Only Principal and Executive can delete units.');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this unit?')) return;
    try {
      const { error } = await supabase
        .from('units')
        .delete()
        .eq('id', unitId);
      if (error) throw error;
      await loadProperty();
    } catch (err) {
      console.error(err);
      alert('Failed to delete unit');
    }
  };

  const handleRemoveTenant = async (unit) => {
    if (!canEdit) {
      alert('Only Principal and Executive can remove tenants.');
      return;
    }
    if (!window.confirm(`Remove tenant from ${unit.unit_number}? The unit will become vacant.`)) return;

    try {
      const historyEntry = {
        tenant_name: unit.tenant?.name || unit.tenant_name,
        tenant_phone: unit.tenant?.phone || unit.tenant_phone,
        tenant_email: unit.tenant?.email || unit.tenant_email,
        tenant_id: unit.tenant_id,
        move_out: new Date().toISOString(),
        rent_amount: unit.rent_amount,
        rent_frequency: unit.rent_frequency
      };
      const currentHistory = unit.tenant_history || [];
      const updatedHistory = [...currentHistory, historyEntry];

      const { error } = await supabase
        .from('units')
        .update({
          tenant_id: null,
          tenant_name: null,
          tenant_phone: null,
          tenant_email: null,
          status: 'vacant',
          lease_end_date: new Date().toISOString().split('T')[0],
          tenant_history: updatedHistory
        })
        .eq('id', unit.id);

      if (error) throw error;

      await supabase.from('property_activities').insert({
        property_id: id,
        unit_id: unit.id,
        activity_type: 'tenant_removed',
        description: `Tenant removed from ${unit.unit_number}`,
        created_at: new Date().toISOString()
      });

      alert('Tenant removed successfully');
      loadProperty();
    } catch (err) {
      console.error(err);
      alert('Failed to remove tenant');
    }
  };

  const handleDeleteProperty = async () => {
    if (!canEdit) {
      alert('Only Principal can delete properties.');
      return;
    }
    if (!window.confirm('Delete this property and all its units? This action cannot be undone.')) return;
    try {
      await supabase.from('units').delete().eq('property_id', id);
      await supabase.from('properties').delete().eq('id', id);
      navigate('/dashboard/estate-firm/properties');
    } catch (err) {
      alert('Delete failed');
    }
  };

  const handleRecordPayment = (unit) => {
    setSelectedUnit(unit);
    setPaymentForm({
      amount: unit.rent_amount,
      paymentDate: new Date().toISOString().split('T')[0],
      dueDate: '',
      description: '',
    });
    setShowPaymentModal(true);
  };

  const submitPayment = async () => {
    if (!selectedUnit) return;
    try {
      const paymentReference = `PMT-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

      const { data: payment, error: payError } = await supabase
        .from('payments')
        .insert([{
          unit_id: selectedUnit.id,
          user_id: selectedUnit.tenant?.id,
          amount: parseFloat(paymentForm.amount),
          payment_date: paymentForm.paymentDate,
          due_date: paymentForm.dueDate || null,
          description: paymentForm.description,
          payment_type: 'rent',
          reference: paymentReference,
        }])
        .select()
        .single();
      if (payError) throw payError;

      const { data: fullPayment, error: fetchError } = await supabase
        .from('payments')
        .select(`
          *,
          unit:unit_id (
            id,
            unit_number,
            tenant:tenant_id (id, name),
            property:property_id (id, name, estate_firm_id)
          )
        `)
        .eq('id', payment.id)
        .single();
      if (fetchError) throw fetchError;

      const receiptDoc = await documentGenerator.generateReceipt(fullPayment);

      await supabase
        .from('payments')
        .update({ 
          receipt_url: receiptDoc.file_url, 
          receipt_doc_id: receiptDoc.id 
        })
        .eq('id', payment.id);

      if (selectedUnit.tenant?.id) {
        await supabase.from('notifications').insert({
          user_id: selectedUnit.tenant.id,
          type: 'receipt',
          title: 'New Rent Receipt',
          message: `Receipt for ₦${paymentForm.amount} payment on ${paymentForm.paymentDate} is ready.`,
          link: `/dashboard/tenant/documents/${receiptDoc.id}`,
          created_at: new Date().toISOString()
        });
      }

      if (selectedUnit.status !== 'occupied') {
        await supabase
          .from('units')
          .update({ status: 'occupied' })
          .eq('id', selectedUnit.id);
      }

      await supabase
        .from('property_activities')
        .insert([{
          property_id: id,
          unit_id: selectedUnit.id,
          activity_type: 'rent_paid',
          description: `Rent payment of ₦${paymentForm.amount} recorded`,
        }]);

      alert('Payment recorded and receipt generated');
      setShowPaymentModal(false);
      await loadProperty();
    } catch (err) {
      console.error(err);
      alert('Failed to record payment');
    }
  };

  const handleSendReminder = async (unit) => {
    if (!canEdit) {
      alert('Only Principal and Executive can send reminders.');
      return;
    }
    if (!window.confirm(`Send rent reminder for ${unit.unit_number}?`)) return;
    try {
      const { data: reminder, error: remError } = await supabase
        .from('reminders')
        .insert([{
          unit_id: unit.id,
          reminder_type: 'rent_due',
          scheduled_date: new Date().toISOString().split('T')[0],
        }])
        .select()
        .single();
      if (remError) throw remError;

      const doc = await documentGenerator.generateReminder(reminder, unit);

      await supabase
        .from('reminders')
        .update({ document_id: doc.id, sent: true, sent_at: new Date().toISOString() })
        .eq('id', reminder.id);

      if (unit.tenant?.id) {
        await supabase.from('notifications').insert({
          user_id: unit.tenant.id,
          type: 'rent_reminder',
          title: 'Rent Reminder',
          message: `Rent for ${unit.unit_number} is due on ${new Date(reminder.scheduled_date).toLocaleDateString()}.`,
          link: `/dashboard/tenant/documents/${doc.id}`,
          created_at: new Date().toISOString()
        });
      }

      await supabase
        .from('property_activities')
        .insert([{
          property_id: id,
          unit_id: unit.id,
          activity_type: 'reminder_sent',
          description: `Rent reminder sent for ${unit.unit_number}`,
        }]);

      alert('Reminder sent and letter generated');
      await loadProperty();
    } catch (err) {
      console.error(err);
      alert('Failed to send reminder');
    }
  };

  const formatCurrency = (amount) => `₦${(amount || 0).toLocaleString()}`;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'occupied':
        return <span className="badge occupied"><CheckCircle size={14} /> Occupied</span>;
      case 'vacant':
        return <span className="badge vacant"><Home size={14} /> Vacant</span>;
      case 'maintenance':
        return <span className="badge maintenance"><AlertCircle size={14} /> Maintenance</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  if (loading) {
    return <RentEasyLoader message="Loading property details..." fullScreen />;
  }

  if (error) {
    return (
      <div className="error-container">
        <AlertCircle size={48} />
        <h3>Error loading property</h3>
        <p>{error}</p>
        <button onClick={() => navigate('/dashboard/estate-firm')}>Back to Dashboard</button>
      </div>
    );
  }

  if (!property) {
    return <div>Property not found</div>;
  }

  return (
    <div className="property-detail">
      {/* Role Banner */}
      {userRole === 'associate' && (
        <div className="role-banner">
          <Shield size={16} />
          <span>Associate View - You can only view this property (read-only)</span>
        </div>
      )}
      
      {userRole === 'executive' && (
        <div className="role-banner executive">
          <Shield size={16} />
          <span>Executive View - You can manage this property</span>
        </div>
      )}

      <header className="property-header">
        <button className="back-button" onClick={() => navigate('/dashboard/estate-firm/properties')}>
          <ArrowLeft size={20} /> Back to Portfolio
        </button>
        <div className="property-title">
          <h1>{property.title}</h1>
          <span className="property-address"><MapPin size={16} /> {property.address}</span>
        </div>
       
<div className="property-actions">
  {canEdit && (
    <button className="btn-outline" onClick={() => navigate(`/dashboard/estate-firm/properties/${id}/edit`)}>
      <Edit size={16} /> Edit
    </button>
  )}
  {property.source === 'rent-easy' && (
    <button className="btn-outline" onClick={() => window.open(`/listings/${property.listing_id}`, '_blank')}>
      <Eye size={16} /> View Listing
    </button>
  )}
  {userRole === 'principal' && (
    <button className="btn-outline danger" onClick={handleDeleteProperty}>
      <Trash2 size={16} /> Delete
    </button>
  )}
</div>
      </header>

      {/* Rent Summary Component */}
      <PropertyRentSummary propertyId={id} />

      {/* Link to full rent tracking page */}
      <div className="rent-tracking-link">
        <button 
          className="btn-outline"
          onClick={() => navigate('/dashboard/estate-firm/rent-tracking')}
        >
          View All Rent Payments
        </button>
      </div>

      <div className="property-content">
        {/* Left column: Units */}
        <div className="units-section">
          <div className="section-header">
            <h2>Units ({units.length})</h2>
            {canEdit && (
              <button className="btn-primary" onClick={handleAddUnit}>
                <Plus size={16} /> Add Unit
              </button>
            )}
          </div>

          {units.length === 0 ? (
            <div className="empty-units">
              <Home size={48} />
              <p>No units added yet. Click "Add Unit" to create one.</p>
            </div>
          ) : (
            <div className="units-grid">
              {units.map(unit => (
                <div key={unit.id} className="unit-card">
                  <div className="unit-header">
                    <h3>{unit.unit_number}</h3>
                    {getStatusBadge(unit.status)}
                    {unit.tenant_id && (
                      <span className="tenant-badge">
                        <User size={12} /> {unit.tenant_name || 'Occupied'}
                      </span>
                    )}
                  </div>

                  <div className="unit-details">
                    <div className="detail-row">
                      <span className="label">Rent:</span>
                      <span className="value highlight">{formatCurrency(unit.rent_amount)}/{unit.rent_frequency}</span>
                    </div>
                    {unit.tenant_id || unit.tenant_name ? (
                      <>
                        <div className="detail-row">
                          <span className="label">Tenant:</span>
                          <span className="value">
                            {unit.tenant_name || unit.tenant?.name}
                            {unit.tenant_id && <span className="renteasy-badge"> (RentEasy User)</span>}
                          </span>
                        </div>
                        <div className="detail-row">
                          <span className="label">Phone:</span>
                          <span className="value">{unit.tenant_phone || unit.tenant?.phone || '—'}</span>
                        </div>
                      </>
                    ) : (
                      <div className="detail-row">
                        <span className="label">Tenant:</span>
                        <span className="value vacant-text">Vacant</span>
                      </div>
                    )}
                    <div className="detail-row">
                      <span className="label">Bedrooms:</span>
                      <span className="value">{unit.bedrooms}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Bathrooms:</span>
                      <span className="value">{unit.bathrooms}</span>
                    </div>
                  </div>

                  
<div className="unit-actions">
  {unit.tenant_id || unit.tenant_name ? (
    <>
      <button className="action-btn" onClick={() => handleRecordPayment(unit)}>
        <DollarSign size={14} /> Record Payment
      </button>
      {canEdit && (
        <button className="action-btn danger" onClick={() => handleRemoveTenant(unit)}>
          <XCircle size={14} /> Remove Tenant
        </button>
      )}
    </>
  ) : (
    canEdit && (
      <button className="action-btn" onClick={() => handleAddTenant(unit)}>
        <Users size={14} /> Add Tenant
      </button>
    )
  )}
  {canEdit && (
    <>
      <button className="action-btn" onClick={() => handleSendReminder(unit)}>
        <Bell size={14} /> Remind
      </button>
      <button className="action-btn" onClick={() => handleEditUnit(unit)}>
        <Edit size={14} />
      </button>
    </>
  )}
  {userRole === 'principal' && (
    <button className="action-btn danger" onClick={() => handleDeleteUnit(unit.id)}>
      <Trash2 size={14} />
    </button>
  )}
</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right sidebar - Landlord section (only show edit for canEdit) */}
        <div className="sidebar">
          <div className="landlord-card">
<div className="landlord-card-header">
  <h3>
    <Building size={18} />
    Landlord
  </h3>
  {canEdit && (
    property.landlord ? (
      <button 
        className="btn-link"
        onClick={() => setShowLandlordSearch(true)}
      >
        <Edit size={14} /> Change
      </button>
    ) : (
      <button 
        className="btn-link"
        onClick={() => setShowLandlordSearch(true)}
      >
        <UserPlus size={14} /> Add Landlord
      </button>
    )
  )}
</div>

            {property.landlord ? (
              <>
                <div className="landlord-name">
                  <strong>{property.landlord.name}</strong>
                  {property.landlord.has_renteasy_account && (
                    <span className="badge renteasy">RentEasy User</span>
                  )}
                </div>
                
                {property.landlord.phone && (
                  <div className="contact-item">
                    <Phone size={14} />
                    <span>{property.landlord.phone}</span>
                    <button 
                      className="icon-btn"
                      onClick={() => window.location.href = `tel:${property.landlord.phone}`}
                    >
                      Call
                    </button>
                  </div>
                )}
                
                {property.landlord.email && (
                  <div className="contact-item">
                    <Mail size={14} />
                    <span>{property.landlord.email}</span>
                    <button 
                      className="icon-btn"
                      onClick={() => window.location.href = `mailto:${property.landlord.email}`}
                    >
                      Email
                    </button>
                  </div>
                )}

                {property.landlord.bank_details?.bank_name && (
                  <div className="bank-details">
                    <strong>Bank Details:</strong>
                    <div className="bank-info">
                      <span>{property.landlord.bank_details.bank_name}</span>
                      <span>{property.landlord.bank_details.account_number}</span>
                      <span>{property.landlord.bank_details.account_name}</span>
                    </div>
                  </div>
                )}

                {property.landlord.notes && (
                  <div className="landlord-notes">
                    <strong>Notes:</strong>
                    <p>{property.landlord.notes}</p>
                  </div>
                )}

                <div className="landlord-actions">
                  {canEdit && (
                    <button 
                      className="btn-outline"
                      onClick={() => handleSendDocumentToLandlord(property.landlord)}
                    >
                      <Send size={14} /> Send Document
                    </button>
                  )}
                  <button 
                    className="btn-outline"
                    onClick={() => navigate(`/dashboard/estate-firm/landlords/${property.landlord.id}`)}
                  >
                    <Eye size={14} /> View Profile
                  </button>
                </div>
              </>
            ) : (
              <div className="no-landlord">
                <p>No landlord assigned to this property</p>
                {canEdit && (
                  <button 
                    className="btn-primary"
                    onClick={() => setShowLandlordSearch(true)}
                  >
                    <UserPlus size={16} />
                    Add Landlord
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Activity Card */}
          <div className="activity-card">
            <h3>Recent Activity</h3>
            {activities.length === 0 ? (
              <p className="empty">No recent activity</p>
            ) : (
              <div className="timeline">
                {activities.map(act => (
                  <div key={act.id} className="timeline-item">
                    <div className="timeline-icon">
                      {act.activity_type === 'rent_paid' && <DollarSign size={14} />}
                      {act.activity_type === 'reminder_sent' && <Bell size={14} />}
                      {act.activity_type === 'unit_added' && <Home size={14} />}
                      {act.activity_type === 'document_sent' && <FileText size={14} />}
                    </div>
                    <div className="timeline-content">
                      <p>{act.description}</p>
                      <small>{new Date(act.created_at).toLocaleString()}</small>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Stats Card */}
          <div className="stats-card">
            <h3>Quick Stats</h3>
            <div className="stat-row">
              <span>Occupied Units:</span>
              <span className="value">{units.filter(u => u.status === 'occupied').length}</span>
            </div>
            <div className="stat-row">
              <span>Vacant Units:</span>
              <span className="value">{units.filter(u => u.status === 'vacant').length}</span>
            </div>
            <div className="stat-row">
              <span>Annual Revenue:</span>
              <span className="value highlight">
                {formatCurrency(units.filter(u => u.status === 'occupied').reduce((sum, u) => sum + u.rent_amount, 0))}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Modals - same as before but with canEdit checks */}
      {showUnitModal && canEdit && (
        <UnitModal
          propertyId={id}
          unit={editingUnit}
          onClose={() => setShowUnitModal(false)}
          onSaved={handleUnitSaved}
          mode="full"
        />
      )}

      {showTenantModal && selectedUnitForTenant && canEdit && (
        <UnitModal
          propertyId={id}
          unit={selectedUnitForTenant}
          onClose={() => {
            setShowTenantModal(false);
            setSelectedUnitForTenant(null);
          }}
          onSaved={handleTenantSaved}
          mode="tenant-only"
        />
      )}

      {showPaymentModal && selectedUnit && (
        // Payment modal stays same - anyone can record payments
        <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Record Payment for {selectedUnit.unit_number}</h3>
              <button className="close-btn" onClick={() => setShowPaymentModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); submitPayment(); }}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Amount (₦)</label>
                  <input
                    type="number"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Payment Date</label>
                  <input
                    type="date"
                    value={paymentForm.paymentDate}
                    onChange={(e) => setPaymentForm({...paymentForm, paymentDate: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Due Date (optional)</label>
                  <input
                    type="date"
                    value={paymentForm.dueDate}
                    onChange={(e) => setPaymentForm({...paymentForm, dueDate: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <input
                    type="text"
                    value={paymentForm.description}
                    onChange={(e) => setPaymentForm({...paymentForm, description: e.target.value})}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowPaymentModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Record Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Landlord Search Modal - Only show if can edit */}
      {showLandlordSearch && canEdit && (
        <div className="modal-overlay" onClick={() => setShowLandlordSearch(false)}>
          <div className="landlord-search-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Link Landlord to {property.title}</h3>
              <button className="close-btn" onClick={() => setShowLandlordSearch(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="search-section">
                <div className="search-input-group">
                  <Search size={18} />
                  <input
                    type="text"
                    placeholder="Search by name, email, or phone..."
                    value={landlordSearchTerm}
                    onChange={(e) => setLandlordSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && searchLandlords()}
                  />
                  <button 
                    className="btn-search"
                    onClick={searchLandlords}
                    disabled={searchingLandlords}
                  >
                    {searchingLandlords ? 'Searching...' : 'Search'}
                  </button>
                </div>

                {searchResults.length > 0 && (
                  <div className="search-results">
                    <h4>Search Results</h4>
                    {searchResults.map(landlord => (
                      <div 
                        key={landlord.id} 
                        className={`landlord-result ${linkingLandlordId === landlord.id ? 'linking' : ''}`}
                        onClick={() => !linkingLandlordId && linkLandlordToProperty(landlord)}
                      >
                        <div className="landlord-result-avatar">
                          {landlord.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="landlord-result-info">
                          <div className="landlord-result-name">
                            {landlord.name}
                            {landlord.has_renteasy_account && (
                              <span className="badge renteasy-small">RentEasy</span>
                            )}
                          </div>
                          {landlord.email && (
                            <div className="landlord-result-email">
                              <Mail size={12} />
                              <span>{landlord.email}</span>
                            </div>
                          )}
                          {landlord.phone && (
                            <div className="landlord-result-phone">
                              <Phone size={12} />
                              <span>{landlord.phone}</span>
                            </div>
                          )}
                          {landlord.property_count !== undefined && (
                            <div className="landlord-result-stats">
                              <Building size={12} />
                              <span>{landlord.property_count} properties</span>
                            </div>
                          )}
                        </div>
                        <div className="landlord-result-action">
                          {linkingLandlordId === landlord.id ? (
                            <div className="spinner-small"></div>
                          ) : (
                            <button className="btn-link">Link</button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="create-new-section">
                  <p>Don't see the landlord?</p>
                  <button 
                    className="btn-outline"
                    onClick={() => {
                      setShowLandlordSearch(false);
                      navigate('/dashboard/estate-firm/landlords', { 
                        state: { action: 'add', propertyId: id, propertyName: property.title }
                      });
                    }}
                  >
                    <UserPlus size={14} /> Add New Landlord
                  </button>
                </div>

                {searchError && (
                  <div className="error-message">
                    <AlertCircle size={14} />
                    <span>{searchError}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Send Document Modal */}
      {showSendDocumentModal && selectedLandlordForDocument && canEdit && (
        <div className="modal-overlay" onClick={() => setShowSendDocumentModal(false)}>
          <div className="send-document-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Send Document to {selectedLandlordForDocument.name}</h3>
              <button className="close-btn" onClick={() => setShowSendDocumentModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Document Type</label>
                <select 
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                >
                  <option value="lease_agreement">Lease Agreement</option>
                  <option value="invoice">Invoice</option>
                  <option value="receipt">Receipt</option>
                  <option value="contract">Contract</option>
                  <option value="statement">Statement of Account</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Message (Optional)</label>
                <textarea
                  rows="3"
                  placeholder="Add a message to the landlord..."
                  value={documentMessage}
                  onChange={(e) => setDocumentMessage(e.target.value)}
                />
              </div>

              <div className="document-preview">
                <p className="preview-note">
                  <FileText size={14} />
                  The document will be generated and sent to {selectedLandlordForDocument.name}
                  {selectedLandlordForDocument.has_renteasy_account 
                    ? ' via RentEasy notification' 
                    : ' via email'}
                </p>
              </div>

              {sendingError && (
                <div className="error-message">
                  <AlertCircle size={14} />
                  <span>{sendingError}</span>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowSendDocumentModal(false)}>
                Cancel
              </button>
              <button 
                className="btn-primary" 
                onClick={sendDocumentToLandlord}
                disabled={sending}
              >
                {sending ? 'Sending...' : 'Send Document'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDetail;