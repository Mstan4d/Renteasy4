import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import {
  Shield, Upload, FileText, Building, Users,
  CheckCircle, XCircle, Camera, Download,
  ArrowRight, AlertCircle, HelpCircle
} from 'lucide-react';
import { supabase } from '../../../shared/lib/supabaseClient';
import './EstateVerification.css';

const EstateVerification = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    businessName: '',
    businessType: 'estate-firm',
    registrationNumber: '',
    taxIdNumber: '',
    yearEstablished: '',
    officeAddress: '',
    city: '',
    state: '',
    country: 'Nigeria',
    postalCode: '',
    contactPerson: '',
    contactEmail: '',
    contactPhone: '',
    alternativePhone: '',
    cacDocument: null,
    taxDocument: null,
    proofOfAddress: null,
    businessPlan: null,
    directors: [{
      name: '',
      position: 'Director',
      idType: 'national-id',
      idNumber: '',
      idDocument: null,
      photo: null
    }],
    servicesOffered: [],
    yearsInOperation: '',
    numberOfEmployees: '',
    annualTurnover: '',
    status: 'pending',
    submittedAt: '',
    reviewedBy: '',
    reviewDate: '',
    comments: ''
  });

  const [documentPreview, setDocumentPreview] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingVerification, setExistingVerification] = useState(null);

  useEffect(() => {
    if (user) {
      checkExistingVerification();
    }
  }, [user]);

  const checkExistingVerification = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('estate_verifications')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setExistingVerification(data);
        
        // If already verified or under review, show status
        if (data.status !== 'pending') {
          navigate('/dashboard/estate-firm');
        } else {
          // Load existing data into form
          setFormData({
            businessName: data.business_name || '',
            businessType: data.business_type || 'estate-firm',
            registrationNumber: data.registration_number || '',
            taxIdNumber: data.tax_id_number || '',
            yearEstablished: data.year_established || '',
            officeAddress: data.office_address || '',
            city: data.city || '',
            state: data.state || '',
            country: data.country || 'Nigeria',
            postalCode: data.postal_code || '',
            contactPerson: data.contact_person || '',
            contactEmail: data.contact_email || '',
            contactPhone: data.contact_phone || '',
            alternativePhone: data.alternative_phone || '',
            directors: data.directors || [{
              name: '',
              position: 'Director',
              idType: 'national-id',
              idNumber: '',
              idDocument: null,
              photo: null
            }],
            servicesOffered: data.services_offered || [],
            yearsInOperation: data.years_in_operation || '',
            numberOfEmployees: data.number_of_employees || '',
            annualTurnover: data.annual_turnover || '',
            status: data.status || 'pending'
          });
        }
      }
    } catch (error) {
      console.error('Error checking verification:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleDirectorChange = (index, field, value) => {
    setFormData(prev => {
      const updatedDirectors = [...prev.directors];
      updatedDirectors[index] = {
        ...updatedDirectors[index],
        [field]: value
      };
      return { ...prev, directors: updatedDirectors };
    });
  };

  const addDirector = () => {
    setFormData(prev => ({
      ...prev,
      directors: [
        ...prev.directors,
        {
          name: '',
          position: 'Director',
          idType: 'national-id',
          idNumber: '',
          idDocument: null,
          photo: null
        }
      ]
    }));
  };

  const removeDirector = (index) => {
    setFormData(prev => ({
      ...prev,
      directors: prev.directors.filter((_, i) => i !== index)
    }));
  };

  const handleFileUpload = async (field, file) => {
    if (!file || !user) return;

    try {
      // Check file size
      const maxSize = field === 'businessPlan' ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
      if (file.size > maxSize) {
        alert(`File size must be less than ${maxSize / (1024 * 1024)}MB`);
        return;
      }

      // Check file type
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!validTypes.includes(file.type) && !file.name.toLowerCase().endsWith('.pdf')) {
        alert('Please upload PDF or image files only');
        return;
      }

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setDocumentPreview(prev => ({
        ...prev,
        [field]: previewUrl
      }));

      setFormData(prev => ({
        ...prev,
        [field]: file
      }));

    } catch (error) {
      console.error('Error handling file upload:', error);
      alert('Failed to upload file. Please try again.');
    }
  };

  const handleServiceToggle = (service) => {
    setFormData(prev => {
      const services = prev.servicesOffered.includes(service)
        ? prev.servicesOffered.filter(s => s !== service)
        : [...prev.servicesOffered, service];
      return { ...prev, servicesOffered: services };
    });
  };

  const validateStep = (step) => {
    const newErrors = {};

    switch(step) {
      case 1:
        if (!formData.businessName.trim()) newErrors.businessName = 'Business name is required';
        if (!formData.registrationNumber.trim()) newErrors.registrationNumber = 'CAC registration number is required';
        if (!formData.taxIdNumber.trim()) newErrors.taxIdNumber = 'Tax ID number is required';
        break;
      
      case 2:
        if (!formData.officeAddress.trim()) newErrors.officeAddress = 'Office address is required';
        if (!formData.city.trim()) newErrors.city = 'City is required';
        if (!formData.state.trim()) newErrors.state = 'State is required';
        break;
      
      case 3:
        if (!formData.contactPerson.trim()) newErrors.contactPerson = 'Contact person is required';
        if (!formData.contactEmail.trim()) newErrors.contactEmail = 'Contact email is required';
        if (!formData.contactPhone.trim()) newErrors.contactPhone = 'Contact phone is required';
        break;
      
      case 4:
        if (!formData.cacDocument) newErrors.cacDocument = 'CAC certificate is required';
        if (!formData.taxDocument) newErrors.taxDocument = 'Tax clearance certificate is required';
        if (!formData.proofOfAddress) newErrors.proofOfAddress = 'Proof of address is required';
        break;
      
      case 5:
        formData.directors.forEach((director, index) => {
          if (!director.name.trim()) newErrors[`director_${index}_name`] = 'Director name is required';
          if (!director.idNumber.trim()) newErrors[`director_${index}_idNumber`] = 'ID number is required';
        });
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const uploadDocument = async (file, documentType) => {
    if (!file || !user) return null;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${documentType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const filePath = `verifications/${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('estate-verification-docs')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('estate-verification-docs')
        .getPublicUrl(filePath);

      return publicUrl;

    } catch (error) {
      console.error(`Error uploading ${documentType}:`, error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(currentStep)) {
      alert('Please fix all errors before submitting');
      return;
    }

    if (!user) {
      alert('Please login to submit verification');
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload documents to Supabase Storage
      let cacDocumentUrl = null;
      let taxDocumentUrl = null;
      let proofOfAddressUrl = null;
      let businessPlanUrl = null;

      if (formData.cacDocument) {
        cacDocumentUrl = await uploadDocument(formData.cacDocument, 'cac');
      }
      if (formData.taxDocument) {
        taxDocumentUrl = await uploadDocument(formData.taxDocument, 'tax');
      }
      if (formData.proofOfAddress) {
        proofOfAddressUrl = await uploadDocument(formData.proofOfAddress, 'address');
      }
      if (formData.businessPlan) {
        businessPlanUrl = await uploadDocument(formData.businessPlan, 'business_plan');
      }

      // Prepare verification data
      const verificationData = {
        user_id: user.id,
        business_name: formData.businessName,
        business_type: formData.businessType,
        registration_number: formData.registrationNumber,
        tax_id_number: formData.taxIdNumber,
        year_established: formData.yearEstablished ? parseInt(formData.yearEstablished) : null,
        office_address: formData.officeAddress,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        postal_code: formData.postalCode,
        contact_person: formData.contactPerson,
        contact_email: formData.contactEmail,
        contact_phone: formData.contactPhone,
        alternative_phone: formData.alternativePhone,
        cac_document_url: cacDocumentUrl,
        tax_document_url: taxDocumentUrl,
        proof_of_address_url: proofOfAddressUrl,
        business_plan_url: businessPlanUrl,
        directors: formData.directors,
        services_offered: formData.servicesOffered,
        years_in_operation: formData.yearsInOperation ? parseInt(formData.yearsInOperation) : null,
        number_of_employees: formData.numberOfEmployees ? parseInt(formData.numberOfEmployees) : null,
        annual_turnover: formData.annualTurnover ? parseFloat(formData.annualTurnover) : null,
        status: 'pending',
        submitted_at: new Date().toISOString()
      };

      // Insert into database
      const { data, error } = await supabase
        .from('estate_verifications')
        .upsert(verificationData, {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (error) throw error;

      // Update estate firm profile
      await supabase
        .from('estate_firm_profiles')
        .upsert({
          user_id: user.id,
          firm_name: formData.businessName,
          business_email: formData.contactEmail,
          business_phone: formData.contactPhone,
          address: formData.officeAddress,
          certification: {
            cac_number: formData.registrationNumber,
            rc_number: formData.registrationNumber,
            certified: false,
            verification_status: 'pending'
          }
        }, {
          onConflict: 'user_id'
        });

      // Log activity
      await supabase.from('activities').insert({
        user_id: user.id,
        type: 'verification',
        action: 'submit',
        description: `Submitted business verification for ${formData.businessName}`,
        created_at: new Date().toISOString()
      });

      alert('Verification submitted successfully! Our team will review your application within 3-5 business days.');
      navigate('/dashboard/estate-firm');
      
    } catch (error) {
      console.error('Submission error:', error);
      alert('Failed to submit verification. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

   const renderStep = () => {
    switch(currentStep) {
      case 1:
        return (
          <div className="verification-step">
            <h3>Business Information</h3>
            <p className="step-description">Provide your official business details</p>
            
            <div className="form-grid">
              <div className="form-group">
                <label>Business Name *</label>
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleInputChange}
                  placeholder="Enter official business name"
                  className={`form-input ${errors.businessName ? 'error' : ''}`}
                />
                {errors.businessName && <span className="error-text">{errors.businessName}</span>}
              </div>
              
              <div className="form-group">
                <label>Business Type</label>
                <select
                  name="businessType"
                  value={formData.businessType}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="estate-firm">Estate Firm/Agency</option>
                  <option value="property-management">Property Management Company</option>
                  <option value="real-estate">Real Estate Developer</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>CAC Registration Number *</label>
                <input
                  type="text"
                  name="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={handleInputChange}
                  placeholder="RC-1234567"
                  className={`form-input ${errors.registrationNumber ? 'error' : ''}`}
                />
                {errors.registrationNumber && <span className="error-text">{errors.registrationNumber}</span>}
              </div>
              
              <div className="form-group">
                <label>Tax Identification Number (TIN) *</label>
                <input
                  type="text"
                  name="taxIdNumber"
                  value={formData.taxIdNumber}
                  onChange={handleInputChange}
                  placeholder="Enter TIN"
                  className={`form-input ${errors.taxIdNumber ? 'error' : ''}`}
                />
                {errors.taxIdNumber && <span className="error-text">{errors.taxIdNumber}</span>}
              </div>
              
              <div className="form-group">
                <label>Year Established</label>
                <input
                  type="number"
                  name="yearEstablished"
                  value={formData.yearEstablished}
                  onChange={handleInputChange}
                  placeholder="e.g., 2015"
                  min="1900"
                  max={new Date().getFullYear()}
                  className="form-input"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="verification-step">
            <h3>Business Address</h3>
            <p className="step-description">Provide your official business address</p>
            
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Office Address *</label>
                <textarea
                  name="officeAddress"
                  value={formData.officeAddress}
                  onChange={handleInputChange}
                  placeholder="Full office address"
                  rows={3}
                  className={`form-textarea ${errors.officeAddress ? 'error' : ''}`}
                />
                {errors.officeAddress && <span className="error-text">{errors.officeAddress}</span>}
              </div>
              
              <div className="form-group">
                <label>City *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="City"
                  className={`form-input ${errors.city ? 'error' : ''}`}
                />
                {errors.city && <span className="error-text">{errors.city}</span>}
              </div>
              
              <div className="form-group">
                <label>State *</label>
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className={`form-select ${errors.state ? 'error' : ''}`}
                >
                  <option value="">Select State</option>
                  <option value="Lagos">Lagos</option>
                  <option value="Abuja">Abuja</option>
                  <option value="Rivers">Rivers</option>
                  <option value="Oyo">Oyo</option>
                  <option value="Kano">Kano</option>
                  <option value="Edo">Edo</option>
                  <option value="Delta">Delta</option>
                  <option value="Ogun">Ogun</option>
                  <option value="Kaduna">Kaduna</option>
                  <option value="Plateau">Plateau</option>
                  <option value="Akwa Ibom">Akwa Ibom</option>
                  <option value="Cross River">Cross River</option>
                  <option value="Imo">Imo</option>
                  <option value="Enugu">Enugu</option>
                  <option value="Anambra">Anambra</option>
                  <option value="Abia">Abia</option>
                </select>
                {errors.state && <span className="error-text">{errors.state}</span>}
              </div>
              
              <div className="form-group">
                <label>Country</label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="form-input"
                  disabled
                />
              </div>
              
              <div className="form-group">
                <label>Postal Code</label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  placeholder="Postal code"
                  className="form-input"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="verification-step">
            <h3>Contact Information</h3>
            <p className="step-description">Primary contact details for verification</p>
            
            <div className="form-grid">
              <div className="form-group">
                <label>Contact Person *</label>
                <input
                  type="text"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleInputChange}
                  placeholder="Full name of contact person"
                  className={`form-input ${errors.contactPerson ? 'error' : ''}`}
                />
                {errors.contactPerson && <span className="error-text">{errors.contactPerson}</span>}
              </div>
              
              <div className="form-group">
                <label>Contact Email *</label>
                <input
                  type="email"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleInputChange}
                  placeholder="contact@company.com"
                  className={`form-input ${errors.contactEmail ? 'error' : ''}`}
                />
                {errors.contactEmail && <span className="error-text">{errors.contactEmail}</span>}
              </div>
              
              <div className="form-group">
                <label>Contact Phone *</label>
                <input
                  type="tel"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleInputChange}
                  placeholder="+2348012345678"
                  className={`form-input ${errors.contactPhone ? 'error' : ''}`}
                />
                {errors.contactPhone && <span className="error-text">{errors.contactPhone}</span>}
              </div>
              
              <div className="form-group">
                <label>Alternative Phone</label>
                <input
                  type="tel"
                  name="alternativePhone"
                  value={formData.alternativePhone}
                  onChange={handleInputChange}
                  placeholder="Alternative phone number"
                  className="form-input"
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="verification-step">
            <h3>Business Documents</h3>
            <p className="step-description">Upload required business documents</p>
            
            <div className="documents-requirements">
              <h4>Document Requirements</h4>
              <div className="requirements-list">
                {documentRequirements.map((doc, index) => (
                  <div key={index} className="requirement-item">
                    <div className="requirement-header">
                      <FileText size={16} />
                      <div>
                        <strong>{doc.title} {doc.required ? '*' : ''}</strong>
                        <small>{doc.description}</small>
                      </div>
                    </div>
                    <div className="requirement-meta">
                      <span className="format">{doc.format}</span>
                      <span className="size">{doc.size}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="documents-upload">
              <div className="upload-grid">
                <DocumentUpload
                  label="CAC Certificate *"
                  name="cacDocument"
                  file={formData.cacDocument}
                  preview={documentPreview.cacDocument}
                  onUpload={handleFileUpload}
                  error={errors.cacDocument}
                />
                
                <DocumentUpload
                  label="Tax Clearance Certificate *"
                  name="taxDocument"
                  file={formData.taxDocument}
                  preview={documentPreview.taxDocument}
                  onUpload={handleFileUpload}
                  error={errors.taxDocument}
                />
                
                <DocumentUpload
                  label="Proof of Business Address *"
                  name="proofOfAddress"
                  file={formData.proofOfAddress}
                  preview={documentPreview.proofOfAddress}
                  onUpload={handleFileUpload}
                  error={errors.proofOfAddress}
                />
                
                <DocumentUpload
                  label="Business Plan (Optional)"
                  name="businessPlan"
                  file={formData.businessPlan}
                  preview={documentPreview.businessPlan}
                  onUpload={handleFileUpload}
                />
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="verification-step">
            <h3>Directors/Partners Information</h3>
            <p className="step-description">Provide details of all directors/partners</p>
            
            {formData.directors.map((director, index) => (
              <div key={index} className="director-form">
                <div className="director-header">
                  <h4>Director {index + 1}</h4>
                  {index > 0 && (
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => removeDirector(index)}
                    >
                      <XCircle size={14} />
                      Remove
                    </button>
                  )}
                </div>
                
                <div className="form-grid">
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      value={director.name}
                      onChange={(e) => handleDirectorChange(index, 'name', e.target.value)}
                      placeholder="Full name"
                      className={`form-input ${errors[`director_${index}_name`] ? 'error' : ''}`}
                    />
                    {errors[`director_${index}_name`] && (
                      <span className="error-text">{errors[`director_${index}_name`]}</span>
                    )}
                  </div>
                  
                  <div className="form-group">
                    <label>Position</label>
                    <input
                      type="text"
                      value={director.position}
                      onChange={(e) => handleDirectorChange(index, 'position', e.target.value)}
                      placeholder="Director, Partner, etc."
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>ID Type</label>
                    <select
                      value={director.idType}
                      onChange={(e) => handleDirectorChange(index, 'idType', e.target.value)}
                      className="form-select"
                    >
                      {directorIdTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>ID Number *</label>
                    <input
                      type="text"
                      value={director.idNumber}
                      onChange={(e) => handleDirectorChange(index, 'idNumber', e.target.value)}
                      placeholder="ID Number"
                      className={`form-input ${errors[`director_${index}_idNumber`] ? 'error' : ''}`}
                    />
                    {errors[`director_${index}_idNumber`] && (
                      <span className="error-text">{errors[`director_${index}_idNumber`]}</span>
                    )}
                  </div>
                  
                  <div className="form-group">
                    <label>ID Document</label>
                    <div className="file-upload">
                      <label className="upload-btn">
                        <Upload size={14} />
                        Upload ID Document
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleDirectorChange(index, 'idDocument', e.target.files[0])}
                          style={{ display: 'none' }}
                        />
                      </label>
                      {director.idDocument && (
                        <span className="file-name">{director.idDocument.name}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            <button
              type="button"
              className="btn btn-outline"
              onClick={addDirector}
            >
              <Users size={16} />
              Add Another Director/Partner
            </button>
          </div>
        );

      case 6:
        return (
          <div className="verification-step">
            <h3>Business Operations</h3>
            <p className="step-description">Information about your business operations</p>
            
            <div className="services-section">
              <h4>Services Offered</h4>
              <div className="services-grid">
                {[
                  'Property Sales',
                  'Property Rentals', 
                  'Property Management',
                  'Real Estate Consulting',
                  'Valuation Services',
                  'Tenant Screening',
                  'Property Marketing',
                  'Legal Services',
                  'Rent Collection',
                  'Property Development'
                ].map(service => (
                  <div
                    key={service}
                    className={`service-option ${formData.servicesOffered.includes(service) ? 'selected' : ''}`}
                    onClick={() => handleServiceToggle(service)}
                  >
                    {service}
                    {formData.servicesOffered.includes(service) && (
                      <CheckCircle size={16} className="check-icon" />
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="form-grid">
              <div className="form-group">
                <label>Years in Operation</label>
                <input
                  type="number"
                  name="yearsInOperation"
                  value={formData.yearsInOperation}
                  onChange={handleInputChange}
                  placeholder="Number of years"
                  min="0"
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label>Number of Employees</label>
                <input
                  type="number"
                  name="numberOfEmployees"
                  value={formData.numberOfEmployees}
                  onChange={handleInputChange}
                  placeholder="Approximate number"
                  min="0"
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label>Annual Turnover (₦)</label>
                <input
                  type="number"
                  name="annualTurnover"
                  value={formData.annualTurnover}
                  onChange={handleInputChange}
                  placeholder="Approximate annual turnover"
                  min="0"
                  className="form-input"
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="estate-verification">
      {/* Header */}
      <div className="verification-header">
        <div className="header-content">
          <h1>Business Verification</h1>
          <p className="subtitle">
            Complete verification to unlock all platform features
          </p>
        </div>
        
        <div className="verification-steps">
          {[1, 2, 3, 4, 5, 6].map(step => (
            <div key={step} className="step-indicator">
              <div className={`step-circle ${currentStep >= step ? 'active' : ''}`}>
                {step}
              </div>
              <span className="step-label">
                {step === 1 && 'Business Info'}
                {step === 2 && 'Address'}
                {step === 3 && 'Contact'}
                {step === 4 && 'Documents'}
                {step === 5 && 'Directors'}
                {step === 6 && 'Operations'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-container">
        <div 
          className="progress-bar" 
          style={{ width: `${(currentStep / 6) * 100}%` }}
        ></div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="verification-form">
        {renderStep()}
        
        {/* Form Actions */}
        <div className="form-actions">
          <div className="action-buttons">
            {currentStep > 1 && (
              <button
                type="button"
                className="btn btn-outline"
                onClick={prevStep}
                disabled={isSubmitting}
              >
                Previous
              </button>
            )}
            
            {currentStep < 6 ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={nextStep}
                disabled={isSubmitting}
              >
                Continue
                <ArrowRight size={16} />
              </button>
            ) : (
              <button
                type="submit"
                className="btn btn-success"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner"></span>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Shield size={16} />
                    Submit for Verification
                  </>
                )}
              </button>
            )}
          </div>
          
          <div className="form-help">
            <HelpCircle size={16} />
            <small>
              Step {currentStep} of 6 • {Math.round((currentStep / 6) * 100)}% complete
            </small>
          </div>
        </div>
      </form>

      {/* Important Notice */}
      <div className="verification-notice">
        <AlertCircle size={20} />
        <div className="notice-content">
          <h4>Important Information</h4>
          <ul>
            <li>Verification process takes 3-5 business days</li>
            <li>All documents must be clear and legible</li>
            <li>Ensure all information matches your business documents</li>
            <li>You will receive email notification once verified</li>
            <li>Verified firms get premium features and higher trust ratings</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// Document Upload Component
const DocumentUpload = ({ label, name, file, preview, onUpload, error }) => {
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      onUpload(name, selectedFile);
    }
  };

  return (
    <div className="document-upload">
      <label className="upload-label">
        {label}
        {error && <span className="error-indicator"> *</span>}
      </label>
      
      <div className={`upload-area ${error ? 'error' : ''}`}>
        {preview ? (
          <div className="document-preview">
            <img src={preview} alt="Preview" />
            <div className="preview-overlay">
              <span>{file?.name || 'Document'}</span>
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => onUpload(name, null)}
              >
                Change
              </button>
            </div>
          </div>
        ) : (
          <div className="upload-placeholder">
            <Upload size={24} />
            <p>Click to upload document</p>
            <small>PDF, JPG, PNG up to 5MB</small>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              style={{ display: 'none' }}
              id={`file-${name}`}
            />
          </div>
        )}
      </div>
      
      {error && <span className="error-text">{error}</span>}
    </div>
  );
};


export default EstateVerification;