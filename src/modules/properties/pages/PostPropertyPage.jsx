// src/modules/properties/pages/PostPropertyPage.jsx - FIXED COMMISSION LOGIC
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import ProgressIndicator from '../components/ProgressIndicator';
import BasicInfoStep from '../components/steps/BasicInfoStep';
import LocationStep from '../components/steps/LocationStep';
import ImagesStep from '../components/steps/ImagesStep';
import ConfirmationStep from '../components/steps/ConfirmationStep';
import CommissionNotice from '../components/CommissionNotice';
import { createNewListing } from '../../../shared/utils/listingUtils';
import './PostProperty.css';

const PostPropertyPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize form data with user info
  const initialFormData = {
    // Basic Info
    title: '',
    description: '',
    price: '',
    propertyType: '',
    contactPhone: '',
    contactEmail: '',
    
    // Location
    address: '',
    state: '',
    lga: '',
    coordinates: { lat: null, lng: null },
    
    // Images
    images: {
      kitchen: [],
      dining: [],
      outside: [],
      inside: [],
      other: []
    },
    
    // Meta
    status: 'draft',
    hasLandlordConsent: false,
    referralCode: '', // This is for the ₦5000 user referral bonus, NOT for commission
    
    // User info (will be populated from auth)
    userId: '',
    userRole: '',
    userName: '',
    userEmail: ''
  };

  const [formData, setFormData] = useState(initialFormData);

  // Initialize with user data
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        userId: user.id || '',
        userRole: user.role || '',
        userName: user.name || '',
        userEmail: user.email || '',
        contactPhone: user.phone || '',
        contactEmail: user.email || '',
        verified: user.verified || false
      }));
    }
  }, [user]);

  // Check if user is authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/dashboard/post' } });
    }
  }, [isAuthenticated, navigate]);

  // Handle step navigation
  const nextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        if (!formData.title.trim() || !formData.price || !formData.propertyType) {
          alert('Please fill in all required fields');
          return false;
        }
        return true;
      
      case 2:
        if (!formData.address.trim() || !formData.state || !formData.lga) {
          alert('Please provide complete location details');
          return false;
        }
        return true;
      
      case 3:
        // Images are optional
        return true;
      
      default:
        return true;
    }
  };

  // Handle form data updates
  const updateFormData = (updates) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  // FIXED: Calculate commission based on business rules
  const calculateCommission = () => {
    const listingPrice = parseFloat(formData.price) || 0;
    
    // Ensure we have a valid price
    if (listingPrice <= 0) {
      alert('Please enter a valid price');
      return null;
    }
    
    const posterRole = formData.userRole || '';
    
    // BUSINESS RULE 1: Estate firms get ZERO RentEasy commission (subscription model)
    if (posterRole === 'estate_firm') {
      return {
        listingPrice,
        totalPrice: listingPrice, // No commission added
        breakdown: {
          total: 0,
          rentEasy: 0,    // Estate firms pay subscription, not commission
          manager: 0,     // Managers don't get commission from estate firm posts
          referrer: 0,    // No referrer commission
          poster: 0       // Estate firm doesn't get commission as poster
        },
        isEstateFirm: true,
        note: 'Estate firm listing: No RentEasy commission (monthly subscription model)'
      };
    }
    
    // BUSINESS RULE 2: Tenant and Landlord posts ALWAYS have 7.5% commission
    const totalCommission = listingPrice * 0.075; // ALWAYS 7.5% for tenants/landlords
    
    const commissionBreakdown = {
      total: totalCommission,
      rentEasy: listingPrice * 0.04,      // ALWAYS 4% for RentEasy platform
      manager: listingPrice * 0.025,      // ALWAYS 2.5% for manager
      referrer: listingPrice * 0.01,      // ALWAYS 1% for referrer (poster themselves!)
      poster: listingPrice * 0.01         // ALWAYS 1% for poster
    };
    
    // Determine who the referrer/poster is
    let referrerType = '';
    if (posterRole === 'tenant') {
      referrerType = 'Outgoing Tenant';
    } else if (posterRole === 'landlord') {
      referrerType = 'Landlord';
    }
    
    return {
      listingPrice,
      totalPrice: listingPrice + totalCommission,
      breakdown: commissionBreakdown,
      referrerType,
      isEstateFirm: false,
      note: `Total commission: 7.5% (${referrerType}: 1%, Manager: 2.5%, RentEasy: 4%)`
    };
  };

  // Submit the listing
  const submitListing = async () => {
    // Validate form data first
    if (!validateCurrentStep()) {
      alert('Please complete all required fields');
      return;
    }
  
    const commission = calculateCommission();
    if (!commission) return; // If calculation failed
  
    setIsSubmitting(true);
    
    try {
      const listingPrice = commission.listingPrice;
      
      // Prepare listing data
      const listingData = {
        // Basic info
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: listingPrice,
        propertyType: formData.propertyType,
        contactPhone: formData.contactPhone,
        contactEmail: formData.contactEmail,
        
        // Location
        address: formData.address.trim(),
        state: formData.state,
        lga: formData.lga,
        coordinates: formData.coordinates,
        
        // Images
        images: [
          ...(formData.images.kitchen || []),
          ...(formData.images.dining || []),
          ...(formData.images.outside || []),
          ...(formData.images.inside || []),
          ...(formData.images.other || [])
        ].slice(0, 5),
        
        // User verification requirements
        requiresLandlordVerification: formData.userRole === 'tenant',
        landlordConsent: formData.userRole === 'tenant' ? formData.hasLandlordConsent : true,
        
        // Referral code for ₦5000 user referral bonus (separate from commission)
        referralCode: formData.referralCode,
        
        // Additional details
        bedrooms: formData.propertyType.includes('Bedroom') 
          ? parseInt(formData.propertyType.match(/\d+/)?.[0] || '1') 
          : 1,
        bathrooms: 1,
        
        // Flags
        isFeatured: false,
        isUrgent: false,
      };
  
      // Get user data
      const currentUser = user || {
        id: `temp_${Date.now()}`,
        name: formData.userName || 'Anonymous',
        role: formData.userRole || 'user',
        verified: formData.verified || false,
        email: formData.userEmail
      };
  
      // Use the createNewListing function
      const newListing = createNewListing(listingData, currentUser);
      
      // Save commission info to the listing
      newListing.commissionInfo = {
        totalRate: commission.isEstateFirm ? 0 : 0.075,
        breakdown: commission.breakdown,
        referrer: {
          id: currentUser.id,
          name: currentUser.name,
          role: formData.userRole,
          commissionRate: commission.isEstateFirm ? 0 : 0.01,
          commissionAmount: commission.breakdown.poster
        }
      };

      // Show success message based on user role
      let successMessage = `✅ Listing submitted successfully!\n\n`;
      successMessage += `📋 Listing Price: ₦${listingPrice.toLocaleString()}\n`;
      
      if (commission.isEstateFirm) {
        successMessage += `🏢 Estate Firm: No RentEasy commission (monthly subscription)\n`;
        successMessage += `💼 Total Payable: ₦${listingPrice.toLocaleString()}\n`;
      } else {
        successMessage += `📊 Total Commission (7.5%): ₦${commission.breakdown.total.toLocaleString()}\n`;
        successMessage += `   • ${commission.referrerType} (1%): ₦${commission.breakdown.poster.toLocaleString()}\n`;
        successMessage += `   • Manager (2.5%): ₦${commission.breakdown.manager.toLocaleString()}\n`;
        successMessage += `   • RentEasy (4%): ₦${commission.breakdown.rentEasy.toLocaleString()}\n`;
        successMessage += `💵 Total Payable by Tenant: ₦${commission.totalPrice.toLocaleString()}\n`;
      }
      
      successMessage += `\n🔄 Status: Pending admin verification`;
      
      alert(successMessage);
  
      // Navigate to listings page
      navigate('/listings');
  
    } catch (error) {
      console.error('Error submitting listing:', error);
      alert(`❌ Failed to submit listing: ${error.message}\n\nPlease check your data and try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Request verification (for landlords/managers) - You can keep this if needed
  const requestVerification = () => {
    const adminQueue = JSON.parse(localStorage.getItem('adminListings') || '[]');
    adminQueue.push({
      ...formData,
      id: `ADMIN-${Date.now()}`,
      status: 'pending',
      queuedAt: new Date().toISOString(),
      type: 'verification_request',
      userRole: formData.userRole
    });
    localStorage.setItem('adminListings', JSON.stringify(adminQueue));
    alert('Verification request sent to admin.');
  };

  // Render current step
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <BasicInfoStep 
            formData={formData}
            updateFormData={updateFormData}
            userRole={formData.userRole}
          />
        );
      
      case 2:
        return (
          <LocationStep 
            formData={formData}
            updateFormData={updateFormData}
          />
        );
      
      case 3:
        return (
          <ImagesStep 
            formData={formData}
            updateFormData={updateFormData}
          />
        );
      
      case 4:
        return (
          <ConfirmationStep 
            formData={formData}
            commission={calculateCommission()}
            userRole={formData.userRole}
            onSubmit={submitListing}
            onRequestVerification={requestVerification}
            isSubmitting={isSubmitting}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="post-property-container">
      <main className="post-property-main">
        <div className="container">
          <h1 className="page-title">Post a Property</h1>
          
          {/* Progress Indicator */}
          <ProgressIndicator 
            currentStep={currentStep}
            steps={['Basic Info', 'Location', 'Images', 'Confirm']}
          />
          
          {/* Commission Notice for All Users */}
          <CommissionNotice 
            price={formData.price}
            userRole={formData.userRole}
          />
          
          {/* Current Step */}
          <div className="form-wrapper">
            {renderStep()}
          </div>
          
          {/* Navigation Buttons */}
          <div className="step-navigation">
            {currentStep > 1 && (
              <button 
                className="btn btn-secondary"
                onClick={prevStep}
                disabled={isSubmitting}
              >
                ← Previous
              </button>
            )}
            
            {currentStep < 4 ? (
              <button 
                className="btn btn-primary"
                onClick={nextStep}
                disabled={isSubmitting}
              >
                Next Step →
              </button>
            ) : (
              <button 
                className="btn btn-success"
                onClick={submitListing}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner"></span>
                    Submitting...
                  </>
                ) : 'Submit Listing'}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PostPropertyPage;