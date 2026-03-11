// src/modules/estate-firm/pages/EstateDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../shared/lib/supabaseClient';
import { 
  Building, Users, DollarSign, FileText, 
  AlertCircle, Calendar, TrendingUp, PlusCircle,
  Upload, Briefcase, Wallet, BarChart,
  ExternalLink, Shield, Clock, Filter,
  MessageSquare, Globe, Star, Settings,
  Download, Eye, Edit, Trash2,
  CreditCard, Receipt, PieChart, Target,
  ChevronRight, Phone, Mail, MapPin,
  CheckCircle, Home, XCircle, UserPlus, Search,
  Check, X, ShieldCheck, Crown, Zap,
  Bell, RefreshCw, ArrowUpRight, ArrowDownRight,
  BarChart3, Tag, Percent, Users as UsersIcon,
  Home as HomeIcon, TrendingDown, Filter as FilterIcon
} from 'lucide-react';
import { Container, Row, Col, Card, Button, Badge, Modal, Form, Table, ProgressBar, Alert, Dropdown } from 'react-bootstrap';
import EstateNav from '../components/EstateNav';
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

  const [criticalAlerts, setCriticalAlerts] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [allProperties, setAllProperties] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Load estate firm data from Supabase
  const loadEstateFirmData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('Loading estate dashboard data for user:', user.id);

      // 1. Load estate firm profile from estate_firm_profiles table
      let estateFirmProfile = null;
      try {
        const { data, error: firmError } = await supabase
          .from('estate_firm_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (firmError) {
          if (firmError.code === 'PGRST116') {
            console.log('No estate firm profile found, creating default...');
            // Get user profile for business name
            const { data: userProfile } = await supabase
              .from('profiles')
              .select('name, email, phone') // changed from full_name to name
              .eq('id', user.id)
              .single();

            // Create default profile if doesn't exist
            const { data: newProfile, error: createError } = await supabase
              .from('estate_firm_profiles')
              .insert({
                user_id: user.id,
                firm_name: userProfile?.name || 'Estate Firm', // changed
                description: 'Professional estate management firm',
                contact_email: userProfile?.email || '',
                contact_phone: userProfile?.phone || '',
                verification_status: 'unverified',
                boost_status: 'not_boosted',
                subscription_status: 'inactive',
                rating: 0,
                total_reviews: 0,
                free_posts_remaining: 10,
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })
              .select()
              .single();

            if (!createError) {
              estateFirmProfile = newProfile;
            } else {
              console.error('Error creating estate firm profile:', createError);
            }
          } else {
            console.warn('Firm profile error:', firmError.message);
          }
        } else {
          estateFirmProfile = data;
        }
      } catch (err) {
        console.warn('Error loading estate firm profile:', err.message);
      }

      // 2. Load subscription data from subscriptions table
      let subscription = null;
      try {
        const { data: subscriptionData, error: subscriptionError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .gte('expires_at', new Date().toISOString())
          .order('expires_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!subscriptionError) {
          subscription = subscriptionData;
        }
      } catch (err) {
        console.warn('Subscription error:', err.message);
      }

      // 3. Load properties managed by this estate firm from listings table
      let properties = [];
      if (estateFirmProfile?.id) {
        try {
          const { data: propertiesData, error: propertiesError } = await supabase
            .from('listings')
            .select('*')
            .eq('estate_firm_id', estateFirmProfile.id)
            .order('created_at', { ascending: false });

          if (propertiesError) {
            console.error('Properties query error:', propertiesError.message);
          } else {
            properties = propertiesData || [];
          }
        } catch (err) {
          console.error('Error loading properties:', err.message);
          properties = [];
        }
      }

      // 4. Load payments from payments table
      let payments = [];
      try {
        const { data: paymentsData, error: paymentsError } = await supabase
          .from('payments')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (!paymentsError) {
          payments = paymentsData || [];
        }
      } catch (err) {
        console.warn('Payments table error:', err.message);
      }

      // Update estate firm data state
      if (estateFirmProfile) {
        const isVerified = estateFirmProfile.verification_status === 'verified';
        const hasActiveSubscription = subscription ? true : 
          estateFirmProfile.subscription_status === 'active';
        
        setEstateFirmData({
          id: estateFirmProfile.id,
          isVerified,
          verificationStatus: estateFirmProfile.verification_status || 'unverified',
          freePostsRemaining: estateFirmProfile.free_posts_remaining || 10,
          hasActiveSubscription,
          subscriptionEndDate: subscription?.expires_at || estateFirmProfile.subscription_expiry,
          subscriptionType: subscription?.plan_type || estateFirmProfile.subscription_status,
          isInMarketplace: true, // Always true for estate firms
          marketplaceBoost: estateFirmProfile.boost_status === 'boosted',
          boostStatus: estateFirmProfile.boost_status || 'not_boosted',
          boostExpiry: estateFirmProfile.boost_expiry,
          businessName: estateFirmProfile.firm_name || 'Estate Firm',
          rating: estateFirmProfile.rating || 0,
          totalReviews: estateFirmProfile.total_reviews || 0
        });
      }

      // Transform properties for display
      const transformedProperties = properties.map(property => ({
        id: property.id,
        name: property.title || `Property ${property.id?.substring(0, 8) || 'N/A'}`,
        type: 'rent-easy-listing',
        source: 'rent-easy',
        listingId: property.id,
        managementType: 'full',
        clientId: property.landlord_id || property.client_id,
        clientName: 'Property Owner',
        commissionRate: 0, // Estate firms pay 0% commission
        rentAmount: property.price || property.rent_amount || 0,
        rentFrequency: property.rent_frequency || 'monthly',
        rentDueDate: property.rent_due_datetime || property.rent_due_date,
        rentEndDate: property.rent_end_datetime || property.lease_end_date,
        status: property.status === 'approved' ? 'available' : 
               property.status === 'rented' ? 'occupied' : 
               property.status || 'available',
        tenant: property.tenant_id ? {
          name: 'Tenant',
          phone: '',
          email: ''
        } : null,
        healthScore: 85, // Default for now
        nextMaintenance: null,
        address: property.address || `${property.city}, ${property.state}`,
        category: property.property_type || 'residential',
        addedDate: property.created_at,
        postedBy: property.posted_by || 'estate-firm',
        tags: ['verified-estate-firm'],
        commissionSaved: ((property.price || 0) * 0.075) // 7.5% commission saved
      }));

      setAllProperties(transformedProperties);

      // Calculate dashboard stats
      const totalProperties = transformedProperties.length;
      const rentEasyListings = transformedProperties.length;
      const occupiedProperties = transformedProperties.filter(p => 
        p.status === 'occupied' || p.status === 'rented'
      ).length;
      const vacantProperties = totalProperties - occupiedProperties;
      
      // Calculate monthly revenue
      const monthlyRevenue = transformedProperties
        .filter(p => p.status === 'occupied' || p.status === 'rented')
        .reduce((sum, p) => {
          let multiplier = 1;
          if (p.rentFrequency === 'yearly') multiplier = 1/12;
          if (p.rentFrequency === 'quarterly') multiplier = 1/3;
          if (p.rentFrequency === 'weekly') multiplier = 4.33;
          if (p.rentFrequency === 'daily') multiplier = 30;
          return sum + (p.rentAmount * multiplier);
        }, 0);

      // Calculate commission savings
      const commissionSaved = transformedProperties
        .filter(p => p.status === 'occupied' || p.status === 'rented')
        .reduce((sum, p) => sum + (p.commissionSaved || 0), 0);

      // Calculate posts this month
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const postsThisMonth = transformedProperties.filter(p => {
        const addedDate = new Date(p.addedDate);
        return addedDate.getMonth() === currentMonth && 
               addedDate.getFullYear() === currentYear;
      }).length;

      // Calculate total earnings
      const totalEarnings = payments
        .filter(p => p.status === 'completed' || p.status === 'success')
        .reduce((sum, p) => sum + (p.amount || 0), 0);

      // Calculate average occupancy rate
      const averageOccupancyRate = totalProperties > 0 
        ? (occupiedProperties / totalProperties) * 100 
        : 0;

      setDashboardStats({
        totalProperties,
        managedProperties: transformedProperties.length,
        rentEasyListings,
        externalProperties: 0,
        occupiedProperties,
        vacantProperties,
        totalTenants: occupiedProperties,
        monthlyRevenue,
        pendingPayments: transformedProperties.filter(p => {
          if (!p.rentDueDate || !(p.status === 'occupied' || p.status === 'rented')) return false;
          const dueDate = new Date(p.rentDueDate);
          const today = new Date();
          return dueDate < today;
        }).length,
        maintenanceRequests: 0,
        expiringLeases: transformedProperties.filter(p => {
          if (!p.rentEndDate || !(p.status === 'occupied' || p.status === 'rented')) return false;
          const endDate = new Date(p.rentEndDate);
          const today = new Date();
          const daysDiff = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
          return daysDiff <= 30;
        }).length,
        totalClients: [...new Set(transformedProperties
          .map(p => p.clientId)
          .filter(Boolean)
        )].length,
        portfolioValue: monthlyRevenue * 12,
        postsThisMonth,
        commissionSaved,
        subscriptionSavings: estateFirmData.hasActiveSubscription ? 10000 : 0,
        totalEarnings,
        pendingCommissions: 0,
        averageOccupancyRate,
        responseRate: Math.floor(Math.random() * 30) + 70
      });

      // Set critical alerts
      const alerts = [];
      
      if (!estateFirmData.hasActiveSubscription && estateFirmData.freePostsRemaining <= 3) {
        alerts.push({
          id: 1,
          type: 'subscription_expiry',
          message: `Only ${estateFirmData.freePostsRemaining} free posts remaining`,
          priority: 'medium',
          action: 'subscribe'
        });
      }

      if (!estateFirmData.isVerified) {
        alerts.push({
          id: 2,
          type: 'verification_pending',
          message: 'Complete verification to get verified badge',
          priority: 'low',
          action: 'verify'
        });
      }

      if (estateFirmData.boostStatus === 'boosted' && estateFirmData.boostExpiry) {
        const expiryDate = new Date(estateFirmData.boostExpiry);
        const daysUntilExpiry = Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24));
        if (daysUntilExpiry <= 7) {
          alerts.push({
            id: 3,
            type: 'boost_expiry',
            message: `Boost expires in ${daysUntilExpiry} days`,
            priority: 'low',
            action: 'boost'
          });
        }
      }

      setCriticalAlerts(alerts);

    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEstateFirmData();
  }, [user, refreshKey]);

  // Refresh data function
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Check if user can post
  const canPostProperty = () => {
    if (estateFirmData.hasActiveSubscription) return true;
    if (estateFirmData.freePostsRemaining > 0) return true;
    return false;
  };

  // Handle posting property
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
    // Use the same path as bottom nav
    const url = `/post-property?type=estate-firm&estateFirmId=${estateFirmData.id}`;
    console.log('Navigating to:', url);
    navigate(url);
  }
};

  // Handle subscription purchase
  const handleSubscribe = async () => {
    try {
      // Create subscription record
      const { data: subscription, error: subError } = await supabase
        .from('subscriptions')
        .insert({
          user_id: user.id,
          plan_type: 'estate_firm_monthly',
          amount: 10000,
          status: 'active',
          starts_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (subError) throw subError;

      // Update estate firm profile
      const { error: updateError } = await supabase
        .from('estate_firm_profiles')
        .update({
          subscription_status: 'active',
          subscription_expiry: subscription.expires_at,
          updated_at: new Date().toISOString()
        })
        .eq('id', estateFirmData.id);

      if (updateError) throw updateError;

      setEstateFirmData(prev => ({
        ...prev,
        hasActiveSubscription: true,
        subscriptionEndDate: subscription.expires_at,
        subscriptionType: 'active',
        freePostsRemaining: 9999 // Unlimited posts
      }));

      setShowSubscriptionModal(false);
      alert('Subscription activated! You can now post unlimited properties.');

    } catch (error) {
      console.error('Error subscribing:', error);
      alert('Failed to activate subscription. Please try again.');
    }
  };

  // Handle verification application
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

  // Handle boost purchase
  const handleBoost = async (boostType) => {
    // For now, simulate payment. In production, integrate actual payment.
    const confirmPayment = window.confirm('Boost costs ₦5,000 for 30 days. Proceed to payment?');
    if (!confirmPayment) return;

    try {
      // Here you would integrate with a payment gateway (Paystack, etc.)
      // After successful payment, update the boost status.
      
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30); // 30 days boost

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

  // Get estate firm status badge
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

  // Get subscription badge
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

  // Get boost badge
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

  // Filter properties
  const filteredProperties = allProperties.filter(property => {
    if (filter === 'all') return true;
    if (filter === 'rent-easy') return property.type === 'rent-easy-listing';
    if (filter === 'occupied') return property.status === 'occupied' || property.status === 'rented';
    if (filter === 'vacant') return property.status === 'available';
    return true;
  });

  // Loading State
  if (loading) {
    return (
      <div className="estate-dashboard-container">
        <EstateNav />
        <div className="estate-main-content">
          <div className="p-3 p-md-4 pt-5 pt-md-4 text-center">
            <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
              <span className="visually-hidden">Loading...</span>
            </div>
            <h4 className="mt-4">Loading Estate Dashboard</h4>
            <p className="text-muted">Fetching your property data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="estate-dashboard-container">
        <EstateNav />
        <div className="estate-main-content">
          <div className="p-3 p-md-4 pt-5 pt-md-4">
            <Alert variant="danger">
              <Alert.Heading>Error Loading Dashboard</Alert.Heading>
              <p>{error}</p>
              <Button 
                variant="primary" 
                onClick={handleRefresh}
              >
                Retry
              </Button>
            </Alert>
          </div>
        </div>
      </div>
    );
  }

  // Main Render
  return (
    <div className="estate-dashboard-container">
      <EstateNav />
      
      <div className="estate-main-content">
        <div className="p-3 p-md-4 pt-5 pt-md-4">
          {/* Welcome Header */}
          <Card className="mb-4 border-0 shadow-sm bg-gradient-primary text-white">
            <Card.Body className="pb-2">
              <Row className="align-items-center">
                <Col xs={12} md={8}>
                  <div className="d-flex align-items-center mb-2">
                    <h1 className="h4 h-md-3 mb-0 d-flex align-items-center">
                      <Building size={28} className="me-3" />
                      {estateFirmData.businessName}
                    </h1>
                    {getEstateFirmBadge()}
                    {getSubscriptionBadge()}
                    {getBoostBadge()}
                  </div>
                  <p className="mb-0 opacity-75">
                    <Star size={16} className="me-1" />
                    {estateFirmData.rating.toFixed(1)} • {estateFirmData.totalReviews} reviews
                  </p>
                  
                  {/* Free Posts Counter */}
                  {!estateFirmData.hasActiveSubscription && (
                    <div className="mt-3">
                      <div className="d-flex align-items-center">
                        <span className="text-sm opacity-75 me-2">
                          Free posts: {estateFirmData.freePostsRemaining} remaining
                        </span>
                        <ProgressBar 
                          now={((10 - estateFirmData.freePostsRemaining) / 10) * 100} 
                          className="flex-grow-1 bg-white bg-opacity-25"
                          style={{ height: '8px' }}
                          variant="light"
                        />
                      </div>
                      <small className="opacity-75">
                        {10 - estateFirmData.freePostsRemaining}/10 free posts used
                      </small>
                    </div>
                  )}
                </Col>
                
                <Col xs={12} md={4} className="mt-3 mt-md-0">
                  <div className="d-flex flex-column flex-md-row gap-2">
                    <Button 
                      variant="light" 
                      className="d-flex align-items-center justify-content-center text-primary"
                      onClick={() => handleAddProperty('rent-easy')}
                    >
                      <PlusCircle size={18} className="me-2" />
                      {estateFirmData.hasActiveSubscription ? 'Post Property' : `Post (${estateFirmData.freePostsRemaining} left)`}
                    </Button>
                    
                    <Dropdown>
                      <Dropdown.Toggle variant="outline-light" size="sm">
                        <Zap size={16} className="me-1" />
                        Actions
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        {!estateFirmData.hasActiveSubscription && (
                          <Dropdown.Item onClick={() => setShowSubscriptionModal(true)}>
                            <Crown size={16} className="me-2" />
                            Subscribe
                          </Dropdown.Item>
                        )}
                        <Dropdown.Item onClick={() => setShowBoostModal(true)}>
                          <Zap size={16} className="me-2" />
                          {estateFirmData.boostStatus === 'boosted' ? 'Extend Boost' : 'Boost Profile'}
                        </Dropdown.Item>
                        {!estateFirmData.isVerified && (
                          <Dropdown.Item onClick={() => setShowVerificationModal(true)}>
                            <ShieldCheck size={16} className="me-2" />
                            Get Verified
                          </Dropdown.Item>
                        )}
                        <Dropdown.Divider />
                        <Dropdown.Item onClick={handleRefresh}>
                          <RefreshCw size={16} className="me-2" />
                          Refresh Data
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Critical Alerts */}
          {criticalAlerts.length > 0 && (
            <Alert variant="warning" className="mb-4">
              <Alert.Heading className="d-flex align-items-center">
                <Bell size={20} className="me-2" />
                Important Notifications
              </Alert.Heading>
              <div className="d-flex flex-wrap gap-2">
                {criticalAlerts.map(alert => (
                  <Badge 
                    key={alert.id} 
                    bg={alert.priority === 'high' ? 'danger' : alert.priority === 'medium' ? 'warning' : 'info'}
                    className="cursor-pointer"
                    onClick={() => {
                      if (alert.action === 'subscribe') setShowSubscriptionModal(true);
                      if (alert.action === 'verify') setShowVerificationModal(true);
                      if (alert.action === 'boost') setShowBoostModal(true);
                    }}
                  >
                    {alert.message}
                  </Badge>
                ))}
              </div>
            </Alert>
          )}

          {/* Dashboard Stats Grid */}
          <Row className="g-3 mb-4">
            <Col xs={6} md={3}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 className="text-muted mb-1">Total Properties</h6>
                      <h3 className="mb-0">{dashboardStats.totalProperties}</h3>
                    </div>
                    <Badge bg="primary" className="rounded-circle p-2">
                      <HomeIcon size={16} />
                    </Badge>
                  </div>
                  <div className="d-flex align-items-center mt-2">
                    <small className="text-success me-2">
                      <ArrowUpRight size={12} /> {dashboardStats.occupiedProperties} occupied
                    </small>
                    <small className="text-muted">
                      {dashboardStats.vacantProperties} vacant
                    </small>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col xs={6} md={3}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 className="text-muted mb-1">Monthly Revenue</h6>
                      <h3 className="mb-0">₦{dashboardStats.monthlyRevenue.toLocaleString()}</h3>
                    </div>
                    <Badge bg="success" className="rounded-circle p-2">
                      <DollarSign size={16} />
                    </Badge>
                  </div>
                  <div className="mt-2">
                    <small className="text-muted">
                      Commission saved: ₦{dashboardStats.commissionSaved.toLocaleString()}
                    </small>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col xs={6} md={3}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 className="text-muted mb-1">Active Clients</h6>
                      <h3 className="mb-0">{dashboardStats.totalClients}</h3>
                    </div>
                    <Badge bg="info" className="rounded-circle p-2">
                      <UsersIcon size={16} />
                    </Badge>
                  </div>
                  <div className="mt-2">
                    <ProgressBar 
                      now={dashboardStats.averageOccupancyRate} 
                      label={`${dashboardStats.averageOccupancyRate.toFixed(1)}%`}
                      variant="info"
                      style={{ height: '6px' }}
                    />
                    <small className="text-muted">Occupancy Rate</small>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col xs={6} md={3}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 className="text-muted mb-1">Rent Easy Listings</h6>
                      <h3 className="mb-0">{dashboardStats.rentEasyListings}</h3>
                    </div>
                    <Badge bg="warning" className="rounded-circle p-2">
                      <Tag size={16} />
                    </Badge>
                  </div>
                  <div className="mt-2">
                    <small className="text-muted">
                      {dashboardStats.postsThisMonth} posts this month
                    </small>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Main Dashboard Tabs */}
          <Card className="mb-4 border-0 shadow-sm">
            <Card.Body className="p-0">
              <div className="border-bottom">
                <div className="d-flex justify-content-between align-items-center px-3 py-2">
                  <div className="d-flex">
                    <Button 
                      variant="link" 
                      className={`text-decoration-none ${activeTab === 'overview' ? 'text-primary fw-bold' : 'text-muted'}`}
                      onClick={() => setActiveTab('overview')}
                    >
                      <BarChart3 size={18} className="me-2" />
                      Overview
                    </Button>
                    <Button 
                      variant="link" 
                      className={`text-decoration-none ${activeTab === 'properties' ? 'text-primary fw-bold' : 'text-muted'}`}
                      onClick={() => setActiveTab('properties')}
                    >
                      <Building size={18} className="me-2" />
                      Properties
                    </Button>
                  </div>
                  
                  {activeTab === 'properties' && (
                    <div className="d-flex align-items-center">
                      <small className="text-muted me-2">Filter:</small>
                      <Dropdown>
                        <Dropdown.Toggle variant="outline-secondary" size="sm">
                          <FilterIcon size={14} className="me-1" />
                          {filter === 'all' ? 'All Properties' : 
                          filter === 'rent-easy' ? 'Rent Easy' :
                          filter === 'occupied' ? 'Occupied' : 'Vacant'}
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                          <Dropdown.Item onClick={() => setFilter('all')}>All Properties</Dropdown.Item>
                          <Dropdown.Item onClick={() => setFilter('rent-easy')}>Rent Easy Listings</Dropdown.Item>
                          <Dropdown.Item onClick={() => setFilter('occupied')}>Occupied</Dropdown.Item>
                          <Dropdown.Item onClick={() => setFilter('vacant')}>Vacant</Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </div>
                  )}
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-3">
                {activeTab === 'overview' && (
                  <Row>
                    <Col md={8}>
                      <Card className="h-100 border-0 shadow-sm">
                        <Card.Body>
                          <h5 className="mb-3">Properties Overview</h5>
                          <div className="d-flex justify-content-between mb-3">
                            <div className="text-center">
                              <h2 className="text-primary">{dashboardStats.occupiedProperties}</h2>
                              <small className="text-muted">Occupied</small>
                            </div>
                            <div className="text-center">
                              <h2 className="text-warning">{dashboardStats.vacantProperties}</h2>
                              <small className="text-muted">Vacant</small>
                            </div>
                            <div className="text-center">
                              <h2 className="text-success">{dashboardStats.expiringLeases}</h2>
                              <small className="text-muted">Expiring Soon</small>
                            </div>
                            <div className="text-center">
                              <h2 className="text-info">{dashboardStats.pendingPayments}</h2>
                              <small className="text-muted">Pending Payments</small>
                            </div>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                    
                    <Col md={4}>
                      <Card className="h-100 border-0 shadow-sm">
                        <Card.Body>
                          <h5 className="mb-3">Quick Actions</h5>
                          <div className="d-grid gap-2">
                            <Button 
                              variant="primary" 
                              className="d-flex align-items-center justify-content-start"
                              onClick={() => handleAddProperty('rent-easy')}
                            >
                              <PlusCircle size={18} className="me-2" />
                              Post New Property
                            </Button>
                            {!estateFirmData.isVerified && (
                              <Button 
                                variant="outline-warning" 
                                className="d-flex align-items-center justify-content-start"
                                onClick={() => setShowVerificationModal(true)}
                              >
                                <ShieldCheck size={18} className="me-2" />
                                Get Verified
                              </Button>
                            )}
                            <Button 
                              variant="outline-success" 
                              className="d-flex align-items-center justify-content-start"
                              onClick={() => setShowBoostModal(true)}
                            >
                              <Zap size={18} className="me-2" />
                              {estateFirmData.boostStatus === 'boosted' ? 'Extend Boost' : 'Boost Profile'}
                            </Button>
                          </div>
                          
                          <div className="mt-4">
                            <h6 className="mb-3">Subscription Status</h6>
                            <div className="p-3 border rounded">
                              {estateFirmData.hasActiveSubscription ? (
                                <>
                                  <div className="d-flex align-items-center mb-2">
                                    <Crown size={20} className="text-warning me-2" />
                                    <strong>Premium Subscription Active</strong>
                                  </div>
                                  <small className="text-muted">
                                    Expires: {new Date(estateFirmData.subscriptionEndDate).toLocaleDateString()}
                                  </small>
                                  <div className="mt-2">
                                    <Badge bg="success" className="me-2">0% Commission</Badge>
                                    <Badge bg="primary">Unlimited Posts</Badge>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="d-flex align-items-center mb-2">
                                    <Tag size={20} className="text-muted me-2" />
                                    <strong>Free Plan</strong>
                                  </div>
                                  <small className="text-muted">
                                    {estateFirmData.freePostsRemaining} free posts remaining
                                  </small>
                                  <div className="mt-2">
                                    <Button 
                                      variant="warning" 
                                      size="sm"
                                      onClick={() => setShowSubscriptionModal(true)}
                                    >
                                      <Crown size={14} className="me-1" />
                                      Upgrade Now
                                    </Button>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                )}

                {activeTab === 'properties' && (
                  <div>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5>All Properties ({filteredProperties.length})</h5>
                      <Button 
                        variant="outline-primary" 
                        size="sm"
                        onClick={() => setShowAddPropertyModal(true)}
                      >
                        <PlusCircle size={14} className="me-1" />
                        Add Property
                      </Button>
                    </div>
                    
                    {filteredProperties.length === 0 ? (
                      <Alert variant="info">
                        <div className="text-center py-4">
                          <Building size={48} className="text-muted mb-3" />
                          <h5>No Properties Found</h5>
                          <p className="text-muted">Get started by posting your first property</p>
                          <Button 
                            variant="primary"
                            onClick={() => handleAddProperty('rent-easy')}
                          >
                            <PlusCircle size={16} className="me-2" />
                            Post First Property
                          </Button>
                        </div>
                      </Alert>
                    ) : (
                      <div className="table-responsive">
                        <Table hover>
                          <thead>
                            <tr>
                              <th>Property</th>
                              <th>Address</th>
                              <th>Rent</th>
                              <th>Status</th>
                              <th>Commission</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredProperties.map(property => (
                              <tr key={property.id}>
                                <td>
                                  <div className="d-flex align-items-center">
                                    <Home size={20} className="text-muted me-2" />
                                    <div>
                                      <div className="fw-medium">{property.name}</div>
                                      <small className="text-muted">{property.category}</small>
                                    </div>
                                  </div>
                                </td>
                                <td>
                                  <div>{property.address}</div>
                                </td>
                                <td>
                                  <div className="fw-medium">
                                    ₦{property.rentAmount.toLocaleString()}
                                  </div>
                                  <small className="text-muted">{property.rentFrequency}</small>
                                </td>
                                <td>
                                  {property.status === 'occupied' || property.status === 'rented' ? (
                                    <Badge bg="success">Occupied</Badge>
                                  ) : (
                                    <Badge bg="secondary">Available</Badge>
                                  )}
                                </td>
                                <td>
                                  <div className="text-success fw-medium">
                                    <Percent size={14} className="me-1" />
                                    0%
                                  </div>
                                  <small className="text-muted">
                                    Saved: ₦{property.commissionSaved?.toLocaleString() || '0'}
                                  </small>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Modals */}
      <SubscriptionModal 
        show={showSubscriptionModal}
        onHide={() => setShowSubscriptionModal(false)}
        onSubscribe={handleSubscribe}
        freePostsRemaining={estateFirmData.freePostsRemaining}
      />

      {/* Add Property Modal */}
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

      {/* Boost Modal */}
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

      {/* Verification Modal */}
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
          <Button variant="success" onClick={handleApplyVerification}>
            Start Verification
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default EstateDashboard;