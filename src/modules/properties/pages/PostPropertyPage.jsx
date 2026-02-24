// src/modules/properties/pages/PostPropertyPage.jsx - FIXED VERSION
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../../shared/lib/supabaseClient';
import { useAuth } from '../../../shared/context/AuthContext';
import ProgressIndicator from '../components/ProgressIndicator';
import BasicInfoStep from '../components/steps/BasicInfoStep';
import LocationStep from '../components/steps/LocationStep';
import ImagesStep from '../components/steps/ImagesStep';
import ConfirmationStep from '../components/steps/ConfirmationStep';
import CommissionNotice from '../components/CommissionNotice';
import './PostProperty.css';

const PostPropertyPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, profile } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Check if this is an estate firm post
  const isEstateFirm = searchParams.get('type') === 'estate-firm';
  const estateFirmId = searchParams.get('estateFirmId');
  
  // Initial form data
  const [formData, setFormData] = useState({
    // Basic Info
    title: '',
    description: '',
    rent_amount: '', // ANNUAL RENT (Nigeria standard)
    property_type: '',
    contact_phone: '',
    contact_email: profile?.email || '',
    
    // Location
    address: '',
    state: '',
    lga: '',
    city: '',
    landmark: '',
    coordinates: { lat: null, lng: null },
    
    // Property Details
    bedrooms: 1,
    bathrooms: 1,
    area: '',
    amenities: [],
    
    // Images
    images: [],
    
    // User info
    user_id: user?.id,
    user_role: profile?.role,
    
    // Commission settings
    commission_rate: 0, // Default, will be set based on user role
    posted_by: profile?.role,
  });

  // Load user data
  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        user_id: user.id,
        user_role: profile.role,
        contact_email: profile.email,
        contact_phone: profile.phone || '',
        posted_by: profile.role,
        // Estate firms pay 0% commission
        commission_rate: profile.role === 'estate-firm' ? 0 : 7.5
      }));
    }
  }, [user, profile]);

  // Step navigation
  const nextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Validation for each step
  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1: // Basic Info
        if (!formData.title.trim()) {
          alert('Please enter a property title');
          return false;
        }
        if (!formData.rent_amount || parseFloat(formData.rent_amount) <= 0) {
          alert('Please enter a valid annual rent amount');
          return false;
        }
        if (!formData.property_type  || formData.property_type.trim() ==="") {
          alert('Please select a property type');
          return false;
        }
        return true;
      
      case 2: // Location
        if (!formData.address.trim()) {
          alert('Please enter the property address');
          return false;
        }
        if (!formData.state) {
          alert('Please select a state');
          return false;
        }
        if (!formData.city) {
          alert('Please enter the city/town');
          return false;
        }
        return true;
      
      case 3: // Images (optional but show warning)
        if (formData.images.length === 0) {
          const proceed = window.confirm(
            'No images added. Properties with images get rented faster!\n\nContinue without images?'
          );
          return proceed;
        }
        return true;
      
      default:
        return true;
    }
  };

  // Update form data
  const updateFormData = (updates) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  // Calculate commission based on BUSINESS RULES
  const calculateCommission = () => {
    const annualRent = parseFloat(formData.rent_amount) || 0;
    const userRole = formData.user_role;
    
    if (annualRent <= 0) {
      return {
        annualRent: 0,
        monthlyEquivalent: 0,
        totalCommission: 0,
        managerCommission: 0,
        posterCommission: 0,
        rentEasyCommission: 0,
        note: 'Enter valid rent amount'
      };
    }
    
    // BUSINESS RULE: Estate firms have ZERO commission
    if (userRole === 'estate-firm') {
      return {
        annualRent,
        monthlyEquivalent: annualRent / 12,
        totalCommission: 0,
        managerCommission: 0,
        posterCommission: 0,
        rentEasyCommission: 0,
        isEstateFirm: true,
        note: 'Estate Firm: 0% commission (subscription model)'
      };
    }
    
    // BUSINESS RULE: Regular listings have 7.5% TOTAL commission
    const totalCommission = annualRent * 0.075; // 7.5%
    const managerCommission = annualRent * 0.025; // 2.5%
    const posterCommission = annualRent * 0.015;  // 1.5% - Poster earns this!
    const rentEasyCommission = annualRent * 0.035; // 3.5%
    
    return {
      annualRent,
      monthlyEquivalent: annualRent / 12,
      totalCommission,
      managerCommission,
      posterCommission,
      rentEasyCommission,
      isEstateFirm: false,
      note: `Total Commission: 7.5% (You earn 1.5% as poster)`
    };
  };

  // Upload images to Supabase Storage
 // In PostPropertyPage.jsx, update the uploadImages function
