// src/modules/estate-firm/pages/DocumentManager.jsx
import React, { useState, useEffect } from 'react';
import {
  Home, FileText, Upload, Download, Eye, Trash2, Share2,
  Folder, File, FileImage, FileSpreadsheet, FileArchive,
  Calendar, User, Search, Filter, MoreVertical,
  CheckCircle, Clock, AlertCircle, Lock, Globe, Link, UserCheck, Shield
} from 'lucide-react';
import { supabase } from '../../../shared/lib/supabaseClient';
import { useAuth } from '../../../shared/context/AuthContext';
import RentEasyLoader from '../../../shared/components/RentEasyLoader';
import './DocumentManager.css';

const DocumentManager = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [occupiedUnits, setOccupiedUnits] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [documentCategory, setDocumentCategory] = useState('lease');
  const [userRole, setUserRole] = useState('principal');
  const [canEdit, setCanEdit] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);

  // Get user role
 // Add this useEffect after your other useEffects
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
        setCanEdit(role === 'principal' || role === 'executive');
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
    if (user) {
      loadDocuments();
      loadOccupiedUnits();
    }
  }, [user, userRole]);

  const loadOccupiedUnits = async () => {
  try {
    const { data: profile, error: profileError } = await supabase
      .from('estate_firm_profiles')
      .select('id, parent_estate_firm_id')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return;
    }

    if (!profile) {
      console.log('No estate firm profile found');
      setOccupiedUnits([]);
      return;
    }

    // Determine effective firm ID - handle null parent_estate_firm_id
    let effectiveFirmId = profile.id;
    if (userRole === 'associate' || userRole === 'executive') {
      // Only use parent_estate_firm_id if it's not null
      if (profile.parent_estate_firm_id) {
        effectiveFirmId = profile.parent_estate_firm_id;
      }
    }

    console.log('Effective firm ID:', effectiveFirmId);

    // Get properties
    let propertiesQuery = supabase
      .from('properties')
      .select('id, name, address')
      .eq('estate_firm_id', effectiveFirmId);
    
    // If associate, only get their properties
    if (userRole === 'associate' && currentUserId) {
      propertiesQuery = propertiesQuery.eq('created_by_staff_id', currentUserId);
    }
    
    const { data: properties, error: propertiesError } = await propertiesQuery;

    if (propertiesError) {
      console.error('Error fetching properties:', propertiesError);
      setOccupiedUnits([]);
      return;
    }

    if (!properties || properties.length === 0) {
      console.log('No properties found');
      setOccupiedUnits([]);
      return;
    }

    const propertyIds = properties.map(p => p.id);

    // Get units
    let unitsQuery = supabase
      .from('units')
      .select(`
        id,
        unit_number,
        rent_amount,
        property_id,
        tenant_name,
        tenant_renteasy_id,
        tenant_email,
        tenant_phone
      `)
      .in('property_id', propertyIds)
      .not('tenant_renteasy_id', 'is', null);

    if (userRole === 'associate' && currentUserId) {
      unitsQuery = unitsQuery.eq('created_by_staff_id', currentUserId);
    }

    const { data: units, error: unitsError } = await unitsQuery;

    if (unitsError) {
      console.error('Error fetching units:', unitsError);
      setOccupiedUnits([]);
      return;
    }

    // Merge unit data with property data
    const unitsWithProperties = (units || []).map(unit => ({
      ...unit,
      property: properties.find(p => p.id === unit.property_id)
    })).filter(unit => unit.property);

    console.log('Occupied units found:', unitsWithProperties.length);
    setOccupiedUnits(unitsWithProperties);
    
  } catch (error) {
    console.error('Error in loadOccupiedUnits:', error);
    setOccupiedUnits([]);
  }
};
  const loadDocuments = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Get effective firm ID for documents
      let effectiveFirmId = user.id;
      
      // Build query
      let query = supabase
        .from('estate_documents')
        .select(`
          *,
          unit:unit_id (
            id,
            unit_number,
            property:property_id (
              id,
              name
            ),
            tenant_name,
            tenant_renteasy_id
          ),
          property:listings(title)
        `)
        .eq('estate_firm_id', effectiveFirmId);
      
      // If associate, only show documents from their units
      if (userRole === 'associate' && currentUserId) {
        // First get associate's units
        const { data: profile } = await supabase
          .from('estate_firm_profiles')
          .select('parent_estate_firm_id')
          .eq('user_id', user.id)
          .single();
        
        const effectiveParentFirmId = profile?.parent_estate_firm_id || effectiveFirmId;
        
        const { data: myProperties } = await supabase
          .from('properties')
          .select('id')
          .eq('estate_firm_id', effectiveParentFirmId)
          .eq('created_by_staff_id', currentUserId);
        
        const propertyIds = myProperties?.map(p => p.id) || [];
        
        if (propertyIds.length > 0) {
          const { data: myUnits } = await supabase
            .from('units')
            .select('id')
            .in('property_id', propertyIds);
          
          const unitIds = myUnits?.map(u => u.id) || [];
          
          if (unitIds.length > 0) {
            query = query.in('unit_id', unitIds);
          } else {
            query = query.eq('id', '00000000-0000-0000-0000-000000000000');
          }
        } else {
          query = query.eq('id', '00000000-0000-0000-0000-000000000000');
        }
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      setDocuments(data || []);

    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (files) => {
    if (!canEdit) {
      alert('Only Principal and Executive can upload documents.');
      return;
    }
    
    if (!user || !files.length) return;

    setUploading(true);
    
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        const filePath = `estate-firm-${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('estate-documents')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('estate-documents')
          .getPublicUrl(filePath);

        const documentTypeMap = {
          'lease': 'lease_agreement',
          'valuation': 'valuation_report',
          'verification': 'verification_document',
          'invoice': 'invoice',
          'photos': 'property_photo',
          'contract': 'contract',
          'report': 'maintenance_report',
          'other': 'other'
        };

        const docData = {
          estate_firm_id: user.id,
          name: file.name,
          file_type: file.type,
          file_size: file.size,
          file_url: urlData.publicUrl,
          category: documentCategory,
          document_type: documentTypeMap[documentCategory] || 'other',
          status: 'active',
          shared: false,
          created_at: new Date().toISOString()
        };

        if (documentCategory === 'lease' && selectedUnit) {
          docData.unit_id = selectedUnit.id;
        }

        const { data: insertedDoc, error: docError } = await supabase
          .from('estate_documents')
          .insert(docData)
          .select()
          .single();

        if (docError) throw docError;

        if (documentCategory === 'lease' && selectedUnit && insertedDoc) {
          const unit = occupiedUnits.find(u => u.id === selectedUnit.id);
          
          if (unit && unit.tenant_renteasy_id) {
            const { data: existingLease } = await supabase
              .from('leases')
              .select('id')
              .eq('unit_id', selectedUnit.id)
              .eq('tenant_id', unit.tenant_renteasy_id)
              .single();

            if (existingLease) {
              await supabase
                .from('leases')
                .update({
                  agreement_url: urlData.publicUrl,
                  agreement_document_id: insertedDoc.id,
                  updated_at: new Date().toISOString()
                })
                .eq('id', existingLease.id);
            } else {
              await supabase.from('leases').insert({
                unit_id: selectedUnit.id,
                property_id: unit.property_id,
                tenant_id: unit.tenant_renteasy_id,
                estate_firm_id: user.id,
                agreement_url: urlData.publicUrl,
                agreement_document_id: insertedDoc.id,
                monthly_rent: unit.rent_amount,
                start_date: new Date().toISOString(),
                end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
                status: 'active',
                created_at: new Date().toISOString()
              });
            }

            await supabase.from('notifications').insert({
              user_id: unit.tenant_renteasy_id,
              type: 'lease_uploaded',
              title: 'Lease Agreement Uploaded',
              message: `Your lease agreement for ${unit.property?.name} Unit ${unit.unit_number} has been uploaded.`,
              link: '/dashboard/tenant/leases',
              created_at: new Date().toISOString()
            });
          }
        }

        return insertedDoc;
      });

      await Promise.all(uploadPromises);
      await loadDocuments();
      setSelectedUnit(null);
      setDocumentCategory('lease');
      
      await supabase.from('activities').insert({
        user_id: user.id,
        type: 'document',
        action: 'upload',
        description: `Uploaded ${files.length} document(s)`,
        created_at: new Date().toISOString()
      });

      alert(`Successfully uploaded ${files.length} document(s)`);
      setShowUploadModal(false);

    } catch (error) {
      console.error('Error uploading files:', error);
      alert(`Failed to upload documents: ${error.message || 'Please try again.'}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId) => {
    if (!canEdit) {
      alert('Only Principal and Executive can delete documents.');
      return;
    }
    
    if (!window.confirm('Are you sure you want to delete this document?')) return;

    try {
      const doc = documents.find(d => d.id === docId);
      
      if (doc.file_url) {
        const filePath = doc.file_url.split('/').pop();
        await supabase.storage
          .from('estate-documents')
          .remove([`estate-firm-${user.id}/${filePath}`]);
      }

      const { error } = await supabase
        .from('estate_documents')
        .delete()
        .eq('id', docId);

      if (error) throw error;

      setDocuments(documents.filter(doc => doc.id !== docId));
      setSelectedDocs(selectedDocs.filter(id => id !== docId));

      await supabase.from('activities').insert({
        user_id: user.id,
        type: 'document',
        action: 'delete',
        description: `Deleted document: ${doc.name}`,
        created_at: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Failed to delete document. Please try again.');
    }
  };

  const handleBulkDelete = async () => {
    if (!canEdit) {
      alert('Only Principal and Executive can delete documents.');
      return;
    }
    
    if (!window.confirm(`Delete ${selectedDocs.length} selected documents?`)) return;

    try {
      const docsToDelete = documents.filter(doc => selectedDocs.includes(doc.id));
      
      const deletePromises = docsToDelete.map(async (doc) => {
        if (doc.file_url) {
          const filePath = doc.file_url.split('/').pop();
          await supabase.storage
            .from('estate-documents')
            .remove([`estate-firm-${user.id}/${filePath}`]);
        }
      });

      await Promise.all(deletePromises);

      const { error } = await supabase
        .from('estate_documents')
        .delete()
        .in('id', selectedDocs);

      if (error) throw error;

      setDocuments(documents.filter(doc => !selectedDocs.includes(doc.id)));
      setSelectedDocs([]);

      await supabase.from('activities').insert({
        user_id: user.id,
        type: 'document',
        action: 'bulk_delete',
        description: `Deleted ${selectedDocs.length} documents`,
        created_at: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error bulk deleting documents:', error);
      alert('Failed to delete documents. Please try again.');
    }
  };

  const handleShare = async (docId) => {
    if (!canEdit) {
      alert('Only Principal and Executive can share documents.');
      return;
    }
    
    try {
      const { error } = await supabase
        .from('estate_documents')
        .update({ shared: true })
        .eq('id', docId);

      if (error) throw error;

      await loadDocuments();
      alert('Document shared successfully!');

    } catch (error) {
      console.error('Error sharing document:', error);
      alert('Failed to share document. Please try again.');
    }
  };

  const handleDownload = (docUrl, docName) => {
    const a = document.createElement('a');
    a.href = docUrl;
    a.download = docName;
    a.click();
  };

  const getFileIcon = (type) => {
    if (type?.includes('pdf')) return <FileText size={20} color="#ef4444" />;
    if (type?.includes('word') || type?.includes('document')) return <FileText size={20} color="#2563eb" />;
    if (type?.includes('image')) return <FileImage size={20} color="#10b981" />;
    if (type?.includes('spreadsheet') || type?.includes('excel')) return <FileSpreadsheet size={20} color="#059669" />;
    if (type?.includes('zip') || type?.includes('compressed')) return <FileArchive size={20} color="#f59e0b" />;
    return <File size={20} color="#6b7280" />;
  };

  const getCategoryColor = (documentType) => {
    const colors = {
      'lease_agreement': '#3b82f6',
      'valuation_report': '#10b981',
      'verification_document': '#8b5cf6',
      'invoice': '#f59e0b',
      'property_photo': '#ef4444',
      'contract': '#ec4899',
      'maintenance_report': '#6366f1',
      'receipt': '#059669',
      'utility_bill': '#d97706',
      'reminder': '#f97316',
      'other': '#6b7280'
    };
    return colors[documentType] || '#6b7280';
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'active': return <CheckCircle size={14} color="#10b981" />;
      case 'expired': return <AlertCircle size={14} color="#ef4444" />;
      case 'pending': return <Clock size={14} color="#f59e0b" />;
      default: return <File size={14} color="#6b7280" />;
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredDocuments = documents.filter(doc => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      doc.name.toLowerCase().includes(query) ||
      (doc.unit?.property?.name || '').toLowerCase().includes(query) ||
      (doc.unit?.tenant_name || '').toLowerCase().includes(query) ||
      doc.category.toLowerCase().includes(query)
    );
  }).filter(doc => {
    if (filter === 'all') return true;
    if (filter === 'shared') return doc.shared;
    if (filter === 'active') return doc.status === 'active';
    if (filter === 'expired') return doc.status === 'expired';
    if (filter === 'lease') return doc.category === 'lease';
    return true;
  });

  const totalSize = documents.reduce((sum, doc) => sum + (doc.file_size || 0), 0);

  if (loading) {
    return <RentEasyLoader message="Loading your Documents..." fullScreen />;
  }

  return (
    <div className="document-manager">
      {/* Role Banner */}
      {userRole === 'associate' && (
        <div className="role-banner">
          <Shield size={16} />
          <span>Associate View - You can only view documents from properties you manage</span>
        </div>
      )}
      
      {userRole === 'executive' && (
        <div className="role-banner executive">
          <Shield size={16} />
          <span>Executive View - You can upload and manage documents</span>
        </div>
      )}

      {/* Header */}
      <div className="dm-header">
        <div>
          <h2>Document Manager</h2>
          <p className="subtitle">
            {documents.length} documents • {formatFileSize(totalSize)} total
          </p>
        </div>
        
        <div className="dm-actions">
          {canEdit && (
            <button 
              className="btn btn-primary"
              onClick={() => setShowUploadModal(true)}
            >
              <Upload size={18} />
              Upload Documents
            </button>
          )}
          <button className="btn btn-outline">
            <Folder size={18} />
            Create Folder
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="dm-stats">
        <div className="stat-card">
          <FileText size={24} />
          <div className="stat-info">
            <span className="stat-value">{documents.length}</span>
            <span className="stat-label">Total Documents</span>
          </div>
        </div>
        
        <div className="stat-card">
          <UserCheck size={24} />
          <div className="stat-info">
            <span className="stat-value">
              {documents.filter(d => d.category === 'lease').length}
            </span>
            <span className="stat-label">Lease Agreements</span>
          </div>
        </div>
        
        <div className="stat-card">
          <Share2 size={24} />
          <div className="stat-info">
            <span className="stat-value">
              {documents.filter(d => d.shared).length}
            </span>
            <span className="stat-label">Shared</span>
          </div>
        </div>
        
        <div className="stat-card">
          <CheckCircle size={24} />
          <div className="stat-info">
            <span className="stat-value">
              {documents.filter(d => d.status === 'active').length}
            </span>
            <span className="stat-label">Active</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="dm-controls">
        <div className="search-bar">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search documents by name, property, or tenant..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-actions">
          <div className="filter-tabs">
            <button 
              className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button 
              className={`filter-tab ${filter === 'lease' ? 'active' : ''}`}
              onClick={() => setFilter('lease')}
            >
              Leases
            </button>
            <button 
              className={`filter-tab ${filter === 'shared' ? 'active' : ''}`}
              onClick={() => setFilter('shared')}
            >
              Shared
            </button>
            <button 
              className={`filter-tab ${filter === 'active' ? 'active' : ''}`}
              onClick={() => setFilter('active')}
            >
              Active
            </button>
          </div>
          
          <select 
            className="category-filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="lease">Lease Agreements</option>
            <option value="valuation">Valuation Reports</option>
            <option value="verification">Verification</option>
            <option value="invoice">Invoices</option>
            <option value="photos">Property Photos</option>
            <option value="contract">Contracts</option>
            <option value="report">Reports</option>
          </select>
        </div>
      </div>

      {/* Selection Bar - Only show if can edit */}
      {selectedDocs.length > 0 && canEdit && (
        <div className="selection-bar">
          <div className="selection-info">
            <CheckCircle size={16} />
            <span>{selectedDocs.length} documents selected</span>
          </div>
          <div className="selection-actions">
            <button className="btn btn-sm">
              <Download size={14} />
              Download Selected
            </button>
            <button className="btn btn-sm">
              <Share2 size={14} />
              Share Selected
            </button>
            <button 
              className="btn btn-sm btn-danger"
              onClick={handleBulkDelete}
            >
              <Trash2 size={14} />
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Documents Grid */}
      <div className="documents-grid">
        {filteredDocuments.length > 0 ? (
          filteredDocuments.map(doc => (
            <div key={doc.id} className="document-card">
              <div className="doc-header">
                <div className="doc-checkbox">
                  {canEdit && (
                    <input
                      type="checkbox"
                      checked={selectedDocs.includes(doc.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedDocs([...selectedDocs, doc.id]);
                        } else {
                          setSelectedDocs(selectedDocs.filter(id => id !== doc.id));
                        }
                      }}
                    />
                  )}
                </div>
                
                <div className="doc-actions">
                  <button 
                    className="doc-action-btn"
                    onClick={() => window.open(doc.file_url, '_blank')}
                    title="Preview"
                  >
                    <Eye size={14} />
                  </button>
                  <button 
                    className="doc-action-btn"
                    onClick={() => handleDownload(doc.file_url, doc.name)}
                    title="Download"
                  >
                    <Download size={14} />
                  </button>
                  {canEdit && (
                    <>
                      <button 
                        className="doc-action-btn"
                        onClick={() => handleShare(doc.id)}
                        title="Share"
                        disabled={doc.shared}
                      >
                        <Share2 size={14} />
                      </button>
                      <button 
                        className="doc-action-btn"
                        onClick={() => handleDelete(doc.id)}
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="doc-body">
                <div className="doc-icon">
                  {getFileIcon(doc.file_type)}
                </div>
                
                <div className="doc-info">
                  <h4 className="doc-name">{doc.name}</h4>
                  
                  <div className="doc-meta">
                    <span className="doc-size">{formatFileSize(doc.file_size)}</span>
                    <span className="doc-date">
                      <Calendar size={12} />
                      {new Date(doc.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="doc-category">
                    <span 
                      className="category-tag"
                      style={{ 
                        backgroundColor: `${getCategoryColor(doc.document_type)}20`, 
                        color: getCategoryColor(doc.document_type) 
                      }}
                    >
                      {doc.document_type === 'lease_agreement' ? '📄 Lease Agreement' :
                       doc.document_type === 'valuation_report' ? '🏠 Valuation Report' :
                       doc.document_type === 'verification_document' ? '✅ Verification' :
                       doc.document_type === 'invoice' ? '💰 Invoice' :
                       doc.document_type === 'property_photo' ? '📸 Property Photo' :
                       doc.document_type === 'contract' ? '📑 Contract' :
                       doc.document_type === 'maintenance_report' ? '🔧 Maintenance' :
                       doc.document_type === 'receipt' ? '🧾 Receipt' :
                       doc.document_type === 'utility_bill' ? '💡 Utility Bill' :
                       doc.document_type === 'reminder' ? '⏰ Reminder' :
                       doc.document_type}
                    </span>
                    <span className="doc-status">
                      {getStatusIcon(doc.status)}
                      {doc.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="doc-footer">
                {doc.unit?.property?.name && (
                  <div className="doc-property">
                    <Home size={12} />
                    <span>{doc.unit.property.name} - Unit {doc.unit.unit_number}</span>
                  </div>
                )}
                {doc.unit?.tenant_name && (
                  <div className="doc-client">
                    <User size={12} />
                    <span>Tenant: {doc.unit.tenant_name}</span>
                  </div>
                )}
                {doc.category === 'lease' && doc.unit?.tenant_renteasy_id && (
                  <div className="doc-permissions">
                    <span className="permission-tag shared">
                      <UserCheck size={10} />
                      Linked to Tenant
                    </span>
                  </div>
                )}
                <div className="doc-permissions">
                  {doc.shared ? (
                    <span className="permission-tag shared">
                      <Globe size={10} />
                      Shared
                    </span>
                  ) : (
                    <span className="permission-tag private">
                      <Lock size={10} />
                      Private
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <FileText size={48} />
            <h3>No documents found</h3>
            <p>Upload your first document to get started</p>
            {canEdit && (
              <button 
                className="btn btn-primary"
                onClick={() => setShowUploadModal(true)}
              >
                <Upload size={18} />
                Upload Documents
              </button>
            )}
          </div>
        )}
      </div>

      {/* Upload Modal - Only show if can edit */}
      {showUploadModal && canEdit && (
        <div className="upload-modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="upload-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Upload Document</h3>
              <button 
                className="modal-close"
                onClick={() => setShowUploadModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              {/* Document Category Selection */}
              <div className="form-group">
                <label>Document Type</label>
                <select 
                  value={documentCategory} 
                  onChange={(e) => setDocumentCategory(e.target.value)}
                  className="category-select"
                >
                  <option value="lease">📄 Lease Agreement</option>
                  <option value="valuation">🏠 Valuation Report</option>
                  <option value="invoice">💰 Invoice</option>
                  <option value="contract">📑 Contract</option>
                  <option value="report">📊 Report</option>
                  <option value="other">📁 Other</option>
                </select>
              </div>

              {/* Unit Selection - Only for Lease Agreements */}
              {documentCategory === 'lease' && (
                <div className="form-group">
                  <label>Select Occupied Unit</label>
                  <select 
                    value={selectedUnit?.id || ''} 
                    onChange={(e) => {
                      const unit = occupiedUnits.find(u => u.id === e.target.value);
                      setSelectedUnit(unit || null);
                    }}
                    className="unit-select"
                  >
                    <option value="">-- Select Unit --</option>
                    {occupiedUnits.map(unit => (
                      <option key={unit.id} value={unit.id}>
                        {unit.property?.name} - Unit {unit.unit_number} (Tenant: {unit.tenant_name || 'Unknown'})
                      </option>
                    ))}
                  </select>
                  {occupiedUnits.length === 0 && (
                    <small className="warning-text">
                      No occupied units found. Please add tenants to units first.
                    </small>
                  )}
                </div>
              )}

              {/* File Upload Zone */}
              <div className="upload-zone">
                <Upload size={48} />
                <p>Drag & drop files here</p>
                <small>or</small>
                <input
                  type="file"
                  multiple
                  onChange={(e) => handleFileUpload(e.target.files)}
                  className="file-input"
                  id="file-upload"
                  disabled={uploading || (documentCategory === 'lease' && !selectedUnit)}
                />
                <label htmlFor="file-upload" className="btn btn-outline">
                  Browse Files
                </label>
                <small>Supports PDF, DOC, JPG, PNG, XLSX up to 50MB</small>
                {documentCategory === 'lease' && !selectedUnit && (
                  <div className="error-message">
                    <AlertCircle size={14} />
                    <span>Please select a unit before uploading lease agreement</span>
                  </div>
                )}
              </div>
              
              {uploading && (
                <div className="uploading-progress">
                  <div className="progress-bar">
                    <div className="progress-fill"></div>
                  </div>
                  <p>Uploading documents...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentManager;