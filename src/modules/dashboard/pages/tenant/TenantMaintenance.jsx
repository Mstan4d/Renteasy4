// src/modules/dashboard/pages/tenant/TenantMaintenance.jsx - UPDATED
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../shared/context/AuthContext';
import './TenantMaintenance.css';

const TenantMaintenance = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [filter, setFilter] = useState('all');
  const [newRequest, setNewRequest] = useState({
    title: '',
    category: '',
    description: '',
    priority: 'medium',
    property: '',
    emergency: false,
    images: []
  });

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = () => {
    setLoading(true);
    
    // Mock maintenance requests data
    const mockRequests = [
      {
        id: 'req_001',
        title: 'AC Repair',
        category: 'air_conditioning',
        description: 'AC not cooling properly. The temperature stays at 28°C even when set to 18°C.',
        property: '2 Bedroom Flat, Lekki Phase 1',
        date: '2024-12-01',
        status: 'in_progress',
        priority: 'high',
        assignedTo: 'John Maintenance',
        contact: '+234 803 123 4567',
        estimatedCompletion: '2024-12-05',
        images: [],
        notes: 'Technician visited on Dec 2. Waiting for compressor part.'
      },
      {
        id: 'req_002',
        title: 'Leaking Kitchen Tap',
        category: 'plumbing',
        description: 'Kitchen tap leaking continuously. Wasting water.',
        property: '2 Bedroom Flat, Lekki Phase 1',
        date: '2024-11-28',
        status: 'pending',
        priority: 'medium',
        assignedTo: null,
        contact: null,
        estimatedCompletion: null,
        images: [],
        notes: ''
      },
      {
        id: 'req_003',
        title: 'Broken Window',
        category: 'structural',
        description: 'Bedroom window broken during storm. Need urgent replacement.',
        property: '2 Bedroom Flat, Lekki Phase 1',
        date: '2024-11-25',
        status: 'completed',
        priority: 'high',
        assignedTo: 'Glass Masters Ltd',
        contact: '+234 802 987 6543',
        estimatedCompletion: '2024-11-27',
        images: [],
        notes: 'Window replaced successfully on Nov 27.'
      },
      {
        id: 'req_004',
        title: 'Painting Request',
        category: 'decoration',
        description: 'Living room needs repainting. Walls have stains.',
        property: '2 Bedroom Flat, Lekki Phase 1',
        date: '2024-11-20',
        status: 'approved',
        priority: 'low',
        assignedTo: 'Paint Pros',
        contact: '+234 701 234 5678',
        estimatedCompletion: '2024-12-10',
        images: [],
        notes: 'Landlord approved. Waiting for scheduling.'
      },
      {
        id: 'req_005',
        title: 'Electrical Socket Not Working',
        category: 'electrical',
        description: 'Socket in bedroom not working. Suspected wiring issue.',
        property: '2 Bedroom Flat, Lekki Phase 1',
        date: '2024-11-18',
        status: 'completed',
        priority: 'medium',
        assignedTo: 'Spark Electricians',
        contact: '+234 809 876 5432',
        estimatedCompletion: '2024-11-19',
        images: [],
        notes: 'Fixed wiring issue. Socket now functional.'
      }
    ];

    const savedRequests = JSON.parse(localStorage.getItem(`tenant_maintenance_${user?.id}`) || 'null');
    
    if (savedRequests) {
      setRequests(savedRequests);
    } else {
      setRequests(mockRequests);
      localStorage.setItem(`tenant_maintenance_${user?.id}`, JSON.stringify(mockRequests));
    }
    
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewRequest({
      ...newRequest,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => ({
      name: file.name,
      url: URL.createObjectURL(file),
      type: file.type
    }));
    setNewRequest({
      ...newRequest,
      images: [...newRequest.images, ...newImages]
    });
  };

  const removeImage = (index) => {
    const updatedImages = newRequest.images.filter((_, i) => i !== index);
    setNewRequest({
      ...newRequest,
      images: updatedImages
    });
  };

  const submitNewRequest = (e) => {
    e.preventDefault();
    
    const request = {
      id: `req_${Date.now()}`,
      ...newRequest,
      date: new Date().toISOString().split('T')[0],
      status: 'pending',
      assignedTo: null,
      contact: null,
      estimatedCompletion: null,
      notes: ''
    };

    const updatedRequests = [request, ...requests];
    setRequests(updatedRequests);
    localStorage.setItem(`tenant_maintenance_${user?.id}`, JSON.stringify(updatedRequests));
    
    // Reset form and close modal
    setNewRequest({
      title: '',
      category: '',
      description: '',
      priority: 'medium',
      property: '',
      emergency: false,
      images: []
    });
    setShowNewRequest(false);
    
    alert('Maintenance request submitted successfully!');
  };

  const markAsCompleted = (requestId) => {
    if (window.confirm('Mark this maintenance request as completed?')) {
      const updatedRequests = requests.map(request => {
        if (request.id === requestId) {
          return {
            ...request,
            status: 'completed',
            completedDate: new Date().toISOString().split('T')[0]
          };
        }
        return request;
      });
      setRequests(updatedRequests);
      localStorage.setItem(`tenant_maintenance_${user?.id}`, JSON.stringify(updatedRequests));
      
      alert('Request marked as completed successfully!');
    }
  };

  const cancelRequest = (requestId) => {
    if (window.confirm('Are you sure you want to cancel this request?')) {
      const updatedRequests = requests.filter(request => request.id !== requestId);
      setRequests(updatedRequests);
      localStorage.setItem(`tenant_maintenance_${user?.id}`, JSON.stringify(updatedRequests));
      
      alert('Request cancelled successfully!');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { label: 'Pending', class: 'badge-warning' },
      approved: { label: 'Approved', class: 'badge-info' },
      in_progress: { label: 'In Progress', class: 'badge-info' },
      completed: { label: 'Completed', class: 'badge-success' },
      cancelled: { label: 'Cancelled', class: 'badge-danger' }
    };
    return badges[status] || { label: status, class: 'badge-secondary' };
  };

  const getPriorityBadge = (priority) => {
    const priorities = {
      low: { label: 'Low', class: 'badge-info' },
      medium: { label: 'Medium', class: 'badge-warning' },
      high: { label: 'High', class: 'badge-danger' }
    };
    return priorities[priority] || { label: priority, class: 'badge-secondary' };
  };

  const getCategoryIcon = (category) => {
    const icons = {
      plumbing: '🚰',
      electrical: '⚡',
      air_conditioning: '❄️',
      structural: '🏠',
      decoration: '🎨',
      furniture: '🛋️',
      other: '🔧'
    };
    return icons[category] || '🔧';
  };

  const getCategoryLabel = (category) => {
    const labels = {
      plumbing: 'Plumbing',
      electrical: 'Electrical',
      air_conditioning: 'Air Conditioning',
      structural: 'Structural',
      decoration: 'Decoration',
      furniture: 'Furniture',
      other: 'Other'
    };
    return labels[category] || category;
  };

  const filteredRequests = requests.filter(request => {
    if (filter === 'all') return true;
    return request.status === filter;
  });

  const categories = [
    'plumbing',
    'electrical',
    'air_conditioning',
    'structural',
    'decoration',
    'furniture',
    'other'
  ];

  if (loading) {
    return (
      <div className="maintenance-loading">
        <div className="loading-spinner"></div>
        <p>Loading maintenance requests...</p>
      </div>
    );
  }

  return (
    <div className="tenant-maintenance">
      {/* Header */}
      <div className="maintenance-header">
        <div className="header-content">
          <h1>Maintenance Requests</h1>
          <p>Submit and track maintenance requests for your property</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setShowNewRequest(true)}
        >
          + New Request
        </button>
      </div>

      {/* Stats Overview */}
      <div className="maintenance-stats">
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-info">
            <span className="stat-value">{requests.length}</span>
            <span className="stat-label">Total Requests</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-info">
            <span className="stat-value">
              {requests.filter(r => r.status === 'pending' || r.status === 'approved').length}
            </span>
            <span className="stat-label">Active</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <span className="stat-value">
              {requests.filter(r => r.status === 'completed').length}
            </span>
            <span className="stat-label">Completed</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🚨</div>
          <div className="stat-info">
            <span className="stat-value">
              {requests.filter(r => r.priority === 'high').length}
            </span>
            <span className="stat-label">Urgent</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="maintenance-filters">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({requests.length})
        </button>
        <button 
          className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pending ({requests.filter(r => r.status === 'pending').length})
        </button>
        <button 
          className={`filter-btn ${filter === 'in_progress' ? 'active' : ''}`}
          onClick={() => setFilter('in_progress')}
        >
          In Progress ({requests.filter(r => r.status === 'in_progress').length})
        </button>
        <button 
          className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
          onClick={() => setFilter('completed')}
        >
          Completed ({requests.filter(r => r.status === 'completed').length})
        </button>
      </div>

      {/* Requests List */}
      <div className="maintenance-requests">
        {filteredRequests.length > 0 ? (
          <div className="requests-grid">
            {filteredRequests.map(request => {
              const statusBadge = getStatusBadge(request.status);
              const priorityBadge = getPriorityBadge(request.priority);
              
              return (
                <div key={request.id} className="request-card">
                  <div className="request-header">
                    <div className="request-title">
                      <h3>
                        <span className="category-icon">
                          {getCategoryIcon(request.category)}
                        </span>
                        {request.title}
                      </h3>
                      <div className="request-badges">
                        <span className={`priority-badge ${priorityBadge.class}`}>
                          {priorityBadge.label} Priority
                        </span>
                        <span className={`status-badge ${statusBadge.class}`}>
                          {statusBadge.label}
                        </span>
                      </div>
                    </div>
                    
                    <div className="request-meta">
                      <div className="request-date">
                        <span className="meta-icon">📅</span>
                        <span>Submitted: {request.date}</span>
                      </div>
                      {request.assignedTo && (
                        <div className="assigned-to">
                          <span className="meta-icon">👨‍🔧</span>
                          <span>Assigned to: {request.assignedTo}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="request-body">
                    <div className="request-description">
                      <p>{request.description}</p>
                    </div>

                    <div className="request-details">
                      <div className="detail-item">
                        <span className="detail-label">Property:</span>
                        <span className="detail-value">{request.property}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Category:</span>
                        <span className="detail-value">{getCategoryLabel(request.category)}</span>
                      </div>
                      {request.estimatedCompletion && (
                        <div className="detail-item">
                          <span className="detail-label">Est. Completion:</span>
                          <span className="detail-value">{request.estimatedCompletion}</span>
                        </div>
                      )}
                      {request.contact && (
                        <div className="detail-item">
                          <span className="detail-label">Contact:</span>
                          <span className="detail-value">{request.contact}</span>
                        </div>
                      )}
                    </div>

                    {request.notes && (
                      <div className="request-notes">
                        <h4>Notes:</h4>
                        <p className="notes-text">{request.notes}</p>
                      </div>
                    )}
                  </div>

                  <div className="request-footer">
                    <div className="request-actions">
                      {(request.status === 'in_progress' || request.status === 'approved') && (
                        <button 
                          className="btn btn-success btn-sm"
                          onClick={() => markAsCompleted(request.id)}
                        >
                          ✓ Mark as Completed
                        </button>
                      )}
                      
                      {request.status === 'pending' && (
                        <button 
                          className="btn btn-danger btn-sm"
                          onClick={() => cancelRequest(request.id)}
                        >
                          Cancel Request
                        </button>
                      )}
                      
                      <button className="btn btn-outline btn-sm">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-requests">
            <div className="empty-icon">🔧</div>
            <h3>No Maintenance Requests</h3>
            <p>You haven't submitted any maintenance requests yet</p>
            <button 
              className="btn btn-primary"
              onClick={() => setShowNewRequest(true)}
            >
              Submit Your First Request
            </button>
          </div>
        )}
      </div>

      {/* Emergency Contacts */}
      <div className="emergency-contacts">
        <h3>Emergency Maintenance Contacts</h3>
        <div className="contacts-grid">
          <div className="contact-card">
            <div className="contact-icon">🏠</div>
            <div className="contact-info">
              <h4>Property Manager</h4>
              <div className="contact-number">+234 803 123 4567</div>
              <p className="contact-note">Available 24/7 for emergencies</p>
            </div>
          </div>
          <div className="contact-card">
            <div className="contact-icon">🚒</div>
            <div className="contact-info">
              <h4>Emergency Fire Service</h4>
              <div className="contact-number">112</div>
              <p className="contact-note">National emergency number</p>
            </div>
          </div>
          <div className="contact-card">
            <div className="contact-icon">🚰</div>
            <div className="contact-info">
              <h4>Emergency Plumber</h4>
              <div className="contact-number">+234 802 987 6543</div>
              <p className="contact-note">For water leaks & pipe bursts</p>
            </div>
          </div>
        </div>
      </div>

      {/* New Request Modal */}
      {showNewRequest && (
        <div className="new-request-modal-overlay" onClick={() => setShowNewRequest(false)}>
          <div className="new-request-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Submit Maintenance Request</h3>
              <button className="close-modal" onClick={() => setShowNewRequest(false)}>
                ×
              </button>
            </div>
            
            <form onSubmit={submitNewRequest} className="modal-content">
              <div className="upload-instructions">
                <p><strong>Important:</strong></p>
                <ul>
                  <li>Requests are sent to your landlord/estate firm immediately</li>
                  <li>For emergencies, call the emergency contact numbers</li>
                  <li>Provide clear photos for faster processing</li>
                  <li>You'll be notified when request is approved</li>
                </ul>
              </div>
              
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="title">Request Title *</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={newRequest.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Leaking Tap, Broken Window"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="category">Category *</label>
                  <select
                    id="category"
                    name="category"
                    value={newRequest.category}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {getCategoryLabel(category)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="property">Property *</label>
                <input
                  type="text"
                  id="property"
                  name="property"
                  value={newRequest.property}
                  onChange={handleInputChange}
                  placeholder="e.g., 2 Bedroom Flat, Lekki"
                  required
                />
              </div>
              
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="priority">Priority Level *</label>
                  <select
                    id="priority"
                    name="priority"
                    value={newRequest.priority}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="low">Low (Normal)</option>
                    <option value="medium">Medium (Important)</option>
                    <option value="high">High (Urgent)</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="emergency"
                      checked={newRequest.emergency}
                      onChange={handleInputChange}
                    />
                    <span>This is an emergency</span>
                  </label>
                  {newRequest.emergency && (
                    <p className="emergency-warning">
                      ⚠️ Emergency requests are prioritized and may incur additional charges
                    </p>
                  )}
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="description">Description *</label>
                <textarea
                  id="description"
                  name="description"
                  value={newRequest.description}
                  onChange={handleInputChange}
                  placeholder="Please describe the issue in detail..."
                  rows="4"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Upload Photos (Optional)</label>
                <div className="image-upload-area">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="image-input"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="image-upload-label">
                    <div className="upload-placeholder">
                      <span className="upload-icon">📷</span>
                      <p>Click to upload photos</p>
                      <small>JPG, PNG up to 5MB each</small>
                    </div>
                  </label>
                </div>
                
                {newRequest.images.length > 0 && (
                  <div className="uploaded-images">
                    <h4>Uploaded Photos ({newRequest.images.length})</h4>
                    <div className="images-preview">
                      {newRequest.images.map((image, index) => (
                        <div key={index} className="image-preview">
                          <img src={image.url} alt={`Preview ${index + 1}`} />
                          <button 
                            type="button"
                            className="remove-image"
                            onClick={() => removeImage(index)}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="modal-actions">
                <button 
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowNewRequest(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="btn btn-primary"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantMaintenance;