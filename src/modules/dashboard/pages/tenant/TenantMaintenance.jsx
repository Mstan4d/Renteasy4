// src/modules/dashboard/pages/tenant/TenantMaintenance.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../shared/lib/supabaseClient';
import { useAuth } from '../../../../shared/context/AuthContext';
import RentEasyLoader from '../../../../shared/components/RentEasyLoader';
import { 
  Wrench, AlertTriangle, CheckCircle, Clock, 
  XCircle, Home, User, Phone, Mail, Camera,
  Upload, Trash2, Plus, Calendar
} from 'lucide-react';
import './TenantMaintenance.css';

const TenantMaintenance = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [units, setUnits] = useState([]);
  const [properties, setProperties] = useState({});
  const [loading, setLoading] = useState(true);
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [filter, setFilter] = useState('all');
  const [uploading, setUploading] = useState(false);
  const [newRequest, setNewRequest] = useState({
    title: '',
    category: '',
    description: '',
    priority: 'medium',
    emergency: false,
    unit_id: '',
    images: []
  });

  useEffect(() => {
    if (user) {
      fetchUnits();
      fetchRequests();
    }
  }, [user]);

  const fetchUnits = async () => {
    try {
      // Fetch units where tenant is assigned
      const { data: unitsData, error: unitsError } = await supabase
        .from('units')
        .select('*')
        .eq('tenant_id', user.id);

      if (unitsError) throw unitsError;
      
      if (!unitsData || unitsData.length === 0) {
        setUnits([]);
        return;
      }

      // Get property IDs
      const propertyIds = unitsData.map(u => u.property_id).filter(Boolean);
      
      // Fetch properties
      let propertiesMap = {};
      if (propertyIds.length > 0) {
        const { data: propertiesData } = await supabase
          .from('properties')
          .select('*')
          .in('id', propertyIds);
        
        if (propertiesData) {
          propertiesMap = Object.fromEntries(propertiesData.map(p => [p.id, p]));
        }
      }

      // Enrich units with property data
      const enrichedUnits = unitsData.map(unit => ({
        ...unit,
        property: propertiesMap[unit.property_id] || null
      }));

      setUnits(enrichedUnits);
      
      // Set default unit if available
      if (enrichedUnits.length > 0 && !newRequest.unit_id) {
        setNewRequest(prev => ({ ...prev, unit_id: enrichedUnits[0].id }));
      }
    } catch (error) {
      console.error('Error fetching units:', error);
    }
  };

  const fetchRequests = async () => {
  setLoading(true);
  try {
    // Fetch maintenance requests
    const { data: requestsData, error: requestsError } = await supabase
      .from('maintenance_requests')
      .select('*')
      .eq('tenant_id', user.id)
      .order('created_at', { ascending: false });

    if (requestsError) throw requestsError;

    if (!requestsData || requestsData.length === 0) {
      setRequests([]);
      setLoading(false);
      return;
    }

    // Get unique unit IDs
    const unitIds = [...new Set(requestsData.map(r => r.unit_id).filter(Boolean))];
    
    // Fetch units
    let unitsMap = {};
    if (unitIds.length > 0) {
      const { data: unitsData } = await supabase
        .from('units')
        .select('*')
        .in('id', unitIds);
      
      if (unitsData) {
        unitsMap = Object.fromEntries(unitsData.map(u => [u.id, u]));
      }
    }

    // Get property IDs from units
    const propertyIds = Object.values(unitsMap).map(u => u.property_id).filter(Boolean);
    
    // Fetch properties (from properties table)
    let propertiesMap = {};
    if (propertyIds.length > 0) {
      const { data: propertiesData } = await supabase
        .from('properties')
        .select('*')
        .in('id', propertyIds);
      
      if (propertiesData) {
        propertiesMap = Object.fromEntries(propertiesData.map(p => [p.id, p]));
      }
    }

    // Also fetch listings for property_id that reference listings
    const listingIds = [...new Set(requestsData.map(r => r.property_id).filter(Boolean))];
    let listingsMap = {};
    if (listingIds.length > 0) {
      const { data: listingsData } = await supabase
        .from('listings')
        .select('id, title, address')
        .in('id', listingIds);
      
      if (listingsData) {
        listingsMap = Object.fromEntries(listingsData.map(l => [l.id, l]));
      }
    }

    // Enrich requests with unit and property data
    const enrichedRequests = requestsData.map(request => {
      const unit = unitsMap[request.unit_id] || null;
      const property = unit ? propertiesMap[unit.property_id] : null;
      const listing = listingsMap[request.property_id] || null;
      
      return {
        ...request,
        images: request.images || [],
        unit: unit ? {
          ...unit,
          property: property
        } : null,
        listing: listing
      };
    });

    setRequests(enrichedRequests);
  } catch (error) {
    console.error('Error fetching requests:', error);
  } finally {
    setLoading(false);
  }
};

 const uploadImages = async (requestId) => {
  const uploadedUrls = [];
  
  for (const image of newRequest.images) {
    try {
      if (image.file) {
        const fileExt = image.file.name.split('.').pop();
        const fileName = `maintenance/${requestId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('maintenance-images')
          .upload(fileName, image.file);
        
        if (uploadError) {
          console.error('Upload error:', uploadError);
          continue;
        }
        
        const { data: urlData } = supabase.storage
          .from('maintenance-images')
          .getPublicUrl(fileName);
        
        uploadedUrls.push(urlData.publicUrl);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  }
  
  return uploadedUrls;
};

 const submitNewRequest = async (e) => {
  e.preventDefault();
  if (!newRequest.unit_id) {
    alert('Please select a property unit');
    return;
  }
  if (!newRequest.title.trim()) {
    alert('Please enter a title');
    return;
  }
  if (!newRequest.description.trim()) {
    alert('Please enter a description');
    return;
  }

  setUploading(true);
  try {
    // Get the selected unit details
    const selectedUnit = units.find(u => u.id === newRequest.unit_id);
    if (!selectedUnit) throw new Error('Unit not found');

    const landlordId = selectedUnit.property?.landlord_id;
    const unitId = selectedUnit.id;
    
    // Find the listing associated with this property/unit
    // Since property_id references listings, we need a valid listing ID
    let listingId = null;
    
    // Try to find a listing for this property
    const { data: listing } = await supabase
      .from('listings')
      .select('id')
      .eq('id', selectedUnit.property_id) // property_id in maintenance_requests references listings.id
      .maybeSingle();
    
    if (listing) {
      listingId = listing.id;
    } else {
      // If no listing exists, we might need to create one or use unit_id
      // For now, we'll skip property_id (set to NULL) to allow the request
      console.warn('No listing found for this property, setting property_id to NULL');
    }

    // Create maintenance request - matching your table structure
    const requestData = {
      tenant_id: user.id,
      unit_id: unitId,
      property_id: listingId, // Use listing ID if found, otherwise NULL
      landlord_id: landlordId,
      title: newRequest.title,
      category: newRequest.category,
      description: newRequest.description,
      priority: newRequest.priority,
      emergency: newRequest.emergency,
      status: 'pending',
      images: [],
      created_at: new Date().toISOString(),
      viewed: false
    };

    console.log('Submitting request:', requestData);

    const { data: request, error: reqError } = await supabase
      .from('maintenance_requests')
      .insert(requestData)
      .select()
      .single();

    if (reqError) throw reqError;

    // Upload images if any
    if (newRequest.images.length > 0) {
      const imageUrls = await uploadImages(request.id);
      if (imageUrls.length > 0) {
        await supabase
          .from('maintenance_requests')
          .update({ images: imageUrls })
          .eq('id', request.id);
      }
    }

    // If no listing exists, create one from the property
if (!listing) {
  const property = selectedUnit.property;
  if (property) {
    const { data: newListing, error: createError } = await supabase
      .from('listings')
      .insert({
        title: property.title,
        address: property.address,
        city: property.city,
        state: property.state,
        property_type: property.property_type,
        price: property.rent_amount,
        user_id: landlordId,
        poster_role: 'landlord',
        status: 'pending',
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (newListing) {
      listingId = newListing.id;
    }
  }
}

    // Send notification to landlord
    if (landlordId) {
      await supabase
        .from('landlord_notifications')
        .insert({
          landlord_id: landlordId,
          tenant_id: user.id,
          title: 'New Maintenance Request',
          message: `New ${newRequest.priority} priority maintenance request: ${newRequest.title}`,
          type: 'maintenance',
          read: false,
          created_at: new Date().toISOString()
        });
    }

    alert('Maintenance request submitted successfully!');
    setShowNewRequest(false);
    resetNewRequest();
    fetchRequests();
  } catch (error) {
    console.error('Error submitting request:', error);
    alert(`Failed to submit request: ${error.message}`);
  } finally {
    setUploading(false);
  }
};

  const resetNewRequest = () => {
    setNewRequest({
      title: '',
      category: '',
      description: '',
      priority: 'medium',
      emergency: false,
      unit_id: units[0]?.id || '',
      images: []
    });
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
      file: file,
      name: file.name,
      preview: URL.createObjectURL(file),
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

  const cancelRequest = async (requestId) => {
    if (!window.confirm('Are you sure you want to cancel this request?')) return;
    
    try {
      const { error } = await supabase
        .from('maintenance_requests')
        .update({ status: 'cancelled' })
        .eq('id', requestId);
      
      if (error) throw error;
      fetchRequests();
      alert('Request cancelled successfully!');
    } catch (error) {
      console.error('Error cancelling request:', error);
      alert('Failed to cancel request');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { label: 'Pending', class: 'badge-warning', icon: <Clock size={12} /> },
      approved: { label: 'Approved', class: 'badge-info', icon: <CheckCircle size={12} /> },
      in_progress: { label: 'In Progress', class: 'badge-info', icon: <Clock size={12} /> },
      completed: { label: 'Completed', class: 'badge-success', icon: <CheckCircle size={12} /> },
      cancelled: { label: 'Cancelled', class: 'badge-danger', icon: <XCircle size={12} /> }
    };
    return badges[status] || { label: status, class: 'badge-secondary', icon: null };
  };

  const getPriorityBadge = (priority) => {
    const priorities = {
      low: { label: 'Low', class: 'badge-info' },
      medium: { label: 'Medium', class: 'badge-warning' },
      high: { label: 'High', class: 'badge-danger' }
    };
    return priorities[priority] || { label: priority, class: 'badge-secondary' };
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const filteredRequests = requests.filter(request => {
    if (filter === 'all') return true;
    return request.status === filter;
  });

  const stats = {
    total: requests.length,
    active: requests.filter(r => r.status === 'pending' || r.status === 'approved' || r.status === 'in_progress').length,
    completed: requests.filter(r => r.status === 'completed').length,
    urgent: requests.filter(r => r.priority === 'high' || r.emergency).length
  };

  if (loading) {
    return <RentEasyLoader message="Loading maintenance requests..." fullScreen />;
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
          className="btn-primary"
          onClick={() => setShowNewRequest(true)}
        >
          <Plus size={18} /> New Request
        </button>
      </div>

      {/* Stats Overview */}
      <div className="maintenance-stats">
        <div className="stat-card" onClick={() => setFilter('all')}>
          <div className="stat-icon">📋</div>
          <div className="stat-info">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total</span>
          </div>
        </div>
        <div className="stat-card" onClick={() => setFilter('pending')}>
          <div className="stat-icon">⏳</div>
          <div className="stat-info">
            <span className="stat-value">{stats.active}</span>
            <span className="stat-label">Active</span>
          </div>
        </div>
        <div className="stat-card" onClick={() => setFilter('completed')}>
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <span className="stat-value">{stats.completed}</span>
            <span className="stat-label">Completed</span>
          </div>
        </div>
        <div className="stat-card" onClick={() => setFilter('urgent')}>
          <div className="stat-icon">🚨</div>
          <div className="stat-info">
            <span className="stat-value">{stats.urgent}</span>
            <span className="stat-label">Urgent</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="maintenance-filters">
        {['all', 'pending', 'in_progress', 'completed'].map(tab => (
          <button
            key={tab}
            className={`filter-btn ${filter === tab ? 'active' : ''}`}
            onClick={() => setFilter(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {tab === 'all' && ` (${stats.total})`}
            {tab === 'pending' && ` (${stats.active})`}
            {tab === 'completed' && ` (${stats.completed})`}
          </button>
        ))}
      </div>

      {/* Requests List */}
      <div className="maintenance-requests">
        {filteredRequests.length > 0 ? (
          <div className="requests-grid">
            {filteredRequests.map(request => {
              const statusBadge = getStatusBadge(request.status);
              const priorityBadge = getPriorityBadge(request.priority);
              
              return (
                <div key={request.id} className={`request-card priority-${request.priority}`}>
                  <div className="request-header">
                    <div className="request-title">
                      <h3>{request.title}</h3>
                      <div className="request-badges">
                        <span className={`priority-badge ${priorityBadge.class}`}>
                          {priorityBadge.label}
                        </span>
                        <span className={`status-badge ${statusBadge.class}`}>
                          {statusBadge.icon} {statusBadge.label}
                        </span>
                      </div>
                    </div>
                    
                    <div className="request-meta">
                      <span className="request-date">
                        <Calendar size={12} /> {formatDate(request.created_at)}
                      </span>
                      <span className="request-unit">
                        <Home size={12} /> Unit {request.unit?.unit_number || 'N/A'}
                      </span>
                    </div>
                  </div>

                  <div className="request-body">
                    <div className="request-description">
                      <p>{request.description}</p>
                    </div>

                    <div className="request-details">
                      <div className="detail-item">
                        <span className="detail-label">Property:</span>
                        <span className="detail-value">
                          {request.unit?.property?.title || 'N/A'}
                        </span>
                      </div>
                      <div className="detail-item">
  <span className="detail-label">Property:</span>
  <span className="detail-value">
    {request.listing?.title || request.unit?.property?.title || 'N/A'}
  </span>
</div>
                      {request.emergency && (
                        <div className="detail-item emergency">
                          <span className="detail-label">⚠️ Emergency</span>
                        </div>
                      )}
                    </div>

                    {request.images && request.images.length > 0 && (
  <div className="request-images">
    {request.images.slice(0, 3).map((img, idx) => (
      <img key={idx} src={img} alt={`Request ${idx + 1}`} />
    ))}
    {request.images.length > 3 && (
      <div className="more-images">+{request.images.length - 3}</div>
    )}
  </div>
)}
                  </div>

                  <div className="request-footer">
                    <div className="request-actions">
                      {request.status === 'pending' && (
                        <button 
                          className="btn-danger"
                          onClick={() => cancelRequest(request.id)}
                        >
                          <XCircle size={14} /> Cancel
                        </button>
                      )}
                      <button className="btn-outline">
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
              className="btn-primary"
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
              <h4>Emergency Services</h4>
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
        <div className="modal-overlay" onClick={() => setShowNewRequest(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Submit Maintenance Request</h2>
              <button className="close-btn" onClick={() => setShowNewRequest(false)}>×</button>
            </div>
            
            <form onSubmit={submitNewRequest}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Property Unit *</label>
                  <select
                    name="unit_id"
                    value={newRequest.unit_id}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select a unit</option>
                    {units.map(unit => (
                      <option key={unit.id} value={unit.id}>
                        {unit.property?.title || 'Property'} - Unit {unit.unit_number}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Request Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={newRequest.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Leaking Tap, Broken Window"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Category *</label>
                  <select
                    name="category"
                    value={newRequest.category}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="plumbing">Plumbing</option>
                    <option value="electrical">Electrical</option>
                    <option value="air_conditioning">Air Conditioning</option>
                    <option value="structural">Structural</option>
                    <option value="decoration">Decoration</option>
                    <option value="furniture">Furniture</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Priority Level *</label>
                    <select
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
                  </div>
                </div>

                <div className="form-group">
                  <label>Description *</label>
                  <textarea
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
                  <div className="file-upload-area">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="file-input"
                    />
                    <Upload size={24} />
                    <p>Click to upload photos</p>
                    <small>JPG, PNG up to 5MB each</small>
                  </div>
                  
                  {newRequest.images.length > 0 && (
                    <div className="uploaded-images">
                      <div className="images-preview">
                        {newRequest.images.map((image, index) => (
                          <div key={index} className="image-preview">
                            <img src={image.preview} alt={`Preview ${index + 1}`} />
                            <button 
                              type="button"
                              className="remove-image"
                              onClick={() => removeImage(index)}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowNewRequest(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={uploading}>
                  {uploading ? 'Submitting...' : 'Submit Request'}
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