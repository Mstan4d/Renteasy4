import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../shared/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
    Home, Building, Users, DollarSign, FileText, 
    AlertCircle, Calendar, TrendingUp, PlusCircle,
    Upload, Briefcase, Wallet, BarChart,
    ExternalLink, Shield, Clock, Filter,
    MessageSquare, Globe, Star, Settings,
    Download, Eye, Edit, Trash2,
    CreditCard, Receipt, PieChart, Target,
    ChevronRight, Phone, Mail, MapPin,
    CheckCircle, XCircle, UserPlus, Search
} from 'lucide-react';
// Import components
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
  const [showAddPropertyModal, setShowAddPropertyModal] = useState(false);
  const [propertyFormData, setPropertyFormData] = useState({
    name: '',
    address: '',
    propertyType: 'residential',
    clientName: '',
    commissionRate: 10,
    rentAmount: '',
    rentFrequency: 'monthly',
    managementType: 'full'
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
    portfolioValue: 0
  });

  const [criticalAlerts, setCriticalAlerts] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [allProperties, setAllProperties] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [filter, setFilter] = useState('all');
  const [showAddExternalModal, setShowAddExternalModal] = useState(false);

  // Mock data for development
  useEffect(() => {
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
        commissionRate: 10,
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
        addedDate: '2024-01-15'
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
        commissionRate: 8,
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
        addedDate: '2024-02-20'
      },
      // External Properties (not on Rent Easy)
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
        notes: 'Long-term corporate lease'
      },
      {
        id: 'prop_004',
        name: '4-Bedroom Detached, Abuja',
        type: 'external-property',
        source: 'csv-import',
        managementType: 'full',
        clientId: 'client_004',
        clientName: 'Alhaji Musa Ibrahim',
        commissionRate: 10,
        rentAmount: 3500000,
        rentFrequency: 'yearly',
        rentDueDate: '2025-01-15',
        rentEndDate: '2025-01-15',
        status: 'occupied',
        tenant: { name: 'Expat Family', phone: '+2348045678901', email: 'expat@email.com' },
        healthScore: 90,
        nextMaintenance: '2024-12-30',
        address: 'Maitama, Abuja',
        category: 'residential',
        addedDate: '2024-03-10',
        notes: 'Diplomatic tenant'
      },
      // Managed only (not owner, just managing)
      {
        id: 'prop_005',
        name: 'Shopping Complex, Surulere',
        type: 'managed-property',
        source: 'manual',
        managementType: 'maintenance-only',
        clientId: 'client_005',
        clientName: 'Surulere Properties Ltd',
        commissionRate: 5,
        rentAmount: 8000000,
        rentFrequency: 'yearly',
        rentDueDate: '2024-12-20',
        rentEndDate: '2025-12-20',
        status: 'occupied',
        tenant: { name: 'Various Shop Owners', phone: 'N/A', email: 'N/A' },
        healthScore: 75,
        nextMaintenance: '2024-12-05',
        address: 'Bode Thomas, Surulere, Lagos',
        category: 'commercial',
        addedDate: '2024-04-05',
        notes: 'Multi-tenant commercial space'
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
        type: 'payment_due',
        message: 'Rent payment due in 7 days for 2-Bedroom Flat, Ikeja',
        propertyId: 'prop_002',
        propertyName: '2-Bedroom Flat, Ikeja',
        priority: 'medium',
        date: '2024-11-23',
        action: 'send_reminder'
      },
      {
        id: 3,
        type: 'maintenance',
        message: 'Scheduled maintenance due for Office Space, VI',
        propertyId: 'prop_003',
        propertyName: 'Office Space, Victoria Island',
        priority: 'low',
        date: '2024-12-01',
        action: 'schedule_maintenance'
      }
    ];

    const mockActivities = [
      { id: 1, action: 'External property added', property: '4-Bedroom Detached, Abuja', time: '2 hours ago' },
      { id: 2, action: 'Rent payment received', amount: '₦2,500,000', client: 'Mr. Johnson Ade', time: '1 day ago' },
      { id: 3, action: 'Maintenance completed', property: 'Shopping Complex, Surulere', time: '2 days ago' },
      { id: 4, action: 'New client onboarded', client: 'Surulere Properties Ltd', time: '3 days ago' },
      { id: 5, action: 'Lease renewed', property: 'Office Space, VI', time: '5 days ago' }
    ];

    setAllProperties(mockProperties);
    setCriticalAlerts(mockAlerts);
    setRecentActivities(mockActivities);

    // Calculate comprehensive dashboard stats
    const totalProperties = mockProperties.length;
    const rentEasyListings = mockProperties.filter(p => p.type === 'rent-easy-listing').length;
    const externalProperties = mockProperties.filter(p => p.type === 'external-property').length;
    const managedProperties = mockProperties.filter(p => p.type === 'managed-property').length;
    const occupiedProperties = mockProperties.filter(p => p.status === 'occupied').length;
    const vacantProperties = totalProperties - occupiedProperties;
    
    const uniqueClients = [...new Set(mockProperties.map(p => p.clientId))].length;
    
    const monthlyRevenue = mockProperties
      .filter(p => p.status === 'occupied')
      .reduce((sum, p) => sum + (p.rentAmount / 12), 0);
    
    const pendingPayments = mockProperties.filter(p => {
      const dueDate = new Date(p.rentDueDate);
      const today = new Date();
      return dueDate < today && p.status === 'occupied';
    }).length;
    
    const expiringLeases = mockProperties.filter(p => {
      const endDate = new Date(p.rentEndDate);
      const today = new Date();
      const daysDiff = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
      return daysDiff <= 30 && p.status === 'occupied';
    }).length;

    const portfolioValue = mockProperties.reduce((sum, p) => {
      // Simplified valuation: 5 years of rent
      return sum + (p.rentAmount * 5);
    }, 0);

    setDashboardStats({
      totalProperties,
      managedProperties,
      rentEasyListings,
      externalProperties,
      occupiedProperties,
      vacantProperties,
      totalTenants: occupiedProperties, // Each occupied property has tenant(s)
      monthlyRevenue,
      pendingPayments,
      maintenanceRequests: 3, // Mock value
      expiringLeases,
      totalClients: uniqueClients,
      portfolioValue
    });
  }, []);

   // Add to EstateDashboard.jsx for swipe functionality
