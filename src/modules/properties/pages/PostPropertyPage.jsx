// src/modules/properties/pages/PostPropertyPage.jsx - CORRECTED VERSION
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
import RentEasyLoader from '../../../shared/components/RentEasyLoader';
import { getCoordinatesFromAddress } from '../../../shared/utils/geocoding';
import './PostProperty.css';

const PostPropertyPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, profile } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [localProfile, setLocalProfile] = useState(null);
  const [estateFirmId, setEstateFirmId] = useState(null);
  const [freePostsRemaining, setFreePostsRemaining] = useState(0);
  const [hasSubscription, setHasSubscription] = useState(false);
  
  // Check if this is an estate firm post
  const isEstateFirm = searchParams.get('type') === 'estate-firm';
  const FirmId = searchParams.get('estateFirmId');

  useEffect(() => {
    const loadOrCreateProfile = async () => {
      if (!user) return;
      
      let activeProfile = profile;

      if (!activeProfile) {
        setLoadingProfile(true);
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (error && error.code === 'PGRST116') {
            // Create missing profile
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert([{
                id: user.id,
                email: user.email,
                role: 'tenant', // Default
                full_name: user.user_metadata?.full_name || user.email,
              }])
              .select().single();
            if (createError) throw createError;
            activeProfile = newProfile;
          } else {
            activeProfile = data;
          }
        } catch (err) {
          console.error('Profile Load Error:', err);
        } finally {
          setLoadingProfile(false);
        }
      }

      if (activeProfile) {
        setLocalProfile(activeProfile);
        // SYNC FORM DATA IMMEDIATELY
        setFormData(prev => ({
          ...prev,
          user_id: user.id,
          user_role: activeProfile.role,
          contact_email: activeProfile.email,
          posted_by: activeProfile.role,
          commission_rate: activeProfile.role === 'estate-firm' ? 0 : 7.5
        }));
      }
    };

    loadOrCreateProfile();
  }, [user, profile]);

  // In the useEffect that loads profile, also fetch estate firm data
  useEffect(() => {
    const loadEstateFirmData = async () => {
      if (profile?.role !== 'estate-firm') {
        // Not an estate firm, no need to load
        return;
      }

      try {
        // Use either the URL param or fetch by user_id
        const firmIdParam = searchParams.get('estateFirmId');
        if (firmIdParam) {
          // Fetch by firm ID
          const { data, error } = await supabase
            .from('estate_firm_profiles')
            .select('id, free_posts_remaining, subscription_status')
            .eq('id', firmIdParam)
            .single();
          if (!error && data) {
            setEstateFirmId(data.id);
            setFreePostsRemaining(data.free_posts_remaining);
            setHasSubscription(data.subscription_status === 'active');
          }
        } else {
          // Fallback: fetch by user_id
          const { data, error } = await supabase
            .from('estate_firm_profiles')
            .select('id, free_posts_remaining, subscription_status')
            .eq('user_id', user.id)
            .single();
            console.log('Estate firm fetch result:', data, error);
          if (!error && data) {
            setEstateFirmId(data.id);
            setFreePostsRemaining(data.free_posts_remaining);
            setHasSubscription(data.subscription_status === 'active');
          } else if (error && error.code !== 'PGRST116') {
            console.error('Error fetching estate firm profile:', error);
          }
        }
      } catch (err) {
        console.error('Error loading estate firm data:', err);
      }
    };

    if (profile?.role === 'estate-firm') {
      loadEstateFirmData();
    }
  }, [profile, user, searchParams]);

  // Add this state for prefill data
  const [prefillData, setPrefillData] = useState(null);
  const [prefillLoaded, setPrefillLoaded] = useState(false);

  // Load prefill data from URL on mount
  useEffect(() => {
    const prefillParam = searchParams.get('prefill');
    if (prefillParam) {
      try {
        const decoded = JSON.parse(decodeURIComponent(prefillParam));
        setPrefillData(decoded);
        console.log('Prefill data loaded:', decoded);
      } catch (error) {
        console.error('Error parsing prefill data:', error);
      }
    }
  }, [searchParams]);

  // Apply prefill data to form when available
  useEffect(() => {
    if (prefillData && !prefillLoaded && profile) {
      console.log('Applying prefill data to form:', prefillData);
      
      setFormData(prev => ({
        ...prev,
        title: prefillData.title || prev.title,
        description: prefillData.description || prev.description,
        rent_amount: prefillData.rent_amount || prev.rent_amount,
        property_type: prefillData.property_type || prev.property_type,
        address: prefillData.address || prev.address,
        state: prefillData.state || prev.state,
        city: prefillData.city || prev.city,
        lga: prefillData.lga || prev.lga,
        bedrooms: prefillData.bedrooms || prev.bedrooms,
        bathrooms: prefillData.bathrooms || prev.bathrooms,
        area: prefillData.area || prev.area,
        amenities: prefillData.amenities || prev.amenities,
        extra_fees: prefillData.extra_fees || prev.extra_fees
      }));
      
      setPrefillLoaded(true);
      
      // Show a message to the user
      setTimeout(() => {
        alert('Property details from your unit have been pre-filled. Please review and add images before posting.');
      }, 500);
    }
  }, [prefillData, prefillLoaded, profile]);

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
    videos: [],

    // User info
    user_id: user?.id,
    user_role: profile?.role,
    
    // Commission settings
    commission_rate: 0, // Default, will be set based on user role
    posted_by: profile?.role,

    landlord_phone: '',
    extra_fees: [],
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

  // Add this useEffect in PostPropertyPage.jsx
  useEffect(() => {
    const checkVerification = async () => {
      if (profile?.role === 'estate-firm') {
        const { data } = await supabase
          .from('profiles')
          .select('kyc_status, is_kyc_verified')
          .eq('id', user.id)
          .single();
        
        if (data?.kyc_status !== 'approved' && !data?.is_kyc_verified) {
          alert('Please complete business verification to post properties.');
          navigate('/dashboard/estate-firm/verification');
        }
      }
    };
    
    if (user && profile) {
      checkVerification();
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
  
  console.log('estateFirmId:', estateFirmId);

  // In PostPropertyPage.jsx, update the submitListing function
  const submitListing = async () => {
    // FIRST: Get currentProfile
    const currentProfile = profile || localProfile;
    
    if (!currentProfile) {
      alert('User profile not found. Please try refreshing the page.');
      return;
    }

    // SECOND: Check if estate firm is verified
    if (currentProfile.role === 'estate-firm') {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('kyc_status, is_kyc_verified')
        .eq('id', user.id)
        .single();
      
      if (profileData?.kyc_status !== 'approved' && !profileData?.is_kyc_verified) {
        alert('Your estate firm must be verified before you can post properties. Please complete the verification process.');
        navigate('/dashboard/estate-firm/verification');
        return;
      }
    }
    
    // THIRD: Validate current step
    if (!validateCurrentStep()) return;

    // FOURTH: Get staff context for created_by tracking
    let createdByStaffId = null;
    let effectiveEstateFirmId = estateFirmId;
    let userStaffRole = null;
    
    if (currentProfile.role === 'estate-firm') {
      const { data: staffData } = await supabase
        .from('estate_firm_profiles')
        .select('staff_role, parent_estate_firm_id, is_staff_account')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (staffData?.is_staff_account) {
        createdByStaffId = user.id;
        userStaffRole = staffData.staff_role;
        if (staffData.parent_estate_firm_id) {
          effectiveEstateFirmId = staffData.parent_estate_firm_id;
        }
      }
    }

    // FIFTH: For estate firms, ensure we have the latest estate_firm_id and free posts
    let finalEstateFirmId = effectiveEstateFirmId;
    let currentFreePosts = freePostsRemaining;
    let currentHasSubscription = hasSubscription;

    if (currentProfile.role === 'estate-firm') {
      try {
        const { data, error } = await supabase
          .from('estate_firm_profiles')
          .select('id, free_posts_remaining, subscription_status')
          .eq(finalEstateFirmId ? 'id' : 'user_id', finalEstateFirmId || user.id)
          .single();

        if (error) throw error;

        if (data) {
          finalEstateFirmId = data.id;
          currentFreePosts = data.free_posts_remaining;
          currentHasSubscription = data.subscription_status === 'active';
          setEstateFirmId(data.id);
          setFreePostsRemaining(data.free_posts_remaining);
          setHasSubscription(currentHasSubscription);
        } else {
          alert('Estate firm profile not found. Please complete your profile first.');
          return;
        }
      } catch (err) {
        console.error('Error fetching estate firm data:', err);
        alert('Failed to load estate firm profile. Please try again.');
        return;
      }

      if (!currentHasSubscription && currentFreePosts <= 0) {
        alert('You have no free posts remaining. Please subscribe to continue posting.');
        navigate('/dashboard/estate-firm');
        return;
      }
    }
    
    let coordinates = null;
    try {
      coordinates = await getCoordinatesFromAddress(
        formData.address,
        formData.city,
        formData.state,
        formData.lga
      );
      console.log('Coordinates obtained:', coordinates);
    } catch (error) {
      console.error('Error getting coordinates:', error);
    }

    const commission = calculateCommission();

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

    debugFormData();
    setIsSubmitting(true);

    try {
      const listingData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.rent_amount) || 0,
        rent_amount: formData.rent_amount,
        property_type: formData.property_type,
        address: formData.address.trim(),
        state: formData.state,
        city: formData.city,
        lga: formData.lga || '',
        landmark: formData.landmark || '',
        bedrooms: parseInt(formData.bedrooms) || 1,
        bathrooms: parseInt(formData.bathrooms) || 1,
        area: formData.area || null,
        amenities: formData.amenities || [],
        contact_phone: formData.contact_phone || profile?.phone || '',
        contact_email: formData.contact_email || profile?.email || '',
        poster_role: currentProfile.role,
        poster_name: currentProfile.full_name || user?.email,
        poster_phone: formData.contact_phone || currentProfile?.phone || '',
        user_id: user.id,
        commission_rate: currentProfile.role === 'estate-firm' ? 0 : 7.5,
        rent_frequency: 'yearly',
        status: 'pending',
        is_verified: false,
        is_active: true,
        verification_level: 'pending',
        rejected: false,
        posted_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        images: [],
        landlord_phone: formData.landlord_phone || null,
        verification_status: currentProfile.role === 'estate-firm' ? 'verified' : 'pending_manager',
        extra_fees: formData.extra_fees || [],
        lat: coordinates?.lat || null,
        lng: coordinates?.lng || null,
        created_by_staff_id: createdByStaffId,
        updated_by_staff_id: createdByStaffId
      };

      if (currentProfile.role === 'estate-firm' && finalEstateFirmId) {
        listingData.estate_firm_id = finalEstateFirmId;
      }

      console.log('📤 Submitting to Supabase:', listingData);
      console.log('Created by staff ID:', createdByStaffId);

      const { data: listing, error: listingError } = await supabase
        .from('listings')
        .insert([listingData])
        .select()
        .single();

      if (listingError) throw listingError;
      console.log('✅ Listing created in database:', listing.id);

      // Upload images
      let imageUrls = [];
      if (formData.images.length > 0) {
        console.log('📸 Uploading images...');
        imageUrls = await uploadImages(listing.id);
        if (imageUrls.length > 0) {
          const { error: imageError } = await supabase
            .from('listings')
            .update({ images: imageUrls })
            .eq('id', listing.id);
          if (imageError) console.error('⚠️ Could not save image URLs:', imageError);
          else console.log(`✅ ${imageUrls.length} images uploaded`);
        }
      }

      // Upload videos
      let videoUrls = [];
      if (formData.videos?.length > 0) {
        console.log('🎬 Uploading videos...');
        for (const video of formData.videos) {
          try {
            if (video.file) {
              const fileExt = video.file.name.split('.').pop();
              const fileName = `video_${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
              const filePath = `listings/${listing.id}/${fileName}`;
              
              const { error: uploadError } = await supabase.storage
                .from('property-images')
                .upload(filePath, video.file);
              
              if (uploadError) {
                console.error('Video upload error:', uploadError);
                continue;
              }
              
              const { data: urlData } = supabase.storage
                .from('property-images')
                .getPublicUrl(filePath);
              
              if (urlData.publicUrl) {
                videoUrls.push(urlData.publicUrl);
                console.log('✅ Video uploaded:', urlData.publicUrl);
              }
            } else if (video.url) {
              videoUrls.push(video.url);
            }
          } catch (error) {
            console.error('❌ Error uploading video:', error);
          }
        }
      }

      if (videoUrls.length > 0) {
        const { error: videoError } = await supabase
          .from('listings')
          .update({ 
            video_urls: videoUrls,
            video_url: videoUrls[0]
          })
          .eq('id', listing.id);
        if (videoError) console.error('⚠️ Could not save video URLs:', videoError);
        else console.log(`✅ ${videoUrls.length} videos uploaded`);
      }

      // Decrement free posts
      if (currentProfile.role === 'estate-firm' && !currentHasSubscription && currentFreePosts > 0) {
        const { error: rpcError } = await supabase.rpc('decrement_free_posts', { firm_id: finalEstateFirmId });
        if (rpcError) {
          console.error('Error decrementing free posts:', rpcError);
        } else {
          setFreePostsRemaining(prev => prev - 1);
        }
      }

      // Notify nearby managers
      if (currentProfile.role !== 'estate-firm' && formData.coordinates?.lat && formData.coordinates?.lng) {
        await notifyNearbyManagers(listing.id, formData.coordinates);
      }

      const successMessage = currentProfile.role === 'estate-firm'
        ? `🏢 Estate Firm Listing Posted!\n\n✅ 0% Commission (Subscription Model)\n📝 ${formData.title}\n📍 ${formData.address}, ${formData.city}\n💰 ₦${commission.annualRent.toLocaleString()}/year\n\n✅ Your listing is NOW LIVE with "Pending" status`
        : `✅ Property Listed Successfully!\n\n📝 ${formData.title}\n📍 ${formData.address}, ${formData.city}\n💰 ₦${commission.annualRent.toLocaleString()}/year (₦${commission.monthlyEquivalent.toLocaleString()}/month)\n\n💰 You earn ₦${commission.posterCommission.toLocaleString()} when rented!\n\n✅ Your listing is NOW LIVE with "Pending" status`;

      alert(successMessage);

      if (currentProfile.role === 'estate-firm' && finalEstateFirmId) {
        await supabase.from('notifications').insert({
          user_id: finalEstateFirmId,
          type: 'property_listed',
          title: 'Property Listed',
          message: `Your listing "${formData.title}" has been posted to RentEasy.`,
          link: '/dashboard/estate-firm/my-listings',
          created_at: new Date().toISOString()
        });
      }

      setTimeout(() => {
        const roleDashboard = {
          'tenant': '/dashboard/tenant',
          'landlord': '/dashboard/landlord',
          'manager': '/dashboard/manager',
          'estate-firm': '/dashboard/estate-firm',
          'service-provider': '/dashboard/provider'
        };
        navigate(roleDashboard[currentProfile.role] || '/dashboard');
      }, 1500);

    } catch (error) {
      console.error('❌ Error posting property:', error);
      alert(`Failed to post property. ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // CORRECTED: Notify nearby managers based on their radius settings
const notifyNearbyManagers = async (listingId, coordinates) => {
  if (!coordinates?.lat || !coordinates?.lng) {
    console.log('No coordinates provided, skipping manager notifications');
    return;
  }

  try {
    // Get all managers with their location and radius settings
    const { data: managers, error } = await supabase
      .from('profiles')
      .select('id, full_name, lat, lng, notification_radius_km')
      .eq('role', 'manager')
      .not('lat', 'is', null)
      .not('lng', 'is', null)
      .not('notification_radius_km', 'is', null);

    if (error) throw error;
    if (!managers || managers.length === 0) {
      console.log('No managers with location data found');
      return;
    }

    // Calculate distance and filter managers within their radius
    const nearbyManagers = managers.filter(manager => {
      if (!manager.lat || !manager.lng) return false;
      
      const distance = calculateDistance(
        coordinates.lat,
        coordinates.lng,
        manager.lat,
        manager.lng
      );
      
      // Check if distance is within manager's set radius
      return distance <= (manager.notification_radius_km || 5); // Default 5km if not set
    });

    console.log(`Found ${nearbyManagers.length} nearby managers to notify`);

    // Create notifications for each nearby manager
    if (nearbyManagers.length > 0) {
      const notifications = nearbyManagers.map(manager => ({
        manager_id: manager.id,
        listing_id: listingId,
        type: 'proximity_alert',
        title: 'New Property Nearby',
        message: `A new property has been posted within your coverage area.`,
        distance: calculateDistance(
          coordinates.lat,
          coordinates.lng,
          manager.lat,
          manager.lng
        ),
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 min expiry
        accepted: false
      }));

      const { error: insertError } = await supabase
        .from('manager_notifications')
        .insert(notifications);

      if (insertError) {
        console.error('Error creating notifications:', insertError);
      } else {
        console.log(`✅ Created ${notifications.length} notifications for nearby managers`);
        
        // Optional: Send real-time notifications via Supabase Realtime
        nearbyManagers.forEach(manager => {
          supabase.channel(`manager-${manager.id}`).send({
            type: 'broadcast',
            event: 'new-listing-nearby',
            payload: {
              listingId,
              message: 'New property listed near you!'
            }
          });
        });
      }
    }
  } catch (error) {
    console.error('Error notifying managers:', error);
  }
};

// Helper function to calculate distance in kilometers
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
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

  if (!user) return <div>Please log in to Post a Property</div>;
  if (loadingProfile || (!profile && !localProfile)) {
    return <RentEasyLoader message="Loading Post Page..." fullScreen />;
  }
  
  const effectiveProfile = profile || localProfile;
  console.log('Profile data:', effectiveProfile);

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
            extraFees={formData.extra_fees}
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
                profile?.role === 'estate-firm' && !estateFirmId ? (
                  <button className="btn btn-secondary" disabled>
                    Loading profile...
                  </button>
                ) : (
                  <button 
                    className="btn btn-success" 
                    onClick={submitListing}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Posting...' : 'Post Property'}
                  </button>
                )
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