const uploadImages = async (listingId) => {
  const uploadedUrls = [];
  
  for (const image of formData.images) {
    try {
      // If it's already a real URL (not a blob), keep it
      if (image.url && !image.url.startsWith('blob:')) {
        uploadedUrls.push(image.url);
        continue;
      }
      
      // If it's a file that needs upload
      if (image.file) {
        const fileExt = image.file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const filePath = `listings/${listingId}/${fileName}`;
        
        console.log('Uploading to path:', filePath);
        
        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('property-images')
          .upload(filePath, image.file);
        
        if (uploadError) {
          console.error('Upload error:', uploadError);
          continue;
        }
        
        // Get public URL (CORRECT WAY)
        const { data: urlData } = supabase.storage
          .from('property-images')
          .getPublicUrl(filePath);
        
        if (urlData.publicUrl) {
          uploadedUrls.push(urlData.publicUrl);
          console.log('✅ Uploaded:', urlData.publicUrl);
        }
      }
    } catch (error) {
      console.error('❌ Error uploading image:', error);
    }
  }
  
  return uploadedUrls;
};
// Add this debug function to PostPropertyPage.jsx
const debugFormData = () => {
  console.log('=== FORM DATA DEBUG ===');
  console.log('1. Title:', formData.title);
  console.log('2. Price (rent_amount):', formData.rent_amount);
  console.log('3. Property Type:', formData.property_type);
  console.log('4. Images count:', formData.images.length);
  console.log('5. User Role:', formData.user_role);
  console.log('6. Commission Rate:', formData.user_role === 'estate-firm' ? 0 : 7.5);
  console.log('7. Status will be:', 'pending');
  console.log('8. Will be visible immediately:', true);
  console.log('=== END DEBUG ===');
};


  const submitListing = async () => {
  if (!validateCurrentStep()) return;
  
  const commission = calculateCommission();
  
  // Show commission confirmation for non-estate firms
  if (!commission.isEstateFirm) {
    const confirmMessage = `COMMISSION BREAKDOWN (Annual Rent: ₦${commission.annualRent.toLocaleString()})\n\n` +
      `Total Commission: 7.5% = ₦${commission.totalCommission.toLocaleString()}\n\n` +
      `• You (Poster): 1.5% = ₦${commission.posterCommission.toLocaleString()}\n` +
      `• Manager: 2.5% = ₦${commission.managerCommission.toLocaleString()}\n` +
      `• RentEasy: 3.5% = ₦${commission.rentEasyCommission.toLocaleString()}\n\n` +
      `✅ You earn ₦${commission.posterCommission.toLocaleString()} when rented!\n\n` +
      `Agree to continue?`;
    
    const confirmed = window.confirm(confirmMessage);
    if (!confirmed) return;
  }
  // Call this before submitting
debugFormData();
  setIsSubmitting(true);
  
  try {
    // ========== CORRECT LISTING DATA FOR SUPABASE ==========
    const listingData = {
      // Basic Info (REQUIRED)
      title: formData.title.trim(),
      description: formData.description.trim(),
      
      // 💰 PRICE: Use 'price' column (numeric) - This is what shows in listings
      price: parseFloat(formData.rent_amount) || 0,
      // Also store rent_amount for reference
      rent_amount: formData.rent_amount,
      
      // Property Type
      property_type: formData.property_type,
      
      // Location (REQUIRED)
      address: formData.address.trim(),
      state: formData.state,
      city: formData.city,
      lga: formData.lga || '',
      landmark: formData.landmark || '',
      
      // Coordinates for manager notifications
      //coordinates: formData.coordinates,
      
      // Property Details
      bedrooms: parseInt(formData.bedrooms) || 1,
      bathrooms: parseInt(formData.bathrooms) || 1,
      area: formData.area || null,
      amenities: formData.amenities || [],
      
      // Contact Info
      contact_phone: formData.contact_phone || profile?.phone || '',
      contact_email: formData.contact_email || profile?.email || '',
      
      // 💡 BUSINESS RULE: Who posted this? (Tenant, Landlord, Estate Firm)
      poster_role: profile?.role || formData.user_role,
      poster_name: profile?.full_name || user?.email,
      poster_phone: formData.contact_phone || profile?.phone || '',
      
      // User Info
      user_id: user.id,
      
      // Commission (CRITICAL BUSINESS RULE)
      commission_rate: profile?.role === 'estate-firm' ? 0 : 7.5,
      
      // Rent frequency (Nigeria standard = yearly)
      rent_frequency: 'yearly',
      
      // Status (IMMEDIATELY VISIBLE AS PENDING)
      status: 'pending',
      is_verified: false,
      is_active: true,
      verification_level: 'pending',
      rejected: false,
      
      // Timestamps
      posted_date: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      
      // Images will be added after upload
      images: []
    };
    
    // Add estate firm ID if applicable
    if (profile?.role === 'estate-firm' && estateFirmId) {
      listingData.estate_firm_id = estateFirmId;
    }
    
    console.log('📤 Submitting to Supabase:', listingData);
    
    // ========== STEP 1: CREATE LISTING IN DATABASE ==========
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .insert([listingData])
      .select()
      .single();
    
    if (listingError) {
      console.error('❌ Database error:', listingError);
      throw new Error(`Failed to save listing: ${listingError.message}`);
    }
    
    console.log('✅ Listing created in database:', listing.id);
    
    // ========== STEP 2: UPLOAD IMAGES IF ANY ==========
    let imageUrls = [];
    if (formData.images.length > 0) {
      console.log('📸 Uploading images...');
      imageUrls = await uploadImages(listing.id);
      
      // Update listing with image URLs
      if (imageUrls.length > 0) {
        const { error: imageError } = await supabase
          .from('listings')
          .update({ images: imageUrls })
          .eq('id', listing.id);
        
        if (imageError) {
          console.error('⚠️ Could not save image URLs:', imageError);
        } else {
          console.log(`✅ ${imageUrls.length} images uploaded`);
        }
      }
    }
    
    // ========== STEP 3: SUCCESS MESSAGE ==========
    const successMessage = profile?.role === 'estate-firm' 
      ? `🏢 Estate Firm Listing Posted!\n\n` +
        `✅ 0% Commission (Subscription Model)\n` +
        `📝 ${formData.title}\n` +
        `📍 ${formData.address}, ${formData.city}\n` +
        `💰 ₦${commission.annualRent.toLocaleString()}/year\n\n` +
        `✅ Your listing is NOW LIVE with "Pending" status`
      : `✅ Property Listed Successfully!\n\n` +
        `📝 ${formData.title}\n` +
        `📍 ${formData.address}, ${formData.city}\n` +
        `💰 ₦${commission.annualRent.toLocaleString()}/year (₦${commission.monthlyEquivalent.toLocaleString()}/month)\n\n` +
        `💰 You earn ₦${commission.posterCommission.toLocaleString()} when rented!\n\n` +
        `✅ Your listing is NOW LIVE with "Pending" status`;
    
    alert(successMessage);
    
    // ========== STEP 4: NOTIFY NEARBY MANAGERS ==========
    if (formData.coordinates?.lat && formData.coordinates?.lng) {
      console.log('📢 Notifying nearby managers...');
      await notifyNearbyManagers(listing.id, formData.coordinates);
    }
    
    // ========== STEP 5: NAVIGATE TO DASHBOARD ==========
    setTimeout(() => {
      const roleDashboard = {
        'tenant': '/dashboard/tenant',
        'landlord': '/dashboard/landlord',
        'manager': '/dashboard/manager',
        'estate-firm': '/dashboard/estate-firm',
        'service-provider': '/dashboard/provider'
      };
      
      navigate(roleDashboard[profile?.role] || '/dashboard');
    }, 1500);
    
  } catch (error) {
    console.error('❌ Error posting property:', error);
    
    let errorMessage = 'Failed to post property\n';
    if (error.message.includes('permission')) {
      errorMessage += 'You need permission to post properties.';
    } else if (error.message.includes('network')) {
      errorMessage += 'Network error. Check connection.';
    } else if (error.message.includes('foreign')) {
      errorMessage += 'User profile not found. Please complete your profile first.';
    } else {
      errorMessage += error.message;
    }
    
    alert(`❌ ${errorMessage}`);
  } finally {
    setIsSubmitting(false);
  }
};
  // Notify nearby managers (Business Rule)
  const notifyNearbyManagers = async (listingId, coordinates) => {
    try {
      // Get managers within 1km radius (you'll need to create this function in Supabase)
      // For now, we'll just create a notification
      const notification = {
        type: 'new_listing',
        title: 'New Property Available',
        message: `A new property has been posted in your area. Click to view details.`,
        data: { listing_id: listingId, coordinates },
        created_at: new Date().toISOString()
      };
      
      // You would typically send this to managers via WebSocket or push notification
      console.log('Notify managers about new listing:', listingId);
      
    } catch (error) {
      console.error('Error notifying managers:', error);
    }
  };

  // Render current step
  const renderStep = () => {
    const commonProps = {
      formData,
      updateFormData,
      userRole: formData.user_role
    };
    
    switch (currentStep) {
      case 1:
        return <BasicInfoStep {...commonProps} />;
      case 2:
        return <LocationStep {...commonProps} />;
      case 3:
        return <ImagesStep {...commonProps} />;
      case 4:
        return (
          <ConfirmationStep
            {...commonProps}
            commission={calculateCommission()}
            onSubmit={submitListing}
            isSubmitting={isSubmitting}
          />
        );
      default:
        return null;
    }
  };

  if (!user) {
    return (
      <div className="auth-required">
        <h2>Please log in to post a property</h2>
        <button onClick={() => navigate('/login')} className="btn btn-primary">
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="post-property-container">
      <main className="post-property-main">
        <div className="container">
          <div className="page-header">
            <h1>
              {formData.user_role === 'estate-firm' 
                ? '🏢 Estate Firm Listing'
                : formData.user_role === 'tenant'
                ? '👤 Post Vacating Property'
                : '🏠 List Your Property'}
            </h1>
            <p>
              {formData.user_role === 'estate-firm'
                ? '0% commission for subscribed estate firms'
                : 'Earn 1.5% commission when property gets rented'}
            </p>
          </div>
          
          {/* Progress */}
          <ProgressIndicator 
            currentStep={currentStep}
            steps={['Basic Info', 'Location', 'Images', 'Confirm']}
          />
          
          {/* Commission Notice */}
          <CommissionNotice 
            price={formData.rent_amount}
            userRole={formData.user_role}
            commission={calculateCommission()}
          />
          
          {/* Current Step */}
          <div className="form-wrapper">
            {renderStep()}
          </div>
          
          {/* Navigation */}
          <div className="step-navigation">
            <div className="nav-left">
              {currentStep > 1 && (
                <button className="btn btn-secondary" onClick={prevStep} disabled={isSubmitting}>
                  ← Back
                </button>
              )}
            </div>
            
            <div className="nav-right">
              {currentStep < 4 ? (
                <button className="btn btn-primary" onClick={nextStep} disabled={isSubmitting}>
                  Continue →
                </button>
              ) : (
                <button 
                  className="btn btn-success" 
                  onClick={submitListing}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Posting...' : 'Post Property'}
                </button>
              )}
            </div>
          </div>
          
          {/* Help */}
          <div className="help-text">
            <p>Need help? Contact: support@renteasy.com | 0700-RENTEASY</p>
            <small>
              By posting, you agree to our Terms. 
              {formData.user_role !== 'estate-firm' && ' Commission: 7.5% total (You: 1.5%).'}
            </small>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PostPropertyPage;