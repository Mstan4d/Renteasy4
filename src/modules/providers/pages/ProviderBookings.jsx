// src/modules/providers/pages/ProviderBookings.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  Home,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  MessageCircle,
  FileText,
  CreditCard,
  Shield,
  Star,
  ChevronLeft,
  Download,
  Printer,
  Edit,
  MoreVertical,
  Navigation,
  ClipboardCheck,
  Truck,
  Users,
  //FaSpinner
} from 'lucide-react';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../shared/lib/supabaseClient';
import './ProviderBookings.css';

const ProviderBookings = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('details');
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });

  useEffect(() => {
    if (!user || !id) return;
    fetchBooking();
  }, [user, id]);

  const fetchBooking = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch main booking from service_requests, join with client profile
      const { data: bookingData, error: bookingError } = await supabase
        .from('service_requests')
        .select(`
          *,
          client:client_id (
            id,
            full_name,
            email,
            phone,
            rating,
            completed_bookings
          )
        `)
        .eq('id', id)
        .eq('provider_id', user.id)
        .single();

      if (bookingError) throw bookingError;
      if (!bookingData) throw new Error('Booking not found');

      // Fetch associated property (if any) – might be separate table or embedded
      // For now, we'll assume property details are in the booking record
      // Fetch team members (if stored)
      const { data: teamData, error: teamError } = await supabase
        .from('booking_team')
        .select('*')
        .eq('booking_id', id);

      if (teamError && teamError.code !== 'PGRST116') throw teamError;

      // Fetch documents
      const { data: docsData, error: docsError } = await supabase
        .from('booking_documents')
        .select('*')
        .eq('booking_id', id);

      if (docsError && docsError.code !== 'PGRST116') throw docsError;

      // Fetch messages
      const { data: messagesData, error: msgsError } = await supabase
        .from('booking_messages')
        .select('*')
        .eq('booking_id', id)
        .order('created_at', { ascending: true });

      if (msgsError && msgsError.code !== 'PGRST116') throw msgsError;

      // Transform data to match component's expected structure
      const formattedBooking = {
        id: bookingData.id,
        bookingNumber: bookingData.booking_number || `BK-${bookingData.id.slice(0, 8)}`,
        serviceName: bookingData.service_name || bookingData.service_type,
        serviceType: bookingData.service_type,
        serviceCategory: bookingData.service_category,
        customer: {
          id: bookingData.client?.id,
          name: bookingData.client?.full_name || 'Unknown',
          role: 'tenant', // or derive from client role
          email: bookingData.client?.email || 'N/A',
          phone: bookingData.client?.phone || 'N/A',
          avatar: null,
          rating: bookingData.client?.rating || 0,
          completedBookings: bookingData.client?.completed_bookings || 0
        },
        property: {
          id: bookingData.property_id,
          address: bookingData.address || 'Address not provided',
          type: bookingData.property_type || 'N/A',
          size: bookingData.property_size || 'N/A'
        },
        dateTime: {
          scheduled: bookingData.scheduled_date,
          requested: bookingData.created_at,
          accepted: bookingData.accepted_at,
          completed: bookingData.completed_at,
          cancelled: bookingData.cancelled_at
        },
        pricing: {
          basePrice: bookingData.base_price || 0,
          extraCharges: bookingData.extra_charges || [],
          discount: bookingData.discount || 0,
          tax: bookingData.tax || 0,
          total: bookingData.total_amount || 0,
          paymentMethod: bookingData.payment_method || 'card',
          paymentStatus: bookingData.payment_status || 'pending',
          paymentId: bookingData.payment_id
        },
        status: bookingData.status || 'pending',
        statusHistory: bookingData.status_history || [],
        notes: bookingData.notes || '',
        specialInstructions: bookingData.special_instructions || '',
        team: (teamData || []).map(m => ({
          id: m.id,
          name: m.name,
          role: m.role,
          phone: m.phone
        })),
        duration: bookingData.duration || 'N/A',
        materialsNeeded: bookingData.materials_needed || [],
        documents: (docsData || []).map(d => ({
          id: d.id,
          name: d.name,
          url: d.url,
          uploaded: d.created_at
        })),
        messages: (messagesData || []).map(m => ({
          id: m.id,
          sender: m.sender_type, // 'customer' or 'provider'
          text: m.content,
          timestamp: m.created_at
        })),
        review: bookingData.review,
        cancellationPolicy: bookingData.cancellation_policy || {
          allowed: true,
          deadline: bookingData.scheduled_date,
          refundPercentage: 80
        },
        commissionNote: bookingData.commission_note || 'This booking counts toward your free booking limit.'
      };

      setBooking(formattedBooking);
    } catch (err) {
      console.error('Error fetching booking:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (newStatus, note = '') => {
    try {
      const updates = {
        status: newStatus,
        status_history: [
          ...(booking.statusHistory || []),
          { status: newStatus, timestamp: new Date().toISOString(), note }
        ]
      };
      if (newStatus === 'completed') {
        updates.completed_at = new Date().toISOString();
      } else if (newStatus === 'cancelled') {
        updates.cancelled_at = new Date().toISOString();
      } else if (newStatus === 'in_progress') {
        updates.started_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('service_requests')
        .update(updates)
        .eq('id', booking.id);

      if (error) throw error;

      // Refresh data
      await fetchBooking();
      setStatusUpdate('');
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status: ' + err.message);
    }
  };

  const handleStatusUpdate = () => {
    if (statusUpdate) {
      updateBookingStatus(booking.status === 'scheduled' ? 'in_progress' : 
                         booking.status === 'in_progress' ? 'completed' : 'cancelled',
                         statusUpdate);
    }
  };

  const handleSendMessage = () => {
    navigate(`/dashboard/provider/messages?booking=${booking.id}`);
  };

  const handleDownloadInvoice = () => {
    alert('Invoice download functionality would be implemented here');
  };

  const handleSubmitReview = async () => {
    try {
      const { error } = await supabase
        .from('provider_reviews')
        .insert([{
          provider_id: user.id,
          booking_id: booking.id,
          rating: newReview.rating,
          comment: newReview.comment
        }]);

      if (error) throw error;

      setShowReviewModal(false);
      setNewReview({ rating: 5, comment: '' });
      alert('Review submitted successfully');
      fetchBooking();
    } catch (err) {
      console.error('Error submitting review:', err);
      alert('Failed to submit review: ' + err.message);
    }
  };

  const handlePrintDetails = () => {
    window.print();
  };

  const getStatusBadge = (status) => {
    const config = {
      requested: { color: 'status-badge-yellow', label: 'Requested', icon: <Clock className="status-icon" /> },
      accepted: { color: 'status-badge-blue', label: 'Accepted', icon: <CheckCircle className="status-icon" /> },
      confirmed: { color: 'status-badge-green', label: 'Confirmed', icon: <CheckCircle className="status-icon" /> },
      scheduled: { color: 'status-badge-purple', label: 'Scheduled', icon: <Calendar className="status-icon" /> },
      in_progress: { color: 'status-badge-orange', label: 'In Progress', icon: <Clock className="status-icon" /> },
      completed: { color: 'status-badge-green', label: 'Completed', icon: <CheckCircle className="status-icon" /> },
      cancelled: { color: 'status-badge-red', label: 'Cancelled', icon: <XCircle className="status-icon" /> },
      rejected: { color: 'status-badge-gray', label: 'Rejected', icon: <XCircle className="status-icon" /> }
    };
    
    const { color, label, icon } = config[status] || config.requested;
    
    return (
      <span className={`status-badge ${color}`}>
        {icon}
        {label}
      </span>
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-NG', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-NG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateTimeRemaining = (dateString) => {
    if (!dateString) return 'N/A';
    const now = new Date();
    const target = new Date(dateString);
    const diff = target - now;
    
    if (diff <= 0) return 'Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  if (loading) {
    return (
      <div className="provider-bookings-loading">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="provider-bookings-error">
        <div className="error-content">
          <AlertCircle className="error-icon" />
          <h3 className="error-title">Booking not found</h3>
          <p className="error-message">{error || 'The requested booking could not be found'}</p>
          <Link
            to="/dashboard/provider/bookings"
            className="back-button"
          >
            <ChevronLeft className="button-icon" />
            Back to Bookings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="provider-bookings-container">
        <div className="bookings-content">
          {/* Header */}
          <div className="bookings-header">
            <div className="header-main">
              <div className="header-left">
                <button
                  onClick={() => navigate('/dashboard/provider/bookings')}
                  className="back-button-icon"
                >
                  <ChevronLeft className="icon" />
                </button>
                <div>
                  <h1 className="header-title">Booking #{booking.bookingNumber}</h1>
                  <p className="header-subtitle">{booking.serviceName}</p>
                </div>
              </div>
              
              <div className="header-right">
                {getStatusBadge(booking.status)}
                
                <div className="actions-menu">
                  <button
                    onClick={() => setShowActionsMenu(!showActionsMenu)}
                    className="actions-menu-button"
                  >
                    <MoreVertical className="icon" />
                  </button>
                  
                  {showActionsMenu && (
                    <div className="actions-menu-dropdown">
                      <button
                        onClick={handlePrintDetails}
                        className="actions-menu-item"
                      >
                        <Printer className="item-icon" />
                        Print Details
                      </button>
                      <button
                        onClick={handleDownloadInvoice}
                        className="actions-menu-item"
                      >
                        <Download className="item-icon" />
                        Download Invoice
                      </button>
                      <button
                        onClick={() => navigate(`/dashboard/provider/bookings/${booking.id}/edit`)}
                        className="actions-menu-item"
                      >
                        <Edit className="item-icon" />
                        Edit Booking
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Booking Stats */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-card-content">
                  <div>
                    <p className="stat-label">Total Amount</p>
                    <p className="stat-value">{formatCurrency(booking.pricing.total)}</p>
                  </div>
                  <div className="stat-icon-container stat-icon-green">
                    <DollarSign className="icon" />
                  </div>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-card-content">
                  <div>
                    <p className="stat-label">Scheduled Date</p>
                    <p className="stat-value">{formatDate(booking.dateTime.scheduled)}</p>
                  </div>
                  <div className="stat-icon-container stat-icon-blue">
                    <Calendar className="icon" />
                  </div>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-card-content">
                  <div>
                    <p className="stat-label">Duration</p>
                    <p className="stat-value">{booking.duration}</p>
                  </div>
                  <div className="stat-icon-container stat-icon-purple">
                    <Clock className="icon" />
                  </div>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-card-content">
                  <div>
                    <p className="stat-label">Time Remaining</p>
                    <p className="stat-value">
                      {calculateTimeRemaining(booking.dateTime.scheduled)}
                    </p>
                  </div>
                  <div className="stat-icon-container stat-icon-orange">
                    <Clock className="icon" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="main-grid">
            {/* Left Column - Booking Details */}
            <div className="main-left">
              {/* Tabs */}
              <div className="tabs-container">
                <div className="tabs-header">
                  <nav className="tabs-list">
                    {['details', 'messages', 'documents', 'team', 'history'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`tab-button ${activeTab === tab ? 'active' : ''}`}
                      >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      </button>
                    ))}
                  </nav>
                </div>
                
                <div className="tabs-content">
                  {/* Details Tab */}
                  {activeTab === 'details' && (
                    <div className="details-content">
                      <div>
                        <h3 className="section-title">Service Details</h3>
                        <div className="details-grid">
                          <div className="detail-row">
                            <span className="detail-label">Service Type:</span>
                            <span className="detail-value">{booking.serviceType}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Category:</span>
                            <span className="detail-value">{booking.serviceCategory}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Duration:</span>
                            <span className="detail-value">{booking.duration}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="section-divider">
                        <h3 className="section-title">Customer Instructions</h3>
                        <div className="instructions-container">
                          <p className="instructions-text">{booking.notes}</p>
                          {booking.specialInstructions && (
                            <div className="special-instructions">
                              <p className="special-instructions-label">Special Instructions:</p>
                              <p className="instructions-text">{booking.specialInstructions}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="section-divider">
                        <h3 className="section-title">Materials Required</h3>
                        <div className="materials-grid">
                          {booking.materialsNeeded.map((material, index) => (
                            <span
                              key={index}
                              className="material-tag"
                            >
                              {material}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Messages Tab */}
                  {activeTab === 'messages' && (
                    <div className="messages-content">
                      <div className="messages-header">
                        <h3 className="section-title">Booking Messages</h3>
                        <button
                          onClick={handleSendMessage}
                          className="send-message-button"
                        >
                          <MessageCircle className="button-icon" />
                          Send Message
                        </button>
                      </div>
                      
                      <div className="messages-list">
                        {booking.messages.map((message) => (
                          <div
                            key={message.id}
                            className={`message-item ${message.sender}`}
                          >
                            <div className={`message-bubble ${message.sender}`}>
                              <p className="message-text">{message.text}</p>
                              <p className="message-time">
                                {formatDateTime(message.timestamp)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Documents Tab */}
                  {activeTab === 'documents' && (
                    <div className="documents-content">
                      <h3 className="section-title">Booking Documents</h3>
                      <div className="documents-list">
                        {booking.documents.map((doc) => (
                          <div
                            key={doc.id}
                            className="document-item"
                          >
                            <div className="document-info">
                              <FileText className="document-icon" />
                              <div>
                                <p className="document-name">{doc.name}</p>
                                <p className="document-date">
                                  Uploaded: {formatDate(doc.uploaded)}
                                </p>
                              </div>
                            </div>
                            <a href={doc.url} target="_blank" rel="noopener noreferrer" className="document-download">
                              Download
                            </a>
                          </div>
                        ))}
                      </div>
                      
                      <button className="upload-document-button">
                        <FileText className="button-icon" />
                        Upload New Document
                      </button>
                    </div>
                  )}
                  
                  {/* Team Tab */}
                  {activeTab === 'team' && (
                    <div className="team-content">
                      <h3 className="section-title">Assigned Team</h3>
                      <div className="team-list">
                        {booking.team.map((member) => (
                          <div
                            key={member.id}
                            className="team-member"
                          >
                            <div className="member-info">
                              <div className="member-avatar">
                                <User className="member-avatar-icon" />
                              </div>
                              <div className="member-details">
                                <h4>{member.name}</h4>
                                <p>{member.role}</p>
                                <p>{member.phone}</p>
                              </div>
                            </div>
                            <button className="message-member-button">
                              <MessageCircle className="icon" />
                            </button>
                          </div>
                        ))}
                      </div>
                      
                      <button className="assign-member-button">
                        <User className="button-icon" />
                        Assign Team Member
                      </button>
                    </div>
                  )}
                  
                  {/* History Tab */}
                  {activeTab === 'history' && (
                    <div className="history-content">
                      <h3 className="section-title">Status History</h3>
                      <div className="history-list">
                        {booking.statusHistory.map((entry, index) => (
                          <div key={index} className="history-item">
                            <div className="history-dot"></div>
                            <div className="history-content">
                              <div className="history-header">
                                <span className="history-status">
                                  {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                                </span>
                                <span className="history-time">
                                  {formatDateTime(entry.timestamp)}
                                </span>
                              </div>
                              <p className="history-note">{entry.note}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Status Update Section */}
              {['scheduled', 'accepted', 'confirmed', 'in_progress'].includes(booking.status) && (
                <div className="status-update-container">
                  <h3 className="section-title">Update Booking Status</h3>
                  <div className="status-update-form">
                    <div className="form-group">
                      <label className="form-label">
                        Status Note
                      </label>
                      <textarea
                        value={statusUpdate}
                        onChange={(e) => setStatusUpdate(e.target.value)}
                        placeholder="Add notes about the status update..."
                        className="status-update-textarea"
                        rows="3"
                      />
                    </div>
                    
                    <div className="status-buttons">
                      {booking.status === 'scheduled' && (
                        <button
                          onClick={() => updateBookingStatus('in_progress', statusUpdate)}
                          className="status-button start"
                        >
                          Start Service
                        </button>
                      )}
                      
                      {booking.status === 'in_progress' && (
                        <button
                          onClick={() => updateBookingStatus('completed', statusUpdate)}
                          className="status-button complete"
                        >
                          Mark as Completed
                        </button>
                      )}
                      
                      <button
                        onClick={() => updateBookingStatus('cancelled', statusUpdate)}
                        className="status-button cancel"
                      >
                        Cancel Booking
                      </button>
                      
                      <button
                        onClick={() => setStatusUpdate('')}
                        className="status-button clear"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Right Column - Sidebar */}
            <div className="main-right">
              {/* Customer Card */}
              <div className="sidebar-card">
                <h3 className="sidebar-card-title">
                  <User className="sidebar-card-title-icon" />
                  Customer Details
                </h3>
                
                <div className="customer-content">
                  <div className="customer-info">
                    <p className="customer-name">{booking.customer.name}</p>
                    <div className="customer-meta">
                      <span className="customer-role">
                        {booking.customer.role}
                      </span>
                      <div className="customer-rating">
                        <Star className="star-icon" />
                        <span>{booking.customer.rating}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="customer-contact">
                    <div className="contact-item">
                      <Phone className="contact-icon" />
                      <a href={`tel:${booking.customer.phone}`} className="contact-link">
                        {booking.customer.phone}
                      </a>
                    </div>
                    <div className="contact-item">
                      <Mail className="contact-icon" />
                      <a href={`mailto:${booking.customer.email}`} className="contact-link">
                        {booking.customer.email}
                      </a>
                    </div>
                  </div>
                  
                  <div className="customer-stats">
                    <p className="stats-text">
                      Completed Bookings: <span className="stats-value">{booking.customer.completedBookings}</span>
                    </p>
                  </div>
                  
                  <div className="customer-actions">
                    <button
                      onClick={handleSendMessage}
                      className="action-button message"
                    >
                      <MessageCircle className="button-icon" />
                      Message
                    </button>
                    <button className="action-button call">
                      <Phone className="button-icon" />
                      Call
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Property Card */}
              <div className="sidebar-card">
                <h3 className="sidebar-card-title">
                  <Home className="sidebar-card-title-icon" />
                  Property Details
                </h3>
                
                <div className="property-content">
                  <div className="property-address">
                    <MapPin className="address-icon" />
                    <p className="address-text">{booking.property.address}</p>
                  </div>
                  
                  <div className="property-details">
                    <div className="property-detail">
                      <span className="detail-label">Type:</span>
                      <span className="detail-value">{booking.property.type}</span>
                    </div>
                    <div className="property-detail">
                      <span className="detail-label">Size:</span>
                      <span className="detail-value">{booking.property.size}</span>
                    </div>
                  </div>
                  
                  <button className="directions-button">
                    <Navigation className="button-icon" />
                    Get Directions
                  </button>
                </div>
              </div>
              
              {/* Pricing Card */}
              <div className="sidebar-card">
                <h3 className="sidebar-card-title">
                  <DollarSign className="sidebar-card-title-icon" />
                  Pricing Breakdown
                </h3>
                
                <div className="pricing-content">
                  <div className="pricing-breakdown">
                    <div className="pricing-row">
                      <span className="pricing-label">Base Price:</span>
                      <span className="pricing-value">{formatCurrency(booking.pricing.basePrice)}</span>
                    </div>
                    
                    {booking.pricing.extraCharges.map((charge, index) => (
                      <div key={index} className="pricing-row">
                        <span className="pricing-label">{charge.description}:</span>
                        <span className="pricing-value">{formatCurrency(charge.amount)}</span>
                      </div>
                    ))}
                    
                    {booking.pricing.discount > 0 && (
                      <div className="pricing-row discount">
                        <span className="pricing-label">Discount:</span>
                        <span className="pricing-value">-{formatCurrency(booking.pricing.discount)}</span>
                      </div>
                    )}
                    
                    {booking.pricing.tax > 0 && (
                      <div className="pricing-row">
                        <span className="pricing-label">Tax:</span>
                        <span className="pricing-value">{formatCurrency(booking.pricing.tax)}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="pricing-total">
                    <span>Total:</span>
                    <span>{formatCurrency(booking.pricing.total)}</span>
                  </div>
                  
                  <div className="payment-info">
                    <div className="payment-status">
                      <span className="payment-label">Payment Status:</span>
                      <span className={`status-badge-small ${booking.pricing.paymentStatus === 'paid' ? 'status-badge-paid' : 'status-badge-pending'}`}>
                        {booking.pricing.paymentStatus}
                      </span>
                    </div>
                    <div className="payment-method">
                      <span className="payment-label">Method:</span>
                      <div className="method-info">
                        <CreditCard className="method-icon" />
                        <span className="method-text">{booking.pricing.paymentMethod}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={handleDownloadInvoice}
                  className="download-invoice-button"
                >
                  <Download className="button-icon" />
                  Download Invoice
                </button>
              </div>
              
              {/* Commission Note */}
              <div className="commission-note">
                <div className="commission-note-content">
                  <Shield className="commission-icon" />
                  <div>
                    <p className="commission-text">{booking.commissionNote}</p>
                    <Link
                      to="/dashboard/provider/subscription"
                      className="commission-link"
                    >
                      View subscription details →
                    </Link>
                  </div>
                </div>
              </div>
              
              {/* Review Section */}
              {booking.status === 'completed' && !booking.review && (
                <div className="review-section">
                  <h3 className="section-title">Leave a Review</h3>
                  <p className="review-description">Share your experience working with this customer</p>
                  <button
                    onClick={() => setShowReviewModal(true)}
                    className="review-button"
                  >
                    <Star className="button-icon" />
                    Write Review
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Review Modal */}
      {showReviewModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Review Customer</h2>
            </div>
            
            <div className="modal-body">
              <div className="review-modal-content">
                <div className="form-group">
                  <label className="form-label">
                    Rating
                  </label>
                  <div className="rating-stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewReview({ ...newReview, rating: star })}
                        className="rating-star-button"
                      >
                        <Star
                          className={`rating-star ${star <= newReview.rating ? 'active' : 'inactive'}`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">
                    Comments
                  </label>
                  <textarea
                    value={newReview.comment}
                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                    placeholder="Share your experience working with this customer..."
                    className="review-textarea"
                    rows="4"
                  />
                </div>
                
                <div className="modal-actions">
                  <button
                    onClick={() => setShowReviewModal(false)}
                    className="modal-button cancel"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitReview}
                    className="modal-button submit"
                  >
                    Submit Review
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProviderBookings;