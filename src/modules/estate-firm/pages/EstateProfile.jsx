import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../shared/context/AuthContext';
import {
  Building, Mail, Phone, Globe, MapPin, Edit,
  Save, Upload, CheckCircle, XCircle, Camera,
  Users, Briefcase, Calendar, Shield, Award,
  FileText, DollarSign, Home, Star
} from 'lucide-react';
import { supabase } from '../../../shared/lib/supabaseClient';
import RentEasyLoader from '../../../shared/components/RentEasyLoader';
import './EstateProfile.css';

const EstateProfile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    firmName: '',
    contactPerson: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    yearEstablished: '',
    totalAgents: '',
    propertiesManaged: '',
    specialties: [],
    description: '',
    logo: '',
    coverImage: '',
    officeHours: '',
    socialLinks: {
      facebook: '',
      twitter: '',
      linkedin: '',
      instagram: ''
    },
    services: [],
    certification: {
      cacNumber: '',
      rcNumber: '',
      certified: false,
      verificationStatus: 'pending'
    }
  });

  const [stats, setStats] = useState({
    totalProperties: 0,
    activeClients: 0,
    monthlyRevenue: 0,
    clientSatisfaction: 0
  });

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
  try {
    setLoading(true);

    // 1. Get estate firm profile
    const { data: profile, error } = await supabase
      .from('estate_firm_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    if (profile) {
      setFormData({
        firmName: profile.firm_name || '',
        contactPerson: profile.contact_person || '',
        email: profile.business_email || user.email || '',
        phone: profile.business_phone || '',
        website: profile.website || '',
        address: profile.address || '',
        yearEstablished: profile.year_established || '',
        totalAgents: profile.total_agents || '',
        propertiesManaged: profile.properties_managed || '',
        specialties: profile.specialties || [],
        description: profile.description || '',
        logo: profile.logo_url || '',
        coverImage: profile.cover_image_url || '',
        officeHours: profile.office_hours || '',
        socialLinks: profile.social_links || {
          facebook: '',
          twitter: '',
          linkedin: '',
          instagram: ''
        },
        services: profile.services || [],
        certification: profile.certification || {
          cacNumber: '',
          rcNumber: '',
          certified: false,
          verificationStatus: 'pending'
        }
      });

      // 2. Compute stats
      await computeStats(profile.id);
    } else {
      // Create initial profile if doesn't exist
      await createInitialProfile();
    }

  } catch (error) {
    console.error('Error loading profile:', error);
  } finally {
    setLoading(false);
  }
};

