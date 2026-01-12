// ProviderBookings.jsx - Complete Component with CSS
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
  Users
} from 'lucide-react';

const ProviderBookings = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });

  // Mock data - replace with API call
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockBooking = {
        id: id || 'BOOK-789456',
        bookingNumber: 'BK-2024-00123',
        serviceName: 'Deep Cleaning Service',
        serviceType: 'Cleaning',
        serviceCategory: 'Home Services',
        customer: {
          id: 'CUST-456',
          name: 'Adebayo Johnson',
          role: 'tenant',
          email: 'adebayo.j@example.com',
          phone: '+2348012345678',
          avatar: null,
          rating: 4.5,
          completedBookings: 12
        },
        property: {
          id: 'PROP-789',
          address: '24, Allen Avenue, Ikeja, Lagos',
          type: '3-Bedroom Apartment',
          size: '1800 sq ft'
        },
        dateTime: {
          scheduled: '2024-01-28T14:00:00Z',
          requested: '2024-01-20T10:30:00Z',
          accepted: '2024-01-20T11:15:00Z',
          completed: null,
          cancelled: null
        },
        pricing: {
          basePrice: 35000,
          extraCharges: [
            { description: 'Window Cleaning', amount: 5000 },
            { description: 'Furniture Movement', amount: 3000 }
          ],
          discount: 2000,
          tax: 1750,
          total: 40750,
          paymentMethod: 'card',
          paymentStatus: 'paid',
          paymentId: 'PAY-789123456'
        },
        status: 'scheduled',
        statusHistory: [
          { status: 'requested', timestamp: '2024-01-20T10:30:00Z', note: 'Booking requested by customer' },
          { status: 'accepted', timestamp: '2024-01-20T11:15:00Z', note: 'Booking accepted by provider' },
          { status: 'confirmed', timestamp: '2024-01-20T12:00:00Z', note: 'Payment received and confirmed' }
        ],
        notes: 'Customer requested eco-friendly cleaning products. Please avoid strong chemicals.',
        specialInstructions: 'Parking available at the back. Bring extra cleaning cloths.',
        team: [
          { id: 'TM-001', name: 'Chika Okafor', role: 'Lead Cleaner', phone: '+2348023456789' },
          { id: 'TM-002', name: 'Bola Ahmed', role: 'Assistant Cleaner', phone: '+2348034567890' }
        ],
        duration: '4 hours',
        materialsNeeded: ['Eco-friendly detergent', 'Microfiber cloths', 'Vacuum cleaner', 'Mop'],
        documents: [
          { id: 'DOC-001', name: 'Service Agreement.pdf', url: '#', uploaded: '2024-01-20T11:30:00Z' },
          { id: 'DOC-002', name: 'Customer Requirements.docx', url: '#', uploaded: '2024-01-20T11:45:00Z' }
        ],
        messages: [
          { id: 'MSG-001', sender: 'customer', text: 'Hello, I need deep cleaning for my new apartment', timestamp: '2024-01-20T10:30:00Z' },
          { id: 'MSG-002', sender: 'provider', text: 'Sure! I can schedule it for next Monday at 2 PM', timestamp: '2024-01-20T10:45:00Z' },
          { id: 'MSG-003', sender: 'customer', text: 'Perfect! Please use eco-friendly products', timestamp: '2024-01-20T11:00:00Z' }
        ],
        review: null,
        cancellationPolicy: {
          allowed: true,
          deadline: '2024-01-27T14:00:00Z',
          refundPercentage: 80
        },
        commissionNote: 'This booking counts toward your 10 free bookings limit. After 10 bookings, ₦3,000 monthly subscription applies.'
      };
      setBooking(mockBooking);
      setLoading(false);
    }, 1000);
  }, [id]);

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
    const date = new Date(dateString);
    return date.toLocaleDateString('en-NG', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-NG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-NG', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateTimeRemaining = (dateString) => {
    const now = new Date();
    const target = new Date(dateString);
    const diff = target - now;
    
    if (diff <= 0) return 'Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  const handleStatusUpdate = (newStatus) => {
    if (statusUpdate) {
      const updatedBooking = {
        ...booking,
        status: newStatus,
        statusHistory: [
          ...booking.statusHistory,
          {
            status: newStatus,
            timestamp: new Date().toISOString(),
            note: statusUpdate
          }
        ]
      };
      
      if (newStatus === 'completed') {
        updatedBooking.dateTime.completed = new Date().toISOString();
      } else if (newStatus === 'cancelled') {
        updatedBooking.dateTime.cancelled = new Date().toISOString();
      }
      
      setBooking(updatedBooking);
      setStatusUpdate('');
      alert(`Booking status updated to ${newStatus}`);
    }
  };

  const handleSendMessage = () => {
    navigate(`/dashboard/provider/messages?booking=${booking.id}`);
  };

  const handleDownloadInvoice = () => {
    alert('Invoice download functionality would be implemented here');
  };

  const handleSubmitReview = () => {
    const updatedBooking = {
      ...booking,
      review: {
        ...newReview,
        timestamp: new Date().toISOString(),
        reviewer: 'provider'
      }
    };
    setBooking(updatedBooking);
    setShowReviewModal(false);
    setNewReview({ rating: 5, comment: '' });
    alert('Review submitted successfully');
  };

  const handlePrintDetails = () => {
    window.print();
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

  if (!booking) {
    return (
      <div className="provider-bookings-error">
        <div className="error-content">
          <AlertCircle className="error-icon" />
          <h3 className="error-title">Booking not found</h3>
          <p className="error-message">The requested booking could not be found</p>
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
                            <button className="document-download">
                              Download
                            </button>
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
              {['scheduled', 'accepted', 'confirmed'].includes(booking.status) && (
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
                          onClick={() => handleStatusUpdate('in_progress')}
                          className="status-button start"
                        >
                          Start Service
                        </button>
                      )}
                      
                      {booking.status === 'in_progress' && (
                        <button
                          onClick={() => handleStatusUpdate('completed')}
                          className="status-button complete"
                        >
                          Mark as Completed
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleStatusUpdate('cancelled')}
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

      {/* CSS Styles */}
      <style jsx>{`
        .provider-bookings-container {
          min-height: 100vh;
          background-color: #f9fafb;
          padding: 1rem;
        }
        
        @media (min-width: 768px) {
          .provider-bookings-container {
            padding: 1.5rem;
          }
        }
        
        @media (min-width: 1024px) {
          .provider-bookings-container {
            padding: 2rem;
          }
        }
        
        .bookings-content {
          max-width: 120rem;
          margin: 0 auto;
        }
        
        /* Header */
        .bookings-header {
          margin-bottom: 2rem;
        }
        
        .header-main {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        
        @media (min-width: 768px) {
          .header-main {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
          }
        }
        
        .header-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .back-button-icon {
          padding: 0.5rem;
          border-radius: 0.5rem;
          background: none;
          border: none;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .back-button-icon:hover {
          background-color: #f3f4f6;
        }
        
        .back-button-icon .icon {
          width: 1.25rem;
          height: 1.25rem;
          color: #4b5563;
        }
        
        .header-title {
          font-size: 1.5rem;
          font-weight: bold;
          color: #111827;
          margin: 0;
        }
        
        @media (min-width: 768px) {
          .header-title {
            font-size: 1.875rem;
          }
        }
        
        .header-subtitle {
          color: #6b7280;
          margin-top: 0.25rem;
          font-size: 0.875rem;
        }
        
        .header-right {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        
        /* Status Badges */
        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 9999px;
          font-size: 0.875rem;
          font-weight: 500;
        }
        
        .status-icon {
          width: 1rem;
          height: 1rem;
        }
        
        .status-badge-yellow {
          background-color: #fef3c7;
          color: #92400e;
        }
        
        .status-badge-blue {
          background-color: #dbeafe;
          color: #1e40af;
        }
        
        .status-badge-green {
          background-color: #d1fae5;
          color: #065f46;
        }
        
        .status-badge-purple {
          background-color: #ede9fe;
          color: #5b21b6;
        }
        
        .status-badge-orange {
          background-color: #ffedd5;
          color: #9a3412;
        }
        
        .status-badge-red {
          background-color: #fee2e2;
          color: #991b1b;
        }
        
        .status-badge-gray {
          background-color: #f3f4f6;
          color: #374151;
        }
        
        /* Actions Menu */
        .actions-menu {
          position: relative;
        }
        
        .actions-menu-button {
          padding: 0.5rem;
          border-radius: 0.5rem;
          background: none;
          border: none;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .actions-menu-button:hover {
          background-color: #f3f4f6;
        }
        
        .actions-menu-button .icon {
          width: 1.25rem;
          height: 1.25rem;
          color: #4b5563;
        }
        
        .actions-menu-dropdown {
          position: absolute;
          right: 0;
          top: 100%;
          margin-top: 0.5rem;
          width: 12rem;
          background-color: white;
          border-radius: 0.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          border: 1px solid #e5e7eb;
          z-index: 50;
        }
        
        .actions-menu-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          width: 100%;
          padding: 0.75rem 1rem;
          background: none;
          border: none;
          cursor: pointer;
          color: #374151;
          font-size: 0.875rem;
          transition: background-color 0.2s;
        }
        
        .actions-menu-item:hover {
          background-color: #f9fafb;
        }
        
        .actions-menu-item .item-icon {
          width: 1rem;
          height: 1rem;
          color: #6b7280;
        }
        
        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
        }
        
        @media (min-width: 768px) {
          .stats-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }
        
        .stat-card {
          background-color: white;
          padding: 1.25rem;
          border-radius: 0.75rem;
          border: 1px solid #e5e7eb;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        }
        
        .stat-card-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        
        .stat-label {
          font-size: 0.875rem;
          color: #6b7280;
          margin: 0;
        }
        
        .stat-value {
          font-size: 1.5rem;
          font-weight: bold;
          color: #111827;
          margin: 0;
        }
        
        .stat-icon-container {
          padding: 0.75rem;
          border-radius: 0.5rem;
        }
        
        .stat-icon-container .icon {
          width: 1.5rem;
          height: 1.5rem;
        }
        
        .stat-icon-green {
          background-color: #d1fae5;
        }
        
        .stat-icon-green .icon {
          color: #10b981;
        }
        
        .stat-icon-blue {
          background-color: #dbeafe;
        }
        
        .stat-icon-blue .icon {
          color: #3b82f6;
        }
        
        .stat-icon-purple {
          background-color: #ede9fe;
        }
        
        .stat-icon-purple .icon {
          color: #8b5cf6;
        }
        
        .stat-icon-orange {
          background-color: #ffedd5;
        }
        
        .stat-icon-orange .icon {
          color: #f97316;
        }
        
        /* Main Grid Layout */
        .main-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }
        
        @media (min-width: 1024px) {
          .main-grid {
            grid-template-columns: 2fr 1fr;
          }
        }
        
        /* Tabs */
        .tabs-container {
          background-color: white;
          border-radius: 0.75rem;
          border: 1px solid #e5e7eb;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        }
        
        .tabs-header {
          border-bottom: 1px solid #e5e7eb;
        }
        
        .tabs-list {
          display: flex;
          overflow-x: auto;
          padding: 0 0.5rem;
        }
        
        .tab-button {
          flex-shrink: 0;
          padding: 1rem 1.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          background: none;
          border: none;
          cursor: pointer;
          border-bottom: 2px solid transparent;
          color: #6b7280;
          transition: all 0.2s;
        }
        
        .tab-button:hover {
          color: #374151;
        }
        
        .tab-button.active {
          border-bottom-color: #3b82f6;
          color: #3b82f6;
        }
        
        .tabs-content {
          padding: 1.5rem;
        }
        
        /* Section Styles */
        .section-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: #111827;
          margin: 0 0 1rem 0;
        }
        
        .section-divider {
          border-top: 1px solid #e5e7eb;
          padding-top: 1.5rem;
          margin-top: 1.5rem;
        }
        
        /* Details Tab */
        .details-content {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        
        .details-grid {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .detail-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        
        .detail-label {
          color: #6b7280;
          font-size: 0.875rem;
        }
        
        .detail-value {
          font-weight: 500;
          color: #111827;
          font-size: 0.875rem;
        }
        
        .instructions-container {
          background-color: #f9fafb;
          padding: 1rem;
          border-radius: 0.5rem;
        }
        
        .instructions-text {
          color: #374151;
          margin: 0;
          line-height: 1.5;
        }
        
        .special-instructions {
          margin-top: 0.75rem;
        }
        
        .special-instructions-label {
          font-size: 0.875rem;
          font-weight: 500;
          color: #111827;
          margin: 0 0 0.25rem 0;
        }
        
        .materials-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        
        .material-tag {
          padding: 0.25rem 0.75rem;
          background-color: #dbeafe;
          color: #1d4ed8;
          border-radius: 9999px;
          font-size: 0.875rem;
        }
        
        /* Messages Tab */
        .messages-content {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .messages-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        
        .send-message-button {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background-color: #3b82f6;
          color: white;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 500;
          transition: background-color 0.2s;
        }
        
        .send-message-button:hover {
          background-color: #2563eb;
        }
        
        .send-message-button .button-icon {
          width: 1rem;
          height: 1rem;
        }
        
        .messages-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          max-height: 24rem;
          overflow-y: auto;
          padding-right: 0.5rem;
        }
        
        .message-item {
          display: flex;
        }
        
        .message-item.customer {
          justify-content: flex-start;
        }
        
        .message-item.provider {
          justify-content: flex-end;
        }
        
        .message-bubble {
          max-width: 28rem;
          padding: 1rem;
          border-radius: 0.5rem;
        }
        
        .message-bubble.customer {
          background-color: #f3f4f6;
          color: #111827;
        }
        
        .message-bubble.provider {
          background-color: #dbeafe;
          color: #1e40af;
        }
        
        .message-text {
          margin: 0 0 0.5rem 0;
          line-height: 1.5;
        }
        
        .message-time {
          font-size: 0.75rem;
          opacity: 0.7;
          margin: 0;
        }
        
        /* Documents Tab */
        .documents-content {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .documents-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        
        .document-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem;
          background-color: #f9fafb;
          border-radius: 0.5rem;
          transition: background-color 0.2s;
        }
        
        .document-item:hover {
          background-color: #f3f4f6;
        }
        
        .document-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        
        .document-icon {
          width: 1.25rem;
          height: 1.25rem;
          color: #6b7280;
        }
        
        .document-name {
          font-weight: 500;
          color: #111827;
          margin: 0;
          font-size: 0.875rem;
        }
        
        .document-date {
          font-size: 0.75rem;
          color: #6b7280;
          margin: 0;
        }
        
        .document-download {
          background: none;
          border: none;
          cursor: pointer;
          color: #3b82f6;
          font-size: 0.875rem;
          font-weight: 500;
          transition: color 0.2s;
        }
        
        .document-download:hover {
          color: #2563eb;
        }
        
        .upload-document-button {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: none;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          cursor: pointer;
          color: #374151;
          font-size: 0.875rem;
          transition: all 0.2s;
          align-self: flex-start;
        }
        
        .upload-document-button:hover {
          background-color: #f9fafb;
        }
        
        .upload-document-button .button-icon {
          width: 1rem;
          height: 1rem;
        }
        
        /* Team Tab */
        .team-content {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .team-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .team-member {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem;
          background-color: #f9fafb;
          border-radius: 0.5rem;
        }
        
        .member-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .member-avatar {
          width: 3rem;
          height: 3rem;
          background-color: #dbeafe;
          border-radius: 9999px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        
        .member-avatar-icon {
          width: 1.5rem;
          height: 1.5rem;
          color: #3b82f6;
        }
        
        .member-details h4 {
          font-weight: 500;
          color: #111827;
          margin: 0 0 0.25rem 0;
          font-size: 0.875rem;
        }
        
        .member-details p {
          font-size: 0.75rem;
          color: #6b7280;
          margin: 0 0 0.125rem 0;
        }
        
        .message-member-button {
          background: none;
          border: none;
          cursor: pointer;
          color: #3b82f6;
          padding: 0.5rem;
          border-radius: 0.25rem;
          transition: background-color 0.2s;
        }
        
        .message-member-button:hover {
          background-color: #f3f4f6;
        }
        
        .message-member-button .icon {
          width: 1.25rem;
          height: 1.25rem;
        }
        
        .assign-member-button {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: none;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          cursor: pointer;
          color: #374151;
          font-size: 0.875rem;
          transition: all 0.2s;
          align-self: flex-start;
        }
        
        .assign-member-button:hover {
          background-color: #f9fafb;
        }
        
        .assign-member-button .button-icon {
          width: 1rem;
          height: 1rem;
        }
        
        /* History Tab */
        .history-content {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .history-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .history-item {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
        }
        
        .history-dot {
          flex-shrink: 0;
          width: 0.5rem;
          height: 0.5rem;
          background-color: #3b82f6;
          border-radius: 9999px;
          margin-top: 0.5rem;
        }
        
        .history-content {
          flex: 1;
        }
        
        .history-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.25rem;
        }
        
        .history-status {
          font-weight: 500;
          color: #111827;
          font-size: 0.875rem;
          text-transform: capitalize;
        }
        
        .history-time {
          font-size: 0.75rem;
          color: #6b7280;
        }
        
        .history-note {
          font-size: 0.875rem;
          color: #6b7280;
          margin: 0;
          line-height: 1.5;
        }
        
        /* Status Update */
        .status-update-container {
          background-color: white;
          border-radius: 0.75rem;
          border: 1px solid #e5e7eb;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
          padding: 1.5rem;
        }
        
        .status-update-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .form-label {
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
        }
        
        .status-update-textarea {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          font-family: inherit;
          font-size: 0.875rem;
          resize: vertical;
          transition: all 0.2s;
        }
        
        .status-update-textarea:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        
        .status-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
        }
        
        .status-button {
          padding: 0.5rem 1.5rem;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.2s;
        }
        
        .status-button.start {
          background-color: #f97316;
          color: white;
        }
        
        .status-button.start:hover {
          background-color: #ea580c;
        }
        
        .status-button.complete {
          background-color: #10b981;
          color: white;
        }
        
        .status-button.complete:hover {
          background-color: #059669;
        }
        
        .status-button.cancel {
          background-color: #ef4444;
          color: white;
        }
        
        .status-button.cancel:hover {
          background-color: #dc2626;
        }
        
        .status-button.clear {
          background-color: white;
          border: 1px solid #d1d5db;
          color: #374151;
        }
        
        .status-button.clear:hover {
          background-color: #f9fafb;
        }
        
        /* Sidebar Cards */
        .main-right {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        
        .sidebar-card {
          background-color: white;
          border-radius: 0.75rem;
          border: 1px solid #e5e7eb;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
          padding: 1.5rem;
        }
        
        .sidebar-card-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.125rem;
          font-weight: 600;
          color: #111827;
          margin: 0 0 1rem 0;
        }
        
        .sidebar-card-title-icon {
          width: 1.25rem;
          height: 1.25rem;
          color: #4b5563;
        }
        
        /* Customer Card */
        .customer-content {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .customer-info {
          margin-bottom: 0.5rem;
        }
        
        .customer-name {
          font-weight: 500;
          color: #111827;
          margin: 0 0 0.25rem 0;
          font-size: 1rem;
        }
        
        .customer-meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .customer-role {
          padding: 0.125rem 0.5rem;
          background-color: #dbeafe;
          color: #1d4ed8;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 500;
        }
        
        .customer-rating {
          display: flex;
          align-items: center;
          gap: 0.125rem;
        }
        
        .star-icon {
          width: 1rem;
          height: 1rem;
          color: #fbbf24;
          fill: currentColor;
        }
        
        .customer-contact {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .contact-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        
        .contact-icon {
          width: 1rem;
          height: 1rem;
          color: #6b7280;
          flex-shrink: 0;
        }
        
        .contact-link {
          color: #374151;
          text-decoration: none;
          font-size: 0.875rem;
          transition: color 0.2s;
        }
        
        .contact-link:hover {
          color: #3b82f6;
        }
        
        .customer-stats {
          padding-top: 1rem;
          border-top: 1px solid #e5e7eb;
        }
        
        .stats-text {
          font-size: 0.875rem;
          color: #6b7280;
          margin: 0;
        }
        
        .stats-value {
          font-weight: 500;
          color: #111827;
        }
        
        .customer-actions {
          display: flex;
          gap: 0.75rem;
        }
        
        .action-button {
          flex: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.5rem;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.2s;
        }
        
        .action-button.message {
          background-color: #3b82f6;
          color: white;
        }
        
        .action-button.message:hover {
          background-color: #2563eb;
        }
        
        .action-button.call {
          background-color: white;
          border: 1px solid #d1d5db;
          color: #374151;
        }
        
        .action-button.call:hover {
          background-color: #f9fafb;
        }
        
        .action-button .button-icon {
          width: 1rem;
          height: 1rem;
        }
        
        /* Property Card */
        .property-content {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .property-address {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
        }
        
        .address-icon {
          width: 1rem;
          height: 1rem;
          color: #6b7280;
          margin-top: 0.125rem;
          flex-shrink: 0;
        }
        
        .address-text {
          color: #374151;
          font-size: 0.875rem;
          line-height: 1.5;
          margin: 0;
        }
        
        .property-details {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .directions-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.5rem;
          background: none;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          cursor: pointer;
          color: #374151;
          font-size: 0.875rem;
          transition: all 0.2s;
        }
        
        .directions-button:hover {
          background-color: #f9fafb;
        }
        
        .directions-button .button-icon {
          width: 1rem;
          height: 1rem;
        }
        
        /* Pricing Card */
        .pricing-content {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .pricing-breakdown {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        
        .pricing-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .pricing-label {
          color: #6b7280;
          font-size: 0.875rem;
        }
        
        .pricing-value {
          font-weight: 500;
          color: #111827;
          font-size: 0.875rem;
        }
        
        .pricing-row.discount .pricing-value {
          color: #10b981;
        }
        
        .pricing-total {
          padding-top: 0.75rem;
          border-top: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 1.125rem;
          font-weight: bold;
          color: #111827;
        }
        
        .payment-info {
          padding-top: 0.75rem;
          border-top: 1px solid #e5e7eb;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .payment-status {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        
        .payment-label {
          color: #6b7280;
          font-size: 0.875rem;
        }
        
        .status-badge-small {
          padding: 0.125rem 0.5rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 500;
        }
        
        .status-badge-paid {
          background-color: #d1fae5;
          color: #065f46;
        }
        
        .status-badge-pending {
          background-color: #fef3c7;
          color: #92400e;
        }
        
        .payment-method {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        
        .method-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .method-icon {
          width: 1rem;
          height: 1rem;
          color: #6b7280;
        }
        
        .method-text {
          font-size: 0.875rem;
          color: #111827;
          text-transform: capitalize;
        }
        
        .download-invoice-button {
          width: 100%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.5rem;
          background-color: #f3f4f6;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
          color: #374151;
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.2s;
          margin-top: 1rem;
        }
        
        .download-invoice-button:hover {
          background-color: #e5e7eb;
        }
        
        .download-invoice-button .button-icon {
          width: 1rem;
          height: 1rem;
        }
        
        /* Commission Note */
        .commission-note {
          background-color: #fffbeb;
          border: 1px solid #fde68a;
          border-radius: 0.75rem;
          padding: 1rem;
        }
        
        .commission-note-content {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
        }
        
        .commission-icon {
          width: 1.25rem;
          height: 1.25rem;
          color: #d97706;
          flex-shrink: 0;
          margin-top: 0.125rem;
        }
        
        .commission-text {
          font-size: 0.875rem;
          color: #92400e;
          margin: 0;
          line-height: 1.5;
        }
        
        .commission-link {
          display: inline-block;
          margin-top: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: #b45309;
          text-decoration: none;
          transition: color 0.2s;
        }
        
        .commission-link:hover {
          color: #92400e;
          text-decoration: underline;
        }
        
        /* Review Section */
        .review-section {
          background-color: white;
          border-radius: 0.75rem;
          border: 1px solid #e5e7eb;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
          padding: 1.5rem;
        }
        
        .review-description {
          color: #6b7280;
          font-size: 0.875rem;
          margin: 0 0 1rem 0;
        }
        
        .review-button {
          width: 100%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.5rem;
          background-color: #3b82f6;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
          color: white;
          font-size: 0.875rem;
          font-weight: 500;
          transition: background-color 0.2s;
        }
        
        .review-button:hover {
          background-color: #2563eb;
        }
        
        .review-button .button-icon {
          width: 1rem;
          height: 1rem;
        }
        
        /* Review Modal */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          z-index: 100;
        }
        
        .modal-content {
          background-color: white;
          border-radius: 1rem;
          max-width: 28rem;
          width: 100%;
        }
        
        .modal-header {
          padding: 1.5rem 1.5rem 0;
        }
        
        .modal-title {
          font-size: 1.25rem;
          font-weight: bold;
          color: #111827;
          margin: 0 0 1.5rem 0;
        }
        
        .modal-body {
          padding: 0 1.5rem 1.5rem;
        }
        
        .review-modal-content {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        
        .rating-stars {
          display: flex;
          gap: 0.25rem;
        }
        
        .rating-star-button {
          padding: 0.25rem;
          background: none;
          border: none;
          cursor: pointer;
        }
        
        .rating-star {
          width: 2rem;
          height: 2rem;
        }
        
        .rating-star.active {
          color: #fbbf24;
          fill: currentColor;
        }
        
        .rating-star.inactive {
          color: #d1d5db;
        }
        
        .review-textarea {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          font-family: inherit;
          font-size: 0.875rem;
          resize: vertical;
          transition: all 0.2s;
        }
        
        .review-textarea:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        
        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
        }
        
        .modal-button {
          padding: 0.5rem 1.5rem;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.2s;
        }
        
        .modal-button.cancel {
          background-color: white;
          border: 1px solid #d1d5db;
          color: #374151;
        }
        
        .modal-button.cancel:hover {
          background-color: #f9fafb;
        }
        
        .modal-button.submit {
          background-color: #3b82f6;
          color: white;
        }
        
        .modal-button.submit:hover {
          background-color: #2563eb;
        }
        
        /* Loading State */
        .provider-bookings-loading {
          min-height: 100vh;
          background-color: #f9fafb;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .loading-content {
          text-align: center;
        }
        
        .loading-spinner {
          width: 4rem;
          height: 4rem;
          border: 4px solid #3b82f6;
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }
        
        .loading-text {
          color: #4b5563;
          font-size: 1rem;
          margin: 0;
        }
        
        /* Error State */
        .provider-bookings-error {
          min-height: 100vh;
          background-color: #f9fafb;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .error-content {
          text-align: center;
        }
        
        .error-icon {
          width: 4rem;
          height: 4rem;
          color: #9ca3af;
          margin: 0 auto 1rem;
        }
        
        .error-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #111827;
          margin: 0 0 0.5rem 0;
        }
        
        .error-message {
          color: #6b7280;
          margin: 0 0 1.5rem 0;
        }
        
        .back-button {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background-color: #3b82f6;
          color: white;
          border-radius: 0.5rem;
          text-decoration: none;
          font-weight: 500;
          transition: background-color 0.2s;
        }
        
        .back-button:hover {
          background-color: #2563eb;
        }
        
        .back-button .button-icon {
          width: 1rem;
          height: 1rem;
        }
        
        /* Animations */
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        /* Scrollbar Styling */
        .messages-list::-webkit-scrollbar,
        .tabs-list::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        
        .messages-list::-webkit-scrollbar-track,
        .tabs-list::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }
        
        .messages-list::-webkit-scrollbar-thumb,
        .tabs-list::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }
        
        .messages-list::-webkit-scrollbar-thumb:hover,
        .tabs-list::-webkit-scrollbar-thumb:hover {
          background: #a1a1a1;
        }
        
        /* Print Styles */
        @media print {
          .provider-bookings-container {
            padding: 0;
            background-color: white;
          }
          
          .header-right,
          .status-update-container,
          .review-section,
          .actions-menu,
          button:not(.print-button) {
            display: none !important;
          }
          
          .main-grid {
            grid-template-columns: 1fr;
          }
          
          .stat-card,
          .tabs-container,
          .sidebar-card {
            border: 1px solid #000;
            box-shadow: none;
          }
          
          .header-title {
            color: #000;
          }
        }
        `}</style>
    </>
  );
};

// Add this missing export statement:
export default ProviderBookings;