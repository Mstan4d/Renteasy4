// src/modules/estate-firm/components/ClientManager.jsx
import React, { useState, useEffect } from 'react';
import { 
  Card, Button, Table, Badge, Modal, Form, Alert, 
  InputGroup, Dropdown, Row, Col, ProgressBar 
} from 'react-bootstrap';
import { 
  Users, Phone, Mail, MapPin, Plus, Edit, Trash2, Eye, 
  Search, Filter, UserCheck, UserX, MessageSquare, Calendar,
  TrendingUp, Home, DollarSign, Shield, Star, MoreVertical,
  Download, Upload, UserPlus, CheckCircle, XCircle, Clock,
  ArrowUpRight, ArrowDownRight, BarChart3
} from 'lucide-react';
import { supabase } from '../../../shared/lib/supabaseClient';
import RentEasyLoader from '../../../shared/components/RentEasyLoader';
import './ClientManager.css';

const ClientManager = ({ estateFirmData, userRole = 'principal', canEdit = true }) => {
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showClientDetails, setShowClientDetails] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [clientType, setClientType] = useState('all');
  const [clientStatus, setClientStatus] = useState('all');
  const [currentUserId, setCurrentUserId] = useState(null);
  
  const [newClient, setNewClient] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    type: 'landlord',
    status: 'active',
    notes: '',
    bank_name: '',
    account_number: '',
    account_name: ''
  });

  const [stats, setStats] = useState({
    totalClients: 0,
    activeClients: 0,
    landlords: 0,
    tenants: 0,
    avgPropertiesPerClient: 0,
    clientRetentionRate: 85,
    totalPropertyValue: 0
  });

  // Get current user ID
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) {
        setCurrentUserId(userData.user.id);
      }
    };
    getCurrentUser();
  }, []);

  useEffect(() => {
    if (estateFirmData?.id) {
      loadClients();
    }
  }, [estateFirmData, userRole]);

  useEffect(() => {
    filterClients();
  }, [clients, searchTerm, clientType, clientStatus]);

  const loadClients = async () => {
    if (!estateFirmData?.id) return;
    setLoading(true);
    try {
      // Get effective firm ID (parent for staff)
      let effectiveFirmId = estateFirmData.id;
      
      // PRIMARY SOURCE: Fetch landlords from estate_landlords
      let landlordsQuery = supabase
        .from('estate_landlords')
        .select('*')
        .eq('estate_firm_id', effectiveFirmId)
        .order('name');

      let estateLandlords = [];
      const { data: landlordsData, error: landlordsError } = await landlordsQuery;

      if (!landlordsError) {
        // If associate, filter to landlords from their properties only
        if (userRole === 'associate' && currentUserId) {
          const { data: myProperties } = await supabase
            .from('properties')
            .select('landlord_id')
            .eq('estate_firm_id', effectiveFirmId)
            .eq('created_by_staff_id', currentUserId)
            .not('landlord_id', 'is', null);
          
          const myLandlordIds = [...new Set(myProperties?.map(p => p.landlord_id).filter(Boolean))];
          estateLandlords = (landlordsData || []).filter(l => myLandlordIds.includes(l.id));
        } else {
          estateLandlords = landlordsData || [];
        }
      }

      // SECONDARY SOURCE: Get tenants from units
      let propertiesQuery = supabase
        .from('properties')
        .select('id, title, landlord_id')
        .eq('estate_firm_id', effectiveFirmId);
      
      // If associate, only get their properties
      if (userRole === 'associate' && currentUserId) {
        propertiesQuery = propertiesQuery.eq('created_by_staff_id', currentUserId);
      }
      
      const { data: properties, error: propertiesError } = await propertiesQuery;

      const propertyIds = properties?.map(p => p.id) || [];

      let units = [];
      if (propertyIds.length > 0) {
        let unitsQuery = supabase
          .from('units')
          .select(`
            id,
            unit_number,
            tenant_id,
            tenant_name,
            tenant_phone,
            tenant_email,
            rent_amount,
            rent_frequency,
            status,
            property_id
          `)
          .in('property_id', propertyIds)
          .not('tenant_id', 'is', null);
        
        const { data: unitsData, error: unitsError } = await unitsQuery;
        if (!unitsError) units = unitsData || [];
      }

      // Create a map of properties for quick lookup
      const propertiesMap = {};
      (properties || []).forEach(p => {
        propertiesMap[p.id] = p;
      });

      // Process tenants from units
      const tenantsMap = new Map();
      units.forEach(unit => {
        if (unit.tenant_id && !tenantsMap.has(unit.tenant_id)) {
          const property = propertiesMap[unit.property_id];
          tenantsMap.set(unit.tenant_id, {
            id: unit.tenant_id,
            name: unit.tenant_name || 'Tenant',
            email: unit.tenant_email,
            phone: unit.tenant_phone,
            type: 'tenant',
            status: unit.status === 'occupied' ? 'active' : 'inactive',
            source: 'units',
            propertyCount: 1,
            totalValue: unit.rent_amount || 0,
            property_title: property?.title,
            unit_number: unit.unit_number,
            rent_amount: unit.rent_amount
          });
        } else if (unit.tenant_id && tenantsMap.has(unit.tenant_id)) {
          const existing = tenantsMap.get(unit.tenant_id);
          existing.propertyCount = (existing.propertyCount || 0) + 1;
          existing.totalValue = (existing.totalValue || 0) + (unit.rent_amount || 0);
          tenantsMap.set(unit.tenant_id, existing);
        }
      });

      // Combine all clients
      const allClients = [];
      
      // Add landlords from estate_landlords
      estateLandlords.forEach(landlord => {
        allClients.push({
          id: landlord.id,
          name: landlord.name,
          email: landlord.email,
          phone: landlord.phone,
          type: 'landlord',
          status: 'active',
          source: 'estate_landlords',
          notes: landlord.notes,
          bank_details: landlord.bank_details,
          propertyCount: 0,
          totalValue: 0,
          createdAt: landlord.created_at
        });
      });

      // Add tenants from units
      tenantsMap.forEach(tenant => {
        allClients.push(tenant);
      });

      // Get property counts for landlords
      if (estateLandlords.length > 0 && properties?.length > 0) {
        const landlordIds = estateLandlords.map(l => l.id);
        
        const propertyCounts = {};
        properties.forEach(p => {
          if (p.landlord_id) {
            propertyCounts[p.landlord_id] = (propertyCounts[p.landlord_id] || 0) + 1;
          }
        });
        
        allClients.forEach(client => {
          if (client.type === 'landlord' && propertyCounts[client.id]) {
            client.propertyCount = propertyCounts[client.id];
          }
        });
      }

      setClients(allClients);

      // Calculate stats
      const landlords = allClients.filter(c => c.type === 'landlord').length;
      const tenants = allClients.filter(c => c.type === 'tenant').length;
      const activeClients = allClients.filter(c => c.status === 'active').length;
      const totalPropertyValue = allClients
        .filter(c => c.type === 'landlord')
        .reduce((sum, c) => sum + (c.totalValue || 0), 0);
      
      const avgProperties = landlords > 0 
        ? (allClients.filter(c => c.type === 'landlord').reduce((sum, c) => sum + (c.propertyCount || 0), 0) / landlords).toFixed(1) 
        : 0;

      setStats({
        totalClients: allClients.length,
        activeClients,
        landlords,
        tenants,
        avgPropertiesPerClient: avgProperties,
        clientRetentionRate: 85,
        totalPropertyValue
      });

    } catch (err) {
      console.error('Error loading clients:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterClients = () => {
    let filtered = [...clients];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(client =>
        client.name?.toLowerCase().includes(term) ||
        client.email?.toLowerCase().includes(term) ||
        client.phone?.toLowerCase().includes(term)
      );
    }

    if (clientType !== 'all') {
      filtered = filtered.filter(client => client.type === clientType);
    }

    if (clientStatus !== 'all') {
      filtered = filtered.filter(client => client.status === clientStatus);
    }

    setFilteredClients(filtered);
  };

  const handleAddClient = async () => {
    if (!canEdit) {
      alert('Only the Firm Principal can add clients.');
      return;
    }
    
    if (!newClient.name) {
      alert('Please fill in required fields');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('estate_landlords')
        .insert({
          estate_firm_id: estateFirmData.id,
          name: newClient.name,
          email: newClient.email || null,
          phone: newClient.phone || null,
          bank_details: {
            bank_name: newClient.bank_name,
            account_number: newClient.account_number,
            account_name: newClient.account_name
          },
          notes: newClient.notes,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      await loadClients();
      setShowAddModal(false);
      setNewClient({
        name: '',
        email: '',
        phone: '',
        address: '',
        type: 'landlord',
        status: 'active',
        notes: '',
        bank_name: '',
        account_number: '',
        account_name: ''
      });
      alert('Landlord added successfully!');
    } catch (err) {
      console.error('Error adding client:', err);
      alert('Failed to add client');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClient = async (clientId, source) => {
    if (!canEdit) {
      alert('Only the Firm Principal can delete clients.');
      return;
    }
    
    if (!window.confirm('Are you sure you want to delete this client?')) return;
    
    try {
      if (source === 'estate_landlords') {
        const { error } = await supabase
          .from('estate_landlords')
          .delete()
          .eq('id', clientId);
        
        if (error) throw error;
      } else {
        alert('Only manually added landlords can be deleted here.');
        return;
      }
      
      await loadClients();
      alert('Client deleted successfully');
    } catch (err) {
      console.error('Error deleting client:', err);
      alert('Failed to delete client');
    }
  };

  const getClientTypeBadge = (type) => {
    switch (type) {
      case 'landlord':
        return <Badge bg="primary" className="d-inline-flex align-items-center"><Home size={12} className="me-1" /> Landlord</Badge>;
      case 'tenant':
        return <Badge bg="success" className="d-inline-flex align-items-center"><Users size={12} className="me-1" /> Tenant</Badge>;
      default:
        return <Badge bg="secondary">{type}</Badge>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge bg="success" className="d-inline-flex align-items-center"><CheckCircle size={12} className="me-1" /> Active</Badge>;
      case 'inactive':
        return <Badge bg="secondary" className="d-inline-flex align-items-center"><UserX size={12} className="me-1" /> Inactive</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const getSourceBadge = (source) => {
    switch (source) {
      case 'estate_landlords':
        return <Badge bg="primary" className="bg-opacity-10 text-primary">Landlord Contact</Badge>;
      case 'units':
        return <Badge bg="success" className="bg-opacity-10 text-success">Active Tenant</Badge>;
      default:
        return <Badge bg="secondary">{source}</Badge>;
    }
  };

  if (loading) {
    return <RentEasyLoader message="Loading your clients..." fullScreen />;
  }

  return (
    <div>

      {/* Header with Stats */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h5 className="mb-1">Client Management</h5>
            <p className="text-muted mb-0">Manage your landlords, tenants, and contacts</p>
          </div>
          <div className="d-flex gap-2">
            <Button variant="outline-primary" size="sm" onClick={() => alert('Export to CSV')}>
              <Download size={14} className="me-1" />
              Export
            </Button>
            {canEdit && (
              <Button variant="primary" size="sm" onClick={() => setShowAddModal(true)}>
                <UserPlus size={14} className="me-1" />
                Add Landlord
              </Button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <Row className="g-3 mb-4">
          <Col xs={6} md={3}>
            <Card className="border-0 shadow-sm h-100 stat-card">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h6 className="text-muted mb-1">Total Clients</h6>
                    <h3 className="mb-0">{stats.totalClients}</h3>
                  </div>
                  <Badge bg="primary" className="rounded-circle p-2">
                    <Users size={16} />
                  </Badge>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col xs={6} md={3}>
            <Card className="border-0 shadow-sm h-100 stat-card">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h6 className="text-muted mb-1">Landlords</h6>
                    <h3 className="mb-0">{stats.landlords}</h3>
                  </div>
                  <Badge bg="info" className="rounded-circle p-2">
                    <Home size={16} />
                  </Badge>
                </div>
                <div className="mt-2">
                  <small className="text-muted">
                    Avg: {stats.avgPropertiesPerClient} properties each
                  </small>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col xs={6} md={3}>
            <Card className="border-0 shadow-sm h-100 stat-card">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h6 className="text-muted mb-1">Active Tenants</h6>
                    <h3 className="mb-0">{stats.tenants}</h3>
                  </div>
                  <Badge bg="success" className="rounded-circle p-2">
                    <Users size={16} />
                  </Badge>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col xs={6} md={3}>
            <Card className="border-0 shadow-sm h-100 stat-card">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h6 className="text-muted mb-1">Active Clients</h6>
                    <h3 className="mb-0">{stats.activeClients}</h3>
                  </div>
                  <Badge bg="success" className="rounded-circle p-2">
                    <UserCheck size={16} />
                  </Badge>
                </div>
                <div className="mt-2">
                  <ProgressBar 
                    now={(stats.activeClients / stats.totalClients) * 100 || 0} 
                    variant="success"
                    style={{ height: '6px' }}
                  />
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Filters and Search */}
      <Card className="mb-4 border-0 shadow-sm">
        <Card.Body className="py-2">
          <Row className="align-items-center">
            <Col md={6}>
              <InputGroup>
                <InputGroup.Text>
                  <Search size={16} />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Search clients by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={3}>
              <Form.Select 
                value={clientType}
                onChange={(e) => setClientType(e.target.value)}
                size="sm"
              >
                <option value="all">All Types</option>
                <option value="landlord">Landlords</option>
                <option value="tenant">Tenants</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Select 
                value={clientStatus}
                onChange={(e) => setClientStatus(e.target.value)}
                size="sm"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Clients Table */}
      <Card className="border-0 shadow-sm">
        <Card.Body>
          {filteredClients.length === 0 ? (
            <Alert variant="info" className="text-center py-4">
              <Users size={48} className="text-muted mb-3 opacity-50" />
              <h5>No Clients Found</h5>
              <p className="text-muted">
                {searchTerm || clientType !== 'all' || clientStatus !== 'all' 
                  ? 'No clients match your filters'
                  : 'Start by adding your first landlord'}
              </p>
              {canEdit && (
                <Button 
                  variant="primary" 
                  onClick={() => setShowAddModal(true)}
                  className="mt-2"
                >
                  <UserPlus size={16} className="me-2" />
                  Add First Landlord
                </Button>
              )}
            </Alert>
          ) : (
            <div className="table-responsive">
              <Table hover className="mb-0">
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Contact</th>
                    <th>Type</th>
                    <th>Properties</th>
                    <th>Status</th>
                    <th>Source</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClients.map(client => (
                    <tr key={client.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="me-3">
                            <div className="client-avatar">
                              {client.type === 'landlord' ? <Home size={16} /> : <Users size={16} />}
                            </div>
                          </div>
                          <div>
                            <div className="fw-medium">{client.name}</div>
                            <div className="text-muted small">{client.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="small">
                          {client.phone && (
                            <div className="d-flex align-items-center">
                              <Phone size={12} className="me-1 text-muted" />
                              {client.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td>{getClientTypeBadge(client.type)}</td>
                      <td>
                        <div className="text-center">
                          <div className="fw-medium">{client.propertyCount || 0}</div>
                          {client.totalValue > 0 && (
                            <small className="text-muted">
                              ₦{client.totalValue.toLocaleString()}
                            </small>
                          )}
                        </div>
                      </td>
                      <td>{getStatusBadge(client.status)}</td>
                      <td>{getSourceBadge(client.source)}</td>
                      <td>
                        <Dropdown>
                          <Dropdown.Toggle variant="outline-secondary" size="sm">
                            <MoreVertical size={14} />
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            <Dropdown.Item onClick={() => setSelectedClient(client) || setShowClientDetails(true)}>
                              <Eye size={14} className="me-2" /> View Details
                            </Dropdown.Item>
                            {canEdit && client.source === 'estate_landlords' && (
                              <>
                                <Dropdown.Divider />
                                <Dropdown.Item 
                                  className="text-danger"
                                  onClick={() => handleDeleteClient(client.id, client.source)}
                                >
                                  <Trash2 size={14} className="me-2" /> Delete
                                </Dropdown.Item>
                              </>
                            )}
                          </Dropdown.Menu>
                        </Dropdown>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Add Landlord Modal - Only show if can edit */}
      {showAddModal && canEdit && (
        <Modal show={showAddModal} onHide={() => setShowAddModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>
              <UserPlus size={20} className="me-2" />
              Add New Landlord
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Full Name *</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter landlord name"
                      value={newClient.name}
                      onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Enter email address"
                      value={newClient.email}
                      onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Phone Number</Form.Label>
                    <Form.Control
                      type="tel"
                      placeholder="Enter phone number"
                      value={newClient.phone}
                      onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <div className="form-section">
                <h4>Bank Details (for payouts)</h4>
                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Bank Name</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="e.g., GTBank"
                        value={newClient.bank_name}
                        onChange={(e) => setNewClient({...newClient, bank_name: e.target.value})}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Account Number</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="0123456789"
                        value={newClient.account_number}
                        onChange={(e) => setNewClient({...newClient, account_number: e.target.value})}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Account Name</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Account holder name"
                        value={newClient.account_name}
                        onChange={(e) => setNewClient({...newClient, account_name: e.target.value})}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </div>

              <Form.Group className="mb-3">
                <Form.Label>Notes</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Add any notes about this landlord..."
                  value={newClient.notes}
                  onChange={(e) => setNewClient({...newClient, notes: e.target.value})}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={handleAddClient}
              disabled={loading || !newClient.name}
            >
              {loading ? 'Adding...' : 'Add Landlord'}
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      {/* Client Details Modal */}
      {selectedClient && (
        <Modal show={showClientDetails} onHide={() => setShowClientDetails(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>
              <div className="d-flex align-items-center">
                <div className="client-avatar me-3">
                  {selectedClient.type === 'landlord' ? <Home size={24} /> : <Users size={24} />}
                </div>
                <div>
                  <div>{selectedClient.name}</div>
                  <small className="text-muted">{selectedClient.email}</small>
                </div>
              </div>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <h6 className="text-muted mb-3">Contact Information</h6>
                <p><strong>Phone:</strong> {selectedClient.phone || 'Not provided'}</p>
                <p><strong>Type:</strong> {getClientTypeBadge(selectedClient.type)}</p>
                <p><strong>Status:</strong> {getStatusBadge(selectedClient.status)}</p>
                <p><strong>Source:</strong> {getSourceBadge(selectedClient.source)}</p>
                
                {selectedClient.notes && (
                  <div className="mt-3">
                    <h6 className="text-muted mb-2">Notes</h6>
                    <Card className="bg-light">
                      <Card.Body>
                        <p className="mb-0">{selectedClient.notes}</p>
                      </Card.Body>
                    </Card>
                  </div>
                )}
              </Col>
              <Col md={6}>
                <h6 className="text-muted mb-3">Statistics</h6>
                <div className="text-center p-3 border rounded mb-3">
                  <div className="fw-medium">{selectedClient.propertyCount || 0}</div>
                  <small className="text-muted">Properties</small>
                </div>
                <div className="text-center p-3 border rounded">
                  <div className="fw-medium">
                    ₦{(selectedClient.totalValue || 0).toLocaleString()}
                  </div>
                  <small className="text-muted">Total Value</small>
                </div>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowClientDetails(false)}>Close</Button>
            <Button variant="primary">
              <MessageSquare size={16} className="me-2" />
              Contact Client
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
};

export default ClientManager;