const [activeSwipeIndex, setActiveSwipeIndex] = useState(0);

const handleSwipe = (direction) => {
  const panels = ['overview', 'portfolio', 'clients', 'financial'];
  const currentIndex = panels.indexOf(activeTab);
  
  if (direction === 'right' && currentIndex > 0) {
    setActiveTab(panels[currentIndex - 1]);
  } else if (direction === 'left' && currentIndex < panels.length - 1) {
    setActiveTab(panels[currentIndex + 1]);
  }
};

// Add touch event listeners for swipe detection

  // Navigation functions
  const handleAddProperty = (type) => {
    if (type === 'rent-easy') {
      navigate('/dashboard/post-property');
    } else if (type === 'external') {
      setShowAddExternalModal(true);
    }
  };

  const handleBulkUpload = (file) => {
    console.log('Bulk upload file:', file);
    // Process CSV/Excel file for external properties
    alert(`Uploaded ${file.name} successfully!`);
  };

  const handleRenewLease = (property) => {
    alert(`Renewing lease for: ${property.name}`);
    // In real app, open modal or navigate to renewal page
  };

  const handleViewDetails = (property) => {
    alert(`Viewing details for: ${property.name}\n\nAddress: ${property.address}\nClient: ${property.clientName}\nRent: ₦${property.rentAmount.toLocaleString()}/${property.rentFrequency}`);
  };

  const handleCallTenant = (phoneNumber) => {
    if (phoneNumber && phoneNumber !== 'N/A') {
      // Copy to clipboard
      navigator.clipboard.writeText(phoneNumber)
        .then(() => {
          alert(`Tenant's phone number (${phoneNumber}) copied to clipboard! Opening phone app...`);
          // Open phone app
          window.open(`tel:${phoneNumber}`);
        })
        .catch(err => {
          console.error('Failed to copy:', err);
          alert(`Tenant's phone: ${phoneNumber}`);
        });
    } else {
      alert('No phone number available for this tenant');
    }
  };

  const handleCollectRent = (property) => {
    alert(`Collect rent for: ${property.name}\n\nAmount: ₦${property.rentAmount.toLocaleString()}\nDue: ${property.rentDueDate}`);
  };

  const handleSendReminder = (property) => {
    alert(`Sending reminder to tenant of: ${property.name}\n\nNext payment due: ${property.rentDueDate}`);
  };

  const handleEditProperty = (property) => {
    alert(`Editing property: ${property.name}`);
    // In real app, navigate to edit page or open modal
  };

  const handleAddExternalProperty = () => {
    setShowAddPropertyModal(true);
  };

  const handleSubmitExternalProperty = (e) => {
    e.preventDefault();
    alert(`External property added successfully!\n\nName: ${propertyFormData.name}\nAddress: ${propertyFormData.address}\nClient: ${propertyFormData.clientName}`);
    setShowAddPropertyModal(false);
    setPropertyFormData({
      name: '',
      address: '',
      propertyType: 'residential',
      clientName: '',
      commissionRate: 10,
      rentAmount: '',
      rentFrequency: 'monthly',
      managementType: 'full'
    });
  };

  const filteredProperties = allProperties.filter(property => {
    if (filter === 'all') return true;
    if (filter === 'rent-easy') return property.type === 'rent-easy-listing';
    if (filter === 'external') return property.type === 'external-property';
    if (filter === 'managed') return property.type === 'managed-property';
    return true;
  });

  const getPropertySourceBadge = (property) => {
    switch(property.type) {
      case 'rent-easy-listing':
        return <span className="badge badge-rent-easy">Rent Easy</span>;
      case 'external-property':
        return <span className="badge badge-external">External</span>;
      case 'managed-property':
        return <span className="badge badge-managed">Managed</span>;
      default:
        return null;
    }
  };

  // Quick action handlers
  const handleQuickAction = (action) => {
    switch(action) {
      case 'collect-rent':
        alert('Opening rent collection...');
        break;
      case 'generate-invoice':
        alert('Generating invoice...');
        break;
      case 'add-client':
        navigate('/dashboard/estate-firm/clients');
        break;
      case 'report-maintenance':
        alert('Reporting maintenance issue...');
        break;
      case 'verify-property':
        navigate('/dashboard/estate-firm/verification');
        break;
      case 'view-analytics':
        navigate('/dashboard/estate-firm/analytics');
        break;
      default:
        break;
    }
  };

  return (
    <div className="estate-dashboard-container">
      {/* Side Navigation */}
      <EstateNav />
      
      <div className="estate-dashboard">
        {/* Welcome Header */}
        <div className="dashboard-header">
          <div className="welcome-section">
            <h1>Property Portfolio Dashboard</h1>
            <p className="subtitle">
              Welcome back, {user?.name || 'Estate Firm'}! 
              Managing {dashboardStats.totalProperties} properties across your portfolio
            </p>
          </div>
          
          <div className="header-actions">
            <div className="action-buttons">
              <button 
                className="btn btn-primary" 
                onClick={() => handleAddProperty('rent-easy')}
              >
                <PlusCircle size={18} />
                Post on Rent Easy
              </button>
              <button 
                className="btn btn-outline" 
                onClick={() => handleAddProperty('/dashboard/estate-firm/add-external-property')}
              >
                <Building size={18} />
                Add External Property
              </button>
              <BulkPropertyUpload onUpload={handleBulkUpload} />
            </div>
          </div>
        </div>

        {/* Dashboard Tabs */}
        <div className="dashboard-tabs">
          <button 
            className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <BarChart size={18} />
            Overview
          </button>
          <button 
            className={`tab ${activeTab === 'portfolio' ? 'active' : ''}`}
            onClick={() => setActiveTab('portfolio')}
          >
            <Briefcase size={18} />
            Portfolio
          </button>
          <button 
            className={`tab ${activeTab === 'clients' ? 'active' : ''}`}
            onClick={() => setActiveTab('clients')}
          >
            <Users size={18} />
            Clients
          </button>
          <button 
            className={`tab ${activeTab === 'financial' ? 'active' : ''}`}
            onClick={() => setActiveTab('financial')}
          >
            <Wallet size={18} />
            Financial
          </button>
          <button 
            className={`tab ${activeTab === 'services' ? 'active' : ''}`}
            onClick={() => navigate('/dashboard/estate-firm/services')}
          >
            <Briefcase size={18} />
            Services
          </button>
          <button 
            className={`tab ${activeTab === 'documents' ? 'active' : ''}`}
            onClick={() => navigate('/dashboard/estate-firm/documents')}
          >
            <FileText size={18} />
            Documents
          </button>
        </div>

        {/* Critical Alerts */}
        {criticalAlerts.length > 0 && activeTab === 'overview' && (
          <div className="alerts-section">
            <div className="section-header">
              <AlertCircle size={20} color="#ef4444" />
              <h3>Critical Alerts</h3>
            </div>
            <div className="alerts-grid">
              {criticalAlerts.map(alert => (
                <div key={alert.id} className={`alert-card ${alert.priority}`}>
                  <div className="alert-content">
                    <div className="alert-header">
                      <span className="alert-type">{alert.type.replace('_', ' ')}</span>
                      {getPropertySourceBadge(allProperties.find(p => p.id === alert.propertyId))}
                    </div>
                    <p>{alert.message}</p>
                    <small>Due: {alert.date}</small>
                  </div>
                  <div className="alert-actions">
                    <button className="btn btn-sm" onClick={() => alert.action === 'renew_lease' ? handleRenewLease(allProperties.find(p => p.id === alert.propertyId)) : null}>
                      {alert.action.replace('_', ' ')}
                    </button>
                    <button 
                      className="btn btn-sm btn-outline"
                      onClick={() => handleViewDetails(allProperties.find(p => p.id === alert.propertyId))}
                    >
                      View Property
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dashboard Stats - Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Portfolio Summary Stats */}
            <div className="stats-grid">
              <DashboardCard
                title="Total Portfolio"
                value={dashboardStats.totalProperties}
                icon={<Building size={24} />}
                subtitle={`${dashboardStats.rentEasyListings} Rent Easy | ${dashboardStats.externalProperties} External`}
                color="blue"
                onClick={() => navigate('/dashboard/estate-firm/properties')}
              />
              
              <DashboardCard
                title="Occupancy Rate"
                value={`${((dashboardStats.occupiedProperties / dashboardStats.totalProperties) * 100).toFixed(1)}%`}
                icon={<Home size={24} />}
                subtitle={`${dashboardStats.occupiedProperties} occupied | ${dashboardStats.vacantProperties} vacant`}
                color="green"
              />
              
              <DashboardCard
                title="Monthly Revenue"
                value={`₦${dashboardStats.monthlyRevenue.toLocaleString()}`}
                icon={<DollarSign size={24} />}
                subtitle={`From ${dashboardStats.occupiedProperties} properties`}
                color="purple"
                onClick={() => navigate('/dashboard/estate-firm/analytics')}
              />
              
              <DashboardCard
                title="Active Clients"
                value={dashboardStats.totalClients}
                icon={<Users size={24} />}
                subtitle={`${dashboardStats.managedProperties} managed properties`}
                color="orange"
                onClick={() => navigate('/dashboard/estate-firm/clients')}
              />
            </div>

            {/* Property Source Breakdown */}
            <div className="breakdown-section">
              <div className="content-card">
                <div className="card-header">
                  <h3>Property Portfolio Breakdown</h3>
                  <div className="filter-buttons">
                    <button 
                      className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                      onClick={() => setFilter('all')}
                    >
                      All Properties
                    </button>
                    <button 
                      className={`filter-btn ${filter === 'rent-easy' ? 'active' : ''}`}
                      onClick={() => setFilter('rent-easy')}
                    >
                      Rent Easy Listings
                    </button>
                    <button 
                      className={`filter-btn ${filter === 'external' ? 'active' : ''}`}
                      onClick={() => setFilter('external')}
                    >
                      External Properties
                    </button>
                    <button 
                      className={`filter-btn ${filter === 'managed' ? 'active' : ''}`}
                      onClick={() => setFilter('managed')}
                    >
                      Managed Only
                    </button>
                  </div>
                </div>
                
                <div className="properties-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Property Name</th>
                        <th>Type</th>
                        <th>Client</th>
                        <th>Rent Amount</th>
                        <th>Status</th>
                        <th>Next Payment</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProperties.map(property => (
                        <tr key={property.id}>
                          <td>
                            <div className="property-info">
                              <strong>{property.name}</strong>
                              <div className="property-meta">
                                {getPropertySourceBadge(property)}
                                <span className="property-address">{property.address}</span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className={`property-type ${property.category}`}>
                              {property.category}
                            </span>
                          </td>
                          <td>
                            <div className="client-info">
                              <strong>{property.clientName}</strong>
                              <small>{property.commissionRate}% commission</small>
                            </div>
                          </td>
                          <td>
                            <div className="rent-amount">
                              <strong>₦{property.rentAmount.toLocaleString()}</strong>
                              <small>/{property.rentFrequency}</small>
                            </div>
                          </td>
                          <td>
                            <span className={`status-badge ${property.status}`}>
                              {property.status}
                            </span>
                          </td>
                          <td>
                            <div className="payment-due">
                              <Calendar size={14} />
                              <span>{property.rentDueDate}</span>
                            </div>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button 
                                className="btn-icon" 
                                title="View Details"
                                onClick={() => handleViewDetails(property)}
                              >
                                <ExternalLink size={16} />
                              </button>
                              <button 
                                className="btn-icon" 
                                title="Collect Rent"
                                onClick={() => handleCollectRent(property)}
                              >
                                <DollarSign size={16} />
                              </button>
                              <button 
                                className="btn-icon" 
                                title="Send Reminder"
                                onClick={() => handleSendReminder(property)}
                              >
                                <Clock size={16} />
                              </button>
                              {property.tenant?.phone && property.tenant.phone !== 'N/A' && (
                                <button 
                                  className="btn-icon" 
                                  title="Call Tenant"
                                  onClick={() => handleCallTenant(property.tenant.phone)}
                                >
                                  <Phone size={16} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="main-content-grid">
              {/* Rent Expiry Countdown */}
              <div className="content-card">
                <div className="card-header">
                  <Calendar size={20} />
                  <h3>Upcoming Rent Expirations</h3>
                </div>
                <div className="countdown-list">
                  {allProperties
                    .filter(p => p.status === 'occupied')
                    .slice(0, 5)
                    .map(property => (
                      <RentCountdownTimer
                        key={property.id}
                        property={property}
                        showSource={true}
                        onRenew={() => handleRenewLease(property)}
                        onView={() => handleViewDetails(property)}
                      />
                    ))}
                </div>
              </div>

              {/* Property Health Scores */}
              <div className="content-card">
                <div className="card-header">
                  <TrendingUp size={20} />
                  <h3>Property Health Scores</h3>
                </div>
                <div className="health-scores">
                  {allProperties.slice(0, 4).map(property => (
                    <PropertyHealthScore
                      key={property.id}
                      property={property}
                      score={property.healthScore}
                      showSource={true}
                    />
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="content-card">
                <div className="card-header">
                  <Users size={20} />
                  <h3>Recent Activity</h3>
                </div>
                <div className="activity-list">
                  {recentActivities.map(activity => (
                    <div key={activity.id} className="activity-item">
                      <div className="activity-dot"></div>
                      <div className="activity-content">
                        <p>{activity.action}</p>
                        {activity.property && <small>{activity.property}</small>}
                        {activity.client && <small>Client: {activity.client}</small>}
                        {activity.amount && <small>{activity.amount}</small>}
                      </div>
                      <span className="activity-time">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="content-card">
                <div className="card-header">
                  <h3>Quick Actions</h3>
                </div>
                <div className="quick-actions-grid">
                  <button 
                    className="quick-action-btn"
                    onClick={() => handleQuickAction('collect-rent')}
                  >
                    <DollarSign size={20} />
                    <span>Collect Rent</span>
                  </button>
                  <button 
                    className="quick-action-btn"
                    onClick={() => handleQuickAction('generate-invoice')}
                  >
                    <FileText size={20} />
                    <span>Generate Invoice</span>
                  </button>
                  <button 
                    className="quick-action-btn"
                    onClick={() => handleQuickAction('add-client')}
                  >
                    <Users size={20} />
                    <span>Add Client</span>
                  </button>
                  <button 
                    className="quick-action-btn"
                    onClick={() => handleQuickAction('report-maintenance')}
                  >
                    <AlertCircle size={20} />
                    <span>Report Maintenance</span>
                  </button>
                  <button 
                    className="quick-action-btn"
                    onClick={() => handleQuickAction('verify-property')}
                  >
                    <Shield size={20} />
                    <span>Verify Property</span>
                  </button>
                  <button 
                    className="quick-action-btn"
                    onClick={() => handleQuickAction('view-analytics')}
                  >
                    <BarChart size={20} />
                    <span>View Analytics</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Portfolio Performance */}
            <div className="performance-summary">
              <h3>Portfolio Performance</h3>
              <div className="performance-stats">
                <div className="performance-stat">
                  <span className="stat-label">Portfolio Value</span>
                  <span className="stat-value">
                    ₦{(dashboardStats.portfolioValue / 1000000).toFixed(1)}M
                  </span>
                </div>
                <div className="performance-stat">
                  <span className="stat-label">Average Rent Yield</span>
                  <span className="stat-value">8.2%</span>
                </div>
                <div className="performance-stat">
                  <span className="stat-label">Client Satisfaction</span>
                  <span className="stat-value">4.7/5</span>
                </div>
                <div className="performance-stat">
                  <span className="stat-label">On-time Rent Collection</span>
                  <span className="stat-value">94%</span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Portfolio Management Tab */}
        {activeTab === 'portfolio' && (
          <PortfolioManager 
            properties={allProperties}
            onAddProperty={handleAddProperty}
            onBulkUpload={handleBulkUpload}
            onEditProperty={handleEditProperty}
          />
        )}

        {/* Clients Management Tab */}
        {activeTab === 'clients' && (
          <ClientManager 
            properties={allProperties}
            clients={[...new Set(allProperties.map(p => ({id: p.clientId, name: p.clientName})))]}
          />
        )}

        {/* Financial Tab */}
        {activeTab === 'financial' && (
          <FinancialOverview 
            properties={allProperties}
            dashboardStats={dashboardStats}
          />
        )}

        {/* Add External Property Modal */}
        {showAddExternalModal && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h3>Add External Property</h3>
                <button 
                  className="modal-close"
                  onClick={() => setShowAddExternalModal(false)}
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={handleSubmitExternalProperty}>
                <div className="modal-body">
                  <div className="form-group">
                    <label>Property Name *</label>
                    <input
                      type="text"
                      value={propertyFormData.name}
                      onChange={(e) => setPropertyFormData({...propertyFormData, name: e.target.value})}
                      placeholder="e.g., 3-Bedroom Duplex, Lekki"
                      className="form-input"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Address *</label>
                    <input
                      type="text"
                      value={propertyFormData.address}
                      onChange={(e) => setPropertyFormData({...propertyFormData, address: e.target.value})}
                      placeholder="Full address"
                      className="form-input"
                      required
                    />
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Property Type</label>
                      <select
                        value={propertyFormData.propertyType}
                        onChange={(e) => setPropertyFormData({...propertyFormData, propertyType: e.target.value})}
                        className="form-select"
                      >
                        <option value="residential">Residential</option>
                        <option value="commercial">Commercial</option>
                        <option value="industrial">Industrial</option>
                        <option value="land">Land</option>
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label>Client Name</label>
                      <input
                        type="text"
                        value={propertyFormData.clientName}
                        onChange={(e) => setPropertyFormData({...propertyFormData, clientName: e.target.value})}
                        placeholder="Property owner/client"
                        className="form-input"
                      />
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Commission Rate (%)</label>
                      <input
                        type="number"
                        value={propertyFormData.commissionRate}
                        onChange={(e) => setPropertyFormData({...propertyFormData, commissionRate: e.target.value})}
                        min="1"
                        max="100"
                        className="form-input"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Rent Amount (₦)</label>
                      <input
                        type="number"
                        value={propertyFormData.rentAmount}
                        onChange={(e) => setPropertyFormData({...propertyFormData, rentAmount: e.target.value})}
                        placeholder="e.g., 2500000"
                        className="form-input"
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Management Type</label>
                    <select
                      value={propertyFormData.managementType}
                      onChange={(e) => setPropertyFormData({...propertyFormData, managementType: e.target.value})}
                      className="form-select"
                    >
                      <option value="full">Full Management</option>
                      <option value="rent-only">Rent Collection Only</option>
                      <option value="maintenance-only">Maintenance Only</option>
                    </select>
                  </div>
                </div>
                
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline" onClick={() => setShowAddExternalModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Add Property
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EstateDashboard;