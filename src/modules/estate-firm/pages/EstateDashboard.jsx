// src/modules/estate-firm/pages/EstateDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
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
    Check, X, ShieldCheck, Crown
} from 'lucide-react';
import { Container, Row, Col, Card, Button, Badge, Modal, Form, Table, ProgressBar, Alert } from 'react-bootstrap';
import DashboardCard from '../../../shared/components/ui/DashboardCard';
import RentCountdownTimer from '../components/RentCountdownTimer';
import PropertyHealthScore from '../components/PropertyHealthScore';
import PortfolioManager from '../components/PortfolioManager';
import ClientManager from '../components/ClientManager';
import FinancialOverview from '../components/FinancialOverview';
import ServiceManager from '../components/ServiceManager';
import BulkPropertyUpload from '../components/BulkPropertyUpload';
import EstateNav from '../components/EstateNav';
import './EstateDashboard.css';

const EstateDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State for estate firm specific data
  const [estateFirmData, setEstateFirmData] = useState({
    isVerified: false,
    verificationStatus: 'pending', // pending, verified, rejected
    freePostsUsed: 0,
    freePostsRemaining: 10,
    hasActiveSubscription: false,
    subscriptionEndDate: null,
    subscriptionType: null,
    isInMarketplace: true, // Always true per your doc
    marketplaceBoost: false,
    commissionRate: 0, // Estate firms pay 0% commission
    subscriptionFee: 10000, // Monthly fee
  });

  const [showAddPropertyModal, setShowAddPropertyModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [propertyFormData, setPropertyFormData] = useState({
    name: '',
    address: '',
    propertyType: 'residential',
    clientName: '',
    commissionRate: 0, // Always 0 for estate firms
    rentAmount: '',
    rentFrequency: 'monthly',
    managementType: 'full',
    isOnRentEasy: true,
    tags: ['verified-estate-firm'] // Tag for verified estate firm posts
  });

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
    // Estate firm specific
    postsThisMonth: 0,
    commissionSaved: 0, // Money saved from 0% commission
    subscriptionSavings: 0 // If subscribed, show savings
  });

  const [criticalAlerts, setCriticalAlerts] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [allProperties, setAllProperties] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [filter, setFilter] = useState('all');
  const [showAddExternalModal, setShowAddExternalModal] = useState(false);

  // Load estate firm data
  useEffect(() => {
    // In real app, this would come from API
    const mockEstateFirm = {
      isVerified: true, // Change based on KYC status
      verificationStatus: 'verified',
      freePostsUsed: 3,
      freePostsRemaining: 7,
      hasActiveSubscription: false,
      subscriptionEndDate: null,
      subscriptionType: null,
      isInMarketplace: true,
      marketplaceBoost: false,
      commissionRate: 0,
      subscriptionFee: 10000,
    };

    setEstateFirmData(mockEstateFirm);

    // Mock properties data
    const mockProperties = [
      {
        id: 'prop_001',
        name: '3-Bedroom Duplex, Lekki',
        type: 'rent-easy-listing',
        source: 'rent-easy',
        listingId: 'listing_001',
        managementType: 'full',
        clientId: 'client_001',
        clientName: 'Mr. Johnson Ade',
        commissionRate: 0, // Estate firm gets 0%
        rentAmount: 2500000,
        rentFrequency: 'yearly',
        rentDueDate: '2024-12-25',
        rentEndDate: '2024-12-31',
        status: 'occupied',
        tenant: { name: 'Sarah Johnson', phone: '+2348012345678', email: 'sarah@email.com' },
        healthScore: 85,
        nextMaintenance: '2024-12-15',
        address: 'Lekki Phase 1, Lagos',
        category: 'residential',
        addedDate: '2024-01-15',
        postedBy: 'estate-firm',
        tags: ['verified-estate-firm', 'zero-commission']
      },
      {
        id: 'prop_002',
        name: '2-Bedroom Flat, Ikeja',
        type: 'rent-easy-listing',
        source: 'rent-easy',
        listingId: 'listing_002',
        managementType: 'rent-only',
        clientId: 'client_002',
        clientName: 'Mrs. Bola Ahmed',
        commissionRate: 0,
        rentAmount: 1200000,
        rentFrequency: 'yearly',
        rentDueDate: '2024-11-30',
        rentEndDate: '2024-11-30',
        status: 'occupied',
        tenant: { name: 'David Smith', phone: '+2348023456789', email: 'david@email.com' },
        healthScore: 72,
        nextMaintenance: '2024-11-20',
        address: 'Ikeja GRA, Lagos',
        category: 'residential',
        addedDate: '2024-02-20',
        postedBy: 'estate-firm',
        tags: ['verified-estate-firm']
      },
      // External Properties
      {
        id: 'prop_003',
        name: 'Office Space, Victoria Island',
        type: 'external-property',
        source: 'manual',
        managementType: 'full',
        clientId: 'client_003',
        clientName: 'Tech Corp Ltd',
        commissionRate: 12,
        rentAmount: 5000000,
        rentFrequency: 'yearly',
        rentDueDate: '2024-12-10',
        rentEndDate: '2024-12-10',
        status: 'occupied',
        tenant: { name: 'Global Solutions Inc', phone: '+2348034567890', email: 'info@globalsolutions.com' },
        healthScore: 60,
        nextMaintenance: '2024-12-01',
        address: 'Adeola Odeku, VI, Lagos',
        category: 'commercial',
        addedDate: '2023-11-15',
        postedBy: 'estate-firm',
        notes: 'Long-term corporate lease'
      }
    ];

    const mockAlerts = [
      {
        id: 1,
        type: 'rent_expiry',
        message: 'Lease expires in 15 days for 3-Bedroom Duplex, Lekki',
        propertyId: 'prop_001',
        propertyName: '3-Bedroom Duplex, Lekki',
        priority: 'high',
        date: '2024-12-16',
        action: 'renew_lease'
      },
      {
        id: 2,
        type: 'subscription_expiry',
        message: 'Free posts remaining: 7. Subscribe to continue posting',
        priority: 'medium',
        action: 'subscribe'
      },
      {
        id: 3,
        type: 'verification_pending',
        message: 'Complete KYC verification to get verified badge',
        priority: 'low',
        action: 'verify',
        show: !mockEstateFirm.isVerified
      }
    ];

    const mockActivities = [
      { id: 1, action: 'Property posted on Rent Easy', property: '4-Bedroom Detached, Abuja', time: '2 hours ago' },
      { id: 2, action: 'Rent payment collected', amount: '₦2,500,000', client: 'Mr. Johnson Ade', time: '1 day ago' },
      { id: 3, action: 'Maintenance completed', property: 'Office Space, VI', time: '2 days ago' },
      { id: 4, action: 'New client onboarded', client: 'Surulere Properties Ltd', time: '3 days ago' }
    ];

    setAllProperties(mockProperties);
    setCriticalAlerts(mockAlerts.filter(alert => alert.show !== false));
    setRecentActivities(mockActivities);

    // Calculate stats
    const totalProperties = mockProperties.length;
    const rentEasyListings = mockProperties.filter(p => p.type === 'rent-easy-listing').length;
    const externalProperties = mockProperties.filter(p => p.type === 'external-property').length;
    const occupiedProperties = mockProperties.filter(p => p.status === 'occupied').length;
    
    const monthlyRevenue = mockProperties
      .filter(p => p.status === 'occupied')
      .reduce((sum, p) => sum + (p.rentAmount / 12), 0);
    
    // Calculate commission savings (7.5% saved on each RentEasy listing)
    const commissionSaved = mockProperties
      .filter(p => p.type === 'rent-easy-listing')
      .reduce((sum, p) => sum + (p.rentAmount * 0.075), 0);

    setDashboardStats({
      totalProperties,
      managedProperties: mockProperties.filter(p => p.type === 'managed-property').length,
      rentEasyListings,
      externalProperties,
      occupiedProperties,
      vacantProperties: totalProperties - occupiedProperties,
      totalTenants: occupiedProperties,
      monthlyRevenue,
      pendingPayments: mockProperties.filter(p => {
        const dueDate = new Date(p.rentDueDate);
        const today = new Date();
        return dueDate < today && p.status === 'occupied';
      }).length,
      maintenanceRequests: 2,
      expiringLeases: mockProperties.filter(p => {
        const endDate = new Date(p.rentEndDate);
        const today = new Date();
        const daysDiff = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
        return daysDiff <= 30 && p.status === 'occupied';
      }).length,
      totalClients: [...new Set(mockProperties.map(p => p.clientId))].length,
      portfolioValue: mockProperties.reduce((sum, p) => sum + (p.rentAmount * 5), 0),
      postsThisMonth: mockProperties.filter(p => {
        const addedDate = new Date(p.addedDate);
        const today = new Date();
        return addedDate.getMonth() === today.getMonth() && 
               addedDate.getFullYear() === today.getFullYear();
      }).length,
      commissionSaved,
      subscriptionSavings: mockEstateFirm.hasActiveSubscription ? 10000 : 0
    });
  }, []);

  // Check if user can post (free posts remaining or has subscription)
  const canPostProperty = () => {
    if (estateFirmData.hasActiveSubscription) return true;
    if (estateFirmData.freePostsRemaining > 0) return true;
    return false;
  };

  // Handle posting property - FIXED ROUTING
  const handleAddProperty = (type) => {
    if (!canPostProperty()) {
      setShowSubscriptionModal(true);
      return;
    }

    if (type === 'rent-easy') {
      if (estateFirmData.freePostsRemaining > 0 && !estateFirmData.hasActiveSubscription) {
        // Use one free post
        setEstateFirmData(prev => ({
          ...prev,
          freePostsUsed: prev.freePostsUsed + 1,
          freePostsRemaining: prev.freePostsRemaining - 1
        }));
      }
      
      // Navigate to post property with estate-firm type
      navigate('/dashboard/post-property?type=estate-firm');
      
    } else if (type === 'external') {
      navigate('/dashboard/estate-firm/add-external-property');
    }
  };

  // Handle subscription purchase
  const handleSubscribe = () => {
    // In real app, integrate payment gateway
    setEstateFirmData(prev => ({
      ...prev,
      hasActiveSubscription: true,
      subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      subscriptionType: 'monthly'
    }));
    setShowSubscriptionModal(false);
    alert('Subscription activated! You can now post unlimited properties.');
  };

  // Handle verification application
  const handleApplyVerification = () => {
    setEstateFirmData(prev => ({
      ...prev,
      verificationStatus: 'pending'
    }));
    setShowVerificationModal(false);
    alert('Verification application submitted! Admin will review your KYC documents.');
  };

  // Get property source badge with Bootstrap
  const getPropertySourceBadge = (property) => {
    switch(property.type) {
      case 'rent-easy-listing':
        return <Badge bg="primary" className="me-1">Rent Easy</Badge>;
      case 'external-property':
        return <Badge bg="secondary" className="me-1">External</Badge>;
      case 'managed-property':
        return <Badge bg="info" className="me-1">Managed</Badge>;
      default:
        return null;
    }
  };

  // Get estate firm status badge
  const getEstateFirmBadge = () => {
    if (estateFirmData.isVerified) {
      return <Badge bg="success" className="ms-2"><ShieldCheck size={12} /> Verified</Badge>;
    } else if (estateFirmData.verificationStatus === 'pending') {
      return <Badge bg="warning" className="ms-2"><Clock size={12} /> Pending Verification</Badge>;
    }
    return <Badge bg="danger" className="ms-2"><X size={12} /> Unverified</Badge>;
  };

  // Get subscription badge
  const getSubscriptionBadge = () => {
    if (estateFirmData.hasActiveSubscription) {
      return <Badge bg="success" className="ms-2"><Crown size={12} /> Subscribed</Badge>;
    }
    return <Badge bg="warning" className="ms-2">Free Plan</Badge>;
  };

  // Handle messaging for a property
  const handleMessageProperty = (property) => {
    if (!property.listingId) {
      // For external properties without listingId, create a chat or navigate to chat list
      navigate('/dashboard/messages');
      return;
    }
    
    // Check if chat already exists for this listing
    const chats = JSON.parse(localStorage.getItem('chats') || '[]');
    const existingChat = chats.find(c => c.listingId === property.listingId);
    
    if (existingChat) {
      navigate(`/dashboard/messages/chat/${existingChat.id}`);
    } else {
      navigate(`/dashboard/messages/${property.listingId}`);
    }
  };

  // Handle view property details
  const handleViewProperty = (property) => {
    if (property.listingId) {
      navigate(`/listings/${property.listingId}`);
    } else {
      // For external properties, navigate to estate firm property detail
      navigate(`/dashboard/estate-firm/properties/${property.id}`);
    }
  };

  // Handle rent payment
  const handleRentPayment = (property) => {
    alert(`Processing rent payment for ${property.name}`);
    // In real app, integrate payment gateway
  };

  // Handle lease renewal
  const handleLeaseRenewal = (property) => {
    alert(`Initiating lease renewal for ${property.name}`);
    // In real app, open lease renewal modal or page
  };

  const filteredProperties = allProperties.filter(property => {
    if (filter === 'all') return true;
    if (filter === 'rent-easy') return property.type === 'rent-easy-listing';
    if (filter === 'external') return property.type === 'external-property';
    if (filter === 'managed') return property.type === 'managed-property';
    return true;
  });

  return (
    <div className="estate-dashboard-container">
      {/* Estate Navigation - Now handles its own visibility */}
      <EstateNav />
      
      {/* Main Content Area */}
      <div className="estate-main-content">
        <div className="p-3 p-md-4 pt-5 pt-md-4">
          {/* Welcome Header with Estate Firm Status */}
          <Card className="mb-4 border-0 shadow-sm">
            <Card.Body>
              <Row className="align-items-center">
                <Col xs={12} md={8}>
                  <div className="d-flex align-items-center mb-2">
                    <h1 className="h4 h-md-3 mb-0">Estate Firm Dashboard</h1>
                    {getEstateFirmBadge()}
                    {getSubscriptionBadge()}
                  </div>
                  <p className="text-muted mb-0">
                    Welcome back, {user?.name || 'Estate Firm'}! 
                    Managing {dashboardStats.totalProperties} properties
                  </p>
                  
                  {/* Free Posts Counter */}
                  {!estateFirmData.hasActiveSubscription && (
                    <div className="mt-2">
                      <div className="d-flex align-items-center">
                        <span className="text-sm text-muted me-2">
                          Free posts: {estateFirmData.freePostsRemaining} remaining
                        </span>
                        <ProgressBar 
                          now={(estateFirmData.freePostsUsed / 10) * 100} 
                          className="flex-grow-1"
                          style={{ height: '8px' }}
                        />
                      </div>
                      <small className="text-muted">
                        {estateFirmData.freePostsUsed}/10 free posts used
                      </small>
                    </div>
                  )}
                </Col>
                
                <Col xs={12} md={4} className="mt-3 mt-md-0">
                  <div className="d-flex flex-column flex-md-row gap-2">
                    <Button 
                      variant="primary" 
                      className="d-flex align-items-center justify-content-center"
                      onClick={() => handleAddProperty('rent-easy')}
                    >
                      <PlusCircle size={18} className="me-2" />
                      {estateFirmData.hasActiveSubscription ? 'Post Property' : `Post (${estateFirmData.freePostsRemaining} left)`}
                    </Button>
                    
                    {!estateFirmData.hasActiveSubscription && (
                      <Button 
                        variant="outline-success" 
                        size="sm"
                        onClick={() => setShowSubscriptionModal(true)}
                      >
                        <Crown size={16} className="me-1" />
                        Subscribe
                      </Button>
                    )}
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Dashboard Tabs */}
          <Card className="mb-4">
            <Card.Body className="p-0">
              <div className="d-flex overflow-auto">
                <Button 
                  variant="link" 
                  className={`text-decoration-none px-3 py-3 ${activeTab === 'overview' ? 'border-bottom border-primary text-primary' : 'text-muted'}`}
                  onClick={() => setActiveTab('overview')}
                >
                  <BarChart size={18} className="me-2" />
                  Overview
                </Button>
                <Button 
                  variant="link" 
                  className={`text-decoration-none px-3 py-3 ${activeTab === 'portfolio' ? 'border-bottom border-primary text-primary' : 'text-muted'}`}
                  onClick={() => setActiveTab('portfolio')}
                >
                  <Briefcase size={18} className="me-2" />
                  Portfolio
                </Button>
                <Button 
                  variant="link" 
                  className={`text-decoration-none px-3 py-3 ${activeTab === 'clients' ? 'border-bottom border-primary text-primary' : 'text-muted'}`}
                  onClick={() => setActiveTab('clients')}
                >
                  <Users size={18} className="me-2" />
                  Clients
                </Button>
                <Button 
                  variant="link" 
                  className={`text-decoration-none px-3 py-3 ${activeTab === 'financial' ? 'border-bottom border-primary text-primary' : 'text-muted'}`}
                  onClick={() => setActiveTab('financial')}
                >
                  <Wallet size={18} className="me-2" />
                  Financial
                </Button>
              </div>
            </Card.Body>
          </Card>

          {/* Critical Alerts */}
          {criticalAlerts.length > 0 && activeTab === 'overview' && (
            <Alert variant="warning" className="mb-4">
              <Alert.Heading className="h6">
                <AlertCircle size={20} className="me-2" />
                Important Notifications
              </Alert.Heading>
              <div className="mt-2">
                {criticalAlerts.map(alert => (
                  <div key={alert.id} className="d-flex justify-content-between align-items-center mb-2">
                    <span>{alert.message}</span>
                    <Button 
                      variant="outline-warning" 
                      size="sm"
                      onClick={() => {
                        if (alert.action === 'subscribe') setShowSubscriptionModal(true);
                        if (alert.action === 'verify') setShowVerificationModal(true);
                        if (alert.action === 'renew_lease') handleLeaseRenewal(allProperties.find(p => p.id === alert.propertyId));
                      }}
                    >
                      {alert.action.replace('_', ' ')}
                    </Button>
                  </div>
                ))}
              </div>
            </Alert>
          )}

          {/* Dashboard Stats - Overview Tab */}
          {activeTab === 'overview' && (
            <>
              {/* Quick Stats */}
              <Row className="g-3 mb-4">
                <Col xs={6} md={3}>
                  <Card className="h-100">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h6 className="text-muted mb-1">Total Properties</h6>
                          <h3 className="mb-0">{dashboardStats.totalProperties}</h3>
                        </div>
                        <Building size={24} className="text-primary" />
                      </div>
                      <small className="text-muted">
                        {dashboardStats.rentEasyListings} Rent Easy • {dashboardStats.externalProperties} External
                      </small>
                    </Card.Body>
                  </Card>
                </Col>
                
                <Col xs={6} md={3}>
                  <Card className="h-100">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h6 className="text-muted mb-1">Occupancy</h6>
                          <h3 className="mb-0">
                            {dashboardStats.totalProperties > 0 
                              ? `${Math.round((dashboardStats.occupiedProperties / dashboardStats.totalProperties) * 100)}%`
                              : '0%'
                            }
                          </h3>
                        </div>
                        <Home size={24} className="text-success" />
                      </div>
                      <small className="text-muted">
                        {dashboardStats.occupiedProperties} occupied • {dashboardStats.vacantProperties} vacant
                      </small>
                    </Card.Body>
                  </Card>
                </Col>
                
                <Col xs={6} md={3}>
                  <Card className="h-100">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h6 className="text-muted mb-1">Monthly Revenue</h6>
                          <h3 className="mb-0">
                            ₦{(dashboardStats.monthlyRevenue / 1000000).toFixed(1)}M
                          </h3>
                        </div>
                        <DollarSign size={24} className="text-purple" />
                      </div>
                      <small className="text-muted">
                        From {dashboardStats.occupiedProperties} properties
                      </small>
                    </Card.Body>
                  </Card>
                </Col>
                
                <Col xs={6} md={3}>
                  <Card className="h-100">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h6 className="text-muted mb-1">Commission Saved</h6>
                          <h3 className="mb-0">
                            ₦{(dashboardStats.commissionSaved / 1000000).toFixed(1)}M
                          </h3>
                        </div>
                        <Shield size={24} className="text-warning" />
                      </div>
                      <small className="text-muted">
                        0% commission on {dashboardStats.rentEasyListings} listings
                      </small>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              {/* Properties Table - Mobile Responsive */}
<Card className="mb-4">
  <Card.Body>
    <div className="d-flex justify-content-between align-items-center mb-3">
      <h5 className="mb-0 d-none d-md-block">Property Portfolio</h5>
      <h5 className="mb-0 d-md-none">Properties</h5>
      <div className="d-flex flex-wrap gap-2">
        <Button 
          variant={filter === 'all' ? 'primary' : 'outline-secondary'} 
          size="sm"
          onClick={() => setFilter('all')}
          className="flex-shrink-0"
        >
          All
        </Button>
        <Button 
          variant={filter === 'rent-easy' ? 'primary' : 'outline-secondary'} 
          size="sm"
          onClick={() => setFilter('rent-easy')}
          className="flex-shrink-0"
        >
          <span className="d-none d-sm-inline">Rent Easy</span>
          <span className="d-sm-none">Rent</span>
        </Button>
        <Button 
          variant={filter === 'external' ? 'primary' : 'outline-secondary'} 
          size="sm"
          onClick={() => setFilter('external')}
          className="flex-shrink-0"
        >
          <span className="d-none d-sm-inline">External</span>
          <span className="d-sm-none">Ext</span>
        </Button>
      </div>
    </div>

    {/* Desktop Table */}
    <div className="d-none d-md-block">
      <div className="table-responsive">
        <Table hover className="mb-0">
          <thead>
            <tr>
              <th>Property</th>
              <th>Client</th>
              <th>Rent</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProperties.map(property => (
              <tr key={property.id}>
                <td>
                  <div className="d-flex flex-column">
                    <strong className="mb-1">{property.name}</strong>
                    <div className="d-flex align-items-center flex-wrap">
                      {getPropertySourceBadge(property)}
                      {property.postedBy === 'estate-firm' && (
                        <Badge bg="info" className="ms-1">Estate Firm</Badge>
                      )}
                      <small className="text-muted ms-2 text-truncate">{property.address}</small>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="d-flex flex-column">
                    <strong>{property.clientName}</strong>
                    <small className="text-muted">{property.commissionRate}% commission</small>
                  </div>
                </td>
                <td>
                  <div className="d-flex flex-column">
                    <strong>₦{property.rentAmount.toLocaleString()}</strong>
                    <small className="text-muted">/{property.rentFrequency}</small>
                  </div>
                </td>
                <td>
                  <Badge bg={property.status === 'occupied' ? 'success' : 'danger'}>
                    {property.status}
                  </Badge>
                </td>
                <td>
                  <div className="d-flex gap-1 flex-wrap">
                    <Button 
                      size="sm" 
                      variant="outline-primary"
                      onClick={() => handleViewProperty(property)}
                      title="View Property"
                    >
                      <ExternalLink size={14} />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline-success"
                      onClick={() => handleMessageProperty(property)}
                      title="Message"
                    >
                      <MessageSquare size={14} />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline-warning"
                      onClick={() => handleLeaseRenewal(property)}
                      title="Renew Lease"
                    >
                      <Clock size={14} />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline-info"
                      onClick={() => handleRentPayment(property)}
                      title="Rent Payment"
                    >
                      <DollarSign size={14} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>

    {/* Mobile Cards Layout */}
    <div className="d-md-none">
      {filteredProperties.map(property => (
        <Card key={property.id} className="mb-3 shadow-sm">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-start mb-2">
              <div className="flex-grow-1">
                <h6 className="mb-1 fw-bold">{property.name}</h6>
                <div className="d-flex flex-wrap align-items-center gap-1 mb-2">
                  {getPropertySourceBadge(property)}
                  {property.postedBy === 'estate-firm' && (
                    <Badge bg="info">Estate Firm</Badge>
                  )}
                </div>
                <small className="text-muted d-block mb-2">{property.address}</small>
              </div>
              <Badge bg={property.status === 'occupied' ? 'success' : 'danger'} className="flex-shrink-0">
                {property.status}
              </Badge>
            </div>
            
            <div className="row g-2 mb-3">
              <div className="col-6">
                <div className="bg-light p-2 rounded">
                  <small className="text-muted d-block">Client</small>
                  <strong className="d-block text-truncate">{property.clientName}</strong>
                </div>
              </div>
              <div className="col-6">
                <div className="bg-light p-2 rounded">
                  <small className="text-muted d-block">Rent</small>
                  <strong className="d-block">₦{property.rentAmount.toLocaleString()}</strong>
                  <small className="text-muted">/{property.rentFrequency}</small>
                </div>
              </div>
              <div className="col-12">
                <div className="bg-light p-2 rounded">
                  <small className="text-muted d-block">Commission</small>
                  <strong className="d-block">{property.commissionRate}%</strong>
                </div>
              </div>
            </div>
            
            <div className="d-flex gap-2 justify-content-center">
              <Button 
                size="sm" 
                variant="outline-primary"
                onClick={() => handleViewProperty(property)}
                className="flex-fill"
              >
                <ExternalLink size={14} className="me-1" />
                <span className="d-none d-sm-inline">View</span>
              </Button>
              <Button 
                size="sm" 
                variant="outline-success"
                onClick={() => handleMessageProperty(property)}
                className="flex-fill"
              >
                <MessageSquare size={14} className="me-1" />
                <span className="d-none d-sm-inline">Message</span>
              </Button>
              <Button 
                size="sm" 
                variant="outline-warning"
                onClick={() => handleLeaseRenewal(property)}
                className="flex-fill"
              >
                <Clock size={14} className="me-1" />
                <span className="d-none d-sm-inline">Renew</span>
              </Button>
            </div>
          </Card.Body>
        </Card>
      ))}
    </div>

    {filteredProperties.length === 0 && (
      <div className="text-center py-5">
        <Building size={48} className="text-muted mb-3" />
        <h5>No Properties Found</h5>
        <p className="text-muted">Try changing your filter or add a new property</p>
        <Button 
          variant="primary"
          onClick={() => handleAddProperty('rent-easy')}
        >
          Add Property
        </Button>
      </div>
    )}
  </Card.Body>
</Card>

              {/* Quick Stats Row */}
              <Row className="g-3 mb-4">
                <Col xs={12} md={6}>
                  <Card>
                    <Card.Body>
                      <h5 className="mb-3">Recent Activity</h5>
                      <div className="list-group list-group-flush">
                        {recentActivities.map(activity => (
                          <div key={activity.id} className="list-group-item border-0 px-0 py-2">
                            <div className="d-flex justify-content-between">
                              <div>
                                <p className="mb-1">{activity.action}</p>
                                {activity.property && <small className="text-muted">{activity.property}</small>}
                              </div>
                              <small className="text-muted">{activity.time}</small>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
                
                <Col xs={12} md={6}>
                  <Card>
                    <Card.Body>
                      <h5 className="mb-3">Quick Actions</h5>
                      <Row className="g-2">
                        <Col xs={6}>
                          <Button 
                            variant="outline-primary" 
                            className="w-100 h-100 d-flex flex-column align-items-center justify-content-center p-3"
                            onClick={() => handleAddProperty('rent-easy')}
                          >
                            <PlusCircle size={24} className="mb-2" />
                            <span>Add Property</span>
                          </Button>
                        </Col>
                        <Col xs={6}>
                          <Button 
                            variant="outline-success" 
                            className="w-100 h-100 d-flex flex-column align-items-center justify-content-center p-3"
                            onClick={() => navigate('/dashboard/messages')}
                          >
                            <MessageSquare size={24} className="mb-2" />
                            <span>Messages</span>
                          </Button>
                        </Col>
                        <Col xs={6}>
                          <Button 
                            variant="outline-warning" 
                            className="w-100 h-100 d-flex flex-column align-items-center justify-content-center p-3"
                            onClick={() => navigate('/dashboard/estate-firm/documents')}
                          >
                            <FileText size={24} className="mb-2" />
                            <span>Documents</span>
                          </Button>
                        </Col>
                        <Col xs={6}>
                          <Button 
                            variant="outline-info" 
                            className="w-100 h-100 d-flex flex-column align-items-center justify-content-center p-3"
                            onClick={() => navigate('/marketplace')}
                          >
                            <Globe size={24} className="mb-2" />
                            <span>Marketplace</span>
                          </Button>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </>
          )}

          {/* Portfolio Management Tab */}
          {activeTab === 'portfolio' && (
            <PortfolioManager 
              properties={allProperties}
              onAddProperty={handleAddProperty}
              canPost={canPostProperty()}
              onMessageProperty={handleMessageProperty}
              onViewProperty={handleViewProperty}
            />
          )}

          {/* Clients Management Tab */}
          {activeTab === 'clients' && (
            <ClientManager 
              properties={allProperties}
              clients={[...new Set(allProperties.map(p => ({id: p.clientId, name: p.clientName})))]}
              onMessageProperty={handleMessageProperty}
            />
          )}

          {/* Financial Tab */}
          {activeTab === 'financial' && (
            <FinancialOverview 
              properties={allProperties}
              dashboardStats={dashboardStats}
              estateFirmData={estateFirmData}
              onMessageProperty={handleMessageProperty}
            />
          )}
        </div>
      </div>

      {/* Subscription Modal */}
      <Modal show={showSubscriptionModal} onHide={() => setShowSubscriptionModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Subscribe to Premium</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center mb-4">
            <Crown size={48} className="text-warning mb-3" />
            <h4>Unlock Unlimited Posting</h4>
            <p className="text-muted">
              Subscribe to post unlimited properties on RentEasy with 0% commission
            </p>
          </div>
          
          <Card className="border-primary">
            <Card.Body>
              <h5 className="text-center">Monthly Subscription</h5>
              <h2 className="text-center text-primary">₦10,000</h2>
              <ul className="list-unstyled mt-3">
                <li className="mb-2"><Check size={16} className="text-success me-2" /> Unlimited property posts</li>
                <li className="mb-2"><Check size={16} className="text-success me-2" /> 0% commission on all listings</li>
                <li className="mb-2"><Check size={16} className="text-success me-2" /> Verified Estate Firm badge</li>
                <li className="mb-2"><Check size={16} className="text-success me-2" /> Priority in marketplace</li>
                <li><Check size={16} className="text-success me-2" /> Advanced analytics</li>
              </ul>
            </Card.Body>
          </Card>
          
          <div className="alert alert-info mt-3">
            <small>
              <strong>Note:</strong> You have {estateFirmData.freePostsRemaining} free posts remaining. 
              Subscription will reset your post count immediately.
            </small>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSubscriptionModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubscribe}>
            Subscribe Now
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Verification Modal */}
      <Modal show={showVerificationModal} onHide={() => setShowVerificationModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Get Verified</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center mb-4">
            <ShieldCheck size={48} className="text-success mb-3" />
            <h4>Verify Your Estate Firm</h4>
            <p className="text-muted">
              Complete KYC verification to get the "Verified Estate Firm" badge
            </p>
          </div>
          
          <div className="alert alert-warning">
            <h6>Documents Required:</h6>
            <ul className="mb-0">
              <li>Company registration certificate</li>
              <li>Valid ID of director(s)</li>
              <li>Utility bill (not older than 3 months)</li>
              <li>Tax clearance certificate</li>
            </ul>
          </div>
          
          <p className="text-muted small">
            Verification usually takes 24-48 hours. Once verified, you'll get the verified badge 
            on all your listings and in the marketplace.
          </p>
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