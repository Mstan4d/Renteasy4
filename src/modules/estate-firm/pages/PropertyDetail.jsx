import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../shared/lib/supabaseClient';
import { documentGenerator } from '../../../shared/lib/documentGenerator';
import UnitModal from '../components/UnitModal';
import PropertyRentSummary from '../components/PropertyRentSummary';
import {
  Building, ArrowLeft, Home, Users, DollarSign, Calendar,
  Plus, Edit, Trash2, Eye, Download, Send, Clock,
  CheckCircle, XCircle, AlertCircle, MapPin, Phone, Mail,
  FileText, Receipt, Zap, Bell
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
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    description: '',
  });

  useEffect(() => {
    if (!user) return;
    loadProperty();
  }, [id, user]);

  const loadProperty = async () => {
    setLoading(true);
    try {
      // Fetch property with landlord info
      const { data: prop, error: propError } = await supabase
        .from('properties')
        .select(`
          *,
          landlord:landlord_id (id, name, email, phone, address)
        `)
        .eq('id', id)
        .single();
      if (propError) throw propError;
      setProperty(prop);

      // Fetch units with tenant info
      const { data: unitsData, error: unitsError } = await supabase
        .from('units')
        .select(`
          *,
          tenant:tenant_id (id, name, email, phone)
        `)
        .eq('property_id', id)
        .order('unit_number', { ascending: true });
      if (unitsError) throw unitsError;
      setUnits(unitsData || []);

      // Fetch recent activities
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

  const handleAddUnit = () => {
    setEditingUnit(null);
    setShowUnitModal(true);
  };

  const handleEditUnit = (unit) => {
    setEditingUnit(unit);
    setShowUnitModal(true);
  };

  const handleUnitSaved = () => {
    loadProperty(); // refresh after unit added/updated
  };

  const handleDeleteUnit = async (unitId) => {
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

  const handleDeleteProperty = async () => {
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
    // Generate a unique reference
    const paymentReference = `PMT-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    // 1. Insert payment record with reference
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
        reference: paymentReference,  // <-- add this line
      }])
      .select()
      .single();
    if (payError) throw payError;


      // 2. Fetch full payment with relations for receipt generation
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

      // 3. Generate receipt document
      const receiptDoc = await documentGenerator.generateReceipt(fullPayment);

      // 4. Update payment with receipt URL and document ID
      await supabase
        .from('payments')
        .update({ 
          receipt_url: receiptDoc.file_url, 
          receipt_doc_id: receiptDoc.id 
        })
        .eq('id', payment.id);

      // 5. Send in-app notification to tenant if they are a RentEasy user
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

      // 6. If unit was vacant, mark as occupied
      if (selectedUnit.status !== 'occupied') {
        await supabase
          .from('units')
          .update({ status: 'occupied' })
          .eq('id', selectedUnit.id);
      }

      // 7. Add activity
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
    if (!window.confirm(`Send rent reminder for ${unit.unit_number}?`)) return;
    try {
      // 1. Create reminder record
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

      // 2. Generate reminder letter
      const doc = await documentGenerator.generateReminder(reminder, unit);

      // 3. Update reminder with document ID
      await supabase
        .from('reminders')
        .update({ document_id: doc.id, sent: true, sent_at: new Date().toISOString() })
        .eq('id', reminder.id);

      // 4. Send in-app notification to tenant
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

      // 5. Add activity
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
    return <div className="loading">Loading property details...</div>;
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
      <header className="property-header">
        <button className="back-button" onClick={() => navigate('/dashboard/estate-firm/properties')}>
          <ArrowLeft size={20} /> Back to Portfolio
        </button>
        <div className="property-title">
          <h1>{property.name}</h1>
          <span className="property-address"><MapPin size={16} /> {property.address}</span>
        </div>
        <div className="property-actions">
          <button className="btn-outline" onClick={() => navigate(`/dashboard/estate-firm/properties/${id}/edit`)}>
            <Edit size={16} /> Edit
          </button>
          {property.source === 'rent-easy' && (
            <button className="btn-outline" onClick={() => window.open(`/listings/${property.listing_id}`, '_blank')}>
              <Eye size={16} /> View Listing
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
            <button className="btn-primary" onClick={handleAddUnit}>
              <Plus size={16} /> Add Unit
            </button>
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
                  </div>

                  <div className="unit-details">
                    <div className="detail-row">
                      <span className="label">Rent:</span>
                      <span className="value highlight">{formatCurrency(unit.rent_amount)}/{unit.rent_frequency}</span>
                    </div>
                    {unit.tenant ? (
                      <>
                        <div className="detail-row">
                          <span className="label">Tenant:</span>
                          <span className="value">{unit.tenant.name}</span>
                        </div>
                        <div className="detail-row">
                          <span className="label">Phone:</span>
                          <span className="value">{unit.tenant.phone || '—'}</span>
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
                    {unit.tenant ? (
                      <button className="action-btn" onClick={() => handleRecordPayment(unit)}>
                        <DollarSign size={14} /> Record Payment
                      </button>
                    ) : (
                      <button className="action-btn" onClick={() => handleEditUnit(unit)}>
                        <Users size={14} /> Add Tenant
                      </button>
                    )}
                    <button className="action-btn" onClick={() => handleSendReminder(unit)}>
                      <Bell size={14} /> Remind
                    </button>
                    <button className="action-btn" onClick={() => handleEditUnit(unit)}>
                      <Edit size={14} />
                    </button>
                    <button className="action-btn danger" onClick={() => handleDeleteUnit(unit.id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right sidebar: Landlord info & Activity */}
        <div className="sidebar">
          {/* Landlord info */}
          {property.landlord && (
            <div className="landlord-card">
              <h3>Landlord</h3>
              <p><strong>{property.landlord.name}</strong></p>
              {property.landlord.phone && <p><Phone size={14} /> {property.landlord.phone}</p>}
              {property.landlord.email && <p><Mail size={14} /> {property.landlord.email}</p>}
              <div className="landlord-actions">
                <button className="btn-outline"><Send size={14} /> Send Documents</button>
              </div>
            </div>
          )}

          {/* Activity timeline */}
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

          {/* Quick stats */}
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
              <span>Monthly Revenue:</span>
              <span className="value highlight">
                {formatCurrency(units.filter(u => u.status === 'occupied').reduce((sum, u) => sum + u.rent_amount, 0))}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Unit Modal */}
      {showUnitModal && (
        <UnitModal
          propertyId={id}
          unit={editingUnit}
          onClose={() => setShowUnitModal(false)}
          onSaved={handleUnitSaved}
        />
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedUnit && (
        <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Record Payment for {selectedUnit.unit_number}</h3>
            <form onSubmit={(e) => { e.preventDefault(); submitPayment(); }}>
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
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowPaymentModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Record Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDetail;