import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../shared/context/AuthContext';
import { supabase } from '../../../../shared/lib/supabaseClient';
import {
  AlertTriangle,
  Home,
  User,
  Calendar,
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  Download,
  Eye,
  Phone,
  Mail,
  Wrench,
  Droplets,
  Zap,
  Hammer,
  PaintBucket,
  MessageCircle,
  Bell,
  FileText,
  DollarSign,
  Receipt
} from 'lucide-react';
import './Reports.css';

const Reports = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]); // Combined feed items
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    maintenance: 0,
    payments: 0,
    documents: 0,
    urgent: 0,
    unread: 0
  });

  useEffect(() => {
    if (user?.id) {
      loadAllReports();
    }
  }, [user?.id]);

  const loadAllReports = async () => {
    setLoading(true);
    try {
      // 1. Fetch maintenance requests for this landlord
      const { data: maintenance, error: maintError } = await supabase
        .from('maintenance_requests')
        .select(`
          *,
          tenant:tenant_id (full_name, email, phone_number),
          property:property_id (title, address)
        `)
        .eq('landlord_id', user.id)
        .order('created_at', { ascending: false });

      if (maintError) throw maintError;

      // 2. Fetch properties owned by landlord to get unit IDs for payments
      const { data: properties, error: propError } = await supabase
        .from('properties')
        .select('id')
        .eq('landlord_id', user.id);

      if (propError) throw propError;

      let payments = [];
      if (properties && properties.length > 0) {
        const propertyIds = properties.map(p => p.id);
        
        // Get units for these properties
        const { data: units, error: unitError } = await supabase
          .from('units')
          .select('id')
          .in('property_id', propertyIds);

        if (unitError) throw unitError;

        if (units && units.length > 0) {
          const unitIds = units.map(u => u.id);
          
          // Fetch payments for these units
          // 2. Fetch payments for landlord's properties (includes utility payments)
const { data: payments, error: payError } = await supabase
  .from('payments')
  .select(`
    *,
    unit:unit_id (
      unit_number,
      property:property_id (title, address),
      tenant:tenant_id (full_name, email, phone_number)
    )
  `)
  .in('unit_id', unitIds)   // unitIds already fetched from properties
  .order('payment_date', { ascending: false });
          if (payError) throw payError;
          payments = pays || [];
        }
      }

      // 3. Fetch documents shared with landlord (estate_documents with client_id = user.id)
      const { data: documents, error: docError } = await supabase
        .from('estate_documents')
        .select('*')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false });

      if (docError) throw docError;

      // 4. Format maintenance items
      const maintItems = maintenance.map(item => ({
        id: `maint-${item.id}`,
        originalId: item.id,
        type: 'maintenance',
        title: item.title,
        description: item.description,
        date: item.created_at,
        status: item.status,
        priority: item.priority,
        emergency: item.emergency,
        viewed: item.viewed || false,
        tenant: item.tenant,
        property: item.property,
        category: item.category,
        actionsTaken: item.actions_taken || [],
        assignedTo: item.assigned_to,
        icon: <Wrench size={18} />,
        link: `/dashboard/landlord/maintenance/${item.id}`, // optional detail page
      }));

      // 5. Format payment items
      const paymentItems = (payments || []).map(pay => ({
  id: `pay-${pay.id}`,
  originalId: pay.id,
  type: 'payment',
  paymentType: pay.payment_type || 'rent',   // <-- new field
  title: pay.payment_type === 'utility' 
    ? `Utility Bill - ${pay.unit?.unit_number || 'Unit'}` 
    : `Rent Payment - ${pay.unit?.unit_number || 'Unit'}`,
  description: `₦${pay.amount.toLocaleString()} paid on ${new Date(pay.payment_date).toLocaleDateString()}`,
  date: pay.payment_date,
  amount: pay.amount,
  status: 'completed',
  viewed: true,
  tenant: pay.unit?.tenant,
  property: pay.unit?.property,
  unitNumber: pay.unit?.unit_number,
  receipt_url: pay.receipt_url,
  receipt_doc_id: pay.receipt_doc_id,
  icon: pay.payment_type === 'utility' ? <Zap size={18} /> : <DollarSign size={18} />, // different icon
  link: pay.receipt_url ? `/dashboard/landlord/documents/${pay.receipt_doc_id}` : null,
}));

      // 6. Format document items
      const docItems = documents.map(doc => ({
        id: `doc-${doc.id}`,
        originalId: doc.id,
        type: 'document',
        title: doc.name,
        description: `${doc.category} document`,
        date: doc.created_at,
        status: doc.status,
        viewed: doc.viewed || false,
        icon: <FileText size={18} />,
        link: `/dashboard/landlord/documents/${doc.id}`,
        file_url: doc.file_url,
      }));

      // 7. Combine all, sort by date (most recent first)
      const all = [...maintItems, ...paymentItems, ...docItems].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
      );

      setItems(all);

      // 8. Calculate stats
      setStats({
        total: all.length,
        maintenance: maintItems.length,
        payments: paymentItems.length,
        documents: docItems.length,
        urgent: maintItems.filter(i => i.priority === 'high' || i.emergency).length,
        unread: all.filter(i => !i.viewed).length,
      });

    } catch (err) {
      console.error("Error loading reports:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkViewed = async (item) => {
    if (item.viewed) return;
    
    try {
      if (item.type === 'maintenance') {
        await supabase
          .from('maintenance_requests')
          .update({ viewed: true })
          .eq('id', item.originalId);
      } else if (item.type === 'document') {
        await supabase
          .from('estate_documents')
          .update({ viewed: true })
          .eq('id', item.originalId);
      }
      // Payments might not have viewed flag, skip
      
      // Update local state
      setItems(prev => prev.map(i => 
        i.id === item.id ? { ...i, viewed: true } : i
      ));
      setStats(prev => ({ ...prev, unread: prev.unread - 1 }));
    } catch (err) {
      console.error("Failed to mark as viewed:", err);
    }
  };

  const handleUpdateMaintenanceStatus = async (itemId, newStatus) => {
    try {
      await supabase
        .from('maintenance_requests')
        .update({ status: newStatus })
        .eq('id', itemId);

      setItems(prev => prev.map(i => 
        i.originalId === itemId && i.type === 'maintenance' 
          ? { ...i, status: newStatus } 
          : i
      ));
      if (selectedItem?.originalId === itemId && selectedItem.type === 'maintenance') {
        setSelectedItem({ ...selectedItem, status: newStatus });
      }
    } catch (err) {
      alert("Failed to update status: " + err.message);
    }
  };

  const filteredItems = items.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'maintenance') return item.type === 'maintenance';
    if (filter === 'payments') return item.type === 'payment';
    if (filter === 'documents') return item.type === 'document';
    if (filter === 'urgent') return item.type === 'maintenance' && (item.priority === 'high' || item.emergency);
    if (filter === 'unread') return !item.viewed;
    return true;
  });

  const getStatusBadge = (item) => {
    if (item.type === 'maintenance') {
      const config = {
        open: { label: 'Open', color: '#ef4444', icon: <AlertTriangle size={14} /> },
        pending: { label: 'Pending', color: '#f59e0b', icon: <Clock size={14} /> },
        in_progress: { label: 'In Progress', color: '#3b82f6', icon: <Clock size={14} /> },
        resolved: { label: 'Resolved', color: '#10b981', icon: <CheckCircle size={14} /> }
      };
      const { label, color, icon } = config[item.status] || { label: item.status, color: '#6b7280', icon: null };
      return (
        <span className="status-badge" style={{ backgroundColor: `${color}15`, color, borderColor: color }}>
          {icon} {label}
        </span>
      );
    } else if (item.type === 'document') {
      const config = {
        verified: { label: 'Verified', color: '#10b981' },
        pending: { label: 'Pending', color: '#f59e0b' },
        rejected: { label: 'Rejected', color: '#ef4444' },
        expired: { label: 'Expired', color: '#6b7280' }
      };
      const { label, color } = config[item.status] || { label: item.status, color: '#6b7280' };
      return (
        <span className="status-badge" style={{ backgroundColor: `${color}15`, color, borderColor: color }}>
          {label}
        </span>
      );
    } else {
      // payments are always completed
      return (
        <span className="status-badge" style={{ backgroundColor: '#10b98115', color: '#10b981', borderColor: '#10b981' }}>
          <CheckCircle size={14} /> Completed
        </span>
      );
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="reports-loading">
        <div className="loading-spinner"></div>
        <p>Loading all reports...</p>
      </div>
    );
  }

  return (
    <div className="reports-container">
      {/* Header */}
      <div className="reports-header">
        <div className="header-left">
          <button className="btn btn-back" onClick={() => navigate('/dashboard/landlord')}>
            ← Back
          </button>
          <h1>All Reports & Updates</h1>
          <p>Maintenance requests, rent payments, and shared documents from your properties</p>
        </div>
        <div className="header-right">
          {stats.unread > 0 && (
            <button 
              className="btn btn-warning"
              onClick={() => items.filter(i => !i.viewed).forEach(i => handleMarkViewed(i))}
            >
              <Bell size={18} /> Mark All Read ({stats.unread})
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="reports-stats">
        <div className="stat-card" onClick={() => setFilter('all')}>
          <h3>Total</h3>
          <div className="stat-value">{stats.total}</div>
        </div>
        <div className="stat-card" onClick={() => setFilter('maintenance')}>
          <h3>Maintenance</h3>
          <div className="stat-value">{stats.maintenance}</div>
        </div>
        <div className="stat-card" onClick={() => setFilter('payments')}>
          <h3>Payments</h3>
          <div className="stat-value">{stats.payments}</div>
        </div>
        <div className="stat-card" onClick={() => setFilter('documents')}>
          <h3>Documents</h3>
          <div className="stat-value">{stats.documents}</div>
        </div>
        <div className="stat-card urgent" onClick={() => setFilter('urgent')}>
          <h3>Urgent</h3>
          <div className="stat-value">{stats.urgent}</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="reports-filters">
        <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
          All
        </button>
        <button className={`filter-btn ${filter === 'unread' ? 'active' : ''}`} onClick={() => setFilter('unread')}>
          Unread
        </button>
        <button className={`filter-btn ${filter === 'maintenance' ? 'active' : ''}`} onClick={() => setFilter('maintenance')}>
          Maintenance
        </button>
        <button className={`filter-btn ${filter === 'payments' ? 'active' : ''}`} onClick={() => setFilter('payments')}>
          Payments
        </button>
        <button className={`filter-btn ${filter === 'documents' ? 'active' : ''}`} onClick={() => setFilter('documents')}>
          Documents
        </button>
      </div>

      {/* Feed List */}
      <div className="reports-feed">
        {filteredItems.length === 0 ? (
          <div className="empty-feed">
            <FileText size={48} />
            <h3>No reports found</h3>
            <p>There are no items matching your current filter.</p>
          </div>
        ) : (
          filteredItems.map(item => (
            <div 
              key={item.id} 
              className={`feed-item ${!item.viewed ? 'unread' : ''}`}
              onClick={() => {
                handleMarkViewed(item);
                setSelectedItem(item);
              }}
            >
              <div className="item-icon" style={{ backgroundColor: item.type === 'maintenance' ? '#fee2e2' : item.type === 'payment' ? '#d1fae5' : '#e0f2fe' }}>
                {item.icon}
              </div>
              <div className="item-content">
                <div className="item-header">
                  <h4>{item.title}</h4>
                  <span className="item-type">{item.type}</span>
                </div>
                <p className="item-description">{item.description}</p>
                <div className="item-meta">
                  <span className="item-date">
                    <Calendar size={12} /> {formatDate(item.date)}
                  </span>
                  {item.tenant?.full_name && (
                    <span className="item-tenant">
                      <User size={12} /> {item.tenant.full_name}
                    </span>
                  )}
                  {item.property?.title && (
                    <span className="item-property">
                      <Home size={12} /> {item.property.title}
                    </span>
                  )}
                </div>
                {item.type === 'maintenance' && (
                  <div className="item-badges">
                    {item.priority === 'high' && <span className="badge badge-danger">High Priority</span>}
                    {item.emergency && <span className="badge badge-danger">Emergency</span>}
                    {getStatusBadge(item)}
                  </div>
                )}
                {(item.type === 'document' || item.type === 'payment') && (
                  <div className="item-badges">
                    {getStatusBadge(item)}
                  </div>
                )}
              </div>
              <div className="item-arrow">
                <ChevronRight size={16} />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Detail Modal */}
      {selectedItem && (
        <div className="report-modal-overlay" onClick={() => setSelectedItem(null)}>
          <div className="report-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedItem.title}</h2>
              <button onClick={() => setSelectedItem(null)}>×</button>
            </div>
            <div className="modal-content">
              {selectedItem.type === 'maintenance' && (
                <>
                  <div className="info-grid">
                    <div className="info-block">
                      <label>Tenant</label>
                      <p><strong>{selectedItem.tenant?.full_name || 'N/A'}</strong></p>
                      <p>{selectedItem.tenant?.phone_number && <Phone size={14} />} {selectedItem.tenant?.phone_number}</p>
                      <p>{selectedItem.tenant?.email && <Mail size={14} />} {selectedItem.tenant?.email}</p>
                    </div>
                    <div className="info-block">
                      <label>Property</label>
                      <p><strong>{selectedItem.property?.title || 'N/A'}</strong></p>
                      <p>{selectedItem.property?.address}</p>
                    </div>
                  </div>
                  <div className="description-area">
                    <label>Description</label>
                    <p>{selectedItem.description}</p>
                  </div>
                  {selectedItem.actionsTaken && selectedItem.actionsTaken.length > 0 && (
                    <div className="actions-area">
                      <label>Actions Taken</label>
                      <ul>
                        {selectedItem.actionsTaken.map((action, idx) => (
                          <li key={idx}>{action}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="status-update">
                    <label>Update Status</label>
                    <select 
                      value={selectedItem.status} 
                      onChange={(e) => handleUpdateMaintenanceStatus(selectedItem.originalId, e.target.value)}
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </div>
                </>
              )}

              {selectedItem.type === 'payment' && (
                <>
                  <div className="info-grid">
                    <div className="info-block">
                      <label>Tenant</label>
                      <p><strong>{selectedItem.tenant?.full_name || 'N/A'}</strong></p>
                      <p>{selectedItem.tenant?.phone_number && <Phone size={14} />} {selectedItem.tenant?.phone_number}</p>
                    </div>
                    <div className="info-block">
                      <label>Property</label>
                      <p><strong>{selectedItem.property?.title || 'N/A'}</strong></p>
                      <p>Unit {selectedItem.unitNumber}</p>
                    </div>
                  </div>
                  <div className="payment-details">
                    <div className="detail-row">
                      <span>Amount:</span>
                      <span className="amount">₦{selectedItem.amount?.toLocaleString()}</span>
                    </div>
                    <div className="detail-row">
                      <span>Payment Date:</span>
                      <span>{formatDate(selectedItem.date)}</span>
                    </div>
                  </div>
                  {selectedItem.receipt_url && (
                    <div className="receipt-action">
                      <a href={selectedItem.receipt_url} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                        <Receipt size={16} /> View Receipt
                      </a>
                    </div>
                  )}
                </>
              )}

              {selectedItem.type === 'document' && (
                <>
                  <div className="document-info">
                    <p><strong>Category:</strong> {selectedItem.description}</p>
                    <p><strong>Uploaded:</strong> {formatDate(selectedItem.date)}</p>
                    <p><strong>Status:</strong> {selectedItem.status}</p>
                  </div>
                  {selectedItem.file_url && (
                    <div className="document-action">
                      <a href={selectedItem.file_url} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                        <Eye size={16} /> View Document
                      </a>
                    </div>
                  )}
                </>
              )}

              <div className="modal-actions">
                <button className="btn btn-outline" onClick={() => setSelectedItem(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;