// src/modules/dashboard/pages/tenant/NewTenantKycForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../shared/context/AuthContext';
import { supabase } from '../../../../shared/lib/supabaseClient';
import {
  Shield, Upload, CheckCircle, XCircle, Clock,
  User, Mail, Phone, MapPin, Calendar, FileText,
  Camera, IdCard, Home, Briefcase, CreditCard,
  ArrowLeft, Save, Eye, Download, AlertCircle
} from 'lucide-react';
import './NewTenantKycForm.css';

const NewTenantKycForm = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [kycStatus, setKycStatus] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    address: '',
    state: '',
    lga: '',
    date_of_birth: '',
    occupation: '',
    business_name: '',
    business_type: '',
    description: '',
    website: '',
    id_type: '',
    id_number: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relationship: '',
  });
  
  const [documents, setDocuments] = useState({
    government_id: null,
    proof_of_address: null,
    business_certificate: null,
    passport_photo: null
  });
  
  const [documentUrls, setDocumentUrls] = useState({
    government_id: null,
    proof_of_address: null,
    business_certificate: null,
    passport_photo: null
  });
  
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user) {
      checkKycStatus();
      loadExistingProfile();
    }
  }, [user]);

  const checkKycStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('kyc_status, verification_status, is_kyc_verified')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      
      if (data) {
        const status = data.kyc_status || data.verification_status;
        setKycStatus(status);
        
        if (status === 'verified' || data.is_kyc_verified === true) {
          setTimeout(() => {
            navigate('/dashboard/tenant');
          }, 2000);
        }
      }
    } catch (error) {
      console.error('Error checking KYC status:', error);
    }
  };

  const loadExistingProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      
      if (data) {
        setFormData({
          full_name: data.full_name || data.name || '',
          phone: data.phone || '',
          address: data.address || '',
          state: data.state || '',
          lga: data.lga || '',
          date_of_birth: data.date_of_birth || '',
          occupation: data.occupation || '',
          business_name: data.business_name || '',
          business_type: data.business_type || '',
          description: data.description || '',
          website: data.website || '',
          id_type: data.id_type || '',
          id_number: data.id_number || '',
          emergency_contact_name: data.emergency_contact?.name || '',
          emergency_contact_phone: data.emergency_contact?.phone || '',
          emergency_contact_relationship: data.emergency_contact?.relationship || '',
        });
        
        if (data.kyc_documents) {
          setDocumentUrls(data.kyc_documents);
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (file, docType) => {
    if (!file) return null;
    
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `kyc/${user.id}/${docType}_${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('kyc-documents')
        .upload(fileName, file);
      
      if (uploadError) throw uploadError;
      
      const { data: urlData } = supabase.storage
        .from('kyc-documents')
        .getPublicUrl(fileName);
      
      return urlData.publicUrl;
    } catch (error) {
      console.error(`Error uploading ${docType}:`, error);
      alert(`Failed to upload ${docType}. Please try again.`);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleDocumentChange = async (e, docType) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }
    
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      alert('Only JPG, PNG, and PDF files are allowed');
      return;
    }
    
    setDocuments(prev => ({ ...prev, [docType]: file }));
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setDocumentUrls(prev => ({ ...prev, [docType]: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      // Upload all documents
      const uploadedDocs = {};
      
      for (const [docType, file] of Object.entries(documents)) {
        if (file) {
          const url = await handleFileUpload(file, docType);
          if (url) {
            uploadedDocs[docType] = url;
          }
        } else if (documentUrls[docType]) {
          uploadedDocs[docType] = documentUrls[docType];
        }
      }
      
      // Build update object with only existing columns
      const updates = {
        full_name: formData.full_name,
        phone: formData.phone,
        updated_at: new Date().toISOString(),
        kyc_status: 'pending',
        kyc_submitted_at: new Date().toISOString(),
        is_kyc_verified: false
      };
      
      // Add optional fields if they have values
      if (formData.address) updates.address = formData.address;
      if (formData.state) updates.state = formData.state;
      if (formData.lga) updates.lga = formData.lga;
      if (formData.occupation) updates.occupation = formData.occupation;
      if (formData.business_name) updates.business_name = formData.business_name;
      if (formData.business_type) updates.business_type = formData.business_type;
      if (formData.description) updates.description = formData.description;
      if (formData.website) updates.website = formData.website;
      
      // Store all KYC data in the kyc_data JSONB column
      const kycData = {
        full_name: formData.full_name,
        phone: formData.phone,
        address: formData.address,
        state: formData.state,
        lga: formData.lga,
        date_of_birth: formData.date_of_birth,
        occupation: formData.occupation,
        business_name: formData.business_name,
        business_type: formData.business_type,
        description: formData.description,
        website: formData.website,
        id_type: formData.id_type,
        id_number: formData.id_number,
        emergency_contact: {
          name: formData.emergency_contact_name,
          phone: formData.emergency_contact_phone,
          relationship: formData.emergency_contact_relationship
        },
        submitted_at: new Date().toISOString()
      };
      
      updates.kyc_data = kycData;
      
      if (Object.keys(uploadedDocs).length > 0) {
        updates.kyc_documents = uploadedDocs;
      }
      
      console.log('Updating profile with:', updates);
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);
      
      if (updateError) throw updateError;
      
      // Create notification for admins
      const { data: admins } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'admin');
      
      if (admins && admins.length > 0) {
        await supabase
          .from('notifications')
          .insert(admins.map(admin => ({
            user_id: admin.id,
            type: 'kyc_submission',
            title: 'New KYC Submission',
            message: `Tenant ${formData.full_name || user.email} has submitted KYC documents for verification.`,
            read: false,
            created_at: new Date().toISOString(),
            link: '/admin/verification'
          })));
      }
      
      alert('KYC documents submitted successfully! Our team will review your application within 2-3 business days.');
      navigate('/dashboard/tenant');
      
    } catch (error) {
      console.error('Error submitting KYC:', error);
      alert(`Failed to submit KYC: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const getDocumentLabel = (docType) => {
    switch(docType) {
      case 'government_id': return 'Government ID';
      case 'proof_of_address': return 'Proof of Address';
      case 'business_certificate': return 'Business Certificate';
      case 'passport_photo': return 'Passport Photo';
      default: return 'Document';
    }
  };

  if (kycStatus === 'verified') {
    return (
      <div className="kyc-container verified">
        <div className="kyc-card">
          <div className="kyc-icon success">
            <CheckCircle size={48} />
          </div>
          <h2>Verification Complete!</h2>
          <p>Your identity has been verified. You now have full access to all tenant features.</p>
          <button className="btn-primary" onClick={() => navigate('/dashboard/tenant')}>
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (kycStatus === 'pending') {
    return (
      <div className="kyc-container pending">
        <div className="kyc-card">
          <div className="kyc-icon pending">
            <Clock size={48} />
          </div>
          <h2>Verification in Progress</h2>
          <p>Your KYC documents are being reviewed by our team. You'll be notified once verification is complete.</p>
          <p className="small">This typically takes 2-3 business days.</p>
          <button className="btn-outline" onClick={() => navigate('/dashboard/tenant')}>
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (kycStatus === 'rejected') {
    return (
      <div className="kyc-container rejected">
        <div className="kyc-card">
          <div className="kyc-icon error">
            <XCircle size={48} />
          </div>
          <h2>Verification Failed</h2>
          <p>Your KYC submission was rejected. Please check your documents and try again.</p>
          <button className="btn-primary" onClick={() => setKycStatus(null)}>
            Submit New Application
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="kyc-container">
      <div className="kyc-header">
        <button className="back-btn" onClick={() => navigate('/dashboard/tenant')}>
          <ArrowLeft size={20} /> Back to Dashboard
        </button>
        <h1>Complete Your KYC Verification</h1>
        <p>Verify your identity to unlock all tenant features and build trust with landlords</p>
      </div>

      <form onSubmit={handleSubmit} className="kyc-form">
        <div className="form-sections">
          {/* Personal Information */}
          <div className="form-section">
            <div className="section-header">
              <User size={20} />
              <h3>Personal Information</h3>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Date of Birth</label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Occupation</label>
                <input
                  type="text"
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="form-section">
            <div className="section-header">
              <MapPin size={20} />
              <h3>Address Information</h3>
            </div>
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Street Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>LGA</label>
                <input
                  type="text"
                  name="lga"
                  value={formData.lga}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          {/* Business Information (Optional) */}
          <div className="form-section">
            <div className="section-header">
              <Briefcase size={20} />
              <h3>Business Information (Optional)</h3>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label>Business Name</label>
                <input
                  type="text"
                  name="business_name"
                  value={formData.business_name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Business Type</label>
                <input
                  type="text"
                  name="business_type"
                  value={formData.business_type}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group full-width">
                <label>Business Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="2"
                />
              </div>
              <div className="form-group">
                <label>Website</label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>

          {/* Identification */}
          <div className="form-section">
            <div className="section-header">
              <IdCard size={20} />
              <h3>Government ID</h3>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label>ID Type *</label>
                <select
                  name="id_type"
                  value={formData.id_type}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select ID Type</option>
                  <option value="national_id">National ID Card</option>
                  <option value="passport">International Passport</option>
                  <option value="drivers_license">Driver's License</option>
                  <option value="voters_card">Voter's Card</option>
                </select>
              </div>
              <div className="form-group">
                <label>ID Number *</label>
                <input
                  type="text"
                  name="id_number"
                  value={formData.id_number}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="form-section">
            <div className="section-header">
              <Shield size={20} />
              <h3>Emergency Contact</h3>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label>Emergency Contact Name *</label>
                <input
                  type="text"
                  name="emergency_contact_name"
                  value={formData.emergency_contact_name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Emergency Contact Phone *</label>
                <input
                  type="tel"
                  name="emergency_contact_phone"
                  value={formData.emergency_contact_phone}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Relationship *</label>
                <select
                  name="emergency_contact_relationship"
                  value={formData.emergency_contact_relationship}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Relationship</option>
                  <option value="spouse">Spouse</option>
                  <option value="parent">Parent</option>
                  <option value="sibling">Sibling</option>
                  <option value="friend">Friend</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Document Uploads */}
<div className="form-section">
  <div className="section-header">
    <Upload size={20} />
    <h3>Supporting Documents</h3>
    <p>Upload clear images or PDFs of your documents</p>
  </div>
  <div className="documents-grid">
    {/* Government ID - Required */}
    <div className="document-upload-card required">
      <div className="doc-icon">
        <IdCard size={24} />
      </div>
      <div className="doc-info">
        <h4>Government ID <span className="required-star">*</span></h4>
        {documentUrls.government_id ? (
          <div className="uploaded-preview">
            {documentUrls.government_id.startsWith('data:image') ? (
              <img src={documentUrls.government_id} alt="Government ID" />
            ) : (
              <span className="file-name">File uploaded</span>
            )}
            <a href={documentUrls.government_id} target="_blank" rel="noopener" className="view-link">
              <Eye size={14} /> View
            </a>
          </div>
        ) : (
          <div className="upload-area">
            <input
              type="file"
              id="upload-government_id"
              onChange={(e) => handleDocumentChange(e, 'government_id')}
              accept="image/jpeg,image/png,application/pdf"
              required
            />
            <label htmlFor="upload-government_id" className="upload-label">
              <Upload size={20} />
              <span>Upload Government ID</span>
            </label>
            <small>JPG, PNG, PDF (Max 10MB)</small>
          </div>
        )}
      </div>
    </div>

    {/* Proof of Address - Recommended but not required */}
    <div className="document-upload-card optional">
      <div className="doc-icon">
        <Home size={24} />
      </div>
      <div className="doc-info">
        <h4>Proof of Address <span className="optional-badge">Optional</span></h4>
        {documentUrls.proof_of_address ? (
          <div className="uploaded-preview">
            {documentUrls.proof_of_address.startsWith('data:image') ? (
              <img src={documentUrls.proof_of_address} alt="Proof of Address" />
            ) : (
              <span className="file-name">File uploaded</span>
            )}
            <a href={documentUrls.proof_of_address} target="_blank" rel="noopener" className="view-link">
              <Eye size={14} /> View
            </a>
          </div>
        ) : (
          <div className="upload-area">
            <input
              type="file"
              id="upload-proof_of_address"
              onChange={(e) => handleDocumentChange(e, 'proof_of_address')}
              accept="image/jpeg,image/png,application/pdf"
            />
            <label htmlFor="upload-proof_of_address" className="upload-label">
              <Upload size={20} />
              <span>Upload Proof of Address</span>
            </label>
            <small>Utility bill, bank statement, etc.</small>
          </div>
        )}
      </div>
    </div>

    {/* Passport Photo - Recommended but not required */}
    <div className="document-upload-card optional">
      <div className="doc-icon">
        <Camera size={24} />
      </div>
      <div className="doc-info">
        <h4>Passport Photo <span className="optional-badge">Optional</span></h4>
        {documentUrls.passport_photo ? (
          <div className="uploaded-preview">
            {documentUrls.passport_photo.startsWith('data:image') ? (
              <img src={documentUrls.passport_photo} alt="Passport Photo" />
            ) : (
              <span className="file-name">File uploaded</span>
            )}
            <a href={documentUrls.passport_photo} target="_blank" rel="noopener" className="view-link">
              <Eye size={14} /> View
            </a>
          </div>
        ) : (
          <div className="upload-area">
            <input
              type="file"
              id="upload-passport_photo"
              onChange={(e) => handleDocumentChange(e, 'passport_photo')}
              accept="image/jpeg,image/png"
            />
            <label htmlFor="upload-passport_photo" className="upload-label">
              <Upload size={20} />
              <span>Upload Passport Photo</span>
            </label>
            <small>JPG, PNG (Max 5MB)</small>
          </div>
        )}
      </div>
    </div>

    {/* Business Certificate - Optional (only show if business info provided) */}
    {formData.business_name && (
      <div className="document-upload-card optional">
        <div className="doc-icon">
          <Briefcase size={24} />
        </div>
        <div className="doc-info">
          <h4>Business Certificate <span className="optional-badge">Optional</span></h4>
          {documentUrls.business_certificate ? (
            <div className="uploaded-preview">
              {documentUrls.business_certificate.startsWith('data:image') ? (
                <img src={documentUrls.business_certificate} alt="Business Certificate" />
              ) : (
                <span className="file-name">File uploaded</span>
              )}
              <a href={documentUrls.business_certificate} target="_blank" rel="noopener" className="view-link">
                <Eye size={14} /> View
              </a>
            </div>
          ) : (
            <div className="upload-area">
              <input
                type="file"
                id="upload-business_certificate"
                onChange={(e) => handleDocumentChange(e, 'business_certificate')}
                accept="image/jpeg,image/png,application/pdf"
              />
              <label htmlFor="upload-business_certificate" className="upload-label">
                <Upload size={20} />
                <span>Upload Business Certificate</span>
              </label>
              <small>CAC registration, tax ID, etc.</small>
            </div>
          )}
        </div>
      </div>
    )}
  </div>
</div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn-outline" onClick={() => navigate('/dashboard/tenant')}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={submitting || uploading}>
            {submitting ? 'Submitting...' : (uploading ? 'Uploading...' : 'Submit KYC Application')}
          </button>
        </div>

        <div className="kyc-info">
          <AlertCircle size={16} />
          <p>Your information is secure and will only be used for verification purposes. Processing takes 2-3 business days.</p>
        </div>
      </form>
    </div>
  );
};

export default NewTenantKycForm;