const computeStats = async (estateFirmId) => {
  try {
    // Count properties managed by this firm
    const { count: totalProperties, error: propError } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true })
      .eq('estate_firm_id', estateFirmId);

    if (propError) console.warn('Error counting properties:', propError);

    // Count active clients (landlords) from estate_landlords
    const { count: activeClients, error: clientError } = await supabase
      .from('estate_landlords')
      .select('*', { count: 'exact', head: true })
      .eq('estate_firm_id', estateFirmId);

    if (clientError) console.warn('Error counting landlords:', clientError);

    // Calculate monthly revenue (current month's confirmed rent payments)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // First get all property IDs for this firm
    const { data: properties } = await supabase
      .from('properties')
      .select('id')
      .eq('estate_firm_id', estateFirmId);

    let monthlyRevenue = 0;
    if (properties && properties.length > 0) {
      const propertyIds = properties.map(p => p.id);

      // Get all units for those properties
      const { data: units } = await supabase
        .from('units')
        .select('id')
        .in('property_id', propertyIds);

      if (units && units.length > 0) {
        const unitIds = units.map(u => u.id);

        // Sum confirmed payments in this month
        const { data: payments } = await supabase
          .from('payments')
          .select('amount')
          .eq('payment_type', 'rent')
          .eq('status', 'confirmed')
          .in('unit_id', unitIds)
          .gte('created_at', startOfMonth.toISOString())
          .lte('created_at', endOfMonth.toISOString());

        if (payments) {
          monthlyRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
        }
      }
    }

    // Update stats state
    setStats({
      totalProperties: totalProperties || 0,
      activeClients: activeClients || 0,
      monthlyRevenue,
      clientSatisfaction: 0 // You can calculate this later if needed
    });

  } catch (error) {
    console.error('Error computing stats:', error);
  }
};

  const createInitialProfile = async () => {
    try {
      const { error } = await supabase
        .from('estate_firm_profiles')
        .insert({
          user_id: user.id,
          firm_name: user.user_metadata?.company || 'My Estate Firm',
          business_email: user.email,
          created_at: new Date().toISOString()
        });

      if (error) throw error;
      
      // Reload profile
      loadProfile();

    } catch (error) {
      console.error('Error creating profile:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSocialLinkChange = (platform, value) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value
      }
    }));
  };

  const handleSpecialtyToggle = (specialty) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter(s => s !== specialty)
        : [...prev.specialties, specialty]
    }));
  };

  const handleServiceToggle = (service) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }));
  };

  const handleReset = () => {
    setIsEditing(false);
    loadProfile(); // reload original data
  };

  const uploadImage = async (file, type) => {
    if (!file || !user) return null;

    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('estate-files')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error details:', uploadError);
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('estate-files')
        .getPublicUrl(filePath);

      return publicUrl;

    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      if (error.message?.includes('bucket')) {
        alert('Storage bucket not found. Please contact support.');
      } else if (error.message?.includes('permission')) {
        alert('Permission denied. Please check your login status.');
      } else {
        alert(`Failed to upload ${type}. Please try again.`);
      }
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!user) {
      alert('You must be logged in to upload.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      e.target.value = '';
      return;
    }
    try {
      const logoUrl = await uploadImage(file, 'logo');
      if (logoUrl) {
        setFormData(prev => ({ ...prev, logo: logoUrl }));
      }
    } catch (error) {
      // error already shown in uploadImage
    }
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!user) {
      alert('You must be logged in to upload.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      e.target.value = '';
      return;
    }
    try {
      const coverUrl = await uploadImage(file, 'cover');
      if (coverUrl) {
        setFormData(prev => ({ ...prev, coverImage: coverUrl }));
      }
    } catch (error) {
      // error already shown
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    try {
      const profileData = {
        user_id: user.id,
        firm_name: formData.firmName,
        contact_person: formData.contactPerson,
        business_email: formData.email,
        business_phone: formData.phone,
        website: formData.website,
        address: formData.address,
        year_established: formData.yearEstablished ? parseInt(formData.yearEstablished) : null,
        total_agents: formData.totalAgents ? parseInt(formData.totalAgents) : 0,
        properties_managed: formData.propertiesManaged ? parseInt(formData.propertiesManaged) : 0,
        specialties: formData.specialties,
        description: formData.description,
        logo_url: formData.logo,
        cover_image_url: formData.coverImage,
        office_hours: formData.officeHours,
        social_links: formData.socialLinks,
        services: formData.services,
        certification: formData.certification,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('estate_firm_profiles')
        .upsert(profileData, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      // Log activity
      await supabase.from('activities').insert({
        user_id: user.id,
        type: 'profile',
        action: 'update',
        description: 'Updated estate firm profile',
        created_at: new Date().toISOString()
      });

      alert('Profile updated successfully!');
      setIsEditing(false);
      loadProfile(); // Refresh data

    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  if (loading) {
  return <RentEasyLoader message="Loading your Profile..." fullScreen />;
}

  return (
    <div className="estate-profile">
      {/* Cover Image */}
      <div className="cover-image">
        {formData.coverImage ? (
          <img src={formData.coverImage} alt="Cover" />
        ) : (
          <div className="cover-placeholder">
            <Building size={48} />
            <span>Upload cover image</span>
          </div>
        )}
        
        {isEditing && (
          <>
            <label htmlFor="cover-upload" className="cover-upload-btn">
              <Camera size={16} />
              Upload Cover
            </label>
            <input
              id="cover-upload"
              type="file"
              accept="image/*"
              onChange={handleCoverUpload}
              style={{ display: 'none' }}
            />
          </>
        )}
      </div>

      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-info">
          <div className="avatar-section">
            <div className="avatar">
              {formData.logo ? (
                <img src={formData.logo} alt="Logo" />
              ) : (
                <Building size={40} />
              )}
              
              {isEditing && (
                <>
                  <label htmlFor="logo-upload" className="avatar-upload-btn">
                    <Camera size={12} />
                  </label>
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    style={{ display: 'none' }}
                  />
                </>
              )}
            </div>
            
            <div className="profile-details">
              <div className="firm-header">
                <h1>{formData.firmName}</h1>
                {formData.certification.certified && (
                  <span className="verified-badge">
                    <Shield size={14} />
                    Verified Firm
                  </span>
                )}
              </div>
              
              <div className="contact-info">
                <span>
                  <Phone size={14} />
                  {formData.phone}
                </span>
                <span>
                  <Mail size={14} />
                  {formData.email}
                </span>
                {formData.website && (
                  <span>
                    <Globe size={14} />
                    <a href={formData.website} target="_blank" rel="noopener noreferrer">
                      {formData.website}
                    </a>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="profile-actions">
            {isEditing ? (
              <div className="edit-actions">
                <button className="btn btn-primary" onClick={handleSubmit}>
                  <Save size={16} />
                  Save Changes
                </button>
                <button className="btn btn-outline" onClick={handleReset}>
                  <XCircle size={16} />
                  Cancel
                </button>
              </div>
            ) : (
              <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
                <Edit size={16} />
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="profile-stats">
          <div className="stat-card">
            <Building size={20} />
            <div className="stat-details">
              <span className="stat-value">{stats.totalProperties}</span>
              <span className="stat-label">Properties</span>
            </div>
          </div>
          
          <div className="stat-card">
            <Users size={20} />
            <div className="stat-details">
              <span className="stat-value">{stats.activeClients}</span>
              <span className="stat-label">Active Clients</span>
            </div>
          </div>
          
          <div className="stat-card">
            <DollarSign size={20} />
            <div className="stat-details">
              <span className="stat-value">₦{(stats.monthlyRevenue / 1000000).toFixed(1)}M</span>
              <span className="stat-label">Monthly Revenue</span>
            </div>
          </div>
          
          <div className="stat-card">
            <Star size={20} />
            <div className="stat-details">
              <span className="stat-value">{stats.clientSatisfaction}/5</span>
              <span className="stat-label">Satisfaction</span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="profile-content">
        {/* Left Column - About & Details */}
        <div className="left-column">
          {/* About Section */}
          <div className="profile-section">
            <h3>About Firm</h3>
            {isEditing ? (
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="form-textarea"
                rows={6}
                placeholder="Tell us about your firm..."
              />
            ) : (
              <p className="about-text">{formData.description}</p>
            )}
          </div>

          {/* Contact Details */}
          <div className="profile-section">
            <h3>Contact Details</h3>
            <div className="contact-grid">
              <div className="contact-item">
                <label>Address</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                ) : (
                  <span className="contact-value">
                    <MapPin size={14} />
                    {formData.address}
                  </span>
                )}
              </div>
              
              <div className="contact-item">
                <label>Contact Person</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                ) : (
                  <span className="contact-value">{formData.contactPerson}</span>
                )}
              </div>
              
              <div className="contact-item">
                <label>Office Hours</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="officeHours"
                    value={formData.officeHours}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                ) : (
                  <span className="contact-value">
                    <Calendar size={14} />
                    {formData.officeHours}
                  </span>
                )}
              </div>
              
              <div className="contact-item">
                <label>Year Established</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="yearEstablished"
                    value={formData.yearEstablished}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                ) : (
                  <span className="contact-value">{formData.yearEstablished}</span>
                )}
              </div>
            </div>
          </div>

          {/* Firm Statistics */}
          <div className="profile-section">
            <h3>Firm Statistics</h3>
            <div className="firm-stats">
              <div className="firm-stat">
                <Briefcase size={16} />
                <div>
                  <span className="stat-label">Total Employees</span>
                  {isEditing ? (
                    <input
                      type="text"
                      name="totalAgents"
                      value={formData.totalAgents}
                      onChange={handleInputChange}
                      className="form-input-sm"
                    />
                  ) : (
                    <span className="stat-value">{formData.totalAgents}</span>
                  )}
                </div>
              </div>
              
              <div className="firm-stat">
                <Home size={16} />
                <div>
                  <span className="stat-label">Properties Managed</span>
                  {isEditing ? (
                    <input
                      type="text"
                      name="propertiesManaged"
                      value={formData.propertiesManaged}
                      onChange={handleInputChange}
                      className="form-input-sm"
                    />
                  ) : (
                    <span className="stat-value">{formData.propertiesManaged}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Services & Social */}
        <div className="right-column">
          {/* Services */}
          <div className="profile-section">
            <h3>Services Offered</h3>
            <div className="services-grid">
              {[
                'Property Sales', 'Property Rentals', 'Property Management',
                'Real Estate Consulting', 'Valuation Services', 'Tenant Screening',
                'Property Marketing', 'Legal Services', 'Rent Collection'
              ].map(service => (
                <div
                  key={service}
                  className={`service-tag ${formData.services.includes(service) ? 'active' : ''}`}
                  onClick={() => isEditing && handleServiceToggle(service)}
                >
                  {service}
                  {formData.services.includes(service) && isEditing && (
                    <span className="remove-tag">×</span>
                  )}
                </div>
              ))}
            </div>
            {isEditing && <small className="hint">Click to toggle services</small>}
          </div>

          {/* Specialties */}
          <div className="profile-section">
            <h3>Specialties</h3>
            <div className="specialties-list">
              {['Commercial', 'Residential', 'Industrial', 'Luxury', 'Office Space', 'Retail', 'Land'].map(specialty => (
                <div
                  key={specialty}
                  className={`specialty-tag ${formData.specialties.includes(specialty) ? 'active' : ''}`}
                  onClick={() => isEditing && handleSpecialtyToggle(specialty)}
                >
                  {specialty}
                  {formData.specialties.includes(specialty) && isEditing && (
                    <span className="remove-tag">×</span>
                  )}
                </div>
              ))}
            </div>
            {isEditing && <small className="hint">Click to toggle specialties</small>}
          </div>

          {/* Social Links */}
          <div className="profile-section">
            <h3>Social Links</h3>
            <div className="social-links">
              {['facebook', 'twitter', 'linkedin', 'instagram'].map(platform => (
                <div key={platform} className="social-input">
                  <span className="social-icon">{platform.charAt(0).toUpperCase()}</span>
                  {isEditing ? (
                    <input
                      type="url"
                      value={formData.socialLinks[platform]}
                      onChange={(e) => handleSocialLinkChange(platform, e.target.value)}
                      placeholder={`${platform}.com/your-profile`}
                      className="form-input"
                    />
                  ) : (
                    <span className="social-url">
                      {formData.socialLinks[platform] || 'Not provided'}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Certification */}
          <div className="profile-section">
            <h3>Business Certification</h3>
            <div className="certification-info">
              <div className="cert-item">
                <FileText size={14} />
                <div>
                  <span className="cert-label">CAC Number</span>
                  <span className="cert-value">{formData.certification.cacNumber || 'Not provided'}</span>
                </div>
              </div>
              
              <div className="cert-item">
                <Award size={14} />
                <div>
                  <span className="cert-label">RC Number</span>
                  <span className="cert-value">{formData.certification.rcNumber || 'Not provided'}</span>
                </div>
              </div>
              
              <div className="cert-item">
                <Shield size={14} />
                <div>
                  <span className="cert-label">Verification Status</span>
                  <span className={`status-badge ${formData.certification.verificationStatus}`}>
                    {formData.certification.verificationStatus}
                  </span>
                </div>
              </div>
            </div>
            
            {!formData.certification.certified && (
              <div className="verification-cta">
                <p>Verify your business to unlock all features</p>
                <button className="btn btn-primary btn-sm">
                  <Shield size={14} />
                  Start Verification
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EstateProfile;