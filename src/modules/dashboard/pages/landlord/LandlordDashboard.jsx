import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../shared/context/AuthContext';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Table,
  ProgressBar,
  Alert,
  Nav,
  Tab,
  Tabs,
  InputGroup,
  Form,
  ListGroup
} from 'react-bootstrap';

const LandlordDashboard = () => {
  const [userData, setUserData] = useState(null);
  const [properties, setProperties] = useState([]);
  const [referralInfo, setReferralInfo] = useState({
    code: '',
    link: '',
    earnings: 0,
    totalCommission: 0
  });
  const [stats, setStats] = useState({
    totalProperties: 0,
    activeRentals: 0,
    vacantProperties: 0,
    pendingVerification: 0,
    monthlyEarnings: 0,
    totalEarnings: 0,
    commissionPaid: 0,
    managerAssigned: 0
  });
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);
  
  const { user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    const loadLandlordData = async () => {
      setIsLoading(true);
      
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const mockUserData = {
          id: user?.id || 'landlord_123',
          name: user?.name || 'Property Owner',
          email: user?.email || 'landlord@example.com',
          phone: '+234 802 345 6789',
          joinDate: '2023-06-15',
          verified: true,
          commissionRate: '7.5%',
          walletBalance: 1250000,
          avatar: user?.avatar || `https://ui-avatars.com/api/?name=${user?.name || 'Landlord'}&background=5930e0&color=fff`
        };
        
        setUserData(mockUserData);
        
        const referralCode = user?.referralCode || `LAND-${Date.now().toString(36).toUpperCase()}`;
        const referralLink = `${window.location.origin}/signup?ref=${referralCode}`;
        
        setReferralInfo({
          code: referralCode,
          link: referralLink,
          earnings: 25000,
          totalCommission: 1250000
        });
        
        const mockProperties = [
          {
            id: 'prop-1',
            title: '3 Bedroom Duplex in Lekki',
            address: '123 Lekki Phase 1, Lagos',
            price: 3500000,
            status: 'rented',
            verification: 'verified',
            tenant: 'John Doe',
            tenantPhone: '+234 801 234 5678',
            rentDue: '2024-12-15',
            commission: 262500,
            commissionBreakdown: {
              total: 262500,
              manager: 87500,
              referrer: 35000,
              platform: 140000
            },
            image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400',
            type: 'Duplex',
            bedrooms: 3,
            bathrooms: 3,
            area: '3500 sq ft',
            posterRole: 'landlord',
            posterId: 'landlord_123',
            managerAssigned: true,
            managerName: 'James Manager',
            managerId: 'manager_001',
            chats: ['chat_001']
          },
          // ... other properties
        ];
        
        setProperties(mockProperties);
        
        const totalProperties = mockProperties.length;
        const activeRentals = mockProperties.filter(p => p.status === 'rented').length;
        const vacantProperties = mockProperties.filter(p => p.status === 'vacant').length;
        const pendingVerification = mockProperties.filter(p => p.verification === 'unverified').length;
        const managerAssigned = mockProperties.filter(p => p.managerAssigned).length;
        
        const commissionPaid = mockProperties
          .filter(p => p.status === 'rented')
          .reduce((sum, p) => sum + p.commission, 0);
        
        const monthlyRevenue = mockProperties
          .filter(p => p.status === 'rented')
          .reduce((sum, p) => sum + (p.price / 12), 0);
        
        setStats({
          totalProperties,
          activeRentals,
          vacantProperties,
          pendingVerification,
          monthlyEarnings: monthlyRevenue - (commissionPaid / 12),
          totalEarnings: mockProperties
            .filter(p => p.status === 'rented')
            .reduce((sum, p) => sum + (p.price - p.commission), 0),
          commissionPaid,
          managerAssigned
        });
        
      } catch (error) {
        console.error('Error loading landlord data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user) {
      loadLandlordData();
    }
  }, [user]);
  
  const navigateToPostProperty = () => {
    const confirmPost = window.confirm(
      '⚠️ IMPORTANT BUSINESS RULES:\n\n' +
      '1. 7.5% commission applies to all successful rentals\n' +
      '2. Commission breakdown: Manager 2.5%, Referrer 1%, RentEasy 4%\n' +
      '3. Incoming tenants will contact you through chat\n' +
      '4. RentEasy manager will monitor the chat\n\n' +
      'Do you understand and agree to these terms?'
    );
    
    if (confirmPost) {
      navigate('/dashboard/post-property?type=landlord');
    }
  };

  const navigateToMessages = () => {
    navigate('/dashboard/messages'); // Fixed path
  };

  const handleContactTenant = (property) => {
    if (!property.tenant) {
      alert('No tenant assigned to this property');
      return;
    }
    
    navigate(`/dashboard/messages/chat/chat_${property.id}`);
  };

  const handleMarkAsRented = (propertyId) => {
    alert('Only assigned RentEasy manager can mark property as rented and trigger commission payment.');
  };

  const handleVerifyProperty = (propertyId) => {
    alert('Property verification is done by RentEasy managers. They will contact you for verification.');
    
    const updatedProperties = properties.map(p => 
      p.id === propertyId ? { ...p, verification: 'pending' } : p
    );
    setProperties(updatedProperties);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  if (isLoading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading your landlord dashboard...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="p-0">
      {/* Dashboard Header */}
      <div className="bg-primary text-white py-4 px-3">
        <Row className="align-items-center">
          <Col md={8}>
            <h1 className="h2 mb-2">
              Welcome back, <span className="text-warning">{userData?.name || 'Landlord'}</span>!
            </h1>
            <p className="mb-0 opacity-75">
              Manage your properties, track earnings, and grow your portfolio
            </p>
          </Col>
          <Col md={4} className="mt-3 mt-md-0">
            <div className="d-flex gap-2 justify-content-md-end">
              <Button 
                variant="light" 
                className="d-flex align-items-center gap-2"
                onClick={navigateToMessages}
              >
                <span>📨</span>
                <span>Messages</span>
                {stats.activeRentals > 0 && (
                  <Badge bg="danger" pill>{stats.activeRentals}</Badge>
                )}
              </Button>
              <Button 
                variant="outline-light" 
                className="d-flex align-items-center gap-2"
                onClick={() => navigate('/dashboard/landlord/profile')}
              >
                <span>👤</span>
                <span>Profile</span>
              </Button>
            </div>
          </Col>
        </Row>
        
        {/* Quick Stats */}
        <Row className="mt-4 g-3">
          <Col xs={6} md={3}>
            <Card className="bg-white bg-opacity-10 border-0">
              <Card.Body className="py-3">
                <div className="d-flex align-items-center">
                  <div className="bg-white bg-opacity-25 rounded-circle p-2 me-3">
                    <span className="fs-4">💰</span>
                  </div>
                  <div>
                    <p className="mb-1 small opacity-75">Net Balance</p>
                    <h3 className="h5 mb-0">₦{userData?.walletBalance?.toLocaleString() || '0'}</h3>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          <Col xs={6} md={3}>
            <Card className="bg-white bg-opacity-10 border-0">
              <Card.Body className="py-3">
                <div className="d-flex align-items-center">
                  <div className="bg-white bg-opacity-25 rounded-circle p-2 me-3">
                    <span className="fs-4">🏠</span>
                  </div>
                  <div>
                    <p className="mb-1 small opacity-75">Total Properties</p>
                    <h3 className="h5 mb-0">{stats.totalProperties}</h3>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          <Col xs={6} md={3}>
            <Card className="bg-white bg-opacity-10 border-0">
              <Card.Body className="py-3">
                <div className="d-flex align-items-center">
                  <div className="bg-white bg-opacity-25 rounded-circle p-2 me-3">
                    <span className="fs-4">👨‍💼</span>
                  </div>
                  <div>
                    <p className="mb-1 small opacity-75">Managers Assigned</p>
                    <h3 className="h5 mb-0">{stats.managerAssigned}</h3>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          <Col xs={6} md={3}>
            <Card className="bg-white bg-opacity-10 border-0">
              <Card.Body className="py-3">
                <div className="d-flex align-items-center">
                  <div className="bg-white bg-opacity-25 rounded-circle p-2 me-3">
                    <span className="fs-4">📊</span>
                  </div>
                  <div>
                    <p className="mb-1 small opacity-75">Commission Paid</p>
                    <h3 className="h5 mb-0">₦{stats.commissionPaid.toLocaleString()}</h3>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
      
      {/* Dashboard Tabs */}
      <div className="bg-white border-bottom">
        <Container>
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            className="border-0"
            fill
          >
            <Tab eventKey="overview" title={
              <span className="d-flex align-items-center gap-2">
                <span>📊</span>
                <span className="d-none d-md-inline">Overview</span>
              </span>
            } />
            <Tab eventKey="properties" title={
              <span className="d-flex align-items-center gap-2">
                <span>🏢</span>
                <span className="d-none d-md-inline">Properties</span>
                <Badge bg="secondary" pill>{properties.length}</Badge>
              </span>
            } />
            <Tab eventKey="tenants" title={
              <span className="d-flex align-items-center gap-2">
                <span>👥</span>
                <span className="d-none d-md-inline">Tenants</span>
                <Badge bg="secondary" pill>{stats.activeRentals}</Badge>
              </span>
            } />
            <Tab eventKey="earnings" title={
              <span className="d-flex align-items-center gap-2">
                <span>💵</span>
                <span className="d-none d-md-inline">Earnings</span>
              </span>
            } />
            <Tab eventKey="referral" title={
              <span className="d-flex align-items-center gap-2">
                <span>🎯</span>
                <span className="d-none d-md-inline">Referral</span>
              </span>
            } />
          </Tabs>
        </Container>
      </div>
      
      {/* Tab Content */}
      <Container className="py-4">
        {activeTab === 'overview' && (
          <Row className="g-4">
            <Col lg={3} md={6}>
              <Card className="h-100">
                <Card.Body>
                  <Card.Title className="small text-muted text-uppercase">Total Properties</Card.Title>
                  <h2 className="display-6 text-primary">{stats.totalProperties}</h2>
                  <div className="d-flex gap-2 mt-2">
                    <Badge bg="success">{stats.activeRentals} Rented</Badge>
                    <Badge bg="warning" text="dark">{stats.vacantProperties} Vacant</Badge>
                    <Badge bg="info">{stats.pendingVerification} Pending</Badge>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            
            <Col lg={3} md={6}>
              <Card className="h-100">
                <Card.Body>
                  <Card.Title className="small text-muted text-uppercase">Net Earnings</Card.Title>
                  <h2 className="display-6 text-success">₦{stats.totalEarnings.toLocaleString()}</h2>
                  <p className="text-muted small mb-0">After 7.5% commission</p>
                </Card.Body>
              </Card>
            </Col>
            
            <Col lg={3} md={6}>
              <Card className="h-100">
                <Card.Body>
                  <Card.Title className="small text-muted text-uppercase">Commission Rate</Card.Title>
                  <h2 className="display-6 text-danger">{userData?.commissionRate || '7.5%'}</h2>
                  <p className="text-muted small mb-0">Per successful rental</p>
                </Card.Body>
              </Card>
            </Col>
            
            <Col lg={3} md={6}>
              <Card className="h-100">
                <Card.Body>
                  <Card.Title className="small text-muted text-uppercase">Referral Earnings</Card.Title>
                  <h2 className="display-6 text-purple">₦{referralInfo.earnings.toLocaleString()}</h2>
                  <p className="text-muted small mb-0">From your referral network</p>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={12}>
              <Alert variant="warning" className="border">
                <div className="d-flex align-items-start">
                  <div className="me-3">⚠️</div>
                  <div>
                    <Alert.Heading>Important: 7.5% Commission Applies</Alert.Heading>
                    <p>All successful rentals are subject to 7.5% commission breakdown:</p>
                    <Row className="mt-3">
                      <Col xs={6} md={3} className="mb-2">
                        <div className="text-center p-2 border rounded">
                          <div className="fw-bold">Manager</div>
                          <div className="text-primary fs-5">2.5%</div>
                        </div>
                      </Col>
                      <Col xs={6} md={3} className="mb-2">
                        <div className="text-center p-2 border rounded">
                          <div className="fw-bold">Referrer</div>
                          <div className="text-primary fs-5">1%</div>
                        </div>
                      </Col>
                      <Col xs={6} md={3} className="mb-2">
                        <div className="text-center p-2 border rounded">
                          <div className="fw-bold">RentEasy</div>
                          <div className="text-primary fs-5">4%</div>
                        </div>
                      </Col>
                      <Col xs={6} md={3} className="mb-2">
                        <div className="text-center p-2 border rounded bg-warning">
                          <div className="fw-bold">Total</div>
                          <div className="fs-5">7.5%</div>
                        </div>
                      </Col>
                    </Row>
                  </div>
                </div>
              </Alert>
            </Col>
            
            <Col md={12}>
              <Card>
                <Card.Body>
                  <Card.Title>Quick Actions</Card.Title>
                  <Row className="g-3">
                    <Col xs={6} md={3}>
                      <Button 
                        variant="outline-primary" 
                        className="w-100 h-100 d-flex flex-column align-items-center py-3"
                        onClick={navigateToPostProperty}
                      >
                        <span className="fs-2 mb-2">➕</span>
                        <span>Add Property</span>
                      </Button>
                    </Col>
                    <Col xs={6} md={3}>
                      <Button 
                        variant="outline-secondary" 
                        className="w-100 h-100 d-flex flex-column align-items-center py-3"
                        onClick={() => navigate('/dashboard/landlord/analytics')}
                      >
                        <span className="fs-2 mb-2">📊</span>
                        <span>View Analytics</span>
                      </Button>
                    </Col>
                    <Col xs={6} md={3}>
                      <Button 
                        variant="outline-success" 
                        className="w-100 h-100 d-flex flex-column align-items-center py-3"
                        onClick={() => navigate('/dashboard/landlord/wallet/withdraw')}
                      >
                        <span className="fs-2 mb-2">💸</span>
                        <span>Withdraw Funds</span>
                      </Button>
                    </Col>
                    <Col xs={6} md={3}>
                      <Button 
                        variant="outline-info" 
                        className="w-100 h-100 d-flex flex-column align-items-center py-3"
                        onClick={() => setActiveTab('referral')}
                      >
                        <span className="fs-2 mb-2">🎯</span>
                        <span>Referral Program</span>
                      </Button>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}
        
        {activeTab === 'properties' && (
          <div>
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
              <div>
                <h2 className="h4 mb-2">Your Properties</h2>
                <Alert variant="info" className="py-2 mb-0">
                  <span className="fw-bold">Note:</span> 7.5% commission applies when property is rented (Manager: 2.5%, Referrer: 1%, RentEasy: 4%)
                </Alert>
              </div>
              <Button 
                variant="primary" 
                className="mt-3 mt-md-0"
                onClick={navigateToPostProperty}
              >
                <span className="me-2">➕</span>
                Add New Property
              </Button>
            </div>
            
            {properties.length > 0 ? (
              <Row className="g-4">
                {properties.map((property) => (
                  <Col xs={12} md={6} lg={4} key={property.id}>
                    <Card className="h-100">
                      <div className="position-relative">
                        <Card.Img 
                          variant="top" 
                          src={property.image} 
                          alt={property.title}
                          style={{ height: '200px', objectFit: 'cover' }}
                        />
                        <div className="position-absolute top-0 start-0 m-2">
                          <Badge bg={property.status === 'rented' ? 'success' : property.status === 'vacant' ? 'warning' : 'info'}>
                            {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                          </Badge>
                        </div>
                        <div className="position-absolute top-0 end-0 m-2">
                          <Badge bg={property.verification === 'verified' ? 'success' : 'warning'}>
                            {property.verification === 'verified' ? '✅ Verified' : '⏳ Pending'}
                          </Badge>
                        </div>
                        {property.managerAssigned && (
                          <div className="position-absolute bottom-0 start-0 m-2">
                            <Badge bg="primary">
                              👨‍💼 {property.managerName}
                            </Badge>
                          </div>
                        )}
                      </div>
                      <Card.Body>
                        <Card.Title>{property.title}</Card.Title>
                        <Card.Text className="text-muted small mb-3">{property.address}</Card.Text>
                        
                        <Row className="mb-3">
                          <Col xs={6}>
                            <div className="small text-muted">Type</div>
                            <div className="fw-bold">{property.type}</div>
                          </Col>
                          <Col xs={6}>
                            <div className="small text-muted">Bedrooms</div>
                            <div className="fw-bold">{property.bedrooms}</div>
                          </Col>
                        </Row>
                        
                        <div className="mb-2">
                          <div className="small text-muted">Monthly Rent</div>
                          <div className="fw-bold text-success fs-5">₦{property.price.toLocaleString()}</div>
                        </div>
                        
                        <div className="mb-2">
                          <div className="small text-muted">Commission (7.5%)</div>
                          <div 
                            className="fw-bold text-primary"
                            style={{ cursor: 'pointer' }}
                            onClick={() => alert(`Commission: ₦${property.commission.toLocaleString()}`)}
                          >
                            ₦{property.commission.toLocaleString()}
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          <div className="small text-muted">You Receive</div>
                          <div className="fw-bold text-success">₦{(property.price - property.commission).toLocaleString()}</div>
                        </div>
                        
                        <div className="d-flex gap-2 flex-wrap">
                          <Button 
                            variant="outline-secondary" 
                            size="sm"
                            onClick={() => navigate(`/dashboard/landlord/properties/${property.id}/edit`)}
                          >
                            Edit
                          </Button>
                          <Button 
                            variant="secondary" 
                            size="sm"
                            onClick={() => navigate(`/dashboard/landlord/properties/${property.id}`)}
                          >
                            Details
                          </Button>
                          
                          {property.tenant && (
                            <Button 
                              variant="primary" 
                              size="sm"
                              onClick={() => handleContactTenant(property)}
                            >
                              Message Tenant
                            </Button>
                          )}
                          
                          {property.verification === 'unverified' && (
                            <Button 
                              variant="success" 
                              size="sm"
                              onClick={() => handleVerifyProperty(property.id)}
                            >
                              Verify
                            </Button>
                          )}
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            ) : (
              <Card className="text-center py-5">
                <Card.Body>
                  <div className="fs-1 mb-3">🏠</div>
                  <h3 className="h5 mb-2">No Properties Listed</h3>
                  <p className="text-muted mb-4">Start earning by listing your first property on RentEasy</p>
                  <Button 
                    variant="primary"
                    onClick={navigateToPostProperty}
                  >
                    List Your First Property
                  </Button>
                </Card.Body>
              </Card>
            )}
          </div>
        )}
        
        {activeTab === 'tenants' && (
          <div className="tenants-content">
            <div className="content-header">
              <h2>Your Tenants</h2>
              <p className="subtitle">{stats.activeRentals} active tenants</p>
            </div>
            
            {stats.activeRentals > 0 ? (
              <Card>
                <Card.Body className="p-0">
                  <div className="table-responsive">
                    <Table hover className="mb-0">
                      <thead className="bg-light">
                        <tr>
                          <th>Tenant</th>
                          <th className="d-none d-md-table-cell">Property</th>
                          <th>Rent</th>
                          <th className="d-none d-md-table-cell">Next Payment</th>
                          <th className="d-none d-md-table-cell">Manager</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {properties
                          .filter(p => p.status === 'rented' && p.tenant)
                          .map((property) => (
                            <tr key={property.id}>
                              <td>
                                <div className="d-flex align-items-center">
                                  <div className="bg-primary text-white rounded-circle me-2" style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {property.tenant?.charAt(0) || 'T'}
                                  </div>
                                  <div>
                                    <div className="fw-bold">{property.tenant}</div>
                                    <div className="small text-muted">{property.tenantPhone || 'No phone'}</div>
                                  </div>
                                </div>
                              </td>
                              <td>{property.title}</td>
                              <td className="fw-bold text-success">₦{property.price.toLocaleString()}</td>
                              <td>
                                {property.rentDue ? (
                                  <>
                                    {formatDate(property.rentDue)}
                                    <Badge bg="warning" className="ms-2">Soon</Badge>
                                  </>
                                ) : 'N/A'}
                              </td>
                              <td>
                                {property.managerAssigned ? (
                                  <Badge bg="primary">{property.managerName}</Badge>
                                ) : (
                                  <span className="text-muted">No Manager</span>
                                )}
                              </td>
                              <td>
                                <div className="d-flex gap-2">
                                  <Button 
                                    variant="outline-primary" 
                                    size="sm"
                                    onClick={() => handleContactTenant(property)}
                                  >
                                    Message
                                  </Button>
                                  <Button 
                                    variant="outline-secondary" 
                                    size="sm"
                                    onClick={() => alert(`Commission: ₦${property.commission.toLocaleString()}`)}
                                  >
                                    Commission
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </Table>
                  </div>
                </Card.Body>
              </Card>
            ) : (
              <Card className="text-center py-5">
                <Card.Body>
                  <div className="fs-1 mb-3">👥</div>
                  <h3 className="h5 mb-2">No Active Tenants</h3>
                  <p className="text-muted mb-4">Start renting out your properties to see tenant information here</p>
                  <Button 
                    variant="primary"
                    onClick={() => setActiveTab('properties')}
                  >
                    View Properties
                  </Button>
                </Card.Body>
              </Card>
            )}
          </div>
        )}
        
        {activeTab === 'referral' && (
          <Card>
            <Card.Body>
              <Card.Title className="mb-4">Your Referral Program</Card.Title>
              
              <Row className="mb-4">
                <Col md={4}>
                  <div className="text-center p-3 border rounded">
                    <div className="display-6 text-primary">₦{referralInfo.earnings.toLocaleString()}</div>
                    <div className="text-muted">Total Referral Earnings</div>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="text-center p-3 border rounded">
                    <div className="display-6 text-primary">5</div>
                    <div className="text-muted">Successful Referrals</div>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="text-center p-3 border rounded">
                    <div className="display-6 text-primary">1%</div>
                    <div className="text-muted">Commission Rate</div>
                  </div>
                </Col>
              </Row>
              
              <div className="mb-4">
                <h5 className="mb-3">Share Your Referral Code</h5>
                <InputGroup>
                  <Form.Control
                    readOnly
                    value={referralInfo.code}
                    className="fw-bold"
                  />
                  <Button 
                    variant="secondary"
                    onClick={() => {
                      navigator.clipboard.writeText(referralInfo.link);
                      alert('Referral link copied!');
                    }}
                  >
                    Copy Code
                  </Button>
                </InputGroup>
              </div>
              
              <div className="mb-4">
                <h5 className="mb-3">Share Your Referral Link</h5>
                <InputGroup>
                  <Form.Control
                    readOnly
                    value={referralInfo.link}
                  />
                  <Button 
                    variant="primary"
                    onClick={() => {
                      navigator.clipboard.writeText(referralInfo.link);
                      alert('Referral link copied!');
                    }}
                  >
                    Copy Link
                  </Button>
                </InputGroup>
                <Form.Text className="text-muted">
                  Share with friends. When they sign up as landlords or tenants and complete a rental, you earn 1% commission!
                </Form.Text>
              </div>
              
              <div className="d-flex gap-2">
                <Button 
                  variant="primary"
                  onClick={() => navigate('/dashboard/landlord/referral/history')}
                >
                  View Referral History
                </Button>
                <Button variant="outline-secondary">Share on Social Media</Button>
              </div>
            </Card.Body>
          </Card>
        )}
      </Container>
      
     
    </Container>
  );
};

export default LandlordDashboard;