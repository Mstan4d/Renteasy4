// src/modules/properties/pages/PostPropertyPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
// REMOVE THIS: import Header from '../../../shared/components/Header';
import ProgressIndicator from '../components/ProgressIndicator';
import BasicInfoStep from '../components/steps/BasicInfoStep';
import LocationStep from '../components/steps/LocationStep';
import ImagesStep from '../components/steps/ImagesStep';
import ConfirmationStep from '../components/steps/ConfirmationStep';
import CommissionNotice from '../components/CommissionNotice';
import { createNewListing } from '../../../shared/utils/listingUtils'; // Import the function
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
    referralCode: '',
    
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
        verified: user.verified || false // Add user verification status
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

  // Calculate commission for all posts
  const calculateCommission = () => {
    const listingPrice = parseFloat(formData.price) || 0;
    const totalCommission = listingPrice * 0.075; // 7.5%
    
    const commissionBreakdown = {
      total: totalCommission,
      rentEasy: totalCommission * 0.5333, // 4%
      manager: totalCommission * 0.3333,  // 2.5%
      referral: formData.referralCode ? totalCommission * 0.1333 : 0 // 1%
    };
    
    return {
      listingPrice,
      totalPrice: listingPrice + totalCommission,
      breakdown: commissionBreakdown
    };
  };

  // Submit the listing - UPDATED TO USE createNewListing FUNCTION
  const submitListing = async () => {
    setIsSubmitting(true);
    
    try {
      const commission = calculateCommission();
      const listingPrice = commission.listingPrice;
      
      // Prepare listing data for createNewListing function
      const listingData = {
        // Basic info
        title: formData.title,
        description: formData.description,
        price: listingPrice,
        propertyType: formData.propertyType,
        contactPhone: formData.contactPhone,
        contactEmail: formData.contactEmail,
        
        // Location
        address: formData.address,
        state: formData.state,
        lga: formData.lga,
        coordinates: formData.coordinates,
        
        // Images - flatten the images object for simpler storage
        images: [
          ...formData.images.kitchen,
          ...formData.images.dining,
          ...formData.images.outside,
          ...formData.images.inside,
          ...formData.images.other
        ].slice(0, 5), // Take only first 5 images
        
        // Commission & Pricing
        totalPrice: commission.totalPrice,
        commission: commission.breakdown,
        
        // User verification requirements
        requiresLandlordVerification: formData.userRole === 'tenant',
        landlordConsent: formData.userRole === 'tenant' ? formData.hasLandlordConsent : true,
        
        // Referral
        referralCode: formData.referralCode,
        referralBonus: formData.referralCode ? listingPrice * 0.01 : 0,
        
        // Additional details for better listing display
        bedrooms: formData.propertyType.includes('Bedroom') 
          ? parseInt(formData.propertyType.match(/\d+/)?.[0] || '1') 
          : 0,
        bathrooms: 1, // Default, can be added to form later
        area: '', // Can be added to form later
        
        // Flags for filtering
        isFeatured: false,
        isUrgent: false,
        
        // Revenue tracking
        revenueDistribution: {
          rentEasy: commission.breakdown.rentEasy,
          manager: commission.breakdown.manager,
          referrer: commission.breakdown.referral,
          timestamp: new Date().toISOString(),
          paid: false
        }
      };

      // Use the createNewListing function from ListingsPage
      const newListing = createNewListing(listingData, {
        ...user,
        verified: formData.verified || false
      });

      // Show success message with commission breakdown
      alert(`✅ Listing submitted successfully!\n\n` +
        `📋 Listing Price: ₦${listingPrice.toLocaleString()}\n` +
        `💰 Total Commission (7.5%): ₦${commission.breakdown.total.toLocaleString()}\n` +
        `💵 Total Payable: ₦${commission.totalPrice.toLocaleString()}\n\n` +
        `🔄 Status: ${formData.userRole === 'tenant' 
          ? 'Pending landlord verification by admin' 
          : 'Pending admin verification'}\n\n` +
        `📊 Commission Breakdown:\n` +
        `   • RentEasy (4%): ₦${commission.breakdown.rentEasy.toLocaleString()}\n` +
        `   • Manager (2.5%): ₦${commission.breakdown.manager.toLocaleString()}\n` +
        `${formData.referralCode ? `   • Referral (1%): ₦${commission.breakdown.referral.toLocaleString()}\n` : ''}\n\n` +
        `📍 Your listing will appear on:\n` +
        `   • Listings Page: Immediately (as unverified)\n` +
        `   • Home Page: Randomly (unverified status)\n` +
        `   • Admin Dashboard: For verification\n` +
        `   • Manager Dashboard: If in assigned area`
      );

      // Navigate to listings page to see the new listing
      navigate('/listings');

    } catch (error) {
      console.error('Error submitting listing:', error);
      alert('❌ Failed to submit listing. Please try again.');
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
    // REMOVE the Header wrapper and just use the main content
    <div className="post-property-container">
      {/* REMOVE THIS: <Header /> */}
      
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
            hasReferral={!!formData.referralCode}
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