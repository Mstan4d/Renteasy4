// src/modules/estate-firm/pages/EstateDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../shared/lib/supabaseClient';
import { getUserRole } from '../../../shared/utils/roleHelpers';
import RentEasyLoader from '../../../shared/components/RentEasyLoader';
import { 
  Building, Users, DollarSign, FileText, 
  AlertCircle, Calendar, TrendingUp, PlusCircle,
  Upload, Briefcase, Wallet, BarChart3,
  ExternalLink, Shield, Clock, Filter,
  MessageSquare, Globe, Star, Settings,
  Download, Eye, Edit, Trash2,
  CreditCard, Receipt, PieChart, Target,
  ChevronRight, Phone, Mail, MapPin,
  CheckCircle, Home, XCircle, UserPlus, Search,
  Check, X, ShieldCheck, Crown, Zap,
  Bell, RefreshCw, ArrowUpRight, ArrowDownRight,
  BarChart, Tag, Percent, Users as UsersIcon,
  Home as HomeIcon, TrendingDown, Filter as FilterIcon,
  Landmark, Key, UserCircle, ClipboardList, FileBarChart, FolderOpen
} from 'lucide-react';
import { Container, Row, Col, Card, Button, Badge, Modal, Form, Table, ProgressBar, Alert, Dropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import SubscriptionModal from '../components/SubscriptionModal';
import BoostManager from '../components/BoostManager';
import PaymentProofModal from '../components/PaymentProofModal';
import './EstateDashboard.css';

const EstateDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State for estate firm specific data
  const [estateFirmData, setEstateFirmData] = useState({
    id: null,
    isVerified: false,
    verificationStatus: 'unverified',
    freePostsRemaining: 10,
    hasActiveSubscription: false,
    subscriptionEndDate: null,
    subscriptionType: 'inactive',
    isInMarketplace: true,
    marketplaceBoost: false,
    boostStatus: 'not_boosted',
    boostExpiry: null,
    businessName: '',
    rating: 0,
    totalReviews: 0
  });

  const [showAddPropertyModal, setShowAddPropertyModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showBoostModal, setShowBoostModal] = useState(false);
  const [showPaymentProofModal, setShowPaymentProofModal] = useState(false);
  const [userRole, setUserRole] = useState('principal');
  const [isStaff, setIsStaff] = useState(false);
  const [hasBankDetails, setHasBankDetails] = useState(false);
  const [dashboardStats, setDashboardStats] = useState({
    totalProperties: 0,
    managedProperties: 0,
    rentEasyListings: 0,
    externalProperties: 0,
    occupiedProperties: 0,
    vacantProperties: 0,
    totalTenants: 0,
    monthlyRevenue: 0,
    pendingPayments: 0,
    maintenanceRequests: 0,
    expiringLeases: 0,
    totalClients: 0,
    portfolioValue: 0,
    postsThisMonth: 0,
    commissionSaved: 0,
    subscriptionSavings: 0,
    totalEarnings: 0,
    pendingCommissions: 0,
    averageOccupancyRate: 0,
    responseRate: 0
  });

  const [landlordCount, setLandlordCount] = useState(0);
  const [activeListings, setActiveListings] = useState(0);
  const [pendingConversions, setPendingConversions] = useState(0);
  const [criticalAlerts, setCriticalAlerts] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [allProperties, setAllProperties] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [estateFirmProfileId, setEstateFirmProfileId] = useState(null); // Store profile ID separately

  // Helper functions for activities
  const getActivityTitle = (activity) => {
    switch(activity.activity_type) {
      case 'unit_added': return 'New Unit Added';
      case 'tenant_added': return 'Tenant Added';
      case 'tenant_removed': return 'Tenant Removed';
      case 'rent_paid': return 'Rent Payment Recorded';
      case 'payment_confirmed': return 'Payment Confirmed';
      case 'maintenance_request': return 'Maintenance Request';
      case 'listing_created': return 'New Listing Created';
      case 'listing_converted': return 'Listing Converted';
      default: return activity.activity_type || 'Activity';
    }
  };

  const getActivityIcon = (type) => {
    switch(type) {
      case 'unit_added': return <Home size={16} />;
      case 'tenant_added': return <UserPlus size={16} />;
      case 'tenant_removed': return <XCircle size={16} />;
      case 'rent_paid': return <DollarSign size={16} />;
      case 'payment_confirmed': return <CheckCircle size={16} />;
      case 'listing_created': return <Tag size={16} />;
      case 'listing_converted': return <FileText size={16} />;
      default: return <Bell size={16} />;
    }
  };

  // Fetch recent activities - FIXED VERSION
  const fetchRecentActivities = async (estateFirmId) => {
    if (!estateFirmId) {
      console.log('No estate firm ID available for fetching activities');
      return;
    }

    try {
      console.log('Fetching recent activities for estate firm ID:', estateFirmId);
      
      // Get all properties for this estate firm first
      const { data: properties, error: propertiesError } = await supabase
        .from('properties')
        .select('id, title')
        .eq('estate_firm_id', estateFirmId);

      if (propertiesError) {
        console.error('Error fetching properties:', propertiesError);
        return;
      }

      const propertyIds = properties?.map(p => p.id) || [];
      
      if (propertyIds.length === 0) {
        console.log('No properties found for activities');
        setRecentActivities([]);
        return;
      }

      // Fetch recent property activities
      const { data: propertyActivities, error: activitiesError } = await supabase
        .from('property_activities')
        .select(`
          *,
          unit:unit_id (
            unit_number
          )
        `)
        .in('property_id', propertyIds)
        .order('created_at', { ascending: false })
        .limit(10);

      if (activitiesError) {
        console.error('Error fetching property activities:', activitiesError);
      }

      // Fetch recent payments
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select(`
          *,
          unit:unit_id (
            unit_number,
            tenant:tenant_id (full_name),
            property:property_id (title)
          )
        `)
        .in('unit.property_id', propertyIds)
        .order('created_at', { ascending: false })
        .limit(5);

      if (paymentsError) {
        console.error('Error fetching payments:', paymentsError);
      }

      // Combine and format activities
      const activities = [];

      // Add property activities
      (propertyActivities || []).forEach(act => {
        const property = properties.find(p => p.id === act.property_id);
        activities.push({
          id: `prop_${act.id}`,
          type: act.activity_type,
          title: getActivityTitle(act),
          description: act.description || `${act.activity_type} on ${property?.title || 'property'}${act.unit?.unit_number ? ` Unit ${act.unit.unit_number}` : ''}`,
          time: act.created_at,
          icon: getActivityIcon(act.activity_type),
          link: `/dashboard/estate-firm/properties/${act.property_id}`
        });
      });

      // Add payment activities
      (paymentsData || []).forEach(payment => {
        activities.push({
          id: `pay_${payment.id}`,
          type: 'payment',
          title: `Rent Payment Received`,
          description: `₦${payment.amount?.toLocaleString()} from ${payment.unit?.tenant?.full_name || 'Tenant'} for ${payment.unit?.property?.title || 'property'}${payment.unit?.unit_number ? ` Unit ${payment.unit.unit_number}` : ''}`,
          time: payment.created_at,
          icon: <DollarSign size={16} />,
          link: '/dashboard/estate-firm/rent-tracking'
        });
      });

      // Sort by time (most recent first)
      activities.sort((a, b) => new Date(b.time) - new Date(a.time));
      setRecentActivities(activities.slice(0, 10));
      
      console.log('Activities loaded:', activities.length);

    } catch (error) {
      console.error('Error fetching recent activities:', error);
      setRecentActivities([]);
    }
  };

  // Load estate firm data
const loadEstateFirmData = async () => {
  if (!user) {
    setLoading(false);
    return;
  }

  try {
    setLoading(true);
    setError(null);
    console.log('Loading estate dashboard data for user:', user.id);

    // Get user role first
    let userRole = 'principal';
    let isStaff = false;
    let parentFirmId = null;
    
    try {
      const { data: roleData, error: roleError } = await supabase
        .from('estate_firm_profiles')
        .select('staff_role, is_staff_account, parent_estate_firm_id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (!roleError && roleData) {
        userRole = roleData.staff_role || 'principal';
        isStaff = roleData.is_staff_account || false;
        parentFirmId = roleData.parent_estate_firm_id;
      }
    } catch (err) {
      console.warn('Could not fetch user role:', err);
    }

    // 1. Get or create estate firm profile
    let estateFirmProfile = null;
    try {
      const { data, error: firmError } = await supabase
        .from('estate_firm_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (firmError) throw firmError;

      if (!data) {
        const { data: newProfile, error: createError } = await supabase
          .from('estate_firm_profiles')
          .insert({
            user_id: user.id,
            firm_name: 'My Estate Firm',
            description: 'Professional estate management firm',
            verification_status: 'not_started',
            boost_status: 'none',
            subscription_status: 'inactive',
            free_posts_remaining: 10,
            rating: 0,
            total_reviews: 0,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (createError) throw createError;
        estateFirmProfile = newProfile;
      } else {
        estateFirmProfile = data;
      }
      
      console.log('Estate firm profile:', estateFirmProfile);
      console.log('User role:', userRole);
      
      setEstateFirmProfileId(estateFirmProfile.id);
    } catch (err) {
      console.error('Error with estate firm profile:', err);
      setError('Failed to load estate firm profile');
      setLoading(false);
      return;
    }

    // Determine which firm ID to use for queries
    const effectiveFirmId = parentFirmId || estateFirmProfile.id;
    console.log('Using effective firm ID:', effectiveFirmId);

    // 2. Get active subscription
    let activeSubscription = null;
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('profile_id', user.id)
        .eq('status', 'active')
        .gte('expires_at', new Date().toISOString())
        .order('expires_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!error) activeSubscription = data;
      console.log('Active subscription:', activeSubscription);
    } catch (err) {
      console.warn('Subscription query error:', err.message);
    }

    const hasActiveSubscription = !!activeSubscription;
    const subscriptionExpiry = activeSubscription?.expires_at || null;

    // 3. Fetch properties for this firm (with role-based filtering)
    let propertiesQuery = supabase
      .from('properties')
      .select('*')
      .eq('estate_firm_id', effectiveFirmId);
    
    // If associate, only show their own properties
    if (userRole === 'associate') {
      propertiesQuery = propertiesQuery.eq('created_by_staff_id', user.id);
    }
    
    const { data: properties, error: propertiesError } = await propertiesQuery;
    
    if (propertiesError) {
      console.error('Error fetching properties:', propertiesError);
    }
    
    const propertyIds = properties?.map(p => p.id) || [];
    console.log('Properties found:', propertyIds.length);
    setAllProperties(properties || []);

    // 4. Fetch units for these properties
    let units = [];
    if (propertyIds.length) {
      let unitsQuery = supabase
        .from('units')
        .select('*')
        .in('property_id', propertyIds);
      
      // If associate, only show their own units
      if (userRole === 'associate') {
        unitsQuery = unitsQuery.eq('created_by_staff_id', user.id);
      }
      
      const { data: unitsData, error: unitsError } = await unitsQuery;
      if (!unitsError) units = unitsData || [];
      console.log('Units found:', units.length);
    }

    // 5. Fetch payments for these units
    const unitIds = units.map(u => u.id);
    let payments = [];
    if (unitIds.length) {
      const { data: pays, error: paysError } = await supabase
        .from('payments')
        .select('*')
        .in('unit_id', unitIds)
        .eq('payment_type', 'rent');
      if (!paysError) payments = pays || [];
      console.log('Payments found:', payments.length);
    }

    // 6. Calculate stats
    const totalProperties = properties?.length || 0;
    const totalUnits = units.length;
    const occupiedUnits = units.filter(u => u.status === 'occupied').length;
    const vacantUnits = totalUnits - occupiedUnits;
    const monthlyRevenue = payments
      .filter(p => p.status === 'confirmed')
      .reduce((sum, p) => sum + (p.amount / 12), 0);

    // 7. Get landlord count (filtered for associate)
    let landlordCountNum = 0;
    try {
      if (userRole === 'associate') {
        // For associate: count unique landlords from their properties
        const landlordIds = [...new Set(properties?.map(p => p.landlord_id).filter(Boolean))];
        landlordCountNum = landlordIds.length;
      } else {
        const { count, error: countError } = await supabase
          .from('estate_landlords')
          .select('*', { count: 'exact', head: true })
          .eq('estate_firm_id', effectiveFirmId);
        
        if (!countError) landlordCountNum = count || 0;
      }
      console.log('Landlord count:', landlordCountNum);
      setLandlordCount(landlordCountNum);
    } catch (err) {
      console.warn('Error loading landlord count:', err);
    }

    // 8. Get listings data (with role-based filtering)
    let listings = [];
    let activeRentEasyListings = 0;
    let rentedNotConverted = 0;
    try {
      let listingsQuery = supabase
        .from('listings')
        .select('*')
        .eq('estate_firm_id', effectiveFirmId);
      
      // If associate, only show their own listings
      if (userRole === 'associate') {
        listingsQuery = listingsQuery.eq('created_by_staff_id', user.id);
      }
      
      const { data, error: listingsError } = await listingsQuery;
      if (!listingsError) {
        listings = data || [];
        activeRentEasyListings = listings.filter(l => l.status === 'pending' || l.status === 'approved').length;
        rentedNotConverted = listings.filter(l => l.status === 'rented' && !l.unit_id).length;
      }
      console.log('Listings found:', listings.length);
      setActiveListings(activeRentEasyListings);
      setPendingConversions(rentedNotConverted);
    } catch (err) {
      console.warn('Error loading listings:', err);
    }

    // 9. Update state
    setEstateFirmData({
  id: estateFirmProfile.id,
  isVerified: estateFirmProfile.verification_status === 'verified',
  verificationStatus: estateFirmProfile.verification_status || 'not_started',
  freePostsRemaining: estateFirmProfile.free_posts_remaining || 10,
  hasActiveSubscription,
  subscriptionEndDate: subscriptionExpiry,
  subscriptionType: activeSubscription?.plan_type || 'inactive',
  isInMarketplace: true,
  marketplaceBoost: estateFirmProfile.boost_status === 'boosted',
  boostStatus: estateFirmProfile.boost_status || 'none',
  boostExpiry: estateFirmProfile.boost_expiry,
  businessName: estateFirmProfile.firm_name || 'Estate Firm',
  rating: estateFirmProfile.rating || 0,
  totalReviews: 0  // Set to 0 or calculate from reviews table
});

    setDashboardStats({
      totalProperties,
      managedProperties: totalProperties,
      rentEasyListings: activeRentEasyListings,
      externalProperties: totalProperties,
      occupiedProperties: occupiedUnits,
      vacantProperties: vacantUnits,
      totalTenants: occupiedUnits,
      monthlyRevenue,
      pendingPayments: payments.filter(p => p.status === 'pending').length,
      maintenanceRequests: 0,
      expiringLeases: 0,
      totalClients: landlordCountNum,
      portfolioValue: monthlyRevenue * 12,
      postsThisMonth: 0,
      commissionSaved: 0,
      subscriptionSavings: hasActiveSubscription ? 10000 : 0,
      totalEarnings: payments.reduce((sum, p) => sum + p.amount, 0),
      pendingCommissions: 0,
      averageOccupancyRate: totalUnits ? (occupiedUnits / totalUnits) * 100 : 0,
      responseRate: 70
    });

    // Fetch recent activities using the estate firm ID
    await fetchRecentActivities(effectiveFirmId);

    // Critical alerts
    const alerts = [];
    if (vacantUnits > 0 && totalUnits > 0) {
      alerts.push({
        id: 1,
        priority: 'medium',
        message: `${vacantUnits} unit(s) are currently vacant. Post them on RentEasy to find tenants faster.`,
        link: '/dashboard/estate-firm/portfolio'
      });
    }
    if (rentedNotConverted > 0) {
      alerts.push({
        id: 2,
        priority: 'high',
        message: `${rentedNotConverted} rented listing(s) need to be converted to units. Complete the conversion to add tenant details.`,
        link: '/dashboard/estate-firm/my-listings'
      });
    }
    if (estateFirmProfile.verification_status !== 'verified' && estateFirmProfile.verification_status !== 'pending') {
      alerts.push({
        id: 3,
        priority: 'high',
        message: 'Your estate firm is not verified. Complete KYC verification to build trust with tenants.',
        link: '/dashboard/estate-firm/verification'
      });
    }
    if (!hasBankDetails) {
      alerts.push({
        id: 4,
        priority: 'high',
        message: 'Bank details missing. Add your bank account to receive rent payments.',
        link: '/dashboard/estate-firm/settings'
      });
    }
    setCriticalAlerts(alerts);

  } catch (err) {
    console.error('Error loading dashboard data:', err);
    setError('Failed to load dashboard data.');
  } finally {
    setLoading(false);
  }
};
  useEffect(() => {
    loadEstateFirmData();
  }, [user, refreshKey]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Add this to listen for bank details updates from settings
useEffect(() => {
  const handleStorageChange = () => {
    checkBankDetails();
  };
  
  window.addEventListener('storage', handleStorageChange);
  
  return () => {
    window.removeEventListener('storage', handleStorageChange);
  };
}, []);

 // In EstateDashboard.jsx, update the checkBankDetails function:

const checkBankDetails = async () => {
  try {
    // Check the logged-in user's own bank details
    const { data: profile, error } = await supabase
      .from('estate_firm_profiles')
      .select('bank_details')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error checking bank details:', error);
      setHasBankDetails(false);
      return;
    }

    const hasDetails = profile?.bank_details?.bank_name && 
                       profile?.bank_details?.account_number && 
                       profile?.bank_details?.account_name;
    
    console.log('Bank details check for user', user.id, ':', { hasDetails, bank_details: profile?.bank_details });
    setHasBankDetails(hasDetails || false);
  } catch (error) {
    console.error('Error checking bank details:', error);
    setHasBankDetails(false);
  }
};
  useEffect(() => {
    if (user) {
      checkBankDetails();
    }
  }, [user]);

  useEffect(() => {
  const loadUserRole = async () => {
    if (user) {
      const { role, isStaff: staff } = await getUserRole(user.id);
      setUserRole(role);
      setIsStaff(staff);
    }
  };
  loadUserRole();
}, [user]);

  const canPostProperty = () => {
    if (estateFirmData.hasActiveSubscription) return true;
    if (estateFirmData.freePostsRemaining > 0) return true;
    return false;
  };

  const handleAddProperty = (type) => {
    console.log('handleAddProperty called with type:', type, 'estateFirmData.id:', estateFirmData.id);
    
    if (!canPostProperty()) {
      setShowSubscriptionModal(true);
      return;
    }

    if (!estateFirmData.id) {
      alert('Estate firm profile not fully loaded. Please refresh and try again.');
      return;
    }

    if (type === 'rent-easy') {
      const url = `/post-property?type=estate-firm&estateFirmId=${estateFirmData.id}`;
      console.log('Navigating to:', url);
      navigate(url);
    }
  };

  const handleSubscriptionSuccess = () => {
    loadEstateFirmData();
  };

  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const handleApplyVerification = async () => {
    try {
      const { error } = await supabase
        .from('estate_firm_profiles')
        .update({
          verification_status: 'pending',
          updated_at: new Date().toISOString()
        })
        .eq('id', estateFirmData.id);

      if (error) throw error;

      setEstateFirmData(prev => ({
        ...prev,
        verificationStatus: 'pending'
      }));

      setShowVerificationModal(false);
      alert('Verification application submitted! Admin will review your KYC documents.');
    } catch (error) {
      console.error('Error applying for verification:', error);
      alert('Failed to submit verification. Please try again.');
    }
  };

  const handleBoost = async (boostType) => {
    const confirmPayment = window.confirm('Boost costs ₦5,000 for 30 days. Proceed to payment?');
    if (!confirmPayment) return;

    try {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);

      const { error } = await supabase
        .from('estate_firm_profiles')
        .update({
          boost_status: 'boosted',
          boost_expiry: expiryDate.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', estateFirmData.id);

      if (error) throw error;

      setEstateFirmData(prev => ({
        ...prev,
        boostStatus: 'boosted',
        boostExpiry: expiryDate.toISOString(),
        marketplaceBoost: true
      }));

      setShowBoostModal(false);
      alert('Profile boosted successfully! Your profile will be featured for 30 days.');
    } catch (error) {
      console.error('Error boosting profile:', error);
      alert('Failed to boost profile. Please try again.');
    }
  };

  const getEstateFirmBadge = () => {
    if (estateFirmData.verificationStatus === 'verified') {
      return (
        <Badge bg="success" className="ms-2 d-inline-flex align-items-center">
          <ShieldCheck size={12} className="me-1" /> Verified
        </Badge>
      );
    } else if (estateFirmData.verificationStatus === 'pending') {
      return (
        <Badge bg="warning" className="ms-2 d-inline-flex align-items-center">
          <Clock size={12} className="me-1" /> Pending Verification
        </Badge>
      );
    }
    return (
      <Badge bg="secondary" className="ms-2 d-inline-flex align-items-center">
        <X size={12} className="me-1" /> Unverified
      </Badge>
    );
  };

  const getSubscriptionBadge = () => {
    if (estateFirmData.hasActiveSubscription) {
      return (
        <Badge bg="success" className="ms-2 d-inline-flex align-items-center">
          <Crown size={12} className="me-1" /> Subscribed
          {estateFirmData.subscriptionEndDate && (
            <small className="ms-1">
              (Exp: {new Date(estateFirmData.subscriptionEndDate).toLocaleDateString()})
            </small>
          )}
        </Badge>
      );
    }
    
    if (estateFirmData.freePostsRemaining <= 0) {
      return (
        <Badge bg="danger" className="ms-2 d-inline-flex align-items-center">
          <X size={12} className="me-1" /> No Posts Left
        </Badge>
      );
    }
    
    return (
      <Badge bg="warning" className="ms-2 d-inline-flex align-items-center">
        Free Plan ({estateFirmData.freePostsRemaining} left)
      </Badge>
    );
  };

  const getBoostBadge = () => {
    if (estateFirmData.boostStatus === 'boosted' && estateFirmData.boostExpiry) {
      const expiresAt = new Date(estateFirmData.boostExpiry);
      const now = new Date();
      const daysRemaining = Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24));
      
      if (daysRemaining > 0) {
        return (
          <Badge bg="warning" className="ms-2 d-inline-flex align-items-center">
            <Zap size={12} className="me-1" /> Boosted ({daysRemaining}d left)
          </Badge>
        );
      }
    }
    return null;
  };

  const filteredProperties = allProperties.filter(property => {
    if (filter === 'all') return true;
    if (filter === 'rent-easy') return property.type === 'rent-easy-listing';
    if (filter === 'occupied') return property.status === 'occupied' || property.status === 'rented';
    if (filter === 'vacant') return property.status === 'available';
    return true;
  });

  // Navigation cards data
  const navCards = [
    {
      title: 'Portfolio',
      description: 'Manage all properties and units',
      icon: <Building size={24} />,
      color: 'primary',
      path: '/dashboard/estate-firm/portfolio',
      stats: `${dashboardStats.totalProperties} properties`
    },
    {
      title: 'Landlords',
      description: 'Manage property owners',
      icon: <Users size={24} />,
      color: 'success',
      path: '/dashboard/estate-firm/landlords',
      stats: `${landlordCount} landlords`
    },
    {
      title: 'My Listings',
      description: 'View and convert RentEasy posts',
      icon: <Tag size={24} />,
      color: 'warning',
      path: '/dashboard/estate-firm/my-listings',
      stats: `${activeListings} active, ${pendingConversions} to convert`
    },
    {
      title: 'Rent Tracking',
      description: 'Monitor all rent payments',
      icon: <DollarSign size={24} />,
      color: 'info',
      path: '/dashboard/estate-firm/rent-tracking',
      stats: `₦${dashboardStats.monthlyRevenue.toLocaleString()}/month`
    },
    {
      title: 'Reports',
      description: 'Generate business reports',
      icon: <BarChart3 size={24} />,
      color: 'purple',
      path: '/dashboard/estate-firm/reports',
      stats: 'Analytics & insights'
    },
    {
      title: 'Subscription',
      description: 'Manage your plan',
      icon: <Crown size={24} />,
      color: 'gold',
      path: '/dashboard/estate-firm/subscription',
      stats: estateFirmData.hasActiveSubscription ? 'Active' : `${estateFirmData.freePostsRemaining} free posts`
    }
  ];

  if (loading) {
    return <RentEasyLoader message="Loading your dashboard..." fullScreen />;
  }

  if (error) {
    return (
      <div className="estate-dashboard-modern">
        <div className="error-container">
          <AlertCircle size={48} />
          <h3>Error Loading Dashboard</h3>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={handleRefresh}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="estate-dashboard-modern">
      {/* Header Section */}
      <div className="dashboard-header">
        <div className="header-content">
          <div>
            <h1>Welcome back, {estateFirmData.businessName}</h1>
            <p className="header-subtitle">Here's what's happening with your portfolio today</p>
          </div>
          <div className="header-actions">
            <button className="btn btn-outline-light" onClick={handleRefresh}>
              <RefreshCw size={16} />
              Refresh
            </button>
            <button 
              className="btn btn-light" 
              onClick={() => handleAddProperty('rent-easy')}
            >
              <PlusCircle size={16} />
              New Listing
            </button>
          </div>
        </div>
        
        {/* Stats Row */}
        <div className="header-stats">
          <div className="stat-item">
            <span className="stat-label">Monthly Revenue</span>
            <span className="stat-value">₦{dashboardStats.monthlyRevenue.toLocaleString()}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Occupancy Rate</span>
            <span className="stat-value">{dashboardStats.averageOccupancyRate.toFixed(1)}%</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Active Units</span>
            <span className="stat-value">{dashboardStats.occupiedProperties}/{dashboardStats.totalProperties}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Status</span>
            <span className="stat-value">
              {getEstateFirmBadge()} {getSubscriptionBadge()} {getBoostBadge()}
            </span>
          </div>
        </div>
      </div>

      {/* Critical Alerts */}
      {criticalAlerts.length > 0 && (
        <div className="alerts-section">
          {criticalAlerts.map(alert => (
            <div key={alert.id} className={`alert-card priority-${alert.priority}`}>
              <div className="alert-content">
                <AlertCircle size={20} />
                <span>{alert.message}</span>
              </div>
              <button 
                className="alert-action"
                onClick={() => navigate(alert.link)}
              >
                Take Action <ChevronRight size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      
{!hasBankDetails && (
  <div className="warning-card">
    <AlertCircle size={24} />
    <div>
      <h4>Bank Details Missing</h4>
      <p>Add your bank details to receive rent payments from tenants.</p>
      <button onClick={() => navigate('/dashboard/estate-firm/settings', { state: { activeTab: 'payment' } })}>
        Add Now
      </button>
    </div>
  </div>
)}
      
      {/* Navigation Cards Grid */}
      <div className="nav-cards-grid">
        {navCards.map((card, index) => (
          <div 
            key={index}
            className={`nav-card ${card.color}`}
            onClick={() => navigate(card.path)}
          >
            <div className="card-icon">{card.icon}</div>
            <div className="card-content">
              <h3>{card.title}</h3>
              <p>{card.description}</p>
              <div className="card-stats">{card.stats}</div>
            </div>
            <div className="card-arrow">
              <ChevronRight size={20} />
            </div>
          </div>
        ))}
      </div>

      {/* Main Dashboard Content */}
      <div className="dashboard-main">
        {/* Stats Overview */}
        <div className="stats-overview">
          <div className="stats-header">
            <h2>Performance Overview</h2>
            <div className="stats-filters">
              <select className="stats-select">
                <option>Last 30 days</option>
                <option>This month</option>
                <option>This quarter</option>
                <option>This year</option>
              </select>
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>
                <Home size={20} />
              </div>
              <div className="stat-detail">
                <span className="stat-number">{dashboardStats.totalProperties}</span>
                <span className="stat-name">Total Properties</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#dcfce7', color: '#16a34a' }}>
                <Users size={20} />
              </div>
              <div className="stat-detail">
                <span className="stat-number">{dashboardStats.totalTenants}</span>
                <span className="stat-name">Total Tenants</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#fef9c3', color: '#ca8a04' }}>
                <DollarSign size={20} />
              </div>
              <div className="stat-detail">
                <span className="stat-number">₦{dashboardStats.monthlyRevenue.toLocaleString()}</span>
                <span className="stat-name">Monthly Revenue</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#f1f5f9', color: '#475569' }}>
                <TrendingUp size={20} />
              </div>
              <div className="stat-detail">
                <span className="stat-number">{dashboardStats.averageOccupancyRate.toFixed(1)}%</span>
                <span className="stat-name">Occupancy Rate</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="recent-activity">
          <h3>Recent Activity</h3>
          {recentActivities.length === 0 ? (
            <div className="empty-activities">
              <Bell size={32} className="empty-icon" />
              <p>No recent activities yet</p>
              <small>Activities will appear here when you add properties or receive payments</small>
            </div>
          ) : (
            <div className="activity-list">
              {recentActivities.map(activity => (
                <div key={activity.id} className="activity-item" onClick={() => activity.link && navigate(activity.link)}>
                  <div className="activity-icon">
                    {activity.icon}
                  </div>
                  <div className="activity-details">
                    <div className="activity-title">{activity.title}</div>
                    <div className="activity-description">{activity.description}</div>
                    <div className="activity-time">
                      {formatRelativeTime(activity.time)}
                    </div>
                  </div>
                  <div className="activity-arrow">
                    <ChevronRight size={16} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="quick-actions-card">
          <h3>Quick Actions</h3>
          <div className="action-buttons">
            <button className="action-btn" onClick={() => handleAddProperty('rent-easy')}>
              <PlusCircle size={18} />
              Post Property
            </button>
            <button className="action-btn" onClick={() => navigate('/dashboard/estate-firm/add-external-property')}>
              <Building size={18} />
              Add External
            </button>
            <button className="action-btn" onClick={() => setShowVerificationModal(true)}>
              <ShieldCheck size={18} />
              Get Verified
            </button>
            <button className="action-btn" onClick={() => setShowBoostModal(true)}>
              <Zap size={18} />
              Boost Profile
            </button>
            <button className="action-btn" onClick={() => navigate('/dashboard/estate-firm/reports')}>
              <BarChart3 size={18} />
              View Reports
            </button>
            <button className="action-btn" onClick={() => navigate('/dashboard/estate-firm/landlords')}>
              <Users size={18} />
              Landlords
            </button>
            <button className="action-btn" onClick={() => navigate('/dashboard/estate-firm/my-listings')}>
              <Tag size={18} />
              My Listings
            </button>
          </div>
        </div>
      </div>

      {/* Subscription Status */}
      <div className="subscription-status-card">
        <h3>Subscription Status</h3>
        {estateFirmData.hasActiveSubscription ? (
          <div className="subscription-active">
            <div className="subscription-header">
              <Crown size={24} className="text-warning" />
              <div>
                <strong>Premium Subscription Active</strong>
                <p>Expires: {new Date(estateFirmData.subscriptionEndDate).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="subscription-badges">
              <span className="badge bg-success">0% Commission</span>
              <span className="badge bg-primary">Unlimited Posts</span>
            </div>
          </div>
        ) : (
          <div className="subscription-free">
            <div className="subscription-header">
              <Tag size={24} className="text-muted" />
              <div>
                <strong>Free Plan</strong>
                <p>{estateFirmData.freePostsRemaining} free posts remaining</p>
              </div>
            </div>
            <button 
              className="btn btn-warning btn-sm"
              onClick={() => setShowSubscriptionModal(true)}
            >
              <Crown size={14} />
              Upgrade Now
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      <SubscriptionModal
        show={showSubscriptionModal}
        onHide={() => setShowSubscriptionModal(false)}
        onSubscriptionSuccess={handleSubscriptionSuccess}
      />

      <Modal show={showAddPropertyModal} onHide={() => setShowAddPropertyModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add New Property</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center mb-4">
            <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex p-3 mb-3">
              <Home size={48} className="text-primary" />
            </div>
            <h4>Post Your Property</h4>
            <p className="text-muted">List your property on Rent Easy with 0% commission</p>
          </div>
          
          <Card 
            className="h-100 border-primary cursor-pointer"
            onClick={() => handleAddProperty('rent-easy')}
          >
            <Card.Body className="text-center">
              <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex p-3 mb-3">
                <Globe size={32} className="text-primary" />
              </div>
              <h5>Post on Rent Easy</h5>
              <p className="text-muted small">
                List on Rent Easy marketplace with 0% commission for subscribed estate firms
              </p>
              <div className="mt-3">
                <Badge bg="primary" className="me-1">0% Commission</Badge>
                <Badge bg="success">Wide Exposure</Badge>
              </div>
            </Card.Body>
          </Card>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddPropertyModal(false)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showBoostModal} onHide={() => setShowBoostModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <Zap size={24} className="me-2 text-warning" />
            Boost Your Profile
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center mb-4">
            <div className="bg-warning bg-opacity-10 rounded-circle d-inline-flex p-3 mb-3">
              <Zap size={48} className="text-warning" />
            </div>
            <h4>Get Featured in Marketplace</h4>
            <p className="text-muted">
              Boost your profile to appear at the top of marketplace results
            </p>
          </div>
          
          <Card className="border-warning">
            <Card.Body>
              <h6 className="text-warning">Boost Benefits:</h6>
              <ul className="mb-0">
                <li className="mb-2">Featured placement in marketplace</li>
                <li className="mb-2">Higher visibility to landlords</li>
                <li className="mb-2">30-day duration</li>
                <li>Priority in search results</li>
              </ul>
            </Card.Body>
          </Card>
          
          <div className="alert alert-info mt-3">
            <h6>Boost Pricing:</h6>
            <ul className="mb-0 small">
              <li>30-day boost: ₦5,000</li>
              <li>Featured as "Boosted" in marketplace</li>
              <li>Independent from verification status</li>
            </ul>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowBoostModal(false)}>
            Later
          </Button>
          <Button variant="warning" onClick={() => handleBoost('30day')}>
            <Zap size={16} className="me-1" />
            Boost for ₦5,000
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showVerificationModal} onHide={() => setShowVerificationModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <ShieldCheck size={24} className="me-2 text-success" />
            Get Verified
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center mb-4">
            <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex p-3 mb-3">
              <ShieldCheck size={48} className="text-success" />
            </div>
            <h4>Verify Your Estate Firm</h4>
            <p className="text-muted">
              Complete KYC verification to get the "Verified Estate Firm" badge
            </p>
          </div>
          
          <Card className="border-warning">
            <Card.Body>
              <h6 className="text-warning">Documents Required:</h6>
              <ul className="mb-0">
                <li className="mb-2">Company registration certificate</li>
                <li className="mb-2">Valid ID of director(s)</li>
                <li className="mb-2">Utility bill (not older than 3 months)</li>
                <li>Tax clearance certificate</li>
              </ul>
            </Card.Body>
          </Card>
          
          <div className="alert alert-info mt-3">
            <h6>Benefits of Verification:</h6>
            <ul className="mb-0 small">
              <li>Verified badge on all listings</li>
              <li>Higher trust score from tenants</li>
              <li>Priority in marketplace</li>
              <li>Access to premium features</li>
            </ul>
          </div>
        </Modal.Body>
        
<Modal.Footer>
  <Button variant="secondary" onClick={() => setShowVerificationModal(false)}>
    Later
  </Button>
  <Button variant="success" onClick={() => {
    setShowVerificationModal(false);
    navigate('/dashboard/estate-firm/verification');
  }}>
    Start Verification
  </Button>
</Modal.Footer>
      </Modal>
    </div>
  );
};

export default EstateDashboard;